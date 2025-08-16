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
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const prom_client_1 = require("prom-client");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let MetricsService = MetricsService_1 = class MetricsService {
    cacheManager;
    logger = new common_1.Logger(MetricsService_1.name);
    // HTTP Metrics
    httpRequestsTotal;
    httpRequestDuration;
    httpRequestSize;
    httpResponseSize;
    // Business Metrics
    apiErrorsTotal;
    databaseConnections;
    cacheOperationsTotal;
    externalApiCallsTotal;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.initializeMetrics();
    }
    initializeMetrics() {
        // HTTP Request Counter
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'omc_api_http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code', 'user_type'],
        });
        // HTTP Request Duration
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'omc_api_http_request_duration_ms',
            help: 'Duration of HTTP requests in milliseconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
        });
        // HTTP Request Size
        this.httpRequestSize = new prom_client_1.Histogram({
            name: 'omc_api_http_request_size_bytes',
            help: 'Size of HTTP requests in bytes',
            labelNames: ['method', 'route'],
            buckets: [100, 1000, 10000, 100000, 1000000],
        });
        // HTTP Response Size
        this.httpResponseSize = new prom_client_1.Histogram({
            name: 'omc_api_http_response_size_bytes',
            help: 'Size of HTTP responses in bytes',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [100, 1000, 10000, 100000, 1000000],
        });
        // API Errors
        this.apiErrorsTotal = new prom_client_1.Counter({
            name: 'omc_api_errors_total',
            help: 'Total number of API errors',
            labelNames: ['error_type', 'service', 'endpoint'],
        });
        // Database Connections
        this.databaseConnections = new prom_client_1.Gauge({
            name: 'omc_api_database_connections',
            help: 'Number of active database connections',
            labelNames: ['database', 'status'],
        });
        // Cache Operations
        this.cacheOperationsTotal = new prom_client_1.Counter({
            name: 'omc_api_cache_operations_total',
            help: 'Total number of cache operations',
            labelNames: ['operation', 'result'],
        });
        // External API Calls
        this.externalApiCallsTotal = new prom_client_1.Counter({
            name: 'omc_api_external_calls_total',
            help: 'Total number of external API calls',
            labelNames: ['service', 'endpoint', 'status'],
        });
        prom_client_1.register.registerMetric(this.httpRequestsTotal);
        prom_client_1.register.registerMetric(this.httpRequestDuration);
        prom_client_1.register.registerMetric(this.httpRequestSize);
        prom_client_1.register.registerMetric(this.httpResponseSize);
        prom_client_1.register.registerMetric(this.apiErrorsTotal);
        prom_client_1.register.registerMetric(this.databaseConnections);
        prom_client_1.register.registerMetric(this.cacheOperationsTotal);
        prom_client_1.register.registerMetric(this.externalApiCallsTotal);
    }
    recordHttpRequest(method, route, statusCode, duration, requestSize, responseSize, userType = 'anonymous') {
        const labels = {
            method: method.toUpperCase(),
            route,
            status_code: statusCode.toString(),
            user_type: userType,
        };
        this.httpRequestsTotal.inc({ ...labels });
        this.httpRequestDuration.observe({ method: labels.method, route, status_code: labels.status_code }, duration);
        this.httpRequestSize.observe({ method: labels.method, route }, requestSize);
        this.httpResponseSize.observe({ method: labels.method, route, status_code: labels.status_code }, responseSize);
    }
    recordApiError(errorType, service, endpoint) {
        this.apiErrorsTotal.inc({
            error_type: errorType,
            service,
            endpoint,
        });
    }
    recordCacheOperation(operation, result) {
        this.cacheOperationsTotal.inc({
            operation,
            result,
        });
    }
    recordExternalApiCall(service, endpoint, status) {
        this.externalApiCallsTotal.inc({
            service,
            endpoint,
            status,
        });
    }
    updateDatabaseConnections(database, activeConnections, idleConnections) {
        this.databaseConnections.set({ database, status: 'active' }, activeConnections);
        this.databaseConnections.set({ database, status: 'idle' }, idleConnections);
    }
    async getSystemStats() {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        return {
            system: {
                uptime: Math.floor(uptime),
                memory: {
                    rss: Math.floor(memoryUsage.rss / 1024 / 1024), // MB
                    heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024), // MB
                    external: Math.floor(memoryUsage.external / 1024 / 1024), // MB
                },
                cpu: {
                    usage: process.cpuUsage(),
                },
            },
            nodejs: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getBusinessMetrics() {
        // Aggregate business metrics from cache
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisHour = now.toISOString().split(':')[0];
        try {
            const metrics = await Promise.all([
                this.cacheManager.get(`metrics:daily:${today}:requests`),
                this.cacheManager.get(`metrics:daily:${today}:errors`),
                this.cacheManager.get(`metrics:hourly:${thisHour}:requests`),
                this.cacheManager.get(`metrics:hourly:${thisHour}:errors`),
            ]);
            return {
                daily: {
                    requests: metrics[0] || 0,
                    errors: metrics[1] || 0,
                    errorRate: metrics[0] ? (metrics[1] / metrics[0] * 100).toFixed(2) : 0,
                },
                hourly: {
                    requests: metrics[2] || 0,
                    errors: metrics[3] || 0,
                    errorRate: metrics[2] ? (metrics[3] / metrics[2] * 100).toFixed(2) : 0,
                },
                timestamp: now.toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get business metrics', error);
            return {
                daily: { requests: 0, errors: 0, errorRate: 0 },
                hourly: { requests: 0, errors: 0, errorRate: 0 },
                timestamp: now.toISOString(),
                error: 'Failed to retrieve metrics from cache',
            };
        }
    }
    async incrementBusinessMetric(metric, period = 'daily') {
        const now = new Date();
        const dateKey = period === 'daily'
            ? now.toISOString().split('T')[0]
            : now.toISOString().split(':')[0];
        const cacheKey = `metrics:${period}:${dateKey}:${metric}`;
        try {
            const current = await this.cacheManager.get(cacheKey) || 0;
            const ttl = period === 'daily' ? 25 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 25h or 2h
            await this.cacheManager.set(cacheKey, current + 1, ttl);
        }
        catch (error) {
            this.logger.error(`Failed to increment ${metric} metric`, error);
        }
    }
    async getApiEndpointStats() {
        return prom_client_1.register.getSingleMetricAsString('omc_api_http_requests_total');
    }
    async resetMetrics() {
        prom_client_1.register.clear();
        this.initializeMetrics();
        this.logger.warn('Metrics registry has been reset');
    }
};
exports.MetricsService = MetricsService;
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('http_requests_total'),
    __metadata("design:type", prom_client_1.Counter)
], MetricsService.prototype, "httpRequestsTotal", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('http_request_duration_ms'),
    __metadata("design:type", prom_client_1.Histogram)
], MetricsService.prototype, "httpRequestDuration", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('http_request_size_bytes'),
    __metadata("design:type", prom_client_1.Histogram)
], MetricsService.prototype, "httpRequestSize", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('http_response_size_bytes'),
    __metadata("design:type", prom_client_1.Histogram)
], MetricsService.prototype, "httpResponseSize", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('api_errors_total'),
    __metadata("design:type", prom_client_1.Counter)
], MetricsService.prototype, "apiErrorsTotal", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('database_connections'),
    __metadata("design:type", prom_client_1.Gauge)
], MetricsService.prototype, "databaseConnections", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('cache_operations_total'),
    __metadata("design:type", prom_client_1.Counter)
], MetricsService.prototype, "cacheOperationsTotal", void 0);
__decorate([
    (0, nestjs_prometheus_1.InjectMetric)('external_api_calls_total'),
    __metadata("design:type", prom_client_1.Counter)
], MetricsService.prototype, "externalApiCallsTotal", void 0);
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map