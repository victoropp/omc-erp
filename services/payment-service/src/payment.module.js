"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("@nestjs/axios");
const mobile_money_module_1 = require("./mobile-money/mobile-money.module");
const settlement_module_1 = require("./settlement/settlement.module");
const forex_module_1 = require("./forex/forex.module");
const reconciliation_module_1 = require("./reconciliation/reconciliation.module");
const webhook_module_1 = require("./webhook/webhook.module");
const notification_module_1 = require("./notification/notification.module");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT, 10) || 5434,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'omc_erp',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
                    password: process.env.REDIS_PASSWORD,
                },
            }),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 300,
                max: 100,
            }),
            schedule_1.ScheduleModule.forRoot(),
            axios_1.HttpModule,
            mobile_money_module_1.MobileMoneyModule,
            settlement_module_1.SettlementModule,
            forex_module_1.ForexModule,
            reconciliation_module_1.ReconciliationModule,
            webhook_module_1.WebhookModule,
            notification_module_1.NotificationModule,
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map