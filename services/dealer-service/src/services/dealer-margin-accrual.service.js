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
var DealerMarginAccrualService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerMarginAccrualService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const dealer_margin_accrual_entity_1 = require("../entities/dealer-margin-accrual.entity");
const uuid_1 = require("uuid");
let DealerMarginAccrualService = DealerMarginAccrualService_1 = class DealerMarginAccrualService {
    marginAccrualRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerMarginAccrualService_1.name);
    constructor(marginAccrualRepository, dataSource, eventEmitter) {
        this.marginAccrualRepository = marginAccrualRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Process daily margin accrual for a dealer station
     * Blueprint: "Calculate daily dealer margins from sales"
     */
    async processDailyMarginAccrual(dto) {
        this.logger.log(`Processing daily margin accrual for station ${dto.stationId}, date ${dto.accrualDate.toDateString()}`);
        if (dto.transactions.length === 0) {
            this.logger.warn(`No transactions provided for station ${dto.stationId} on ${dto.accrualDate.toDateString()}`);
            return [];
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Check if accrual already exists for this date
            const existingAccruals = await this.marginAccrualRepository.find({
                where: {
                    stationId: dto.stationId,
                    accrualDate: dto.accrualDate,
                    windowId: dto.windowId,
                    tenantId: dto.tenantId,
                },
            });
            if (existingAccruals.length > 0 && existingAccruals.some(a => a.status !== dealer_margin_accrual_entity_1.AccrualStatus.PENDING)) {
                throw new common_1.BadRequestException('Margin accrual already processed for this date');
            }
            // Delete existing pending accruals for re-processing
            if (existingAccruals.length > 0) {
                await queryRunner.manager.remove(existingAccruals);
            }
            // Get pricing window components for margin rates
            const pricingComponents = await this.getPricingWindowComponents(dto.windowId);
            // Group transactions by product type
            const transactionsByProduct = this.groupTransactionsByProduct(dto.transactions);
            const accruals = [];
            let cumulativeLitres = 0;
            let cumulativeMargin = 0;
            for (const [productType, transactions] of Object.entries(transactionsByProduct)) {
                const dealerMarginComponent = pricingComponents.find(c => c.category === 'dealer_margin' && c.productType === productType);
                if (!dealerMarginComponent) {
                    this.logger.warn(`No dealer margin component found for product ${productType} in window ${dto.windowId}`);
                    continue;
                }
                // Calculate totals for this product
                const totalLitres = transactions.reduce((sum, t) => sum + t.litresSold, 0);
                const averageExPumpPrice = transactions.reduce((sum, t) => sum + (t.exPumpPrice * t.litresSold), 0) / totalLitres;
                const marginRate = dealerMarginComponent.rateValue;
                const marginAmount = totalLitres * marginRate;
                cumulativeLitres += totalLitres;
                cumulativeMargin += marginAmount;
                // Create margin accrual record
                const accrual = this.marginAccrualRepository.create({
                    id: (0, uuid_1.v4)(),
                    stationId: dto.stationId,
                    dealerId: dto.dealerId,
                    productType,
                    accrualDate: dto.accrualDate,
                    windowId: dto.windowId,
                    litresSold: totalLitres,
                    marginRate,
                    marginAmount,
                    exPumpPrice: averageExPumpPrice,
                    cumulativeLitres,
                    cumulativeMargin,
                    status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
                    calculationDetails: {
                        transactionIds: transactions.map(t => t.transactionId),
                        pbuBreakdown: this.extractPBUBreakdown(pricingComponents, productType),
                        adjustments: [],
                    },
                    tenantId: dto.tenantId,
                    processedBy: dto.processedBy,
                });
                accruals.push(accrual);
            }
            // Save all accruals
            const savedAccruals = await queryRunner.manager.save(accruals);
            await queryRunner.commitTransaction();
            // Emit accrual processed event
            this.eventEmitter.emit('dealer.margin.accrued', {
                stationId: dto.stationId,
                dealerId: dto.dealerId,
                accrualDate: dto.accrualDate,
                windowId: dto.windowId,
                totalLitres: cumulativeLitres,
                totalMargin: cumulativeMargin,
                productCount: accruals.length,
                tenantId: dto.tenantId,
            });
            this.logger.log(`Processed ${accruals.length} margin accruals for station ${dto.stationId}: Total margin GHS ${cumulativeMargin.toFixed(2)}`);
            return savedAccruals;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Process batch margin accruals from transaction service
     * Blueprint: Integration with daily delivery to track dealer margins
     */
    async processBatchMarginAccruals(accrualData) {
        this.logger.log(`Processing batch margin accruals for ${accrualData.length} station-days`);
        let successful = 0;
        let failed = 0;
        const errors = [];
        for (const data of accrualData) {
            try {
                await this.processDailyMarginAccrual(data);
                successful++;
            }
            catch (error) {
                failed++;
                errors.push({
                    stationId: data.stationId,
                    date: data.accrualDate.toDateString(),
                    error: error.message,
                });
                this.logger.error(`Failed to process margin accrual for station ${data.stationId}:`, error);
            }
        }
        this.eventEmitter.emit('dealer.margin.batch.processed', {
            totalProcessed: accrualData.length,
            successful,
            failed,
            errorCount: errors.length,
        });
        this.logger.log(`Batch processing completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }
    /**
     * Get daily margin accrual summary
     */
    async getDailyMarginSummary(stationId, accrualDate, tenantId) {
        const accruals = await this.marginAccrualRepository.find({
            where: {
                stationId,
                accrualDate,
                tenantId,
                status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
            },
            order: { productType: 'ASC' },
        });
        if (accruals.length === 0) {
            return null;
        }
        const totalLitresSold = accruals.reduce((sum, a) => sum + a.litresSold, 0);
        const grossMarginEarned = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
        const productBreakdown = {};
        for (const accrual of accruals) {
            productBreakdown[accrual.productType] = {
                litres: accrual.litresSold,
                marginRate: accrual.marginRate,
                marginAmount: accrual.marginAmount,
                exPumpPrice: accrual.exPumpPrice,
            };
        }
        return {
            stationId,
            accrualDate,
            windowId: accruals[0].windowId,
            totalLitresSold,
            grossMarginEarned,
            productBreakdown,
            accrualStatus: accruals[0].status,
            createdAt: accruals[0].createdAt,
        };
    }
    /**
     * Get window-level margin accrual summary
     */
    async getWindowMarginSummary(stationId, windowId, tenantId) {
        const windowDates = await this.getPricingWindowDates(windowId);
        if (!windowDates) {
            throw new common_1.NotFoundException(`Pricing window ${windowId} not found`);
        }
        const accruals = await this.marginAccrualRepository.find({
            where: {
                stationId,
                windowId,
                tenantId,
                accrualDate: (0, typeorm_2.Between)(windowDates.startDate, windowDates.endDate),
                status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
            },
            order: { accrualDate: 'ASC', productType: 'ASC' },
        });
        if (accruals.length === 0) {
            return null;
        }
        // Calculate summary metrics
        const totalLitresSold = accruals.reduce((sum, a) => sum + a.litresSold, 0);
        const totalMarginAccrued = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
        const averageMarginPerLitre = totalLitresSold > 0 ? totalMarginAccrued / totalLitresSold : 0;
        // Group by date for daily summaries
        const dailyAccruals = this.groupAccrualsByDate(accruals);
        // Calculate product breakdown
        const productBreakdown = {};
        for (const accrual of accruals) {
            const product = accrual.productType;
            if (!productBreakdown[product]) {
                productBreakdown[product] = {
                    totalLitres: 0,
                    totalMargin: 0,
                    averageMarginRate: 0,
                    daysWithSales: new Set(),
                };
            }
            productBreakdown[product].totalLitres += accrual.litresSold;
            productBreakdown[product].totalMargin += accrual.marginAmount;
            productBreakdown[product].daysWithSales.add(accrual.accrualDate.toDateString());
        }
        // Finalize product breakdown
        for (const product in productBreakdown) {
            const data = productBreakdown[product];
            data.averageMarginRate = data.totalLitres > 0 ? data.totalMargin / data.totalLitres : 0;
            data.daysWithSales = data.daysWithSales.size;
        }
        const totalDays = Math.ceil((windowDates.endDate.getTime() - windowDates.startDate.getTime()) / (24 * 60 * 60 * 1000));
        const accruedDays = new Set(accruals.map(a => a.accrualDate.toDateString())).size;
        return {
            windowId,
            stationId,
            periodStart: windowDates.startDate,
            periodEnd: windowDates.endDate,
            totalDays,
            accruedDays,
            totalLitresSold,
            totalMarginAccrued,
            averageMarginPerLitre,
            productBreakdown,
            dailyAccruals,
        };
    }
    /**
     * Adjust margin accrual (for corrections or adjustments)
     */
    async adjustMarginAccrual(accrualId, adjustmentAmount, adjustmentReason, tenantId, userId) {
        const accrual = await this.marginAccrualRepository.findOne({
            where: { id: accrualId, tenantId },
        });
        if (!accrual) {
            throw new common_1.NotFoundException('Margin accrual not found');
        }
        if (accrual.status === dealer_margin_accrual_entity_1.AccrualStatus.POSTED_TO_GL) {
            throw new common_1.BadRequestException('Cannot adjust accrual that has been posted to GL');
        }
        // Create adjustment record
        const adjustment = {
            type: 'manual_adjustment',
            amount: adjustmentAmount,
            reason: adjustmentReason,
            adjustedBy: userId,
            adjustedAt: new Date(),
        };
        // Update accrual
        accrual.marginAmount += adjustmentAmount;
        accrual.calculationDetails = {
            ...accrual.calculationDetails,
            adjustments: [...(accrual.calculationDetails?.adjustments || []), adjustment],
        };
        const savedAccrual = await this.marginAccrualRepository.save(accrual);
        // Emit adjustment event
        this.eventEmitter.emit('dealer.margin.adjusted', {
            accrualId,
            stationId: accrual.stationId,
            adjustmentAmount,
            newMarginAmount: accrual.marginAmount,
            adjustmentReason,
            tenantId,
        });
        return savedAccrual;
    }
    /**
     * Post margin accruals to general ledger
     */
    async postAccrualsToGL(stationId, windowId, tenantId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const accruals = await this.marginAccrualRepository.find({
                where: {
                    stationId,
                    windowId,
                    tenantId,
                    status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
                },
            });
            if (accruals.length === 0) {
                throw new common_1.NotFoundException('No accrued margins found to post');
            }
            const totalAmount = accruals.reduce((sum, a) => sum + a.marginAmount, 0);
            const journalEntryId = (0, uuid_1.v4)();
            // Update accrual statuses
            for (const accrual of accruals) {
                accrual.status = dealer_margin_accrual_entity_1.AccrualStatus.POSTED_TO_GL;
                accrual.journalEntryId = journalEntryId;
                accrual.glAccountCode = '4100'; // Revenue account for dealer margins
                accrual.costCenter = stationId;
            }
            await queryRunner.manager.save(accruals);
            await queryRunner.commitTransaction();
            // Emit GL posting event
            this.eventEmitter.emit('dealer.margin.posted.gl', {
                stationId,
                windowId,
                journalEntryId,
                totalAmount,
                accrualCount: accruals.length,
                tenantId,
            });
            // Emit accounting event for journal entry creation
            this.eventEmitter.emit('accounting.journal.create', {
                templateCode: 'DEALER_MARGIN_ACCRUAL',
                referenceId: journalEntryId,
                amount: totalAmount,
                description: `Dealer margin accrual - Station ${stationId} - Window ${windowId}`,
                stationId,
                windowId,
                tenantId,
                createdBy: userId,
            });
            this.logger.log(`Posted ${accruals.length} margin accruals to GL: Total GHS ${totalAmount.toFixed(2)}`);
            return {
                postedCount: accruals.length,
                totalAmount,
                journalEntryId,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Get margin accruals for a period
     */
    async getMarginAccruals(stationId, tenantId, options) {
        const query = this.marginAccrualRepository.createQueryBuilder('accrual')
            .where('accrual.stationId = :stationId', { stationId })
            .andWhere('accrual.tenantId = :tenantId', { tenantId });
        if (options?.fromDate) {
            query.andWhere('accrual.accrualDate >= :fromDate', { fromDate: options.fromDate });
        }
        if (options?.toDate) {
            query.andWhere('accrual.accrualDate <= :toDate', { toDate: options.toDate });
        }
        if (options?.windowId) {
            query.andWhere('accrual.windowId = :windowId', { windowId: options.windowId });
        }
        if (options?.productType) {
            query.andWhere('accrual.productType = :productType', { productType: options.productType });
        }
        if (options?.status) {
            query.andWhere('accrual.status = :status', { status: options.status });
        }
        query.orderBy('accrual.accrualDate', 'DESC')
            .addOrderBy('accrual.productType', 'ASC');
        if (options?.limit) {
            query.limit(options.limit);
        }
        return query.getMany();
    }
    /**
     * Get margin accrual trends
     */
    async getMarginAccrualTrends(stationId, tenantId, periodDays = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - periodDays);
        const accruals = await this.marginAccrualRepository.find({
            where: {
                stationId,
                tenantId,
                accrualDate: (0, typeorm_2.Between)(startDate, endDate),
                status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
            },
            order: { accrualDate: 'ASC' },
        });
        // Group by date
        const dailyData = new Map();
        for (const accrual of accruals) {
            const dateKey = accrual.accrualDate.toISOString().split('T')[0];
            if (!dailyData.has(dateKey)) {
                dailyData.set(dateKey, {
                    totalLitres: 0,
                    totalMargin: 0,
                    productMix: {},
                });
            }
            const dayData = dailyData.get(dateKey);
            dayData.totalLitres += accrual.litresSold;
            dayData.totalMargin += accrual.marginAmount;
            dayData.productMix[accrual.productType] = (dayData.productMix[accrual.productType] || 0) + accrual.litresSold;
        }
        // Convert to trends array
        const dailyTrends = Array.from(dailyData.entries()).map(([date, data]) => ({
            date,
            totalLitres: data.totalLitres,
            totalMargin: data.totalMargin,
            marginPerLitre: data.totalLitres > 0 ? data.totalMargin / data.totalLitres : 0,
            productMix: data.productMix,
        }));
        // Calculate summary
        const totalDays = dailyTrends.length;
        const totalLitres = dailyTrends.reduce((sum, d) => sum + d.totalLitres, 0);
        const totalMargin = dailyTrends.reduce((sum, d) => sum + d.totalMargin, 0);
        const bestDay = dailyTrends.reduce((best, day) => day.totalMargin > best.margin ? { date: day.date, margin: day.totalMargin } : best, { date: '', margin: 0 });
        const worstDay = dailyTrends.reduce((worst, day) => day.totalMargin < worst.margin || worst.margin === 0 ? { date: day.date, margin: day.totalMargin } : worst, { date: '', margin: Infinity });
        return {
            dailyTrends,
            summary: {
                totalDays,
                averageDailyLitres: totalDays > 0 ? totalLitres / totalDays : 0,
                averageDailyMargin: totalDays > 0 ? totalMargin / totalDays : 0,
                averageMarginPerLitre: totalLitres > 0 ? totalMargin / totalLitres : 0,
                bestDay,
                worstDay: worstDay.margin === Infinity ? { date: '', margin: 0 } : worstDay,
            },
        };
    }
    // Private helper methods
    groupTransactionsByProduct(transactions) {
        return transactions.reduce((groups, transaction) => {
            const product = transaction.productType;
            if (!groups[product]) {
                groups[product] = [];
            }
            groups[product].push(transaction);
            return groups;
        }, {});
    }
    async getPricingWindowComponents(windowId) {
        // This would integrate with pricing service to get actual components
        // For now, return mock data
        return [
            {
                componentCode: 'DEAL',
                name: 'Dealer Margin',
                category: 'dealer_margin',
                unit: 'GHS_per_litre',
                rateValue: 0.35,
                productType: 'PMS',
                effectiveFrom: new Date(),
                effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
            {
                componentCode: 'DEAL',
                name: 'Dealer Margin',
                category: 'dealer_margin',
                unit: 'GHS_per_litre',
                rateValue: 0.30,
                productType: 'AGO',
                effectiveFrom: new Date(),
                effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
            {
                componentCode: 'DEAL',
                name: 'Dealer Margin',
                category: 'dealer_margin',
                unit: 'GHS_per_litre',
                rateValue: 0.40,
                productType: 'LPG',
                effectiveFrom: new Date(),
                effectiveTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
        ];
    }
    extractPBUBreakdown(components, productType) {
        // Extract all PBU components for this product
        const breakdown = {};
        for (const component of components) {
            if (component.productType === productType) {
                breakdown[component.componentCode] = component.rateValue;
            }
        }
        return breakdown;
    }
    async getPricingWindowDates(windowId) {
        // This would integrate with pricing service to get actual window dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        const endDate = new Date();
        return { startDate, endDate };
    }
    groupAccrualsByDate(accruals) {
        const dailyGroups = new Map();
        for (const accrual of accruals) {
            const dateKey = accrual.accrualDate.toISOString().split('T')[0];
            if (!dailyGroups.has(dateKey)) {
                dailyGroups.set(dateKey, []);
            }
            dailyGroups.get(dateKey).push(accrual);
        }
        return Array.from(dailyGroups.entries()).map(([dateStr, dayAccruals]) => {
            const totalLitresSold = dayAccruals.reduce((sum, a) => sum + a.litresSold, 0);
            const grossMarginEarned = dayAccruals.reduce((sum, a) => sum + a.marginAmount, 0);
            const productBreakdown = {};
            for (const accrual of dayAccruals) {
                productBreakdown[accrual.productType] = {
                    litres: accrual.litresSold,
                    marginRate: accrual.marginRate,
                    marginAmount: accrual.marginAmount,
                    exPumpPrice: accrual.exPumpPrice,
                };
            }
            return {
                stationId: dayAccruals[0].stationId,
                accrualDate: dayAccruals[0].accrualDate,
                windowId: dayAccruals[0].windowId,
                totalLitresSold,
                grossMarginEarned,
                productBreakdown,
                accrualStatus: dayAccruals[0].status,
                createdAt: dayAccruals[0].createdAt,
            };
        });
    }
    /**
     * Scheduled task to process daily margin accruals automatically
     */
    async processAutomatedDailyAccruals() {
        this.logger.log('Starting automated daily margin accrual processing');
        try {
            // Get yesterday's date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            // This would get sales data from transaction service
            const salesData = await this.getDailySalesData(yesterday);
            if (salesData.length === 0) {
                this.logger.log('No sales data found for automated accrual processing');
                return;
            }
            // Group sales data by station
            const stationGroups = new Map();
            for (const sale of salesData) {
                if (!stationGroups.has(sale.stationId)) {
                    stationGroups.set(sale.stationId, []);
                }
                stationGroups.get(sale.stationId).push(sale);
            }
            let processedCount = 0;
            let errorCount = 0;
            // Process accruals for each station
            for (const [stationId, stationSales] of stationGroups) {
                try {
                    const accrualDto = {
                        stationId,
                        dealerId: stationId, // Assuming stationId maps to dealerId
                        accrualDate: yesterday,
                        transactions: stationSales.map(sale => ({
                            transactionId: sale.id,
                            stationId: sale.stationId,
                            productType: sale.productType,
                            litresSold: sale.litres,
                            exPumpPrice: sale.price,
                            transactionDate: sale.date,
                            windowId: sale.windowId,
                        })),
                        windowId: stationSales[0].windowId,
                        tenantId: stationSales[0].tenantId,
                        processedBy: 'system',
                    };
                    await this.processDailyMarginAccrual(accrualDto);
                    processedCount++;
                }
                catch (error) {
                    errorCount++;
                    this.logger.error(`Failed to process automated accrual for station ${stationId}:`, error);
                }
            }
            this.eventEmitter.emit('dealer.margin.automated.completed', {
                processedDate: yesterday,
                stationsProcessed: processedCount,
                errors: errorCount,
                completedAt: new Date(),
            });
            this.logger.log(`Automated accrual processing completed: ${processedCount} stations processed, ${errorCount} errors`);
        }
        catch (error) {
            this.logger.error('Failed to process automated daily accruals:', error);
        }
    }
    async getDailySalesData(date) {
        // This would integrate with transaction service to get actual sales data
        // For now, return empty array
        return [];
    }
};
exports.DealerMarginAccrualService = DealerMarginAccrualService;
__decorate([
    (0, schedule_1.Cron)('0 3 * * *') // Daily at 3 AM (after daily sales are finalized)
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerMarginAccrualService.prototype, "processAutomatedDailyAccruals", null);
exports.DealerMarginAccrualService = DealerMarginAccrualService = DealerMarginAccrualService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_margin_accrual_entity_1.DealerMarginAccrual)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DealerMarginAccrualService);
//# sourceMappingURL=dealer-margin-accrual.service.js.map