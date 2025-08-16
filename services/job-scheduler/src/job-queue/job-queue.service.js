"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var JobQueueService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueueService = exports.JobPriority = exports.JobType = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const bull_2 = require("bull");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
var JobType;
(function (JobType) {
    JobType["PRICE_CALCULATION"] = "price_calculation";
    JobType["INVENTORY_SYNC"] = "inventory_sync";
    JobType["UPPF_PROCESSING"] = "uppf_processing";
    JobType["DEALER_SETTLEMENT"] = "dealer_settlement";
    JobType["FINANCIAL_RECONCILIATION"] = "financial_reconciliation";
    JobType["BACKUP_DATABASE"] = "backup_database";
    JobType["SEND_NOTIFICATION"] = "send_notification";
    JobType["GENERATE_REPORT"] = "generate_report";
    JobType["DATA_CLEANUP"] = "data_cleanup";
    JobType["HEALTH_CHECK"] = "health_check";
})(JobType || (exports.JobType = JobType = {}));
var JobPriority;
(function (JobPriority) {
    JobPriority[JobPriority["LOW"] = 1] = "LOW";
    JobPriority[JobPriority["NORMAL"] = 5] = "NORMAL";
    JobPriority[JobPriority["HIGH"] = 10] = "HIGH";
    JobPriority[JobPriority["CRITICAL"] = 15] = "CRITICAL";
})(JobPriority || (exports.JobPriority = JobPriority = {}));
let JobQueueService = JobQueueService_1 = class JobQueueService {
    defaultQueue;
    highPriorityQueue;
    lowPriorityQueue;
    backgroundQueue;
    configService;
    logger = new common_1.Logger(JobQueueService_1.name);
    constructor(defaultQueue, highPriorityQueue, lowPriorityQueue, backgroundQueue, configService) {
        this.defaultQueue = defaultQueue;
        this.highPriorityQueue = highPriorityQueue;
        this.lowPriorityQueue = lowPriorityQueue;
        this.backgroundQueue = backgroundQueue;
        this.configService = configService;
        this.initializeJobProcessors();
    }
    /**
     * Add a job to the appropriate queue
     */
    async addJob(jobData, options) {
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
    async scheduleRecurringJob(jobData, cronExpression, options) {
        return this.addJob(jobData, {
            ...options,
            repeat: { cron: cronExpression },
        });
    }
    /**
     * Get job status
     */
    async getJobStatus(jobId) {
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
    async cancelJob(jobId) {
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
    async getQueueStats() {
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
    async retryFailedJobs(queueName) {
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
    async cleanCompletedJobs(olderThanMs = 24 * 60 * 60 * 1000) {
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
    initializeJobProcessors() {
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
    setupEventListeners() {
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
    getQueueByPriority(priority) {
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
    getQueueByName(name) {
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
    async processPriceCalculation(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing price calculation job ${job.id}`);
            const response = await axios_1.default.post(`${this.configService.get('PRICING_SERVICE_URL')}/api/pricing/calculate`, job.data.payload, { timeout: 30000 });
            return {
                success: true,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Price calculation job ${job.id} failed:`, error.message);
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processInventorySync(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing inventory sync job ${job.id}`);
            const response = await axios_1.default.post(`${this.configService.get('INVENTORY_SERVICE_URL')}/api/inventory/sync`, job.data.payload, { timeout: 60000 });
            return {
                success: true,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processSendNotification(job) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processUppfProcessing(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing UPPF job ${job.id}`);
            const response = await axios_1.default.post(`${this.configService.get('UPPF_SERVICE_URL')}/api/claims/process`, job.data.payload, { timeout: 120000 } // 2 minutes for UPPF processing
            );
            return {
                success: true,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processFinancialReconciliation(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing financial reconciliation job ${job.id}`);
            const response = await axios_1.default.post(`${this.configService.get('ACCOUNTING_SERVICE_URL')}/api/reconciliation/process`, job.data.payload, { timeout: 180000 } // 3 minutes for reconciliation
            );
            return {
                success: true,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processHealthCheck(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing health check job ${job.id}`);
            const { serviceUrl } = job.data.payload;
            const response = await axios_1.default.get(`${serviceUrl}/health`, { timeout: 10000 });
            return {
                success: response.status === 200,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processDealerSettlement(job) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Processing dealer settlement job ${job.id}`);
            const response = await axios_1.default.post(`${this.configService.get('DEALER_SERVICE_URL')}/api/settlements/process`, job.data.payload, { timeout: 300000 } // 5 minutes for settlement processing
            );
            return {
                success: true,
                data: response.data,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processBackupDatabase(job) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processGenerateReport(job) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async processDataCleanup(job) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
};
exports.JobQueueService = JobQueueService;
exports.JobQueueService = JobQueueService = JobQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('default')),
    __param(1, (0, bull_1.InjectQueue)('high-priority')),
    __param(2, (0, bull_1.InjectQueue)('low-priority')),
    __param(3, (0, bull_1.InjectQueue)('background')),
    __metadata("design:paramtypes", [typeof (_a = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _a : Object, typeof (_b = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _b : Object, typeof (_c = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _c : Object, typeof (_d = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], JobQueueService);
//# sourceMappingURL=job-queue.service.js.map