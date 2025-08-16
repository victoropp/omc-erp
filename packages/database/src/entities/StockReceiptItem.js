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
exports.StockReceiptItem = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const StockReceipt_1 = require("./StockReceipt");
const Tank_1 = require("./Tank");
let StockReceiptItem = class StockReceiptItem extends BaseEntity_1.BaseEntity {
    stockReceiptId;
    tankId;
    fuelType;
    quantity;
    unitPrice;
    lineTotal;
    temperature;
    density;
    // Relations
    stockReceipt;
    tank;
};
exports.StockReceiptItem = StockReceiptItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockReceiptItem.prototype, "stockReceiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockReceiptItem.prototype, "tankId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.FuelType,
    }),
    __metadata("design:type", String)
], StockReceiptItem.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], StockReceiptItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], StockReceiptItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], StockReceiptItem.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], StockReceiptItem.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockReceiptItem.prototype, "density", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StockReceipt_1.StockReceipt, (receipt) => receipt.items, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'stockReceiptId' }),
    __metadata("design:type", StockReceipt_1.StockReceipt)
], StockReceiptItem.prototype, "stockReceipt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tank_1.Tank),
    (0, typeorm_1.JoinColumn)({ name: 'tankId' }),
    __metadata("design:type", Tank_1.Tank)
], StockReceiptItem.prototype, "tank", void 0);
exports.StockReceiptItem = StockReceiptItem = __decorate([
    (0, typeorm_1.Entity)('stock_receipt_items')
], StockReceiptItem);
//# sourceMappingURL=StockReceiptItem.js.map