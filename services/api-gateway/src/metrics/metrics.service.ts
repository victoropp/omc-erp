import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge, register } from 'prom-client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // HTTP Metrics
  @InjectMetric('http_requests_total')
  public httpRequestsTotal: Counter<string>;

  @InjectMetric('http_request_duration_ms')
  public httpRequestDuration: Histogram<string>;

  @InjectMetric('http_request_size_bytes')
  public httpRequestSize: Histogram<string>;

  @InjectMetric('http_response_size_bytes')
  public httpResponseSize: Histogram<string>;

  // Business Metrics
  @InjectMetric('api_errors_total')
  public apiErrorsTotal: Counter<string>;

  @InjectMetric('database_connections')
  public databaseConnections: Gauge<string>;

  @InjectMetric('cache_operations_total')
  public cacheOperationsTotal: Counter<string>;

  @InjectMetric('external_api_calls_total')
  public externalApiCallsTotal: Counter<string>;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP Request Counter
    this.httpRequestsTotal = new Counter({
      name: 'omc_api_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'user_type'],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'omc_api_http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    });

    // HTTP Request Size
    this.httpRequestSize = new Histogram({
      name: 'omc_api_http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    // HTTP Response Size
    this.httpResponseSize = new Histogram({
      name: 'omc_api_http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    // API Errors
    this.apiErrorsTotal = new Counter({
      name: 'omc_api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['error_type', 'service', 'endpoint'],
    });

    // Database Connections
    this.databaseConnections = new Gauge({
      name: 'omc_api_database_connections',
      help: 'Number of active database connections',
      labelNames: ['database', 'status'],
    });

    // Cache Operations
    this.cacheOperationsTotal = new Counter({
      name: 'omc_api_cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'result'],
    });

    // External API Calls
    this.externalApiCallsTotal = new Counter({
      name: 'omc_api_external_calls_total',
      help: 'Total number of external API calls',
      labelNames: ['service', 'endpoint', 'status'],
    });

    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.httpRequestSize);
    register.registerMetric(this.httpResponseSize);
    register.registerMetric(this.apiErrorsTotal);
    register.registerMetric(this.databaseConnections);
    register.registerMetric(this.cacheOperationsTotal);
    register.registerMetric(this.externalApiCallsTotal);
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize: number,
    responseSize: number,
    userType: string = 'anonymous',
  ) {
    const labels = {
      method: method.toUpperCase(),
      route,
      status_code: statusCode.toString(),
      user_type: userType,
    };

    this.httpRequestsTotal.inc({ ...labels });
    this.httpRequestDuration.observe(
      { method: labels.method, route, status_code: labels.status_code },
      duration,
    );
    this.httpRequestSize.observe({ method: labels.method, route }, requestSize);
    this.httpResponseSize.observe(
      { method: labels.method, route, status_code: labels.status_code },
      responseSize,
    );
  }

  recordApiError(errorType: string, service: string, endpoint: string) {
    this.apiErrorsTotal.inc({
      error_type: errorType,
      service,
      endpoint,
    });
  }

  recordCacheOperation(operation: 'get' | 'set' | 'del', result: 'hit' | 'miss' | 'success' | 'error') {
    this.cacheOperationsTotal.inc({
      operation,
      result,
    });
  }

  recordExternalApiCall(service: string, endpoint: string, status: string) {
    this.externalApiCallsTotal.inc({
      service,
      endpoint,
      status,
    });
  }

  updateDatabaseConnections(database: string, activeConnections: number, idleConnections: number) {
    this.databaseConnections.set(
      { database, status: 'active' },
      activeConnections,
    );
    this.databaseConnections.set(
      { database, status: 'idle' },
      idleConnections,
    );
  }

  async getSystemStats() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      system: {
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.floor(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.floor(memoryUsage.external / 1024 / 1024), // MB
        },
        cpu: {
          usage: process.cpuUsage(),
        },
      },
      nodejs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getBusinessMetrics() {
    // Aggregate business metrics from cache
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisHour = now.toISOString().split(':')[0];

    try {
      const metrics = await Promise.all([
        this.cacheManager.get(`metrics:daily:${today}:requests`),
        this.cacheManager.get(`metrics:daily:${today}:errors`),
        this.cacheManager.get(`metrics:hourly:${thisHour}:requests`),
        this.cacheManager.get(`metrics:hourly:${thisHour}:errors`),
      ]);

      return {
        daily: {
          requests: metrics[0] || 0,
          errors: metrics[1] || 0,
          errorRate: metrics[0] ? (metrics[1] / metrics[0] * 100).toFixed(2) : 0,
        },
        hourly: {
          requests: metrics[2] || 0,
          errors: metrics[3] || 0,
          errorRate: metrics[2] ? (metrics[3] / metrics[2] * 100).toFixed(2) : 0,
        },
        timestamp: now.toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get business metrics', error);
      return {
        daily: { requests: 0, errors: 0, errorRate: 0 },
        hourly: { requests: 0, errors: 0, errorRate: 0 },
        timestamp: now.toISOString(),
        error: 'Failed to retrieve metrics from cache',
      };
    }
  }

  async incrementBusinessMetric(metric: string, period: 'daily' | 'hourly' = 'daily') {
    const now = new Date();
    const dateKey = period === 'daily' 
      ? now.toISOString().split('T')[0]
      : now.toISOString().split(':')[0];
    
    const cacheKey = `metrics:${period}:${dateKey}:${metric}`;
    
    try {
      const current = await this.cacheManager.get<number>(cacheKey) || 0;
      const ttl = period === 'daily' ? 25 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 25h or 2h
      await this.cacheManager.set(cacheKey, current + 1, ttl);
    } catch (error) {
      this.logger.error(`Failed to increment ${metric} metric`, error);
    }
  }

  async getApiEndpointStats() {
    return register.getSingleMetricAsString('omc_api_http_requests_total');
  }

  async resetMetrics() {
    register.clear();
    this.initializeMetrics();
    this.logger.warn('Metrics registry has been reset');
  }
}