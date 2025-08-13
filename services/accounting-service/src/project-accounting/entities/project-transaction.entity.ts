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
import { Project } from './project.entity';
import { ProjectWBS } from './project-wbs.entity';

export enum TransactionType {
  COST = 'COST',
  REVENUE = 'REVENUE',
  BILLING = 'BILLING',
  COMMITMENT = 'COMMITMENT',
  BUDGET_TRANSFER = 'BUDGET_TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  ALLOCATION = 'ALLOCATION',
  CAPITALIZATION = 'CAPITALIZATION',
  WRITE_OFF = 'WRITE_OFF'
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED'
}

export enum CostCategory {
  DIRECT_LABOR = 'DIRECT_LABOR',
  DIRECT_MATERIALS = 'DIRECT_MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  OVERHEAD = 'OVERHEAD',
  TRAVEL_EXPENSE = 'TRAVEL_EXPENSE',
  CONSULTING = 'CONSULTING',
  PERMITS_LICENSES = 'PERMITS_LICENSES',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  SAFETY = 'SAFETY',
  INSURANCE = 'INSURANCE',
  FINANCING_COSTS = 'FINANCING_COSTS',
  CONTINGENCY = 'CONTINGENCY',
  OTHER = 'OTHER'
}

@Entity('project_transactions')
@Index(['tenantId', 'projectId'])
@Index(['tenantId', 'transactionType'])
@Index(['tenantId', 'transactionDate'])
@Index(['tenantId', 'status'])
@Index(['wbsElementId'])
export class ProjectTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'transaction_number', length: 50, unique: true })
  transactionNumber: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'wbs_element_id', nullable: true })
  wbsElementId: string;

  @Column({ 
    name: 'transaction_type', 
    type: 'enum', 
    enum: TransactionType 
  })
  transactionType: TransactionType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  // Transaction Details
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'period', length: 20 })
  period: string; // e.g., "2024-01"

  @Column({ name: 'fiscal_year', length: 4 })
  fiscalYear: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'source_document', length: 100, nullable: true })
  sourceDocument: string; // PO, Invoice, Timesheet, etc.

  @Column({ name: 'document_number', length: 100, nullable: true })
  documentNumber: string;

  // Financial Information
  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'quantity', type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantity: number;

  @Column({ name: 'unit_of_measure', length: 20, nullable: true })
  unitOfMeasure: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 6, nullable: true })
  unitPrice: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'functional_amount', type: 'decimal', precision: 15, scale: 2 })
  functionalAmount: number;

  // Classification
  @Column({ 
    name: 'cost_category', 
    type: 'enum', 
    enum: CostCategory,
    nullable: true
  })
  costCategory: CostCategory;

  @Column({ name: 'cost_code', length: 50, nullable: true })
  costCode: string;

  @Column({ name: 'gl_account', length: 20 })
  glAccount: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 50, nullable: true })
  department: string;

  // Labor Specific Fields
  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @Column({ name: 'employee_name', length: 255, nullable: true })
  employeeName: string;

  @Column({ name: 'labor_category', length: 100, nullable: true })
  laborCategory: string; // Engineer, Technician, Operator, etc.

  @Column({ name: 'hours_worked', type: 'decimal', precision: 8, scale: 2, nullable: true })
  hoursWorked: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'billing_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  billingRate: number;

  @Column({ name: 'burden_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  burdenRate: number;

  // Vendor/Supplier Information
  @Column({ name: 'vendor_id', nullable: true })
  vendorId: string;

  @Column({ name: 'vendor_name', length: 255, nullable: true })
  vendorName: string;

  @Column({ name: 'purchase_order_number', length: 100, nullable: true })
  purchaseOrderNumber: string;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'receipt_number', length: 100, nullable: true })
  receiptNumber: string;

  // Asset and Equipment
  @Column({ name: 'asset_id', nullable: true })
  assetId: string;

  @Column({ name: 'asset_number', length: 100, nullable: true })
  assetNumber: string;

  @Column({ name: 'equipment_type', length: 100, nullable: true })
  equipmentType: string;

  @Column({ name: 'serial_number', length: 100, nullable: true })
  serialNumber: string;

  // Status and Approval
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT
  })
  status: TransactionStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'posted_by', nullable: true })
  postedBy: string;

  @Column({ name: 'posting_date', nullable: true })
  postingDate: Date;

  // Billing and Revenue Recognition
  @Column({ name: 'billable', default: true })
  billable: boolean;

  @Column({ name: 'billed', default: false })
  billed: boolean;

  @Column({ name: 'billing_date', nullable: true })
  billingDate: Date;

  @Column({ name: 'billing_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  billingAmount: number;

  @Column({ name: 'markup_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  markupPercentage: number;

  @Column({ name: 'revenue_recognized', default: false })
  revenueRecognized: boolean;

  @Column({ name: 'revenue_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenueAmount: number;

  // Commitment Tracking
  @Column({ name: 'commitment_number', length: 100, nullable: true })
  commitmentNumber: string;

  @Column({ name: 'commitment_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  commitmentAmount: number;

  @Column({ name: 'remaining_commitment', type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingCommitment: number;

  // Allocation and Distribution
  @Column({ name: 'allocation_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  allocationPercentage: number;

  @Column({ name: 'allocated_amount', type: 'decimal', precision: 15, scale: 2 })
  allocatedAmount: number;

  @Column({ name: 'allocation_method', length: 50, nullable: true })
  allocationMethod: string;

  @Column({ name: 'allocation_basis', length: 50, nullable: true })
  allocationBasis: string;

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_product', length: 100, nullable: true })
  petroleumProduct: string; // Crude Oil, Gasoline, Diesel, etc.

  @Column({ name: 'volume_liters', type: 'decimal', precision: 15, scale: 2, nullable: true })
  volumeLiters: number;

  @Column({ name: 'volume_barrels', type: 'decimal', precision: 15, scale: 2, nullable: true })
  volumeBarrels: number;

  @Column({ name: 'drilling_depth', type: 'decimal', precision: 10, scale: 2, nullable: true })
  drillingDepth: number;

  @Column({ name: 'well_number', length: 100, nullable: true })
  wellNumber: string;

  @Column({ name: 'license_block', length: 100, nullable: true })
  licenseBlock: string;

  @Column({ name: 'environmental_levy', type: 'decimal', precision: 15, scale: 2, default: 0 })
  environmentalLevy: number;

  @Column({ name: 'local_content_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  localContentValue: number;

  @Column({ name: 'local_content_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  localContentPercentage: number;

  // IFRS and Capitalization
  @Column({ name: 'capitalizable', default: false })
  capitalizable: boolean;

  @Column({ name: 'capitalized', default: false })
  capitalized: boolean;

  @Column({ name: 'capitalization_date', nullable: true })
  capitalizationDate: Date;

  @Column({ name: 'ifrs_classification', length: 50, nullable: true })
  ifrsClassification: string;

  @Column({ name: 'development_phase', length: 50, nullable: true })
  developmentPhase: string; // EXPLORATION, DEVELOPMENT, PRODUCTION

  @Column({ name: 'depreciation_method', length: 50, nullable: true })
  depreciationMethod: string;

  @Column({ name: 'useful_life_years', nullable: true })
  usefulLifeYears: number;

  // Tax and Compliance
  @Column({ name: 'tax_applicable', default: false })
  taxApplicable: boolean;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'withholding_tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxAmount: number;

  @Column({ name: 'petroleum_tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  petroleumTaxAmount: number;

  // Integration and Sync
  @Column({ name: 'gl_journal_entry_id', nullable: true })
  glJournalEntryId: string;

  @Column({ name: 'synced_to_gl', default: false })
  syncedToGL: boolean;

  @Column({ name: 'gl_sync_date', nullable: true })
  glSyncDate: Date;

  @Column({ name: 'external_transaction_id', length: 100, nullable: true })
  externalTransactionId: string;

  @Column({ name: 'source_system', length: 50, nullable: true })
  sourceSystem: string;

  // Reversals and Adjustments
  @Column({ name: 'is_reversal', default: false })
  isReversal: boolean;

  @Column({ name: 'reversed_transaction_id', nullable: true })
  reversedTransactionId: string;

  @Column({ name: 'reversal_reason', type: 'text', nullable: true })
  reversalReason: string;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'original_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  originalAmount: number;

  // Supporting Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array

  // Performance Metrics
  @Column({ name: 'productivity_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  productivityScore: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ name: 'safety_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  safetyScore: number;

  // Batch Processing
  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

  @Column({ name: 'import_id', nullable: true })
  importId: string;

  @Column({ name: 'processing_run_id', nullable: true })
  processingRunId: string;

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
  @ManyToOne(() => Project, project => project.transactions)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => ProjectWBS, wbs => wbs.transactions, { nullable: true })
  @JoinColumn({ name: 'wbs_element_id' })
  wbsElement: ProjectWBS;
}