import { Payroll } from './payroll.entity';
import { Employee } from '../../employee/entities/employee.entity';
export declare enum DeductionType {
    INCOME_TAX = "INCOME_TAX",
    SSNIT_EMPLOYEE = "SSNIT_EMPLOYEE",
    TIER2_PENSION = "TIER2_PENSION",
    TIER3_PENSION = "TIER3_PENSION",
    UNION_DUES = "UNION_DUES",
    LOAN_REPAYMENT = "LOAN_REPAYMENT",
    SALARY_ADVANCE = "SALARY_ADVANCE",
    INSURANCE_PREMIUM = "INSURANCE_PREMIUM",
    MEDICAL_INSURANCE = "MEDICAL_INSURANCE",
    LIFE_INSURANCE = "LIFE_INSURANCE",
    WELFARE_CONTRIBUTION = "WELFARE_CONTRIBUTION",
    COOPERATIVE_SAVINGS = "COOPERATIVE_SAVINGS",
    DISCIPLINARY_DEDUCTION = "DISCIPLINARY_DEDUCTION",
    COURT_ORDER = "COURT_ORDER",
    GARNISHMENT = "GARNISHMENT",
    TARDINESS_PENALTY = "TARDINESS_PENALTY",
    ABSENCE_DEDUCTION = "ABSENCE_DEDUCTION",
    UNIFORM_DEDUCTION = "UNIFORM_DEDUCTION",
    EQUIPMENT_DAMAGE = "EQUIPMENT_DAMAGE",
    CAFETERIA_DEDUCTION = "CAFETERIA_DEDUCTION",
    TRANSPORT_DEDUCTION = "TRANSPORT_DEDUCTION",
    PARKING_FEE = "PARKING_FEE",
    PHONE_BILL = "PHONE_BILL",
    OTHER = "OTHER"
}
export declare enum DeductionStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum DeductionFrequency {
    ONCE = "ONCE",
    MONTHLY = "MONTHLY",
    BIMONTHLY = "BIMONTHLY",
    QUARTERLY = "QUARTERLY",
    ANNUAL = "ANNUAL"
}
export declare enum DeductionMethod {
    FIXED_AMOUNT = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
    GRADUATED = "GRADUATED",
    TIERED = "TIERED"
}
export declare class PayrollDeduction {
    id: string;
    tenantId: string;
    payrollId: string;
    employeeId: string;
    deductionCode: string;
    deductionType: DeductionType;
    deductionName: string;
    description: string;
    deductionCategory: string;
    deductionStatus: DeductionStatus;
    deductionMethod: DeductionMethod;
    deductionAmount: number;
    deductionPercentage: number;
    minimumAmount: number;
    maximumAmount: number;
    calculationBase: string;
    calculatedAmount: number;
    actualDeductedAmount: number;
    deductionFrequency: DeductionFrequency;
    effectiveDate: Date;
    endDate: Date;
    nextDeductionDate: Date;
    lastDeductionDate: Date;
    totalLoanAmount: number;
    remainingBalance: number;
    installmentAmount: number;
    numberOfInstallments: number;
    installmentsPaid: number;
    installmentsRemaining: number;
    interestRate: number;
    deductionPriority: number;
    deductionSequence: number;
    mandatoryDeduction: boolean;
    preTaxDeduction: boolean;
    postTaxDeduction: boolean;
    ghanaTaxDeductible: boolean;
    ssnitApplicable: boolean;
    pensionApplicable: boolean;
    statutoryDeduction: boolean;
    courtOrdered: boolean;
    courtOrderReference: string;
    annualLimit: number;
    monthlyLimit: number;
    ytdDeducted: number;
    lifetimeDeducted: number;
    salaryPercentageLimit: number;
    employeeConsent: boolean;
    consentDate: Date;
    consentDocumentUrl: string;
    authorizationFormUrl: string;
    revocationNotice: boolean;
    revocationDate: Date;
    revocationEffectiveDate: Date;
    processed: boolean;
    processingDate: Date;
    processingNotes: string;
    failedProcessing: boolean;
    failureReason: string;
    retryCount: number;
    beneficiaryName: string;
    beneficiaryAccount: string;
    beneficiaryBank: string;
    remittanceRequired: boolean;
    remittanceFrequency: string;
    lastRemittanceDate: Date;
    remittanceReference: string;
    adjustmentAmount: number;
    adjustmentReason: string;
    adjustmentDate: Date;
    adjustedBy: string;
    reversalAllowed: boolean;
    reversed: boolean;
    reversalDate: Date;
    reversalReason: string;
    taxableBenefit: boolean;
    reportableToIRS: boolean;
    reportableToSSNIT: boolean;
    reportableToNPRA: boolean;
    complianceCode: string;
    glAccount: string;
    costCenter: string;
    currency: string;
    exchangeRate: number;
    baseCurrencyAmount: number;
    approvalRequired: boolean;
    approved: boolean;
    approvedBy: string;
    approvalDate: Date;
    approvalComments: string;
    hrApprovalRequired: boolean;
    hrApproved: boolean;
    hrApprovalDate: Date;
    supportingDocuments: string;
    deductionSlipUrl: string;
    remittanceAdviceUrl: string;
    deductionNotes: string;
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
//# sourceMappingURL=payroll-deduction.entity.d.ts.map