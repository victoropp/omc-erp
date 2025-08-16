import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { FixedAssetsController } from './controllers/fixed-assets.controller';
import { FixedAssetsService } from './services/fixed-assets.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [
    FinancialController,
    FixedAssetsController,
  ],
  providers: [
    FinancialService,
    FixedAssetsService,
  ],
  exports: [FinancialService],
})
export class FinancialModule {}