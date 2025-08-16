import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerSettlement } from './entities/dealer-settlement.entity';
import { DealerLoan } from '../loans/entities/dealer-loan.entity';
import { Transaction } from '@omc-erp/database';
export interface SettlementCalculation {
    stationId: string;
    windowId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    salesData: {
        totalLitresSold: number;
        byProduct: Record<string, {
            litres: number;
            marginRate: number;
            marginAmount: number;
        }>;
    };
    grossDealerMargin: number;
    deductions: {
        loanRepayment: number;
        chargebacks: number;
        shortages: number;
        other: number;
        total: number;
    };
    netPayable: number;
    loanDetails?: {
        outstandingBalance: number;
        installmentDue: number;
        daysOverdue: number;
    };
}
export declare class DealerSettlementsService {
    private readonly settlementRepository;
    private readonly loanRepository;
    private readonly transactionRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(settlementRepository: Repository<DealerSettlement>, loanRepository: Repository<DealerLoan>, transactionRepository: Repository<Transaction>, dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Close dealer settlement for a pricing window
     * Blueprint formula: gross_dealer_margin - loan_installment_due - other_deductions = net_payable_to_dealer
     */
    closeDealerSettlement(stationId: string, windowId: string, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Calculate settlement amounts for a dealer
     * Blueprint: dealer_margin_amt_day = sum_over_products(litres_sold(product) * dealer_margin_rate(product, window))
     */
    calculateSettlement(stationId: string, windowId: string, tenantId: string): Promise<SettlementCalculation>;
    /**
     * Generate dealer settlement statement
     * Blueprint requirement: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    generateSettlementStatement(settlement: DealerSettlement, calculation: SettlementCalculation): Promise<any>;
    /**
     * Approve settlement for payment
     */
    approveSettlement(settlementId: string, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Mark settlement as paid
     */
    markSettlementPaid(settlementId: string, paymentReference: string, tenantId: string, userId?: string): Promise<DealerSettlement>;
    /**
     * Get dealer cash flow forecast
     * Blueprint AI feature: "Dealer credit risk & repayment optimizer"
     */
    getDealerCashFlowForecast(stationId: string, tenantId: string): Promise<any>;
    private getPricingWindowDates;
    private getDealerMarginRate;
    private calculateLoanDeductions;
    private calculateOtherDeductions;
    private processLoanRepayments;
    private generateCashFlowRecommendations;
    processAutomatedSettlements(): Promise<void>;
}
//# sourceMappingURL=dealer-settlements.service.d.ts.map