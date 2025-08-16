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
exports.TaxAccrual = exports.PaymentStatus = exports.TaxType = void 0;
const typeorm_1 = require("typeorm");
const daily_delivery_entity_1 = require("./daily-delivery.entity");
var TaxType;
(function (TaxType) {
    TaxType["PETROLEUM_TAX"] = "PETROLEUM_TAX";
    TaxType["ENERGY_FUND_LEVY"] = "ENERGY_FUND_LEVY";
    TaxType["ROAD_FUND_LEVY"] = "ROAD_FUND_LEVY";
    TaxType["PRICE_STABILIZATION_LEVY"] = "PRICE_STABILIZATION_LEVY";
    TaxType["UPPF_LEVY"] = "UPPF_LEVY";
    TaxType["VAT"] = "VAT";
    TaxType["WITHHOLDING_TAX"] = "WITHHOLDING_TAX";
    TaxType["CUSTOMS_DUTY"] = "CUSTOMS_DUTY";
})(TaxType || (exports.TaxType = TaxType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["OVERDUE"] = "OVERDUE";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let TaxAccrual = class TaxAccrual {
    id;
    deliveryId;
    taxType;
    taxRate;
    taxableAmount;
    taxAmount;
    taxAccountCode;
    liabilityAccountCode;
    taxAuthority;
    dueDate;
    paymentStatus;
    paymentDate;
    paymentReference;
    currencyCode;
    exchangeRate;
    baseTaxAmount;
    description;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    delivery;
    // Helper methods
    isOverdue() {
        return this.paymentStatus === PaymentStatus.PENDING &&
            this.dueDate !== null &&
            this.dueDate < new Date();
    }
    getDaysOverdue() {
        if (!this.isOverdue())
            return 0;
        const today = new Date();
        const diffTime = today.getTime() - this.dueDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    markAsPaid(paymentDate, paymentReference, updatedBy) {
        this.paymentStatus = PaymentStatus.PAID;
        this.paymentDate = paymentDate;
        this.paymentReference = paymentReference;
        this.updatedBy = updatedBy;
    }
    getEffectiveTaxRate() {
        if (this.taxableAmount === 0)
            return 0;
        return (this.taxAmount / this.taxableAmount) * 100;
    }
    getTaxDescription() {
        const typeDescriptions = {
            [TaxType.PETROLEUM_TAX]: 'Petroleum Tax',
            [TaxType.ENERGY_FUND_LEVY]: 'Energy Fund Levy',
            [TaxType.ROAD_FUND_LEVY]: 'Road Fund Levy',
            [TaxType.PRICE_STABILIZATION_LEVY]: 'Price Stabilization Levy',
            [TaxType.UPPF_LEVY]: 'UPPF Levy',
            [TaxType.VAT]: 'Value Added Tax',
            [TaxType.WITHHOLDING_TAX]: 'Withholding Tax',
            [TaxType.CUSTOMS_DUTY]: 'Customs Duty'
        };
        return typeDescriptions[this.taxType] || this.taxType;
    }
    getDaysUntilDue() {
        if (!this.dueDate)
            return 0;
        const today = new Date();
        const diffTime = this.dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    isPaymentRequired() {
        return this.paymentStatus === PaymentStatus.PENDING && this.taxAmount > 0;
    }
};
exports.TaxAccrual = TaxAccrual;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaxAccrual.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_id', type: 'uuid' }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "deliveryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_type', type: 'enum', enum: TaxType }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "taxType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_rate', type: 'decimal', precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], TaxAccrual.prototype, "taxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taxable_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], TaxAccrual.prototype, "taxableAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], TaxAccrual.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_account_code', length: 20 }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "taxAccountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'liability_account_code', length: 20 }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "liabilityAccountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tax_authority', length: 100, nullable: true }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "taxAuthority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TaxAccrual.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], TaxAccrual.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], TaxAccrual.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_tax_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], TaxAccrual.prototype, "baseTaxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TaxAccrual.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TaxAccrual.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TaxAccrual.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_delivery_entity_1.DailyDelivery, delivery => delivery.taxAccruals, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'delivery_id' }),
    __metadata("design:type", daily_delivery_entity_1.DailyDelivery)
], TaxAccrual.prototype, "delivery", void 0);
exports.TaxAccrual = TaxAccrual = __decorate([
    (0, typeorm_1.Entity)('tax_accruals'),
    (0, typeorm_1.Index)(['deliveryId']),
    (0, typeorm_1.Index)(['taxType']),
    (0, typeorm_1.Index)(['dueDate']),
    (0, typeorm_1.Index)(['paymentStatus']),
    (0, typeorm_1.Index)(['taxAuthority']),
    (0, typeorm_1.Check)(`tax_rate >= 0 AND tax_rate <= 100`),
    (0, typeorm_1.Check)(`taxable_amount >= 0`),
    (0, typeorm_1.Check)(`tax_amount >= 0`),
    (0, typeorm_1.Check)(`payment_date IS NULL OR payment_date >= DATE(created_at)`)
], TaxAccrual);
//# sourceMappingURL=tax-accrual.entity.js.map