import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerSettlement, DealerSettlementStatus } from '../entities/dealer-settlement.entity';
import { DealerLoan } from '../entities/dealer-loan.entity';
import { DealerMarginAccrual } from '../entities/dealer-margin-accrual.entity';
export interface PricingWindow {
    windowId: string;
    startDate: Date;
    endDate: Date;
    pbuComponents: PBUComponent[];
}
export interface PBUComponent {
    componentCode: string;
    name: string;
    category: 'levy' | 'regulatory_margin' | 'distribution_margin' | 'omc_margin' | 'dealer_margin' | 'other';
    unit: 'GHS_per_litre' | '%';
    rateValue: number;
    productType: string;
}
export interface DealerMarginCalculation {
    stationId: string;
    windowId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    salesByProduct: Record<string, {
        litresSold: number;
        exPumpPrice: number;
        dealerMarginRate: number;
        dealerMarginAmount: number;
        pbuBreakdown: Record<string, number>;
    }>;
    totalLitresSold: number;
    grossDealerMargin: number;
    loanDeductions: {
        totalAmount: number;
        loanBreakdown: Array<{
            loanId: string;
            installmentAmount: number;
            principalAmount: number;
            interestAmount: number;
            penaltyAmount: number;
            installmentNumber: number;
        }>;
    };
    otherDeductions: {
        chargebacks: number;
        shortages: number;
        penalties: number;
        adjustments: number;
        total: number;
    };
    netPayable: number;
}
export interface SettlementStatement {
    settlementId: string;
    settlementNumber: string;
    stationId: string;
    dealerId: string;
    windowId: string;
    periodStart: Date;
    periodEnd: Date;
    statementDate: Date;
    salesSummary: {
        totalLitresSold: number;
        productBreakdown: Record<string, {
            litres: number;
            averagePrice: number;
            grossRevenue: number;
            dealerMargin: number;
        }>;
    };
    pbuAnalysis: {
        exRefineryPrice: number;
        taxesAndLevies: Record<string, number>;
        regulatoryMargins: Record<string, number>;
        omcMargin: number;
        dealerMargin: number;
        totalExPumpPrice: number;
    };
    settlementDetails: {
        grossMarginEarned: number;
        totalDeductions: number;
        netAmountPayable: number;
        paymentMethod: string;
        expectedPaymentDate: Date;
    };
    loanRepaymentDetails?: {
        activeLoans: number;
        totalOutstanding: number;
        currentInstallments: Array<{
            loanReference: string;
            dueAmount: number;
            principalPortion: number;
            interestPortion: number;
        }>;
        totalLoanDeduction: number;
    };
    performanceMetrics: {
        marginPerLitre: number;
        deductionRatio: number;
        profitabilityIndex: number;
        performanceRating: string;
    };
}
export declare class DealerSettlementService {
    private readonly settlementRepository;
    private readonly loanRepository;
    private readonly marginAccrualRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(settlementRepository: Repository<DealerSettlement>, loanRepository: Repository<DealerLoan>, marginAccrualRepository: Repository<DealerMarginAccrual>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Calculate dealer settlement for a pricing window
     * Blueprint: dealer_margin_amt_day = sum_over_products(litres_sold(product) * dealer_margin_rate(product, window))
     */
    calculateDealerSettlement(stationId: string, windowId: string, tenantId: string, userId?: string): Promise<DealerMarginCalculation>;
    /**
     * Create dealer settlement record
     * Blueprint requirement: "Generate settlement statements per pricing window"
     */
    createSettlement(calculation: DealerMarginCalculation, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Approve settlement for payment
     */
    approveSettlement(settlementId: string, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Process settlement payment
     */
    processSettlementPayment(settlementId: string, paymentReference: string, paymentMethod: string, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Generate settlement statement
     * Blueprint: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    generateSettlementStatement(settlementId: string, tenantId: string): Promise<SettlementStatement>;
    /**
     * Get dealer settlements for a period
     */
    getDealerSettlements(stationId: string, tenantId: string, options?: {
        status?: DealerSettlementStatus;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
    }): Promise<DealerSettlement[]>;
    private getPricingWindowData;
    private calculateLoanDeductions;
    private calculateOtherDeductions;
    private processLoanRepayments;
    private generateSettlementNumber;
    private extractPBUAnalysis;
    private calculatePerformanceRating;
    /**
     * Scheduled task for automated settlement processing
     * Blueprint: automate settlement processing per pricing window
     */
    processAutomatedSettlements(): Promise<void>;
    private getActiveStations;
    private getCurrentPricingWindow;
}
//# sourceMappingURL=dealer-settlement.service.d.ts.map