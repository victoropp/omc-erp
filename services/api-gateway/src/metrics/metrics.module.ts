import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'omc_api_',
        },
      },
    }),
  ],
  controllers: [MetricsController, HealthController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}