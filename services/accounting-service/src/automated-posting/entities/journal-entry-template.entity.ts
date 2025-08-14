import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AutomatedPostingRule } from './automated-posting-rule.entity';

export interface AccountMappingRule {
  debit: Array<{
    account: string;
    amount: string; // Formula or field name
    dimension?: string; // Cost center, station, etc.
    conditions?: Record<string, any>;
  }>;
  credit: Array<{
    account: string;
    amount: string;
    dimension?: string;
    conditions?: Record<string, any>;
  }>;
  ifrs_adjustments?: Array<{
    standard: string; // 'IFRS15', 'IFRS9', etc.
    account: string;
    amount: string;
    schedule_type?: string;
    conditions?: Record<string, any>;
  }>;
}

export interface ValidationRule {
  field: string;
  operator: string;
  value: any;
  message?: string;
}

@Entity('journal_entry_templates')
export class JournalEntryTemplate {
  @PrimaryGeneratedColumn('uuid')
  template_id: string;

  @Column({ unique: true, length: 50 })
  template_code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100 })
  transaction_type: string;

  @Column({ type: 'jsonb' })
  account_mapping_rules: AccountMappingRule;

  @Column({ type: 'jsonb', nullable: true })
  validation_rules: ValidationRule[];

  @Column({ default: false })
  approval_required: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  approval_threshold: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AutomatedPostingRule, (rule) => rule.template)
  posting_rules: AutomatedPostingRule[];

  // IFRS Compliance flags
  @Column({ default: false })
  ifrs15_revenue_recognition: boolean;

  @Column({ default: false })
  ifrs9_expected_credit_loss: boolean;

  @Column({ default: false })
  ifrs16_lease_accounting: boolean;

  @Column({ default: false })
  ias2_inventory_valuation: boolean;

  @Column({ type: 'jsonb', nullable: true })
  ifrs_configuration: Record<string, any>;

  // Multi-currency support
  @Column({ default: false })
  multi_currency_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  currency_mapping: Record<string, string>;

  // Batch processing configuration
  @Column({ default: false })
  batch_processing_enabled: boolean;

  @Column({ type: 'integer', default: 1000 })
  batch_size: number;

  @Column({ type: 'integer', default: 1 })
  processing_priority: number;
}