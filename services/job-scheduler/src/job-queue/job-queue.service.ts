import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export enum JobType {
  PRICE_CALCULATION = 'price_calculation',
  INVENTORY_SYNC = 'inventory_sync',
  UPPF_PROCESSING = 'uppf_processing',
  DEALER_SETTLEMENT = 'dealer_settlement',
  FINANCIAL_RECONCILIATION = 'financial_reconciliation',
  BACKUP_DATABASE = 'backup_database',
  SEND_NOTIFICATION = 'send_notification',
  GENERATE_REPORT = 'generate_report',
  DATA_CLEANUP = 'data_cleanup',
  HEALTH_CHECK = 'health_check',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
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

@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    @InjectQueue('default') private defaultQueue: Queue,
    @InjectQueue('high-priority') private highPriorityQueue: Queue,
    @InjectQueue('low-priority') private lowPriorityQueue: Queue,
    @InjectQueue('background') private backgroundQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.initializeJobProcessors();
  }

  /**
   * Add a job to the appropriate queue
   */
  async addJob(
    jobData: JobData,
    options?: {
      priority?: JobPriority;
      delay?: number;
      attempts?: number;
      repeat?: any;
    }
  ): Promise<Job> {
    const queue = this.getQueueByPriority(options?.priority || JobPriority.NORMAL);
    
    const job = await queue.add(jobData.type, jobData, {
      priority: options?.priority || JobPriority.NORMAL,
      delay: options?.delay || 0,
      attempts: options?.attempts || 3,
      repeat: options?.repeat,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 50,
      removeOnFail: 10,
    });

    this.logger.debug(`Job ${jobData.type} added to queue with ID: ${job.id}`);
    return job;
  }

  /**
   * Schedule a recurring job
   */
  async scheduleRecurringJob(
    jobData: JobData,
    cronExpression: string,
    options?: {
      priority?: JobPriority;
      attempts?: number;
    }
  ): Promise<Job> {
    return this.addJob(jobData, {
      ...options,
      repeat: { cron: cronExpression },
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const queues = [this.defaultQueue, this.highPriorityQueue, this.lowPriorityQueue, this.backgroundQueue];
    
    for (const queue of queues) {
      const job = await queue.getJob(jobId);
      if (job) {
        return {
          id: job.id,
          name: job.name,
          data: job.data,
          progress: job.progress(),
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
          opts: job.opts,
        };
      }
    }

    return null;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const queues = [this.defaultQueue, this.highPriorityQueue, this.lowPriorityQueue, this.backgroundQueue];
    
    for (const queue of queues) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.debug(`Job ${jobId} cancelled`);
        return true;
      }
    }

    return false;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<any> {
    const queues = [
      { name: 'default', queue: this.defaultQueue },
      { name: 'high-priority', queue: this.highPriorityQueue },
      { name: 'low-priority', queue: this.lowPriorityQueue },
      { name: 'background', queue: this.backgroundQueue },
    ];

    const stats = {};

    for (const { name, queue } of queues) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    }

    return stats;
  }

  /**
   * Process failed jobs
   */
  async retryFailedJobs(queueName?: string): Promise<number> {
    const queues = queueName 
      ? [this.getQueueByName(queueName)]
      : [this.defaultQueue, this.highPriorityQueue, this.lowPriorityQueue, this.backgroundQueue];

    let retriedCount = 0;

    for (const queue of queues) {
      const failedJobs = await queue.getFailed();
      
      for (const job of failedJobs) {
        await job.retry();
        retriedCount++;
      }
    }

    this.logger.log(`Retried ${retriedCount} failed jobs`);
    return retriedCount;
  }

  /**
   * Clean completed jobs
   */
  async cleanCompletedJobs(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const queues = [this.defaultQueue, this.highPriorityQueue, this.lowPriorityQueue, this.backgroundQueue];
    let cleanedCount = 0;

    for (const queue of queues) {
      const cleaned = await queue.clean(olderThanMs, 'completed');
      cleanedCount += cleaned.length;
    }

    this.logger.log(`Cleaned ${cleanedCount} completed jobs`);
    return cleanedCount;
  }

  /**
   * Initialize job processors
   */
  private initializeJobProcessors(): void {
    // Default queue processors
    this.defaultQueue.process(JobType.PRICE_CALCULATION, 5, this.processPriceCalculation.bind(this));
    this.defaultQueue.process(JobType.INVENTORY_SYNC, 3, this.processInventorySync.bind(this));
    this.defaultQueue.process(JobType.SEND_NOTIFICATION, 10, this.processSendNotification.bind(this));

    // High priority queue processors
    this.highPriorityQueue.process(JobType.UPPF_PROCESSING, 3, this.processUppfProcessing.bind(this));
    this.highPriorityQueue.process(JobType.FINANCIAL_RECONCILIATION, 2, this.processFinancialReconciliation.bind(this));
    this.highPriorityQueue.process(JobType.HEALTH_CHECK, 5, this.processHealthCheck.bind(this));

    // Background queue processors
    this.backgroundQueue.process(JobType.DEALER_SETTLEMENT, 1, this.processDealerSettlement.bind(this));
    this.backgroundQueue.process(JobType.BACKUP_DATABASE, 1, this.processBackupDatabase.bind(this));
    this.backgroundQueue.process(JobType.GENERATE_REPORT, 2, this.processGenerateReport.bind(this));
    this.backgroundQueue.process(JobType.DATA_CLEANUP, 1, this.processDataCleanup.bind(this));

    // Event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for all queues
   */
  private setupEventListeners(): void {
    const queues = [
      { name: 'default', queue: this.defaultQueue },
      { name: 'high-priority', queue: this.highPriorityQueue },
      { name: 'low-priority', queue: this.lowPriorityQueue },
      { name: 'background', queue: this.backgroundQueue },
    ];

    for (const { name, queue } of queues) {
      queue.on('completed', (job, result) => {
        this.logger.debug(`Job ${job.id} in ${name} queue completed:`, result);
      });

      queue.on('failed', (job, err) => {
        this.logger.error(`Job ${job.id} in ${name} queue failed:`, err.message);
      });

      queue.on('stalled', (job) => {
        this.logger.warn(`Job ${job.id} in ${name} queue stalled`);
      });
    }
  }

  /**
   * Get queue by priority
   */
  private getQueueByPriority(priority: JobPriority): Queue {
    switch (priority) {
      case JobPriority.CRITICAL:
      case JobPriority.HIGH:
        return this.highPriorityQueue;
      case JobPriority.LOW:
        return this.lowPriorityQueue;
      default:
        return this.defaultQueue;
    }
  }

  /**
   * Get queue by name
   */
  private getQueueByName(name: string): Queue {
    switch (name) {
      case 'high-priority':
        return this.highPriorityQueue;
      case 'low-priority':
        return this.lowPriorityQueue;
      case 'background':
        return this.backgroundQueue;
      default:
        return this.defaultQueue;
    }
  }

  // Job Processors

  private async processPriceCalculation(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing price calculation job ${job.id}`);
      
      const response = await axios.post(
        `${this.configService.get('PRICING_SERVICE_URL')}/api/pricing/calculate`,
        job.data.payload,
        { timeout: 30000 }
      );

      return {
        success: true,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Price calculation job ${job.id} failed:`, error.message);
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processInventorySync(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing inventory sync job ${job.id}`);
      
      const response = await axios.post(
        `${this.configService.get('INVENTORY_SERVICE_URL')}/api/inventory/sync`,
        job.data.payload,
        { timeout: 60000 }
      );

      return {
        success: true,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processSendNotification(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing notification job ${job.id}`);
      
      // Mock notification sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: { sent: true, recipient: job.data.payload.recipient },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processUppfProcessing(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing UPPF job ${job.id}`);
      
      const response = await axios.post(
        `${this.configService.get('UPPF_SERVICE_URL')}/api/claims/process`,
        job.data.payload,
        { timeout: 120000 } // 2 minutes for UPPF processing
      );

      return {
        success: true,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processFinancialReconciliation(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing financial reconciliation job ${job.id}`);
      
      const response = await axios.post(
        `${this.configService.get('ACCOUNTING_SERVICE_URL')}/api/reconciliation/process`,
        job.data.payload,
        { timeout: 180000 } // 3 minutes for reconciliation
      );

      return {
        success: true,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processHealthCheck(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing health check job ${job.id}`);
      
      const { serviceUrl } = job.data.payload;
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 10000 });

      return {
        success: response.status === 200,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processDealerSettlement(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing dealer settlement job ${job.id}`);
      
      const response = await axios.post(
        `${this.configService.get('DEALER_SERVICE_URL')}/api/settlements/process`,
        job.data.payload,
        { timeout: 300000 } // 5 minutes for settlement processing
      );

      return {
        success: true,
        data: response.data,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processBackupDatabase(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing database backup job ${job.id}`);
      
      // Mock backup process
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second mock backup

      return {
        success: true,
        data: { backupPath: `/backups/backup_${Date.now()}.sql`, size: '1.2GB' },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processGenerateReport(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing report generation job ${job.id}`);
      
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second mock generation

      return {
        success: true,
        data: { reportPath: `/reports/report_${Date.now()}.pdf`, pages: 25 },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  private async processDataCleanup(job: Job<JobData>): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing data cleanup job ${job.id}`);
      
      // Mock cleanup process
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second mock cleanup

      return {
        success: true,
        data: { recordsDeleted: 1250, spaceFree: '500MB' },
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }
}