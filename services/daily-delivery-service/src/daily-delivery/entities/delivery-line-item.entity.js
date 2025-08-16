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
exports.DeliveryLineItem = void 0;
const typeorm_1 = require("typeorm");
const daily_delivery_entity_1 = require("./daily-delivery.entity");
let DeliveryLineItem = class DeliveryLineItem {
    id;
    deliveryId;
    lineNumber;
    productCode;
    productName;
    productGrade;
    quantity;
    unitPrice;
    lineTotal;
    tankNumber;
    compartmentNumber;
    batchNumber;
    qualitySpecifications; // JSON
    // Price Component Breakdown
    baseUnitPrice;
    totalTaxes;
    totalLevies;
    totalMargins;
    priceComponents;
    costCenterCode;
    profitCenterCode;
    glAccountCode;
    delivery;
    // Helper methods for price calculations
    calculateLineTotal() {
        return this.quantity * (this.baseUnitPrice + (this.totalTaxes + this.totalLevies + this.totalMargins) / this.quantity);
    }
    getTotalPricePerUnit() {
        if (this.quantity === 0)
            return 0;
        return this.lineTotal / this.quantity;
    }
    getMarginPercentage() {
        if (this.baseUnitPrice === 0)
            return 0;
        return (this.totalMargins / this.quantity) / this.baseUnitPrice * 100;
    }
};
exports.DeliveryLineItem = DeliveryLineItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_id', type: 'uuid' }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "deliveryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_number', type: 'integer' }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "lineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_code', length: 50 }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_name', length: 255 }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_grade', type: 'enum', enum: daily_delivery_entity_1.ProductGrade }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "productGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'line_total', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tank_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "tankNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compartment_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "compartmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_specifications', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "qualitySpecifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_unit_price', type: 'decimal', precision: 15, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "baseUnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_taxes', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "totalTaxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_levies', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "totalLevies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_margins', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DeliveryLineItem.prototype, "totalMargins", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_components', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeliveryLineItem.prototype, "priceComponents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "costCenterCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profit_center_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "profitCenterCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gl_account_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], DeliveryLineItem.prototype, "glAccountCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_delivery_entity_1.DailyDelivery, delivery => delivery.lineItems),
    (0, typeorm_1.JoinColumn)({ name: 'delivery_id' }),
    __metadata("design:type", daily_delivery_entity_1.DailyDelivery)
], DeliveryLineItem.prototype, "delivery", void 0);
exports.DeliveryLineItem = DeliveryLineItem = __decorate([
    (0, typeorm_1.Entity)('delivery_line_items'),
    (0, typeorm_1.Index)(['deliveryId']),
    (0, typeorm_1.Index)(['costCenterCode']),
    (0, typeorm_1.Index)(['glAccountCode'])
], DeliveryLineItem);
//# sourceMappingURL=delivery-line-item.entity.js.map