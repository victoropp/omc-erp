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
exports.UPPFEntities = exports.GPSTrace = exports.EqualisationPoint = exports.UPPFSettlement = exports.ThreeWayReconciliation = exports.ClaimAuditEntry = exports.ClaimAnomaly = exports.UPPFClaim = exports.SettlementStatus = exports.ReconciliationStatus = exports.AnomalySeverity = exports.AnomalyType = exports.ProductType = exports.AutomationLevel = exports.ClaimPriority = exports.UPPFClaimStatus = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// Enums for UPPF system
var UPPFClaimStatus;
(function (UPPFClaimStatus) {
    UPPFClaimStatus["DRAFT"] = "draft";
    UPPFClaimStatus["READY_TO_SUBMIT"] = "ready_to_submit";
    UPPFClaimStatus["SUBMITTED"] = "submitted";
    UPPFClaimStatus["UNDER_REVIEW"] = "under_review";
    UPPFClaimStatus["APPROVED"] = "approved";
    UPPFClaimStatus["SETTLED"] = "settled";
    UPPFClaimStatus["REJECTED"] = "rejected";
    UPPFClaimStatus["CANCELLED"] = "cancelled";
})(UPPFClaimStatus || (exports.UPPFClaimStatus = UPPFClaimStatus = {}));
var ClaimPriority;
(function (ClaimPriority) {
    ClaimPriority["LOW"] = "low";
    ClaimPriority["MEDIUM"] = "medium";
    ClaimPriority["HIGH"] = "high";
    ClaimPriority["URGENT"] = "urgent";
    ClaimPriority["CRITICAL"] = "critical";
})(ClaimPriority || (exports.ClaimPriority = ClaimPriority = {}));
var AutomationLevel;
(function (AutomationLevel) {
    AutomationLevel["FULL"] = "full";
    AutomationLevel["PARTIAL"] = "partial";
    AutomationLevel["MANUAL"] = "manual";
})(AutomationLevel || (exports.AutomationLevel = AutomationLevel = {}));
var ProductType;
(function (ProductType) {
    ProductType["PMS"] = "PMS";
    ProductType["AGO"] = "AGO";
    ProductType["KEROSENE"] = "KEROSENE";
    ProductType["LPG"] = "LPG";
    ProductType["IFO"] = "IFO";
    ProductType["LUBRICANTS"] = "LUBRICANTS";
})(ProductType || (exports.ProductType = ProductType = {}));
var AnomalyType;
(function (AnomalyType) {
    AnomalyType["GPS_DEVIATION"] = "GPS_DEVIATION";
    AnomalyType["VOLUME_VARIANCE"] = "VOLUME_VARIANCE";
    AnomalyType["TIME_ANOMALY"] = "TIME_ANOMALY";
    AnomalyType["ROUTE_CHANGE"] = "ROUTE_CHANGE";
    AnomalyType["DOCUMENTATION_ISSUE"] = "DOCUMENTATION_ISSUE";
    AnomalyType["FUEL_LOSS"] = "FUEL_LOSS";
    AnomalyType["SPEED_VIOLATION"] = "SPEED_VIOLATION";
    AnomalyType["GEOFENCE_VIOLATION"] = "GEOFENCE_VIOLATION";
})(AnomalyType || (exports.AnomalyType = AnomalyType = {}));
var AnomalySeverity;
(function (AnomalySeverity) {
    AnomalySeverity["LOW"] = "low";
    AnomalySeverity["MEDIUM"] = "medium";
    AnomalySeverity["HIGH"] = "high";
    AnomalySeverity["CRITICAL"] = "critical";
})(AnomalySeverity || (exports.AnomalySeverity = AnomalySeverity = {}));
var ReconciliationStatus;
(function (ReconciliationStatus) {
    ReconciliationStatus["PENDING"] = "pending";
    ReconciliationStatus["MATCHED"] = "matched";
    ReconciliationStatus["VARIANCE_DETECTED"] = "variance_detected";
    ReconciliationStatus["DISPUTED"] = "disputed";
    ReconciliationStatus["RESOLVED"] = "resolved";
})(ReconciliationStatus || (exports.ReconciliationStatus = ReconciliationStatus = {}));
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "pending";
    SettlementStatus["PROCESSING"] = "processing";
    SettlementStatus["COMPLETED"] = "completed";
    SettlementStatus["FAILED"] = "failed";
    SettlementStatus["PARTIALLY_SETTLED"] = "partially_settled";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
