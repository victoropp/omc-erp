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
exports.InvoiceLineItem = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const shared_types_1 = require("@omc-erp/shared-types");
const Invoice_1 = require("./Invoice");
let InvoiceLineItem = class InvoiceLineItem extends BaseEntity_1.BaseEntity {
    invoiceId;
    description;
    fuelType;
    quantity;
    unitPrice;
    lineTotal;
    taxRate;
    taxAmount;
    lineOrder;
    // Relations
    invoice;
    // Hooks
    calculateAmounts() {
        this.lineTotal = this.quantity * this.unitPrice;
        this.taxAmount = this.lineTotal * this.taxRate;
    }
    // Methods
    getTotalAmount() {
        return this.lineTotal + this.taxAmount;
    }
};
exports.InvoiceLineItem = InvoiceLineItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.FuelType,
        nullable: true,
    }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 4 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "lineTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, default: 0.175 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "taxRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "lineOrder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice_1.Invoice, (invoice) => invoice.lineItems, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'invoiceId' }),
    __metadata("design:type", Invoice_1.Invoice)
], InvoiceLineItem.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoiceLineItem.prototype, "calculateAmounts", null);
exports.InvoiceLineItem = InvoiceLineItem = __decorate([
    (0, typeorm_1.Entity)('invoice_line_items')
], InvoiceLineItem);
//# sourceMappingURL=InvoiceLineItem.js.map