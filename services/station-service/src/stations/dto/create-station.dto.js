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
exports.CreateStationDto = exports.LocationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class LocationDto {
    latitude;
    longitude;
    address;
    region;
}
exports.LocationDto = LocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.6037, description: 'Latitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], LocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -0.1870, description: 'Longitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], LocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Accra, Greater Accra Region', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AMA123', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "region", void 0);
class CreateStationDto {
    name;
    code;
    address;
    phone;
    email;
    location;
    managerName;
    managerPhone;
    managerEmail;
    operatingHoursStart;
    operatingHoursEnd;
    isActive;
    facilities;
}
exports.CreateStationDto = CreateStationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Shell Adabraka Station' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SHELL_ADA_001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Adabraka Road, Accra' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+233244123456' }),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], CreateStationDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager@shelladabraka.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: LocationDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], CreateStationDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "managerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+233244654321', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], CreateStationDto.prototype, "managerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'manager@email.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "managerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '06:00', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "operatingHoursStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22:00', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStationDto.prototype, "operatingHoursEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateStationDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            hasCarWash: true,
            hasShop: true,
            hasMaintenance: false,
            totalPumps: 6,
            hasATM: true
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateStationDto.prototype, "facilities", void 0);
//# sourceMappingURL=create-station.dto.js.map