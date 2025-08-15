import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { Configuration } from './entities/configuration.entity';
import { ConfigurationInitializationService } from './services/configuration-initialization.service';
import { ConfigurationValidationService } from './services/configuration-validation.service';
import { ConfigurationAuditService } from './services/configuration-audit.service';
import { ConfigurationNotificationService } from './services/configuration-notification.service';

// Price Build-up imports
import { PriceBuildupService } from './services/price-buildup.service';
import { StationTypeConfigurationService } from './services/station-type-config.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { ThreadSafeConfigurationService } from './services/thread-safe-config.service';
import { PriceBuildupController } from './controllers/price-buildup.controller';
import { 
  PriceBuildupVersion, 
  PriceComponent, 
  StationTypePricing, 
  PriceBuildupAuditTrail 
} from './entities/price-buildup.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Configuration,
      PriceBuildupVersion,
      PriceComponent,
      StationTypePricing,
      PriceBuildupAuditTrail,
    ]),
    EventEmitterModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ConfigurationController,
    PriceBuildupController,
  ],
  providers: [
    ConfigurationService,
    ConfigurationInitializationService,
    ConfigurationValidationService,
    ConfigurationAuditService,
    ConfigurationNotificationService,
    PriceBuildupService,
    StationTypeConfigurationService,
    ApprovalWorkflowService,
    ThreadSafeConfigurationService,
  ],
  exports: [
    ConfigurationService,
    ConfigurationInitializationService,
    ConfigurationValidationService,
    ConfigurationAuditService,
    ConfigurationNotificationService,
    PriceBuildupService,
    StationTypeConfigurationService,
    ApprovalWorkflowService,
    ThreadSafeConfigurationService,
  ],
})
export class ConfigurationModule {}