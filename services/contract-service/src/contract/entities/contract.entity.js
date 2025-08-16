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
exports.Contract = exports.RenewalType = exports.PaymentTerms = exports.ContractStatus = exports.ContractType = void 0;
const typeorm_1 = require("typeorm");
var ContractType;
(function (ContractType) {
    ContractType["SUPPLY_AGREEMENT"] = "SUPPLY_AGREEMENT";
    ContractType["SERVICE_AGREEMENT"] = "SERVICE_AGREEMENT";
    ContractType["PURCHASE_AGREEMENT"] = "PURCHASE_AGREEMENT";
    ContractType["DISTRIBUTION_AGREEMENT"] = "DISTRIBUTION_AGREEMENT";
    ContractType["TRANSPORTATION_AGREEMENT"] = "TRANSPORTATION_AGREEMENT";
    ContractType["STORAGE_AGREEMENT"] = "STORAGE_AGREEMENT";
    ContractType["FRANCHISE_AGREEMENT"] = "FRANCHISE_AGREEMENT";
    ContractType["LEASE_AGREEMENT"] = "LEASE_AGREEMENT";
    ContractType["EMPLOYMENT_CONTRACT"] = "EMPLOYMENT_CONTRACT";
    ContractType["CONSULTANCY_AGREEMENT"] = "CONSULTANCY_AGREEMENT";
    ContractType["NDA"] = "NDA";
    ContractType["SLA"] = "SLA";
})(ContractType || (exports.ContractType = ContractType = {}));
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["DRAFT"] = "DRAFT";
    ContractStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ContractStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ContractStatus["ACTIVE"] = "ACTIVE";
    ContractStatus["SUSPENDED"] = "SUSPENDED";
    ContractStatus["TERMINATED"] = "TERMINATED";
    ContractStatus["EXPIRED"] = "EXPIRED";
    ContractStatus["RENEWED"] = "RENEWED";
    ContractStatus["CANCELLED"] = "CANCELLED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var PaymentTerms;
