import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntryTemplate } from './journal-entry-template.entity';

export interface RuleCondition {
  field: string;
  operator: string; // '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN'
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface TriggerConfiguration {
  event_type: string;
  source_system: string;
  delay_seconds?: number;
  retry_attempts?: number;
  failure_action?: 'SKIP' | 'RETRY' | 'ALERT';
}

@Entity('automated_posting_rules')
export class AutomatedPostingRule {
  @PrimaryGeneratedColumn('uuid')
  rule_id: string;

  @Column({ length: 200 })
  rule_name: string;

  @Column({ length: 100 })
  trigger_event: string;

  @Column({ type: 'uuid' })
  template_id: string;

  @ManyToOne(() => JournalEntryTemplate, (template) => template.posting_rules)
  @JoinColumn({ name: 'template_id' })
  template: JournalEntryTemplate;

  @Column({ type: 'jsonb', nullable: true })
  conditions: RuleCondition[];

  @Column({ type: 'jsonb', nullable: true })
  trigger_configuration: TriggerConfiguration;

  @Column({ type: 'integer', default: 100 })
  priority: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Scheduling options
  @Column({ default: false })
  is_scheduled: boolean;

  @Column({ nullable: true })
  schedule_expression: string; // Cron expression

  @Column({ type: 'timestamp', nullable: true })
  next_execution: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_execution: Date;

  // Error handling
  @Column({ type: 'integer', default: 3 })
  max_retry_attempts: number;

  @Column({ type: 'integer', default: 300 })
  retry_delay_seconds: number;

  @Column({ default: false })
  alert_on_failure: boolean;

  @Column({ type: 'text', nullable: true })
  notification_recipients: string;

  // Performance optimization
  @Column({ default: false })
  enable_bulk_processing: boolean;

  @Column({ type: 'integer', default: 1000 })
  bulk_size: number;

  // Audit and compliance
  @Column({ default: true })
  audit_enabled: boolean;

  @Column({ default: false })
  require_approval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approval_matrix: Record<string, any>;
}