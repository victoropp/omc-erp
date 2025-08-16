import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
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
    riskScore: number;
    riskFactors: RiskFactor[];
    mitigationActions: string[];
}
export interface RiskFactor {
    factorType: 'CREDIT_RISK' | 'COMPLIANCE_RISK' | 'OPERATIONAL_RISK' | 'FINANCIAL_RISK';
    factorName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    impact: string;
    probability: number;
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
export declare class ApprovalWorkflowService {
    private readonly deliveryRepository;
    private readonly approvalHistoryRepository;
    private readonly dataSource;
    private readonly httpService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(deliveryRepository: Repository<DailyDelivery>, approvalHistoryRepository: Repository<DeliveryApprovalHistory>, dataSource: DataSource, httpService: HttpService, eventEmitter: EventEmitter2);
    /**
     * Submit delivery for approval
     */
    submitDeliveryForApproval(deliveryId: string, submittedBy: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<string>;
    /**
     * Submit bulk invoice generation for approval
     */
    submitBulkInvoiceGeneration(request: any, submittedBy: string): Promise<string>;
    /**
     * Process approval action
     */
    processApprovalAction(request: ApprovalActionRequest): Promise<WorkflowInstance>;
    /**
     * Process bulk approval actions
     */
    processBulkApprovalActions(request: BulkApprovalRequest): Promise<{
        successful: number;
        failed: number;
        results: Array<{
            instanceId: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Get pending approvals for user
     */
    getPendingApprovals(userId: string, workflowType?: string): Promise<WorkflowInstance[]>;
    /**
     * Get workflow instance details
     */
    getWorkflowInstance(instanceId: string): Promise<WorkflowInstance>;
    /**
     * Cancel workflow instance
     */
    cancelWorkflowInstance(instanceId: string, cancelledBy: string, reason: string): Promise<void>;
    private getWorkflowDefinition;
    private getDefaultWorkflowDefinition;
    private checkAutoApprovalRules;
    private evaluateConditions;
    private processAutoApproval;
    private assessRisk;
    private assessBulkRisk;
    private generateMitigationActions;
    private assessEnvironmentalImpact;
    private createWorkflowInstance;
    private sendApprovalNotifications;
    private validateApproverAuthorization;
    private processApproval;
    private processRejection;
    private processDelegation;
    private processInfoRequest;
    private updateWorkflowInstance;
    private sendActionNotifications;
    private getStepName;
    private getApproverName;
}
//# sourceMappingURL=approval-workflow.service.d.ts.map