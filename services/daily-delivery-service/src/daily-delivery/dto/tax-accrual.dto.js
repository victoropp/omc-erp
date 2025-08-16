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
exports.TaxAccrualSummaryDto = exports.TaxAccrualResponseDto = exports.QueryTaxAccrualDto = exports.MarkTaxAccrualPaidDto = exports.UpdateTaxAccrualDto = exports.CreateTaxAccrualDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const tax_accrual_entity_1 = require("../entities/tax-accrual.entity");
class CreateTaxAccrualDto {
    deliveryId;
    taxType;
    taxRate;
    taxableAmount;
    taxAmount;
    taxAccountCode;
    liabilityAccountCode;
    taxAuthority;
    dueDate;
    currencyCode;
    exchangeRate;
    baseTaxAmount;
    description;
    createdBy;
}
exports.CreateTaxAccrualDto = CreateTaxAccrualDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "deliveryId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(tax_accrual_entity_1.TaxType),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "taxType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTaxAccrualDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTaxAccrualDto.prototype, "taxableAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTaxAccrualDto.prototype, "taxAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "taxAccountCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "liabilityAccountCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "taxAuthority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTaxAccrualDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "currencyCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 6 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTaxAccrualDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTaxAccrualDto.prototype, "baseTaxAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTaxAccrualDto.prototype, "createdBy", void 0);
class UpdateTaxAccrualDto {
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
    updatedBy;
}
exports.UpdateTaxAccrualDto = UpdateTaxAccrualDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateTaxAccrualDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTaxAccrualDto.prototype, "taxableAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTaxAccrualDto.prototype, "taxAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "taxAccountCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "liabilityAccountCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "taxAuthority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdateTaxAccrualDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tax_accrual_entity_1.PaymentStatus),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdateTaxAccrualDto.prototype, "paymentDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "paymentReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "currencyCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 6 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTaxAccrualDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateTaxAccrualDto.prototype, "baseTaxAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTaxAccrualDto.prototype, "updatedBy", void 0);
class MarkTaxAccrualPaidDto {
    paymentDate;
    paymentReference;
    updatedBy;
}
exports.MarkTaxAccrualPaidDto = MarkTaxAccrualPaidDto;
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], MarkTaxAccrualPaidDto.prototype, "paymentDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], MarkTaxAccrualPaidDto.prototype, "paymentReference", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MarkTaxAccrualPaidDto.prototype, "updatedBy", void 0);
class QueryTaxAccrualDto {
    deliveryId;
    taxType;
    paymentStatus;
    taxAuthority;
    dueDateFrom;
    dueDateTo;
    overdue;
    page = 1;
    limit = 20;
    sortBy = 'dueDate';
    sortOrder = 'ASC';
}
exports.QueryTaxAccrualDto = QueryTaxAccrualDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "deliveryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tax_accrual_entity_1.TaxType),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "taxType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tax_accrual_entity_1.PaymentStatus),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "taxAuthority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], QueryTaxAccrualDto.prototype, "dueDateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], QueryTaxAccrualDto.prototype, "dueDateTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], QueryTaxAccrualDto.prototype, "overdue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryTaxAccrualDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryTaxAccrualDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxAccrualDto.prototype, "sortOrder", void 0);
class TaxAccrualResponseDto {
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
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    // Computed properties
    isOverdue;
    daysOverdue;
    daysUntilDue;
    effectiveTaxRate;
}
exports.TaxAccrualResponseDto = TaxAccrualResponseDto;
class TaxAccrualSummaryDto {
    totalAccruals;
    totalAmount;
    pendingAmount;
    paidAmount;
    overdueAmount;
    pendingCount;
    paidCount;
    overdueCount;
    byTaxType;
    byAuthority;
}
exports.TaxAccrualSummaryDto = TaxAccrualSummaryDto;
//# sourceMappingURL=tax-accrual.dto.js.map