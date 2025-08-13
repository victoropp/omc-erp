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
import { Payroll } from './payroll.entity';
import { Employee } from '../../employee/entities/employee.entity';

export enum DeductionType {
  INCOME_TAX = 'INCOME_TAX',
  SSNIT_EMPLOYEE = 'SSNIT_EMPLOYEE',
  TIER2_PENSION = 'TIER2_PENSION',
  TIER3_PENSION = 'TIER3_PENSION',
  UNION_DUES = 'UNION_DUES',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  SALARY_ADVANCE = 'SALARY_ADVANCE',
  INSURANCE_PREMIUM = 'INSURANCE_PREMIUM',
  MEDICAL_INSURANCE = 'MEDICAL_INSURANCE',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  WELFARE_CONTRIBUTION = 'WELFARE_CONTRIBUTION',
  COOPERATIVE_SAVINGS = 'COOPERATIVE_SAVINGS',
  DISCIPLINARY_DEDUCTION = 'DISCIPLINARY_DEDUCTION',
  COURT_ORDER = 'COURT_ORDER',
  GARNISHMENT = 'GARNISHMENT',
  TARDINESS_PENALTY = 'TARDINESS_PENALTY',
  ABSENCE_DEDUCTION = 'ABSENCE_DEDUCTION',
  UNIFORM_DEDUCTION = 'UNIFORM_DEDUCTION',
  EQUIPMENT_DAMAGE = 'EQUIPMENT_DAMAGE',
  CAFETERIA_DEDUCTION = 'CAFETERIA_DEDUCTION',
  TRANSPORT_DEDUCTION = 'TRANSPORT_DEDUCTION',
  PARKING_FEE = 'PARKING_FEE',
  PHONE_BILL = 'PHONE_BILL',
  OTHER = 'OTHER'
}

export enum DeductionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DeductionFrequency {
  ONCE = 'ONCE',
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL'
}

export enum DeductionMethod {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  GRADUATED = 'GRADUATED',
  TIERED = 'TIERED'
}

