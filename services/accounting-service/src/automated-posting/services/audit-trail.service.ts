import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { AutomationAuditLog, AutomationEvent, AutomationStatus } from '../entities/automation-audit-log.entity';

export interface AuditLogFilter {
  event_types?: AutomationEvent[];
  status?: AutomationStatus[];
  date_from?: Date;
  date_to?: Date;
  rule_ids?: string[];
  template_ids?: string[];
  source_document_types?: string[];
  processed_by?: string[];
}

export interface AuditLogSummary {
  total_events: number;
  successful_events: number;
  failed_events: number;
  pending_events: number;
  average_processing_time: number;
  most_common_errors: Array<{
    error: string;
    count: number;
  }>;
  performance_by_template: Array<{
    template_id: string;
    total_processed: number;
    success_rate: number;
    average_time: number;
  }>;
}

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  constructor(
    @InjectRepository(AutomationAuditLog)
    private auditLogRepository: Repository<AutomationAuditLog>,
  ) {}

  /**
   * Create new audit log entry
   */
  async createAuditLog(logData: Partial<AutomationAuditLog>): Promise<AutomationAuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...logData,
        created_at: new Date(),
      });

      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Error creating audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update existing audit log
   */
  async updateAuditLog(
    logId: string,
    updateData: Partial<AutomationAuditLog>
  ): Promise<AutomationAuditLog> {
    try {
      await this.auditLogRepository.update(logId, updateData);
      return await this.auditLogRepository.findOne({ where: { log_id: logId } });
    } catch (error) {
      this.logger.error(`Error updating audit log ${logId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(
    filter: AuditLogFilter = {},
    page: number = 1,
    limit: number = 100
  ): Promise<{
    logs: AutomationAuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('log')
        .orderBy('log.created_at', 'DESC');

      // Apply filters
      if (filter.event_types && filter.event_types.length > 0) {
        queryBuilder.andWhere('log.event_type IN (:...eventTypes)', {
          eventTypes: filter.event_types,
        });
      }

      if (filter.status && filter.status.length > 0) {
        queryBuilder.andWhere('log.status IN (:...status)', {
          status: filter.status,
        });
      }

      if (filter.date_from && filter.date_to) {
        queryBuilder.andWhere('log.created_at BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filter.date_from,
          dateTo: filter.date_to,
        });
      }

      if (filter.rule_ids && filter.rule_ids.length > 0) {
        queryBuilder.andWhere('log.rule_id IN (:...ruleIds)', {
          ruleIds: filter.rule_ids,
        });
      }

      if (filter.template_ids && filter.template_ids.length > 0) {
        queryBuilder.andWhere('log.template_id IN (:...templateIds)', {
          templateIds: filter.template_ids,
        });
      }

      if (filter.source_document_types && filter.source_document_types.length > 0) {
        queryBuilder.andWhere('log.source_document_type IN (:...docTypes)', {
          docTypes: filter.source_document_types,
        });
      }

      if (filter.processed_by && filter.processed_by.length > 0) {
        queryBuilder.andWhere('log.processed_by IN (:...processedBy)', {
          processedBy: filter.processed_by,
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const logs = await queryBuilder.getMany();

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error fetching audit logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get audit log summary statistics
   */
  async getAuditSummary(
    filter: AuditLogFilter = {},
    dateRange: { from: Date; to: Date }
  ): Promise<AuditLogSummary> {
    try {
      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('log')
        .where('log.created_at BETWEEN :dateFrom AND :dateTo', {
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
        });

      // Apply additional filters
      this.applyFiltersToQueryBuilder(queryBuilder, filter);

      // Get basic counts
      const totalEvents = await queryBuilder.getCount();
      
      const successfulEvents = await queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: AutomationStatus.SUCCESS })
        .getCount();

      const failedEvents = await queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: AutomationStatus.FAILED })
        .getCount();

      const pendingEvents = await queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: AutomationStatus.PENDING })
        .getCount();

      // Calculate average processing time
      const avgProcessingTimeResult = await queryBuilder
        .clone()
        .select('AVG(log.processing_time_ms)', 'avg_time')
        .andWhere('log.processing_time_ms > 0')
        .getRawOne();

      const averageProcessingTime = parseFloat(avgProcessingTimeResult?.avg_time || '0');

      // Get most common errors
      const errorResults = await queryBuilder
        .clone()
        .select('log.error_message', 'error')
        .addSelect('COUNT(*)', 'count')
        .where('log.error_message IS NOT NULL')
        .andWhere("log.error_message != ''")
        .groupBy('log.error_message')
        .orderBy('COUNT(*)', 'DESC')
        .limit(10)
        .getRawMany();

      const mostCommonErrors = errorResults.map(result => ({
        error: result.error,
        count: parseInt(result.count),
      }));

      // Get performance by template
      const templateResults = await queryBuilder
        .clone()
        .select('log.template_id', 'template_id')
        .addSelect('COUNT(*)', 'total_processed')
        .addSelect('COUNT(CASE WHEN log.status = :success THEN 1 END)', 'successful')
        .addSelect('AVG(log.processing_time_ms)', 'avg_time')
        .where('log.template_id IS NOT NULL')
        .groupBy('log.template_id')
        .setParameter('success', AutomationStatus.SUCCESS)
        .getRawMany();

      const performanceByTemplate = templateResults.map(result => ({
        template_id: result.template_id,
        total_processed: parseInt(result.total_processed),
        success_rate: result.total_processed > 0 ? 
          (parseInt(result.successful) / parseInt(result.total_processed)) * 100 : 0,
        average_time: parseFloat(result.avg_time || '0'),
      }));

      return {
        total_events: totalEvents,
        successful_events: successfulEvents,
        failed_events: failedEvents,
        pending_events: pendingEvents,
        average_processing_time: averageProcessingTime,
        most_common_errors: mostCommonErrors,
        performance_by_template: performanceByTemplate,
      };

    } catch (error) {
      this.logger.error(`Error generating audit summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Apply filters to query builder
   */
  private applyFiltersToQueryBuilder(queryBuilder: any, filter: AuditLogFilter): void {
    if (filter.event_types && filter.event_types.length > 0) {
      queryBuilder.andWhere('log.event_type IN (:...eventTypes)', {
        eventTypes: filter.event_types,
      });
    }

    if (filter.rule_ids && filter.rule_ids.length > 0) {
      queryBuilder.andWhere('log.rule_id IN (:...ruleIds)', {
        ruleIds: filter.rule_ids,
      });
    }

    if (filter.template_ids && filter.template_ids.length > 0) {
      queryBuilder.andWhere('log.template_id IN (:...templateIds)', {
        templateIds: filter.template_ids,
      });
    }
  }

  /**
   * Get processing timeline for a specific document
   */
  async getProcessingTimeline(
    sourceDocumentType: string,
    sourceDocumentId: string
  ): Promise<AutomationAuditLog[]> {
    try {
      return await this.auditLogRepository.find({
        where: {
          source_document_type: sourceDocumentType,
          source_document_id: sourceDocumentId,
        },
        order: { created_at: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching processing timeline: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get failed transactions for retry
   */
  async getFailedTransactions(
    limit: number = 100,
    olderThanMinutes: number = 30
  ): Promise<AutomationAuditLog[]> {
    try {
      const cutoffTime = new Date(Date.now() - (olderThanMinutes * 60 * 1000));

      return await this.auditLogRepository.find({
        where: {
          status: AutomationStatus.FAILED,
          created_at: Between(new Date(Date.now() - (24 * 60 * 60 * 1000)), cutoffTime),
        },
        order: { created_at: 'ASC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error fetching failed transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get performance metrics for specific rule or template
   */
  async getPerformanceMetrics(
    entityType: 'RULE' | 'TEMPLATE',
    entityId: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    success_rate: number;
    average_processing_time: number;
    median_processing_time: number;
    error_breakdown: Array<{
      error_type: string;
      count: number;
      percentage: number;
    }>;
    processing_trends: Array<{
      date: string;
      executions: number;
      success_rate: number;
      avg_time: number;
    }>;
  }> {
    try {
      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('log');

      if (entityType === 'RULE') {
        queryBuilder.where('log.rule_id = :entityId', { entityId });
      } else {
        queryBuilder.where('log.template_id = :entityId', { entityId });
      }

      if (dateRange) {
        queryBuilder.andWhere('log.created_at BETWEEN :dateFrom AND :dateTo', {
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
        });
      }

      // Basic metrics
      const totalExecutions = await queryBuilder.getCount();
      
      const successfulExecutions = await queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: AutomationStatus.SUCCESS })
        .getCount();

      const failedExecutions = await queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: AutomationStatus.FAILED })
        .getCount();

      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      // Processing time metrics
      const processingTimes = await queryBuilder
        .clone()
        .select('log.processing_time_ms')
        .andWhere('log.processing_time_ms > 0')
        .orderBy('log.processing_time_ms', 'ASC')
        .getRawMany();

      const times = processingTimes.map(pt => pt.processing_time_ms);
      const averageProcessingTime = times.length > 0 ? 
        times.reduce((sum, time) => sum + time, 0) / times.length : 0;
      
      const medianProcessingTime = times.length > 0 ? 
        times[Math.floor(times.length / 2)] : 0;

      // Error breakdown
      const errorResults = await queryBuilder
        .clone()
        .select('log.error_message', 'error_message')
        .addSelect('COUNT(*)', 'count')
        .where('log.error_message IS NOT NULL')
        .andWhere('log.status = :status', { status: AutomationStatus.FAILED })
        .groupBy('log.error_message')
        .orderBy('COUNT(*)', 'DESC')
        .getRawMany();

      const errorBreakdown = errorResults.map(result => ({
        error_type: result.error_message,
        count: parseInt(result.count),
        percentage: failedExecutions > 0 ? (parseInt(result.count) / failedExecutions) * 100 : 0,
      }));

      // Processing trends (daily)
      const trendResults = await queryBuilder
        .clone()
        .select("DATE(log.created_at)", 'date')
        .addSelect('COUNT(*)', 'executions')
        .addSelect('COUNT(CASE WHEN log.status = :success THEN 1 END)', 'successful')
        .addSelect('AVG(log.processing_time_ms)', 'avg_time')
        .groupBy("DATE(log.created_at)")
        .orderBy("DATE(log.created_at)", 'ASC')
        .setParameter('success', AutomationStatus.SUCCESS)
        .getRawMany();

      const processingTrends = trendResults.map(result => ({
        date: result.date,
        executions: parseInt(result.executions),
        success_rate: result.executions > 0 ? 
          (parseInt(result.successful) / parseInt(result.executions)) * 100 : 0,
        avg_time: parseFloat(result.avg_time || '0'),
      }));

      return {
        total_executions: totalExecutions,
        successful_executions: successfulExecutions,
        failed_executions: failedExecutions,
        success_rate: successRate,
        average_processing_time: averageProcessingTime,
        median_processing_time: medianProcessingTime,
        error_breakdown: errorBreakdown,
        processing_trends: processingTrends,
      };

    } catch (error) {
      this.logger.error(`Error fetching performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Archive old audit logs
   */
  async archiveOldLogs(olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.auditLogRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :cutoffDate', { cutoffDate })
        .andWhere('status IN (:...completedStatus)', {
          completedStatus: [AutomationStatus.SUCCESS, AutomationStatus.FAILED, AutomationStatus.CANCELLED],
        })
        .execute();

      this.logger.log(`Archived ${result.affected} audit log entries older than ${olderThanDays} days`);
      return result.affected || 0;

    } catch (error) {
      this.logger.error(`Error archiving old logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get real-time processing statistics
   */
  async getRealTimeStats(): Promise<{
    active_processing: number;
    processing_queue_size: number;
    recent_failures: number;
    average_response_time_5min: number;
    throughput_per_minute: number;
  }> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - (5 * 60 * 1000));
      const oneMinuteAgo = new Date(now.getTime() - (1 * 60 * 1000));

      // Active processing (pending status)
      const activeProcessing = await this.auditLogRepository.count({
        where: { status: AutomationStatus.PENDING },
      });

      // Recent failures (last 5 minutes)
      const recentFailures = await this.auditLogRepository.count({
        where: {
          status: AutomationStatus.FAILED,
          created_at: Between(fiveMinutesAgo, now),
        },
      });

      // Average response time in last 5 minutes
      const recentProcessingResult = await this.auditLogRepository
        .createQueryBuilder('log')
        .select('AVG(log.processing_time_ms)', 'avg_time')
        .where('log.created_at BETWEEN :from AND :to', {
          from: fiveMinutesAgo,
          to: now,
        })
        .andWhere('log.processing_time_ms > 0')
        .getRawOne();

      const averageResponseTime = parseFloat(recentProcessingResult?.avg_time || '0');

      // Throughput per minute (last minute)
      const throughputResult = await this.auditLogRepository.count({
        where: {
          status: AutomationStatus.SUCCESS,
          created_at: Between(oneMinuteAgo, now),
        },
      });

      return {
        active_processing: activeProcessing,
        processing_queue_size: activeProcessing, // For now, same as active processing
        recent_failures: recentFailures,
        average_response_time_5min: averageResponseTime,
        throughput_per_minute: throughputResult,
      };

    } catch (error) {
      this.logger.error(`Error fetching real-time stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filter: AuditLogFilter = {}): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs(filter, 1, 10000); // Max 10k records

      const csvHeader = 'Date,Event Type,Status,Template,Rule,Source Document,Amount,Processing Time,Error Message\n';
      
      const csvRows = logs.map(log => {
        const row = [
          log.created_at.toISOString(),
          log.event_type,
          log.status,
          log.template_id || '',
          log.rule_id || '',
          `${log.source_document_type || ''}:${log.source_document_id || ''}`,
          log.total_amount?.toString() || '0',
          log.processing_time_ms?.toString() || '0',
          `"${(log.error_message || '').replace(/"/g, '""')}"`,
        ];
        return row.join(',');
      }).join('\n');

      return csvHeader + csvRows;

    } catch (error) {
      this.logger.error(`Error exporting audit logs: ${error.message}`, error.stack);
      throw error;
    }
  }
}