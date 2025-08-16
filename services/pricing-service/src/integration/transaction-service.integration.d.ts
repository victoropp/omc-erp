import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface FuelTransaction {
    transactionId: string;
    transactionNumber: string;
    stationId: string;
    dealerId: string;
    productId: string;
    volume: number;
    unitPrice: number;
    totalAmount: number;
    transactionDate: Date;
    paymentMethod: string;
    paymentReference?: string;
    customerId?: string;
    vehicleNumber?: string;
    pumpId: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
    priceBreakdown: {
        basePrice: number;
        taxes: number;
        levies: number;
        margins: number;
    };
    createdAt: Date;
}
export interface TransactionSummary {
    stationId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    summary: {
        totalTransactions: number;
        totalVolume: number;
        totalRevenue: number;
        averageTransactionSize: number;
        productBreakdown: {
            [productId: string]: {
                volume: number;
                revenue: number;
                transactions: number;
            };
        };
    };
}
export interface DeliveryConsignment {
    consignmentId: string;
    deliveryNumber: string;
    depotId: string;
    stationId: string;
    productId: string;
    vehicleId: string;
    driverId: string;
    litresLoaded: number;
    litresReceived?: number;
    loadingTemp?: number;
    receivingTemp?: number;
    dispatchDatetime: Date;
    arrivalDatetime?: Date;
    routeId?: string;
    kmPlanned?: number;
    kmActual?: number;
    gpsTraceId?: string;
    waybillNumber?: string;
    sealNumbers?: string;
    status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
    varianceLitres?: number;
    varianceReason?: string;
}
export interface PaymentTransaction {
    paymentId: string;
    paymentReference: string;
    dealerId: string;
    stationId?: string;
    amount: number;
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK';
    paymentDate: Date;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    description: string;
    allocations?: Array<{
        settlementId?: string;
        loanId?: string;
        amount: number;
        description: string;
    }>;
}
export declare class TransactionServiceIntegration {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Get fuel transactions for a station and period
     */
    getStationTransactions(stationId: string, startDate: Date, endDate: Date, productId?: string): Promise<FuelTransaction[]>;
    /**
     * Get transaction summary for volume calculation
     */
    getTransactionSummary(stationId: string, startDate: Date, endDate: Date): Promise<TransactionSummary | null>;
    /**
     * Get delivery consignments for UPPF claims
     */
    getDeliveryConsignments(stationId?: string, startDate?: Date, endDate?: Date, status?: string): Promise<DeliveryConsignment[]>;
    /**
     * Get specific delivery consignment by ID
     */
    getDeliveryConsignmentById(consignmentId: string): Promise<DeliveryConsignment | null>;
    /**
     * Update delivery consignment status
     */
    updateDeliveryStatus(consignmentId: string, status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED', notes?: string): Promise<void>;
    /**
     * Record dealer payment transaction
     */
    recordPaymentTransaction(payment: {
        dealerId: string;
        stationId?: string;
        amount: number;
        paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK';
        paymentReference: string;
        description: string;
        allocations?: Array<{
            settlementId?: string;
            loanId?: string;
            amount: number;
            description: string;
        }>;
        recordedBy: string;
    }): Promise<PaymentTransaction>;
    /**
     * Get dealer payment transactions
     */
    getDealerPaymentTransactions(dealerId: string, startDate?: Date, endDate?: Date): Promise<PaymentTransaction[]>;
    /**
     * Get transaction analytics for pricing decisions
     */
    getTransactionAnalytics(startDate: Date, endDate: Date, groupBy?: 'station' | 'product' | 'region'): Promise<Array<{
        groupKey: string;
        totalVolume: number;
        totalRevenue: number;
        transactionCount: number;
        averageUnitPrice: number;
        marketShare: number;
    }>>;
    /**
     * Get fuel inventory movements for stock reconciliation
     */
    getInventoryMovements(stationId: string, startDate: Date, endDate: Date): Promise<Array<{
        movementId: string;
        stationId: string;
        productId: string;
        movementType: 'DELIVERY' | 'SALE' | 'ADJUSTMENT' | 'LOSS';
        quantity: number;
        balanceBefore: number;
        balanceAfter: number;
        reference: string;
        timestamp: Date;
    }>>;
    /**
     * Process bulk fuel transactions for settlement calculation
     */
    processBulkTransactions(transactions: Array<{
        stationId: string;
        productId: string;
        volume: number;
        unitPrice: number;
        transactionDate: Date;
        dealerId: string;
    }>): Promise<{
        processed: number;
        failed: number;
        errors: Array<{
            index: number;
            error: string;
        }>;
    }>;
    /**
     * Get transaction dispute records
     */
    getTransactionDisputes(stationId?: string, status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'): Promise<Array<{
        disputeId: string;
        transactionId: string;
        stationId: string;
        dealerId: string;
        disputeType: string;
        description: string;
        amount: number;
        status: string;
        reportedDate: Date;
        resolvedDate?: Date;
    }>>;
    /**
     * Health check for transaction service
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        lastChecked: Date;
        dailyTransactions?: number;
    }>;
    /**
     * Get real-time transaction metrics
     */
    getRealTimeMetrics(): Promise<{
        activeTransactions: number;
        totalVolumeToday: number;
        totalRevenueToday: number;
        stationsOnline: number;
        averageTransactionValue: number;
        topSellingProduct: string;
    }>;
    /**
     * Validate transaction data integrity
     */
    validateTransactionIntegrity(stationId: string, date: Date): Promise<{
        isValid: boolean;
        discrepancies: Array<{
            type: string;
            description: string;
            impact: number;
            severity: 'LOW' | 'MEDIUM' | 'HIGH';
        }>;
        totalVariance: number;
    }>;
}
//# sourceMappingURL=transaction-service.integration.d.ts.map