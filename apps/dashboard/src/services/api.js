"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = exports.dailyDeliveryService = exports.fleetService = exports.ifrsService = exports.dealerService = exports.reportsService = exports.analyticsService = exports.productService = exports.configurationService = exports.transactionService = exports.regulatoryService = exports.complianceService = exports.pricingService = exports.crmService = exports.operationsService = exports.hrService = exports.financialService = exports.dashboardService = exports.authService = exports.DailyDeliveryService = exports.FleetService = exports.IFRSService = exports.DealerService = exports.ReportsService = exports.AnalyticsService = exports.ProductService = exports.WebSocketService = exports.ConfigurationService = exports.TransactionService = exports.RegulatoryService = exports.ComplianceService = exports.PricingService = exports.CRMService = exports.OperationsService = exports.HRService = exports.FinancialService = exports.DashboardService = exports.AuthService = exports.ApiService = exports.apiClient = void 0;
/**
 * Comprehensive API Service Layer for Ghana OMC ERP System
 * Handles all backend service integrations with error handling and caching
 */
const axios_1 = __importDefault(require("axios"));
const react_hot_toast_1 = require("react-hot-toast");
// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3010';
// Create axios instance with default configuration
exports.apiClient = axios_1.default.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
// Request interceptor for authentication
exports.apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
// Response interceptor for error handling
exports.apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
    }
    const message = error.response?.data?.message || 'An error occurred';
    react_hot_toast_1.toast.error(message);
    return Promise.reject(error);
});
// Generic API service class
class ApiService {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async get(endpoint) {
        const response = await exports.apiClient.get(`${this.baseUrl}${endpoint}`);
        return response.data;
    }
    async post(endpoint, data) {
        const response = await exports.apiClient.post(`${this.baseUrl}${endpoint}`, data);
        return response.data;
    }
    async put(endpoint, data) {
        const response = await exports.apiClient.put(`${this.baseUrl}${endpoint}`, data);
        return response.data;
    }
    async patch(endpoint, data) {
        const response = await exports.apiClient.patch(`${this.baseUrl}${endpoint}`, data);
        return response.data;
    }
    async delete(endpoint) {
        const response = await exports.apiClient.delete(`${this.baseUrl}${endpoint}`);
        return response.data;
    }
}
exports.ApiService = ApiService;
// Authentication API Service
class AuthService extends ApiService {
    constructor() {
        super('/auth');
    }
    async login(credentials) {
        return this.post('/login', credentials);
    }
    async register(userData) {
        return this.post('/register', userData);
    }
    async logout() {
        return this.post('/logout');
    }
    async refreshToken() {
        return this.post('/refresh-token');
    }
    async forgotPassword(email) {
        return this.post('/forgot-password', { email });
    }
    async resetPassword(token, password) {
        return this.post('/reset-password', { token, password });
    }
    async changePassword(oldPassword, newPassword) {
        return this.post('/change-password', { oldPassword, newPassword });
    }
}
exports.AuthService = AuthService;
// Dashboard Analytics Service
class DashboardService extends ApiService {
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
exports.DashboardService = DashboardService;
// Financial Management Service
class FinancialService extends ApiService {
    constructor() {
        super('/financial');
    }
    // Chart of Accounts
    async getChartOfAccounts() {
        return this.get('/chart-of-accounts');
    }
    async createAccount(account) {
        return this.post('/chart-of-accounts', account);
    }
    async updateAccount(id, account) {
        return this.put(`/chart-of-accounts/${id}`, account);
    }
    // Journal Entries
    async getJournalEntries(filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`/journal-entries?${params}`);
    }
    async createJournalEntry(entry) {
        return this.post('/journal-entries', entry);
    }
    async approveJournalEntry(id) {
        return this.patch(`/journal-entries/${id}/approve`);
    }
    // Financial Reports
    async getBalanceSheet(period) {
        return this.get(`/reports/balance-sheet?period=${period}`);
    }
    async getProfitLoss(period) {
        return this.get(`/reports/profit-loss?period=${period}`);
    }
    async getCashFlow(period) {
        return this.get(`/reports/cash-flow?period=${period}`);
    }
    // Tax Management
    async getTaxCalculations(period) {
        return this.get(`/tax/calculations?period=${period}`);
    }
    async submitTaxReturn(data) {
        return this.post('/tax/returns', data);
    }
    // Fixed Assets
    async getFixedAssets() {
        return this.get('/fixed-assets');
    }
    async calculateDepreciation(assetId) {
        return this.post(`/fixed-assets/${assetId}/depreciation`);
    }
}
exports.FinancialService = FinancialService;
// Human Resources Service
class HRService extends ApiService {
    constructor() {
        super('/hr');
    }
    // Employee Management
    async getEmployees() {
        return this.get('/employees');
    }
    async createEmployee(employee) {
        return this.post('/employees', employee);
    }
    async updateEmployee(id, employee) {
        return this.put(`/employees/${id}`, employee);
    }
    async getEmployee(id) {
        return this.get(`/employees/${id}`);
    }
    // Payroll
    async getPayroll(period) {
        return this.get(`/payroll?period=${period}`);
    }
    async processPayroll(data) {
        return this.post('/payroll/process', data);
    }
    async getPayslip(employeeId, period) {
        return this.get(`/payroll/payslip/${employeeId}?period=${period}`);
    }
    // Leave Management
    async getLeaveRequests() {
        return this.get('/leave-requests');
    }
    async submitLeaveRequest(request) {
        return this.post('/leave-requests', request);
    }
    async approveLeaveRequest(id) {
        return this.patch(`/leave-requests/${id}/approve`);
    }
    // Performance Management
    async getPerformanceReviews() {
        return this.get('/performance-reviews');
    }
    async createPerformanceReview(review) {
        return this.post('/performance-reviews', review);
    }
}
exports.HRService = HRService;
// Operations Management Service
class OperationsService extends ApiService {
    constructor() {
        super('/operations');
    }
    // Station Management
    async getStations() {
        return this.get('/stations');
    }
    async getStation(id) {
        return this.get(`/stations/${id}`);
    }
    async createStation(station) {
        return this.post('/stations', station);
    }
    async updateStation(id, station) {
        return this.put(`/stations/${id}`, station);
    }
    // Inventory Management
    async getInventory() {
        return this.get('/inventory');
    }
    async getTankLevels() {
        return this.get('/inventory/tank-levels');
    }
    async updateInventory(data) {
        return this.post('/inventory/update', data);
    }
    // Fleet Management
    async getFleet() {
        return this.get('/fleet');
    }
    async getVehicleTracking() {
        return this.get('/fleet/tracking');
    }
    async scheduleDelivery(delivery) {
        return this.post('/fleet/deliveries', delivery);
    }
    // Supply Chain
    async getSupplyChainOrders() {
        return this.get('/supply-chain/orders');
    }
    async createPurchaseOrder(order) {
        return this.post('/supply-chain/purchase-orders', order);
    }
    async getVendors() {
        return this.get('/supply-chain/vendors');
    }
}
exports.OperationsService = OperationsService;
// Customer Relationship Management Service
class CRMService extends ApiService {
    constructor() {
        super('/crm');
    }
    // Customer Management
    async getCustomers() {
        return this.get('/customers');
    }
    async getCustomer(id) {
        return this.get(`/customers/${id}`);
    }
    async createCustomer(customer) {
        return this.post('/customers', customer);
    }
    async updateCustomer(id, customer) {
        return this.put(`/customers/${id}`, customer);
    }
    // Lead Management
    async getLeads() {
        return this.get('/leads');
    }
    async convertLead(id) {
        return this.post(`/leads/${id}/convert`);
    }
    // Loyalty Program
    async getLoyaltyPrograms() {
        return this.get('/loyalty');
    }
    async getCustomerPoints(customerId) {
        return this.get(`/loyalty/points/${customerId}`);
    }
    // Customer Service
    async getTickets() {
        return this.get('/tickets');
    }
    async createTicket(ticket) {
        return this.post('/tickets', ticket);
    }
    async updateTicketStatus(id, status) {
        return this.patch(`/tickets/${id}/status`, { status });
    }
}
exports.CRMService = CRMService;
// Pricing and UPPF Service
class PricingService extends ApiService {
    constructor() {
        super('/pricing');
    }
    // Price Windows
    async getPriceWindows() {
        return this.get('/windows');
    }
    async createPriceWindow(window) {
        return this.post('/windows', window);
    }
    async activatePriceWindow(id) {
        return this.patch(`/windows/${id}/activate`);
    }
    // PBU Components
    async getPBUComponents() {
        return this.get('/pbu-components');
    }
    async updatePBUComponent(id, component) {
        return this.put(`/pbu-components/${id}`, component);
    }
    // UPPF Claims
    async getUPPFClaims() {
        return this.get('/uppf-claims');
    }
    async createUPPFClaim(claim) {
        return this.post('/uppf-claims', claim);
    }
    async submitUPPFClaim(id) {
        return this.patch(`/uppf-claims/${id}/submit`);
    }
    // Dealer Settlements
    async getDealerSettlements() {
        return this.get('/dealer-settlements');
    }
    async processSettlement(settlementId) {
        return this.post(`/dealer-settlements/${settlementId}/process`);
    }
}
exports.PricingService = PricingService;
// Compliance and Risk Service
class ComplianceService extends ApiService {
    constructor() {
        super('/compliance');
    }
    // Risk Management
    async getRiskAssessments() {
        return this.get('/risks');
    }
    async createRiskAssessment(risk) {
        return this.post('/risks', risk);
    }
    // Internal Audit
    async getAuditFindings() {
        return this.get('/audits');
    }
    async createAuditFinding(finding) {
        return this.post('/audits', finding);
    }
    // Contract Management
    async getContracts() {
        return this.get('/contracts');
    }
    async renewContract(id) {
        return this.post(`/contracts/${id}/renew`);
    }
    // Quality Management
    async getQualityChecks() {
        return this.get('/quality-checks');
    }
    async recordQualityCheck(check) {
        return this.post('/quality-checks', check);
    }
}
exports.ComplianceService = ComplianceService;
// Regulatory Compliance Service (Ghana-specific)
class RegulatoryService extends ApiService {
    constructor() {
        super('/regulatory');
    }
    // NPA Compliance
    async getNPALicenses() {
        return this.get('/npa/licenses');
    }
    async submitNPAReport(report) {
        return this.post('/npa/reports', report);
    }
    // EPA Environmental
    async getEPAMonitoring() {
        return this.get('/epa/monitoring');
    }
    async submitEPAReport(report) {
        return this.post('/epa/reports', report);
    }
    // GRA Tax Integration
    async getGRAIntegration() {
        return this.get('/gra/integration');
    }
    async submitGRAFiling(filing) {
        return this.post('/gra/filings', filing);
    }
    // BOG Forex Reporting
    async getBOGReports() {
        return this.get('/bog/reports');
    }
    async submitBOGReport(report) {
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
    async updateLocalContentData(data) {
        return this.post('/local-content', data);
    }
}
exports.RegulatoryService = RegulatoryService;
// Transaction Service
class TransactionService extends ApiService {
    constructor() {
        super('/transactions');
    }
    async getTransactions(filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`?${params}`);
    }
    async getTransaction(id) {
        return this.get(`/${id}`);
    }
    async createTransaction(transaction) {
        return this.post('', transaction);
    }
    async updateTransaction(id, transaction) {
        return this.put(`/${id}`, transaction);
    }
    async getTransactionStats() {
        return this.get('/stats');
    }
    async getLiveTransactions() {
        return this.get('/live');
    }
}
exports.TransactionService = TransactionService;
// Configuration Service
class ConfigurationService extends ApiService {
    constructor() {
        super('/configuration');
    }
    async getAllConfigurations() {
        return this.get('/all');
    }
    async getConfiguration(module) {
        return this.get(`/${module}`);
    }
    async updateConfiguration(module, config) {
        return this.put(`/${module}`, config);
    }
    async resetConfiguration(module) {
        return this.post(`/${module}/reset`);
    }
}
exports.ConfigurationService = ConfigurationService;
// Real-time WebSocket Service
class WebSocketService {
    ws = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
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
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
        }
    }
    handleMessage(data) {
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
    send(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    disconnect() {
        this.ws?.close();
    }
}
exports.WebSocketService = WebSocketService;
// Product Management Service
class ProductService extends ApiService {
    constructor() {
        super('/products');
    }
    // Product CRUD Operations
    async getProducts(filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`?${params}`);
    }
    async getProduct(id) {
        return this.get(`/${id}`);
    }
    async createProduct(product) {
        return this.post('', product);
    }
    async updateProduct(id, product) {
        return this.put(`/${id}`, product);
    }
    async deleteProduct(id) {
        return this.delete(`/${id}`);
    }
    async bulkUpdateProducts(products) {
        return this.post('/bulk-update', { products });
    }
    // Product Categories
    async getCategories() {
        return this.get('/categories');
    }
    async createCategory(category) {
        return this.post('/categories', category);
    }
    async updateCategory(id, category) {
        return this.put(`/categories/${id}`, category);
    }
    async deleteCategory(id) {
        return this.delete(`/categories/${id}`);
    }
    // Product Pricing Rules
    async getPricingRules() {
        return this.get('/pricing-rules');
    }
    async createPricingRule(rule) {
        return this.post('/pricing-rules', rule);
    }
    async updatePricingRule(id, rule) {
        return this.put(`/pricing-rules/${id}`, rule);
    }
    async deletePricingRule(id) {
        return this.delete(`/pricing-rules/${id}`);
    }
    async activatePricingRule(id) {
        return this.patch(`/pricing-rules/${id}/activate`);
    }
    async deactivatePricingRule(id) {
        return this.patch(`/pricing-rules/${id}/deactivate`);
    }
    // Product Analytics
    async getProductAnalytics(productId) {
        const endpoint = productId ? `/analytics/${productId}` : '/analytics';
        return this.get(endpoint);
    }
    async getProductSalesData(productId, period) {
        return this.get(`/analytics/${productId}/sales?period=${period}`);
    }
    async getProductInventoryData(productId) {
        return this.get(`/analytics/${productId}/inventory`);
    }
    async getProductProfitability(period) {
        return this.get(`/analytics/profitability?period=${period}`);
    }
    async getTopSellingProducts(limit) {
        return this.get(`/analytics/top-selling?limit=${limit || 10}`);
    }
    // Bulk Operations
    async importProducts(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await exports.apiClient.post(`${this.baseUrl}/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async exportProducts(format = 'xlsx') {
        const response = await exports.apiClient.get(`${this.baseUrl}/export?format=${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }
    // Product Specifications
    async getProductSpecifications(productId) {
        return this.get(`/${productId}/specifications`);
    }
    async updateProductSpecifications(productId, specifications) {
        return this.put(`/${productId}/specifications`, specifications);
    }
}
exports.ProductService = ProductService;
// Analytics Service
class AnalyticsService extends ApiService {
    constructor() {
        super('/analytics');
    }
    // Sales Analytics
    async getSalesAnalytics(period = '30d', filters) {
        const params = new URLSearchParams({ period, ...filters }).toString();
        return this.get(`/sales?${params}`);
    }
    async getSalesMetrics() {
        return this.get('/sales/metrics');
    }
    async getSalesTrends(period = '12m') {
        return this.get(`/sales/trends?period=${period}`);
    }
    async getTopCustomers(limit = 10) {
        return this.get(`/sales/top-customers?limit=${limit}`);
    }
    async getSalesForecasting(horizon = '3m') {
        return this.get(`/sales/forecasting?horizon=${horizon}`);
    }
    // Inventory Analytics
    async getInventoryAnalytics() {
        return this.get('/inventory');
    }
    async getInventoryTurnover(period = '12m') {
        return this.get(`/inventory/turnover?period=${period}`);
    }
    async getStockoutAnalysis() {
        return this.get('/inventory/stockout-analysis');
    }
    async getInventoryValuation() {
        return this.get('/inventory/valuation');
    }
    async getSlowMovingStock(threshold = 90) {
        return this.get(`/inventory/slow-moving?threshold=${threshold}`);
    }
    // Financial Analytics
    async getFinancialAnalytics(period = '12m') {
        return this.get(`/financial?period=${period}`);
    }
    async getProfitabilityAnalysis(period = '12m') {
        return this.get(`/financial/profitability?period=${period}`);
    }
    async getCashFlowAnalysis() {
        return this.get('/financial/cash-flow');
    }
    async getExpenseAnalysis(period = '12m') {
        return this.get(`/financial/expenses?period=${period}`);
    }
    async getRevenueAnalysis(period = '12m') {
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
    async generateCustomReport(config) {
        return this.post('/reports/custom', config);
    }
    async getReportHistory() {
        return this.get('/reports/history');
    }
    async scheduleReport(config) {
        return this.post('/reports/schedule', config);
    }
}
exports.AnalyticsService = AnalyticsService;
// Reports Service
class ReportsService extends ApiService {
    constructor() {
        super('/reports');
    }
    // Sales Reports
    async getSalesReports(period = '1m', format = 'json') {
        return this.get(`/sales?period=${period}&format=${format}`);
    }
    async getDailySalesReport(date) {
        return this.get(`/sales/daily?date=${date}`);
    }
    async getMonthlySalesReport(month, year) {
        return this.get(`/sales/monthly?month=${month}&year=${year}`);
    }
    async getSalesPerformanceReport(period = '3m') {
        return this.get(`/sales/performance?period=${period}`);
    }
    // Inventory Reports
    async getInventoryReports(asOf) {
        const params = asOf ? `?asOf=${asOf}` : '';
        return this.get(`/inventory${params}`);
    }
    async getStockMovementReport(period = '1m') {
        return this.get(`/inventory/stock-movement?period=${period}`);
    }
    async getInventoryAgeingReport() {
        return this.get('/inventory/ageing');
    }
    async getStockReconciliationReport(date) {
        return this.get(`/inventory/reconciliation?date=${date}`);
    }
    // Financial Reports
    async getFinancialReports(period = '1m') {
        return this.get(`/financial?period=${period}`);
    }
    async getIncomeStatement(period) {
        return this.get(`/financial/income-statement?period=${period}`);
    }
    async getBalanceSheetReport(asOf) {
        return this.get(`/financial/balance-sheet?asOf=${asOf}`);
    }
    async getCashFlowReport(period) {
        return this.get(`/financial/cash-flow?period=${period}`);
    }
    async getTrialBalance(asOf) {
        return this.get(`/financial/trial-balance?asOf=${asOf}`);
    }
    async getGeneralLedgerReport(accountId, period) {
        const params = new URLSearchParams();
        if (accountId)
            params.append('accountId', accountId);
        if (period)
            params.append('period', period);
        return this.get(`/financial/general-ledger?${params.toString()}`);
    }
    // Regulatory Reports
    async getRegulatoryReports() {
        return this.get('/regulatory');
    }
    async getNPAReport(period) {
        return this.get(`/regulatory/npa?period=${period}`);
    }
    async getEPAReport(period) {
        return this.get(`/regulatory/epa?period=${period}`);
    }
    async getGRAReport(period) {
        return this.get(`/regulatory/gra?period=${period}`);
    }
    async getBOGReport(period) {
        return this.get(`/regulatory/bog?period=${period}`);
    }
    async getUPPFReport(period) {
        return this.get(`/regulatory/uppf?period=${period}`);
    }
    async getLocalContentReport(period) {
        return this.get(`/regulatory/local-content?period=${period}`);
    }
    // Report Export and Scheduling
    async exportReport(reportId, format) {
        const response = await exports.apiClient.get(`${this.baseUrl}/export/${reportId}?format=${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }
    async scheduleReport(config) {
        return this.post('/schedule', config);
    }
    async getScheduledReports() {
        return this.get('/scheduled');
    }
    async cancelScheduledReport(id) {
        return this.delete(`/scheduled/${id}`);
    }
    // Report Templates
    async getReportTemplates() {
        return this.get('/templates');
    }
    async createReportTemplate(template) {
        return this.post('/templates', template);
    }
    async updateReportTemplate(id, template) {
        return this.put(`/templates/${id}`, template);
    }
    async deleteReportTemplate(id) {
        return this.delete(`/templates/${id}`);
    }
}
exports.ReportsService = ReportsService;
// Dealer Management Service
class DealerService extends ApiService {
    constructor() {
        super('/dealers');
    }
    // Dealer Management
    async getDealers() {
        return this.get('/');
    }
    async getDealer(id) {
        return this.get(`/${id}`);
    }
    async createDealer(dealer) {
        return this.post('/', dealer);
    }
    async updateDealer(id, dealer) {
        return this.put(`/${id}`, dealer);
    }
    async onboardDealer(dealerData) {
        return this.post('/onboard', dealerData);
    }
    // Dealer Performance
    async getDealerPerformance(id) {
        return this.get(id ? `/performance/${id}` : '/performance');
    }
    async getDealerAnalytics() {
        return this.get('/analytics');
    }
    // Dealer Loans
    async getDealerLoans(dealerId) {
        return this.get(dealerId ? `/loans?dealerId=${dealerId}` : '/loans');
    }
    async createLoan(loanData) {
        return this.post('/loans', loanData);
    }
    async processLoan(loanId, action) {
        return this.post(`/loans/${loanId}/${action}`);
    }
    async getLoanHistory(dealerId) {
        return this.get(`/loans/history/${dealerId}`);
    }
    // Dealer Compliance
    async getDealerCompliance(dealerId) {
        return this.get(dealerId ? `/compliance/${dealerId}` : '/compliance');
    }
    async runComplianceCheck(dealerId) {
        return this.post(`/compliance/check/${dealerId}`);
    }
    // Dealer Settlements
    async getDealerSettlements(dealerId) {
        return this.get(dealerId ? `/settlements?dealerId=${dealerId}` : '/settlements');
    }
    async processSettlement(settlementId) {
        return this.post(`/settlements/${settlementId}/process`);
    }
    async getSettlementHistory(dealerId) {
        return this.get(`/settlements/history/${dealerId}`);
    }
    // Dealer Credit Management
    async getCreditAnalysis(dealerId) {
        return this.get(`/credit/${dealerId}`);
    }
    async updateCreditLimit(dealerId, limit) {
        return this.put(`/credit/${dealerId}/limit`, { limit });
    }
    // Dealer Reporting
    async getDealerReports(type, filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`/reports/${type}?${params}`);
    }
    async generateDealerReport(dealerId, reportType) {
        return this.post(`/reports/generate`, { dealerId, reportType });
    }
}
exports.DealerService = DealerService;
// IFRS Compliance Service
class IFRSService extends ApiService {
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
    async processRevenueRecognition(data) {
        return this.post('/revenue-recognition', data);
    }
    // Expected Credit Loss (IFRS 9)
    async getExpectedCreditLoss() {
        return this.get('/expected-credit-loss');
    }
    async calculateECL(data) {
        return this.post('/expected-credit-loss/calculate', data);
    }
    // Lease Accounting (IFRS 16)
    async getLeaseAccounting() {
        return this.get('/lease-accounting');
    }
    async processLeaseContract(leaseData) {
        return this.post('/lease-accounting/contracts', leaseData);
    }
    // Asset Impairment
    async getAssetImpairment() {
        return this.get('/asset-impairment');
    }
    async performImpairmentTest(assetId) {
        return this.post(`/asset-impairment/test/${assetId}`);
    }
    // IFRS Disclosures
    async getDisclosures() {
        return this.get('/disclosures');
    }
    async generateDisclosures(period) {
        return this.post('/disclosures/generate', { period });
    }
    // IFRS Compliance Reporting
    async getComplianceReport(period) {
        return this.get(`/compliance/report?period=${period}`);
    }
    async submitComplianceReport(reportData) {
        return this.post('/compliance/submit', reportData);
    }
    // IFRS Analytics
    async getIFRSAnalytics() {
        return this.get('/analytics');
    }
}
exports.IFRSService = IFRSService;
// Fleet Management Service
class FleetService extends ApiService {
    constructor() {
        super('/fleet');
    }
    // Vehicle Management
    async getVehicles() {
        return this.get('/vehicles');
    }
    async getVehicle(id) {
        return this.get(`/vehicles/${id}`);
    }
    async createVehicle(vehicle) {
        return this.post('/vehicles', vehicle);
    }
    async updateVehicle(id, vehicle) {
        return this.put(`/vehicles/${id}`, vehicle);
    }
    async deleteVehicle(id) {
        return this.delete(`/vehicles/${id}`);
    }
    // Driver Management
    async getDrivers() {
        return this.get('/drivers');
    }
    async getDriver(id) {
        return this.get(`/drivers/${id}`);
    }
    async createDriver(driver) {
        return this.post('/drivers', driver);
    }
    async updateDriver(id, driver) {
        return this.put(`/drivers/${id}`, driver);
    }
    async assignDriver(driverId, vehicleId) {
        return this.post(`/drivers/${driverId}/assign`, { vehicleId });
    }
    async unassignDriver(driverId) {
        return this.post(`/drivers/${driverId}/unassign`);
    }
    // GPS Tracking
    async getVehicleLocation(vehicleId) {
        return this.get(`/tracking/${vehicleId}`);
    }
    async getAllVehicleLocations() {
        return this.get('/tracking/all');
    }
    async getVehicleRoute(vehicleId, startDate, endDate) {
        return this.get(`/tracking/${vehicleId}/route?start=${startDate}&end=${endDate}`);
    }
    async getGeofenceAlerts() {
        return this.get('/tracking/geofence-alerts');
    }
    // Maintenance Management
    async getMaintenanceSchedules() {
        return this.get('/maintenance/schedules');
    }
    async scheduleMaintenancePlan(plan) {
        return this.post('/maintenance/schedules', plan);
    }
    async getMaintenanceHistory(vehicleId) {
        return this.get(`/maintenance/history/${vehicleId}`);
    }
    async recordMaintenanceLog(log) {
        return this.post('/maintenance/logs', log);
    }
    async getUpcomingMaintenance() {
        return this.get('/maintenance/upcoming');
    }
    // Delivery Management
    async getDeliveries(filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`/deliveries?${params}`);
    }
    async createDelivery(delivery) {
        return this.post('/deliveries', delivery);
    }
    async updateDeliveryStatus(id, status) {
        return this.patch(`/deliveries/${id}/status`, { status });
    }
    async optimizeRoute(deliveries) {
        return this.post('/deliveries/optimize-route', { deliveries });
    }
    async getDeliveryReport(dateRange) {
        return this.get(`/deliveries/reports?start=${dateRange.start}&end=${dateRange.end}`);
    }
    // Fleet Analytics
    async getFleetMetrics() {
        return this.get('/analytics/metrics');
    }
    async getFuelConsumption(period) {
        return this.get(`/analytics/fuel-consumption?period=${period}`);
    }
    async getVehicleUtilization() {
        return this.get('/analytics/utilization');
    }
    async getMaintenanceCosts(period) {
        return this.get(`/analytics/maintenance-costs?period=${period}`);
    }
}
exports.FleetService = FleetService;
// Daily Delivery Management Service
class DailyDeliveryService extends ApiService {
    constructor() {
        super('/daily-deliveries');
    }
    // Daily Delivery CRUD Operations
    async getDailyDeliveries(filters) {
        const params = new URLSearchParams(filters).toString();
        return this.get(`?${params}`);
    }
    async getDailyDelivery(id) {
        return this.get(`/${id}`);
    }
    async createDailyDelivery(delivery) {
        return this.post('', delivery);
    }
    async updateDailyDelivery(id, delivery) {
        return this.put(`/${id}`, delivery);
    }
    async deleteDailyDelivery(id) {
        return this.delete(`/${id}`);
    }
    // Bulk operations
    async bulkCreateDeliveries(deliveries) {
        return this.post('/bulk', { deliveries });
    }
    async bulkUpdateDeliveries(updates) {
        return this.put('/bulk', { updates });
    }
    async importDeliveries(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await exports.apiClient.post(`${this.baseUrl}/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async exportDeliveries(filters, format = 'xlsx') {
        const params = new URLSearchParams({ ...filters, format }).toString();
        const response = await exports.apiClient.get(`${this.baseUrl}/export?${params}`, {
            responseType: 'blob'
        });
        return response.data;
    }
    // Approval Workflow
    async submitForApproval(id) {
        return this.patch(`/${id}/submit-approval`);
    }
    async approveDelivery(id, comments) {
        return this.patch(`/${id}/approve`, { comments });
    }
    async rejectDelivery(id, reason) {
        return this.patch(`/${id}/reject`, { reason });
    }
    async getPendingApprovals() {
        return this.get('/pending-approvals');
    }
    async getApprovalHistory(id) {
        return this.get(`/${id}/approval-history`);
    }
    // Invoice Generation
    async generateSupplierInvoice(id) {
        const response = await exports.apiClient.get(`${this.baseUrl}/${id}/supplier-invoice`, {
            responseType: 'blob'
        });
        return response.data;
    }
    async generateCustomerInvoice(id) {
        const response = await exports.apiClient.get(`${this.baseUrl}/${id}/customer-invoice`, {
            responseType: 'blob'
        });
        return response.data;
    }
    async bulkGenerateInvoices(ids, type) {
        const response = await exports.apiClient.post(`${this.baseUrl}/bulk-generate-invoices`, { ids, type }, { responseType: 'blob' });
        return response.data;
    }
    // Ghana-specific Compliance
    async validateGhanaCompliance(delivery) {
        return this.post('/validate-compliance', delivery);
    }
    async generateNPAReport(dateRange) {
        return this.get(`/npa-report?start=${dateRange.start}&end=${dateRange.end}`);
    }
    async generateGRAReport(dateRange) {
        return this.get(`/gra-report?start=${dateRange.start}&end=${dateRange.end}`);
    }
    async generateEPAReport(dateRange) {
        return this.get(`/epa-report?start=${dateRange.start}&end=${dateRange.end}`);
    }
    // Analytics and Reporting
    async getDailyDeliveryMetrics(period) {
        return this.get(`/metrics${period ? `?period=${period}` : ''}`);
    }
    async getDeliveryTrends(period = '30d') {
        return this.get(`/trends?period=${period}`);
    }
    async getSupplierPerformance() {
        return this.get('/supplier-performance');
    }
    async getCustomerAnalytics() {
        return this.get('/customer-analytics');
    }
    async getComplianceReport(period) {
        return this.get(`/compliance-report?period=${period}`);
    }
    // Real-time Features
    async getRealtimeUpdates() {
        return this.get('/realtime-updates');
    }
    async subscribeToUpdates(deliveryIds) {
        return this.post('/subscribe-updates', { deliveryIds });
    }
    async unsubscribeFromUpdates(deliveryIds) {
        return this.post('/unsubscribe-updates', { deliveryIds });
    }
    // Validation and Verification
    async validateDeliveryData(data) {
        return this.post('/validate', data);
    }
    async verifySupplierData(supplierCode) {
        return this.get(`/verify-supplier/${supplierCode}`);
    }
    async verifyCustomerData(customerCode) {
        return this.get(`/verify-customer/${customerCode}`);
    }
    async checkDuplicateDelivery(deliveryData) {
        return this.post('/check-duplicate', deliveryData);
    }
    // Templates and Configuration
    async getDeliveryTemplates() {
        return this.get('/templates');
    }
    async createDeliveryTemplate(template) {
        return this.post('/templates', template);
    }
    async updateDeliveryTemplate(id, template) {
        return this.put(`/templates/${id}`, template);
    }
    async deleteDeliveryTemplate(id) {
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
    async getAuditTrail(id) {
        return this.get(`/${id}/audit-trail`);
    }
    async getChangeHistory(id) {
        return this.get(`/${id}/change-history`);
    }
}
exports.DailyDeliveryService = DailyDeliveryService;
// Export service instances
exports.authService = new AuthService();
exports.dashboardService = new DashboardService();
exports.financialService = new FinancialService();
exports.hrService = new HRService();
exports.operationsService = new OperationsService();
exports.crmService = new CRMService();
exports.pricingService = new PricingService();
exports.complianceService = new ComplianceService();
exports.regulatoryService = new RegulatoryService();
exports.transactionService = new TransactionService();
exports.configurationService = new ConfigurationService();
exports.productService = new ProductService();
exports.analyticsService = new AnalyticsService();
exports.reportsService = new ReportsService();
exports.dealerService = new DealerService();
exports.ifrsService = new IFRSService();
exports.fleetService = new FleetService();
exports.dailyDeliveryService = new DailyDeliveryService();
exports.wsService = new WebSocketService();
// Export default API client
exports.default = exports.apiClient;
//# sourceMappingURL=api.js.map