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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ServiceRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistryService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const cache_service_1 = require("../common/cache.service");
const register_service_dto_1 = require("./dto/register-service.dto");
let ServiceRegistryService = ServiceRegistryService_1 = class ServiceRegistryService {
    cacheService;
    logger = new common_1.Logger(ServiceRegistryService_1.name);
    SERVICES_KEY = 'services:registry';
    SERVICE_PREFIX = 'service:';
    HEALTH_PREFIX = 'health:';
    METRICS_PREFIX = 'metrics:';
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    /**
     * Register a new service instance
     */
    async registerService(registerDto) {
        const serviceId = this.generateServiceId(registerDto.name, registerDto.host, registerDto.port);
        const service = {
            id: serviceId,
            ...registerDto,
            healthEndpoint: registerDto.healthEndpoint || '/health',
            tags: registerDto.tags || [],
            metadata: registerDto.metadata || {},
            dependencies: registerDto.dependencies || [],
            weight: registerDto.weight || 100,
            environment: registerDto.environment || process.env.NODE_ENV || 'development',
            status: register_service_dto_1.ServiceStatus.STARTING,
            registeredAt: new Date(),
            lastHeartbeat: new Date(),
            healthCheckCount: 0,
            consecutiveFailures: 0,
        };
        // Store in cache
        await this.cacheService.set(`${this.SERVICE_PREFIX}${serviceId}`, service, 3600000); // 1 hour TTL
        // Add to services registry
        const services = await this.getAllServices();
        services[serviceId] = service;
        await this.cacheService.set(this.SERVICES_KEY, services, 3600000);
        this.logger.log(`Service registered: ${service.name} (${serviceId})`);
        // Perform initial health check
        this.performHealthCheck(service).catch(err => this.logger.warn(`Initial health check failed for ${service.name}: ${err.message}`));
        return service;
    }
    /**
     * Deregister a service
     */
    async deregisterService(serviceId) {
        const service = await this.getService(serviceId);
        if (!service) {
            return false;
        }
        // Update status to shutdown
        service.status = register_service_dto_1.ServiceStatus.SHUTDOWN;
        await this.updateService(service);
        // Remove from registry after grace period
        setTimeout(async () => {
            await this.cacheService.del(`${this.SERVICE_PREFIX}${serviceId}`);
            await this.cacheService.del(`${this.HEALTH_PREFIX}${serviceId}`);
            await this.cacheService.del(`${this.METRICS_PREFIX}${serviceId}`);
            const services = await this.getAllServices();
            delete services[serviceId];
            await this.cacheService.set(this.SERVICES_KEY, services, 3600000);
        }, 30000); // 30 seconds grace period
        this.logger.log(`Service deregistered: ${service.name} (${serviceId})`);
        return true;
    }
    /**
     * Update service heartbeat
     */
    async updateHeartbeat(serviceId) {
        const service = await this.getService(serviceId);
        if (!service) {
            return false;
        }
        service.lastHeartbeat = new Date();
        if (service.status === register_service_dto_1.ServiceStatus.STARTING || service.status === register_service_dto_1.ServiceStatus.UNHEALTHY) {
            service.status = register_service_dto_1.ServiceStatus.HEALTHY;
        }
        await this.updateService(service);
        return true;
    }
    /**
     * Get all registered services
     */
    async getAllServices() {
        const services = await this.cacheService.get(this.SERVICES_KEY);
        return services || {};
    }
    /**
     * Get services by type
     */
    async getServicesByType(type) {
        const services = await this.getAllServices();
        return Object.values(services).filter(service => service.type === type);
    }
    /**
     * Get healthy services by name
     */
    async getHealthyServices(serviceName) {
        const services = await this.getAllServices();
        return Object.values(services).filter(service => service.name === serviceName &&
            service.status === register_service_dto_1.ServiceStatus.HEALTHY);
    }
    /**
     * Get service by ID
     */
    async getService(serviceId) {
        return await this.cacheService.get(`${this.SERVICE_PREFIX}${serviceId}`);
    }
    /**
     * Update service health
     */
    async updateServiceHealth(serviceId, health) {
        await this.cacheService.set(`${this.HEALTH_PREFIX}${serviceId}`, health, 300000); // 5 minutes TTL
        const service = await this.getService(serviceId);
        if (service) {
            service.status = health.status;
            service.healthCheckCount++;
            if (health.status === register_service_dto_1.ServiceStatus.HEALTHY) {
                service.consecutiveFailures = 0;
            }
            else {
                service.consecutiveFailures++;
            }
            await this.updateService(service);
        }
    }
    /**
     * Get service health
     */
    async getServiceHealth(serviceId) {
        return await this.cacheService.get(`${this.HEALTH_PREFIX}${serviceId}`);
    }
    /**
     * Update service metrics
     */
    async updateServiceMetrics(serviceId, metrics) {
        await this.cacheService.set(`${this.METRICS_PREFIX}${serviceId}`, metrics, 300000); // 5 minutes TTL
    }
    /**
     * Get service metrics
     */
    async getServiceMetrics(serviceId) {
        return await this.cacheService.get(`${this.METRICS_PREFIX}${serviceId}`);
    }
    /**
     * Load balance - get best available service instance
     */
    async getBalancedService(serviceName) {
        const healthyServices = await this.getHealthyServices(serviceName);
        if (healthyServices.length === 0) {
            return null;
        }
        // Simple weighted random selection
        const totalWeight = healthyServices.reduce((sum, service) => sum + service.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (const service of healthyServices) {
            currentWeight += service.weight;
            if (random <= currentWeight) {
                return service;
            }
        }
        // Fallback to first service
        return healthyServices[0];
    }
    /**
     * Scheduled health checks
     */
    async performScheduledHealthChecks() {
        const services = await this.getAllServices();
        const serviceInstances = Object.values(services);
        this.logger.debug(`Performing health checks for ${serviceInstances.length} services`);
        const healthCheckPromises = serviceInstances
            .filter(service => service.status !== register_service_dto_1.ServiceStatus.SHUTDOWN)
            .map(service => this.performHealthCheck(service));
        await Promise.allSettled(healthCheckPromises);
    }
    /**
     * Clean up stale services
     */
    async cleanupStaleServices() {
        const services = await this.getAllServices();
        const now = new Date();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes
        for (const [serviceId, service] of Object.entries(services)) {
            const timeSinceLastHeartbeat = now.getTime() - service.lastHeartbeat.getTime();
            if (timeSinceLastHeartbeat > staleThreshold && service.status !== register_service_dto_1.ServiceStatus.SHUTDOWN) {
                this.logger.warn(`Service ${service.name} (${serviceId}) is stale, marking as unhealthy`);
                service.status = register_service_dto_1.ServiceStatus.UNHEALTHY;
                await this.updateService(service);
            }
            // Remove shutdown services after extended period
            const extendedThreshold = 30 * 60 * 1000; // 30 minutes
            if (timeSinceLastHeartbeat > extendedThreshold && service.status === register_service_dto_1.ServiceStatus.SHUTDOWN) {
                this.logger.log(`Removing stale shutdown service: ${service.name} (${serviceId})`);
                await this.deregisterService(serviceId);
            }
        }
    }
    /**
     * Perform health check for a single service
     */
    async performHealthCheck(service) {
        const startTime = Date.now();
        try {
            const healthUrl = `http://${service.host}:${service.port}${service.healthEndpoint}`;
            const response = await axios_1.default.get(healthUrl, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'OMC-ERP-ServiceRegistry/1.0',
                }
            });
            const responseTime = Date.now() - startTime;
            const health = {
                serviceId: service.id,
                status: response.status === 200 ? register_service_dto_1.ServiceStatus.HEALTHY : register_service_dto_1.ServiceStatus.UNHEALTHY,
                timestamp: new Date(),
                responseTime,
                details: response.data || {},
            };
            await this.updateServiceHealth(service.id, health);
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            const health = {
                serviceId: service.id,
                status: register_service_dto_1.ServiceStatus.UNHEALTHY,
                timestamp: new Date(),
                responseTime,
                error: error.message,
            };
            await this.updateServiceHealth(service.id, health);
            this.logger.warn(`Health check failed for ${service.name}: ${error.message}`);
        }
    }
    /**
     * Update service in cache
     */
    async updateService(service) {
        await this.cacheService.set(`${this.SERVICE_PREFIX}${service.id}`, service, 3600000);
        const services = await this.getAllServices();
        services[service.id] = service;
        await this.cacheService.set(this.SERVICES_KEY, services, 3600000);
    }
    /**
     * Generate unique service ID
     */
    generateServiceId(name, host, port) {
        const baseId = `${name}-${host}-${port}`;
        const uuid = (0, uuid_1.v4)().split('-')[0];
        return `${baseId}-${uuid}`;
    }
};
exports.ServiceRegistryService = ServiceRegistryService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceRegistryService.prototype, "performScheduledHealthChecks", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceRegistryService.prototype, "cleanupStaleServices", null);
exports.ServiceRegistryService = ServiceRegistryService = ServiceRegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], ServiceRegistryService);
//# sourceMappingURL=service-registry.service.js.map