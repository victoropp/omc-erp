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
exports.PBUComponent = void 0;
const typeorm_1 = require("typeorm");
const shared_types_1 = require("@omc-erp/shared-types");
let PBUComponent = class PBUComponent {
    id;
    tenantId;
    componentCode; // EDRL, PSRL, BOST, UPPF, etc.
    name;
    category;
    unit;
    rateValue;
    effectiveFrom;
    effectiveTo;
    sourceDocId; // FK to regulatory_docs
    approvalRef;
    isActive;
    notes;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Helper method to check if component is effective for a given date
    isEffectiveOn(date) {
        return date >= this.effectiveFrom &&
            (!this.effectiveTo || date <= this.effectiveTo) &&
            this.isActive;
    }
    // Helper method to get display value based on unit
    getDisplayValue() {
        if (this.unit === shared_types_1.PBUComponentUnit.PERCENTAGE) {
            return `${this.rateValue}%`;
        }
        return `GHS ${this.rateValue.toFixed(4)}`;
    }
};
exports.PBUComponent = PBUComponent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PBUComponent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], PBUComponent.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 10 }),
    __metadata("design:type", String)
], PBUComponent.prototype, "componentCode", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], PBUComponent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PBUComponentCategory,
    }),
    __metadata("design:type", String)
], PBUComponent.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PBUComponentUnit,
    }),
    __metadata("design:type", String)
], PBUComponent.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], PBUComponent.prototype, "rateValue", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], PBUComponent.prototype, "effectiveFrom", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], PBUComponent.prototype, "effectiveTo", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PBUComponent.prototype, "sourceDocId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], PBUComponent.prototype, "approvalRef", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], PBUComponent.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], PBUComponent.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PBUComponent.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PBUComponent.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PBUComponent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PBUComponent.prototype, "updatedAt", void 0);
exports.PBUComponent = PBUComponent = __decorate([
    (0, typeorm_1.Entity)('pbu_components'),
    (0, typeorm_1.Index)(['componentCode', 'tenantId', 'effectiveFrom'], { unique: false }),
    (0, typeorm_1.Index)(['tenantId', 'isActive', 'effectiveFrom'])
], PBUComponent);
//# sourceMappingURL=pbu-component.entity.js.map