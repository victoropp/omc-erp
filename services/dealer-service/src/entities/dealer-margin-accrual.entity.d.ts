export declare enum AccrualStatus {
    PENDING = "pending",
    ACCRUED = "accrued",
    POSTED_TO_GL = "posted_to_gl",
    REVERSED = "reversed"
}
export declare class DealerMarginAccrual {
    id: string;
    stationId: string;
    dealerId: string;
    productType: string;
    accrualDate: Date;
    windowId: string;
    litresSold: number;
    marginRate: number;
    marginAmount: number;
    exPumpPrice: number;
    cumulativeLitres: number;
    cumulativeMargin: number;
    status: AccrualStatus;
    journalEntryId: string;
    glAccountCode: string;
    costCenter: string;
    reversalReason: string;
    originalAccrualId: string;
    calculationDetails: {
        transactionIds: string[];
        pbuBreakdown: Record<string, number>;
        adjustments: Array<{
            type: string;
            amount: number;
            reason: string;
        }>;
    };
    tenantId: string;
    processedBy: string;
    createdAt: Date;
    get isPosted(): boolean;
    get isReversed(): boolean;
}
//# sourceMappingURL=dealer-margin-accrual.entity.d.ts.map