import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { AccrualJournalEntry } from './accrual-journal-entry.entity';

export enum AccrualType {
  EXPENSE_ACCRUAL = 'EXPENSE_ACCRUAL',
  REVENUE_ACCRUAL = 'REVENUE_ACCRUAL',
  INTEREST_ACCRUAL = 'INTEREST_ACCRUAL',
  SALARY_ACCRUAL = 'SALARY_ACCRUAL',
  UTILITY_ACCRUAL = 'UTILITY_ACCRUAL',
  TAX_ACCRUAL = 'TAX_ACCRUAL',
  DEPRECIATION_ACCRUAL = 'DEPRECIATION_ACCRUAL',
  PROVISION_ACCRUAL = 'PROVISION_ACCRUAL',
  BONUS_ACCRUAL = 'BONUS_ACCRUAL',
  COMMISSION_ACCRUAL = 'COMMISSION_ACCRUAL',
  LEASE_ACCRUAL = 'LEASE_ACCRUAL',
  WARRANTY_ACCRUAL = 'WARRANTY_ACCRUAL',
  OTHER = 'OTHER'
}

export enum AccrualStatus {
  ACTIVE = 'ACTIVE',
  REVERSED = 'REVERSED',
  PARTIALLY_REVERSED = 'PARTIALLY_REVERSED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export enum AccrualFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME'
}

export enum AccrualBasis {
  TIME_BASED = 'TIME_BASED',
  PERCENTAGE_BASED = 'PERCENTAGE_BASED',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  USAGE_BASED = 'USAGE_BASED',
  FORMULA_BASED = 'FORMULA_BASED'
}

