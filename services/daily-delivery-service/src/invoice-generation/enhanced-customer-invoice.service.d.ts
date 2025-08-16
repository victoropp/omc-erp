import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { DailyDelivery, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
import { GhanaChartAccountsMappingService } from '../integration/ghana-chart-accounts-mapping.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
export interface CustomerInvoiceGenerationRequest {
    deliveryId: string;
    invoiceDate?: Date;
    dueDate?: Date;
    forceGeneration?: boolean;
    approvalRequired?: boolean;
    includeUPPFClaim?: boolean;
    generatedBy: string;
    notes?: string;
}
export interface BulkCustomerInvoiceRequest {
    deliveryIds: string[];
    invoiceDate?: Date;
    dueDate?: Date;
    groupBy?: 'CUSTOMER' | 'DATE' | 'PRODUCT_TYPE' | 'STATION';
    forceGeneration?: boolean;
    approvalRequired?: boolean;
    includeUPPFClaim?: boolean;
    generatedBy: string;
    notes?: string;
}
export interface CustomerInvoiceResult {
    success: boolean;
    invoiceId?: string;
    invoiceNumber?: string;
    totalAmount: number;
    dealerMarginAmount: number;
    uppfClaimAmount: number;
    errors: string[];
    validationWarnings: string[];
    creditLimitStatus: CreditLimitStatus;
    uppfClaimId?: string;
    journalEntryId?: string;
    approvalWorkflowId?: string;
}
export interface CreditLimitStatus {
    currentBalance: number;
    creditLimit: number;
    availableCredit: number;
    utilizationPercentage: number;
    exceedsLimit: boolean;
    recommendedAction: 'APPROVE' | 'REVIEW' | 'REJECT';
}
export interface EnhancedARInvoice {
    id?: string;
    tenantId: string;
    customerId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    outstandingAmount: number;
    sourceDocumentType: string;
    sourceDocumentId: string;
    referenceNumber: string;
    vatAmount: number;
    dealerMarginAmount: number;
    uppfLevyAmount: number;
    revenueRecognitionDate: Date;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    approvalRequired: boolean;
    approvalWorkflowId?: string;
    lineItems: EnhancedARInvoiceLineItem[];
    marginBreakdown: MarginBreakdownItem[];
    dealerInfo: DealerInformation;
    uppfClaim?: UPPFClaimData;
    ifrsData: IFRSRevenueData;
    auditTrail: AuditTrailEntry[];
    createdBy: string;
    approvedBy?: string;
    approvalDate?: Date;
}
export interface EnhancedARInvoiceLineItem {
    lineNumber: number;
    description: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    lineTotal: number;
    accountCode: string;
    accountName: string;
    productType?: ProductGrade;
    customerId?: string;
    taxCode?: string;
    taxAmount?: number;
    dealerMargin?: number;
    uppfLevy?: number;
    qualitySpecs?: ProductQualitySpecs;
    ifrsAllocation?: IFRSAllocation;
}
export interface MarginBreakdownItem {
    marginType: 'PRIMARY_DISTRIBUTION' | 'MARKETING' | 'DEALER';
    marginName: string;
    marginRate: number;
    baseAmount: number;
    marginAmount: number;
    accountCode: string;
    applicableProducts: ProductGrade[];
}
export interface DealerInformation {
    dealerId: string;
    dealerName: string;
    dealerCode: string;
    stationLocation: string;
    dealerType: 'COCO' | 'DOCO' | 'FRANCHISE';
    creditRating: string;
    paymentHistory: PaymentHistoryInfo;
    uppfEligible: boolean;
    marginStructure: MarginStructure;
}
export interface PaymentHistoryInfo {
    averagePaymentDays: number;
    paymentReliabilityScore: number;
    lastPaymentDate?: Date;
    totalOutstanding: number;
    overdueAmount: number;
}
export interface MarginStructure {
    primaryDistributionRate: number;
    marketingMarginRate: number;
    dealerMarginRate: number;
    totalMarginPercentage: number;
    effectiveDate: Date;
}
export interface UPPFClaimData {
    claimId: string;
    claimAmount: number;
    eligibleVolume: number;
    ratePerLitre: number;
    claimPeriod: {
        startDate: Date;
        endDate: Date;
    };
    status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';
    submissionDeadline: Date;
    supportingDocuments: string[];
}
export interface ProductQualitySpecs {
    density: number;
    temperature: number;
    netStandardVolume: number;
    volumeCorrectionFactor: number;
    qualityGrade: string;
    testCertificateUrl?: string;
}
export interface IFRSRevenueData {
    performanceObligations: PerformanceObligation[];
    revenueRecognitionPattern: 'POINT_IN_TIME' | 'OVER_TIME';
    contractModifications: ContractModification[];
    variableConsideration: VariableConsiderationData;
}
export interface PerformanceObligation {
    obligationId: string;
    description: string;
    satisfactionMethod: 'DELIVERY' | 'ACCEPTANCE' | 'TIME_BASED';
    allocationAmount: number;
    satisfiedDate?: Date;
    percentComplete: number;
}
export interface ContractModification {
    modificationDate: Date;
    modificationType: 'PRICE_CHANGE' | 'QUANTITY_CHANGE' | 'TERMS_CHANGE';
    impactAmount: number;
    description: string;
}
export interface VariableConsiderationData {
    bonusAmount: number;
    penaltyAmount: number;
    discountAmount: number;
    probabilityWeightedAmount: number;
    constraintAmount: number;
}
export interface IFRSAllocation {
    performanceObligationId: string;
    allocatedAmount: number;
    satisfactionDate?: Date;
    deferredRevenueAmount: number;
}
export interface AuditTrailEntry {
    action: string;
    performedBy: string;
    performedAt: Date;
    details: string;
    ipAddress?: string;
    systemInfo?: string;
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
    ifrsCategory?: string;
}
export declare class EnhancedCustomerInvoiceService {
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
    constructor(deliveryRepository: Repository<DailyDelivery>, lineItemRepository: Repository<DeliveryLineItem>, dataSource: DataSource, httpService: HttpService, eventEmitter: EventEmitter2, validationService: DeliveryValidationService, accountMappingService: GhanaChartAccountsMappingService, approvalService: ApprovalWorkflowService, complianceService: GhanaComplianceService);
    /**
     * Generate comprehensive customer invoice from delivery
     */
    generateCustomerInvoice(request: CustomerInvoiceGenerationRequest): Promise<CustomerInvoiceResult>;
    /**
     * Generate bulk customer invoices
     */
    generateBulkCustomerInvoices(request: BulkCustomerInvoiceRequest): Promise<{
        success: boolean;
        results: CustomerInvoiceResult[];
        summary: {
            total: number;
            successful: number;
            failed: number;
            totalAmount: number;
            totalDealerMargins: number;
            totalUPPFClaims: number;
            creditLimitExceeded: number;
            processingTime: number;
        };
    }>;
    /**
     * Generate UPPF claim from delivery
     */
    generateUPPFClaim(delivery: DailyDelivery, dealerInfo: DealerInformation, userId: string): Promise<UPPFClaimData>;
    private getValidatedDelivery;
    private performComprehensiveValidation;
    private getEnhancedCustomerInfo;
    private validateCreditLimit;
    private getDealerInformation;
    private calculateComprehensiveAmounts;
    private generateSequentialInvoiceNumber;
    private calculateBusinessDueDate;
    private buildEnhancedARInvoice;
    private buildEnhancedLineItems;
    private buildMarginBreakdown;
    private buildIFRSData;
    private submitForApproval;
    private createEnhancedARInvoice;
    private generateEnhancedDeliveryJournalEntry;
    private generateComprehensiveJournalEntry;
    private updateDeliveryWithInvoiceInfo;
    private updateCustomerBalance;
    private groupDeliveriesForBulkProcessing;
    private generateClaimId;
    private getAccountInfo;
}
//# sourceMappingURL=enhanced-customer-invoice.service.d.ts.map