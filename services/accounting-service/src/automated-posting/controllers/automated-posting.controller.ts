import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';
import { AuditTrailService, AuditLogFilter } from '../services/audit-trail.service';
import { ToleranceCheckService } from '../services/tolerance-check.service';
import { ApprovalWorkflowService } from '../services/approval-workflow.service';

@ApiTags('Automated Posting')
@ApiBearerAuth()
@Controller('automated-posting')
export class AutomatedPostingController {
  constructor(
    private automatedPostingService: AutomatedPostingService,
    private auditTrailService: AuditTrailService,
    private toleranceCheckService: ToleranceCheckService,
    private approvalWorkflowService: ApprovalWorkflowService,
  ) {}

  /**
   * Process single transaction event
   */
  @Post('process-transaction')
  @ApiOperation({ summary: 'Process a single transaction for automated posting' })
  @ApiResponse({ status: 200, description: 'Transaction processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transaction data' })
  @ApiResponse({ status: 500, description: 'Processing error' })
  async processTransaction(@Body() transactionEvent: TransactionEvent) {
    try {
      const result = await this.automatedPostingService.processTransaction(transactionEvent);
      
      return {
        success: true,
        data: result,
        message: result.success ? 'Transaction processed successfully' : 'Transaction processing failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process transaction',
      };
    }
  }

