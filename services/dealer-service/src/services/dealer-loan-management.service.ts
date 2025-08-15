import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  DealerLoan, 
  DealerLoanStatus, 
  RepaymentFrequency, 
  AmortizationMethod 
} from '../entities/dealer-loan.entity';
import { DealerLoanPayment } from '../entities/dealer-loan-payment.entity';
import { v4 as uuidv4 } from 'uuid';

export interface LoanApplicationDto {
  dealerId: string;
  stationId: string;
  principalAmount: number;
  interestRate: number;
  tenorMonths: number;
  repaymentFrequency: RepaymentFrequency;
  startDate: Date;
  loanPurpose: string;
  collateralDetails?: any;
  guarantorDetails?: any;
  tenantId: string;
  createdBy: string;
}

export interface AmortizationScheduleEntry {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  outstandingBalanceBefore: number;
  outstandingBalanceAfter: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: Date;
  daysOverdue?: number;
  penaltyAmount?: number;
}

export interface LoanPaymentDto {
  loanId: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentReference: string;
  notes?: string;
  tenantId: string;
  processedBy: string;
}

export interface LoanRestructureDto {
  loanId: string;
  newPrincipalAmount?: number;
  newInterestRate?: number;
  newTenorMonths?: number;
  newRepaymentFrequency?: RepaymentFrequency;
  gracePeriodMonths?: number;
  restructureReason: string;
  tenantId: string;
  processedBy: string;
}

export interface LoanPerformanceMetrics {
  loanId: string;
  totalDisbursed: number;
  totalPaid: number;
  outstandingBalance: number;
  principalPaid: number;
  interestPaid: number;
  penaltiesPaid: number;
  paymentsMade: number;
  totalPaymentsDue: number;
  onTimePayments: number;
  latePayments: number;
  currentInstallmentNumber: number;
  daysOverdue: number;
  paymentEfficiency: number; // Percentage of on-time payments
  defaultRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedMaturityDate: Date;
  projectedMaturityDate: Date;
}

@Injectable()
export class DealerLoanManagementService {
  private readonly logger = new Logger(DealerLoanManagementService.name);

