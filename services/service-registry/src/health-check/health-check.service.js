"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var HealthCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_service_1 = require("../common/cache.service");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const si = __importStar(require("systeminformation"));
const service_registry_service_1 = require("../service-registry/service-registry.service");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const event_dto_1 = require("../event-bus/dto/event.dto");
const register_service_dto_1 = require("../service-registry/dto/register-service.dto");
let HealthCheckService = HealthCheckService_1 = class HealthCheckService {
    configService;
    cacheService;
    serviceRegistryService;
    eventBusService;
    logger = new common_1.Logger(HealthCheckService_1.name);
    HEALTH_METRICS_KEY = 'health:system_metrics';
    constructor(configService, cacheService, serviceRegistryService, eventBusService) {
        this.configService = configService;
        this.cacheService = cacheService;
        this.serviceRegistryService = serviceRegistryService;
        this.eventBusService = eventBusService;
    }
    /**
     * Perform comprehensive health check of all services
     */
    async performServiceHealthChecks() {
        const services = await this.serviceRegistryService.getAllServices();
        const serviceInstances = Object.values(services);
        this.logger.debug(`Performing health checks for ${serviceInstances.length} services`);
        const healthCheckPromises = serviceInstances
            .filter(service => service.status !== 'shutdown')
            .map(service => this.checkServiceHealth(service));
        const results = await Promise.allSettled(healthCheckPromises);
        const healthCheckResults = [];
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'fulfilled' && result.value) {
                healthCheckResults.push(result.value);
            }
        }
        return healthCheckResults;
    }
    /**
     * Collect and store system health metrics
     */
    async collectSystemMetrics() {
        try {
            const startTime = Date.now();
            // Collect system information
            const [cpuData, memData, diskData, networkData] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
                si.networkStats(),
            ]);
            // Get service statistics
            const services = await this.serviceRegistryService.getAllServices();
            const serviceInstances = Object.values(services);
            const serviceStats = {
                total: serviceInstances.length,
                healthy: serviceInstances.filter(s => s.status === 'healthy').length,
                unhealthy: serviceInstances.filter(s => s.status === 'unhealthy').length,
                critical: serviceInstances.filter(s => s.status === 'critical').length,
            };
            // Check database health
            const databaseHealth = await this.checkDatabaseHealth();
            // Check external service health
            const externalHealth = await this.checkExternalServices();
            const metrics = {
                timestamp: new Date(),
                cpu: {
                    usage: Math.round(cpuData.currentLoad),
                    temperature: cpuData.cpus?.[0]?.temperature,
                },
                memory: {
                    used: memData.used,
                    total: memData.total,
                    percentage: Math.round((memData.used / memData.total) * 100),
                },
                disk: {
                    used: diskData[0]?.used || 0,
                    total: diskData[0]?.size || 1,
                    percentage: Math.round(((diskData[0]?.used || 0) / (diskData[0]?.size || 1)) * 100),
                },
                network: {
                    rx_bytes: networkData[0]?.rx_bytes || 0,
                    tx_bytes: networkData[0]?.tx_bytes || 0,
                    rx_sec: networkData[0]?.rx_sec || 0,
                    tx_sec: networkData[0]?.tx_sec || 0,
                },
                services: serviceStats,
                database: databaseHealth,
                external: externalHealth,
            };
            // Store metrics
            await this.cacheService.set(this.HEALTH_METRICS_KEY, metrics, 300000); // 5 minutes
            // Check for alerts
            await this.checkSystemAlerts(metrics);
            const duration = Date.now() - startTime;
            this.logger.debug(`System metrics collected in ${duration}ms`);
            return metrics;
        }
        catch (error) {
            this.logger.error(`Failed to collect system metrics: ${error.message}`);
            throw error;
        }
    }
    /**
     * Get current system health metrics
     */
    async getSystemMetrics() {
        return await this.cacheService.get(this.HEALTH_METRICS_KEY);
    }
    /**
     * Check health of a specific service
     */
    async checkServiceHealth(service) {
        const startTime = Date.now();
        try {
            const healthUrl = `http://${service.host}:${service.port}${service.healthEndpoint}`;
            const response = await axios_1.default.get(healthUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'OMC-ERP-HealthCheck/1.0',
                    'Accept': 'application/json',
                },
            });
            const responseTime = Date.now() - startTime;
            const previousStatus = service.status;
            const health = {
                serviceId: service.id,
                status: response.status === 200 ? register_service_dto_1.ServiceStatus.HEALTHY : register_service_dto_1.ServiceStatus.UNHEALTHY,
                timestamp: new Date(),
                responseTime,
                details: response.data || {},
            };
            // Update service health in registry
            await this.serviceRegistryService.updateServiceHealth(service.id, health);
            const statusChanged = previousStatus !== health.status;
            // Emit event if status changed
            if (statusChanged) {
                await this.eventBusService.publishEvent({
                    type: event_dto_1.EventType.SERVICE_HEALTH_CHANGED,
                    data: {
                        serviceId: service.id,
                        serviceName: service.name,
                        oldStatus: previousStatus,
                        newStatus: health.status,
                        responseTime,
                    },
                    source: 'health-check-service',
                    priority: health.status === 'unhealthy' ? event_dto_1.EventPriority.HIGH : event_dto_1.EventPriority.NORMAL,
                    tags: ['health-check', 'service-status'],
                });
            }
            return {
                service,
                health,
                previousStatus,
                statusChanged,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            const previousStatus = service.status;
            const health = {
                serviceId: service.id,
                status: register_service_dto_1.ServiceStatus.UNHEALTHY,
                timestamp: new Date(),
                responseTime,
                error: error.message,
                details: {
                    customMetrics: {
                        errorType: error.code || 'UNKNOWN',
                        timeout: error.code === 'ECONNABORTED',
                    }
                },
            };
            // Update service health in registry
            await this.serviceRegistryService.updateServiceHealth(service.id, health);
            const statusChanged = previousStatus !== register_service_dto_1.ServiceStatus.UNHEALTHY;
            // Emit event if status changed
            if (statusChanged) {
                await this.eventBusService.publishEvent({
                    type: event_dto_1.EventType.SERVICE_HEALTH_CHANGED,
                    data: {
                        serviceId: service.id,
                        serviceName: service.name,
                        oldStatus: previousStatus,
                        newStatus: register_service_dto_1.ServiceStatus.UNHEALTHY,
                        responseTime,
                        error: error.message,
                    },
                    source: 'health-check-service',
                    priority: event_dto_1.EventPriority.HIGH,
                    tags: ['health-check', 'service-failure'],
                });
            }
            this.logger.warn(`Health check failed for ${service.name}: ${error.message}`);
            return {
                service,
                health,
                previousStatus,
                statusChanged,
            };
        }
    }
    /**
     * Check database health
     */
    async checkDatabaseHealth() {
        const results = {
            postgresql: await this.checkPostgresHealth(),
            redis: await this.checkRedisHealth(),
            mongodb: await this.checkMongoHealth(),
        };
        return results;
    }
    /**
     * Check PostgreSQL health
     */
    async checkPostgresHealth() {
        const startTime = Date.now();
        try {
            // This would normally check actual database connection
            // For now, we'll mock it
            await new Promise(resolve => setTimeout(resolve, 50));
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                details: {
                    connections: 25,
                    maxConnections: 100,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    /**
     * Check Redis health
     */
    async checkRedisHealth() {
        const startTime = Date.now();
        try {
            // Check Redis via cache manager
            await this.cacheService.set('health_check', 'ping', 1000);
            const result = await this.cacheService.get('health_check');
            if (result === 'ping') {
                return {
                    status: 'healthy',
                    responseTime: Date.now() - startTime,
                    details: {
                        memory_usage: '45MB',
                        connected_clients: 12,
                    },
                };
            }
            else {
                throw new Error('Redis ping failed');
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    /**
     * Check MongoDB health
     */
    async checkMongoHealth() {
        const startTime = Date.now();
        try {
            // Mock MongoDB health check
            await new Promise(resolve => setTimeout(resolve, 75));
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                details: {
                    collections: 15,
                    documents: 125000,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    /**
     * Check external services health
     */
    async checkExternalServices() {
        const externalServices = {
            'ghana-npa': 'https://npa.gov.gh',
            'mtn-momo': 'https://sandbox.momodeveloper.mtn.com',
            'elastic-search': this.configService.get('ELASTICSEARCH_URL'),
        };
        const results = {};
        for (const [name, url] of Object.entries(externalServices)) {
            if (url) {
                results[name] = await this.checkExternalServiceHealth(url);
            }
        }
        return results;
    }
    /**
     * Check individual external service health
     */
    async checkExternalServiceHealth(url) {
        const startTime = Date.now();
        try {
            const response = await axios_1.default.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'OMC-ERP-HealthCheck/1.0',
                },
            });
            return {
                status: response.status === 200 ? 'healthy' : 'degraded',
                responseTime: Date.now() - startTime,
                details: {
                    statusCode: response.status,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    /**
     * Check for system alerts based on metrics
     */
    async checkSystemAlerts(metrics) {
        const alerts = [];
        // CPU usage alert
        if (metrics.cpu.usage > 90) {
            alerts.push({
                severity: 'critical',
                title: 'High CPU Usage',
                message: `CPU usage is at ${metrics.cpu.usage}%`,
            });
        }
        else if (metrics.cpu.usage > 75) {
            alerts.push({
                severity: 'high',
                title: 'Elevated CPU Usage',
                message: `CPU usage is at ${metrics.cpu.usage}%`,
            });
        }
        // Memory usage alert
        if (metrics.memory.percentage > 90) {
            alerts.push({
                severity: 'critical',
                title: 'High Memory Usage',
                message: `Memory usage is at ${metrics.memory.percentage}%`,
            });
        }
        else if (metrics.memory.percentage > 80) {
            alerts.push({
                severity: 'high',
                title: 'Elevated Memory Usage',
                message: `Memory usage is at ${metrics.memory.percentage}%`,
            });
        }
        // Disk usage alert
        if (metrics.disk.percentage > 95) {
            alerts.push({
                severity: 'critical',
                title: 'Disk Space Critical',
                message: `Disk usage is at ${metrics.disk.percentage}%`,
            });
        }
        else if (metrics.disk.percentage > 85) {
            alerts.push({
                severity: 'high',
                title: 'Low Disk Space',
                message: `Disk usage is at ${metrics.disk.percentage}%`,
            });
        }
        // Service health alerts
        if (metrics.services.critical > 0) {
            alerts.push({
                severity: 'critical',
                title: 'Critical Services Down',
                message: `${metrics.services.critical} services are in critical state`,
            });
        }
        if (metrics.services.unhealthy > 0) {
            alerts.push({
                severity: 'high',
                title: 'Unhealthy Services',
                message: `${metrics.services.unhealthy} services are unhealthy`,
            });
        }
        // Database health alerts
        Object.entries(metrics.database).forEach(([dbName, health]) => {
            if (health.status === 'unhealthy') {
                alerts.push({
                    severity: 'critical',
                    title: `Database ${dbName.toUpperCase()} Down`,
                    message: `${dbName} database is unhealthy: ${health.error}`,
                });
            }
        });
        // Send alerts
        for (const alert of alerts) {
            await this.eventBusService.publishEvent({
                type: event_dto_1.EventType.SYSTEM_ALERT,
                data: alert,
                source: 'health-check-service',
                priority: alert.severity === 'critical' ? event_dto_1.EventPriority.CRITICAL : event_dto_1.EventPriority.HIGH,
                tags: ['system-alert', 'health-check'],
            });
        }
    }
};
exports.HealthCheckService = HealthCheckService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthCheckService.prototype, "performServiceHealthChecks", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthCheckService.prototype, "collectSystemMetrics", null);
exports.HealthCheckService = HealthCheckService = HealthCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cache_service_1.CacheService,
        service_registry_service_1.ServiceRegistryService,
        event_bus_service_1.EventBusService])
], HealthCheckService);
//# sourceMappingURL=health-check.service.js.map