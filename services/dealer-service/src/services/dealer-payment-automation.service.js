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
var DealerPaymentAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerPaymentAutomationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const dealer_settlement_entity_1 = require("../entities/dealer-settlement.entity");
const uuid_1 = require("uuid");
let DealerPaymentAutomationService = DealerPaymentAutomationService_1 = class DealerPaymentAutomationService {
    settlementRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerPaymentAutomationService_1.name);
    constructor(settlementRepository, dataSource, eventEmitter) {
        this.settlementRepository = settlementRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Process automated payments for approved settlements
     * Blueprint: "Automate dealer payment processing"
     */
    async processAutomatedPayments(tenantId, maxBatchSize = 50, dryRun = false) {
        this.logger.log(`Processing automated payments for tenant ${tenantId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        if (!dryRun) {
            await queryRunner.startTransaction();
        }
        try {
            // Get payment rules
            const paymentRules = await this.getActivePaymentRules(tenantId);
            // Get eligible settlements
            const eligibleSettlements = await this.getEligibleSettlements(tenantId);
            if (eligibleSettlements.length === 0) {
                this.logger.log('No eligible settlements found for automated payment');
                return {
                    batchesCreated: [],
                    totalAmount: 0,
                    totalSettlements: 0,
                    skippedSettlements: [],
                };
            }
            // Apply payment rules and group settlements
            const { processableSettlements, skippedSettlements } = await this.applyPaymentRules(eligibleSettlements, paymentRules);
            if (processableSettlements.length === 0) {
                return {
                    batchesCreated: [],
                    totalAmount: 0,
                    totalSettlements: 0,
                    skippedSettlements,
                };
            }
            // Group settlements into batches by payment method
            const settlementBatches = this.groupSettlementsIntoBatches(processableSettlements, maxBatchSize);
            const batchesCreated = [];
            let totalAmount = 0;
            let totalSettlements = 0;
            // Create and process payment batches
            for (const batchData of settlementBatches) {
                const batch = await this.createPaymentBatch(batchData, tenantId);
                if (!dryRun) {
                    // Update settlement statuses
                    await queryRunner.manager.update(dealer_settlement_entity_1.DealerSettlement, { id: (0, typeorm_2.In)(batchData.settlements.map(s => s.id)) }, { status: dealer_settlement_entity_1.DealerSettlementStatus.PAID, paymentDate: new Date() });
                    // Emit batch created event
                    this.eventEmitter.emit('dealer.payment.batch.created', {
                        batchId: batch.batchId,
                        settlementCount: batch.totalSettlements,
                        totalAmount: batch.totalAmount,
                        tenantId,
                    });
                }
                batchesCreated.push(batch);
                totalAmount += batch.totalAmount;
                totalSettlements += batch.totalSettlements;
            }
            if (!dryRun) {
                await queryRunner.commitTransaction();
            }
            // Emit automated payment processed event
            this.eventEmitter.emit('dealer.payment.automated.processed', {
                batchesCreated: batchesCreated.length,
                totalAmount,
                totalSettlements,
                skippedCount: skippedSettlements.length,
                tenantId,
            });
            this.logger.log(`Automated payment processing completed: ${batchesCreated.length} batches, ${totalSettlements} settlements, GHS ${totalAmount.toFixed(2)}`);
            return {
                batchesCreated,
                totalAmount,
                totalSettlements,
                skippedSettlements,
            };
        }
        catch (error) {
            if (!dryRun) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Execute payment batch
     */
    async executePaymentBatch(batchId, tenantId, userId) {
        this.logger.log(`Executing payment batch ${batchId}`);
        // This would integrate with actual banking/payment APIs
        // For now, simulate payment processing
        const batch = await this.getPaymentBatch(batchId, tenantId);
        if (!batch) {
            throw new common_1.NotFoundException('Payment batch not found');
        }
        if (batch.status !== 'PENDING') {
            throw new common_1.BadRequestException('Batch is not in pending status');
        }
        const results = {
            batchId,
            status: 'COMPLETED',
            successfulPayments: 0,
            failedPayments: 0,
            totalAmount: batch.totalAmount,
            errors: [],
        };
        // Simulate payment processing
        for (const settlement of batch.settlements) {
            try {
                // Simulate payment API call
                await this.processPayment({
                    amount: settlement.amount,
                    recipientAccount: settlement.bankDetails.accountNumber,
                    recipientName: settlement.bankDetails.accountName,
                    bankCode: settlement.bankDetails.bankCode,
                    reference: settlement.paymentReference,
                    paymentMethod: batch.paymentMethod,
                });
                results.successfulPayments++;
                // Emit individual payment success event
                this.eventEmitter.emit('dealer.payment.completed', {
                    settlementId: settlement.settlementId,
                    stationId: settlement.stationId,
                    amount: settlement.amount,
                    paymentReference: settlement.paymentReference,
                    tenantId,
                });
            }
            catch (error) {
                results.failedPayments++;
                results.errors.push({
                    settlementId: settlement.settlementId,
                    error: error.message,
                });
                this.logger.error(`Payment failed for settlement ${settlement.settlementId}:`, error);
            }
        }
        // Determine overall batch status
        if (results.failedPayments === 0) {
            results.status = 'COMPLETED';
        }
        else if (results.successfulPayments > 0) {
            results.status = 'PARTIALLY_COMPLETED';
        }
        else {
            results.status = 'FAILED';
        }
        // Update batch status (would save to database)
        await this.updatePaymentBatchStatus(batchId, results.status, {
            completedAt: new Date(),
            processedBy: userId,
            successfulPayments: results.successfulPayments,
            failedPayments: results.failedPayments,
        });
        // Emit batch completion event
        this.eventEmitter.emit('dealer.payment.batch.completed', {
            batchId,
            status: results.status,
            successfulPayments: results.successfulPayments,
            failedPayments: results.failedPayments,
            tenantId,
        });
        return results;
    }
    /**
     * Create payment instructions for manual processing
     */
    async createPaymentInstructions(settlementIds, tenantId, priority = 'NORMAL') {
        this.logger.log(`Creating payment instructions for ${settlementIds.length} settlements`);
        const settlements = await this.settlementRepository.find({
            where: {
                id: (0, typeorm_2.In)(settlementIds),
                tenantId,
                status: dealer_settlement_entity_1.DealerSettlementStatus.APPROVED,
            },
        });
        if (settlements.length === 0) {
            throw new common_1.NotFoundException('No approved settlements found');
        }
        const instructions = [];
        for (const settlement of settlements) {
            const instruction = {
                instructionId: (0, uuid_1.v4)(),
                settlementId: settlement.id,
                paymentAmount: settlement.netPayable,
                paymentMethod: settlement.paymentMethod || 'BANK_TRANSFER',
                recipientDetails: {
                    name: settlement.bankAccountDetails?.accountName || 'TBD',
                    accountNumber: settlement.bankAccountDetails?.accountNumber || 'TBD',
                    bankCode: settlement.bankAccountDetails?.bankCode || 'TBD',
                    reference: `SETT-${settlement.stationId}-${settlement.windowId}`,
                },
                priority,
                scheduledDate: new Date(),
                status: 'QUEUED',
                createdAt: new Date(),
                tenantId,
            };
            instructions.push(instruction);
        }
        // Save instructions (would save to database)
        await this.savePaymentInstructions(instructions);
        // Emit instructions created event
        this.eventEmitter.emit('dealer.payment.instructions.created', {
            instructionCount: instructions.length,
            totalAmount: instructions.reduce((sum, i) => sum + i.paymentAmount, 0),
            priority,
            tenantId,
        });
        return instructions;
    }
    /**
     * Generate payment report
     */
    async generatePaymentReport(tenantId, periodStart, periodEnd) {
        this.logger.log(`Generating payment report for period ${periodStart.toDateString()} - ${periodEnd.toDateString()}`);
        // Get payments data for the period
        const payments = await this.getPaymentsForPeriod(tenantId, periodStart, periodEnd);
        const report = {
            reportId: (0, uuid_1.v4)(),
            reportDate: new Date(),
            periodStart,
            periodEnd,
            summary: this.calculatePaymentSummary(payments),
            byPaymentMethod: this.groupPaymentsByMethod(payments),
            byDealer: this.groupPaymentsByDealer(payments),
            failureAnalysis: this.analyzePaymentFailures(payments),
            compliance: this.calculateComplianceMetrics(payments),
            recommendations: this.generateRecommendations(payments),
        };
        // Emit report generated event
        this.eventEmitter.emit('dealer.payment.report.generated', {
            reportId: report.reportId,
            totalPayments: report.summary.totalPayments,
            totalAmount: report.summary.totalAmount,
            successRate: (report.summary.successfulPayments / report.summary.totalPayments) * 100,
            tenantId,
        });
        return report;
    }
    /**
     * Retry failed payments
     */
    async retryFailedPayments(batchId, tenantId, userId) {
        this.logger.log(`Retrying failed payments for batch ${batchId}`);
        const batch = await this.getPaymentBatch(batchId, tenantId);
        if (!batch) {
            throw new common_1.NotFoundException('Payment batch not found');
        }
        // Get failed payment records
        const failedPayments = await this.getFailedPaymentsFromBatch(batchId);
        const results = {
            retriedCount: failedPayments.length,
            successfulRetries: 0,
            stillFailedCount: 0,
            errors: [],
        };
        for (const payment of failedPayments) {
            try {
                await this.processPayment({
                    amount: payment.amount,
                    recipientAccount: payment.bankDetails.accountNumber,
                    recipientName: payment.bankDetails.accountName,
                    bankCode: payment.bankDetails.bankCode,
                    reference: payment.paymentReference,
                    paymentMethod: batch.paymentMethod,
                });
                results.successfulRetries++;
                // Update payment status
                await this.updatePaymentStatus(payment.settlementId, 'COMPLETED');
                this.eventEmitter.emit('dealer.payment.retry.success', {
                    settlementId: payment.settlementId,
                    amount: payment.amount,
                    tenantId,
                });
            }
            catch (error) {
                results.stillFailedCount++;
                results.errors.push({
                    settlementId: payment.settlementId,
                    error: error.message,
                });
                this.logger.error(`Payment retry failed for settlement ${payment.settlementId}:`, error);
            }
        }
        // Emit retry completion event
        this.eventEmitter.emit('dealer.payment.retry.completed', {
            batchId,
            retriedCount: results.retriedCount,
            successfulRetries: results.successfulRetries,
            stillFailedCount: results.stillFailedCount,
            tenantId,
        });
        return results;
    }
    // Private helper methods
    async getEligibleSettlements(tenantId) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return this.settlementRepository.find({
            where: {
                tenantId,
                status: dealer_settlement_entity_1.DealerSettlementStatus.APPROVED,
                netPayable: this.dataSource.createQueryBuilder()
                    .select()
                    .where('netPayable > 0')
                    .getQuery(),
                approvedAt: this.dataSource.createQueryBuilder()
                    .select()
                    .where('approvedAt <= :threeDaysAgo', { threeDaysAgo })
                    .getQuery(),
            },
            order: { approvedAt: 'ASC' },
        });
    }
    async getActivePaymentRules(tenantId) {
        // This would get payment rules from database
        // For now, return default rules
        return [
            {
                ruleId: 'default-rule',
                ruleName: 'Standard Payment Rule',
                description: 'Default rule for automated payments',
                isActive: true,
                priority: 1,
                conditions: {
                    minSettlementAmount: 100,
                    maxSettlementAmount: 50000,
                    dealerCreditRating: ['GOOD', 'EXCELLENT'],
                    settlementStatus: [dealer_settlement_entity_1.DealerSettlementStatus.APPROVED],
                    daysFromApproval: 3,
                    requiresApproval: false,
                    blacklistCheck: true,
                },
                paymentConfig: {
                    paymentMethod: 'BANK_TRANSFER',
                    processingDelay: 2, // Hours
                    batchPayment: true,
                    approvalRequired: false,
                    approvalWorkflow: 'none',
                },
                riskControls: {
                    dailyLimit: 1000000, // GHS 1M daily limit
                    monthlyLimit: 10000000, // GHS 10M monthly limit
                    velocityCheck: true,
                    duplicateCheck: true,
                    fraudCheck: true,
                },
                tenantId,
                createdBy: 'system',
                createdAt: new Date(),
                lastModified: new Date(),
            },
        ];
    }
    async applyPaymentRules(settlements, rules) {
        const processableSettlements = [];
        const skippedSettlements = [];
        for (const settlement of settlements) {
            let canProcess = false;
            let skipReason = 'No matching payment rule';
            for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
                if (!rule.isActive)
                    continue;
                // Check conditions
                const meetsConditions = this.checkRuleConditions(settlement, rule);
                if (meetsConditions) {
                    // Check risk controls
                    const passesRiskControls = await this.checkRiskControls(settlement, rule);
                    if (passesRiskControls) {
                        canProcess = true;
                        break;
                    }
                    else {
                        skipReason = 'Failed risk control checks';
                    }
                }
            }
            if (canProcess) {
                processableSettlements.push(settlement);
            }
            else {
                skippedSettlements.push({
                    settlementId: settlement.id,
                    reason: skipReason,
                });
            }
        }
        return { processableSettlements, skippedSettlements };
    }
    checkRuleConditions(settlement, rule) {
        // Amount check
        if (settlement.netPayable < rule.conditions.minSettlementAmount ||
            settlement.netPayable > rule.conditions.maxSettlementAmount) {
            return false;
        }
        // Status check
        if (!rule.conditions.settlementStatus.includes(settlement.status)) {
            return false;
        }
        // Days from approval check
        if (settlement.approvedAt) {
            const daysSinceApproval = Math.floor((new Date().getTime() - settlement.approvedAt.getTime()) / (24 * 60 * 60 * 1000));
            if (daysSinceApproval < rule.conditions.daysFromApproval) {
                return false;
            }
        }
        return true;
    }
    async checkRiskControls(settlement, rule) {
        // Check daily limit
        const todayTotal = await this.getTodayPaymentTotal(settlement.tenantId);
        if (todayTotal + settlement.netPayable > rule.riskControls.dailyLimit) {
            return false;
        }
        // Check monthly limit
        const monthlyTotal = await this.getMonthlyPaymentTotal(settlement.tenantId);
        if (monthlyTotal + settlement.netPayable > rule.riskControls.monthlyLimit) {
            return false;
        }
        // Duplicate check
        if (rule.riskControls.duplicateCheck) {
            const hasDuplicate = await this.checkForDuplicatePayment(settlement);
            if (hasDuplicate) {
                return false;
            }
        }
        // Fraud check (simplified)
        if (rule.riskControls.fraudCheck) {
            const isSuspicious = await this.checkForFraudIndicators(settlement);
            if (isSuspicious) {
                return false;
            }
        }
        return true;
    }
    groupSettlementsIntoBatches(settlements, maxBatchSize) {
        // Group by payment method
        const groupedByMethod = settlements.reduce((groups, settlement) => {
            const method = settlement.paymentMethod || 'BANK_TRANSFER';
            if (!groups[method]) {
                groups[method] = [];
            }
            groups[method].push(settlement);
            return groups;
        }, {});
        const batches = [];
        // Split each payment method group into batches
        for (const [method, methodSettlements] of Object.entries(groupedByMethod)) {
            for (let i = 0; i < methodSettlements.length; i += maxBatchSize) {
                const batchSettlements = methodSettlements.slice(i, i + maxBatchSize);
                batches.push({
                    paymentMethod: method,
                    settlements: batchSettlements,
                });
            }
        }
        return batches;
    }
    async createPaymentBatch(batchData, tenantId) {
        const batchId = (0, uuid_1.v4)();
        const batchNumber = `PB-${Date.now()}-${batchId.slice(-6)}`;
        const totalAmount = batchData.settlements.reduce((sum, s) => sum + s.netPayable, 0);
        const batch = {
            batchId,
            batchNumber,
            batchDate: new Date(),
            totalAmount,
            totalSettlements: batchData.settlements.length,
            paymentMethod: batchData.paymentMethod,
            status: 'PENDING',
            settlements: batchData.settlements.map(settlement => ({
                settlementId: settlement.id,
                stationId: settlement.stationId,
                dealerId: settlement.stationId, // Assuming stationId maps to dealerId
                amount: settlement.netPayable,
                paymentReference: `SETT-${settlement.stationId}-${settlement.windowId}`,
                bankDetails: {
                    accountName: settlement.bankAccountDetails?.accountName || 'TBD',
                    accountNumber: settlement.bankAccountDetails?.accountNumber || 'TBD',
                    bankName: settlement.bankAccountDetails?.bankName || 'TBD',
                    bankCode: settlement.bankAccountDetails?.bankCode || 'TBD',
                },
            })),
            tenantId,
        };
        // Save batch to database (mock)
        await this.savePaymentBatch(batch);
        return batch;
    }
    async processPayment(paymentData) {
        // Mock payment processing - would integrate with actual banking APIs
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        if (success) {
            return {
                success: true,
                transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
        }
        else {
            throw new Error('Payment failed - Insufficient funds or invalid account');
        }
    }
    // Mock data helper methods
    async getTodayPaymentTotal(tenantId) {
        // Mock implementation - would query actual payment totals
        return 50000; // GHS 50k processed today
    }
    async getMonthlyPaymentTotal(tenantId) {
        // Mock implementation - would query actual monthly totals
        return 500000; // GHS 500k processed this month
    }
    async checkForDuplicatePayment(settlement) {
        // Mock implementation - would check for duplicate payments
        return false;
    }
    async checkForFraudIndicators(settlement) {
        // Mock implementation - would check fraud indicators
        return false;
    }
    async getPaymentBatch(batchId, tenantId) {
        // Mock implementation - would get from database
        return null;
    }
    async savePaymentBatch(batch) {
        // Mock implementation - would save to database
        this.logger.log(`Payment batch saved: ${batch.batchNumber}`);
    }
    async updatePaymentBatchStatus(batchId, status, details) {
        // Mock implementation - would update database
        this.logger.log(`Payment batch ${batchId} status updated to ${status}`);
    }
    async savePaymentInstructions(instructions) {
        // Mock implementation - would save to database
        this.logger.log(`${instructions.length} payment instructions saved`);
    }
    async getPaymentsForPeriod(tenantId, periodStart, periodEnd) {
        // Mock implementation - would get actual payment data
        return [];
    }
    async getFailedPaymentsFromBatch(batchId) {
        // Mock implementation - would get failed payments
        return [];
    }
    async updatePaymentStatus(settlementId, status) {
        // Mock implementation - would update payment status
        this.logger.log(`Payment status for settlement ${settlementId} updated to ${status}`);
    }
    // Report generation helper methods
    calculatePaymentSummary(payments) {
        return {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            successfulPayments: payments.filter(p => p.status === 'COMPLETED').length,
            failedPayments: payments.filter(p => p.status === 'FAILED').length,
            pendingPayments: payments.filter(p => p.status === 'PENDING').length,
            averageProcessingTime: 2.5, // Mock average
        };
    }
    groupPaymentsByMethod(payments) {
        return {
            'BANK_TRANSFER': { count: 100, amount: 500000, successRate: 95 },
            'MOBILE_MONEY': { count: 20, amount: 50000, successRate: 90 },
        };
    }
    groupPaymentsByDealer(payments) {
        return [
            {
                dealerId: 'DEALER-001',
                stationId: 'STATION-001',
                paymentsCount: 5,
                totalAmount: 25000,
                averageAmount: 5000,
                successRate: 100,
            },
        ];
    }
    analyzePaymentFailures(payments) {
        return {
            reasonBreakdown: {
                'Invalid account': 5,
                'Insufficient funds': 2,
                'Network error': 1,
            },
            topFailedDealers: [
                {
                    dealerId: 'DEALER-002',
                    failureCount: 3,
                    commonReason: 'Invalid account',
                },
            ],
        };
    }
    calculateComplianceMetrics(payments) {
        return {
            slaCompliance: 92, // 92% within SLA
            averageDelay: 0.5, // 0.5 hours average delay
            escalations: 2,
        };
    }
    generateRecommendations(payments) {
        return [
            'Consider increasing batch processing frequency to improve payment turnaround',
            'Review dealer account details to reduce payment failures',
            'Implement real-time account validation to prevent invalid account errors',
        ];
    }
    /**
     * Scheduled task for automated payment processing
     * Blueprint: runs automatically based on configured schedule
     */
    async scheduledAutomatedPayments() {
        this.logger.log('Running scheduled automated payment processing');
        try {
            // Get all active tenants (would query from configuration)
            const activeTenants = await this.getActiveTenants();
            for (const tenant of activeTenants) {
                try {
                    const result = await this.processAutomatedPayments(tenant.tenantId, 50, false);
                    if (result.batchesCreated.length > 0) {
                        this.logger.log(`Processed automated payments for tenant ${tenant.tenantId}: ${result.batchesCreated.length} batches, GHS ${result.totalAmount.toFixed(2)}`);
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to process automated payments for tenant ${tenant.tenantId}:`, error);
                }
            }
            this.logger.log('Scheduled automated payment processing completed');
        }
        catch (error) {
            this.logger.error('Failed to run scheduled automated payments:', error);
        }
    }
    async getActiveTenants() {
        // Mock implementation - would get from configuration service
        return [{ tenantId: 'default-tenant' }];
    }
};
exports.DealerPaymentAutomationService = DealerPaymentAutomationService;
__decorate([
    (0, schedule_1.Cron)('0 */2 * * * *') // Every 2 hours
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerPaymentAutomationService.prototype, "scheduledAutomatedPayments", null);
exports.DealerPaymentAutomationService = DealerPaymentAutomationService = DealerPaymentAutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_settlement_entity_1.DealerSettlement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DealerPaymentAutomationService);
//# sourceMappingURL=dealer-payment-automation.service.js.map