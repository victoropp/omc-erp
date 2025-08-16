"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payroll = exports.PaymentMethod = exports.PayrollPeriodType = exports.PayrollStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../employee/entities/employee.entity");
const payroll_deduction_entity_1 = require("./payroll-deduction.entity");
const payroll_allowance_entity_1 = require("./payroll-allowance.entity");
var PayrollStatus;
(function (PayrollStatus) {
    PayrollStatus["DRAFT"] = "DRAFT";
    PayrollStatus["CALCULATED"] = "CALCULATED";
    PayrollStatus["APPROVED"] = "APPROVED";
    PayrollStatus["PROCESSED"] = "PROCESSED";
    PayrollStatus["PAID"] = "PAID";
    PayrollStatus["CANCELLED"] = "CANCELLED";
})(PayrollStatus || (exports.PayrollStatus = PayrollStatus = {}));
var PayrollPeriodType;
(function (PayrollPeriodType) {
    PayrollPeriodType["WEEKLY"] = "WEEKLY";
    PayrollPeriodType["BIWEEKLY"] = "BIWEEKLY";
    PayrollPeriodType["MONTHLY"] = "MONTHLY";
    PayrollPeriodType["QUARTERLY"] = "QUARTERLY";
})(PayrollPeriodType || (exports.PayrollPeriodType = PayrollPeriodType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Payroll = class Payroll {
    id;
    tenantId;
    payrollNumber;
    employeeId;
    employeeNumber;
    employeeName;
    // Payroll Period
    payrollPeriod; // e.g., "2024-01", "2024-Q1"
    periodType;
    periodStartDate;
    periodEndDate;
    workingDays;
    actualDaysWorked;
    // Basic Salary Information
    basicSalary;
    proratedSalary;
    hourlyRate;
    regularHours;
    overtimeHours;
    overtimeRate; // 1.5x in Ghana
    overtimePay;
    // Allowances (Ghana-Specific)
    housingAllowance;
    transportAllowance;
    fuelAllowance;
    medicalAllowance;
    mealAllowance;
    educationAllowance;
    riskAllowance;
    responsibilityAllowance;
    shiftAllowance;
    locationAllowance;
    hardshipAllowance;
    actingAllowance;
    totalAllowances;
    // Bonus and Incentives
    performanceBonus;
    productivityBonus;
    safetyBonus;
    commission;
    thirteenthMonthSalary;
    endOfServiceBenefit;
    totalBonuses;
    // Gross Pay Calculation
    grossPay;
    taxableIncome;
    // Ghana Tax Calculations
    incomeTax; // PAYE - Pay As You Earn
    taxRelief; // Personal relief in Ghana
    taxRateApplied;
    // Social Security Contributions (Ghana)
    ssnitEmployeeContribution; // 5.5% employee contribution
    ssnitEmployerContribution; // 13% employer contribution
    ssnitTotal;
    // Tier 2 & 3 Pension Contributions
    tier2EmployeeContribution; // 5% employee
    tier2EmployerContribution; // 5% employer
    tier3EmployeeContribution; // Voluntary
    tier3EmployerContribution; // Voluntary
    totalPensionContributions;
    // Other Deductions
    unionDues;
    loanDeduction;
    salaryAdvanceRecovery;
    insurancePremium;
    medicalInsurance;
    welfareContribution;
    disciplinaryDeduction;
    courtOrderDeduction;
    cooperativeSavings;
    totalDeductions;
    // Net Pay Calculation
    netPay;
    netPayRounded;
    roundingDifference;
    // Employer Costs
    totalEmployerContribution;
    totalCostToCompany;
    // Leave and Attendance
    annualLeaveDays;
    sickLeaveDays;
    casualLeaveDays;
    unpaidLeaveDays;
    publicHolidays;
    lateDays;
    absentDays;
    // Payment Information
    paymentMethod;
    bankAccountNumber;
    bankName;
    mobileMoneyNumber;
    mobileMoneyNetwork;
    paymentDate;
    paymentReference;
    // Status and Processing
    status;
    calculatedBy;
    calculationDate;
    approvedBy;
    approvalDate;
    processedBy;
    processingDate;
    paidBy;
    paidDate;
    // Currency and Exchange
    currency;
    exchangeRate;
    baseCurrencyNetPay;
    // Adjustments
    retroactiveAdjustment;
    adjustmentReason;
    manualAdjustments;
    // Compliance and Reporting
    payslipGenerated;
    payslipUrl;
    payslipSent;
    taxCertificateGenerated;
    p9FormGenerated; // Ghana tax form
    // YTD (Year-to-Date) Calculations
    ytdGrossPay;
    ytdNetPay;
    ytdIncomeTax;
    ytdSsnitEmployee;
    ytdSsnitEmployer;
    ytdAllowances;
    ytdDeductions;
    // Ghana Labor Law Compliance
    minimumWageCompliance;
    minimumWageAmount;
    overtimeCompensationType; // MONETARY, TIME_OFF
    nightShiftPremium;
    weekendPremium;
    publicHolidayPremium;
    // Additional Information
    costCenter;
    department;
    location;
    jobTitle;
    payGrade;
    // Notes and Comments
    calculationNotes;
    approvalComments;
    paymentNotes;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    employee;
    customDeductions;
    customAllowances;
};
exports.Payroll = Payroll;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payroll.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Payroll.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_number', length: 50, unique: true }),
    __metadata("design:type", String)
], Payroll.prototype, "payrollNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], Payroll.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_number', length: 50 }),
    __metadata("design:type", String)
], Payroll.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_name', length: 300 }),
    __metadata("design:type", String)
], Payroll.prototype, "employeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_period', length: 20 }),
    __metadata("design:type", String)
], Payroll.prototype, "payrollPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'period_type',
        type: 'enum',
        enum: PayrollPeriodType,
        default: PayrollPeriodType.MONTHLY
    }),
    __metadata("design:type", String)
], Payroll.prototype, "periodType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_start_date', type: 'date' }),
    __metadata("design:type", Date)
], Payroll.prototype, "periodStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'period_end_date', type: 'date' }),
    __metadata("design:type", Date)
], Payroll.prototype, "periodEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days', default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "workingDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_days_worked', default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "actualDaysWorked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Payroll.prototype, "basicSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prorated_salary', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Payroll.prototype, "proratedSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hourly_rate', type: 'decimal', precision: 15, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regular_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "regularHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_hours', type: 'decimal', precision: 8, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "overtimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_rate', type: 'decimal', precision: 15, scale: 6, default: 1.5 }),
    __metadata("design:type", Number)
], Payroll.prototype, "overtimeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_pay', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "overtimePay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "housingAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "transportAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "fuelAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "medicalAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "mealAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "educationAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "riskAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsibility_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "responsibilityAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shift_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "shiftAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "locationAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hardship_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "hardshipAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acting_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "actingAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalAllowances", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "performanceBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'productivity_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "productivityBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'safety_bonus', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "safetyBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commission', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thirteenth_month_salary', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "thirteenthMonthSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_of_service_benefit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "endOfServiceBenefit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_bonuses', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalBonuses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gross_pay', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "grossPay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_income', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "taxableIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "incomeTax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_relief', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "taxRelief", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_rate_applied', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "taxRateApplied", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ssnitEmployeeContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ssnitEmployerContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_total', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ssnitTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier2_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "tier2EmployeeContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier2_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "tier2EmployerContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier3_employee_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "tier3EmployeeContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier3_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "tier3EmployerContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_pension_contributions', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalPensionContributions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'union_dues', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "unionDues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loan_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "loanDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_advance_recovery', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "salaryAdvanceRecovery", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_premium', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "insurancePremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_insurance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "medicalInsurance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'welfare_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "welfareContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disciplinary_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "disciplinaryDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'court_order_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "courtOrderDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cooperative_savings', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "cooperativeSavings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalDeductions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_pay', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "netPay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_pay_rounded', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "netPayRounded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rounding_difference', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "roundingDifference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_employer_contribution', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalEmployerContribution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost_to_company', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "totalCostToCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "annualLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sick_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "sickLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'casual_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "casualLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unpaid_leave_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "unpaidLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'public_holidays', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "publicHolidays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'late_days', default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "lateDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absent_days', default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "absentDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.BANK_TRANSFER
    }),
    __metadata("design:type", String)
], Payroll.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "mobileMoneyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_network', length: 20, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "mobileMoneyNetwork", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payroll.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: PayrollStatus,
        default: PayrollStatus.DRAFT
    }),
    __metadata("design:type", String)
], Payroll.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculated_by', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "calculatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_date', nullable: true }),
    __metadata("design:type", Date)
], Payroll.prototype, "calculationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', nullable: true }),
    __metadata("design:type", Date)
], Payroll.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_by', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_date', nullable: true }),
    __metadata("design:type", Date)
], Payroll.prototype, "processingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_by', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "paidBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_date', nullable: true }),
    __metadata("design:type", Date)
], Payroll.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], Payroll.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], Payroll.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_currency_net_pay', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "baseCurrencyNetPay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retroactive_adjustment', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "retroactiveAdjustment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "adjustmentReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manual_adjustments', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "manualAdjustments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payslip_generated', default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "payslipGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payslip_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "payslipUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payslip_sent', default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "payslipSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_certificate_generated', default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "taxCertificateGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'p9_form_generated', default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "p9FormGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_gross_pay', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdGrossPay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_net_pay', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdNetPay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_income_tax', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdIncomeTax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_ssnit_employee', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdSsnitEmployee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_ssnit_employer', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdSsnitEmployer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_allowances', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdAllowances", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "ytdDeductions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_wage_compliance', default: true }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "minimumWageCompliance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_wage_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "minimumWageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_compensation_type', length: 20, default: 'MONETARY' }),
    __metadata("design:type", String)
], Payroll.prototype, "overtimeCompensationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'night_shift_premium', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "nightShiftPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weekend_premium', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "weekendPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'public_holiday_premium', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payroll.prototype, "publicHolidayPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', length: 255, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_title', length: 255, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_grade', length: 20, nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "payGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "calculationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "approvalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "paymentNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], Payroll.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], Payroll.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payroll.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payroll.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], Payroll.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payroll_deduction_entity_1.PayrollDeduction, deduction => deduction.payroll),
    __metadata("design:type", Array)
], Payroll.prototype, "customDeductions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payroll_allowance_entity_1.PayrollAllowance, allowance => allowance.payroll),
    __metadata("design:type", Array)
], Payroll.prototype, "customAllowances", void 0);
exports.Payroll = Payroll = __decorate([
    (0, typeorm_1.Entity)('payrolls'),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['tenantId', 'payrollPeriod']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['paymentDate'])
], Payroll);
//# sourceMappingURL=payroll.entity.js.map