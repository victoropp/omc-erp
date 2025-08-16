import { BaseEntity } from './BaseEntity';
import { ReceiptStatus, QualityStatus, Currency } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Supplier } from './Supplier';
import { Vehicle } from './Vehicle';
import { Driver } from './Driver';
import { StockReceiptItem } from './StockReceiptItem';
export declare class StockReceipt extends BaseEntity {
    tenantId: string;
    stationId: string;
    supplierId: string;
    vehicleId: string;
    driverId: string;
    receiptNumber: string;
    deliveryNoteNumber: string;
    purchaseOrderId: string;
    totalQuantity: number;
    totalValue: number;
    currency: Currency;
    qualityCertificate: string;
    temperatureRecorded: number;
    densityRecorded: number;
    qualityStatus: QualityStatus;
    qualityNotes: string;
    photos: string[];
    documents: string[];
    scheduledDeliveryTime: Date;
    actualDeliveryTime: Date;
    receiptConfirmedAt: Date;
    status: ReceiptStatus;
    notes: string;
    createdBy: string;
    station: Station;
    supplier: Supplier;
    vehicle: Vehicle;
    driver: Driver;
    items: StockReceiptItem[];
}
//# sourceMappingURL=StockReceipt.d.ts.map