// Core UPPF Claim Entity
let UPPFClaim = class UPPFClaim {
    id;
    claimNumber;
    windowId;
    consignmentId;
    dealerId;
    dealerName;
    routeId;
    routeName;
    depotId;
    depotName;
    stationId;
    stationName;
    productType;
    volumeLitres;
    kmActual;
    kmPlanned;
    equalisationKm;
    kmBeyondEqualisation;
    tariffPerLitreKm;
    baseClaimAmount;
    routeEfficiencyBonus;
    complianceBonus;
    totalClaimAmount;
    status;
    priority;
    qualityScore;
    riskScore;
    gpsConfidence;
    evidenceScore;
    automationLevel;
    gpsValidated;
    threeWayReconciled;
    blockchainVerified;
    aiValidated;
    blockchainHash;
    evidenceLinks;
    metadata;
    submissionDate;
    approvalDate;
    settlementDate;
    processingDays;
    settlementAmount;
    varianceAmount;
    varianceReason;
    submissionRef;
    npaResponseRef;
    notes;
    createdBy;
    lastModifiedBy;
    createdAt;
    updatedAt;
    // Relationships
    anomalies;
    auditTrail;
    settlement;
    settlementId;
    // Calculated fields
    get efficiencyRating() {
        if (this.qualityScore >= 95)
            return 'EXCELLENT';
        if (this.qualityScore >= 85)
            return 'GOOD';
        if (this.qualityScore >= 70)
            return 'AVERAGE';
        if (this.qualityScore >= 50)
            return 'POOR';
        return 'CRITICAL';
    }
    get riskRating() {
        if (this.riskScore <= 10)
            return 'LOW';
        if (this.riskScore <= 30)
            return 'MEDIUM';
        if (this.riskScore <= 60)
            return 'HIGH';
        return 'CRITICAL';
    }
    get isHighValue() {
        return this.totalClaimAmount > 50000;
    }
    get hasAnomalies() {
        return this.anomalies && this.anomalies.length > 0;
    }
    get totalBonuses() {
        return Number(this.routeEfficiencyBonus) + Number(this.complianceBonus);
    }
    // Lifecycle hooks
    validateAndCalculate() {
        // Calculate total claim amount
        this.totalClaimAmount = Number(this.baseClaimAmount) + Number(this.routeEfficiencyBonus) + Number(this.complianceBonus);
        // Calculate processing days if applicable
        if (this.settlementDate && this.submissionDate) {
            this.processingDays = Math.floor((this.settlementDate.getTime() - this.submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        // Calculate variance amount if settled
        if (this.settlementAmount && this.totalClaimAmount) {
            this.varianceAmount = Number(this.settlementAmount) - Number(this.totalClaimAmount);
        }
    }
};
exports.UPPFClaim = UPPFClaim;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UPPFClaim.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "claimNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "windowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "consignmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "dealerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "dealerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "routeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "routeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "depotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "depotName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "stationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProductType }),
    (0, class_validator_1.IsEnum)(ProductType),
    __metadata("design:type", String)
], UPPFClaim.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "volumeLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "kmActual", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "kmPlanned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "equalisationKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "kmBeyondEqualisation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 6 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "tariffPerLitreKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "baseClaimAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "routeEfficiencyBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "complianceBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "totalClaimAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: UPPFClaimStatus, default: UPPFClaimStatus.DRAFT }),
    (0, class_validator_1.IsEnum)(UPPFClaimStatus),
    __metadata("design:type", String)
], UPPFClaim.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ClaimPriority, default: ClaimPriority.MEDIUM }),
    (0, class_validator_1.IsEnum)(ClaimPriority),
    __metadata("design:type", String)
], UPPFClaim.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "gpsConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "evidenceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AutomationLevel, default: AutomationLevel.MANUAL }),
    (0, class_validator_1.IsEnum)(AutomationLevel),
    __metadata("design:type", String)
], UPPFClaim.prototype, "automationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UPPFClaim.prototype, "gpsValidated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UPPFClaim.prototype, "threeWayReconciled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UPPFClaim.prototype, "blockchainVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UPPFClaim.prototype, "aiValidated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "blockchainHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UPPFClaim.prototype, "evidenceLinks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UPPFClaim.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UPPFClaim.prototype, "submissionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UPPFClaim.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UPPFClaim.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "processingDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "settlementAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UPPFClaim.prototype, "varianceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "varianceReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "submissionRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "npaResponseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFClaim.prototype, "lastModifiedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UPPFClaim.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UPPFClaim.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ClaimAnomaly, anomaly => anomaly.claim, { cascade: true }),
    __metadata("design:type", Array)
], UPPFClaim.prototype, "anomalies", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ClaimAuditEntry, auditEntry => auditEntry.claim, { cascade: true }),
    __metadata("design:type", Array)
], UPPFClaim.prototype, "auditTrail", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UPPFSettlement, settlement => settlement.claims, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", UPPFSettlement)
], UPPFClaim.prototype, "settlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UPPFClaim.prototype, "settlementId", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UPPFClaim.prototype, "validateAndCalculate", null);
exports.UPPFClaim = UPPFClaim = __decorate([
    (0, typeorm_1.Entity)('uppf_claims'),
    (0, typeorm_1.Index)(['windowId', 'status']),
    (0, typeorm_1.Index)(['dealerId', 'createdAt']),
    (0, typeorm_1.Index)(['claimNumber'], { unique: true }),
    (0, typeorm_1.Index)(['status', 'submissionDate'])
], UPPFClaim);
// Claim Anomaly Entity
let ClaimAnomaly = class ClaimAnomaly {
    id;
    claimId;
    type;
    severity;
    description;
    location;
    evidence;
    resolved;
    resolution;
    resolvedAt;
    resolvedBy;
    correctionSuggestion;
    impactScore;
    detectedAt;
    updatedAt;
    // Relationships
    claim;
};
exports.ClaimAnomaly = ClaimAnomaly;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "claimId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AnomalyType }),
    (0, class_validator_1.IsEnum)(AnomalyType),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AnomalySeverity }),
    (0, class_validator_1.IsEnum)(AnomalySeverity),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ClaimAnomaly.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ClaimAnomaly.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ClaimAnomaly.prototype, "resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ClaimAnomaly.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAnomaly.prototype, "correctionSuggestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ClaimAnomaly.prototype, "impactScore", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClaimAnomaly.prototype, "detectedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ClaimAnomaly.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UPPFClaim, claim => claim.anomalies, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'claim_id' }),
    __metadata("design:type", UPPFClaim)
], ClaimAnomaly.prototype, "claim", void 0);
exports.ClaimAnomaly = ClaimAnomaly = __decorate([
    (0, typeorm_1.Entity)('claim_anomalies'),
    (0, typeorm_1.Index)(['claimId', 'type']),
    (0, typeorm_1.Index)(['severity', 'resolved'])
], ClaimAnomaly);
// Claim Audit Entry Entity
let ClaimAuditEntry = class ClaimAuditEntry {
    id;
    claimId;
    action;
    user;
    details;
    oldValue;
    newValue;
    ipAddress;
    userAgent;
    timestamp;
    // Relationships
    claim;
};
exports.ClaimAuditEntry = ClaimAuditEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "claimId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ClaimAuditEntry.prototype, "oldValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ClaimAuditEntry.prototype, "newValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'inet', nullable: true }),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimAuditEntry.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClaimAuditEntry.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UPPFClaim, claim => claim.auditTrail, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'claim_id' }),
    __metadata("design:type", UPPFClaim)
], ClaimAuditEntry.prototype, "claim", void 0);
exports.ClaimAuditEntry = ClaimAuditEntry = __decorate([
    (0, typeorm_1.Entity)('claim_audit_entries'),
    (0, typeorm_1.Index)(['claimId', 'timestamp']),
    (0, typeorm_1.Index)(['action', 'user'])
], ClaimAuditEntry);
// Three-Way Reconciliation Entity
let ThreeWayReconciliation = class ThreeWayReconciliation {
    id;
    consignmentId;
    depotLoadedLitres;
    depotDocumentRef;
    transporterDeliveredLitres;
    transporterDocumentRef;
    stationReceivedLitres;
    stationDocumentRef;
    varianceDepotTransporter;
    varianceTransporterStation;
    varianceDepotStation;
    toleranceApplied;
    routeComplexityFactor;
    productVolatilityFactor;
    reconciliationStatus;
    confidence;
    riskScore;
    aiAnomalies;
    blockchainHash;
    aiValidated;
    aiInsights;
    reconciledBy;
    reconciledAt;
    notes;
    createdAt;
    updatedAt;
    // Calculated properties
    get isWithinTolerance() {
        const variancePercentage = Math.abs(this.varianceDepotStation) / this.depotLoadedLitres;
        return variancePercentage <= this.toleranceApplied;
    }
    get variancePercentage() {
        return (Math.abs(this.varianceDepotStation) / this.depotLoadedLitres) * 100;
    }
    get isHighRisk() {
        return this.riskScore > 70 || !this.isWithinTolerance;
    }
};
exports.ThreeWayReconciliation = ThreeWayReconciliation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "consignmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "depotLoadedLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "depotDocumentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "transporterDeliveredLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "transporterDocumentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "stationReceivedLitres", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "stationDocumentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "varianceDepotTransporter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "varianceTransporterStation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "varianceDepotStation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, default: 0.02 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "toleranceApplied", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "routeComplexityFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "productVolatilityFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.PENDING }),
    (0, class_validator_1.IsEnum)(ReconciliationStatus),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "reconciliationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ThreeWayReconciliation.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], ThreeWayReconciliation.prototype, "aiAnomalies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "blockchainHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ThreeWayReconciliation.prototype, "aiValidated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ThreeWayReconciliation.prototype, "aiInsights", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "reconciledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ThreeWayReconciliation.prototype, "reconciledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThreeWayReconciliation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ThreeWayReconciliation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ThreeWayReconciliation.prototype, "updatedAt", void 0);
