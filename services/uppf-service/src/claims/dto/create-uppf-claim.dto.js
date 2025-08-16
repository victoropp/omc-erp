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
exports.CreateUPPFClaimDto = exports.GPSPointDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class GPSPointDto {
    latitude;
    longitude;
    timestamp;
    speed;
}
exports.GPSPointDto = GPSPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.6037 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GPSPointDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -0.1870 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GPSPointDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-15T14:30:00Z' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSPointDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 65.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GPSPointDto.prototype, "speed", void 0);
class CreateUPPFClaimDto {
    deliveryId;
    routeId;
    kmActual;
    litresMoved;
    windowId;
    gpsTrace;
    waybillNumber;
    evidenceLinks;
    notes;
}
exports.CreateUPPFClaimDto = CreateUPPFClaimDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DEL-001', description: 'Delivery consignment ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateUPPFClaimDto.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'R-ACCRA-BONGO', description: 'Route identifier' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUPPFClaimDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 713.4, description: 'Actual kilometers traveled' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUPPFClaimDto.prototype, "kmActual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 36000, description: 'Litres delivered and received' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], CreateUPPFClaimDto.prototype, "litresMoved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025W15', description: 'Pricing window ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUPPFClaimDto.prototype, "windowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [GPSPointDto],
        description: 'GPS trace points for route verification'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GPSPointDto),
    __metadata("design:type", Array)
], CreateUPPFClaimDto.prototype, "gpsTrace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'WB-2025-001', description: 'Waybill reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUPPFClaimDto.prototype, "waybillNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Evidence document links (waybill, GRN, weighbridge tickets, etc.)',
        example: ['waybill_001.pdf', 'grn_station_045.pdf', 'weighbridge_ticket.jpg']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUPPFClaimDto.prototype, "evidenceLinks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Additional notes for the claim' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUPPFClaimDto.prototype, "notes", void 0);
//# sourceMappingURL=create-uppf-claim.dto.js.map