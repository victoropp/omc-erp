import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerSettlement, DealerSettlementStatus } from '../entities/dealer-settlement.entity';
export interface PaymentRule {
    ruleId: string;
    ruleName: string;
    description: string;
    isActive: boolean;
    priority: number;
    conditions: {
        minSettlementAmount: number;
        maxSettlementAmount: number;
        dealerCreditRating: string[];
        settlementStatus: DealerSettlementStatus[];
        daysFromApproval: number;
        requiresApproval: boolean;
        blacklistCheck: boolean;
    };
    paymentConfig: {
        paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH';
        processingDelay: number;
        batchPayment: boolean;
        approvalRequired: boolean;
        approvalWorkflow: string;
    };
    riskControls: {
        dailyLimit: number;
        monthlyLimit: number;
        velocityCheck: boolean;
        duplicateCheck: boolean;
        fraudCheck: boolean;
    };
    tenantId: string;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
}
export interface PaymentBatch {
    batchId: string;
    batchNumber: string;
    batchDate: Date;
    totalAmount: number;
    totalSettlements: number;
    paymentMethod: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    settlements: Array<{
        settlementId: string;
        stationId: string;
        dealerId: string;
        amount: number;
        paymentReference: string;
        bankDetails: {
            accountName: string;
            accountNumber: string;
            bankName: string;
            bankCode: string;
        };
    }>;
    processingDetails?: {
        startedAt: Date;
        completedAt?: Date;
        processedBy: string;
        bankReference?: string;
        confirmationCode?: string;
    };
    tenantId: string;
}
export interface PaymentInstruction {
    instructionId: string;
    settlementId: string;
    paymentAmount: number;
    paymentMethod: string;
    recipientDetails: {
        name: string;
        accountNumber: string;
        bankCode: string;
        reference: string;
    };
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    scheduledDate: Date;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
    tenantId: string;
}
export interface PaymentReport {
    reportId: string;
    reportDate: Date;
    periodStart: Date;
    periodEnd: Date;
    summary: {
        totalPayments: number;
        totalAmount: number;
        successfulPayments: number;
        failedPayments: number;
        pendingPayments: number;
        averageProcessingTime: number;
    };
    byPaymentMethod: Record<string, {
        count: number;
        amount: number;
        successRate: number;
    }>;
    byDealer: Array<{
        dealerId: string;
        stationId: string;
        paymentsCount: number;
        totalAmount: number;
        averageAmount: number;
        successRate: number;
    }>;
    failureAnalysis: {
        reasonBreakdown: Record<string, number>;
        topFailedDealers: Array<{
            dealerId: string;
            failureCount: number;
            commonReason: string;
        }>;
    };
    compliance: {
        slaCompliance: number;
        averageDelay: number;
        escalations: number;
    };
    recommendations: string[];
}
export declare class DealerPaymentAutomationService {
    private readonly settlementRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(settlementRepository: Repository<DealerSettlement>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Process automated payments for approved settlements
     * Blueprint: "Automate dealer payment processing"
     */
    processAutomatedPayments(tenantId: string, maxBatchSize?: number, dryRun?: boolean): Promise<{
        batchesCreated: PaymentBatch[];
        totalAmount: number;
        totalSettlements: number;
        skippedSettlements: Array<{
            settlementId: string;
            reason: string;
        }>;
    }>;
    /**
     * Execute payment batch
     */
    executePaymentBatch(batchId: string, tenantId: string, userId: string): Promise<{
        batchId: string;
        status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
        successfulPayments: number;
        failedPayments: number;
        totalAmount: number;
        errors: Array<{
            settlementId: string;
            error: string;
        }>;
    }>;
    /**
     * Create payment instructions for manual processing
     */
    createPaymentInstructions(settlementIds: string[], tenantId: string, priority?: 'HIGH' | 'NORMAL' | 'LOW'): Promise<PaymentInstruction[]>;
    /**
     * Generate payment report
     */
    generatePaymentReport(tenantId: string, periodStart: Date, periodEnd: Date): Promise<PaymentReport>;
    /**
     * Retry failed payments
     */
    retryFailedPayments(batchId: string, tenantId: string, userId: string): Promise<{
        retriedCount: number;
        successfulRetries: number;
        stillFailedCount: number;
        errors: Array<{
            settlementId: string;
            error: string;
        }>;
    }>;
    private getEligibleSettlements;
    private getActivePaymentRules;
    private applyPaymentRules;
    private checkRuleConditions;
    private checkRiskControls;
    private groupSettlementsIntoBatches;
    private createPaymentBatch;
    private processPayment;
    private getTodayPaymentTotal;
    private getMonthlyPaymentTotal;
    private checkForDuplicatePayment;
    private checkForFraudIndicators;
    private getPaymentBatch;
    private savePaymentBatch;
    private updatePaymentBatchStatus;
    private savePaymentInstructions;
    private getPaymentsForPeriod;
    private getFailedPaymentsFromBatch;
    private updatePaymentStatus;
    private calculatePaymentSummary;
    private groupPaymentsByMethod;
    private groupPaymentsByDealer;
    private analyzePaymentFailures;
    private calculateComplianceMetrics;
    private generateRecommendations;
    /**
     * Scheduled task for automated payment processing
     * Blueprint: runs automatically based on configured schedule
     */
    scheduledAutomatedPayments(): Promise<void>;
    private getActiveTenants;
}
//# sourceMappingURL=dealer-payment-automation.service.d.ts.map