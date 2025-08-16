"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const proxy_module_1 = require("./proxy/proxy.module");
const auth_module_1 = require("./auth/auth.module");
const transactions_module_1 = require("./transactions/transactions.module");
const stations_module_1 = require("./stations/stations.module");
const health_module_1 = require("./health/health.module");
const logger_module_1 = require("./logger/logger.module");
const financial_module_1 = require("./financial/financial.module");
const human_resource_module_1 = require("./human-resource/human-resource.module");
const inventory_module_1 = require("./inventory/inventory.module");
const customer_module_1 = require("./customer/customer.module");
const compliance_module_1 = require("./compliance/compliance.module");
const regulatory_module_1 = require("./regulatory/regulatory.module");
const iot_module_1 = require("./iot/iot.module");
const realtime_module_1 = require("./realtime/realtime.module");
const mobile_module_1 = require("./mobile/mobile.module");
const integrations_module_1 = require("./integrations/integrations.module");
const graphql_module_1 = require("./graphql/graphql.module");
const metrics_module_1 = require("./metrics/metrics.module");
const security_module_1 = require("./security/security.module");
const versioning_module_1 = require("./versioning/versioning.module");
const request_logging_middleware_1 = require("./middleware/request-logging.middleware");
const request_trace_middleware_1 = require("./middleware/request-trace.middleware");
const compression_middleware_1 = require("./middleware/compression.middleware");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const core_1 = require("@nestjs/core");
// import { redisStore } from 'cache-manager-redis-store';
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_logging_middleware_1.RequestLoggingMiddleware, request_trace_middleware_1.RequestTraceMiddleware, compression_middleware_1.CompressionMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                expandVariables: true,
            }),
            // Caching with Redis (disabled for simplified startup)
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 300, // 5 minutes default TTL
                max: 1000, // max items in cache
            }),
            // Advanced Rate limiting with multiple strategies
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000, // 1 second
                    limit: 10, // 10 requests per second
                },
                {
                    name: 'medium',
                    ttl: 10000, // 10 seconds
                    limit: 50, // 50 requests per 10 seconds
                },
                {
                    name: 'long',
                    ttl: 60000, // 1 minute
                    limit: 300, // 300 requests per minute
                },
                {
                    name: 'daily',
                    ttl: 86400000, // 24 hours
                    limit: 10000, // 10k requests per day
                }
            ]),
            // Core modules
            logger_module_1.LoggerModule,
            health_module_1.HealthModule,
            metrics_module_1.MetricsModule,
            security_module_1.SecurityModule,
            versioning_module_1.ApiVersioningModule,
            // Business modules (proxies to microservices)
            proxy_module_1.ProxyModule,
            auth_module_1.AuthModule,
            financial_module_1.FinancialModule,
            human_resource_module_1.HumanResourceModule,
            transactions_module_1.TransactionsModule,
            inventory_module_1.InventoryModule,
            stations_module_1.StationsModule,
            customer_module_1.CustomerModule,
            compliance_module_1.ComplianceModule,
            regulatory_module_1.RegulatoryModule,
            iot_module_1.IotModule,
            realtime_module_1.RealtimeModule,
            mobile_module_1.MobileModule,
            integrations_module_1.IntegrationsModule,
            graphql_module_1.GraphqlModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map