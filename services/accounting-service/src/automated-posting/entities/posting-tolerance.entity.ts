import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ToleranceType {
  PERCENTAGE = 'PERCENTAGE',
  ABSOLUTE = 'ABSOLUTE',
  CONDITIONAL = 'CONDITIONAL',
}

export enum ToleranceScope {
  GLOBAL = 'GLOBAL',
  TRANSACTION_TYPE = 'TRANSACTION_TYPE',
  ACCOUNT = 'ACCOUNT',
  STATION = 'STATION',
  PRODUCT = 'PRODUCT',
}

export interface ToleranceCondition {
  field: string;
  operator: string;
  value: any;
  tolerance_value: number;
}

@Entity('posting_tolerances')
export class PostingTolerance {
  @PrimaryGeneratedColumn('uuid')
  tolerance_id: string;

  @Column({ length: 200 })
  tolerance_name: string;

  @Column({ type: 'enum', enum: ToleranceType })
  tolerance_type: ToleranceType;

  @Column({ type: 'enum', enum: ToleranceScope })
  scope: ToleranceScope;

  @Column({ length: 100, nullable: true })
  scope_value: string; // Account code, transaction type, etc.

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  tolerance_value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimum_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximum_amount: number;

  @Column({ type: 'jsonb', nullable: true })
  conditions: ToleranceCondition[];

  @Column({ length: 50, default: 'WARNING' })
  violation_action: string; // 'WARNING', 'BLOCK', 'APPROVE'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Escalation settings
  @Column({ default: false })
  enable_escalation: boolean;

  @Column({ type: 'jsonb', nullable: true })
  escalation_matrix: Array<{
    threshold_percentage: number;
    approver_role: string;
    notification_required: boolean;
  }>;

  // Historical tracking
  @Column({ type: 'integer', default: 0 })
  violation_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_violation_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_variance_amount: number;
}