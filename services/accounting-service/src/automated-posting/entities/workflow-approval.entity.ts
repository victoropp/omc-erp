import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApprovalWorkflow } from './approval-workflow.entity';

export enum ApprovalAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  DELEGATED = 'DELEGATED',
  ESCALATED = 'ESCALATED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('workflow_approvals')
@Index(['workflow_id', 'step_number'])
@Index(['approver_user', 'status'])
export class WorkflowApproval {
  @PrimaryGeneratedColumn('uuid')
  approval_id: string;

  @Column({ type: 'uuid' })
  workflow_id: string;

  @ManyToOne(() => ApprovalWorkflow, (workflow) => workflow.approvals)
  @JoinColumn({ name: 'workflow_id' })
  workflow: ApprovalWorkflow;

  @Column({ type: 'integer' })
  step_number: number;

  @Column({ length: 100 })
  approver_role: string;

  @Column({ length: 100 })
  approver_user: string;

  @Column({ type: 'enum', enum: ApprovalStatus })
  status: ApprovalStatus;

  @Column({ type: 'enum', enum: ApprovalAction, nullable: true })
  action: ApprovalAction;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'jsonb', nullable: true })
  supporting_documents: Array<{
    document_name: string;
    document_url: string;
    document_type: string;
    upload_date: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  assigned_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Delegation tracking
  @Column({ length: 100, nullable: true })
  delegated_by: string;

  @Column({ length: 100, nullable: true })
  delegated_to: string;

  @Column({ type: 'timestamp', nullable: true })
  delegated_at: Date;

  @Column({ type: 'text', nullable: true })
  delegation_reason: string;

  // Escalation tracking
  @Column({ default: false })
  is_escalated: boolean;

  @Column({ length: 100, nullable: true })
  escalated_from: string;

  @Column({ type: 'timestamp', nullable: true })
  escalated_at: Date;

  @Column({ type: 'text', nullable: true })
  escalation_reason: string;

  // Performance tracking
  @Column({ type: 'integer', default: 0 })
  response_time_hours: number;

  @Column({ default: false })
  sla_breached: boolean;

  @Column({ type: 'integer', default: 0 })
  reminder_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_reminder_sent: Date;

  // Mobile/digital signature support
  @Column({ type: 'text', nullable: true })
  digital_signature: string;

  @Column({ type: 'text', nullable: true })
  signing_certificate: string;

  @Column({ type: 'text', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  geolocation: string;

  // Approval conditions verification
  @Column({ type: 'jsonb', nullable: true })
  condition_checks: Array<{
    condition: string;
    result: boolean;
    checked_at: string;
    details: string;
  }>;

  // Risk assessment override
  @Column({ default: false })
  risk_override_applied: boolean;

  @Column({ type: 'text', nullable: true })
  risk_override_reason: string;

  @Column({ length: 100, nullable: true })
  risk_override_approved_by: string;
}