/**
 * Comprehensive API Service Layer for Ghana OMC ERP System
 * Handles all backend service integrations with error handling and caching
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Generic API service class
export class ApiService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await apiClient.get(`${this.baseUrl}${endpoint}`);
    return response.data;
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.post(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.put(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await apiClient.patch(`${this.baseUrl}${endpoint}`, data);
    return response.data;
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await apiClient.delete(`${this.baseUrl}${endpoint}`);
    return response.data;
  }
}

// Authentication API Service
export class AuthService extends ApiService {
  constructor() {
    super('/auth');
  }

  async login(credentials: { email: string; password: string }) {
    return this.post('/login', credentials);
  }

  async register(userData: any) {
    return this.post('/register', userData);
  }

  async logout() {
    return this.post('/logout');
  }

  async refreshToken() {
    return this.post('/refresh-token');
  }

  async forgotPassword(email: string) {
    return this.post('/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.post('/reset-password', { token, password });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.post('/change-password', { oldPassword, newPassword });
  }
}

// Dashboard Analytics Service
export class DashboardService extends ApiService {
  constructor() {
    super('/dashboard');
  }

  async getExecutiveDashboard() {
    return this.get('/executive');
  }

  async getOperationalDashboard() {
    return this.get('/operational');
  }

  async getFinancialDashboard() {
    return this.get('/financial');
  }

  async getComplianceDashboard() {
    return this.get('/compliance');
  }

  async getSystemHealth() {
    return this.get('/system-health');
  }

  async getRealTimeMetrics() {
    return this.get('/real-time-metrics');
  }
}

// Financial Management Service
export class FinancialService extends ApiService {
  constructor() {
    super('/financial');
  }

  // Chart of Accounts
  async getChartOfAccounts() {
    return this.get('/chart-of-accounts');
  }

  async createAccount(account: any) {
    return this.post('/chart-of-accounts', account);
  }

  async updateAccount(id: string, account: any) {
    return this.put(`/chart-of-accounts/${id}`, account);
  }

  // Journal Entries
  async getJournalEntries(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`/journal-entries?${params}`);
  }

  async createJournalEntry(entry: any) {
    return this.post('/journal-entries', entry);
  }

  async approveJournalEntry(id: string) {
    return this.patch(`/journal-entries/${id}/approve`);
  }

  // Financial Reports
  async getBalanceSheet(period: string) {
    return this.get(`/reports/balance-sheet?period=${period}`);
  }

  async getProfitLoss(period: string) {
    return this.get(`/reports/profit-loss?period=${period}`);
  }

  async getCashFlow(period: string) {
    return this.get(`/reports/cash-flow?period=${period}`);
  }

  // Tax Management
  async getTaxCalculations(period: string) {
    return this.get(`/tax/calculations?period=${period}`);
  }

  async submitTaxReturn(data: any) {
    return this.post('/tax/returns', data);
  }

  // Fixed Assets
  async getFixedAssets() {
    return this.get('/fixed-assets');
  }

  async calculateDepreciation(assetId: string) {
    return this.post(`/fixed-assets/${assetId}/depreciation`);
  }
}

// Human Resources Service
export class HRService extends ApiService {
  constructor() {
    super('/hr');
  }

  // Employee Management
  async getEmployees() {
    return this.get('/employees');
  }

  async createEmployee(employee: any) {
    return this.post('/employees', employee);
  }

  async updateEmployee(id: string, employee: any) {
    return this.put(`/employees/${id}`, employee);
  }

  async getEmployee(id: string) {
    return this.get(`/employees/${id}`);
  }

  // Payroll
  async getPayroll(period: string) {
    return this.get(`/payroll?period=${period}`);
  }

  async processPayroll(data: any) {
    return this.post('/payroll/process', data);
  }

  async getPayslip(employeeId: string, period: string) {
    return this.get(`/payroll/payslip/${employeeId}?period=${period}`);
  }

  // Leave Management
  async getLeaveRequests() {
    return this.get('/leave-requests');
  }

  async submitLeaveRequest(request: any) {
    return this.post('/leave-requests', request);
  }

  async approveLeaveRequest(id: string) {
    return this.patch(`/leave-requests/${id}/approve`);
  }

  // Performance Management
  async getPerformanceReviews() {
    return this.get('/performance-reviews');
  }

  async createPerformanceReview(review: any) {
    return this.post('/performance-reviews', review);
  }
}

// Operations Management Service
export class OperationsService extends ApiService {
  constructor() {
    super('/operations');
  }

  // Station Management
  async getStations() {
    return this.get('/stations');
  }

  async getStation(id: string) {
    return this.get(`/stations/${id}`);
  }

  async createStation(station: any) {
    return this.post('/stations', station);
  }

  async updateStation(id: string, station: any) {
    return this.put(`/stations/${id}`, station);
  }

  // Inventory Management
  async getInventory() {
    return this.get('/inventory');
  }

  async getTankLevels() {
    return this.get('/inventory/tank-levels');
  }

  async updateInventory(data: any) {
    return this.post('/inventory/update', data);
  }

  // Fleet Management
  async getFleet() {
    return this.get('/fleet');
  }

  async getVehicleTracking() {
    return this.get('/fleet/tracking');
  }

  async scheduleDelivery(delivery: any) {
    return this.post('/fleet/deliveries', delivery);
  }

  // Supply Chain
  async getSupplyChainOrders() {
    return this.get('/supply-chain/orders');
  }

  async createPurchaseOrder(order: any) {
    return this.post('/supply-chain/purchase-orders', order);
  }

  async getVendors() {
    return this.get('/supply-chain/vendors');
  }
}

// Customer Relationship Management Service
export class CRMService extends ApiService {
  constructor() {
    super('/crm');
  }

  // Customer Management
  async getCustomers() {
    return this.get('/customers');
  }

  async getCustomer(id: string) {
    return this.get(`/customers/${id}`);
  }

  async createCustomer(customer: any) {
    return this.post('/customers', customer);
  }

  async updateCustomer(id: string, customer: any) {
    return this.put(`/customers/${id}`, customer);
  }

  // Lead Management
  async getLeads() {
    return this.get('/leads');
  }

  async convertLead(id: string) {
    return this.post(`/leads/${id}/convert`);
  }

  // Loyalty Program
  async getLoyaltyPrograms() {
    return this.get('/loyalty');
  }

  async getCustomerPoints(customerId: string) {
    return this.get(`/loyalty/points/${customerId}`);
  }

  // Customer Service
  async getTickets() {
    return this.get('/tickets');
  }

  async createTicket(ticket: any) {
    return this.post('/tickets', ticket);
  }

  async updateTicketStatus(id: string, status: string) {
    return this.patch(`/tickets/${id}/status`, { status });
  }
}

// Pricing and UPPF Service
export class PricingService extends ApiService {
  constructor() {
    super('/pricing');
  }

  // Price Windows
  async getPriceWindows() {
    return this.get('/windows');
  }

  async createPriceWindow(window: any) {
    return this.post('/windows', window);
  }

  async activatePriceWindow(id: string) {
    return this.patch(`/windows/${id}/activate`);
  }

  // PBU Components
  async getPBUComponents() {
    return this.get('/pbu-components');
  }

  async updatePBUComponent(id: string, component: any) {
    return this.put(`/pbu-components/${id}`, component);
  }

  // UPPF Claims
  async getUPPFClaims() {
    return this.get('/uppf-claims');
  }

  async createUPPFClaim(claim: any) {
    return this.post('/uppf-claims', claim);
  }

  async submitUPPFClaim(id: string) {
    return this.patch(`/uppf-claims/${id}/submit`);
  }

  // Dealer Settlements
  async getDealerSettlements() {
    return this.get('/dealer-settlements');
  }

  async processSettlement(settlementId: string) {
    return this.post(`/dealer-settlements/${settlementId}/process`);
  }
}

// Compliance and Risk Service
export class ComplianceService extends ApiService {
  constructor() {
    super('/compliance');
  }

  // Risk Management
  async getRiskAssessments() {
    return this.get('/risks');
  }

  async createRiskAssessment(risk: any) {
    return this.post('/risks', risk);
  }

  // Internal Audit
  async getAuditFindings() {
    return this.get('/audits');
  }

  async createAuditFinding(finding: any) {
    return this.post('/audits', finding);
  }

  // Contract Management
  async getContracts() {
    return this.get('/contracts');
  }

  async renewContract(id: string) {
    return this.post(`/contracts/${id}/renew`);
  }

  // Quality Management
  async getQualityChecks() {
    return this.get('/quality-checks');
  }

  async recordQualityCheck(check: any) {
    return this.post('/quality-checks', check);
  }
}

// Regulatory Compliance Service (Ghana-specific)
export class RegulatoryService extends ApiService {
  constructor() {
    super('/regulatory');
  }

  // NPA Compliance
  async getNPALicenses() {
    return this.get('/npa/licenses');
  }

  async submitNPAReport(report: any) {
    return this.post('/npa/reports', report);
  }

  // EPA Environmental
  async getEPAMonitoring() {
    return this.get('/epa/monitoring');
  }

  async submitEPAReport(report: any) {
    return this.post('/epa/reports', report);
  }

  // GRA Tax Integration
  async getGRAIntegration() {
    return this.get('/gra/integration');
  }

  async submitGRAFiling(filing: any) {
    return this.post('/gra/filings', filing);
  }

  // BOG Forex Reporting
  async getBOGReports() {
    return this.get('/bog/reports');
  }

  async submitBOGReport(report: any) {
    return this.post('/bog/reports', report);
  }

  // UPPF Claims (duplicate reference for regulatory view)
  async getUPPFStatus() {
    return this.get('/uppf/status');
  }

  // Local Content Tracking
  async getLocalContentTracking() {
    return this.get('/local-content');
  }

  async updateLocalContentData(data: any) {
    return this.post('/local-content', data);
  }
}

// Transaction Service
export class TransactionService extends ApiService {
  constructor() {
    super('/transactions');
  }

  async getTransactions(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`?${params}`);
  }

  async getTransaction(id: string) {
    return this.get(`/${id}`);
  }

  async createTransaction(transaction: any) {
    return this.post('', transaction);
  }

  async updateTransaction(id: string, transaction: any) {
    return this.put(`/${id}`, transaction);
  }

  async getTransactionStats() {
    return this.get('/stats');
  }

  async getLiveTransactions() {
    return this.get('/live');
  }
}

// Configuration Service
export class ConfigurationService extends ApiService {
  constructor() {
    super('/configuration');
  }

  async getAllConfigurations() {
    return this.get('/all');
  }

  async getConfiguration(module: string) {
    return this.get(`/${module}`);
  }

  async updateConfiguration(module: string, config: any) {
    return this.put(`/${module}`, config);
  }

  async resetConfiguration(module: string) {
    return this.post(`/${module}/reset`);
  }
}

// Real-time WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'transaction_update':
        // Update transaction UI
        break;
      case 'inventory_alert':
        // Show inventory alert
        break;
      case 'system_alert':
        // Show system alert
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

// Product Management Service
export class ProductService extends ApiService {
  constructor() {
    super('/products');
  }

  // Product CRUD Operations
  async getProducts(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`?${params}`);
  }

  async getProduct(id: string) {
    return this.get(`/${id}`);
  }

  async createProduct(product: any) {
    return this.post('', product);
  }

  async updateProduct(id: string, product: any) {
    return this.put(`/${id}`, product);
  }

  async deleteProduct(id: string) {
    return this.delete(`/${id}`);
  }

  async bulkUpdateProducts(products: any[]) {
    return this.post('/bulk-update', { products });
  }

  // Product Categories
  async getCategories() {
    return this.get('/categories');
  }

  async createCategory(category: any) {
    return this.post('/categories', category);
  }

  async updateCategory(id: string, category: any) {
    return this.put(`/categories/${id}`, category);
  }

  async deleteCategory(id: string) {
    return this.delete(`/categories/${id}`);
  }

  // Product Pricing Rules
  async getPricingRules() {
    return this.get('/pricing-rules');
  }

  async createPricingRule(rule: any) {
    return this.post('/pricing-rules', rule);
  }

  async updatePricingRule(id: string, rule: any) {
    return this.put(`/pricing-rules/${id}`, rule);
  }

  async deletePricingRule(id: string) {
    return this.delete(`/pricing-rules/${id}`);
  }

  async activatePricingRule(id: string) {
    return this.patch(`/pricing-rules/${id}/activate`);
  }

  async deactivatePricingRule(id: string) {
    return this.patch(`/pricing-rules/${id}/deactivate`);
  }

  // Product Analytics
  async getProductAnalytics(productId?: string) {
    const endpoint = productId ? `/analytics/${productId}` : '/analytics';
    return this.get(endpoint);
  }

  async getProductSalesData(productId: string, period: string) {
    return this.get(`/analytics/${productId}/sales?period=${period}`);
  }

  async getProductInventoryData(productId: string) {
    return this.get(`/analytics/${productId}/inventory`);
  }

  async getProductProfitability(period: string) {
    return this.get(`/analytics/profitability?period=${period}`);
  }

  async getTopSellingProducts(limit?: number) {
    return this.get(`/analytics/top-selling?limit=${limit || 10}`);
  }

  // Bulk Operations
  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async exportProducts(format: 'csv' | 'xlsx' = 'xlsx') {
    const response = await apiClient.get(`${this.baseUrl}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Product Specifications
  async getProductSpecifications(productId: string) {
    return this.get(`/${productId}/specifications`);
  }

  async updateProductSpecifications(productId: string, specifications: any) {
    return this.put(`/${productId}/specifications`, specifications);
  }
}

// Analytics Service
export class AnalyticsService extends ApiService {
  constructor() {
    super('/analytics');
  }

  // Sales Analytics
  async getSalesAnalytics(period: string = '30d', filters?: any) {
    const params = new URLSearchParams({ period, ...filters }).toString();
    return this.get(`/sales?${params}`);
  }

  async getSalesMetrics() {
    return this.get('/sales/metrics');
  }

  async getSalesTrends(period: string = '12m') {
    return this.get(`/sales/trends?period=${period}`);
  }

  async getTopCustomers(limit: number = 10) {
    return this.get(`/sales/top-customers?limit=${limit}`);
  }

  async getSalesForecasting(horizon: string = '3m') {
    return this.get(`/sales/forecasting?horizon=${horizon}`);
  }

  // Inventory Analytics
  async getInventoryAnalytics() {
    return this.get('/inventory');
  }

  async getInventoryTurnover(period: string = '12m') {
    return this.get(`/inventory/turnover?period=${period}`);
  }

  async getStockoutAnalysis() {
    return this.get('/inventory/stockout-analysis');
  }

  async getInventoryValuation() {
    return this.get('/inventory/valuation');
  }

  async getSlowMovingStock(threshold: number = 90) {
    return this.get(`/inventory/slow-moving?threshold=${threshold}`);
  }

  // Financial Analytics
  async getFinancialAnalytics(period: string = '12m') {
    return this.get(`/financial?period=${period}`);
  }

  async getProfitabilityAnalysis(period: string = '12m') {
    return this.get(`/financial/profitability?period=${period}`);
  }

  async getCashFlowAnalysis() {
    return this.get('/financial/cash-flow');
  }

  async getExpenseAnalysis(period: string = '12m') {
    return this.get(`/financial/expenses?period=${period}`);
  }

  async getRevenueAnalysis(period: string = '12m') {
    return this.get(`/financial/revenue?period=${period}`);
  }

  async getFinancialRatios() {
    return this.get('/financial/ratios');
  }

  // Operational Analytics
  async getOperationalAnalytics() {
    return this.get('/operational');
  }

  async getEfficiencyMetrics() {
    return this.get('/operational/efficiency');
  }

  async getCapacityUtilization() {
    return this.get('/operational/capacity-utilization');
  }

  async getDowntimeAnalysis() {
    return this.get('/operational/downtime');
  }

  async getProductivityMetrics() {
    return this.get('/operational/productivity');
  }

  async getQualityMetrics() {
    return this.get('/operational/quality');
  }

  // Real-time Analytics
  async getRealTimeMetrics() {
    return this.get('/real-time');
  }

  async getLiveTransactionData() {
    return this.get('/real-time/transactions');
  }

  async getLiveInventoryLevels() {
    return this.get('/real-time/inventory');
  }

  async getSystemPerformance() {
    return this.get('/real-time/system-performance');
  }

  // Custom Reports
  async generateCustomReport(config: any) {
    return this.post('/reports/custom', config);
  }

  async getReportHistory() {
    return this.get('/reports/history');
  }

  async scheduleReport(config: any) {
    return this.post('/reports/schedule', config);
  }
}

// Reports Service
export class ReportsService extends ApiService {
  constructor() {
    super('/reports');
  }

  // Sales Reports
  async getSalesReports(period: string = '1m', format: 'json' | 'pdf' | 'xlsx' = 'json') {
    return this.get(`/sales?period=${period}&format=${format}`);
  }

  async getDailySalesReport(date: string) {
    return this.get(`/sales/daily?date=${date}`);
  }

  async getMonthlySalesReport(month: string, year: string) {
    return this.get(`/sales/monthly?month=${month}&year=${year}`);
  }

  async getSalesPerformanceReport(period: string = '3m') {
    return this.get(`/sales/performance?period=${period}`);
  }

  // Inventory Reports
  async getInventoryReports(asOf?: string) {
    const params = asOf ? `?asOf=${asOf}` : '';
    return this.get(`/inventory${params}`);
  }

  async getStockMovementReport(period: string = '1m') {
    return this.get(`/inventory/stock-movement?period=${period}`);
  }

  async getInventoryAgeingReport() {
    return this.get('/inventory/ageing');
  }

  async getStockReconciliationReport(date: string) {
    return this.get(`/inventory/reconciliation?date=${date}`);
  }

  // Financial Reports
  async getFinancialReports(period: string = '1m') {
    return this.get(`/financial?period=${period}`);
  }

  async getIncomeStatement(period: string) {
    return this.get(`/financial/income-statement?period=${period}`);
  }

  async getBalanceSheetReport(asOf: string) {
    return this.get(`/financial/balance-sheet?asOf=${asOf}`);
  }

  async getCashFlowReport(period: string) {
    return this.get(`/financial/cash-flow?period=${period}`);
  }

  async getTrialBalance(asOf: string) {
    return this.get(`/financial/trial-balance?asOf=${asOf}`);
  }

  async getGeneralLedgerReport(accountId?: string, period?: string) {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (period) params.append('period', period);
    return this.get(`/financial/general-ledger?${params.toString()}`);
  }

  // Regulatory Reports
  async getRegulatoryReports() {
    return this.get('/regulatory');
  }

  async getNPAReport(period: string) {
    return this.get(`/regulatory/npa?period=${period}`);
  }

  async getEPAReport(period: string) {
    return this.get(`/regulatory/epa?period=${period}`);
  }

  async getGRAReport(period: string) {
    return this.get(`/regulatory/gra?period=${period}`);
  }

  async getBOGReport(period: string) {
    return this.get(`/regulatory/bog?period=${period}`);
  }

  async getUPPFReport(period: string) {
    return this.get(`/regulatory/uppf?period=${period}`);
  }

  async getLocalContentReport(period: string) {
    return this.get(`/regulatory/local-content?period=${period}`);
  }

  // Report Export and Scheduling
  async exportReport(reportId: string, format: 'pdf' | 'xlsx' | 'csv') {
    const response = await apiClient.get(`${this.baseUrl}/export/${reportId}?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async scheduleReport(config: any) {
    return this.post('/schedule', config);
  }

  async getScheduledReports() {
    return this.get('/scheduled');
  }

  async cancelScheduledReport(id: string) {
    return this.delete(`/scheduled/${id}`);
  }

  // Report Templates
  async getReportTemplates() {
    return this.get('/templates');
  }

  async createReportTemplate(template: any) {
    return this.post('/templates', template);
  }

  async updateReportTemplate(id: string, template: any) {
    return this.put(`/templates/${id}`, template);
  }

  async deleteReportTemplate(id: string) {
    return this.delete(`/templates/${id}`);
  }
}

// Dealer Management Service
export class DealerService extends ApiService {
  constructor() {
    super('/dealers');
  }

  // Dealer Management
  async getDealers() {
    return this.get('/');
  }

  async getDealer(id: string) {
    return this.get(`/${id}`);
  }

  async createDealer(dealer: any) {
    return this.post('/', dealer);
  }

  async updateDealer(id: string, dealer: any) {
    return this.put(`/${id}`, dealer);
  }

  async onboardDealer(dealerData: any) {
    return this.post('/onboard', dealerData);
  }

  // Dealer Performance
  async getDealerPerformance(id?: string) {
    return this.get(id ? `/performance/${id}` : '/performance');
  }

  async getDealerAnalytics() {
    return this.get('/analytics');
  }

  // Dealer Loans
  async getDealerLoans(dealerId?: string) {
    return this.get(dealerId ? `/loans?dealerId=${dealerId}` : '/loans');
  }

  async createLoan(loanData: any) {
    return this.post('/loans', loanData);
  }

  async processLoan(loanId: string, action: string) {
    return this.post(`/loans/${loanId}/${action}`);
  }

  async getLoanHistory(dealerId: string) {
    return this.get(`/loans/history/${dealerId}`);
  }

  // Dealer Compliance
  async getDealerCompliance(dealerId?: string) {
    return this.get(dealerId ? `/compliance/${dealerId}` : '/compliance');
  }

  async runComplianceCheck(dealerId: string) {
    return this.post(`/compliance/check/${dealerId}`);
  }

  // Dealer Settlements
  async getDealerSettlements(dealerId?: string) {
    return this.get(dealerId ? `/settlements?dealerId=${dealerId}` : '/settlements');
  }

  async processSettlement(settlementId: string) {
    return this.post(`/settlements/${settlementId}/process`);
  }

  async getSettlementHistory(dealerId: string) {
    return this.get(`/settlements/history/${dealerId}`);
  }

  // Dealer Credit Management
  async getCreditAnalysis(dealerId: string) {
    return this.get(`/credit/${dealerId}`);
  }

  async updateCreditLimit(dealerId: string, limit: number) {
    return this.put(`/credit/${dealerId}/limit`, { limit });
  }

  // Dealer Reporting
  async getDealerReports(type: string, filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`/reports/${type}?${params}`);
  }

  async generateDealerReport(dealerId: string, reportType: string) {
    return this.post(`/reports/generate`, { dealerId, reportType });
  }
}

// IFRS Compliance Service
export class IFRSService extends ApiService {
  constructor() {
    super('/ifrs');
  }

  // IFRS Dashboard
  async getIFRSDashboard() {
    return this.get('/dashboard');
  }

  // Revenue Recognition (IFRS 15)
  async getRevenueRecognition() {
    return this.get('/revenue-recognition');
  }

  async processRevenueRecognition(data: any) {
    return this.post('/revenue-recognition', data);
  }

  // Expected Credit Loss (IFRS 9)
  async getExpectedCreditLoss() {
    return this.get('/expected-credit-loss');
  }

  async calculateECL(data: any) {
    return this.post('/expected-credit-loss/calculate', data);
  }

  // Lease Accounting (IFRS 16)
  async getLeaseAccounting() {
    return this.get('/lease-accounting');
  }

  async processLeaseContract(leaseData: any) {
    return this.post('/lease-accounting/contracts', leaseData);
  }

  // Asset Impairment
  async getAssetImpairment() {
    return this.get('/asset-impairment');
  }

  async performImpairmentTest(assetId: string) {
    return this.post(`/asset-impairment/test/${assetId}`);
  }

  // IFRS Disclosures
  async getDisclosures() {
    return this.get('/disclosures');
  }

  async generateDisclosures(period: string) {
    return this.post('/disclosures/generate', { period });
  }

  // IFRS Compliance Reporting
  async getComplianceReport(period: string) {
    return this.get(`/compliance/report?period=${period}`);
  }

  async submitComplianceReport(reportData: any) {
    return this.post('/compliance/submit', reportData);
  }

  // IFRS Analytics
  async getIFRSAnalytics() {
    return this.get('/analytics');
  }
}

// Fleet Management Service
export class FleetService extends ApiService {
  constructor() {
    super('/fleet');
  }

  // Vehicle Management
  async getVehicles() {
    return this.get('/vehicles');
  }

  async getVehicle(id: string) {
    return this.get(`/vehicles/${id}`);
  }

  async createVehicle(vehicle: any) {
    return this.post('/vehicles', vehicle);
  }

  async updateVehicle(id: string, vehicle: any) {
    return this.put(`/vehicles/${id}`, vehicle);
  }

  async deleteVehicle(id: string) {
    return this.delete(`/vehicles/${id}`);
  }

  // Driver Management
  async getDrivers() {
    return this.get('/drivers');
  }

  async getDriver(id: string) {
    return this.get(`/drivers/${id}`);
  }

  async createDriver(driver: any) {
    return this.post('/drivers', driver);
  }

  async updateDriver(id: string, driver: any) {
    return this.put(`/drivers/${id}`, driver);
  }

  async assignDriver(driverId: string, vehicleId: string) {
    return this.post(`/drivers/${driverId}/assign`, { vehicleId });
  }

  async unassignDriver(driverId: string) {
    return this.post(`/drivers/${driverId}/unassign`);
  }

  // GPS Tracking
  async getVehicleLocation(vehicleId: string) {
    return this.get(`/tracking/${vehicleId}`);
  }

  async getAllVehicleLocations() {
    return this.get('/tracking/all');
  }

  async getVehicleRoute(vehicleId: string, startDate: string, endDate: string) {
    return this.get(`/tracking/${vehicleId}/route?start=${startDate}&end=${endDate}`);
  }

  async getGeofenceAlerts() {
    return this.get('/tracking/geofence-alerts');
  }

  // Maintenance Management
  async getMaintenanceSchedules() {
    return this.get('/maintenance/schedules');
  }

  async scheduleMaintenancePlan(plan: any) {
    return this.post('/maintenance/schedules', plan);
  }

  async getMaintenanceHistory(vehicleId: string) {
    return this.get(`/maintenance/history/${vehicleId}`);
  }

  async recordMaintenanceLog(log: any) {
    return this.post('/maintenance/logs', log);
  }

  async getUpcomingMaintenance() {
    return this.get('/maintenance/upcoming');
  }

  // Delivery Management
  async getDeliveries(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`/deliveries?${params}`);
  }

  async createDelivery(delivery: any) {
    return this.post('/deliveries', delivery);
  }

  async updateDeliveryStatus(id: string, status: string) {
    return this.patch(`/deliveries/${id}/status`, { status });
  }

  async optimizeRoute(deliveries: string[]) {
    return this.post('/deliveries/optimize-route', { deliveries });
  }

  async getDeliveryReport(dateRange: { start: string; end: string }) {
    return this.get(`/deliveries/reports?start=${dateRange.start}&end=${dateRange.end}`);
  }

  // Fleet Analytics
  async getFleetMetrics() {
    return this.get('/analytics/metrics');
  }

  async getFuelConsumption(period: string) {
    return this.get(`/analytics/fuel-consumption?period=${period}`);
  }

  async getVehicleUtilization() {
    return this.get('/analytics/utilization');
  }

  async getMaintenanceCosts(period: string) {
    return this.get(`/analytics/maintenance-costs?period=${period}`);
  }
}

// Daily Delivery Management Service
export class DailyDeliveryService extends ApiService {
  constructor() {
    super('/daily-deliveries');
  }

  // Daily Delivery CRUD Operations
  async getDailyDeliveries(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`?${params}`);
  }

  async getDailyDelivery(id: string) {
    return this.get(`/${id}`);
  }

  async createDailyDelivery(delivery: any) {
    return this.post('', delivery);
  }

  async updateDailyDelivery(id: string, delivery: any) {
    return this.put(`/${id}`, delivery);
  }

  async deleteDailyDelivery(id: string) {
    return this.delete(`/${id}`);
  }

  // Bulk operations
  async bulkCreateDeliveries(deliveries: any[]) {
    return this.post('/bulk', { deliveries });
  }

  async bulkUpdateDeliveries(updates: any[]) {
    return this.put('/bulk', { updates });
  }

  async importDeliveries(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async exportDeliveries(filters?: any, format: 'csv' | 'xlsx' = 'xlsx') {
    const params = new URLSearchParams({ ...filters, format }).toString();
    const response = await apiClient.get(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Approval Workflow
  async submitForApproval(id: string) {
    return this.patch(`/${id}/submit-approval`);
  }

  async approveDelivery(id: string, comments?: string) {
    return this.patch(`/${id}/approve`, { comments });
  }

  async rejectDelivery(id: string, reason: string) {
    return this.patch(`/${id}/reject`, { reason });
  }

  async getPendingApprovals() {
    return this.get('/pending-approvals');
  }

  async getApprovalHistory(id: string) {
    return this.get(`/${id}/approval-history`);
  }

  // Invoice Generation
  async generateSupplierInvoice(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}/supplier-invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async generateCustomerInvoice(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}/customer-invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async bulkGenerateInvoices(ids: string[], type: 'supplier' | 'customer') {
    const response = await apiClient.post(`${this.baseUrl}/bulk-generate-invoices`, 
      { ids, type }, 
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Ghana-specific Compliance
  async validateGhanaCompliance(delivery: any) {
    return this.post('/validate-compliance', delivery);
  }

  async generateNPAReport(dateRange: { start: string; end: string }) {
    return this.get(`/npa-report?start=${dateRange.start}&end=${dateRange.end}`);
  }

  async generateGRAReport(dateRange: { start: string; end: string }) {
    return this.get(`/gra-report?start=${dateRange.start}&end=${dateRange.end}`);
  }

  async generateEPAReport(dateRange: { start: string; end: string }) {
    return this.get(`/epa-report?start=${dateRange.start}&end=${dateRange.end}`);
  }

  // Analytics and Reporting
  async getDailyDeliveryMetrics(period?: string) {
    return this.get(`/metrics${period ? `?period=${period}` : ''}`);
  }

  async getDeliveryTrends(period: string = '30d') {
    return this.get(`/trends?period=${period}`);
  }

  async getSupplierPerformance() {
    return this.get('/supplier-performance');
  }

  async getCustomerAnalytics() {
    return this.get('/customer-analytics');
  }

  async getComplianceReport(period: string) {
    return this.get(`/compliance-report?period=${period}`);
  }

  // Real-time Features
  async getRealtimeUpdates() {
    return this.get('/realtime-updates');
  }

  async subscribeToUpdates(deliveryIds: string[]) {
    return this.post('/subscribe-updates', { deliveryIds });
  }

  async unsubscribeFromUpdates(deliveryIds: string[]) {
    return this.post('/unsubscribe-updates', { deliveryIds });
  }

  // Validation and Verification
  async validateDeliveryData(data: any) {
    return this.post('/validate', data);
  }

  async verifySupplierData(supplierCode: string) {
    return this.get(`/verify-supplier/${supplierCode}`);
  }

  async verifyCustomerData(customerCode: string) {
    return this.get(`/verify-customer/${customerCode}`);
  }

  async checkDuplicateDelivery(deliveryData: any) {
    return this.post('/check-duplicate', deliveryData);
  }

  // Templates and Configuration
  async getDeliveryTemplates() {
    return this.get('/templates');
  }

  async createDeliveryTemplate(template: any) {
    return this.post('/templates', template);
  }

  async updateDeliveryTemplate(id: string, template: any) {
    return this.put(`/templates/${id}`, template);
  }

  async deleteDeliveryTemplate(id: string) {
    return this.delete(`/templates/${id}`);
  }

  // Master Data Integration
  async getSuppliers() {
    return this.get('/master-data/suppliers');
  }

  async getDepots() {
    return this.get('/master-data/depots');
  }

  async getTransporters() {
    return this.get('/master-data/transporters');
  }

  async getProducts() {
    return this.get('/master-data/products');
  }

  // Audit and History
  async getAuditTrail(id: string) {
    return this.get(`/${id}/audit-trail`);
  }

  async getChangeHistory(id: string) {
    return this.get(`/${id}/change-history`);
  }
}

// Export service instances
export const authService = new AuthService();
export const dashboardService = new DashboardService();
export const financialService = new FinancialService();
export const hrService = new HRService();
export const operationsService = new OperationsService();
export const crmService = new CRMService();
export const pricingService = new PricingService();
export const complianceService = new ComplianceService();
export const regulatoryService = new RegulatoryService();
export const transactionService = new TransactionService();
export const configurationService = new ConfigurationService();
export const productService = new ProductService();
export const analyticsService = new AnalyticsService();
export const reportsService = new ReportsService();
export const dealerService = new DealerService();
export const ifrsService = new IFRSService();
export const fleetService = new FleetService();
export const dailyDeliveryService = new DailyDeliveryService();
export const wsService = new WebSocketService();

// Export default API client
export default apiClient;