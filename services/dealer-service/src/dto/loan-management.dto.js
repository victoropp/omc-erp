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
exports.LoanResponseDto = exports.AmortizationScheduleEntryDto = exports.LoanRestructureDto = exports.LoanPaymentDto = exports.DisburseLoanDto = exports.ApproveLoanDto = exports.LoanTermsDto = exports.CreateLoanApplicationDto = exports.LoanGuarantorDto = exports.LoanCollateralDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const dealer_loan_entity_1 = require("../entities/dealer-loan.entity");
class LoanCollateralDto {
    type;
    description;
    estimatedValue;
    location;
    documentReferences;
}
exports.LoanCollateralDto = LoanCollateralDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateralDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral description' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateralDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated value (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanCollateralDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location of collateral' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanCollateralDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document references', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], LoanCollateralDto.prototype, "documentReferences", void 0);
class LoanGuarantorDto {
    fullName;
    nationalId;
    phoneNumber;
    address;
    relationship;
    occupation;
    monthlyIncome;
    netWorth;
}
exports.LoanGuarantorDto = LoanGuarantorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor full name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'National ID number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "nationalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Relationship to borrower' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Occupation' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanGuarantorDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monthly income (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantorDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net worth (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanGuarantorDto.prototype, "netWorth", void 0);
class CreateLoanApplicationDto {
    stationId;
    dealerId;
    requestedAmount;
    purpose;
    requestedTenorMonths;
    preferredRepaymentFrequency;
    expectedMonthlyRevenue;
    currentMonthlyExpenses;
    otherDebtObligations;
    collateral;
    guarantors;
    notes;
}
exports.CreateLoanApplicationDto = CreateLoanApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "dealerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested loan amount (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(2000000),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "requestedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan purpose' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested tenor in months' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "requestedTenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred repayment frequency', enum: dealer_loan_entity_1.RepaymentFrequency }),
    (0, class_validator_1.IsEnum)(dealer_loan_entity_1.RepaymentFrequency),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "preferredRepaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected monthly revenue (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "expectedMonthlyRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current monthly expenses (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "currentMonthlyExpenses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Other monthly debt obligations (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLoanApplicationDto.prototype, "otherDebtObligations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral details', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanCollateralDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateLoanApplicationDto.prototype, "collateral", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Guarantor information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LoanGuarantorDto),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateLoanApplicationDto.prototype, "guarantors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanApplicationDto.prototype, "notes", void 0);
class LoanTermsDto {
    approvedAmount;
    interestRate;
    tenorMonths;
    repaymentFrequency;
    amortizationMethod;
    installmentAmount;
    processingFee;
    penaltyRate;
    gracePeriodDays;
}
exports.LoanTermsDto = LoanTermsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approved loan amount (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "approvedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest rate (annual percentage)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan tenor in months' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Repayment frequency', enum: dealer_loan_entity_1.RepaymentFrequency }),
    (0, class_validator_1.IsEnum)(dealer_loan_entity_1.RepaymentFrequency),
    __metadata("design:type", String)
], LoanTermsDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amortization method', enum: dealer_loan_entity_1.AmortizationMethod }),
    (0, class_validator_1.IsEnum)(dealer_loan_entity_1.AmortizationMethod),
    __metadata("design:type", String)
], LoanTermsDto.prototype, "amortizationMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monthly installment amount (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing fee (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "processingFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Late payment penalty rate (%)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "penaltyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grace period days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], LoanTermsDto.prototype, "gracePeriodDays", void 0);
class ApproveLoanDto {
    loanTerms;
    approvalNotes;
    conditions;
}
exports.ApproveLoanDto = ApproveLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan terms' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LoanTermsDto),
    __metadata("design:type", LoanTermsDto)
], ApproveLoanDto.prototype, "loanTerms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval notes' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveLoanDto.prototype, "approvalNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conditions for disbursement', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ApproveLoanDto.prototype, "conditions", void 0);
class DisburseLoanDto {
    disbursementAmount;
    disbursementMethod;
    bankAccountDetails;
    expectedDisbursementDate;
    notes;
}
exports.DisburseLoanDto = DisburseLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disbursement amount (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DisburseLoanDto.prototype, "disbursementAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disbursement method' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisburseLoanDto.prototype, "disbursementMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account details for transfer', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DisburseLoanDto.prototype, "bankAccountDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected disbursement date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DisburseLoanDto.prototype, "expectedDisbursementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disbursement notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisburseLoanDto.prototype, "notes", void 0);
class LoanPaymentDto {
    amount;
    paymentMethod;
    transactionReference;
    paymentDate;
    notes;
}
exports.LoanPaymentDto = LoanPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanPaymentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction reference' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanPaymentDto.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LoanPaymentDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanPaymentDto.prototype, "notes", void 0);
class LoanRestructureDto {
    newTenorMonths;
    newInterestRate;
    newRepaymentFrequency;
    moratoriumMonths;
    restructureReason;
    additionalTerms;
}
exports.LoanRestructureDto = LoanRestructureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New tenor in months' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], LoanRestructureDto.prototype, "newTenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New interest rate (%)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], LoanRestructureDto.prototype, "newInterestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New repayment frequency', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(dealer_loan_entity_1.RepaymentFrequency),
    __metadata("design:type", String)
], LoanRestructureDto.prototype, "newRepaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Moratorium period (months)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], LoanRestructureDto.prototype, "moratoriumMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for restructuring' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoanRestructureDto.prototype, "restructureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional terms and conditions', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], LoanRestructureDto.prototype, "additionalTerms", void 0);
class AmortizationScheduleEntryDto {
    installmentNumber;
    dueDate;
    principalAmount;
    interestAmount;
    totalAmount;
    outstandingBalance;
    paymentStatus;
    actualPaymentDate;
}
exports.AmortizationScheduleEntryDto = AmortizationScheduleEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Installment number' }),
    __metadata("design:type", Number)
], AmortizationScheduleEntryDto.prototype, "installmentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due date' }),
    __metadata("design:type", Date)
], AmortizationScheduleEntryDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal amount' }),
    __metadata("design:type", Number)
], AmortizationScheduleEntryDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest amount' }),
    __metadata("design:type", Number)
], AmortizationScheduleEntryDto.prototype, "interestAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total installment amount' }),
    __metadata("design:type", Number)
], AmortizationScheduleEntryDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outstanding balance after payment' }),
    __metadata("design:type", Number)
], AmortizationScheduleEntryDto.prototype, "outstandingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status' }),
    __metadata("design:type", String)
], AmortizationScheduleEntryDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual payment date', required: false }),
    __metadata("design:type", Date)
], AmortizationScheduleEntryDto.prototype, "actualPaymentDate", void 0);
class LoanResponseDto {
    id;
    loanId;
    stationId;
    dealerId;
    principalAmount;
    interestRate;
    tenorMonths;
    repaymentFrequency;
    status;
    outstandingBalance;
    totalPaid;
    nextPaymentDate;
    installmentAmount;
    daysPastDue;
    amortizationSchedule;
    createdAt;
}
exports.LoanResponseDto = LoanResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan ID' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan reference number' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer ID' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "dealerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal amount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interest rate' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenor in months' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Repayment frequency' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "repaymentFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outstanding balance' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "outstandingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total paid' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "totalPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next payment date' }),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Installment amount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days past due' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "daysPastDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amortization schedule', type: [AmortizationScheduleEntryDto] }),
    __metadata("design:type", Array)
], LoanResponseDto.prototype, "amortizationSchedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation date' }),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=loan-management.dto.js.map