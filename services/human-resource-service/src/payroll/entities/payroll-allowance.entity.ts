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

export enum AllowanceType {
  HOUSING_ALLOWANCE = 'HOUSING_ALLOWANCE',
  TRANSPORT_ALLOWANCE = 'TRANSPORT_ALLOWANCE',
  FUEL_ALLOWANCE = 'FUEL_ALLOWANCE',
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  MEDICAL_ALLOWANCE = 'MEDICAL_ALLOWANCE',
  EDUCATION_ALLOWANCE = 'EDUCATION_ALLOWANCE',
  RISK_ALLOWANCE = 'RISK_ALLOWANCE',
  RESPONSIBILITY_ALLOWANCE = 'RESPONSIBILITY_ALLOWANCE',
  SHIFT_ALLOWANCE = 'SHIFT_ALLOWANCE',
  LOCATION_ALLOWANCE = 'LOCATION_ALLOWANCE',
  HARDSHIP_ALLOWANCE = 'HARDSHIP_ALLOWANCE',
  ACTING_ALLOWANCE = 'ACTING_ALLOWANCE',
  OVERTIME_ALLOWANCE = 'OVERTIME_ALLOWANCE',
  CALL_OUT_ALLOWANCE = 'CALL_OUT_ALLOWANCE',
  STANDBY_ALLOWANCE = 'STANDBY_ALLOWANCE',
  HAZARD_PAY = 'HAZARD_PAY',
  ISOLATION_ALLOWANCE = 'ISOLATION_ALLOWANCE',
  ENTERTAINMENT_ALLOWANCE = 'ENTERTAINMENT_ALLOWANCE',
  COMMUNICATION_ALLOWANCE = 'COMMUNICATION_ALLOWANCE',
  UNIFORM_ALLOWANCE = 'UNIFORM_ALLOWANCE',
  TOOL_ALLOWANCE = 'TOOL_ALLOWANCE',
  PROFESSIONAL_ALLOWANCE = 'PROFESSIONAL_ALLOWANCE',
  TRAINING_ALLOWANCE = 'TRAINING_ALLOWANCE',
  TRAVEL_ALLOWANCE = 'TRAVEL_ALLOWANCE',
  SUBSISTENCE_ALLOWANCE = 'SUBSISTENCE_ALLOWANCE',
  OTHER = 'OTHER'
}

export enum AllowanceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum AllowanceFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL'
}

export enum AllowanceMethod {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  RATE_BASED = 'RATE_BASED',
  TIERED = 'TIERED'
}

