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
exports.DealerLoan = exports.AmortizationMethod = exports.RepaymentFrequency = exports.DealerLoanStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const dealer_loan_payment_entity_1 = require("./dealer-loan-payment.entity");
var DealerLoanStatus;
(function (DealerLoanStatus) {
    DealerLoanStatus["DRAFT"] = "draft";
    DealerLoanStatus["PENDING_APPROVAL"] = "pending_approval";
    DealerLoanStatus["APPROVED"] = "approved";
    DealerLoanStatus["ACTIVE"] = "active";
    DealerLoanStatus["COMPLETED"] = "completed";
    DealerLoanStatus["DEFAULTED"] = "defaulted";
    DealerLoanStatus["RESTRUCTURED"] = "restructured";
    DealerLoanStatus["SUSPENDED"] = "suspended";
    DealerLoanStatus["CANCELLED"] = "cancelled";
})(DealerLoanStatus || (exports.DealerLoanStatus = DealerLoanStatus = {}));
var RepaymentFrequency;
(function (RepaymentFrequency) {
    RepaymentFrequency["DAILY"] = "daily";
    RepaymentFrequency["WEEKLY"] = "weekly";
    RepaymentFrequency["BI_WEEKLY"] = "bi_weekly";
    RepaymentFrequency["MONTHLY"] = "monthly";
})(RepaymentFrequency || (exports.RepaymentFrequency = RepaymentFrequency = {}));
var AmortizationMethod;
(function (AmortizationMethod) {
    AmortizationMethod["REDUCING_BALANCE"] = "reducing_balance";
    AmortizationMethod["FLAT_RATE"] = "flat_rate";
    AmortizationMethod["INTEREST_ONLY"] = "interest_only";
})(AmortizationMethod || (exports.AmortizationMethod = AmortizationMethod = {}));
let DealerLoan = class DealerLoan {
    id;
    loanId;
    stationId;
    dealerId;
    principalAmount;
    interestRate;
    tenorMonths;
    repaymentFrequency;
    amortizationMethod;
    startDate;
    maturityDate;
    status;
    outstandingBalance;
    totalPaid;
    totalInterestPaid;
    lastPaymentDate;
    nextPaymentDate;
    installmentAmount;
    daysPastDue;
    penaltyAmount;
    penaltyRate;
    gracePeriodDays;
    loanAgreementDocId;
    collateralDetails;
    guarantorDetails;
    amortizationSchedule;
    autoDeductionEnabled;
    maxDeductionPercentage;
    notes;
    tenantId;
    createdBy;
    approvedBy;
    approvedAt;
    completedAt;
    createdAt;
    updatedAt;
    // Relations
    payments;
    // Computed properties
    get isOverdue() {
        return this.daysPastDue > this.gracePeriodDays;
    }
    get totalAmountDue() {
        return this.outstandingBalance + this.penaltyAmount;
    }
    get paymentsRemaining() {
        if (!this.amortizationSchedule)
            return 0;
        return this.amortizationSchedule.filter(s => s.outstandingBalance > 0).length;
    }
};
exports.DealerLoan = DealerLoan;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealerLoan.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan reference number' }),
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoan.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID (dealer location)' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoan.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer user ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoan.prototype, "dealerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal loan amount' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Annual interest rate (decimal)' }),
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 4 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan tenor in months' }),
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], DealerLoan.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Repayment frequency', enum: RepaymentFrequency }),
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], DealerLoan.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amortization method', enum: AmortizationMethod }),
    (0, typeorm_1.Column)('varchar', { length: 20, default: AmortizationMethod.REDUCING_BALANCE }),
    __metadata("design:type", String)
], DealerLoan.prototype, "amortizationMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan start date' }),
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], DealerLoan.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan maturity date' }),
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], DealerLoan.prototype, "maturityDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current loan status', enum: DealerLoanStatus }),
    (0, typeorm_1.Column)('varchar', { length: 20, default: DealerLoanStatus.DRAFT }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoan.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outstanding balance' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "outstandingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount paid' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "totalPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total interest paid' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "totalInterestPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last payment date' }),
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", Date)
], DealerLoan.prototype, "lastPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next payment due date' }),
    (0, typeorm_1.Column)('date', { nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DealerLoan.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected installment amount' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days past due' }),
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "daysPastDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Penalty amount due' }),
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "penaltyAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Penalty rate for late payments' }),
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 4, default: 0.02 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "penaltyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grace period days' }),
    (0, typeorm_1.Column)('integer', { default: 7 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "gracePeriodDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan agreement document ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoan.prototype, "loanAgreementDocId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral details' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], DealerLoan.prototype, "collateralDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor details' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], DealerLoan.prototype, "guarantorDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amortization schedule' }),
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], DealerLoan.prototype, "amortizationSchedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auto-deduction enabled' }),
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], DealerLoan.prototype, "autoDeductionEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum deduction percentage from settlements' }),
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 80.0 }),
    __metadata("design:type", Number)
], DealerLoan.prototype, "maxDeductionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan purpose/notes' }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], DealerLoan.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID' }),
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DealerLoan.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoan.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approved by user ID' }),
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DealerLoan.prototype, "approvedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval date' }),
    (0, typeorm_1.Column)('timestamptz', { nullable: true }),
    __metadata("design:type", Date)
], DealerLoan.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Completed date' }),
    (0, typeorm_1.Column)('timestamptz', { nullable: true }),
    __metadata("design:type", Date)
], DealerLoan.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DealerLoan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DealerLoan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dealer_loan_payment_entity_1.DealerLoanPayment, payment => payment.loan),
    __metadata("design:type", Array)
], DealerLoan.prototype, "payments", void 0);
exports.DealerLoan = DealerLoan = __decorate([
    (0, typeorm_1.Entity)('dealer_loans'),
    (0, typeorm_1.Index)(['stationId', 'status']),
    (0, typeorm_1.Index)(['dealerId', 'status']),
    (0, typeorm_1.Index)(['nextPaymentDate'], { where: "status = 'active'" })
], DealerLoan);
//# sourceMappingURL=dealer-loan.entity.js.map