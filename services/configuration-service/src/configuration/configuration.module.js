"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const configuration_service_1 = require("./configuration.service");
const configuration_controller_1 = require("./configuration.controller");
const configuration_entity_1 = require("./entities/configuration.entity");
const configuration_initialization_service_1 = require("./services/configuration-initialization.service");
const configuration_validation_service_1 = require("./services/configuration-validation.service");
const configuration_audit_service_1 = require("./services/configuration-audit.service");
const configuration_notification_service_1 = require("./services/configuration-notification.service");
// Price Build-up imports
const price_buildup_service_1 = require("./services/price-buildup.service");
const station_type_config_service_1 = require("./services/station-type-config.service");
const approval_workflow_service_1 = require("./services/approval-workflow.service");
const thread_safe_config_service_1 = require("./services/thread-safe-config.service");
const price_buildup_controller_1 = require("./controllers/price-buildup.controller");
const price_buildup_entity_1 = require("./entities/price-buildup.entity");
let ConfigurationModule = class ConfigurationModule {
};
exports.ConfigurationModule = ConfigurationModule;
exports.ConfigurationModule = ConfigurationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                configuration_entity_1.Configuration,
                price_buildup_entity_1.PriceBuildupVersion,
                price_buildup_entity_1.PriceComponent,
                price_buildup_entity_1.StationTypePricing,
                price_buildup_entity_1.PriceBuildupAuditTrail,
            ]),
            event_emitter_1.EventEmitterModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [
            configuration_controller_1.ConfigurationController,
            price_buildup_controller_1.PriceBuildupController,
        ],
        providers: [
            configuration_service_1.ConfigurationService,
            configuration_initialization_service_1.ConfigurationInitializationService,
            configuration_validation_service_1.ConfigurationValidationService,
            configuration_audit_service_1.ConfigurationAuditService,
            configuration_notification_service_1.ConfigurationNotificationService,
            price_buildup_service_1.PriceBuildupService,
            station_type_config_service_1.StationTypeConfigurationService,
            approval_workflow_service_1.ApprovalWorkflowService,
            thread_safe_config_service_1.ThreadSafeConfigurationService,
        ],
        exports: [
            configuration_service_1.ConfigurationService,
            configuration_initialization_service_1.ConfigurationInitializationService,
            configuration_validation_service_1.ConfigurationValidationService,
            configuration_audit_service_1.ConfigurationAuditService,
            configuration_notification_service_1.ConfigurationNotificationService,
            price_buildup_service_1.PriceBuildupService,
            station_type_config_service_1.StationTypeConfigurationService,
            approval_workflow_service_1.ApprovalWorkflowService,
            thread_safe_config_service_1.ThreadSafeConfigurationService,
        ],
    })
], ConfigurationModule);
//# sourceMappingURL=configuration.module.js.map