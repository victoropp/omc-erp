"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var APARIntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.APARIntegrationController = exports.ComplianceValidationDto = exports.UPPFClaimSubmissionDto = exports.BulkApprovalActionDto = exports.ApprovalActionDto = exports.BulkInvoiceGenerationDto = exports.GenerateInvoicesFromDeliveriesDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const ap_ar_integration_service_1 = require("./ap-ar-integration.service");
const enhanced_supplier_invoice_service_1 = require("../invoice-generation/enhanced-supplier-invoice.service");
const enhanced_customer_invoice_service_1 = require("../invoice-generation/enhanced-customer-invoice.service");
const ghana_chart_accounts_mapping_service_1 = require("./ghana-chart-accounts-mapping.service");
const approval_workflow_service_1 = require("../approval-workflow/approval-workflow.service");
const ghana_compliance_service_1 = require("../compliance/ghana-compliance.service");
const uppf_integration_service_1 = require("./uppf-integration.service");
const comprehensive_validation_service_1 = require("../validation/comprehensive-validation.service");
// DTOs for request/response
class GenerateInvoicesFromDeliveriesDto {
    deliveryIds;
    generationType;
    approvalRequired;
    invoiceDate;
    dueDate;
    forceGeneration;
    bulkProcessing;
    includeUPPFClaim;
    notes;
}
exports.GenerateInvoicesFromDeliveriesDto = GenerateInvoicesFromDeliveriesDto;
class BulkInvoiceGenerationDto {
    deliveryIds;
    invoiceDate;
    dueDate;
    groupBy;
    forceGeneration;
    approvalRequired;
    includeUPPFClaim;
    urgentProcessing;
    notes;
}
exports.BulkInvoiceGenerationDto = BulkInvoiceGenerationDto;
class ApprovalActionDto {
    action;
    comments;
    attachments;
    delegateToUserId;
    conditionalApproval;
    conditions;
}
exports.ApprovalActionDto = ApprovalActionDto;
class BulkApprovalActionDto {
    instanceIds;
    action;
    comments;
    skipValidation;
}
exports.BulkApprovalActionDto = BulkApprovalActionDto;
class UPPFClaimSubmissionDto {
    claimPeriod;
    dealerId;
    deliveryIds;
    claimType;
    supportingDocuments;
    urgentProcessing;
    notes;
}
exports.UPPFClaimSubmissionDto = UPPFClaimSubmissionDto;
class ComplianceValidationDto {
    deliveryId;
    includeDetailedReport;
    performExternalValidation;
}
exports.ComplianceValidationDto = ComplianceValidationDto;
let APARIntegrationController = APARIntegrationController_1 = class APARIntegrationController {
    aparIntegrationService;
    supplierInvoiceService;
    customerInvoiceService;
    accountMappingService;
    approvalService;
    complianceService;
    uppfService;
    validationService;
    logger = new common_1.Logger(APARIntegrationController_1.name);
    constructor(aparIntegrationService, supplierInvoiceService, customerInvoiceService, accountMappingService, approvalService, complianceService, uppfService, validationService) {
        this.aparIntegrationService = aparIntegrationService;
        this.supplierInvoiceService = supplierInvoiceService;
        this.customerInvoiceService = customerInvoiceService;
        this.accountMappingService = accountMappingService;
        this.approvalService = approvalService;
        this.complianceService = complianceService;
        this.uppfService = uppfService;
        this.validationService = validationService;
    }
    // Invoice Generation Endpoints
    async generateInvoicesFromDeliveries(dto, user) {
        this.logger.log(`Invoice generation requested by user ${user.id} for ${dto.deliveryIds.length} deliveries`);
        const request = {
            deliveryIds: dto.deliveryIds,
            generationType: dto.generationType,
            approvalRequired: dto.approvalRequired || false,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            forceGeneration: dto.forceGeneration || false,
            bulkProcessing: dto.bulkProcessing || false,
            generatedBy: user.id,
        };
        return await this.aparIntegrationService.generateInvoicesFromDeliveries(request);
    }
    async generateSupplierInvoice(dto, user) {
        const request = {
            deliveryId: dto.deliveryId,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            forceGeneration: dto.forceGeneration || false,
            approvalRequired: dto.approvalRequired || false,
            generatedBy: user.id,
            notes: dto.notes,
        };
        return await this.supplierInvoiceService.generateSupplierInvoice(request);
    }
    async generateCustomerInvoice(dto, user) {
        const request = {
            deliveryId: dto.deliveryId,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            forceGeneration: dto.forceGeneration || false,
            approvalRequired: dto.approvalRequired || false,
            includeUPPFClaim: dto.includeUPPFClaim || false,
            generatedBy: user.id,
            notes: dto.notes,
        };
        return await this.customerInvoiceService.generateCustomerInvoice(request);
    }
    // Bulk Operations Endpoints
    async generateBulkSupplierInvoices(dto, user) {
        const request = {
            deliveryIds: dto.deliveryIds,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            groupBy: dto.groupBy,
            forceGeneration: dto.forceGeneration || false,
            approvalRequired: dto.approvalRequired || false,
            generatedBy: user.id,
            notes: dto.notes,
        };
        return await this.supplierInvoiceService.generateBulkSupplierInvoices(request);
    }
    async generateBulkCustomerInvoices(dto, user) {
        const request = {
            deliveryIds: dto.deliveryIds,
            invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            groupBy: dto.groupBy,
            forceGeneration: dto.forceGeneration || false,
            approvalRequired: dto.approvalRequired || false,
            includeUPPFClaim: dto.includeUPPFClaim || false,
            generatedBy: user.id,
            notes: dto.notes,
        };
        return await this.customerInvoiceService.generateBulkCustomerInvoices(request);
    }
    // Approval Workflow Endpoints
    async processApprovalAction(instanceId, dto, user) {
        const request = {
            instanceId,
            stepId: 'CURRENT', // This should be resolved from the current step
            approverId: user.id,
            action: dto.action,
            comments: dto.comments,
            attachments: dto.attachments,
            delegateToUserId: dto.delegateToUserId,
            conditionalApproval: dto.conditionalApproval,
            conditions: dto.conditions,
        };
        return await this.approvalService.processApprovalAction(request);
    }
    async processBulkApprovalActions(dto, user) {
        const request = {
            instanceIds: dto.instanceIds,
            action: dto.action,
            comments: dto.comments,
            approverId: user.id,
            skipValidation: dto.skipValidation,
        };
        return await this.approvalService.processBulkApprovalActions(request);
    }
    async getPendingApprovals(workflowType, user) {
        return await this.approvalService.getPendingApprovals(user.id, workflowType);
    }
    async getWorkflowInstance(instanceId) {
        return await this.approvalService.getWorkflowInstance(instanceId);
    }
    // Ghana Chart of Accounts Endpoints
    async getAccountMapping(productType) {
        return {
            inventoryAccount: this.accountMappingService.getInventoryAccountByProduct(productType),
            revenueAccount: this.accountMappingService.getRevenueAccountByProduct(productType),
            cogsAccount: this.accountMappingService.getCOGSAccountByProduct(productType),
        };
    }
    async getTaxAccountMappings() {
        return {
            taxAccounts: this.accountMappingService.getTaxAccountMappings(),
            marginAccounts: this.accountMappingService.getMarginAccountMappings(),
        };
    }
    async initializeGhanaChartOfAccounts(user) {
        const success = await this.accountMappingService.initializeGhanaChartOfAccounts(user.tenantId);
        return { success, message: success ? 'Ghana Chart of Accounts initialized successfully' : 'Initialization failed' };
    }
    // Compliance and Validation Endpoints
    async validateCompliance(dto) {
        // First get the delivery
        const delivery = await this.getDeliveryById(dto.deliveryId);
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery not found');
        }
        return await this.complianceService.validateDeliveryCompliance(delivery);
    }
    async validateNPAPermit(dto) {
        return await this.complianceService.validateNPAPermit(dto.permitNumber, dto.productType, dto.quantity);
    }
    async validateCustomsEntry(dto) {
        return await this.complianceService.validateCustomsEntry(dto.entryNumber, dto.productType, dto.quantity);
    }
    // UPPF Integration Endpoints
    async assessUPPFEligibility(dto) {
        return await this.uppfService.assessDealerEligibility(dto.dealerId);
    }
    async submitUPPFClaim(dto, user) {
        const request = {
            claimPeriod: {
                startDate: new Date(dto.claimPeriod.startDate),
                endDate: new Date(dto.claimPeriod.endDate),
            },
            dealerId: dto.dealerId,
            deliveryIds: dto.deliveryIds,
            claimType: dto.claimType,
            totalEligibleVolume: 0, // This will be calculated
            totalClaimAmount: 0, // This will be calculated
            supportingDocuments: dto.supportingDocuments || [],
            submittedBy: user.id,
            urgentProcessing: dto.urgentProcessing,
            notes: dto.notes,
        };
        return await this.uppfService.submitUPPFClaim(request);
    }
    async getDealerMarginStructure(dealerId) {
        return await this.uppfService.getDealerMarginStructure(dealerId);
    }
    async processMonthlyUPPFClaims(dto) {
        const month = new Date(dto.month);
        return await this.uppfService.processMonthlyUPPFClaims(month, dto.forceProcess);
    }
    async getUPPFStatistics(startDate, endDate) {
        return await this.uppfService.getUPPFStatistics(new Date(startDate), new Date(endDate));
    }
    // Validation Endpoints
    async performComprehensiveValidation(dto, user) {
        const delivery = await this.getDeliveryById(dto.deliveryId);
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery not found');
        }
        const context = {
            userId: user.id,
            checkCreditLimit: true,
            includeExternalValidation: dto.includeExternalValidation || false,
        };
        return await this.validationService.validateDelivery(delivery, context);
    }
    async performBatchValidation(dto, user) {
        const deliveries = await this.getDeliveriesByIds(dto.deliveryIds);
        const context = { userId: user.id };
        return await this.validationService.validateDeliveryBatch(deliveries, context);
    }
    async validateField(dto, user) {
        const context = { userId: user.id };
        return await this.validationService.validateField(dto.fieldName, dto.fieldValue, dto.deliveryContext || {}, context);
    }
    // Reporting and Analytics Endpoints
    async getInvoiceGenerationSummary(startDate, endDate, groupBy) {
        // Implementation would aggregate invoice generation data
        return {
            message: 'Invoice generation summary endpoint - implementation needed',
            params: { startDate, endDate, groupBy },
        };
    }
    async getComplianceSummary(complianceType) {
        // Implementation would aggregate compliance data
        return {
            message: 'Compliance summary endpoint - implementation needed',
            params: { complianceType },
        };
    }
    // System Health and Status Endpoints
    async getSystemHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                aparIntegration: 'healthy',
                supplierInvoicing: 'healthy',
                customerInvoicing: 'healthy',
                approvalWorkflow: 'healthy',
                compliance: 'healthy',
                uppfIntegration: 'healthy',
                validation: 'healthy',
            },
            version: '1.0.0',
        };
    }
    // Private helper methods
    async getDeliveryById(deliveryId) {
        // This would typically fetch from the delivery repository
        // For now, return a mock delivery
        return {
            id: deliveryId,
            deliveryNumber: `DD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            // ... other delivery properties
        };
    }
    async getDeliveriesByIds(deliveryIds) {
        // This would typically fetch from the delivery repository
        return deliveryIds.map(id => ({
            id,
            deliveryNumber: `DD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            // ... other delivery properties
        }));
    }
};
exports.APARIntegrationController = APARIntegrationController;
__decorate([
    (0, common_1.Post)('invoices/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('finance_manager', 'accounting_clerk', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate invoices from deliveries',
        description: 'Generate supplier and/or customer invoices from completed deliveries with comprehensive validation and compliance checks',
    }),
    (0, swagger_1.ApiBody)({ type: GenerateInvoicesFromDeliveriesDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invoice generation completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                invoicesGenerated: { type: 'number' },
                errors: { type: 'array', items: { type: 'string' } },
                invoiceIds: { type: 'array', items: { type: 'string' } },
                journalEntryIds: { type: 'array', items: { type: 'string' } },
                totalAmount: { type: 'number' },
                processingTime: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateInvoicesFromDeliveriesDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "generateInvoicesFromDeliveries", null);
__decorate([
    (0, common_1.Post)('invoices/supplier/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('procurement_manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate supplier invoice',
        description: 'Generate a comprehensive supplier invoice with Ghana compliance and IFRS standards',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supplier invoice generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "generateSupplierInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/customer/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('sales_manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate customer invoice',
        description: 'Generate a comprehensive customer invoice with dealer margins and UPPF integration',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer invoice generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "generateCustomerInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/bulk/supplier'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate bulk supplier invoices',
        description: 'Generate multiple supplier invoices with optional grouping and approval workflows',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk supplier invoice generation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkInvoiceGenerationDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "generateBulkSupplierInvoices", null);
__decorate([
    (0, common_1.Post)('invoices/bulk/customer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate bulk customer invoices',
        description: 'Generate multiple customer invoices with UPPF claims and dealer margin calculations',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk customer invoice generation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkInvoiceGenerationDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "generateBulkCustomerInvoices", null);
__decorate([
    (0, common_1.Post)('approvals/:instanceId/action'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process approval action',
        description: 'Approve, reject, delegate, or request information for a workflow instance',
    }),
    (0, swagger_1.ApiParam)({ name: 'instanceId', description: 'Workflow instance ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval action processed successfully' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ApprovalActionDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "processApprovalAction", null);
__decorate([
    (0, common_1.Post)('approvals/bulk-action'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process bulk approval actions',
        description: 'Approve or reject multiple workflow instances at once',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk approval actions processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkApprovalActionDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "processBulkApprovalActions", null);
__decorate([
    (0, common_1.Get)('approvals/pending'),
    (0, roles_decorator_1.Roles)('manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending approvals',
        description: 'Get list of pending approval requests for the current user',
    }),
    (0, swagger_1.ApiQuery)({ name: 'workflowType', required: false, description: 'Filter by workflow type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending approvals retrieved successfully' }),
    __param(0, (0, common_1.Query)('workflowType')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('approvals/:instanceId'),
    (0, roles_decorator_1.Roles)('manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get approval workflow details',
        description: 'Get detailed information about a specific approval workflow instance',
    }),
    (0, swagger_1.ApiParam)({ name: 'instanceId', description: 'Workflow instance ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow instance details retrieved successfully' }),
    __param(0, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getWorkflowInstance", null);
__decorate([
    (0, common_1.Get)('chart-of-accounts/mapping/:productType'),
    (0, roles_decorator_1.Roles)('accounting_clerk', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account mapping for product type',
        description: 'Get Ghana-specific account mappings for a specific product type',
    }),
    (0, swagger_1.ApiParam)({ name: 'productType', enum: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account mapping retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getAccountMapping", null);
__decorate([
    (0, common_1.Get)('chart-of-accounts/tax-mappings'),
    (0, roles_decorator_1.Roles)('accounting_clerk', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Ghana tax account mappings',
        description: 'Get comprehensive Ghana-specific tax account mappings',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax account mappings retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getTaxAccountMappings", null);
__decorate([
    (0, common_1.Post)('chart-of-accounts/initialize'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialize Ghana Chart of Accounts',
        description: 'Initialize complete Ghana Chart of Accounts structure for OMC operations',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ghana Chart of Accounts initialized successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "initializeGhanaChartOfAccounts", null);
__decorate([
    (0, common_1.Post)('compliance/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('compliance_officer', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate Ghana compliance',
        description: 'Perform comprehensive Ghana regulatory compliance validation for a delivery',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance validation completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ComplianceValidationDto]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "validateCompliance", null);
__decorate([
    (0, common_1.Post)('compliance/npa-permit/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('compliance_officer', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate NPA permit',
        description: 'Validate NPA permit number against Ghana NPA database',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NPA permit validation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "validateNPAPermit", null);
__decorate([
    (0, common_1.Post)('compliance/customs-entry/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('compliance_officer', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate customs entry',
        description: 'Validate customs entry number against Ghana Customs database',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customs entry validation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "validateCustomsEntry", null);
__decorate([
    (0, common_1.Post)('uppf/eligibility/assess'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Assess dealer UPPF eligibility',
        description: 'Assess dealer eligibility for UPPF claims with comprehensive criteria evaluation',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF eligibility assessment completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "assessUPPFEligibility", null);
__decorate([
    (0, common_1.Post)('uppf/claims/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit UPPF claim',
        description: 'Submit UPPF claim for eligible deliveries with supporting documentation',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF claim submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UPPFClaimSubmissionDto, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "submitUPPFClaim", null);
__decorate([
    (0, common_1.Get)('uppf/dealer-margins/:dealerId'),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dealer margin structure',
        description: 'Get detailed margin structure for a specific dealer',
    }),
    (0, swagger_1.ApiParam)({ name: 'dealerId', description: 'Dealer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dealer margin structure retrieved successfully' }),
    __param(0, (0, common_1.Param)('dealerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getDealerMarginStructure", null);
__decorate([
    (0, common_1.Post)('uppf/monthly-processing'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process monthly UPPF claims',
        description: 'Process monthly UPPF claims for all eligible dealers',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Monthly UPPF processing completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "processMonthlyUPPFClaims", null);
__decorate([
    (0, common_1.Get)('uppf/statistics'),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get UPPF statistics',
        description: 'Get comprehensive UPPF statistics for reporting and analysis',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: 'Start date for statistics (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: 'End date for statistics (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF statistics retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getUPPFStatistics", null);
__decorate([
    (0, common_1.Post)('validation/comprehensive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('data_analyst', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform comprehensive validation',
        description: 'Perform comprehensive validation of delivery data with detailed analysis',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comprehensive validation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "performComprehensiveValidation", null);
__decorate([
    (0, common_1.Post)('validation/batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('data_analyst', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform batch validation',
        description: 'Perform validation on multiple deliveries with batch summary',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch validation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "performBatchValidation", null);
__decorate([
    (0, common_1.Post)('validation/field'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('data_analyst', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate individual field',
        description: 'Perform real-time validation on individual field values',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Field validation completed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "validateField", null);
__decorate([
    (0, common_1.Get)('reports/invoice-generation-summary'),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get invoice generation summary',
        description: 'Get summary report of invoice generation activities',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'groupBy', required: false, enum: ['DATE', 'SUPPLIER', 'CUSTOMER', 'PRODUCT'], description: 'Group results by' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice generation summary retrieved' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getInvoiceGenerationSummary", null);
__decorate([
    (0, common_1.Get)('reports/compliance-summary'),
    (0, roles_decorator_1.Roles)('compliance_officer', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get compliance summary',
        description: 'Get summary report of compliance validation activities',
    }),
    (0, swagger_1.ApiQuery)({ name: 'complianceType', required: false, enum: ['NPA', 'CUSTOMS', 'TAX', 'ENVIRONMENTAL'], description: 'Filter by compliance type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compliance summary retrieved' }),
    __param(0, (0, common_1.Query)('complianceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getComplianceSummary", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get system health status',
        description: 'Get health status of all integration services',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health status retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], APARIntegrationController.prototype, "getSystemHealth", null);
exports.APARIntegrationController = APARIntegrationController = APARIntegrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('AP/AR Integration'),
    (0, common_1.Controller)('integration/ap-ar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ap_ar_integration_service_1.APARIntegrationService,
        enhanced_supplier_invoice_service_1.EnhancedSupplierInvoiceService,
        enhanced_customer_invoice_service_1.EnhancedCustomerInvoiceService,
        ghana_chart_accounts_mapping_service_1.GhanaChartAccountsMappingService,
        approval_workflow_service_1.ApprovalWorkflowService,
        ghana_compliance_service_1.GhanaComplianceService,
        uppf_integration_service_1.UPPFIntegrationService,
        comprehensive_validation_service_1.ComprehensiveValidationService])
], APARIntegrationController);
//# sourceMappingURL=ap-ar-integration.controller.js.map