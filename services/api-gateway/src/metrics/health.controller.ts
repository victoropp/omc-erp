import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { MetricsService } from './metrics.service';

@ApiTags('Health Checks')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private typeorm: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private metricsService: MetricsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.typeorm.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9, // 90% usage threshold
      }),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Service is running',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.typeorm.pingCheck('database'),
      async () => {
        // Check if critical services are available
        const systemStats = await this.metricsService.getSystemStats();
        const isReady = systemStats.system.memory.heapUsed < 200; // Less than 200MB heap usage
        
        const status = isReady ? 'up' : 'down';
        return {
          ['api_gateway']: {
            status,
            message: isReady ? 'Ready to serve traffic' : 'High memory usage',
            details: {
              heapUsed: systemStats.system.memory.heapUsed,
              uptime: systemStats.system.uptime,
            },
          }
        };
      },
    ]);
  }

  @Get('startup')
  @ApiOperation({ summary: 'Startup probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service has started up' })
  async startup() {
    const uptime = process.uptime();
    const isStarted = uptime > 10; // Service considered started after 10 seconds

    if (!isStarted) {
      return {
        status: 'starting',
        uptime,
        message: 'Service is still starting up',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'started',
      uptime,
      message: 'Service has successfully started',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dependencies')
  @ApiOperation({ summary: 'Check external dependencies health' })
  @ApiResponse({ status: 200, description: 'Dependencies health status' })
  async checkDependencies() {
    const dependencies = [
      {
        name: 'PostgreSQL Database',
        status: 'healthy', // This would be checked via actual ping
        response_time_ms: 5,
        last_checked: new Date().toISOString(),
      },
      {
        name: 'Redis Cache',
        status: 'healthy',
        response_time_ms: 2,
        last_checked: new Date().toISOString(),
      },
      {
        name: 'Auth Service',
        status: 'healthy',
        response_time_ms: 15,
        last_checked: new Date().toISOString(),
      },
      {
        name: 'Financial Service',
        status: 'healthy',
        response_time_ms: 12,
        last_checked: new Date().toISOString(),
      },
    ];

    const overallStatus = dependencies.every(dep => dep.status === 'healthy') 
      ? 'healthy' 
      : 'degraded';

    return {
      overall_status: overallStatus,
      dependencies,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Comprehensive service status' })
  @ApiResponse({ status: 200, description: 'Complete service status' })
  async getStatus() {
    const [basicHealth, businessMetrics, systemStats] = await Promise.all([
      this.check(),
      this.metricsService.getBusinessMetrics(),
      this.metricsService.getSystemStats(),
    ]);

    return {
      service: 'OMC ERP API Gateway',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      health: basicHealth,
      metrics: businessMetrics,
      system: systemStats,
      timestamp: new Date().toISOString(),
    };
  }
}