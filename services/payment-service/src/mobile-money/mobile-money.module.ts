import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

import { MtnMomoService } from './providers/mtn-momo.service';
import { VodafoneCashService } from './providers/vodafone-cash.service';
import { AirtelTigoService } from './providers/airteltigo.service';
import { MobileMoneyController } from './mobile-money.controller';
import { MobileMoneyService } from './mobile-money.service';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentProvider } from './entities/payment-provider.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';
import { PaymentReconciliation } from './entities/payment-reconciliation.entity';
import { QrCodeService } from './services/qr-code.service';
import { UssdService } from './services/ussd.service';
import { SmsNotificationService } from './services/sms-notification.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { PaymentRetryService } from './services/payment-retry.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction,
      PaymentProvider,
      PaymentWebhook,
      PaymentReconciliation,
    ]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    BullModule.registerQueue({
      name: 'payment-processing',
    }),
    BullModule.registerQueue({
      name: 'payment-reconciliation',
    }),
    CacheModule.register({
      ttl: 60,
      max: 100,
    }),
  ],
  controllers: [MobileMoneyController],
  providers: [
    MobileMoneyService,
    MtnMomoService,
    VodafoneCashService,
    AirtelTigoService,
    QrCodeService,
    UssdService,
    SmsNotificationService,
    FraudDetectionService,
    PaymentRetryService,
  ],
  exports: [MobileMoneyService],
})
export class MobileMoneyModule {}