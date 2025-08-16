import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResourceMonitorService } from './resource-monitor.service';
import { PerformanceDashboardController } from './performance-dashboard.controller';
import { CircuitBreakerService } from '../common/circuit-breaker.service';
import { RetryService } from '../common/retry.service';
import { CacheModule } from '../cache/cache.module';

@Global()
@Module({
  imports: [ConfigModule, CacheModule],
  providers: [
    ResourceMonitorService,
    CircuitBreakerService,
    RetryService,
  ],
  controllers: [PerformanceDashboardController],
  exports: [
    ResourceMonitorService,
    CircuitBreakerService,
    RetryService,
  ],
})
export class MonitoringModule {}