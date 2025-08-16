import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
// import { HealthController } from './health.controller';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';

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
  controllers: [MetricsController],
  providers: [
    MetricsService,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [1, 5, 15, 50, 100, 500, 1000, 5000],
    }),
    makeHistogramProvider({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    }),
    makeHistogramProvider({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    }),
    makeGaugeProvider({
      name: 'active_connections',
      help: 'Number of active connections',
    }),
    makeGaugeProvider({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
    }),
    makeGaugeProvider({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
    }),
    makeCounterProvider({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['method', 'route', 'error_type'],
    }),
    makeGaugeProvider({
      name: 'database_connections',
      help: 'Number of database connections',
      labelNames: ['state'],
    }),
    makeCounterProvider({
      name: 'cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'result'],
    }),
    makeCounterProvider({
      name: 'external_api_calls_total',
      help: 'Total number of external API calls',
      labelNames: ['service', 'method', 'status'],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}