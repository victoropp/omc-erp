import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export declare enum LogCategory {
    APPLICATION = "application",
    SECURITY = "security",
    PERFORMANCE = "performance",
    BUSINESS = "business",
    SYSTEM = "system",
    AUDIT = "audit"
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
export declare class CentralizedLoggerService {
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private winstonLogger;
    private readonly LOG_CACHE_KEY;
    private readonly LOG_STATS_KEY;
    constructor(configService: ConfigService, cacheManager: Cache);
    /**
     * Initialize Winston logger with multiple transports
     */
    private initializeWinstonLogger;
    /**
     * Log an entry
     */
    log(entry: Partial<LogEntry>): Promise<void>;
    /**
     * Convenience methods for different log levels
     */
    logError(service: string, message: string, error?: Error, metadata?: any): Promise<void>;
    logWarning(service: string, message: string, metadata?: any): Promise<void>;
    logInfo(service: string, message: string, metadata?: any): Promise<void>;
    logDebug(service: string, message: string, metadata?: any): Promise<void>;
    logSecurity(service: string, message: string, userId?: string, ip?: string, metadata?: any): Promise<void>;
    logPerformance(service: string, message: string, duration: number, metadata?: any): Promise<void>;
    logAudit(service: string, message: string, userId: string, action: string, metadata?: any): Promise<void>;
    /**
     * Query logs
     */
    queryLogs(query: LogQuery): Promise<LogEntry[]>;
    /**
     * Get log statistics
     */
    getLogStatistics(): Promise<LogStatistics>;
    /**
     * Clean old logs periodically
     */
    cleanOldLogs(): Promise<void>;
    /**
     * Store log entry in cache
     */
    private storeLogEntry;
    /**
     * Update log statistics
     */
    private updateLogStatistics;
    /**
     * Handle critical errors
     */
    private handleCriticalError;
    /**
     * Generate unique log ID
     */
    private generateLogId;
}
//# sourceMappingURL=centralized-logger.service.d.ts.map