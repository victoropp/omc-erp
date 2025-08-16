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
exports.PricingWindow = void 0;
const typeorm_1 = require("typeorm");
const shared_types_1 = require("@omc-erp/shared-types");
const station_price_entity_1 = require("./station-price.entity");
let PricingWindow = class PricingWindow {
    windowId; // 2025W15 format
    tenantId;
    startDate;
    endDate;
    npaGuidelineDocId;
    status;
    notes;
    createdBy;
    approvedBy;
    approvedAt;
    createdAt;
    updatedAt;
    stationPrices;
};
exports.PricingWindow = PricingWindow;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 20 }),
    __metadata("design:type", String)
], PricingWindow.prototype, "windowId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], PricingWindow.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], PricingWindow.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], PricingWindow.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PricingWindow.prototype, "npaGuidelineDocId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PricingWindowStatus,
        default: shared_types_1.PricingWindowStatus.DRAFT,
    }),
    __metadata("design:type", String)
], PricingWindow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], PricingWindow.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PricingWindow.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], PricingWindow.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], PricingWindow.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PricingWindow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PricingWindow.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => station_price_entity_1.StationPrice, stationPrice => stationPrice.pricingWindow),
    __metadata("design:type", Array)
], PricingWindow.prototype, "stationPrices", void 0);
exports.PricingWindow = PricingWindow = __decorate([
    (0, typeorm_1.Entity)('pricing_windows')
], PricingWindow);
//# sourceMappingURL=pricing-window.entity.js.map