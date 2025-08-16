import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Configuration, ConfigurationStatus, ConfigurationModule } from '../entities/configuration.entity';
import { PriceBuildupVersion, PriceComponentStatus } from '../entities/price-buildup.entity';

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  module: ConfigurationModule;
  configurationKeys: string[];
  requiredApprovers: number;
  approverRoles: string[];
  approverUsers: string[];
  isActive: boolean;
  autoApprovalThreshold?: number;
  escalationTimeHours?: number;
  escalationApprovers?: string[];
}

interface ApprovalRequest {
  id: string;
  requestType: 'CONFIGURATION' | 'PRICE_BUILDUP';
  targetId: string; // Configuration ID or PriceBuildupVersion ID
  requestedBy: string;
  requestDate: Date;
  requestReason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'EXPIRED';
  requiredApprovals: number;
  receivedApprovals: number;
  approvals: ApprovalAction[];
  escalatedDate?: Date;
  completedDate?: Date;
  expiryDate: Date;
}

interface ApprovalAction {
  id: string;
  approvalRequestId: string;
  approverUserId: string;
  approverRole: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments: string;
  actionDate: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface ApprovalConfiguration {
  id: string;
  name: string;
  module: ConfigurationModule;
  type: 'AUTOMATIC' | 'MANUAL' | 'CONDITIONAL';
  conditions: {
    impactLevel?: string[];
    valueChangeThreshold?: number;
    configurationKeys?: string[];
    userRoles?: string[];
  };
  approvalWorkflow: {
    stages: ApprovalStage[];
    parallelApproval: boolean;
    autoApprovalConditions?: any;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

interface ApprovalStage {
  stageNumber: number;
  stageName: string;
  requiredApprovers: number;
  approverRoles: string[];
  approverUsers: string[];
  timeoutHours: number;
  escalationRules?: {
    escalateAfterHours: number;
    escalationApprovers: string[];
    escalationRoles: string[];
  };
}

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);
  private approvalRules: Map<string, ApprovalRule> = new Map();
  private pendingRequests: Map<string, ApprovalRequest> = new Map();

  constructor(
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    
    @InjectRepository(PriceBuildupVersion)
    private buildupRepository: Repository<PriceBuildupVersion>,
    
    private eventEmitter: EventEmitter2,
    private entityManager: EntityManager,
  ) {
    this.initializeDefaultApprovalRules();
  }

  // ===== APPROVAL WORKFLOW MANAGEMENT =====

  async requestConfigurationApproval(
    configurationId: string,
    requestedBy: string,
    reason: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ): Promise<ApprovalRequest> {
    const configuration = await this.configRepository.findOne({
      where: { id: configurationId },
    });

    if (!configuration) {
      throw new NotFoundException(`Configuration ${configurationId} not found`);
    }

    // Check if approval is required
    const approvalRule = this.getApplicableApprovalRule(configuration);
    if (!approvalRule) {
      // Auto-approve if no rule applies
      await this.autoApproveConfiguration(configurationId, requestedBy);
      return null;
    }

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: this.generateApprovalRequestId(),
      requestType: 'CONFIGURATION',
      targetId: configurationId,
      requestedBy,
      requestDate: new Date(),
      requestReason: reason,
      priority,
      status: 'PENDING',
      requiredApprovals: approvalRule.requiredApprovers,
      receivedApprovals: 0,
      approvals: [],
      expiryDate: new Date(Date.now() + (approvalRule.escalationTimeHours || 72) * 60 * 60 * 1000),
    };

    this.pendingRequests.set(approvalRequest.id, approvalRequest);

    // Update configuration status
    await this.configRepository.update(configurationId, {
      status: ConfigurationStatus.PENDING_APPROVAL,
    });

    // Send notifications to approvers
    await this.notifyApprovers(approvalRequest, approvalRule);

    // Emit event
    this.eventEmitter.emit('approval.requested', {
      approvalRequestId: approvalRequest.id,
      type: 'CONFIGURATION',
      targetId: configurationId,
      requestedBy,
      priority,
    });

    this.logger.log(`Approval requested for configuration ${configurationId}`);
    return approvalRequest;
  }

