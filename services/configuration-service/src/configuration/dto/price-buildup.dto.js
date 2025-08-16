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
exports.AuditTrailQueryDto = exports.PriceBreakdownDto = exports.PriceCalculationResponseDto = exports.PriceCalculationRequestDto = exports.ExcelUploadDto = exports.BulkComponentUpdateDto = exports.BulkPriceUpdateDto = exports.StationTypeConfigurationDto = exports.PriceBuildupQueryDto = exports.PublishPriceBuildupDto = exports.ApprovePriceBuildupDto = exports.UpdatePriceBuildupVersionDto = exports.CreatePriceBuildupVersionDto = exports.UpdatePriceComponentDto = exports.CreatePriceComponentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const price_buildup_entity_1 = require("../entities/price-buildup.entity");
class CreatePriceComponentDto {
    componentType;
    componentName;
    category;
    amount;
    currency = 'GHS';
    isPercentage = false;
    percentageBase;
    calculationFormula;
    stationType;
    isMandatory = true;
    isConfigurable = true;
    minAmount;
    maxAmount;
    displayOrder = 0;
    description;
    regulatoryReference;
    externalSource;
    externalReference;
    effectiveDate;
    expiryDate;
}
exports.CreatePriceComponentDto = CreatePriceComponentDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "componentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "componentName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentCategory),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceComponentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceComponentDto.prototype, "isPercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "percentageBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "calculationFormula", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.StationType),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceComponentDto.prototype, "isMandatory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceComponentDto.prototype, "isConfigurable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceComponentDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceComponentDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePriceComponentDto.prototype, "displayOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "regulatoryReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "externalSource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceComponentDto.prototype, "externalReference", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceComponentDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceComponentDto.prototype, "expiryDate", void 0);
class UpdatePriceComponentDto {
    componentName;
    amount;
    currency;
    isPercentage;
    percentageBase;
    calculationFormula;
    stationType;
    isMandatory;
    isConfigurable;
    minAmount;
    maxAmount;
    displayOrder;
    description;
    regulatoryReference;
    externalSource;
    externalReference;
    effectiveDate;
    expiryDate;
    isActive;
}
exports.UpdatePriceComponentDto = UpdatePriceComponentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "componentName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceComponentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceComponentDto.prototype, "isPercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "percentageBase", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "calculationFormula", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.StationType),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceComponentDto.prototype, "isMandatory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceComponentDto.prototype, "isConfigurable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceComponentDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceComponentDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceComponentDto.prototype, "displayOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "regulatoryReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "externalSource", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceComponentDto.prototype, "externalReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdatePriceComponentDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdatePriceComponentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceComponentDto.prototype, "isActive", void 0);
class CreatePriceBuildupVersionDto {
    productType;
    effectiveDate;
    expiryDate;
    changeReason;
    approvalRequired = true;
    components;
}
exports.CreatePriceBuildupVersionDto = CreatePriceBuildupVersionDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType),
    __metadata("design:type", String)
], CreatePriceBuildupVersionDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceBuildupVersionDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePriceBuildupVersionDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceBuildupVersionDto.prototype, "changeReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePriceBuildupVersionDto.prototype, "approvalRequired", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePriceComponentDto),
    __metadata("design:type", Array)
], CreatePriceBuildupVersionDto.prototype, "components", void 0);
class UpdatePriceBuildupVersionDto {
    effectiveDate;
    expiryDate;
    changeReason;
    status;
    approvalRequired;
    approvalNotes;
    components;
}
exports.UpdatePriceBuildupVersionDto = UpdatePriceBuildupVersionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdatePriceBuildupVersionDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdatePriceBuildupVersionDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceBuildupVersionDto.prototype, "changeReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentStatus),
    __metadata("design:type", String)
], UpdatePriceBuildupVersionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePriceBuildupVersionDto.prototype, "approvalRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceBuildupVersionDto.prototype, "approvalNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdatePriceComponentDto),
    __metadata("design:type", Array)
], UpdatePriceBuildupVersionDto.prototype, "components", void 0);
class ApprovePriceBuildupDto {
    approvedBy;
    approvalNotes;
    publishImmediately = false;
}
exports.ApprovePriceBuildupDto = ApprovePriceBuildupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovePriceBuildupDto.prototype, "approvedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovePriceBuildupDto.prototype, "approvalNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApprovePriceBuildupDto.prototype, "publishImmediately", void 0);
class PublishPriceBuildupDto {
    publishedBy;
    publishDate;
}
exports.PublishPriceBuildupDto = PublishPriceBuildupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishPriceBuildupDto.prototype, "publishedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PublishPriceBuildupDto.prototype, "publishDate", void 0);
class PriceBuildupQueryDto {
    productType;
    status;
    effectiveDate;
    fromDate;
    toDate;
    createdBy;
    includeComponents = true;
    includeStationTypePricing = true;
    page = 1;
    limit = 20;
}
exports.PriceBuildupQueryDto = PriceBuildupQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType),
    __metadata("design:type", String)
], PriceBuildupQueryDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentStatus),
    __metadata("design:type", String)
], PriceBuildupQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PriceBuildupQueryDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PriceBuildupQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PriceBuildupQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceBuildupQueryDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PriceBuildupQueryDto.prototype, "includeComponents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PriceBuildupQueryDto.prototype, "includeStationTypePricing", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PriceBuildupQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PriceBuildupQueryDto.prototype, "limit", void 0);
class StationTypeConfigurationDto {
    stationType;
    stationTypeName;
    description;
    isActive = true;
    applicableComponents;
    supportedProducts;
    baseDealerMargin;
    baseTransportCost;
    regulatoryCompliance;
    operatingModel;
    requiresSpecialPricing = false;
}
exports.StationTypeConfigurationDto = StationTypeConfigurationDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.StationType),
    __metadata("design:type", String)
], StationTypeConfigurationDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StationTypeConfigurationDto.prototype, "stationTypeName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StationTypeConfigurationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StationTypeConfigurationDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType, { each: true }),
    __metadata("design:type", Array)
], StationTypeConfigurationDto.prototype, "applicableComponents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType, { each: true }),
    __metadata("design:type", Array)
], StationTypeConfigurationDto.prototype, "supportedProducts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StationTypeConfigurationDto.prototype, "baseDealerMargin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StationTypeConfigurationDto.prototype, "baseTransportCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StationTypeConfigurationDto.prototype, "regulatoryCompliance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StationTypeConfigurationDto.prototype, "operatingModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StationTypeConfigurationDto.prototype, "requiresSpecialPricing", void 0);
class BulkPriceUpdateDto {
    productType;
    effectiveDate;
    changeReason;
    componentUpdates;
    createNewVersion = true;
    requireApproval = true;
}
exports.BulkPriceUpdateDto = BulkPriceUpdateDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType),
    __metadata("design:type", String)
], BulkPriceUpdateDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], BulkPriceUpdateDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkPriceUpdateDto.prototype, "changeReason", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkComponentUpdateDto),
    __metadata("design:type", Array)
], BulkPriceUpdateDto.prototype, "componentUpdates", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkPriceUpdateDto.prototype, "createNewVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkPriceUpdateDto.prototype, "requireApproval", void 0);
class BulkComponentUpdateDto {
    componentType;
    newAmount;
    updateReason;
    stationType;
}
exports.BulkComponentUpdateDto = BulkComponentUpdateDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType),
    __metadata("design:type", String)
], BulkComponentUpdateDto.prototype, "componentType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkComponentUpdateDto.prototype, "newAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkComponentUpdateDto.prototype, "updateReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.StationType),
    __metadata("design:type", String)
], BulkComponentUpdateDto.prototype, "stationType", void 0);
class ExcelUploadDto {
    productType;
    effectiveDate;
    changeReason;
    uploadedBy;
    validateOnly = false;
    overwriteExisting = false;
}
exports.ExcelUploadDto = ExcelUploadDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType),
    __metadata("design:type", String)
], ExcelUploadDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ExcelUploadDto.prototype, "effectiveDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExcelUploadDto.prototype, "changeReason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExcelUploadDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ExcelUploadDto.prototype, "validateOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ExcelUploadDto.prototype, "overwriteExisting", void 0);
class PriceCalculationRequestDto {
    productType;
    stationType;
    calculationDate;
    volume;
    includeBreakdown = true;
    excludeComponents;
}
exports.PriceCalculationRequestDto = PriceCalculationRequestDto;
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.ProductType),
    __metadata("design:type", String)
], PriceCalculationRequestDto.prototype, "productType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.StationType),
    __metadata("design:type", String)
], PriceCalculationRequestDto.prototype, "stationType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PriceCalculationRequestDto.prototype, "calculationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PriceCalculationRequestDto.prototype, "volume", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PriceCalculationRequestDto.prototype, "includeBreakdown", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(price_buildup_entity_1.PriceComponentType, { each: true }),
    __metadata("design:type", Array)
], PriceCalculationRequestDto.prototype, "excludeComponents", void 0);
class PriceCalculationResponseDto {
    productType;
    stationType;
    calculationDate;
    totalPrice;
    currency;
    breakdown;
    metadata;
}
exports.PriceCalculationResponseDto = PriceCalculationResponseDto;
class PriceBreakdownDto {
    componentType;
    componentName;
    category;
    amount;
    isPercentage;
    calculationBase;
    displayOrder;
    description;
}
exports.PriceBreakdownDto = PriceBreakdownDto;
class AuditTrailQueryDto {
    buildupVersionId;
    componentId;
    actionType;
    actionBy;
    fromDate;
    toDate;
    page = 1;
    limit = 50;
}
exports.AuditTrailQueryDto = AuditTrailQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AuditTrailQueryDto.prototype, "buildupVersionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AuditTrailQueryDto.prototype, "componentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditTrailQueryDto.prototype, "actionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditTrailQueryDto.prototype, "actionBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], AuditTrailQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], AuditTrailQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AuditTrailQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AuditTrailQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=price-buildup.dto.js.map