import { Employee } from '../../employee/entities/employee.entity';
import { PayrollDeduction } from './payroll-deduction.entity';
import { PayrollAllowance } from './payroll-allowance.entity';
export declare enum PayrollStatus {
    DRAFT = "DRAFT",
    CALCULATED = "CALCULATED",
    APPROVED = "APPROVED",
    PROCESSED = "PROCESSED",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare enum PayrollPeriodType {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY"
}
export declare enum PaymentMethod {
    BANK_TRANSFER = "BANK_TRANSFER",
    CHECK = "CHECK",
    CASH = "CASH",
    MOBILE_MONEY = "MOBILE_MONEY"
}
export declare class Payroll {
    id: string;
    tenantId: string;
    payrollNumber: string;
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    payrollPeriod: string;
    periodType: PayrollPeriodType;
    periodStartDate: Date;
    periodEndDate: Date;
    workingDays: number;
    actualDaysWorked: number;
    basicSalary: number;
    proratedSalary: number;
    hourlyRate: number;
    regularHours: number;
    overtimeHours: number;
    overtimeRate: number;
    overtimePay: number;
    housingAllowance: number;
    transportAllowance: number;
    fuelAllowance: number;
    medicalAllowance: number;
    mealAllowance: number;
    educationAllowance: number;
    riskAllowance: number;
    responsibilityAllowance: number;
    shiftAllowance: number;
    locationAllowance: number;
    hardshipAllowance: number;
    actingAllowance: number;
    totalAllowances: number;
    performanceBonus: number;
    productivityBonus: number;
    safetyBonus: number;
    commission: number;
    thirteenthMonthSalary: number;
    endOfServiceBenefit: number;
    totalBonuses: number;
    grossPay: number;
    taxableIncome: number;
    incomeTax: number;
    taxRelief: number;
    taxRateApplied: number;
    ssnitEmployeeContribution: number;
    ssnitEmployerContribution: number;
    ssnitTotal: number;
    tier2EmployeeContribution: number;
    tier2EmployerContribution: number;
    tier3EmployeeContribution: number;
    tier3EmployerContribution: number;
    totalPensionContributions: number;
    unionDues: number;
    loanDeduction: number;
    salaryAdvanceRecovery: number;
    insurancePremium: number;
    medicalInsurance: number;
    welfareContribution: number;
    disciplinaryDeduction: number;
    courtOrderDeduction: number;
    cooperativeSavings: number;
    totalDeductions: number;
    netPay: number;
    netPayRounded: number;
    roundingDifference: number;
    totalEmployerContribution: number;
    totalCostToCompany: number;
    annualLeaveDays: number;
    sickLeaveDays: number;
    casualLeaveDays: number;
    unpaidLeaveDays: number;
    publicHolidays: number;
    lateDays: number;
    absentDays: number;
    paymentMethod: PaymentMethod;
    bankAccountNumber: string;
    bankName: string;
    mobileMoneyNumber: string;
    mobileMoneyNetwork: string;
    paymentDate: Date;
    paymentReference: string;
    status: PayrollStatus;
    calculatedBy: string;
    calculationDate: Date;
    approvedBy: string;
    approvalDate: Date;
    processedBy: string;
    processingDate: Date;
    paidBy: string;
    paidDate: Date;
    currency: string;
    exchangeRate: number;
    baseCurrencyNetPay: number;
    retroactiveAdjustment: number;
    adjustmentReason: string;
    manualAdjustments: number;
    payslipGenerated: boolean;
    payslipUrl: string;
    payslipSent: boolean;
    taxCertificateGenerated: boolean;
    p9FormGenerated: boolean;
    ytdGrossPay: number;
    ytdNetPay: number;
    ytdIncomeTax: number;
    ytdSsnitEmployee: number;
    ytdSsnitEmployer: number;
    ytdAllowances: number;
    ytdDeductions: number;
    minimumWageCompliance: boolean;
    minimumWageAmount: number;
    overtimeCompensationType: string;
    nightShiftPremium: number;
    weekendPremium: number;
    publicHolidayPremium: number;
    costCenter: string;
    department: string;
    location: string;
    jobTitle: string;
    payGrade: string;
    calculationNotes: string;
    approvalComments: string;
    paymentNotes: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    customDeductions: PayrollDeduction[];
    customAllowances: PayrollAllowance[];
}
//# sourceMappingURL=payroll.entity.d.ts.map