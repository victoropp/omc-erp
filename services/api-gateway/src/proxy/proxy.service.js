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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const rxjs_1 = require("rxjs");
const axios_2 = __importDefault(require("axios"));
let ProxyService = ProxyService_1 = class ProxyService {
    httpService;
    configService;
    cacheManager;
    logger = new common_1.Logger(ProxyService_1.name);
    serviceUrls;
    serviceRegistry;
    constructor(httpService, configService, cacheManager) {
        this.httpService = httpService;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.serviceRegistry = this.configService.get('SERVICE_REGISTRY_URL', 'http://localhost:3010');
        // Fallback static URLs for development
        this.serviceUrls = new Map([
            ['auth', this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001')],
            ['transactions', this.configService.get('TRANSACTION_SERVICE_URL', 'http://localhost:3002')],
            ['stations', this.configService.get('STATION_SERVICE_URL', 'http://localhost:3003')],
            ['fleet', this.configService.get('FLEET_SERVICE_URL', 'http://localhost:3004')],
            ['finance', this.configService.get('FINANCE_SERVICE_URL', 'http://localhost:3005')],
            ['pricing', this.configService.get('PRICING_SERVICE_URL', 'http://localhost:3006')],
            ['inventory', this.configService.get('INVENTORY_SERVICE_URL', 'http://localhost:3007')],
            ['uppf', this.configService.get('UPPF_SERVICE_URL', 'http://localhost:3008')],
            ['dealer', this.configService.get('DEALER_SERVICE_URL', 'http://localhost:3009')],
            ['accounting', this.configService.get('ACCOUNTING_SERVICE_URL', 'http://localhost:3011')],
            ['configuration', this.configService.get('CONFIGURATION_SERVICE_URL', 'http://localhost:3012')],
        ]);
    }
    async forwardRequest(service, method, path, data, headers) {
        const requestId = headers?.['x-request-id'] || this.generateRequestId();
        const startTime = Date.now();
        try {
            // First try service discovery
            const serviceInstance = await this.discoverService(service);
            let baseUrl;
            if (serviceInstance) {
                baseUrl = `http://${serviceInstance.host}:${serviceInstance.port}`;
                this.logger.debug(`Using discovered service: ${service} at ${baseUrl}`);
            }
            else {
                // Fallback to static configuration
                baseUrl = this.serviceUrls.get(service);
                if (!baseUrl) {
                    throw new Error(`Unknown service: ${service}`);
                }
                this.logger.debug(`Using static service URL: ${service} at ${baseUrl}`);
            }
            const config = {
                method,
                url: `${baseUrl}${path}`,
                data,
                timeout: 30000, // 30 seconds timeout
                headers: {
                    ...headers,
                    'X-Forwarded-For': headers?.['x-forwarded-for'] || headers?.['x-real-ip'],
                    'X-Request-ID': requestId,
                    'X-Gateway': 'omc-erp-api-gateway',
                },
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(config));
            // Log successful request
            const duration = Date.now() - startTime;
            this.logger.debug(`Request ${requestId} to ${service} completed in ${duration}ms`);
            // Update service metrics if available
            if (serviceInstance) {
                await this.updateServiceMetrics(serviceInstance.id, true, duration);
            }
            return response.data;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Request ${requestId} to ${service} failed after ${duration}ms: ${error?.message || error}`);
            // Update service metrics on error
            const serviceInstance = await this.discoverService(service);
            if (serviceInstance) {
                await this.updateServiceMetrics(serviceInstance.id, false, duration);
            }
            this.handleProxyError(error, service, requestId);
        }
    }
    /**
     * Discover service using service registry
     */
    async discoverService(serviceName) {
        const cacheKey = `service_discovery:${serviceName}`;
        try {
            // Check cache first
            let cachedService = await this.cacheManager.get(cacheKey);
            if (cachedService) {
                return cachedService;
            }
            // Query service registry
            const response = await axios_2.default.get(`${this.serviceRegistry}/registry/discovery/${serviceName}?loadBalanced=true`, { timeout: 5000 });
            const serviceInstance = response.data;
            // Cache for 30 seconds
            await this.cacheManager.set(cacheKey, serviceInstance, 30000);
            return serviceInstance;
        }
        catch (error) {
            this.logger.warn(`Service discovery failed for ${serviceName}: ${error?.message || error}`);
            return null;
        }
    }
    /**
     * Update service metrics in registry
     */
    async updateServiceMetrics(serviceId, success, responseTime) {
        try {
            const metricsData = {
                serviceId,
                timestamp: new Date(),
                metrics: {
                    requestsPerSecond: 1, // Would be calculated properly in production
                    averageResponseTime: responseTime,
                    errorRate: success ? 0 : 1,
                    memoryUsage: 0,
                    cpuUsage: 0,
                },
            };
            // Fire and forget - don't wait for response
            axios_2.default.post(`${this.serviceRegistry}/registry/services/${serviceId}/metrics`, metricsData, {
                timeout: 2000,
            }).catch(error => {
                this.logger.debug(`Failed to update metrics for ${serviceId}: ${error.message}`);
            });
        }
        catch (error) {
            // Silent fail for metrics
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    handleProxyError(error, service, requestId) {
        if (error.response) {
            // The service responded with an error
            const errorResponse = {
                statusCode: error.response.status,
                message: error.response.data?.message || 'Service error',
                error: error.response.data?.error || 'Unknown error',
                service,
                requestId,
                timestamp: new Date().toISOString(),
            };
            this.logger.error(`Service ${service} error: ${JSON.stringify(errorResponse)}`);
            throw errorResponse;
        }
        else if (error.request) {
            // Service didn't respond
            const errorResponse = {
                statusCode: 503,
                message: `Service '${service}' unavailable`,
                error: 'Service did not respond',
                service,
                requestId,
                timestamp: new Date().toISOString(),
            };
            this.logger.error(`Service ${service} unavailable: ${JSON.stringify(errorResponse)}`);
            throw errorResponse;
        }
        else {
            // Request setup error
            const errorResponse = {
                statusCode: 500,
                message: 'Internal gateway error',
                error: error.message || 'Unknown error',
                service,
                requestId,
                timestamp: new Date().toISOString(),
            };
            this.logger.error(`Gateway error for service ${service}: ${JSON.stringify(errorResponse)}`);
            throw errorResponse;
        }
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = ProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService, Object])
], ProxyService);
//# sourceMappingURL=proxy.service.js.map