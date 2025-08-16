import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
interface APInvoice {
    id?: string;
    tenantId: string;
    vendorId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    amountDue: number;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    withholdingTaxAmount: number;
    vatAmount: number;
    customsDutyAmount: number;
    contractLiabilityAmount: number;
    revenueRecognitionDate: Date;
    lineItems: APInvoiceLineItem[];
    status: string;
    createdBy: string;
}
interface APInvoiceLineItem {
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    accountCode: string;
    costCenter?: string;
    dimension1?: string;
    dimension2?: string;
}
export declare class SupplierInvoiceService {
    private readonly httpService;
    private readonly eventEmitter;
    private readonly validationService;
    private readonly logger;
    constructor(httpService: HttpService, eventEmitter: EventEmitter2, validationService: DeliveryValidationService);
    generateSupplierInvoice(delivery: DailyDelivery, generateDto: GenerateSupplierInvoiceDto): Promise<APInvoice>;
    private getVendorInfo;
    private generateInvoiceNumber;
    private calculateDueDate;
    private calculateWithholdingTax;
    private calculateVAT;
    private createSupplierInvoiceLineItems;
    private getInventoryAccountCode;
    private createAPInvoice;
    private generateSupplierInvoiceJournalEntries;
    private updateDeliveryWithInvoiceInfo;
    getSupplierInvoice(invoiceId: string): Promise<APInvoice>;
    cancelSupplierInvoice(invoiceId: string, reason: string, userId: string): Promise<void>;
}
export {};
//# sourceMappingURL=supplier-invoice.service.d.ts.map