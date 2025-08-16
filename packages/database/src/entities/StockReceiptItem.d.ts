import { BaseEntity } from './BaseEntity';
import { FuelType } from '@omc-erp/shared-types';
import { StockReceipt } from './StockReceipt';
import { Tank } from './Tank';
export declare class StockReceiptItem extends BaseEntity {
    stockReceiptId: string;
    tankId: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    temperature: number;
    density: number;
    stockReceipt: StockReceipt;
    tank: Tank;
}
//# sourceMappingURL=StockReceiptItem.d.ts.map