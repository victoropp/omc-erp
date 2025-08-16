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
exports.EmployeeLeave = exports.PaymentStatus = exports.LeaveStatus = exports.LeaveType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var LeaveType;
(function (LeaveType) {
    LeaveType["ANNUAL_LEAVE"] = "ANNUAL_LEAVE";
    LeaveType["SICK_LEAVE"] = "SICK_LEAVE";
    LeaveType["MATERNITY_LEAVE"] = "MATERNITY_LEAVE";
    LeaveType["PATERNITY_LEAVE"] = "PATERNITY_LEAVE";
    LeaveType["COMPASSIONATE_LEAVE"] = "COMPASSIONATE_LEAVE";
    LeaveType["STUDY_LEAVE"] = "STUDY_LEAVE";
    LeaveType["SABBATICAL_LEAVE"] = "SABBATICAL_LEAVE";
    LeaveType["UNPAID_LEAVE"] = "UNPAID_LEAVE";
    LeaveType["EMERGENCY_LEAVE"] = "EMERGENCY_LEAVE";
    LeaveType["CASUAL_LEAVE"] = "CASUAL_LEAVE";
    LeaveType["PUBLIC_HOLIDAY"] = "PUBLIC_HOLIDAY";
    LeaveType["COMPENSATORY_LEAVE"] = "COMPENSATORY_LEAVE";
    LeaveType["MEDICAL_LEAVE"] = "MEDICAL_LEAVE";
    LeaveType["BEREAVEMENT_LEAVE"] = "BEREAVEMENT_LEAVE";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["DRAFT"] = "DRAFT";
    LeaveStatus["SUBMITTED"] = "SUBMITTED";
    LeaveStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    LeaveStatus["APPROVED"] = "APPROVED";
    LeaveStatus["REJECTED"] = "REJECTED";
    LeaveStatus["CANCELLED"] = "CANCELLED";
    LeaveStatus["TAKEN"] = "TAKEN";
    LeaveStatus["PARTIALLY_TAKEN"] = "PARTIALLY_TAKEN";
    LeaveStatus["EXPIRED"] = "EXPIRED";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PaymentStatus["NOT_APPLICABLE"] = "NOT_APPLICABLE";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let EmployeeLeave = class EmployeeLeave {
    id;
    tenantId;
    employeeId;
    leaveRequestNumber;
    // Leave Details
    leaveType;
    leaveStatus;
    leaveStartDate;
    leaveEndDate;
    totalDaysRequested;
    totalDaysApproved;
    totalDaysTaken;
    workingDaysRequested;
    workingDaysApproved;
    workingDaysTaken;
    halfDayStart;
    halfDayEnd;
    // Request Information
    reason;
    requestDate;
    requestedBy;
    emergencyLeave;
    contactDuringLeave;
    handoverNotes;
    coveringEmployeeId;
    coveringEmployeeName;
    // Approval Workflow
    immediateSupervisorId;
    immediateSupervisorName;
    immediateSupervisorApproval;
    immediateSupervisorApprovalDate;
    immediateSupervisorComments;
    hrApproval;
    hrApprovalDate;
    hrApprovedBy;
    hrComments;
    finalApproval;
    finalApprovalDate;
    finalApprovedBy;
    finalApprovalComments;
    // Leave Balance Impact
    leaveBalanceBefore;
    leaveBalanceAfter;
    carryoverImpact;
    accrualImpact;
    // Payment Information
    paymentStatus;
    paidLeave;
    paymentPercentage; // Percentage of salary paid during leave
    dailyRate;
    totalPaymentAmount;
    paymentProcessed;
    paymentDate;
    // Ghana Labor Law Compliance
    ghanaLaborActCompliant;
    statutoryLeave; // Leave mandated by Ghana labor law
    medicalCertificateRequired;
    medicalCertificateProvided;
    medicalCertificateUrl;
    returnToWorkClearance;
    fitnessForDutyRequired;
    // Ghana OMC Specific
    safetyImpactAssessment;
    criticalOperationPeriod; // During critical petroleum operations
    replacementCoverageConfirmed;
    securityClearanceImpact;
    hseNotificationRequired;
    // Return to Work
    plannedReturnDate;
    actualReturnDate;
    earlyReturn;
    lateReturn;
    returnToWorkInterview;
    returnToWorkDate;
    returnToWorkNotes;
    // Leave Extension/Reduction
    extensionRequested;
    extensionDays;
    extensionApproved;
    extensionReason;
    reductionRequested;
    reductionDays;
    reductionApproved;
    // Document Management
    leaveApplicationDocument;
    approvalDocument;
    supportingDocuments; // JSON array of document URLs
    handoverDocument;
    // Integration and Automation
    calendarBlocked;
    payrollIntegrationProcessed;
    attendanceSystemUpdated;
    emailNotificationsSent;
    // Annual Leave Specific
    leaveYear;
    carriedForwardDays;
    forfeitDays;
    encashedDays;
    encashmentAmount;
    // Reporting and Analytics
    costCenter;
    department;
    location;
    projectImpact;
    productivityImpact; // NONE, LOW, MEDIUM, HIGH
    // Notes and Comments
    employeeNotes;
    managerNotes;
    hrNotes;
    systemNotes;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    employee;
    coveringEmployee;
};
exports.EmployeeLeave = EmployeeLeave;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_request_number', length: 50, unique: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "leaveRequestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'leave_type',
        type: 'enum',
        enum: LeaveType
    }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'leave_status',
        type: 'enum',
        enum: LeaveStatus,
        default: LeaveStatus.DRAFT
    }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "leaveStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_start_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "leaveStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_end_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "leaveEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_days_requested', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "totalDaysRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_days_approved', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "totalDaysApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_days_taken', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "totalDaysTaken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days_requested', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "workingDaysRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days_approved', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "workingDaysApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days_taken', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "workingDaysTaken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'half_day_start', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "halfDayStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'half_day_end', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "halfDayEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason', type: 'text' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "requestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_leave', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "emergencyLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_during_leave', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "contactDuringLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handover_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "handoverNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'covering_employee_id', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "coveringEmployeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'covering_employee_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "coveringEmployeeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'immediate_supervisor_id', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "immediateSupervisorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'immediate_supervisor_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "immediateSupervisorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'immediate_supervisor_approval', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "immediateSupervisorApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'immediate_supervisor_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "immediateSupervisorApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'immediate_supervisor_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "immediateSupervisorComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "hrApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "hrApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "hrComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_approval', nullable: true }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "finalApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "finalApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "finalApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_approval_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "finalApprovalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_balance_before', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "leaveBalanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_balance_after', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "leaveBalanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carryover_impact', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "carryoverImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accrual_impact', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "accrualImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.NOT_APPLICABLE
    }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_leave', default: true }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "paidLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "paymentPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_rate', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "dailyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_payment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "totalPaymentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_processed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "paymentProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_labor_act_compliant', default: true }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "ghanaLaborActCompliant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statutory_leave', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "statutoryLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_certificate_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "medicalCertificateRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_certificate_provided', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "medicalCertificateProvided", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_certificate_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "medicalCertificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_to_work_clearance', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "returnToWorkClearance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fitness_for_duty_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "fitnessForDutyRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'safety_impact_assessment', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "safetyImpactAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'critical_operation_period', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "criticalOperationPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replacement_coverage_confirmed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "replacementCoverageConfirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_clearance_impact', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "securityClearanceImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hse_notification_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "hseNotificationRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_return_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "plannedReturnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_return_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "actualReturnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'early_return', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "earlyReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'late_return', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "lateReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_to_work_interview', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "returnToWorkInterview", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_to_work_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "returnToWorkDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_to_work_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "returnToWorkNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extension_requested', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "extensionRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extension_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "extensionDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extension_approved', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "extensionApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extension_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "extensionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reduction_requested', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "reductionRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reduction_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "reductionDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reduction_approved', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "reductionApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_application_document', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "leaveApplicationDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_document', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "approvalDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handover_document', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "handoverDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calendar_blocked', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "calendarBlocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_integration_processed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "payrollIntegrationProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendance_system_updated', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "attendanceSystemUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_notifications_sent', default: false }),
    __metadata("design:type", Boolean)
], EmployeeLeave.prototype, "emailNotificationsSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave_year', length: 4, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "leaveYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carried_forward_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "carriedForwardDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'forfeit_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "forfeitDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encashed_days', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "encashedDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encashment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeLeave.prototype, "encashmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_impact', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "projectImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'productivity_impact', length: 20, default: 'NONE' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "productivityImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "employeeNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "managerNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "hrNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "systemNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], EmployeeLeave.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmployeeLeave.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.leaves),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeLeave.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'covering_employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeLeave.prototype, "coveringEmployee", void 0);
exports.EmployeeLeave = EmployeeLeave = __decorate([
    (0, typeorm_1.Entity)('employee_leaves'),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['tenantId', 'leaveStatus']),
    (0, typeorm_1.Index)(['leaveStartDate', 'leaveEndDate']),
    (0, typeorm_1.Index)(['leaveType'])
], EmployeeLeave);
//# sourceMappingURL=employee-leave.entity.js.map