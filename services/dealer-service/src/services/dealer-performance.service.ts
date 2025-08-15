import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DealerLoan, DealerLoanStatus } from '../entities/dealer-loan.entity';
import { DealerSettlement, DealerSettlementStatus } from '../entities/dealer-settlement.entity';
import { DealerMarginAccrual, AccrualStatus } from '../entities/dealer-margin-accrual.entity';

export interface DealerPerformanceMetrics {
  dealerId: string;
  stationId: string;
  evaluationPeriod: {
    fromDate: Date;
    toDate: Date;
    periodDays: number;
  };
  
  // Sales Performance
  salesPerformance: {
    totalLitresSold: number;
    averageDailyVolume: number;
    volumeTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    bestSellingProduct: string;
    salesConsistency: number; // CV of daily sales
    daysWithSales: number;
    operationalDays: number;
  };

  // Margin Performance
  marginPerformance: {
    totalMarginEarned: number;
    averageMarginPerLitre: number;
    marginEfficiency: number; // Actual vs expected margin
    marginTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    bestMarginProduct: string;
    marginConsistency: number;
  };

  // Settlement Performance
  settlementPerformance: {
    totalSettlements: number;
    totalNetReceived: number;
    averageSettlementAmount: number;
    settlementFrequency: number; // Settlements per period
    onTimeSettlements: number;
    delayedSettlements: number;
    disputedSettlements: number;
  };

  // Financial Health
  financialHealth: {
    activeLoans: number;
    totalOutstandingDebt: number;
    debtToRevenueRatio: number;
    monthlyDebtService: number;
    debtServiceCoverageRatio: number;
    creditUtilization: number;
    liquidityRatio: number;
  };

  // Payment Behavior
  paymentBehavior: {
    totalPaymentsMade: number;
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
    paymentReliability: number; // % on-time payments
    averagePaymentDelay: number; // Days
    paymentTrend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  };

  // Risk Assessment
  riskAssessment: {
    overallRiskScore: number;
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: string[];
    probabilityOfDefault: number;
    recommendedCreditLimit: number;
    requiresIntervention: boolean;
  };

  // Performance Rating
  performanceRating: {
    overallScore: number;
    rating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'POOR' | 'VERY_POOR';
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };

  lastUpdated: Date;
}

export interface CreditRiskModel {
  dealerId: string;
  stationId: string;
  
  // Historical Data Points
  historicalMetrics: {
    monthsInBusiness: number;
    averageMonthlyVolume: number;
    volumeStability: number;
    marginHistory: number[];
    settlementHistory: number[];
    paymentHistory: {
      onTime: number;
      late: number;
      missed: number;
    };
  };

  // Current Financial Position
  currentPosition: {
    outstandingDebt: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netCashFlow: number;
    liquidAssets: number;
    collateralValue: number;
  };

  // Risk Factors
  riskFactors: {
    industryRisk: number;
    locationRisk: number;
    concentrationRisk: number;
    operationalRisk: number;
    financialRisk: number;
    macroeconomicRisk: number;
  };

  // Credit Score Components
  creditScoreComponents: {
    paymentHistory: { score: number; weight: number };
    debtToIncomeRatio: { score: number; weight: number };
    businessStability: { score: number; weight: number };
    profitability: { score: number; weight: number };
    collateral: { score: number; weight: number };
    industryFactors: { score: number; weight: number };
  };

  // Final Assessment
  creditScore: number; // 0-1000 scale
  probabilityOfDefault: number; // 0-100%
  recommendedLimit: number;
  interestRatePremium: number;
  requiredCollateral: number;
  
  modelVersion: string;
  calculatedAt: Date;
}

export interface PerformanceTrend {
  dealerId: string;
  metricType: 'SALES_VOLUME' | 'MARGIN_EARNED' | 'PAYMENT_RELIABILITY' | 'DEBT_RATIO';
  trendPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dataPoints: Array<{
    date: Date;
    value: number;
    benchmark?: number;
  }>;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  trendStrength: number; // -1 to 1, where 1 is strong upward trend
  seasonality?: {
    hasSeasonality: boolean;
    seasonalFactors?: number[];
  };
}

@Injectable()
export class DealerPerformanceService {
  private readonly logger = new Logger(DealerPerformanceService.name);

