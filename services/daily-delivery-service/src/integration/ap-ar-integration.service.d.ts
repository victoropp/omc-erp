import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';
export interface InvoiceGenerationRequest {
    deliveryIds: string[];
    generationType: 'SUPPLIER' | 'CUSTOMER' | 'BOTH';
    approvalRequired: boolean;
    invoiceDate?: Date;
    dueDate?: Date;
    forceGeneration?: boolean;
    bulkProcessing?: boolean;
    generatedBy: string;
}
export interface InvoiceGenerationResult {
    success: boolean;
    invoicesGenerated: number;
    errors: string[];
    invoiceIds: string[];
    journalEntryIds: string[];
    totalAmount: number;
    processingTime: number;
}
export interface APInvoiceData {
    tenantId: string;
    vendorId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    description: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    purchaseOrderId?: string;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    withholdingTaxAmount: number;
    vatAmount: number;
    customsDutyAmount: number;
    contractLiabilityAmount: number;
    revenueRecognitionDate: Date;
    lines: APInvoiceLineData[];
    ghanaCompliance: GhanaComplianceData;
}
export interface ARInvoiceData {
    tenantId: string;
    customerId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    description: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    salesOrderId?: string;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    vatAmount: number;
    dealerMarginAmount: number;
    uppfLevyAmount: number;
    revenueRecognitionDate: Date;
    lines: ARInvoiceLineData[];
    ghanaCompliance: GhanaComplianceData;
}
export interface APInvoiceLineData {
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    accountCode: string;
    costCenter?: string;
    productType?: string;
    supplierId?: string;
    taxCode?: string;
    taxAmount?: number;
}
export interface ARInvoiceLineData {
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    accountCode: string;
    productType?: string;
    customerId?: string;
    taxCode?: string;
    taxAmount?: number;
    dealerMargin?: number;
    uppfLevy?: number;
}
export interface GhanaComplianceData {
    npaPermitNumber?: string;
    customsEntryNumber?: string;
    customsDutyPaid: number;
    petroleumTaxAmount: number;
    energyFundLevy: number;
    roadFundLevy: number;
    priceStabilizationLevy: number;
    primaryDistributionMargin: number;
    marketingMargin: number;
    dealerMargin: number;
    unifiedPetroleumPriceFundLevy: number;
    vatRate: number;
    withholdingTaxRate?: number;
}
export interface JournalEntryData {
    tenantId: string;
    journalDate: Date;
    description: string;
    journalType: string;
    sourceModule: string;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    totalDebit: number;
    totalCredit: number;
    lines: JournalLineData[];
    createdBy: string;
    approvalRequired: boolean;
    ifrsCompliant: boolean;
    ghanaCompliant: boolean;
}
export interface JournalLineData {
    lineNumber: number;
    accountCode: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    costCenter?: string;
    dimension1?: string;
    dimension2?: string;
    dimension3?: string;
    analyticsCodes?: string[];
}
export declare class APARIntegrationService {
    private readonly deliveryRepository;
    private readonly lineItemRepository;
    private readonly dataSource;
    private readonly httpService;
    private readonly eventEmitter;
    private readonly ghanaComplianceService;
    private readonly approvalService;
    private readonly logger;
    private readonly GHANA_VAT_RATE;
    private readonly WITHHOLDING_TAX_RATE;
    constructor(deliveryRepository: Repository<DailyDelivery>, lineItemRepository: Repository<DeliveryLineItem>, dataSource: DataSource, httpService: HttpService, eventEmitter: EventEmitter2, ghanaComplianceService: GhanaComplianceService, approvalService: ApprovalWorkflowService);
    /**
     * Main entry point for invoice generation from deliveries
     */
    generateInvoicesFromDeliveries(request: InvoiceGenerationRequest): Promise<InvoiceGenerationResult>;
    /**
     * Generate supplier invoice (AP) from delivery with station type consideration
     */
    generateSupplierInvoice(delivery: DailyDelivery, userId: string, invoiceDate?: Date, dueDate?: Date): Promise<string>;
    /**
     * Generate customer invoice (AR) from delivery with station type logic
     */
    generateCustomerInvoice(delivery: DailyDelivery, userId: string, invoiceDate?: Date, dueDate?: Date): Promise<string>;
    /**
     * Generate automated journal entries for delivery completion
     */
    generateDeliveryCompletionJournalEntry(delivery: DailyDelivery, userId: string): Promise<string>;
    /**
     * Process bulk invoice generation with approval workflow
     */
    processBulkInvoiceGeneration(deliveryIds: string[], userId: string): Promise<InvoiceGenerationResult>;
    handleDeliveryStatusChange(payload: any): Promise<void>;
    private getValidatedDeliveries;
    private processDeliveryInvoicing;
    private validateDeliveryForSupplierInvoicing;
    private validateDeliveryForCustomerInvoicing;
    private calculateSupplierInvoiceAmounts;
    private calculateCustomerInvoiceAmounts;
    private buildSupplierInvoiceLines;
    private buildCustomerInvoiceLines;
    private addTaxLines;
    private buildGhanaComplianceData;
    private getInventoryAccountCode;
    private getRevenueAccountCode;
    private generateInvoiceNumber;
    private calculateDueDate;
    private getSupplierInfo;
    private getCustomerInfo;
    private createAPInvoice;
    private createARInvoice;
    private createJournalEntry;
    private generateSupplierInvoiceJournalEntry;
    private generateCustomerInvoiceJournalEntry;
    private updateDeliveryWithSupplierInvoice;
    private updateDeliveryWithCustomerInvoice;
    private getAutoInvoiceSettings;
    private processAutoInvoiceGeneration;
}
//# sourceMappingURL=ap-ar-integration.service.d.ts.map