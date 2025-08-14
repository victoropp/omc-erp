import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
// import * as ElasticsearchTransport from 'winston-elasticsearch';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum LogCategory {
  APPLICATION = 'application',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BUSINESS = 'business',
  SYSTEM = 'system',
  AUDIT = 'audit',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  service: string;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

export interface LogQuery {
  level?: LogLevel;
  category?: LogCategory;
  service?: string;
  fromTimestamp?: Date;
  toTimestamp?: Date;
  requestId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
  searchText?: string;
}

export interface LogStatistics {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsByCategory: Record<LogCategory, number>;
  logsByService: Record<string, number>;
  errorRate: number;
  avgResponseTime: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurrence: Date;
  }>;
}

@Injectable()
export class CentralizedLoggerService {
  private readonly logger = new Logger(CentralizedLoggerService.name);
  private winstonLogger: winston.Logger;
  private readonly LOG_CACHE_KEY = 'logs:entries';
  private readonly LOG_STATS_KEY = 'logs:statistics';

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeWinstonLogger();
  }

  /**
   * Initialize Winston logger with multiple transports
   */
  private initializeWinstonLogger(): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.colorize({ all: true })
    );

    // Console transport for development
    const consoleTransport = new winston.transports.Console({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    });

    // File transport with daily rotation
    const fileTransport = new DailyRotateFile({
      filename: 'logs/omc-erp-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '30d',
      format: logFormat,
    });

    // Error file transport
    const errorFileTransport = new DailyRotateFile({
      filename: 'logs/omc-erp-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '100m',
      maxFiles: '60d',
      format: logFormat,
    });

    const transports: winston.transport[] = [
      consoleTransport,
      fileTransport,
      errorFileTransport,
    ];

    // Elasticsearch transport (if configured)
    const elasticsearchUrl = this.configService.get('ELASTICSEARCH_URL');
    if (elasticsearchUrl) {
      // Note: Commented out as winston-elasticsearch might not be available
      // const elasticsearchTransport = new ElasticsearchTransport({
      //   level: 'info',
      //   clientOpts: { node: elasticsearchUrl },
      //   index: 'omc-erp-logs',
      // });
      // transports.push(elasticsearchTransport);
    }

    this.winstonLogger = winston.createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: logFormat,
      transports,
    });

    this.logger.log('Centralized logging initialized');
  }

  /**
   * Log an entry
   */
  async log(entry: Partial<LogEntry>): Promise<void> {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level: entry.level || LogLevel.INFO,
      category: entry.category || LogCategory.APPLICATION,
      service: entry.service || 'unknown',
      message: entry.message || '',
      data: entry.data,
      requestId: entry.requestId,
      userId: entry.userId,
      sessionId: entry.sessionId,
      ip: entry.ip,
      userAgent: entry.userAgent,
      duration: entry.duration,
      statusCode: entry.statusCode,
      error: entry.error,
      metadata: entry.metadata,
    };

    // Log to Winston
    this.winstonLogger.log(logEntry.level, logEntry.message, logEntry);

    // Store in cache for recent logs
    await this.storeLogEntry(logEntry);

    // Update statistics
    await this.updateLogStatistics(logEntry);

    // Handle critical errors
    if (logEntry.level === LogLevel.ERROR && logEntry.category === LogCategory.SECURITY) {
      await this.handleCriticalError(logEntry);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async logError(service: string, message: string, error?: Error, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.ERROR,
      category: LogCategory.APPLICATION,
      service,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      metadata,
    });
  }

  async logWarning(service: string, message: string, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.WARN,
      category: LogCategory.APPLICATION,
      service,
      message,
      metadata,
    });
  }

  async logInfo(service: string, message: string, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      category: LogCategory.APPLICATION,
      service,
      message,
      metadata,
    });
  }

  async logDebug(service: string, message: string, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.DEBUG,
      category: LogCategory.APPLICATION,
      service,
      message,
      metadata,
    });
  }

  async logSecurity(service: string, message: string, userId?: string, ip?: string, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.WARN,
      category: LogCategory.SECURITY,
      service,
      message,
      userId,
      ip,
      metadata,
    });
  }

  async logPerformance(service: string, message: string, duration: number, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      category: LogCategory.PERFORMANCE,
      service,
      message,
      duration,
      metadata,
    });
  }

  async logAudit(service: string, message: string, userId: string, action: string, metadata?: any): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      category: LogCategory.AUDIT,
      service,
      message,
      userId,
      metadata: {
        action,
        ...metadata,
      },
    });
  }

  /**
   * Query logs
   */
  async queryLogs(query: LogQuery): Promise<LogEntry[]> {
    try {
      const cachedLogs = await this.cacheManager.get<LogEntry[]>(this.LOG_CACHE_KEY) || [];
      let filteredLogs = [...cachedLogs];

      // Apply filters
      if (query.level) {
        filteredLogs = filteredLogs.filter(log => log.level === query.level);
      }

      if (query.category) {
        filteredLogs = filteredLogs.filter(log => log.category === query.category);
      }

      if (query.service) {
        filteredLogs = filteredLogs.filter(log => log.service === query.service);
      }

      if (query.requestId) {
        filteredLogs = filteredLogs.filter(log => log.requestId === query.requestId);
      }

      if (query.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
      }

      if (query.fromTimestamp) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= query.fromTimestamp!
        );
      }

      if (query.toTimestamp) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= query.toTimestamp!
        );
      }

      if (query.searchText) {
        const searchLower = query.searchText.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.data || {}).toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      
      return filteredLogs.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error(`Failed to query logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(): Promise<LogStatistics> {
    try {
      const cachedStats = await this.cacheManager.get<LogStatistics>(this.LOG_STATS_KEY);
      if (cachedStats) {
        return cachedStats;
      }

      // Calculate statistics from cached logs
      const logs = await this.cacheManager.get<LogEntry[]>(this.LOG_CACHE_KEY) || [];
      
      const stats: LogStatistics = {
        totalLogs: logs.length,
        logsByLevel: {
          [LogLevel.ERROR]: 0,
          [LogLevel.WARN]: 0,
          [LogLevel.INFO]: 0,
          [LogLevel.DEBUG]: 0,
        },
        logsByCategory: {
          [LogCategory.APPLICATION]: 0,
          [LogCategory.SECURITY]: 0,
          [LogCategory.PERFORMANCE]: 0,
          [LogCategory.BUSINESS]: 0,
          [LogCategory.SYSTEM]: 0,
          [LogCategory.AUDIT]: 0,
        },
        logsByService: {},
        errorRate: 0,
        avgResponseTime: 0,
        topErrors: [],
      };

      let totalResponseTime = 0;
      let responseTimeCount = 0;
      const errorCounts: Record<string, { count: number; lastOccurrence: Date }> = {};

      for (const log of logs) {
        // Count by level
        stats.logsByLevel[log.level]++;

        // Count by category
        stats.logsByCategory[log.category]++;

        // Count by service
        stats.logsByService[log.service] = (stats.logsByService[log.service] || 0) + 1;

        // Calculate response time
        if (log.duration !== undefined) {
          totalResponseTime += log.duration;
          responseTimeCount++;
        }

        // Track errors
        if (log.level === LogLevel.ERROR && log.error) {
          const errorKey = log.error.message;
          if (errorCounts[errorKey]) {
            errorCounts[errorKey].count++;
            if (new Date(log.timestamp) > errorCounts[errorKey].lastOccurrence) {
              errorCounts[errorKey].lastOccurrence = new Date(log.timestamp);
            }
          } else {
            errorCounts[errorKey] = {
              count: 1,
              lastOccurrence: new Date(log.timestamp),
            };
          }
        }
      }

      // Calculate error rate
      stats.errorRate = logs.length > 0 ? (stats.logsByLevel[LogLevel.ERROR] / logs.length) * 100 : 0;

      // Calculate average response time
      stats.avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

      // Get top errors
      stats.topErrors = Object.entries(errorCounts)
        .map(([message, data]) => ({ message, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Cache statistics for 5 minutes
      await this.cacheManager.set(this.LOG_STATS_KEY, stats, 300000);

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get log statistics: ${error.message}`);
      return {
        totalLogs: 0,
        logsByLevel: {
          [LogLevel.ERROR]: 0,
          [LogLevel.WARN]: 0,
          [LogLevel.INFO]: 0,
          [LogLevel.DEBUG]: 0,
        },
        logsByCategory: {
          [LogCategory.APPLICATION]: 0,
          [LogCategory.SECURITY]: 0,
          [LogCategory.PERFORMANCE]: 0,
          [LogCategory.BUSINESS]: 0,
          [LogCategory.SYSTEM]: 0,
          [LogCategory.AUDIT]: 0,
        },
        logsByService: {},
        errorRate: 0,
        avgResponseTime: 0,
        topErrors: [],
      };
    }
  }

  /**
   * Clean old logs periodically
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanOldLogs(): Promise<void> {
    try {
      const logs = await this.cacheManager.get<LogEntry[]>(this.LOG_CACHE_KEY) || [];
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentLogs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);
      
      await this.cacheManager.set(this.LOG_CACHE_KEY, recentLogs, 86400000); // 24 hours
      
      const cleanedCount = logs.length - recentLogs.length;
      if (cleanedCount > 0) {
        this.logger.debug(`Cleaned ${cleanedCount} old log entries from cache`);
      }
    } catch (error) {
      this.logger.error(`Failed to clean old logs: ${error.message}`);
    }
  }

  /**
   * Store log entry in cache
   */
  private async storeLogEntry(entry: LogEntry): Promise<void> {
    try {
      const logs = await this.cacheManager.get<LogEntry[]>(this.LOG_CACHE_KEY) || [];
      logs.push(entry);

      // Keep only the last 10000 log entries in cache
      if (logs.length > 10000) {
        logs.splice(0, logs.length - 10000);
      }

      await this.cacheManager.set(this.LOG_CACHE_KEY, logs, 86400000); // 24 hours
    } catch (error) {
      this.logger.error(`Failed to store log entry: ${error.message}`);
    }
  }

  /**
   * Update log statistics
   */
  private async updateLogStatistics(entry: LogEntry): Promise<void> {
    try {
      // Invalidate cached statistics to force recalculation
      await this.cacheManager.del(this.LOG_STATS_KEY);
    } catch (error) {
      this.logger.error(`Failed to update log statistics: ${error.message}`);
    }
  }

  /**
   * Handle critical errors
   */
  private async handleCriticalError(entry: LogEntry): Promise<void> {
    try {
      // This would typically integrate with alerting systems
      this.logger.error(`CRITICAL SECURITY ERROR: ${entry.message}`, {
        service: entry.service,
        userId: entry.userId,
        ip: entry.ip,
        timestamp: entry.timestamp,
      });

      // Could send to external monitoring systems, Slack, email, etc.
    } catch (error) {
      this.logger.error(`Failed to handle critical error: ${error.message}`);
    }
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `log_${timestamp}_${random}`;
  }
}