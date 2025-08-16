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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_registry_service_1 = require("./service-registry.service");
const register_service_dto_1 = require("./dto/register-service.dto");
let ServiceRegistryController = class ServiceRegistryController {
    serviceRegistryService;
    constructor(serviceRegistryService) {
        this.serviceRegistryService = serviceRegistryService;
    }
    async registerService(registerDto) {
        try {
            return await this.serviceRegistryService.registerService(registerDto);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to register service: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deregisterService(serviceId) {
        const success = await this.serviceRegistryService.deregisterService(serviceId);
        if (!success) {
            throw new common_1.HttpException('Service not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async updateHeartbeat(serviceId) {
        const success = await this.serviceRegistryService.updateHeartbeat(serviceId);
        if (!success) {
            throw new common_1.HttpException('Service not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true };
    }
    async getServices(type, status, name) {
        const allServices = await this.serviceRegistryService.getAllServices();
        let services = Object.values(allServices);
        // Apply filters
        if (type) {
            services = services.filter(service => service.type === type);
        }
        if (status) {
            services = services.filter(service => service.status === status);
        }
        if (name) {
            services = services.filter(service => service.name === name);
        }
        return services;
    }
    async getService(serviceId) {
        const service = await this.serviceRegistryService.getService(serviceId);
        if (!service) {
            throw new common_1.HttpException('Service not found', common_1.HttpStatus.NOT_FOUND);
        }
        return service;
    }
    async getServiceHealth(serviceId) {
        const health = await this.serviceRegistryService.getServiceHealth(serviceId);
        if (!health) {
            throw new common_1.HttpException('Service health data not found', common_1.HttpStatus.NOT_FOUND);
        }
        return health;
    }
    async getServiceMetrics(serviceId) {
        const metrics = await this.serviceRegistryService.getServiceMetrics(serviceId);
        if (!metrics) {
            throw new common_1.HttpException('Service metrics data not found', common_1.HttpStatus.NOT_FOUND);
        }
        return metrics;
    }
    async discoverService(serviceName, loadBalanced) {
        if (loadBalanced === true) {
            const service = await this.serviceRegistryService.getBalancedService(serviceName);
            if (!service) {
                throw new common_1.HttpException(`No healthy instances found for service: ${serviceName}`, common_1.HttpStatus.NOT_FOUND);
            }
            return service;
        }
        const services = await this.serviceRegistryService.getHealthyServices(serviceName);
        if (services.length === 0) {
            throw new common_1.HttpException(`No healthy instances found for service: ${serviceName}`, common_1.HttpStatus.NOT_FOUND);
        }
        return services;
    }
    async getRegistryHealth() {
        const allServices = await this.serviceRegistryService.getAllServices();
        const services = Object.values(allServices);
        const stats = services.reduce((acc, service) => {
            acc.total++;
            switch (service.status) {
                case register_service_dto_1.ServiceStatus.HEALTHY:
                    acc.healthy++;
                    break;
                case register_service_dto_1.ServiceStatus.UNHEALTHY:
                case register_service_dto_1.ServiceStatus.CRITICAL:
                    acc.unhealthy++;
                    break;
                case register_service_dto_1.ServiceStatus.STARTING:
                    acc.starting++;
                    break;
            }
            return acc;
        }, { total: 0, healthy: 0, unhealthy: 0, starting: 0 });
        return {
            status: 'healthy',
            timestamp: new Date(),
            services: stats,
        };
    }
};
exports.ServiceRegistryController = ServiceRegistryController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new service instance' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service successfully registered',
        type: 'ServiceInstance',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid service registration data'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_service_dto_1.RegisterServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "registerService", null);
__decorate([
    (0, common_1.Delete)('deregister/:serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Deregister a service instance' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Unique service identifier' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service successfully deregistered'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found'
    }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "deregisterService", null);
__decorate([
    (0, common_1.Put)('heartbeat/:serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service heartbeat' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Unique service identifier' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Heartbeat updated successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found'
    }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "updateHeartbeat", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all registered services' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        enum: register_service_dto_1.ServiceType,
        required: false,
        description: 'Filter by service type'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        enum: register_service_dto_1.ServiceStatus,
        required: false,
        description: 'Filter by service status'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'name',
        required: false,
        description: 'Filter by service name'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of registered services'
    }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "getServices", null);
__decorate([
    (0, common_1.Get)('services/:serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Unique service identifier' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service details'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found'
    }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "getService", null);
__decorate([
    (0, common_1.Get)('services/:serviceId/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service health status' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Unique service identifier' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service health details'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service or health data not found'
    }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "getServiceHealth", null);
__decorate([
    (0, common_1.Get)('services/:serviceId/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service metrics' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Unique service identifier' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service metrics data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service or metrics data not found'
    }),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "getServiceMetrics", null);
__decorate([
    (0, common_1.Get)('discovery/:serviceName'),
    (0, swagger_1.ApiOperation)({ summary: 'Discover healthy service instances by name' }),
    (0, swagger_1.ApiParam)({ name: 'serviceName', description: 'Service name to discover' }),
    (0, swagger_1.ApiQuery)({
        name: 'loadBalanced',
        required: false,
        description: 'Return single load-balanced instance'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Discovered service instances'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No healthy services found'
    }),
    __param(0, (0, common_1.Param)('serviceName')),
    __param(1, (0, common_1.Query)('loadBalanced')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "discoverService", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for service registry itself' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service registry is healthy'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceRegistryController.prototype, "getRegistryHealth", null);
exports.ServiceRegistryController = ServiceRegistryController = __decorate([
    (0, swagger_1.ApiTags)('service-registry'),
    (0, common_1.Controller)('registry'),
    __metadata("design:paramtypes", [service_registry_service_1.ServiceRegistryService])
], ServiceRegistryController);
//# sourceMappingURL=service-registry.controller.js.map