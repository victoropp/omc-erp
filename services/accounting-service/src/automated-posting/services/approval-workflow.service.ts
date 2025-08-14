import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ApprovalWorkflow, WorkflowStatus, WorkflowType, ApprovalStep } from '../entities/approval-workflow.entity';
import { WorkflowApproval, ApprovalAction, ApprovalStatus } from '../entities/workflow-approval.entity';

export interface InitiateApprovalData {
  workflow_type: WorkflowType;
  workflow_name?: string;
  source_document_type?: string;
  source_document_id?: string;
  reference_id?: string;
  amount?: number;
  business_context: Record<string, any>;
  approval_data?: Record<string, any>;
  initiated_by?: string;
  custom_approval_steps?: ApprovalStep[];
}

export interface ApprovalDecision {
  workflow_id: string;
  step_number: number;
  approver_user: string;
  action: ApprovalAction;
  comments?: string;
  supporting_documents?: Array<{
    document_name: string;
    document_url: string;
    document_type: string;
  }>;
  digital_signature?: string;
}

export interface WorkflowMetrics {
  total_workflows: number;
  pending_workflows: number;
  approved_workflows: number;
  rejected_workflows: number;
  average_approval_time: number;
  sla_breach_rate: number;
  approval_trends: Array<{
    date: string;
    initiated: number;
    completed: number;
    avg_time_hours: number;
  }>;
}

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);

  constructor(
    @InjectRepository(ApprovalWorkflow)
    private workflowRepository: Repository<ApprovalWorkflow>,
    @InjectRepository(WorkflowApproval)
    private approvalRepository: Repository<WorkflowApproval>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate approval workflow
   */
  async initiateApproval(data: InitiateApprovalData): Promise<string> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // Determine approval steps
        const approvalSteps = data.custom_approval_steps || 
                             await this.getDefaultApprovalSteps(data.workflow_type, data.amount);

        if (approvalSteps.length === 0) {
          throw new Error(`No approval steps configured for workflow type: ${data.workflow_type}`);
        }

        // Create workflow
        const workflow = manager.create(ApprovalWorkflow, {
          workflow_type: data.workflow_type,
          workflow_name: data.workflow_name || `${data.workflow_type} Approval`,
          description: `Approval workflow for ${data.source_document_type || 'document'}`,
          source_document_type: data.source_document_type,
          source_document_id: data.source_document_id,
          reference_id: data.reference_id,
          amount: data.amount,
          status: WorkflowStatus.PENDING,
          approval_steps: approvalSteps,
          current_step: 1,
          business_context: data.business_context,
          initiated_by: data.initiated_by || 'SYSTEM',
          initiated_at: new Date(),
          expires_at: this.calculateExpiryDate(approvalSteps),
          sla_hours: this.calculateSLAHours(approvalSteps),
          created_by: data.initiated_by || 'SYSTEM',
        });

        const savedWorkflow = await manager.save(ApprovalWorkflow, workflow);

        // Create initial approval step
        await this.createApprovalStep(manager, savedWorkflow, 1);

        // Emit workflow initiated event
        this.eventEmitter.emit('workflow.initiated', {
          workflowId: savedWorkflow.workflow_id,
          workflowType: data.workflow_type,
          initiatedBy: data.initiated_by,
          amount: data.amount,
        });

        this.logger.log(`Approval workflow initiated: ${savedWorkflow.workflow_id}`);
        return savedWorkflow.workflow_id;

      } catch (error) {
        this.logger.error(`Error initiating approval workflow: ${error.message}`, error.stack);
        throw error;
      }
    });
  }

  /**
   * Process approval decision
   */
  async processApprovalDecision(decision: ApprovalDecision): Promise<{
    workflowCompleted: boolean;
    finalStatus: WorkflowStatus;
    nextStep?: number;
  }> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // Get workflow with current approvals
        const workflow = await manager.findOne(ApprovalWorkflow, {
          where: { workflow_id: decision.workflow_id },
          relations: ['approvals'],
        });

        if (!workflow) {
          throw new Error(`Workflow not found: ${decision.workflow_id}`);
        }

        if (workflow.status !== WorkflowStatus.PENDING) {
          throw new Error(`Workflow is not in pending status: ${workflow.status}`);
        }

        // Find the approval record
        const approval = await manager.findOne(WorkflowApproval, {
          where: {
            workflow_id: decision.workflow_id,
            step_number: decision.step_number,
            approver_user: decision.approver_user,
            status: ApprovalStatus.PENDING,
          },
        });

        if (!approval) {
          throw new Error(`Approval record not found or not pending`);
        }

        // Update approval record
        await manager.update(WorkflowApproval, approval.approval_id, {
          status: ApprovalStatus.COMPLETED,
          action: decision.action,
          comments: decision.comments,
          supporting_documents: decision.supporting_documents,
          digital_signature: decision.digital_signature,
          responded_at: new Date(),
          response_time_hours: this.calculateResponseTime(approval.assigned_at),
          ip_address: decision['ip_address'],
          user_agent: decision['user_agent'],
          geolocation: decision['geolocation'],
        });

        // Determine next action based on decision
        let workflowCompleted = false;
        let finalStatus = WorkflowStatus.PENDING;
        let nextStep: number | undefined;

        if (decision.action === ApprovalAction.REJECTED) {
          // Workflow rejected
          workflowCompleted = true;
          finalStatus = WorkflowStatus.REJECTED;
          
          await manager.update(ApprovalWorkflow, workflow.workflow_id, {
            status: WorkflowStatus.REJECTED,
            completed_at: new Date(),
            completion_reason: `Rejected by ${decision.approver_user}: ${decision.comments || 'No reason provided'}`,
          });

        } else if (decision.action === ApprovalAction.APPROVED) {
          // Check if this step is complete
          const stepComplete = await this.checkStepCompletion(
            manager, 
            workflow.workflow_id, 
            decision.step_number
          );

          if (stepComplete) {
            // Move to next step or complete workflow
            const hasNextStep = decision.step_number < workflow.approval_steps.length;
            
            if (hasNextStep) {
              nextStep = decision.step_number + 1;
              await manager.update(ApprovalWorkflow, workflow.workflow_id, {
                current_step: nextStep,
              });

              // Create next approval step
              await this.createApprovalStep(manager, workflow, nextStep);
            } else {
              // Workflow approved
              workflowCompleted = true;
              finalStatus = WorkflowStatus.APPROVED;
              
              await manager.update(ApprovalWorkflow, workflow.workflow_id, {
                status: WorkflowStatus.APPROVED,
                completed_at: new Date(),
                completion_reason: 'All approvals completed',
              });
            }
          }

        } else if (decision.action === ApprovalAction.RETURNED) {
          // Return to previous step or initiator
          workflowCompleted = true;
          finalStatus = WorkflowStatus.REJECTED; // Treat as rejection for now
          
          await manager.update(ApprovalWorkflow, workflow.workflow_id, {
            status: WorkflowStatus.REJECTED,
            completed_at: new Date(),
            completion_reason: `Returned by ${decision.approver_user}: ${decision.comments || 'Returned for revision'}`,
          });
        }

        // Emit approval decision event
        this.eventEmitter.emit('approval.decision', {
          workflowId: decision.workflow_id,
          stepNumber: decision.step_number,
          approver: decision.approver_user,
          action: decision.action,
          workflowCompleted,
          finalStatus,
        });

        // If workflow completed, emit completion event
        if (workflowCompleted) {
          this.eventEmitter.emit('workflow.completed', {
            workflowId: decision.workflow_id,
            finalStatus,
            completedBy: decision.approver_user,
            completedAt: new Date(),
          });
        }

        this.logger.log(
          `Approval decision processed: ${decision.workflow_id}, Step: ${decision.step_number}, ` +
          `Action: ${decision.action}, Completed: ${workflowCompleted}`
        );

        return {
          workflowCompleted,
          finalStatus,
          nextStep,
        };

      } catch (error) {
        this.logger.error(`Error processing approval decision: ${error.message}`, error.stack);
        throw error;
      }
    });
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(
    userId: string,
    roles: string[] = [],
    limit: number = 50
  ): Promise<Array<{
    workflow: ApprovalWorkflow;
    approval: WorkflowApproval;
    business_context: Record<string, any>;
    time_remaining_hours: number;
  }>> {
    try {
      const queryBuilder = this.approvalRepository
        .createQueryBuilder('approval')
        .leftJoinAndSelect('approval.workflow', 'workflow')
        .where('approval.status = :status', { status: ApprovalStatus.PENDING })
        .andWhere('workflow.status = :workflowStatus', { workflowStatus: WorkflowStatus.PENDING })
        .andWhere(
          '(approval.approver_user = :userId OR approval.approver_role IN (:...roles))',
          { userId, roles }
        )
        .orderBy('approval.assigned_at', 'ASC')
        .limit(limit);

      const approvals = await queryBuilder.getMany();

      return approvals.map(approval => ({
        workflow: approval.workflow,
        approval,
        business_context: approval.workflow.business_context,
        time_remaining_hours: this.calculateTimeRemaining(approval.expires_at),
      }));

    } catch (error) {
      this.logger.error(`Error fetching pending approvals: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delegate approval to another user
   */
  async delegateApproval(
    approvalId: string,
    delegatedBy: string,
    delegatedTo: string,
    reason: string,
    expiryDate?: Date
  ): Promise<void> {
    try {
      await this.approvalRepository.update(approvalId, {
        approver_user: delegatedTo,
        delegated_by: delegatedBy,
        delegated_to: delegatedTo,
        delegated_at: new Date(),
        delegation_reason: reason,
        expires_at: expiryDate || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days default
      });

      // Emit delegation event
      this.eventEmitter.emit('approval.delegated', {
        approvalId,
        delegatedBy,
        delegatedTo,
        reason,
      });

      this.logger.log(`Approval delegated: ${approvalId} from ${delegatedBy} to ${delegatedTo}`);

    } catch (error) {
      this.logger.error(`Error delegating approval: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Escalate approval to higher level
   */
  async escalateApproval(
    approvalId: string,
    escalationReason: string
  ): Promise<void> {
    try {
      const approval = await this.approvalRepository.findOne({
        where: { approval_id: approvalId },
        relations: ['workflow'],
      });

      if (!approval) {
        throw new Error(`Approval not found: ${approvalId}`);
      }

      // Find escalation target from workflow escalation matrix
      const escalationMatrix = approval.workflow.escalation_matrix;
      if (!escalationMatrix || escalationMatrix.length === 0) {
        throw new Error('No escalation matrix configured for this workflow');
      }

      // Get next level escalation
      const nextEscalation = escalationMatrix.find(e => e.level > (approval.step_number || 1));
      if (!nextEscalation) {
        throw new Error('No escalation level available');
      }

      await this.approvalRepository.update(approvalId, {
        is_escalated: true,
        escalated_from: approval.approver_user,
        escalated_at: new Date(),
        escalation_reason,
        approver_role: nextEscalation.escalate_to_role,
        approver_user: nextEscalation.escalate_to_users?.[0] || approval.approver_user,
        expires_at: new Date(Date.now() + (nextEscalation.timeout_hours * 60 * 60 * 1000)),
      });

      // Emit escalation event
      this.eventEmitter.emit('approval.escalated', {
        approvalId,
        escalatedFrom: approval.approver_user,
        escalatedTo: nextEscalation.escalate_to_role,
        reason: escalationReason,
      });

      this.logger.log(`Approval escalated: ${approvalId} to ${nextEscalation.escalate_to_role}`);

    } catch (error) {
      this.logger.error(`Error escalating approval: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process timeout approvals (scheduled job)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processTimeoutApprovals(): Promise<void> {
    try {
      this.logger.log('Processing timeout approvals');

      // Find expired approvals
      const expiredApprovals = await this.approvalRepository.find({
        where: {
          status: ApprovalStatus.PENDING,
          expires_at: LessThan(new Date()),
        },
        relations: ['workflow'],
      });

      for (const approval of expiredApprovals) {
        try {
          // Auto-escalate if escalation is enabled
          if (approval.workflow.enable_auto_escalation) {
            await this.escalateApproval(approval.approval_id, 'Automatic escalation due to timeout');
          } else {
            // Mark as expired and notify
            await this.approvalRepository.update(approval.approval_id, {
              status: ApprovalStatus.EXPIRED,
            });

            // Mark workflow as timeout if no other pending approvals
            const remainingApprovals = await this.approvalRepository.count({
              where: {
                workflow_id: approval.workflow_id,
                status: ApprovalStatus.PENDING,
              },
            });

            if (remainingApprovals === 0) {
              await this.workflowRepository.update(approval.workflow_id, {
                status: WorkflowStatus.TIMEOUT,
                completed_at: new Date(),
                completion_reason: 'Workflow expired due to timeout',
              });

              // Emit timeout event
              this.eventEmitter.emit('workflow.timeout', {
                workflowId: approval.workflow_id,
                expiredApprovals: [approval.approval_id],
              });
            }
          }
        } catch (error) {
          this.logger.error(`Error processing timeout for approval ${approval.approval_id}: ${error.message}`, error);
        }
      }

      this.logger.log(`Processed ${expiredApprovals.length} timeout approvals`);

    } catch (error) {
      this.logger.error('Error processing timeout approvals:', error);
    }
  }

  /**
   * Get workflow metrics and statistics
   */
  async getWorkflowMetrics(dateRange?: { from: Date; to: Date }): Promise<WorkflowMetrics> {
    try {
      const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

      if (dateRange) {
        queryBuilder.where('workflow.created_at BETWEEN :from AND :to', {
          from: dateRange.from,
          to: dateRange.to,
        });
      }

      // Basic counts
      const totalWorkflows = await queryBuilder.getCount();
      
      const pendingWorkflows = await queryBuilder
        .clone()
        .andWhere('workflow.status = :status', { status: WorkflowStatus.PENDING })
        .getCount();

      const approvedWorkflows = await queryBuilder
        .clone()
        .andWhere('workflow.status = :status', { status: WorkflowStatus.APPROVED })
        .getCount();

      const rejectedWorkflows = await queryBuilder
        .clone()
        .andWhere('workflow.status = :status', { status: WorkflowStatus.REJECTED })
        .getCount();

      // Average approval time (for completed workflows)
      const avgTimeResult = await queryBuilder
        .clone()
        .select('AVG(EXTRACT(EPOCH FROM (workflow.completed_at - workflow.initiated_at)) / 3600)', 'avg_hours')
        .where('workflow.completed_at IS NOT NULL')
        .getRawOne();

      const averageApprovalTime = parseFloat(avgTimeResult?.avg_hours || '0');

      // SLA breach rate
      const slaBreachCount = await queryBuilder
        .clone()
        .andWhere('workflow.sla_breached = :breached', { breached: true })
        .getCount();

      const slaBreachRate = totalWorkflows > 0 ? (slaBreachCount / totalWorkflows) * 100 : 0;

      // Approval trends (daily)
      const trendResults = await queryBuilder
        .clone()
        .select("DATE(workflow.created_at)", 'date')
        .addSelect('COUNT(*)', 'initiated')
        .addSelect('COUNT(CASE WHEN workflow.completed_at IS NOT NULL THEN 1 END)', 'completed')
        .addSelect('AVG(CASE WHEN workflow.completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (workflow.completed_at - workflow.initiated_at)) / 3600 END)', 'avg_time_hours')
        .groupBy("DATE(workflow.created_at)")
        .orderBy("DATE(workflow.created_at)", 'ASC')
        .getRawMany();

      const approvalTrends = trendResults.map(result => ({
        date: result.date,
        initiated: parseInt(result.initiated),
        completed: parseInt(result.completed || '0'),
        avg_time_hours: parseFloat(result.avg_time_hours || '0'),
      }));

      return {
        total_workflows: totalWorkflows,
        pending_workflows: pendingWorkflows,
        approved_workflows: approvedWorkflows,
        rejected_workflows: rejectedWorkflows,
        average_approval_time: averageApprovalTime,
        sla_breach_rate: slaBreachRate,
        approval_trends: approvalTrends,
      };

    } catch (error) {
      this.logger.error(`Error fetching workflow metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Helper methods
   */

  private async getDefaultApprovalSteps(workflowType: WorkflowType, amount?: number): Promise<ApprovalStep[]> {
    // Default approval steps based on workflow type and amount
    const defaultSteps: Record<WorkflowType, ApprovalStep[]> = {
      [WorkflowType.JOURNAL_ENTRY]: [
        {
          step_number: 1,
          approver_role: 'ACCOUNTING_MANAGER',
          required_approvals: 1,
          timeout_hours: 24,
        }
      ],
      [WorkflowType.TOLERANCE_EXCEPTION]: [
        {
          step_number: 1,
          approver_role: 'FINANCIAL_CONTROLLER',
          required_approvals: 1,
          timeout_hours: 4,
        }
      ],
      [WorkflowType.BULK_POSTING]: [
        {
          step_number: 1,
          approver_role: 'ACCOUNTING_MANAGER',
          required_approvals: 1,
          timeout_hours: 12,
        },
        {
          step_number: 2,
          approver_role: 'FINANCIAL_CONTROLLER',
          required_approvals: 1,
          timeout_hours: 24,
        }
      ],
      [WorkflowType.IFRS_ADJUSTMENT]: [
        {
          step_number: 1,
          approver_role: 'SENIOR_ACCOUNTANT',
          required_approvals: 1,
          timeout_hours: 8,
        },
        {
          step_number: 2,
          approver_role: 'FINANCIAL_CONTROLLER',
          required_approvals: 1,
          timeout_hours: 24,
        }
      ],
      [WorkflowType.PERIOD_END]: [
        {
          step_number: 1,
          approver_role: 'ACCOUNTING_MANAGER',
          required_approvals: 1,
          timeout_hours: 12,
        },
        {
          step_number: 2,
          approver_role: 'FINANCIAL_CONTROLLER',
          required_approvals: 1,
          timeout_hours: 24,
        },
        {
          step_number: 3,
          approver_role: 'CFO',
          required_approvals: 1,
          timeout_hours: 48,
        }
      ],
      [WorkflowType.CONFIGURATION_CHANGE]: [
        {
          step_number: 1,
          approver_role: 'SYSTEM_ADMINISTRATOR',
          required_approvals: 1,
          timeout_hours: 8,
        }
      ]
    };

    let steps = defaultSteps[workflowType] || [];

    // Add additional approval steps for high amounts
    if (amount && amount > 100000) { // GHS 100,000
      steps.push({
        step_number: steps.length + 1,
        approver_role: 'CFO',
        required_approvals: 1,
        timeout_hours: 48,
      });
    }

    if (amount && amount > 1000000) { // GHS 1,000,000
      steps.push({
        step_number: steps.length + 1,
        approver_role: 'CEO',
        required_approvals: 1,
        timeout_hours: 72,
      });
    }

    return steps;
  }

  private async createApprovalStep(
    manager: EntityManager,
    workflow: ApprovalWorkflow,
    stepNumber: number
  ): Promise<void> {
    const step = workflow.approval_steps.find(s => s.step_number === stepNumber);
    if (!step) {
      throw new Error(`Step ${stepNumber} not found in approval steps`);
    }

    const expiryDate = new Date(Date.now() + (step.timeout_hours * 60 * 60 * 1000));

    // Create approval records for required approvers
    const approvers = step.approver_users || []; // Would be populated from role-user mapping
    
    if (approvers.length === 0) {
      // If no specific users, create one record with role
      const approval = manager.create(WorkflowApproval, {
        workflow_id: workflow.workflow_id,
        step_number: stepNumber,
        approver_role: step.approver_role,
        approver_user: 'SYSTEM', // To be assigned when claimed
        status: ApprovalStatus.PENDING,
        assigned_at: new Date(),
        expires_at: expiryDate,
      });

      await manager.save(WorkflowApproval, approval);
    } else {
      // Create approval records for specific users
      for (const approver of approvers.slice(0, step.required_approvals)) {
        const approval = manager.create(WorkflowApproval, {
          workflow_id: workflow.workflow_id,
          step_number: stepNumber,
          approver_role: step.approver_role,
          approver_user: approver,
          status: ApprovalStatus.PENDING,
          assigned_at: new Date(),
          expires_at: expiryDate,
        });

        await manager.save(WorkflowApproval, approval);
      }
    }
  }

  private async checkStepCompletion(
    manager: EntityManager,
    workflowId: string,
    stepNumber: number
  ): Promise<boolean> {
    const workflow = await manager.findOne(ApprovalWorkflow, {
      where: { workflow_id: workflowId },
    });

    if (!workflow) return false;

    const step = workflow.approval_steps.find(s => s.step_number === stepNumber);
    if (!step) return false;

    const approvedCount = await manager.count(WorkflowApproval, {
      where: {
        workflow_id: workflowId,
        step_number: stepNumber,
        action: ApprovalAction.APPROVED,
        status: ApprovalStatus.COMPLETED,
      },
    });

    return approvedCount >= step.required_approvals;
  }

  private calculateExpiryDate(approvalSteps: ApprovalStep[]): Date {
    const totalHours = approvalSteps.reduce((sum, step) => sum + step.timeout_hours, 0);
    return new Date(Date.now() + (totalHours * 60 * 60 * 1000));
  }

  private calculateSLAHours(approvalSteps: ApprovalStep[]): number {
    return approvalSteps.reduce((sum, step) => sum + step.timeout_hours, 0);
  }

  private calculateResponseTime(assignedAt: Date): number {
    return Math.floor((Date.now() - assignedAt.getTime()) / (1000 * 60 * 60)); // Hours
  }

  private calculateTimeRemaining(expiryDate: Date): number {
    const remaining = expiryDate.getTime() - Date.now();
    return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // Hours
  }
}