exports.ThreeWayReconciliation = ThreeWayReconciliation = __decorate([
    (0, typeorm_1.Entity)('three_way_reconciliations'),
    (0, typeorm_1.Index)(['consignmentId'], { unique: true }),
    (0, typeorm_1.Index)(['reconciliationStatus', 'createdAt'])
], ThreeWayReconciliation);
// UPPF Settlement Entity
let UPPFSettlement = class UPPFSettlement {
    id;
    settlementId;
    windowId;
    totalClaims;
    totalClaimAmount;
    totalSettledAmount;
    npaPenalties;
    performanceBonuses;
    netSettlement;
    status;
    settlementDate;
    varianceAnalysis;
    performanceMetrics;
    npaSubmissionRef;
    paymentReference;
    bankTransactionRef;
    processedBy;
    notes;
    createdAt;
    updatedAt;
    // Relationships
    claims;
    // Calculated properties
    get settlementEfficiency() {
        return this.totalClaimAmount > 0 ? (this.totalSettledAmount / this.totalClaimAmount) * 100 : 0;
    }
    get hasVariances() {
        return this.varianceAnalysis && this.varianceAnalysis.length > 0;
    }
    get totalVarianceAmount() {
        return this.totalClaimAmount - this.totalSettledAmount;
    }
    get isCompleted() {
        return this.status === SettlementStatus.COMPLETED;
    }
};
exports.UPPFSettlement = UPPFSettlement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "settlementId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "windowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "totalClaims", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "totalClaimAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "totalSettledAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "npaPenalties", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "performanceBonuses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UPPFSettlement.prototype, "netSettlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING }),
    (0, class_validator_1.IsEnum)(SettlementStatus),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UPPFSettlement.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], UPPFSettlement.prototype, "varianceAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], UPPFSettlement.prototype, "performanceMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "npaSubmissionRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "bankTransactionRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UPPFSettlement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UPPFSettlement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UPPFSettlement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UPPFClaim, claim => claim.settlement),
    __metadata("design:type", Array)
], UPPFSettlement.prototype, "claims", void 0);
exports.UPPFSettlement = UPPFSettlement = __decorate([
    (0, typeorm_1.Entity)('uppf_settlements'),
    (0, typeorm_1.Index)(['windowId'], { unique: true }),
    (0, typeorm_1.Index)(['status', 'settlementDate'])
], UPPFSettlement);
// Equalisation Points Entity
let EqualisationPoint = class EqualisationPoint {
    id;
    routeId;
    depotId;
    depotName;
    stationId;
    stationName;
    routeName;
    kmThreshold;
    regionId;
    regionName;
    roadCategory;
    trafficFactor;
    complexityFactor;
    routeConditions;
    isActive;
    effectiveDate;
    expiryDate;
    createdBy;
    lastModifiedBy;
    createdAt;
    updatedAt;
    // Calculated properties
    get adjustedThreshold() {
        return this.kmThreshold * this.trafficFactor * this.complexityFactor;
    }
    get isExpired() {
        return this.expiryDate ? new Date() > this.expiryDate : false;
    }
    get isCurrentlyActive() {
        return this.isActive && !this.isExpired && new Date() >= this.effectiveDate;
    }
};
exports.EqualisationPoint = EqualisationPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "routeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "depotId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "depotName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "stationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "routeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EqualisationPoint.prototype, "kmThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "regionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "regionName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "roadCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EqualisationPoint.prototype, "trafficFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 1.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EqualisationPoint.prototype, "complexityFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], EqualisationPoint.prototype, "routeConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EqualisationPoint.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], EqualisationPoint.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], EqualisationPoint.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EqualisationPoint.prototype, "lastModifiedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EqualisationPoint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EqualisationPoint.prototype, "updatedAt", void 0);
exports.EqualisationPoint = EqualisationPoint = __decorate([
    (0, typeorm_1.Entity)('equalisation_points'),
    (0, typeorm_1.Index)(['routeId'], { unique: true }),
    (0, typeorm_1.Index)(['regionId', 'isActive'])
], EqualisationPoint);
// GPS Trace Entity
let GPSTrace = class GPSTrace {
    id;
    consignmentId;
    vehicleId;
    driverId;
    startTime;
    endTime;
    totalKm;
    plannedKm;
    averageSpeed;
    maxSpeed;
    stopCount;
    stopDurationMinutes;
    speedViolations;
    unexpectedStops;
    confidence;
    routeEfficiency;
    routePolyline;
    gpsPoints;
    anomalies;
    fuelAnalysis;
    timeAnalysis;
    validated;
    aiAnalyzed;
    validatedBy;
    validatedAt;
    createdAt;
    updatedAt;
    // Calculated properties
    get deviationPercentage() {
        return this.plannedKm > 0 ? Math.abs(this.totalKm - this.plannedKm) / this.plannedKm * 100 : 0;
    }
    get hasAnomalies() {
        return this.anomalies && this.anomalies.length > 0;
    }
    get durationHours() {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    }
    get isHighConfidence() {
        return this.confidence >= 85;
    }
    get isEfficient() {
        return this.routeEfficiency >= 80 && this.deviationPercentage <= 10;
    }
};
exports.GPSTrace = GPSTrace;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GPSTrace.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSTrace.prototype, "consignmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSTrace.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSTrace.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GPSTrace.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GPSTrace.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "totalKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "plannedKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "averageSpeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "maxSpeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "stopCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "stopDurationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "speedViolations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GPSTrace.prototype, "unexpectedStops", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GPSTrace.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GPSTrace.prototype, "routeEfficiency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSTrace.prototype, "routePolyline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GPSTrace.prototype, "gpsPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GPSTrace.prototype, "anomalies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GPSTrace.prototype, "fuelAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GPSTrace.prototype, "timeAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GPSTrace.prototype, "validated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GPSTrace.prototype, "aiAnalyzed", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSTrace.prototype, "validatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GPSTrace.prototype, "validatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GPSTrace.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GPSTrace.prototype, "updatedAt", void 0);
exports.GPSTrace = GPSTrace = __decorate([
    (0, typeorm_1.Entity)('gps_traces'),
    (0, typeorm_1.Index)(['consignmentId'], { unique: true }),
    (0, typeorm_1.Index)(['vehicleId', 'startTime'])
], GPSTrace);
// Export all entities
exports.UPPFEntities = [
    UPPFClaim,
    ClaimAnomaly,
    ClaimAuditEntry,
    ThreeWayReconciliation,
    UPPFSettlement,
    EqualisationPoint,
    GPSTrace,
];
//# sourceMappingURL=uppf-entities.js.map