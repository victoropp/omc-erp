import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
export declare enum JobType {
    PRICE_CALCULATION = "price_calculation",
    INVENTORY_SYNC = "inventory_sync",
    UPPF_PROCESSING = "uppf_processing",
    DEALER_SETTLEMENT = "dealer_settlement",
    FINANCIAL_RECONCILIATION = "financial_reconciliation",
    BACKUP_DATABASE = "backup_database",
    SEND_NOTIFICATION = "send_notification",
    GENERATE_REPORT = "generate_report",
    DATA_CLEANUP = "data_cleanup",
    HEALTH_CHECK = "health_check"
}
export declare enum JobPriority {
    LOW = 1,
    NORMAL = 5,
    HIGH = 10,
    CRITICAL = 15
}
export interface JobData {
    type: JobType;
    payload: any;
    metadata?: {
        userId?: string;
        correlationId?: string;
        source?: string;
        retryCount?: number;
    };
}
export interface JobResult {
    success: boolean;
    data?: any;
    error?: string;
    duration: number;
    timestamp: Date;
}
export declare class JobQueueService {
    private defaultQueue;
    private highPriorityQueue;
    private lowPriorityQueue;
    private backgroundQueue;
    private readonly configService;
    private readonly logger;
    constructor(defaultQueue: Queue, highPriorityQueue: Queue, lowPriorityQueue: Queue, backgroundQueue: Queue, configService: ConfigService);
    /**
     * Add a job to the appropriate queue
     */
    addJob(jobData: JobData, options?: {
        priority?: JobPriority;
        delay?: number;
        attempts?: number;
        repeat?: any;
    }): Promise<Job>;
    /**
     * Schedule a recurring job
     */
    scheduleRecurringJob(jobData: JobData, cronExpression: string, options?: {
        priority?: JobPriority;
        attempts?: number;
    }): Promise<Job>;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): Promise<any>;
    /**
     * Cancel a job
     */
    cancelJob(jobId: string): Promise<boolean>;
    /**
     * Get queue statistics
     */
    getQueueStats(): Promise<any>;
    /**
     * Process failed jobs
     */
    retryFailedJobs(queueName?: string): Promise<number>;
    /**
     * Clean completed jobs
     */
    cleanCompletedJobs(olderThanMs?: number): Promise<number>;
    /**
     * Initialize job processors
     */
    private initializeJobProcessors;
    /**
     * Setup event listeners for all queues
     */
    private setupEventListeners;
    /**
     * Get queue by priority
     */
    private getQueueByPriority;
    /**
     * Get queue by name
     */
    private getQueueByName;
    private processPriceCalculation;
    private processInventorySync;
    private processSendNotification;
    private processUppfProcessing;
    private processFinancialReconciliation;
    private processHealthCheck;
    private processDealerSettlement;
    private processBackupDatabase;
    private processGenerateReport;
    private processDataCleanup;
}
//# sourceMappingURL=job-queue.service.d.ts.map