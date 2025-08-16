"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
// import { HealthController } from './health.controller';
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_prometheus_1.PrometheusModule.register({
                path: '/metrics',
                defaultMetrics: {
                    enabled: true,
                    config: {
                        prefix: 'omc_api_',
                    },
                },
            }),
        ],
        controllers: [metrics_controller_1.MetricsController],
        providers: [
            metrics_service_1.MetricsService,
            (0, nestjs_prometheus_1.makeCounterProvider)({
                name: 'http_requests_total',
                help: 'Total number of HTTP requests',
                labelNames: ['method', 'route', 'status'],
            }),
            (0, nestjs_prometheus_1.makeHistogramProvider)({
                name: 'http_request_duration_ms',
                help: 'Duration of HTTP requests in milliseconds',
                labelNames: ['method', 'route', 'status'],
                buckets: [1, 5, 15, 50, 100, 500, 1000, 5000],
            }),
            (0, nestjs_prometheus_1.makeHistogramProvider)({
                name: 'http_request_size_bytes',
                help: 'Size of HTTP requests in bytes',
                labelNames: ['method', 'route'],
                buckets: [100, 1000, 10000, 100000, 1000000],
            }),
            (0, nestjs_prometheus_1.makeHistogramProvider)({
                name: 'http_response_size_bytes',
                help: 'Size of HTTP responses in bytes',
                labelNames: ['method', 'route'],
                buckets: [100, 1000, 10000, 100000, 1000000],
            }),
            (0, nestjs_prometheus_1.makeGaugeProvider)({
                name: 'active_connections',
                help: 'Number of active connections',
            }),
            (0, nestjs_prometheus_1.makeGaugeProvider)({
                name: 'memory_usage_bytes',
                help: 'Memory usage in bytes',
                labelNames: ['type'],
            }),
            (0, nestjs_prometheus_1.makeGaugeProvider)({
                name: 'cpu_usage_percent',
                help: 'CPU usage percentage',
            }),
            (0, nestjs_prometheus_1.makeCounterProvider)({
                name: 'api_errors_total',
                help: 'Total number of API errors',
                labelNames: ['method', 'route', 'error_type'],
            }),
            (0, nestjs_prometheus_1.makeGaugeProvider)({
                name: 'database_connections',
                help: 'Number of database connections',
                labelNames: ['state'],
            }),
            (0, nestjs_prometheus_1.makeCounterProvider)({
                name: 'cache_operations_total',
                help: 'Total number of cache operations',
                labelNames: ['operation', 'result'],
            }),
            (0, nestjs_prometheus_1.makeCounterProvider)({
                name: 'external_api_calls_total',
                help: 'Total number of external API calls',
                labelNames: ['service', 'method', 'status'],
            }),
        ],
        exports: [metrics_service_1.MetricsService],
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map