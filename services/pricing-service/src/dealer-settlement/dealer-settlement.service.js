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
var DealerSettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerSettlementService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let DealerSettlementService = DealerSettlementService_1 = class DealerSettlementService {
    eventEmitter;
    logger = new common_1.Logger(DealerSettlementService_1.name);
    // Standard dealer margin rates per product (GHS per litre)
    DEALER_MARGIN_RATES = {
        'PMS': 0.35,
        'AGO': 0.35,
        'LPG': 0.30,
        'DPK': 0.25,
        'RFO': 0.20
    };
    // Tax rates for dealer settlements
    TAX_RATES = {
        'WITHHOLDING_TAX': 0.075, // 7.5% WHT on dealer payments
        'VAT': 0.125, // 12.5% VAT on services
        'NHIL': 0.025, // 2.5% NHIL
        'GETFUND': 0.025 // 2.5% GETFUND
    };
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create a new dealer settlement for a pricing window
     */
    async createDealerSettlement(dto) {
        this.logger.log(`Creating dealer settlement for dealer: ${dto.dealerId}, station: ${dto.stationId}`);
        try {
            // Validate dealer and station exist
            await this.validateDealerStation(dto.dealerId, dto.stationId);
            // Get pricing window details
            const pricingWindow = await this.getPricingWindow(dto.windowId);
            if (!pricingWindow) {
                throw new common_1.BadRequestException(`Pricing window ${dto.windowId} not found`);
            }
            // Calculate dealer margin based on window prices and volume sold
            const grossDealerMargin = await this.calculateGrossDealerMargin(dto.stationId, dto.windowId, dto.volumeSoldLitres);
            // Get active loan deductions for this dealer
            const loanDeduction = await this.calculateLoanDeduction(dto.dealerId, dto.stationId, new Date(dto.periodStart), new Date(dto.periodEnd));
            // Calculate tax deductions
            const taxDeduction = this.calculateTaxDeductions(grossDealerMargin + (dto.otherIncome || 0));
            // Calculate total deductions
            const totalDeductions = loanDeduction +
                (dto.shortageDeduction || 0) +
                (dto.damageDeduction || 0) +
                (dto.advanceDeduction || 0) +
                taxDeduction +
                (dto.otherDeductions || 0);
            // Calculate net payable
            const netPayable = grossDealerMargin + (dto.otherIncome || 0) - totalDeductions;
            // Generate settlement number
            const settlementNumber = await this.generateSettlementNumber(dto.dealerId, dto.windowId);
            const settlement = {
                settlementId: this.generateUUID(),
                settlementNumber,
                dealerId: dto.dealerId,
                stationId: dto.stationId,
                windowId: dto.windowId,
                periodStart: new Date(dto.periodStart),
                periodEnd: new Date(dto.periodEnd),
                grossDealerMargin,
                volumeSoldLitres: dto.volumeSoldLitres,
                otherIncome: dto.otherIncome || 0,
                loanDeduction,
                shortageDeduction: dto.shortageDeduction || 0,
                damageDeduction: dto.damageDeduction || 0,
                advanceDeduction: dto.advanceDeduction || 0,
                taxDeduction,
                otherDeductions: dto.otherDeductions || 0,
                totalDeductions,
                netPayable,
                status: 'DRAFT',
                approvalStatus: 'PENDING',
                paymentStatus: 'PENDING',
                createdBy: dto.createdBy,
                createdAt: new Date()
            };
            // Save settlement (mock implementation)
            const savedSettlement = await this.saveSettlement(settlement);
            // Create automated journal entries
            await this.createSettlementJournalEntries(savedSettlement);
            // Emit event for workflow automation
            this.eventEmitter.emit('dealer.settlement.created', {
                settlementId: savedSettlement.settlementId,
                dealerId: savedSettlement.dealerId,
                netPayable: savedSettlement.netPayable,
                requiresApproval: Math.abs(savedSettlement.netPayable) > 10000 // Approval threshold
            });
            this.logger.log(`Dealer settlement created: ${settlementNumber} - Net payable: GHS ${netPayable.toFixed(2)}`);
            return savedSettlement;
        }
        catch (error) {
            this.logger.error(`Failed to create dealer settlement:`, error);
            throw error;
        }
    }
    /**
     * Create a dealer loan with amortization schedule
     */
    async createDealerLoan(dto) {
        this.logger.log(`Creating dealer loan: ${dto.loanType} for dealer ${dto.dealerId}`);
        try {
            // Validate dealer creditworthiness
            await this.validateDealerCreditworthiness(dto.dealerId, dto.principalAmount);
            // Calculate end date based on tenor
            const startDate = new Date(dto.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + dto.tenorMonths);
            // Generate loan number
            const loanNumber = await this.generateLoanNumber(dto.dealerId);
            const loan = {
                loanId: this.generateUUID(),
                loanNumber,
                dealerId: dto.dealerId,
                stationId: dto.stationId,
                loanType: dto.loanType,
                principalAmount: dto.principalAmount,
                interestRate: dto.interestRate,
                tenorMonths: dto.tenorMonths,
                repaymentFrequency: dto.repaymentFrequency,
                startDate,
                endDate,
                amortizationMethod: 'EQUAL_INSTALLMENT',
                gracePeriodMonths: dto.gracePeriodMonths || 0,
                status: 'ACTIVE',
                guarantorInfo: dto.guarantorInfo,
                collateralInfo: dto.collateralInfo,
                createdBy: dto.createdBy,
                createdAt: new Date()
            };
            // Generate amortization schedule
            const schedule = this.generateAmortizationSchedule(loan);
            // Save loan and schedule (mock implementation)
            const savedLoan = await this.saveLoan(loan);
            await this.saveLoanSchedule(schedule);
            // Create initial loan disbursement journal entry
            await this.createLoanDisbursementJournalEntry(savedLoan);
            // Emit event
            this.eventEmitter.emit('dealer.loan.created', {
                loanId: savedLoan.loanId,
                dealerId: savedLoan.dealerId,
                principalAmount: savedLoan.principalAmount,
                monthlyPayment: schedule[0]?.totalAmount || 0
            });
            this.logger.log(`Dealer loan created: ${loanNumber} - Principal: GHS ${dto.principalAmount.toFixed(2)}`);
            return {
                loan: savedLoan,
                schedule
            };
        }
        catch (error) {
            this.logger.error(`Failed to create dealer loan:`, error);
            throw error;
        }
    }
    /**
     * Process settlement approval and payment
     */
    async approveAndPaySettlement(settlementId, approvedBy, paymentMethod, paymentReference) {
        this.logger.log(`Approving and processing payment for settlement: ${settlementId}`);
        try {
            // Get settlement
            const settlement = await this.getSettlementById(settlementId);
            if (!settlement) {
                throw new common_1.BadRequestException(`Settlement ${settlementId} not found`);
            }
            // Update settlement status
            settlement.approvalStatus = 'APPROVED';
            settlement.approvedBy = approvedBy;
            settlement.approvedAt = new Date();
            settlement.paymentStatus = 'COMPLETED';
            settlement.paymentDate = new Date();
            settlement.paymentReference = paymentReference || this.generatePaymentReference();
            settlement.status = 'COMPLETED';
            settlement.updatedAt = new Date();
            // Save updated settlement
            const updatedSettlement = await this.updateSettlement(settlement);
            // Create payment journal entries
            await this.createPaymentJournalEntries(updatedSettlement, paymentMethod);
            // Update loan schedule if there were loan deductions
            if (updatedSettlement.loanDeduction > 0) {
                await this.updateLoanSchedulePayments(updatedSettlement.dealerId, updatedSettlement.loanDeduction, updatedSettlement.paymentDate);
            }
            // Emit event
            this.eventEmitter.emit('dealer.settlement.paid', {
                settlementId: updatedSettlement.settlementId,
                dealerId: updatedSettlement.dealerId,
                netPayable: updatedSettlement.netPayable,
                paymentMethod,
                paymentDate: updatedSettlement.paymentDate
            });
            this.logger.log(`Settlement approved and paid: ${updatedSettlement.settlementNumber} - GHS ${updatedSettlement.netPayable.toFixed(2)}`);
            return updatedSettlement;
        }
        catch (error) {
            this.logger.error(`Failed to approve and pay settlement:`, error);
            throw error;
        }
    }
    /**
     * Get dealer performance summary
     */
    async getDealerPerformanceSummary(dealerId, stationId, dateRange) {
        this.logger.log(`Getting performance summary for dealer: ${dealerId}`);
        try {
            // Get settlements for the dealer
            const settlements = await this.getDealerSettlements(dealerId, stationId, dateRange);
            if (settlements.length === 0) {
                return {
                    dealerId,
                    stationId: stationId || 'ALL',
                    totalSettlements: 0,
                    totalVolume: 0,
                    totalMarginEarned: 0,
                    totalDeductions: 0,
                    totalNetPayments: 0,
                    averageMarginPerLitre: 0,
                    outstandingLoanBalance: 0,
                    lastSettlementDate: new Date(),
                    performanceRating: 'NO_DATA'
                };
            }
            // Calculate summary metrics
            const totalSettlements = settlements.length;
            const totalVolume = settlements.reduce((sum, s) => sum + s.volumeSoldLitres, 0);
            const totalMarginEarned = settlements.reduce((sum, s) => sum + s.grossDealerMargin, 0);
            const totalDeductions = settlements.reduce((sum, s) => sum + s.totalDeductions, 0);
            const totalNetPayments = settlements.reduce((sum, s) => sum + s.netPayable, 0);
            const averageMarginPerLitre = totalVolume > 0 ? totalMarginEarned / totalVolume : 0;
            // Get outstanding loan balance
            const outstandingLoanBalance = await this.getOutstandingLoanBalance(dealerId, stationId);
            // Get last settlement date
            const lastSettlementDate = settlements.reduce((latest, s) => s.createdAt > latest ? s.createdAt : latest, new Date(0));
            // Calculate performance rating
            const performanceRating = this.calculatePerformanceRating({
                averageMarginPerLitre,
                settlementFrequency: totalSettlements,
                deductionRatio: totalDeductions / totalMarginEarned,
                outstandingRatio: outstandingLoanBalance / (totalMarginEarned || 1)
            });
            return {
                dealerId,
                stationId: stationId || 'ALL',
                totalSettlements,
                totalVolume,
                totalMarginEarned,
                totalDeductions,
                totalNetPayments,
                averageMarginPerLitre,
                outstandingLoanBalance,
                lastSettlementDate,
                performanceRating
            };
        }
        catch (error) {
            this.logger.error(`Failed to get dealer performance summary:`, error);
            throw error;
        }
    }
    /**
     * Generate bulk settlements for multiple dealers
     */
    async generateBulkSettlements(windowId, dealerStationPairs, createdBy) {
        this.logger.log(`Generating bulk settlements for ${dealerStationPairs.length} dealers`);
        const settlements = [];
        const errors = [];
        let totalMarginAmount = 0;
        for (const pair of dealerStationPairs) {
            try {
                const settlement = await this.createDealerSettlement({
                    dealerId: pair.dealerId,
                    stationId: pair.stationId,
                    windowId,
                    periodStart: await this.getWindowStartDate(windowId),
                    periodEnd: await this.getWindowEndDate(windowId),
                    volumeSoldLitres: pair.volumeSold,
                    createdBy
                });
                settlements.push(settlement);
                totalMarginAmount += settlement.grossDealerMargin;
            }
            catch (error) {
                errors.push({
                    dealerId: pair.dealerId,
                    stationId: pair.stationId,
                    error: error.message
                });
            }
        }
        // Emit bulk settlement event
        this.eventEmitter.emit('dealer.settlements.bulk.generated', {
            windowId,
            totalGenerated: settlements.length,
            totalMarginAmount,
            errorCount: errors.length
        });
        this.logger.log(`Bulk settlements completed: ${settlements.length} generated, ${errors.length} errors`);
        return {
            totalGenerated: settlements.length,
            totalMarginAmount,
            settlements,
            errors
        };
    }
    // Private helper methods (mock implementations)
    async validateDealerStation(dealerId, stationId) {
        // Mock implementation - would validate dealer-station relationship
    }
    async getPricingWindow(windowId) {
        // Mock implementation - would fetch pricing window
        return { windowId, startDate: new Date(), endDate: new Date() };
    }
    async calculateGrossDealerMargin(stationId, windowId, volumeSoldLitres) {
        // Mock implementation - would calculate based on station prices and volume
        // For now, using average margin of GHS 0.35 per litre for PMS
        return volumeSoldLitres * this.DEALER_MARGIN_RATES.PMS;
    }
    async calculateLoanDeduction(dealerId, stationId, periodStart, periodEnd) {
        // Mock implementation - would calculate loan installment due in period
        return 500.00; // Mock amount
    }
    calculateTaxDeductions(grossAmount) {
        // Calculate withholding tax on dealer payments
        return grossAmount * this.TAX_RATES.WITHHOLDING_TAX;
    }
    async generateSettlementNumber(dealerId, windowId) {
        return `SETT-${dealerId}-${windowId}-${Date.now()}`;
    }
    generateUUID() {
        return 'uuid-' + Math.random().toString(36).substr(2, 9);
    }
    async saveSettlement(settlement) {
        // Mock implementation - would save to database
        return settlement;
    }
    async createSettlementJournalEntries(settlement) {
        // Mock implementation - would create journal entries
        this.eventEmitter.emit('accounting.journal.create', {
            templateCode: 'DEALER_SETTLEMENT',
            settlementId: settlement.settlementId,
            amount: settlement.netPayable
        });
    }
    async validateDealerCreditworthiness(dealerId, loanAmount) {
        // Mock implementation - would check dealer credit score and limits
    }
    async generateLoanNumber(dealerId) {
        return `LOAN-${dealerId}-${Date.now()}`;
    }
    generateAmortizationSchedule(loan) {
        const schedule = [];
        const monthlyRate = loan.interestRate / 100 / 12;
        const totalPayments = loan.tenorMonths;
        // Calculate monthly payment using amortization formula
        const monthlyPayment = loan.principalAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);
        let balance = loan.principalAmount;
        const startDate = new Date(loan.startDate);
        for (let i = 1; i <= totalPayments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            const interestAmount = balance * monthlyRate;
            const principalAmount = monthlyPayment - interestAmount;
            const balanceBefore = balance;
            balance = Math.max(0, balance - principalAmount);
            schedule.push({
                scheduleId: this.generateUUID(),
                loanId: loan.loanId,
                installmentNumber: i,
                dueDate,
                principalAmount,
                interestAmount,
                totalAmount: monthlyPayment,
                balanceBefore,
                balanceAfter: balance,
                paymentStatus: 'PENDING',
                createdAt: new Date()
            });
        }
        return schedule;
    }
    async saveLoan(loan) {
        // Mock implementation - would save to database
        return loan;
    }
    async saveLoanSchedule(schedule) {
        // Mock implementation - would save schedule to database
    }
    async createLoanDisbursementJournalEntry(loan) {
        // Mock implementation - would create disbursement journal entries
    }
    async getSettlementById(settlementId) {
        // Mock implementation - would fetch from database
        return null;
    }
    async updateSettlement(settlement) {
        // Mock implementation - would update in database
        return settlement;
    }
    generatePaymentReference() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }
    async createPaymentJournalEntries(settlement, paymentMethod) {
        // Mock implementation - would create payment journal entries
    }
    async updateLoanSchedulePayments(dealerId, paymentAmount, paymentDate) {
        // Mock implementation - would update loan schedule payments
    }
    async getDealerSettlements(dealerId, stationId, dateRange) {
        // Mock implementation - would fetch settlements from database
        return [];
    }
    async getOutstandingLoanBalance(dealerId, stationId) {
        // Mock implementation - would calculate outstanding balance
        return 5000.00;
    }
    calculatePerformanceRating(metrics) {
        // Simple performance rating calculation
        let score = 0;
        if (metrics.averageMarginPerLitre >= 0.30)
            score += 25;
        if (metrics.settlementFrequency >= 12)
            score += 25; // Monthly settlements
        if (metrics.deductionRatio <= 0.10)
            score += 25; // Low deduction ratio
        if (metrics.outstandingRatio <= 0.20)
            score += 25; // Low outstanding ratio
        if (score >= 90)
            return 'EXCELLENT';
        if (score >= 75)
            return 'GOOD';
        if (score >= 60)
            return 'FAIR';
        if (score >= 40)
            return 'POOR';
        return 'VERY_POOR';
    }
    async getWindowStartDate(windowId) {
        // Mock implementation - would get window start date
        return new Date().toISOString().split('T')[0];
    }
    async getWindowEndDate(windowId) {
        // Mock implementation - would get window end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14);
        return endDate.toISOString().split('T')[0];
    }
};
exports.DealerSettlementService = DealerSettlementService;
exports.DealerSettlementService = DealerSettlementService = DealerSettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], DealerSettlementService);
//# sourceMappingURL=dealer-settlement.service.js.map