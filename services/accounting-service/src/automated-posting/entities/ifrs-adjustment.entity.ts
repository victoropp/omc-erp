import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum IFRSStandard {
  IFRS15 = 'IFRS15', // Revenue from Contracts with Customers
  IFRS9 = 'IFRS9',   // Financial Instruments
  IFRS16 = 'IFRS16', // Leases
  IAS2 = 'IAS2',     // Inventories
  IAS36 = 'IAS36',   // Impairment of Assets
  IAS37 = 'IAS37',   // Provisions, Contingent Liabilities and Contingent Assets
}

export enum AdjustmentType {
  REVENUE_RECOGNITION = 'REVENUE_RECOGNITION',
  EXPECTED_CREDIT_LOSS = 'EXPECTED_CREDIT_LOSS',
  LEASE_LIABILITY = 'LEASE_LIABILITY',
  RIGHT_OF_USE_ASSET = 'RIGHT_OF_USE_ASSET',
  INVENTORY_VALUATION = 'INVENTORY_VALUATION',
  IMPAIRMENT = 'IMPAIRMENT',
  PROVISION = 'PROVISION',
}

@Entity('ifrs_adjustments')
@Index(['ifrs_standard', 'adjustment_type', 'effective_date'])
@Index(['source_document_type', 'source_document_id'])
export class IFRSAdjustment {
  @PrimaryGeneratedColumn('uuid')
  adjustment_id: string;

  @Column({ type: 'enum', enum: IFRSStandard })
  ifrs_standard: IFRSStandard;

  @Column({ type: 'enum', enum: AdjustmentType })
  adjustment_type: AdjustmentType;

  @Column({ length: 200 })
  description: string;

  @Column({ length: 50, nullable: true })
  source_document_type: string;

  @Column({ type: 'uuid', nullable: true })
  source_document_id: string;

  @Column({ type: 'uuid', nullable: true })
  journal_entry_id: string;

  @Column({ length: 20 })
  account_code: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  adjustment_amount: number;

  @Column({ type: 'date' })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  reversal_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  calculation_details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  supporting_data: Record<string, any>;

  @Column({ length: 50, default: 'ACTIVE' })
  status: string; // 'ACTIVE', 'REVERSED', 'SUPERSEDED'

  @Column({ type: 'uuid', nullable: true })
  reversed_by_adjustment_id: string;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // IFRS 15 specific fields
  @Column({ type: 'uuid', nullable: true })
  contract_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  contract_value: number;

  @Column({ type: 'integer', nullable: true })
  performance_obligations_count: number;

  // IFRS 9 specific fields
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  probability_of_default: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  loss_given_default: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  exposure_at_default: number;

  // IFRS 16 specific fields
  @Column({ type: 'uuid', nullable: true })
  lease_contract_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  discount_rate: number;

  @Column({ type: 'integer', nullable: true })
  lease_term_months: number;

  // IAS 2 specific fields
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  net_realizable_value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost_of_completion: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  selling_costs: number;
}