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
exports.Audit = exports.AuditOpinion = exports.ControlRating = exports.FindingSeverity = exports.AuditStatus = exports.AuditType = void 0;
const typeorm_1 = require("typeorm");
var AuditType;
(function (AuditType) {
    AuditType["INTERNAL"] = "INTERNAL";
    AuditType["EXTERNAL"] = "EXTERNAL";
    AuditType["REGULATORY"] = "REGULATORY";
    AuditType["FINANCIAL"] = "FINANCIAL";
    AuditType["OPERATIONAL"] = "OPERATIONAL";
    AuditType["COMPLIANCE"] = "COMPLIANCE";
    AuditType["IT_SYSTEMS"] = "IT_SYSTEMS";
    AuditType["QUALITY"] = "QUALITY";
    AuditType["SAFETY"] = "SAFETY";
    AuditType["ENVIRONMENTAL"] = "ENVIRONMENTAL";
    AuditType["SPECIAL_INVESTIGATION"] = "SPECIAL_INVESTIGATION";
    AuditType["FORENSIC"] = "FORENSIC";
})(AuditType || (exports.AuditType = AuditType = {}));
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["PLANNED"] = "PLANNED";
    AuditStatus["IN_PREPARATION"] = "IN_PREPARATION";
    AuditStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AuditStatus["FIELDWORK_COMPLETE"] = "FIELDWORK_COMPLETE";
    AuditStatus["DRAFT_REPORT"] = "DRAFT_REPORT";
    AuditStatus["MANAGEMENT_RESPONSE"] = "MANAGEMENT_RESPONSE";
    AuditStatus["FINAL_REPORT"] = "FINAL_REPORT";
    AuditStatus["CLOSED"] = "CLOSED";
    AuditStatus["FOLLOW_UP"] = "FOLLOW_UP";
    AuditStatus["CANCELLED"] = "CANCELLED";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
