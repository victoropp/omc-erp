import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { Prepayment } from './prepayment.entity';

export enum AmortizationStatus {
  SCHEDULED = 'SCHEDULED',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED',
  ADJUSTED = 'ADJUSTED',
  REVERSED = 'REVERSED'
}

@Entity('prepayment_amortizations')
@Index(['tenantId', 'prepaymentId'])
@Index(['tenantId', 'amortizationDate'])
@Index(['tenantId', 'status'])
@Index(['periodNumber'])
export class PrepaymentAmortization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'prepayment_id' })
  prepaymentId: string;

  @Column({ name: 'amortization_number', length: 50, unique: true })
  amortizationNumber: string;

  // Period Information
  @Column({ name: 'period_number' })
  periodNumber: number; // 1, 2, 3, etc.

  @Column({ name: 'amortization_date', type: 'date' })
  amortizationDate: Date;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'financial_period', length: 20 })
  financialPeriod: string; // e.g., "2024-01", "2024-Q1"

  // Amortization Amounts
  @Column({ name: 'scheduled_amount', type: 'decimal', precision: 15, scale: 2 })
  scheduledAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualAmount: number;

  @Column({ name: 'adjustment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ name: 'cumulative_amortized', type: 'decimal', precision: 15, scale: 2 })
  cumulativeAmortized: number;

  @Column({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: number;

  // Usage-Based Amortization
  @Column({ name: 'usage_units_period', nullable: true })
  usageUnitsPeriod: number; // Units used in this period

  @Column({ name: 'cumulative_usage_units', nullable: true })
  cumulativeUsageUnits: number;

  @Column({ name: 'usage_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  usagePercentage: number;

  // Status and Processing
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: AmortizationStatus,
    default: AmortizationStatus.SCHEDULED
  })
  status: AmortizationStatus;

  @Column({ name: 'processed_date', nullable: true })
  processedDate: Date;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'auto_processed', default: false })
  autoProcessed: boolean;

  // GL Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'posted_to_gl', default: false })
  postedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  @Column({ name: 'gl_period', length: 20, nullable: true })
  glPeriod: string;

  // Account Information (inherited from prepayment but can be overridden)
  @Column({ name: 'prepayment_account', length: 20 })
  prepaymentAccount: string;

  @Column({ name: 'expense_account', length: 20 })
  expenseAccount: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 50, nullable: true })
  department: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  // Reversals and Adjustments
  @Column({ name: 'is_reversal', default: false })
  isReversal: boolean;

  @Column({ name: 'reversed_entry_id', nullable: true })
  reversedEntryId: string;

  @Column({ name: 'reversal_reason', type: 'text', nullable: true })
  reversalReason: string;

  @Column({ name: 'reversal_date', nullable: true })
  reversalDate: Date;

  @Column({ name: 'reversed_by', nullable: true })
  reversedBy: string;

  // Adjustments
  @Column({ name: 'is_adjustment', default: false })
  isAdjustment: boolean;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'original_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  originalAmount: number;

  @Column({ name: 'adjusted_by', nullable: true })
  adjustedBy: string;

  @Column({ name: 'adjustment_date', nullable: true })
  adjustmentDate: Date;

  // IFRS and Tax Compliance
  @Column({ name: 'tax_deductible_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  taxDeductibleAmount: number;

  @Column({ name: 'tax_amortization_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxAmortizationRate: number;

  @Column({ name: 'ifrs_compliant', default: true })
  ifrsCompliant: boolean;

  @Column({ name: 'ifrs_notes', type: 'text', nullable: true })
  ifrsNotes: string;

  // Approval Workflow
  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  // Budget Impact
  @Column({ name: 'budget_impact', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetImpact: number;

  @Column({ name: 'budget_variance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetVariance: number;

  @Column({ name: 'budget_line_id', nullable: true })
  budgetLineId: string;

  // Currency and Exchange Rate
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Performance Tracking
  @Column({ name: 'business_value_delivered', type: 'decimal', precision: 15, scale: 2, nullable: true })
  businessValueDelivered: number;

  @Column({ name: 'utilization_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationScore: number;

  @Column({ name: 'performance_metrics', type: 'text', nullable: true })
  performanceMetrics: string; // JSON object

  // Notes and Documentation
  @Column({ name: 'amortization_notes', type: 'text', nullable: true })
  amortizationNotes: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array

  @Column({ name: 'calculation_details', type: 'text', nullable: true })
  calculationDetails: string; // JSON object with calculation details

  // Automation and System Fields
  @Column({ name: 'system_generated', default: true })
  systemGenerated: boolean;

  @Column({ name: 'batch_id', nullable: true })
  batchId: string; // For batch processing

  @Column({ name: 'processing_run_id', nullable: true })
  processingRunId: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'last_retry_date', nullable: true })
  lastRetryDate: Date;

  // Audit Fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Prepayment, prepayment => prepayment.amortizations)
  @JoinColumn({ name: 'prepayment_id' })
  prepayment: Prepayment;
}