"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MTNMoMoService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTNMoMoService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const crypto = __importStar(require("crypto"));
let MTNMoMoService = MTNMoMoService_1 = class MTNMoMoService {
    httpService;
    configService;
    logger = new common_1.Logger(MTNMoMoService_1.name);
    apiUrl;
    apiKey;
    subscriptionKey;
    environment;
    callbackUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiUrl = this.configService.get('MTN_MOMO_API_URL', 'https://sandbox.momodeveloper.mtn.com');
        this.apiKey = this.configService.get('MTN_MOMO_API_KEY', '');
        this.subscriptionKey = this.configService.get('MTN_MOMO_SUBSCRIPTION_KEY', '');
        this.environment = this.configService.get('MTN_MOMO_ENVIRONMENT', 'sandbox');
        this.callbackUrl = this.configService.get('MTN_MOMO_CALLBACK_URL', '');
    }
    /**
     * Request a payment from a customer via MTN Mobile Money
     */
    async requestPayment(request) {
        try {
            this.logger.log(`Initiating MTN MoMo payment for ${request.amount} ${request.currency}`);
            // Generate unique reference ID
            const referenceId = crypto.randomUUID();
            // Get access token
            const accessToken = await this.getAccessToken();
            // Prepare headers
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Reference-Id': referenceId,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                'Content-Type': 'application/json',
                'X-Callback-Url': this.callbackUrl,
            };
            // Make payment request
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiUrl}/collection/v1_0/requesttopay`, request, { headers }));
            // Check payment status
            const status = await this.checkPaymentStatus(referenceId, accessToken);
            return {
                referenceId,
                status: status.status,
                reason: status.reason,
                financialTransactionId: status.financialTransactionId,
            };
        }
        catch (error) {
            this.logger.error('MTN MoMo payment request failed:', error);
            throw new Error(`MTN MoMo payment failed: ${error.message}`);
        }
    }
    /**
     * Check the status of a payment request
     */
    async checkPaymentStatus(referenceId, accessToken) {
        try {
            if (!accessToken) {
                accessToken = await this.getAccessToken();
            }
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/collection/v1_0/requesttopay/${referenceId}`, { headers }));
            return {
                referenceId,
                status: response.data.status,
                reason: response.data.reason,
                financialTransactionId: response.data.financialTransactionId,
            };
        }
        catch (error) {
            this.logger.error('Failed to check payment status:', error);
            throw new Error(`Failed to check payment status: ${error.message}`);
        }
    }
    /**
     * Get account balance
     */
    async getAccountBalance() {
        try {
            const accessToken = await this.getAccessToken();
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/collection/v1_0/account/balance`, { headers }));
            return {
                availableBalance: response.data.availableBalance,
                currency: response.data.currency,
            };
        }
        catch (error) {
            this.logger.error('Failed to get account balance:', error);
            throw new Error(`Failed to get account balance: ${error.message}`);
        }
    }
    /**
     * Validate customer account
     */
    async validateCustomerAccount(phoneNumber) {
        try {
            const accessToken = await this.getAccessToken();
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`, { headers }));
            return response.data.result === true;
        }
        catch (error) {
            this.logger.error('Failed to validate customer account:', error);
            return false;
        }
    }
    /**
     * Process refund
     */
    async processRefund(originalTransactionId, amount, currency, reason) {
        try {
            this.logger.log(`Processing refund for transaction ${originalTransactionId}`);
            const accessToken = await this.getAccessToken();
            const referenceId = crypto.randomUUID();
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Reference-Id': referenceId,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                'Content-Type': 'application/json',
            };
            const refundRequest = {
                amount: amount.toString(),
                currency,
                externalId: crypto.randomUUID(),
                payerMessage: reason,
                payeeNote: `Refund for transaction ${originalTransactionId}`,
                referenceIdToRefund: originalTransactionId,
            };
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiUrl}/collection/v2_0/refund`, refundRequest, { headers }));
            // Check refund status
            const refundStatus = await this.checkRefundStatus(referenceId, accessToken);
            return {
                referenceId,
                status: refundStatus,
            };
        }
        catch (error) {
            this.logger.error('Failed to process refund:', error);
            throw new Error(`Failed to process refund: ${error.message}`);
        }
    }
    /**
     * Check refund status
     */
    async checkRefundStatus(referenceId, accessToken) {
        try {
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'X-Target-Environment': this.environment,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}/collection/v1_0/refund/${referenceId}`, { headers }));
            return response.data.status;
        }
        catch (error) {
            this.logger.error('Failed to check refund status:', error);
            return 'FAILED';
        }
    }
    /**
     * Get access token for API authentication
     */
    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.apiKey}:${this.apiKey}`).toString('base64');
            const headers = {
                'Authorization': `Basic ${auth}`,
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiUrl}/collection/token/`, {}, { headers }));
            return response.data.access_token;
        }
        catch (error) {
            this.logger.error('Failed to get access token:', error);
            throw new Error('Failed to authenticate with MTN MoMo API');
        }
    }
    /**
     * Handle webhook callback from MTN MoMo
     */
    async handleWebhookCallback(data) {
        try {
            this.logger.log('Received MTN MoMo webhook callback:', data);
            // Process the webhook data
            const { referenceId, status, financialTransactionId } = data;
            // Update payment status in database
            // This would be implemented based on your database structure
            // Emit event for other services to react
            // Example: this.eventEmitter.emit('payment.updated', { referenceId, status });
            this.logger.log(`Payment ${referenceId} status updated to ${status}`);
        }
        catch (error) {
            this.logger.error('Failed to handle webhook callback:', error);
            throw error;
        }
    }
};
exports.MTNMoMoService = MTNMoMoService;
exports.MTNMoMoService = MTNMoMoService = MTNMoMoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], MTNMoMoService);
//# sourceMappingURL=mtn-momo.service.js.map