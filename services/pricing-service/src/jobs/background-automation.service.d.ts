import { SchedulerRegistry } from '@nestjs/schedule';
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
export declare class BackgroundAutomationService {
    private readonly schedulerRegistry;
    private readonly eventEmitter;
    private readonly pricingWindowService;
    private readonly uppfClaimsService;
    private readonly priceCalculationService;
    private readonly logger;
    private readonly jobStatuses;
    constructor(schedulerRegistry: SchedulerRegistry, eventEmitter: EventEmitter2, pricingWindowService: PricingWindowService, uppfClaimsService: UppfClaimsService, priceCalculationService: PriceCalculationService);
    private initializeJobStatuses;
    /**
     * Create bi-weekly pricing windows automatically
     * Runs every Monday at 6:00 AM Ghana Time (start of new pricing period)
     */
    createBiWeeklyPricingWindow(): Promise<void>;
    /**
     * Daily price validation and health checks
     * Runs every day at 7:00 AM Ghana Time
     */
    performDailyPriceValidation(): Promise<void>;
    /**
     * Weekly UPPF claims processing
     * Runs every Friday at 2:00 PM Ghana Time (before window closes)
     */
    processWeeklyUppfClaims(): Promise<void>;
    /**
     * Monthly pricing data archiving
     * Runs on the 1st day of each month at 3:00 AM Ghana Time
     */
    performMonthlyArchiving(): Promise<void>;
    /**
     * Daily automated reports generation
     * Runs every day at 8:00 AM Ghana Time
     */
    generateDailyReports(): Promise<void>;
    /**
     * Weekly NPA submissions check and processing
     * Runs every Wednesday at 10:00 AM Ghana Time
     */
    processWeeklyNpaSubmissions(): Promise<void>;
    /**
     * Daily system health check
     * Runs every day at 6:00 AM Ghana Time
     */
    performSystemHealthCheck(): Promise<void>;
    /**
     * Get status of all automation jobs
     */
    getJobStatuses(): Promise<AutomationJobStatus[]>;
    /**
     * Manually trigger a specific job
     */
    triggerJob(jobName: string): Promise<JobExecutionResult>;
    private executeJob;
    private getPublishedStationsCount;
    private detectPriceAnomalies;
    private sendPriceValidationAlert;
    private archiveOldStationPrices;
    private performSystemCleanup;
    private generateDailyPricingSummary;
    private sendDailyReportsToStakeholders;
    private getStakeholderCount;
    private checkPendingNpaResponses;
    private processNpaResponseAutomatically;
    private checkUpcomingSubmissionDeadlines;
    private sendSubmissionDeadlineAlerts;
    private getSystemHealthStatus;
    private checkDatabaseHealth;
    private checkExternalServicesHealth;
    private checkSystemResources;
    private calculateHealthScore;
    private sendSystemHealthAlert;
}
//# sourceMappingURL=background-automation.service.d.ts.map