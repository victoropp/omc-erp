import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ECLStage {
  STAGE_1 = 'STAGE_1', // 12-month ECL
  STAGE_2 = 'STAGE_2', // Lifetime ECL (not credit-impaired)
  STAGE_3 = 'STAGE_3', // Lifetime ECL (credit-impaired)
}

export enum ECLMethod {
  PROVISION_MATRIX = 'PROVISION_MATRIX',
  DISCOUNTED_CASH_FLOW = 'DISCOUNTED_CASH_FLOW',
  PROBABILITY_WEIGHTED = 'PROBABILITY_WEIGHTED',
  ROLL_RATE = 'ROLL_RATE',
}

@Entity('expected_credit_losses')
@Index(['customer_id', 'as_of_date'])
@Index(['ecl_stage', 'as_of_date'])
export class ExpectedCreditLoss {
  @PrimaryGeneratedColumn('uuid')
  ecl_id: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id: string;

  @Column({ length: 50, nullable: true })
  portfolio_segment: string; // 'CORPORATE', 'RETAIL', 'SME'

  @Column({ type: 'date' })
  as_of_date: Date;

  @Column({ type: 'enum', enum: ECLStage })
  ecl_stage: ECLStage;

  @Column({ type: 'enum', enum: ECLMethod })
  calculation_method: ECLMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_carrying_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  ecl_provision: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  net_carrying_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  probability_of_default: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  loss_given_default: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  exposure_at_default: number;

  @Column({ type: 'integer', nullable: true })
  days_past_due: number;

  @Column({ type: 'jsonb', nullable: true })
  credit_rating: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  macroeconomic_factors: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  forward_looking_information: Record<string, any>;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  previous_ecl_provision: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  ecl_movement: number;

  @Column({ type: 'uuid', nullable: true })
  journal_entry_id: string;

  @Column({ default: false })
  is_posted: boolean;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Detailed aging analysis
  @Column({ type: 'jsonb', nullable: true })
  aging_buckets: Array<{
    bucket: string; // '0-30', '31-60', '61-90', '91-120', '120+'
    amount: number;
    ecl_rate: number;
    ecl_provision: number;
  }>;

  // Scenario analysis
  @Column({ type: 'jsonb', nullable: true })
  scenario_analysis: Array<{
    scenario: string; // 'BASE', 'UPSIDE', 'DOWNSIDE'
    probability: number;
    ecl_amount: number;
  }>;

  // Write-off tracking
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  write_off_amount: number;

  @Column({ type: 'timestamp', nullable: true })
  write_off_date: Date;

  @Column({ type: 'text', nullable: true })
  write_off_reason: string;

  // Recovery tracking
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  recovery_amount: number;

  @Column({ type: 'timestamp', nullable: true })
  recovery_date: Date;

  // Credit quality indicators
  @Column({ default: false })
  significant_increase_in_risk: boolean;

  @Column({ default: false })
  credit_impaired: boolean;

  @Column({ type: 'text', nullable: true })
  impairment_reasons: string;

  // Model validation
  @Column({ length: 50, nullable: true })
  model_version: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  model_confidence_level: number;

  @Column({ type: 'jsonb', nullable: true })
  validation_metrics: Record<string, any>;
}