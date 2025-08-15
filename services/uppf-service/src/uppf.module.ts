import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Entities
import {
  UPPFClaim,
  UPPFSettlement,
  ClaimAnomaly,
  ThreeWayReconciliation,
  EqualisationPoint,
  GPSTrace,
} from './entities/uppf-entities';

// Services
import { UPPFClaimsService } from './claims/uppf-claims.service';
import { UPPFSettlementsService } from './settlements/uppf-settlements.service';
import { UPPFReportsService } from './reports/uppf-reports.service';
import { ThreeWayReconciliationService } from './claims/three-way-reconciliation.service';
import { GPSValidationService } from './claims/gps-validation.service';
import { NPASubmissionService } from './claims/npa-submission.service';

// Controllers
import { UPPFClaimsController } from './controllers/uppf-claims.controller';
import { UPPFSettlementsController } from './controllers/uppf-settlements.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    EventEmitterModule,
    TypeOrmModule.forFeature([
      UPPFClaim,
      UPPFSettlement,
      ClaimAnomaly,
      ThreeWayReconciliation,
      EqualisationPoint,
      GPSTrace,
    ]),
  ],
  providers: [
    UPPFClaimsService,
    UPPFSettlementsService,
    UPPFReportsService,
    ThreeWayReconciliationService,
    GPSValidationService,
    NPASubmissionService,
  ],
  controllers: [
    UPPFClaimsController,
    UPPFSettlementsController,
  ],
  exports: [
    UPPFClaimsService,
    UPPFSettlementsService,
    UPPFReportsService,
    ThreeWayReconciliationService,
    GPSValidationService,
    NPASubmissionService,
  ],
})
export class UPPFModule {}