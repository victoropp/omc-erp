import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { addDays, differenceInHours } from 'date-fns';

import { DailyDelivery } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryApprovalHistory } from '../daily-delivery/entities/delivery-approval-history.entity';

export interface ApprovalWorkflowDefinition {
  workflowId: string;
  workflowName: string;
  workflowType: 'DELIVERY_APPROVAL' | 'SUPPLIER_INVOICE_APPROVAL' | 'CUSTOMER_INVOICE_APPROVAL' | 'BULK_INVOICE_APPROVAL' | 'UPPF_CLAIM_APPROVAL';
  description: string;
  isActive: boolean;
  steps: ApprovalStep[];
  escalationRules: EscalationRule[];
  autoApprovalRules: AutoApprovalRule[];
  ghanaCompliantConfig: GhanaComplianceConfig;
}

export interface ApprovalStep {
  stepId: string;
  stepName: string;
  stepOrder: number;
  stepType: 'INDIVIDUAL' | 'GROUP' | 'ROLE_BASED' | 'SYSTEM';
  requiredApprovers: number;
  approvers: ApproverInfo[];
  conditions: ApprovalCondition[];
  isOptional: boolean;
  timeoutHours: number;
  escalationActions: EscalationAction[];
}

export interface ApproverInfo {
  approverId: string;
  approverType: 'USER' | 'ROLE' | 'SYSTEM';
  approverName: string;
  email?: string;
  alternateApproverId?: string;
  delegationEnabled: boolean;
  notificationPreferences: NotificationPreferences;
}

export interface ApprovalCondition {
  conditionType: 'AMOUNT_THRESHOLD' | 'CREDIT_LIMIT' | 'CUSTOMER_RATING' | 'PRODUCT_TYPE' | 'COMPLIANCE_SCORE';
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'IN' | 'NOT_IN';
  value: any;
  description: string;
}

export interface EscalationRule {
  ruleId: string;
  triggerCondition: 'TIMEOUT' | 'REJECTION' | 'NON_RESPONSE' | 'COMPLIANCE_FAILURE';
  escalationTimeHours: number;
  escalationActions: EscalationAction[];
  maxEscalationLevel: number;
}

export interface EscalationAction {
  actionType: 'NOTIFY' | 'REASSIGN' | 'AUTO_APPROVE' | 'AUTO_REJECT' | 'ESCALATE_TO_MANAGER';
  targetUserId?: string;
  targetRoleId?: string;
  notificationTemplate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AutoApprovalRule {
  ruleId: string;
  ruleName: string;
  conditions: ApprovalCondition[];
  applicableWorkflowTypes: string[];
  isActive: boolean;
  ghanaSpecific: boolean;
}

export interface GhanaComplianceConfig {
  npaApprovalRequired: boolean;
  customsApprovalRequired: boolean;
  uppfValidationRequired: boolean;
  vatApprovalThreshold: number;
  withholdingTaxApprovalRequired: boolean;
  complianceCheckMandatory: boolean;
}

export interface WorkflowInstance {
  instanceId: string;
  workflowId: string;
  workflowType: string;
  sourceDocumentId: string;
  sourceDocumentType: string;
  requestedBy: string;
  requestedAt: Date;
  currentStepId: string;
  currentStepOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'TIMEOUT' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approvalHistory: ApprovalHistoryEntry[];
  attachments: WorkflowAttachment[];
  metadata: WorkflowMetadata;
  slaDeadline: Date;
  escalationLevel: number;
  ghanaComplianceStatus: GhanaComplianceStatus;
}

export interface ApprovalHistoryEntry {
  entryId: string;
  stepId: string;
  stepName: string;
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED' | 'DELEGATED' | 'ESCALATED' | 'TIMEOUT' | 'SYSTEM_APPROVED';
  actionDate: Date;
  comments: string;
  attachments: string[];
  ipAddress?: string;
  userAgent?: string;
  delegatedTo?: string;
  originalApproverId?: string;
}

export interface WorkflowAttachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
  isRequired: boolean;
  ghanaComplianceDocument: boolean;
}

