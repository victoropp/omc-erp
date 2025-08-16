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
exports.CreateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const shared_types_1 = require("@omc-erp/shared-types");
class CreateTransactionDto {
    stationId;
    pumpId;
    attendantId;
    customerId;
    shiftId;
    fuelType;
    quantity;
    unitPrice;
    paymentMethod;
    paymentDetails;
    posReference;
    autoProcessPayment;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174001' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "pumpId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174002', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "attendantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174003', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174004', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "shiftId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.FuelType, example: shared_types_1.FuelType.PMS }),
    (0, class_validator_1.IsEnum)(shared_types_1.FuelType),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.5, description: 'Quantity in liters' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.001),
    (0, class_validator_1.Max)(50000),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15.75, description: 'Unit price per liter' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.PaymentMethod, example: shared_types_1.PaymentMethod.CASH }),
    (0, class_validator_1.IsEnum)(shared_types_1.PaymentMethod),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTransactionDto.prototype, "paymentDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'POS123456', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "posReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTransactionDto.prototype, "autoProcessPayment", void 0);
//# sourceMappingURL=create-transaction.dto.js.map