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
exports.QueryDailyDeliveryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const daily_delivery_entity_1 = require("../entities/daily-delivery.entity");
class QueryDailyDeliveryDto {
    page = 1;
    limit = 20;
    search;
    status;
    deliveryType;
    productType;
    supplierId;
    customerId;
    depotId;
    transporterId;
    fromDate;
    toDate;
    fromCreatedDate;
    toCreatedDate;
    minQuantity;
    maxQuantity;
    minValue;
    maxValue;
    vehicleRegistrationNumber;
    psaNumber;
    waybillNumber;
    invoiceNumber;
    npaPermitNumber;
    gpsTrackedOnly;
    delayedOnly;
    invoicedOnly;
    pendingApprovalsOnly;
    sortBy = 'createdAt';
    sortOrder = 'DESC';
    includeLineItems;
    includeApprovalHistory;
    includeDocuments;
}
exports.QueryDailyDeliveryDto = QueryDailyDeliveryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for delivery number, customer name, etc.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: daily_delivery_entity_1.DeliveryStatus, description: 'Filter by delivery status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.DeliveryStatus),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: daily_delivery_entity_1.DeliveryType, description: 'Filter by delivery type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.DeliveryType),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: daily_delivery_entity_1.ProductGrade, description: 'Filter by product type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(daily_delivery_entity_1.ProductGrade),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "productType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by depot ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "depotId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by transporter ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "transporterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter from delivery date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter to delivery date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter from created date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "fromCreatedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter to created date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "toCreatedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum quantity in litres' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "minQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum quantity in litres' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "maxQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum total value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "minValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum total value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QueryDailyDeliveryDto.prototype, "maxValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by vehicle registration number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "vehicleRegistrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by PSA number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "psaNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by waybill number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "waybillNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by invoice number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by NPA permit number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "npaPermitNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only GPS tracked deliveries' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "gpsTrackedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only delayed deliveries' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "delayedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only invoiced deliveries' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "invoicedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only pending approvals' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "pendingApprovalsOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', default: 'createdAt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC']),
    __metadata("design:type", String)
], QueryDailyDeliveryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include line items in response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "includeLineItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include approval history in response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "includeApprovalHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include documents in response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryDailyDeliveryDto.prototype, "includeDocuments", void 0);
//# sourceMappingURL=query-daily-delivery.dto.js.map