export interface WorkflowMetadata {
  tenantId: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  productType?: string;
  deliveryDate?: Date;
  businessUnit?: string;
  costCenter?: string;
  urgentRequest: boolean;
  businessJustification?: string;
  riskAssessment?: RiskAssessment;
  ghanaSpecificData?: GhanaSpecificMetadata;
}

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  riskFactors: RiskFactor[];
  mitigationActions: string[];
}

export interface RiskFactor {
  factorType: 'CREDIT_RISK' | 'COMPLIANCE_RISK' | 'OPERATIONAL_RISK' | 'FINANCIAL_RISK';
  factorName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: string;
  probability: number; // 0-1
}

export interface GhanaSpecificMetadata {
  npaPermitNumber?: string;
  customsEntryNumber?: string;
  uppfEligible: boolean;
  petroleumTaxAmount: number;
  totalGhanaTaxes: number;
  complianceScore: number;
  environmentalImpact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GhanaComplianceStatus {
  isCompliant: boolean;
  npaPermitValid: boolean;
  customsEntryValid: boolean;
  taxCalculationsValid: boolean;
  complianceScore: number;
  missingDocuments: string[];
  complianceCheckedBy?: string;
  complianceCheckedAt?: Date;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  escalationNotifications: boolean;
  digestFrequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export interface ApprovalActionRequest {
  instanceId: string;
  stepId: string;
  approverId: string;
  action: 'APPROVE' | 'REJECT' | 'DELEGATE' | 'REQUEST_INFO';
  comments: string;
  attachments?: string[];
  delegateToUserId?: string;
  conditionalApproval?: boolean;
  conditions?: string[];
}

export interface BulkApprovalRequest {
  instanceIds: string[];
  action: 'APPROVE' | 'REJECT';
  comments: string;
  approverId: string;
  skipValidation?: boolean;
}

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);

