import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { PrepaymentAmortization } from './prepayment-amortization.entity';

export enum PrepaymentType {
  INSURANCE = 'INSURANCE',
  RENT = 'RENT',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
  MAINTENANCE_CONTRACT = 'MAINTENANCE_CONTRACT',
  MARKETING_CAMPAIGN = 'MARKETING_CAMPAIGN',
  PROFESSIONAL_FEES = 'PROFESSIONAL_FEES',
  UTILITIES = 'UTILITIES',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  TAXES = 'TAXES',
  BOND_PREMIUM = 'BOND_PREMIUM',
  EQUIPMENT_LEASE = 'EQUIPMENT_LEASE',
  OTHER = 'OTHER'
}

export enum PrepaymentStatus {
  ACTIVE = 'ACTIVE',
  FULLY_AMORTIZED = 'FULLY_AMORTIZED',
  WRITTEN_OFF = 'WRITTEN_OFF',
  CANCELLED = 'CANCELLED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export enum AmortizationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  ACCELERATED = 'ACCELERATED',
  USAGE_BASED = 'USAGE_BASED',
  MANUAL = 'MANUAL'
}

@Entity('prepayments')
@Index(['tenantId', 'prepaymentType'])
@Index(['tenantId', 'status'])
@Index(['startDate', 'endDate'])
@Index(['nextAmortizationDate'])
export class Prepayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'prepayment_number', length: 50, unique: true })
  prepaymentNumber: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string; // External reference (invoice, contract, etc.)

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ 
    name: 'prepayment_type', 
    type: 'enum', 
    enum: PrepaymentType 
  })
  prepaymentType: PrepaymentType;

  // Financial Details
  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: number;

  @Column({ name: 'amortized_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  amortizedAmount: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Timing and Amortization
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'total_periods' })
  totalPeriods: number; // Number of periods for amortization

  @Column({ name: 'periods_completed', default: 0 })
  periodsCompleted: number;

  @Column({ name: 'amortization_frequency', length: 20, default: 'MONTHLY' })
  amortizationFrequency: string; // DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY

  @Column({ 
    name: 'amortization_method', 
    type: 'enum', 
    enum: AmortizationMethod,
    default: AmortizationMethod.STRAIGHT_LINE
  })
  amortizationMethod: AmortizationMethod;

  @Column({ name: 'amount_per_period', type: 'decimal', precision: 15, scale: 2 })
  amountPerPeriod: number;

  @Column({ name: 'next_amortization_date', type: 'date', nullable: true })
  nextAmortizationDate: Date;

  @Column({ name: 'last_amortization_date', type: 'date', nullable: true })
  lastAmortizationDate: Date;

  // Account Mappings
  @Column({ name: 'prepayment_account', length: 20 })
  prepaymentAccount: string; // Balance sheet account (asset)

  @Column({ name: 'expense_account', length: 20 })
  expenseAccount: string; // P&L account for amortization

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 50, nullable: true })
  department: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  // Vendor/Supplier Information
  @Column({ name: 'vendor_id', nullable: true })
  vendorId: string;

  @Column({ name: 'vendor_name', length: 255, nullable: true })
  vendorName: string;

  @Column({ name: 'vendor_invoice_number', length: 100, nullable: true })
  vendorInvoiceNumber: string;

  @Column({ name: 'purchase_order_number', length: 100, nullable: true })
  purchaseOrderNumber: string;

  // Contract Information
  @Column({ name: 'contract_number', length: 100, nullable: true })
  contractNumber: string;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ name: 'auto_renewal', default: false })
  autoRenewal: boolean;

  @Column({ name: 'renewal_notice_days', nullable: true })
  renewalNoticeDays: number;

  // Status and Workflow
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: PrepaymentStatus,
    default: PrepaymentStatus.PENDING_APPROVAL
  })
  status: PrepaymentStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Automation Settings
  @Column({ name: 'auto_amortize', default: true })
  autoAmortize: boolean;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'notification_before_expiry_days', default: 30 })
  notificationBeforeExpiryDays: number;

  @Column({ name: 'expiry_notification_sent', default: false })
  expiryNotificationSent: boolean;

  // Usage-Based Amortization (if applicable)
  @Column({ name: 'total_usage_units', nullable: true })
  totalUsageUnits: number; // e.g., hours, miles, units

  @Column({ name: 'used_units', default: 0 })
  usedUnits: number;

  @Column({ name: 'usage_unit_type', length: 50, nullable: true })
  usageUnitType: string; // HOURS, MILES, UNITS, etc.

  @Column({ name: 'cost_per_unit', type: 'decimal', precision: 15, scale: 6, nullable: true })
  costPerUnit: number;

  // IFRS Compliance
  @Column({ name: 'ifrs_classification', length: 50, default: 'CURRENT_ASSET' })
  ifrsClassification: string; // CURRENT_ASSET, NON_CURRENT_ASSET

  @Column({ name: 'component_of_asset', default: false })
  componentOfAsset: boolean; // IAS 16 - part of a larger asset

  @Column({ name: 'related_asset_id', nullable: true })
  relatedAssetId: string;

  @Column({ name: 'impairment_indicator', default: false })
  impairmentIndicator: boolean;

  @Column({ name: 'impairment_test_date', nullable: true })
  impairmentTestDate: Date;

  @Column({ name: 'impairment_loss', type: 'decimal', precision: 15, scale: 2, default: 0 })
  impairmentLoss: number;

  // Tax Considerations
  @Column({ name: 'tax_deductible', default: true })
  taxDeductible: boolean;

  @Column({ name: 'tax_amortization_method', length: 50, nullable: true })
  taxAmortizationMethod: string;

  @Column({ name: 'tax_amortization_periods', nullable: true })
  taxAmortizationPeriods: number;

  @Column({ name: 'deductible_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  deductiblePercentage: number;

  // Supporting Information
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array for categorization

  // GL Integration
  @Column({ name: 'original_journal_entry_id', nullable: true })
  originalJournalEntryId: string;

  @Column({ name: 'posted_to_gl', default: false })
  postedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  // Budget Integration
  @Column({ name: 'budget_line_id', nullable: true })
  budgetLineId: string;

  @Column({ name: 'budget_impact_calculated', default: false })
  budgetImpactCalculated: boolean;

  // Alerts and Notifications
  @Column({ name: 'renewal_alert_sent', default: false })
  renewalAlertSent: boolean;

  @Column({ name: 'renewal_alert_date', nullable: true })
  renewalAlertDate: Date;

  @Column({ name: 'completion_alert_sent', default: false })
  completionAlertSent: boolean;

  // Performance Tracking
  @Column({ name: 'roi_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  roiPercentage: number; // Return on investment

  @Column({ name: 'utilization_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilizationPercentage: number;

  @Column({ name: 'performance_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceScore: number;

  @Column({ name: 'performance_notes', type: 'text', nullable: true })
  performanceNotes: string;

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
  @OneToMany(() => PrepaymentAmortization, amortization => amortization.prepayment)
  amortizations: PrepaymentAmortization[];
}