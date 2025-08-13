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
import { Employee } from './employee.entity';

export enum ContractType {
  PERMANENT = 'PERMANENT',
  FIXED_TERM = 'FIXED_TERM',
  PROBATIONARY = 'PROBATIONARY',
  CASUAL = 'CASUAL',
  APPRENTICESHIP = 'APPRENTICESHIP',
  INTERNSHIP = 'INTERNSHIP',
  CONSULTANT = 'CONSULTANT',
  SEASONAL = 'SEASONAL'
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  RENEWED = 'RENEWED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED'
}

export enum TerminationType {
  VOLUNTARY_RESIGNATION = 'VOLUNTARY_RESIGNATION',
  INVOLUNTARY_TERMINATION = 'INVOLUNTARY_TERMINATION',
  END_OF_CONTRACT = 'END_OF_CONTRACT',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  RETIREMENT = 'RETIREMENT',
  DEATH = 'DEATH',
  ABANDONMENT = 'ABANDONMENT'
}

@Entity('employee_contracts')
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'contractStatus'])
@Index(['contractStartDate', 'contractEndDate'])
export class EmployeeContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'contract_number', length: 50, unique: true })
  contractNumber: string;

  // Contract Information
  @Column({ 
    name: 'contract_type', 
    type: 'enum', 
    enum: ContractType 
  })
  contractType: ContractType;

  @Column({ 
    name: 'contract_status', 
    type: 'enum', 
    enum: ContractStatus,
    default: ContractStatus.DRAFT
  })
  contractStatus: ContractStatus;

  @Column({ name: 'contract_title', length: 255 })
  contractTitle: string;

  @Column({ name: 'contract_start_date', type: 'date' })
  contractStartDate: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ name: 'probation_period_months', default: 0 })
  probationPeriodMonths: number;

  @Column({ name: 'notice_period_days', default: 30 })
  noticePeriodDays: number;

  @Column({ name: 'renewable', default: false })
  renewable: boolean;

  @Column({ name: 'auto_renew', default: false })
  autoRenew: boolean;

  @Column({ name: 'renewal_period_months', nullable: true })
  renewalPeriodMonths: number;

  // Compensation Details
  @Column({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'pay_frequency', length: 20, default: 'MONTHLY' })
  payFrequency: string;

  @Column({ name: 'salary_review_frequency', length: 20, default: 'ANNUAL' })
  salaryReviewFrequency: string;

  @Column({ name: 'next_salary_review_date', type: 'date', nullable: true })
  nextSalaryReviewDate: Date;

  // Benefits and Allowances
  @Column({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  housingAllowance: number;

  @Column({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fuelAllowance: number;

  @Column({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  educationAllowance: number;

  @Column({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  riskAllowance: number;

  @Column({ name: 'total_package_value', type: 'decimal', precision: 15, scale: 2 })
  totalPackageValue: number;

  // Working Conditions
  @Column({ name: 'working_hours_per_week', default: 40 })
  workingHoursPerWeek: number;

  @Column({ name: 'working_days_per_week', default: 5 })
  workingDaysPerWeek: number;

  @Column({ name: 'overtime_eligible', default: true })
  overtimeEligible: boolean;

  @Column({ name: 'shift_allowance_eligible', default: false })
  shiftAllowanceEligible: boolean;

  @Column({ name: 'remote_work_eligible', default: false })
  remoteWorkEligible: boolean;

  @Column({ name: 'travel_requirements', type: 'text', nullable: true })
  travelRequirements: string;

  // Leave Entitlements (Ghana Labor Law)
  @Column({ name: 'annual_leave_days', default: 15 })
  annualLeaveDays: number; // Minimum 15 days in Ghana

  @Column({ name: 'sick_leave_days', default: 12 })
  sickLeaveDays: number;

  @Column({ name: 'maternity_leave_days', default: 84 })
  maternityLeaveDays: number; // 12 weeks in Ghana

  @Column({ name: 'paternity_leave_days', default: 7 })
  paternityLeaveDays: number; // 1 week in Ghana

  @Column({ name: 'compassionate_leave_days', default: 3 })
  compassionateLeaveDays: number;

  @Column({ name: 'study_leave_eligible', default: false })
  studyLeaveEligible: boolean;

  @Column({ name: 'sabbatical_eligible', default: false })
  sabbaticalEligible: boolean;

  // Ghana OMC Specific Clauses
  @Column({ name: 'petroleum_safety_compliance_required', default: true })
  petroleumSafetyComplianceRequired: boolean;

  @Column({ name: 'hse_training_required', default: true })
  hseTrainingRequired: boolean;

  @Column({ name: 'confidentiality_agreement', default: true })
  confidentialityAgreement: boolean;

  @Column({ name: 'non_compete_clause', default: false })
  nonCompeteClause: boolean;

  @Column({ name: 'non_compete_period_months', nullable: true })
  nonCompetePeriodMonths: number;

  @Column({ name: 'intellectual_property_clause', default: true })
  intellectualPropertyClause: boolean;

  @Column({ name: 'code_of_conduct_acceptance', default: true })
  codeOfConductAcceptance: boolean;

  // Performance and Development
  @Column({ name: 'performance_review_frequency', length: 20, default: 'ANNUAL' })
  performanceReviewFrequency: string;

  @Column({ name: 'training_budget_annual', type: 'decimal', precision: 15, scale: 2, default: 0 })
  trainingBudgetAnnual: number;

  @Column({ name: 'professional_development_eligible', default: true })
  professionalDevelopmentEligible: boolean;

  @Column({ name: 'conference_attendance_eligible', default: false })
  conferenceAttendanceEligible: boolean;

  // Termination Provisions
  @Column({ 
    name: 'termination_type', 
    type: 'enum', 
    enum: TerminationType,
    nullable: true
  })
  terminationType: TerminationType;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ name: 'termination_reason', type: 'text', nullable: true })
  terminationReason: string;

  @Column({ name: 'severance_pay_eligible', default: true })
  severancePayEligible: boolean;

  @Column({ name: 'severance_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  severanceAmount: number;

  @Column({ name: 'notice_served', default: false })
  noticeServed: boolean;

  @Column({ name: 'notice_served_date', type: 'date', nullable: true })
  noticeServedDate: Date;

  @Column({ name: 'garden_leave', default: false })
  gardenLeave: boolean;

  // Contract Renewal
  @Column({ name: 'previous_contract_id', nullable: true })
  previousContractId: string;

  @Column({ name: 'renewed_contract_id', nullable: true })
  renewedContractId: string;

  @Column({ name: 'renewal_count', default: 0 })
  renewalCount: number;

  @Column({ name: 'max_renewals', nullable: true })
  maxRenewals: number;

  // Legal and Compliance
  @Column({ name: 'work_permit_required', default: false })
  workPermitRequired: boolean;

  @Column({ name: 'work_permit_number', length: 50, nullable: true })
  workPermitNumber: string;

  @Column({ name: 'work_permit_expiry', type: 'date', nullable: true })
  workPermitExpiry: Date;

  @Column({ name: 'tax_exemption_eligible', default: false })
  taxExemptionEligible: boolean;

  @Column({ name: 'social_security_registration', default: true })
  socialSecurityRegistration: boolean;

  @Column({ name: 'pension_scheme_enrollment', default: true })
  pensionSchemeEnrollment: boolean;

  // Document Management
  @Column({ name: 'contract_document_url', length: 500, nullable: true })
  contractDocumentUrl: string;

  @Column({ name: 'signed_contract_url', length: 500, nullable: true })
  signedContractUrl: string;

  @Column({ name: 'amendments_document_url', length: 500, nullable: true })
  amendmentsDocumentUrl: string;

  @Column({ name: 'employee_signed_date', type: 'date', nullable: true })
  employeeSignedDate: Date;

  @Column({ name: 'employer_signed_date', type: 'date', nullable: true })
  employerSignedDate: Date;

  @Column({ name: 'witness_signed_date', type: 'date', nullable: true })
  witnessSignedDate: Date;

  @Column({ name: 'witness_name', length: 255, nullable: true })
  witnessName: string;

  // Special Provisions
  @Column({ name: 'special_conditions', type: 'text', nullable: true })
  specialConditions: string;

  @Column({ name: 'company_car_eligible', default: false })
  companyCarEligible: boolean;

  @Column({ name: 'company_phone_eligible', default: false })
  companyPhoneEligible: boolean;

  @Column({ name: 'company_laptop_eligible', default: false })
  companyLaptopEligible: boolean;

  @Column({ name: 'health_insurance_coverage', default: true })
  healthInsuranceCoverage: boolean;

  @Column({ name: 'life_insurance_coverage', default: false })
  lifeInsuranceCoverage: boolean;

  @Column({ name: 'family_coverage_eligible', default: false })
  familyCoverageEligible: boolean;

  // Reporting and Analytics
  @Column({ name: 'contract_value_total', type: 'decimal', precision: 15, scale: 2 })
  contractValueTotal: number;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'budget_code', length: 20, nullable: true })
  budgetCode: string;

  @Column({ name: 'approval_workflow_completed', default: false })
  approvalWorkflowCompleted: boolean;

  @Column({ name: 'legal_review_completed', default: false })
  legalReviewCompleted: boolean;

  @Column({ name: 'hr_approval_date', type: 'date', nullable: true })
  hrApprovalDate: Date;

  @Column({ name: 'management_approval_date', type: 'date', nullable: true })
  managementApprovalDate: Date;

  // Notes and Comments
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'amendment_history', type: 'text', nullable: true })
  amendmentHistory: string; // JSON array of amendments

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
  @ManyToOne(() => Employee, employee => employee.contracts)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}