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
exports.StockReceipt = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Station_1 = require("./Station");
const Supplier_1 = require("./Supplier");
const Vehicle_1 = require("./Vehicle");
const Driver_1 = require("./Driver");
const StockReceiptItem_1 = require("./StockReceiptItem");
let StockReceipt = class StockReceipt extends BaseEntity_1.BaseEntity {
    tenantId;
    stationId;
    supplierId;
    vehicleId;
    driverId;
    receiptNumber;
    deliveryNoteNumber;
    purchaseOrderId;
    totalQuantity;
    totalValue;
    currency;
    qualityCertificate;
    temperatureRecorded;
    densityRecorded;
    qualityStatus;
    qualityNotes;
    photos;
    documents;
    scheduledDeliveryTime;
    actualDeliveryTime;
    receiptConfirmedAt;
    status;
    notes;
    createdBy;
    // Relations
    station;
    supplier;
    vehicle;
    driver;
    items;
};
exports.StockReceipt = StockReceipt;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockReceipt.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockReceipt.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockReceipt.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "receiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "deliveryNoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], StockReceipt.prototype, "totalQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], StockReceipt.prototype, "totalValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.Currency,
        default: shared_types_1.Currency.GHS,
    }),
    __metadata("design:type", String)
], StockReceipt.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "qualityCertificate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], StockReceipt.prototype, "temperatureRecorded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], StockReceipt.prototype, "densityRecorded", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.QualityStatus,
        default: shared_types_1.QualityStatus.PENDING,
    }),
    __metadata("design:type", String)
], StockReceipt.prototype, "qualityStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "qualityNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], StockReceipt.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], StockReceipt.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], StockReceipt.prototype, "scheduledDeliveryTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], StockReceipt.prototype, "actualDeliveryTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], StockReceipt.prototype, "receiptConfirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.ReceiptStatus,
        default: shared_types_1.ReceiptStatus.PENDING,
    }),
    __metadata("design:type", String)
], StockReceipt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], StockReceipt.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], StockReceipt.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier),
    (0, typeorm_1.JoinColumn)({ name: 'supplierId' }),
    __metadata("design:type", Supplier_1.Supplier)
], StockReceipt.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vehicle_1.Vehicle, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicleId' }),
    __metadata("design:type", Vehicle_1.Vehicle)
], StockReceipt.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Driver_1.Driver, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'driverId' }),
    __metadata("design:type", Driver_1.Driver)
], StockReceipt.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StockReceiptItem_1.StockReceiptItem, (item) => item.stockReceipt, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], StockReceipt.prototype, "items", void 0);
exports.StockReceipt = StockReceipt = __decorate([
    (0, typeorm_1.Entity)('stock_receipts'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['receiptNumber'], { unique: true }),
    (0, typeorm_1.Index)(['stationId'])
], StockReceipt);
//# sourceMappingURL=StockReceipt.js.map