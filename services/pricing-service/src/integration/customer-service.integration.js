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
var CustomerServiceIntegration_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerServiceIntegration = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let CustomerServiceIntegration = CustomerServiceIntegration_1 = class CustomerServiceIntegration {
    httpService;
    configService;
    logger = new common_1.Logger(CustomerServiceIntegration_1.name);
    baseUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('CUSTOMER_SERVICE_URL') || 'http://localhost:3004';
    }
    /**
     * Get dealer information by ID
     */
    async getDealerById(dealerId) {
        this.logger.log(`Fetching dealer information: ${dealerId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch dealer ${dealerId}:`, error);
            return null;
        }
    }
    /**
     * Get all active dealers
     */
    async getActiveDealers() {
        this.logger.log('Fetching all active dealers');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers`, {
                params: { status: 'ACTIVE' }
            }));
            return response.data.dealers || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch active dealers:', error);
            return [];
        }
    }
    /**
     * Get dealer credit profile
     */
    async getDealerCreditProfile(dealerId) {
        this.logger.log(`Fetching credit profile for dealer: ${dealerId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/credit-profile`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch credit profile for dealer ${dealerId}:`, error);
            // Return default credit profile for fallback
            return this.getDefaultCreditProfile(dealerId);
        }
    }
    /**
     * Update dealer credit limit
     */
    async updateDealerCreditLimit(dealerId, newCreditLimit, reason, updatedBy) {
        this.logger.log(`Updating credit limit for dealer ${dealerId}: ${newCreditLimit}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/dealers/${dealerId}/credit-limit`, {
                newCreditLimit,
                reason,
                updatedBy,
                updatedAt: new Date()
            }));
            this.logger.log(`Credit limit updated successfully for dealer: ${dealerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update credit limit for dealer ${dealerId}:`, error);
            throw new Error(`Credit limit update failed: ${error.message}`);
        }
    }
    /**
     * Get dealer performance metrics
     */
    async getDealerPerformanceMetrics(dealerId, startDate, endDate) {
        this.logger.log(`Fetching performance metrics for dealer: ${dealerId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/performance`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch performance metrics for dealer ${dealerId}:`, error);
            return null;
        }
    }
    /**
     * Check dealer creditworthiness for loan application
     */
    async checkDealerCreditworthiness(dealerId, requestedAmount, loanType) {
        this.logger.log(`Checking creditworthiness for dealer ${dealerId}: ${requestedAmount}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/dealers/${dealerId}/credit-assessment`, {
                requestedAmount,
                loanType,
                assessmentDate: new Date()
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to check creditworthiness for dealer ${dealerId}:`, error);
            // Return conservative assessment for fallback
            return {
                isEligible: false,
                approvedAmount: 0,
                creditRating: 'UNKNOWN',
                riskScore: 100,
                conditions: ['Manual review required'],
                reasons: ['Customer service unavailable for assessment']
            };
        }
    }
    /**
     * Record dealer payment
     */
    async recordDealerPayment(payment) {
        this.logger.log(`Recording payment for dealer ${payment.dealerId}: ${payment.paymentAmount}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/dealers/${payment.dealerId}/payments`, payment));
            this.logger.log(`Payment recorded successfully for dealer: ${payment.dealerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to record payment for dealer ${payment.dealerId}:`, error);
            throw new Error(`Payment recording failed: ${error.message}`);
        }
    }
    /**
     * Get dealer outstanding balance
     */
    async getDealerOutstandingBalance(dealerId) {
        this.logger.log(`Fetching outstanding balance for dealer: ${dealerId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/outstanding-balance`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch outstanding balance for dealer ${dealerId}:`, error);
            // Return default balance structure
            return {
                totalOutstanding: 0,
                breakdown: {
                    tradeReceivables: 0,
                    loanReceivables: 0,
                    overdueAmount: 0,
                    currentAmount: 0
                },
                agingAnalysis: []
            };
        }
    }
    /**
     * Update dealer status
     */
    async updateDealerStatus(dealerId, status, reason, updatedBy) {
        this.logger.log(`Updating dealer status: ${dealerId} -> ${status}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/dealers/${dealerId}/status`, {
                status,
                reason,
                updatedBy,
                updatedAt: new Date()
            }));
            this.logger.log(`Dealer status updated successfully: ${dealerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update dealer status for ${dealerId}:`, error);
            throw new Error(`Dealer status update failed: ${error.message}`);
        }
    }
    /**
     * Get dealers requiring credit review
     */
    async getDealersRequiringCreditReview() {
        this.logger.log('Fetching dealers requiring credit review');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/dealers/credit-review-required`));
            return response.data.dealers || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch dealers requiring credit review:', error);
            return [];
        }
    }
    /**
     * Send dealer notification
     */
    async sendDealerNotification(notification) {
        this.logger.log(`Sending notification to dealer ${notification.dealerId}: ${notification.notificationType}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/dealers/${notification.dealerId}/notifications`, notification));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to send notification to dealer ${notification.dealerId}:`, error);
            return {
                sent: false,
                channels: notification.channels.map(channel => ({
                    channel,
                    status: 'FAILED',
                    error: error.message
                }))
            };
        }
    }
    /**
     * Health check for customer service
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
                activeDealers: response.data?.activeDealers || 0
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.warn('Customer service health check failed:', error.message);
            return {
                status: 'unhealthy',
                responseTime,
                lastChecked: new Date()
            };
        }
    }
    // Private helper methods
    getDefaultCreditProfile(dealerId) {
        return {
            dealerId,
            creditLimit: 50000.00,
            currentOutstanding: 0,
            availableCredit: 50000.00,
            creditUtilization: 0,
            creditRating: 'PENDING_REVIEW',
            paymentHistory: {
                onTimePayments: 0,
                latePayments: 0,
                defaultedPayments: 0,
                averagePaymentDays: 0
            },
            riskProfile: 'MEDIUM',
            lastCreditReview: new Date(),
            nextReviewDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        };
    }
};
exports.CustomerServiceIntegration = CustomerServiceIntegration;
exports.CustomerServiceIntegration = CustomerServiceIntegration = CustomerServiceIntegration_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], CustomerServiceIntegration);
//# sourceMappingURL=customer-service.integration.js.map