import { BaseEntity } from './BaseEntity';
import { FuelType } from '@omc-erp/shared-types';
import { Invoice } from './Invoice';
export declare class InvoiceLineItem extends BaseEntity {
    invoiceId: string;
    description: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxRate: number;
    taxAmount: number;
    lineOrder: number;
    invoice: Invoice;
    calculateAmounts(): void;
    getTotalAmount(): number;
}
//# sourceMappingURL=InvoiceLineItem.d.ts.map