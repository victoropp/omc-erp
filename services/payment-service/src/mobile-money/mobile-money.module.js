"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileMoneyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const bull_1 = require("@nestjs/bull");
const cache_manager_1 = require("@nestjs/cache-manager");
const mtn_momo_service_1 = require("./providers/mtn-momo.service");
const vodafone_cash_service_1 = require("./providers/vodafone-cash.service");
const airteltigo_service_1 = require("./providers/airteltigo.service");
const mobile_money_controller_1 = require("./mobile-money.controller");
const mobile_money_service_1 = require("./mobile-money.service");
const payment_transaction_entity_1 = require("./entities/payment-transaction.entity");
const payment_provider_entity_1 = require("./entities/payment-provider.entity");
const payment_webhook_entity_1 = require("./entities/payment-webhook.entity");
const payment_reconciliation_entity_1 = require("./entities/payment-reconciliation.entity");
const qr_code_service_1 = require("./services/qr-code.service");
const ussd_service_1 = require("./services/ussd.service");
const sms_notification_service_1 = require("./services/sms-notification.service");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const payment_retry_service_1 = require("./services/payment-retry.service");
let MobileMoneyModule = class MobileMoneyModule {
};
exports.MobileMoneyModule = MobileMoneyModule;
exports.MobileMoneyModule = MobileMoneyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_transaction_entity_1.PaymentTransaction,
                payment_provider_entity_1.PaymentProvider,
                payment_webhook_entity_1.PaymentWebhook,
                payment_reconciliation_entity_1.PaymentReconciliation,
            ]),
            axios_1.HttpModule.register({
                timeout: 30000,
                maxRedirects: 5,
            }),
            bull_1.BullModule.registerQueue({
                name: 'payment-processing',
            }),
            bull_1.BullModule.registerQueue({
                name: 'payment-reconciliation',
            }),
            cache_manager_1.CacheModule.register({
                ttl: 60,
                max: 100,
            }),
        ],
        controllers: [mobile_money_controller_1.MobileMoneyController],
        providers: [
            mobile_money_service_1.MobileMoneyService,
            mtn_momo_service_1.MtnMomoService,
            vodafone_cash_service_1.VodafoneCashService,
            airteltigo_service_1.AirtelTigoService,
            qr_code_service_1.QrCodeService,
            ussd_service_1.UssdService,
            sms_notification_service_1.SmsNotificationService,
            fraud_detection_service_1.FraudDetectionService,
            payment_retry_service_1.PaymentRetryService,
        ],
        exports: [mobile_money_service_1.MobileMoneyService],
    })
], MobileMoneyModule);
//# sourceMappingURL=mobile-money.module.js.map