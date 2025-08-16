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
exports.DealerSettlement = exports.DealerSettlementStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var DealerSettlementStatus;
(function (DealerSettlementStatus) {
    DealerSettlementStatus["CALCULATED"] = "calculated";
    DealerSettlementStatus["APPROVED"] = "approved";
    DealerSettlementStatus["PAID"] = "paid";
    DealerSettlementStatus["DISPUTED"] = "disputed";
    DealerSettlementStatus["CANCELLED"] = "cancelled";
})(DealerSettlementStatus || (exports.DealerSettlementStatus = DealerSettlementStatus = {}));
let DealerSettlement = class DealerSettlement {
    id;
    stationId;
    windowId;
    settlementDate;
    periodStart;
    periodEnd;
    totalLitresSold;
    grossDealerMargin;
    loanDeduction;
    otherDeductions;
    totalDeductions;
    netPayable;
    status;
    paymentDate;
    paymentReference;
    calculationDetails;
    settlementStatementUrl;
    journalEntryId;
    disputeReason;
    disputeResolution;
    autoPaymentEnabled;
    paymentMethod;
    bankAccountDetails;
    tenantId;
    createdBy;
    approvedBy;
    paidBy;
    approvedAt;
    createdAt;
    updatedAt;
    // Computed properties
    get deductionPercentage() {
        if (this.grossDealerMargin === 0)
            return 0;
        return (this.totalDeductions / this.grossDealerMargin) * 100;
    }
    get isNegativeBalance() {
        return this.netPayable < 0;
    }
    get isReadyForPayment() {
        return this.status === DealerSettlementStatus.APPROVED && this.netPayable > 0;
    }
};
exports.DealerSettlement = DealerSettlement;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealerSettlement.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerSettlement.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pricing window ID' }),
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerSettlement.prototype, "windowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement date' }),
    (0, typeorm_1.Column)('date'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "settlementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period start date' }),
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "periodStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period end date' }),
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "periodEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total litres sold in period' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 3 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "totalLitresSold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gross dealer margin earned' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "grossDealerMargin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan deduction amount' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "loanDeduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Other deductions (chargebacks, shortages, etc.)' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "otherDeductions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total deductions' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "totalDeductions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount payable to dealer' }),
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DealerSettlement.prototype, "netPayable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement status', enum: DealerSettlementStatus }),
    (0, typeorm_1.Column)('varchar', { length: 20, default: DealerSettlementStatus.CALCULATED }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerSettlement.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment date' }),
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment reference' }),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Detailed calculation breakdown' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], DealerSettlement.prototype, "calculationDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement statement URL' }),
    (0, typeorm_1.Column)('varchar', { length: 500, nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "settlementStatementUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GL journal entry ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "journalEntryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dispute reason if disputed' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "disputeReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dispute resolution notes' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "disputeResolution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auto-payment enabled' }),
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], DealerSettlement.prototype, "autoPaymentEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method preference' }),
    (0, typeorm_1.Column)('varchar', { length: 50, default: 'bank_transfer' }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account details for payment' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], DealerSettlement.prototype, "bankAccountDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerSettlement.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approved by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "approvedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Paid by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerSettlement.prototype, "paidBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval timestamp' }),
    (0, typeorm_1.Column)('timestamptz', { nullable: true }),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DealerSettlement.prototype, "updatedAt", void 0);
exports.DealerSettlement = DealerSettlement = __decorate([
    (0, typeorm_1.Entity)('dealer_settlements'),
    (0, typeorm_1.Index)(['stationId', 'windowId'], { unique: true }),
    (0, typeorm_1.Index)(['status', 'settlementDate']),
    (0, typeorm_1.Index)(['paymentDate'], { where: "status = 'approved'" })
], DealerSettlement);
//# sourceMappingURL=dealer-settlement.entity.js.map