  constructor(
    @InjectRepository(DealerLoan)
    private readonly loanRepository: Repository<DealerLoan>,
    @InjectRepository(DealerLoanPayment)
    private readonly loanPaymentRepository: Repository<DealerLoanPayment>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new dealer loan with amortization schedule
   * Blueprint: "Create dealer_loans (loan_id, station_id, principal, rate, tenor, repayment_freq, start_dt, amort_method)"
   */
  async createLoan(dto: LoanApplicationDto): Promise<{
    loan: DealerLoan;
    amortizationSchedule: AmortizationScheduleEntry[];
  }> {
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
        id: uuidv4(),
        loanId,
        stationId: dto.stationId,
        dealerId: dto.dealerId,
        principalAmount: dto.principalAmount,
        interestRate: dto.interestRate,
        tenorMonths: dto.tenorMonths,
        repaymentFrequency: dto.repaymentFrequency,
        startDate: dto.startDate,
        maturityDate,
        status: DealerLoanStatus.PENDING_APPROVAL,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Approve a loan and activate it
   */
  async approveLoan(
    loanId: string,
    tenantId: string,
    userId?: string,
  ): Promise<DealerLoan> {
    const loan = await this.loanRepository.findOne({
      where: { loanId, tenantId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== DealerLoanStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Loan must be in pending approval status');
    }

    loan.status = DealerLoanStatus.ACTIVE;
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
  async processLoanPayment(dto: LoanPaymentDto): Promise<{
    loan: DealerLoan;
    payment: DealerLoanPayment;
    updatedSchedule: AmortizationScheduleEntry[];
  }> {
    this.logger.log(`Processing loan payment: ${dto.loanId}, amount: GHS ${dto.paymentAmount}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loan = await this.loanRepository.findOne({
        where: { loanId: dto.loanId, tenantId: dto.tenantId },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.status !== DealerLoanStatus.ACTIVE) {
        throw new BadRequestException('Loan must be active to process payments');
      }

      // Create payment record
      const payment = this.loanPaymentRepository.create({
        id: uuidv4(),
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
        loan.status = DealerLoanStatus.COMPLETED;
        loan.completedAt = new Date();
        loan.nextPaymentDate = null;
      } else {
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
        isCompleted: savedLoan.status === DealerLoanStatus.COMPLETED,
        tenantId: dto.tenantId,
      });

      return { loan: savedLoan, payment: savedPayment, updatedSchedule };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Restructure a loan
   * Blueprint: handle loan restructuring for dealers facing cash flow stress
   */
  async restructureLoan(dto: LoanRestructureDto): Promise<{
    originalLoan: DealerLoan;
    restructuredLoan: DealerLoan;
    newAmortizationSchedule: AmortizationScheduleEntry[];
  }> {
    this.logger.log(`Restructuring loan: ${dto.loanId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const originalLoan = await this.loanRepository.findOne({
        where: { loanId: dto.loanId, tenantId: dto.tenantId },
      });

      if (!originalLoan) {
        throw new NotFoundException('Loan not found');
      }

      if (originalLoan.status !== DealerLoanStatus.ACTIVE) {
        throw new BadRequestException('Only active loans can be restructured');
      }

      // Mark original loan as restructured
      originalLoan.status = DealerLoanStatus.RESTRUCTURED;
      await queryRunner.manager.save(originalLoan);

      // Create new restructured loan
      const restructuredLoan = this.loanRepository.create({
        ...originalLoan,
        id: uuidv4(),
        loanId: await this.generateLoanId(originalLoan.stationId, 'RESTR'),
        principalAmount: dto.newPrincipalAmount || originalLoan.outstandingBalance,
        interestRate: dto.newInterestRate || originalLoan.interestRate,
        tenorMonths: dto.newTenorMonths || originalLoan.tenorMonths,
        repaymentFrequency: dto.newRepaymentFrequency || originalLoan.repaymentFrequency,
        startDate: new Date(),
        status: DealerLoanStatus.ACTIVE,
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
      restructuredLoan.nextPaymentDate = this.calculateNextPaymentDate(
        restructuredLoan.startDate, 
        restructuredLoan.repaymentFrequency
      );
      
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get loan performance metrics
   * Blueprint: "Track loan balances and payment history", "Implement credit risk scoring for dealers"
   */
  async getLoanPerformanceMetrics(
    loanId: string,
    tenantId: string,
  ): Promise<LoanPerformanceMetrics> {
    const loan = await this.loanRepository.findOne({
      where: { loanId, tenantId },
      relations: ['payments'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
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
      const scheduleEntry = loan.amortizationSchedule?.find(s => 
        Math.abs(new Date(s.dueDate).getTime() - payment.paymentDate.getTime()) <= 7 * 24 * 60 * 60 * 1000 // Within 7 days
      );
      
      if (scheduleEntry && payment.paymentDate <= new Date(scheduleEntry.dueDate)) {
        onTimePayments++;
      } else {
        latePayments++;
      }
    }

    const paymentEfficiency = paymentsMade > 0 ? (onTimePayments / paymentsMade) * 100 : 0;
    
    // Calculate default risk
    const defaultRisk = this.calculateDefaultRisk(loan, paymentEfficiency);

    // Calculate projected maturity date based on payment history
    const projectedMaturityDate = this.calculateProjectedMaturityDate(loan);

    const currentInstallmentNumber = loan.amortizationSchedule?.findIndex(s => 
      new Date(s.dueDate) > new Date()
    ) + 1 || totalPaymentsDue;

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
  async getActiveLoans(
    stationId: string,
    tenantId: string,
    dealerId?: string,
  ): Promise<DealerLoan[]> {
    const queryBuilder = this.loanRepository.createQueryBuilder('loan')
      .where('loan.stationId = :stationId', { stationId })
      .andWhere('loan.tenantId = :tenantId', { tenantId })
      .andWhere('loan.status = :status', { status: DealerLoanStatus.ACTIVE });

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
  async calculateMonthlyObligation(
    stationId: string,
    tenantId: string,
  ): Promise<{
    totalMonthlyInstallment: number;
    loanBreakdown: Array<{
      loanId: string;
      installmentAmount: number;
      nextDueDate: Date;
      daysOverdue: number;
    }>;
  }> {
    const activeLoans = await this.getActiveLoans(stationId, tenantId);
    
    let totalMonthlyInstallment = 0;
    const loanBreakdown = [];

    for (const loan of activeLoans) {
      // Convert installment to monthly equivalent
      const monthlyInstallment = this.convertToMonthlyInstallment(
        loan.installmentAmount,
        loan.repaymentFrequency
      );
      
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

  private async validateLoanApplication(dto: LoanApplicationDto): Promise<void> {
    // Validate minimum loan amount
    if (dto.principalAmount < 1000) {
      throw new BadRequestException('Minimum loan amount is GHS 1,000');
    }

    // Validate maximum loan amount (could be based on dealer's sales history)
    if (dto.principalAmount > 100000) {
      throw new BadRequestException('Maximum loan amount is GHS 100,000');
    }

    // Validate interest rate
    if (dto.interestRate < 0 || dto.interestRate > 50) {
      throw new BadRequestException('Interest rate must be between 0% and 50%');
    }

    // Validate tenor
    if (dto.tenorMonths < 3 || dto.tenorMonths > 60) {
      throw new BadRequestException('Loan tenor must be between 3 and 60 months');
    }

    // Check for existing active loans (limit to 3 active loans per station)
    const existingLoans = await this.loanRepository.count({
      where: {
        stationId: dto.stationId,
        tenantId: dto.tenantId,
        status: DealerLoanStatus.ACTIVE,
      },
    });

    if (existingLoans >= 3) {
      throw new BadRequestException('Maximum of 3 active loans per station allowed');
    }
  }

  private async generateLoanId(stationId: string, prefix: string = 'LOAN'): Promise<string> {
    const timestamp = Date.now();
    const stationSuffix = stationId.slice(-4);
    return `${prefix}-${stationSuffix}-${timestamp}`;
  }

  private generateAmortizationSchedule(loan: DealerLoan): AmortizationScheduleEntry[] {
    const schedule: AmortizationScheduleEntry[] = [];
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

      if (balance <= 0) break;
    }

    return schedule;
  }

  private getPaymentsPerYear(frequency: RepaymentFrequency): number {
    switch (frequency) {
      case RepaymentFrequency.DAILY: return 365;
      case RepaymentFrequency.WEEKLY: return 52;
      case RepaymentFrequency.BI_WEEKLY: return 26;
      case RepaymentFrequency.MONTHLY: return 12;
      default: return 12;
    }
  }

  private calculatePaymentDueDate(startDate: Date, frequency: RepaymentFrequency, installmentNumber: number): Date {
    const dueDate = new Date(startDate);
    
    switch (frequency) {
      case RepaymentFrequency.DAILY:
        dueDate.setDate(dueDate.getDate() + installmentNumber);
        break;
      case RepaymentFrequency.WEEKLY:
        dueDate.setDate(dueDate.getDate() + (installmentNumber * 7));
        break;
      case RepaymentFrequency.BI_WEEKLY:
        dueDate.setDate(dueDate.getDate() + (installmentNumber * 14));
        break;
      case RepaymentFrequency.MONTHLY:
        dueDate.setMonth(dueDate.getMonth() + installmentNumber);
        break;
    }
    
    return dueDate;
  }

  private calculateNextPaymentDate(fromDate: Date, frequency: RepaymentFrequency): Date {
    return this.calculatePaymentDueDate(fromDate, frequency, 1);
  }

  private allocatePayment(loan: DealerLoan, paymentAmount: number): {
    penalty: number;
    interest: number;
    principal: number;
  } {
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

  private updateAmortizationSchedule(loan: DealerLoan, payment: DealerLoanPayment): AmortizationScheduleEntry[] {
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

  private calculateDaysPastDue(loan: DealerLoan): number {
    if (!loan.nextPaymentDate || loan.status !== DealerLoanStatus.ACTIVE) {
      return 0;
    }
    
    const today = new Date();
    const dueDate = new Date(loan.nextPaymentDate);
    
    if (today <= dueDate) {
      return 0;
    }
    
    return Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  private calculateDefaultRisk(loan: DealerLoan, paymentEfficiency: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let riskScore = 0;
    
    // Days overdue factor
    if (loan.daysPastDue > 90) riskScore += 40;
    else if (loan.daysPastDue > 30) riskScore += 20;
    else if (loan.daysPastDue > 7) riskScore += 10;
    
    // Payment efficiency factor
    if (paymentEfficiency < 50) riskScore += 30;
    else if (paymentEfficiency < 70) riskScore += 20;
    else if (paymentEfficiency < 85) riskScore += 10;
    
    // Outstanding balance factor (high balance = higher risk)
    const balanceRatio = loan.outstandingBalance / loan.principalAmount;
    if (balanceRatio > 0.8) riskScore += 15;
    else if (balanceRatio > 0.6) riskScore += 10;
    else if (balanceRatio > 0.4) riskScore += 5;
    
    // Penalty amount factor
    if (loan.penaltyAmount > loan.installmentAmount) riskScore += 15;
    else if (loan.penaltyAmount > 0) riskScore += 10;
    
    if (riskScore >= 70) return 'CRITICAL';
    if (riskScore >= 45) return 'HIGH';
    if (riskScore >= 25) return 'MEDIUM';
    return 'LOW';
  }

  private calculateProjectedMaturityDate(loan: DealerLoan): Date {
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

  private monthsSinceStart(loan: DealerLoan): number {
    const now = new Date();
    const start = new Date(loan.startDate);
    return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  }

  private convertToMonthlyInstallment(installmentAmount: number, frequency: RepaymentFrequency): number {
    switch (frequency) {
      case RepaymentFrequency.DAILY: return installmentAmount * 30;
      case RepaymentFrequency.WEEKLY: return installmentAmount * 4.33;
      case RepaymentFrequency.BI_WEEKLY: return installmentAmount * 2.17;
      case RepaymentFrequency.MONTHLY: return installmentAmount;
      default: return installmentAmount;
    }
  }

  /**
   * Scheduled task to calculate penalties for overdue loans
   */
  @Cron('0 1 * * *') // Daily at 1 AM
  async calculateOverduePenalties(): Promise<void> {
    this.logger.log('Calculating penalties for overdue loans');
    
    try {
      const overdueLoans = await this.loanRepository.find({
        where: {
          status: DealerLoanStatus.ACTIVE,
          nextPaymentDate: LessThanOrEqual(new Date()),
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
      
    } catch (error) {
      this.logger.error('Failed to calculate overdue penalties:', error);
    }
  }
}