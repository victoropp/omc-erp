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
const schedule_1 = require("@nestjs/schedule");
const service_registry_module_1 = require("./service-registry/service-registry.module");
const health_check_module_1 = require("./health-check/health-check.module");
const service_discovery_module_1 = require("./service-discovery/service-discovery.module");
const event_bus_module_1 = require("./event-bus/event-bus.module");
const websocket_module_1 = require("./websocket/websocket.module");
const cache_module_1 = require("./common/cache.module");
let AppModule = class AppModule {
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
            // Global cache module (replaces @nestjs/cache-manager temporarily)
            cache_module_1.CacheModule,
            // Scheduled tasks for health checks
            schedule_1.ScheduleModule.forRoot(),
            // Core modules
            service_registry_module_1.ServiceRegistryModule,
            service_discovery_module_1.ServiceDiscoveryModule,
            health_check_module_1.HealthCheckModule,
            event_bus_module_1.EventBusModule,
            websocket_module_1.WebSocketModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map