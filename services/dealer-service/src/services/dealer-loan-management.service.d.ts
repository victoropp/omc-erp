import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerLoan, RepaymentFrequency } from '../entities/dealer-loan.entity';
import { DealerLoanPayment } from '../entities/dealer-loan-payment.entity';
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
    paymentEfficiency: number;
    defaultRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    expectedMaturityDate: Date;
    projectedMaturityDate: Date;
}
export declare class DealerLoanManagementService {
    private readonly loanRepository;
    private readonly loanPaymentRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(loanRepository: Repository<DealerLoan>, loanPaymentRepository: Repository<DealerLoanPayment>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Create a new dealer loan with amortization schedule
     * Blueprint: "Create dealer_loans (loan_id, station_id, principal, rate, tenor, repayment_freq, start_dt, amort_method)"
     */
    createLoan(dto: LoanApplicationDto): Promise<{
        loan: DealerLoan;
        amortizationSchedule: AmortizationScheduleEntry[];
    }>;
    /**
     * Approve a loan and activate it
     */
    approveLoan(loanId: string, tenantId: string, userId?: string): Promise<DealerLoan>;
    /**
     * Process loan payment
     * Blueprint: automatic loan installment deductions from dealer settlements
     */
    processLoanPayment(dto: LoanPaymentDto): Promise<{
        loan: DealerLoan;
        payment: DealerLoanPayment;
        updatedSchedule: AmortizationScheduleEntry[];
    }>;
    /**
     * Restructure a loan
     * Blueprint: handle loan restructuring for dealers facing cash flow stress
     */
    restructureLoan(dto: LoanRestructureDto): Promise<{
        originalLoan: DealerLoan;
        restructuredLoan: DealerLoan;
        newAmortizationSchedule: AmortizationScheduleEntry[];
    }>;
    /**
     * Get loan performance metrics
     * Blueprint: "Track loan balances and payment history", "Implement credit risk scoring for dealers"
     */
    getLoanPerformanceMetrics(loanId: string, tenantId: string): Promise<LoanPerformanceMetrics>;
    /**
     * Get active loans for a dealer/station
     */
    getActiveLoans(stationId: string, tenantId: string, dealerId?: string): Promise<DealerLoan[]>;
    /**
     * Calculate total monthly obligation for a dealer
     */
    calculateMonthlyObligation(stationId: string, tenantId: string): Promise<{
        totalMonthlyInstallment: number;
        loanBreakdown: Array<{
            loanId: string;
            installmentAmount: number;
            nextDueDate: Date;
            daysOverdue: number;
        }>;
    }>;
    private validateLoanApplication;
    private generateLoanId;
    private generateAmortizationSchedule;
    private getPaymentsPerYear;
    private calculatePaymentDueDate;
    private calculateNextPaymentDate;
    private allocatePayment;
    private updateAmortizationSchedule;
    private calculateDaysPastDue;
    private calculateDefaultRisk;
    private calculateProjectedMaturityDate;
    private monthsSinceStart;
    private convertToMonthlyInstallment;
    /**
     * Scheduled task to calculate penalties for overdue loans
     */
    calculateOverduePenalties(): Promise<void>;
}
//# sourceMappingURL=dealer-loan-management.service.d.ts.map