var FindingSeverity;
(function (FindingSeverity) {
    FindingSeverity["CRITICAL"] = "CRITICAL";
    FindingSeverity["HIGH"] = "HIGH";
    FindingSeverity["MEDIUM"] = "MEDIUM";
    FindingSeverity["LOW"] = "LOW";
    FindingSeverity["OBSERVATION"] = "OBSERVATION";
})(FindingSeverity || (exports.FindingSeverity = FindingSeverity = {}));
var ControlRating;
(function (ControlRating) {
    ControlRating["EFFECTIVE"] = "EFFECTIVE";
    ControlRating["PARTIALLY_EFFECTIVE"] = "PARTIALLY_EFFECTIVE";
    ControlRating["INEFFECTIVE"] = "INEFFECTIVE";
    ControlRating["NOT_TESTED"] = "NOT_TESTED";
})(ControlRating || (exports.ControlRating = ControlRating = {}));
var AuditOpinion;
(function (AuditOpinion) {
    AuditOpinion["UNQUALIFIED"] = "UNQUALIFIED";
    AuditOpinion["QUALIFIED"] = "QUALIFIED";
    AuditOpinion["ADVERSE"] = "ADVERSE";
    AuditOpinion["DISCLAIMER"] = "DISCLAIMER";
    AuditOpinion["SATISFACTORY"] = "SATISFACTORY";
    AuditOpinion["NEEDS_IMPROVEMENT"] = "NEEDS_IMPROVEMENT";
    AuditOpinion["UNSATISFACTORY"] = "UNSATISFACTORY";
})(AuditOpinion || (exports.AuditOpinion = AuditOpinion = {}));
let Audit = class Audit {
    id;
    tenantId;
    auditNumber;
    auditTitle;
    auditType;
    status;
    // Audit Scope and Objectives
    auditObjective;
    auditScope;
    auditCriteria;
    auditMethodology;
    departmentsCovered;
    processesReviewed;
    systemsReviewed;
    locationsCovered;
    // Audit Period and Timeline
    auditPeriodFrom;
    auditPeriodTo;
    plannedStartDate;
    plannedEndDate;
    actualStartDate;
    actualEndDate;
    fieldworkStartDate;
    fieldworkEndDate;
    reportIssueDate;
    // Audit Team
    leadAuditorId;
    leadAuditorName;
    auditTeamMembers;
    externalAuditorFirm;
    auditPartner;
    auditManager;
    // Budget and Resources
    budgetedHours;
    actualHours;
    budgetedCost;
    actualCost;
    currency;
    // Risk Assessment
    riskAssessmentCompleted;
    inherentRiskLevel;
    controlRiskLevel;
    detectionRiskLevel;
    auditRiskLevel;
    materialityThreshold;
    // Findings Summary
    totalFindings;
    criticalFindings;
    highFindings;
    mediumFindings;
    lowFindings;
    observationsCount;
    recommendationsCount;
    acceptedRecommendations;
    implementedRecommendations;
    // Control Testing
    controlsTested;
    controlsEffective;
    controlsPartiallyEffective;
    controlsIneffective;
    controlEffectivenessRate;
    // Compliance Assessment
    complianceRate;
    regulationsReviewed;
    policiesReviewed;
    complianceViolations;
    // Ghana Specific Compliance
    npaComplianceChecked;
    graComplianceChecked;
    epaComplianceChecked;
    bogComplianceChecked;
    localContentCompliance;
    // Audit Opinion and Rating
    auditOpinion;
    overallRating;
    executiveSummary;
    keyConclusions;
    // Management Response
    managementResponseReceived;
    managementResponseDate;
    managementActionPlan;
    disagreementsWithManagement;
    // Follow-up
    followUpRequired;
    followUpDate;
    followUpStatus;
    issuesResolved;
    issuesOutstanding;
    // Financial Impact
    errorsIdentifiedAmount;
    recoveriesIdentified;
    costSavingsIdentified;
    revenueEnhancementIdentified;
    fraudAmountIdentified;
    // Sampling and Testing
    sampleSize;
    populationSize;
    samplingMethod;
    confidenceLevel;
    errorRate;
    // Documentation
    auditProgramRef;
    workingPapersRef;
    draftReportUrl;
    finalReportUrl;
    managementLetterUrl;
    supportingDocuments;
    // Quality Assurance
    qualityReviewCompleted;
    qualityReviewer;
    qualityReviewDate;
    qualityReviewComments;
    // Reporting
    reportedToBoard;
    boardPresentationDate;
    reportedToRegulator;
    regulatorSubmissionDate;
    publicDisclosureRequired;
    // Additional Information
    previousAuditRef;
    nextAuditDate;
    lessonsLearned;
    bestPracticesIdentified;
    notes;
    tags;
    isActive;
    isConfidential;
    requiresCeoAttention;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
    calculateFields() {
        // Calculate total findings
        this.totalFindings = this.criticalFindings + this.highFindings +
            this.mediumFindings + this.lowFindings + this.observationsCount;
        // Calculate control effectiveness rate
        if (this.controlsTested > 0) {
            this.controlEffectivenessRate = (this.controlsEffective / this.controlsTested) * 100;
        }
        // Calculate error rate
        if (this.sampleSize > 0 && this.errorsIdentifiedAmount > 0) {
            // This would be calculated based on actual errors found
        }
        // Set CEO attention flag
        this.requiresCeoAttention = this.criticalFindings > 0 ||
            this.fraudAmountIdentified > 0 ||
            this.auditOpinion === AuditOpinion.ADVERSE ||
            this.auditOpinion === AuditOpinion.DISCLAIMER;
        // Set board reportable
        this.reportedToBoard = this.requiresCeoAttention ||
            this.highFindings > 3 ||
            this.complianceViolations > 0;
        // Generate audit number if not exists
        if (!this.auditNumber) {
            const typePrefix = {
                INTERNAL: 'INT',
                EXTERNAL: 'EXT',
                REGULATORY: 'REG',
                FINANCIAL: 'FIN',
                OPERATIONAL: 'OPS',
                COMPLIANCE: 'COM',
                IT_SYSTEMS: 'ITS',
                QUALITY: 'QUA',
                SAFETY: 'SAF',
                ENVIRONMENTAL: 'ENV',
                SPECIAL_INVESTIGATION: 'SPI',
                FORENSIC: 'FOR',
            };
            const prefix = typePrefix[this.auditType] || 'AUD';
            this.auditNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        }
    }
};
exports.Audit = Audit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Audit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Audit.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_number', length: 100, unique: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_title', length: 500 }),
    __metadata("design:type", String)
], Audit.prototype, "auditTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_type', type: 'enum', enum: AuditType }),
    __metadata("design:type", String)
], Audit.prototype, "auditType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: AuditStatus, default: AuditStatus.PLANNED }),
    __metadata("design:type", String)
], Audit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_objective', type: 'text' }),
    __metadata("design:type", String)
], Audit.prototype, "auditObjective", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_scope', type: 'text' }),
    __metadata("design:type", String)
], Audit.prototype, "auditScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_criteria', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditCriteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_methodology', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditMethodology", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'departments_covered', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "departmentsCovered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processes_reviewed', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "processesReviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'systems_reviewed', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "systemsReviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locations_covered', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "locationsCovered", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_period_from', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "auditPeriodFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_period_to', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "auditPeriodTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_start_date', type: 'date' }),
    __metadata("design:type", Date)
], Audit.prototype, "plannedStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planned_end_date', type: 'date' }),
    __metadata("design:type", Date)
], Audit.prototype, "plannedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fieldwork_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "fieldworkStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fieldwork_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "fieldworkEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_issue_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "reportIssueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_auditor_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "leadAuditorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_auditor_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "leadAuditorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_team_members', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "auditTeamMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_auditor_firm', length: 255, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "externalAuditorFirm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_partner', length: 255, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditPartner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_manager', length: 255, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budgeted_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "budgetedHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_hours', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "actualHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budgeted_cost', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "budgetedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], Audit.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_assessment_completed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "riskAssessmentCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inherent_risk_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "inherentRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'control_risk_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "controlRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detection_risk_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "detectionRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_risk_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'materiality_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "materialityThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_findings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "totalFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'critical_findings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "criticalFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'high_findings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "highFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medium_findings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "mediumFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'low_findings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "lowFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observations_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "observationsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommendations_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "recommendationsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepted_recommendations', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "acceptedRecommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'implemented_recommendations', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "implementedRecommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'controls_tested', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "controlsTested", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'controls_effective', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "controlsEffective", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'controls_partially_effective', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "controlsPartiallyEffective", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'controls_ineffective', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "controlsIneffective", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'control_effectiveness_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "controlEffectivenessRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "complianceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulations_reviewed', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "regulationsReviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'policies_reviewed', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "policiesReviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_violations', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "complianceViolations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'npa_compliance_checked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "npaComplianceChecked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gra_compliance_checked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "graComplianceChecked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'epa_compliance_checked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "epaComplianceChecked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bog_compliance_checked', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "bogComplianceChecked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_content_compliance', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "localContentCompliance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_opinion', type: 'enum', enum: AuditOpinion, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditOpinion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_rating', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "overallRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'executive_summary', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "executiveSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'key_conclusions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "keyConclusions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_response_received', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "managementResponseReceived", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_response_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "managementResponseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_action_plan', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "managementActionPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disagreements_with_management', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "disagreementsWithManagement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "followUpRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "followUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_status', length: 50, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "followUpStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issues_resolved', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "issuesResolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issues_outstanding', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "issuesOutstanding", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'errors_identified_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "errorsIdentifiedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recoveries_identified', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "recoveriesIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_savings_identified', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "costSavingsIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revenue_enhancement_identified', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "revenueEnhancementIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fraud_amount_identified', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Audit.prototype, "fraudAmountIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sample_size', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "sampleSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'population_size', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "populationSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sampling_method', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "samplingMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "confidenceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Audit.prototype, "errorRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'audit_program_ref', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "auditProgramRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_papers_ref', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "workingPapersRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'draft_report_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "draftReportUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_report_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "finalReportUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'management_letter_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "managementLetterUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_review_completed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "qualityReviewCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_reviewer', length: 255, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "qualityReviewer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_review_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "qualityReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_review_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "qualityReviewComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_to_board', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "reportedToBoard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'board_presentation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "boardPresentationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_to_regulator', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "reportedToRegulator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulator_submission_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "regulatorSubmissionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'public_disclosure_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "publicDisclosureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_audit_ref', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "previousAuditRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_audit_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Audit.prototype, "nextAuditDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lessons_learned', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "lessonsLearned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'best_practices_identified', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "bestPracticesIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Audit.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Audit.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_confidential', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "isConfidential", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_ceo_attention', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Audit.prototype, "requiresCeoAttention", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Audit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Audit.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Audit.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Audit.prototype, "calculateFields", null);
exports.Audit = Audit = __decorate([
    (0, typeorm_1.Entity)('audits'),
    (0, typeorm_1.Index)(['tenantId', 'auditNumber'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'auditType']),
    (0, typeorm_1.Index)(['tenantId', 'startDate'])
], Audit);
//# sourceMappingURL=audit.entity.js.map