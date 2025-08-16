import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealerSettlement } from '../entities/dealer-settlement.entity';
import { DealerLoan } from '../entities/dealer-loan.entity';
export interface SettlementStatementDto {
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        logo?: string;
    };
    dealerInfo: {
        dealerId: string;
        dealerName: string;
        stationName: string;
        stationAddress: string;
        contactPerson: string;
        phone: string;
        email?: string;
    };
    statementDetails: {
        statementNumber: string;
        settlementId: string;
        windowId: string;
        periodStart: Date;
        periodEnd: Date;
        statementDate: Date;
        dueDate: Date;
        currency: string;
    };
    salesSummary: {
        totalLitresSold: number;
        operationalDays: number;
        averageDailySales: number;
        productBreakdown: Array<{
            productType: string;
            litresSold: number;
            averagePrice: number;
            grossRevenue: number;
            percentage: number;
        }>;
    };
    priceBuildUp: {
        exRefineryPrice: number;
        taxesAndLevies: Array<{
            component: string;
            rate: number;
            amount: number;
        }>;
        regulatoryMargins: Array<{
            component: string;
            rate: number;
            amount: number;
        }>;
        omcMargin: {
            rate: number;
            amount: number;
        };
        dealerMargin: {
            rate: number;
            amount: number;
            percentage: number;
        };
        totalExPumpPrice: number;
    };
    marginCalculation: {
        grossMarginEarned: number;
        marginPerLitre: number;
        marginEfficiency: number;
        dailyMarginBreakdown: Array<{
            date: Date;
            litresSold: number;
            marginEarned: number;
            marginRate: number;
        }>;
    };
    deductionsDetail: {
        loanRepayments?: {
            totalAmount: number;
            loanBreakdown: Array<{
                loanReference: string;
                loanType: string;
                installmentNumber: number;
                principalAmount: number;
                interestAmount: number;
                penaltyAmount: number;
                totalAmount: number;
                outstandingBalance: number;
            }>;
        };
        otherDeductions: {
            chargebacks: {
                amount: number;
                reason: string;
            };
            shortages: {
                amount: number;
                details: string;
            };
            penalties: {
                amount: number;
                description: string;
            };
            adjustments: Array<{
                type: string;
                amount: number;
                reason: string;
            }>;
        };
        totalDeductions: number;
    };
    settlementSummary: {
        grossMarginEarned: number;
        totalDeductions: number;
        netAmountPayable: number;
        vatAmount?: number;
        withholdingTax?: number;
        finalNetAmount: number;
        paymentStatus: string;
        expectedPaymentDate: Date;
    };
    paymentInstructions: {
        bankDetails: {
            accountName: string;
            accountNumber: string;
            bankName: string;
            bankCode: string;
            swiftCode?: string;
        };
        paymentMethod: string;
        paymentTerms: string;
        notes: string[];
    };
    performanceMetrics: {
        marginPerformance: {
            currentPeriod: number;
            previousPeriod: number;
            variance: number;
            trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
        };
        volumePerformance: {
            currentPeriod: number;
            previousPeriod: number;
            variance: number;
            trend: 'GROWING' | 'STABLE' | 'DECLINING';
        };
        paymentReliability: {
            onTimePayments: number;
            totalPayments: number;
            reliability: number;
            rating: string;
        };
    };
    loanSummary?: {
        activeLoans: number;
        totalOutstanding: number;
        monthlyObligations: number;
        nextPaymentDue: Date;
        loanPerformance: 'GOOD' | 'SATISFACTORY' | 'POOR';
    };
    complianceInfo: {
        regulatoryCompliance: boolean;
        taxCompliance: boolean;
        documentationComplete: boolean;
        issues: string[];
    };
    footer: {
        terms: string[];
        signature: {
            name: string;
            title: string;
            date: Date;
        };
        generatedAt: Date;
        version: string;
    };
}
export interface StatementTemplate {
    templateType: 'STANDARD' | 'DETAILED' | 'SUMMARY';
    format: 'PDF' | 'HTML' | 'EXCEL';
    language: 'EN' | 'FR';
    includeCharts: boolean;
    includeLoanDetails: boolean;
    includePerformanceMetrics: boolean;
    customFields?: Record<string, any>;
}
export declare class DealerSettlementStatementService {
    private readonly settlementRepository;
    private readonly loanRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(settlementRepository: Repository<DealerSettlement>, loanRepository: Repository<DealerLoan>, eventEmitter: EventEmitter2);
    /**
     * Generate comprehensive settlement statement
     * Blueprint: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    generateSettlementStatement(settlementId: string, tenantId: string, template?: StatementTemplate): Promise<SettlementStatementDto>;
    /**
     * Generate multiple settlement statements for batch processing
     */
    generateBatchStatements(settlementIds: string[], tenantId: string, template?: StatementTemplate): Promise<{
        statements: SettlementStatementDto[];
        errors: Array<{
            settlementId: string;
            error: string;
        }>;
    }>;
    /**
     * Convert statement to PDF format
     */
    generatePDFStatement(statement: SettlementStatementDto, template: StatementTemplate): Promise<Buffer>;
    /**
     * Convert statement to HTML format
     */
    generateHTMLStatement(statement: SettlementStatementDto, template: StatementTemplate): string;
    /**
     * Export statement to Excel format
     */
    generateExcelStatement(statement: SettlementStatementDto): Promise<Buffer>;
    private buildStatementDetails;
    private buildSalesSummary;
    private buildPriceBuildUp;
    private buildMarginCalculation;
    private buildDeductionsDetail;
    private buildSettlementSummary;
    private buildPaymentInstructions;
    private buildPerformanceMetrics;
    private buildLoanSummary;
    private buildComplianceInfo;
    private buildFooter;
    private getDealerInfo;
    private getCompanyInfo;
    private getPreviousSettlement;
    private getActiveLoans;
    private formatDate;
    private formatCurrency;
    private formatNumber;
    private getStatementCSS;
}
//# sourceMappingURL=dealer-settlement-statement.service.d.ts.map