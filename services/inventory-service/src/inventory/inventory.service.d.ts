import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
export interface StockReceiptData {
    stationId: string;
    supplierId: string;
    deliveryNoteNumber: string;
    waybillNumber: string;
    truckNumber: string;
    driverName: string;
    driverLicense: string;
    items: StockReceiptItemData[];
    temperatureReadings?: any;
    qualityCertificates?: any;
}
export interface StockReceiptItemData {
    productId: string;
    tankId?: string;
    orderedQuantity: number;
    deliveredQuantity: number;
    unitCost: number;
    batchNumber?: string;
    expiryDate?: Date;
    temperatureCelsius?: number;
    densityReading?: number;
}
export interface TankReadingData {
    tankId: string;
    stationId: string;
    productId: string;
    levelPercentage: number;
    volumeLiters: number;
    temperatureCelsius?: number;
    waterLevelMm?: number;
    densityReading?: number;
    sensorStatus: 'ONLINE' | 'OFFLINE' | 'ERROR';
}
export interface StockTakeData {
    stationId: string;
    details: StockTakeDetailData[];
}
export interface StockTakeDetailData {
    productId: string;
    tankId?: string;
    physicalQuantity: number;
    notes?: string;
}
export declare class InventoryService {
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    server: Server;
    constructor(dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Process stock receipt (delivery)
     */
    processStockReceipt(data: StockReceiptData): Promise<any>;
    /**
     * Process fuel sale and update inventory
     */
    processFuelSale(transactionData: any): Promise<void>;
    /**
     * Process IoT tank reading
     */
    processTankReading(reading: TankReadingData): Promise<void>;
    /**
     * Perform stock take (physical count)
     */
    performStockTake(data: StockTakeData): Promise<any>;
    /**
     * Get real-time inventory dashboard
     */
    getInventoryDashboard(stationId?: string): Promise<any>;
    /**
     * Schedule automatic reorder processing
     */
    processAutomaticReorders(): Promise<void>;
    /**
     * Create inventory movement record
     */
    private createInventoryMovement;
    /**
     * Update stock level
     */
    private updateStockLevel;
    /**
     * Check and create alerts for tank readings
     */
    private checkTankAlerts;
    /**
     * Helper methods
     */
    private generateReceiptNumber;
    private generateStockTakeNumber;
    private checkLowStock;
    private checkReorderLevel;
    private createReorderAlert;
    private createInventoryAdjustment;
    private createInventoryJournalEntry;
}
//# sourceMappingURL=inventory.service.d.ts.map