@Entity('payroll_deductions')
@Index(['tenantId', 'payrollId'])
@Index(['tenantId', 'employeeId'])
@Index(['deductionType'])
@Index(['effectiveDate'])
export class PayrollDeduction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'payroll_id', nullable: true })
  payrollId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'deduction_code', length: 20, unique: true })
  deductionCode: string;

  // Deduction Details
  @Column({ 
    name: 'deduction_type', 
    type: 'enum', 
    enum: DeductionType 
  })
  deductionType: DeductionType;

  @Column({ name: 'deduction_name', length: 255 })
  deductionName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'deduction_category', length: 100, nullable: true })
  deductionCategory: string; // STATUTORY, VOLUNTARY, EMPLOYER_INITIATED

  @Column({ 
    name: 'deduction_status', 
    type: 'enum', 
    enum: DeductionStatus,
    default: DeductionStatus.ACTIVE
  })
  deductionStatus: DeductionStatus;

  // Amount and Calculation
  @Column({ 
    name: 'deduction_method', 
    type: 'enum', 
    enum: DeductionMethod,
    default: DeductionMethod.FIXED_AMOUNT
  })
  deductionMethod: DeductionMethod;

  @Column({ name: 'deduction_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  deductionAmount: number;

  @Column({ name: 'deduction_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  deductionPercentage: number;

  @Column({ name: 'minimum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumAmount: number;

  @Column({ name: 'maximum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumAmount: number;

  @Column({ name: 'calculation_base', length: 50, default: 'GROSS_PAY' })
  calculationBase: string; // GROSS_PAY, BASIC_SALARY, TAXABLE_INCOME

  @Column({ name: 'calculated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  calculatedAmount: number;

  @Column({ name: 'actual_deducted_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualDeductedAmount: number;

  // Timing and Frequency
  @Column({ 
    name: 'deduction_frequency', 
    type: 'enum', 
    enum: DeductionFrequency,
    default: DeductionFrequency.MONTHLY
  })
  deductionFrequency: DeductionFrequency;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'next_deduction_date', type: 'date', nullable: true })
  nextDeductionDate: Date;

  @Column({ name: 'last_deduction_date', type: 'date', nullable: true })
  lastDeductionDate: Date;

  // Loan/Installment Specific
  @Column({ name: 'total_loan_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalLoanAmount: number;

  @Column({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingBalance: number;

  @Column({ name: 'installment_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  installmentAmount: number;

  @Column({ name: 'number_of_installments', nullable: true })
  numberOfInstallments: number;

  @Column({ name: 'installments_paid', default: 0 })
  installmentsPaid: number;

  @Column({ name: 'installments_remaining', nullable: true })
  installmentsRemaining: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number;

  // Priority and Sequencing
  @Column({ name: 'deduction_priority', default: 100 })
  deductionPriority: number; // Lower numbers = higher priority

  @Column({ name: 'deduction_sequence', default: 1 })
  deductionSequence: number;

  @Column({ name: 'mandatory_deduction', default: false })
  mandatoryDeduction: boolean;

  @Column({ name: 'pre_tax_deduction', default: false })
  preTaxDeduction: boolean;

  @Column({ name: 'post_tax_deduction', default: true })
  postTaxDeduction: boolean;

  // Ghana Specific
  @Column({ name: 'ghana_tax_deductible', default: false })
  ghanaTaxDeductible: boolean;

  @Column({ name: 'ssnit_applicable', default: true })
  ssnitApplicable: boolean;

  @Column({ name: 'pension_applicable', default: true })
  pensionApplicable: boolean;

  @Column({ name: 'statutory_deduction', default: false })
  statutoryDeduction: boolean;

  @Column({ name: 'court_ordered', default: false })
  courtOrdered: boolean;

  @Column({ name: 'court_order_reference', length: 100, nullable: true })
  courtOrderReference: string;

  // Limits and Caps
  @Column({ name: 'annual_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualLimit: number;

  @Column({ name: 'monthly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyLimit: number;

  @Column({ name: 'ytd_deducted', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdDeducted: number;

  @Column({ name: 'lifetime_deducted', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimeDeducted: number;

  @Column({ name: 'salary_percentage_limit', type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryPercentageLimit: number; // Maximum % of salary that can be deducted

  // Employee Consent and Authorization
  @Column({ name: 'employee_consent', default: false })
  employeeConsent: boolean;

  @Column({ name: 'consent_date', type: 'date', nullable: true })
  consentDate: Date;

  @Column({ name: 'consent_document_url', length: 500, nullable: true })
  consentDocumentUrl: string;

  @Column({ name: 'authorization_form_url', length: 500, nullable: true })
  authorizationFormUrl: string;

  @Column({ name: 'revocation_notice', default: false })
  revocationNotice: boolean;

  @Column({ name: 'revocation_date', type: 'date', nullable: true })
  revocationDate: Date;

  @Column({ name: 'revocation_effective_date', type: 'date', nullable: true })
  revocationEffectiveDate: Date;

  // Processing Information
  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'processing_date', type: 'date', nullable: true })
  processingDate: Date;

  @Column({ name: 'processing_notes', type: 'text', nullable: true })
  processingNotes: string;

  @Column({ name: 'failed_processing', default: false })
  failedProcessing: boolean;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  // Beneficiary Information (for union dues, welfare, etc.)
  @Column({ name: 'beneficiary_name', length: 255, nullable: true })
  beneficiaryName: string;

  @Column({ name: 'beneficiary_account', length: 50, nullable: true })
  beneficiaryAccount: string;

  @Column({ name: 'beneficiary_bank', length: 255, nullable: true })
  beneficiaryBank: string;

  @Column({ name: 'remittance_required', default: false })
  remittanceRequired: boolean;

  @Column({ name: 'remittance_frequency', length: 20, default: 'MONTHLY' })
  remittanceFrequency: string;

  @Column({ name: 'last_remittance_date', type: 'date', nullable: true })
  lastRemittanceDate: Date;

  @Column({ name: 'remittance_reference', length: 100, nullable: true })
  remittanceReference: string;

  // Adjustment and Correction
  @Column({ name: 'adjustment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'adjustment_date', type: 'date', nullable: true })
  adjustmentDate: Date;

  @Column({ name: 'adjusted_by', length: 255, nullable: true })
  adjustedBy: string;

  @Column({ name: 'reversal_allowed', default: false })
  reversalAllowed: boolean;

  @Column({ name: 'reversed', default: false })
  reversed: boolean;

  @Column({ name: 'reversal_date', type: 'date', nullable: true })
  reversalDate: Date;

  @Column({ name: 'reversal_reason', type: 'text', nullable: true })
  reversalReason: string;

  // Reporting and Compliance
  @Column({ name: 'taxable_benefit', default: false })
  taxableBenefit: boolean;

  @Column({ name: 'reportable_to_irs', default: false })
  reportableToIRS: boolean; // Ghana Revenue Authority

  @Column({ name: 'reportable_to_ssnit', default: false })
  reportableToSSNIT: boolean;

  @Column({ name: 'reportable_to_npra', default: false })
  reportableToNPRA: boolean; // National Pensions Regulatory Authority

  @Column({ name: 'compliance_code', length: 20, nullable: true })
  complianceCode: string;

  @Column({ name: 'gl_account', length: 20, nullable: true })
  glAccount: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  // Currency and Exchange
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Approval and Authorization
  @Column({ name: 'approval_required', default: false })
  approvalRequired: boolean;

  @Column({ name: 'approved', nullable: true })
  approved: boolean;

  @Column({ name: 'approved_by', length: 255, nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  @Column({ name: 'hr_approval_required', default: false })
  hrApprovalRequired: boolean;

  @Column({ name: 'hr_approved', nullable: true })
  hrApproved: boolean;

  @Column({ name: 'hr_approval_date', type: 'date', nullable: true })
  hrApprovalDate: Date;

  // Document Management
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'deduction_slip_url', length: 500, nullable: true })
  deductionSlipUrl: string;

  @Column({ name: 'remittance_advice_url', length: 500, nullable: true })
  remittanceAdviceUrl: string;

  // Notes and Comments
  @Column({ name: 'deduction_notes', type: 'text', nullable: true })
  deductionNotes: string;

  @Column({ name: 'employee_notes', type: 'text', nullable: true })
  employeeNotes: string;

  @Column({ name: 'hr_notes', type: 'text', nullable: true })
  hrNotes: string;

  @Column({ name: 'system_notes', type: 'text', nullable: true })
  systemNotes: string;

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
  @ManyToOne(() => Payroll, payroll => payroll.customDeductions, { nullable: true })
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;

  @ManyToOne(() => Employee, employee => employee.id)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}