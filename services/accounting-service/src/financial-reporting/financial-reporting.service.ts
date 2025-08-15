import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subMonths,
  subYears,
  addMonths 
} from 'date-fns';

export interface FinancialStatement {
  reportType: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'EQUITY_STATEMENT' | 'COMPREHENSIVE_INCOME';
  tenantId: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    periodName: string;
  };
  currency: string;
  preparationDate: Date;
  status: 'DRAFT' | 'FINAL' | 'AUDITED';
  ifrsCompliant: boolean;
  comparativePeriod?: {
    startDate: Date;
    endDate: Date;
    periodName: string;
  };
}

export interface BalanceSheet extends FinancialStatement {
  assets: {
    currentAssets: {
      cashAndCashEquivalents: number;
      tradeReceivables: number;
      inventory: number;
      prepaidExpenses: number;
      otherCurrentAssets: number;
      total: number;
    };
    nonCurrentAssets: {
      propertyPlantEquipment: number;
      rightOfUseAssets: number; // IFRS 16
      intangibleAssets: number;
      investments: number;
      deferredTaxAssets: number;
      otherNonCurrentAssets: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      tradePayables: number;
      shortTermBorrowings: number;
      currentPortionLongTermDebt: number;
      accruedExpenses: number;
      leaseObligationsCurrent: number; // IFRS 16
      provisions: number;
      otherCurrentLiabilities: number;
      total: number;
    };
    nonCurrentLiabilities: {
      longTermDebt: number;
      leaseObligationsNonCurrent: number; // IFRS 16
      deferredTaxLiabilities: number;
      employeeBenefits: number;
      provisions: number;
      otherNonCurrentLiabilities: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    otherComprehensiveIncome: number;
    reserves: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  
  // IFRS specific disclosures
  ifrsDisclosures: {
    significantAccountingPolicies: string[];
    criticalAccountingEstimates: string[];
    financialRiskManagement: any;
    subsequentEvents: any[];
  };
  
  // Comparative figures
  comparativeAssets?: any;
  comparativeLiabilities?: any;
  comparativeEquity?: any;
}

export interface IncomeStatement extends FinancialStatement {
  revenue: {
    fuelSales: number;
    lubricantSales: number;
    convenienceStoreSales: number;
    serviceRevenue: number;
    otherRevenue: number;
    totalRevenue: number;
  };
  costOfSales: {
    fuelCosts: number;
    lubricantCosts: number;
    otherDirectCosts: number;
    totalCostOfSales: number;
  };
  grossProfit: number;
  operatingExpenses: {
    salariesAndBenefits: number;
    rentAndUtilities: number;
    depreciationAndAmortization: number;
    rightOfUseAssetDepreciation: number; // IFRS 16
    marketingAndAdvertising: number;
    maintenanceAndRepairs: number;
    professionalFees: number;
    insurance: number;
    otherOperatingExpenses: number;
    totalOperatingExpenses: number;
  };
  operatingIncome: number;
  otherIncomeExpense: {
    interestIncome: number;
    interestExpense: number;
    foreignExchangeGainLoss: number;
    gainLossOnAssetDisposal: number;
    impairmentLosses: number; // IAS 36
    otherIncome: number;
    totalOtherIncomeExpense: number;
  };
  profitBeforeTax: number;
  incomeTaxExpense: {
    currentTax: number;
    deferredTax: number;
    totalTax: number;
  };
  profitAfterTax: number;
  
  // Per share information
  earningsPerShare?: {
    basic: number;
    diluted: number;
  };
  
  // IFRS specific items
  ifrsAdjustments: {
    revenueRecognitionAdjustments: number; // IFRS 15
    leaseExpenseAdjustments: number; // IFRS 16
    expectedCreditLossAdjustments: number; // IFRS 9
    fairValueAdjustments: number; // IFRS 13
  };
  
  // Comparative figures
  comparativeRevenue?: any;
  comparativeExpenses?: any;
}

export interface CashFlowStatement extends FinancialStatement {
  operatingActivities: {
    profitBeforeTax: number;
    adjustments: {
      depreciationAndAmortization: number;
      impairmentLosses: number;
      provisionChanges: number;
      unrealizedForeignExchange: number;
      interestExpense: number;
      otherNonCashItems: number;
    };
    workingCapitalChanges: {
      tradeReceivablesChange: number;
      inventoryChange: number;
      prepaidExpensesChange: number;
      tradePayablesChange: number;
      accruedExpensesChange: number;
      otherWorkingCapitalChanges: number;
    };
    cashFromOperatingActivitiesBeforeTax: number;
    incomeTaxPaid: number;
    netCashFromOperatingActivities: number;
  };
  investingActivities: {
    purchaseOfPPE: number;
    proceedsFromAssetSales: number;
    purchaseOfIntangibles: number;
    investmentsPurchased: number;
    investmentsSold: number;
    interestReceived: number;
    otherInvestingActivities: number;
    netCashFromInvestingActivities: number;
  };
  financingActivities: {
    proceedsFromBorrowings: number;
    repaymentOfBorrowings: number;
    leasePayments: number; // IFRS 16
    interestPaid: number;
    dividendsPaid: number;
    shareCapitalRaised: number;
    otherFinancingActivities: number;
    netCashFromFinancingActivities: number;
  };
  netIncreaseInCash: number;
  cashAtBeginningOfPeriod: number;
  cashAtEndOfPeriod: number;
  
  // Supplementary information
  supplementaryDisclosures: {
    nonCashInvestingFinancingActivities: any[];
    restrictedCash: number;
    cashPaidForInterest: number;
    cashPaidForTaxes: number;
  };
}

export interface ComprehensiveIncomeStatement extends FinancialStatement {
  profitAfterTax: number;
  otherComprehensiveIncome: {
    itemsThatWillNotBeReclassified: {
      actuarialGainsLossesOnBenefits: number; // IAS 19
      revaluationSurplus: number;
      otherItems: number;
      total: number;
    };
    itemsThatMayBeReclassified: {
      foreignCurrencyTranslation: number; // IAS 21
      cashFlowHedges: number; // IFRS 9
      availableForSaleInvestments: number;
      otherItems: number;
      total: number;
    };
    totalOtherComprehensiveIncome: number;
  };
  totalComprehensiveIncome: number;
}

export interface FinancialRatios {
  tenantId: string;
  periodEnd: Date;
  currency: string;
  
  liquidityRatios: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    workingCapital: number;
  };
  
  profitabilityRatios: {
    grossProfitMargin: number;
    operatingProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
    returnOnInvestedCapital: number;
  };
  
  leverageRatios: {
    debtToEquityRatio: number;
    debtToAssetsRatio: number;
    timesInterestEarnedRatio: number;
    debtServiceCoverageRatio: number;
  };
  
  efficiencyRatios: {
    assetTurnoverRatio: number;
    inventoryTurnoverRatio: number;
    receivablesTurnoverRatio: number;
    payablesTurnoverRatio: number;
    daysSalesOutstanding: number;
    daysInventoryOutstanding: number;
    daysPayableOutstanding: number;
    cashConversionCycle: number;
  };
  
  marketRatios?: {
    priceToEarningsRatio: number;
    priceToBookRatio: number;
    dividendYield: number;
    earningsPerShare: number;
  };
  
  industryBenchmarks: {
    peersComparison: any;
    industryAverages: any;
  };
}

@Injectable()
export class FinancialReportingService {
  private readonly logger = new Logger(FinancialReportingService.name);
  private readonly realtimeCache = new Map();

  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {
    // Initialize real-time update listeners
    this.initializeRealtimeListeners();
  }