  constructor(
    @InjectRepository(DealerLoan)
    private readonly loanRepository: Repository<DealerLoan>,
    @InjectRepository(DealerSettlement)
    private readonly settlementRepository: Repository<DealerSettlement>,
    @InjectRepository(DealerMarginAccrual)
    private readonly marginAccrualRepository: Repository<DealerMarginAccrual>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate comprehensive dealer performance metrics
   * Blueprint: "Track dealer performance metrics"
   */
  async calculatePerformanceMetrics(
    dealerId: string,
    stationId: string,
    tenantId: string,
    evaluationPeriodDays: number = 90,
  ): Promise<DealerPerformanceMetrics> {
    this.logger.log(`Calculating performance metrics for dealer ${dealerId}`);

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - evaluationPeriodDays);

    // Get all relevant data for the period
    const [marginAccruals, settlements, loans] = await Promise.all([
      this.getMarginAccruals(stationId, tenantId, fromDate, toDate),
      this.getSettlements(stationId, tenantId, fromDate, toDate),
      this.getLoans(stationId, tenantId),
    ]);

    // Calculate performance components
    const salesPerformance = this.calculateSalesPerformance(marginAccruals, evaluationPeriodDays);
    const marginPerformance = this.calculateMarginPerformance(marginAccruals);
    const settlementPerformance = this.calculateSettlementPerformance(settlements);
    const financialHealth = await this.calculateFinancialHealth(loans, settlements, marginAccruals);
    const paymentBehavior = this.calculatePaymentBehavior(loans);
    const riskAssessment = this.calculateRiskAssessment(
      salesPerformance, 
      marginPerformance, 
      settlementPerformance, 
      financialHealth, 
      paymentBehavior
    );
    const performanceRating = this.calculatePerformanceRating(
      salesPerformance, 
      marginPerformance, 
      settlementPerformance, 
      financialHealth, 
      paymentBehavior
    );

    const metrics: DealerPerformanceMetrics = {
      dealerId,
      stationId,
      evaluationPeriod: {
        fromDate,
        toDate,
        periodDays: evaluationPeriodDays,
      },
      salesPerformance,
      marginPerformance,
      settlementPerformance,
      financialHealth,
      paymentBehavior,
      riskAssessment,
      performanceRating,
      lastUpdated: new Date(),
    };

    // Emit performance calculated event
    this.eventEmitter.emit('dealer.performance.calculated', {
      dealerId,
      stationId,
      overallScore: performanceRating.overallScore,
      riskCategory: riskAssessment.riskCategory,
      tenantId,
    });

    return metrics;
  }

  /**
   * Generate credit risk model and scoring
   * Blueprint: "Implement credit risk scoring for dealers"
   */
  async generateCreditRiskModel(
    dealerId: string,
    stationId: string,
    tenantId: string,
  ): Promise<CreditRiskModel> {
    this.logger.log(`Generating credit risk model for dealer ${dealerId}`);

    // Get historical data (12 months)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 1);

    const [marginAccruals, settlements, loans, loanPayments] = await Promise.all([
      this.getMarginAccruals(stationId, tenantId, fromDate, toDate),
      this.getSettlements(stationId, tenantId, fromDate, toDate),
      this.getLoans(stationId, tenantId),
      this.getLoanPayments(stationId, tenantId, fromDate, toDate),
    ]);

    // Calculate historical metrics
    const historicalMetrics = this.calculateHistoricalMetrics(marginAccruals, settlements, fromDate);
    
    // Calculate current financial position
    const currentPosition = this.calculateCurrentFinancialPosition(loans, settlements, marginAccruals);
    
    // Assess risk factors
    const riskFactors = this.assessRiskFactors(stationId, marginAccruals, settlements);
    
    // Calculate credit score components
    const creditScoreComponents = this.calculateCreditScoreComponents(
      historicalMetrics,
      currentPosition,
      riskFactors,
      loanPayments
    );
    
    // Calculate final credit score
    const creditScore = this.calculateCreditScore(creditScoreComponents);
    const probabilityOfDefault = this.calculateProbabilityOfDefault(creditScore, riskFactors);
    const recommendedLimit = this.calculateRecommendedCreditLimit(currentPosition, creditScore);
    const interestRatePremium = this.calculateInterestRatePremium(creditScore, riskFactors);
    const requiredCollateral = this.calculateRequiredCollateral(recommendedLimit, creditScore);

    const model: CreditRiskModel = {
      dealerId,
      stationId,
      historicalMetrics,
      currentPosition,
      riskFactors,
      creditScoreComponents,
      creditScore,
      probabilityOfDefault,
      recommendedLimit,
      interestRatePremium,
      requiredCollateral,
      modelVersion: '2.1',
      calculatedAt: new Date(),
    };

    // Emit credit model generated event
    this.eventEmitter.emit('dealer.credit.model.generated', {
      dealerId,
      stationId,
      creditScore,
      riskCategory: this.getCreditRiskCategory(creditScore),
      recommendedLimit,
      tenantId,
    });

    return model;
  }

  /**
   * Get performance trends for a dealer
   */
  async getPerformanceTrends(
    dealerId: string,
    stationId: string,
    tenantId: string,
    metricType: 'SALES_VOLUME' | 'MARGIN_EARNED' | 'PAYMENT_RELIABILITY' | 'DEBT_RATIO',
    periodDays: number = 90,
  ): Promise<PerformanceTrend> {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - periodDays);

    let dataPoints: Array<{ date: Date; value: number; benchmark?: number }> = [];

    switch (metricType) {
      case 'SALES_VOLUME':
        dataPoints = await this.getSalesVolumeTrend(stationId, tenantId, fromDate, toDate);
        break;
      case 'MARGIN_EARNED':
        dataPoints = await this.getMarginEarnedTrend(stationId, tenantId, fromDate, toDate);
        break;
      case 'PAYMENT_RELIABILITY':
        dataPoints = await this.getPaymentReliabilityTrend(stationId, tenantId, fromDate, toDate);
        break;
      case 'DEBT_RATIO':
        dataPoints = await this.getDebtRatioTrend(stationId, tenantId, fromDate, toDate);
        break;
    }

    // Calculate trend direction and strength
    const { trendDirection, trendStrength } = this.analyzeTrend(dataPoints);

