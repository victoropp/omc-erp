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
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const bull_1 = require("@nestjs/bull");
// Entities
const dealer_loan_entity_1 = require("./entities/dealer-loan.entity");
const dealer_loan_payment_entity_1 = require("./entities/dealer-loan-payment.entity");
const dealer_margin_accrual_entity_1 = require("./entities/dealer-margin-accrual.entity");
const dealer_settlement_entity_1 = require("./entities/dealer-settlement.entity");
// Services
const dealer_settlement_service_1 = require("./services/dealer-settlement.service");
const dealer_loan_management_service_1 = require("./services/dealer-loan-management.service");
const dealer_margin_accrual_service_1 = require("./services/dealer-margin-accrual.service");
const dealer_performance_service_1 = require("./services/dealer-performance.service");
const dealer_settlement_statement_service_1 = require("./services/dealer-settlement-statement.service");
const dealer_payment_automation_service_1 = require("./services/dealer-payment-automation.service");
// Controllers
const dealer_management_controller_1 = require("./controllers/dealer-management.controller");
// Legacy Modules (keeping for backwards compatibility)
const dealer_onboarding_module_1 = require("./onboarding/dealer-onboarding.module");
const health_module_1 = require("./health/health.module");
// Shared Modules
const database_module_1 = require("./database/database.module");
const notification_module_1 = require("./notifications/notification.module");
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
            // Database
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5434),
                    username: config.get('DB_USERNAME', 'omc_erp'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_NAME', 'omc_erp'),
                    autoLoadEntities: true,
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                    ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
                }),
            }),
            // Scheduling for automated tasks
            schedule_1.ScheduleModule.forRoot(),
            // Event system
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            // Redis/Bull for job queues
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                        password: config.get('REDIS_PASSWORD'),
                    },
                }),
            }),
            // TypeORM for entities
            typeorm_1.TypeOrmModule.forFeature([
                dealer_loan_entity_1.DealerLoan,
                dealer_loan_payment_entity_1.DealerLoanPayment,
                dealer_margin_accrual_entity_1.DealerMarginAccrual,
                dealer_settlement_entity_1.DealerSettlement,
            ]),
            // Core modules
            database_module_1.DatabaseModule,
            health_module_1.HealthModule,
            notification_module_1.NotificationModule,
            // Legacy Feature modules (keeping for backwards compatibility)
            dealer_onboarding_module_1.DealerOnboardingModule,
        ],
        controllers: [
            dealer_management_controller_1.DealerManagementController,
        ],
        providers: [
            dealer_settlement_service_1.DealerSettlementService,
            dealer_loan_management_service_1.DealerLoanManagementService,
            dealer_margin_accrual_service_1.DealerMarginAccrualService,
            dealer_performance_service_1.DealerPerformanceService,
            dealer_settlement_statement_service_1.DealerSettlementStatementService,
            dealer_payment_automation_service_1.DealerPaymentAutomationService,
        ],
        exports: [
            dealer_settlement_service_1.DealerSettlementService,
            dealer_loan_management_service_1.DealerLoanManagementService,
            dealer_margin_accrual_service_1.DealerMarginAccrualService,
            dealer_performance_service_1.DealerPerformanceService,
            dealer_settlement_statement_service_1.DealerSettlementStatementService,
            dealer_payment_automation_service_1.DealerPaymentAutomationService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map