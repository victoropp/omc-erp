import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface SalesTransactionData {
    transactionId: string;
    stationId: string;
    productType: string;
    litresSold: number;
    exPumpPrice: number;
    transactionDate: Date;
    windowId: string;
}
export interface DealerMarginIntegrationDto {
    stationId: string;
    dealerId: string;
    accrualDate: Date;
    transactions: SalesTransactionData[];
    windowId: string;
    tenantId: string;
    processedBy?: string;
}
export declare class DealerMarginIntegrationService {
    private readonly httpService;
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly dealerServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService, eventEmitter: EventEmitter2);
    /**
     * Process daily sales data and send to dealer service for margin accrual
     */
    processDailySalesForMarginAccrual(stationId: string, salesDate: Date, tenantId: string): Promise<void>;
    /**
     * Listen for daily delivery completion events
     */
    handleDailyDeliveryCompleted(payload: any): Promise<void>;
    /**
     * Listen for sales transaction events
     */
    handleSalesTransactionCompleted(payload: any): Promise<void>;
    /**
     * Listen for pricing window changes
     */
    handlePricingWindowChanged(payload: any): Promise<void>;
    /**
     * Process batch margin accruals for multiple stations
     */
    processBatchMarginAccruals(stationDates: Array<{
        stationId: string;
        date: Date;
    }>, tenantId: string): Promise<{
        successful: number;
        failed: number;
        errors: Array<{
            stationId: string;
            date: string;
            error: string;
        }>;
    }>;
    /**
     * Get reconciliation report between deliveries and margin accruals
     */
    getMarginReconciliationReport(stationId: string, fromDate: Date, toDate: Date, tenantId: string): Promise<{
        period: {
            from: Date;
            to: Date;
        };
        stationId: string;
        summary: {
            deliveryDays: number;
            marginAccrualDays: number;
            matchingDays: number;
            discrepancyDays: number;
        };
        discrepancies: Array<{
            date: Date;
            deliveryVolume: number;
            accrualVolume: number;
            variance: number;
            possibleReasons: string[];
        }>;
        recommendations: string[];
    }>;
    private getDailySalesData;
    private aggregateTransactions;
    private getCurrentPricingWindow;
    private sendToDealarService;
    private queueTransactionForProcessing;
    private triggerMarginRecalculation;
    private getDeliveryData;
    private getMarginAccrualData;
    private reconcileDeliveryWithAccruals;
    private generateReconciliationRecommendations;
    /**
     * Health check for the integration service
     */
    healthCheck(): Promise<{
        status: string;
        dealerServiceConnection: boolean;
        lastProcessedDate: Date | null;
        pendingTransactions: number;
    }>;
}
//# sourceMappingURL=dealer-margin-integration.service.d.ts.map