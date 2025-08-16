import { DealerSettlementService } from '../services/dealer-settlement.service';
import { DealerLoanManagementService } from '../services/dealer-loan-management.service';
import { DealerMarginAccrualService } from '../services/dealer-margin-accrual.service';
import { DealerPerformanceService } from '../services/dealer-performance.service';
import { DealerSettlementStatementService } from '../services/dealer-settlement-statement.service';
import { DealerPaymentAutomationService } from '../services/dealer-payment-automation.service';
import { DealerSettlementStatus } from '../entities/dealer-settlement.entity';
import { RepaymentFrequency } from '../entities/dealer-loan.entity';
declare class CalculateSettlementDto {
    stationId: string;
    windowId: string;
    tenantId: string;
    userId?: string;
}
declare class CreateLoanDto {
    dealerId: string;
    stationId: string;
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: RepaymentFrequency;
    startDate: Date;
    loanPurpose: string;
    collateralDetails?: any;
    guarantorDetails?: any;
    tenantId: string;
    createdBy: string;
}
declare class ProcessMarginAccrualDto {
    stationId: string;
    dealerId: string;
    accrualDate: Date;
    transactions: TransactionDataDto[];
    windowId: string;
    tenantId: string;
    processedBy?: string;
}
declare class TransactionDataDto {
    transactionId: string;
    stationId: string;
    productType: string;
    litresSold: number;
    exPumpPrice: number;
    transactionDate: Date;
    windowId: string;
}
declare class GenerateStatementDto {
    settlementId: string;
    tenantId: string;
    template?: StatementTemplateDto;
}
declare class StatementTemplateDto {
    templateType: 'STANDARD' | 'DETAILED' | 'SUMMARY';
    format: 'PDF' | 'HTML' | 'EXCEL';
    language: 'EN' | 'FR';
    includeCharts: boolean;
    includeLoanDetails: boolean;
    includePerformanceMetrics: boolean;
    customFields?: Record<string, any>;
}
declare class ProcessAutomatedPaymentsDto {
    tenantId: string;
    maxBatchSize?: number;
    dryRun?: boolean;
}
export declare class DealerManagementController {
    private readonly settlementService;
    private readonly loanService;
    private readonly marginService;
    private readonly performanceService;
    private readonly statementService;
    private readonly paymentService;
    constructor(settlementService: DealerSettlementService, loanService: DealerLoanManagementService, marginService: DealerMarginAccrualService, performanceService: DealerPerformanceService, statementService: DealerSettlementStatementService, paymentService: DealerPaymentAutomationService);
    calculateSettlement(dto: CalculateSettlementDto): Promise<{
        calculation: import("../services/dealer-settlement.service").DealerMarginCalculation;
        settlement: import("../entities/dealer-settlement.entity").DealerSettlement;
        message: string;
    }>;
    approveSettlement(settlementId: string, tenantId: string, userId?: string): Promise<{
        settlement: import("../entities/dealer-settlement.entity").DealerSettlement;
        message: string;
    }>;
    processSettlementPayment(settlementId: string, body: {
        paymentReference: string;
        paymentMethod: string;
        tenantId: string;
        userId?: string;
    }): Promise<{
        settlement: import("../entities/dealer-settlement.entity").DealerSettlement;
        message: string;
    }>;
    getDealerSettlements(stationId: string, tenantId: string, status?: DealerSettlementStatus, fromDate?: string, toDate?: string, limit?: number): Promise<{
        settlements: import("../entities/dealer-settlement.entity").DealerSettlement[];
        count: number;
    }>;
    createLoan(dto: CreateLoanDto): Promise<{
        loan: import("../entities/dealer-loan.entity").DealerLoan;
        amortizationSchedule: import("../services/dealer-loan-management.service").AmortizationScheduleEntry[];
        message: string;
    }>;
    approveLoan(loanId: string, tenantId: string, userId?: string): Promise<{
        loan: import("../entities/dealer-loan.entity").DealerLoan;
        message: string;
    }>;
    getLoanPerformance(loanId: string, tenantId: string): Promise<{
        metrics: import("../services/dealer-loan-management.service").LoanPerformanceMetrics;
        message: string;
    }>;
    getActiveLoans(stationId: string, tenantId: string, dealerId?: string): Promise<{
        loans: import("../entities/dealer-loan.entity").DealerLoan[];
        count: number;
    }>;
    getMonthlyObligation(stationId: string, tenantId: string): Promise<{
        obligation: {
            totalMonthlyInstallment: number;
            loanBreakdown: Array<{
                loanId: string;
                installmentAmount: number;
                nextDueDate: Date;
                daysOverdue: number;
            }>;
        };
        message: string;
    }>;
    processDailyMarginAccrual(dto: ProcessMarginAccrualDto): Promise<{
        accruals: import("../entities/dealer-margin-accrual.entity").DealerMarginAccrual[];
        count: number;
        message: string;
    }>;
    getDailyMarginSummary(stationId: string, accrualDate: string, tenantId: string): Promise<{
        summary: import("../services/dealer-margin-accrual.service").MarginAccrualSummary | null;
        message: string;
    }>;
    getWindowMarginSummary(stationId: string, windowId: string, tenantId: string): Promise<{
        summary: import("../services/dealer-margin-accrual.service").WindowAccrualSummary | null;
        message: string;
    }>;
    getMarginTrends(stationId: string, tenantId: string, periodDays?: number): Promise<{
        trends: {
            dailyTrends: Array<{
                date: string;
                totalLitres: number;
                totalMargin: number;
                marginPerLitre: number;
                productMix: Record<string, number>;
            }>;
            summary: {
                totalDays: number;
                averageDailyLitres: number;
                averageDailyMargin: number;
                averageMarginPerLitre: number;
                bestDay: {
                    date: string;
                    margin: number;
                };
                worstDay: {
                    date: string;
                    margin: number;
                };
            };
        };
        message: string;
    }>;
    adjustMarginAccrual(accrualId: string, body: {
        adjustmentAmount: number;
        adjustmentReason: string;
        tenantId: string;
        userId?: string;
    }): Promise<{
        accrual: import("../entities/dealer-margin-accrual.entity").DealerMarginAccrual;
        message: string;
    }>;
    getPerformanceMetrics(dealerId: string, stationId: string, tenantId: string, evaluationPeriodDays?: number): Promise<{
        metrics: import("../services/dealer-performance.service").DealerPerformanceMetrics;
        message: string;
    }>;
    getCreditRiskModel(dealerId: string, stationId: string, tenantId: string): Promise<{
        model: import("../services/dealer-performance.service").CreditRiskModel;
        message: string;
    }>;
    getPerformanceTrends(dealerId: string, stationId: string, tenantId: string, metricType: 'SALES_VOLUME' | 'MARGIN_EARNED' | 'PAYMENT_RELIABILITY' | 'DEBT_RATIO', periodDays?: number): Promise<{
        trends: import("../services/dealer-performance.service").PerformanceTrend;
        message: string;
    }>;
    getPerformanceRecommendations(dealerId: string, stationId: string, tenantId: string): Promise<{
        recommendations: {
            immediate: string[];
            shortTerm: string[];
            longTerm: string[];
            creditActions: string[];
        };
        message: string;
    }>;
    generateStatement(dto: GenerateStatementDto): Promise<{
        statement: import("../services/dealer-settlement-statement.service").SettlementStatementDto;
        message: string;
    }>;
    generateBatchStatements(body: {
        settlementIds: string[];
        tenantId: string;
        template?: StatementTemplateDto;
    }): Promise<{
        statements: import("../services/dealer-settlement-statement.service").SettlementStatementDto[];
        errors: {
            settlementId: string;
            error: string;
        }[];
        successCount: number;
        errorCount: number;
        message: string;
    }>;
    processAutomatedPayments(dto: ProcessAutomatedPaymentsDto): Promise<{
        message: string;
        batchesCreated: import("../services/dealer-payment-automation.service").PaymentBatch[];
        totalAmount: number;
        totalSettlements: number;
        skippedSettlements: Array<{
            settlementId: string;
            reason: string;
        }>;
    }>;
    executePaymentBatch(batchId: string, body: {
        tenantId: string;
        userId: string;
    }): Promise<{
        message: string;
        batchId: string;
        status: "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED";
        successfulPayments: number;
        failedPayments: number;
        totalAmount: number;
        errors: Array<{
            settlementId: string;
            error: string;
        }>;
    }>;
    createPaymentInstructions(body: {
        settlementIds: string[];
        tenantId: string;
        priority?: 'HIGH' | 'NORMAL' | 'LOW';
    }): Promise<{
        instructions: import("../services/dealer-payment-automation.service").PaymentInstruction[];
        count: number;
        message: string;
    }>;
    generatePaymentReport(tenantId: string, periodStart: string, periodEnd: string): Promise<{
        report: import("../services/dealer-payment-automation.service").PaymentReport;
        message: string;
    }>;
    retryFailedPayments(batchId: string, body: {
        tenantId: string;
        userId: string;
    }): Promise<{
        message: string;
        retriedCount: number;
        successfulRetries: number;
        stillFailedCount: number;
        errors: Array<{
            settlementId: string;
            error: string;
        }>;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        version: string;
        features: {
            settlements: string;
            loans: string;
            margins: string;
            performance: string;
            statements: string;
            payments: string;
        };
    }>;
}
export {};
//# sourceMappingURL=dealer-management.controller.d.ts.map