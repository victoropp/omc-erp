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
import { Accrual } from './accrual.entity';

export enum JournalEntryType {
  ACCRUAL_ENTRY = 'ACCRUAL_ENTRY',
  REVERSAL_ENTRY = 'REVERSAL_ENTRY',
  ADJUSTMENT_ENTRY = 'ADJUSTMENT_ENTRY',
  SETTLEMENT_ENTRY = 'SETTLEMENT_ENTRY',
  RECLASSIFICATION_ENTRY = 'RECLASSIFICATION_ENTRY'
}

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED'
}

@Entity('accrual_journal_entries')
@Index(['tenantId', 'accrualId'])
@Index(['tenantId', 'entryDate'])
@Index(['tenantId', 'status'])
@Index(['journalEntryNumber'])
export class AccrualJournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'accrual_id' })
  accrualId: string;

  @Column({ name: 'journal_entry_number', length: 50, unique: true })
  journalEntryNumber: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ 
    name: 'entry_type', 
    type: 'enum', 
    enum: JournalEntryType 
  })
  entryType: JournalEntryType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  // Entry Details
  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'posting_date', type: 'date', nullable: true })
  postingDate: Date;

  @Column({ name: 'gl_period', length: 20 })
  glPeriod: string; // e.g., "2024-01"

  @Column({ name: 'financial_year', length: 10 })
  financialYear: string;

  // Amounts
  @Column({ name: 'debit_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitAmount: number;

  @Column({ name: 'credit_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditAmount: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Account Mappings
  @Column({ name: 'debit_account', length: 20 })
  debitAccount: string;

  @Column({ name: 'debit_account_name', length: 255, nullable: true })
  debitAccountName: string;

  @Column({ name: 'credit_account', length: 20 })
  creditAccount: string;

  @Column({ name: 'credit_account_name', length: 255, nullable: true })
  creditAccountName: string;

  // Cost Center and Project Allocation
  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 50, nullable: true })
  department: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ name: 'profit_center', length: 20, nullable: true })
  profitCenter: string;

  @Column({ name: 'business_unit', length: 50, nullable: true })
  businessUnit: string;

  // Status and Processing
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT
  })
  status: JournalEntryStatus;

  @Column({ name: 'posted_by', nullable: true })
  postedBy: string;

  @Column({ name: 'posted_date', nullable: true })
  postedDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  // Reversal Information
  @Column({ name: 'is_reversal', default: false })
  isReversal: boolean;

  @Column({ name: 'reversed_entry_id', nullable: true })
  reversedEntryId: string;

  @Column({ name: 'reversal_reason', type: 'text', nullable: true })
  reversalReason: string;

  @Column({ name: 'auto_reversal', default: false })
  autoReversal: boolean;

  @Column({ name: 'reversal_date', nullable: true })
  reversalDate: Date;

  // Adjustment Information
  @Column({ name: 'is_adjustment', default: false })
  isAdjustment: boolean;

  @Column({ name: 'original_entry_id', nullable: true })
  originalEntryId: string;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'adjusted_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  adjustedAmount: number;

  // Tax and Compliance
  @Column({ name: 'tax_applicable', default: false })
  taxApplicable: boolean;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'tax_account', length: 20, nullable: true })
  taxAccount: string;

  @Column({ name: 'withholding_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTax: number;

  // IFRS Compliance
  @Column({ name: 'ifrs_category', length: 50, nullable: true })
  ifrsCategory: string; // ASSETS, LIABILITIES, EQUITY, INCOME, EXPENSES

  @Column({ name: 'ifrs_subcategory', length: 100, nullable: true })
  ifrsSubcategory: string;

  @Column({ name: 'ifrs_standard_reference', length: 50, nullable: true })
  ifrsStandardReference: string; // IAS 37, IFRS 15, etc.

  @Column({ name: 'measurement_basis', length: 50, nullable: true })
  measurementBasis: string;

  // Supporting Documentation
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array

  @Column({ name: 'source_document_type', length: 50, nullable: true })
  sourceDocumentType: string; // INVOICE, CONTRACT, AGREEMENT, etc.

  @Column({ name: 'source_document_number', length: 100, nullable: true })
  sourceDocumentNumber: string;

  // Batch Processing
  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

  @Column({ name: 'batch_sequence', nullable: true })
  batchSequence: number;

  @Column({ name: 'processing_run_id', nullable: true })
  processingRunId: string;

  // Automation and System
  @Column({ name: 'auto_generated', default: false })
  autoGenerated: boolean;

  @Column({ name: 'system_entry', default: false })
  systemEntry: boolean;

  @Column({ name: 'recurring_entry', default: false })
  recurringEntry: boolean;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  // Workflow and Approval
  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_level', nullable: true })
  approvalLevel: number;

  @Column({ name: 'approval_workflow_id', nullable: true })
  approvalWorkflowId: string;

  @Column({ name: 'approval_status', length: 20, default: 'PENDING' })
  approvalStatus: string;

  // External System Integration
  @Column({ name: 'external_system_id', length: 100, nullable: true })
  externalSystemId: string;

  @Column({ name: 'external_reference', length: 255, nullable: true })
  externalReference: string;

  @Column({ name: 'sync_status', length: 20, default: 'SYNCED' })
  syncStatus: string;

  @Column({ name: 'last_sync_date', nullable: true })
  lastSyncDate: Date;

  // Analytics and Reporting
  @Column({ name: 'business_segment', length: 50, nullable: true })
  businessSegment: string;

  @Column({ name: 'product_line', length: 50, nullable: true })
  productLine: string;

  @Column({ name: 'geographic_region', length: 50, nullable: true })
  geographicRegion: string;

  @Column({ name: 'customer_segment', length: 50, nullable: true })
  customerSegment: string;

  // Error Handling
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'validation_errors', type: 'text', nullable: true })
  validationErrors: string;

  @Column({ name: 'warning_messages', type: 'text', nullable: true })
  warningMessages: string;

  // Performance Tracking
  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs: number;

  @Column({ name: 'complexity_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  complexityScore: number;

  // Notes and Comments
  @Column({ name: 'entry_notes', type: 'text', nullable: true })
  entryNotes: string;

  @Column({ name: 'accounting_memo', type: 'text', nullable: true })
  accountingMemo: string;

  @Column({ name: 'reviewer_comments', type: 'text', nullable: true })
  reviewerComments: string;

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
  @ManyToOne(() => Accrual, accrual => accrual.journalEntries)
  @JoinColumn({ name: 'accrual_id' })
  accrual: Accrual;
}