(function (PaymentTerms) {
    PaymentTerms["NET_15"] = "NET_15";
    PaymentTerms["NET_30"] = "NET_30";
    PaymentTerms["NET_45"] = "NET_45";
    PaymentTerms["NET_60"] = "NET_60";
    PaymentTerms["NET_90"] = "NET_90";
    PaymentTerms["IMMEDIATE"] = "IMMEDIATE";
    PaymentTerms["ON_DELIVERY"] = "ON_DELIVERY";
    PaymentTerms["MILESTONE_BASED"] = "MILESTONE_BASED";
    PaymentTerms["QUARTERLY"] = "QUARTERLY";
    PaymentTerms["MONTHLY"] = "MONTHLY";
})(PaymentTerms || (exports.PaymentTerms = PaymentTerms = {}));
var RenewalType;
(function (RenewalType) {
    RenewalType["MANUAL"] = "MANUAL";
    RenewalType["AUTOMATIC"] = "AUTOMATIC";
    RenewalType["MUTUAL_AGREEMENT"] = "MUTUAL_AGREEMENT";
    RenewalType["PERFORMANCE_BASED"] = "PERFORMANCE_BASED";
})(RenewalType || (exports.RenewalType = RenewalType = {}));
let Contract = class Contract {
    id;
    tenantId;
    contractNumber;
    contractTitle;
    contractType;
    status;
    // Parties Information
    partyAId; // Usually the company
    partyAName;
    partyARepresentative;
    partyADesignation;
    partyBId; // Vendor/Customer/Employee
    partyBName;
    partyBRepresentative;
    partyBDesignation;
    partyBType; // VENDOR, CUSTOMER, EMPLOYEE, PARTNER
    // Contract Duration
    effectiveDate;
    expiryDate;
    durationMonths;
    noticePeriodDays;
    // Financial Terms
    contractValue;
    currency;
    paymentTerms;
    billingFrequency; // MONTHLY, QUARTERLY, ANNUALLY, PER_DELIVERY
    minimumOrderValue;
    maximumOrderValue;
    discountPercentage;
    penaltyRate; // Late payment penalty
    securityDeposit;
    // Product/Service Details
    productsServices;
    deliveryTerms;
    qualitySpecifications;
    volumeCommitment;
    unitPrice;
    priceAdjustmentClause;
    // Ghana Specific Fields
    requiresNpaApproval;
    npaApprovalNumber;
    npaApprovalDate;
    localContentRequirement;
    taxExemptionApplicable;
    withholdingTaxRate;
    vatApplicable;
    stampDutyPaid;
    stampDutyAmount;
    // Performance Terms
    slaDefined;
    uptimeRequirement; // Percentage
    responseTimeHours;
    resolutionTimeHours;
    performanceBondRequired;
    performanceBondAmount;
    kpiMetrics;
    // Insurance and Liability
    insuranceRequired;
    insuranceCoverageAmount;
    liabilityCap;
    indemnificationClause;
    forceMajeureClause;
    // Termination Terms
    terminationClause;
    earlyTerminationAllowed;
    earlyTerminationPenalty;
    terminationNoticeRequired;
    terminationDate;
    terminationReason;
    // Renewal Information
    renewable;
    renewalType;
    renewalNoticeDays;
    maxRenewals;
    renewalCount;
    lastRenewalDate;
    nextRenewalDate;
    // Compliance and Legal
    governingLaw;
    disputeResolution;
    arbitrationVenue;
    confidentialityClause;
    nonCompeteClause;
    nonSolicitationClause;
    // Approvals and Signatures
    legalReviewCompleted;
    legalReviewDate;
    legalReviewer;
    approvedBy;
    approvalDate;
    signedDate;
    partyASignatureDate;
    partyBSignatureDate;
    witness1Name;
    witness2Name;
    // Amendments and Variations
    amendmentCount;
    lastAmendmentDate;
    amendmentHistory;
    // Performance Tracking
    complianceScore;
    performanceScore;
    disputesCount;
    breachesCount;
    claimsRaised;
    claimsSettled;
    // Alerts and Notifications
    expiryAlertSent;
    expiryAlertDate;
    renewalAlertSent;
    renewalAlertDate;
    // Document Management
    originalDocumentUrl;
    signedDocumentUrl;
    supportingDocuments;
    documentVersion;
    // Additional Information
    notes;
    internalNotes;
    tags;
    isActive;
    isTemplate;
    parentContractId; // For amendments or renewals
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
    calculateFields() {
        // Calculate duration in months
        if (this.effectiveDate && this.expiryDate) {
            const months = (this.expiryDate.getFullYear() - this.effectiveDate.getFullYear()) * 12
                + (this.expiryDate.getMonth() - this.effectiveDate.getMonth());
            this.durationMonths = months;
        }
        // Set next renewal date
        if (this.renewable && this.expiryDate) {
            const renewalNoticeDate = new Date(this.expiryDate);
            renewalNoticeDate.setDate(renewalNoticeDate.getDate() - this.renewalNoticeDays);
            this.nextRenewalDate = renewalNoticeDate;
        }
        // Update status based on dates
        const today = new Date();
        if (this.expiryDate && this.expiryDate < today && this.status === ContractStatus.ACTIVE) {
            this.status = ContractStatus.EXPIRED;
        }
        // Generate contract number if not exists
        if (!this.contractNumber) {
            const prefix = this.contractType === ContractType.SUPPLY_AGREEMENT ? 'SA' :
                this.contractType === ContractType.SERVICE_AGREEMENT ? 'SVC' :
                    this.contractType === ContractType.PURCHASE_AGREEMENT ? 'PA' : 'CON';
            this.contractNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
    }
};
exports.Contract = Contract;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Contract.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Contract.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_number', length: 100, unique: true }),
    __metadata("design:type", String)
], Contract.prototype, "contractNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_title', length: 500 }),
    __metadata("design:type", String)
], Contract.prototype, "contractTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_type', type: 'enum', enum: ContractType }),
    __metadata("design:type", String)
], Contract.prototype, "contractType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT }),
    __metadata("design:type", String)
], Contract.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_a_id', length: 50 }),
    __metadata("design:type", String)
], Contract.prototype, "partyAId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_a_name', length: 255 }),
    __metadata("design:type", String)
], Contract.prototype, "partyAName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_a_representative', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "partyARepresentative", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_a_designation', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "partyADesignation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_id', length: 50 }),
    __metadata("design:type", String)
], Contract.prototype, "partyBId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_name', length: 255 }),
    __metadata("design:type", String)
], Contract.prototype, "partyBName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_representative', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "partyBRepresentative", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_designation', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "partyBDesignation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_type', length: 50 }),
    __metadata("design:type", String)
], Contract.prototype, "partyBType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date' }),
    __metadata("design:type", Date)
], Contract.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'date' }),
    __metadata("design:type", Date)
], Contract.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_months', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "durationMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notice_period_days', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], Contract.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_value', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "contractValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], Contract.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', type: 'enum', enum: PaymentTerms, default: PaymentTerms.NET_30 }),
    __metadata("design:type", String)
], Contract.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_frequency', length: 50, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "billingFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'minimum_order_value', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "minimumOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_order_value', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "maximumOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'penalty_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "penaltyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_deposit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "securityDeposit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'products_services', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Contract.prototype, "productsServices", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_terms', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "deliveryTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_specifications', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "qualitySpecifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_commitment', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "volumeCommitment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_adjustment_clause', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "priceAdjustmentClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_npa_approval', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "requiresNpaApproval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_approval_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "npaApprovalNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "npaApprovalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_content_requirement', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "localContentRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_exemption_applicable', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "taxExemptionApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "withholdingTaxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vat_applicable', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Contract.prototype, "vatApplicable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stamp_duty_paid', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "stampDutyPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stamp_duty_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "stampDutyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sla_defined', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "slaDefined", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uptime_requirement', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "uptimeRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_time_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "responseTimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_time_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "resolutionTimeHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_bond_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "performanceBondRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_bond_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "performanceBondAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kpi_metrics', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Contract.prototype, "kpiMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "insuranceRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'liability_cap', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "liabilityCap", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'indemnification_clause', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "indemnificationClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'force_majeure_clause', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "forceMajeureClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_clause', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "terminationClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'early_termination_allowed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "earlyTerminationAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'early_termination_penalty', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "earlyTerminationPenalty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_notice_required', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Contract.prototype, "terminationNoticeRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "terminationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewable', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "renewable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_type', type: 'enum', enum: RenewalType, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "renewalType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_notice_days', type: 'int', default: 60 }),
    __metadata("design:type", Number)
], Contract.prototype, "renewalNoticeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_renewals', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "maxRenewals", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "renewalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_renewal_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "lastRenewalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_renewal_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "nextRenewalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'governing_law', length: 100, default: 'Laws of Ghana' }),
    __metadata("design:type", String)
], Contract.prototype, "governingLaw", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dispute_resolution', length: 100, default: 'Arbitration' }),
    __metadata("design:type", String)
], Contract.prototype, "disputeResolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'arbitration_venue', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "arbitrationVenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidentiality_clause', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Contract.prototype, "confidentialityClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_compete_clause', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "nonCompeteClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'non_solicitation_clause', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "nonSolicitationClause", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_review_completed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "legalReviewCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_review_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "legalReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'legal_reviewer', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "legalReviewer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "signedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_a_signature_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "partyASignatureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_b_signature_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "partyBSignatureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'witness_1_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "witness1Name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'witness_2_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "witness2Name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amendment_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "amendmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_amendment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "lastAmendmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amendment_history', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Contract.prototype, "amendmentHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_score', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], Contract.prototype, "complianceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_score', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], Contract.prototype, "performanceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disputes_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "disputesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'breaches_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "breachesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'claims_raised', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "claimsRaised", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'claims_settled', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contract.prototype, "claimsSettled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_alert_sent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "expiryAlertSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_alert_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "expiryAlertDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_alert_sent', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "renewalAlertSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'renewal_alert_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "renewalAlertDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "originalDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signed_document_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "signedDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Contract.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_version', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Contract.prototype, "documentVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Contract.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Contract.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_template', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Contract.prototype, "isTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_contract_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "parentContractId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Contract.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Contract.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Contract.prototype, "calculateFields", null);
exports.Contract = Contract = __decorate([
    (0, typeorm_1.Entity)('contracts'),
    (0, typeorm_1.Index)(['tenantId', 'contractNumber'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'expiryDate']),
    (0, typeorm_1.Index)(['tenantId', 'contractType'])
], Contract);
//# sourceMappingURL=contract.entity.js.map