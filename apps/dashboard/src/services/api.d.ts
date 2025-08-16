/**
 * Comprehensive API Service Layer for Ghana OMC ERP System
 * Handles all backend service integrations with error handling and caching
 */
import { AxiosInstance } from 'axios';
export declare const apiClient: AxiosInstance;
export declare class ApiService {
    protected baseUrl: string;
    constructor(baseUrl: string);
    protected get<T>(endpoint: string): Promise<T>;
    protected post<T>(endpoint: string, data?: any): Promise<T>;
    protected put<T>(endpoint: string, data?: any): Promise<T>;
    protected patch<T>(endpoint: string, data?: any): Promise<T>;
    protected delete<T>(endpoint: string): Promise<T>;
}
export declare class AuthService extends ApiService {
    constructor();
    login(credentials: {
        email: string;
        password: string;
    }): Promise<unknown>;
    register(userData: any): Promise<unknown>;
    logout(): Promise<unknown>;
    refreshToken(): Promise<unknown>;
    forgotPassword(email: string): Promise<unknown>;
    resetPassword(token: string, password: string): Promise<unknown>;
    changePassword(oldPassword: string, newPassword: string): Promise<unknown>;
}
export declare class DashboardService extends ApiService {
    constructor();
    getExecutiveDashboard(): Promise<unknown>;
    getOperationalDashboard(): Promise<unknown>;
    getFinancialDashboard(): Promise<unknown>;
    getComplianceDashboard(): Promise<unknown>;
    getSystemHealth(): Promise<unknown>;
    getRealTimeMetrics(): Promise<unknown>;
}
export declare class FinancialService extends ApiService {
    constructor();
    getChartOfAccounts(): Promise<unknown>;
    createAccount(account: any): Promise<unknown>;
    updateAccount(id: string, account: any): Promise<unknown>;
    getJournalEntries(filters?: any): Promise<unknown>;
    createJournalEntry(entry: any): Promise<unknown>;
    approveJournalEntry(id: string): Promise<unknown>;
    getBalanceSheet(period: string): Promise<unknown>;
    getProfitLoss(period: string): Promise<unknown>;
    getCashFlow(period: string): Promise<unknown>;
    getTaxCalculations(period: string): Promise<unknown>;
    submitTaxReturn(data: any): Promise<unknown>;
    getFixedAssets(): Promise<unknown>;
    calculateDepreciation(assetId: string): Promise<unknown>;
}
export declare class HRService extends ApiService {
    constructor();
    getEmployees(): Promise<unknown>;
    createEmployee(employee: any): Promise<unknown>;
    updateEmployee(id: string, employee: any): Promise<unknown>;
    getEmployee(id: string): Promise<unknown>;
    getPayroll(period: string): Promise<unknown>;
    processPayroll(data: any): Promise<unknown>;
    getPayslip(employeeId: string, period: string): Promise<unknown>;
    getLeaveRequests(): Promise<unknown>;
    submitLeaveRequest(request: any): Promise<unknown>;
    approveLeaveRequest(id: string): Promise<unknown>;
    getPerformanceReviews(): Promise<unknown>;
    createPerformanceReview(review: any): Promise<unknown>;
}
export declare class OperationsService extends ApiService {
    constructor();
    getStations(): Promise<unknown>;
    getStation(id: string): Promise<unknown>;
    createStation(station: any): Promise<unknown>;
    updateStation(id: string, station: any): Promise<unknown>;
    getInventory(): Promise<unknown>;
    getTankLevels(): Promise<unknown>;
    updateInventory(data: any): Promise<unknown>;
    getFleet(): Promise<unknown>;
    getVehicleTracking(): Promise<unknown>;
    scheduleDelivery(delivery: any): Promise<unknown>;
    getSupplyChainOrders(): Promise<unknown>;
    createPurchaseOrder(order: any): Promise<unknown>;
    getVendors(): Promise<unknown>;
}
export declare class CRMService extends ApiService {
    constructor();
    getCustomers(): Promise<unknown>;
    getCustomer(id: string): Promise<unknown>;
    createCustomer(customer: any): Promise<unknown>;
    updateCustomer(id: string, customer: any): Promise<unknown>;
    getLeads(): Promise<unknown>;
    convertLead(id: string): Promise<unknown>;
    getLoyaltyPrograms(): Promise<unknown>;
    getCustomerPoints(customerId: string): Promise<unknown>;
    getTickets(): Promise<unknown>;
    createTicket(ticket: any): Promise<unknown>;
    updateTicketStatus(id: string, status: string): Promise<unknown>;
}
export declare class PricingService extends ApiService {
    constructor();
    getPriceWindows(): Promise<unknown>;
    createPriceWindow(window: any): Promise<unknown>;
    activatePriceWindow(id: string): Promise<unknown>;
    getPBUComponents(): Promise<unknown>;
    updatePBUComponent(id: string, component: any): Promise<unknown>;
    getUPPFClaims(): Promise<unknown>;
    createUPPFClaim(claim: any): Promise<unknown>;
    submitUPPFClaim(id: string): Promise<unknown>;
    getDealerSettlements(): Promise<unknown>;
    processSettlement(settlementId: string): Promise<unknown>;
}
export declare class ComplianceService extends ApiService {
    constructor();
    getRiskAssessments(): Promise<unknown>;
    createRiskAssessment(risk: any): Promise<unknown>;
    getAuditFindings(): Promise<unknown>;
    createAuditFinding(finding: any): Promise<unknown>;
    getContracts(): Promise<unknown>;
    renewContract(id: string): Promise<unknown>;
    getQualityChecks(): Promise<unknown>;
    recordQualityCheck(check: any): Promise<unknown>;
}
export declare class RegulatoryService extends ApiService {
    constructor();
    getNPALicenses(): Promise<unknown>;
    submitNPAReport(report: any): Promise<unknown>;
    getEPAMonitoring(): Promise<unknown>;
    submitEPAReport(report: any): Promise<unknown>;
    getGRAIntegration(): Promise<unknown>;
    submitGRAFiling(filing: any): Promise<unknown>;
    getBOGReports(): Promise<unknown>;
    submitBOGReport(report: any): Promise<unknown>;
    getUPPFStatus(): Promise<unknown>;
    getLocalContentTracking(): Promise<unknown>;
    updateLocalContentData(data: any): Promise<unknown>;
}
export declare class TransactionService extends ApiService {
    constructor();
    getTransactions(filters?: any): Promise<unknown>;
    getTransaction(id: string): Promise<unknown>;
    createTransaction(transaction: any): Promise<unknown>;
    updateTransaction(id: string, transaction: any): Promise<unknown>;
    getTransactionStats(): Promise<unknown>;
    getLiveTransactions(): Promise<unknown>;
}
export declare class ConfigurationService extends ApiService {
    constructor();
    getAllConfigurations(): Promise<unknown>;
    getConfiguration(module: string): Promise<unknown>;
    updateConfiguration(module: string, config: any): Promise<unknown>;
    resetConfiguration(module: string): Promise<unknown>;
}
export declare class WebSocketService {
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    connect(): void;
    private reconnect;
    private handleMessage;
    send(message: any): void;
    disconnect(): void;
}
export declare class ProductService extends ApiService {
    constructor();
    getProducts(filters?: any): Promise<unknown>;
    getProduct(id: string): Promise<unknown>;
    createProduct(product: any): Promise<unknown>;
    updateProduct(id: string, product: any): Promise<unknown>;
    deleteProduct(id: string): Promise<unknown>;
    bulkUpdateProducts(products: any[]): Promise<unknown>;
    getCategories(): Promise<unknown>;
    createCategory(category: any): Promise<unknown>;
    updateCategory(id: string, category: any): Promise<unknown>;
    deleteCategory(id: string): Promise<unknown>;
    getPricingRules(): Promise<unknown>;
    createPricingRule(rule: any): Promise<unknown>;
    updatePricingRule(id: string, rule: any): Promise<unknown>;
    deletePricingRule(id: string): Promise<unknown>;
    activatePricingRule(id: string): Promise<unknown>;
    deactivatePricingRule(id: string): Promise<unknown>;
    getProductAnalytics(productId?: string): Promise<unknown>;
    getProductSalesData(productId: string, period: string): Promise<unknown>;
    getProductInventoryData(productId: string): Promise<unknown>;
    getProductProfitability(period: string): Promise<unknown>;
    getTopSellingProducts(limit?: number): Promise<unknown>;
    importProducts(file: File): Promise<any>;
    exportProducts(format?: 'csv' | 'xlsx'): Promise<any>;
    getProductSpecifications(productId: string): Promise<unknown>;
    updateProductSpecifications(productId: string, specifications: any): Promise<unknown>;
}
export declare class AnalyticsService extends ApiService {
    constructor();
    getSalesAnalytics(period?: string, filters?: any): Promise<unknown>;
    getSalesMetrics(): Promise<unknown>;
    getSalesTrends(period?: string): Promise<unknown>;
    getTopCustomers(limit?: number): Promise<unknown>;
    getSalesForecasting(horizon?: string): Promise<unknown>;
    getInventoryAnalytics(): Promise<unknown>;
    getInventoryTurnover(period?: string): Promise<unknown>;
    getStockoutAnalysis(): Promise<unknown>;
    getInventoryValuation(): Promise<unknown>;
    getSlowMovingStock(threshold?: number): Promise<unknown>;
    getFinancialAnalytics(period?: string): Promise<unknown>;
    getProfitabilityAnalysis(period?: string): Promise<unknown>;
    getCashFlowAnalysis(): Promise<unknown>;
    getExpenseAnalysis(period?: string): Promise<unknown>;
    getRevenueAnalysis(period?: string): Promise<unknown>;
    getFinancialRatios(): Promise<unknown>;
    getOperationalAnalytics(): Promise<unknown>;
    getEfficiencyMetrics(): Promise<unknown>;
    getCapacityUtilization(): Promise<unknown>;
    getDowntimeAnalysis(): Promise<unknown>;
    getProductivityMetrics(): Promise<unknown>;
    getQualityMetrics(): Promise<unknown>;
    getRealTimeMetrics(): Promise<unknown>;
    getLiveTransactionData(): Promise<unknown>;
    getLiveInventoryLevels(): Promise<unknown>;
    getSystemPerformance(): Promise<unknown>;
    generateCustomReport(config: any): Promise<unknown>;
    getReportHistory(): Promise<unknown>;
    scheduleReport(config: any): Promise<unknown>;
}
export declare class ReportsService extends ApiService {
    constructor();
    getSalesReports(period?: string, format?: 'json' | 'pdf' | 'xlsx'): Promise<unknown>;
    getDailySalesReport(date: string): Promise<unknown>;
    getMonthlySalesReport(month: string, year: string): Promise<unknown>;
    getSalesPerformanceReport(period?: string): Promise<unknown>;
    getInventoryReports(asOf?: string): Promise<unknown>;
    getStockMovementReport(period?: string): Promise<unknown>;
    getInventoryAgeingReport(): Promise<unknown>;
    getStockReconciliationReport(date: string): Promise<unknown>;
    getFinancialReports(period?: string): Promise<unknown>;
    getIncomeStatement(period: string): Promise<unknown>;
    getBalanceSheetReport(asOf: string): Promise<unknown>;
    getCashFlowReport(period: string): Promise<unknown>;
    getTrialBalance(asOf: string): Promise<unknown>;
    getGeneralLedgerReport(accountId?: string, period?: string): Promise<unknown>;
    getRegulatoryReports(): Promise<unknown>;
    getNPAReport(period: string): Promise<unknown>;
    getEPAReport(period: string): Promise<unknown>;
    getGRAReport(period: string): Promise<unknown>;
    getBOGReport(period: string): Promise<unknown>;
    getUPPFReport(period: string): Promise<unknown>;
    getLocalContentReport(period: string): Promise<unknown>;
    exportReport(reportId: string, format: 'pdf' | 'xlsx' | 'csv'): Promise<any>;
    scheduleReport(config: any): Promise<unknown>;
    getScheduledReports(): Promise<unknown>;
    cancelScheduledReport(id: string): Promise<unknown>;
    getReportTemplates(): Promise<unknown>;
    createReportTemplate(template: any): Promise<unknown>;
    updateReportTemplate(id: string, template: any): Promise<unknown>;
    deleteReportTemplate(id: string): Promise<unknown>;
}
export declare class DealerService extends ApiService {
    constructor();
    getDealers(): Promise<unknown>;
    getDealer(id: string): Promise<unknown>;
    createDealer(dealer: any): Promise<unknown>;
    updateDealer(id: string, dealer: any): Promise<unknown>;
    onboardDealer(dealerData: any): Promise<unknown>;
    getDealerPerformance(id?: string): Promise<unknown>;
    getDealerAnalytics(): Promise<unknown>;
    getDealerLoans(dealerId?: string): Promise<unknown>;
    createLoan(loanData: any): Promise<unknown>;
    processLoan(loanId: string, action: string): Promise<unknown>;
    getLoanHistory(dealerId: string): Promise<unknown>;
    getDealerCompliance(dealerId?: string): Promise<unknown>;
    runComplianceCheck(dealerId: string): Promise<unknown>;
    getDealerSettlements(dealerId?: string): Promise<unknown>;
    processSettlement(settlementId: string): Promise<unknown>;
    getSettlementHistory(dealerId: string): Promise<unknown>;
    getCreditAnalysis(dealerId: string): Promise<unknown>;
    updateCreditLimit(dealerId: string, limit: number): Promise<unknown>;
    getDealerReports(type: string, filters?: any): Promise<unknown>;
    generateDealerReport(dealerId: string, reportType: string): Promise<unknown>;
}
export declare class IFRSService extends ApiService {
    constructor();
    getIFRSDashboard(): Promise<unknown>;
    getRevenueRecognition(): Promise<unknown>;
    processRevenueRecognition(data: any): Promise<unknown>;
    getExpectedCreditLoss(): Promise<unknown>;
    calculateECL(data: any): Promise<unknown>;
    getLeaseAccounting(): Promise<unknown>;
    processLeaseContract(leaseData: any): Promise<unknown>;
    getAssetImpairment(): Promise<unknown>;
    performImpairmentTest(assetId: string): Promise<unknown>;
    getDisclosures(): Promise<unknown>;
    generateDisclosures(period: string): Promise<unknown>;
    getComplianceReport(period: string): Promise<unknown>;
    submitComplianceReport(reportData: any): Promise<unknown>;
    getIFRSAnalytics(): Promise<unknown>;
}
export declare class FleetService extends ApiService {
    constructor();
    getVehicles(): Promise<unknown>;
    getVehicle(id: string): Promise<unknown>;
    createVehicle(vehicle: any): Promise<unknown>;
    updateVehicle(id: string, vehicle: any): Promise<unknown>;
    deleteVehicle(id: string): Promise<unknown>;
    getDrivers(): Promise<unknown>;
    getDriver(id: string): Promise<unknown>;
    createDriver(driver: any): Promise<unknown>;
    updateDriver(id: string, driver: any): Promise<unknown>;
    assignDriver(driverId: string, vehicleId: string): Promise<unknown>;
    unassignDriver(driverId: string): Promise<unknown>;
    getVehicleLocation(vehicleId: string): Promise<unknown>;
    getAllVehicleLocations(): Promise<unknown>;
    getVehicleRoute(vehicleId: string, startDate: string, endDate: string): Promise<unknown>;
    getGeofenceAlerts(): Promise<unknown>;
    getMaintenanceSchedules(): Promise<unknown>;
    scheduleMaintenancePlan(plan: any): Promise<unknown>;
    getMaintenanceHistory(vehicleId: string): Promise<unknown>;
    recordMaintenanceLog(log: any): Promise<unknown>;
    getUpcomingMaintenance(): Promise<unknown>;
    getDeliveries(filters?: any): Promise<unknown>;
    createDelivery(delivery: any): Promise<unknown>;
    updateDeliveryStatus(id: string, status: string): Promise<unknown>;
    optimizeRoute(deliveries: string[]): Promise<unknown>;
    getDeliveryReport(dateRange: {
        start: string;
        end: string;
    }): Promise<unknown>;
    getFleetMetrics(): Promise<unknown>;
    getFuelConsumption(period: string): Promise<unknown>;
    getVehicleUtilization(): Promise<unknown>;
    getMaintenanceCosts(period: string): Promise<unknown>;
}
export declare class DailyDeliveryService extends ApiService {
    constructor();
    getDailyDeliveries(filters?: any): Promise<unknown>;
    getDailyDelivery(id: string): Promise<unknown>;
    createDailyDelivery(delivery: any): Promise<unknown>;
    updateDailyDelivery(id: string, delivery: any): Promise<unknown>;
    deleteDailyDelivery(id: string): Promise<unknown>;
    bulkCreateDeliveries(deliveries: any[]): Promise<unknown>;
    bulkUpdateDeliveries(updates: any[]): Promise<unknown>;
    importDeliveries(file: File): Promise<any>;
    exportDeliveries(filters?: any, format?: 'csv' | 'xlsx'): Promise<any>;
    submitForApproval(id: string): Promise<unknown>;
    approveDelivery(id: string, comments?: string): Promise<unknown>;
    rejectDelivery(id: string, reason: string): Promise<unknown>;
    getPendingApprovals(): Promise<unknown>;
    getApprovalHistory(id: string): Promise<unknown>;
    generateSupplierInvoice(id: string): Promise<any>;
    generateCustomerInvoice(id: string): Promise<any>;
    bulkGenerateInvoices(ids: string[], type: 'supplier' | 'customer'): Promise<any>;
    validateGhanaCompliance(delivery: any): Promise<unknown>;
    generateNPAReport(dateRange: {
        start: string;
        end: string;
    }): Promise<unknown>;
    generateGRAReport(dateRange: {
        start: string;
        end: string;
    }): Promise<unknown>;
    generateEPAReport(dateRange: {
        start: string;
        end: string;
    }): Promise<unknown>;
    getDailyDeliveryMetrics(period?: string): Promise<unknown>;
    getDeliveryTrends(period?: string): Promise<unknown>;
    getSupplierPerformance(): Promise<unknown>;
    getCustomerAnalytics(): Promise<unknown>;
    getComplianceReport(period: string): Promise<unknown>;
    getRealtimeUpdates(): Promise<unknown>;
    subscribeToUpdates(deliveryIds: string[]): Promise<unknown>;
    unsubscribeFromUpdates(deliveryIds: string[]): Promise<unknown>;
    validateDeliveryData(data: any): Promise<unknown>;
    verifySupplierData(supplierCode: string): Promise<unknown>;
    verifyCustomerData(customerCode: string): Promise<unknown>;
    checkDuplicateDelivery(deliveryData: any): Promise<unknown>;
    getDeliveryTemplates(): Promise<unknown>;
    createDeliveryTemplate(template: any): Promise<unknown>;
    updateDeliveryTemplate(id: string, template: any): Promise<unknown>;
    deleteDeliveryTemplate(id: string): Promise<unknown>;
    getSuppliers(): Promise<unknown>;
    getDepots(): Promise<unknown>;
    getTransporters(): Promise<unknown>;
    getProducts(): Promise<unknown>;
    getAuditTrail(id: string): Promise<unknown>;
    getChangeHistory(id: string): Promise<unknown>;
}
export declare const authService: AuthService;
export declare const dashboardService: DashboardService;
export declare const financialService: FinancialService;
export declare const hrService: HRService;
export declare const operationsService: OperationsService;
export declare const crmService: CRMService;
export declare const pricingService: PricingService;
export declare const complianceService: ComplianceService;
export declare const regulatoryService: RegulatoryService;
export declare const transactionService: TransactionService;
export declare const configurationService: ConfigurationService;
export declare const productService: ProductService;
export declare const analyticsService: AnalyticsService;
export declare const reportsService: ReportsService;
export declare const dealerService: DealerService;
export declare const ifrsService: IFRSService;
export declare const fleetService: FleetService;
export declare const dailyDeliveryService: DailyDeliveryService;
export declare const wsService: WebSocketService;
export default apiClient;
//# sourceMappingURL=api.d.ts.map