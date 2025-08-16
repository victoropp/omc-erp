import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface JournalEntryRequest {
    templateCode: string;
    sourceDocument: string;
    sourceDocumentId: string;
    description: string;
    reference: string;
    effectiveDate: Date;
    lines: Array<{
        accountCode: string;
        debitAmount?: number;
        creditAmount?: number;
        description: string;
        costCenter?: string;
        projectCode?: string;
    }>;
    createdBy: string;
}
export interface ChartOfAccountsResponse {
    accounts: Array<{
        accountCode: string;
        accountName: string;
        accountType: string;
        parentAccount?: string;
        isActive: boolean;
    }>;
}
export interface TrialBalanceResponse {
    periodStart: Date;
    periodEnd: Date;
    accounts: Array<{
        accountCode: string;
        accountName: string;
        debitBalance: number;
        creditBalance: number;
    }>;
    totalDebits: number;
    totalCredits: number;
}
export declare class AccountingServiceIntegration {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Create journal entry in accounting service
     */
    createJournalEntry(journalEntryRequest: JournalEntryRequest): Promise<{
        entryId: string;
        entryNumber: string;
        status: string;
    }>;
    /**
     * Get chart of accounts from accounting service
     */
    getChartOfAccounts(accountType?: string): Promise<ChartOfAccountsResponse>;
    /**
     * Get trial balance from accounting service
     */
    getTrialBalance(startDate: Date, endDate: Date): Promise<TrialBalanceResponse>;
    /**
     * Post cost allocation entries for UPPF claims
     */
    postCostAllocation(allocation: {
        sourceDocument: string;
        sourceDocumentId: string;
        totalAmount: number;
        allocations: Array<{
            costCenter: string;
            amount: number;
            percentage: number;
        }>;
        createdBy: string;
    }): Promise<void>;
    /**
     * Create accrual entries for dealer margins
     */
    createAccrualEntry(accrual: {
        accrualType: string;
        amount: number;
        description: string;
        effectiveDate: Date;
        reversalDate?: Date;
        reference: string;
        createdBy: string;
    }): Promise<void>;
    /**
     * Get account balance for specific account
     */
    getAccountBalance(accountCode: string, asOfDate?: Date): Promise<{
        accountCode: string;
        accountName: string;
        debitBalance: number;
        creditBalance: number;
        netBalance: number;
        asOfDate: Date;
    }>;
    /**
     * Health check for accounting service
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        lastChecked: Date;
    }>;
    private logFailedJournalEntry;
    private getFallbackChartOfAccounts;
}
//# sourceMappingURL=accounting-service.integration.d.ts.map