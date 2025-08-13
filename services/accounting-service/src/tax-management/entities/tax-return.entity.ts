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
import { TaxConfiguration } from './tax-configuration.entity';

export enum TaxReturnStatus {
  DRAFT = 'DRAFT',
  PREPARED = 'PREPARED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  FILED = 'FILED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  REJECTED = 'REJECTED',
  AMENDED = 'AMENDED'
}

export enum TaxReturnType {
  CORPORATE_INCOME_TAX = 'CORPORATE_INCOME_TAX',
  VAT_RETURN = 'VAT_RETURN',
  WITHHOLDING_TAX = 'WITHHOLDING_TAX',
  ANNUAL_RETURN = 'ANNUAL_RETURN',
  MONTHLY_RETURN = 'MONTHLY_RETURN',
  QUARTERLY_RETURN = 'QUARTERLY_RETURN',
  AMENDED_RETURN = 'AMENDED_RETURN'
}

@Entity('tax_returns')
@Index(['tenantId', 'taxConfigurationId'])
@Index(['tenantId', 'returnPeriod'])
@Index(['tenantId', 'status'])
@Index(['filingDueDate'])
export class TaxReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'return_number', length: 50, unique: true })
  returnNumber: string;

  @Column({ name: 'tax_configuration_id' })
  taxConfigurationId: string;

  @Column({ 
    name: 'return_type', 
    type: 'enum', 
    enum: TaxReturnType 
  })
  returnType: TaxReturnType;

  // Period Information
  @Column({ name: 'return_period', type: 'date' })
  returnPeriod: Date;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'financial_year', length: 10 })
  financialYear: string;

  // Filing Information
  @Column({ name: 'filing_due_date', type: 'date' })
  filingDueDate: Date;

  @Column({ name: 'extension_due_date', type: 'date', nullable: true })
  extensionDueDate: Date;

  @Column({ name: 'filed_date', nullable: true })
  filedDate: Date;

  @Column({ name: 'filed_by', nullable: true })
  filedBy: string;

  // Return Data
  @Column({ name: 'gross_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossIncome: number;

  @Column({ name: 'taxable_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableIncome: number;

  @Column({ name: 'tax_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxPayable: number;

  @Column({ name: 'tax_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxPaid: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  refundAmount: number;

  // Ghana-Specific Return Components
  @Column({ name: 'corporate_income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  corporateIncomeTax: number;

  @Column({ name: 'vat_output_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatOutputTax: number;

  @Column({ name: 'vat_input_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatInputTax: number;

  @Column({ name: 'vat_net_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatNetPayable: number;

  @Column({ name: 'nhil_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  nhilPayable: number;

  @Column({ name: 'getf_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  getfPayable: number;

  @Column({ name: 'covid_levy_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  covidLevyPayable: number;

  @Column({ name: 'withholding_tax_deducted', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxDeducted: number;

  @Column({ name: 'withholding_tax_remitted', type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxRemitted: number;

  // Deductions and Allowances
  @Column({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ name: 'capital_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  capitalAllowances: number;

  @Column({ name: 'investment_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  investmentAllowances: number;

  @Column({ name: 'loss_brought_forward', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossBroughtForward: number;

  @Column({ name: 'loss_utilized', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lossUtilized: number;

  // Status and Workflow
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: TaxReturnStatus,
    default: TaxReturnStatus.DRAFT
  })
  status: TaxReturnStatus;

  @Column({ name: 'prepared_by', nullable: true })
  preparedBy: string;

  @Column({ name: 'preparation_date', nullable: true })
  preparationDate: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'review_date', nullable: true })
  reviewDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  // GRA Integration
  @Column({ name: 'gra_return_id', length: 100, nullable: true })
  graReturnId: string;

  @Column({ name: 'gra_acknowledgment_number', length: 100, nullable: true })
  graAcknowledgmentNumber: string;

  @Column({ name: 'gra_submission_reference', length: 100, nullable: true })
  graSubmissionReference: string;

  @Column({ name: 'gra_status', length: 50, nullable: true })
  graStatus: string;

  @Column({ name: 'gra_response_message', type: 'text', nullable: true })
  graResponseMessage: string;

  @Column({ name: 'gra_validation_errors', type: 'text', nullable: true })
  graValidationErrors: string;

  // Amendment Information
  @Column({ name: 'is_amended_return', default: false })
  isAmendedReturn: boolean;

  @Column({ name: 'original_return_id', nullable: true })
  originalReturnId: string;

  @Column({ name: 'amendment_reason', type: 'text', nullable: true })
  amendmentReason: string;

  @Column({ name: 'amendment_date', nullable: true })
  amendmentDate: Date;

  // Supporting Data
  @Column({ name: 'return_data', type: 'text', nullable: true })
  returnData: string; // JSON object with complete return data

  @Column({ name: 'schedules_data', type: 'text', nullable: true })
  schedulesData: string; // JSON object with schedule details

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document references

  // Validation and Compliance
  @Column({ name: 'validation_status', length: 20, default: 'PENDING' })
  validationStatus: string; // PENDING, VALID, INVALID

  @Column({ name: 'validation_errors', type: 'text', nullable: true })
  validationErrors: string; // JSON array of validation errors

  @Column({ name: 'compliance_check_status', length: 20, default: 'PENDING' })
  complianceCheckStatus: string;

  @Column({ name: 'compliance_issues', type: 'text', nullable: true })
  complianceIssues: string; // JSON array of compliance issues

  // Extensions
  @Column({ name: 'extension_requested', default: false })
  extensionRequested: boolean;

  @Column({ name: 'extension_granted', default: false })
  extensionGranted: boolean;

  @Column({ name: 'extension_reason', type: 'text', nullable: true })
  extensionReason: string;

  @Column({ name: 'extension_approval_number', length: 100, nullable: true })
  extensionApprovalNumber: string;

  // Electronic Filing
  @Column({ name: 'electronic_filing', default: true })
  electronicFiling: boolean;

  @Column({ name: 'filing_method', length: 20, default: 'ONLINE' })
  filingMethod: string; // ONLINE, PAPER, EMAIL

  @Column({ name: 'digital_signature', length: 500, nullable: true })
  digitalSignature: string;

  @Column({ name: 'filing_confirmation', length: 500, nullable: true })
  filingConfirmation: string;

  // Currency
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  // Penalties and Interest
  @Column({ name: 'late_filing_penalty', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lateFilingPenalty: number;

  @Column({ name: 'late_payment_penalty', type: 'decimal', precision: 15, scale: 2, default: 0 })
  latePaymentPenalty: number;

  @Column({ name: 'interest_charges', type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestCharges: number;

  // Notes and Comments
  @Column({ name: 'preparation_notes', type: 'text', nullable: true })
  preparationNotes: string;

  @Column({ name: 'review_comments', type: 'text', nullable: true })
  reviewComments: string;

  @Column({ name: 'filing_notes', type: 'text', nullable: true })
  filingNotes: string;

  // Automation
  @Column({ name: 'auto_generated', default: false })
  autoGenerated: boolean;

  @Column({ name: 'auto_filed', default: false })
  autoFiled: boolean;

  @Column({ name: 'requires_manual_review', default: true })
  requiresManualReview: boolean;

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
  @ManyToOne(() => TaxConfiguration, config => config.taxReturns)
  @JoinColumn({ name: 'tax_configuration_id' })
  taxConfiguration: TaxConfiguration;
}