  async requestPriceBuildupApproval(
    buildupVersionId: string,
    requestedBy: string,
    reason: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
  ): Promise<ApprovalRequest> {
    const buildupVersion = await this.buildupRepository.findOne({
      where: { id: buildupVersionId },
    });

    if (!buildupVersion) {
      throw new NotFoundException(`Price buildup version ${buildupVersionId} not found`);
    }

    if (buildupVersion.status !== PriceComponentStatus.DRAFT) {
      throw new BadRequestException('Only draft price buildup versions can be submitted for approval');
    }

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: this.generateApprovalRequestId(),
      requestType: 'PRICE_BUILDUP',
      targetId: buildupVersionId,
      requestedBy,
      requestDate: new Date(),
      requestReason: reason,
      priority,
      status: 'PENDING',
      requiredApprovals: this.getPriceBuildupRequiredApprovals(buildupVersion),
      receivedApprovals: 0,
      approvals: [],
      expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours for price buildup
    };

    this.pendingRequests.set(approvalRequest.id, approvalRequest);

    // Update price buildup status
    await this.buildupRepository.update(buildupVersionId, {
      status: PriceComponentStatus.PENDING_APPROVAL,
    });

    // Send notifications to approvers
    await this.notifyPriceBuildupApprovers(approvalRequest, buildupVersion);

    // Emit event
    this.eventEmitter.emit('approval.requested', {
      approvalRequestId: approvalRequest.id,
      type: 'PRICE_BUILDUP',
      targetId: buildupVersionId,
      requestedBy,
      priority,
    });

