import { FinancialService } from './financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    getChartOfAccounts(accountType?: string, isActive?: boolean): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    createAccount(accountData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    updateAccount(accountId: string, accountData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    deleteAccount(accountId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getTrialBalance(periodId?: string, asOfDate?: string): Promise<{
        success: boolean;
        data: any;
        parameters: {
            periodId: string | undefined;
            asOfDate: string | undefined;
        };
        timestamp: string;
    }>;
    getAccountBalance(accountCode: string, asOfDate?: string): Promise<{
        success: boolean;
        data: any;
        accountCode: string;
        asOfDate: string | undefined;
        timestamp: string;
    }>;
    getAccountMovements(accountCode: string, fromDate?: string, toDate?: string): Promise<{
        success: boolean;
        data: any;
        parameters: {
            accountCode: string;
            fromDate: string | undefined;
            toDate: string | undefined;
        };
        timestamp: string;
    }>;
    getJournalEntries(periodId?: string, status?: string, fromDate?: string, toDate?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: any;
        filters: {
            periodId: string | undefined;
            status: string | undefined;
            fromDate: string | undefined;
            toDate: string | undefined;
            page: number | undefined;
            limit: number | undefined;
        };
        timestamp: string;
    }>;
    getJournalEntry(journalId: string): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    createJournalEntry(journalData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    updateJournalEntry(journalId: string, journalData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    postJournalEntry(journalId: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        postedBy: any;
        timestamp: string;
    }>;
    reverseJournalEntry(journalId: string, reverseData: {
        reason: string;
    }, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        reversedBy: any;
        reason: string;
        timestamp: string;
    }>;
    deleteJournalEntry(journalId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getProfitLossStatement(periodId: string, comparative?: boolean): Promise<{
        success: boolean;
        data: any;
        statementType: string;
        periodId: string;
        comparative: boolean | undefined;
        timestamp: string;
    }>;
    getBalanceSheet(periodId: string): Promise<{
        success: boolean;
        data: any;
        statementType: string;
        periodId: string;
        timestamp: string;
    }>;
    getCashFlowStatement(periodId: string): Promise<{
        success: boolean;
        data: any;
        statementType: string;
        periodId: string;
        timestamp: string;
    }>;
    getGhanaTaxRates(taxType?: string): Promise<{
        success: boolean;
        data: any;
        country: string;
        taxType: string | undefined;
        timestamp: string;
    }>;
    calculateTaxes(calculationData: any): Promise<{
        success: boolean;
        data: any;
        calculationDate: string;
    }>;
    submitTaxReturn(taxReturnData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    getHealthCheck(): Promise<any>;
    getDashboardSummary(periodId?: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalAssets: any;
                totalLiabilities: any;
                totalEquity: any;
                totalRevenue: any;
                totalExpenses: any;
                netIncome: any;
            };
            trialBalanceStatus: string;
            lastUpdated: string;
        };
        periodId: string | undefined;
        timestamp: string;
    }>;
}
//# sourceMappingURL=financial.controller.d.ts.map