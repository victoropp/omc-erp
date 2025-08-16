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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Station_1 = require("./Station");
const Tank_1 = require("./Tank");
const Pump_1 = require("./Pump");
const User_1 = require("./User");
const Customer_1 = require("./Customer");
const Shift_1 = require("./Shift");
let Transaction = class Transaction extends BaseEntity_1.BaseEntity {
    tenantId;
    stationId;
    pumpId;
    tankId;
    attendantId;
    customerId;
    shiftId;
    // Fuel details
    fuelType;
    quantityLiters;
    unitPrice;
    grossAmount;
    // Taxes and charges
    taxRate; // 17.5% VAT in Ghana
    taxAmount;
    serviceCharge;
    totalAmount;
    // Payment details
    paymentMethod;
    paymentReference;
    paymentStatus;
    paymentProcessedAt;
    // Transaction metadata
    receiptNumber;
    posReference;
    transactionTime;
    status;
    // Quality metrics
    temperature;
    density;
    // Loyalty and discounts
    loyaltyPointsAwarded;
    discountAmount;
    // Relations
    station;
    tank;
    pump;
    attendant;
    customer;
    shift;
    // Hooks
    calculateAmounts() {
        // Calculate gross amount
        this.grossAmount = this.quantityLiters * this.unitPrice;
        // Calculate tax
        this.taxAmount = this.grossAmount * this.taxRate;
        // Calculate total
        this.totalAmount = this.grossAmount + this.taxAmount + this.serviceCharge - this.discountAmount;
        // Calculate loyalty points (1 point per 10 GHS spent)
        this.loyaltyPointsAwarded = Math.floor(this.totalAmount / 10);
    }
    generateReceiptNumber() {
        if (!this.receiptNumber) {
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            this.receiptNumber = `RCP${timestamp}${random}`;
        }
    }
    // Methods
    isCompleted() {
        return this.status === shared_types_1.TransactionStatus.COMPLETED;
    }
    isPaid() {
        return this.paymentStatus === shared_types_1.PaymentStatus.COMPLETED;
    }
    canBeRefunded() {
        return this.isCompleted() && this.isPaid();
    }
    getNetAmount() {
        return this.grossAmount - this.discountAmount;
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "pumpId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Transaction.prototype, "tankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "attendantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "shiftId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.FuelType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], Transaction.prototype, "quantityLiters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], Transaction.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "grossAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, default: 0.175 }),
    __metadata("design:type", Number)
], Transaction.prototype, "taxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "serviceCharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PaymentMethod,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.PaymentStatus,
        default: shared_types_1.PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "paymentProcessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "receiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "posReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Transaction.prototype, "transactionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.TransactionStatus,
        default: shared_types_1.TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "density", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "loyaltyPointsAwarded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station, (station) => station.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], Transaction.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Tank_1.Tank),
    (0, typeorm_1.JoinColumn)({ name: 'tankId' }),
    __metadata("design:type", Tank_1.Tank)
], Transaction.prototype, "tank", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Pump_1.Pump, (pump) => pump.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'pumpId' }),
    __metadata("design:type", Pump_1.Pump)
], Transaction.prototype, "pump", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'attendantId' }),
    __metadata("design:type", User_1.User)
], Transaction.prototype, "attendant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", Customer_1.Customer)
], Transaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Shift_1.Shift, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shiftId' }),
    __metadata("design:type", Shift_1.Shift)
], Transaction.prototype, "shift", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "calculateAmounts", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "generateReceiptNumber", null);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('fuel_transactions'),
    (0, typeorm_1.Index)(['tenantId', 'transactionTime']),
    (0, typeorm_1.Index)(['stationId', 'transactionTime']),
    (0, typeorm_1.Index)(['receiptNumber'], { unique: true }),
    (0, typeorm_1.Index)(['paymentStatus']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['customerId'])
], Transaction);
//# sourceMappingURL=Transaction.js.map