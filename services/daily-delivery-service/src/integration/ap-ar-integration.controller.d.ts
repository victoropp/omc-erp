import { APARIntegrationService, InvoiceGenerationResult } from './ap-ar-integration.service';
import { EnhancedSupplierInvoiceService } from '../invoice-generation/enhanced-supplier-invoice.service';
import { EnhancedCustomerInvoiceService } from '../invoice-generation/enhanced-customer-invoice.service';
import { GhanaChartAccountsMappingService } from './ghana-chart-accounts-mapping.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
import { UPPFIntegrationService } from './uppf-integration.service';
import { ComprehensiveValidationService } from '../validation/comprehensive-validation.service';
export declare class GenerateInvoicesFromDeliveriesDto {
    deliveryIds: string[];
    generationType: 'SUPPLIER' | 'CUSTOMER' | 'BOTH';
    approvalRequired?: boolean;
    invoiceDate?: string;
    dueDate?: string;
    forceGeneration?: boolean;
    bulkProcessing?: boolean;
    includeUPPFClaim?: boolean;
    notes?: string;
}
export declare class BulkInvoiceGenerationDto {
    deliveryIds: string[];
    invoiceDate?: string;
    dueDate?: string;
    groupBy?: 'SUPPLIER' | 'CUSTOMER' | 'DATE' | 'PRODUCT_TYPE' | 'STATION';
    forceGeneration?: boolean;
    approvalRequired?: boolean;
    includeUPPFClaim?: boolean;
    urgentProcessing?: boolean;
    notes?: string;
}
export declare class ApprovalActionDto {
    action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'REQUEST_INFO';
    comments: string;
    attachments?: string[];
    delegateToUserId?: string;
    conditionalApproval?: boolean;
    conditions?: string[];
}
export declare class BulkApprovalActionDto {
    instanceIds: string[];
    action: 'APPROVE' | 'REJECT';
    comments: string;
    skipValidation?: boolean;
}
export declare class UPPFClaimSubmissionDto {
    claimPeriod: {
        startDate: string;
        endDate: string;
    };
    dealerId: string;
    deliveryIds: string[];
    claimType: 'MONTHLY' | 'QUARTERLY' | 'INDIVIDUAL';
    supportingDocuments?: string[];
    urgentProcessing?: boolean;
    notes?: string;
}
export declare class ComplianceValidationDto {
    deliveryId: string;
    includeDetailedReport?: boolean;
    performExternalValidation?: boolean;
}
export declare class APARIntegrationController {
    private readonly aparIntegrationService;
    private readonly supplierInvoiceService;
    private readonly customerInvoiceService;
    private readonly accountMappingService;
    private readonly approvalService;
    private readonly complianceService;
    private readonly uppfService;
    private readonly validationService;
    private readonly logger;
    constructor(aparIntegrationService: APARIntegrationService, supplierInvoiceService: EnhancedSupplierInvoiceService, customerInvoiceService: EnhancedCustomerInvoiceService, accountMappingService: GhanaChartAccountsMappingService, approvalService: ApprovalWorkflowService, complianceService: GhanaComplianceService, uppfService: UPPFIntegrationService, validationService: ComprehensiveValidationService);
    generateInvoicesFromDeliveries(dto: GenerateInvoicesFromDeliveriesDto, user: any): Promise<InvoiceGenerationResult>;
    generateSupplierInvoice(dto: {
        deliveryId: string;
        invoiceDate?: string;
        dueDate?: string;
        forceGeneration?: boolean;
        approvalRequired?: boolean;
        notes?: string;
    }, user: any): Promise<import("../invoice-generation/enhanced-supplier-invoice.service").SupplierInvoiceResult>;
    generateCustomerInvoice(dto: {
        deliveryId: string;
        invoiceDate?: string;
        dueDate?: string;
        forceGeneration?: boolean;
        approvalRequired?: boolean;
        includeUPPFClaim?: boolean;
        notes?: string;
    }, user: any): Promise<import("../invoice-generation/enhanced-customer-invoice.service").CustomerInvoiceResult>;
    generateBulkSupplierInvoices(dto: BulkInvoiceGenerationDto, user: any): Promise<{
        success: boolean;
        results: import("../invoice-generation/enhanced-supplier-invoice.service").SupplierInvoiceResult[];
        summary: {
            total: number;
            successful: number;
            failed: number;
            totalAmount: number;
            processingTime: number;
        };
    }>;
    generateBulkCustomerInvoices(dto: BulkInvoiceGenerationDto, user: any): Promise<{
        success: boolean;
        results: import("../invoice-generation/enhanced-customer-invoice.service").CustomerInvoiceResult[];
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
    processApprovalAction(instanceId: string, dto: ApprovalActionDto, user: any): Promise<import("../approval-workflow/approval-workflow.service").WorkflowInstance>;
    processBulkApprovalActions(dto: BulkApprovalActionDto, user: any): Promise<{
        successful: number;
        failed: number;
        results: Array<{
            instanceId: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    getPendingApprovals(workflowType?: string, user?: any): Promise<import("../approval-workflow/approval-workflow.service").WorkflowInstance[]>;
    getWorkflowInstance(instanceId: string): Promise<import("../approval-workflow/approval-workflow.service").WorkflowInstance>;
    getAccountMapping(productType: string): Promise<{
        inventoryAccount: string;
        revenueAccount: string;
        cogsAccount: string;
    }>;
    getTaxAccountMappings(): Promise<{
        taxAccounts: import("./ghana-chart-accounts-mapping.service").TaxAccountMapping[];
        marginAccounts: import("./ghana-chart-accounts-mapping.service").MarginAccountMapping[];
    }>;
    initializeGhanaChartOfAccounts(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    validateCompliance(dto: ComplianceValidationDto): Promise<import("../compliance/ghana-compliance.service").GhanaComplianceValidationResult>;
    validateNPAPermit(dto: {
        permitNumber: string;
        productType?: string;
        quantity?: number;
    }): Promise<import("../compliance/ghana-compliance.service").NPAPermitValidation>;
    validateCustomsEntry(dto: {
        entryNumber: string;
        productType?: string;
        quantity?: number;
    }): Promise<import("../compliance/ghana-compliance.service").CustomsEntryValidation>;
    assessUPPFEligibility(dto: {
        dealerId: string;
    }): Promise<import("./uppf-integration.service").UPPFEligibilityAssessment>;
    submitUPPFClaim(dto: UPPFClaimSubmissionDto, user: any): Promise<import("./uppf-integration.service").UPPFClaimResult>;
    getDealerMarginStructure(dealerId: string): Promise<import("./uppf-integration.service").DealerMarginStructure>;
    processMonthlyUPPFClaims(dto: {
        month: string;
        forceProcess?: boolean;
    }): Promise<{
        totalProcessed: number;
        totalSuccessful: number;
        totalFailed: number;
        totalAmount: number;
        results: Array<{
            dealerId: string;
            success: boolean;
            claimId?: string;
            error?: string;
            amount?: number;
        }>;
    }>;
    getUPPFStatistics(startDate: string, endDate: string): Promise<import("./uppf-integration.service").UPPFStatistics>;
    performComprehensiveValidation(dto: {
        deliveryId: string;
        includeExternalValidation?: boolean;
    }, user: any): Promise<import("../validation/comprehensive-validation.service").ValidationResult>;
    performBatchValidation(dto: {
        deliveryIds: string[];
    }, user: any): Promise<{
        overallValid: boolean;
        totalValidated: number;
        validCount: number;
        invalidCount: number;
        averageValidationScore: number;
        results: Array<{
            deliveryId: string;
            result: import("../validation/comprehensive-validation.service").ValidationResult;
        }>;
        batchSummary: import("../validation/comprehensive-validation.service").BatchValidationSummary;
    }>;
    validateField(dto: {
        fieldName: string;
        fieldValue: any;
        deliveryContext?: any;
    }, user: any): Promise<{
        isValid: boolean;
        errors: import("../validation/comprehensive-validation.service").ValidationError[];
        warnings: import("../validation/comprehensive-validation.service").ValidationWarning[];
        suggestedValue?: any;
        autoCorrection?: any;
    }>;
    getInvoiceGenerationSummary(startDate?: string, endDate?: string, groupBy?: string): Promise<{
        message: string;
        params: {
            startDate: string | undefined;
            endDate: string | undefined;
            groupBy: string | undefined;
        };
    }>;
    getComplianceSummary(complianceType?: string): Promise<{
        message: string;
        params: {
            complianceType: string | undefined;
        };
    }>;
    getSystemHealth(): Promise<{
        status: string;
        timestamp: string;
        services: {
            aparIntegration: string;
            supplierInvoicing: string;
            customerInvoicing: string;
            approvalWorkflow: string;
            compliance: string;
            uppfIntegration: string;
            validation: string;
        };
        version: string;
    }>;
    private getDeliveryById;
    private getDeliveriesByIds;
}
//# sourceMappingURL=ap-ar-integration.controller.d.ts.map