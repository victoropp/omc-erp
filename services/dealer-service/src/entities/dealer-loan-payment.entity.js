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
exports.DealerLoanPayment = exports.PaymentStatus = exports.PaymentType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const dealer_loan_entity_1 = require("./dealer-loan.entity");
var PaymentType;
(function (PaymentType) {
    PaymentType["REGULAR"] = "regular";
    PaymentType["EARLY"] = "early";
    PaymentType["PARTIAL"] = "partial";
    PaymentType["PENALTY"] = "penalty";
    PaymentType["SETTLEMENT_DEDUCTION"] = "settlement_deduction";
    PaymentType["MANUAL"] = "manual";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REVERSED"] = "reversed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let DealerLoanPayment = class DealerLoanPayment {
    id;
    paymentReference;
    loanId;
    paymentDate;
    dueDate;
    principalAmount;
    interestAmount;
    penaltyAmount;
    totalAmount;
    outstandingBalanceAfter;
    paymentType;
    paymentStatus;
    paymentMethod;
    transactionReference;
    settlementId;
    daysLate;
    earlyPaymentDiscount;
    notes;
    tenantId;
    processedBy;
    reversalReason;
    originalPaymentId;
    createdAt;
    // Relations
    loan;
    // Computed properties
    get isLatePayment() {
        return this.daysLate > 0;
    }
    get isEarlyPayment() {
        return this.paymentType === PaymentType.EARLY;
    }
};
exports.DealerLoanPayment = DealerLoanPayment;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment reference number' }),
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associated loan ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment date' }),
    (0, typeorm_1.Column)('timestamptz'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DealerLoanPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due date for this payment' }),
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], DealerLoanPayment.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal amount paid' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest amount paid' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "interestAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Penalty amount paid' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "penaltyAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total payment amount' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outstanding balance after payment' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "outstandingBalanceAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment type', enum: PaymentType }),
    (0, typeorm_1.Column)('varchar', { length: 30 }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status', enum: PaymentStatus }),
    (0, typeorm_1.Column)('varchar', { length: 20, default: PaymentStatus.COMPLETED }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction reference from payment system' }),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement ID if paid via settlement deduction' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "settlementId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days late when payment was made' }),
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "daysLate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Early payment discount applied' }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerLoanPayment.prototype, "earlyPaymentDiscount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment notes' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who processed payment' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "processedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reversal reason if payment was reversed' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "reversalReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original payment ID if this is a reversal' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoanPayment.prototype, "originalPaymentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DealerLoanPayment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealer_loan_entity_1.DealerLoan, loan => loan.payments),
    (0, typeorm_1.JoinColumn)({ name: 'loanId', referencedColumnName: 'id' }),
    __metadata("design:type", dealer_loan_entity_1.DealerLoan)
], DealerLoanPayment.prototype, "loan", void 0);
exports.DealerLoanPayment = DealerLoanPayment = __decorate([
    (0, typeorm_1.Entity)('dealer_loan_payments'),
    (0, typeorm_1.Index)(['loanId', 'paymentDate']),
    (0, typeorm_1.Index)(['paymentStatus', 'paymentDate'])
], DealerLoanPayment);
//# sourceMappingURL=dealer-loan-payment.entity.js.map