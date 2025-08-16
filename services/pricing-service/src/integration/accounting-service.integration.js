"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AccountingServiceIntegration_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingServiceIntegration = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AccountingServiceIntegration = AccountingServiceIntegration_1 = class AccountingServiceIntegration {
    httpService;
    configService;
    logger = new common_1.Logger(AccountingServiceIntegration_1.name);
    baseUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('ACCOUNTING_SERVICE_URL') || 'http://localhost:3002';
    }
    /**
     * Create journal entry in accounting service
     */
    async createJournalEntry(journalEntryRequest) {
        this.logger.log(`Creating journal entry in accounting service: ${journalEntryRequest.templateCode}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/accounting/journal-entries`, journalEntryRequest));
            this.logger.log(`Journal entry created successfully: ${response.data.entryNumber}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to create journal entry in accounting service:`, error);
            // Fallback: Log for manual processing
            await this.logFailedJournalEntry(journalEntryRequest, error.message);
            throw new Error(`Accounting service integration failed: ${error.message}`);
        }
    }
    /**
     * Get chart of accounts from accounting service
     */
    async getChartOfAccounts(accountType) {
        this.logger.log('Fetching chart of accounts from accounting service');
        try {
            const url = accountType ?
                `${this.baseUrl}/api/accounting/chart-of-accounts?accountType=${accountType}` :
                `${this.baseUrl}/api/accounting/chart-of-accounts`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch chart of accounts:', error);
            // Return fallback chart of accounts
            return this.getFallbackChartOfAccounts();
        }
    }
    /**
     * Get trial balance from accounting service
     */
    async getTrialBalance(startDate, endDate) {
        this.logger.log(`Fetching trial balance: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/accounting/trial-balance`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch trial balance:', error);
            throw new Error(`Failed to retrieve trial balance: ${error.message}`);
        }
    }
    /**
     * Post cost allocation entries for UPPF claims
     */
    async postCostAllocation(allocation) {
        this.logger.log(`Posting cost allocation: ${allocation.sourceDocument}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/accounting/cost-allocations`, allocation));
            this.logger.log('Cost allocation posted successfully');
        }
        catch (error) {
            this.logger.error('Failed to post cost allocation:', error);
            throw new Error(`Cost allocation failed: ${error.message}`);
        }
    }
    /**
     * Create accrual entries for dealer margins
     */
    async createAccrualEntry(accrual) {
        this.logger.log(`Creating accrual entry: ${accrual.accrualType}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/accounting/accruals`, accrual));
            this.logger.log('Accrual entry created successfully');
        }
        catch (error) {
            this.logger.error('Failed to create accrual entry:', error);
            throw new Error(`Accrual entry failed: ${error.message}`);
        }
    }
    /**
     * Get account balance for specific account
     */
    async getAccountBalance(accountCode, asOfDate) {
        this.logger.log(`Fetching account balance for: ${accountCode}`);
        try {
            const params = asOfDate ? { asOfDate: asOfDate.toISOString() } : {};
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/accounting/accounts/${accountCode}/balance`, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch account balance for ${accountCode}:`, error);
            throw new Error(`Account balance retrieval failed: ${error.message}`);
        }
    }
    /**
     * Health check for accounting service
     */
    async healthCheck() {
        const startTime = Date.now();
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 }));
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date()
            };
        }
        catch (error) {
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
    async logFailedJournalEntry(journalEntry, errorMessage) {
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
    getFallbackChartOfAccounts() {
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
};
exports.AccountingServiceIntegration = AccountingServiceIntegration;
exports.AccountingServiceIntegration = AccountingServiceIntegration = AccountingServiceIntegration_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], AccountingServiceIntegration);
//# sourceMappingURL=accounting-service.integration.js.map