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
exports.PriceBuildUpComponent = exports.ValueType = exports.ComponentType = void 0;
const typeorm_1 = require("typeorm");
const daily_delivery_entity_1 = require("./daily-delivery.entity");
var ComponentType;
(function (ComponentType) {
    ComponentType["BASE_PRICE"] = "BASE_PRICE";
    ComponentType["TAX"] = "TAX";
    ComponentType["LEVY"] = "LEVY";
    ComponentType["MARGIN"] = "MARGIN";
    ComponentType["MARKUP"] = "MARKUP";
})(ComponentType || (exports.ComponentType = ComponentType = {}));
var ValueType;
(function (ValueType) {
    ValueType["FIXED"] = "FIXED";
    ValueType["PERCENTAGE"] = "PERCENTAGE";
    ValueType["FORMULA"] = "FORMULA";
})(ValueType || (exports.ValueType = ValueType = {}));
let PriceBuildUpComponent = class PriceBuildUpComponent {
    id;
    componentCode;
    componentName;
    componentType;
    productGrade;
    stationType;
    effectiveDate;
    expiryDate;
    componentValue;
    valueType;
    calculationFormula;
    currencyCode;
    isActive;
    isMandatory;
    displayOrder;
    description;
    regulatoryReference;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Helper methods
    isEffectiveOn(date) {
        return this.effectiveDate <= date &&
            (this.expiryDate === null || this.expiryDate >= date);
    }
    calculateValue(basePrice, quantity) {
        switch (this.valueType) {
            case ValueType.FIXED:
                return this.componentValue;
            case ValueType.PERCENTAGE:
                return (basePrice * this.componentValue) / 100;
            case ValueType.FORMULA:
                // In a real implementation, this would use a formula parser
                return this.componentValue;
            default:
                return this.componentValue;
        }
    }
    isExpired() {
        return this.expiryDate !== null && this.expiryDate < new Date();
    }
    getEffectivePeriod() {
        const start = this.effectiveDate.toISOString().split('T')[0];
        const end = this.expiryDate ? this.expiryDate.toISOString().split('T')[0] : 'Ongoing';
        return `${start} to ${end}`;
    }
};
exports.PriceBuildUpComponent = PriceBuildUpComponent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_code', length: 50 }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "componentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_name', length: 200 }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "componentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_type', type: 'enum', enum: ComponentType }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "componentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_grade', type: 'enum', enum: daily_delivery_entity_1.ProductGrade }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "productGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_type', type: 'enum', enum: daily_delivery_entity_1.StationType }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "stationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_date', type: 'date' }),
    __metadata("design:type", Date)
], PriceBuildUpComponent.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PriceBuildUpComponent.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'component_value', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], PriceBuildUpComponent.prototype, "componentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_type', type: 'enum', enum: ValueType, default: ValueType.FIXED }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "valueType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calculation_formula', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "calculationFormula", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PriceBuildUpComponent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mandatory', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PriceBuildUpComponent.prototype, "isMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], PriceBuildUpComponent.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regulatory_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "regulatoryReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PriceBuildUpComponent.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PriceBuildUpComponent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PriceBuildUpComponent.prototype, "updatedAt", void 0);
exports.PriceBuildUpComponent = PriceBuildUpComponent = __decorate([
    (0, typeorm_1.Entity)('price_build_up_components'),
    (0, typeorm_1.Index)(['productGrade', 'stationType']),
    (0, typeorm_1.Index)(['effectiveDate']),
    (0, typeorm_1.Index)(['componentCode']),
    (0, typeorm_1.Index)(['componentType']),
    (0, typeorm_1.Index)(['productGrade', 'stationType', 'effectiveDate'], {
        where: 'is_active = true AND expiry_date IS NULL',
        unique: true
    }),
    (0, typeorm_1.Check)(`component_value >= 0`),
    (0, typeorm_1.Check)(`expiry_date IS NULL OR effective_date <= expiry_date`),
    (0, typeorm_1.Check)(`value_type IN ('FIXED', 'PERCENTAGE', 'FORMULA')`)
], PriceBuildUpComponent);
//# sourceMappingURL=price-build-up-component.entity.js.map