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
exports.PayrollDeduction = exports.DeductionMethod = exports.DeductionFrequency = exports.DeductionStatus = exports.DeductionType = void 0;
const typeorm_1 = require("typeorm");
const payroll_entity_1 = require("./payroll.entity");
const employee_entity_1 = require("../../employee/entities/employee.entity");
var DeductionType;
(function (DeductionType) {
    DeductionType["INCOME_TAX"] = "INCOME_TAX";
    DeductionType["SSNIT_EMPLOYEE"] = "SSNIT_EMPLOYEE";
    DeductionType["TIER2_PENSION"] = "TIER2_PENSION";
    DeductionType["TIER3_PENSION"] = "TIER3_PENSION";
    DeductionType["UNION_DUES"] = "UNION_DUES";
    DeductionType["LOAN_REPAYMENT"] = "LOAN_REPAYMENT";
    DeductionType["SALARY_ADVANCE"] = "SALARY_ADVANCE";
    DeductionType["INSURANCE_PREMIUM"] = "INSURANCE_PREMIUM";
    DeductionType["MEDICAL_INSURANCE"] = "MEDICAL_INSURANCE";
    DeductionType["LIFE_INSURANCE"] = "LIFE_INSURANCE";
    DeductionType["WELFARE_CONTRIBUTION"] = "WELFARE_CONTRIBUTION";
    DeductionType["COOPERATIVE_SAVINGS"] = "COOPERATIVE_SAVINGS";
    DeductionType["DISCIPLINARY_DEDUCTION"] = "DISCIPLINARY_DEDUCTION";
    DeductionType["COURT_ORDER"] = "COURT_ORDER";
    DeductionType["GARNISHMENT"] = "GARNISHMENT";
    DeductionType["TARDINESS_PENALTY"] = "TARDINESS_PENALTY";
    DeductionType["ABSENCE_DEDUCTION"] = "ABSENCE_DEDUCTION";
    DeductionType["UNIFORM_DEDUCTION"] = "UNIFORM_DEDUCTION";
    DeductionType["EQUIPMENT_DAMAGE"] = "EQUIPMENT_DAMAGE";
    DeductionType["CAFETERIA_DEDUCTION"] = "CAFETERIA_DEDUCTION";
    DeductionType["TRANSPORT_DEDUCTION"] = "TRANSPORT_DEDUCTION";
    DeductionType["PARKING_FEE"] = "PARKING_FEE";
    DeductionType["PHONE_BILL"] = "PHONE_BILL";
    DeductionType["OTHER"] = "OTHER";
})(DeductionType || (exports.DeductionType = DeductionType = {}));
var DeductionStatus;
(function (DeductionStatus) {
    DeductionStatus["ACTIVE"] = "ACTIVE";
    DeductionStatus["INACTIVE"] = "INACTIVE";
    DeductionStatus["SUSPENDED"] = "SUSPENDED";
    DeductionStatus["COMPLETED"] = "COMPLETED";
    DeductionStatus["CANCELLED"] = "CANCELLED";
})(DeductionStatus || (exports.DeductionStatus = DeductionStatus = {}));
var DeductionFrequency;
(function (DeductionFrequency) {
    DeductionFrequency["ONCE"] = "ONCE";
    DeductionFrequency["MONTHLY"] = "MONTHLY";
    DeductionFrequency["BIMONTHLY"] = "BIMONTHLY";
    DeductionFrequency["QUARTERLY"] = "QUARTERLY";
    DeductionFrequency["ANNUAL"] = "ANNUAL";
})(DeductionFrequency || (exports.DeductionFrequency = DeductionFrequency = {}));
var DeductionMethod;
(function (DeductionMethod) {
    DeductionMethod["FIXED_AMOUNT"] = "FIXED_AMOUNT";
    DeductionMethod["PERCENTAGE"] = "PERCENTAGE";
    DeductionMethod["GRADUATED"] = "GRADUATED";
    DeductionMethod["TIERED"] = "TIERED";
})(DeductionMethod || (exports.DeductionMethod = DeductionMethod = {}));
let PayrollDeduction = class PayrollDeduction {
    id;
    tenantId;
    payrollId;
    employeeId;
    deductionCode;
    // Deduction Details
    deductionType;
    deductionName;
    description;
    deductionCategory; // STATUTORY, VOLUNTARY, EMPLOYER_INITIATED
    deductionStatus;
    // Amount and Calculation
    deductionMethod;
    deductionAmount;
    deductionPercentage;
    minimumAmount;
    maximumAmount;
    calculationBase; // GROSS_PAY, BASIC_SALARY, TAXABLE_INCOME
    calculatedAmount;
    actualDeductedAmount;
    // Timing and Frequency
    deductionFrequency;
    effectiveDate;
    endDate;
    nextDeductionDate;
    lastDeductionDate;
    // Loan/Installment Specific
    totalLoanAmount;
    remainingBalance;
    installmentAmount;
    numberOfInstallments;
    installmentsPaid;
    installmentsRemaining;
    interestRate;
    // Priority and Sequencing
    deductionPriority; // Lower numbers = higher priority
    deductionSequence;
    mandatoryDeduction;
    preTaxDeduction;
    postTaxDeduction;
    // Ghana Specific
    ghanaTaxDeductible;
    ssnitApplicable;
    pensionApplicable;
    statutoryDeduction;
    courtOrdered;
    courtOrderReference;
    // Limits and Caps
    annualLimit;
    monthlyLimit;
    ytdDeducted;
    lifetimeDeducted;
    salaryPercentageLimit; // Maximum % of salary that can be deducted
    // Employee Consent and Authorization
    employeeConsent;
    consentDate;
    consentDocumentUrl;
    authorizationFormUrl;
    revocationNotice;
    revocationDate;
    revocationEffectiveDate;
    // Processing Information
    processed;
    processingDate;
    processingNotes;
    failedProcessing;
    failureReason;
    retryCount;
    // Beneficiary Information (for union dues, welfare, etc.)
    beneficiaryName;
    beneficiaryAccount;
    beneficiaryBank;
    remittanceRequired;
    remittanceFrequency;
    lastRemittanceDate;
    remittanceReference;
    // Adjustment and Correction
    adjustmentAmount;
    adjustmentReason;
    adjustmentDate;
    adjustedBy;
    reversalAllowed;
    reversed;
    reversalDate;
    reversalReason;
    // Reporting and Compliance
    taxableBenefit;
    reportableToIRS; // Ghana Revenue Authority
    reportableToSSNIT;
    reportableToNPRA; // National Pensions Regulatory Authority
    complianceCode;
    glAccount;
    costCenter;
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
    hrApprovalRequired;
    hrApproved;
    hrApprovalDate;
    // Document Management
    supportingDocuments; // JSON array of document URLs
    deductionSlipUrl;
    remittanceAdviceUrl;
    // Notes and Comments
    deductionNotes;
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
exports.PayrollDeduction = PayrollDeduction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_id', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "payrollId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_code', length: 20, unique: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deduction_type',
        type: 'enum',
        enum: DeductionType
    }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_name', length: 255 }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_category', length: 100, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deduction_status',
        type: 'enum',
        enum: DeductionStatus,
        default: DeductionStatus.ACTIVE
    }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deduction_method',
        type: 'enum',
        enum: DeductionMethod,
        default: DeductionMethod.FIXED_AMOUNT
    }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "deductionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "deductionPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "minimumAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "maximumAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_base', length: 50, default: 'GROSS_PAY' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "calculationBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculated_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "calculatedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_deducted_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "actualDeductedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deduction_frequency',
        type: 'enum',
        enum: DeductionFrequency,
        default: DeductionFrequency.MONTHLY
    }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date' }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_deduction_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "nextDeductionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_deduction_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "lastDeductionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_loan_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "totalLoanAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remaining_balance', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "remainingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'installment_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "installmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'number_of_installments', nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "numberOfInstallments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'installments_paid', default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "installmentsPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'installments_remaining', nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "installmentsRemaining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_priority', default: 100 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "deductionPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_sequence', default: 1 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "deductionSequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mandatory_deduction', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "mandatoryDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pre_tax_deduction', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "preTaxDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_tax_deduction', default: true }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "postTaxDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_tax_deductible', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "ghanaTaxDeductible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit_applicable', default: true }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "ssnitApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pension_applicable', default: true }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "pensionApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statutory_deduction', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "statutoryDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'court_ordered', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "courtOrdered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'court_order_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "courtOrderReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "annualLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "monthlyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ytd_deducted', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "ytdDeducted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lifetime_deducted', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "lifetimeDeducted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_percentage_limit', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "salaryPercentageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_consent', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "employeeConsent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consent_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "consentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consent_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "consentDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'authorization_form_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "authorizationFormUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revocation_notice', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "revocationNotice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revocation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "revocationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revocation_effective_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "revocationEffectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "processed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "processingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "processingNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_processing', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "failedProcessing", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'beneficiary_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "beneficiaryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'beneficiary_account', length: 50, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "beneficiaryAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'beneficiary_bank', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "beneficiaryBank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remittance_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "remittanceRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remittance_frequency', length: 20, default: 'MONTHLY' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "remittanceFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_remittance_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "lastRemittanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remittance_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "remittanceReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "adjustmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "adjustmentReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "adjustmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjusted_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "adjustedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_allowed', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "reversalAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversed', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "reversed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "reversalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "reversalReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_benefit', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "taxableBenefit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_irs', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "reportableToIRS", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_ssnit', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "reportableToSSNIT", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportable_to_npra', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "reportableToNPRA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "complianceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gl_account', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "glAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PayrollDeduction.prototype, "baseCurrencyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "approvalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved', nullable: true }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "approved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "approvalComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_required', default: false }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "hrApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approved', nullable: true }),
    __metadata("design:type", Boolean)
], PayrollDeduction.prototype, "hrApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_slip_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionSlipUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remittance_advice_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "remittanceAdviceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deduction_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "deductionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "employeeNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hr_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "hrNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "systemNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], PayrollDeduction.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PayrollDeduction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payroll_entity_1.Payroll, payroll => payroll.customDeductions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payroll_id' }),
    __metadata("design:type", payroll_entity_1.Payroll)
], PayrollDeduction.prototype, "payroll", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, employee => employee.id),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], PayrollDeduction.prototype, "employee", void 0);
exports.PayrollDeduction = PayrollDeduction = __decorate([
    (0, typeorm_1.Entity)('payroll_deductions'),
    (0, typeorm_1.Index)(['tenantId', 'payrollId']),
    (0, typeorm_1.Index)(['tenantId', 'employeeId']),
    (0, typeorm_1.Index)(['deductionType']),
    (0, typeorm_1.Index)(['effectiveDate'])
], PayrollDeduction);
//# sourceMappingURL=payroll-deduction.entity.js.map