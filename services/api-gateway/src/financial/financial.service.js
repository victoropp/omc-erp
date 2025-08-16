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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FinancialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let FinancialService = FinancialService_1 = class FinancialService {
    httpService;
    configService;
    cacheManager;
    logger = new common_1.Logger(FinancialService_1.name);
    financialServiceUrl;
    constructor(httpService, configService, cacheManager) {
        this.httpService = httpService;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.financialServiceUrl = this.configService.get('FINANCIAL_SERVICE_URL', 'http://localhost:3005');
    }
    async forwardRequest(path, method, data, headers) {
        const url = `${this.financialServiceUrl}${path}`;
        try {
            let response;
            switch (method.toUpperCase()) {
                case 'GET':
                    response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, { headers }));
                    break;
                case 'POST':
                    response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(url, data, { headers }));
                    break;
                case 'PUT':
                    response = await (0, rxjs_1.lastValueFrom)(this.httpService.put(url, data, { headers }));
                    break;
                case 'PATCH':
                    response = await (0, rxjs_1.lastValueFrom)(this.httpService.patch(url, data, { headers }));
                    break;
                case 'DELETE':
                    response = await (0, rxjs_1.lastValueFrom)(this.httpService.delete(url, { headers }));
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }
            return response.data;
        }
        catch (error) {
            this.logger.error(`Financial service request failed: ${method} ${path}`, error.response?.data || error.message);
            throw error;
        }
    }
    async getChartOfAccounts(filters) {
        const cacheKey = `coa:${JSON.stringify(filters || {})}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest('/chart-of-accounts', 'GET');
        await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
        return result;
    }
    async createAccount(accountData) {
        const result = await this.forwardRequest('/chart-of-accounts', 'POST', accountData);
        // Clear related caches
        await this.clearAccountCaches();
        return result;
    }
    async updateAccount(accountId, accountData) {
        const result = await this.forwardRequest(`/chart-of-accounts/${accountId}`, 'PUT', accountData);
        // Clear related caches
        await this.clearAccountCaches();
        return result;
    }
    async deleteAccount(accountId) {
        const result = await this.forwardRequest(`/chart-of-accounts/${accountId}`, 'DELETE');
        // Clear related caches
        await this.clearAccountCaches();
        return result;
    }
    async getTrialBalance(periodId, asOfDate) {
        const cacheKey = `trial_balance:${periodId}:${asOfDate}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/general-ledger/trial-balance?periodId=${periodId}&asOfDate=${asOfDate}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
        return result;
    }
    async getFinancialStatements(periodId, statementType) {
        const cacheKey = `financial_statements:${periodId}:${statementType}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/financial-reporting/${statementType}?periodId=${periodId}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 1800000); // 30 minutes
        return result;
    }
    async getAccountBalance(accountCode, asOfDate) {
        const cacheKey = `account_balance:${accountCode}:${asOfDate || 'current'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/general-ledger/account-balance/${accountCode}?asOfDate=${asOfDate}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
        return result;
    }
    async getAccountMovements(accountCode, fromDate, toDate) {
        const params = new URLSearchParams();
        if (fromDate)
            params.append('fromDate', fromDate);
        if (toDate)
            params.append('toDate', toDate);
        const result = await this.forwardRequest(`/general-ledger/account-movements/${accountCode}?${params.toString()}`, 'GET');
        return result;
    }
    async createJournalEntry(journalData) {
        const result = await this.forwardRequest('/journal-entries', 'POST', journalData);
        // Clear related caches
        await this.clearFinancialCaches();
        return result;
    }
    async postJournalEntry(journalId) {
        const result = await this.forwardRequest(`/journal-entries/${journalId}/post`, 'POST');
        // Clear related caches
        await this.clearFinancialCaches();
        return result;
    }
    async reverseJournalEntry(journalId, reason) {
        const result = await this.forwardRequest(`/journal-entries/${journalId}/reverse`, 'POST', { reason });
        // Clear related caches
        await this.clearFinancialCaches();
        return result;
    }
    async getJournalEntries(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key].toString());
                }
            });
        }
        const result = await this.forwardRequest(`/journal-entries?${params.toString()}`, 'GET');
        return result;
    }
    async getJournalEntry(journalId) {
        const cacheKey = `journal_entry:${journalId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
        return result;
    }
    async updateJournalEntry(journalId, journalData) {
        const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'PUT', journalData);
        // Clear related caches
        await this.clearFinancialCaches();
        await this.cacheManager.del(`journal_entry:${journalId}`);
        return result;
    }
    async deleteJournalEntry(journalId) {
        const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'DELETE');
        // Clear related caches
        await this.clearFinancialCaches();
        await this.cacheManager.del(`journal_entry:${journalId}`);
        return result;
    }
    async calculateTaxes(taxCalculationData) {
        const result = await this.forwardRequest('/tax-management/calculate', 'POST', taxCalculationData);
        return result;
    }
    async getGhanaTaxRates(taxType) {
        const cacheKey = `ghana_tax_rates:${taxType || 'all'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/tax-management/ghana-rates?taxType=${taxType}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 3600000); // 1 hour
        return result;
    }
    async submitTaxReturn(taxReturnData) {
        const result = await this.forwardRequest('/tax-management/returns', 'POST', taxReturnData);
        return result;
    }
    async getFixedAssets(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    params.append(key, filters[key].toString());
                }
            });
        }
        const result = await this.forwardRequest(`/fixed-assets?${params.toString()}`, 'GET');
        return result;
    }
    async createFixedAsset(assetData) {
        const result = await this.forwardRequest('/fixed-assets', 'POST', assetData);
        return result;
    }
    async calculateDepreciation(assetId, method, params) {
        const result = await this.forwardRequest(`/fixed-assets/${assetId}/depreciation`, 'POST', {
            method,
            ...params,
        });
        return result;
    }
    async runDepreciationSchedule(periodId) {
        const result = await this.forwardRequest(`/fixed-assets/depreciation/run/${periodId}`, 'POST');
        // Clear related caches
        await this.clearFinancialCaches();
        return result;
    }
    async getBudgets(fiscalYear, departmentId) {
        const params = new URLSearchParams();
        if (fiscalYear)
            params.append('fiscalYear', fiscalYear.toString());
        if (departmentId)
            params.append('departmentId', departmentId);
        const result = await this.forwardRequest(`/budget-management/budgets?${params.toString()}`, 'GET');
        return result;
    }
    async createBudget(budgetData) {
        const result = await this.forwardRequest('/budget-management/budgets', 'POST', budgetData);
        return result;
    }
    async getBudgetVarianceAnalysis(budgetId, periodId) {
        const cacheKey = `budget_variance:${budgetId}:${periodId || 'current'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/budget-management/variance-analysis/${budgetId}?periodId=${periodId}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
        return result;
    }
    async getProjectProfitability(projectId, fromDate, toDate) {
        const params = new URLSearchParams();
        if (fromDate)
            params.append('fromDate', fromDate);
        if (toDate)
            params.append('toDate', toDate);
        const cacheKey = `project_profitability:${projectId}:${fromDate || ''}:${toDate || ''}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/project-accounting/profitability/${projectId}?${params.toString()}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 900000); // 15 minutes
        return result;
    }
    async getCostAllocation(costCenterId, periodId) {
        const cacheKey = `cost_allocation:${costCenterId}:${periodId || 'current'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/cost-management/allocation/${costCenterId}?periodId=${periodId}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
        return result;
    }
    async getIfrsCompliance(periodId) {
        const cacheKey = `ifrs_compliance:${periodId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.forwardRequest(`/ifrs-compliance/${periodId}`, 'GET');
        await this.cacheManager.set(cacheKey, result, 1800000); // 30 minutes
        return result;
    }
    async generateIfrsReport(reportType, periodId) {
        const result = await this.forwardRequest(`/ifrs-compliance/reports/${reportType}?periodId=${periodId}`, 'GET');
        return result;
    }
    async clearAccountCaches() {
        // In a real implementation, you'd use cache patterns or tags
        this.logger.debug('Clearing account-related caches');
    }
    async clearFinancialCaches() {
        // In a real implementation, you'd use cache patterns or tags
        this.logger.debug('Clearing financial-related caches');
    }
    async getHealthCheck() {
        try {
            const result = await this.forwardRequest('/health', 'GET');
            return {
                status: 'healthy',
                service: 'financial-service',
                timestamp: new Date().toISOString(),
                details: result,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                service: 'financial-service',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = FinancialService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService, Object])
], FinancialService);
//# sourceMappingURL=financial.service.js.map