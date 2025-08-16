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
exports.CreateDailyDeliveryDto = exports.CreateDeliveryLineItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const daily_delivery_entity_1 = require("../entities/daily-delivery.entity");
class CreateDeliveryLineItemDto {
    lineNumber;
    productCode;
    productName;
    productGrade;
    quantity;
    unitPrice;
    tankNumber;
    compartmentNumber;
    batchNumber;
    qualitySpecifications;
    // Price Component Breakdown
    baseUnitPrice;
    totalTaxes;
    totalLevies;
    totalMargins;
    priceComponents;
    costCenterCode;
    profitCenterCode;
    glAccountCode;
}
exports.CreateDeliveryLineItemDto = CreateDeliveryLineItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Line number' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "lineNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "productCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: daily_delivery_entity_1.ProductGrade, description: 'Product grade' }),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.ProductGrade),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "productGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity in litres' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tank number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "tankNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compartment number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "compartmentNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Batch number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 100),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quality specifications (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "qualitySpecifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Base unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "baseUnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total taxes for this line' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "totalTaxes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total levies for this line' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "totalLevies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total margins for this line' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryLineItemDto.prototype, "totalMargins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price components breakdown (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "priceComponents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost center code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "costCenterCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Profit center code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "profitCenterCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'GL account code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    __metadata("design:type", String)
], CreateDeliveryLineItemDto.prototype, "glAccountCode", void 0);
class CreateDailyDeliveryDto {
    tenantId;
    deliveryDate;
    supplierId;
    depotId;
    customerId;
    customerName;
    deliveryLocation;
    stationType;
    revenueRecognitionType;
    psaNumber;
    waybillNumber;
    invoiceNumber;
    vehicleRegistrationNumber;
    transporterId;
    transporterName;
    productType;
    productDescription;
    quantityLitres;
    unitPrice;
    currency;
    deliveryType;
    loadingTerminal;
    dischargeTerminal;
    plannedDeliveryTime;
    loadingStartTime;
    loadingEndTime;
    dischargeStartTime;
    dischargeEndTime;
    // Quality Control
    temperatureAtLoading;
    temperatureAtDischarge;
    densityAtLoading;
    densityAtDischarge;
    // Tank Information
    sourceTankNumber;
    destinationTankNumber;
    compartmentNumbers;
    sealNumbers;
    // Driver Information
    driverId;
    driverName;
    driverLicenseNumber;
    driverPhone;
    // Ghana Compliance
    npaPermitNumber;
    customsEntryNumber;
    customsDutyPaid;
    petroleumTaxAmount;
    energyFundLevy;
    roadFundLevy;
    priceStabilizationLevy;
    primaryDistributionMargin;
    marketingMargin;
    dealerMargin;
    unifiedPetroleumPriceFundLevy;
    // Price Build-up Integration
    priceBuilUpSnapshot;
    dealerMarginSnapshot;
    uppfLevySnapshot;
    pricingWindowId;
    // GPS and Tracking
    gpsTrackingEnabled;
    securityEscortRequired;
    securityEscortDetails;
    // Insurance
    insurancePolicyNumber;
    insuranceCoverageAmount;
    riskAssessmentScore;
    // Environmental
    environmentalPermitNumber;
    emissionCertificateNumber;
    // Additional Information
    deliveryInstructions;
    specialHandlingRequirements;
    remarks;
    internalNotes;
    // Line Items
    lineItems;
    createdBy;
}
exports.CreateDailyDeliveryDto = CreateDailyDeliveryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenant ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery date', example: '2024-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Depot ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "depotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery location' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1000),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "deliveryLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: daily_delivery_entity_1.StationType, description: 'Station type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.StationType),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "stationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: daily_delivery_entity_1.RevenueRecognitionType, description: 'Revenue recognition type', default: daily_delivery_entity_1.RevenueRecognitionType.IMMEDIATE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.RevenueRecognitionType),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "revenueRecognitionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PSA number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "psaNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Waybill number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "waybillNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle registration number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "vehicleRegistrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transporter ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "transporterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transporter name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "transporterName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: daily_delivery_entity_1.ProductGrade, description: 'Product type' }),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.ProductGrade),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "productDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity in litres' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "quantityLitres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency code', default: 'GHS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: daily_delivery_entity_1.DeliveryType, description: 'Delivery type' }),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.DeliveryType),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loading terminal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "loadingTerminal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discharge terminal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "dischargeTerminal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Planned delivery time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "plannedDeliveryTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loading start time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "loadingStartTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loading end time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "loadingEndTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discharge start time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "dischargeStartTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discharge end time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "dischargeEndTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Temperature at loading (Celsius)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "temperatureAtLoading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Temperature at discharge (Celsius)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(-50),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "temperatureAtDischarge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Density at loading (g/cm³)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.Max)(1.5),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "densityAtLoading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Density at discharge (g/cm³)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.Max)(1.5),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "densityAtDischarge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source tank number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "sourceTankNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Destination tank number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "destinationTankNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compartment numbers (JSON array)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "compartmentNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Seal numbers (JSON array)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "sealNumbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Driver ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "driverId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Driver name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 255),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "driverName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Driver license number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "driverLicenseNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Driver phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "driverPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'NPA permit number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "npaPermitNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customs entry number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "customsEntryNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customs duty paid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "customsDutyPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Petroleum tax amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "petroleumTaxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Energy fund levy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "energyFundLevy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Road fund levy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "roadFundLevy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price stabilization levy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "priceStabilizationLevy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary distribution margin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "primaryDistributionMargin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Marketing margin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "marketingMargin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dealer margin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "dealerMargin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UPPF levy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "unifiedPetroleumPriceFundLevy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price build-up snapshot (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "priceBuilUpSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dealer margin snapshot' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "dealerMarginSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UPPF levy snapshot' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "uppfLevySnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pricing window ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "pricingWindowId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'GPS tracking enabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDailyDeliveryDto.prototype, "gpsTrackingEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Security escort required' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDailyDeliveryDto.prototype, "securityEscortRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Security escort details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "securityEscortDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Insurance policy number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 100),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "insurancePolicyNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Insurance coverage amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "insuranceCoverageAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Risk assessment score (1-10)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateDailyDeliveryDto.prototype, "riskAssessmentScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Environmental permit number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "environmentalPermitNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emission certificate number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "emissionCertificateNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery instructions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Special handling requirements' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "specialHandlingRequirements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Remarks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Internal notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "internalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery line items', type: [CreateDeliveryLineItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateDeliveryLineItemDto),
    __metadata("design:type", Array)
], CreateDailyDeliveryDto.prototype, "lineItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by user ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDailyDeliveryDto.prototype, "createdBy", void 0);
//# sourceMappingURL=create-daily-delivery.dto.js.map