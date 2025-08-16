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
exports.PriceBuildupAuditTrail = exports.StationTypePricing = exports.PriceComponent = exports.PriceBuildupVersion = exports.ProductType = exports.StationType = exports.PriceComponentStatus = exports.PriceComponentCategory = exports.PriceComponentType = void 0;
const typeorm_1 = require("typeorm");
var PriceComponentType;
(function (PriceComponentType) {
    // Base Prices
    PriceComponentType["EX_REFINERY_PRICE"] = "EX_REFINERY_PRICE";
    PriceComponentType["LANDED_COST"] = "LANDED_COST";
    // Taxes and Levies
    PriceComponentType["ENERGY_DEBT_RECOVERY_LEVY"] = "ENERGY_DEBT_RECOVERY_LEVY";
    PriceComponentType["ROAD_FUND_LEVY"] = "ROAD_FUND_LEVY";
    PriceComponentType["PRICE_STABILIZATION_LEVY"] = "PRICE_STABILIZATION_LEVY";
    PriceComponentType["SPECIAL_PETROLEUM_TAX"] = "SPECIAL_PETROLEUM_TAX";
    PriceComponentType["FUEL_MARKING_LEVY"] = "FUEL_MARKING_LEVY";
    PriceComponentType["PRIMARY_DISTRIBUTION_MARGIN"] = "PRIMARY_DISTRIBUTION_MARGIN";
    // Margins
    PriceComponentType["BOST_MARGIN"] = "BOST_MARGIN";
    PriceComponentType["UPPF_MARGIN"] = "UPPF_MARGIN";
    PriceComponentType["FUEL_MARKING_MARGIN"] = "FUEL_MARKING_MARGIN";
    PriceComponentType["OMC_MARGIN"] = "OMC_MARGIN";
    PriceComponentType["DEALER_MARGIN"] = "DEALER_MARGIN";
    // Additional Components
    PriceComponentType["TRANSPORT_COST"] = "TRANSPORT_COST";
    PriceComponentType["STORAGE_COST"] = "STORAGE_COST";
    PriceComponentType["INSURANCE_COST"] = "INSURANCE_COST";
    PriceComponentType["ADMINISTRATIVE_COST"] = "ADMINISTRATIVE_COST";
    // Custom Components
    PriceComponentType["CUSTOM_LEVY"] = "CUSTOM_LEVY";
    PriceComponentType["CUSTOM_MARGIN"] = "CUSTOM_MARGIN";
})(PriceComponentType || (exports.PriceComponentType = PriceComponentType = {}));
var PriceComponentCategory;
(function (PriceComponentCategory) {
    PriceComponentCategory["BASE_PRICE"] = "BASE_PRICE";
    PriceComponentCategory["TAX_LEVY"] = "TAX_LEVY";
    PriceComponentCategory["MARGIN"] = "MARGIN";
    PriceComponentCategory["COST"] = "COST";
    PriceComponentCategory["CUSTOM"] = "CUSTOM";
})(PriceComponentCategory || (exports.PriceComponentCategory = PriceComponentCategory = {}));
var PriceComponentStatus;
(function (PriceComponentStatus) {
    PriceComponentStatus["DRAFT"] = "DRAFT";
    PriceComponentStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    PriceComponentStatus["ACTIVE"] = "ACTIVE";
    PriceComponentStatus["SUSPENDED"] = "SUSPENDED";
    PriceComponentStatus["EXPIRED"] = "EXPIRED";
    PriceComponentStatus["ARCHIVED"] = "ARCHIVED";
})(PriceComponentStatus || (exports.PriceComponentStatus = PriceComponentStatus = {}));
var StationType;
(function (StationType) {
    StationType["COCO"] = "COCO";
    StationType["DOCO"] = "DOCO";
    StationType["DODO"] = "DODO";
    StationType["INDUSTRIAL"] = "INDUSTRIAL";
    StationType["COMMERCIAL"] = "COMMERCIAL";
    StationType["BULK_CONSUMER"] = "BULK_CONSUMER";
})(StationType || (exports.StationType = StationType = {}));
var ProductType;
(function (ProductType) {
    ProductType["PETROL"] = "PETROL";
    ProductType["DIESEL"] = "DIESEL";
    ProductType["LPG"] = "LPG";
    ProductType["KEROSENE"] = "KEROSENE";
    ProductType["FUEL_OIL"] = "FUEL_OIL";
    ProductType["AVIATION_FUEL"] = "AVIATION_FUEL";
    ProductType["MARINE_GAS_OIL"] = "MARINE_GAS_OIL";
})(ProductType || (exports.ProductType = ProductType = {}));
let PriceBuildupVersion = class PriceBuildupVersion {
    id;
    versionNumber;
    productType;
    effectiveDate;
    expiryDate;
    status;
    totalPrice;
    changeReason;
    approvalRequired;
    approvedBy;
    approvalDate;
    approvalNotes;
    publishedBy;
    publishedDate;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    components;
    stationTypePricing;
    calculateTotalPrice() {
        if (this.components && this.components.length > 0) {
            this.totalPrice = this.components.reduce((total, component) => {
                return total + (component.amount || 0);
            }, 0);
        }
    }
    // Helper methods
    isEffective(date = new Date()) {
        return this.status === PriceComponentStatus.ACTIVE &&
            this.isActive &&
            this.effectiveDate <= date &&
            (!this.expiryDate || this.expiryDate > date);
    }
    canBeModified() {
        return this.status === PriceComponentStatus.DRAFT ||
            this.status === PriceComponentStatus.PENDING_APPROVAL;
    }
    requiresApproval() {
        return this.approvalRequired && !this.approvedBy;
    }
};
exports.PriceBuildupVersion = PriceBuildupVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version_number', type: 'int' }),
    __metadata("design:type", Number)
], PriceBuildupVersion.prototype, "versionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_type', type: 'enum', enum: ProductType }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'enum', enum: PriceComponentStatus, default: PriceComponentStatus.DRAFT }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], PriceBuildupVersion.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'change_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "changeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_required', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceBuildupVersion.prototype, "approvalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "approvalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "approvalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "publishedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "publishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceBuildupVersion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PriceBuildupVersion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100 }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], PriceBuildupVersion.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PriceComponent, component => component.buildupVersion, { cascade: true }),
    __metadata("design:type", Array)
], PriceBuildupVersion.prototype, "components", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StationTypePricing, pricing => pricing.buildupVersion, { cascade: true }),
    __metadata("design:type", Array)
], PriceBuildupVersion.prototype, "stationTypePricing", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PriceBuildupVersion.prototype, "calculateTotalPrice", null);
exports.PriceBuildupVersion = PriceBuildupVersion = __decorate([
    (0, typeorm_1.Entity)('price_buildup_versions'),
    (0, typeorm_1.Index)(['effectiveDate', 'status']),
    (0, typeorm_1.Index)(['productType', 'effectiveDate']),
    (0, typeorm_1.Index)(['createdBy', 'createdAt'])
], PriceBuildupVersion);
let PriceComponent = class PriceComponent {
    id;
    buildupVersionId;
    componentType;
    componentName;
    category;
    amount;
    currency;
    isPercentage;
    percentageBase;
    calculationFormula;
    stationType;
    isMandatory;
    isConfigurable;
    minAmount;
    maxAmount;
    displayOrder;
    description;
    regulatoryReference;
    externalSource;
    externalReference;
    lastUpdatedSource;
    effectiveDate;
    expiryDate;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    buildupVersion;
    // Helper methods
    calculateAmount(baseAmount) {
        if (this.isPercentage && baseAmount !== undefined) {
            return (this.amount / 100) * baseAmount;
        }
        return this.amount;
    }
    isEffective(date = new Date()) {
        return this.isActive &&
            this.effectiveDate <= date &&
            (!this.expiryDate || this.expiryDate > date);
    }
    validateAmount() {
        if (this.minAmount !== null && this.amount < this.minAmount)
            return false;
        if (this.maxAmount !== null && this.amount > this.maxAmount)
            return false;
        return true;
    }
};
exports.PriceComponent = PriceComponent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PriceComponent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buildup_version_id', type: 'uuid' }),
    __metadata("design:type", String)
], PriceComponent.prototype, "buildupVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_type', type: 'enum', enum: PriceComponentType }),
    __metadata("design:type", String)
], PriceComponent.prototype, "componentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_name', length: 255 }),
    __metadata("design:type", String)
], PriceComponent.prototype, "componentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category', type: 'enum', enum: PriceComponentCategory }),
    __metadata("design:type", String)
], PriceComponent.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], PriceComponent.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], PriceComponent.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_percentage', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PriceComponent.prototype, "isPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'percentage_base', type: 'enum', enum: PriceComponentType, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "percentageBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_formula', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "calculationFormula", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_type', type: 'enum', enum: StationType, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mandatory', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceComponent.prototype, "isMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_configurable', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceComponent.prototype, "isConfigurable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_amount', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PriceComponent.prototype, "minAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_amount', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], PriceComponent.prototype, "maxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PriceComponent.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_reference', length: 500, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "regulatoryReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_source', length: 255, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "externalSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_reference', length: 255, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_updated_source', length: 255, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "lastUpdatedSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], PriceComponent.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PriceComponent.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceComponent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PriceComponent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PriceComponent.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100 }),
    __metadata("design:type", String)
], PriceComponent.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], PriceComponent.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceBuildupVersion, buildup => buildup.components),
    (0, typeorm_1.JoinColumn)({ name: 'buildup_version_id' }),
    __metadata("design:type", PriceBuildupVersion)
], PriceComponent.prototype, "buildupVersion", void 0);
exports.PriceComponent = PriceComponent = __decorate([
    (0, typeorm_1.Entity)('price_components'),
    (0, typeorm_1.Index)(['buildupVersionId', 'componentType']),
    (0, typeorm_1.Index)(['componentType', 'category']),
    (0, typeorm_1.Index)(['stationType', 'componentType'])
], PriceComponent);
let StationTypePricing = class StationTypePricing {
    id;
    buildupVersionId;
    stationType;
    productType;
    basePrice;
    totalTaxesLevies;
    totalMargins;
    totalCosts;
    finalPrice;
    currency;
    pricingNotes;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    buildupVersion;
    calculateFinalPrice() {
        this.finalPrice = (this.basePrice || 0) +
            (this.totalTaxesLevies || 0) +
            (this.totalMargins || 0) +
            (this.totalCosts || 0);
    }
};
exports.StationTypePricing = StationTypePricing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StationTypePricing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buildup_version_id', type: 'uuid' }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "buildupVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_type', type: 'enum', enum: StationType }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_type', type: 'enum', enum: ProductType }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], StationTypePricing.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_taxes_levies', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], StationTypePricing.prototype, "totalTaxesLevies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_margins', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], StationTypePricing.prototype, "totalMargins", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_costs', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], StationTypePricing.prototype, "totalCosts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], StationTypePricing.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 10, default: 'GHS' }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pricing_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "pricingNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], StationTypePricing.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StationTypePricing.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StationTypePricing.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', length: 100 }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', length: 100, nullable: true }),
    __metadata("design:type", String)
], StationTypePricing.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceBuildupVersion, buildup => buildup.stationTypePricing),
    (0, typeorm_1.JoinColumn)({ name: 'buildup_version_id' }),
    __metadata("design:type", PriceBuildupVersion)
], StationTypePricing.prototype, "buildupVersion", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StationTypePricing.prototype, "calculateFinalPrice", null);
exports.StationTypePricing = StationTypePricing = __decorate([
    (0, typeorm_1.Entity)('station_type_pricing'),
    (0, typeorm_1.Index)(['buildupVersionId', 'stationType']),
    (0, typeorm_1.Index)(['stationType', 'productType'])
], StationTypePricing);
let PriceBuildupAuditTrail = class PriceBuildupAuditTrail {
    id;
    buildupVersionId;
    componentId;
    actionType; // CREATE, UPDATE, DELETE, APPROVE, PUBLISH, ARCHIVE
    actionDescription;
    oldValues;
    newValues;
    actionBy;
    actionDate;
    ipAddress;
    userAgent;
    sessionId;
    createdAt;
    buildupVersion;
    component;
};
exports.PriceBuildupAuditTrail = PriceBuildupAuditTrail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buildup_version_id', type: 'uuid' }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "buildupVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "componentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_type', length: 50 }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_description', type: 'text' }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "actionDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_values', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], PriceBuildupAuditTrail.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_values', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], PriceBuildupAuditTrail.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_by', length: 100 }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "actionBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], PriceBuildupAuditTrail.prototype, "actionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], PriceBuildupAuditTrail.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PriceBuildupAuditTrail.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceBuildupVersion),
    (0, typeorm_1.JoinColumn)({ name: 'buildup_version_id' }),
    __metadata("design:type", PriceBuildupVersion)
], PriceBuildupAuditTrail.prototype, "buildupVersion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceComponent),
    (0, typeorm_1.JoinColumn)({ name: 'component_id' }),
    __metadata("design:type", PriceComponent)
], PriceBuildupAuditTrail.prototype, "component", void 0);
exports.PriceBuildupAuditTrail = PriceBuildupAuditTrail = __decorate([
    (0, typeorm_1.Entity)('price_buildup_audit_trail'),
    (0, typeorm_1.Index)(['buildupVersionId', 'actionDate']),
    (0, typeorm_1.Index)(['actionBy', 'actionDate']),
    (0, typeorm_1.Index)(['actionType', 'actionDate'])
], PriceBuildupAuditTrail);
//# sourceMappingURL=price-buildup.entity.js.map