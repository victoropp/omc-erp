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
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const metrics_service_1 = require("./metrics.service");
const throttler_1 = require("@nestjs/throttler");
let MetricsController = class MetricsController {
    metricsService;
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getSystemMetrics() {
        return this.metricsService.getSystemStats();
    }
    async getBusinessMetrics() {
        return this.metricsService.getBusinessMetrics();
    }
    async getApiStats() {
        const stats = await this.metricsService.getApiEndpointStats();
        return {
            prometheus_format: stats,
            timestamp: new Date().toISOString(),
        };
    }
    async getDetailedHealth() {
        const [systemStats, businessMetrics] = await Promise.all([
            this.metricsService.getSystemStats(),
            this.metricsService.getBusinessMetrics(),
        ]);
        return {
            status: 'healthy',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            system: systemStats,
            business: businessMetrics,
            services: {
                database: 'connected',
                redis: 'connected',
                external_apis: 'operational',
            },
            timestamp: new Date().toISOString(),
        };
    }
    async resetMetrics() {
        await this.metricsService.resetMetrics();
        return {
            message: 'Metrics have been reset',
            timestamp: new Date().toISOString(),
        };
    }
    getPrometheusMetrics() {
        // This endpoint is automatically handled by PrometheusModule
        // but we include it here for documentation purposes
        return 'Metrics available at /metrics endpoint in Prometheus format';
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System metrics retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('business'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business metrics and KPIs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics retrieved' }),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getBusinessMetrics", null);
__decorate([
    (0, common_1.Get)('api-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API endpoint statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API statistics retrieved' }),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getApiStats", null);
__decorate([
    (0, common_1.Get)('health-detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed health metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detailed health metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getDetailedHealth", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset metrics (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics reset successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "resetMetrics", null);
__decorate([
    (0, common_1.Get)('prometheus'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Prometheus formatted metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Prometheus metrics',
        content: {
            'text/plain': {
                schema: {
                    type: 'string',
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getPrometheusMetrics", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('Metrics & Monitoring'),
    (0, common_1.Controller)('metrics'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map