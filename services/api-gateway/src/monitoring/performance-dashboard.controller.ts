import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResourceMonitorService } from './resource-monitor.service';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CircuitBreakerService } from '../common/circuit-breaker.service';
import { RetryService } from '../common/retry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Performance Dashboard')
@Controller('performance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PerformanceDashboardController {
  constructor(
    private readonly resourceMonitor: ResourceMonitorService,
    private readonly cacheService: RedisCacheService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly retryService: RetryService
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive performance overview' })
  @ApiResponse({ status: 200, description: 'Performance overview data' })
  async getPerformanceOverview() {
    const currentMetrics = this.resourceMonitor.getCurrentMetrics();
    const healthStatus = this.resourceMonitor.getHealthStatus();
    const activeAlerts = this.resourceMonitor.getActiveAlerts();
    const cacheStats = await this.cacheService.getStatistics();
    const circuitBreakerStats = this.circuitBreakerService.getAllStats();
    const retryStats = this.retryService.getStats();
    
    return {
      timestamp: new Date(),
      health: healthStatus,
      system: currentMetrics,
      cache: cacheStats,
      circuitBreakers: circuitBreakerStats,
      retries: retryStats,
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        recent: activeAlerts.slice(0, 5),
      },
      recommendations: this.resourceMonitor.getResourceRecommendations(),
    };
  }

  @Get('metrics/current')
  @ApiOperation({ summary: 'Get current system metrics' })
  @ApiResponse({ status: 200, description: 'Current system metrics' })
  getCurrentMetrics() {
    return {
      system: this.resourceMonitor.getCurrentMetrics(),
      process: this.resourceMonitor.getProcessMetrics(),
      timestamp: new Date(),
    };
  }

  @Get('metrics/history')
  @ApiOperation({ summary: 'Get historical metrics data' })
  @ApiResponse({ status: 200, description: 'Historical metrics data' })
  getMetricsHistory(
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    let metrics = this.resourceMonitor.getMetricsHistory(limitNum);

    // Filter by date range if provided
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? new Date(to) : new Date();
      
      metrics = metrics.filter(m => 
        m.timestamp >= fromDate && m.timestamp <= toDate
      );
    }

    return {
      metrics,
      summary: this.calculateMetricsSummary(metrics),
      total: metrics.length,
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get alerts information' })
  @ApiResponse({ status: 200, description: 'Alerts data' })
  getAlerts(
    @Query('active') activeOnly?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string
  ) {
    let alerts = activeOnly === 'true' 
      ? this.resourceMonitor.getActiveAlerts()
      : this.resourceMonitor.getAllAlerts();

    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    if (limit) {
      alerts = alerts.slice(0, parseInt(limit, 10));
    }

    return {
      alerts,
      summary: {
        total: alerts.length,
        active: alerts.filter(a => !a.resolved).length,
        resolved: alerts.filter(a => a.resolved).length,
        bySeverity: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length,
        },
      },
    };
  }

  @Get('alerts/rules')
  @ApiOperation({ summary: 'Get alert rules' })
  @ApiResponse({ status: 200, description: 'Alert rules configuration' })
  getAlertRules() {
    return {
      rules: this.resourceMonitor.getAlertRules(),
      total: this.resourceMonitor.getAlertRules().length,
    };
  }

  @Post('alerts/rules')
  @ApiOperation({ summary: 'Create new alert rule' })
  @ApiResponse({ status: 201, description: 'Alert rule created successfully' })
  createAlertRule(@Body() rule: any) {
    const newRule = this.resourceMonitor.addAlertRule(rule);
    return {
      success: true,
      rule: newRule,
      message: 'Alert rule created successfully',
    };
  }

  @Put('alerts/rules/:id')
  @ApiOperation({ summary: 'Update alert rule' })
  @ApiResponse({ status: 200, description: 'Alert rule updated successfully' })
  updateAlertRule(@Param('id') id: string, @Body() updates: any) {
    const success = this.resourceMonitor.updateAlertRule(id, updates);
    
    if (!success) {
      return {
        success: false,
        message: 'Alert rule not found',
      };
    }

    return {
      success: true,
      message: 'Alert rule updated successfully',
    };
  }

  @Delete('alerts/rules/:id')
  @ApiOperation({ summary: 'Delete alert rule' })
  @ApiResponse({ status: 200, description: 'Alert rule deleted successfully' })
  deleteAlertRule(@Param('id') id: string) {
    const success = this.resourceMonitor.deleteAlertRule(id);
    
    if (!success) {
      return {
        success: false,
        message: 'Alert rule not found',
      };
    }

    return {
      success: true,
      message: 'Alert rule deleted successfully',
    };
  }

  @Get('cache')
  @ApiOperation({ summary: 'Get cache performance metrics' })
  @ApiResponse({ status: 200, description: 'Cache performance data' })
  async getCacheMetrics() {
    const stats = await this.cacheService.getStatistics();
    const health = await this.cacheService.healthCheck();
    
    return {
      statistics: stats,
      health,
      performance: {
        hitRate: stats.hitRate,
        missRate: 100 - stats.hitRate,
        efficiency: stats.hitRate > 80 ? 'excellent' : 
                   stats.hitRate > 60 ? 'good' : 
                   stats.hitRate > 40 ? 'fair' : 'poor',
      },
      recommendations: this.getCacheRecommendations(stats),
    };
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    const success = await this.cacheService.clear();
    
    return {
      success,
      message: success ? 'Cache cleared successfully' : 'Failed to clear cache',
      timestamp: new Date(),
    };
  }

  @Get('circuit-breakers')
  @ApiOperation({ summary: 'Get circuit breaker status' })
  @ApiResponse({ status: 200, description: 'Circuit breaker statistics' })
  getCircuitBreakers() {
    const stats = this.circuitBreakerService.getAllStats();
    const health = this.circuitBreakerService.getHealthStatus();
    
    return {
      statistics: stats,
      health,
      summary: {
        total: health.total,
        healthy: health.healthy.length,
        degraded: health.degraded.length,
        unhealthy: health.unhealthy.length,
      },
      recommendations: this.getCircuitBreakerRecommendations(health),
    };
  }

  @Post('circuit-breakers/:name/reset')
  @ApiOperation({ summary: 'Reset circuit breaker' })
  @ApiResponse({ status: 200, description: 'Circuit breaker reset successfully' })
  resetCircuitBreaker(@Param('name') name: string) {
    const success = this.circuitBreakerService.resetCircuitBreaker(name);
    
    return {
      success,
      message: success 
        ? `Circuit breaker ${name} reset successfully`
        : `Circuit breaker ${name} not found`,
      timestamp: new Date(),
    };
  }

  @Get('retries')
  @ApiOperation({ summary: 'Get retry mechanism statistics' })
  @ApiResponse({ status: 200, description: 'Retry statistics' })
  getRetryStats() {
    const stats = this.retryService.getStats();
    
    return {
      statistics: stats,
      summary: this.calculateRetryStatsSummary(stats),
      recommendations: this.getRetryRecommendations(stats),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get comprehensive health status' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async getHealthStatus() {
    const systemHealth = this.resourceMonitor.getHealthStatus();
    const cacheHealth = await this.cacheService.healthCheck();
    const circuitBreakerHealth = this.circuitBreakerService.getHealthStatus();
    
    const overallScore = (
      systemHealth.score * 0.5 + // System metrics weighted 50%
      (cacheHealth.status === 'healthy' ? 100 : cacheHealth.status === 'degraded' ? 70 : 0) * 0.2 + // Cache weighted 20%
      (circuitBreakerHealth.healthy.length / Math.max(circuitBreakerHealth.total, 1)) * 100 * 0.3 // Circuit breakers weighted 30%
    );

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (overallScore >= 80) {
      overallStatus = 'healthy';
    } else if (overallScore >= 50) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      overall: {
        status: overallStatus,
        score: Math.round(overallScore),
        timestamp: new Date(),
      },
      components: {
        system: systemHealth,
        cache: cacheHealth,
        circuitBreakers: circuitBreakerHealth,
      },
      recommendations: [
        ...systemHealth.issues,
        ...this.getHealthRecommendations(systemHealth, cacheHealth, circuitBreakerHealth),
      ],
    };
  }

  @Get('performance-trends')
  @ApiOperation({ summary: 'Get performance trends analysis' })
  @ApiResponse({ status: 200, description: 'Performance trends data' })
  getPerformanceTrends(@Query('period') period?: string) {
    const periodMinutes = this.parsePeriod(period || '1h');
    const metrics = this.resourceMonitor.getMetricsHistory();
    const recentMetrics = this.filterMetricsByPeriod(metrics, periodMinutes);
    
    return {
      period: `${periodMinutes} minutes`,
      trends: this.calculateTrends(recentMetrics),
      predictions: this.predictPerformance(recentMetrics),
      alerts: this.predictPotentialIssues(recentMetrics),
    };
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Trigger performance optimization' })
  @ApiResponse({ status: 200, description: 'Optimization results' })
  async optimizePerformance() {
    const memoryOptimization = await this.resourceMonitor.optimizeMemory();
    const cacheStats = await this.cacheService.getStatistics();
    
    return {
      memory: memoryOptimization,
      cache: {
        hitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage,
      },
      recommendations: this.resourceMonitor.getResourceRecommendations(),
      timestamp: new Date(),
    };
  }

  // Helper methods

  private calculateMetricsSummary(metrics: any[]) {
    if (metrics.length === 0) return null;
    
    const latest = metrics[metrics.length - 1];
    const first = metrics[0];
    
    return {
      period: {
        start: first.timestamp,
        end: latest.timestamp,
        duration: new Date(latest.timestamp).getTime() - new Date(first.timestamp).getTime(),
      },
      averages: {
        cpuUsage: metrics.reduce((sum, m) => sum + m.cpu.usage, 0) / metrics.length,
        memoryUsage: metrics.reduce((sum, m) => sum + m.memory.usagePercentage, 0) / metrics.length,
        eventLoopLag: metrics.reduce((sum, m) => sum + m.eventLoop.lag, 0) / metrics.length,
      },
      peaks: {
        maxCpuUsage: Math.max(...metrics.map(m => m.cpu.usage)),
        maxMemoryUsage: Math.max(...metrics.map(m => m.memory.usagePercentage)),
        maxEventLoopLag: Math.max(...metrics.map(m => m.eventLoop.lag)),
      },
    };
  }

  private getCacheRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.hitRate < 60) {
      recommendations.push('Cache hit rate is low. Consider increasing TTL or reviewing cache strategy.');
    }
    
    if (stats.memoryUsage > 80 * 1024 * 1024) { // 80MB
      recommendations.push('Cache memory usage is high. Consider implementing cache eviction policies.');
    }
    
    return recommendations;
  }

  private getCircuitBreakerRecommendations(health: any): string[] {
    const recommendations: string[] = [];
    
    if (health.unhealthy.length > 0) {
      recommendations.push(`${health.unhealthy.length} circuit breakers are open. Check underlying services.`);
    }
    
    if (health.degraded.length > 0) {
      recommendations.push(`${health.degraded.length} circuit breakers are in degraded state. Monitor closely.`);
    }
    
    return recommendations;
  }

  private getRetryRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    // This would analyze retry statistics and provide recommendations
    // Implementation depends on the structure of retry stats
    
    return recommendations;
  }

  private calculateRetryStatsSummary(stats: any): any {
    // Calculate summary statistics for retry operations
    return {
      totalOperations: Object.keys(stats).length,
      // Add more summary calculations based on retry stats structure
    };
  }

  private getHealthRecommendations(systemHealth: any, cacheHealth: any, circuitBreakerHealth: any): string[] {
    const recommendations: string[] = [];
    
    if (systemHealth.score < 70) {
      recommendations.push('System performance is degraded. Consider resource optimization.');
    }
    
    if (cacheHealth.status !== 'healthy') {
      recommendations.push('Cache service is not healthy. Check Redis connection and configuration.');
    }
    
    if (circuitBreakerHealth.unhealthy.length > 0) {
      recommendations.push('Some services are unavailable. Check service health and connectivity.');
    }
    
    return recommendations;
  }

  private parsePeriod(period: string): number {
    const value = parseInt(period.slice(0, -1), 10);
    const unit = period.slice(-1);
    
    switch (unit) {
      case 'h': return value * 60;
      case 'm': return value;
      case 'd': return value * 24 * 60;
      default: return 60; // Default to 1 hour
    }
  }

  private filterMetricsByPeriod(metrics: any[], periodMinutes: number): any[] {
    const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000);
    return metrics.filter(m => new Date(m.timestamp) >= cutoff);
  }

  private calculateTrends(metrics: any[]): any {
    if (metrics.length < 2) return null;
    
    // Calculate trends for key metrics
    const cpuTrend = this.calculateTrend(metrics.map(m => m.cpu.usage));
    const memoryTrend = this.calculateTrend(metrics.map(m => m.memory.usagePercentage));
    const eventLoopTrend = this.calculateTrend(metrics.map(m => m.eventLoop.lag));
    
    return {
      cpu: { direction: cpuTrend > 0 ? 'increasing' : 'decreasing', rate: Math.abs(cpuTrend) },
      memory: { direction: memoryTrend > 0 ? 'increasing' : 'decreasing', rate: Math.abs(memoryTrend) },
      eventLoop: { direction: eventLoopTrend > 0 ? 'increasing' : 'decreasing', rate: Math.abs(eventLoopTrend) },
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression slope
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private predictPerformance(metrics: any[]): any {
    // Simple prediction based on trends
    const trends = this.calculateTrends(metrics);
    if (!trends) return null;
    
    const latest = metrics[metrics.length - 1];
    const timeAhead = 30; // Predict 30 minutes ahead
    
    return {
      timeAhead: `${timeAhead} minutes`,
      predictions: {
        cpu: Math.max(0, Math.min(100, latest.cpu.usage + trends.cpu.rate * timeAhead)),
        memory: Math.max(0, Math.min(100, latest.memory.usagePercentage + trends.memory.rate * timeAhead)),
        eventLoop: Math.max(0, latest.eventLoop.lag + trends.eventLoop.rate * timeAhead),
      },
    };
  }

  private predictPotentialIssues(metrics: any[]): string[] {
    const predictions = this.predictPerformance(metrics);
    const issues: string[] = [];
    
    if (predictions) {
      if (predictions.predictions.cpu > 85) {
        issues.push('CPU usage may exceed 85% in the next 30 minutes');
      }
      if (predictions.predictions.memory > 90) {
        issues.push('Memory usage may exceed 90% in the next 30 minutes');
      }
      if (predictions.predictions.eventLoop > 200) {
        issues.push('Event loop lag may exceed 200ms in the next 30 minutes');
      }
    }
    
    return issues;
  }
}