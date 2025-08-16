"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CentralizedLoggerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralizedLoggerService = exports.LogCategory = exports.LogLevel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_2 = require("cache-manager");
const schedule_1 = require("@nestjs/schedule");
const winston = __importStar(require("winston"));
const DailyRotateFile = __importStar(require("winston-daily-rotate-file"));
// import * as ElasticsearchTransport from 'winston-elasticsearch';
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory["APPLICATION"] = "application";
    LogCategory["SECURITY"] = "security";
    LogCategory["PERFORMANCE"] = "performance";
    LogCategory["BUSINESS"] = "business";
    LogCategory["SYSTEM"] = "system";
    LogCategory["AUDIT"] = "audit";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
let CentralizedLoggerService = CentralizedLoggerService_1 = class CentralizedLoggerService {
    configService;
    cacheManager;
    logger = new common_1.Logger(CentralizedLoggerService_1.name);
    winstonLogger;
    LOG_CACHE_KEY = 'logs:entries';
    LOG_STATS_KEY = 'logs:statistics';
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.initializeWinstonLogger();
    }
    /**
     * Initialize Winston logger with multiple transports
     */
    initializeWinstonLogger() {
        const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json(), winston.format.colorize({ all: true }));
        // Console transport for development
        const consoleTransport = new winston.transports.Console({
            level: this.configService.get('LOG_LEVEL', 'info'),
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
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
        const transports = [
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
    async log(entry) {
        const logEntry = {
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
    async logError(service, message, error, metadata) {
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
    async logWarning(service, message, metadata) {
        await this.log({
            level: LogLevel.WARN,
            category: LogCategory.APPLICATION,
            service,
            message,
            metadata,
        });
    }
    async logInfo(service, message, metadata) {
        await this.log({
            level: LogLevel.INFO,
            category: LogCategory.APPLICATION,
            service,
            message,
            metadata,
        });
    }
    async logDebug(service, message, metadata) {
        await this.log({
            level: LogLevel.DEBUG,
            category: LogCategory.APPLICATION,
            service,
            message,
            metadata,
        });
    }
    async logSecurity(service, message, userId, ip, metadata) {
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
    async logPerformance(service, message, duration, metadata) {
        await this.log({
            level: LogLevel.INFO,
            category: LogCategory.PERFORMANCE,
            service,
            message,
            duration,
            metadata,
        });
    }
    async logAudit(service, message, userId, action, metadata) {
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
    async queryLogs(query) {
        try {
            const cachedLogs = await this.cacheManager.get(this.LOG_CACHE_KEY) || [];
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
                filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= query.fromTimestamp);
            }
            if (query.toTimestamp) {
                filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= query.toTimestamp);
            }
            if (query.searchText) {
                const searchLower = query.searchText.toLowerCase();
                filteredLogs = filteredLogs.filter(log => log.message.toLowerCase().includes(searchLower) ||
                    JSON.stringify(log.data || {}).toLowerCase().includes(searchLower));
            }
            // Sort by timestamp (newest first)
            filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            // Apply pagination
            const offset = query.offset || 0;
            const limit = query.limit || 100;
            return filteredLogs.slice(offset, offset + limit);
        }
        catch (error) {
            this.logger.error(`Failed to query logs: ${error.message}`);
            return [];
        }
    }
    /**
     * Get log statistics
     */
    async getLogStatistics() {
        try {
            const cachedStats = await this.cacheManager.get(this.LOG_STATS_KEY);
            if (cachedStats) {
                return cachedStats;
            }
            // Calculate statistics from cached logs
            const logs = await this.cacheManager.get(this.LOG_CACHE_KEY) || [];
            const stats = {
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
            const errorCounts = {};
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
                    }
                    else {
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
        }
        catch (error) {
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
    async cleanOldLogs() {
        try {
            const logs = await this.cacheManager.get(this.LOG_CACHE_KEY) || [];
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentLogs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);
            await this.cacheManager.set(this.LOG_CACHE_KEY, recentLogs, 86400000); // 24 hours
            const cleanedCount = logs.length - recentLogs.length;
            if (cleanedCount > 0) {
                this.logger.debug(`Cleaned ${cleanedCount} old log entries from cache`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to clean old logs: ${error.message}`);
        }
    }
    /**
     * Store log entry in cache
     */
    async storeLogEntry(entry) {
        try {
            const logs = await this.cacheManager.get(this.LOG_CACHE_KEY) || [];
            logs.push(entry);
            // Keep only the last 10000 log entries in cache
            if (logs.length > 10000) {
                logs.splice(0, logs.length - 10000);
            }
            await this.cacheManager.set(this.LOG_CACHE_KEY, logs, 86400000); // 24 hours
        }
        catch (error) {
            this.logger.error(`Failed to store log entry: ${error.message}`);
        }
    }
    /**
     * Update log statistics
     */
    async updateLogStatistics(entry) {
        try {
            // Invalidate cached statistics to force recalculation
            await this.cacheManager.del(this.LOG_STATS_KEY);
        }
        catch (error) {
            this.logger.error(`Failed to update log statistics: ${error.message}`);
        }
    }
    /**
     * Handle critical errors
     */
    async handleCriticalError(entry) {
        try {
            // This would typically integrate with alerting systems
            this.logger.error(`CRITICAL SECURITY ERROR: ${entry.message}`, {
                service: entry.service,
                userId: entry.userId,
                ip: entry.ip,
                timestamp: entry.timestamp,
            });
            // Could send to external monitoring systems, Slack, email, etc.
        }
        catch (error) {
            this.logger.error(`Failed to handle critical error: ${error.message}`);
        }
    }
    /**
     * Generate unique log ID
     */
    generateLogId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `log_${timestamp}_${random}`;
    }
};
exports.CentralizedLoggerService = CentralizedLoggerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CentralizedLoggerService.prototype, "cleanOldLogs", null);
exports.CentralizedLoggerService = CentralizedLoggerService = CentralizedLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof cache_manager_2.Cache !== "undefined" && cache_manager_2.Cache) === "function" ? _b : Object])
], CentralizedLoggerService);
//# sourceMappingURL=centralized-logger.service.js.map