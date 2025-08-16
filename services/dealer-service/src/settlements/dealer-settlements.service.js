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
var DealerSettlementsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerSettlementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const dealer_settlement_entity_1 = require("./entities/dealer-settlement.entity");
const dealer_loan_entity_1 = require("../loans/entities/dealer-loan.entity");
const database_1 = require("@omc-erp/database");
const shared_types_1 = require("@omc-erp/shared-types");
const uuid_1 = require("uuid");
let DealerSettlementsService = DealerSettlementsService_1 = class DealerSettlementsService {
    settlementRepository;
    loanRepository;
    transactionRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerSettlementsService_1.name);
    constructor(settlementRepository, loanRepository, transactionRepository, dataSource, eventEmitter) {
        this.settlementRepository = settlementRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Close dealer settlement for a pricing window
     * Blueprint formula: gross_dealer_margin - loan_installment_due - other_deductions = net_payable_to_dealer
     */
    async closeDealerSettlement(stationId, windowId, tenantId, userId) {
        this.logger.log(`Processing dealer settlement for station ${stationId}, window ${windowId}`);
        // Calculate settlement amounts
        const calculation = await this.calculateSettlement(stationId, windowId, tenantId);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Check if settlement already exists
            let settlement = await this.settlementRepository.findOne({
                where: { stationId, windowId, tenantId },
            });
            if (settlement && settlement.status !== shared_types_1.DealerSettlementStatus.CALCULATED) {
                throw new common_1.BadRequestException('Settlement already processed for this window');
            }
            if (settlement) {
                // Update existing settlement
                Object.assign(settlement, {
                    settlementDate: new Date(),
                    totalLitresSold: calculation.salesData.totalLitresSold,
                    grossDealerMargin: calculation.grossDealerMargin,
                    loanDeduction: calculation.deductions.loanRepayment,
                    otherDeductions: calculation.deductions.total - calculation.deductions.loanRepayment,
                    netPayable: calculation.netPayable,
                    status: shared_types_1.DealerSettlementStatus.CALCULATED,
                    calculationDetails: calculation,
                    updatedAt: new Date(),
                });
            }
            else {
                // Create new settlement
                settlement = this.settlementRepository.create({
                    id: (0, uuid_1.v4)(),
                    stationId,
                    windowId,
                    settlementDate: new Date(),
                    totalLitresSold: calculation.salesData.totalLitresSold,
                    grossDealerMargin: calculation.grossDealerMargin,
                    loanDeduction: calculation.deductions.loanRepayment,
                    otherDeductions: calculation.deductions.total - calculation.deductions.loanRepayment,
                    netPayable: calculation.netPayable,
                    status: shared_types_1.DealerSettlementStatus.CALCULATED,
                    calculationDetails: calculation,
                    tenantId,
                    createdBy: userId,
                });
            }
            const savedSettlement = await queryRunner.manager.save(settlement);
            // Update loan balances if there are loan deductions
            if (calculation.deductions.loanRepayment > 0 && calculation.loanDetails) {
                await this.processLoanRepayments(stationId, calculation.deductions.loanRepayment, tenantId, queryRunner.manager);
            }
            // Generate settlement statement
            const settlementStatement = await this.generateSettlementStatement(savedSettlement, calculation);
            await queryRunner.commitTransaction();
            // Emit events
            this.eventEmitter.emit('dealer-settlement.calculated', {
                settlementId: savedSettlement.id,
                stationId,
                windowId,
                netPayable: calculation.netPayable,
                tenantId,
            });
            if (calculation.netPayable < 0) {
                this.eventEmitter.emit('dealer-settlement.negative-balance', {
                    settlementId: savedSettlement.id,
                    stationId,
                    deficit: Math.abs(calculation.netPayable),
                    tenantId,
                });
            }
            this.logger.log(`Settlement completed for station ${stationId}: Net payable GHS ${calculation.netPayable.toFixed(2)}`);
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
     * Calculate settlement amounts for a dealer
     * Blueprint: dealer_margin_amt_day = sum_over_products(litres_sold(product) * dealer_margin_rate(product, window))
     */
    async calculateSettlement(stationId, windowId, tenantId) {
        // Get pricing window dates (this would normally come from pricing service)
        const windowDates = await this.getPricingWindowDates(windowId);
        // Get all completed transactions for the window period
        const transactions = await this.transactionRepository.find({
            where: {
                stationId,
                tenantId,
                status: shared_types_1.TransactionStatus.COMPLETED,
                transactionTime: (0, typeorm_2.Between)(windowDates.startDate, windowDates.endDate),
            },
        });
        if (transactions.length === 0) {
            throw new common_1.NotFoundException('No completed transactions found for the specified period');
        }
        // Calculate sales by product
        const salesByProduct = {};
        let totalLitres = 0;
        let grossMargin = 0;
        for (const transaction of transactions) {
            const fuelType = transaction.fuelType;
            const litres = transaction.quantityLiters;
            // Get dealer margin rate for this product and window (this would come from pricing service)
            const marginRate = await this.getDealerMarginRate(fuelType, windowId, tenantId);
            const marginAmount = litres * marginRate;
            if (!salesByProduct[fuelType]) {
                salesByProduct[fuelType] = {
                    litres: 0,
                    marginRate,
                    marginAmount: 0,
                };
            }
            salesByProduct[fuelType].litres += litres;
            salesByProduct[fuelType].marginAmount += marginAmount;
            totalLitres += litres;
            grossMargin += marginAmount;
        }
        // Calculate loan deductions
        const loanDeductions = await this.calculateLoanDeductions(stationId, windowId, tenantId);
        // Calculate other deductions (chargebacks, shortages, etc.)
        const otherDeductions = await this.calculateOtherDeductions(stationId, windowId, tenantId);
        const totalDeductions = loanDeductions.amount + otherDeductions.total;
        const netPayable = grossMargin - totalDeductions;
        return {
            stationId,
            windowId,
            period: windowDates,
            salesData: {
                totalLitresSold: totalLitres,
                byProduct: salesByProduct,
            },
            grossDealerMargin: grossMargin,
            deductions: {
                loanRepayment: loanDeductions.amount,
                chargebacks: otherDeductions.chargebacks,
                shortages: otherDeductions.shortages,
                other: otherDeductions.other,
                total: totalDeductions,
            },
            netPayable,
            loanDetails: loanDeductions.details,
        };
    }
    /**
     * Generate dealer settlement statement
     * Blueprint requirement: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    async generateSettlementStatement(settlement, calculation) {
        const statement = {
            settlementId: settlement.id,
            stationId: settlement.stationId,
            windowId: settlement.windowId,
            settlementDate: settlement.settlementDate,
            period: calculation.period,
            // Sales Summary
            salesSummary: {
                totalLitresSold: calculation.salesData.totalLitresSold,
                productBreakdown: calculation.salesData.byProduct,
                grossDealerMargin: calculation.grossDealerMargin,
            },
            // PBU Breakdown (would get this from pricing service)
            pbuBreakdown: {
                // This should show the dealer margin component from the PBU
                dealerMarginRate: 'Variable by product',
                effectiveRates: Object.entries(calculation.salesData.byProduct).map(([product, data]) => ({
                    product,
                    marginRate: data.marginRate,
                    litres: data.litres,
                    marginEarned: data.marginAmount,
                })),
            },
            // Deductions
            deductions: {
                loanRepayment: {
                    amount: calculation.deductions.loanRepayment,
                    details: calculation.loanDetails,
                },
                chargebacks: calculation.deductions.chargebacks,
                shortages: calculation.deductions.shortages,
                other: calculation.deductions.other,
                total: calculation.deductions.total,
            },
            // Net Settlement
            netSettlement: {
                grossAmount: calculation.grossDealerMargin,
                totalDeductions: calculation.deductions.total,
                netPayable: calculation.netPayable,
                paymentDue: calculation.netPayable > 0,
                dueToDealer: calculation.netPayable < 0 ? Math.abs(calculation.netPayable) : 0,
            },
            // Payment Instructions
            paymentInstructions: calculation.netPayable > 0
                ? 'Amount will be credited to dealer account within 3 business days'
                : 'Deficit balance to be recovered from future settlements',
            generatedAt: new Date(),
        };
        return statement;
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
        if (settlement.status !== shared_types_1.DealerSettlementStatus.CALCULATED) {
            throw new common_1.BadRequestException('Settlement must be in calculated status to approve');
        }
        settlement.status = shared_types_1.DealerSettlementStatus.APPROVED;
        settlement.approvedBy = userId;
        settlement.approvedAt = new Date();
        settlement.updatedAt = new Date();
        const savedSettlement = await this.settlementRepository.save(settlement);
        this.eventEmitter.emit('dealer-settlement.approved', {
            settlementId: savedSettlement.id,
            stationId: settlement.stationId,
            netPayable: settlement.netPayable,
            approvedBy: userId,
            tenantId,
        });
        return savedSettlement;
    }
    /**
     * Mark settlement as paid
     */
    async markSettlementPaid(settlementId, paymentReference, tenantId, userId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, tenantId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException('Settlement not found');
        }
        if (settlement.status !== shared_types_1.DealerSettlementStatus.APPROVED) {
            throw new common_1.BadRequestException('Settlement must be approved before marking as paid');
        }
        settlement.status = shared_types_1.DealerSettlementStatus.PAID;
        settlement.paymentDate = new Date();
        settlement.paymentReference = paymentReference;
        settlement.paidBy = userId;
        settlement.updatedAt = new Date();
        const savedSettlement = await this.settlementRepository.save(settlement);
        this.eventEmitter.emit('dealer-settlement.paid', {
            settlementId: savedSettlement.id,
            stationId: settlement.stationId,
            amountPaid: settlement.netPayable,
            paymentReference,
            tenantId,
        });
        return savedSettlement;
    }
    /**
     * Get dealer cash flow forecast
     * Blueprint AI feature: "Dealer credit risk & repayment optimizer"
     */
    async getDealerCashFlowForecast(stationId, tenantId) {
        // Get historical settlements
        const recentSettlements = await this.settlementRepository.find({
            where: { stationId, tenantId },
            order: { settlementDate: 'DESC' },
            take: 12, // Last 12 windows/6 months
        });
        // Get active loans
        const activeLoans = await this.loanRepository.find({
            where: { stationId, tenantId, status: 'active' },
        });
        // Calculate average margins
        const avgGrossMargin = recentSettlements.length > 0
            ? recentSettlements.reduce((sum, s) => sum + s.grossDealerMargin, 0) / recentSettlements.length
            : 0;
        const avgNetPayable = recentSettlements.length > 0
            ? recentSettlements.reduce((sum, s) => sum + s.netPayable, 0) / recentSettlements.length
            : 0;
        // Forecast next 6 windows
        const forecast = [];
        let cumulativeCashFlow = 0;
        for (let i = 1; i <= 6; i++) {
            const projectedGrossMargin = avgGrossMargin * (1 + (Math.random() - 0.5) * 0.1); // ±5% variance
            const projectedLoanDeduction = activeLoans.reduce((sum, loan) => {
                // Calculate installment (simplified)
                return sum + (loan.principalAmount / loan.tenorMonths);
            }, 0);
            const projectedNetPayable = projectedGrossMargin - projectedLoanDeduction;
            cumulativeCashFlow += projectedNetPayable;
            forecast.push({
                window: i,
                projectedGrossMargin,
                projectedLoanDeduction,
                projectedNetPayable,
                cumulativeCashFlow,
                riskLevel: cumulativeCashFlow < 0 ? 'high' : cumulativeCashFlow < projectedGrossMargin ? 'medium' : 'low',
            });
        }
        return {
            stationId,
            historicalData: {
                avgGrossMargin,
                avgNetPayable,
                settlementCount: recentSettlements.length,
            },
            activeLoans: {
                count: activeLoans.length,
                totalOutstanding: activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
                monthlyInstallments: activeLoans.reduce((sum, loan) => sum + (loan.principalAmount / loan.tenorMonths), 0),
            },
            forecast,
            recommendations: this.generateCashFlowRecommendations(forecast, activeLoans),
        };
    }
    // Private helper methods
    async getPricingWindowDates(windowId) {
        // This would integrate with pricing service to get actual window dates
        // For now, return mock dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        const endDate = new Date();
        return { startDate, endDate };
    }
    async getDealerMarginRate(fuelType, windowId, tenantId) {
        // This would integrate with pricing service to get actual dealer margin rates
        // Blueprint: get from pbu_components table
        const defaultRates = {
            'PMS': 0.35,
            'AGO': 0.30,
            'LPG': 0.40,
        };
        return defaultRates[fuelType] || 0.35;
    }
    async calculateLoanDeductions(stationId, windowId, tenantId) {
        const activeLoans = await this.loanRepository.find({
            where: { stationId, tenantId, status: 'active' },
        });
        if (activeLoans.length === 0) {
            return { amount: 0 };
        }
        let totalDeduction = 0;
        const loanDetails = activeLoans.map(loan => {
            // Calculate bi-weekly installment (simplified calculation)
            const installment = loan.principalAmount / loan.tenorMonths * 0.5; // Assume bi-weekly = half monthly
            totalDeduction += installment;
            return {
                loanId: loan.id,
                installment,
                outstandingBalance: loan.outstandingBalance,
            };
        });
        return {
            amount: totalDeduction,
            details: {
                totalLoans: activeLoans.length,
                outstandingBalance: activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
                loanBreakdown: loanDetails,
            },
        };
    }
    async calculateOtherDeductions(stationId, windowId, tenantId) {
        // This would calculate actual chargebacks, shortages, etc.
        // For now, return zeros
        return {
            chargebacks: 0,
            shortages: 0,
            other: 0,
            total: 0,
        };
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
            remainingAmount -= paymentAmount;
            if (loan.outstandingBalance <= 0) {
                loan.status = 'completed';
                loan.completedAt = new Date();
            }
            await entityManager.save(loan);
            this.eventEmitter.emit('dealer-loan.payment-applied', {
                loanId: loan.id,
                stationId,
                paymentAmount,
                newBalance: loan.outstandingBalance,
                tenantId,
            });
        }
    }
    generateCashFlowRecommendations(forecast, activeLoans) {
        const recommendations = [];
        // Check for cash flow stress
        const negativeWindows = forecast.filter(f => f.projectedNetPayable < 0);
        if (negativeWindows.length > 0) {
            recommendations.push('Cash flow stress detected - consider loan restructuring');
        }
        // Check loan burden
        const highLoanBurden = forecast.some(f => f.projectedLoanDeduction > f.projectedGrossMargin * 0.8);
        if (highLoanBurden) {
            recommendations.push('Loan burden is high (>80% of gross margin) - review repayment schedule');
        }
        // Positive trends
        const improvingTrend = forecast.every((f, i) => i === 0 || f.cumulativeCashFlow >= forecast[i - 1].cumulativeCashFlow);
        if (improvingTrend) {
            recommendations.push('Positive cash flow trend - consider growth investments');
        }
        return recommendations;
    }
    // Scheduled task for automated settlements
    async processAutomatedSettlements() {
        this.logger.log('Starting automated dealer settlement processing');
        // This would get list of stations and current window from pricing service
        // For now, just log the scheduled execution
        this.eventEmitter.emit('dealer-settlements.batch-processing-started', {
            scheduledAt: new Date(),
        });
    }
};
exports.DealerSettlementsService = DealerSettlementsService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * 1') // Every Monday at 2 AM (after pricing window closes)
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerSettlementsService.prototype, "processAutomatedSettlements", null);
exports.DealerSettlementsService = DealerSettlementsService = DealerSettlementsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_settlement_entity_1.DealerSettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(dealer_loan_entity_1.DealerLoan)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DealerSettlementsService);
//# sourceMappingURL=dealer-settlements.service.js.map