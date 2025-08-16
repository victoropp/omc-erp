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
exports.UpdateTransactionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_transaction_dto_1 = require("./create-transaction.dto");
const class_validator_1 = require("class-validator");
const shared_types_1 = require("@omc-erp/shared-types");
const swagger_2 = require("@nestjs/swagger");
class UpdateTransactionDto extends (0, swagger_1.PartialType)(create_transaction_dto_1.CreateTransactionDto) {
    status;
    paymentStatus;
    paymentReference;
    notes;
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, swagger_2.ApiProperty)({ enum: shared_types_1.TransactionStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.TransactionStatus),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ enum: shared_types_1.PaymentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.PaymentStatus),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "notes", void 0);
//# sourceMappingURL=update-transaction.dto.js.map