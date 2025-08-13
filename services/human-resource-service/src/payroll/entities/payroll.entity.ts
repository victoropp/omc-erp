import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index 
} from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { PayrollDeduction } from './payroll-deduction.entity';
import { PayrollAllowance } from './payroll-allowance.entity';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PayrollPeriodType {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

@Entity('payrolls')
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'payrollPeriod'])
@Index(['tenantId', 'status'])
@Index(['paymentDate'])
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'payroll_number', length: 50, unique: true })
  payrollNumber: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'employee_number', length: 50 })
  employeeNumber: string;

  @Column({ name: 'employee_name', length: 300 })
  employeeName: string;

  // Payroll Period
  @Column({ name: 'payroll_period', length: 20 })
  payrollPeriod: string; // e.g., "2024-01", "2024-Q1"

  @Column({ 
    name: 'period_type', 
    type: 'enum', 
    enum: PayrollPeriodType,
    default: PayrollPeriodType.MONTHLY
  })
  periodType: PayrollPeriodType;

  @Column({ name: 'period_start_date', type: 'date' })
  periodStartDate: Date;

  @Column({ name: 'period_end_date', type: 'date' })
  periodEndDate: Date;

  @Column({ name: 'working_days', default: 0 })
  workingDays: number;

  @Column({ name: 'actual_days_worked', default: 0 })
  actualDaysWorked: number;

  // Basic Salary Information
  @Column({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ name: 'prorated_salary', type: 'decimal', precision: 15, scale: 2 })
  proratedSalary: number;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 15, scale: 6, nullable: true })
  hourlyRate: number;

  @Column({ name: 'regular_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  regularHours: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ name: 'overtime_rate', type: 'decimal', precision: 15, scale: 6, default: 1.5 })
  overtimeRate: number; // 1.5x in Ghana

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  overtimePay: number;

  // Allowances (Ghana-Specific)
  @Column({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  housingAllowance: number;

  @Column({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fuelAllowance: number;

  @Column({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  mealAllowance: number;

  @Column({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  educationAllowance: number;

  @Column({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  riskAllowance: number;

  @Column({ name: 'responsibility_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  responsibilityAllowance: number;

  @Column({ name: 'shift_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  shiftAllowance: number;

  @Column({ name: 'location_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  locationAllowance: number;

  @Column({ name: 'hardship_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  hardshipAllowance: number;

  @Column({ name: 'acting_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actingAllowance: number;

  @Column({ name: 'total_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAllowances: number;

  // Bonus and Incentives
  @Column({ name: 'performance_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 })
  performanceBonus: number;

  @Column({ name: 'productivity_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 })
  productivityBonus: number;

  @Column({ name: 'safety_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 })
  safetyBonus: number;

  @Column({ name: 'commission', type: 'decimal', precision: 15, scale: 2, default: 0 })
  commission: number;

  @Column({ name: 'thirteenth_month_salary', type: 'decimal', precision: 15, scale: 2, default: 0 })
  thirteenthMonthSalary: number;

  @Column({ name: 'end_of_service_benefit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  endOfServiceBenefit: number;

  @Column({ name: 'total_bonuses', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBonuses: number;

  // Gross Pay Calculation
  @Column({ name: 'gross_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossPay: number;

  @Column({ name: 'taxable_income', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxableIncome: number;

  // Ghana Tax Calculations
  @Column({ name: 'income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  incomeTax: number; // PAYE - Pay As You Earn

  @Column({ name: 'tax_relief', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxRelief: number; // Personal relief in Ghana

  @Column({ name: 'tax_rate_applied', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRateApplied: number;

  // Social Security Contributions (Ghana)
  @Column({ name: 'ssnit_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ssnitEmployeeContribution: number; // 5.5% employee contribution

  @Column({ name: 'ssnit_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ssnitEmployerContribution: number; // 13% employer contribution

  @Column({ name: 'ssnit_total', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ssnitTotal: number;

  // Tier 2 & 3 Pension Contributions
  @Column({ name: 'tier2_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  tier2EmployeeContribution: number; // 5% employee

  @Column({ name: 'tier2_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  tier2EmployerContribution: number; // 5% employer

  @Column({ name: 'tier3_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  tier3EmployeeContribution: number; // Voluntary

  @Column({ name: 'tier3_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  tier3EmployerContribution: number; // Voluntary

  @Column({ name: 'total_pension_contributions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPensionContributions: number;

  // Other Deductions
  @Column({ name: 'union_dues', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unionDues: number;

  @Column({ name: 'loan_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  loanDeduction: number;

  @Column({ name: 'salary_advance_recovery', type: 'decimal', precision: 15, scale: 2, default: 0 })
  salaryAdvanceRecovery: number;

  @Column({ name: 'insurance_premium', type: 'decimal', precision: 15, scale: 2, default: 0 })
  insurancePremium: number;

  @Column({ name: 'medical_insurance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  medicalInsurance: number;

  @Column({ name: 'welfare_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  welfareContribution: number;

  @Column({ name: 'disciplinary_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  disciplinaryDeduction: number;

  @Column({ name: 'court_order_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  courtOrderDeduction: number;

  @Column({ name: 'cooperative_savings', type: 'decimal', precision: 15, scale: 2, default: 0 })
  cooperativeSavings: number;

  @Column({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  // Net Pay Calculation
  @Column({ name: 'net_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netPay: number;

  @Column({ name: 'net_pay_rounded', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netPayRounded: number;

  @Column({ name: 'rounding_difference', type: 'decimal', precision: 15, scale: 2, default: 0 })
  roundingDifference: number;

  // Employer Costs
  @Column({ name: 'total_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEmployerContribution: number;

  @Column({ name: 'total_cost_to_company', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCostToCompany: number;

  // Leave and Attendance
  @Column({ name: 'annual_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  annualLeaveDays: number;

  @Column({ name: 'sick_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  sickLeaveDays: number;

  @Column({ name: 'casual_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  casualLeaveDays: number;

  @Column({ name: 'unpaid_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  unpaidLeaveDays: number;

  @Column({ name: 'public_holidays', type: 'decimal', precision: 5, scale: 2, default: 0 })
  publicHolidays: number;

  @Column({ name: 'late_days', default: 0 })
  lateDays: number;

  @Column({ name: 'absent_days', default: 0 })
  absentDays: number;

  // Payment Information
  @Column({ 
    name: 'payment_method', 
    type: 'enum', 
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ name: 'payment_reference', length: 100, nullable: true })
  paymentReference: string;

  // Status and Processing
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT
  })
  status: PayrollStatus;

  @Column({ name: 'calculated_by', nullable: true })
  calculatedBy: string;

  @Column({ name: 'calculation_date', nullable: true })
  calculationDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'processing_date', nullable: true })
  processingDate: Date;

  @Column({ name: 'paid_by', nullable: true })
  paidBy: string;

  @Column({ name: 'paid_date', nullable: true })
  paidDate: Date;

  // Currency and Exchange
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_net_pay', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyNetPay: number;

  // Adjustments
  @Column({ name: 'retroactive_adjustment', type: 'decimal', precision: 15, scale: 2, default: 0 })
  retroactiveAdjustment: number;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ name: 'manual_adjustments', type: 'decimal', precision: 15, scale: 2, default: 0 })
  manualAdjustments: number;

  // Compliance and Reporting
  @Column({ name: 'payslip_generated', default: false })
  payslipGenerated: boolean;

  @Column({ name: 'payslip_url', length: 500, nullable: true })
  payslipUrl: string;

  @Column({ name: 'payslip_sent', default: false })
  payslipSent: boolean;

  @Column({ name: 'tax_certificate_generated', default: false })
  taxCertificateGenerated: boolean;

  @Column({ name: 'p9_form_generated', default: false })
  p9FormGenerated: boolean; // Ghana tax form

  // YTD (Year-to-Date) Calculations
  @Column({ name: 'ytd_gross_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdGrossPay: number;

  @Column({ name: 'ytd_net_pay', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdNetPay: number;

  @Column({ name: 'ytd_income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdIncomeTax: number;

  @Column({ name: 'ytd_ssnit_employee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdSsnitEmployee: number;

  @Column({ name: 'ytd_ssnit_employer', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdSsnitEmployer: number;

  @Column({ name: 'ytd_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdAllowances: number;

  @Column({ name: 'ytd_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdDeductions: number;

  // Ghana Labor Law Compliance
  @Column({ name: 'minimum_wage_compliance', default: true })
  minimumWageCompliance: boolean;

  @Column({ name: 'minimum_wage_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  minimumWageAmount: number;

  @Column({ name: 'overtime_compensation_type', length: 20, default: 'MONETARY' })
  overtimeCompensationType: string; // MONETARY, TIME_OFF

  @Column({ name: 'night_shift_premium', type: 'decimal', precision: 15, scale: 2, default: 0 })
  nightShiftPremium: number;

  @Column({ name: 'weekend_premium', type: 'decimal', precision: 15, scale: 2, default: 0 })
  weekendPremium: number;

  @Column({ name: 'public_holiday_premium', type: 'decimal', precision: 15, scale: 2, default: 0 })
  publicHolidayPremium: number;

  // Additional Information
  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  @Column({ name: 'job_title', length: 255, nullable: true })
  jobTitle: string;

  @Column({ name: 'pay_grade', length: 20, nullable: true })
  payGrade: string;

  // Notes and Comments
  @Column({ name: 'calculation_notes', type: 'text', nullable: true })
  calculationNotes: string;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  @Column({ name: 'payment_notes', type: 'text', nullable: true })
  paymentNotes: string;

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
  @ManyToOne(() => Employee, employee => employee.id)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @OneToMany(() => PayrollDeduction, deduction => deduction.payroll)
  customDeductions: PayrollDeduction[];

  @OneToMany(() => PayrollAllowance, allowance => allowance.payroll)
  customAllowances: PayrollAllowance[];
}