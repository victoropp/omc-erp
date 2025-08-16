import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);
  private readonly financialServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.financialServiceUrl = this.configService.get('FINANCIAL_SERVICE_URL', 'http://localhost:3005');
  }

  async forwardRequest(path: string, method: string, data?: any, headers?: any): Promise<any> {
    const url = `${this.financialServiceUrl}${path}`;
    
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await lastValueFrom(this.httpService.get(url, { headers }));
          break;
        case 'POST':
          response = await lastValueFrom(this.httpService.post(url, data, { headers }));
          break;
        case 'PUT':
          response = await lastValueFrom(this.httpService.put(url, data, { headers }));
          break;
        case 'PATCH':
          response = await lastValueFrom(this.httpService.patch(url, data, { headers }));
          break;
        case 'DELETE':
          response = await lastValueFrom(this.httpService.delete(url, { headers }));
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response.data;
    } catch (error: any) {
      this.logger.error(`Financial service request failed: ${method} ${path}`, error.response?.data || error.message);
      throw error;
    }
  }

  async getChartOfAccounts(filters?: any): Promise<any> {
    const cacheKey = `coa:${JSON.stringify(filters || {})}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest('/chart-of-accounts', 'GET');
    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    
    return result;
  }

  async createAccount(accountData: any): Promise<any> {
    const result = await this.forwardRequest('/chart-of-accounts', 'POST', accountData);
    
    // Clear related caches
    await this.clearAccountCaches();
    
    return result;
  }

  async updateAccount(accountId: string, accountData: any): Promise<any> {
    const result = await this.forwardRequest(`/chart-of-accounts/${accountId}`, 'PUT', accountData);
    
    // Clear related caches
    await this.clearAccountCaches();
    
    return result;
  }

  async deleteAccount(accountId: string): Promise<any> {
    const result = await this.forwardRequest(`/chart-of-accounts/${accountId}`, 'DELETE');
    
    // Clear related caches
    await this.clearAccountCaches();
    
    return result;
  }

  async getTrialBalance(periodId?: string, asOfDate?: string): Promise<any> {
    const cacheKey = `trial_balance:${periodId}:${asOfDate}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/general-ledger/trial-balance?periodId=${periodId}&asOfDate=${asOfDate}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
    
    return result;
  }

  async getFinancialStatements(periodId: string, statementType: string): Promise<any> {
    const cacheKey = `financial_statements:${periodId}:${statementType}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/financial-reporting/${statementType}?periodId=${periodId}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 1800000); // 30 minutes
    
    return result;
  }

  async getAccountBalance(accountCode: string, asOfDate?: string): Promise<any> {
    const cacheKey = `account_balance:${accountCode}:${asOfDate || 'current'}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/general-ledger/account-balance/${accountCode}?asOfDate=${asOfDate}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes
    
    return result;
  }

  async getAccountMovements(accountCode: string, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const result = await this.forwardRequest(`/general-ledger/account-movements/${accountCode}?${params.toString()}`, 'GET');
    return result;
  }

  async createJournalEntry(journalData: any): Promise<any> {
    const result = await this.forwardRequest('/journal-entries', 'POST', journalData);
    
    // Clear related caches
    await this.clearFinancialCaches();
    
    return result;
  }

  async postJournalEntry(journalId: string): Promise<any> {
    const result = await this.forwardRequest(`/journal-entries/${journalId}/post`, 'POST');
    
    // Clear related caches
    await this.clearFinancialCaches();
    
    return result;
  }

  async reverseJournalEntry(journalId: string, reason: string): Promise<any> {
    const result = await this.forwardRequest(`/journal-entries/${journalId}/reverse`, 'POST', { reason });
    
    // Clear related caches
    await this.clearFinancialCaches();
    
    return result;
  }

  async getJournalEntries(filters?: any): Promise<any> {
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

  async getJournalEntry(journalId: string): Promise<any> {
    const cacheKey = `journal_entry:${journalId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
    
    return result;
  }

  async updateJournalEntry(journalId: string, journalData: any): Promise<any> {
    const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'PUT', journalData);
    
    // Clear related caches
    await this.clearFinancialCaches();
    await this.cacheManager.del(`journal_entry:${journalId}`);
    
    return result;
  }

  async deleteJournalEntry(journalId: string): Promise<any> {
    const result = await this.forwardRequest(`/journal-entries/${journalId}`, 'DELETE');
    
    // Clear related caches
    await this.clearFinancialCaches();
    await this.cacheManager.del(`journal_entry:${journalId}`);
    
    return result;
  }

  async calculateTaxes(taxCalculationData: any): Promise<any> {
    const result = await this.forwardRequest('/tax-management/calculate', 'POST', taxCalculationData);
    return result;
  }

  async getGhanaTaxRates(taxType?: string): Promise<any> {
    const cacheKey = `ghana_tax_rates:${taxType || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/tax-management/ghana-rates?taxType=${taxType}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hour
    
    return result;
  }

  async submitTaxReturn(taxReturnData: any): Promise<any> {
    const result = await this.forwardRequest('/tax-management/returns', 'POST', taxReturnData);
    return result;
  }

  async getFixedAssets(filters?: any): Promise<any> {
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

  async createFixedAsset(assetData: any): Promise<any> {
    const result = await this.forwardRequest('/fixed-assets', 'POST', assetData);
    return result;
  }

  async calculateDepreciation(assetId: string, method: string, params: any): Promise<any> {
    const result = await this.forwardRequest(`/fixed-assets/${assetId}/depreciation`, 'POST', {
      method,
      ...params,
    });
    return result;
  }

  async runDepreciationSchedule(periodId: string): Promise<any> {
    const result = await this.forwardRequest(`/fixed-assets/depreciation/run/${periodId}`, 'POST');
    
    // Clear related caches
    await this.clearFinancialCaches();
    
    return result;
  }

  async getBudgets(fiscalYear?: number, departmentId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fiscalYear) params.append('fiscalYear', fiscalYear.toString());
    if (departmentId) params.append('departmentId', departmentId);
    
    const result = await this.forwardRequest(`/budget-management/budgets?${params.toString()}`, 'GET');
    return result;
  }

  async createBudget(budgetData: any): Promise<any> {
    const result = await this.forwardRequest('/budget-management/budgets', 'POST', budgetData);
    return result;
  }

  async getBudgetVarianceAnalysis(budgetId: string, periodId?: string): Promise<any> {
    const cacheKey = `budget_variance:${budgetId}:${periodId || 'current'}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/budget-management/variance-analysis/${budgetId}?periodId=${periodId}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
    
    return result;
  }

  async getProjectProfitability(projectId: string, fromDate?: string, toDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const cacheKey = `project_profitability:${projectId}:${fromDate || ''}:${toDate || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/project-accounting/profitability/${projectId}?${params.toString()}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 900000); // 15 minutes
    
    return result;
  }

  async getCostAllocation(costCenterId: string, periodId?: string): Promise<any> {
    const cacheKey = `cost_allocation:${costCenterId}:${periodId || 'current'}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/cost-management/allocation/${costCenterId}?periodId=${periodId}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 600000); // 10 minutes
    
    return result;
  }

  async getIfrsCompliance(periodId: string): Promise<any> {
    const cacheKey = `ifrs_compliance:${periodId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.forwardRequest(`/ifrs-compliance/${periodId}`, 'GET');
    await this.cacheManager.set(cacheKey, result, 1800000); // 30 minutes
    
    return result;
  }

  async generateIfrsReport(reportType: string, periodId: string): Promise<any> {
    const result = await this.forwardRequest(`/ifrs-compliance/reports/${reportType}?periodId=${periodId}`, 'GET');
    return result;
  }

  private async clearAccountCaches(): Promise<void> {
    // In a real implementation, you'd use cache patterns or tags
    this.logger.debug('Clearing account-related caches');
  }

  private async clearFinancialCaches(): Promise<void> {
    // In a real implementation, you'd use cache patterns or tags
    this.logger.debug('Clearing financial-related caches');
  }

  async getHealthCheck(): Promise<any> {
    try {
      const result = await this.forwardRequest('/health', 'GET');
      return {
        status: 'healthy',
        service: 'financial-service',
        timestamp: new Date().toISOString(),
        details: result,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        service: 'financial-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}