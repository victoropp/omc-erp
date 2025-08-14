import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LeaseType {
  OPERATING = 'OPERATING',
  FINANCE = 'FINANCE',
}

export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED',
  MODIFIED = 'MODIFIED',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
}

@Entity('lease_accounting')
@Index(['lease_contract_id', 'commencement_date'])
@Index(['status', 'next_payment_date'])
export class LeaseAccounting {
  @PrimaryGeneratedColumn('uuid')
  lease_id: string;

  @Column({ type: 'uuid' })
  lease_contract_id: string;

  @Column({ length: 200 })
  lease_description: string;

  @Column({ type: 'enum', enum: LeaseType })
  lease_type: LeaseType;

  @Column({ type: 'enum', enum: LeaseStatus })
  status: LeaseStatus;

  @Column({ type: 'date' })
  commencement_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'integer' })
  lease_term_months: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  initial_measurement_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  right_of_use_asset: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  lease_liability: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  discount_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthly_payment: number;

  @Column({ type: 'enum', enum: PaymentFrequency })
  payment_frequency: PaymentFrequency;

  @Column({ type: 'date' })
  next_payment_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulated_depreciation: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulated_interest: number;

  @Column({ type: 'jsonb', nullable: true })
  payment_schedule: Array<{
    payment_date: string;
    payment_amount: number;
    principal_amount: number;
    interest_amount: number;
    remaining_liability: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  depreciation_schedule: Array<{
    period_date: string;
    depreciation_amount: number;
    accumulated_depreciation: number;
    carrying_amount: number;
  }>;

  @Column({ length: 20, nullable: true })
  rou_asset_account: string;

  @Column({ length: 20, nullable: true })
  lease_liability_account: string;

  @Column({ length: 20, nullable: true })
  depreciation_expense_account: string;

  @Column({ length: 20, nullable: true })
  interest_expense_account: string;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Lease modifications
  @Column({ type: 'jsonb', nullable: true })
  modification_history: Array<{
    modification_date: string;
    modification_type: string;
    previous_liability: number;
    new_liability: number;
    previous_asset: number;
    new_asset: number;
    reason: string;
    approved_by: string;
  }>;

  // Variable payments
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  variable_payments: number;

  @Column({ type: 'jsonb', nullable: true })
  variable_payment_terms: Record<string, any>;

  // Extension and termination options
  @Column({ default: false })
  has_extension_option: boolean;

  @Column({ type: 'integer', nullable: true })
  extension_period_months: number;

  @Column({ default: false })
  has_termination_option: boolean;

  @Column({ type: 'date', nullable: true })
  earliest_termination_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  termination_penalty: number;

  // Impairment testing
  @Column({ default: false })
  impairment_indicator: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  recoverable_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  impairment_loss: number;

  @Column({ type: 'date', nullable: true })
  last_impairment_test_date: Date;

  // Journal entry tracking
  @Column({ type: 'jsonb', nullable: true })
  journal_entries: Array<{
    entry_id: string;
    entry_type: string;
    entry_date: string;
    amount: number;
  }>;
}