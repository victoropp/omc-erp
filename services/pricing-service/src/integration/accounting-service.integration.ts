import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

@Injectable()
export class AccountingServiceIntegration {
  private readonly logger = new Logger(AccountingServiceIntegration.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('ACCOUNTING_SERVICE_URL') || 'http://localhost:3002';
  }

  /**
   * Create journal entry in accounting service
   */
  async createJournalEntry(journalEntryRequest: JournalEntryRequest): Promise<{
    entryId: string;
    entryNumber: string;
    status: string;
  }> {
    this.logger.log(`Creating journal entry in accounting service: ${journalEntryRequest.templateCode}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/accounting/journal-entries`, journalEntryRequest)
      );

      this.logger.log(`Journal entry created successfully: ${response.data.entryNumber}`);
      return response.data;

    } catch (error) {
      this.logger.error(`Failed to create journal entry in accounting service:`, error);
      
      // Fallback: Log for manual processing
      await this.logFailedJournalEntry(journalEntryRequest, error.message);
      
      throw new Error(`Accounting service integration failed: ${error.message}`);
    }
  }

  /**
   * Get chart of accounts from accounting service
   */
  async getChartOfAccounts(accountType?: string): Promise<ChartOfAccountsResponse> {
    this.logger.log('Fetching chart of accounts from accounting service');

    try {
      const url = accountType ? 
        `${this.baseUrl}/api/accounting/chart-of-accounts?accountType=${accountType}` :
        `${this.baseUrl}/api/accounting/chart-of-accounts`;

      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      return response.data;

    } catch (error) {
      this.logger.error('Failed to fetch chart of accounts:', error);
      
      // Return fallback chart of accounts
      return this.getFallbackChartOfAccounts();
    }
  }

  /**
   * Get trial balance from accounting service
   */
  async getTrialBalance(startDate: Date, endDate: Date): Promise<TrialBalanceResponse> {
    this.logger.log(`Fetching trial balance: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/accounting/trial-balance`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      );

      return response.data;

    } catch (error) {
      this.logger.error('Failed to fetch trial balance:', error);
      throw new Error(`Failed to retrieve trial balance: ${error.message}`);
    }
  }

  /**
   * Post cost allocation entries for UPPF claims
   */
  async postCostAllocation(allocation: {
    sourceDocument: string;
    sourceDocumentId: string;
    totalAmount: number;
    allocations: Array<{
      costCenter: string;
      amount: number;
      percentage: number;
    }>;
    createdBy: string;
  }): Promise<void> {
    this.logger.log(`Posting cost allocation: ${allocation.sourceDocument}`);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/accounting/cost-allocations`, allocation)
      );

      this.logger.log('Cost allocation posted successfully');

    } catch (error) {
      this.logger.error('Failed to post cost allocation:', error);
      throw new Error(`Cost allocation failed: ${error.message}`);
    }
  }

  /**
   * Create accrual entries for dealer margins
   */
  async createAccrualEntry(accrual: {
    accrualType: string;
    amount: number;
    description: string;
    effectiveDate: Date;
    reversalDate?: Date;
    reference: string;
    createdBy: string;
  }): Promise<void> {
    this.logger.log(`Creating accrual entry: ${accrual.accrualType}`);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/accounting/accruals`, accrual)
      );

      this.logger.log('Accrual entry created successfully');

    } catch (error) {
      this.logger.error('Failed to create accrual entry:', error);
      throw new Error(`Accrual entry failed: ${error.message}`);
    }
  }

  /**
   * Get account balance for specific account
   */
  async getAccountBalance(accountCode: string, asOfDate?: Date): Promise<{
    accountCode: string;
    accountName: string;
    debitBalance: number;
    creditBalance: number;
    netBalance: number;
    asOfDate: Date;
  }> {
    this.logger.log(`Fetching account balance for: ${accountCode}`);

    try {
      const params = asOfDate ? { asOfDate: asOfDate.toISOString() } : {};
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/accounting/accounts/${accountCode}/balance`, { params })
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch account balance for ${accountCode}:`, error);
      throw new Error(`Account balance retrieval failed: ${error.message}`);
    }
  }

  /**
   * Health check for accounting service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    lastChecked: Date;
  }> {
    const startTime = Date.now();
    
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 })
      );

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastChecked: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.warn('Accounting service health check failed:', error.message);
      
      return {
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date()
      };
    }
  }

  // Private helper methods

  private async logFailedJournalEntry(journalEntry: JournalEntryRequest, errorMessage: string): Promise<void> {
    // Log failed journal entries for manual processing
    this.logger.error('FAILED_JOURNAL_ENTRY', {
      templateCode: journalEntry.templateCode,
      sourceDocument: journalEntry.sourceDocument,
      sourceDocumentId: journalEntry.sourceDocumentId,
      description: journalEntry.description,
      reference: journalEntry.reference,
      totalDebit: journalEntry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0),
      totalCredit: journalEntry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0),
      error: errorMessage,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, this could:
    // - Save to a failed_journal_entries table
    // - Send to a dead letter queue
    // - Create a manual task for accounting team
  }

  private getFallbackChartOfAccounts(): ChartOfAccountsResponse {
    // Return basic chart of accounts structure for fallback
    return {
      accounts: [
        { accountCode: '1000', accountName: 'Cash at Bank', accountType: 'ASSET', isActive: true },
        { accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'ASSET', isActive: true },
        { accountCode: '1250', accountName: 'UPPF Claims Receivable', accountType: 'ASSET', isActive: true },
        { accountCode: '1260', accountName: 'Dealer Advances', accountType: 'ASSET', isActive: true },
        { accountCode: '1400', accountName: 'Fuel Inventory', accountType: 'ASSET', isActive: true },
        { accountCode: '2000', accountName: 'Accounts Payable', accountType: 'LIABILITY', isActive: true },
        { accountCode: '2310', accountName: 'VAT Payable', accountType: 'LIABILITY', isActive: true },
        { accountCode: '2400', accountName: 'Dealer Payable', accountType: 'LIABILITY', isActive: true },
        { accountCode: '4100', accountName: 'Fuel Sales - PMS', accountType: 'REVENUE', isActive: true },
        { accountCode: '4200', accountName: 'UPPF Income', accountType: 'REVENUE', isActive: true },
        { accountCode: '5000', accountName: 'Cost of Sales', accountType: 'EXPENSE', isActive: true },
        { accountCode: '5200', accountName: 'Dealer Margins', accountType: 'EXPENSE', isActive: true }
      ]
    };
  }
}