@Entity('payroll_allowances')
@Index(['tenantId', 'payrollId'])
@Index(['tenantId', 'employeeId'])
@Index(['allowanceType'])
@Index(['effectiveDate'])
export class PayrollAllowance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'payroll_id', nullable: true })
  payrollId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'allowance_code', length: 20, unique: true })
  allowanceCode: string;

  // Allowance Details
  @Column({ 
    name: 'allowance_type', 
    type: 'enum', 
    enum: AllowanceType 
  })
  allowanceType: AllowanceType;

  @Column({ name: 'allowance_name', length: 255 })
  allowanceName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'allowance_category', length: 100, nullable: true })
  allowanceCategory: string; // REGULAR, SPECIAL, TEMPORARY, PERFORMANCE

  @Column({ 
    name: 'allowance_status', 
    type: 'enum', 
    enum: AllowanceStatus,
    default: AllowanceStatus.ACTIVE
  })
  allowanceStatus: AllowanceStatus;

  // Amount and Calculation
  @Column({ 
    name: 'allowance_method', 
    type: 'enum', 
    enum: AllowanceMethod,
    default: AllowanceMethod.FIXED_AMOUNT
  })
  allowanceMethod: AllowanceMethod;

  @Column({ name: 'allowance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  allowanceAmount: number;

  @Column({ name: 'allowance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  allowancePercentage: number;

  @Column({ name: 'rate_per_unit', type: 'decimal', precision: 15, scale: 4, nullable: true })
  ratePerUnit: number;

  @Column({ name: 'units', type: 'decimal', precision: 10, scale: 2, default: 1 })
  units: number;

  @Column({ name: 'unit_type', length: 50, nullable: true })
  unitType: string; // HOURS, DAYS, KM, TRIPS, etc.

  @Column({ name: 'minimum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumAmount: number;

  @Column({ name: 'maximum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumAmount: number;

  @Column({ name: 'calculation_base', length: 50, default: 'BASIC_SALARY' })
  calculationBase: string; // BASIC_SALARY, GROSS_PAY, FIXED_AMOUNT

  @Column({ name: 'calculated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  calculatedAmount: number;

  @Column({ name: 'actual_allowance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualAllowanceAmount: number;

  // Timing and Frequency
  @Column({ 
    name: 'allowance_frequency', 
    type: 'enum', 
    enum: AllowanceFrequency,
    default: AllowanceFrequency.MONTHLY
  })
  allowanceFrequency: AllowanceFrequency;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'next_payment_date', type: 'date', nullable: true })
  nextPaymentDate: Date;

  @Column({ name: 'last_payment_date', type: 'date', nullable: true })
  lastPaymentDate: Date;

  // Prorating and Adjustments
  @Column({ name: 'prorated', default: false })
  prorated: boolean;

  @Column({ name: 'proration_days', nullable: true })
  prorationDays: number;

  @Column({ name: 'proration_factor', type: 'decimal', precision: 5, scale: 4, default: 1 })
  prorationFactor: number;

  @Column({ name: 'prorated_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  proratedAmount: number;

  // Tax Treatment
  @Column({ name: 'taxable', default: true })
  taxable: boolean;

  @Column({ name: 'tax_exempt_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxExemptAmount: number;

  @Column({ name: 'tax_exempt_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxExemptPercentage: number;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableAmount: number;

  @Column({ name: 'non_taxable_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  nonTaxableAmount: number;

  // Ghana Specific Tax Treatment
  @Column({ name: 'ghana_tax_exempt', default: false })
  ghanaTaxExempt: boolean;

  @Column({ name: 'ssnit_applicable', default: true })
  ssnitApplicable: boolean;

  @Column({ name: 'pension_applicable', default: true })
  pensionApplicable: boolean;

  @Column({ name: 'statutory_allowance', default: false })
  statutoryAllowance: boolean;

  // Conditions and Eligibility
  @Column({ name: 'conditional_allowance', default: false })
  conditionalAllowance: boolean;

  @Column({ name: 'conditions_met', default: true })
  conditionsMet: boolean;

  @Column({ name: 'eligibility_criteria', type: 'text', nullable: true })
  eligibilityCriteria: string;

  @Column({ name: 'performance_based', default: false })
  performanceBased: boolean;

  @Column({ name: 'performance_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceThreshold: number;

  @Column({ name: 'attendance_based', default: false })
  attendanceBased: boolean;

  @Column({ name: 'minimum_attendance_days', nullable: true })
  minimumAttendanceDays: number;

  // Location and Job Specific
  @Column({ name: 'location_specific', default: false })
  locationSpecific: boolean;

  @Column({ name: 'applicable_locations', type: 'text', nullable: true })
  applicableLocations: string; // JSON array

  @Column({ name: 'job_grade_specific', default: false })
  jobGradeSpecific: boolean;

  @Column({ name: 'applicable_job_grades', type: 'text', nullable: true })
  applicableJobGrades: string; // JSON array

  @Column({ name: 'department_specific', default: false })
  departmentSpecific: boolean;

  @Column({ name: 'applicable_departments', type: 'text', nullable: true })
  applicableDepartments: string; // JSON array

  // Ghana OMC Specific
  @Column({ name: 'petroleum_operations_allowance', default: false })
  petroleumOperationsAllowance: boolean;

  @Column({ name: 'offshore_allowance', default: false })
  offshoreAllowance: boolean;

  @Column({ name: 'hazardous_duty_allowance', default: false })
  hazardousDutyAllowance: boolean;

  @Column({ name: 'remote_location_allowance', default: false })
  remoteLocationAllowance: boolean;

  @Column({ name: 'technical_allowance', default: false })
  technicalAllowance: boolean;

  @Column({ name: 'safety_compliance_bonus', default: false })
  safetyComplianceBonus: boolean;

  // Limits and Caps
  @Column({ name: 'annual_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualLimit: number;

  @Column({ name: 'monthly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyLimit: number;

  @Column({ name: 'ytd_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdPaid: number;

  @Column({ name: 'lifetime_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimePaid: number;

  @Column({ name: 'daily_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  dailyLimit: number;

  @Column({ name: 'weekly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  weeklyLimit: number;

  // Reimbursement Information
  @Column({ name: 'reimbursement_based', default: false })
  reimbursementBased: boolean;

  @Column({ name: 'advance_payment', default: false })
  advancePayment: boolean;

  @Column({ name: 'receipts_required', default: false })
  receiptsRequired: boolean;

  @Column({ name: 'receipt_submission_deadline', type: 'date', nullable: true })
  receiptSubmissionDeadline: Date;

  @Column({ name: 'receipts_submitted', default: false })
  receiptsSubmitted: boolean;

  @Column({ name: 'receipts_verified', default: false })
  receiptsVerified: boolean;

  @Column({ name: 'overpayment_recovery', default: false })
  overpaymentRecovery: boolean;

  @Column({ name: 'recovery_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  recoveryAmount: number;

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

  @Column({ name: 'manager_approval_required', default: false })
  managerApprovalRequired: boolean;

  @Column({ name: 'manager_approved', nullable: true })
  managerApproved: boolean;

  @Column({ name: 'manager_approval_date', type: 'date', nullable: true })
  managerApprovalDate: Date;

  @Column({ name: 'hr_approval_required', default: false })
  hrApprovalRequired: boolean;

  @Column({ name: 'hr_approved', nullable: true })
  hrApproved: boolean;

  @Column({ name: 'hr_approval_date', type: 'date', nullable: true })
  hrApprovalDate: Date;

  // Reporting and Compliance
  @Column({ name: 'reportable_to_irs', default: true })
  reportableToIRS: boolean; // Ghana Revenue Authority

  @Column({ name: 'reportable_to_ssnit', default: true })
  reportableToSSNIT: boolean;

  @Column({ name: 'reportable_to_npra', default: true })
  reportableToNPRA: boolean; // National Pensions Regulatory Authority

  @Column({ name: 'compliance_code', length: 20, nullable: true })
  complianceCode: string;

  @Column({ name: 'gl_account', length: 20, nullable: true })
  glAccount: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'budget_code', length: 20, nullable: true })
  budgetCode: string;

  // Employee Request Information
  @Column({ name: 'employee_requested', default: false })
  employeeRequested: boolean;

  @Column({ name: 'request_date', type: 'date', nullable: true })
  requestDate: Date;

  @Column({ name: 'request_reason', type: 'text', nullable: true })
  requestReason: string;

  @Column({ name: 'justification', type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'supporting_documentation', type: 'text', nullable: true })
  supportingDocumentation: string; // JSON array of document URLs

  // Document Management
  @Column({ name: 'allowance_certificate_url', length: 500, nullable: true })
  allowanceCertificateUrl: string;

  @Column({ name: 'calculation_worksheet_url', length: 500, nullable: true })
  calculationWorksheetUrl: string;

  @Column({ name: 'receipt_documents_url', type: 'text', nullable: true })
  receiptDocumentsUrl: string; // JSON array

  // Integration and Automation
  @Column({ name: 'auto_calculated', default: false })
  autoCalculated: boolean;

  @Column({ name: 'manual_override', default: false })
  manualOverride: boolean;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason: string;

  @Column({ name: 'system_generated', default: false })
  systemGenerated: boolean;

  @Column({ name: 'calculation_rule_id', nullable: true })
  calculationRuleId: string;

  // Notes and Comments
  @Column({ name: 'allowance_notes', type: 'text', nullable: true })
  allowanceNotes: string;

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
  @ManyToOne(() => Payroll, payroll => payroll.customAllowances, { nullable: true })
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;

  @ManyToOne(() => Employee, employee => employee.id)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}