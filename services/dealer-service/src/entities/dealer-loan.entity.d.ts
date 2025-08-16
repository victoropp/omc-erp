import { DealerLoanPayment } from './dealer-loan-payment.entity';
export declare enum DealerLoanStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted",
    RESTRUCTURED = "restructured",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled"
}
export declare enum RepaymentFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    MONTHLY = "monthly"
}
export declare enum AmortizationMethod {
    REDUCING_BALANCE = "reducing_balance",
    FLAT_RATE = "flat_rate",
    INTEREST_ONLY = "interest_only"
}
export declare class DealerLoan {
    id: string;
    loanId: string;
    stationId: string;
    dealerId: string;
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: RepaymentFrequency;
    amortizationMethod: AmortizationMethod;
    startDate: Date;
    maturityDate: Date;
    status: DealerLoanStatus;
    outstandingBalance: number;
    totalPaid: number;
    totalInterestPaid: number;
    lastPaymentDate: Date;
    nextPaymentDate: Date;
    installmentAmount: number;
    daysPastDue: number;
    penaltyAmount: number;
    penaltyRate: number;
    gracePeriodDays: number;
    loanAgreementDocId: string;
    collateralDetails: Record<string, any>;
    guarantorDetails: Record<string, any>;
    amortizationSchedule: Array<{
        installmentNumber: number;
        dueDate: string;
        principalAmount: number;
        interestAmount: number;
        totalAmount: number;
        outstandingBalance: number;
    }>;
    autoDeductionEnabled: boolean;
    maxDeductionPercentage: number;
    notes: string;
    tenantId: string;
    createdBy: string;
    approvedBy: string;
    approvedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    payments: DealerLoanPayment[];
    get isOverdue(): boolean;
    get totalAmountDue(): number;
    get paymentsRemaining(): number;
}
//# sourceMappingURL=dealer-loan.entity.d.ts.map