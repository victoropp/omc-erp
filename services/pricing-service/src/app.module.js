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
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
// Legacy modules
const pricing_module_1 = require("./pricing/pricing.module");
const pbu_components_module_1 = require("./pbu-components/pbu-components.module");
const calculation_engine_module_1 = require("./calculation-engine/calculation-engine.module");
// New comprehensive pricing automation services
const price_calculation_service_1 = require("./price-buildup/price-calculation.service");
const pricing_window_service_1 = require("./pricing-window/pricing-window.service");
const uppf_claims_service_1 = require("./uppf-claims/uppf-claims.service");
const npa_template_parser_service_1 = require("./npa-integration/npa-template-parser.service");
const background_automation_service_1 = require("./jobs/background-automation.service");
const dealer_settlement_service_1 = require("./dealer-settlement/dealer-settlement.service");
const automated_journal_entry_service_1 = require("./accounting-integration/automated-journal-entry.service");
// API Controllers
const pricing_automation_controller_1 = require("./api/pricing-automation.controller");
// Service Integration Module
const service_integration_module_1 = require("./integration/service-integration.module");
// Entities
const pbu_component_entity_1 = require("./pbu-components/entities/pbu-component.entity");
const pricing_window_entity_1 = require("./pricing/entities/pricing-window.entity");
const station_price_entity_1 = require("./pricing/entities/station-price.entity");
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
            }),
            // Scheduling for automated price updates and jobs
            schedule_1.ScheduleModule.forRoot(),
            // Event Emitter for domain events and service integration
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: true,
                ignoreErrors: false,
            }),
            // Database
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5434),
                    username: configService.get('DB_USER', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_NAME', 'omc_erp'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: false,
                    logging: configService.get('NODE_ENV') === 'development',
                    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
                }),
                inject: [config_1.ConfigService],
            }),
            // TypeORM Feature modules for entities
            typeorm_1.TypeOrmModule.forFeature([
                pbu_component_entity_1.PbuComponent,
                pricing_window_entity_1.PricingWindow,
                station_price_entity_1.StationPrice
            ]),
            // Service Integration (External Services)
            service_integration_module_1.ServiceIntegrationModule,
            // Legacy feature modules (maintaining backward compatibility)
            pricing_module_1.PricingModule,
            pbu_components_module_1.PBUComponentsModule,
            calculation_engine_module_1.CalculationEngineModule,
        ],
        controllers: [
            // Main API Controller for all pricing automation endpoints
            pricing_automation_controller_1.PricingAutomationController,
        ],
        providers: [
            // Core pricing automation services
            price_calculation_service_1.PriceCalculationService,
            pricing_window_service_1.PricingWindowService,
            uppf_claims_service_1.UppfClaimsService,
            npa_template_parser_service_1.NpaTemplateParserService,
            background_automation_service_1.BackgroundAutomationService,
            dealer_settlement_service_1.DealerSettlementService,
            automated_journal_entry_service_1.AutomatedJournalEntryService,
        ],
        exports: [
            // Export services for use by other modules if needed
            price_calculation_service_1.PriceCalculationService,
            pricing_window_service_1.PricingWindowService,
            uppf_claims_service_1.UppfClaimsService,
            npa_template_parser_service_1.NpaTemplateParserService,
            background_automation_service_1.BackgroundAutomationService,
            dealer_settlement_service_1.DealerSettlementService,
            automated_journal_entry_service_1.AutomatedJournalEntryService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map