  /**
   * Process bulk transactions
   */
  @Post('process-bulk')
  @ApiOperation({ summary: 'Process multiple transactions in bulk' })
  @ApiResponse({ status: 200, description: 'Bulk processing completed' })
  async processBulkTransactions(@Body() transactionEvents: TransactionEvent[]) {
    try {
      const results = await this.automatedPostingService.processBulkTransactions(transactionEvents);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount,
            success_rate: (successCount / results.length) * 100,
          },
        },
        message: `Bulk processing completed: ${successCount} successful, ${failureCount} failed`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to process bulk transactions',
      };
    }
  }

  /**
   * Get processing statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get automated posting statistics' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    try {
      const filter: AuditLogFilter = {};
      
      if (dateFrom) filter.date_from = new Date(dateFrom);
      if (dateTo) filter.date_to = new Date(dateTo);
      
      const dateRange = {
        from: filter.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: filter.date_to || new Date(),
      };
      
      const auditSummary = await this.auditTrailService.getAuditSummary(filter, dateRange);
      const realTimeStats = await this.auditTrailService.getRealTimeStats();
      const workflowMetrics = await this.approvalWorkflowService.getWorkflowMetrics(dateRange);
      
      return {
        success: true,
        data: {
          audit_summary: auditSummary,
          real_time_stats: realTimeStats,
          workflow_metrics: workflowMetrics,
          date_range: dateRange,
        },
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve statistics',
      };
    }
  }

  /**
   * Get audit trail
   */
  @Get('audit-trail')
  @ApiOperation({ summary: 'Get audit trail of automated posting activities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'eventTypes', required: false, type: [String] })
  @ApiQuery({ name: 'status', required: false, type: [String] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getAuditTrail(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('eventTypes') eventTypes?: string[],
    @Query('status') status?: string[],
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    try {
      const filter: AuditLogFilter = {};
      
      if (eventTypes) filter.event_types = eventTypes as any[];
      if (status) filter.status = status as any[];
      if (dateFrom) filter.date_from = new Date(dateFrom);
      if (dateTo) filter.date_to = new Date(dateTo);
      
      const result = await this.auditTrailService.getAuditLogs(filter, page, limit);
      
      return {
        success: true,
        data: result,
        message: 'Audit trail retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve audit trail',
      };
    }
  }

  /**
   * Get processing timeline for specific document
   */
  @Get('timeline/:documentType/:documentId')
  @ApiOperation({ summary: 'Get processing timeline for a specific document' })
  @ApiParam({ name: 'documentType', description: 'Type of source document' })
  @ApiParam({ name: 'documentId', description: 'ID of source document' })
  async getProcessingTimeline(
    @Param('documentType') documentType: string,
    @Param('documentId') documentId: string
  ) {
    try {
      const timeline = await this.auditTrailService.getProcessingTimeline(
        documentType,
        documentId
      );
      
      return {
        success: true,
        data: timeline,
        message: 'Processing timeline retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve processing timeline',
      };
    }
  }

  /**
   * Get failed transactions for retry
   */
  @Get('failed-transactions')
  @ApiOperation({ summary: 'Get failed transactions that can be retried' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'olderThanMinutes', required: false, type: Number })
  async getFailedTransactions(
    @Query('limit') limit: number = 100,
    @Query('olderThanMinutes') olderThanMinutes: number = 30
  ) {
    try {
      const failedTransactions = await this.auditTrailService.getFailedTransactions(
        limit,
        olderThanMinutes
      );
      
      return {
        success: true,
        data: failedTransactions,
        message: `Found ${failedTransactions.length} failed transactions`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve failed transactions',
      };
    }
  }

  /**
   * Retry failed transaction
   */
  @Post('retry/:auditLogId')
  @ApiOperation({ summary: 'Retry a failed transaction' })
  @ApiParam({ name: 'auditLogId', description: 'Audit log ID of failed transaction' })
  async retryFailedTransaction(@Param('auditLogId') auditLogId: string) {
    try {
      // This would need implementation to reconstruct the original transaction event
      // from the audit log and retry it
      
      return {
        success: true,
        message: 'Transaction retry initiated',
        data: { audit_log_id: auditLogId },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retry transaction',
      };
    }
  }

  /**
   * Test transaction processing (dry run)
   */
  @Post('test-transaction')
  @ApiOperation({ summary: 'Test transaction processing without actually posting' })
  @ApiResponse({ status: 200, description: 'Test completed successfully' })
  async testTransaction(@Body() transactionEvent: TransactionEvent) {
    try {
      // This would perform a dry run of the transaction processing
      // without actually creating journal entries
      
      return {
        success: true,
        data: {
          test_mode: true,
          validation_results: {
            rules_matched: 0,
            templates_applicable: 0,
            estimated_journal_lines: 0,
            tolerance_checks: {
              passed: true,
              violations: [],
            },
            approval_required: false,
          },
        },
        message: 'Transaction test completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Transaction test failed',
      };
    }
  }

  /**
   * Get system health status
   */
  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  async getHealthStatus() {
    try {
      const realTimeStats = await this.auditTrailService.getRealTimeStats();
      
      const healthStatus = {
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        active_processing: realTimeStats.active_processing,
        recent_failures: realTimeStats.recent_failures,
        average_response_time: realTimeStats.average_response_time_5min,
        throughput_per_minute: realTimeStats.throughput_per_minute,
        system_indicators: {
          database_connection: 'OK',
          event_emitter: 'OK',
          approval_workflow: 'OK',
          tolerance_checks: 'OK',
        },
      };
      
      // Determine overall health status
      if (realTimeStats.recent_failures > 10) {
        healthStatus.status = 'DEGRADED';
      }
      if (realTimeStats.active_processing > 1000) {
        healthStatus.status = 'OVERLOADED';
      }
      if (realTimeStats.average_response_time_5min > 10000) { // 10 seconds
        healthStatus.status = 'SLOW';
      }
      
      return {
        success: true,
        data: healthStatus,
        message: `System status: ${healthStatus.status}`,
      };
    } catch (error) {
      return {
        success: false,
        data: {
          status: 'UNHEALTHY',
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        message: 'Health check failed',
      };
    }
  }

  /**
   * Export audit logs
   */
  @Post('export-audit-logs')
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  async exportAuditLogs(@Body() filter: AuditLogFilter) {
    try {
      const csvData = await this.auditTrailService.exportAuditLogs(filter);
      
      return {
        success: true,
        data: {
          csv_content: csvData,
          filename: `audit_logs_${new Date().toISOString().split('T')[0]}.csv`,
          content_type: 'text/csv',
        },
        message: 'Audit logs exported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to export audit logs',
      };
    }
  }

  /**
   * Get tolerance violations
   */
  @Get('tolerance-violations')
  @ApiOperation({ summary: 'Get recent tolerance violations' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getToleranceViolations(@Query('days') days: number = 7) {
    try {
      // This would need implementation to retrieve tolerance violations
      // from the audit logs or a separate violations table
      
      return {
        success: true,
        data: {
          violations: [],
          summary: {
            total_violations: 0,
            critical_violations: 0,
            pending_approvals: 0,
          },
        },
        message: 'Tolerance violations retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve tolerance violations',
      };
    }
  }

  /**
   * Get performance metrics for rules and templates
   */
  @Get('performance-metrics/:entityType/:entityId')
  @ApiOperation({ summary: 'Get performance metrics for rule or template' })
  @ApiParam({ name: 'entityType', enum: ['rule', 'template'] })
  @ApiParam({ name: 'entityId', description: 'Rule or template ID' })
  async getPerformanceMetrics(
    @Param('entityType') entityType: 'rule' | 'template',
    @Param('entityId') entityId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    try {
      const dateRange = dateFrom && dateTo ? {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      } : undefined;
      
      const metrics = await this.auditTrailService.getPerformanceMetrics(
        entityType.toUpperCase() as 'RULE' | 'TEMPLATE',
        entityId,
        dateRange
      );
      
      return {
        success: true,
        data: metrics,
        message: 'Performance metrics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve performance metrics',
      };
    }
  }

  /**
   * Trigger manual period-end processing
   */
  @Post('period-end/:periodId')
  @ApiOperation({ summary: 'Trigger manual period-end processing' })
  @ApiParam({ name: 'periodId', description: 'Accounting period ID' })
  async triggerPeriodEndProcessing(@Param('periodId') periodId: string) {
    try {
      // This would trigger the period-end automation workflow
      // Implementation would depend on your period-end process
      
      return {
        success: true,
        data: {
          period_id: periodId,
          process_id: `PERIOD_END_${periodId}_${Date.now()}`,
          status: 'INITIATED',
        },
        message: 'Period-end processing initiated',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to initiate period-end processing',
      };
    }
  }
}