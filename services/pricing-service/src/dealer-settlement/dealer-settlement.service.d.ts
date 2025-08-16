import { EventEmitter2 } from '@nestjs/event-emitter';
interface DealerSettlement {
    settlementId: string;
    settlementNumber: string;
    dealerId: string;
    stationId: string;
    windowId: string;
    periodStart: Date;
    periodEnd: Date;
    grossDealerMargin: number;
    volumeSoldLitres: number;
    otherIncome: number;
    loanDeduction: number;
    shortageDeduction: number;
    damageDeduction: number;
    advanceDeduction: number;
    taxDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    netPayable: number;
    status: string;
    approvalStatus?: string;
    approvedBy?: string;
    approvedAt?: Date;
    paymentStatus: string;
    paymentDate?: Date;
    paymentReference?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
}
interface DealerLoan {
    loanId: string;
    loanNumber: string;
    dealerId: string;
    stationId: string;
    loanType: string;
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: string;
    startDate: Date;
    endDate: Date;
    amortizationMethod: string;
    gracePeriodMonths: number;
    status: string;
    guarantorInfo?: any;
    collateralInfo?: any;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
}
interface LoanSchedule {
    scheduleId: string;
    loanId: string;
    installmentNumber: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    balanceBefore: number;
    balanceAfter: number;
    paymentStatus: string;
    paymentDate?: Date;
    paymentAmount?: number;
    createdAt: Date;
}
export interface CreateDealerSettlementDto {
    dealerId: string;
    stationId: string;
    windowId: string;
    periodStart: string;
    periodEnd: string;
    volumeSoldLitres: number;
    otherIncome?: number;
    shortageDeduction?: number;
    damageDeduction?: number;
    advanceDeduction?: number;
    otherDeductions?: number;
    createdBy: string;
}
export interface DealerLoanCreateDto {
    dealerId: string;
    stationId: string;
    loanType: 'WORKING_CAPITAL' | 'EQUIPMENT' | 'INFRASTRUCTURE' | 'OTHER';
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
    startDate: string;
    gracePeriodMonths?: number;
    guarantorInfo?: any;
    collateralInfo?: any;
    createdBy: string;
}
export interface SettlementSummary {
    dealerId: string;
    stationId: string;
    totalSettlements: number;
    totalVolume: number;
    totalMarginEarned: number;
    totalDeductions: number;
    totalNetPayments: number;
    averageMarginPerLitre: number;
    outstandingLoanBalance: number;
    lastSettlementDate: Date;
    performanceRating: string;
}
export declare class DealerSettlementService {
    private readonly eventEmitter;
    private readonly logger;
    private readonly DEALER_MARGIN_RATES;
    private readonly TAX_RATES;
    constructor(eventEmitter: EventEmitter2);
    /**
     * Create a new dealer settlement for a pricing window
     */
    createDealerSettlement(dto: CreateDealerSettlementDto): Promise<DealerSettlement>;
    /**
     * Create a dealer loan with amortization schedule
     */
    createDealerLoan(dto: DealerLoanCreateDto): Promise<{
        loan: DealerLoan;
        schedule: LoanSchedule[];
    }>;
    /**
     * Process settlement approval and payment
     */
    approveAndPaySettlement(settlementId: string, approvedBy: string, paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK', paymentReference?: string): Promise<DealerSettlement>;
    /**
     * Get dealer performance summary
     */
    getDealerPerformanceSummary(dealerId: string, stationId?: string, dateRange?: {
        startDate: Date;
        endDate: Date;
    }): Promise<SettlementSummary>;
    /**
     * Generate bulk settlements for multiple dealers
     */
    generateBulkSettlements(windowId: string, dealerStationPairs: Array<{
        dealerId: string;
        stationId: string;
        volumeSold: number;
    }>, createdBy: string): Promise<{
        totalGenerated: number;
        totalMarginAmount: number;
        settlements: DealerSettlement[];
        errors: Array<{
            dealerId: string;
            stationId: string;
            error: string;
        }>;
    }>;
    private validateDealerStation;
    private getPricingWindow;
    private calculateGrossDealerMargin;
    private calculateLoanDeduction;
    private calculateTaxDeductions;
    private generateSettlementNumber;
    private generateUUID;
    private saveSettlement;
    private createSettlementJournalEntries;
    private validateDealerCreditworthiness;
    private generateLoanNumber;
    private generateAmortizationSchedule;
    private saveLoan;
    private saveLoanSchedule;
    private createLoanDisbursementJournalEntry;
    private getSettlementById;
    private updateSettlement;
    private generatePaymentReference;
    private createPaymentJournalEntries;
    private updateLoanSchedulePayments;
    private getDealerSettlements;
    private getOutstandingLoanBalance;
    private calculatePerformanceRating;
    private getWindowStartDate;
    private getWindowEndDate;
}
export {};
//# sourceMappingURL=dealer-settlement.service.d.ts.map