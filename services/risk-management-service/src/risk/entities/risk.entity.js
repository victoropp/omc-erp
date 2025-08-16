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
exports.Risk = exports.RiskTrend = exports.RiskLevel = exports.RiskImpact = exports.RiskLikelihood = exports.RiskStatus = exports.RiskCategory = void 0;
const typeorm_1 = require("typeorm");
var RiskCategory;
(function (RiskCategory) {
    RiskCategory["OPERATIONAL"] = "OPERATIONAL";
    RiskCategory["FINANCIAL"] = "FINANCIAL";
    RiskCategory["STRATEGIC"] = "STRATEGIC";
    RiskCategory["COMPLIANCE"] = "COMPLIANCE";
    RiskCategory["REPUTATIONAL"] = "REPUTATIONAL";
    RiskCategory["ENVIRONMENTAL"] = "ENVIRONMENTAL";
    RiskCategory["SAFETY"] = "SAFETY";
    RiskCategory["CYBER_SECURITY"] = "CYBER_SECURITY";
    RiskCategory["MARKET"] = "MARKET";
    RiskCategory["CREDIT"] = "CREDIT";
    RiskCategory["LIQUIDITY"] = "LIQUIDITY";
    RiskCategory["FOREIGN_EXCHANGE"] = "FOREIGN_EXCHANGE";
})(RiskCategory || (exports.RiskCategory = RiskCategory = {}));
var RiskStatus;
(function (RiskStatus) {
    RiskStatus["IDENTIFIED"] = "IDENTIFIED";
    RiskStatus["ASSESSED"] = "ASSESSED";
    RiskStatus["MITIGATED"] = "MITIGATED";
    RiskStatus["ACCEPTED"] = "ACCEPTED";
    RiskStatus["TRANSFERRED"] = "TRANSFERRED";
    RiskStatus["AVOIDED"] = "AVOIDED";
    RiskStatus["MONITORING"] = "MONITORING";
    RiskStatus["CLOSED"] = "CLOSED";
    RiskStatus["ESCALATED"] = "ESCALATED";
})(RiskStatus || (exports.RiskStatus = RiskStatus = {}));
var RiskLikelihood;
(function (RiskLikelihood) {
    RiskLikelihood["RARE"] = "RARE";
    RiskLikelihood["UNLIKELY"] = "UNLIKELY";
    RiskLikelihood["POSSIBLE"] = "POSSIBLE";
    RiskLikelihood["LIKELY"] = "LIKELY";
    RiskLikelihood["ALMOST_CERTAIN"] = "ALMOST_CERTAIN";
})(RiskLikelihood || (exports.RiskLikelihood = RiskLikelihood = {}));
var RiskImpact;
(function (RiskImpact) {
    RiskImpact["NEGLIGIBLE"] = "NEGLIGIBLE";
    RiskImpact["MINOR"] = "MINOR";
    RiskImpact["MODERATE"] = "MODERATE";
    RiskImpact["MAJOR"] = "MAJOR";
    RiskImpact["CATASTROPHIC"] = "CATASTROPHIC";
})(RiskImpact || (exports.RiskImpact = RiskImpact = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RiskTrend;
(function (RiskTrend) {
    RiskTrend["INCREASING"] = "INCREASING";
    RiskTrend["STABLE"] = "STABLE";
    RiskTrend["DECREASING"] = "DECREASING";
    RiskTrend["VOLATILE"] = "VOLATILE";
})(RiskTrend || (exports.RiskTrend = RiskTrend = {}));
let Risk = class Risk {
    id;
    tenantId;
    riskCode;
    riskTitle;
    riskDescription;
    // Risk Classification
    category;
    subCategory;
    status;
    riskType; // Specific type within category
    // Risk Assessment
    likelihood;
    likelihoodScore; // 1-5
    impact;
    impactScore; // 1-5
    inherentRiskScore; // likelihood * impact (1-25)
    inherentRiskLevel;
    residualLikelihood;
    residualImpact;
    residualRiskScore;
    residualRiskLevel;
    riskAppetite;
    riskTolerance; // Financial tolerance amount
    // Risk Metrics
    riskVelocity; // SLOW, MEDIUM, FAST - How quickly risk impacts
    riskTrend;
    detectionDifficulty; // EASY, MODERATE, DIFFICULT
    controlEffectiveness; // 0-100%
    // Financial Impact
    potentialLossAmount;
    actualLossAmount;
    mitigationCost;
    currency;
    probabilityPercentage; // Statistical probability
    // Risk Source and Triggers
    riskSource;
    riskTriggers;
    earlyWarningIndicators;
    affectedDepartments;
    affectedProcesses;
    affectedSystems;
    // Ghana Specific Risks
    regulatoryBody; // NPA, EPA, GRA, BOG, etc.
    regulatoryRequirement;
    complianceDeadline;
    politicalRiskFactor;
    forexExposure;
    petroleumPriceSensitivity; // Percentage impact per dollar change
    // Risk Ownership
    riskOwnerId;
    riskOwnerName;
    riskOwnerDepartment;
    riskChampionId;
    riskChampionName;
    escalationContact;
    // Risk Response and Mitigation
    mitigationStrategy;
    mitigationActions;
    controlMeasures;
    contingencyPlan;
    recoveryPlan;
    insuranceCoverage;
    insurancePolicyNumber;
    insuranceCoverageAmount;
    // Risk Timeline
    identificationDate;
    assessmentDate;
    mitigationStartDate;
    mitigationTargetDate;
    mitigationCompletionDate;
    lastReviewDate;
    nextReviewDate;
    closureDate;
    // Risk Monitoring
    monitoringFrequency; // DAILY, WEEKLY, MONTHLY, QUARTERLY
    kriMetrics; // Key Risk Indicators
    kriThresholdBreached;
    incidentsCount;
    nearMissesCount;
    lastIncidentDate;
    // Risk Reporting
    boardReportable;
    regulatoryReportable;
    reportedToBoardDate;
    reportedToRegulatorDate;
    externalAuditFinding;
    internalAuditFinding;
    // Risk Interconnections
    relatedRisks; // Risk IDs
    parentRiskId;
    causesRisks; // Downstream risk IDs
    causedByRisks; // Upstream risk IDs
    // Documentation and Evidence
    riskRegisterEntry;
    supportingDocuments;
    assessmentMethodology;
    dataSources;
    // Risk Scoring History
    scoreHistory;
    assessmentHistory;
    // Additional Information
    businessImpactAnalysis;
    stakeholderImpact;
    lessonsLearned;
    notes;
    tags;
    isActive;
    isCritical;
    requiresImmediateAction;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Calculated fields
    calculateFields() {
        // Calculate likelihood and impact scores
        const likelihoodMap = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
        const impactMap = { NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };
        this.likelihoodScore = likelihoodMap[this.likelihood] || 1;
        this.impactScore = impactMap[this.impact] || 1;
        // Calculate inherent risk score
        this.inherentRiskScore = this.likelihoodScore * this.impactScore;
        // Determine inherent risk level
        if (this.inherentRiskScore <= 4) {
            this.inherentRiskLevel = RiskLevel.LOW;
        }
        else if (this.inherentRiskScore <= 9) {
            this.inherentRiskLevel = RiskLevel.MEDIUM;
        }
        else if (this.inherentRiskScore <= 16) {
            this.inherentRiskLevel = RiskLevel.HIGH;
        }
        else {
            this.inherentRiskLevel = RiskLevel.CRITICAL;
        }
        // Calculate residual risk if applicable
        if (this.residualLikelihood && this.residualImpact) {
            const residualLikelihoodScore = likelihoodMap[this.residualLikelihood] || 1;
            const residualImpactScore = impactMap[this.residualImpact] || 1;
            this.residualRiskScore = residualLikelihoodScore * residualImpactScore;
            // Determine residual risk level
            if (this.residualRiskScore <= 4) {
                this.residualRiskLevel = RiskLevel.LOW;
            }
            else if (this.residualRiskScore <= 9) {
                this.residualRiskLevel = RiskLevel.MEDIUM;
            }
            else if (this.residualRiskScore <= 16) {
                this.residualRiskLevel = RiskLevel.HIGH;
            }
            else {
                this.residualRiskLevel = RiskLevel.CRITICAL;
            }
        }
        // Set critical flag
        this.isCritical = this.inherentRiskLevel === RiskLevel.CRITICAL;
        this.requiresImmediateAction = this.isCritical || this.inherentRiskLevel === RiskLevel.HIGH;
        // Set board reportable
        this.boardReportable = this.inherentRiskLevel === RiskLevel.CRITICAL ||
            this.inherentRiskLevel === RiskLevel.HIGH;
        // Generate risk code if not exists
        if (!this.riskCode) {
            const categoryPrefix = {
                OPERATIONAL: 'OPR',
                FINANCIAL: 'FIN',
                STRATEGIC: 'STR',
                COMPLIANCE: 'COM',
                REPUTATIONAL: 'REP',
                ENVIRONMENTAL: 'ENV',
                SAFETY: 'SAF',
                CYBER_SECURITY: 'CYB',
                MARKET: 'MKT',
                CREDIT: 'CRD',
                LIQUIDITY: 'LIQ',
                FOREIGN_EXCHANGE: 'FEX',
            };
            const prefix = categoryPrefix[this.category] || 'RSK';
            this.riskCode = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        }
    }
};
exports.Risk = Risk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Risk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', length: 50 }),
    __metadata("design:type", String)
], Risk.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_code', length: 50, unique: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_title', length: 500 }),
    __metadata("design:type", String)
], Risk.prototype, "riskTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_description', type: 'text' }),
    __metadata("design:type", String)
], Risk.prototype, "riskDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', type: 'enum', enum: RiskCategory }),
    __metadata("design:type", String)
], Risk.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_category', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: RiskStatus, default: RiskStatus.IDENTIFIED }),
    __metadata("design:type", String)
], Risk.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likelihood', type: 'enum', enum: RiskLikelihood }),
    __metadata("design:type", String)
], Risk.prototype, "likelihood", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likelihood_score', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Risk.prototype, "likelihoodScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact', type: 'enum', enum: RiskImpact }),
    __metadata("design:type", String)
], Risk.prototype, "impact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impact_score', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Risk.prototype, "impactScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inherent_risk_score', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Risk.prototype, "inherentRiskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inherent_risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW }),
    __metadata("design:type", String)
], Risk.prototype, "inherentRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residual_likelihood', type: 'enum', enum: RiskLikelihood, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "residualLikelihood", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residual_impact', type: 'enum', enum: RiskImpact, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "residualImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residual_risk_score', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "residualRiskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residual_risk_level', type: 'enum', enum: RiskLevel, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "residualRiskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_appetite', type: 'enum', enum: RiskLevel, default: RiskLevel.MEDIUM }),
    __metadata("design:type", String)
], Risk.prototype, "riskAppetite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_tolerance', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "riskTolerance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_velocity', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskVelocity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_trend', type: 'enum', enum: RiskTrend, default: RiskTrend.STABLE }),
    __metadata("design:type", String)
], Risk.prototype, "riskTrend", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detection_difficulty', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "detectionDifficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'control_effectiveness', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Risk.prototype, "controlEffectiveness", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'potential_loss_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "potentialLossAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_loss_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Risk.prototype, "actualLossAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_cost', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Risk.prototype, "mitigationCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], Risk.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'probability_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "probabilityPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_source', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_triggers', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "riskTriggers", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'early_warning_indicators', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "earlyWarningIndicators", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_departments', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "affectedDepartments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_processes', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "affectedProcesses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_systems', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "affectedSystems", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_body', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "regulatoryBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_requirement', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "regulatoryRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compliance_deadline', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "complianceDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'political_risk_factor', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "politicalRiskFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'forex_exposure', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "forexExposure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_price_sensitivity', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "petroleumPriceSensitivity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_owner_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskOwnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_owner_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskOwnerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_owner_department', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskOwnerDepartment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_champion_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskChampionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_champion_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "riskChampionName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escalation_contact', length: 255, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "escalationContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_strategy', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "mitigationStrategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_actions', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "mitigationActions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'control_measures', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "controlMeasures", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contingency_plan', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "contingencyPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recovery_plan', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "recoveryPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "insuranceCoverage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_policy_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Risk.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'identification_date', type: 'date' }),
    __metadata("design:type", Date)
], Risk.prototype, "identificationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "assessmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "mitigationStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_target_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "mitigationTargetDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mitigation_completion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "mitigationCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_review_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "lastReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_review_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "nextReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closure_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "closureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monitoring_frequency', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "monitoringFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kri_metrics', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "kriMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kri_threshold_breached', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "kriThresholdBreached", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incidents_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Risk.prototype, "incidentsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'near_misses_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Risk.prototype, "nearMissesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_incident_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "lastIncidentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'board_reportable', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "boardReportable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_reportable', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "regulatoryReportable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_to_board_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "reportedToBoardDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_to_regulator_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Risk.prototype, "reportedToRegulatorDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_audit_finding', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "externalAuditFinding", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_audit_finding', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "internalAuditFinding", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_risks', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "relatedRisks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_risk_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "parentRiskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'causes_risks', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "causesRisks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caused_by_risks', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "causedByRisks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_register_entry', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Risk.prototype, "riskRegisterEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_documents', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "supportingDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_methodology', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "assessmentMethodology", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_sources', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "dataSources", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score_history', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "scoreHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assessment_history', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "assessmentHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_impact_analysis', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "businessImpactAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stakeholder_impact', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "stakeholderImpact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lessons_learned', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "lessonsLearned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Risk.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Risk.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_critical', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "isCritical", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_immediate_action', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Risk.prototype, "requiresImmediateAction", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Risk.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Risk.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], Risk.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Risk.prototype, "calculateFields", null);
exports.Risk = Risk = __decorate([
    (0, typeorm_1.Entity)('risks'),
    (0, typeorm_1.Index)(['tenantId', 'riskCode'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'category']),
    (0, typeorm_1.Index)(['tenantId', 'riskLevel'])
], Risk);
//# sourceMappingURL=risk.entity.js.map