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
exports.PayrollAllowance = exports.AllowanceMethod = exports.AllowanceFrequency = exports.AllowanceStatus = exports.AllowanceType = void 0;
const typeorm_1 = require("typeorm");
const payroll_entity_1 = require("./payroll.entity");
const employee_entity_1 = require("../../employee/entities/employee.entity");
var AllowanceType;
(function (AllowanceType) {
    AllowanceType["HOUSING_ALLOWANCE"] = "HOUSING_ALLOWANCE";
    AllowanceType["TRANSPORT_ALLOWANCE"] = "TRANSPORT_ALLOWANCE";
    AllowanceType["FUEL_ALLOWANCE"] = "FUEL_ALLOWANCE";
    AllowanceType["MEAL_ALLOWANCE"] = "MEAL_ALLOWANCE";
    AllowanceType["MEDICAL_ALLOWANCE"] = "MEDICAL_ALLOWANCE";
    AllowanceType["EDUCATION_ALLOWANCE"] = "EDUCATION_ALLOWANCE";
    AllowanceType["RISK_ALLOWANCE"] = "RISK_ALLOWANCE";
    AllowanceType["RESPONSIBILITY_ALLOWANCE"] = "RESPONSIBILITY_ALLOWANCE";
    AllowanceType["SHIFT_ALLOWANCE"] = "SHIFT_ALLOWANCE";
    AllowanceType["LOCATION_ALLOWANCE"] = "LOCATION_ALLOWANCE";
    AllowanceType["HARDSHIP_ALLOWANCE"] = "HARDSHIP_ALLOWANCE";
    AllowanceType["ACTING_ALLOWANCE"] = "ACTING_ALLOWANCE";
    AllowanceType["OVERTIME_ALLOWANCE"] = "OVERTIME_ALLOWANCE";
    AllowanceType["CALL_OUT_ALLOWANCE"] = "CALL_OUT_ALLOWANCE";
    AllowanceType["STANDBY_ALLOWANCE"] = "STANDBY_ALLOWANCE";
    AllowanceType["HAZARD_PAY"] = "HAZARD_PAY";
    AllowanceType["ISOLATION_ALLOWANCE"] = "ISOLATION_ALLOWANCE";
    AllowanceType["ENTERTAINMENT_ALLOWANCE"] = "ENTERTAINMENT_ALLOWANCE";
    AllowanceType["COMMUNICATION_ALLOWANCE"] = "COMMUNICATION_ALLOWANCE";
    AllowanceType["UNIFORM_ALLOWANCE"] = "UNIFORM_ALLOWANCE";
    AllowanceType["TOOL_ALLOWANCE"] = "TOOL_ALLOWANCE";
    AllowanceType["PROFESSIONAL_ALLOWANCE"] = "PROFESSIONAL_ALLOWANCE";
    AllowanceType["TRAINING_ALLOWANCE"] = "TRAINING_ALLOWANCE";
    AllowanceType["TRAVEL_ALLOWANCE"] = "TRAVEL_ALLOWANCE";
    AllowanceType["SUBSISTENCE_ALLOWANCE"] = "SUBSISTENCE_ALLOWANCE";
    AllowanceType["OTHER"] = "OTHER";
})(AllowanceType || (exports.AllowanceType = AllowanceType = {}));
var AllowanceStatus;
(function (AllowanceStatus) {
    AllowanceStatus["ACTIVE"] = "ACTIVE";
    AllowanceStatus["INACTIVE"] = "INACTIVE";
    AllowanceStatus["SUSPENDED"] = "SUSPENDED";
    AllowanceStatus["EXPIRED"] = "EXPIRED";
    AllowanceStatus["CANCELLED"] = "CANCELLED";
})(AllowanceStatus || (exports.AllowanceStatus = AllowanceStatus = {}));
var AllowanceFrequency;
(function (AllowanceFrequency) {
    AllowanceFrequency["ONCE"] = "ONCE";
    AllowanceFrequency["DAILY"] = "DAILY";
    AllowanceFrequency["WEEKLY"] = "WEEKLY";
    AllowanceFrequency["BIWEEKLY"] = "BIWEEKLY";
    AllowanceFrequency["MONTHLY"] = "MONTHLY";
    AllowanceFrequency["QUARTERLY"] = "QUARTERLY";
    AllowanceFrequency["ANNUAL"] = "ANNUAL";
})(AllowanceFrequency || (exports.AllowanceFrequency = AllowanceFrequency = {}));
var AllowanceMethod;
(function (AllowanceMethod) {
    AllowanceMethod["FIXED_AMOUNT"] = "FIXED_AMOUNT";
    AllowanceMethod["PERCENTAGE"] = "PERCENTAGE";
    AllowanceMethod["RATE_BASED"] = "RATE_BASED";
    AllowanceMethod["TIERED"] = "TIERED";
})(AllowanceMethod || (exports.AllowanceMethod = AllowanceMethod = {}));
let PayrollAllowance = class PayrollAllowance {
    id;
    tenantId;
    payrollId;
    employeeId;
    allowanceCode;
    // Allowance Details
    allowanceType;
    allowanceName;
    description;
    allowanceCategory; // REGULAR, SPECIAL, TEMPORARY, PERFORMANCE
    allowanceStatus;
    // Amount and Calculation
    allowanceMethod;
    allowanceAmount;
    allowancePercentage;
    ratePerUnit;
    units;
    unitType; // HOURS, DAYS, KM, TRIPS, etc.
    minimumAmount;
    maximumAmount;
    calculationBase; // BASIC_SALARY, GROSS_PAY, FIXED_AMOUNT
    calculatedAmount;
    actualAllowanceAmount;
    // Timing and Frequency
    allowanceFrequency;
    effectiveDate;
    endDate;
    nextPaymentDate;
    lastPaymentDate;
    // Prorating and Adjustments
    prorated;
    prorationDays;
    prorationFactor;
    proratedAmount;
    // Tax Treatment
    taxable;
    taxExemptAmount;
    taxExemptPercentage;
    taxableAmount;
    nonTaxableAmount;
    // Ghana Specific Tax Treatment
    ghanaTaxExempt;
    ssnitApplicable;
    pensionApplicable;
    statutoryAllowance;
    // Conditions and Eligibility
    conditionalAllowance;
    conditionsMet;
    eligibilityCriteria;
    performanceBased;
    performanceThreshold;
    attendanceBased;
    minimumAttendanceDays;
    // Location and Job Specific
    locationSpecific;
    applicableLocations; // JSON array
    jobGradeSpecific;
    applicableJobGrades; // JSON array
    departmentSpecific;
    applicableDepartments; // JSON array
    // Ghana OMC Specific
    petroleumOperationsAllowance;
    offshoreAllowance;
    hazardousDutyAllowance;
    remoteLocationAllowance;
    technicalAllowance;
    safetyComplianceBonus;
    // Limits and Caps
    annualLimit;
    monthlyLimit;
    ytdPaid;
    lifetimePaid;
    dailyLimit;
    weeklyLimit;
    // Reimbursement Information
    reimbursementBased;
    advancePayment;
    receiptsRequired;
    receiptSubmissionDeadline;
    receiptsSubmitted;
    receiptsVerified;
    overpaymentRecovery;
    recoveryAmount;
    // Processing Information
    processed;
    processingDate;
    processingNotes;
    failedProcessing;
    failureReason;
    retryCount;
    // Adjustment and Correction
    adjustmentAmount;
    adjustmentReason;
    adjustmentDate;
    adjustedBy;
    reversalAllowed;
    reversed;
    reversalDate;
    reversalReason;
    // Currency and Exchange
    currency;
    exchangeRate;
    baseCurrencyAmount;
    // Approval and Authorization
    approvalRequired;
    approved;
    approvedBy;
    approvalDate;
    approvalComments;
    managerApprovalRequired;
    managerApproved;
    managerApprovalDate;
    hrApprovalRequired;
    hrApproved;
    hrApprovalDate;
    // Reporting and Compliance
    reportableToIRS; // Ghana Revenue Authority
    reportableToSSNIT;
    reportableToNPRA; // National Pensions Regulatory Authority
    complianceCode;
    glAccount;
    costCenter;
    budgetCode;
    // Employee Request Information
    employeeRequested;
    requestDate;
    requestReason;
    justification;
    supportingDocumentation; // JSON array of document URLs
    // Document Management
    allowanceCertificateUrl;
    calculationWorksheetUrl;
    receiptDocumentsUrl; // JSON array
    // Integration and Automation
    autoCalculated;
    manualOverride;
    overrideReason;
    systemGenerated;
    calculationRuleId;
    // Notes and Comments
    allowanceNotes;
    employeeNotes;
    hrNotes;
    systemNotes;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    payroll;
    employee;
};
exports.PayrollAllowance = PayrollAllowance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_id', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "payrollId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_code', length: 20, unique: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'allowance_type',
        type: 'enum',
        enum: AllowanceType
    }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_name', length: 255 }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_category', length: 100, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'allowance_status',
        type: 'enum',
        enum: AllowanceStatus,
        default: AllowanceStatus.ACTIVE
    }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'allowance_method',
        type: 'enum',
        enum: AllowanceMethod,
        default: AllowanceMethod.FIXED_AMOUNT
    }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "allowanceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "allowancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rate_per_unit', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "ratePerUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'units', type: 'decimal', precision: 10, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "units", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "unitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "minimumAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "maximumAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_base', length: 50, default: 'BASIC_SALARY' }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "calculationBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "calculatedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_allowance_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "actualAllowanceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'allowance_frequency',
        type: 'enum',
        enum: AllowanceFrequency,
        default: AllowanceFrequency.MONTHLY
    }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date' }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_payment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_payment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "lastPaymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prorated', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "prorated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proration_days', nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "prorationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proration_factor', type: 'decimal', precision: 5, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "prorationFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prorated_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "proratedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "taxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_exempt_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "taxExemptAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_exempt_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "taxExemptPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "taxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_taxable_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "nonTaxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_tax_exempt', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "ghanaTaxExempt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_applicable', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "ssnitApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pension_applicable', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "pensionApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statutory_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "statutoryAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conditional_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "conditionalAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conditions_met', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "conditionsMet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'eligibility_criteria', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "eligibilityCriteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_based', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "performanceBased", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "performanceThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attendance_based', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "attendanceBased", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_attendance_days', nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "minimumAttendanceDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'location_specific', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "locationSpecific", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicable_locations', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "applicableLocations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_grade_specific', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "jobGradeSpecific", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicable_job_grades', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "applicableJobGrades", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_specific', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "departmentSpecific", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'applicable_departments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "applicableDepartments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_operations_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "petroleumOperationsAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offshore_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "offshoreAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hazardous_duty_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "hazardousDutyAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remote_location_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "remoteLocationAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technical_allowance', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "technicalAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'safety_compliance_bonus', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "safetyComplianceBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "annualLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "monthlyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_paid', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "ytdPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lifetime_paid', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "lifetimePaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "dailyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weekly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "weeklyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reimbursement_based', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reimbursementBased", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'advance_payment', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "advancePayment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipts_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "receiptsRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_submission_deadline', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "receiptSubmissionDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipts_submitted', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "receiptsSubmitted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipts_verified', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "receiptsVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overpayment_recovery', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "overpaymentRecovery", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recovery_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "recoveryAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "processed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "processingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "processingNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_processing', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "failedProcessing", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "adjustmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "adjustmentReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "adjustmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjusted_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "adjustedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_allowed', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reversalAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversed', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reversed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "reversalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "reversalReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollAllowance.prototype, "baseCurrencyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "approvalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved', nullable: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "approved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "approvalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approval_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "managerApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approved', nullable: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "managerApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "managerApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "hrApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approved', nullable: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "hrApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_irs', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reportableToIRS", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_ssnit', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reportableToSSNIT", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_npra', default: true }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "reportableToNPRA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "complianceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gl_account', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "glAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "budgetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_requested', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "employeeRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "requestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "requestReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'justification', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "justification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documentation', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "supportingDocumentation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_certificate_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceCertificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_worksheet_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "calculationWorksheetUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_documents_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "receiptDocumentsUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_calculated', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "autoCalculated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manual_override', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "manualOverride", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'override_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "overrideReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_generated', default: false }),
    __metadata("design:type", Boolean)
], PayrollAllowance.prototype, "systemGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_rule_id', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "calculationRuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowance_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "allowanceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "employeeNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "hrNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "systemNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], PayrollAllowance.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PayrollAllowance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payroll_entity_1.Payroll, payroll => payroll.customAllowances, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payroll_id' }),
    __metadata("design:type", payroll_entity_1.Payroll)
], PayrollAllowance.prototype, "payroll", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], PayrollAllowance.prototype, "employee", void 0);
exports.PayrollAllowance = PayrollAllowance = __decorate([
    (0, typeorm_1.Entity)('payroll_allowances'),
    (0, typeorm_1.Index)(['tenantId', 'payrollId']),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['allowanceType']),
    (0, typeorm_1.Index)(['effectiveDate'])
], PayrollAllowance);
//# sourceMappingURL=payroll-allowance.entity.js.map