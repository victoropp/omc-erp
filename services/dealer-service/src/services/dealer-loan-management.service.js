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
var DealerLoanManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerLoanManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const dealer_loan_entity_1 = require("../entities/dealer-loan.entity");
const dealer_loan_payment_entity_1 = require("../entities/dealer-loan-payment.entity");
const uuid_1 = require("uuid");
let DealerLoanManagementService = DealerLoanManagementService_1 = class DealerLoanManagementService {
    loanRepository;
    loanPaymentRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(DealerLoanManagementService_1.name);
    constructor(loanRepository, loanPaymentRepository, dataSource, eventEmitter) {
        this.loanRepository = loanRepository;
        this.loanPaymentRepository = loanPaymentRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create a new dealer loan with amortization schedule
     * Blueprint: "Create dealer_loans (loan_id, station_id, principal, rate, tenor, repayment_freq, start_dt, amort_method)"
     */
    async createLoan(dto) {
        this.logger.log(`Creating dealer loan for dealer ${dto.dealerId}, principal: GHS ${dto.principalAmount}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Validate loan application
            await this.validateLoanApplication(dto);
            // Calculate maturity date
            const maturityDate = new Date(dto.startDate);
            maturityDate.setMonth(maturityDate.getMonth() + dto.tenorMonths);
            // Generate loan ID
            const loanId = await this.generateLoanId(dto.stationId);
            // Create loan entity
            const loan = this.loanRepository.create({
                id: (0, uuid_1.v4)(),
                loanId,
                stationId: dto.stationId,
                dealerId: dto.dealerId,
                principalAmount: dto.principalAmount,
                interestRate: dto.interestRate,
                tenorMonths: dto.tenorMonths,
                repaymentFrequency: dto.repaymentFrequency,
                startDate: dto.startDate,
                maturityDate,
                status: dealer_loan_entity_1.DealerLoanStatus.PENDING_APPROVAL,
                outstandingBalance: dto.principalAmount,
                totalPaid: 0,
                totalInterestPaid: 0,
                installmentAmount: 0, // Will be calculated with amortization
                daysPastDue: 0,
                penaltyAmount: 0,
                collateralDetails: dto.collateralDetails,
                guarantorDetails: dto.guarantorDetails,
                notes: dto.loanPurpose,
                tenantId: dto.tenantId,
                createdBy: dto.createdBy,
            });
            // Generate amortization schedule
            const amortizationSchedule = this.generateAmortizationSchedule(loan);
            // Update loan with calculated installment amount
            loan.installmentAmount = amortizationSchedule[0]?.totalAmount || 0;
            loan.amortizationSchedule = amortizationSchedule.map(entry => ({
                installmentNumber: entry.installmentNumber,
                dueDate: entry.dueDate.toISOString(),
                principalAmount: entry.principalAmount,
                interestAmount: entry.interestAmount,
                totalAmount: entry.totalAmount,
                outstandingBalance: entry.outstandingBalanceAfter,
            }));
            const savedLoan = await queryRunner.manager.save(loan);
            await queryRunner.commitTransaction();
            // Emit loan created event
            this.eventEmitter.emit('dealer.loan.created', {
                loanId: savedLoan.loanId,
                dealerId: dto.dealerId,
                stationId: dto.stationId,
                principalAmount: dto.principalAmount,
                installmentAmount: savedLoan.installmentAmount,
                tenantId: dto.tenantId,
            });
            this.logger.log(`Loan created: ${loanId}, installment: GHS ${savedLoan.installmentAmount.toFixed(2)}`);
            return { loan: savedLoan, amortizationSchedule };
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
     * Approve a loan and activate it
     */
    async approveLoan(loanId, tenantId, userId) {
        const loan = await this.loanRepository.findOne({
            where: { loanId, tenantId },
        });
        if (!loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        if (loan.status !== dealer_loan_entity_1.DealerLoanStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Loan must be in pending approval status');
        }
        loan.status = dealer_loan_entity_1.DealerLoanStatus.ACTIVE;
        loan.approvedBy = userId;
        loan.approvedAt = new Date();
        // Set next payment date based on repayment frequency
        loan.nextPaymentDate = this.calculateNextPaymentDate(loan.startDate, loan.repaymentFrequency);
        const savedLoan = await this.loanRepository.save(loan);
        // Emit loan approved event
        this.eventEmitter.emit('dealer.loan.approved', {
            loanId: savedLoan.loanId,
            dealerId: loan.dealerId,
            stationId: loan.stationId,
            approvedBy: userId,
            tenantId,
        });
        return savedLoan;
    }
    /**
     * Process loan payment
     * Blueprint: automatic loan installment deductions from dealer settlements
     */
    async processLoanPayment(dto) {
        this.logger.log(`Processing loan payment: ${dto.loanId}, amount: GHS ${dto.paymentAmount}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const loan = await this.loanRepository.findOne({
                where: { loanId: dto.loanId, tenantId: dto.tenantId },
            });
            if (!loan) {
                throw new common_1.NotFoundException('Loan not found');
            }
            if (loan.status !== dealer_loan_entity_1.DealerLoanStatus.ACTIVE) {
                throw new common_1.BadRequestException('Loan must be active to process payments');
            }
            // Create payment record
            const payment = this.loanPaymentRepository.create({
                id: (0, uuid_1.v4)(),
                loan,
                paymentAmount: dto.paymentAmount,
                paymentDate: dto.paymentDate,
                paymentMethod: dto.paymentMethod,
                paymentReference: dto.paymentReference,
                notes: dto.notes,
                tenantId: dto.tenantId,
                processedBy: dto.processedBy,
            });
            // Calculate payment allocation (principal vs interest vs penalty)
            const paymentAllocation = this.allocatePayment(loan, dto.paymentAmount);
            payment.principalAmount = paymentAllocation.principal;
            payment.interestAmount = paymentAllocation.interest;
            payment.penaltyAmount = paymentAllocation.penalty;
            // Update loan balances
            loan.outstandingBalance -= paymentAllocation.principal;
            loan.totalPaid += dto.paymentAmount;
            loan.totalInterestPaid += paymentAllocation.interest;
            loan.penaltyAmount = Math.max(0, loan.penaltyAmount - paymentAllocation.penalty);
            loan.lastPaymentDate = dto.paymentDate;
            // Update payment status and next payment date
            if (loan.outstandingBalance <= 0) {
                loan.status = dealer_loan_entity_1.DealerLoanStatus.COMPLETED;
                loan.completedAt = new Date();
                loan.nextPaymentDate = null;
            }
            else {
                loan.nextPaymentDate = this.calculateNextPaymentDate(dto.paymentDate, loan.repaymentFrequency);
            }
            // Update days past due
            loan.daysPastDue = this.calculateDaysPastDue(loan);
            const savedLoan = await queryRunner.manager.save(loan);
            const savedPayment = await queryRunner.manager.save(payment);
            // Update amortization schedule
            const updatedSchedule = this.updateAmortizationSchedule(savedLoan, savedPayment);
            savedLoan.amortizationSchedule = updatedSchedule.map(entry => ({
                installmentNumber: entry.installmentNumber,
                dueDate: entry.dueDate.toISOString(),
                principalAmount: entry.principalAmount,
                interestAmount: entry.interestAmount,
                totalAmount: entry.totalAmount,
                outstandingBalance: entry.outstandingBalanceAfter,
            }));
            await queryRunner.manager.save(savedLoan);
            await queryRunner.commitTransaction();
            // Emit payment processed event
            this.eventEmitter.emit('dealer.loan.payment.processed', {
                loanId: savedLoan.loanId,
                paymentId: savedPayment.id,
                paymentAmount: dto.paymentAmount,
                newBalance: savedLoan.outstandingBalance,
                isCompleted: savedLoan.status === dealer_loan_entity_1.DealerLoanStatus.COMPLETED,
                tenantId: dto.tenantId,
            });
            return { loan: savedLoan, payment: savedPayment, updatedSchedule };
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
     * Restructure a loan
     * Blueprint: handle loan restructuring for dealers facing cash flow stress
     */
    async restructureLoan(dto) {
        this.logger.log(`Restructuring loan: ${dto.loanId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const originalLoan = await this.loanRepository.findOne({
                where: { loanId: dto.loanId, tenantId: dto.tenantId },
            });
            if (!originalLoan) {
                throw new common_1.NotFoundException('Loan not found');
            }
            if (originalLoan.status !== dealer_loan_entity_1.DealerLoanStatus.ACTIVE) {
                throw new common_1.BadRequestException('Only active loans can be restructured');
            }
            // Mark original loan as restructured
            originalLoan.status = dealer_loan_entity_1.DealerLoanStatus.RESTRUCTURED;
            await queryRunner.manager.save(originalLoan);
            // Create new restructured loan
            const restructuredLoan = this.loanRepository.create({
                ...originalLoan,
                id: (0, uuid_1.v4)(),
                loanId: await this.generateLoanId(originalLoan.stationId, 'RESTR'),
                principalAmount: dto.newPrincipalAmount || originalLoan.outstandingBalance,
                interestRate: dto.newInterestRate || originalLoan.interestRate,
                tenorMonths: dto.newTenorMonths || originalLoan.tenorMonths,
                repaymentFrequency: dto.newRepaymentFrequency || originalLoan.repaymentFrequency,
                startDate: new Date(),
                status: dealer_loan_entity_1.DealerLoanStatus.ACTIVE,
                outstandingBalance: dto.newPrincipalAmount || originalLoan.outstandingBalance,
                totalPaid: 0,
                totalInterestPaid: 0,
                gracePeriodDays: (dto.gracePeriodMonths || 0) * 30,
                notes: `${originalLoan.notes} | RESTRUCTURED: ${dto.restructureReason}`,
                createdBy: dto.processedBy,
                createdAt: new Date(),
            });
            // Calculate new maturity date
            restructuredLoan.maturityDate = new Date(restructuredLoan.startDate);
            restructuredLoan.maturityDate.setMonth(restructuredLoan.maturityDate.getMonth() + restructuredLoan.tenorMonths);
            // Generate new amortization schedule
            const newAmortizationSchedule = this.generateAmortizationSchedule(restructuredLoan);
            restructuredLoan.installmentAmount = newAmortizationSchedule[0]?.totalAmount || 0;
            restructuredLoan.nextPaymentDate = this.calculateNextPaymentDate(restructuredLoan.startDate, restructuredLoan.repaymentFrequency);
            restructuredLoan.amortizationSchedule = newAmortizationSchedule.map(entry => ({
                installmentNumber: entry.installmentNumber,
                dueDate: entry.dueDate.toISOString(),
                principalAmount: entry.principalAmount,
                interestAmount: entry.interestAmount,
                totalAmount: entry.totalAmount,
                outstandingBalance: entry.outstandingBalanceAfter,
            }));
            const savedRestructuredLoan = await queryRunner.manager.save(restructuredLoan);
            await queryRunner.commitTransaction();
            // Emit loan restructured event
            this.eventEmitter.emit('dealer.loan.restructured', {
                originalLoanId: originalLoan.loanId,
                newLoanId: savedRestructuredLoan.loanId,
                dealerId: originalLoan.dealerId,
                stationId: originalLoan.stationId,
                reason: dto.restructureReason,
                tenantId: dto.tenantId,
            });
            return {
                originalLoan,
                restructuredLoan: savedRestructuredLoan,
                newAmortizationSchedule,
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
     * Get loan performance metrics
     * Blueprint: "Track loan balances and payment history", "Implement credit risk scoring for dealers"
     */
    async getLoanPerformanceMetrics(loanId, tenantId) {
        const loan = await this.loanRepository.findOne({
            where: { loanId, tenantId },
            relations: ['payments'],
        });
        if (!loan) {
            throw new common_1.NotFoundException('Loan not found');
        }
        const payments = await this.loanPaymentRepository.find({
            where: { loan: { loanId }, tenantId },
            order: { paymentDate: 'ASC' },
        });
        // Calculate performance metrics
        const totalDisbursed = loan.principalAmount;
        const totalPaid = loan.totalPaid;
        const outstandingBalance = loan.outstandingBalance;
        const principalPaid = totalDisbursed - outstandingBalance;
        const interestPaid = loan.totalInterestPaid;
        const penaltiesPaid = payments.reduce((sum, p) => sum + p.penaltyAmount, 0);
        // Calculate payment performance
        const totalPaymentsDue = loan.amortizationSchedule?.length || 0;
        const paymentsMade = payments.length;
        let onTimePayments = 0;
        let latePayments = 0;
        for (const payment of payments) {
            const scheduleEntry = loan.amortizationSchedule?.find(s => Math.abs(new Date(s.dueDate).getTime() - payment.paymentDate.getTime()) <= 7 * 24 * 60 * 60 * 1000 // Within 7 days
            );
            if (scheduleEntry && payment.paymentDate <= new Date(scheduleEntry.dueDate)) {
                onTimePayments++;
            }
            else {
                latePayments++;
            }
        }
        const paymentEfficiency = paymentsMade > 0 ? (onTimePayments / paymentsMade) * 100 : 0;
        // Calculate default risk
        const defaultRisk = this.calculateDefaultRisk(loan, paymentEfficiency);
        // Calculate projected maturity date based on payment history
        const projectedMaturityDate = this.calculateProjectedMaturityDate(loan);
        const currentInstallmentNumber = loan.amortizationSchedule?.findIndex(s => new Date(s.dueDate) > new Date()) + 1 || totalPaymentsDue;
        return {
            loanId: loan.loanId,
            totalDisbursed,
            totalPaid,
            outstandingBalance,
            principalPaid,
            interestPaid,
            penaltiesPaid,
            paymentsMade,
            totalPaymentsDue,
            onTimePayments,
            latePayments,
            currentInstallmentNumber,
            daysOverdue: loan.daysPastDue,
            paymentEfficiency,
            defaultRisk,
            expectedMaturityDate: loan.maturityDate,
            projectedMaturityDate,
        };
    }
    /**
     * Get active loans for a dealer/station
     */
    async getActiveLoans(stationId, tenantId, dealerId) {
        const queryBuilder = this.loanRepository.createQueryBuilder('loan')
            .where('loan.stationId = :stationId', { stationId })
            .andWhere('loan.tenantId = :tenantId', { tenantId })
            .andWhere('loan.status = :status', { status: dealer_loan_entity_1.DealerLoanStatus.ACTIVE });
        if (dealerId) {
            queryBuilder.andWhere('loan.dealerId = :dealerId', { dealerId });
        }
        return queryBuilder
            .orderBy('loan.startDate', 'ASC')
            .getMany();
    }
    /**
     * Calculate total monthly obligation for a dealer
     */
    async calculateMonthlyObligation(stationId, tenantId) {
        const activeLoans = await this.getActiveLoans(stationId, tenantId);
        let totalMonthlyInstallment = 0;
        const loanBreakdown = [];
        for (const loan of activeLoans) {
            // Convert installment to monthly equivalent
            const monthlyInstallment = this.convertToMonthlyInstallment(loan.installmentAmount, loan.repaymentFrequency);
            totalMonthlyInstallment += monthlyInstallment;
            loanBreakdown.push({
                loanId: loan.loanId,
                installmentAmount: monthlyInstallment,
                nextDueDate: loan.nextPaymentDate,
                daysOverdue: loan.daysPastDue,
            });
        }
        return { totalMonthlyInstallment, loanBreakdown };
    }
    // Private helper methods
    async validateLoanApplication(dto) {
        // Validate minimum loan amount
        if (dto.principalAmount < 1000) {
            throw new common_1.BadRequestException('Minimum loan amount is GHS 1,000');
        }
        // Validate maximum loan amount (could be based on dealer's sales history)
        if (dto.principalAmount > 100000) {
            throw new common_1.BadRequestException('Maximum loan amount is GHS 100,000');
        }
        // Validate interest rate
        if (dto.interestRate < 0 || dto.interestRate > 50) {
            throw new common_1.BadRequestException('Interest rate must be between 0% and 50%');
        }
        // Validate tenor
        if (dto.tenorMonths < 3 || dto.tenorMonths > 60) {
            throw new common_1.BadRequestException('Loan tenor must be between 3 and 60 months');
        }
        // Check for existing active loans (limit to 3 active loans per station)
        const existingLoans = await this.loanRepository.count({
            where: {
                stationId: dto.stationId,
                tenantId: dto.tenantId,
                status: dealer_loan_entity_1.DealerLoanStatus.ACTIVE,
            },
        });
        if (existingLoans >= 3) {
            throw new common_1.BadRequestException('Maximum of 3 active loans per station allowed');
        }
    }
    async generateLoanId(stationId, prefix = 'LOAN') {
        const timestamp = Date.now();
        const stationSuffix = stationId.slice(-4);
        return `${prefix}-${stationSuffix}-${timestamp}`;
    }
    generateAmortizationSchedule(loan) {
        const schedule = [];
        const monthlyRate = loan.interestRate / 100 / 12;
        const totalPayments = loan.tenorMonths;
        // Calculate installment amount based on repayment frequency
        const paymentsPerYear = this.getPaymentsPerYear(loan.repaymentFrequency);
        const periodicRate = loan.interestRate / 100 / paymentsPerYear;
        const totalPeriodicPayments = loan.tenorMonths * paymentsPerYear / 12;
        // Calculate periodic payment using amortization formula
        const periodicPayment = loan.principalAmount *
            (periodicRate * Math.pow(1 + periodicRate, totalPeriodicPayments)) /
            (Math.pow(1 + periodicRate, totalPeriodicPayments) - 1);
        let balance = loan.principalAmount;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;
        const startDate = new Date(loan.startDate);
        for (let i = 1; i <= totalPeriodicPayments; i++) {
            const dueDate = this.calculatePaymentDueDate(startDate, loan.repaymentFrequency, i);
            const interestAmount = balance * periodicRate;
            const principalAmount = Math.min(periodicPayment - interestAmount, balance);
            const balanceBefore = balance;
            balance = Math.max(0, balance - principalAmount);
            cumulativePrincipal += principalAmount;
            cumulativeInterest += interestAmount;
            schedule.push({
                installmentNumber: i,
                dueDate,
                principalAmount,
                interestAmount,
                totalAmount: principalAmount + interestAmount,
                outstandingBalanceBefore: balanceBefore,
                outstandingBalanceAfter: balance,
                cumulativePrincipal,
                cumulativeInterest,
                isPaid: false,
            });
            if (balance <= 0)
                break;
        }
        return schedule;
    }
    getPaymentsPerYear(frequency) {
        switch (frequency) {
            case dealer_loan_entity_1.RepaymentFrequency.DAILY: return 365;
            case dealer_loan_entity_1.RepaymentFrequency.WEEKLY: return 52;
            case dealer_loan_entity_1.RepaymentFrequency.BI_WEEKLY: return 26;
            case dealer_loan_entity_1.RepaymentFrequency.MONTHLY: return 12;
            default: return 12;
        }
    }
    calculatePaymentDueDate(startDate, frequency, installmentNumber) {
        const dueDate = new Date(startDate);
        switch (frequency) {
            case dealer_loan_entity_1.RepaymentFrequency.DAILY:
                dueDate.setDate(dueDate.getDate() + installmentNumber);
                break;
            case dealer_loan_entity_1.RepaymentFrequency.WEEKLY:
                dueDate.setDate(dueDate.getDate() + (installmentNumber * 7));
                break;
            case dealer_loan_entity_1.RepaymentFrequency.BI_WEEKLY:
                dueDate.setDate(dueDate.getDate() + (installmentNumber * 14));
                break;
            case dealer_loan_entity_1.RepaymentFrequency.MONTHLY:
                dueDate.setMonth(dueDate.getMonth() + installmentNumber);
                break;
        }
        return dueDate;
    }
    calculateNextPaymentDate(fromDate, frequency) {
        return this.calculatePaymentDueDate(fromDate, frequency, 1);
    }
    allocatePayment(loan, paymentAmount) {
        let remainingPayment = paymentAmount;
        // First, pay penalties
        const penalty = Math.min(remainingPayment, loan.penaltyAmount);
        remainingPayment -= penalty;
        // Then, pay interest (current period interest)
        const monthlyRate = loan.interestRate / 100 / 12;
        const currentInterest = loan.outstandingBalance * monthlyRate;
        const interest = Math.min(remainingPayment, currentInterest);
        remainingPayment -= interest;
        // Finally, pay principal
        const principal = Math.min(remainingPayment, loan.outstandingBalance);
        return { penalty, interest, principal };
    }
    updateAmortizationSchedule(loan, payment) {
        // This would update the amortization schedule based on the payment
        // For now, return the current schedule (simplified)
        return loan.amortizationSchedule?.map(entry => ({
            installmentNumber: entry.installmentNumber,
            dueDate: new Date(entry.dueDate),
            principalAmount: entry.principalAmount,
            interestAmount: entry.interestAmount,
            totalAmount: entry.totalAmount,
            outstandingBalanceBefore: entry.outstandingBalance,
            outstandingBalanceAfter: entry.outstandingBalance,
            cumulativePrincipal: 0,
            cumulativeInterest: 0,
            isPaid: false,
        })) || [];
    }
    calculateDaysPastDue(loan) {
        if (!loan.nextPaymentDate || loan.status !== dealer_loan_entity_1.DealerLoanStatus.ACTIVE) {
            return 0;
        }
        const today = new Date();
        const dueDate = new Date(loan.nextPaymentDate);
        if (today <= dueDate) {
            return 0;
        }
        return Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
    }
    calculateDefaultRisk(loan, paymentEfficiency) {
        let riskScore = 0;
        // Days overdue factor
        if (loan.daysPastDue > 90)
            riskScore += 40;
        else if (loan.daysPastDue > 30)
            riskScore += 20;
        else if (loan.daysPastDue > 7)
            riskScore += 10;
        // Payment efficiency factor
        if (paymentEfficiency < 50)
            riskScore += 30;
        else if (paymentEfficiency < 70)
            riskScore += 20;
        else if (paymentEfficiency < 85)
            riskScore += 10;
        // Outstanding balance factor (high balance = higher risk)
        const balanceRatio = loan.outstandingBalance / loan.principalAmount;
        if (balanceRatio > 0.8)
            riskScore += 15;
        else if (balanceRatio > 0.6)
            riskScore += 10;
        else if (balanceRatio > 0.4)
            riskScore += 5;
        // Penalty amount factor
        if (loan.penaltyAmount > loan.installmentAmount)
            riskScore += 15;
        else if (loan.penaltyAmount > 0)
            riskScore += 10;
        if (riskScore >= 70)
            return 'CRITICAL';
        if (riskScore >= 45)
            return 'HIGH';
        if (riskScore >= 25)
            return 'MEDIUM';
        return 'LOW';
    }
    calculateProjectedMaturityDate(loan) {
        // Simple projection based on current payment rate
        // In reality, this would use more sophisticated models
        const monthlyRate = loan.interestRate / 100 / 12;
        const remainingBalance = loan.outstandingBalance;
        const avgMonthlyPayment = loan.totalPaid / Math.max(1, this.monthsSinceStart(loan));
        if (avgMonthlyPayment <= remainingBalance * monthlyRate) {
            // Payment doesn't even cover interest - loan will never be paid off at current rate
            const projectedDate = new Date(loan.maturityDate);
            projectedDate.setFullYear(projectedDate.getFullYear() + 10); // Add 10 years
            return projectedDate;
        }
        // Calculate months needed to pay off remaining balance
        const monthsNeeded = Math.log(1 + (remainingBalance * monthlyRate) / (avgMonthlyPayment - remainingBalance * monthlyRate)) / Math.log(1 + monthlyRate);
        const projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsNeeded));
        return projectedDate;
    }
    monthsSinceStart(loan) {
        const now = new Date();
        const start = new Date(loan.startDate);
        return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    }
    convertToMonthlyInstallment(installmentAmount, frequency) {
        switch (frequency) {
            case dealer_loan_entity_1.RepaymentFrequency.DAILY: return installmentAmount * 30;
            case dealer_loan_entity_1.RepaymentFrequency.WEEKLY: return installmentAmount * 4.33;
            case dealer_loan_entity_1.RepaymentFrequency.BI_WEEKLY: return installmentAmount * 2.17;
            case dealer_loan_entity_1.RepaymentFrequency.MONTHLY: return installmentAmount;
            default: return installmentAmount;
        }
    }
    /**
     * Scheduled task to calculate penalties for overdue loans
     */
    async calculateOverduePenalties() {
        this.logger.log('Calculating penalties for overdue loans');
        try {
            const overdueLoans = await this.loanRepository.find({
                where: {
                    status: dealer_loan_entity_1.DealerLoanStatus.ACTIVE,
                    nextPaymentDate: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
            });
            for (const loan of overdueLoans) {
                const daysPastDue = this.calculateDaysPastDue(loan);
                if (daysPastDue > loan.gracePeriodDays) {
                    // Calculate penalty
                    const penaltyAmount = loan.installmentAmount * loan.penaltyRate * Math.floor(daysPastDue / 30);
                    loan.penaltyAmount += penaltyAmount;
                    loan.daysPastDue = daysPastDue;
                    await this.loanRepository.save(loan);
                    this.eventEmitter.emit('dealer.loan.penalty.calculated', {
                        loanId: loan.loanId,
                        penaltyAmount,
                        totalPenalty: loan.penaltyAmount,
                        daysPastDue,
                        tenantId: loan.tenantId,
                    });
                }
            }
            this.logger.log(`Processed penalties for ${overdueLoans.length} overdue loans`);
        }
        catch (error) {
            this.logger.error('Failed to calculate overdue penalties:', error);
        }
    }
};
exports.DealerLoanManagementService = DealerLoanManagementService;
__decorate([
    (0, schedule_1.Cron)('0 1 * * *') // Daily at 1 AM
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DealerLoanManagementService.prototype, "calculateOverduePenalties", null);
exports.DealerLoanManagementService = DealerLoanManagementService = DealerLoanManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_loan_entity_1.DealerLoan)),
    __param(1, (0, typeorm_1.InjectRepository)(dealer_loan_payment_entity_1.DealerLoanPayment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], DealerLoanManagementService);
//# sourceMappingURL=dealer-loan-management.service.js.map