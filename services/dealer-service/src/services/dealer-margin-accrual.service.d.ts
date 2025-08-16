import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerMarginAccrual, AccrualStatus } from '../entities/dealer-margin-accrual.entity';
export interface TransactionData {
    transactionId: string;
    stationId: string;
    productType: string;
    litresSold: number;
    exPumpPrice: number;
    transactionDate: Date;
    windowId: string;
}
export interface PricingWindowComponent {
    componentCode: string;
    name: string;
    category: 'dealer_margin' | 'omc_margin' | 'regulatory_margin' | 'levy' | 'other';
    unit: 'GHS_per_litre' | '%';
    rateValue: number;
    productType: string;
    effectiveFrom: Date;
    effectiveTo: Date;
}
export interface DailyMarginAccrualDto {
    stationId: string;
    dealerId: string;
    accrualDate: Date;
    transactions: TransactionData[];
    windowId: string;
    tenantId: string;
    processedBy?: string;
}
export interface MarginAccrualSummary {
    stationId: string;
    accrualDate: Date;
    windowId: string;
    totalLitresSold: number;
    grossMarginEarned: number;
    productBreakdown: Record<string, {
        litres: number;
        marginRate: number;
        marginAmount: number;
        exPumpPrice: number;
    }>;
    accrualStatus: AccrualStatus;
    createdAt: Date;
}
export interface WindowAccrualSummary {
    windowId: string;
    stationId: string;
    periodStart: Date;
    periodEnd: Date;
    totalDays: number;
    accruedDays: number;
    totalLitresSold: number;
    totalMarginAccrued: number;
    averageMarginPerLitre: number;
    productBreakdown: Record<string, {
        totalLitres: number;
        totalMargin: number;
        averageMarginRate: number;
        daysWithSales: number;
    }>;
    dailyAccruals: MarginAccrualSummary[];
}
export declare class DealerMarginAccrualService {
    private readonly marginAccrualRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(marginAccrualRepository: Repository<DealerMarginAccrual>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Process daily margin accrual for a dealer station
     * Blueprint: "Calculate daily dealer margins from sales"
     */
    processDailyMarginAccrual(dto: DailyMarginAccrualDto): Promise<DealerMarginAccrual[]>;
    /**
     * Process batch margin accruals from transaction service
     * Blueprint: Integration with daily delivery to track dealer margins
     */
    processBatchMarginAccruals(accrualData: DailyMarginAccrualDto[]): Promise<{
        successful: number;
        failed: number;
        errors: Array<{
            stationId: string;
            date: string;
            error: string;
        }>;
    }>;
    /**
     * Get daily margin accrual summary
     */
    getDailyMarginSummary(stationId: string, accrualDate: Date, tenantId: string): Promise<MarginAccrualSummary | null>;
    /**
     * Get window-level margin accrual summary
     */
    getWindowMarginSummary(stationId: string, windowId: string, tenantId: string): Promise<WindowAccrualSummary | null>;
    /**
     * Adjust margin accrual (for corrections or adjustments)
     */
    adjustMarginAccrual(accrualId: string, adjustmentAmount: number, adjustmentReason: string, tenantId: string, userId?: string): Promise<DealerMarginAccrual>;
    /**
     * Post margin accruals to general ledger
     */
    postAccrualsToGL(stationId: string, windowId: string, tenantId: string, userId?: string): Promise<{
        postedCount: number;
        totalAmount: number;
        journalEntryId: string;
    }>;
    /**
     * Get margin accruals for a period
     */
    getMarginAccruals(stationId: string, tenantId: string, options?: {
        fromDate?: Date;
        toDate?: Date;
        windowId?: string;
        productType?: string;
        status?: AccrualStatus;
        limit?: number;
    }): Promise<DealerMarginAccrual[]>;
    /**
     * Get margin accrual trends
     */
    getMarginAccrualTrends(stationId: string, tenantId: string, periodDays?: number): Promise<{
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
    }>;
    private groupTransactionsByProduct;
    private getPricingWindowComponents;
    private extractPBUBreakdown;
    private getPricingWindowDates;
    private groupAccrualsByDate;
    /**
     * Scheduled task to process daily margin accruals automatically
     */
    processAutomatedDailyAccruals(): Promise<void>;
    private getDailySalesData;
}
//# sourceMappingURL=dealer-margin-accrual.service.d.ts.map