import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepaymentService } from './prepayment.service';
import { PrepaymentController } from './prepayment.controller';
import { PrepaymentAmortizationService } from './prepayment-amortization.service';
import { PrepaymentReportingService } from './prepayment-reporting.service';

// Prepayment Entities
import { Prepayment } from './entities/prepayment.entity';
import { PrepaymentAmortization } from './entities/prepayment-amortization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prepayment,
      PrepaymentAmortization,
    ]),
  ],
  controllers: [PrepaymentController],
  providers: [
    PrepaymentService,
    PrepaymentAmortizationService,
    PrepaymentReportingService,
  ],
  exports: [
    PrepaymentService,
    PrepaymentAmortizationService,
    PrepaymentReportingService,
  ],
})
export class PrepaymentModule {}