  constructor(
    @InjectRepository(DailyDelivery)
    private readonly deliveryRepository: Repository<DailyDelivery>,
    @InjectRepository(DeliveryApprovalHistory)
    private readonly approvalHistoryRepository: Repository<DeliveryApprovalHistory>,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Submit delivery for approval
   */
  async submitDeliveryForApproval(deliveryId: string, submittedBy: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): Promise<string> {
    try {
      const delivery = await this.deliveryRepository.findOne({
        where: { id: deliveryId },
        relations: ['lineItems'],
      });

      if (!delivery) {
        throw new NotFoundException('Delivery not found');
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
      const metadata: WorkflowMetadata = {
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

    } catch (error) {
      this.logger.error('Failed to submit delivery for approval:', error);
      throw error;
    }
  }

  /**
   * Submit bulk invoice generation for approval
   */
  async submitBulkInvoiceGeneration(request: any, submittedBy: string): Promise<string> {
    try {
      // Get deliveries for validation
      const deliveries = await this.deliveryRepository.find({
        where: { id: { $in: request.deliveryIds } as any },
      });

      if (deliveries.length !== request.deliveryIds.length) {
        throw new BadRequestException('Some deliveries not found');
      }

      // Calculate total amount
      const totalAmount = deliveries.reduce((sum, delivery) => sum + delivery.totalValue, 0);

      // Build metadata
      const metadata: WorkflowMetadata = {
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

    } catch (error) {
      this.logger.error('Failed to submit bulk invoice generation for approval:', error);
      throw error;
    }
  }

  /**
   * Process approval action
   */
  async processApprovalAction(request: ApprovalActionRequest): Promise<WorkflowInstance> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get workflow instance
      const workflowInstance = await this.getWorkflowInstance(request.instanceId);
      if (!workflowInstance) {
        throw new NotFoundException('Workflow instance not found');
      }

      // Validate approver authorization
      await this.validateApproverAuthorization(workflowInstance, request.stepId, request.approverId);

      // Record approval history
      const historyEntry: ApprovalHistoryEntry = {
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
      let updatedInstance: WorkflowInstance;
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
          throw new BadRequestException(`Invalid approval action: ${request.action}`);
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

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to process approval action:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process bulk approval actions
   */
  async processBulkApprovalActions(request: BulkApprovalRequest): Promise<{
    successful: number;
    failed: number;
    results: Array<{ instanceId: string; success: boolean; error?: string }>;
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const instanceId of request.instanceIds) {
      try {
        const actionRequest: ApprovalActionRequest = {
          instanceId,
          stepId: 'CURRENT', // This should be resolved to actual step ID
          approverId: request.approverId,
          action: request.action,
          comments: request.comments,
        };

        await this.processApprovalAction(actionRequest);
        results.push({ instanceId, success: true });
        successful++;
      } catch (error) {
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
  async getPendingApprovals(userId: string, workflowType?: string): Promise<WorkflowInstance[]> {
    try {
      const params = {
        approverId: userId,
        status: 'PENDING,IN_PROGRESS',
        workflowType: workflowType || undefined,
      };

      const response = await firstValueFrom(
        this.httpService.get('/workflow/instances/pending', { params })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get pending approvals:', error);
      throw error;
    }
  }

  /**
   * Get workflow instance details
   */
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/workflow/instances/${instanceId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get workflow instance ${instanceId}:`, error);
      throw new NotFoundException('Workflow instance not found');
    }
  }

  /**
   * Cancel workflow instance
   */
  async cancelWorkflowInstance(instanceId: string, cancelledBy: string, reason: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(`/workflow/instances/${instanceId}/cancel`, {
          cancelledBy,
          reason,
          cancelledAt: new Date(),
        })
      );

      // Emit event
      this.eventEmitter.emit('workflow_instance.cancelled', {
        instanceId,
        cancelledBy,
        reason,
      });

      this.logger.log(`Workflow instance ${instanceId} cancelled by ${cancelledBy}: ${reason}`);
    } catch (error) {
      this.logger.error('Failed to cancel workflow instance:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getWorkflowDefinition(workflowType: string, context: any): Promise<ApprovalWorkflowDefinition> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/workflow/definitions/${workflowType}`, {
          params: context,
        })
      );
      return response.data;
    } catch (error) {
      // Return default workflow if not found
      return this.getDefaultWorkflowDefinition(workflowType);
    }
  }

  private getDefaultWorkflowDefinition(workflowType: string): ApprovalWorkflowDefinition {
    return {
      workflowId: `DEFAULT_${workflowType}`,
      workflowName: `Default ${workflowType.replace('_', ' ')}`,
      workflowType: workflowType as any,
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

  private async checkAutoApprovalRules(
    workflowDefinition: ApprovalWorkflowDefinition,
    delivery: DailyDelivery
  ): Promise<{ shouldAutoApprove: boolean; reason?: string }> {
    for (const rule of workflowDefinition.autoApprovalRules) {
      if (!rule.isActive) continue;

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

  private async evaluateConditions(conditions: ApprovalCondition[], context: any): Promise<boolean> {
    for (const condition of conditions) {
      const contextValue = context[condition.conditionType.toLowerCase().replace('_', '')];
      
      switch (condition.operator) {
        case 'GT':
          if (!(contextValue > condition.value)) return false;
          break;
        case 'LT':
          if (!(contextValue < condition.value)) return false;
          break;
        case 'EQ':
          if (contextValue !== condition.value) return false;
          break;
        case 'IN':
          if (!Array.isArray(condition.value) || !condition.value.includes(contextValue)) return false;
          break;
        // Add other operators as needed
      }
    }

    return true;
  }

  private async processAutoApproval(delivery: DailyDelivery, submittedBy: string, reason: string): Promise<string> {
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

  private async assessRisk(delivery: DailyDelivery): Promise<RiskAssessment> {
    const riskFactors: RiskFactor[] = [];
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
      riskLevel: riskLevel as any,
      riskScore,
      riskFactors,
      mitigationActions: this.generateMitigationActions(riskFactors),
    };
  }

  private async assessBulkRisk(deliveries: DailyDelivery[]): Promise<RiskAssessment> {
    const totalValue = deliveries.reduce((sum, d) => sum + d.totalValue, 0);
    const uniqueCustomers = new Set(deliveries.map(d => d.customerId)).size;
    const uniqueProducts = new Set(deliveries.map(d => d.productType)).size;

    const riskFactors: RiskFactor[] = [];
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

  private generateMitigationActions(riskFactors: RiskFactor[]): string[] {
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

  private assessEnvironmentalImpact(productType: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const impactMap = {
      'PMS': 'MEDIUM',
      'AGO': 'MEDIUM',
      'IFO': 'HIGH',
      'LPG': 'HIGH',
      'KEROSENE': 'MEDIUM',
      'LUBRICANTS': 'LOW',
    };
    return impactMap[productType] as any || 'MEDIUM';
  }

  private async createWorkflowInstance(data: {
    workflowId: string;
    workflowType: string;
    sourceDocumentId: string;
    sourceDocumentType: string;
    requestedBy: string;
    priority: string;
    metadata: WorkflowMetadata;
  }): Promise<WorkflowInstance> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/workflow/instances', {
          ...data,
          requestedAt: new Date(),
          status: 'PENDING',
          currentStepOrder: 1,
          escalationLevel: 0,
          slaDeadline: addDays(new Date(), 2), // Default 2 days SLA
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create workflow instance:', error);
      throw new BadRequestException('Failed to create approval workflow');
    }
  }

  private async sendApprovalNotifications(workflowInstance: WorkflowInstance): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/notifications/approval-request', {
          workflowInstanceId: workflowInstance.instanceId,
          workflowType: workflowInstance.workflowType,
          requestedBy: workflowInstance.requestedBy,
          priority: workflowInstance.priority,
          slaDeadline: workflowInstance.slaDeadline,
          metadata: workflowInstance.metadata,
        })
      );
    } catch (error) {
      this.logger.error('Failed to send approval notifications:', error);
      // Don't throw error as workflow is already created
    }
  }

  private async validateApproverAuthorization(
    workflowInstance: WorkflowInstance,
    stepId: string,
    approverId: string
  ): Promise<void> {
    // Implementation for validating approver authorization
    // This should check if the user has permission to approve at this step
  }

  private async processApproval(
    workflowInstance: WorkflowInstance,
    request: ApprovalActionRequest,
    queryRunner: any
  ): Promise<WorkflowInstance> {
    // Implementation for processing approval
    // This should advance the workflow to the next step or complete it
    workflowInstance.status = 'APPROVED';
    return workflowInstance;
  }

  private async processRejection(
    workflowInstance: WorkflowInstance,
    request: ApprovalActionRequest,
    queryRunner: any
  ): Promise<WorkflowInstance> {
    // Implementation for processing rejection
    workflowInstance.status = 'REJECTED';
    return workflowInstance;
  }

  private async processDelegation(
    workflowInstance: WorkflowInstance,
    request: ApprovalActionRequest,
    queryRunner: any
  ): Promise<WorkflowInstance> {
    // Implementation for processing delegation
    return workflowInstance;
  }

  private async processInfoRequest(
    workflowInstance: WorkflowInstance,
    request: ApprovalActionRequest,
    queryRunner: any
  ): Promise<WorkflowInstance> {
    // Implementation for processing information request
    return workflowInstance;
  }

  private async updateWorkflowInstance(workflowInstance: WorkflowInstance): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.put(`/workflow/instances/${workflowInstance.instanceId}`, workflowInstance)
      );
    } catch (error) {
      this.logger.error('Failed to update workflow instance:', error);
      throw error;
    }
  }

  private async sendActionNotifications(
    workflowInstance: WorkflowInstance,
    historyEntry: ApprovalHistoryEntry
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post('/notifications/approval-action', {
          workflowInstanceId: workflowInstance.instanceId,
          action: historyEntry.action,
          approverId: historyEntry.approverId,
          approverName: historyEntry.approverName,
          comments: historyEntry.comments,
          currentStatus: workflowInstance.status,
        })
      );
    } catch (error) {
      this.logger.error('Failed to send action notifications:', error);
    }
  }

  private async getStepName(workflowId: string, stepId: string): Promise<string> {
    // Implementation to get step name from workflow definition
    return 'Approval Step';
  }

  private async getApproverName(approverId: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/users/${approverId}`)
      );
      return response.data.name;
    } catch (error) {
      return 'Unknown Approver';
    }
  }
}