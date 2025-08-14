import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AutomationEvent {
  RULE_TRIGGERED = 'RULE_TRIGGERED',
  TEMPLATE_APPLIED = 'TEMPLATE_APPLIED',
  JOURNAL_CREATED = 'JOURNAL_CREATED',
  JOURNAL_POSTED = 'JOURNAL_POSTED',
  TOLERANCE_VIOLATION = 'TOLERANCE_VIOLATION',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  IFRS_ADJUSTMENT = 'IFRS_ADJUSTMENT',
  BULK_PROCESSING = 'BULK_PROCESSING',
}

export enum AutomationStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  TIMEOUT = 'TIMEOUT',
}

@Entity('automation_audit_logs')
@Index(['event_type', 'created_at'])
@Index(['status', 'created_at'])
@Index(['source_document_type', 'source_document_id'])
export class AutomationAuditLog {
  @PrimaryGeneratedColumn('uuid')
  log_id: string;

  @Column({ type: 'enum', enum: AutomationEvent })
  event_type: AutomationEvent;

  @Column({ type: 'enum', enum: AutomationStatus })
  status: AutomationStatus;

  @Column({ type: 'uuid', nullable: true })
  rule_id: string;

  @Column({ type: 'uuid', nullable: true })
  template_id: string;

  @Column({ length: 50, nullable: true })
  source_document_type: string;

  @Column({ type: 'uuid', nullable: true })
  source_document_id: string;

  @Column({ type: 'uuid', nullable: true })
  journal_entry_id: string;

  @Column({ type: 'jsonb', nullable: true })
  source_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  processed_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  generated_entries: Array<{
    account_code: string;
    debit_amount: number;
    credit_amount: number;
    description: string;
  }>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  error_stack: string;

  @Column({ type: 'integer', default: 0 })
  processing_time_ms: number;

  @Column({ length: 100, nullable: true })
  processed_by: string;

  @Column({ type: 'uuid', nullable: true })
  batch_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Performance metrics
  @Column({ type: 'integer', default: 0 })
  records_processed: number;

  @Column({ type: 'integer', default: 0 })
  records_succeeded: number;

  @Column({ type: 'integer', default: 0 })
  records_failed: number;

  // IFRS compliance tracking
  @Column({ type: 'jsonb', nullable: true })
  ifrs_adjustments: Array<{
    standard: string;
    adjustment_type: string;
    amount: number;
    effective_date: string;
  }>;

  // Tolerance check results
  @Column({ type: 'jsonb', nullable: true })
  tolerance_checks: Array<{
    tolerance_id: string;
    check_passed: boolean;
    variance_amount: number;
    variance_percentage: number;
  }>;

  // Approval workflow tracking
  @Column({ type: 'uuid', nullable: true })
  workflow_id: string;

  @Column({ type: 'jsonb', nullable: true })
  approval_history: Array<{
    approver: string;
    action: string;
    timestamp: string;
    comments: string;
  }>;
}