  /**
   * Initialize real-time event listeners for dashboard updates
   */
  private initializeRealtimeListeners(): void {
    this.eventEmitter.on('journal.entries.created', (data) => {
      this.updateRealtimeDashboardMetrics(data);
    });
    
    this.eventEmitter.on('tax.reconciliation.updated', (data) => {
      this.updateTaxReconciliationMetrics(data);
    });
    
    this.eventEmitter.on('delivery.journal_entries.created', (data) => {
      this.updateDeliveryMetrics(data);
    });
  }

  // ===== BALANCE SHEET =====

  async generateBalanceSheet(
    tenantId: string,
    asOfDate: Date,
    includeComparative: boolean = true,
    currency: string = 'GHS'
  ): Promise<BalanceSheet> {
    this.logger.log(`Generating balance sheet for tenant ${tenantId} as of ${format(asOfDate, 'yyyy-MM-dd')}`);

    try {
      // Get current period data
      const currentPeriod = await this.getBalanceSheetData(tenantId, asOfDate, currency);
      
      // Get comparative period data (previous year)
      let comparativePeriod = null;
      if (includeComparative) {
        const comparativeDate = subYears(asOfDate, 1);
        comparativePeriod = await this.getBalanceSheetData(tenantId, comparativeDate, currency);
      }

      // Apply IFRS adjustments
      const ifrsAdjustments = await this.getIFRSAdjustments(tenantId, asOfDate);
      const adjustedCurrentPeriod = this.applyIFRSAdjustmentsToBalanceSheet(currentPeriod, ifrsAdjustments);

      // Build balance sheet
      const balanceSheet: BalanceSheet = {
        reportType: 'BALANCE_SHEET',
        tenantId,
        reportingPeriod: {
          startDate: startOfYear(asOfDate),
          endDate: asOfDate,
          periodName: `Year ended ${format(asOfDate, 'dd MMMM yyyy')}`
        },
        currency,
        preparationDate: new Date(),
        status: 'DRAFT',
        ifrsCompliant: true,
        
        assets: {
          currentAssets: {
            cashAndCashEquivalents: adjustedCurrentPeriod.cashAndEquivalents,
            tradeReceivables: adjustedCurrentPeriod.tradeReceivables - adjustedCurrentPeriod.allowanceForECL, // IFRS 9
            inventory: adjustedCurrentPeriod.inventory,
            prepaidExpenses: adjustedCurrentPeriod.prepaidExpenses,
            otherCurrentAssets: adjustedCurrentPeriod.otherCurrentAssets,
            total: 0 // Will be calculated
          },
          nonCurrentAssets: {
            propertyPlantEquipment: adjustedCurrentPeriod.ppe,
            rightOfUseAssets: adjustedCurrentPeriod.rightOfUseAssets, // IFRS 16
            intangibleAssets: adjustedCurrentPeriod.intangibleAssets,
            investments: adjustedCurrentPeriod.investments,
            deferredTaxAssets: adjustedCurrentPeriod.deferredTaxAssets,
            otherNonCurrentAssets: adjustedCurrentPeriod.otherNonCurrentAssets,
            total: 0 // Will be calculated
          },
          totalAssets: 0 // Will be calculated
        },
        
        liabilities: {
          currentLiabilities: {
            tradePayables: adjustedCurrentPeriod.tradePayables,
            shortTermBorrowings: adjustedCurrentPeriod.shortTermDebt,
            currentPortionLongTermDebt: adjustedCurrentPeriod.currentPortionLTD,
            accruedExpenses: adjustedCurrentPeriod.accruedExpenses,
            leaseObligationsCurrent: adjustedCurrentPeriod.leaseObligationsCurrent, // IFRS 16
            provisions: adjustedCurrentPeriod.currentProvisions,
            otherCurrentLiabilities: adjustedCurrentPeriod.otherCurrentLiabilities,
            total: 0 // Will be calculated
          },
          nonCurrentLiabilities: {
            longTermDebt: adjustedCurrentPeriod.longTermDebt,
            leaseObligationsNonCurrent: adjustedCurrentPeriod.leaseObligationsNonCurrent, // IFRS 16
            deferredTaxLiabilities: adjustedCurrentPeriod.deferredTaxLiabilities,
            employeeBenefits: adjustedCurrentPeriod.employeeBenefits, // IAS 19
            provisions: adjustedCurrentPeriod.nonCurrentProvisions,
            otherNonCurrentLiabilities: adjustedCurrentPeriod.otherNonCurrentLiabilities,
            total: 0 // Will be calculated
          },
          totalLiabilities: 0 // Will be calculated
        },
        
        equity: {
          shareCapital: adjustedCurrentPeriod.shareCapital,
          retainedEarnings: adjustedCurrentPeriod.retainedEarnings,
          otherComprehensiveIncome: adjustedCurrentPeriod.oci,
          reserves: adjustedCurrentPeriod.reserves,
          totalEquity: 0 // Will be calculated
        },
        totalLiabilitiesAndEquity: 0,
        
        ifrsDisclosures: {
          significantAccountingPolicies: await this.getAccountingPolicies(tenantId),
          criticalAccountingEstimates: await this.getCriticalEstimates(tenantId),
          financialRiskManagement: await this.getFinancialRiskDisclosures(tenantId),
          subsequentEvents: await this.getSubsequentEvents(tenantId, asOfDate)
        }
      };

      // Calculate totals
      this.calculateBalanceSheetTotals(balanceSheet);

      // Add comparative figures if requested
      if (includeComparative && comparativePeriod) {
        balanceSheet.comparativeAssets = this.buildComparativeAssets(comparativePeriod);
        balanceSheet.comparativeLiabilities = this.buildComparativeLiabilities(comparativePeriod);
        balanceSheet.comparativeEquity = this.buildComparativeEquity(comparativePeriod);
        balanceSheet.comparativePeriod = {
          startDate: startOfYear(subYears(asOfDate, 1)),
          endDate: subYears(asOfDate, 1),
          periodName: `Year ended ${format(subYears(asOfDate, 1), 'dd MMMM yyyy')}`
        };
      }

      // Validate balance sheet equation
      this.validateBalanceSheetEquation(balanceSheet);

      this.logger.log(`Balance sheet generated successfully for tenant ${tenantId}`);
      return balanceSheet;

    } catch (error) {
      this.logger.error(`Failed to generate balance sheet for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  // ===== INCOME STATEMENT =====

  async generateIncomeStatement(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    includeComparative: boolean = true,
    currency: string = 'GHS'
  ): Promise<IncomeStatement> {
    this.logger.log(`Generating income statement for tenant ${tenantId} for period ${format(periodStart, 'yyyy-MM-dd')} to ${format(periodEnd, 'yyyy-MM-dd')}`);

    try {
      // Get current period data
      const currentPeriod = await this.getIncomeStatementData(tenantId, periodStart, periodEnd, currency);
      
      // Get comparative period data (previous year same period)
      let comparativePeriod = null;
      if (includeComparative) {
        const compPeriodStart = subYears(periodStart, 1);
        const compPeriodEnd = subYears(periodEnd, 1);
        comparativePeriod = await this.getIncomeStatementData(tenantId, compPeriodStart, compPeriodEnd, currency);
      }

      // Apply IFRS adjustments
      const ifrsAdjustments = await this.getIncomeStatementIFRSAdjustments(tenantId, periodStart, periodEnd);
      const adjustedCurrentPeriod = this.applyIFRSAdjustmentsToIncomeStatement(currentPeriod, ifrsAdjustments);

      // Build income statement
      const incomeStatement: IncomeStatement = {
        reportType: 'INCOME_STATEMENT',
        tenantId,
        reportingPeriod: {
          startDate: periodStart,
          endDate: periodEnd,
          periodName: this.formatPeriodName(periodStart, periodEnd)
        },
        currency,
        preparationDate: new Date(),
        status: 'DRAFT',
        ifrsCompliant: true,
        
        revenue: {
          fuelSales: adjustedCurrentPeriod.fuelSales,
          lubricantSales: adjustedCurrentPeriod.lubricantSales,
          convenienceStoreSales: adjustedCurrentPeriod.convenienceStoreSales,
          serviceRevenue: adjustedCurrentPeriod.serviceRevenue,
          otherRevenue: adjustedCurrentPeriod.otherRevenue,
          totalRevenue: 0 // Will be calculated
        },
        
        costOfSales: {
          fuelCosts: adjustedCurrentPeriod.fuelCosts,
          lubricantCosts: adjustedCurrentPeriod.lubricantCosts,
          otherDirectCosts: adjustedCurrentPeriod.otherDirectCosts,
          totalCostOfSales: 0 // Will be calculated
        },
        
        grossProfit: 0, // Will be calculated
        
        operatingExpenses: {
          salariesAndBenefits: adjustedCurrentPeriod.salariesAndBenefits,
          rentAndUtilities: adjustedCurrentPeriod.rentAndUtilities,
          depreciationAndAmortization: adjustedCurrentPeriod.depreciationAndAmortization,
          rightOfUseAssetDepreciation: adjustedCurrentPeriod.rouDepreciation, // IFRS 16
          marketingAndAdvertising: adjustedCurrentPeriod.marketingAndAdvertising,
          maintenanceAndRepairs: adjustedCurrentPeriod.maintenanceAndRepairs,
          professionalFees: adjustedCurrentPeriod.professionalFees,
          insurance: adjustedCurrentPeriod.insurance,
          otherOperatingExpenses: adjustedCurrentPeriod.otherOperatingExpenses,
          totalOperatingExpenses: 0 // Will be calculated
        },
        
        operatingIncome: 0, // Will be calculated
        
        otherIncomeExpense: {
          interestIncome: adjustedCurrentPeriod.interestIncome,
          interestExpense: adjustedCurrentPeriod.interestExpense,
          foreignExchangeGainLoss: adjustedCurrentPeriod.forexGainLoss,
          gainLossOnAssetDisposal: adjustedCurrentPeriod.assetDisposalGainLoss,
          impairmentLosses: adjustedCurrentPeriod.impairmentLosses, // IAS 36
          otherIncome: adjustedCurrentPeriod.otherIncome,
          totalOtherIncomeExpense: 0 // Will be calculated
        },
        
        profitBeforeTax: 0, // Will be calculated
        
        incomeTaxExpense: {
          currentTax: adjustedCurrentPeriod.currentTax,
          deferredTax: adjustedCurrentPeriod.deferredTax,
          totalTax: 0 // Will be calculated
        },
        
        profitAfterTax: 0, // Will be calculated
        
        ifrsAdjustments: {
          revenueRecognitionAdjustments: ifrsAdjustments.ifrs15Adjustments || 0,
          leaseExpenseAdjustments: ifrsAdjustments.ifrs16Adjustments || 0,
          expectedCreditLossAdjustments: ifrsAdjustments.ifrs9Adjustments || 0,
          fairValueAdjustments: ifrsAdjustments.ifrs13Adjustments || 0
        }
      };

      // Calculate totals and derived figures
      this.calculateIncomeStatementTotals(incomeStatement);

      // Add comparative figures if requested
      if (includeComparative && comparativePeriod) {
        incomeStatement.comparativeRevenue = this.buildComparativeRevenue(comparativePeriod);
        incomeStatement.comparativeExpenses = this.buildComparativeExpenses(comparativePeriod);
        incomeStatement.comparativePeriod = {
          startDate: subYears(periodStart, 1),
          endDate: subYears(periodEnd, 1),
          periodName: this.formatPeriodName(subYears(periodStart, 1), subYears(periodEnd, 1))
        };
      }

      // Calculate earnings per share if applicable
      const shareCount = await this.getWeightedAverageShareCount(tenantId, periodStart, periodEnd);
      if (shareCount > 0) {
        incomeStatement.earningsPerShare = {
          basic: incomeStatement.profitAfterTax / shareCount,
          diluted: incomeStatement.profitAfterTax / shareCount // Simplified - would need dilutive securities calculation
        };
      }

      this.logger.log(`Income statement generated successfully for tenant ${tenantId}`);
      return incomeStatement;

    } catch (error) {
      this.logger.error(`Failed to generate income statement for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  // ===== CASH FLOW STATEMENT =====

  async generateCashFlowStatement(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    currency: string = 'GHS'
  ): Promise<CashFlowStatement> {
    this.logger.log(`Generating cash flow statement for tenant ${tenantId} for period ${format(periodStart, 'yyyy-MM-dd')} to ${format(periodEnd, 'yyyy-MM-dd')}`);

    try {
      // Get cash flow data using indirect method
      const cashFlowData = await this.getCashFlowData(tenantId, periodStart, periodEnd, currency);
      
      // Get beginning and ending cash balances
      const beginningCash = await this.getCashBalance(tenantId, periodStart, currency);
      const endingCash = await this.getCashBalance(tenantId, periodEnd, currency);

      // Apply IFRS 16 adjustments for lease payments
      const ifrs16Adjustments = await this.getIFRS16CashFlowAdjustments(tenantId, periodStart, periodEnd);

      const cashFlowStatement: CashFlowStatement = {
        reportType: 'CASH_FLOW',
        tenantId,
        reportingPeriod: {
          startDate: periodStart,
          endDate: periodEnd,
          periodName: this.formatPeriodName(periodStart, periodEnd)
        },
        currency,
        preparationDate: new Date(),
        status: 'DRAFT',
        ifrsCompliant: true,
        
        operatingActivities: {
          profitBeforeTax: cashFlowData.profitBeforeTax,
          adjustments: {
            depreciationAndAmortization: cashFlowData.depreciationAndAmortization,
            impairmentLosses: cashFlowData.impairmentLosses,
            provisionChanges: cashFlowData.provisionChanges,
            unrealizedForeignExchange: cashFlowData.unrealizedForex,
            interestExpense: cashFlowData.interestExpense,
            otherNonCashItems: cashFlowData.otherNonCashItems
          },
          workingCapitalChanges: {
            tradeReceivablesChange: cashFlowData.receivablesChange,
            inventoryChange: cashFlowData.inventoryChange,
            prepaidExpensesChange: cashFlowData.prepaidsChange,
            tradePayablesChange: cashFlowData.payablesChange,
            accruedExpensesChange: cashFlowData.accrualsChange,
            otherWorkingCapitalChanges: cashFlowData.otherWCChanges
          },
          cashFromOperatingActivitiesBeforeTax: 0, // Will be calculated
          incomeTaxPaid: cashFlowData.taxPaid,
          netCashFromOperatingActivities: 0 // Will be calculated
        },
        
        investingActivities: {
          purchaseOfPPE: -cashFlowData.ppeAdditions,
          proceedsFromAssetSales: cashFlowData.assetDisposals,
          purchaseOfIntangibles: -cashFlowData.intangibleAdditions,
          investmentsPurchased: -cashFlowData.investmentsPurchased,
          investmentsSold: cashFlowData.investmentsSold,
          interestReceived: cashFlowData.interestReceived,
          otherInvestingActivities: cashFlowData.otherInvesting,
          netCashFromInvestingActivities: 0 // Will be calculated
        },
        
        financingActivities: {
          proceedsFromBorrowings: cashFlowData.borrowingsProceeds,
          repaymentOfBorrowings: -cashFlowData.borrowingsRepayments,
          leasePayments: -(ifrs16Adjustments.leasePayments || 0), // IFRS 16
          interestPaid: -cashFlowData.interestPaid,
          dividendsPaid: -cashFlowData.dividendsPaid,
          shareCapitalRaised: cashFlowData.equityRaised,
          otherFinancingActivities: cashFlowData.otherFinancing,
          netCashFromFinancingActivities: 0 // Will be calculated
        },
        
        netIncreaseInCash: 0, // Will be calculated
        cashAtBeginningOfPeriod: beginningCash,
        cashAtEndOfPeriod: endingCash,
        
        supplementaryDisclosures: {
          nonCashInvestingFinancingActivities: await this.getNonCashActivities(tenantId, periodStart, periodEnd),
          restrictedCash: await this.getRestrictedCash(tenantId, periodEnd),
          cashPaidForInterest: cashFlowData.interestPaid,
          cashPaidForTaxes: cashFlowData.taxPaid
        }
      };

      // Calculate totals
      this.calculateCashFlowTotals(cashFlowStatement);

      // Validate cash flow statement
      this.validateCashFlowStatement(cashFlowStatement);

      this.logger.log(`Cash flow statement generated successfully for tenant ${tenantId}`);
      return cashFlowStatement;

    } catch (error) {
      this.logger.error(`Failed to generate cash flow statement for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  // ===== FINANCIAL RATIOS =====

  async calculateFinancialRatios(
    tenantId: string,
    periodEnd: Date,
    currency: string = 'GHS'
  ): Promise<FinancialRatios> {
    this.logger.log(`Calculating financial ratios for tenant ${tenantId} as of ${format(periodEnd, 'yyyy-MM-dd')}`);

    try {
      // Get financial data for ratio calculations
      const balanceSheet = await this.generateBalanceSheet(tenantId, periodEnd, false, currency);
      const incomeStatement = await this.generateIncomeStatement(
        tenantId, 
        startOfYear(periodEnd), 
        periodEnd, 
        false, 
        currency
      );

      // Get additional data for some ratios
      const averageAssets = await this.getAverageAssets(tenantId, periodEnd, currency);
      const averageEquity = await this.getAverageEquity(tenantId, periodEnd, currency);
      const marketData = await this.getMarketData(tenantId, periodEnd);

      const ratios: FinancialRatios = {
        tenantId,
        periodEnd,
        currency,
        
        liquidityRatios: {
          currentRatio: this.safeDivision(
            balanceSheet.assets.currentAssets.total,
            balanceSheet.liabilities.currentLiabilities.total
          ),
          quickRatio: this.safeDivision(
            balanceSheet.assets.currentAssets.total - balanceSheet.assets.currentAssets.inventory,
            balanceSheet.liabilities.currentLiabilities.total
          ),
          cashRatio: this.safeDivision(
            balanceSheet.assets.currentAssets.cashAndCashEquivalents,
            balanceSheet.liabilities.currentLiabilities.total
          ),
          workingCapital: balanceSheet.assets.currentAssets.total - balanceSheet.liabilities.currentLiabilities.total
        },
        
        profitabilityRatios: {
          grossProfitMargin: this.safeDivision(
            incomeStatement.grossProfit,
            incomeStatement.revenue.totalRevenue
          ) * 100,
          operatingProfitMargin: this.safeDivision(
            incomeStatement.operatingIncome,
            incomeStatement.revenue.totalRevenue
          ) * 100,
          netProfitMargin: this.safeDivision(
            incomeStatement.profitAfterTax,
            incomeStatement.revenue.totalRevenue
          ) * 100,
          returnOnAssets: this.safeDivision(
            incomeStatement.profitAfterTax,
            averageAssets
          ) * 100,
          returnOnEquity: this.safeDivision(
            incomeStatement.profitAfterTax,
            averageEquity
          ) * 100,
          returnOnInvestedCapital: this.safeDivision(
            incomeStatement.operatingIncome * (1 - 0.25), // Assuming 25% tax rate
            averageAssets - balanceSheet.liabilities.currentLiabilities.total
          ) * 100
        },
        
        leverageRatios: {
          debtToEquityRatio: this.safeDivision(
            balanceSheet.liabilities.totalLiabilities,
            balanceSheet.equity.totalEquity
          ),
          debtToAssetsRatio: this.safeDivision(
            balanceSheet.liabilities.totalLiabilities,
            balanceSheet.assets.totalAssets
          ),
          timesInterestEarnedRatio: this.safeDivision(
            incomeStatement.operatingIncome,
            Math.abs(incomeStatement.otherIncomeExpense.interestExpense)
          ),
          debtServiceCoverageRatio: await this.calculateDebtServiceCoverage(tenantId, periodEnd)
        },
        
        efficiencyRatios: {
          assetTurnoverRatio: this.safeDivision(
            incomeStatement.revenue.totalRevenue,
            averageAssets
          ),
          inventoryTurnoverRatio: this.safeDivision(
            incomeStatement.costOfSales.totalCostOfSales,
            balanceSheet.assets.currentAssets.inventory
          ),
          receivablesTurnoverRatio: this.safeDivision(
            incomeStatement.revenue.totalRevenue,
            balanceSheet.assets.currentAssets.tradeReceivables
          ),
          payablesTurnoverRatio: this.safeDivision(
            incomeStatement.costOfSales.totalCostOfSales,
            balanceSheet.liabilities.currentLiabilities.tradePayables
          ),
          daysSalesOutstanding: this.safeDivision(
            balanceSheet.assets.currentAssets.tradeReceivables * 365,
            incomeStatement.revenue.totalRevenue
          ),
          daysInventoryOutstanding: this.safeDivision(
            balanceSheet.assets.currentAssets.inventory * 365,
            incomeStatement.costOfSales.totalCostOfSales
          ),
          daysPayableOutstanding: this.safeDivision(
            balanceSheet.liabilities.currentLiabilities.tradePayables * 365,
            incomeStatement.costOfSales.totalCostOfSales
          ),
          cashConversionCycle: 0 // Will be calculated below
        },
        
        industryBenchmarks: {
          peersComparison: await this.getPeersComparison(tenantId),
          industryAverages: await this.getIndustryAverages('FUEL_RETAIL')
        }
      };

      // Calculate cash conversion cycle
      ratios.efficiencyRatios.cashConversionCycle = 
        ratios.efficiencyRatios.daysSalesOutstanding +
        ratios.efficiencyRatios.daysInventoryOutstanding -
        ratios.efficiencyRatios.daysPayableOutstanding;

      // Add market ratios if publicly traded
      if (marketData && marketData.sharePrice) {
        ratios.marketRatios = {
          priceToEarningsRatio: this.safeDivision(
            marketData.sharePrice,
            incomeStatement.earningsPerShare?.basic || 0
          ),
          priceToBookRatio: this.safeDivision(
            marketData.sharePrice,
            this.safeDivision(balanceSheet.equity.totalEquity, marketData.sharesOutstanding)
          ),
          dividendYield: this.safeDivision(
            marketData.dividendPerShare,
            marketData.sharePrice
          ) * 100,
          earningsPerShare: incomeStatement.earningsPerShare?.basic || 0
        };
      }

      this.logger.log(`Financial ratios calculated successfully for tenant ${tenantId}`);
      return ratios;

    } catch (error) {
      this.logger.error(`Failed to calculate financial ratios for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  // ===== REAL-TIME DASHBOARD UPDATES =====

  /**
   * Update real-time dashboard metrics when journal entries are created
   */
  async updateRealtimeDashboardMetrics(data: {
    deliveryId: string;
    journalEntries: any[];
    stationType: string;
    totalValue: number;
    timestamp: Date;
  }): Promise<void> {
    try {
      // Update cached metrics
      const currentMetrics = this.realtimeCache.get('dashboard_metrics') || {
        totalRevenue: 0,
        totalCosts: 0,
        taxAccruals: 0,
        grossProfit: 0,
        deliveryCount: 0,
      };

      // Update based on station type and journal entries
      if (data.stationType === 'DODO' || data.stationType === 'OTHER') {
        currentMetrics.totalRevenue += data.totalValue;
        currentMetrics.deliveryCount += 1;
      } else {
        currentMetrics.totalCosts += data.totalValue;
      }

      // Update tax accruals from journal entries
      const taxAccrualEntry = data.journalEntries.find(entry => entry.journalType === 'TAX_ACCRUAL');
      if (taxAccrualEntry) {
        const taxAmount = taxAccrualEntry.lines
          .filter(line => line.creditAmount > 0)
          .reduce((sum, line) => sum + line.creditAmount, 0);
        currentMetrics.taxAccruals += taxAmount;
      }

      currentMetrics.grossProfit = currentMetrics.totalRevenue - currentMetrics.totalCosts;

      this.realtimeCache.set('dashboard_metrics', currentMetrics);

      // Emit real-time update event
      this.eventEmitter.emit('dashboard.metrics.updated', {
        metrics: currentMetrics,
        lastUpdated: new Date(),
        triggerSource: 'journal_entry_created',
      });

      this.logger.log('Real-time dashboard metrics updated');

    } catch (error) {
      this.logger.error('Failed to update real-time dashboard metrics:', error);
    }
  }

  /**
   * Update tax reconciliation metrics
   */
  async updateTaxReconciliationMetrics(data: {
    taxType: string;
    paidAmount: number;
    paymentDate: Date;
  }): Promise<void> {
    try {
      const taxReconciliation = this.realtimeCache.get('tax_reconciliation') || {};
      
      if (!taxReconciliation[data.taxType]) {
        taxReconciliation[data.taxType] = {
          accrued: 0,
          paid: 0,
          outstanding: 0,
        };
      }

      taxReconciliation[data.taxType].paid += data.paidAmount;
      taxReconciliation[data.taxType].outstanding = 
        taxReconciliation[data.taxType].accrued - taxReconciliation[data.taxType].paid;

      this.realtimeCache.set('tax_reconciliation', taxReconciliation);

      // Emit tax reconciliation update
      this.eventEmitter.emit('tax.reconciliation.dashboard.updated', {
        taxType: data.taxType,
        reconciliation: taxReconciliation[data.taxType],
        lastUpdated: new Date(),
      });

    } catch (error) {
      this.logger.error('Failed to update tax reconciliation metrics:', error);
    }
  }

  /**
   * Update delivery-based metrics
   */
  async updateDeliveryMetrics(data: {
    deliveryId: string;
    stationType: string;
    totalValue: number;
  }): Promise<void> {
    try {
      const deliveryMetrics = this.realtimeCache.get('delivery_metrics') || {
        byStationType: {},
        dailyVolume: 0,
        dailyValue: 0,
      };

      if (!deliveryMetrics.byStationType[data.stationType]) {
        deliveryMetrics.byStationType[data.stationType] = {
          count: 0,
          totalValue: 0,
        };
      }

      deliveryMetrics.byStationType[data.stationType].count += 1;
      deliveryMetrics.byStationType[data.stationType].totalValue += data.totalValue;
      deliveryMetrics.dailyValue += data.totalValue;

      this.realtimeCache.set('delivery_metrics', deliveryMetrics);

      // Emit delivery metrics update
      this.eventEmitter.emit('delivery.metrics.updated', {
        metrics: deliveryMetrics,
        lastUpdated: new Date(),
      });

    } catch (error) {
      this.logger.error('Failed to update delivery metrics:', error);
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getRealtimeDashboardData(): Promise<{
    dashboardMetrics: any;
    taxReconciliation: any;
    deliveryMetrics: any;
    lastUpdated: Date;
  }> {
    return {
      dashboardMetrics: this.realtimeCache.get('dashboard_metrics') || {},
      taxReconciliation: this.realtimeCache.get('tax_reconciliation') || {},
      deliveryMetrics: this.realtimeCache.get('delivery_metrics') || {},
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate enhanced trial balance with tax reconciliation
   */
  async generateEnhancedTrialBalance(
    periodId: string,
    includeTaxReconciliation: boolean = true
  ): Promise<TrialBalanceData[]> {
    try {
      const baseTrialBalance = await this.generateTrialBalance(periodId);

      if (!includeTaxReconciliation) {
        return baseTrialBalance;
      }

      // Enhance with tax reconciliation data
      const enhancedTrialBalance = await Promise.all(
        baseTrialBalance.map(async (account) => {
          if (this.isTaxAccount(account.accountCode)) {
            const reconciliationData = await this.getTaxReconciliationForAccount(
              account.accountCode,
              periodId
            );
            return {
              ...account,
              taxAccruals: reconciliationData.accrued,
              taxPayments: reconciliationData.paid,
              netTaxPosition: reconciliationData.accrued - reconciliationData.paid,
            };
          }
          return account;
        })
      );

      return enhancedTrialBalance;

    } catch (error) {
      this.logger.error('Failed to generate enhanced trial balance:', error);
      throw error;
    }
  }

  /**
   * Check if account is a tax account
   */
  private isTaxAccount(accountCode: string): boolean {
    const taxAccountPrefixes = ['2210', '2220', '2230', '2240', '2250', '2260', '2270', '5100', '5110', '5120', '5130', '5140', '5150', '5200'];
    return taxAccountPrefixes.includes(accountCode);
  }

  /**
   * Get tax reconciliation data for specific account
   */
  private async getTaxReconciliationForAccount(
    accountCode: string,
    periodId: string
  ): Promise<{ accrued: number; paid: number }> {
    try {
      const result = await this.dataSource.query(
        `SELECT 
          SUM(CASE WHEN jel.credit_amount > 0 THEN jel.credit_amount ELSE 0 END) as accrued,
          SUM(CASE WHEN jel.debit_amount > 0 THEN jel.debit_amount ELSE 0 END) as paid
        FROM journal_entry_lines jel
        JOIN journal_entries je ON je.id = jel.journal_entry_id
        WHERE jel.account_code = $1
        AND je.period_id = $2
        AND je.status = 'POSTED'`,
        [accountCode, periodId]
      );

      return {
        accrued: parseFloat(result[0]?.accrued || 0),
        paid: parseFloat(result[0]?.paid || 0),
      };
    } catch (error) {
      this.logger.error(`Failed to get tax reconciliation for account ${accountCode}:`, error);
      return { accrued: 0, paid: 0 };
    }
  }

  // ===== AUTOMATED REPORTING =====

  @Cron('0 8 1 * *') // 8 AM on 1st of every month
  async generateMonthlyReports(): Promise<void> {
    this.logger.log('Starting automated monthly financial reporting');

    try {
      const tenants = await this.getActiveTenants();
      const lastMonth = subMonths(new Date(), 1);
      const monthStart = startOfMonth(lastMonth);
      const monthEnd = endOfMonth(lastMonth);

      for (const tenant of tenants) {
        try {
          // Generate monthly income statement
          const incomeStatement = await this.generateIncomeStatement(
            tenant.tenant_id,
            monthStart,
            monthEnd
          );

          // Generate month-end balance sheet
          const balanceSheet = await this.generateBalanceSheet(
            tenant.tenant_id,
            monthEnd
          );

          // Generate cash flow statement
          const cashFlowStatement = await this.generateCashFlowStatement(
            tenant.tenant_id,
            monthStart,
            monthEnd
          );

          // Calculate financial ratios
          const financialRatios = await this.calculateFinancialRatios(
            tenant.tenant_id,
            monthEnd
          );

          // Store reports
          await this.storeFinancialReports(tenant.tenant_id, {
            incomeStatement,
            balanceSheet,
            cashFlowStatement,
            financialRatios
          });

          // Send notifications to stakeholders
          this.eventEmitter.emit('financial-reports.generated', {
            tenantId: tenant.tenant_id,
            period: format(monthEnd, 'yyyy-MM'),
            reportTypes: ['INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW', 'RATIOS']
          });

        } catch (error) {
          this.logger.error(`Failed to generate monthly reports for tenant ${tenant.tenant_id}:`, error);
        }
      }

      this.logger.log('Automated monthly financial reporting completed');
    } catch (error) {
      this.logger.error('Failed to complete automated monthly reporting:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private calculateBalanceSheetTotals(balanceSheet: BalanceSheet): void {
    // Current Assets
    const currentAssets = balanceSheet.assets.currentAssets;
    currentAssets.total = 
      currentAssets.cashAndCashEquivalents +
      currentAssets.tradeReceivables +
      currentAssets.inventory +
      currentAssets.prepaidExpenses +
      currentAssets.otherCurrentAssets;

    // Non-Current Assets
    const nonCurrentAssets = balanceSheet.assets.nonCurrentAssets;
    nonCurrentAssets.total =
      nonCurrentAssets.propertyPlantEquipment +
      nonCurrentAssets.rightOfUseAssets +
      nonCurrentAssets.intangibleAssets +
      nonCurrentAssets.investments +
      nonCurrentAssets.deferredTaxAssets +
      nonCurrentAssets.otherNonCurrentAssets;

    // Total Assets
    balanceSheet.assets.totalAssets = currentAssets.total + nonCurrentAssets.total;

    // Current Liabilities
    const currentLiabilities = balanceSheet.liabilities.currentLiabilities;
    currentLiabilities.total =
      currentLiabilities.tradePayables +
      currentLiabilities.shortTermBorrowings +
      currentLiabilities.currentPortionLongTermDebt +
      currentLiabilities.accruedExpenses +
      currentLiabilities.leaseObligationsCurrent +
      currentLiabilities.provisions +
      currentLiabilities.otherCurrentLiabilities;

    // Non-Current Liabilities
    const nonCurrentLiabilities = balanceSheet.liabilities.nonCurrentLiabilities;
    nonCurrentLiabilities.total =
      nonCurrentLiabilities.longTermDebt +
      nonCurrentLiabilities.leaseObligationsNonCurrent +
      nonCurrentLiabilities.deferredTaxLiabilities +
      nonCurrentLiabilities.employeeBenefits +
      nonCurrentLiabilities.provisions +
      nonCurrentLiabilities.otherNonCurrentLiabilities;

    // Total Liabilities
    balanceSheet.liabilities.totalLiabilities = currentLiabilities.total + nonCurrentLiabilities.total;

    // Total Equity
    balanceSheet.equity.totalEquity =
      balanceSheet.equity.shareCapital +
      balanceSheet.equity.retainedEarnings +
      balanceSheet.equity.otherComprehensiveIncome +
      balanceSheet.equity.reserves;

    // Total Liabilities and Equity
    balanceSheet.totalLiabilitiesAndEquity = 
      balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity;
  }

  private calculateIncomeStatementTotals(incomeStatement: IncomeStatement): void {
    // Total Revenue
    incomeStatement.revenue.totalRevenue =
      incomeStatement.revenue.fuelSales +
      incomeStatement.revenue.lubricantSales +
      incomeStatement.revenue.convenienceStoreSales +
      incomeStatement.revenue.serviceRevenue +
      incomeStatement.revenue.otherRevenue;

    // Total Cost of Sales
    incomeStatement.costOfSales.totalCostOfSales =
      incomeStatement.costOfSales.fuelCosts +
      incomeStatement.costOfSales.lubricantCosts +
      incomeStatement.costOfSales.otherDirectCosts;

    // Gross Profit
    incomeStatement.grossProfit = 
      incomeStatement.revenue.totalRevenue - incomeStatement.costOfSales.totalCostOfSales;

    // Total Operating Expenses
    incomeStatement.operatingExpenses.totalOperatingExpenses =
      incomeStatement.operatingExpenses.salariesAndBenefits +
      incomeStatement.operatingExpenses.rentAndUtilities +
      incomeStatement.operatingExpenses.depreciationAndAmortization +
      incomeStatement.operatingExpenses.rightOfUseAssetDepreciation +
      incomeStatement.operatingExpenses.marketingAndAdvertising +
      incomeStatement.operatingExpenses.maintenanceAndRepairs +
      incomeStatement.operatingExpenses.professionalFees +
      incomeStatement.operatingExpenses.insurance +
      incomeStatement.operatingExpenses.otherOperatingExpenses;

    // Operating Income
    incomeStatement.operatingIncome = 
      incomeStatement.grossProfit - incomeStatement.operatingExpenses.totalOperatingExpenses;

    // Total Other Income/Expense
    incomeStatement.otherIncomeExpense.totalOtherIncomeExpense =
      incomeStatement.otherIncomeExpense.interestIncome +
      incomeStatement.otherIncomeExpense.interestExpense +
      incomeStatement.otherIncomeExpense.foreignExchangeGainLoss +
      incomeStatement.otherIncomeExpense.gainLossOnAssetDisposal +
      incomeStatement.otherIncomeExpense.impairmentLosses +
      incomeStatement.otherIncomeExpense.otherIncome;

    // Profit Before Tax
    incomeStatement.profitBeforeTax = 
      incomeStatement.operatingIncome + incomeStatement.otherIncomeExpense.totalOtherIncomeExpense;

    // Total Tax
    incomeStatement.incomeTaxExpense.totalTax =
      incomeStatement.incomeTaxExpense.currentTax + incomeStatement.incomeTaxExpense.deferredTax;

    // Profit After Tax
    incomeStatement.profitAfterTax = 
      incomeStatement.profitBeforeTax - incomeStatement.incomeTaxExpense.totalTax;
  }

  private calculateCashFlowTotals(cashFlowStatement: CashFlowStatement): void {
    // Operating Activities
    const operating = cashFlowStatement.operatingActivities;
    const adjustmentsTotal = Object.values(operating.adjustments).reduce((sum, val) => sum + val, 0);
    const workingCapitalTotal = Object.values(operating.workingCapitalChanges).reduce((sum, val) => sum + val, 0);
    
    operating.cashFromOperatingActivitiesBeforeTax = 
      operating.profitBeforeTax + adjustmentsTotal + workingCapitalTotal;
    
    operating.netCashFromOperatingActivities = 
      operating.cashFromOperatingActivitiesBeforeTax - operating.incomeTaxPaid;

    // Investing Activities
    const investing = cashFlowStatement.investingActivities;
    investing.netCashFromInvestingActivities =
      investing.purchaseOfPPE +
      investing.proceedsFromAssetSales +
      investing.purchaseOfIntangibles +
      investing.investmentsPurchased +
      investing.investmentsSold +
      investing.interestReceived +
      investing.otherInvestingActivities;

    // Financing Activities
    const financing = cashFlowStatement.financingActivities;
    financing.netCashFromFinancingActivities =
      financing.proceedsFromBorrowings +
      financing.repaymentOfBorrowings +
      financing.leasePayments +
      financing.interestPaid +
      financing.dividendsPaid +
      financing.shareCapitalRaised +
      financing.otherFinancingActivities;

    // Net Increase in Cash
    cashFlowStatement.netIncreaseInCash =
      operating.netCashFromOperatingActivities +
      investing.netCashFromInvestingActivities +
      financing.netCashFromFinancingActivities;
  }

  private validateBalanceSheetEquation(balanceSheet: BalanceSheet): void {
    const difference = Math.abs(
      balanceSheet.assets.totalAssets - balanceSheet.totalLiabilitiesAndEquity
    );
    
    if (difference > 0.01) {
      throw new BadRequestException(
        `Balance sheet does not balance: Assets=${balanceSheet.assets.totalAssets}, Liabilities+Equity=${balanceSheet.totalLiabilitiesAndEquity}, Difference=${difference}`
      );
    }
  }

  private validateCashFlowStatement(cashFlowStatement: CashFlowStatement): void {
    const calculatedEndingCash = 
      cashFlowStatement.cashAtBeginningOfPeriod + cashFlowStatement.netIncreaseInCash;
    
    const difference = Math.abs(calculatedEndingCash - cashFlowStatement.cashAtEndOfPeriod);
    
    if (difference > 0.01) {
      this.logger.warn(
        `Cash flow statement reconciliation difference: ${difference}. ` +
        `Beginning: ${cashFlowStatement.cashAtBeginningOfPeriod}, ` +
        `Net Change: ${cashFlowStatement.netIncreaseInCash}, ` +
        `Ending: ${cashFlowStatement.cashAtEndOfPeriod}`
      );
    }
  }

  private safeDivision(numerator: number, denominator: number): number {
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private formatPeriodName(startDate: Date, endDate: Date): string {
    if (startDate.getFullYear() !== endDate.getFullYear()) {
      return `${format(startDate, 'dd MMM yyyy')} to ${format(endDate, 'dd MMM yyyy')}`;
    }
    
    if (startDate.getMonth() !== endDate.getMonth()) {
      return `${format(startDate, 'dd MMM')} to ${format(endDate, 'dd MMM yyyy')}`;
    }
    
    return `${format(startDate, 'dd')} to ${format(endDate, 'dd MMM yyyy')}`;
  }

  // Placeholder methods for data retrieval (would be implemented with actual queries)
  private async getBalanceSheetData(tenantId: string, asOfDate: Date, currency: string): Promise<any> { return {}; }
  private async getIncomeStatementData(tenantId: string, startDate: Date, endDate: Date, currency: string): Promise<any> { return {}; }
  private async getCashFlowData(tenantId: string, startDate: Date, endDate: Date, currency: string): Promise<any> { return {}; }
  private async getIFRSAdjustments(tenantId: string, asOfDate: Date): Promise<any> { return {}; }
  private async getIncomeStatementIFRSAdjustments(tenantId: string, startDate: Date, endDate: Date): Promise<any> { return {}; }
  private async getIFRS16CashFlowAdjustments(tenantId: string, startDate: Date, endDate: Date): Promise<any> { return {}; }
  private async getCashBalance(tenantId: string, date: Date, currency: string): Promise<number> { return 0; }
  private async getAccountingPolicies(tenantId: string): Promise<string[]> { return []; }
  private async getCriticalEstimates(tenantId: string): Promise<string[]> { return []; }
  private async getFinancialRiskDisclosures(tenantId: string): Promise<any> { return {}; }
  private async getSubsequentEvents(tenantId: string, asOfDate: Date): Promise<any[]> { return []; }
  private async getNonCashActivities(tenantId: string, startDate: Date, endDate: Date): Promise<any[]> { return []; }
  private async getRestrictedCash(tenantId: string, asOfDate: Date): Promise<number> { return 0; }
  private async getWeightedAverageShareCount(tenantId: string, startDate: Date, endDate: Date): Promise<number> { return 0; }
  private async getAverageAssets(tenantId: string, asOfDate: Date, currency: string): Promise<number> { return 0; }
  private async getAverageEquity(tenantId: string, asOfDate: Date, currency: string): Promise<number> { return 0; }
  private async getMarketData(tenantId: string, asOfDate: Date): Promise<any> { return null; }
  private async calculateDebtServiceCoverage(tenantId: string, asOfDate: Date): Promise<number> { return 0; }
  private async getPeersComparison(tenantId: string): Promise<any> { return {}; }
  private async getIndustryAverages(industry: string): Promise<any> { return {}; }
  private async getActiveTenants(): Promise<any[]> { return []; }
  private async storeFinancialReports(tenantId: string, reports: any): Promise<void> {}
  private applyIFRSAdjustmentsToBalanceSheet(data: any, adjustments: any): any { return data; }
  private applyIFRSAdjustmentsToIncomeStatement(data: any, adjustments: any): any { return data; }
  private buildComparativeAssets(data: any): any { return {}; }
  private buildComparativeLiabilities(data: any): any { return {}; }
  private buildComparativeEquity(data: any): any { return {}; }
  private buildComparativeRevenue(data: any): any { return {}; }
  private buildComparativeExpenses(data: any): any { return {}; }
}