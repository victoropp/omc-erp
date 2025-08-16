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
var TransactionServiceIntegration_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionServiceIntegration = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let TransactionServiceIntegration = TransactionServiceIntegration_1 = class TransactionServiceIntegration {
    httpService;
    configService;
    logger = new common_1.Logger(TransactionServiceIntegration_1.name);
    baseUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('TRANSACTION_SERVICE_URL') || 'http://localhost:3005';
    }
    /**
     * Get fuel transactions for a station and period
     */
    async getStationTransactions(stationId, startDate, endDate, productId) {
        this.logger.log(`Fetching transactions for station ${stationId}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            if (productId) {
                params.productId = productId;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/stations/${stationId}`, { params }));
            return response.data.transactions || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch transactions for station ${stationId}:`, error);
            return [];
        }
    }
    /**
     * Get transaction summary for volume calculation
     */
    async getTransactionSummary(stationId, startDate, endDate) {
        this.logger.log(`Fetching transaction summary for station: ${stationId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/stations/${stationId}/summary`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch transaction summary for station ${stationId}:`, error);
            return null;
        }
    }
    /**
     * Get delivery consignments for UPPF claims
     */
    async getDeliveryConsignments(stationId, startDate, endDate, status) {
        this.logger.log('Fetching delivery consignments');
        try {
            const params = {};
            if (stationId)
                params.stationId = stationId;
            if (startDate)
                params.startDate = startDate.toISOString();
            if (endDate)
                params.endDate = endDate.toISOString();
            if (status)
                params.status = status;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/deliveries`, { params }));
            return response.data.consignments || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch delivery consignments:', error);
            return [];
        }
    }
    /**
     * Get specific delivery consignment by ID
     */
    async getDeliveryConsignmentById(consignmentId) {
        this.logger.log(`Fetching delivery consignment: ${consignmentId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/deliveries/${consignmentId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch delivery consignment ${consignmentId}:`, error);
            return null;
        }
    }
    /**
     * Update delivery consignment status
     */
    async updateDeliveryStatus(consignmentId, status, notes) {
        this.logger.log(`Updating delivery status: ${consignmentId} -> ${status}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/transactions/deliveries/${consignmentId}/status`, {
                status,
                notes,
                updatedAt: new Date()
            }));
            this.logger.log(`Delivery status updated: ${consignmentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update delivery status for ${consignmentId}:`, error);
            throw new Error(`Delivery status update failed: ${error.message}`);
        }
    }
    /**
     * Record dealer payment transaction
     */
    async recordPaymentTransaction(payment) {
        this.logger.log(`Recording payment transaction for dealer ${payment.dealerId}: ${payment.amount}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/transactions/payments`, {
                ...payment,
                paymentDate: new Date(),
                status: 'PENDING'
            }));
            this.logger.log(`Payment transaction recorded: ${response.data.paymentId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to record payment transaction for dealer ${payment.dealerId}:`, error);
            throw new Error(`Payment transaction recording failed: ${error.message}`);
        }
    }
    /**
     * Get dealer payment transactions
     */
    async getDealerPaymentTransactions(dealerId, startDate, endDate) {
        this.logger.log(`Fetching payment transactions for dealer: ${dealerId}`);
        try {
            const params = {};
            if (startDate)
                params.startDate = startDate.toISOString();
            if (endDate)
                params.endDate = endDate.toISOString();
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/payments/dealers/${dealerId}`, { params }));
            return response.data.payments || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch payment transactions for dealer ${dealerId}:`, error);
            return [];
        }
    }
    /**
     * Get transaction analytics for pricing decisions
     */
    async getTransactionAnalytics(startDate, endDate, groupBy = 'station') {
        this.logger.log(`Fetching transaction analytics: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/analytics`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    groupBy
                }
            }));
            return response.data.analytics || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch transaction analytics:', error);
            return [];
        }
    }
    /**
     * Get fuel inventory movements for stock reconciliation
     */
    async getInventoryMovements(stationId, startDate, endDate) {
        this.logger.log(`Fetching inventory movements for station ${stationId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/inventory-movements/${stationId}`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            }));
            return response.data.movements || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch inventory movements for station ${stationId}:`, error);
            return [];
        }
    }
    /**
     * Process bulk fuel transactions for settlement calculation
     */
    async processBulkTransactions(transactions) {
        this.logger.log(`Processing ${transactions.length} bulk transactions`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/transactions/bulk-process`, {
                transactions
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to process bulk transactions:', error);
            return {
                processed: 0,
                failed: transactions.length,
                errors: [{ index: -1, error: error.message }]
            };
        }
    }
    /**
     * Get transaction dispute records
     */
    async getTransactionDisputes(stationId, status) {
        this.logger.log('Fetching transaction disputes');
        try {
            const params = {};
            if (stationId)
                params.stationId = stationId;
            if (status)
                params.status = status;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/disputes`, { params }));
            return response.data.disputes || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch transaction disputes:', error);
            return [];
        }
    }
    /**
     * Health check for transaction service
     */
    async healthCheck() {
        const startTime = Date.now();
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 }));
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date(),
                dailyTransactions: response.data?.dailyTransactions || 0
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.warn('Transaction service health check failed:', error.message);
            return {
                status: 'unhealthy',
                responseTime,
                lastChecked: new Date()
            };
        }
    }
    /**
     * Get real-time transaction metrics
     */
    async getRealTimeMetrics() {
        this.logger.log('Fetching real-time transaction metrics');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/transactions/realtime-metrics`));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch real-time transaction metrics:', error);
            return {
                activeTransactions: 0,
                totalVolumeToday: 0,
                totalRevenueToday: 0,
                stationsOnline: 0,
                averageTransactionValue: 0,
                topSellingProduct: 'PMS'
            };
        }
    }
    /**
     * Validate transaction data integrity
     */
    async validateTransactionIntegrity(stationId, date) {
        this.logger.log(`Validating transaction integrity for station ${stationId} on ${date.toISOString()}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/transactions/validate-integrity`, {
                stationId,
                date: date.toISOString()
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to validate transaction integrity for station ${stationId}:`, error);
            return {
                isValid: false,
                discrepancies: [{
                        type: 'VALIDATION_ERROR',
                        description: 'Unable to perform validation due to service error',
                        impact: 0,
                        severity: 'HIGH'
                    }],
                totalVariance: 0
            };
        }
    }
};
exports.TransactionServiceIntegration = TransactionServiceIntegration;
exports.TransactionServiceIntegration = TransactionServiceIntegration = TransactionServiceIntegration_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], TransactionServiceIntegration);
//# sourceMappingURL=transaction-service.integration.js.map