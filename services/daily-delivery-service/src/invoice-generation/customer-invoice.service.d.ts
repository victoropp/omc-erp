import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
import { GenerateCustomerInvoiceDto } from '../daily-delivery/dto/invoice-generation.dto';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
interface ARInvoice {
    id?: string;
    tenantId: string;
    customerId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    amountDue: number;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    contractAssetAmount: number;
    revenueRecognitionDate: Date;
    revenueRecognitionAmount: number;
    lineItems: ARInvoiceLineItem[];
    status: string;
    createdBy: string;
}
interface ARInvoiceLineItem {
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
export declare class CustomerInvoiceService {
    private readonly httpService;
    private readonly eventEmitter;
    private readonly validationService;
    private readonly logger;
    constructor(httpService: HttpService, eventEmitter: EventEmitter2, validationService: DeliveryValidationService);
    generateCustomerInvoice(delivery: DailyDelivery, generateDto: GenerateCustomerInvoiceDto): Promise<ARInvoice>;
    private getCustomerInfo;
    private generateInvoiceNumber;
    private calculateDueDate;
    private calculateCustomerPrice;
    private calculateCustomerTaxes;
    private createCustomerInvoiceLineItems;
    private getSalesAccountCode;
    private getCOGSAccountCode;
    private calculateDeliveryCharge;
    private createARInvoice;
    private generateCustomerInvoiceJournalEntries;
    private getInventoryAccountCode;
    private updateDeliveryWithInvoiceInfo;
    getCustomerInvoice(invoiceId: string): Promise<ARInvoice>;
    cancelCustomerInvoice(invoiceId: string, reason: string, userId: string): Promise<void>;
    generateDeliveryReceipt(delivery: DailyDelivery): Promise<any>;
}
export {};
//# sourceMappingURL=customer-invoice.service.d.ts.map