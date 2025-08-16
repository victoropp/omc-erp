import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DealerSettlement } from '../entities/dealer-settlement.entity';
import { DealerLoan, DealerLoanStatus } from '../entities/dealer-loan.entity';
import { Transaction } from '@omc-erp/database';
import { DealerSettlementStatus, TransactionStatus } from '@omc-erp/shared-types';
import { v4 as uuidv4 } from 'uuid';

export interface SettlementCalculation {
  stationId: string;
  windowId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  salesData: {
    totalLitresSold: number;
    byProduct: Record<string, {
      litres: number;
      marginRate: number;
      marginAmount: number;
    }>;
  };
  grossDealerMargin: number;
  deductions: {
    loanRepayment: number;
    chargebacks: number;
    shortages: number;
    other: number;
    total: number;
  };
  netPayable: number;
  loanDetails?: {
    outstandingBalance: number;
    installmentDue: number;
    daysOverdue: number;
  };
}

@Injectable()
export class DealerSettlementsService {
  private readonly logger = new Logger(DealerSettlementsService.name);

  constructor(
    @InjectRepository(DealerSettlement)
    private readonly settlementRepository: Repository<DealerSettlement>,
    @InjectRepository(DealerLoan)
    private readonly loanRepository: Repository<DealerLoan>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Close dealer settlement for a pricing window
   * Blueprint formula: gross_dealer_margin - loan_installment_due - other_deductions = net_payable_to_dealer
   */
  async closeDealerSettlement(
    stationId: string,
    windowId: string,
    tenantId: string,
    userId?: string,
  ): Promise<DealerSettlement> {
    this.logger.log(`Processing dealer settlement for station ${stationId}, window ${windowId}`);

    // Calculate settlement amounts
    const calculation = await this.calculateSettlement(stationId, windowId, tenantId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if settlement already exists
      let settlement = await this.settlementRepository.findOne({
        where: { stationId, windowId, tenantId },
      });

      if (settlement && settlement.status !== DealerSettlementStatus.CALCULATED) {
        throw new BadRequestException('Settlement already processed for this window');
      }

      if (settlement) {
        // Update existing settlement
        Object.assign(settlement, {
          settlementDate: new Date(),
          totalLitresSold: calculation.salesData.totalLitresSold,
          grossDealerMargin: calculation.grossDealerMargin,
          loanDeduction: calculation.deductions.loanRepayment,
          otherDeductions: calculation.deductions.total - calculation.deductions.loanRepayment,
          netPayable: calculation.netPayable,
          status: DealerSettlementStatus.CALCULATED,
          calculationDetails: calculation,
          updatedAt: new Date(),
        });
      } else {
        // Create new settlement
        settlement = this.settlementRepository.create({
          id: uuidv4(),
          stationId,
          windowId,
          settlementDate: new Date(),
          totalLitresSold: calculation.salesData.totalLitresSold,
          grossDealerMargin: calculation.grossDealerMargin,
          loanDeduction: calculation.deductions.loanRepayment,
          otherDeductions: calculation.deductions.total - calculation.deductions.loanRepayment,
          netPayable: calculation.netPayable,
          status: DealerSettlementStatus.CALCULATED,
          calculationDetails: calculation,
          tenantId,
          createdBy: userId,
        });
      }

      const savedSettlement = await queryRunner.manager.save(settlement);

      // Update loan balances if there are loan deductions
      if (calculation.deductions.loanRepayment > 0 && calculation.loanDetails) {
        await this.processLoanRepayments(stationId, calculation.deductions.loanRepayment, tenantId, queryRunner.manager);
      }

      // Generate settlement statement
      const settlementStatement = await this.generateSettlementStatement(savedSettlement, calculation);

      await queryRunner.commitTransaction();

      // Emit events
      this.eventEmitter.emit('dealer-settlement.calculated', {
        settlementId: savedSettlement.id,
        stationId,
        windowId,
        netPayable: calculation.netPayable,
        tenantId,
      });

      if (calculation.netPayable < 0) {
        this.eventEmitter.emit('dealer-settlement.negative-balance', {
          settlementId: savedSettlement.id,
          stationId,
          deficit: Math.abs(calculation.netPayable),
          tenantId,
        });
      }

      this.logger.log(`Settlement completed for station ${stationId}: Net payable GHS ${calculation.netPayable.toFixed(2)}`);
      
      return savedSettlement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculate settlement amounts for a dealer
   * Blueprint: dealer_margin_amt_day = sum_over_products(litres_sold(product) * dealer_margin_rate(product, window))
   */
  async calculateSettlement(
    stationId: string,
    windowId: string,
    tenantId: string,
  ): Promise<SettlementCalculation> {
    // Get pricing window dates (this would normally come from pricing service)
    const windowDates = await this.getPricingWindowDates(windowId);
    
    // Get all completed transactions for the window period
    const transactions = await this.transactionRepository.find({
      where: {
        stationId,
        tenantId,
        status: TransactionStatus.COMPLETED,
        transactionTime: Between(windowDates.startDate, windowDates.endDate),
      },
    });

    if (transactions.length === 0) {
      throw new NotFoundException('No completed transactions found for the specified period');
    }

    // Calculate sales by product
    const salesByProduct: Record<string, { litres: number; marginRate: number; marginAmount: number }> = {};
    let totalLitres = 0;
    let grossMargin = 0;

    for (const transaction of transactions) {
      const fuelType = transaction.fuelType;
      const litres = transaction.quantityLiters;
      
      // Get dealer margin rate for this product and window (this would come from pricing service)
      const marginRate = await this.getDealerMarginRate(fuelType, windowId, tenantId);
      const marginAmount = litres * marginRate;

      if (!salesByProduct[fuelType]) {
        salesByProduct[fuelType] = {
          litres: 0,
          marginRate,
          marginAmount: 0,
        };
      }

      salesByProduct[fuelType].litres += litres;
      salesByProduct[fuelType].marginAmount += marginAmount;
      
      totalLitres += litres;
      grossMargin += marginAmount;
    }

    // Calculate loan deductions
    const loanDeductions = await this.calculateLoanDeductions(stationId, windowId, tenantId);
    
    // Calculate other deductions (chargebacks, shortages, etc.)
    const otherDeductions = await this.calculateOtherDeductions(stationId, windowId, tenantId);

    const totalDeductions = loanDeductions.amount + otherDeductions.total;
    const netPayable = grossMargin - totalDeductions;

    return {
      stationId,
      windowId,
      period: windowDates,
      salesData: {
        totalLitresSold: totalLitres,
        byProduct: salesByProduct,
      },
      grossDealerMargin: grossMargin,
      deductions: {
        loanRepayment: loanDeductions.amount,
        chargebacks: otherDeductions.chargebacks,
        shortages: otherDeductions.shortages,
        other: otherDeductions.other,
        total: totalDeductions,
      },
      netPayable,
      loanDetails: loanDeductions.details,
    };
  }

  /**
   * Generate dealer settlement statement
   * Blueprint requirement: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
   */
  async generateSettlementStatement(
    settlement: DealerSettlement,
    calculation: SettlementCalculation,
  ): Promise<any> {
    const statement = {
      settlementId: settlement.id,
      stationId: settlement.stationId,
      windowId: settlement.windowId,
      settlementDate: settlement.settlementDate,
      period: calculation.period,
      
      // Sales Summary
      salesSummary: {
        totalLitresSold: calculation.salesData.totalLitresSold,
        productBreakdown: calculation.salesData.byProduct,
        grossDealerMargin: calculation.grossDealerMargin,
      },

      // PBU Breakdown (would get this from pricing service)
      pbuBreakdown: {
        // This should show the dealer margin component from the PBU
        dealerMarginRate: 'Variable by product',
        effectiveRates: Object.entries(calculation.salesData.byProduct).map(([product, data]) => ({
          product,
          marginRate: data.marginRate,
          litres: data.litres,
          marginEarned: data.marginAmount,
        })),
      },

      // Deductions
      deductions: {
        loanRepayment: {
          amount: calculation.deductions.loanRepayment,
          details: calculation.loanDetails,
        },
        chargebacks: calculation.deductions.chargebacks,
        shortages: calculation.deductions.shortages,
        other: calculation.deductions.other,
        total: calculation.deductions.total,
      },

      // Net Settlement
      netSettlement: {
        grossAmount: calculation.grossDealerMargin,
        totalDeductions: calculation.deductions.total,
        netPayable: calculation.netPayable,
        paymentDue: calculation.netPayable > 0,
        dueToDealer: calculation.netPayable < 0 ? Math.abs(calculation.netPayable) : 0,
      },

      // Payment Instructions
      paymentInstructions: calculation.netPayable > 0 
        ? 'Amount will be credited to dealer account within 3 business days'
        : 'Deficit balance to be recovered from future settlements',

      generatedAt: new Date(),
    };

    return statement;
  }

  /**
   * Approve settlement for payment
   */
  async approveSettlement(
    settlementId: string,
    tenantId: string,
    userId?: string,
  ): Promise<DealerSettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId, tenantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (settlement.status !== DealerSettlementStatus.CALCULATED) {
      throw new BadRequestException('Settlement must be in calculated status to approve');
    }

    settlement.status = DealerSettlementStatus.APPROVED;
    settlement.approvedBy = userId;
    settlement.approvedAt = new Date();
    settlement.updatedAt = new Date();

    const savedSettlement = await this.settlementRepository.save(settlement);

    this.eventEmitter.emit('dealer-settlement.approved', {
      settlementId: savedSettlement.id,
      stationId: settlement.stationId,
      netPayable: settlement.netPayable,
      approvedBy: userId,
      tenantId,
    });

    return savedSettlement;
  }

  /**
   * Mark settlement as paid
   */
  async markSettlementPaid(
    settlementId: string,
    paymentReference: string,
    tenantId: string,
    userId?: string,
  ): Promise<DealerSettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId, tenantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (settlement.status !== DealerSettlementStatus.APPROVED) {
      throw new BadRequestException('Settlement must be approved before marking as paid');
    }

    settlement.status = DealerSettlementStatus.PAID;
    settlement.paymentDate = new Date();
    settlement.paymentReference = paymentReference;
    settlement.paidBy = userId;
    settlement.updatedAt = new Date();

    const savedSettlement = await this.settlementRepository.save(settlement);

    this.eventEmitter.emit('dealer-settlement.paid', {
      settlementId: savedSettlement.id,
      stationId: settlement.stationId,
      amountPaid: settlement.netPayable,
      paymentReference,
      tenantId,
    });

    return savedSettlement;
  }

  /**
   * Get dealer cash flow forecast
   * Blueprint AI feature: "Dealer credit risk & repayment optimizer"
   */
  async getDealerCashFlowForecast(stationId: string, tenantId: string): Promise<any> {
    // Get historical settlements
    const recentSettlements = await this.settlementRepository.find({
      where: { stationId, tenantId },
      order: { settlementDate: 'DESC' },
      take: 12, // Last 12 windows/6 months
    });

    // Get active loans
    const activeLoans = await this.loanRepository.find({
      where: { stationId, tenantId, status: DealerLoanStatus.ACTIVE },
    });

    // Calculate average margins
    const avgGrossMargin = recentSettlements.length > 0
      ? recentSettlements.reduce((sum, s) => sum + s.grossDealerMargin, 0) / recentSettlements.length
      : 0;

    const avgNetPayable = recentSettlements.length > 0
      ? recentSettlements.reduce((sum, s) => sum + s.netPayable, 0) / recentSettlements.length
      : 0;

    // Forecast next 6 windows
    const forecast = [];
    let cumulativeCashFlow = 0;
    
    for (let i = 1; i <= 6; i++) {
      const projectedGrossMargin = avgGrossMargin * (1 + (Math.random() - 0.5) * 0.1); // ±5% variance
      const projectedLoanDeduction = activeLoans.reduce((sum, loan) => {
        // Calculate installment (simplified)
        return sum + (loan.principalAmount / loan.tenorMonths);
      }, 0);
      
      const projectedNetPayable = projectedGrossMargin - projectedLoanDeduction;
      cumulativeCashFlow += projectedNetPayable;
      
      forecast.push({
        window: i,
        projectedGrossMargin,
        projectedLoanDeduction,
        projectedNetPayable,
        cumulativeCashFlow,
        riskLevel: cumulativeCashFlow < 0 ? 'high' : cumulativeCashFlow < projectedGrossMargin ? 'medium' : 'low',
      });
    }

    return {
      stationId,
      historicalData: {
        avgGrossMargin,
        avgNetPayable,
        settlementCount: recentSettlements.length,
      },
      activeLoans: {
        count: activeLoans.length,
        totalOutstanding: activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
        monthlyInstallments: activeLoans.reduce((sum, loan) => sum + (loan.principalAmount / loan.tenorMonths), 0),
      },
      forecast,
      recommendations: this.generateCashFlowRecommendations(forecast, activeLoans),
    };
  }

  // Private helper methods
  private async getPricingWindowDates(windowId: string): Promise<{ startDate: Date; endDate: Date }> {
    // This would integrate with pricing service to get actual window dates
    // For now, return mock dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const endDate = new Date();
    
    return { startDate, endDate };
  }

  private async getDealerMarginRate(fuelType: string, windowId: string, tenantId: string): Promise<number> {
    // This would integrate with pricing service to get actual dealer margin rates
    // Blueprint: get from pbu_components table
    const defaultRates: Record<string, number> = {
      'PMS': 0.35,
      'AGO': 0.30,
      'LPG': 0.40,
    };
    
    return defaultRates[fuelType] || 0.35;
  }

  private async calculateLoanDeductions(
    stationId: string,
    windowId: string,
    tenantId: string,
  ): Promise<{ amount: number; details?: any }> {
    const activeLoans = await this.loanRepository.find({
      where: { stationId, tenantId, status: DealerLoanStatus.ACTIVE },
    });

    if (activeLoans.length === 0) {
      return { amount: 0 };
    }

    let totalDeduction = 0;
    const loanDetails = activeLoans.map(loan => {
      // Calculate bi-weekly installment (simplified calculation)
      const installment = loan.principalAmount / loan.tenorMonths * 0.5; // Assume bi-weekly = half monthly
      totalDeduction += installment;
      
      return {
        loanId: loan.id,
        installment,
        outstandingBalance: loan.outstandingBalance,
      };
    });

    return {
      amount: totalDeduction,
      details: {
        totalLoans: activeLoans.length,
        outstandingBalance: activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
        loanBreakdown: loanDetails,
      },
    };
  }

  private async calculateOtherDeductions(
    stationId: string,
    windowId: string,
    tenantId: string,
  ): Promise<{ chargebacks: number; shortages: number; other: number; total: number }> {
    // This would calculate actual chargebacks, shortages, etc.
    // For now, return zeros
    return {
      chargebacks: 0,
      shortages: 0,
      other: 0,
      total: 0,
    };
  }

  private async processLoanRepayments(
    stationId: string,
    repaymentAmount: number,
    tenantId: string,
    entityManager: any,
  ): Promise<void> {
    const activeLoans = await entityManager.find('DealerLoan', {
      where: { stationId, tenantId, status: DealerLoanStatus.ACTIVE },
      order: { startDate: 'ASC' }, // Pay off older loans first
    });

    let remainingAmount = repaymentAmount;

    for (const loan of activeLoans) {
      if (remainingAmount <= 0) break;

      const paymentAmount = Math.min(remainingAmount, loan.outstandingBalance);
      loan.outstandingBalance -= paymentAmount;
      remainingAmount -= paymentAmount;

      if (loan.outstandingBalance <= 0) {
        loan.status = 'completed';
        loan.completedAt = new Date();
      }

      await entityManager.save(loan);

      this.eventEmitter.emit('dealer-loan.payment-applied', {
        loanId: loan.id,
        stationId,
        paymentAmount,
        newBalance: loan.outstandingBalance,
        tenantId,
      });
    }
  }

  private generateCashFlowRecommendations(forecast: any[], activeLoans: any[]): string[] {
    const recommendations: string[] = [];

    // Check for cash flow stress
    const negativeWindows = forecast.filter(f => f.projectedNetPayable < 0);
    if (negativeWindows.length > 0) {
      recommendations.push('Cash flow stress detected - consider loan restructuring');
    }

    // Check loan burden
    const highLoanBurden = forecast.some(f => f.projectedLoanDeduction > f.projectedGrossMargin * 0.8);
    if (highLoanBurden) {
      recommendations.push('Loan burden is high (>80% of gross margin) - review repayment schedule');
    }

    // Positive trends
    const improvingTrend = forecast.every((f, i) => i === 0 || f.cumulativeCashFlow >= forecast[i-1].cumulativeCashFlow);
    if (improvingTrend) {
      recommendations.push('Positive cash flow trend - consider growth investments');
    }

    return recommendations;
  }

  // Scheduled task for automated settlements
  @Cron('0 2 * * 1') // Every Monday at 2 AM (after pricing window closes)
  async processAutomatedSettlements(): Promise<void> {
    this.logger.log('Starting automated dealer settlement processing');
    
    // This would get list of stations and current window from pricing service
    // For now, just log the scheduled execution
    
    this.eventEmitter.emit('dealer-settlements.batch-processing-started', {
      scheduledAt: new Date(),
    });
  }
}