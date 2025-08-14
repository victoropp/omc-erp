import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PricingWindowService } from '../pricing-window/pricing-window.service';
import { UppfClaimsService } from '../uppf-claims/uppf-claims.service';
import { PriceCalculationService } from '../price-buildup/price-calculation.service';

export interface AutomationJobStatus {
  jobName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  lastRun?: Date;
  nextRun?: Date;
  lastError?: string;
  executionCount: number;
  averageExecutionTime: number;
}

export interface JobExecutionResult {
  jobName: string;
  startTime: Date;
  endTime: Date;
  executionTime: number;
  success: boolean;
  result?: any;
  error?: string;
}

@Injectable()
export class BackgroundAutomationService {
  private readonly logger = new Logger(BackgroundAutomationService.name);
  
  private readonly jobStatuses = new Map<string, AutomationJobStatus>();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly eventEmitter: EventEmitter2,
    private readonly pricingWindowService: PricingWindowService,
    private readonly uppfClaimsService: UppfClaimsService,
    private readonly priceCalculationService: PriceCalculationService
  ) {
    this.initializeJobStatuses();
  }

  private initializeJobStatuses(): void {
    const jobs = [
      'biWeeklyWindowCreation',
      'dailyPriceValidation',
      'weeklyUppfClaimsProcessing',
      'monthlyPriceArchiving',
      'dailyReportsGeneration',
      'weeklyNpaSubmissions',
      'dailySystemHealthCheck'
    ];

    jobs.forEach(jobName => {
      this.jobStatuses.set(jobName, {
        jobName,
        status: 'SCHEDULED',
        executionCount: 0,
        averageExecutionTime: 0
      });
    });
  }

  /**
   * Create bi-weekly pricing windows automatically
   * Runs every Monday at 6:00 AM Ghana Time (start of new pricing period)
   */
  @Cron('0 6 * * 1', {
    name: 'biWeeklyWindowCreation',
    timeZone: 'Africa/Accra'
  })
  async createBiWeeklyPricingWindow(): Promise<void> {
    const jobName = 'biWeeklyWindowCreation';
    this.logger.log('Starting automated bi-weekly pricing window creation');
    
    const result = await this.executeJob(jobName, async () => {
      const newWindow = await this.pricingWindowService.createBiWeeklyWindow();
      
      // Auto-calculate and publish prices
      await this.pricingWindowService.calculateAndPublishPrices(
        newWindow.windowId,
        'SYSTEM_AUTOMATED'
      );

      this.eventEmitter.emit('automation.window.created', {
        windowId: newWindow.windowId,
        createdAt: new Date()
      });

      return {
        windowId: newWindow.windowId,
        windowNumber: newWindow.windowNumber,
        year: newWindow.year,
        publishedStations: await this.getPublishedStationsCount(newWindow.windowId)
      };
    });

    if (result.success) {
      this.logger.log(`Bi-weekly window creation completed: ${result.result?.windowId}`);
    } else {
      this.logger.error(`Bi-weekly window creation failed: ${result.error}`);
    }
  }

  /**
   * Daily price validation and health checks
   * Runs every day at 7:00 AM Ghana Time
   */
  @Cron('0 7 * * *', {
    name: 'dailyPriceValidation',
    timeZone: 'Africa/Accra'
  })
  async performDailyPriceValidation(): Promise<void> {
    const jobName = 'dailyPriceValidation';
    this.logger.log('Starting daily price validation');

    const result = await this.executeJob(jobName, async () => {
      const currentWindow = await this.pricingWindowService.getCurrentActiveWindow();
      
      if (!currentWindow) {
        throw new Error('No active pricing window found');
      }

      // Validate current window prices
      const validationResult = await this.priceCalculationService.validatePriceLogic(
        currentWindow.windowId
      );

      // Check for price anomalies
      const anomalies = await this.detectPriceAnomalies(currentWindow.windowId);

      // Send alerts if issues found
      if (!validationResult.isValid || anomalies.length > 0) {
        await this.sendPriceValidationAlert({
          windowId: currentWindow.windowId,
          validationErrors: validationResult.errors,
          anomalies,
          severity: anomalies.length > 5 ? 'HIGH' : 'MEDIUM'
        });
      }

      return {
        windowId: currentWindow.windowId,
        isValid: validationResult.isValid,
        errorsCount: validationResult.errors.length,
        warningsCount: validationResult.warnings.length,
        anomaliesCount: anomalies.length
      };
    });

    if (result.success) {
      this.logger.log(`Daily price validation completed for window: ${result.result?.windowId}`);
    }
  }

  /**
   * Weekly UPPF claims processing
   * Runs every Friday at 2:00 PM Ghana Time (before window closes)
   */
  @Cron('0 14 * * 5', {
    name: 'weeklyUppfClaimsProcessing',
    timeZone: 'Africa/Accra'
  })
  async processWeeklyUppfClaims(): Promise<void> {
    const jobName = 'weeklyUppfClaimsProcessing';
    this.logger.log('Starting weekly UPPF claims processing');

    const result = await this.executeJob(jobName, async () => {
      const currentWindow = await this.pricingWindowService.getCurrentActiveWindow();
      
      if (!currentWindow) {
        throw new Error('No active pricing window found');
      }

      // Auto-submit eligible UPPF claims
      const submissionResult = await this.uppfClaimsService.submitClaimsToNpa(
        currentWindow.windowId,
        'SYSTEM_AUTOMATED'
      );

      // Generate UPPF claims summary
      const claimsSummary = await this.uppfClaimsService.getClaimsSummary(
        currentWindow.windowId
      );

      this.eventEmitter.emit('automation.uppf.processed', {
        windowId: currentWindow.windowId,
        submissionReference: submissionResult.submissionReference,
        totalClaims: submissionResult.totalClaims,
        totalAmount: submissionResult.totalAmount
      });

      return {
        windowId: currentWindow.windowId,
        submissionReference: submissionResult.submissionReference,
        claimsSubmitted: submissionResult.totalClaims,
        totalAmount: submissionResult.totalAmount,
        claimsSummary
      };
    });

    if (result.success) {
      this.logger.log(`Weekly UPPF claims processing completed: ${result.result?.claimsSubmitted} claims submitted`);
    }
  }

  /**
   * Monthly pricing data archiving
   * Runs on the 1st day of each month at 3:00 AM Ghana Time
   */
  @Cron('0 3 1 * *', {
    name: 'monthlyPriceArchiving',
    timeZone: 'Africa/Accra'
  })
  async performMonthlyArchiving(): Promise<void> {
    const jobName = 'monthlyPriceArchiving';
    this.logger.log('Starting monthly pricing data archiving');

    const result = await this.executeJob(jobName, async () => {
      // Archive windows older than 1 year
      const archivedWindows = await this.pricingWindowService.archiveOldWindows(365);
      
      // Archive old station prices (keep last 2 years)
      const archivedPrices = await this.archiveOldStationPrices(730);
      
      // Cleanup old logs and temporary files
      const cleanupResult = await this.performSystemCleanup();

      this.eventEmitter.emit('automation.archiving.completed', {
        archivedWindows,
        archivedPrices,
        cleanupResult,
        completedAt: new Date()
      });

      return {
        archivedWindows,
        archivedPrices,
        cleanupResult,
        totalSpaceFreed: cleanupResult.spaceFreedMB
      };
    });

    if (result.success) {
      this.logger.log(`Monthly archiving completed: ${result.result?.archivedWindows} windows archived`);
    }
  }

  /**
   * Daily automated reports generation
   * Runs every day at 8:00 AM Ghana Time
   */
  @Cron('0 8 * * *', {
    name: 'dailyReportsGeneration',
    timeZone: 'Africa/Accra'
  })
  async generateDailyReports(): Promise<void> {
    const jobName = 'dailyReportsGeneration';
    this.logger.log('Starting daily reports generation');

    const result = await this.executeJob(jobName, async () => {
      const currentDate = new Date();
      const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      
      // Generate daily pricing summary
      const pricingSummary = await this.generateDailyPricingSummary(yesterday);
      
      // Generate UPPF claims report
      const uppfReport = await this.uppfClaimsService.generateClaimsReport(
        yesterday, 
        currentDate, 
        'summary'
      );
      
      // Send reports to stakeholders
      await this.sendDailyReportsToStakeholders({
        date: yesterday,
        pricingSummary,
        uppfReport,
        systemHealth: await this.getSystemHealthStatus()
      });

      return {
        date: yesterday,
        reportsGenerated: ['pricing_summary', 'uppf_claims', 'system_health'],
        stakeholdersNotified: await this.getStakeholderCount()
      };
    });

    if (result.success) {
      this.logger.log(`Daily reports generation completed for ${result.result?.date.toDateString()}`);
    }
  }

  /**
   * Weekly NPA submissions check and processing
   * Runs every Wednesday at 10:00 AM Ghana Time
   */
  @Cron('0 10 * * 3', {
    name: 'weeklyNpaSubmissions',
    timeZone: 'Africa/Accra'
  })
  async processWeeklyNpaSubmissions(): Promise<void> {
    const jobName = 'weeklyNpaSubmissions';
    this.logger.log('Starting weekly NPA submissions processing');

    const result = await this.executeJob(jobName, async () => {
      // Check for pending NPA responses
      const pendingResponses = await this.checkPendingNpaResponses();
      
      // Process any received responses
      let processedResponses = 0;
      for (const response of pendingResponses) {
        try {
          // Mock processing - would integrate with actual NPA systems
          await this.processNpaResponseAutomatically(response);
          processedResponses++;
        } catch (error) {
          this.logger.error(`Failed to process NPA response ${response.id}:`, error);
        }
      }

      // Check submission deadlines and send alerts
      const upcomingDeadlines = await this.checkUpcomingSubmissionDeadlines();
      
      if (upcomingDeadlines.length > 0) {
        await this.sendSubmissionDeadlineAlerts(upcomingDeadlines);
      }

      return {
        pendingResponses: pendingResponses.length,
        processedResponses,
        upcomingDeadlines: upcomingDeadlines.length,
        alertsSent: upcomingDeadlines.length
      };
    });

    if (result.success) {
      this.logger.log(`Weekly NPA submissions processing completed: ${result.result?.processedResponses} responses processed`);
    }
  }

  /**
   * Daily system health check
   * Runs every day at 6:00 AM Ghana Time
   */
  @Cron('0 6 * * *', {
    name: 'dailySystemHealthCheck',
    timeZone: 'Africa/Accra'
  })
  async performSystemHealthCheck(): Promise<void> {
    const jobName = 'dailySystemHealthCheck';
    this.logger.log('Starting daily system health check');

    const result = await this.executeJob(jobName, async () => {
      const healthStatus = await this.getSystemHealthStatus();
      
      // Check database connectivity
      const dbHealth = await this.checkDatabaseHealth();
      
      // Check external services connectivity
      const servicesHealth = await this.checkExternalServicesHealth();
      
      // Check disk space and memory usage
      const resourcesHealth = await this.checkSystemResources();
      
      // Calculate overall health score
      const overallHealthScore = this.calculateHealthScore({
        database: dbHealth.score,
        services: servicesHealth.score,
        resources: resourcesHealth.score
      });

      // Send alerts if health score is below threshold
      if (overallHealthScore < 80) {
        await this.sendSystemHealthAlert({
          overallScore: overallHealthScore,
          dbHealth,
          servicesHealth,
          resourcesHealth,
          severity: overallHealthScore < 60 ? 'CRITICAL' : 'WARNING'
        });
      }

      return {
        overallHealthScore,
        dbHealth: dbHealth.status,
        servicesHealth: servicesHealth.status,
        resourcesHealth: resourcesHealth.status,
        alertsSent: overallHealthScore < 80 ? 1 : 0
      };
    });

    if (result.success) {
      this.logger.log(`Daily system health check completed - Overall score: ${result.result?.overallHealthScore}%`);
    }
  }

  /**
   * Get status of all automation jobs
   */
  async getJobStatuses(): Promise<AutomationJobStatus[]> {
    const statuses = Array.from(this.jobStatuses.values());
    
    // Update next run times from cron jobs
    for (const status of statuses) {
      try {
        const cronJob = this.schedulerRegistry.getCronJob(status.jobName);
        status.nextRun = cronJob.nextDates().toDate();
      } catch (error) {
        // Job might not be registered yet
      }
    }

    return statuses;
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(jobName: string): Promise<JobExecutionResult> {
    this.logger.log(`Manually triggering job: ${jobName}`);

    const jobMethods = {
      'biWeeklyWindowCreation': () => this.createBiWeeklyPricingWindow(),
      'dailyPriceValidation': () => this.performDailyPriceValidation(),
      'weeklyUppfClaimsProcessing': () => this.processWeeklyUppfClaims(),
      'monthlyPriceArchiving': () => this.performMonthlyArchiving(),
      'dailyReportsGeneration': () => this.generateDailyReports(),
      'weeklyNpaSubmissions': () => this.processWeeklyNpaSubmissions(),
      'dailySystemHealthCheck': () => this.performSystemHealthCheck()
    };

    const jobMethod = jobMethods[jobName];
    if (!jobMethod) {
      throw new Error(`Unknown job name: ${jobName}`);
    }

    const startTime = new Date();
    let result: any;
    let error: string | undefined;
    let success = false;

    try {
      result = await jobMethod();
      success = true;
    } catch (err) {
      error = err.message;
      this.logger.error(`Manual job execution failed for ${jobName}:`, err);
    }

    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();

    return {
      jobName,
      startTime,
      endTime,
      executionTime,
      success,
      result,
      error
    };
  }

  // Private helper methods

  private async executeJob(jobName: string, jobFunction: () => Promise<any>): Promise<JobExecutionResult> {
    const startTime = new Date();
    const status = this.jobStatuses.get(jobName);
    
    if (status) {
      status.status = 'RUNNING';
      status.lastRun = startTime;
    }

    let result: any;
    let error: string | undefined;
    let success = false;

    try {
      result = await jobFunction();
      success = true;
      
      if (status) {
        status.status = 'COMPLETED';
        status.executionCount++;
      }
    } catch (err) {
      error = err.message;
      success = false;
      
      if (status) {
        status.status = 'FAILED';
        status.lastError = error;
      }
      
      this.eventEmitter.emit('automation.job.failed', {
        jobName,
        error,
        timestamp: new Date()
      });
    }

    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();

    if (status && success) {
      // Update average execution time
      const totalTime = status.averageExecutionTime * (status.executionCount - 1) + executionTime;
      status.averageExecutionTime = Math.round(totalTime / status.executionCount);
    }

    return {
      jobName,
      startTime,
      endTime,
      executionTime,
      success,
      result,
      error
    };
  }

  // Mock implementations for helper methods

  private async getPublishedStationsCount(windowId: string): Promise<number> {
    // Mock implementation - would query station_prices table
    return 150;
  }

  private async detectPriceAnomalies(windowId: string): Promise<any[]> {
    // Mock implementation - would detect unusual price movements
    return [];
  }

  private async sendPriceValidationAlert(alertData: any): Promise<void> {
    // Mock implementation - would send alerts via email/SMS
    this.eventEmitter.emit('alert.price.validation', alertData);
  }

  private async archiveOldStationPrices(days: number): Promise<number> {
    // Mock implementation - would archive old price records
    return 1000;
  }

  private async performSystemCleanup(): Promise<{ spaceFreedMB: number; filesDeleted: number }> {
    // Mock implementation - would cleanup temporary files and logs
    return { spaceFreedMB: 250, filesDeleted: 45 };
  }

  private async generateDailyPricingSummary(date: Date): Promise<any> {
    // Mock implementation - would generate pricing summary
    return { date, summary: 'pricing data' };
  }

  private async sendDailyReportsToStakeholders(reportData: any): Promise<void> {
    // Mock implementation - would send reports via email
    this.eventEmitter.emit('reports.daily.sent', reportData);
  }

  private async getStakeholderCount(): Promise<number> {
    // Mock implementation - would count stakeholders
    return 25;
  }

  private async checkPendingNpaResponses(): Promise<any[]> {
    // Mock implementation - would check for NPA responses
    return [];
  }

  private async processNpaResponseAutomatically(response: any): Promise<void> {
    // Mock implementation - would process NPA response
  }

  private async checkUpcomingSubmissionDeadlines(): Promise<any[]> {
    // Mock implementation - would check submission deadlines
    return [];
  }

  private async sendSubmissionDeadlineAlerts(deadlines: any[]): Promise<void> {
    // Mock implementation - would send deadline alerts
    this.eventEmitter.emit('alert.submission.deadline', { deadlines });
  }

  private async getSystemHealthStatus(): Promise<any> {
    // Mock implementation - would check system health
    return { status: 'HEALTHY', score: 95 };
  }

  private async checkDatabaseHealth(): Promise<{ status: string; score: number }> {
    // Mock implementation - would check database connectivity
    return { status: 'HEALTHY', score: 100 };
  }

  private async checkExternalServicesHealth(): Promise<{ status: string; score: number }> {
    // Mock implementation - would check external services
    return { status: 'HEALTHY', score: 90 };
  }

  private async checkSystemResources(): Promise<{ status: string; score: number }> {
    // Mock implementation - would check CPU, memory, disk
    return { status: 'HEALTHY', score: 85 };
  }

  private calculateHealthScore(scores: { database: number; services: number; resources: number }): number {
    return Math.round((scores.database + scores.services + scores.resources) / 3);
  }

  private async sendSystemHealthAlert(alertData: any): Promise<void> {
    // Mock implementation - would send system health alerts
    this.eventEmitter.emit('alert.system.health', alertData);
  }
}