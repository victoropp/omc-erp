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
export const wsService = new WebSocketService();

// Export default API client
export default apiClient;