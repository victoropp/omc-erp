import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckService } from './health-check.service';
import { ServiceRegistryModule } from '../service-registry/service-registry.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule,
    // Use forwardRef to avoid circular dependencies
    forwardRef(() => ServiceRegistryModule),
    forwardRef(() => EventBusModule),
  ],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthCheckModule {}