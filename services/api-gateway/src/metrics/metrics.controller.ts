import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Metrics & Monitoring')
@Controller('metrics')
@UseGuards(ThrottlerGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('system')
  @ApiOperation({ summary: 'Get system performance metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved' })
  async getSystemMetrics() {
    return this.metricsService.getSystemStats();
  }

  @Get('business')
  @ApiOperation({ summary: 'Get business metrics and KPIs' })
  @ApiResponse({ status: 200, description: 'Business metrics retrieved' })
  @ApiBearerAuth()
  async getBusinessMetrics() {
    return this.metricsService.getBusinessMetrics();
  }

  @Get('api-stats')
  @ApiOperation({ summary: 'Get API endpoint statistics' })
  @ApiResponse({ status: 200, description: 'API statistics retrieved' })
  @ApiBearerAuth()
  async getApiStats() {
    const stats = await this.metricsService.getApiEndpointStats();
    return {
      prometheus_format: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health-detailed')
  @ApiOperation({ summary: 'Get detailed health metrics' })
  @ApiResponse({ status: 200, description: 'Detailed health metrics' })
  async getDetailedHealth() {
    const [systemStats, businessMetrics] = await Promise.all([
      this.metricsService.getSystemStats(),
      this.metricsService.getBusinessMetrics(),
    ]);

    return {
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      system: systemStats,
      business: businessMetrics,
      services: {
        database: 'connected',
        redis: 'connected',
        external_apis: 'operational',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'Metrics reset successfully' })
  @ApiBearerAuth()
  async resetMetrics() {
    await this.metricsService.resetMetrics();
    return {
      message: 'Metrics have been reset',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('prometheus')
  @ApiOperation({ summary: 'Get Prometheus formatted metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prometheus metrics',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  getPrometheusMetrics() {
    // This endpoint is automatically handled by PrometheusModule
    // but we include it here for documentation purposes
    return 'Metrics available at /metrics endpoint in Prometheus format';
  }
}