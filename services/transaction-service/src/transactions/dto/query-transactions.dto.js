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
exports.QueryTransactionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const shared_types_1 = require("@omc-erp/shared-types");
class QueryTransactionsDto {
    page;
    limit;
    startDate;
    endDate;
    status;
    paymentStatus;
    fuelType;
    stationId;
    pumpId;
    customerId;
    attendantId;
    shiftId;
}
exports.QueryTransactionsDto = QueryTransactionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryTransactionsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryTransactionsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '2024-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '2024-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.TransactionStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.TransactionStatus),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.PaymentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.PaymentStatus),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.FuelType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.FuelType),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "pumpId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "attendantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "shiftId", void 0);
//# sourceMappingURL=query-transactions.dto.js.map