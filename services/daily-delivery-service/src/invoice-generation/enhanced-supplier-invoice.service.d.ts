import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { DailyDelivery, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
import { GhanaChartAccountsMappingService } from '../integration/ghana-chart-accounts-mapping.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
export interface SupplierInvoiceGenerationRequest {
    deliveryId: string;
    invoiceDate?: Date;
    dueDate?: Date;
    forceGeneration?: boolean;
    approvalRequired?: boolean;
    generatedBy: string;
    notes?: string;
}
export interface BulkSupplierInvoiceRequest {
    deliveryIds: string[];
    invoiceDate?: Date;
    dueDate?: Date;
    groupBy?: 'SUPPLIER' | 'DATE' | 'PRODUCT_TYPE';
    forceGeneration?: boolean;
    approvalRequired?: boolean;
    generatedBy: string;
    notes?: string;
}
export interface SupplierInvoiceResult {
    success: boolean;
    invoiceId?: string;
    invoiceNumber?: string;
    totalAmount: number;
    errors: string[];
    validationWarnings: string[];
    complianceStatus: GhanaComplianceStatus;
    journalEntryId?: string;
    approvalWorkflowId?: string;
}
export interface GhanaComplianceStatus {
    isCompliant: boolean;
    npaPermitValid: boolean;
    customsEntryValid: boolean;
    taxCalculationsValid: boolean;
    missingDocuments: string[];
    complianceScore: number;
}
export interface EnhancedAPInvoice {
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
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
    approvalRequired: boolean;
    approvalWorkflowId?: string;
    lineItems: EnhancedAPInvoiceLineItem[];
    taxBreakdown: TaxBreakdownItem[];
    ghanaCompliance: GhanaComplianceData;
    auditTrail: AuditTrailEntry[];
    createdBy: string;
    approvedBy?: string;
    approvalDate?: Date;
}
export interface EnhancedAPInvoiceLineItem {
    lineNumber: number;
    description: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    lineTotal: number;
    accountCode: string;
    accountName: string;
    costCenter?: string;
    dimension1?: string;
    dimension2?: string;
    dimension3?: string;
    taxCode?: string;
    taxAmount?: number;
    withholdingTaxApplicable: boolean;
    vatApplicable: boolean;
    productType?: ProductGrade;
    complianceData?: LineItemComplianceData;
}
export interface TaxBreakdownItem {
    taxType: 'PETROLEUM_TAX' | 'ENERGY_FUND_LEVY' | 'ROAD_FUND_LEVY' | 'PRICE_STABILIZATION_LEVY' | 'UPPF_LEVY' | 'VAT' | 'WITHHOLDING_TAX' | 'CUSTOMS_DUTY';
    taxName: string;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    accountCode: string;
    isGhanaSpecific: boolean;
    complianceRequired: boolean;
}
export interface GhanaComplianceData {
    npaPermitNumber?: string;
    npaPermitValid: boolean;
    customsEntryNumber?: string;
    customsEntryValid: boolean;
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
    totalComplianceTaxes: number;
    complianceDocuments: ComplianceDocument[];
}
export interface LineItemComplianceData {
    productClassification: string;
    harmonizedCode?: string;
    environmentalImpactCode?: string;
    qualityStandard?: string;
    certificationRequired: boolean;
}
export interface ComplianceDocument {
    documentType: string;
    documentNumber?: string;
    isValid: boolean;
    expiryDate?: Date;
    url?: string;
}
export interface AuditTrailEntry {
    action: string;
    performedBy: string;
    performedAt: Date;
    details: string;
    ipAddress?: string;
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
    accountName: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    costCenter?: string;
    dimension1?: string;
    dimension2?: string;
    dimension3?: string;
    analyticsCodes?: string[];
    taxCode?: string;
    complianceCode?: string;
}
export declare class EnhancedSupplierInvoiceService {
    private readonly deliveryRepository;
    private readonly lineItemRepository;
    private readonly dataSource;
    private readonly httpService;
    private readonly eventEmitter;
    private readonly validationService;
    private readonly accountMappingService;
    private readonly approvalService;
    private readonly complianceService;
    private readonly logger;
    private readonly GHANA_VAT_RATE;
    private readonly WITHHOLDING_TAX_RATE;
    constructor(deliveryRepository: Repository<DailyDelivery>, lineItemRepository: Repository<DeliveryLineItem>, dataSource: DataSource, httpService: HttpService, eventEmitter: EventEmitter2, validationService: DeliveryValidationService, accountMappingService: GhanaChartAccountsMappingService, approvalService: ApprovalWorkflowService, complianceService: GhanaComplianceService);
    /**
     * Generate comprehensive supplier invoice from delivery
     */
    generateSupplierInvoice(request: SupplierInvoiceGenerationRequest): Promise<SupplierInvoiceResult>;
    /**
     * Generate bulk supplier invoices
     */
    generateBulkSupplierInvoices(request: BulkSupplierInvoiceRequest): Promise<{
        success: boolean;
        results: SupplierInvoiceResult[];
        summary: {
            total: number;
            successful: number;
            failed: number;
            totalAmount: number;
            processingTime: number;
        };
    }>;
    /**
     * Cancel supplier invoice with proper reversals
     */
    cancelSupplierInvoice(invoiceId: string, reason: string, userId: string): Promise<void>;
    private getValidatedDelivery;
    private performComprehensiveValidation;
    private getEnhancedSupplierInfo;
    private validateGhanaCompliance;
    private validateTaxCalculations;
    private calculateComprehensiveAmounts;
    private generateSequentialInvoiceNumber;
    private calculateBusinessDueDate;
    private buildEnhancedAPInvoice;
    private buildEnhancedLineItems;
    private buildTaxBreakdown;
    private buildComplianceData;
    private submitForApproval;
    private createEnhancedAPInvoice;
    private generateEnhancedDeliveryJournalEntry;
    private generateComprehensiveJournalEntry;
    private updateDeliveryWithInvoiceInfo;
    private groupDeliveriesForBulkProcessing;
    private getTaxAmountFromDelivery;
    private getTaxName;
    private getHarmonizedCode;
    private getAccountInfo;
    private getSupplierInvoice;
    private updateInvoiceStatus;
    private createReversalJournalEntry;
}
//# sourceMappingURL=enhanced-supplier-invoice.service.d.ts.map