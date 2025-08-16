import { DealerLoan } from './dealer-loan.entity';
export declare enum PaymentType {
    REGULAR = "regular",
    EARLY = "early",
    PARTIAL = "partial",
    PENALTY = "penalty",
    SETTLEMENT_DEDUCTION = "settlement_deduction",
    MANUAL = "manual"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REVERSED = "reversed"
}
export declare class DealerLoanPayment {
    id: string;
    paymentReference: string;
    loanId: string;
    paymentDate: Date;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    penaltyAmount: number;
    totalAmount: number;
    outstandingBalanceAfter: number;
    paymentType: PaymentType;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    transactionReference: string;
    settlementId: string;
    daysLate: number;
    earlyPaymentDiscount: number;
    notes: string;
    tenantId: string;
    processedBy: string;
    reversalReason: string;
    originalPaymentId: string;
    createdAt: Date;
    loan: DealerLoan;
    get isLatePayment(): boolean;
    get isEarlyPayment(): boolean;
}
//# sourceMappingURL=dealer-loan-payment.entity.d.ts.map