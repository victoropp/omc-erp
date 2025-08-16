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
exports.EmployeeContract = exports.TerminationType = exports.ContractStatus = exports.ContractType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var ContractType;
(function (ContractType) {
    ContractType["PERMANENT"] = "PERMANENT";
    ContractType["FIXED_TERM"] = "FIXED_TERM";
    ContractType["PROBATIONARY"] = "PROBATIONARY";
    ContractType["CASUAL"] = "CASUAL";
    ContractType["APPRENTICESHIP"] = "APPRENTICESHIP";
    ContractType["INTERNSHIP"] = "INTERNSHIP";
    ContractType["CONSULTANT"] = "CONSULTANT";
    ContractType["SEASONAL"] = "SEASONAL";
})(ContractType || (exports.ContractType = ContractType = {}));
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["DRAFT"] = "DRAFT";
    ContractStatus["ACTIVE"] = "ACTIVE";
    ContractStatus["EXPIRED"] = "EXPIRED";
    ContractStatus["TERMINATED"] = "TERMINATED";
    ContractStatus["RENEWED"] = "RENEWED";
    ContractStatus["SUSPENDED"] = "SUSPENDED";
    ContractStatus["CANCELLED"] = "CANCELLED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var TerminationType;
(function (TerminationType) {
    TerminationType["VOLUNTARY_RESIGNATION"] = "VOLUNTARY_RESIGNATION";
    TerminationType["INVOLUNTARY_TERMINATION"] = "INVOLUNTARY_TERMINATION";
    TerminationType["END_OF_CONTRACT"] = "END_OF_CONTRACT";
    TerminationType["MUTUAL_AGREEMENT"] = "MUTUAL_AGREEMENT";
    TerminationType["RETIREMENT"] = "RETIREMENT";
    TerminationType["DEATH"] = "DEATH";
    TerminationType["ABANDONMENT"] = "ABANDONMENT";
})(TerminationType || (exports.TerminationType = TerminationType = {}));
let EmployeeContract = class EmployeeContract {
    id;
    tenantId;
    employeeId;
    contractNumber;
    // Contract Information
    contractType;
    contractStatus;
    contractTitle;
    contractStartDate;
    contractEndDate;
    probationPeriodMonths;
    noticePeriodDays;
    renewable;
    autoRenew;
    renewalPeriodMonths;
    // Compensation Details
    basicSalary;
    currency;
    payFrequency;
    salaryReviewFrequency;
    nextSalaryReviewDate;
    // Benefits and Allowances
    housingAllowance;
    transportAllowance;
    fuelAllowance;
    medicalAllowance;
    educationAllowance;
    riskAllowance;
    totalPackageValue;
    // Working Conditions
    workingHoursPerWeek;
    workingDaysPerWeek;
    overtimeEligible;
    shiftAllowanceEligible;
    remoteWorkEligible;
    travelRequirements;
    // Leave Entitlements (Ghana Labor Law)
    annualLeaveDays; // Minimum 15 days in Ghana
    sickLeaveDays;
    maternityLeaveDays; // 12 weeks in Ghana
    paternityLeaveDays; // 1 week in Ghana
    compassionateLeaveDays;
    studyLeaveEligible;
    sabbaticalEligible;
    // Ghana OMC Specific Clauses
    petroleumSafetyComplianceRequired;
    hseTrainingRequired;
    confidentialityAgreement;
    nonCompeteClause;
    nonCompetePeriodMonths;
    intellectualPropertyClause;
    codeOfConductAcceptance;
    // Performance and Development
    performanceReviewFrequency;
    trainingBudgetAnnual;
    professionalDevelopmentEligible;
    conferenceAttendanceEligible;
    // Termination Provisions
    terminationType;
    terminationDate;
    terminationReason;
    severancePayEligible;
    severanceAmount;
    noticeServed;
    noticeServedDate;
    gardenLeave;
    // Contract Renewal
    previousContractId;
    renewedContractId;
    renewalCount;
    maxRenewals;
    // Legal and Compliance
    workPermitRequired;
    workPermitNumber;
    workPermitExpiry;
    taxExemptionEligible;
    socialSecurityRegistration;
    pensionSchemeEnrollment;
    // Document Management
    contractDocumentUrl;
    signedContractUrl;
    amendmentsDocumentUrl;
    employeeSignedDate;
    employerSignedDate;
    witnessSignedDate;
    witnessName;
    // Special Provisions
    specialConditions;
    companyCarEligible;
    companyPhoneEligible;
    companyLaptopEligible;
    healthInsuranceCoverage;
    lifeInsuranceCoverage;
    familyCoverageEligible;
    // Reporting and Analytics
    contractValueTotal;
    costCenter;
    budgetCode;
    approvalWorkflowCompleted;
    legalReviewCompleted;
    hrApprovalDate;
    managementApprovalDate;
    // Notes and Comments
    notes;
    amendmentHistory; // JSON array of amendments
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    employee;
};
exports.EmployeeContract = EmployeeContract;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeContract.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_number', length: 50, unique: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "contractNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contract_type',
        type: 'enum',
        enum: ContractType
    }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "contractType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contract_status',
        type: 'enum',
        enum: ContractStatus,
        default: ContractStatus.DRAFT
    }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "contractStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_title', length: 255 }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "contractTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_start_date', type: 'date' }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "contractStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "contractEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'probation_period_months', default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "probationPeriodMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notice_period_days', default: 30 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewable', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "renewable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_renew', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_period_months', nullable: true }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "renewalPeriodMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "basicSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_frequency', length: 20, default: 'MONTHLY' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "payFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_review_frequency', length: 20, default: 'ANNUAL' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "salaryReviewFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_salary_review_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "nextSalaryReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "housingAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "transportAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "fuelAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "medicalAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "educationAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "riskAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_package_value', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "totalPackageValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_hours_per_week', default: 40 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "workingHoursPerWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_days_per_week', default: 5 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "workingDaysPerWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_eligible', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "overtimeEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shift_allowance_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "shiftAllowanceEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remote_work_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "remoteWorkEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'travel_requirements', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "travelRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_leave_days', default: 15 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "annualLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sick_leave_days', default: 12 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "sickLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maternity_leave_days', default: 84 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "maternityLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paternity_leave_days', default: 7 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "paternityLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compassionate_leave_days', default: 3 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "compassionateLeaveDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'study_leave_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "studyLeaveEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sabbatical_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "sabbaticalEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_safety_compliance_required', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "petroleumSafetyComplianceRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hse_training_required', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "hseTrainingRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidentiality_agreement', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "confidentialityAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_compete_clause', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "nonCompeteClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_compete_period_months', nullable: true }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "nonCompetePeriodMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intellectual_property_clause', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "intellectualPropertyClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_of_conduct_acceptance', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "codeOfConductAcceptance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_review_frequency', length: 20, default: 'ANNUAL' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "performanceReviewFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'training_budget_annual', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "trainingBudgetAnnual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_development_eligible', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "professionalDevelopmentEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conference_attendance_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "conferenceAttendanceEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'termination_type',
        type: 'enum',
        enum: TerminationType,
        nullable: true
    }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "terminationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "terminationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'severance_pay_eligible', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "severancePayEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'severance_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "severanceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notice_served', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "noticeServed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notice_served_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "noticeServedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'garden_leave', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "gardenLeave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_contract_id', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "previousContractId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewed_contract_id', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "renewedContractId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_count', default: 0 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "renewalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_renewals', nullable: true }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "maxRenewals", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_permit_required', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "workPermitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_permit_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "workPermitNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_permit_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "workPermitExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_exemption_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "taxExemptionEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_security_registration', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "socialSecurityRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pension_scheme_enrollment', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "pensionSchemeEnrollment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "contractDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_contract_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "signedContractUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amendments_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "amendmentsDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_signed_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "employeeSignedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employer_signed_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "employerSignedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'witness_signed_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "witnessSignedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'witness_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "witnessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "specialConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_car_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "companyCarEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_phone_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "companyPhoneEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_laptop_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "companyLaptopEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_insurance_coverage', default: true }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "healthInsuranceCoverage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'life_insurance_coverage', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "lifeInsuranceCoverage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'family_coverage_eligible', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "familyCoverageEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_value_total', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeContract.prototype, "contractValueTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "budgetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_workflow_completed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "approvalWorkflowCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_review_completed', default: false }),
    __metadata("design:type", Boolean)
], EmployeeContract.prototype, "legalReviewCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "managementApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amendment_history', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "amendmentHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], EmployeeContract.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmployeeContract.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.contracts),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeContract.prototype, "employee", void 0);
exports.EmployeeContract = EmployeeContract = __decorate([
    (0, typeorm_1.Entity)('employee_contracts'),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['tenantId', 'contractStatus']),
    (0, typeorm_1.Index)(['contractStartDate', 'contractEndDate'])
], EmployeeContract);
//# sourceMappingURL=employee-contract.entity.js.map