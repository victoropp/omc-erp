import { Employee } from './employee.entity';
export declare enum ContractType {
    PERMANENT = "PERMANENT",
    FIXED_TERM = "FIXED_TERM",
    PROBATIONARY = "PROBATIONARY",
    CASUAL = "CASUAL",
    APPRENTICESHIP = "APPRENTICESHIP",
    INTERNSHIP = "INTERNSHIP",
    CONSULTANT = "CONSULTANT",
    SEASONAL = "SEASONAL"
}
export declare enum ContractStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    TERMINATED = "TERMINATED",
    RENEWED = "RENEWED",
    SUSPENDED = "SUSPENDED",
    CANCELLED = "CANCELLED"
}
export declare enum TerminationType {
    VOLUNTARY_RESIGNATION = "VOLUNTARY_RESIGNATION",
    INVOLUNTARY_TERMINATION = "INVOLUNTARY_TERMINATION",
    END_OF_CONTRACT = "END_OF_CONTRACT",
    MUTUAL_AGREEMENT = "MUTUAL_AGREEMENT",
    RETIREMENT = "RETIREMENT",
    DEATH = "DEATH",
    ABANDONMENT = "ABANDONMENT"
}
export declare class EmployeeContract {
    id: string;
    tenantId: string;
    employeeId: string;
    contractNumber: string;
    contractType: ContractType;
    contractStatus: ContractStatus;
    contractTitle: string;
    contractStartDate: Date;
    contractEndDate: Date;
    probationPeriodMonths: number;
    noticePeriodDays: number;
    renewable: boolean;
    autoRenew: boolean;
    renewalPeriodMonths: number;
    basicSalary: number;
    currency: string;
    payFrequency: string;
    salaryReviewFrequency: string;
    nextSalaryReviewDate: Date;
    housingAllowance: number;
    transportAllowance: number;
    fuelAllowance: number;
    medicalAllowance: number;
    educationAllowance: number;
    riskAllowance: number;
    totalPackageValue: number;
    workingHoursPerWeek: number;
    workingDaysPerWeek: number;
    overtimeEligible: boolean;
    shiftAllowanceEligible: boolean;
    remoteWorkEligible: boolean;
    travelRequirements: string;
    annualLeaveDays: number;
    sickLeaveDays: number;
    maternityLeaveDays: number;
    paternityLeaveDays: number;
    compassionateLeaveDays: number;
    studyLeaveEligible: boolean;
    sabbaticalEligible: boolean;
    petroleumSafetyComplianceRequired: boolean;
    hseTrainingRequired: boolean;
    confidentialityAgreement: boolean;
    nonCompeteClause: boolean;
    nonCompetePeriodMonths: number;
    intellectualPropertyClause: boolean;
    codeOfConductAcceptance: boolean;
    performanceReviewFrequency: string;
    trainingBudgetAnnual: number;
    professionalDevelopmentEligible: boolean;
    conferenceAttendanceEligible: boolean;
    terminationType: TerminationType;
    terminationDate: Date;
    terminationReason: string;
    severancePayEligible: boolean;
    severanceAmount: number;
    noticeServed: boolean;
    noticeServedDate: Date;
    gardenLeave: boolean;
    previousContractId: string;
    renewedContractId: string;
    renewalCount: number;
    maxRenewals: number;
    workPermitRequired: boolean;
    workPermitNumber: string;
    workPermitExpiry: Date;
    taxExemptionEligible: boolean;
    socialSecurityRegistration: boolean;
    pensionSchemeEnrollment: boolean;
    contractDocumentUrl: string;
    signedContractUrl: string;
    amendmentsDocumentUrl: string;
    employeeSignedDate: Date;
    employerSignedDate: Date;
    witnessSignedDate: Date;
    witnessName: string;
    specialConditions: string;
    companyCarEligible: boolean;
    companyPhoneEligible: boolean;
    companyLaptopEligible: boolean;
    healthInsuranceCoverage: boolean;
    lifeInsuranceCoverage: boolean;
    familyCoverageEligible: boolean;
    contractValueTotal: number;
    costCenter: string;
    budgetCode: string;
    approvalWorkflowCompleted: boolean;
    legalReviewCompleted: boolean;
    hrApprovalDate: Date;
    managementApprovalDate: Date;
    notes: string;
    amendmentHistory: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
}
//# sourceMappingURL=employee-contract.entity.d.ts.map