    this.logger.log(`Approval requested for price buildup version ${buildupVersionId}`);
    return approvalRequest;
  }

  async processApproval(
    approvalRequestId: string,
    approverUserId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    comments: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ApprovalRequest> {
    const approvalRequest = this.pendingRequests.get(approvalRequestId);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request ${approvalRequestId} not found`);
    }

    if (approvalRequest.status !== 'PENDING') {
      throw new BadRequestException('Approval request is not pending');
    }

    // Check if user is authorized to approve
    await this.validateApprovalAuthority(approvalRequest, approverUserId);

    // Check if user has already acted on this request
    const existingApproval = approvalRequest.approvals.find(a => a.approverUserId === approverUserId);
    if (existingApproval) {
      throw new BadRequestException('User has already acted on this approval request');
    }

    // Create approval action
    const approvalAction: ApprovalAction = {
      id: this.generateApprovalActionId(),
      approvalRequestId,
      approverUserId,
      approverRole: await this.getUserRole(approverUserId),
      action,
      comments,
      actionDate: new Date(),
      ipAddress,
      userAgent,
    };

    approvalRequest.approvals.push(approvalAction);

    if (action === 'REJECT' || action === 'REQUEST_CHANGES') {
      // Rejection or change request - mark as rejected
      approvalRequest.status = 'REJECTED';
      approvalRequest.completedDate = new Date();
      
      await this.handleApprovalRejection(approvalRequest, approvalAction);
    } else if (action === 'APPROVE') {
      // Approval - check if we have enough approvals
      const approvals = approvalRequest.approvals.filter(a => a.action === 'APPROVE');
      approvalRequest.receivedApprovals = approvals.length;

      if (approvalRequest.receivedApprovals >= approvalRequest.requiredApprovals) {
        // Sufficient approvals - complete the request
        approvalRequest.status = 'APPROVED';
        approvalRequest.completedDate = new Date();
        
        await this.handleApprovalCompletion(approvalRequest);
      }
    }

    this.pendingRequests.set(approvalRequestId, approvalRequest);

    // Emit event
    this.eventEmitter.emit('approval.processed', {
      approvalRequestId,
      action,
      approverUserId,
      status: approvalRequest.status,
    });

    this.logger.log(`Approval ${action.toLowerCase()} processed for request ${approvalRequestId}`);
    return approvalRequest;
  }

  async getApprovalRequest(approvalRequestId: string): Promise<ApprovalRequest> {
    const approvalRequest = this.pendingRequests.get(approvalRequestId);
    if (!approvalRequest) {
      throw new NotFoundException(`Approval request ${approvalRequestId} not found`);
    }
    return approvalRequest;
  }

  async getUserPendingApprovals(userId: string): Promise<ApprovalRequest[]> {
    const pendingApprovals: ApprovalRequest[] = [];
    
    for (const request of this.pendingRequests.values()) {
      if (request.status === 'PENDING') {
        const canApprove = await this.canUserApprove(request, userId);
        if (canApprove) {
          pendingApprovals.push(request);
        }
      }
    }

    return pendingApprovals.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  async getApprovalHistory(
    userId?: string,
    type?: 'CONFIGURATION' | 'PRICE_BUILDUP',
    status?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<ApprovalRequest[]> {
    let requests = Array.from(this.pendingRequests.values());

    if (userId) {
      requests = requests.filter(r => 
        r.requestedBy === userId || 
        r.approvals.some(a => a.approverUserId === userId)
      );
    }

    if (type) {
      requests = requests.filter(r => r.requestType === type);
    }

    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    if (fromDate) {
      requests = requests.filter(r => r.requestDate >= fromDate);
    }

    if (toDate) {
      requests = requests.filter(r => r.requestDate <= toDate);
    }

    return requests.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  // ===== PRIVATE HELPER METHODS =====

  private async autoApproveConfiguration(configurationId: string, approvedBy: string): Promise<void> {
    await this.configRepository.update(configurationId, {
      status: ConfigurationStatus.ACTIVE,
      approvedBy,
      approvalDate: new Date(),
    });

    this.eventEmitter.emit('approval.auto-approved', {
      type: 'CONFIGURATION',
      targetId: configurationId,
      approvedBy,
    });
  }

  private getApplicableApprovalRule(configuration: Configuration): ApprovalRule | null {
    for (const rule of this.approvalRules.values()) {
      if (rule.module === configuration.module && rule.isActive) {
        if (rule.configurationKeys.length === 0 || rule.configurationKeys.includes(configuration.key)) {
          return rule;
        }
      }
    }
    return null;
  }

  private getPriceBuildupRequiredApprovals(buildupVersion: PriceBuildupVersion): number {
    // High priority items require more approvals
    if (buildupVersion.productType === 'PETROL' || buildupVersion.productType === 'DIESEL') {
      return 2; // Major fuel types require 2 approvals
    }
    return 1; // Other products require 1 approval
  }

  private async validateApprovalAuthority(request: ApprovalRequest, userId: string): Promise<void> {
    const canApprove = await this.canUserApprove(request, userId);
    if (!canApprove) {
      throw new ForbiddenException('User is not authorized to approve this request');
    }
  }

  private async canUserApprove(request: ApprovalRequest, userId: string): Promise<boolean> {
    // Check if user has already acted
    const hasActed = request.approvals.some(a => a.approverUserId === userId);
    if (hasActed) return false;

    // Check if user is the requester
    if (request.requestedBy === userId) return false;

    // For this implementation, we'll assume users with certain roles can approve
    const userRole = await this.getUserRole(userId);
    const approverRoles = ['admin', 'pricing_approver', 'pricing_manager'];
    
    return approverRoles.includes(userRole);
  }

  private async getUserRole(userId: string): Promise<string> {
    // This would typically query a user service or database
    // For now, we'll return a default role
    return 'pricing_manager';
  }

  private async handleApprovalCompletion(request: ApprovalRequest): Promise<void> {
    if (request.requestType === 'CONFIGURATION') {
      await this.configRepository.update(request.targetId, {
        status: ConfigurationStatus.ACTIVE,
        approvedBy: request.approvals[request.approvals.length - 1].approverUserId,
        approvalDate: new Date(),
      });
    } else if (request.requestType === 'PRICE_BUILDUP') {
      await this.buildupRepository.update(request.targetId, {
        status: PriceComponentStatus.ACTIVE,
        approvedBy: request.approvals[request.approvals.length - 1].approverUserId,
        approvalDate: new Date(),
      });
    }

    this.eventEmitter.emit('approval.completed', {
      approvalRequestId: request.id,
      type: request.requestType,
      targetId: request.targetId,
      approvedBy: request.approvals[request.approvals.length - 1].approverUserId,
    });
  }

  private async handleApprovalRejection(request: ApprovalRequest, rejectionAction: ApprovalAction): Promise<void> {
    if (request.requestType === 'CONFIGURATION') {
      await this.configRepository.update(request.targetId, {
        status: ConfigurationStatus.DRAFT,
      });
    } else if (request.requestType === 'PRICE_BUILDUP') {
      await this.buildupRepository.update(request.targetId, {
        status: PriceComponentStatus.DRAFT,
      });
    }

    this.eventEmitter.emit('approval.rejected', {
      approvalRequestId: request.id,
      type: request.requestType,
      targetId: request.targetId,
      rejectedBy: rejectionAction.approverUserId,
      reason: rejectionAction.comments,
    });
  }

  private async notifyApprovers(request: ApprovalRequest, rule: ApprovalRule): Promise<void> {
    // This would typically send emails, push notifications, etc.
    this.logger.log(`Notifying approvers for request ${request.id}`);
  }

  private async notifyPriceBuildupApprovers(request: ApprovalRequest, buildupVersion: PriceBuildupVersion): Promise<void> {
    // This would typically send emails, push notifications, etc.
    this.logger.log(`Notifying price buildup approvers for request ${request.id}`);
  }

  private generateApprovalRequestId(): string {
    return `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateApprovalActionId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultApprovalRules(): void {
    const defaultRules: ApprovalRule[] = [
      {
        id: 'pricing-critical',
        name: 'Critical Pricing Configuration',
        description: 'Requires approval for critical pricing configurations',
        module: ConfigurationModule.PRICING_BUILDUP,
        configurationKeys: [],
        requiredApprovers: 2,
        approverRoles: ['admin', 'pricing_approver'],
        approverUsers: [],
        isActive: true,
        escalationTimeHours: 24,
      },
      {
        id: 'station-config',
        name: 'Station Configuration Changes',
        description: 'Requires approval for station configuration changes',
        module: ConfigurationModule.STATION_CONFIGURATION,
        configurationKeys: [],
        requiredApprovers: 1,
        approverRoles: ['admin', 'station_manager'],
        approverUsers: [],
        isActive: true,
        escalationTimeHours: 48,
      },
    ];

    for (const rule of defaultRules) {
      this.approvalRules.set(rule.id, rule);
    }
  }

  // ===== ESCALATION AND TIMEOUT HANDLING =====

  async processEscalations(): Promise<void> {
    const now = new Date();
    
    for (const request of this.pendingRequests.values()) {
      if (request.status === 'PENDING' && request.expiryDate <= now) {
        await this.escalateApprovalRequest(request);
      }
    }
  }

  private async escalateApprovalRequest(request: ApprovalRequest): Promise<void> {
    request.status = 'ESCALATED';
    request.escalatedDate = new Date();
    
    this.eventEmitter.emit('approval.escalated', {
      approvalRequestId: request.id,
      type: request.requestType,
      targetId: request.targetId,
      escalatedDate: request.escalatedDate,
    });

    this.logger.warn(`Approval request ${request.id} escalated due to timeout`);
  }

  // ===== STATISTICS AND REPORTING =====

  async getApprovalStatistics(fromDate?: Date, toDate?: Date): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    escalatedRequests: number;
    averageApprovalTime: number;
  }> {
    let requests = Array.from(this.pendingRequests.values());

    if (fromDate) {
      requests = requests.filter(r => r.requestDate >= fromDate);
    }

    if (toDate) {
      requests = requests.filter(r => r.requestDate <= toDate);
    }

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const approvedRequests = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedRequests = requests.filter(r => r.status === 'REJECTED').length;
    const escalatedRequests = requests.filter(r => r.status === 'ESCALATED').length;

    const completedRequests = requests.filter(r => r.completedDate);
    const totalApprovalTime = completedRequests.reduce((sum, r) => {
      return sum + (r.completedDate.getTime() - r.requestDate.getTime());
    }, 0);
    
    const averageApprovalTime = completedRequests.length > 0 
      ? totalApprovalTime / completedRequests.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      escalatedRequests,
      averageApprovalTime,
    };
  }
}