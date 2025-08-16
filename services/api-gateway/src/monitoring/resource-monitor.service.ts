import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import * as process from 'process';
import { EventEmitter } from 'events';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // CPU usage percentage
    loadAverage: number[]; // 1, 5, 15 minute load averages
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    errorsReceived: number;
    errorsSent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
    iops: number;
  };
  gc: {
    collections: number;
    duration: number;
    freedMemory: number;
  };
  eventLoop: {
    lag: number;
    utilization: number;
  };
}

export interface ProcessMetrics {
  pid: number;
  uptime: number;
  cpuUsage: NodeJS.CpuUsage;
  memoryUsage: NodeJS.MemoryUsage;
  activeHandles: number;
  activeRequests: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number; // Duration in seconds before triggering
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class ResourceMonitorService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResourceMonitorService.name);
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private alertRules: AlertRule[] = [];
  private activeAlerts: Alert[] = [];
  private alertCounters = new Map<string, { count: number; firstSeen: Date }>();
  
  private readonly maxHistorySize = 1000; // Keep last 1000 metrics
  private readonly monitoringIntervalMs = 5000; // Monitor every 5 seconds
  
  // Performance optimization tracking
  private lastCpuUsage = process.cpuUsage();
  private lastNetworkStats: any = null;
  private gcStats = { collections: 0, duration: 0, freedMemory: 0 };
  private eventLoopLag = 0;

  constructor(private configService: ConfigService) {
    super();
    this.initializeDefaultAlertRules();
    this.setupGCMonitoring();
    this.setupEventLoopMonitoring();
  }

  async onModuleInit() {
    this.startMonitoring();
    this.logger.log('Resource monitoring started');
  }

  async onModuleDestroy() {
    this.stopMonitoring();
    this.logger.log('Resource monitoring stopped');
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.monitoringIntervalMs);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherSystemMetrics();
      this.metricsHistory.push(metrics);
      
      // Keep history size manageable
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
      }
      
      // Check alert rules
      this.checkAlertRules(metrics);
      
      // Emit metrics event
      this.emit('metrics', metrics);
      
    } catch (error) {
      this.logger.error('Error collecting metrics:', error);
    }
  }

  private async gatherSystemMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date();
    
    // CPU metrics
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) / 5 * 100; // 5 second interval
    this.lastCpuUsage = process.cpuUsage();
    
    // Memory metrics
    const memInfo = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Network metrics (simplified - would need OS-specific implementation for real values)
    const networkStats = this.getNetworkStats();
    
    // Disk metrics (simplified - would need OS-specific implementation for real values)
    const diskStats = await this.getDiskStats();
    
    return {
      timestamp,
      cpu: {
        usage: Math.min(cpuPercent, 100),
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercentage: (usedMem / totalMem) * 100,
        heapUsed: memInfo.heapUsed,
        heapTotal: memInfo.heapTotal,
        external: memInfo.external,
        rss: memInfo.rss,
      },
      network: networkStats,
      disk: diskStats,
      gc: { ...this.gcStats },
      eventLoop: {
        lag: this.eventLoopLag,
        utilization: this.calculateEventLoopUtilization(),
      },
    };
  }

  private getNetworkStats(): SystemMetrics['network'] {
    // Simplified network stats - in production, would use OS-specific APIs
    return {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0,
      errorsReceived: 0,
      errorsSent: 0,
    };
  }

  private async getDiskStats(): Promise<SystemMetrics['disk']> {
    // Simplified disk stats - in production, would use OS-specific APIs or libraries
    return {
      total: 1000000000, // 1GB placeholder
      used: 500000000,   // 500MB placeholder
      free: 500000000,   // 500MB placeholder
      usagePercentage: 50,
      iops: 0,
    };
  }

  private setupGCMonitoring(): void {
    // Monitor garbage collection
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = (...args) => {
        const start = process.hrtime();
        const memBefore = process.memoryUsage().heapUsed;
        
        const result = originalGC.apply(global, args);
        
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
        const memAfter = process.memoryUsage().heapUsed;
        
        this.gcStats.collections++;
        this.gcStats.duration += duration;
        this.gcStats.freedMemory += Math.max(0, memBefore - memAfter);
        
        return result;
      };
    }
  }

  private setupEventLoopMonitoring(): void {
    setInterval(() => {
      const start = process.hrtime();
      setImmediate(() => {
        const [seconds, nanoseconds] = process.hrtime(start);
        this.eventLoopLag = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
      });
    }, 1000);
  }

  private calculateEventLoopUtilization(): number {
    // Simplified calculation - in production, would use more sophisticated methods
    return Math.min(this.eventLoopLag / 100, 1) * 100;
  }

  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-cpu-usage',
        name: 'High CPU Usage',
        metric: 'cpu.usage',
        threshold: 80,
        operator: 'gte',
        duration: 60,
        enabled: true,
        severity: 'high',
        description: 'CPU usage is above 80% for more than 1 minute',
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        metric: 'memory.usagePercentage',
        threshold: 90,
        operator: 'gte',
        duration: 30,
        enabled: true,
        severity: 'critical',
        description: 'Memory usage is above 90% for more than 30 seconds',
      },
      {
        id: 'high-event-loop-lag',
        name: 'High Event Loop Lag',
        metric: 'eventLoop.lag',
        threshold: 100,
        operator: 'gte',
        duration: 30,
        enabled: true,
        severity: 'high',
        description: 'Event loop lag is above 100ms for more than 30 seconds',
      },
      {
        id: 'disk-space-low',
        name: 'Low Disk Space',
        metric: 'disk.usagePercentage',
        threshold: 85,
        operator: 'gte',
        duration: 60,
        enabled: true,
        severity: 'medium',
        description: 'Disk usage is above 85% for more than 1 minute',
      },
    ];
  }

  private checkAlertRules(metrics: SystemMetrics): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;
      
      const metricValue = this.getMetricValue(metrics, rule.metric);
      if (metricValue === null) continue;
      
      const triggered = this.evaluateCondition(metricValue, rule.threshold, rule.operator);
      
      if (triggered) {
        this.handleTriggeredAlert(rule, metricValue);
      } else {
        this.handleResolvedAlert(rule.id);
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, metricPath: string): number | null {
    const parts = metricPath.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return typeof value === 'number' ? value : null;
  }

  private evaluateCondition(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  private handleTriggeredAlert(rule: AlertRule, value: number): void {
    const counter = this.alertCounters.get(rule.id);
    const now = new Date();
    
    if (!counter) {
      this.alertCounters.set(rule.id, { count: 1, firstSeen: now });
      return;
    }
    
    counter.count++;
    const duration = (now.getTime() - counter.firstSeen.getTime()) / 1000;
    
    if (duration >= rule.duration) {
      // Check if alert is already active
      const existingAlert = this.activeAlerts.find(a => a.ruleId === rule.id && !a.resolved);
      
      if (!existingAlert) {
        const alert: Alert = {
          id: `${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: `${rule.description}. Current value: ${value.toFixed(2)}`,
          value,
          threshold: rule.threshold,
          timestamp: now,
          resolved: false,
        };
        
        this.activeAlerts.push(alert);
        this.emit('alert', alert);
        this.logger.warn(`Alert triggered: ${alert.message}`);
      }
    }
  }

  private handleResolvedAlert(ruleId: string): void {
    // Reset counter
    this.alertCounters.delete(ruleId);
    
    // Resolve active alerts
    const activeAlert = this.activeAlerts.find(a => a.ruleId === ruleId && !a.resolved);
    if (activeAlert) {
      activeAlert.resolved = true;
      activeAlert.resolvedAt = new Date();
      
      this.emit('alertResolved', activeAlert);
      this.logger.log(`Alert resolved: ${activeAlert.ruleName}`);
    }
  }

  // Public API methods
  
  getCurrentMetrics(): SystemMetrics | null {
    return this.metricsHistory.length > 0 
      ? this.metricsHistory[this.metricsHistory.length - 1] 
      : null;
  }

  getMetricsHistory(limit?: number): SystemMetrics[] {
    return limit 
      ? this.metricsHistory.slice(-limit)
      : [...this.metricsHistory];
  }

  getProcessMetrics(): ProcessMetrics {
    return {
      pid: process.pid,
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      activeHandles: (process as any)._getActiveHandles().length,
      activeRequests: (process as any)._getActiveRequests().length,
    };
  }

  getActiveAlerts(): Alert[] {
    return this.activeAlerts.filter(a => !a.resolved);
  }

  getAllAlerts(limit?: number): Alert[] {
    const alerts = [...this.activeAlerts].reverse();
    return limit ? alerts.slice(0, limit) : alerts;
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}`,
    };
    
    this.alertRules.push(newRule);
    this.logger.log(`Added alert rule: ${newRule.name}`);
    
    return newRule;
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;
    
    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    this.logger.log(`Updated alert rule: ${id}`);
    
    return true;
  }

  deleteAlertRule(id: string): boolean {
    const ruleIndex = this.alertRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;
    
    this.alertRules.splice(ruleIndex, 1);
    this.alertCounters.delete(id);
    
    // Resolve any active alerts for this rule
    this.handleResolvedAlert(id);
    
    this.logger.log(`Deleted alert rule: ${id}`);
    return true;
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    issues: string[];
    lastCheck: Date;
  } {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) {
      return {
        status: 'unhealthy',
        score: 0,
        issues: ['No metrics available'],
        lastCheck: new Date(),
      };
    }

    const issues: string[] = [];
    let score = 100;

    // Check CPU
    if (currentMetrics.cpu.usage > 80) {
      issues.push(`High CPU usage: ${currentMetrics.cpu.usage.toFixed(1)}%`);
      score -= 20;
    }

    // Check Memory
    if (currentMetrics.memory.usagePercentage > 85) {
      issues.push(`High memory usage: ${currentMetrics.memory.usagePercentage.toFixed(1)}%`);
      score -= 25;
    }

    // Check Event Loop
    if (currentMetrics.eventLoop.lag > 100) {
      issues.push(`High event loop lag: ${currentMetrics.eventLoop.lag.toFixed(1)}ms`);
      score -= 15;
    }

    // Check active alerts
    const criticalAlerts = this.getActiveAlerts().filter(a => a.severity === 'critical');
    const highAlerts = this.getActiveAlerts().filter(a => a.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      issues.push(`${criticalAlerts.length} critical alerts active`);
      score -= 30;
    }
    
    if (highAlerts.length > 0) {
      issues.push(`${highAlerts.length} high severity alerts active`);
      score -= 15;
    }

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 50) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      score: Math.max(0, score),
      issues,
      lastCheck: currentMetrics.timestamp,
    };
  }

  // Utility methods for performance optimization
  
  async optimizeMemory(): Promise<{ before: number; after: number; freed: number }> {
    const before = process.memoryUsage().heapUsed;
    
    if (global.gc) {
      global.gc();
    }
    
    const after = process.memoryUsage().heapUsed;
    const freed = before - after;
    
    this.logger.log(`Memory optimization: freed ${(freed / 1024 / 1024).toFixed(2)} MB`);
    
    return { before, after, freed };
  }

  getResourceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getCurrentMetrics();
    
    if (!metrics) return recommendations;
    
    if (metrics.cpu.usage > 70) {
      recommendations.push('Consider scaling horizontally or optimizing CPU-intensive operations');
    }
    
    if (metrics.memory.usagePercentage > 80) {
      recommendations.push('Memory usage is high - consider increasing memory or optimizing memory usage');
    }
    
    if (metrics.eventLoop.lag > 50) {
      recommendations.push('Event loop lag detected - consider optimizing synchronous operations');
    }
    
    if (this.gcStats.collections > 100) {
      recommendations.push('High GC activity - consider optimizing object creation and memory management');
    }
    
    return recommendations;
  }
}