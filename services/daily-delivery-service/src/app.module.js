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
const axios_1 = require("@nestjs/axios");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const daily_delivery_module_1 = require("./daily-delivery/daily-delivery.module");
const supplier_invoice_service_1 = require("./invoice-generation/supplier-invoice.service");
const customer_invoice_service_1 = require("./invoice-generation/customer-invoice.service");
const approval_workflow_service_1 = require("./approval-workflow/approval-workflow.service");
const ghana_compliance_service_1 = require("./compliance/ghana-compliance.service");
const erp_integration_service_1 = require("./integration/erp-integration.service");
const dealer_margin_integration_service_1 = require("./integration/dealer-margin-integration.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5434),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'password'),
                    database: configService.get('DB_DATABASE', 'omc_erp'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    migrations: [__dirname + '/migrations/*{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV', 'development') === 'development',
                    logging: configService.get('DB_LOGGING', 'false') === 'true',
                    ssl: configService.get('DB_SSL', 'false') === 'true' ? {
                        rejectUnauthorized: false
                    } : false,
                }),
                inject: [config_1.ConfigService],
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    timeout: configService.get('HTTP_TIMEOUT', 10000),
                    maxRedirects: 5,
                    baseURL: configService.get('API_GATEWAY_URL', 'http://localhost:3000'),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Service-Name': 'daily-delivery-service',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET', 'your-secret-key'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            daily_delivery_module_1.DailyDeliveryModule,
        ],
        providers: [
            supplier_invoice_service_1.SupplierInvoiceService,
            customer_invoice_service_1.CustomerInvoiceService,
            approval_workflow_service_1.ApprovalWorkflowService,
            ghana_compliance_service_1.GhanaComplianceService,
            erp_integration_service_1.ERPIntegrationService,
            dealer_margin_integration_service_1.DealerMarginIntegrationService,
        ],
        exports: [
            supplier_invoice_service_1.SupplierInvoiceService,
            customer_invoice_service_1.CustomerInvoiceService,
            approval_workflow_service_1.ApprovalWorkflowService,
            ghana_compliance_service_1.GhanaComplianceService,
            erp_integration_service_1.ERPIntegrationService,
            dealer_margin_integration_service_1.DealerMarginIntegrationService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map