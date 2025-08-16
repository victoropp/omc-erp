import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface Station {
    id: string;
    stationCode: string;
    stationName: string;
    dealerId: string;
    dealerName: string;
    location: {
        address: string;
        city: string;
        region: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    equipmentInfo: {
        tankCapacity: {
            [productCode: string]: number;
        };
        pumps: Array<{
            pumpId: string;
            productCode: string;
            isActive: boolean;
        }>;
    };
    operationalInfo: {
        operatingHours: string;
        lastRestockDate: Date;
        currentStock: {
            [productCode: string]: number;
        };
    };
    createdAt: Date;
    updatedAt?: Date;
}
export interface StationPriceUpdate {
    stationId: string;
    productId: string;
    windowId: string;
    exPumpPrice: number;
    effectiveDate: Date;
    priceBreakdown: {
        exRefineryPrice: number;
        taxes: number;
        margins: number;
        dealerMargin: number;
    };
}
export interface StationSalesData {
    stationId: string;
    productId: string;
    salesDate: Date;
    volumeSold: number;
    totalRevenue: number;
    transactionCount: number;
}
export interface StationInventory {
    stationId: string;
    productId: string;
    currentStock: number;
    tankCapacity: number;
    lastRestockDate: Date;
    minimumLevel: number;
    restockRequired: boolean;
}
export declare class StationServiceIntegration {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Get all active stations
     */
    getActiveStations(): Promise<Station[]>;
    /**
     * Get station by ID
     */
    getStationById(stationId: string): Promise<Station | null>;
    /**
     * Get stations by dealer ID
     */
    getStationsByDealer(dealerId: string): Promise<Station[]>;
    /**
     * Update station prices for a pricing window
     */
    updateStationPrices(priceUpdates: StationPriceUpdate[]): Promise<{
        successful: number;
        failed: number;
        errors: Array<{
            stationId: string;
            error: string;
        }>;
    }>;
    /**
     * Get station sales data for a period
     */
    getStationSalesData(stationId: string, startDate: Date, endDate: Date, productId?: string): Promise<StationSalesData[]>;
    /**
     * Get station inventory levels
     */
    getStationInventory(stationId: string): Promise<StationInventory[]>;
    /**
     * Get stations requiring restock
     */
    getStationsRequiringRestock(): Promise<Array<{
        stationId: string;
        stationName: string;
        productId: string;
        currentStock: number;
        minimumLevel: number;
        daysUntilEmpty: number;
    }>>;
    /**
     * Get station performance metrics
     */
    getStationPerformanceMetrics(stationId: string, startDate: Date, endDate: Date): Promise<{
        totalVolumeSold: {
            [productCode: string]: number;
        };
        totalRevenue: number;
        averageDailySales: number;
        topSellingProduct: string;
        performanceRating: string;
        complianceScore: number;
    } | null>;
    /**
     * Update station status
     */
    updateStationStatus(stationId: string, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE', reason?: string): Promise<void>;
    /**
     * Get stations by region
     */
    getStationsByRegion(regionName: string): Promise<Station[]>;
    /**
     * Publish price change notification to stations
     */
    publishPriceChangeNotification(notification: {
        windowId: string;
        effectiveDate: Date;
        stationIds: string[];
        priceChanges: Array<{
            productId: string;
            oldPrice: number;
            newPrice: number;
            percentageChange: number;
        }>;
        message?: string;
    }): Promise<{
        notifiedStations: number;
        failedNotifications: string[];
    }>;
    /**
     * Health check for station service
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        lastChecked: Date;
        stationsOnline?: number;
    }>;
    /**
     * Get station count by status
     */
    getStationCountByStatus(): Promise<{
        active: number;
        inactive: number;
        maintenance: number;
        total: number;
    }>;
    private getFallbackStations;
}
//# sourceMappingURL=station-service.integration.d.ts.map