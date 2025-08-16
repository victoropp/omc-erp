import { Employee } from './employee.entity';
export declare enum LeaveType {
    ANNUAL_LEAVE = "ANNUAL_LEAVE",
    SICK_LEAVE = "SICK_LEAVE",
    MATERNITY_LEAVE = "MATERNITY_LEAVE",
    PATERNITY_LEAVE = "PATERNITY_LEAVE",
    COMPASSIONATE_LEAVE = "COMPASSIONATE_LEAVE",
    STUDY_LEAVE = "STUDY_LEAVE",
    SABBATICAL_LEAVE = "SABBATICAL_LEAVE",
    UNPAID_LEAVE = "UNPAID_LEAVE",
    EMERGENCY_LEAVE = "EMERGENCY_LEAVE",
    CASUAL_LEAVE = "CASUAL_LEAVE",
    PUBLIC_HOLIDAY = "PUBLIC_HOLIDAY",
    COMPENSATORY_LEAVE = "COMPENSATORY_LEAVE",
    MEDICAL_LEAVE = "MEDICAL_LEAVE",
    BEREAVEMENT_LEAVE = "BEREAVEMENT_LEAVE"
}
export declare enum LeaveStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    TAKEN = "TAKEN",
    PARTIALLY_TAKEN = "PARTIALLY_TAKEN",
    EXPIRED = "EXPIRED"
}
export declare enum PaymentStatus {
    PAID = "PAID",
    UNPAID = "UNPAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    NOT_APPLICABLE = "NOT_APPLICABLE"
}
export declare class EmployeeLeave {
    id: string;
    tenantId: string;
    employeeId: string;
    leaveRequestNumber: string;
    leaveType: LeaveType;
    leaveStatus: LeaveStatus;
    leaveStartDate: Date;
    leaveEndDate: Date;
    totalDaysRequested: number;
    totalDaysApproved: number;
    totalDaysTaken: number;
    workingDaysRequested: number;
    workingDaysApproved: number;
    workingDaysTaken: number;
    halfDayStart: boolean;
    halfDayEnd: boolean;
    reason: string;
    requestDate: Date;
    requestedBy: string;
    emergencyLeave: boolean;
    contactDuringLeave: string;
    handoverNotes: string;
    coveringEmployeeId: string;
    coveringEmployeeName: string;
    immediateSupervisorId: string;
    immediateSupervisorName: string;
    immediateSupervisorApproval: boolean;
    immediateSupervisorApprovalDate: Date;
    immediateSupervisorComments: string;
    hrApproval: boolean;
    hrApprovalDate: Date;
    hrApprovedBy: string;
    hrComments: string;
    finalApproval: boolean;
    finalApprovalDate: Date;
    finalApprovedBy: string;
    finalApprovalComments: string;
    leaveBalanceBefore: number;
    leaveBalanceAfter: number;
    carryoverImpact: number;
    accrualImpact: number;
    paymentStatus: PaymentStatus;
    paidLeave: boolean;
    paymentPercentage: number;
    dailyRate: number;
    totalPaymentAmount: number;
    paymentProcessed: boolean;
    paymentDate: Date;
    ghanaLaborActCompliant: boolean;
    statutoryLeave: boolean;
    medicalCertificateRequired: boolean;
    medicalCertificateProvided: boolean;
    medicalCertificateUrl: string;
    returnToWorkClearance: boolean;
    fitnessForDutyRequired: boolean;
    safetyImpactAssessment: boolean;
    criticalOperationPeriod: boolean;
    replacementCoverageConfirmed: boolean;
    securityClearanceImpact: boolean;
    hseNotificationRequired: boolean;
    plannedReturnDate: Date;
    actualReturnDate: Date;
    earlyReturn: boolean;
    lateReturn: boolean;
    returnToWorkInterview: boolean;
    returnToWorkDate: Date;
    returnToWorkNotes: string;
    extensionRequested: boolean;
    extensionDays: number;
    extensionApproved: boolean;
    extensionReason: string;
    reductionRequested: boolean;
    reductionDays: number;
    reductionApproved: boolean;
    leaveApplicationDocument: string;
    approvalDocument: string;
    supportingDocuments: string;
    handoverDocument: string;
    calendarBlocked: boolean;
    payrollIntegrationProcessed: boolean;
    attendanceSystemUpdated: boolean;
    emailNotificationsSent: boolean;
    leaveYear: string;
    carriedForwardDays: number;
    forfeitDays: number;
    encashedDays: number;
    encashmentAmount: number;
    costCenter: string;
    department: string;
    location: string;
    projectImpact: string;
    productivityImpact: string;
    employeeNotes: string;
    managerNotes: string;
    hrNotes: string;
    systemNotes: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    coveringEmployee: Employee;
}
//# sourceMappingURL=employee-leave.entity.d.ts.map