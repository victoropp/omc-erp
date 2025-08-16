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
exports.RegisterServiceDto = exports.ServiceType = exports.ServiceStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["STARTING"] = "starting";
    ServiceStatus["HEALTHY"] = "healthy";
    ServiceStatus["UNHEALTHY"] = "unhealthy";
    ServiceStatus["CRITICAL"] = "critical";
    ServiceStatus["MAINTENANCE"] = "maintenance";
    ServiceStatus["SHUTDOWN"] = "shutdown";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["API"] = "api";
    ServiceType["WORKER"] = "worker";
    ServiceType["DATABASE"] = "database";
    ServiceType["CACHE"] = "cache";
    ServiceType["GATEWAY"] = "gateway";
    ServiceType["EXTERNAL"] = "external";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
class RegisterServiceDto {
    name;
    version;
    host;
    port;
    type;
    healthEndpoint = '/health';
    tags = [];
    metadata = {};
    dependencies = [];
    weight = 100;
    environment = process.env.NODE_ENV || 'development';
}
exports.RegisterServiceDto = RegisterServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique service name',
        example: 'auth-service',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service version',
        example: '1.0.0',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service host/IP address',
        example: 'localhost',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service port',
        example: 3001,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RegisterServiceDto.prototype, "port", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service type',
        enum: ServiceType,
        example: ServiceType.API,
    }),
    (0, class_validator_1.IsEnum)(ServiceType),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Health check endpoint',
        example: '/health',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "healthEndpoint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service tags for categorization',
        example: ['authentication', 'security'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RegisterServiceDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service metadata',
        example: { database: 'postgres', cache: 'redis' },
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RegisterServiceDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service dependencies',
        example: ['postgres', 'redis'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RegisterServiceDto.prototype, "dependencies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Load balancing weight',
        example: 100,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RegisterServiceDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service environment',
        example: 'production',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterServiceDto.prototype, "environment", void 0);
//# sourceMappingURL=register-service.dto.js.map