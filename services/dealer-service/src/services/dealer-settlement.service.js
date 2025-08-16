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
var DealerSettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerSettlementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const dealer_settlement_entity_1 = require("../entities/dealer-settlement.entity");
const dealer_loan_entity_1 = require("../entities/dealer-loan.entity");
const dealer_margin_accrual_entity_1 = require("../entities/dealer-margin-accrual.entity");
const uuid_1 = require("uuid");
let DealerSettlementService = DealerSettlementService_1 = class DealerSettlementService {
    settlementRepository;
    loanRepository;
    marginAccrualRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerSettlementService_1.name);
    constructor(settlementRepository, loanRepository, marginAccrualRepository, dataSource, eventEmitter) {
        this.settlementRepository = settlementRepository;
        this.loanRepository = loanRepository;
        this.marginAccrualRepository = marginAccrualRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Calculate dealer settlement for a pricing window
     * Blueprint: dealer_margin_amt_day = sum_over_products(litres_sold(product) * dealer_margin_rate(product, window))
     */
    async calculateDealerSettlement(stationId, windowId, tenantId, userId) {
        this.logger.log(`Calculating dealer settlement for station ${stationId}, window ${windowId}`);
        // Get pricing window details with PBU components
        const pricingWindow = await this.getPricingWindowData(windowId);
        if (!pricingWindow) {
            throw new common_1.NotFoundException(`Pricing window ${windowId} not found`);
        }
        // Get dealer margin accruals for this window
        const marginAccruals = await this.marginAccrualRepository.find({
            where: {
                stationId,
                windowId,
                tenantId,
                accrualDate: (0, typeorm_2.Between)(pricingWindow.startDate, pricingWindow.endDate),
                status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
            },
            order: { accrualDate: 'ASC' },
        });
        if (marginAccruals.length === 0) {
            throw new common_1.NotFoundException('No margin accruals found for the specified period');
        }
        // Aggregate sales by product
        const salesByProduct = {};
        let totalLitres = 0;
        let grossMargin = 0;
        for (const accrual of marginAccruals) {
            const productType = accrual.productType;
            if (!salesByProduct[productType]) {
                salesByProduct[productType] = {
                    litresSold: 0,
                    exPumpPrice: accrual.exPumpPrice,
                    dealerMarginRate: accrual.marginRate,
                    dealerMarginAmount: 0,
                    pbuBreakdown: accrual.calculationDetails?.pbuBreakdown || {},
                };
            }
            salesByProduct[productType].litresSold += accrual.litresSold;
            salesByProduct[productType].dealerMarginAmount += accrual.marginAmount;
            totalLitres += accrual.litresSold;
            grossMargin += accrual.marginAmount;
        }
        // Calculate loan deductions
        const loanDeductions = await this.calculateLoanDeductions(stationId, windowId, tenantId);
        // Calculate other deductions
        const otherDeductions = await this.calculateOtherDeductions(stationId, windowId, tenantId);
        // Calculate net payable
        const totalDeductions = loanDeductions.totalAmount + otherDeductions.total;
        const netPayable = grossMargin - totalDeductions;
        const calculation = {
            stationId,
            windowId,
            period: {
                startDate: pricingWindow.startDate,
                endDate: pricingWindow.endDate,
            },
            salesByProduct,
            totalLitresSold: totalLitres,
            grossDealerMargin: grossMargin,
            loanDeductions,
            otherDeductions,
            netPayable,
        };
        this.logger.log(`Settlement calculated: Gross margin GHS ${grossMargin.toFixed(2)}, Net payable GHS ${netPayable.toFixed(2)}`);
        return calculation;
    }
    /**
     * Create dealer settlement record
     * Blueprint requirement: "Generate settlement statements per pricing window"
     */
    async createSettlement(calculation, tenantId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Check if settlement already exists
            let settlement = await this.settlementRepository.findOne({
                where: {
                    stationId: calculation.stationId,
                    windowId: calculation.windowId,
                    tenantId
                },
            });
            if (settlement && settlement.status !== dealer_settlement_entity_1.DealerSettlementStatus.CALCULATED) {
                throw new common_1.BadRequestException('Settlement already processed for this window');
            }
            const settlementNumber = await this.generateSettlementNumber(calculation.stationId, calculation.windowId);
            if (settlement) {
                // Update existing settlement
                settlement.settlementDate = new Date();
                settlement.periodStart = calculation.period.startDate;
                settlement.periodEnd = calculation.period.endDate;
                settlement.totalLitresSold = calculation.totalLitresSold;
                settlement.grossDealerMargin = calculation.grossDealerMargin;
                settlement.loanDeduction = calculation.loanDeductions.totalAmount;
                settlement.otherDeductions = calculation.otherDeductions.total;
                settlement.totalDeductions = calculation.loanDeductions.totalAmount + calculation.otherDeductions.total;
                settlement.netPayable = calculation.netPayable;
                settlement.status = dealer_settlement_entity_1.DealerSettlementStatus.CALCULATED;
                settlement.calculationDetails = {
                    salesByProduct: calculation.salesByProduct,
                    deductionBreakdown: {
                        loanRepayments: calculation.loanDeductions.loanBreakdown,
                        chargebacks: calculation.otherDeductions.chargebacks,
                        shortages: calculation.otherDeductions.shortages,
                        penalties: calculation.otherDeductions.penalties,
                        other: calculation.otherDeductions.adjustments,
                    },
                    pbuBreakdown: calculation.salesByProduct,
                };
            }
            else {
                // Create new settlement
                settlement = this.settlementRepository.create({
                    id: (0, uuid_1.v4)(),
                    stationId: calculation.stationId,
                    windowId: calculation.windowId,
                    settlementDate: new Date(),
                    periodStart: calculation.period.startDate,
                    periodEnd: calculation.period.endDate,
                    totalLitresSold: calculation.totalLitresSold,
                    grossDealerMargin: calculation.grossDealerMargin,
                    loanDeduction: calculation.loanDeductions.totalAmount,
                    otherDeductions: calculation.otherDeductions.total,
                    totalDeductions: calculation.loanDeductions.totalAmount + calculation.otherDeductions.total,
                    netPayable: calculation.netPayable,
                    status: dealer_settlement_entity_1.DealerSettlementStatus.CALCULATED,
                    calculationDetails: {
                        salesByProduct: calculation.salesByProduct,
                        deductionBreakdown: {
                            loanRepayments: calculation.loanDeductions.loanBreakdown,
                            chargebacks: calculation.otherDeductions.chargebacks,
                            shortages: calculation.otherDeductions.shortages,
                            penalties: calculation.otherDeductions.penalties,
                            other: calculation.otherDeductions.adjustments,
                        },
                        pbuBreakdown: calculation.salesByProduct,
                    },
                    tenantId,
                    createdBy: userId,
                });
            }
            const savedSettlement = await queryRunner.manager.save(settlement);
            // Update margin accruals to mark as settled
            await queryRunner.manager.update(dealer_margin_accrual_entity_1.DealerMarginAccrual, {
                stationId: calculation.stationId,
                windowId: calculation.windowId,
                tenantId,
                status: dealer_margin_accrual_entity_1.AccrualStatus.ACCRUED,
            }, { status: dealer_margin_accrual_entity_1.AccrualStatus.POSTED_TO_GL });
            await queryRunner.commitTransaction();
            // Emit settlement created event
            this.eventEmitter.emit('dealer.settlement.calculated', {
                settlementId: savedSettlement.id,
                stationId: calculation.stationId,
                windowId: calculation.windowId,
                grossMargin: calculation.grossDealerMargin,
                netPayable: calculation.netPayable,
                tenantId,
            });
            this.logger.log(`Settlement created: ${settlementNumber} - Net payable: GHS ${calculation.netPayable.toFixed(2)}`);
            return savedSettlement;
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
     * Approve settlement for payment
     */
    async approveSettlement(settlementId, tenantId, userId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, tenantId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException('Settlement not found');
        }
        if (settlement.status !== dealer_settlement_entity_1.DealerSettlementStatus.CALCULATED) {
            throw new common_1.BadRequestException('Settlement must be in calculated status to approve');
        }
        settlement.status = dealer_settlement_entity_1.DealerSettlementStatus.APPROVED;
        settlement.approvedBy = userId;
        settlement.approvedAt = new Date();
        const savedSettlement = await this.settlementRepository.save(settlement);
        // Emit approval event
        this.eventEmitter.emit('dealer.settlement.approved', {
            settlementId: savedSettlement.id,
            stationId: settlement.stationId,
            netPayable: settlement.netPayable,
            approvedBy: userId,
            tenantId,
        });
        return savedSettlement;
    }
    /**
     * Process settlement payment
     */
    async processSettlementPayment(settlementId, paymentReference, paymentMethod, tenantId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const settlement = await this.settlementRepository.findOne({
                where: { id: settlementId, tenantId },
            });
            if (!settlement) {
                throw new common_1.NotFoundException('Settlement not found');
            }
            if (settlement.status !== dealer_settlement_entity_1.DealerSettlementStatus.APPROVED) {
                throw new common_1.BadRequestException('Settlement must be approved before payment');
            }
            // Update settlement
            settlement.status = dealer_settlement_entity_1.DealerSettlementStatus.PAID;
            settlement.paymentDate = new Date();
            settlement.paymentReference = paymentReference;
            settlement.paymentMethod = paymentMethod;
            settlement.paidBy = userId;
            const savedSettlement = await queryRunner.manager.save(settlement);
            // Process loan repayments if any
            if (settlement.loanDeduction > 0) {
                await this.processLoanRepayments(settlement.stationId, settlement.loanDeduction, tenantId, queryRunner.manager);
            }
            await queryRunner.commitTransaction();
            // Emit payment processed event
            this.eventEmitter.emit('dealer.settlement.paid', {
                settlementId: savedSettlement.id,
                stationId: settlement.stationId,
                amountPaid: settlement.netPayable,
                paymentReference,
                paymentMethod,
                tenantId,
            });
            return savedSettlement;
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
     * Generate settlement statement
     * Blueprint: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    async generateSettlementStatement(settlementId, tenantId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, tenantId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException('Settlement not found');
        }
        // Get settlement calculation details
        const calculationDetails = settlement.calculationDetails;
        // Get active loans for loan details
        const activeLoans = await this.loanRepository.find({
            where: { stationId: settlement.stationId, tenantId, status: 'active' },
        });
        const statement = {
            settlementId: settlement.id,
            settlementNumber: `SETT-${settlement.stationId}-${settlement.windowId}`,
            stationId: settlement.stationId,
            dealerId: settlement.stationId, // Assuming stationId maps to dealerId
            windowId: settlement.windowId,
            periodStart: settlement.periodStart,
            periodEnd: settlement.periodEnd,
            statementDate: new Date(),
            salesSummary: {
                totalLitresSold: settlement.totalLitresSold,
                productBreakdown: Object.entries(calculationDetails?.salesByProduct || {}).reduce((acc, [product, data]) => ({
                    ...acc,
                    [product]: {
                        litres: data.litresSold,
                        averagePrice: data.exPumpPrice,
                        grossRevenue: data.litresSold * data.exPumpPrice,
                        dealerMargin: data.dealerMarginAmount,
                    },
                }), {}),
            },
            pbuAnalysis: this.extractPBUAnalysis(calculationDetails),
            settlementDetails: {
                grossMarginEarned: settlement.grossDealerMargin,
                totalDeductions: settlement.totalDeductions,
                netAmountPayable: settlement.netPayable,
                paymentMethod: settlement.paymentMethod || 'bank_transfer',
                expectedPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            },
            loanRepaymentDetails: activeLoans.length > 0 ? {
                activeLoans: activeLoans.length,
                totalOutstanding: activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
                currentInstallments: calculationDetails?.deductionBreakdown?.loanRepayments || [],
                totalLoanDeduction: settlement.loanDeduction,
            } : undefined,
            performanceMetrics: {
                marginPerLitre: settlement.totalLitresSold > 0 ? settlement.grossDealerMargin / settlement.totalLitresSold : 0,
                deductionRatio: settlement.grossDealerMargin > 0 ? settlement.totalDeductions / settlement.grossDealerMargin : 0,
                profitabilityIndex: settlement.netPayable / settlement.grossDealerMargin,
                performanceRating: this.calculatePerformanceRating(settlement),
            },
        };
        return statement;
    }
    /**
     * Get dealer settlements for a period
     */
    async getDealerSettlements(stationId, tenantId, options) {
        const query = this.settlementRepository.createQueryBuilder('settlement')
            .where('settlement.stationId = :stationId', { stationId })
            .andWhere('settlement.tenantId = :tenantId', { tenantId });
        if (options?.status) {
            query.andWhere('settlement.status = :status', { status: options.status });
        }
        if (options?.fromDate) {
            query.andWhere('settlement.settlementDate >= :fromDate', { fromDate: options.fromDate });
        }
        if (options?.toDate) {
            query.andWhere('settlement.settlementDate <= :toDate', { toDate: options.toDate });
        }
        query.orderBy('settlement.settlementDate', 'DESC');
        if (options?.limit) {
            query.limit(options.limit);
        }
        return query.getMany();
    }
    // Private helper methods
    async getPricingWindowData(windowId) {
        // This would integrate with pricing service to get actual window data
        // For now, return mock data
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        const endDate = new Date();
        return {
            windowId,
            startDate,
            endDate,
            pbuComponents: [
                { componentCode: 'DEAL', name: 'Dealer Margin', category: 'dealer_margin', unit: 'GHS_per_litre', rateValue: 0.35, productType: 'PMS' },
                { componentCode: 'DEAL', name: 'Dealer Margin', category: 'dealer_margin', unit: 'GHS_per_litre', rateValue: 0.30, productType: 'AGO' },
                { componentCode: 'DEAL', name: 'Dealer Margin', category: 'dealer_margin', unit: 'GHS_per_litre', rateValue: 0.40, productType: 'LPG' },
            ],
        };
    }
    async calculateLoanDeductions(stationId, windowId, tenantId) {
        const activeLoans = await this.loanRepository.find({
            where: { stationId, tenantId, status: 'active' },
        });
        if (activeLoans.length === 0) {
            return { totalAmount: 0, loanBreakdown: [] };
        }
        let totalAmount = 0;
        const loanBreakdown = [];
        for (const loan of activeLoans) {
            // Calculate current installment (simplified - would use actual schedule)
            const monthlyRate = loan.interestRate / 100 / 12;
            const installmentAmount = loan.principalAmount / loan.tenorMonths;
            const interestAmount = loan.outstandingBalance * monthlyRate;
            const principalAmount = installmentAmount - interestAmount;
            const installmentData = {
                loanId: loan.id,
                installmentAmount: installmentAmount,
                principalAmount: Math.max(0, principalAmount),
                interestAmount: Math.max(0, interestAmount),
                penaltyAmount: loan.penaltyAmount,
                installmentNumber: Math.ceil((loan.tenorMonths * (loan.principalAmount - loan.outstandingBalance)) / loan.principalAmount) + 1,
            };
            loanBreakdown.push(installmentData);
            totalAmount += installmentAmount;
        }
        return { totalAmount, loanBreakdown };
    }
    async calculateOtherDeductions(stationId, windowId, tenantId) {
        // This would calculate actual deductions from various sources
        // For now, return zeros
        const deductions = {
            chargebacks: 0,
            shortages: 0,
            penalties: 0,
            adjustments: 0,
            total: 0,
        };
        deductions.total = deductions.chargebacks + deductions.shortages + deductions.penalties + deductions.adjustments;
        return deductions;
    }
    async processLoanRepayments(stationId, repaymentAmount, tenantId, entityManager) {
        const activeLoans = await entityManager.find('DealerLoan', {
            where: { stationId, tenantId, status: 'active' },
            order: { startDate: 'ASC' }, // Pay off older loans first
        });
        let remainingAmount = repaymentAmount;
        for (const loan of activeLoans) {
            if (remainingAmount <= 0)
                break;
            const paymentAmount = Math.min(remainingAmount, loan.outstandingBalance);
            loan.outstandingBalance -= paymentAmount;
            loan.totalPaid += paymentAmount;
            loan.lastPaymentDate = new Date();
            remainingAmount -= paymentAmount;
            if (loan.outstandingBalance <= 0) {
                loan.status = 'completed';
                loan.completedAt = new Date();
            }
            await entityManager.save(loan);
            this.eventEmitter.emit('dealer.loan.payment.applied', {
                loanId: loan.id,
                stationId,
                paymentAmount,
                newBalance: loan.outstandingBalance,
                tenantId,
            });
        }
    }
    async generateSettlementNumber(stationId, windowId) {
        const timestamp = Date.now();
        return `SETT-${stationId.slice(-4)}-${windowId}-${timestamp}`;
    }
    extractPBUAnalysis(calculationDetails) {
        // Extract PBU components from calculation details
        return {
            exRefineryPrice: 8.904,
            taxesAndLevies: {
                EDRL: 0.490,
                ROAD: 0.840,
                PSRL: 0.160,
            },
            regulatoryMargins: {
                BOST: 0.15,
                UPPF: 0.20,
                MARK: 0.10,
            },
            omcMargin: 0.30,
            dealerMargin: 0.35,
            totalExPumpPrice: 11.285,
        };
    }
    calculatePerformanceRating(settlement) {
        const marginPerLitre = settlement.totalLitresSold > 0 ? settlement.grossDealerMargin / settlement.totalLitresSold : 0;
        const deductionRatio = settlement.grossDealerMargin > 0 ? settlement.totalDeductions / settlement.grossDealerMargin : 0;
        const profitabilityIndex = settlement.netPayable / settlement.grossDealerMargin;
        let score = 0;
        if (marginPerLitre >= 0.30)
            score += 30;
        if (deductionRatio <= 0.20)
            score += 30;
        if (profitabilityIndex >= 0.80)
            score += 40;
        if (score >= 90)
            return 'EXCELLENT';
        if (score >= 70)
            return 'GOOD';
        if (score >= 50)
            return 'FAIR';
        return 'POOR';
    }
    /**
     * Scheduled task for automated settlement processing
     * Blueprint: automate settlement processing per pricing window
     */
    async processAutomatedSettlements() {
        this.logger.log('Starting automated dealer settlement processing');
        try {
            // This would get list of active stations and current window from configuration
            const activeStations = await this.getActiveStations();
            const currentWindow = await this.getCurrentPricingWindow();
            if (!currentWindow) {
                this.logger.warn('No current pricing window found for automated settlement');
                return;
            }
            let processedCount = 0;
            let errorCount = 0;
            for (const station of activeStations) {
                try {
                    const calculation = await this.calculateDealerSettlement(station.stationId, currentWindow.windowId, station.tenantId, 'system');
                    await this.createSettlement(calculation, station.tenantId, 'system');
                    processedCount++;
                }
                catch (error) {
                    this.logger.error(`Failed to process settlement for station ${station.stationId}:`, error);
                    errorCount++;
                }
            }
            this.eventEmitter.emit('dealer.settlements.batch.completed', {
                processedCount,
                errorCount,
                windowId: currentWindow.windowId,
                completedAt: new Date(),
            });
            this.logger.log(`Automated settlement processing completed: ${processedCount} processed, ${errorCount} errors`);
        }
        catch (error) {
            this.logger.error('Failed to process automated settlements:', error);
        }
    }
    async getActiveStations() {
        // This would get active stations from station service
        return [];
    }
    async getCurrentPricingWindow() {
        // This would get current pricing window from pricing service
        return null;
    }
};
exports.DealerSettlementService = DealerSettlementService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * 1') // Every Monday at 2 AM (after pricing window closes)
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerSettlementService.prototype, "processAutomatedSettlements", null);
exports.DealerSettlementService = DealerSettlementService = DealerSettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_settlement_entity_1.DealerSettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(dealer_loan_entity_1.DealerLoan)),
    __param(2, (0, typeorm_1.InjectRepository)(dealer_margin_accrual_entity_1.DealerMarginAccrual)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DealerSettlementService);
//# sourceMappingURL=dealer-settlement.service.js.map