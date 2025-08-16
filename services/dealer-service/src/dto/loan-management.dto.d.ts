import { RepaymentFrequency, AmortizationMethod } from '../entities/dealer-loan.entity';
export declare class LoanCollateralDto {
    type: string;
    description: string;
    estimatedValue: number;
    location: string;
    documentReferences?: string[];
}
export declare class LoanGuarantorDto {
    fullName: string;
    nationalId: string;
    phoneNumber: string;
    address: string;
    relationship: string;
    occupation: string;
    monthlyIncome: number;
    netWorth?: number;
}
export declare class CreateLoanApplicationDto {
    stationId: string;
    dealerId: string;
    requestedAmount: number;
    purpose: string;
    requestedTenorMonths: number;
    preferredRepaymentFrequency: RepaymentFrequency;
    expectedMonthlyRevenue: number;
    currentMonthlyExpenses: number;
    otherDebtObligations?: number;
    collateral?: LoanCollateralDto[];
    guarantors?: LoanGuarantorDto[];
    notes?: string;
}
export declare class LoanTermsDto {
    approvedAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: RepaymentFrequency;
    amortizationMethod: AmortizationMethod;
    installmentAmount: number;
    processingFee?: number;
    penaltyRate?: number;
    gracePeriodDays?: number;
}
export declare class ApproveLoanDto {
    loanTerms: LoanTermsDto;
    approvalNotes: string;
    conditions?: string[];
}
export declare class DisburseLoanDto {
    disbursementAmount: number;
    disbursementMethod: string;
    bankAccountDetails?: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        bankCode: string;
    };
    expectedDisbursementDate: string;
    notes?: string;
}
export declare class LoanPaymentDto {
    amount: number;
    paymentMethod: string;
    transactionReference: string;
    paymentDate: string;
    notes?: string;
}
export declare class LoanRestructureDto {
    newTenorMonths: number;
    newInterestRate?: number;
    newRepaymentFrequency?: RepaymentFrequency;
    moratoriumMonths?: number;
    restructureReason: string;
    additionalTerms?: string[];
}
export declare class AmortizationScheduleEntryDto {
    installmentNumber: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    outstandingBalance: number;
    paymentStatus: string;
    actualPaymentDate?: Date;
}
export declare class LoanResponseDto {
    id: string;
    loanId: string;
    stationId: string;
    dealerId: string;
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: RepaymentFrequency;
    status: string;
    outstandingBalance: number;
    totalPaid: number;
    nextPaymentDate: Date;
    installmentAmount: number;
    daysPastDue: number;
    amortizationSchedule: AmortizationScheduleEntryDto[];
    createdAt: Date;
}
//# sourceMappingURL=loan-management.dto.d.ts.map