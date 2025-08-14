import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RecognitionMethod {
  OVER_TIME = 'OVER_TIME',
  POINT_IN_TIME = 'POINT_IN_TIME',
  PERCENTAGE_OF_COMPLETION = 'PERCENTAGE_OF_COMPLETION',
  INPUT_METHOD = 'INPUT_METHOD',
  OUTPUT_METHOD = 'OUTPUT_METHOD',
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('revenue_recognition_schedules')
@Index(['contract_id', 'performance_obligation_id'])
@Index(['recognition_date', 'status'])
export class RevenueRecognitionSchedule {
  @PrimaryGeneratedColumn('uuid')
  schedule_id: string;

  @Column({ type: 'uuid' })
  contract_id: string;

  @Column({ type: 'uuid' })
  performance_obligation_id: string;

  @Column({ length: 200 })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_contract_value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  allocated_amount: number;

  @Column({ type: 'enum', enum: RecognitionMethod })
  recognition_method: RecognitionMethod;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'date' })
  recognition_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  recognized_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cumulative_recognized: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remaining_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completion_percentage: number;

  @Column({ type: 'enum', enum: ScheduleStatus })
  status: ScheduleStatus;

  @Column({ type: 'jsonb', nullable: true })
  calculation_details: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  journal_entry_id: string;

  @Column({ default: false })
  is_posted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  posted_at: Date;

  @Column({ length: 100, nullable: true })
  posted_by: string;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Performance obligation tracking
  @Column({ type: 'jsonb', nullable: true })
  performance_obligations: Array<{
    obligation_id: string;
    description: string;
    allocated_value: number;
    satisfied_percentage: number;
    satisfaction_date: string;
  }>;

  // Variable consideration
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  variable_consideration: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  constraint_amount: number;

  // Contract modifications
  @Column({ type: 'jsonb', nullable: true })
  modification_history: Array<{
    modification_date: string;
    previous_amount: number;
    new_amount: number;
    reason: string;
    approved_by: string;
  }>;

  // Currency handling
  @Column({ length: 3, default: 'GHS' })
  currency_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchange_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  functional_currency_amount: number;
}