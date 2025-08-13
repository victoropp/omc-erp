import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { TaxConfiguration } from './tax-configuration.entity';
import { TaxPayment } from './tax-payment.entity';

export enum TaxCalculationStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  FILED = 'FILED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum TaxPeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL'
}

@Entity('tax_calculations')
@Index(['tenantId', 'taxConfigurationId'])
@Index(['tenantId', 'taxPeriod'])
@Index(['tenantId', 'status'])
@Index(['dueDate'])
export class TaxCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'calculation_number', length: 50, unique: true })
  calculationNumber: string;

  @Column({ name: 'tax_configuration_id' })
  taxConfigurationId: string;

  // Period Information
  @Column({ name: 'tax_period', type: 'date' })
  taxPeriod: Date; // The period this calculation covers

  @Column({ 
    name: 'period_type', 
    type: 'enum', 
    enum: TaxPeriodType 
  })
  periodType: TaxPeriodType;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'financial_year', length: 10 })
  financialYear: string; // e.g., "2024"

  // Calculation Details
  @Column({ name: 'gross_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossIncome: number;

  @Column({ name: 'exempt_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  exemptIncome: number;

  @Column({ name: 'taxable_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableIncome: number;

  @Column({ name: 'deductible_expenses', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deductibleExpenses: number;

  @Column({ name: 'capital_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  capitalAllowances: number;

  @Column({ name: 'investment_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  investmentAllowances: number;

  @Column({ name: 'loss_brought_forward', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossBroughtForward: number;

  @Column({ name: 'loss_utilized', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossUtilized: number;

  @Column({ name: 'loss_carried_forward', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossCarriedForward: number;

  @Column({ name: 'adjusted_taxable_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  adjustedTaxableIncome: number;

  // Tax Calculations
  @Column({ name: 'tax_rate_applied', type: 'decimal', precision: 10, scale: 6, default: 0 })
  taxRateApplied: number;

  @Column({ name: 'tax_before_credits', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxBeforeCredits: number;

  @Column({ name: 'tax_credits', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxCredits: number;

  @Column({ name: 'withholding_tax_credits', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxCredits: number;

  @Column({ name: 'installment_tax_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  installmentTaxPaid: number;

  @Column({ name: 'net_tax_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netTaxPayable: number;

  // Ghana-Specific Tax Components
  @Column({ name: 'corporate_income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  corporateIncomeTax: number;

  @Column({ name: 'vat_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatPayable: number;

  @Column({ name: 'nhil_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  nhilPayable: number;

  @Column({ name: 'getf_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  getfPayable: number;

  @Column({ name: 'covid_levy_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  covidLevyPayable: number;

  @Column({ name: 'withholding_tax_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxPayable: number;

  @Column({ name: 'petroleum_additional_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  petroleumAdditionalTax: number;

  // Minimum Tax Calculations (Ghana requires minimum tax)
  @Column({ name: 'minimum_tax_applicable', default: false })
  minimumTaxApplicable: boolean;

  @Column({ name: 'minimum_tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minimumTaxAmount: number;

  @Column({ name: 'minimum_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 1.00 })
  minimumTaxRate: number; // 1% of gross turnover

  @Column({ name: 'gross_turnover', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossTurnover: number;

  // Payment Information
  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'balance_outstanding', type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceOutstanding: number;

  @Column({ name: 'penalty_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ name: 'interest_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestAmount: number;

  @Column({ name: 'total_amount_due', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmountDue: number;

  // Status and Workflow
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: TaxCalculationStatus,
    default: TaxCalculationStatus.DRAFT
  })
  status: TaxCalculationStatus;

  @Column({ name: 'calculated_date', nullable: true })
  calculatedDate: Date;

  @Column({ name: 'calculated_by', nullable: true })
  calculatedBy: string;

  @Column({ name: 'reviewed_date', nullable: true })
  reviewedDate: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'approved_date', nullable: true })
  approvedDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'filed_date', nullable: true })
  filedDate: Date;

  @Column({ name: 'filed_by', nullable: true })
  filedBy: string;

  @Column({ name: 'gra_reference_number', length: 100, nullable: true })
  graReferenceNumber: string;

  // Supporting Data (JSON)
  @Column({ name: 'calculation_details', type: 'text', nullable: true })
  calculationDetails: string; // JSON object with detailed calculations

  @Column({ name: 'adjustment_details', type: 'text', nullable: true })
  adjustmentDetails: string; // JSON array of adjustments made

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document references

  // IFRS Compliance
  @Column({ name: 'current_tax_expense', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentTaxExpense: number; // IAS 12 - Current tax

  @Column({ name: 'deferred_tax_asset', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deferredTaxAsset: number; // IAS 12 - Deferred tax asset

  @Column({ name: 'deferred_tax_liability', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deferredTaxLiability: number; // IAS 12 - Deferred tax liability

  @Column({ name: 'temporary_differences', type: 'text', nullable: true })
  temporaryDifferences: string; // JSON array of temporary differences

  // Currency
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  // Notes and Comments
  @Column({ name: 'calculation_notes', type: 'text', nullable: true })
  calculationNotes: string;

  @Column({ name: 'reviewer_comments', type: 'text', nullable: true })
  reviewerComments: string;

  @Column({ name: 'approver_comments', type: 'text', nullable: true })
  approverComments: string;

  // Automation Flags
  @Column({ name: 'auto_calculated', default: false })
  autoCalculated: boolean;

  @Column({ name: 'requires_manual_review', default: true })
  requiresManualReview: boolean;

  @Column({ name: 'has_exceptions', default: false })
  hasExceptions: boolean;

  @Column({ name: 'exception_details', type: 'text', nullable: true })
  exceptionDetails: string;

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
  @ManyToOne(() => TaxConfiguration, config => config.calculations)
  @JoinColumn({ name: 'tax_configuration_id' })
  taxConfiguration: TaxConfiguration;

  @OneToMany(() => TaxPayment, payment => payment.taxCalculation)
  payments: TaxPayment[];
}