import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Entity interfaces (would be imported from actual entities in real implementation)
interface DealerSettlement {
  settlementId: string;
  settlementNumber: string;
  dealerId: string;
  stationId: string;
  windowId: string;
  periodStart: Date;
  periodEnd: Date;
  grossDealerMargin: number;
  volumeSoldLitres: number;
  otherIncome: number;
  loanDeduction: number;
  shortageDeduction: number;
  damageDeduction: number;
  advanceDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  status: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: Date;
  paymentStatus: string;
  paymentDate?: Date;
  paymentReference?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface DealerLoan {
  loanId: string;
  loanNumber: string;
  dealerId: string;
  stationId: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenorMonths: number;
  repaymentFrequency: string;
  startDate: Date;
  endDate: Date;
  amortizationMethod: string;
  gracePeriodMonths: number;
  status: string;
  guarantorInfo?: any;
  collateralInfo?: any;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface LoanSchedule {
  scheduleId: string;
  loanId: string;
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentStatus: string;
  paymentDate?: Date;
  paymentAmount?: number;
  createdAt: Date;
}

export interface CreateDealerSettlementDto {
  dealerId: string;
  stationId: string;
  windowId: string;
  periodStart: string;
  periodEnd: string;
  volumeSoldLitres: number;
  otherIncome?: number;
  shortageDeduction?: number;
  damageDeduction?: number;
  advanceDeduction?: number;
  otherDeductions?: number;
  createdBy: string;
}

export interface DealerLoanCreateDto {
  dealerId: string;
  stationId: string;
  loanType: 'WORKING_CAPITAL' | 'EQUIPMENT' | 'INFRASTRUCTURE' | 'OTHER';
  principalAmount: number;
  interestRate: number;
  tenorMonths: number;
  repaymentFrequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  startDate: string;
  gracePeriodMonths?: number;
  guarantorInfo?: any;
  collateralInfo?: any;
  createdBy: string;
}

export interface SettlementSummary {
  dealerId: string;
  stationId: string;
  totalSettlements: number;
  totalVolume: number;
  totalMarginEarned: number;
  totalDeductions: number;
  totalNetPayments: number;
  averageMarginPerLitre: number;
  outstandingLoanBalance: number;
  lastSettlementDate: Date;
  performanceRating: string;
}

@Injectable()
export class DealerSettlementService {
  private readonly logger = new Logger(DealerSettlementService.name);

  // Standard dealer margin rates per product (GHS per litre)
  private readonly DEALER_MARGIN_RATES = {
    'PMS': 0.35,
    'AGO': 0.35,
    'LPG': 0.30,
    'DPK': 0.25,
    'RFO': 0.20
  };

  // Tax rates for dealer settlements
  private readonly TAX_RATES = {
    'WITHHOLDING_TAX': 0.075, // 7.5% WHT on dealer payments
    'VAT': 0.125, // 12.5% VAT on services
    'NHIL': 0.025, // 2.5% NHIL
    'GETFUND': 0.025 // 2.5% GETFUND
  };

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Create a new dealer settlement for a pricing window
   */
  async createDealerSettlement(dto: CreateDealerSettlementDto): Promise<DealerSettlement> {
    this.logger.log(`Creating dealer settlement for dealer: ${dto.dealerId}, station: ${dto.stationId}`);

    try {
      // Validate dealer and station exist
      await this.validateDealerStation(dto.dealerId, dto.stationId);

      // Get pricing window details
      const pricingWindow = await this.getPricingWindow(dto.windowId);
      if (!pricingWindow) {
        throw new BadRequestException(`Pricing window ${dto.windowId} not found`);
      }

      // Calculate dealer margin based on window prices and volume sold
      const grossDealerMargin = await this.calculateGrossDealerMargin(
        dto.stationId,
        dto.windowId,
        dto.volumeSoldLitres
      );

      // Get active loan deductions for this dealer
      const loanDeduction = await this.calculateLoanDeduction(
        dto.dealerId,
        dto.stationId,
        new Date(dto.periodStart),
        new Date(dto.periodEnd)
      );

      // Calculate tax deductions
      const taxDeduction = this.calculateTaxDeductions(grossDealerMargin + (dto.otherIncome || 0));

      // Calculate total deductions
      const totalDeductions = loanDeduction + 
                            (dto.shortageDeduction || 0) + 
                            (dto.damageDeduction || 0) + 
                            (dto.advanceDeduction || 0) + 
                            taxDeduction + 
                            (dto.otherDeductions || 0);

      // Calculate net payable
      const netPayable = grossDealerMargin + (dto.otherIncome || 0) - totalDeductions;

      // Generate settlement number
      const settlementNumber = await this.generateSettlementNumber(dto.dealerId, dto.windowId);

      const settlement: DealerSettlement = {
        settlementId: this.generateUUID(),
        settlementNumber,
        dealerId: dto.dealerId,
        stationId: dto.stationId,
        windowId: dto.windowId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        grossDealerMargin,
        volumeSoldLitres: dto.volumeSoldLitres,
        otherIncome: dto.otherIncome || 0,
        loanDeduction,
        shortageDeduction: dto.shortageDeduction || 0,
        damageDeduction: dto.damageDeduction || 0,
        advanceDeduction: dto.advanceDeduction || 0,
        taxDeduction,
        otherDeductions: dto.otherDeductions || 0,
        totalDeductions,
        netPayable,
        status: 'DRAFT',
        approvalStatus: 'PENDING',
        paymentStatus: 'PENDING',
        createdBy: dto.createdBy,
        createdAt: new Date()
      };

      // Save settlement (mock implementation)
      const savedSettlement = await this.saveSettlement(settlement);

      // Create automated journal entries
      await this.createSettlementJournalEntries(savedSettlement);

      // Emit event for workflow automation
      this.eventEmitter.emit('dealer.settlement.created', {
        settlementId: savedSettlement.settlementId,
        dealerId: savedSettlement.dealerId,
        netPayable: savedSettlement.netPayable,
        requiresApproval: Math.abs(savedSettlement.netPayable) > 10000 // Approval threshold
      });

      this.logger.log(`Dealer settlement created: ${settlementNumber} - Net payable: GHS ${netPayable.toFixed(2)}`);
      return savedSettlement;

    } catch (error) {
      this.logger.error(`Failed to create dealer settlement:`, error);
      throw error;
    }
  }

  /**
   * Create a dealer loan with amortization schedule
   */
  async createDealerLoan(dto: DealerLoanCreateDto): Promise<{
    loan: DealerLoan;
    schedule: LoanSchedule[];
  }> {
    this.logger.log(`Creating dealer loan: ${dto.loanType} for dealer ${dto.dealerId}`);

    try {
      // Validate dealer creditworthiness
      await this.validateDealerCreditworthiness(dto.dealerId, dto.principalAmount);

      // Calculate end date based on tenor
      const startDate = new Date(dto.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + dto.tenorMonths);

      // Generate loan number
      const loanNumber = await this.generateLoanNumber(dto.dealerId);

      const loan: DealerLoan = {
        loanId: this.generateUUID(),
        loanNumber,
        dealerId: dto.dealerId,
        stationId: dto.stationId,
        loanType: dto.loanType,
        principalAmount: dto.principalAmount,
        interestRate: dto.interestRate,
        tenorMonths: dto.tenorMonths,
        repaymentFrequency: dto.repaymentFrequency,
        startDate,
        endDate,
        amortizationMethod: 'EQUAL_INSTALLMENT',
        gracePeriodMonths: dto.gracePeriodMonths || 0,
        status: 'ACTIVE',
        guarantorInfo: dto.guarantorInfo,
        collateralInfo: dto.collateralInfo,
        createdBy: dto.createdBy,
        createdAt: new Date()
      };

      // Generate amortization schedule
      const schedule = this.generateAmortizationSchedule(loan);

      // Save loan and schedule (mock implementation)
      const savedLoan = await this.saveLoan(loan);
      await this.saveLoanSchedule(schedule);

      // Create initial loan disbursement journal entry
      await this.createLoanDisbursementJournalEntry(savedLoan);

      // Emit event
      this.eventEmitter.emit('dealer.loan.created', {
        loanId: savedLoan.loanId,
        dealerId: savedLoan.dealerId,
        principalAmount: savedLoan.principalAmount,
        monthlyPayment: schedule[0]?.totalAmount || 0
      });

      this.logger.log(`Dealer loan created: ${loanNumber} - Principal: GHS ${dto.principalAmount.toFixed(2)}`);
      
      return {
        loan: savedLoan,
        schedule
      };

    } catch (error) {
      this.logger.error(`Failed to create dealer loan:`, error);
      throw error;
    }
  }

  /**
   * Process settlement approval and payment
   */
  async approveAndPaySettlement(
    settlementId: string,
    approvedBy: string,
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK',
    paymentReference?: string
  ): Promise<DealerSettlement> {
    this.logger.log(`Approving and processing payment for settlement: ${settlementId}`);

    try {
      // Get settlement
      const settlement = await this.getSettlementById(settlementId);
      if (!settlement) {
        throw new BadRequestException(`Settlement ${settlementId} not found`);
      }

      // Update settlement status
      settlement.approvalStatus = 'APPROVED';
      settlement.approvedBy = approvedBy;
      settlement.approvedAt = new Date();
      settlement.paymentStatus = 'COMPLETED';
      settlement.paymentDate = new Date();
      settlement.paymentReference = paymentReference || this.generatePaymentReference();
      settlement.status = 'COMPLETED';
      settlement.updatedAt = new Date();

      // Save updated settlement
      const updatedSettlement = await this.updateSettlement(settlement);

      // Create payment journal entries
      await this.createPaymentJournalEntries(updatedSettlement, paymentMethod);

      // Update loan schedule if there were loan deductions
      if (updatedSettlement.loanDeduction > 0) {
        await this.updateLoanSchedulePayments(
          updatedSettlement.dealerId,
          updatedSettlement.loanDeduction,
          updatedSettlement.paymentDate!
        );
      }

      // Emit event
      this.eventEmitter.emit('dealer.settlement.paid', {
        settlementId: updatedSettlement.settlementId,
        dealerId: updatedSettlement.dealerId,
        netPayable: updatedSettlement.netPayable,
        paymentMethod,
        paymentDate: updatedSettlement.paymentDate
      });

      this.logger.log(`Settlement approved and paid: ${updatedSettlement.settlementNumber} - GHS ${updatedSettlement.netPayable.toFixed(2)}`);
      return updatedSettlement;

    } catch (error) {
      this.logger.error(`Failed to approve and pay settlement:`, error);
      throw error;
    }
  }

  /**
   * Get dealer performance summary
   */
  async getDealerPerformanceSummary(
    dealerId: string,
    stationId?: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<SettlementSummary> {
    this.logger.log(`Getting performance summary for dealer: ${dealerId}`);

    try {
      // Get settlements for the dealer
      const settlements = await this.getDealerSettlements(dealerId, stationId, dateRange);
      
      if (settlements.length === 0) {
        return {
          dealerId,
          stationId: stationId || 'ALL',
          totalSettlements: 0,
          totalVolume: 0,
          totalMarginEarned: 0,
          totalDeductions: 0,
          totalNetPayments: 0,
          averageMarginPerLitre: 0,
          outstandingLoanBalance: 0,
          lastSettlementDate: new Date(),
          performanceRating: 'NO_DATA'
        };
      }

      // Calculate summary metrics
      const totalSettlements = settlements.length;
      const totalVolume = settlements.reduce((sum, s) => sum + s.volumeSoldLitres, 0);
      const totalMarginEarned = settlements.reduce((sum, s) => sum + s.grossDealerMargin, 0);
      const totalDeductions = settlements.reduce((sum, s) => sum + s.totalDeductions, 0);
      const totalNetPayments = settlements.reduce((sum, s) => sum + s.netPayable, 0);
      const averageMarginPerLitre = totalVolume > 0 ? totalMarginEarned / totalVolume : 0;

      // Get outstanding loan balance
      const outstandingLoanBalance = await this.getOutstandingLoanBalance(dealerId, stationId);

      // Get last settlement date
      const lastSettlementDate = settlements.reduce((latest, s) => 
        s.createdAt > latest ? s.createdAt : latest, new Date(0)
      );

      // Calculate performance rating
      const performanceRating = this.calculatePerformanceRating({
        averageMarginPerLitre,
        settlementFrequency: totalSettlements,
        deductionRatio: totalDeductions / totalMarginEarned,
        outstandingRatio: outstandingLoanBalance / (totalMarginEarned || 1)
      });

      return {
        dealerId,
        stationId: stationId || 'ALL',
        totalSettlements,
        totalVolume,
        totalMarginEarned,
        totalDeductions,
        totalNetPayments,
        averageMarginPerLitre,
        outstandingLoanBalance,
        lastSettlementDate,
        performanceRating
      };

    } catch (error) {
      this.logger.error(`Failed to get dealer performance summary:`, error);
      throw error;
    }
  }

  /**
   * Generate bulk settlements for multiple dealers
   */
  async generateBulkSettlements(
    windowId: string,
    dealerStationPairs: Array<{ dealerId: string; stationId: string; volumeSold: number }>,
    createdBy: string
  ): Promise<{
    totalGenerated: number;
    totalMarginAmount: number;
    settlements: DealerSettlement[];
    errors: Array<{ dealerId: string; stationId: string; error: string }>;
  }> {
    this.logger.log(`Generating bulk settlements for ${dealerStationPairs.length} dealers`);

    const settlements: DealerSettlement[] = [];
    const errors: Array<{ dealerId: string; stationId: string; error: string }> = [];
    let totalMarginAmount = 0;

    for (const pair of dealerStationPairs) {
      try {
        const settlement = await this.createDealerSettlement({
          dealerId: pair.dealerId,
          stationId: pair.stationId,
          windowId,
          periodStart: await this.getWindowStartDate(windowId),
          periodEnd: await this.getWindowEndDate(windowId),
          volumeSoldLitres: pair.volumeSold,
          createdBy
        });

        settlements.push(settlement);
        totalMarginAmount += settlement.grossDealerMargin;

      } catch (error) {
        errors.push({
          dealerId: pair.dealerId,
          stationId: pair.stationId,
          error: error.message
        });
      }
    }

    // Emit bulk settlement event
    this.eventEmitter.emit('dealer.settlements.bulk.generated', {
      windowId,
      totalGenerated: settlements.length,
      totalMarginAmount,
      errorCount: errors.length
    });

    this.logger.log(`Bulk settlements completed: ${settlements.length} generated, ${errors.length} errors`);

    return {
      totalGenerated: settlements.length,
      totalMarginAmount,
      settlements,
      errors
    };
  }

  // Private helper methods (mock implementations)

  private async validateDealerStation(dealerId: string, stationId: string): Promise<void> {
    // Mock implementation - would validate dealer-station relationship
  }

  private async getPricingWindow(windowId: string): Promise<any> {
    // Mock implementation - would fetch pricing window
    return { windowId, startDate: new Date(), endDate: new Date() };
  }

  private async calculateGrossDealerMargin(
    stationId: string,
    windowId: string,
    volumeSoldLitres: number
  ): Promise<number> {
    // Mock implementation - would calculate based on station prices and volume
    // For now, using average margin of GHS 0.35 per litre for PMS
    return volumeSoldLitres * this.DEALER_MARGIN_RATES.PMS;
  }

  private async calculateLoanDeduction(
    dealerId: string,
    stationId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // Mock implementation - would calculate loan installment due in period
    return 500.00; // Mock amount
  }

  private calculateTaxDeductions(grossAmount: number): number {
    // Calculate withholding tax on dealer payments
    return grossAmount * this.TAX_RATES.WITHHOLDING_TAX;
  }

  private async generateSettlementNumber(dealerId: string, windowId: string): Promise<string> {
    return `SETT-${dealerId}-${windowId}-${Date.now()}`;
  }

  private generateUUID(): string {
    return 'uuid-' + Math.random().toString(36).substr(2, 9);
  }

  private async saveSettlement(settlement: DealerSettlement): Promise<DealerSettlement> {
    // Mock implementation - would save to database
    return settlement;
  }

  private async createSettlementJournalEntries(settlement: DealerSettlement): Promise<void> {
    // Mock implementation - would create journal entries
    this.eventEmitter.emit('accounting.journal.create', {
      templateCode: 'DEALER_SETTLEMENT',
      settlementId: settlement.settlementId,
      amount: settlement.netPayable
    });
  }

  private async validateDealerCreditworthiness(dealerId: string, loanAmount: number): Promise<void> {
    // Mock implementation - would check dealer credit score and limits
  }

  private async generateLoanNumber(dealerId: string): Promise<string> {
    return `LOAN-${dealerId}-${Date.now()}`;
  }

  private generateAmortizationSchedule(loan: DealerLoan): LoanSchedule[] {
    const schedule: LoanSchedule[] = [];
    const monthlyRate = loan.interestRate / 100 / 12;
    const totalPayments = loan.tenorMonths;
    
    // Calculate monthly payment using amortization formula
    const monthlyPayment = loan.principalAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    let balance = loan.principalAmount;
    const startDate = new Date(loan.startDate);

    for (let i = 1; i <= totalPayments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const interestAmount = balance * monthlyRate;
      const principalAmount = monthlyPayment - interestAmount;
      const balanceBefore = balance;
      balance = Math.max(0, balance - principalAmount);

      schedule.push({
        scheduleId: this.generateUUID(),
        loanId: loan.loanId,
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount: monthlyPayment,
        balanceBefore,
        balanceAfter: balance,
        paymentStatus: 'PENDING',
        createdAt: new Date()
      });
    }

    return schedule;
  }

  private async saveLoan(loan: DealerLoan): Promise<DealerLoan> {
    // Mock implementation - would save to database
    return loan;
  }

  private async saveLoanSchedule(schedule: LoanSchedule[]): Promise<void> {
    // Mock implementation - would save schedule to database
  }

  private async createLoanDisbursementJournalEntry(loan: DealerLoan): Promise<void> {
    // Mock implementation - would create disbursement journal entries
  }

  private async getSettlementById(settlementId: string): Promise<DealerSettlement | null> {
    // Mock implementation - would fetch from database
    return null;
  }

  private async updateSettlement(settlement: DealerSettlement): Promise<DealerSettlement> {
    // Mock implementation - would update in database
    return settlement;
  }

  private generatePaymentReference(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private async createPaymentJournalEntries(settlement: DealerSettlement, paymentMethod: string): Promise<void> {
    // Mock implementation - would create payment journal entries
  }

  private async updateLoanSchedulePayments(
    dealerId: string,
    paymentAmount: number,
    paymentDate: Date
  ): Promise<void> {
    // Mock implementation - would update loan schedule payments
  }

  private async getDealerSettlements(
    dealerId: string,
    stationId?: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<DealerSettlement[]> {
    // Mock implementation - would fetch settlements from database
    return [];
  }

  private async getOutstandingLoanBalance(dealerId: string, stationId?: string): Promise<number> {
    // Mock implementation - would calculate outstanding balance
    return 5000.00;
  }

  private calculatePerformanceRating(metrics: {
    averageMarginPerLitre: number;
    settlementFrequency: number;
    deductionRatio: number;
    outstandingRatio: number;
  }): string {
    // Simple performance rating calculation
    let score = 0;
    
    if (metrics.averageMarginPerLitre >= 0.30) score += 25;
    if (metrics.settlementFrequency >= 12) score += 25; // Monthly settlements
    if (metrics.deductionRatio <= 0.10) score += 25; // Low deduction ratio
    if (metrics.outstandingRatio <= 0.20) score += 25; // Low outstanding ratio

    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 40) return 'POOR';
    return 'VERY_POOR';
  }

  private async getWindowStartDate(windowId: string): Promise<string> {
    // Mock implementation - would get window start date
    return new Date().toISOString().split('T')[0];
  }

  private async getWindowEndDate(windowId: string): Promise<string> {
    // Mock implementation - would get window end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    return endDate.toISOString().split('T')[0];
  }
}