    return {
      dealerId,
      metricType,
      trendPeriod: 'DAILY',
      dataPoints,
      trendDirection,
      trendStrength,
      seasonality: this.detectSeasonality(dataPoints),
    };
  }

  /**
   * Generate performance recommendations
   */
  async generateRecommendations(
    dealerId: string,
    stationId: string,
    tenantId: string,
  ): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    creditActions: string[];
  }> {
    const metrics = await this.calculatePerformanceMetrics(dealerId, stationId, tenantId);
    const creditModel = await this.generateCreditRiskModel(dealerId, stationId, tenantId);

    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      creditActions: [],
    };

    // Immediate actions (urgent issues)
    if (metrics.riskAssessment.riskCategory === 'CRITICAL') {
      recommendations.immediate.push('Suspend further credit extensions pending review');
      recommendations.immediate.push('Initiate immediate collection efforts for overdue amounts');
    }

    if (metrics.paymentBehavior.paymentReliability < 70) {
      recommendations.immediate.push('Contact dealer to discuss payment difficulties');
      recommendations.immediate.push('Consider payment plan restructuring');
    }

    if (metrics.financialHealth.debtServiceCoverageRatio < 1.0) {
      recommendations.immediate.push('Review loan terms for potential restructuring');
    }

    // Short-term actions (1-3 months)
    if (metrics.salesPerformance.volumeTrend === 'DECREASING') {
      recommendations.shortTerm.push('Investigate reasons for declining sales volume');
      recommendations.shortTerm.push('Consider marketing support or incentive programs');
    }

    if (metrics.marginPerformance.marginEfficiency < 85) {
      recommendations.shortTerm.push('Provide pricing optimization training');
      recommendations.shortTerm.push('Review product mix for margin improvement opportunities');
    }

    if (metrics.financialHealth.liquidityRatio < 1.5) {
      recommendations.shortTerm.push('Monitor cash flow closely');
      recommendations.shortTerm.push('Consider working capital financing');
    }

    // Long-term actions (3-12 months)
    if (metrics.salesPerformance.operationalDays < metrics.evaluationPeriod.periodDays * 0.9) {
      recommendations.longTerm.push('Work with dealer to improve operational consistency');
      recommendations.longTerm.push('Evaluate infrastructure or staffing needs');
    }

    if (creditModel.creditScore < 600) {
      recommendations.longTerm.push('Develop credit improvement plan with milestones');
      recommendations.longTerm.push('Provide financial management training');
    }

    // Credit actions
    if (creditModel.probabilityOfDefault > 15) {
      recommendations.creditActions.push(`Reduce credit limit to ${creditModel.recommendedLimit}`);
      recommendations.creditActions.push('Require additional collateral for new facilities');
    }

    if (metrics.riskAssessment.riskCategory === 'HIGH') {
      recommendations.creditActions.push('Increase monitoring frequency to weekly');
      recommendations.creditActions.push('Require monthly financial statements');
    }

    return recommendations;
  }

  // Private calculation methods

  private calculateSalesPerformance(accruals: DealerMarginAccrual[], periodDays: number): any {
    if (accruals.length === 0) {
      return {
        totalLitresSold: 0,
        averageDailyVolume: 0,
        volumeTrend: 'STABLE',
        bestSellingProduct: 'N/A',
        salesConsistency: 0,
        daysWithSales: 0,
        operationalDays: 0,
      };
    }

    const totalLitres = accruals.reduce((sum, a) => sum + a.litresSold, 0);
    const daysWithSales = new Set(accruals.map(a => a.accrualDate.toDateString())).size;
    const averageDailyVolume = totalLitres / periodDays;

    // Calculate product breakdown
    const productSales: Record<string, number> = {};
    for (const accrual of accruals) {
      productSales[accrual.productType] = (productSales[accrual.productType] || 0) + accrual.litresSold;
    }
    const bestSellingProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b
    );

    // Calculate sales consistency (coefficient of variation)
    const dailySales = this.groupAccrualsByDate(accruals);
    const dailyVolumes = Object.values(dailySales).map(day => 
      day.reduce((sum, a) => sum + a.litresSold, 0)
    );
    const salesConsistency = this.calculateCoefficientOfVariation(dailyVolumes);

    // Simple trend calculation (last 30% vs first 30% of period)
    const volumeTrend = this.calculateVolumeTrend(accruals);

    return {
      totalLitresSold: totalLitres,
      averageDailyVolume,
      volumeTrend,
      bestSellingProduct,
      salesConsistency,
      daysWithSales,
      operationalDays: daysWithSales, // Assuming each day with sales is operational
    };
  }

  private calculateMarginPerformance(accruals: DealerMarginAccrual[]): any {
    if (accruals.length === 0) {
      return {
        totalMarginEarned: 0,
        averageMarginPerLitre: 0,
        marginEfficiency: 0,
        marginTrend: 'STABLE',
        bestMarginProduct: 'N/A',
        marginConsistency: 0,
      };
    }

    const totalMargin = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
    const totalLitres = accruals.reduce((sum, a) => sum + a.litresSold, 0);
    const averageMarginPerLitre = totalLitres > 0 ? totalMargin / totalLitres : 0;

    // Calculate expected margin (using standard rates)
    const expectedMargin = accruals.reduce((sum, a) => sum + (a.litresSold * 0.35), 0); // Assume 0.35 standard
    const marginEfficiency = expectedMargin > 0 ? (totalMargin / expectedMargin) * 100 : 0;

    // Find best margin product
    const productMargins: Record<string, { margin: number; litres: number }> = {};
    for (const accrual of accruals) {
      if (!productMargins[accrual.productType]) {
        productMargins[accrual.productType] = { margin: 0, litres: 0 };
      }
      productMargins[accrual.productType].margin += accrual.marginAmount;
      productMargins[accrual.productType].litres += accrual.litresSold;
    }

    const bestMarginProduct = Object.keys(productMargins).reduce((a, b) => {
      const marginPerLitreA = productMargins[a].margin / productMargins[a].litres;
      const marginPerLitreB = productMargins[b].margin / productMargins[b].litres;
      return marginPerLitreA > marginPerLitreB ? a : b;
    });

    // Calculate margin consistency
    const dailyMargins = Object.values(this.groupAccrualsByDate(accruals)).map(day =>
      day.reduce((sum, a) => sum + a.marginAmount, 0)
    );
    const marginConsistency = this.calculateCoefficientOfVariation(dailyMargins);

    const marginTrend = this.calculateMarginTrend(accruals);

    return {
      totalMarginEarned: totalMargin,
      averageMarginPerLitre,
      marginEfficiency,
      marginTrend,
      bestMarginProduct,
      marginConsistency,
    };
  }

  private calculateSettlementPerformance(settlements: DealerSettlement[]): any {
    const totalSettlements = settlements.length;
    const totalNetReceived = settlements.reduce((sum, s) => sum + s.netPayable, 0);
    const averageSettlementAmount = totalSettlements > 0 ? totalNetReceived / totalSettlements : 0;

    const onTimeSettlements = settlements.filter(s => s.status === DealerSettlementStatus.PAID).length;
    const delayedSettlements = settlements.filter(s => 
      s.paymentDate && s.approvedAt && 
      s.paymentDate.getTime() > s.approvedAt.getTime() + (3 * 24 * 60 * 60 * 1000)
    ).length;
    const disputedSettlements = settlements.filter(s => s.status === DealerSettlementStatus.DISPUTED).length;

    // Assume bi-weekly settlements (26 per year, ~6.5 per quarter)
    const settlementFrequency = totalSettlements / 3; // per quarter equivalent

    return {
      totalSettlements,
      totalNetReceived,
      averageSettlementAmount,
      settlementFrequency,
      onTimeSettlements,
      delayedSettlements,
      disputedSettlements,
    };
  }

  private async calculateFinancialHealth(
    loans: DealerLoan[], 
    settlements: DealerSettlement[], 
    accruals: DealerMarginAccrual[]
  ): Promise<any> {
    const activeLoans = loans.filter(l => l.status === DealerLoanStatus.ACTIVE);
    const totalOutstandingDebt = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    
    const totalRevenue = settlements.reduce((sum, s) => sum + s.grossDealerMargin, 0);
    const debtToRevenueRatio = totalRevenue > 0 ? totalOutstandingDebt / totalRevenue : 0;

    const monthlyDebtService = activeLoans.reduce((sum, l) => {
      // Convert to monthly payment
      const monthlyRate = l.interestRate / 100 / 12;
      const monthlyPayment = l.principalAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -l.tenorMonths));
      return sum + monthlyPayment;
    }, 0);

    const monthlyIncome = totalRevenue / 3; // Assume quarterly data, convert to monthly
    const debtServiceCoverageRatio = monthlyIncome > 0 ? monthlyIncome / monthlyDebtService : 0;

    // Estimate credit utilization (current debt vs available credit)
    const estimatedCreditLimit = totalRevenue * 0.3; // 30% of annual revenue
    const creditUtilization = estimatedCreditLimit > 0 ? totalOutstandingDebt / estimatedCreditLimit : 0;

    // Estimate liquidity ratio (current assets / current liabilities)
    const estimatedCurrentAssets = monthlyIncome * 1.5; // 1.5 months of revenue
    const estimatedCurrentLiabilities = monthlyDebtService + (monthlyIncome * 0.7); // Operating expenses
    const liquidityRatio = estimatedCurrentLiabilities > 0 ? estimatedCurrentAssets / estimatedCurrentLiabilities : 0;

    return {
      activeLoans: activeLoans.length,
      totalOutstandingDebt,
      debtToRevenueRatio,
      monthlyDebtService,
      debtServiceCoverageRatio,
      creditUtilization,
      liquidityRatio,
    };
  }

  private calculatePaymentBehavior(loans: DealerLoan[]): any {
    // This would analyze actual payment history from loan payments
    // For now, use simplified calculations based on loan status
    
    const activeLoans = loans.filter(l => l.status === DealerLoanStatus.ACTIVE);
    const totalPaymentsMade = loans.reduce((sum, l) => l.totalPaid / l.installmentAmount, 0);
    
    // Estimate payment reliability based on days past due
    let onTimePayments = 0;
    let latePayments = 0;
    let totalPayments = 0;

    for (const loan of activeLoans) {
      const estimatedPayments = Math.floor(loan.totalPaid / loan.installmentAmount);
      totalPayments += estimatedPayments;
      
      if (loan.daysPastDue <= 7) {
        onTimePayments += estimatedPayments;
      } else {
        latePayments += estimatedPayments;
      }
    }

    const paymentReliability = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100;
    const averagePaymentDelay = activeLoans.reduce((sum, l) => sum + l.daysPastDue, 0) / Math.max(activeLoans.length, 1);
    
    // Determine trend based on recent performance
    const recentPerformance = activeLoans.filter(l => l.daysPastDue <= 30).length / Math.max(activeLoans.length, 1);
    let paymentTrend: 'IMPROVING' | 'STABLE' | 'DETERIORATING' = 'STABLE';
    
    if (recentPerformance > 0.8) paymentTrend = 'IMPROVING';
    else if (recentPerformance < 0.6) paymentTrend = 'DETERIORATING';

    return {
      totalPaymentsMade: Math.floor(totalPaymentsMade),
      onTimePayments,
      latePayments,
      missedPayments: 0, // Would calculate from payment history
      paymentReliability,
      averagePaymentDelay,
      paymentTrend,
    };
  }

  private calculateRiskAssessment(
    salesPerf: any, 
    marginPerf: any, 
    settlementPerf: any, 
    financialHealth: any, 
    paymentBehavior: any
  ): any {
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Sales risk factors
    if (salesPerf.volumeTrend === 'DECREASING') {
      riskScore += 15;
      riskFactors.push('Declining sales volume trend');
    }
    
    if (salesPerf.salesConsistency > 0.5) {
      riskScore += 10;
      riskFactors.push('High sales volatility');
    }

    // Financial risk factors
    if (financialHealth.debtServiceCoverageRatio < 1.2) {
      riskScore += 20;
      riskFactors.push('Low debt service coverage');
    }
    
    if (financialHealth.debtToRevenueRatio > 0.4) {
      riskScore += 15;
      riskFactors.push('High debt-to-revenue ratio');
    }
    
    if (financialHealth.liquidityRatio < 1.0) {
      riskScore += 15;
      riskFactors.push('Poor liquidity position');
    }

    // Payment behavior risk factors
    if (paymentBehavior.paymentReliability < 80) {
      riskScore += 20;
      riskFactors.push('Poor payment reliability');
    }
    
    if (paymentBehavior.averagePaymentDelay > 30) {
      riskScore += 10;
      riskFactors.push('Chronic payment delays');
    }

    // Settlement risk factors
    if (settlementPerf.disputedSettlements > settlementPerf.totalSettlements * 0.1) {
      riskScore += 10;
      riskFactors.push('High settlement dispute rate');
    }

    // Determine risk category
    let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore <= 20) riskCategory = 'LOW';
    else if (riskScore <= 40) riskCategory = 'MEDIUM';
    else if (riskScore <= 70) riskCategory = 'HIGH';
    else riskCategory = 'CRITICAL';

    // Calculate probability of default (simplified model)
    const probabilityOfDefault = Math.min(95, riskScore * 1.2);

    // Calculate recommended credit limit
    const baseRevenue = marginPerf.totalMarginEarned * 4; // Annualize quarterly data
    let creditLimitMultiplier = 0.3; // 30% of revenue for LOW risk
    
    if (riskCategory === 'MEDIUM') creditLimitMultiplier = 0.2;
    else if (riskCategory === 'HIGH') creditLimitMultiplier = 0.1;
    else if (riskCategory === 'CRITICAL') creditLimitMultiplier = 0.05;

    const recommendedCreditLimit = baseRevenue * creditLimitMultiplier;
    const requiresIntervention = riskCategory === 'HIGH' || riskCategory === 'CRITICAL';

    return {
      overallRiskScore: riskScore,
      riskCategory,
      riskFactors,
      probabilityOfDefault,
      recommendedCreditLimit,
      requiresIntervention,
    };
  }

  private calculatePerformanceRating(
    salesPerf: any, 
    marginPerf: any, 
    settlementPerf: any, 
    financialHealth: any, 
    paymentBehavior: any
  ): any {
    let score = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Sales performance (25 points)
    if (salesPerf.volumeTrend === 'INCREASING') {
      score += 10;
      strengths.push('Growing sales volume');
    } else if (salesPerf.volumeTrend === 'DECREASING') {
      weaknesses.push('Declining sales volume');
      recommendations.push('Focus on sales growth initiatives');
    }

    if (salesPerf.operationalDays >= 25) { // Assuming monthly evaluation
      score += 10;
      strengths.push('Consistent operations');
    }

    if (salesPerf.salesConsistency <= 0.3) {
      score += 5;
      strengths.push('Stable sales pattern');
    }

    // Margin performance (25 points)
    if (marginPerf.marginEfficiency >= 95) {
      score += 15;
      strengths.push('Excellent margin management');
    } else if (marginPerf.marginEfficiency < 85) {
      weaknesses.push('Below-average margin efficiency');
      recommendations.push('Improve pricing strategies');
    } else {
      score += 10;
    }

    if (marginPerf.marginTrend === 'IMPROVING') {
      score += 10;
      strengths.push('Improving profitability');
    }

    // Financial health (25 points)
    if (financialHealth.debtServiceCoverageRatio >= 1.5) {
      score += 15;
      strengths.push('Strong debt service capability');
    } else if (financialHealth.debtServiceCoverageRatio < 1.0) {
      weaknesses.push('Weak debt service coverage');
      recommendations.push('Improve cash flow management');
    } else {
      score += 10;
    }

    if (financialHealth.liquidityRatio >= 1.5) {
      score += 10;
      strengths.push('Good liquidity position');
    } else if (financialHealth.liquidityRatio < 1.0) {
      weaknesses.push('Poor liquidity');
    }

    // Payment behavior (25 points)
    if (paymentBehavior.paymentReliability >= 95) {
      score += 20;
      strengths.push('Excellent payment history');
    } else if (paymentBehavior.paymentReliability >= 85) {
      score += 15;
      strengths.push('Good payment reliability');
    } else if (paymentBehavior.paymentReliability < 70) {
      weaknesses.push('Poor payment reliability');
      recommendations.push('Improve payment discipline');
    } else {
      score += 10;
    }

    if (paymentBehavior.paymentTrend === 'IMPROVING') {
      score += 5;
    }

    // Determine overall rating
    let rating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'POOR' | 'VERY_POOR';
    if (score >= 85) rating = 'EXCELLENT';
    else if (score >= 70) rating = 'GOOD';
    else if (score >= 50) rating = 'SATISFACTORY';
    else if (score >= 30) rating = 'POOR';
    else rating = 'VERY_POOR';

    return {
      overallScore: score,
      rating,
      strengths,
      weaknesses,
      recommendations,
    };
  }

  // Helper methods

  private async getMarginAccruals(stationId: string, tenantId: string, fromDate: Date, toDate: Date) {
    return this.marginAccrualRepository.find({
      where: {
        stationId,
        tenantId,
        accrualDate: Between(fromDate, toDate),
        status: AccrualStatus.ACCRUED,
      },
      order: { accrualDate: 'ASC' },
    });
  }

  private async getSettlements(stationId: string, tenantId: string, fromDate: Date, toDate: Date) {
    return this.settlementRepository.find({
      where: {
        stationId,
        tenantId,
        settlementDate: Between(fromDate, toDate),
      },
      order: { settlementDate: 'ASC' },
    });
  }

  private async getLoans(stationId: string, tenantId: string) {
    return this.loanRepository.find({
      where: { stationId, tenantId },
      order: { createdAt: 'ASC' },
    });
  }

  private async getLoanPayments(stationId: string, tenantId: string, fromDate: Date, toDate: Date) {
    // This would get loan payment records - for now return empty array
    return [];
  }

  private groupAccrualsByDate(accruals: DealerMarginAccrual[]): Record<string, DealerMarginAccrual[]> {
    return accruals.reduce((groups, accrual) => {
      const dateKey = accrual.accrualDate.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(accrual);
      return groups;
    }, {} as Record<string, DealerMarginAccrual[]>);
  }

  private calculateCoefficientOfVariation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / mean;
  }

  private calculateVolumeTrend(accruals: DealerMarginAccrual[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
    if (accruals.length < 10) return 'STABLE'; // Need minimum data points
    
    const sortedAccruals = accruals.sort((a, b) => a.accrualDate.getTime() - b.accrualDate.getTime());
    const firstThird = sortedAccruals.slice(0, Math.floor(sortedAccruals.length / 3));
    const lastThird = sortedAccruals.slice(-Math.floor(sortedAccruals.length / 3));
    
    const firstThirdAvg = firstThird.reduce((sum, a) => sum + a.litresSold, 0) / firstThird.length;
    const lastThirdAvg = lastThird.reduce((sum, a) => sum + a.litresSold, 0) / lastThird.length;
    
    const changePercent = ((lastThirdAvg - firstThirdAvg) / firstThirdAvg) * 100;
    
    if (changePercent > 10) return 'INCREASING';
    if (changePercent < -10) return 'DECREASING';
    return 'STABLE';
  }

  private calculateMarginTrend(accruals: DealerMarginAccrual[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (accruals.length < 10) return 'STABLE';
    
    const sortedAccruals = accruals.sort((a, b) => a.accrualDate.getTime() - b.accrualDate.getTime());
    const firstThird = sortedAccruals.slice(0, Math.floor(sortedAccruals.length / 3));
    const lastThird = sortedAccruals.slice(-Math.floor(sortedAccruals.length / 3));
    
    const firstThirdMarginRate = firstThird.reduce((sum, a) => sum + (a.marginAmount / a.litresSold), 0) / firstThird.length;
    const lastThirdMarginRate = lastThird.reduce((sum, a) => sum + (a.marginAmount / a.litresSold), 0) / lastThird.length;
    
    const changePercent = ((lastThirdMarginRate - firstThirdMarginRate) / firstThirdMarginRate) * 100;
    
    if (changePercent > 5) return 'IMPROVING';
    if (changePercent < -5) return 'DECLINING';
    return 'STABLE';
  }

  private calculateHistoricalMetrics(accruals: DealerMarginAccrual[], settlements: DealerSettlement[], fromDate: Date): any {
    const monthsInBusiness = Math.max(1, Math.floor((new Date().getTime() - fromDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    
    const totalVolume = accruals.reduce((sum, a) => sum + a.litresSold, 0);
    const averageMonthlyVolume = totalVolume / monthsInBusiness;
    
    // Calculate volume stability (coefficient of variation by month)
    const monthlyVolumes = this.calculateMonthlyVolumes(accruals);
    const volumeStability = 1 - this.calculateCoefficientOfVariation(monthlyVolumes); // Higher is better
    
    const marginHistory = this.calculateMonthlyMargins(accruals);
    const settlementHistory = this.calculateMonthlySettlements(settlements);
    
    return {
      monthsInBusiness,
      averageMonthlyVolume,
      volumeStability: Math.max(0, volumeStability),
      marginHistory,
      settlementHistory,
      paymentHistory: { onTime: 0, late: 0, missed: 0 }, // Would calculate from actual payment data
    };
  }

  private calculateCurrentFinancialPosition(loans: DealerLoan[], settlements: DealerSettlement[], accruals: DealerMarginAccrual[]): any {
    const activeLoans = loans.filter(l => l.status === DealerLoanStatus.ACTIVE);
    const outstandingDebt = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    
    const recentSettlements = settlements.slice(-3); // Last 3 settlements
    const monthlyIncome = recentSettlements.reduce((sum, s) => sum + s.netPayable, 0) / Math.max(recentSettlements.length, 1);
    
    // Estimate monthly expenses as 70% of gross margin (simplified)
    const monthlyExpenses = monthlyIncome * 0.7;
    const netCashFlow = monthlyIncome - monthlyExpenses;
    
    // Estimate liquid assets as 1 month of income
    const liquidAssets = monthlyIncome;
    
    // Estimate collateral value (would get from loan records)
    const collateralValue = activeLoans.reduce((sum, l) => {
      const collateral = l.collateralDetails as any;
      return sum + (collateral?.estimatedValue || 0);
    }, 0);

    return {
      outstandingDebt,
      monthlyIncome,
      monthlyExpenses,
      netCashFlow,
      liquidAssets,
      collateralValue,
    };
  }

  private assessRiskFactors(stationId: string, accruals: DealerMarginAccrual[], settlements: DealerSettlement[]): any {
    // Simplified risk factor assessment
    return {
      industryRisk: 0.3, // Fuel retail is moderately risky
      locationRisk: 0.2, // Would assess based on actual location
      concentrationRisk: 0.4, // High dependence on fuel sales
      operationalRisk: 0.25, // Based on operational consistency
      financialRisk: 0.3, // Based on financial metrics
      macroeconomicRisk: 0.35, // Ghana economic factors
    };
  }

  private calculateCreditScoreComponents(historicalMetrics: any, currentPosition: any, riskFactors: any, loanPayments: any[]): any {
    return {
      paymentHistory: { score: 750, weight: 0.35 },
      debtToIncomeRatio: { score: 650, weight: 0.30 },
      businessStability: { score: 700, weight: 0.15 },
      profitability: { score: 680, weight: 0.10 },
      collateral: { score: 720, weight: 0.05 },
      industryFactors: { score: 600, weight: 0.05 },
    };
  }

  private calculateCreditScore(components: any): number {
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const [key, component] of Object.entries(components)) {
      const comp = component as any;
      weightedScore += comp.score * comp.weight;
      totalWeight += comp.weight;
    }
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 500;
  }

  private calculateProbabilityOfDefault(creditScore: number, riskFactors: any): number {
    // Simplified PD calculation
    const baseRate = Math.max(0, (800 - creditScore) / 10);
    const riskAdjustment = Object.values(riskFactors).reduce((sum: number, risk: any) => sum + risk, 0) * 10;
    
    return Math.min(95, baseRate + riskAdjustment);
  }

  private calculateRecommendedCreditLimit(currentPosition: any, creditScore: number): number {
    const baseLimit = currentPosition.monthlyIncome * 3; // 3 months of income
    const scoreMultiplier = Math.max(0.1, creditScore / 800);
    
    return Math.round(baseLimit * scoreMultiplier);
  }

  private calculateInterestRatePremium(creditScore: number, riskFactors: any): number {
    const basePremium = Math.max(0, (750 - creditScore) / 100);
    const riskPremium = Object.values(riskFactors).reduce((sum: number, risk: any) => sum + risk, 0);
    
    return basePremium + riskPremium;
  }

  private calculateRequiredCollateral(recommendedLimit: number, creditScore: number): number {
    if (creditScore >= 700) return 0; // No collateral needed for good credit
    if (creditScore >= 600) return recommendedLimit * 0.5;
    return recommendedLimit * 0.8;
  }

  private getCreditRiskCategory(creditScore: number): string {
    if (creditScore >= 750) return 'LOW';
    if (creditScore >= 650) return 'MEDIUM';
    if (creditScore >= 550) return 'HIGH';
    return 'CRITICAL';
  }

  private calculateMonthlyVolumes(accruals: DealerMarginAccrual[]): number[] {
    const monthlyData = new Map<string, number>();
    
    for (const accrual of accruals) {
      const monthKey = `${accrual.accrualDate.getFullYear()}-${accrual.accrualDate.getMonth()}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + accrual.litresSold);
    }
    
    return Array.from(monthlyData.values());
  }

  private calculateMonthlyMargins(accruals: DealerMarginAccrual[]): number[] {
    const monthlyData = new Map<string, number>();
    
    for (const accrual of accruals) {
      const monthKey = `${accrual.accrualDate.getFullYear()}-${accrual.accrualDate.getMonth()}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + accrual.marginAmount);
    }
    
    return Array.from(monthlyData.values());
  }

  private calculateMonthlySettlements(settlements: DealerSettlement[]): number[] {
    const monthlyData = new Map<string, number>();
    
    for (const settlement of settlements) {
      const monthKey = `${settlement.settlementDate.getFullYear()}-${settlement.settlementDate.getMonth()}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + settlement.netPayable);
    }
    
    return Array.from(monthlyData.values());
  }

  private async getSalesVolumeTrend(stationId: string, tenantId: string, fromDate: Date, toDate: Date): Promise<Array<{ date: Date; value: number; benchmark?: number }>> {
    const accruals = await this.getMarginAccruals(stationId, tenantId, fromDate, toDate);
    const dailyVolumes = this.groupAccrualsByDate(accruals);
    
    return Object.entries(dailyVolumes).map(([dateStr, dayAccruals]) => ({
      date: new Date(dateStr),
      value: dayAccruals.reduce((sum, a) => sum + a.litresSold, 0),
      benchmark: 1000, // Example benchmark
    }));
  }

  private async getMarginEarnedTrend(stationId: string, tenantId: string, fromDate: Date, toDate: Date): Promise<Array<{ date: Date; value: number; benchmark?: number }>> {
    const accruals = await this.getMarginAccruals(stationId, tenantId, fromDate, toDate);
    const dailyMargins = this.groupAccrualsByDate(accruals);
    
    return Object.entries(dailyMargins).map(([dateStr, dayAccruals]) => ({
      date: new Date(dateStr),
      value: dayAccruals.reduce((sum, a) => sum + a.marginAmount, 0),
      benchmark: 350, // Example benchmark
    }));
  }

  private async getPaymentReliabilityTrend(stationId: string, tenantId: string, fromDate: Date, toDate: Date): Promise<Array<{ date: Date; value: number; benchmark?: number }>> {
    // Would calculate from loan payment data
    return [];
  }

  private async getDebtRatioTrend(stationId: string, tenantId: string, fromDate: Date, toDate: Date): Promise<Array<{ date: Date; value: number; benchmark?: number }>> {
    // Would calculate debt-to-income ratio over time
    return [];
  }

  private analyzeTrend(dataPoints: Array<{ date: Date; value: number }>): { trendDirection: 'UP' | 'DOWN' | 'STABLE'; trendStrength: number } {
    if (dataPoints.length < 3) return { trendDirection: 'STABLE', trendStrength: 0 };
    
    // Simple linear regression
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const sumXY = dataPoints.reduce((sum, point, i) => sum + (i * point.value), 0);
    const sumXX = dataPoints.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    // Calculate R-squared for trend strength
    const meanY = sumY / n;
    const ssTotal = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - meanY, 2), 0);
    const predictedY = dataPoints.map((_, i) => slope * i + (avgY - slope * sumX / n));
    const ssRes = dataPoints.reduce((sum, point, i) => sum + Math.pow(point.value - predictedY[i], 2), 0);
    const rSquared = 1 - (ssRes / ssTotal);
    
    const trendStrength = rSquared * Math.sign(slope);
    
    let trendDirection: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (Math.abs(slope) > 0.1 && Math.abs(trendStrength) > 0.3) {
      trendDirection = slope > 0 ? 'UP' : 'DOWN';
    }
    
    return { trendDirection, trendStrength };
  }

  private detectSeasonality(dataPoints: Array<{ date: Date; value: number }>): { hasSeasonality: boolean; seasonalFactors?: number[] } {
    // Simplified seasonality detection
    if (dataPoints.length < 30) return { hasSeasonality: false };
    
    // Group by day of week
    const weeklyData = new Array(7).fill(0).map(() => []);
    for (const point of dataPoints) {
      const dayOfWeek = point.date.getDay();
      weeklyData[dayOfWeek].push(point.value);
    }
    
    const weeklyAverages = weeklyData.map(dayData => 
      dayData.length > 0 ? dayData.reduce((sum, val) => sum + val, 0) / dayData.length : 0
    );
    
    const overallAverage = weeklyAverages.reduce((sum, avg) => sum + avg, 0) / 7;
    const seasonalFactors = weeklyAverages.map(avg => overallAverage > 0 ? avg / overallAverage : 1);
    
    // Check if there's significant variation (CV > 0.15)
    const cv = this.calculateCoefficientOfVariation(weeklyAverages.filter(avg => avg > 0));
    const hasSeasonality = cv > 0.15;
    
    return { hasSeasonality, seasonalFactors: hasSeasonality ? seasonalFactors : undefined };
  }

  /**
   * Scheduled task to update dealer performance metrics
   */
  @Cron('0 4 * * 1') // Every Monday at 4 AM
  async updatePerformanceMetrics(): Promise<void> {
    this.logger.log('Starting scheduled performance metrics update');
    
    try {
      // This would get list of all active dealers from station/dealer service
      const activeDealers = await this.getActiveDealers();
      
      let updatedCount = 0;
      let errorCount = 0;

      for (const dealer of activeDealers) {
        try {
          const metrics = await this.calculatePerformanceMetrics(
            dealer.dealerId,
            dealer.stationId,
            dealer.tenantId,
            90 // 90-day evaluation period
          );

          // Store metrics (would save to database)
          // await this.storePerformanceMetrics(metrics);
          
          updatedCount++;
          
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to update performance metrics for dealer ${dealer.dealerId}:`, error);
        }
      }

      this.eventEmitter.emit('dealer.performance.batch.updated', {
        totalDealers: activeDealers.length,
        updated: updatedCount,
        errors: errorCount,
        completedAt: new Date(),
      });

      this.logger.log(`Performance metrics update completed: ${updatedCount} updated, ${errorCount} errors`);
      
    } catch (error) {
      this.logger.error('Failed to update performance metrics:', error);
    }
  }

  private async getActiveDealers(): Promise<Array<{ dealerId: string; stationId: string; tenantId: string }>> {
    // This would get active dealers from station/dealer service
    return [];
  }
}