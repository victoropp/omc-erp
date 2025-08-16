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
exports.CalculatePriceDto = exports.PriceOverrideDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class PriceOverrideDto {
    componentCode;
    value;
    reason;
}
exports.PriceOverrideDto = PriceOverrideDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EXREF', description: 'Component code to override' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceOverrideDto.prototype, "componentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8.904, description: 'Override value' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PriceOverrideDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Reason for override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceOverrideDto.prototype, "reason", void 0);
class CalculatePriceDto {
    stationId;
    productId;
    windowId;
    overrides;
    exRefineryPrice;
    justification;
}
exports.CalculatePriceDto = CalculatePriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PMS', description: 'Product code (PMS, AGO, LPG)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025W15' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "windowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [PriceOverrideDto],
        description: 'Optional component overrides for manual adjustments'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PriceOverrideDto),
    __metadata("design:type", Array)
], CalculatePriceDto.prototype, "overrides", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Ex-refinery price override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePriceDto.prototype, "exRefineryPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Justification for manual overrides' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePriceDto.prototype, "justification", void 0);
//# sourceMappingURL=calculate-price.dto.js.map