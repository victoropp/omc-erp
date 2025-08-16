import { BaseEntity } from './BaseEntity';
import { InvoiceStatus, Currency } from '@omc-erp/shared-types';
import { Customer } from './Customer';
import { Station } from './Station';
import { User } from './User';
import { InvoiceLineItem } from './InvoiceLineItem';
export declare class Invoice extends BaseEntity {
    tenantId: string;
    invoiceNumber: string;
    customerId: string;
    stationId: string;
    issueDate: Date;
    dueDate: Date;
    currency: Currency;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    paymentTerms: number;
    lateFeeRate: number;
    status: InvoiceStatus;
    notes: string;
    createdBy: string;
    customer: Customer;
    station: Station;
    creator: User;
    lineItems: InvoiceLineItem[];
    generateInvoiceNumber(): void;
    calculateAmountDue(): void;
    isOverdue(): boolean;
    isPaid(): boolean;
    markAsPaid(): void;
    calculateLateFee(): number;
    recalculateTotals(): void;
}
//# sourceMappingURL=Invoice.d.ts.map