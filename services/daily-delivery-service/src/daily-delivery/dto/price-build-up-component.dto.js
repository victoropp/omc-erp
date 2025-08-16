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
exports.PriceBuildUpComponentResponseDto = exports.QueryPriceBuildUpComponentDto = exports.UpdatePriceBuildUpComponentDto = exports.CreatePriceBuildUpComponentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const price_build_up_component_entity_1 = require("../entities/price-build-up-component.entity");
const daily_delivery_entity_1 = require("../entities/daily-delivery.entity");
class CreatePriceBuildUpComponentDto {
    componentCode;
    componentName;
    componentType;
    productGrade;
    stationType;
    effectiveDate;
    expiryDate;
    componentValue;
    valueType;
    calculationFormula;
    currencyCode;
    isActive;
    isMandatory;
    displayOrder;
    description;
    regulatoryReference;
    createdBy;
}
exports.CreatePriceBuildUpComponentDto = CreatePriceBuildUpComponentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "componentCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "componentName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(price_build_up_component_entity_1.ComponentType),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "componentType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.ProductGrade),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "productGrade", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.StationType),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceBuildUpComponentDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceBuildUpComponentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceBuildUpComponentDto.prototype, "componentValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(price_build_up_component_entity_1.ValueType),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "valueType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "calculationFormula", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "currencyCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceBuildUpComponentDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceBuildUpComponentDto.prototype, "isMandatory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceBuildUpComponentDto.prototype, "displayOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "regulatoryReference", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePriceBuildUpComponentDto.prototype, "createdBy", void 0);
class UpdatePriceBuildUpComponentDto {
    componentName;
    componentType;
    expiryDate;
    componentValue;
    valueType;
    calculationFormula;
    currencyCode;
    isActive;
    isMandatory;
    displayOrder;
    description;
    regulatoryReference;
    updatedBy;
}
exports.UpdatePriceBuildUpComponentDto = UpdatePriceBuildUpComponentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "componentName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_build_up_component_entity_1.ComponentType),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "componentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdatePriceBuildUpComponentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceBuildUpComponentDto.prototype, "componentValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_build_up_component_entity_1.ValueType),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "valueType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "calculationFormula", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "currencyCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceBuildUpComponentDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceBuildUpComponentDto.prototype, "isMandatory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceBuildUpComponentDto.prototype, "displayOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "regulatoryReference", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePriceBuildUpComponentDto.prototype, "updatedBy", void 0);
class QueryPriceBuildUpComponentDto {
    productGrade;
    stationType;
    componentType;
    effectiveDate;
    isActive;
    search;
    page = 1;
    limit = 20;
    sortBy = 'displayOrder';
    sortOrder = 'ASC';
}
exports.QueryPriceBuildUpComponentDto = QueryPriceBuildUpComponentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.ProductGrade),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "productGrade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.StationType),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_build_up_component_entity_1.ComponentType),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "componentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], QueryPriceBuildUpComponentDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryPriceBuildUpComponentDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryPriceBuildUpComponentDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryPriceBuildUpComponentDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceBuildUpComponentDto.prototype, "sortOrder", void 0);
class PriceBuildUpComponentResponseDto {
    id;
    componentCode;
    componentName;
    componentType;
    productGrade;
    stationType;
    effectiveDate;
    expiryDate;
    componentValue;
    valueType;
    calculationFormula;
    currencyCode;
    isActive;
    isMandatory;
    displayOrder;
    description;
    regulatoryReference;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
}
exports.PriceBuildUpComponentResponseDto = PriceBuildUpComponentResponseDto;
//# sourceMappingURL=price-build-up-component.dto.js.map