import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DailyDeliveryController } from './controllers/daily-delivery.controller';
import { DailyDeliveryService } from './services/daily-delivery.service';
import { DeliveryValidationService } from './services/delivery-validation.service';
import { PriceBuildUpService } from './services/price-build-up.service';
import { TaxAccrualService } from './services/tax-accrual.service';
import { DailyDelivery } from './entities/daily-delivery.entity';
import { DeliveryLineItem } from './entities/delivery-line-item.entity';
import { DeliveryApprovalHistory } from './entities/delivery-approval-history.entity';
import { DeliveryDocuments } from './entities/delivery-documents.entity';
import { PriceBuildUpComponent } from './entities/price-build-up-component.entity';
import { TaxAccrual } from './entities/tax-accrual.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyDelivery,
      DeliveryLineItem,
      DeliveryApprovalHistory,
      DeliveryDocuments,
      PriceBuildUpComponent,
      TaxAccrual,
    ]),
    HttpModule,
    EventEmitterModule,
  ],
  controllers: [DailyDeliveryController],
  providers: [
    DailyDeliveryService,
    DeliveryValidationService,
    PriceBuildUpService,
    TaxAccrualService,
  ],
  exports: [
    DailyDeliveryService,
    DeliveryValidationService,
    PriceBuildUpService,
    TaxAccrualService,
  ],
})
export class DailyDeliveryModule {}