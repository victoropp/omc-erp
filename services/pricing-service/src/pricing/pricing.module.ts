import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingWindow } from './entities/pricing-window.entity';
import { StationPrice } from './entities/station-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PricingWindow, StationPrice]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}