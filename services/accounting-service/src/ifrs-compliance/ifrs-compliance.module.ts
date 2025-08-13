import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IFRSComplianceService } from './ifrs-compliance.service';
import { IFRSController } from './ifrs.controller';
import { RevenueRecognitionService } from './revenue-recognition.service';
import { LeaseAccountingService } from './lease-accounting.service';
import { FinancialInstrumentsService } from './financial-instruments.service';
import { ImpairmentService } from './impairment.service';
import { FairValueService } from './fair-value.service';

// IFRS Entities
import { IFRSAdjustment } from './entities/ifrs-adjustment.entity';
import { RevenueRecognition } from './entities/revenue-recognition.entity';
import { LeaseContract } from './entities/lease-contract.entity';
import { RightOfUseAsset } from './entities/right-of-use-asset.entity';
import { FinancialInstrument } from './entities/financial-instrument.entity';
import { ImpairmentAssessment } from './entities/impairment-assessment.entity';
import { FairValueMeasurement } from './entities/fair-value-measurement.entity';
import { IFRSDisclosure } from './entities/ifrs-disclosure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IFRSAdjustment,
      RevenueRecognition,
      LeaseContract,
      RightOfUseAsset,
      FinancialInstrument,
      ImpairmentAssessment,
      FairValueMeasurement,
      IFRSDisclosure,
    ]),
  ],
  controllers: [IFRSController],
  providers: [
    IFRSComplianceService,
    RevenueRecognitionService,
    LeaseAccountingService,
    FinancialInstrumentsService,
    ImpairmentService,
    FairValueService,
  ],
  exports: [
    IFRSComplianceService,
    RevenueRecognitionService,
    LeaseAccountingService,
    FinancialInstrumentsService,
    ImpairmentService,
    FairValueService,
  ],
})
export class IFRSComplianceModule {}