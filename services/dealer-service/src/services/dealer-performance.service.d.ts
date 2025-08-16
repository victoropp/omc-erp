import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerLoan } from '../entities/dealer-loan.entity';
import { DealerSettlement } from '../entities/dealer-settlement.entity';
import { DealerMarginAccrual } from '../entities/dealer-margin-accrual.entity';
export interface DealerPerformanceMetrics {
    dealerId: string;
    stationId: string;
    evaluationPeriod: {
        fromDate: Date;
        toDate: Date;
        periodDays: number;
    };
    salesPerformance: {
        totalLitresSold: number;
        averageDailyVolume: number;
        volumeTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
        bestSellingProduct: string;
        salesConsistency: number;
        daysWithSales: number;
        operationalDays: number;
    };
    marginPerformance: {
        totalMarginEarned: number;
        averageMarginPerLitre: number;
        marginEfficiency: number;
        marginTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
        bestMarginProduct: string;
        marginConsistency: number;
    };
    settlementPerformance: {
        totalSettlements: number;
        totalNetReceived: number;
        averageSettlementAmount: number;
        settlementFrequency: number;
        onTimeSettlements: number;
        delayedSettlements: number;
        disputedSettlements: number;
    };
    financialHealth: {
        activeLoans: number;
        totalOutstandingDebt: number;
        debtToRevenueRatio: number;
        monthlyDebtService: number;
        debtServiceCoverageRatio: number;
        creditUtilization: number;
        liquidityRatio: number;
    };
    paymentBehavior: {
        totalPaymentsMade: number;
        onTimePayments: number;
        latePayments: number;
        missedPayments: number;
        paymentReliability: number;
        averagePaymentDelay: number;
        paymentTrend: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
    };
    riskAssessment: {
        overallRiskScore: number;
        riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        riskFactors: string[];
        probabilityOfDefault: number;
        recommendedCreditLimit: number;
        requiresIntervention: boolean;
    };
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
    currentPosition: {
        outstandingDebt: number;
        monthlyIncome: number;
        monthlyExpenses: number;
        netCashFlow: number;
        liquidAssets: number;
        collateralValue: number;
    };
    riskFactors: {
        industryRisk: number;
        locationRisk: number;
        concentrationRisk: number;
        operationalRisk: number;
        financialRisk: number;
        macroeconomicRisk: number;
    };
    creditScoreComponents: {
        paymentHistory: {
            score: number;
            weight: number;
        };
        debtToIncomeRatio: {
            score: number;
            weight: number;
        };
        businessStability: {
            score: number;
            weight: number;
        };
        profitability: {
            score: number;
            weight: number;
        };
        collateral: {
            score: number;
            weight: number;
        };
        industryFactors: {
            score: number;
            weight: number;
        };
    };
    creditScore: number;
    probabilityOfDefault: number;
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
    trendStrength: number;
    seasonality?: {
        hasSeasonality: boolean;
        seasonalFactors?: number[];
    };
}
export declare class DealerPerformanceService {
    private readonly loanRepository;
    private readonly settlementRepository;
    private readonly marginAccrualRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(loanRepository: Repository<DealerLoan>, settlementRepository: Repository<DealerSettlement>, marginAccrualRepository: Repository<DealerMarginAccrual>, eventEmitter: EventEmitter2);
    /**
     * Calculate comprehensive dealer performance metrics
     * Blueprint: "Track dealer performance metrics"
     */
    calculatePerformanceMetrics(dealerId: string, stationId: string, tenantId: string, evaluationPeriodDays?: number): Promise<DealerPerformanceMetrics>;
    /**
     * Generate credit risk model and scoring
     * Blueprint: "Implement credit risk scoring for dealers"
     */
    generateCreditRiskModel(dealerId: string, stationId: string, tenantId: string): Promise<CreditRiskModel>;
    /**
     * Get performance trends for a dealer
     */
    getPerformanceTrends(dealerId: string, stationId: string, tenantId: string, metricType: 'SALES_VOLUME' | 'MARGIN_EARNED' | 'PAYMENT_RELIABILITY' | 'DEBT_RATIO', periodDays?: number): Promise<PerformanceTrend>;
    /**
     * Generate performance recommendations
     */
    generateRecommendations(dealerId: string, stationId: string, tenantId: string): Promise<{
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        creditActions: string[];
    }>;
    private calculateSalesPerformance;
    private calculateMarginPerformance;
    private calculateSettlementPerformance;
    private calculateFinancialHealth;
    private calculatePaymentBehavior;
    private calculateRiskAssessment;
    private calculatePerformanceRating;
    private getMarginAccruals;
    private getSettlements;
    private getLoans;
    private getLoanPayments;
    private groupAccrualsByDate;
    private calculateCoefficientOfVariation;
    private calculateVolumeTrend;
    private calculateMarginTrend;
    private calculateHistoricalMetrics;
    private calculateCurrentFinancialPosition;
    private assessRiskFactors;
    private calculateCreditScoreComponents;
    private calculateCreditScore;
    private calculateProbabilityOfDefault;
    private calculateRecommendedCreditLimit;
    private calculateInterestRatePremium;
    private calculateRequiredCollateral;
    private getCreditRiskCategory;
    private calculateMonthlyVolumes;
    private calculateMonthlyMargins;
    private calculateMonthlySettlements;
    private getSalesVolumeTrend;
    private getMarginEarnedTrend;
    private getPaymentReliabilityTrend;
    private getDebtRatioTrend;
    private analyzeTrend;
    private detectSeasonality;
    /**
     * Scheduled task to update dealer performance metrics
     */
    updatePerformanceMetrics(): Promise<void>;
    private getActiveDealers;
}
//# sourceMappingURL=dealer-performance.service.d.ts.map