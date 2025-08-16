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
exports.StationPrice = void 0;
const typeorm_1 = require("typeorm");
const pricing_window_entity_1 = require("./pricing-window.entity");
let StationPrice = class StationPrice {
    id;
    stationId;
    productId; // PMS, AGO, LPG
    windowId;
    exPumpPrice;
    calcBreakdownJson;
    publishedAt;
    tenantId;
    calculatedBy;
    publishedBy;
    createdAt;
    updatedAt;
    pricingWindow;
};
exports.StationPrice = StationPrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StationPrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], StationPrice.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 10 }),
    __metadata("design:type", String)
], StationPrice.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], StationPrice.prototype, "windowId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], StationPrice.prototype, "exPumpPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], StationPrice.prototype, "calcBreakdownJson", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], StationPrice.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], StationPrice.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], StationPrice.prototype, "calculatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], StationPrice.prototype, "publishedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StationPrice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StationPrice.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pricing_window_entity_1.PricingWindow, pricingWindow => pricingWindow.stationPrices),
    (0, typeorm_1.JoinColumn)({ name: 'windowId', referencedColumnName: 'windowId' }),
    __metadata("design:type", pricing_window_entity_1.PricingWindow)
], StationPrice.prototype, "pricingWindow", void 0);
exports.StationPrice = StationPrice = __decorate([
    (0, typeorm_1.Entity)('station_prices'),
    (0, typeorm_1.Index)(['stationId', 'productId', 'windowId'], { unique: true })
], StationPrice);
//# sourceMappingURL=station-price.entity.js.map