@Entity('accruals')
@Index(['tenantId', 'accrualType'])
@Index(['tenantId', 'status'])
@Index(['accrualDate'])
@Index(['reversalDate'])
@Index(['nextAccrualDate'])
export class Accrual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'accrual_number', length: 50, unique: true })
  accrualNumber: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string; // External reference

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ 
    name: 'accrual_type', 
    type: 'enum', 
    enum: AccrualType 
  })
  accrualType: AccrualType;

  // Financial Details
  @Column({ name: 'accrual_amount', type: 'decimal', precision: 15, scale: 2 })
  accrualAmount: number;

  @Column({ name: 'reversed_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  reversedAmount: number;

  @Column({ name: 'settled_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  settledAmount: number;

  @Column({ name: 'outstanding_balance', type: 'decimal', precision: 15, scale: 2 })
  outstandingBalance: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Timing and Dates
  @Column({ name: 'accrual_date', type: 'date' })
  accrualDate: Date;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'expected_settlement_date', type: 'date', nullable: true })
  expectedSettlementDate: Date;

  @Column({ name: 'actual_settlement_date', type: 'date', nullable: true })
  actualSettlementDate: Date;

  @Column({ name: 'reversal_date', type: 'date', nullable: true })
  reversalDate: Date;

  // Account Mappings
  @Column({ name: 'debit_account', length: 20 })
  debitAccount: string;

  @Column({ name: 'credit_account', length: 20 })
  creditAccount: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 50, nullable: true })
  department: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ name: 'profit_center', length: 20, nullable: true })
  profitCenter: string;

  // Recurring Accrual Settings
  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ 
    name: 'accrual_frequency', 
    type: 'enum', 
    enum: AccrualFrequency,
    default: AccrualFrequency.ONE_TIME
  })
  accrualFrequency: AccrualFrequency;

  @Column({ 
    name: 'accrual_basis', 
    type: 'enum', 
    enum: AccrualBasis,
    default: AccrualBasis.FIXED_AMOUNT
  })
  accrualBasis: AccrualBasis;

  @Column({ name: 'next_accrual_date', type: 'date', nullable: true })
  nextAccrualDate: Date;

  @Column({ name: 'recurring_until_date', type: 'date', nullable: true })
  recurringUntilDate: Date;

  @Column({ name: 'total_occurrences', nullable: true })
  totalOccurrences: number;

  @Column({ name: 'occurrences_completed', default: 0 })
  occurrencesCompleted: number;

  // Auto-Reversal Settings
  @Column({ name: 'auto_reverse', default: false })
  autoReverse: boolean;

  @Column({ name: 'auto_reverse_period', length: 20, nullable: true })
  autoReversePeriod: string; // NEXT_MONTH, NEXT_QUARTER, etc.

  @Column({ name: 'auto_reverse_date', type: 'date', nullable: true })
  autoReverseDate: Date;

  @Column({ name: 'reversed', default: false })
  reversed: boolean;

  @Column({ name: 'reversal_entry_id', nullable: true })
  reversalEntryId: string;

  // Status and Workflow
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: AccrualStatus,
    default: AccrualStatus.PENDING_APPROVAL
  })
  status: AccrualStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Vendor/Customer Information
  @Column({ name: 'vendor_id', nullable: true })
  vendorId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @Column({ name: 'counterparty_name', length: 255, nullable: true })
  counterpartyName: string;

  // Supporting Documentation
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'contract_number', length: 100, nullable: true })
  contractNumber: string;

  @Column({ name: 'purchase_order_number', length: 100, nullable: true })
  purchaseOrderNumber: string;

  // Calculation Details
  @Column({ name: 'calculation_method', type: 'text', nullable: true })
  calculationMethod: string; // JSON object describing calculation

  @Column({ name: 'base_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseAmount: number;

  @Column({ name: 'accrual_rate', type: 'decimal', precision: 10, scale: 6, nullable: true })
  accrualRate: number; // Percentage or rate

  @Column({ name: 'time_factor', type: 'decimal', precision: 10, scale: 6, nullable: true })
  timeFactor: number; // Days, months, etc.

  @Column({ name: 'usage_units', nullable: true })
  usageUnits: number;

  @Column({ name: 'unit_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  unitRate: number;

  // IFRS and Compliance
  @Column({ name: 'ifrs_classification', length: 50, nullable: true })
  ifrsClassification: string; // LIABILITY, ASSET, EXPENSE, REVENUE

  @Column({ name: 'ifrs_subcategory', length: 100, nullable: true })
  ifrsSubcategory: string;

  @Column({ name: 'current_vs_noncurrent', length: 20, default: 'CURRENT' })
  currentVsNoncurrent: string; // CURRENT, NON_CURRENT

  @Column({ name: 'measurement_basis', length: 50, default: 'HISTORICAL_COST' })
  measurementBasis: string; // HISTORICAL_COST, FAIR_VALUE, etc.

  @Column({ name: 'disclosure_required', default: false })
  disclosureRequired: boolean;

  @Column({ name: 'disclosure_notes', type: 'text', nullable: true })
  disclosureNotes: string;

  // Tax Implications
  @Column({ name: 'tax_deductible', default: true })
  taxDeductible: boolean;

  @Column({ name: 'tax_timing_difference', default: false })
  taxTimingDifference: boolean;

  @Column({ name: 'deferred_tax_impact', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deferredTaxImpact: number;

  // Budget Integration
  @Column({ name: 'budget_line_id', nullable: true })
  budgetLineId: string;

  @Column({ name: 'budget_variance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetVariance: number;

  @Column({ name: 'forecasted_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  forecastedAmount: number;

  // Performance and Analytics
  @Column({ name: 'accuracy_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracyScore: number; // How close the accrual was to actual

  @Column({ name: 'variance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  variancePercentage: number;

  @Column({ name: 'historical_pattern', type: 'text', nullable: true })
  historicalPattern: string; // JSON object with historical data

  // Automation Settings
  @Column({ name: 'auto_calculated', default: false })
  autoCalculated: boolean;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'approval_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvalThreshold: number;

  @Column({ name: 'auto_posting_enabled', default: false })
  autoPostingEnabled: boolean;

  // GL Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'posted_to_gl', default: false })
  postedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  @Column({ name: 'gl_period', length: 20, nullable: true })
  glPeriod: string;

  // Notification and Alerts
  @Column({ name: 'settlement_reminder_sent', default: false })
  settlementReminderSent: boolean;

  @Column({ name: 'reversal_reminder_sent', default: false })
  reversalReminderSent: boolean;

  @Column({ name: 'notification_settings', type: 'text', nullable: true })
  notificationSettings: string; // JSON object

  // Audit and Review
  @Column({ name: 'last_reviewed_date', nullable: true })
  lastReviewedDate: Date;

  @Column({ name: 'last_reviewed_by', nullable: true })
  lastReviewedBy: string;

  @Column({ name: 'review_frequency_days', default: 90 })
  reviewFrequencyDays: number;

  @Column({ name: 'next_review_date', nullable: true })
  nextReviewDate: Date;

  // Notes and Comments
  @Column({ name: 'accrual_notes', type: 'text', nullable: true })
  accrualNotes: string;

  @Column({ name: 'internal_comments', type: 'text', nullable: true })
  internalComments: string;

  @Column({ name: 'settlement_notes', type: 'text', nullable: true })
  settlementNotes: string;

  @Column({ name: 'reversal_notes', type: 'text', nullable: true })
  reversalNotes: string;

  // System and Processing
  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

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
  @OneToMany(() => AccrualJournalEntry, entry => entry.accrual)
  journalEntries: AccrualJournalEntry[];
}