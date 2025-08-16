"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const accounting_service_integration_1 = require("./accounting-service.integration");
const configuration_service_integration_1 = require("./configuration-service.integration");
const station_service_integration_1 = require("./station-service.integration");
const customer_service_integration_1 = require("./customer-service.integration");
const transaction_service_integration_1 = require("./transaction-service.integration");
let ServiceIntegrationModule = class ServiceIntegrationModule {
};
exports.ServiceIntegrationModule = ServiceIntegrationModule;
exports.ServiceIntegrationModule = ServiceIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 30000,
                maxRedirects: 5,
            }),
            config_1.ConfigModule
        ],
        providers: [
            accounting_service_integration_1.AccountingServiceIntegration,
            configuration_service_integration_1.ConfigurationServiceIntegration,
            station_service_integration_1.StationServiceIntegration,
            customer_service_integration_1.CustomerServiceIntegration,
            transaction_service_integration_1.TransactionServiceIntegration
        ],
        exports: [
            accounting_service_integration_1.AccountingServiceIntegration,
            configuration_service_integration_1.ConfigurationServiceIntegration,
            station_service_integration_1.StationServiceIntegration,
            customer_service_integration_1.CustomerServiceIntegration,
            transaction_service_integration_1.TransactionServiceIntegration
        ]
    })
], ServiceIntegrationModule);
//# sourceMappingURL=service-integration.module.js.map