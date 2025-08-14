import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WorkflowApproval } from './workflow-approval.entity';

export enum WorkflowStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED',
  TIMEOUT = 'TIMEOUT',
}

export enum WorkflowType {
  JOURNAL_ENTRY = 'JOURNAL_ENTRY',
  TOLERANCE_EXCEPTION = 'TOLERANCE_EXCEPTION',
  BULK_POSTING = 'BULK_POSTING',
  IFRS_ADJUSTMENT = 'IFRS_ADJUSTMENT',
  PERIOD_END = 'PERIOD_END',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
}

export interface ApprovalStep {
  step_number: number;
  approver_role: string;
  approver_users?: string[];
  required_approvals: number;
  timeout_hours: number;
  escalation_role?: string;
  conditions?: Record<string, any>;
}

@Entity('approval_workflows')
export class ApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  workflow_id: string;

  @Column({ type: 'enum', enum: WorkflowType })
  workflow_type: WorkflowType;

  @Column({ length: 200 })
  workflow_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  source_document_type: string;

  @Column({ type: 'uuid', nullable: true })
  source_document_id: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string; // Journal entry, template, etc.

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: WorkflowStatus })
  status: WorkflowStatus;

  @Column({ type: 'jsonb' })
  approval_steps: ApprovalStep[];

  @Column({ type: 'integer', default: 1 })
  current_step: number;

  @Column({ type: 'jsonb', nullable: true })
  approval_matrix: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  business_context: Record<string, any>;

  @Column({ length: 100 })
  initiated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  initiated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'text', nullable: true })
  completion_reason: string;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => WorkflowApproval, (approval) => approval.workflow)
  approvals: WorkflowApproval[];

  // SLA tracking
  @Column({ type: 'integer', default: 24 })
  sla_hours: number;

  @Column({ default: false })
  sla_breached: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sla_breach_date: Date;

  // Notification settings
  @Column({ default: true })
  send_notifications: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notification_settings: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    reminder_intervals: number[]; // Hours
  };

  // Escalation settings
  @Column({ default: false })
  enable_auto_escalation: boolean;

  @Column({ type: 'integer', default: 24 })
  escalation_timeout_hours: number;

  @Column({ type: 'jsonb', nullable: true })
  escalation_matrix: Array<{
    level: number;
    timeout_hours: number;
    escalate_to_role: string;
    escalate_to_users?: string[];
  }>;

  // Delegation tracking
  @Column({ type: 'jsonb', nullable: true })
  delegation_history: Array<{
    original_approver: string;
    delegated_to: string;
    delegation_date: string;
    delegation_reason: string;
    expiry_date?: string;
  }>;

  // Risk assessment
  @Column({ type: 'integer', default: 1 })
  risk_score: number; // 1-10

  @Column({ type: 'jsonb', nullable: true })
  risk_factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
}