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
exports.QueryStationsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const shared_types_1 = require("@omc-erp/shared-types");
class QueryStationsDto {
    page;
    limit;
    search;
    status;
    region;
    isActive;
    latitude;
    longitude;
    radius;
}
exports.QueryStationsDto = QueryStationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryStationsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryStationsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStationsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.StationStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.StationStatus),
    __metadata("design:type", String)
], QueryStationsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStationsDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryStationsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Latitude for proximity search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], QueryStationsDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Longitude for proximity search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], QueryStationsDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Radius in kilometers for proximity search', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], QueryStationsDto.prototype, "radius", void 0);
//# sourceMappingURL=query-stations.dto.js.map