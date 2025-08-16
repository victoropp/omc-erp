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
var ApprovalWorkflowService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const date_fns_1 = require("date-fns");
const daily_delivery_entity_1 = require("../daily-delivery/entities/daily-delivery.entity");
const delivery_approval_history_entity_1 = require("../daily-delivery/entities/delivery-approval-history.entity");
let ApprovalWorkflowService = ApprovalWorkflowService_1 = class ApprovalWorkflowService {
    deliveryRepository;
    approvalHistoryRepository;
    dataSource;
    httpService;
    eventEmitter;
    logger = new common_1.Logger(ApprovalWorkflowService_1.name);
    constructor(deliveryRepository, approvalHistoryRepository, dataSource, httpService, eventEmitter) {
        this.deliveryRepository = deliveryRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.dataSource = dataSource;
        this.httpService = httpService;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Submit delivery for approval
     */
    async submitDeliveryForApproval(deliveryId, submittedBy, priority = 'MEDIUM') {
        try {
            const delivery = await this.deliveryRepository.findOne({
                where: { id: deliveryId },
                relations: ['lineItems'],
            });
            if (!delivery) {
                throw new common_1.NotFoundException('Delivery not found');
            }
            // Get appropriate workflow definition
            const workflowDefinition = await this.getWorkflowDefinition('DELIVERY_APPROVAL', {
                amount: delivery.totalValue,
                productType: delivery.productType,
                customerType: 'DEALER', // This should come from customer data
            });
            // Check auto-approval rules
            const autoApproval = await this.checkAutoApprovalRules(workflowDefinition, delivery);
            if (autoApproval.shouldAutoApprove) {
                return await this.processAutoApproval(delivery, submittedBy, autoApproval.reason);
            }
            // Build workflow metadata
            const metadata = {
                tenantId: delivery.tenantId,
                amount: delivery.totalValue,
                currency: delivery.currency,
                customerId: delivery.customerId,
                customerName: delivery.customerName,
                productType: delivery.productType,
                deliveryDate: delivery.deliveryDate,
                businessUnit: delivery.depotId,
                urgentRequest: priority === 'CRITICAL',
                riskAssessment: await this.assessRisk(delivery),
                ghanaSpecificData: {
                    npaPermitNumber: delivery.npaPermitNumber,
                    customsEntryNumber: delivery.customsEntryNumber,
                    uppfEligible: delivery.unifiedPetroleumPriceFundLevy > 0,
                    petroleumTaxAmount: delivery.petroleumTaxAmount,
                    totalGhanaTaxes: delivery.getTotalTaxes(),
                    complianceScore: 85, // This should be calculated
                    environmentalImpact: this.assessEnvironmentalImpact(delivery.productType),
                },
            };
            // Create workflow instance
            const workflowInstance = await this.createWorkflowInstance({
                workflowId: workflowDefinition.workflowId,
                workflowType: 'DELIVERY_APPROVAL',
                sourceDocumentId: deliveryId,
                sourceDocumentType: 'DAILY_DELIVERY',
                requestedBy: submittedBy,
                priority,
                metadata,
            });
            // Update delivery status
            await this.deliveryRepository.update(deliveryId, {
                approvalWorkflowId: workflowInstance.instanceId,
                status: 'PENDING_APPROVAL',
            });
            // Send notifications to first step approvers
            await this.sendApprovalNotifications(workflowInstance);
            // Emit event
            this.eventEmitter.emit('delivery.submitted_for_approval', {
                deliveryId,
                workflowInstanceId: workflowInstance.instanceId,
                submittedBy,
                priority,
            });
            this.logger.log(`Delivery ${delivery.deliveryNumber} submitted for approval: ${workflowInstance.instanceId}`);
            return workflowInstance.instanceId;
        }
        catch (error) {
            this.logger.error('Failed to submit delivery for approval:', error);
            throw error;
        }
    }
    /**
     * Submit bulk invoice generation for approval
     */
    async submitBulkInvoiceGeneration(request, submittedBy) {
        try {
            // Get deliveries for validation
            const deliveries = await this.deliveryRepository.find({
                where: { id: { $in: request.deliveryIds } },
            });
            if (deliveries.length !== request.deliveryIds.length) {
                throw new common_1.BadRequestException('Some deliveries not found');
            }
            // Calculate total amount
            const totalAmount = deliveries.reduce((sum, delivery) => sum + delivery.totalValue, 0);
            // Build metadata
            const metadata = {
                tenantId: deliveries[0].tenantId,
                amount: totalAmount,
                currency: 'GHS',
                urgentRequest: false,
                businessJustification: `Bulk invoice generation for ${deliveries.length} deliveries`,
                riskAssessment: await this.assessBulkRisk(deliveries),
            };
            // Create workflow instance
            const workflowInstance = await this.createWorkflowInstance({
                workflowId: 'BULK_INVOICE_WORKFLOW',
                workflowType: 'BULK_INVOICE_APPROVAL',
                sourceDocumentId: `BULK_${Date.now()}`,
                sourceDocumentType: 'BULK_INVOICE_REQUEST',
                requestedBy: submittedBy,
                priority: 'MEDIUM',
                metadata,
            });
            // Emit event
            this.eventEmitter.emit('bulk_invoice.submitted_for_approval', {
                workflowInstanceId: workflowInstance.instanceId,
                deliveryCount: deliveries.length,
                totalAmount,
                submittedBy,
            });
            return workflowInstance.instanceId;
        }
        catch (error) {
            this.logger.error('Failed to submit bulk invoice generation for approval:', error);
            throw error;
        }
    }
    /**
     * Process approval action
     */
    async processApprovalAction(request) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get workflow instance
            const workflowInstance = await this.getWorkflowInstance(request.instanceId);
            if (!workflowInstance) {
                throw new common_1.NotFoundException('Workflow instance not found');
            }
            // Validate approver authorization
            await this.validateApproverAuthorization(workflowInstance, request.stepId, request.approverId);
            // Record approval history
            const historyEntry = {
                entryId: `HIST_${Date.now()}`,
                stepId: request.stepId,
                stepName: await this.getStepName(workflowInstance.workflowId, request.stepId),
                approverId: request.approverId,
                approverName: await this.getApproverName(request.approverId),
                action: request.action,
                actionDate: new Date(),
                comments: request.comments,
                attachments: request.attachments || [],
            };
            workflowInstance.approvalHistory.push(historyEntry);
            // Process the action
            let updatedInstance;
            switch (request.action) {
                case 'APPROVE':
                    updatedInstance = await this.processApproval(workflowInstance, request, queryRunner);
                    break;
                case 'REJECT':
                    updatedInstance = await this.processRejection(workflowInstance, request, queryRunner);
                    break;
                case 'DELEGATE':
                    updatedInstance = await this.processDelegation(workflowInstance, request, queryRunner);
                    break;
                case 'REQUEST_INFO':
                    updatedInstance = await this.processInfoRequest(workflowInstance, request, queryRunner);
                    break;
                default:
                    throw new common_1.BadRequestException(`Invalid approval action: ${request.action}`);
            }
            // Update workflow instance
            await this.updateWorkflowInstance(updatedInstance);
            // Send notifications
            await this.sendActionNotifications(updatedInstance, historyEntry);
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('approval_action.processed', {
                instanceId: request.instanceId,
                action: request.action,
                approverId: request.approverId,
                currentStatus: updatedInstance.status,
            });
            this.logger.log(`Approval action processed: ${request.action} by ${request.approverId} for ${request.instanceId}`);
            return updatedInstance;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to process approval action:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Process bulk approval actions
     */
    async processBulkApprovalActions(request) {
        const results = [];
        let successful = 0;
        let failed = 0;
        for (const instanceId of request.instanceIds) {
            try {
                const actionRequest = {
                    instanceId,
                    stepId: 'CURRENT', // This should be resolved to actual step ID
                    approverId: request.approverId,
                    action: request.action,
                    comments: request.comments,
                };
                await this.processApprovalAction(actionRequest);
                results.push({ instanceId, success: true });
                successful++;
            }
            catch (error) {
                results.push({ instanceId, success: false, error: error.message });
                failed++;
                this.logger.error(`Bulk approval failed for ${instanceId}:`, error);
            }
        }
        // Emit bulk completion event
        this.eventEmitter.emit('bulk_approval.completed', {
            totalProcessed: request.instanceIds.length,
            successful,
            failed,
            action: request.action,
            approverId: request.approverId,
        });
        return { successful, failed, results };
    }
    /**
     * Get pending approvals for user
     */
    async getPendingApprovals(userId, workflowType) {
        try {
            const params = {
                approverId: userId,
                status: 'PENDING,IN_PROGRESS',
                workflowType: workflowType || undefined,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('/workflow/instances/pending', { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get pending approvals:', error);
            throw error;
        }
    }
    /**
     * Get workflow instance details
     */
    async getWorkflowInstance(instanceId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/workflow/instances/${instanceId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get workflow instance ${instanceId}:`, error);
            throw new common_1.NotFoundException('Workflow instance not found');
        }
    }
    /**
     * Cancel workflow instance
     */
    async cancelWorkflowInstance(instanceId, cancelledBy, reason) {
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`/workflow/instances/${instanceId}/cancel`, {
                cancelledBy,
                reason,
                cancelledAt: new Date(),
            }));
            // Emit event
            this.eventEmitter.emit('workflow_instance.cancelled', {
                instanceId,
                cancelledBy,
                reason,
            });
            this.logger.log(`Workflow instance ${instanceId} cancelled by ${cancelledBy}: ${reason}`);
        }
        catch (error) {
            this.logger.error('Failed to cancel workflow instance:', error);
            throw error;
        }
    }
    // Private helper methods
    async getWorkflowDefinition(workflowType, context) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/workflow/definitions/${workflowType}`, {
                params: context,
            }));
            return response.data;
        }
        catch (error) {
            // Return default workflow if not found
            return this.getDefaultWorkflowDefinition(workflowType);
        }
    }
    getDefaultWorkflowDefinition(workflowType) {
        return {
            workflowId: `DEFAULT_${workflowType}`,
            workflowName: `Default ${workflowType.replace('_', ' ')}`,
            workflowType: workflowType,
            description: `Default approval workflow for ${workflowType}`,
            isActive: true,
            steps: [{
                    stepId: 'MANAGER_APPROVAL',
                    stepName: 'Manager Approval',
                    stepOrder: 1,
                    stepType: 'ROLE_BASED',
                    requiredApprovers: 1,
                    approvers: [{
                            approverId: 'MANAGER_ROLE',
                            approverType: 'ROLE',
                            approverName: 'Department Manager',
                            delegationEnabled: true,
                            notificationPreferences: {
                                emailNotifications: true,
                                smsNotifications: false,
                                inAppNotifications: true,
                                escalationNotifications: true,
                                digestFrequency: 'IMMEDIATE',
                            },
                        }],
                    conditions: [],
                    isOptional: false,
                    timeoutHours: 24,
                    escalationActions: [{
                            actionType: 'ESCALATE_TO_MANAGER',
                            notificationTemplate: 'ESCALATION_NOTIFICATION',
                            priority: 'HIGH',
                        }],
                }],
            escalationRules: [{
                    ruleId: 'DEFAULT_ESCALATION',
                    triggerCondition: 'TIMEOUT',
                    escalationTimeHours: 24,
                    escalationActions: [{
                            actionType: 'ESCALATE_TO_MANAGER',
                            notificationTemplate: 'TIMEOUT_ESCALATION',
                            priority: 'HIGH',
                        }],
                    maxEscalationLevel: 2,
                }],
            autoApprovalRules: [],
            ghanaCompliantConfig: {
                npaApprovalRequired: true,
                customsApprovalRequired: true,
                uppfValidationRequired: true,
                vatApprovalThreshold: 10000,
                withholdingTaxApprovalRequired: true,
                complianceCheckMandatory: true,
            },
        };
    }
    async checkAutoApprovalRules(workflowDefinition, delivery) {
        for (const rule of workflowDefinition.autoApprovalRules) {
            if (!rule.isActive)
                continue;
            const conditionsMet = await this.evaluateConditions(rule.conditions, {
                amount: delivery.totalValue,
                productType: delivery.productType,
                complianceScore: 85, // This should be calculated
            });
            if (conditionsMet) {
                return {
                    shouldAutoApprove: true,
                    reason: `Auto-approved by rule: ${rule.ruleName}`,
                };
            }
        }
        return { shouldAutoApprove: false };
    }
    async evaluateConditions(conditions, context) {
        for (const condition of conditions) {
            const contextValue = context[condition.conditionType.toLowerCase().replace('_', '')];
            switch (condition.operator) {
                case 'GT':
                    if (!(contextValue > condition.value))
                        return false;
                    break;
                case 'LT':
                    if (!(contextValue < condition.value))
                        return false;
                    break;
                case 'EQ':
                    if (contextValue !== condition.value)
                        return false;
                    break;
                case 'IN':
                    if (!Array.isArray(condition.value) || !condition.value.includes(contextValue))
                        return false;
                    break;
                // Add other operators as needed
            }
        }
        return true;
    }
    async processAutoApproval(delivery, submittedBy, reason) {
        // Update delivery status directly to approved
        await this.deliveryRepository.update(delivery.id, {
            status: 'APPROVED',
            approvedBy: 'SYSTEM',
            approvalDate: new Date(),
            approvalComments: reason,
        });
        // Record in approval history
        const historyEntry = this.approvalHistoryRepository.create({
            deliveryId: delivery.id,
            tenantId: delivery.tenantId,
            stepName: 'AUTO_APPROVAL',
            approverId: 'SYSTEM',
            approverName: 'System Auto-Approval',
            action: 'APPROVED',
            actionDate: new Date(),
            comments: reason,
            isSystemAction: true,
        });
        await this.approvalHistoryRepository.save(historyEntry);
        // Emit event
        this.eventEmitter.emit('delivery.auto_approved', {
            deliveryId: delivery.id,
            reason,
            submittedBy,
        });
        return 'AUTO_APPROVED';
    }
    async assessRisk(delivery) {
        const riskFactors = [];
        let riskScore = 0;
        // Amount-based risk
        if (delivery.totalValue > 100000) {
            riskFactors.push({
                factorType: 'FINANCIAL_RISK',
                factorName: 'High Value Transaction',
                severity: 'MEDIUM',
                impact: 'Financial exposure due to high transaction value',
                probability: 0.3,
            });
            riskScore += 20;
        }
        // Product-based risk
        if (delivery.productType === 'LPG') {
            riskFactors.push({
                factorType: 'OPERATIONAL_RISK',
                factorName: 'Hazardous Material',
                severity: 'HIGH',
                impact: 'Safety and environmental risks',
                probability: 0.2,
            });
            riskScore += 30;
        }
        // Compliance risk
        if (!delivery.npaPermitNumber || !delivery.customsEntryNumber) {
            riskFactors.push({
                factorType: 'COMPLIANCE_RISK',
                factorName: 'Missing Compliance Documents',
                severity: 'HIGH',
                impact: 'Regulatory non-compliance',
                probability: 0.8,
            });
            riskScore += 25;
        }
        const riskLevel = riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';
        return {
            riskLevel: riskLevel,
            riskScore,
            riskFactors,
            mitigationActions: this.generateMitigationActions(riskFactors),
        };
    }
    async assessBulkRisk(deliveries) {
        const totalValue = deliveries.reduce((sum, d) => sum + d.totalValue, 0);
        const uniqueCustomers = new Set(deliveries.map(d => d.customerId)).size;
        const uniqueProducts = new Set(deliveries.map(d => d.productType)).size;
        const riskFactors = [];
        let riskScore = 10; // Base risk for bulk operations
        if (totalValue > 500000) {
            riskFactors.push({
                factorType: 'FINANCIAL_RISK',
                factorName: 'High Value Bulk Transaction',
                severity: 'HIGH',
                impact: 'Significant financial exposure',
                probability: 0.4,
            });
            riskScore += 30;
        }
        if (uniqueCustomers > 10) {
            riskFactors.push({
                factorType: 'OPERATIONAL_RISK',
                factorName: 'Multiple Customer Risk',
                severity: 'MEDIUM',
                impact: 'Complexity in delivery coordination',
                probability: 0.3,
            });
            riskScore += 15;
        }
        return {
            riskLevel: riskScore > 50 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
            riskScore,
            riskFactors,
            mitigationActions: this.generateMitigationActions(riskFactors),
        };
    }
    generateMitigationActions(riskFactors) {
        const actions = [];
        for (const factor of riskFactors) {
            switch (factor.factorType) {
                case 'FINANCIAL_RISK':
                    actions.push('Verify customer credit limit and payment history');
                    actions.push('Consider requiring prepayment or letter of credit');
                    break;
                case 'COMPLIANCE_RISK':
                    actions.push('Obtain all required regulatory documents before delivery');
                    actions.push('Perform compliance verification with NPA and Customs');
                    break;
                case 'OPERATIONAL_RISK':
                    actions.push('Ensure proper safety protocols and insurance coverage');
                    actions.push('Conduct pre-delivery safety inspection');
                    break;
            }
        }
        return [...new Set(actions)]; // Remove duplicates
    }
    assessEnvironmentalImpact(productType) {
        const impactMap = {
            'PMS': 'MEDIUM',
            'AGO': 'MEDIUM',
            'IFO': 'HIGH',
            'LPG': 'HIGH',
            'KEROSENE': 'MEDIUM',
            'LUBRICANTS': 'LOW',
        };
        return impactMap[productType] || 'MEDIUM';
    }
    async createWorkflowInstance(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/workflow/instances', {
                ...data,
                requestedAt: new Date(),
                status: 'PENDING',
                currentStepOrder: 1,
                escalationLevel: 0,
                slaDeadline: (0, date_fns_1.addDays)(new Date(), 2), // Default 2 days SLA
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create workflow instance:', error);
            throw new common_1.BadRequestException('Failed to create approval workflow');
        }
    }
    async sendApprovalNotifications(workflowInstance) {
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post('/notifications/approval-request', {
                workflowInstanceId: workflowInstance.instanceId,
                workflowType: workflowInstance.workflowType,
                requestedBy: workflowInstance.requestedBy,
                priority: workflowInstance.priority,
                slaDeadline: workflowInstance.slaDeadline,
                metadata: workflowInstance.metadata,
            }));
        }
        catch (error) {
            this.logger.error('Failed to send approval notifications:', error);
            // Don't throw error as workflow is already created
        }
    }
    async validateApproverAuthorization(workflowInstance, stepId, approverId) {
        // Implementation for validating approver authorization
        // This should check if the user has permission to approve at this step
    }
    async processApproval(workflowInstance, request, queryRunner) {
        // Implementation for processing approval
        // This should advance the workflow to the next step or complete it
        workflowInstance.status = 'APPROVED';
        return workflowInstance;
    }
    async processRejection(workflowInstance, request, queryRunner) {
        // Implementation for processing rejection
        workflowInstance.status = 'REJECTED';
        return workflowInstance;
    }
    async processDelegation(workflowInstance, request, queryRunner) {
        // Implementation for processing delegation
        return workflowInstance;
    }
    async processInfoRequest(workflowInstance, request, queryRunner) {
        // Implementation for processing information request
        return workflowInstance;
    }
    async updateWorkflowInstance(workflowInstance) {
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`/workflow/instances/${workflowInstance.instanceId}`, workflowInstance));
        }
        catch (error) {
            this.logger.error('Failed to update workflow instance:', error);
            throw error;
        }
    }
    async sendActionNotifications(workflowInstance, historyEntry) {
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post('/notifications/approval-action', {
                workflowInstanceId: workflowInstance.instanceId,
                action: historyEntry.action,
                approverId: historyEntry.approverId,
                approverName: historyEntry.approverName,
                comments: historyEntry.comments,
                currentStatus: workflowInstance.status,
            }));
        }
        catch (error) {
            this.logger.error('Failed to send action notifications:', error);
        }
    }
    async getStepName(workflowId, stepId) {
        // Implementation to get step name from workflow definition
        return 'Approval Step';
    }
    async getApproverName(approverId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/users/${approverId}`));
            return response.data.name;
        }
        catch (error) {
            return 'Unknown Approver';
        }
    }
};
exports.ApprovalWorkflowService = ApprovalWorkflowService;
exports.ApprovalWorkflowService = ApprovalWorkflowService = ApprovalWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_delivery_entity_1.DailyDelivery)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_approval_history_entity_1.DeliveryApprovalHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, event_emitter_1.EventEmitter2])
], ApprovalWorkflowService);
//# sourceMappingURL=approval-workflow.service.js.map