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

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
    EventEmitterModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    ConfigurationInitializationService,
    ConfigurationValidationService,
    ConfigurationAuditService,
    ConfigurationNotificationService,
  ],
  exports: [
    ConfigurationService,
    ConfigurationInitializationService,
    ConfigurationValidationService,
    ConfigurationAuditService,
    ConfigurationNotificationService,
  ],
})
export class ConfigurationModule {}