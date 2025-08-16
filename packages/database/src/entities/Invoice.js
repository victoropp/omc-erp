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
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Customer_1 = require("./Customer");
const Station_1 = require("./Station");
const User_1 = require("./User");
const InvoiceLineItem_1 = require("./InvoiceLineItem");
let Invoice = class Invoice extends BaseEntity_1.BaseEntity {
    tenantId;
    invoiceNumber;
    customerId;
    stationId;
    // Invoice details
    issueDate;
    dueDate;
    currency;
    // Amounts
    subtotal;
    taxAmount;
    discountAmount;
    totalAmount;
    amountPaid;
    amountDue;
    // Payment terms
    paymentTerms; // Days
    lateFeeRate;
    status;
    notes;
    createdBy;
    // Relations
    customer;
    station;
    creator;
    lineItems;
    // Hooks
    generateInvoiceNumber() {
        if (!this.invoiceNumber) {
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-6);
            this.invoiceNumber = `INV-${year}-${timestamp}`;
        }
    }
    calculateAmountDue() {
        this.amountDue = this.totalAmount - this.amountPaid;
    }
    // Methods
    isOverdue() {
        return this.status === shared_types_1.InvoiceStatus.SENT &&
            this.dueDate < new Date() &&
            this.amountDue > 0;
    }
    isPaid() {
        return this.amountDue <= 0;
    }
    markAsPaid() {
        this.amountPaid = this.totalAmount;
        this.amountDue = 0;
        this.status = shared_types_1.InvoiceStatus.PAID;
    }
    calculateLateFee() {
        if (!this.isOverdue())
            return 0;
        const daysOverdue = Math.floor((Date.now() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return this.totalAmount * this.lateFeeRate * daysOverdue;
    }
    recalculateTotals() {
        if (this.lineItems && this.lineItems.length > 0) {
            this.subtotal = this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
            this.taxAmount = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
            this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
            this.amountDue = this.totalAmount - this.amountPaid;
        }
    }
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Invoice.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Invoice.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.Currency,
        default: shared_types_1.Currency.GHS,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "lateFeeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.InvoiceStatus,
        default: shared_types_1.InvoiceStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, (customer) => customer.invoices),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", Customer_1.Customer)
], Invoice.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_1.Station, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'stationId' }),
    __metadata("design:type", Station_1.Station)
], Invoice.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdBy' }),
    __metadata("design:type", User_1.User)
], Invoice.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceLineItem_1.InvoiceLineItem, (item) => item.invoice, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Invoice.prototype, "lineItems", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Invoice.prototype, "generateInvoiceNumber", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Invoice.prototype, "calculateAmountDue", null);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['invoiceNumber'], { unique: true }),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['dueDate'])
], Invoice);
//# sourceMappingURL=Invoice.js.map