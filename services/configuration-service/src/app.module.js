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
const typeorm_1 = require("@nestjs/typeorm");
const configuration_module_1 = require("./configuration/configuration.module");
const accounting_config_module_1 = require("./accounting-config/accounting-config.module");
const payment_config_module_1 = require("./payment-config/payment-config.module");
const iot_config_module_1 = require("./iot-config/iot-config.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5434'),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'omc_erp',
                autoLoadEntities: true,
                synchronize: false, // Use migrations in production
            }),
            configuration_module_1.ConfigurationModule,
            accounting_config_module_1.AccountingConfigModule,
            payment_config_module_1.PaymentConfigModule,
            iot_config_module_1.IoTConfigModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map