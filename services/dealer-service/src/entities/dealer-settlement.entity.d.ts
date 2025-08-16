export declare enum DealerSettlementStatus {
    CALCULATED = "calculated",
    APPROVED = "approved",
    PAID = "paid",
    DISPUTED = "disputed",
    CANCELLED = "cancelled"
}
export declare class DealerSettlement {
    id: string;
    stationId: string;
    windowId: string;
    settlementDate: Date;
    periodStart: Date;
    periodEnd: Date;
    totalLitresSold: number;
    grossDealerMargin: number;
    loanDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    netPayable: number;
    status: DealerSettlementStatus;
    paymentDate: Date;
    paymentReference: string;
    calculationDetails: {
        salesByProduct: Record<string, {
            litres: number;
            marginRate: number;
            marginAmount: number;
        }>;
        deductionBreakdown: {
            loanRepayments: Array<{
                loanId: string;
                amount: number;
                installmentNumber: number;
            }>;
            chargebacks: number;
            shortages: number;
            penalties: number;
            other: number;
        };
        pbuBreakdown: Record<string, any>;
    };
    settlementStatementUrl: string;
    journalEntryId: string;
    disputeReason: string;
    disputeResolution: string;
    autoPaymentEnabled: boolean;
    paymentMethod: string;
    bankAccountDetails: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        bankCode: string;
        branchCode?: string;
    };
    tenantId: string;
    createdBy: string;
    approvedBy: string;
    paidBy: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    get deductionPercentage(): number;
    get isNegativeBalance(): boolean;
    get isReadyForPayment(): boolean;
}
//# sourceMappingURL=dealer-settlement.entity.d.ts.map