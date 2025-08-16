import { Payroll } from './payroll.entity';
import { Employee } from '../../employee/entities/employee.entity';
export declare enum AllowanceType {
    HOUSING_ALLOWANCE = "HOUSING_ALLOWANCE",
    TRANSPORT_ALLOWANCE = "TRANSPORT_ALLOWANCE",
    FUEL_ALLOWANCE = "FUEL_ALLOWANCE",
    MEAL_ALLOWANCE = "MEAL_ALLOWANCE",
    MEDICAL_ALLOWANCE = "MEDICAL_ALLOWANCE",
    EDUCATION_ALLOWANCE = "EDUCATION_ALLOWANCE",
    RISK_ALLOWANCE = "RISK_ALLOWANCE",
    RESPONSIBILITY_ALLOWANCE = "RESPONSIBILITY_ALLOWANCE",
    SHIFT_ALLOWANCE = "SHIFT_ALLOWANCE",
    LOCATION_ALLOWANCE = "LOCATION_ALLOWANCE",
    HARDSHIP_ALLOWANCE = "HARDSHIP_ALLOWANCE",
    ACTING_ALLOWANCE = "ACTING_ALLOWANCE",
    OVERTIME_ALLOWANCE = "OVERTIME_ALLOWANCE",
    CALL_OUT_ALLOWANCE = "CALL_OUT_ALLOWANCE",
    STANDBY_ALLOWANCE = "STANDBY_ALLOWANCE",
    HAZARD_PAY = "HAZARD_PAY",
    ISOLATION_ALLOWANCE = "ISOLATION_ALLOWANCE",
    ENTERTAINMENT_ALLOWANCE = "ENTERTAINMENT_ALLOWANCE",
    COMMUNICATION_ALLOWANCE = "COMMUNICATION_ALLOWANCE",
    UNIFORM_ALLOWANCE = "UNIFORM_ALLOWANCE",
    TOOL_ALLOWANCE = "TOOL_ALLOWANCE",
    PROFESSIONAL_ALLOWANCE = "PROFESSIONAL_ALLOWANCE",
    TRAINING_ALLOWANCE = "TRAINING_ALLOWANCE",
    TRAVEL_ALLOWANCE = "TRAVEL_ALLOWANCE",
    SUBSISTENCE_ALLOWANCE = "SUBSISTENCE_ALLOWANCE",
    OTHER = "OTHER"
}
export declare enum AllowanceStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare enum AllowanceFrequency {
    ONCE = "ONCE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    ANNUAL = "ANNUAL"
}
export declare enum AllowanceMethod {
    FIXED_AMOUNT = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
    RATE_BASED = "RATE_BASED",
    TIERED = "TIERED"
}
export declare class PayrollAllowance {
    id: string;
    tenantId: string;
    payrollId: string;
    employeeId: string;
    allowanceCode: string;
    allowanceType: AllowanceType;
    allowanceName: string;
    description: string;
    allowanceCategory: string;
    allowanceStatus: AllowanceStatus;
    allowanceMethod: AllowanceMethod;
    allowanceAmount: number;
    allowancePercentage: number;
    ratePerUnit: number;
    units: number;
    unitType: string;
    minimumAmount: number;
    maximumAmount: number;
    calculationBase: string;
    calculatedAmount: number;
    actualAllowanceAmount: number;
    allowanceFrequency: AllowanceFrequency;
    effectiveDate: Date;
    endDate: Date;
    nextPaymentDate: Date;
    lastPaymentDate: Date;
    prorated: boolean;
    prorationDays: number;
    prorationFactor: number;
    proratedAmount: number;
    taxable: boolean;
    taxExemptAmount: number;
    taxExemptPercentage: number;
    taxableAmount: number;
    nonTaxableAmount: number;
    ghanaTaxExempt: boolean;
    ssnitApplicable: boolean;
    pensionApplicable: boolean;
    statutoryAllowance: boolean;
    conditionalAllowance: boolean;
    conditionsMet: boolean;
    eligibilityCriteria: string;
    performanceBased: boolean;
    performanceThreshold: number;
    attendanceBased: boolean;
    minimumAttendanceDays: number;
    locationSpecific: boolean;
    applicableLocations: string;
    jobGradeSpecific: boolean;
    applicableJobGrades: string;
    departmentSpecific: boolean;
    applicableDepartments: string;
    petroleumOperationsAllowance: boolean;
    offshoreAllowance: boolean;
    hazardousDutyAllowance: boolean;
    remoteLocationAllowance: boolean;
    technicalAllowance: boolean;
    safetyComplianceBonus: boolean;
    annualLimit: number;
    monthlyLimit: number;
    ytdPaid: number;
    lifetimePaid: number;
    dailyLimit: number;
    weeklyLimit: number;
    reimbursementBased: boolean;
    advancePayment: boolean;
    receiptsRequired: boolean;
    receiptSubmissionDeadline: Date;
    receiptsSubmitted: boolean;
    receiptsVerified: boolean;
    overpaymentRecovery: boolean;
    recoveryAmount: number;
    processed: boolean;
    processingDate: Date;
    processingNotes: string;
    failedProcessing: boolean;
    failureReason: string;
    retryCount: number;
    adjustmentAmount: number;
    adjustmentReason: string;
    adjustmentDate: Date;
    adjustedBy: string;
    reversalAllowed: boolean;
    reversed: boolean;
    reversalDate: Date;
    reversalReason: string;
    currency: string;
    exchangeRate: number;
    baseCurrencyAmount: number;
    approvalRequired: boolean;
    approved: boolean;
    approvedBy: string;
    approvalDate: Date;
    approvalComments: string;
    managerApprovalRequired: boolean;
    managerApproved: boolean;
    managerApprovalDate: Date;
    hrApprovalRequired: boolean;
    hrApproved: boolean;
    hrApprovalDate: Date;
    reportableToIRS: boolean;
    reportableToSSNIT: boolean;
    reportableToNPRA: boolean;
    complianceCode: string;
    glAccount: string;
    costCenter: string;
    budgetCode: string;
    employeeRequested: boolean;
    requestDate: Date;
    requestReason: string;
    justification: string;
    supportingDocumentation: string;
    allowanceCertificateUrl: string;
    calculationWorksheetUrl: string;
    receiptDocumentsUrl: string;
    autoCalculated: boolean;
    manualOverride: boolean;
    overrideReason: string;
    systemGenerated: boolean;
    calculationRuleId: string;
    allowanceNotes: string;
    employeeNotes: string;
    hrNotes: string;
    systemNotes: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    payroll: Payroll;
    employee: Employee;
}
//# sourceMappingURL=payroll-allowance.entity.d.ts.map