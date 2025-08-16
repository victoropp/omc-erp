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
var MtnMomoService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MtnMomoService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const crypto = __importStar(require("crypto"));
const uuid_1 = require("uuid");
let MtnMomoService = MtnMomoService_1 = class MtnMomoService {
    httpService;
    configService;
    logger = new common_1.Logger(MtnMomoService_1.name);
    accessToken;
    tokenExpiry;
    baseUrl;
    apiUser;
    apiKey;
    subscriptionKey;
    callbackUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('MTN_MOMO_BASE_URL', 'https://proxy.momoapi.mtn.com');
        this.apiUser = this.configService.get('MTN_MOMO_API_USER');
        this.apiKey = this.configService.get('MTN_MOMO_API_KEY');
        this.subscriptionKey = this.configService.get('MTN_MOMO_SUBSCRIPTION_KEY');
        this.callbackUrl = this.configService.get('MTN_MOMO_CALLBACK_URL');
    }
    /**
     * Get or refresh access token for MTN MoMo API
     */
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/collection/token/`, {}, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                },
            }));
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
            this.logger.log('MTN MoMo access token refreshed successfully');
            return this.accessToken;
        }
        catch (error) {
            this.logger.error('Failed to get MTN MoMo access token', error);
            throw new common_1.HttpException('Failed to authenticate with MTN MoMo', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    /**
     * Request payment collection from customer
     */
    async requestCollection(amount, currency, phoneNumber, reference, description) {
        const token = await this.getAccessToken();
        const referenceId = (0, uuid_1.v4)();
        const requestBody = {
            amount: amount.toString(),
            currency: currency || 'GHS',
            externalId: reference,
            payer: {
                partyIdType: 'MSISDN',
                partyId: this.formatPhoneNumber(phoneNumber),
            },
            payerMessage: description,
            payeeNote: `Payment for ${reference}`,
        };
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/collection/v1_0/requesttopay`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': this.configService.get('MTN_MOMO_ENVIRONMENT', 'production'),
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    'X-Callback-Url': this.callbackUrl,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`MTN MoMo collection request initiated: ${referenceId}`);
            return {
                referenceId,
                status: 'PENDING',
            };
        }
        catch (error) {
            this.logger.error('Failed to request MTN MoMo collection', error);
            throw new common_1.HttpException('Failed to initiate payment collection', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    /**
     * Check collection request status
     */
    async checkCollectionStatus(referenceId) {
        const token = await this.getAccessToken();
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.configService.get('MTN_MOMO_ENVIRONMENT', 'production'),
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                },
            }));
            const data = response.data;
            return {
                status: data.status,
                amount: parseFloat(data.amount),
                currency: data.currency,
                financialTransactionId: data.financialTransactionId,
                reason: data.reason,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check collection status: ${referenceId}`, error);
            throw new common_1.HttpException('Failed to check payment status', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    /**
     * Process disbursement to customer
     */
    async processDisbursement(amount, currency, phoneNumber, reference, description) {
        const token = await this.getAccessToken();
        const referenceId = (0, uuid_1.v4)();
        const requestBody = {
            amount: amount.toString(),
            currency: currency || 'GHS',
            externalId: reference,
            payee: {
                partyIdType: 'MSISDN',
                partyId: this.formatPhoneNumber(phoneNumber),
            },
            payerMessage: description,
            payeeNote: `Disbursement for ${reference}`,
        };
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/disbursement/v1_0/transfer`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': this.configService.get('MTN_MOMO_ENVIRONMENT', 'production'),
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                    'X-Callback-Url': this.callbackUrl,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`MTN MoMo disbursement initiated: ${referenceId}`);
            return {
                referenceId,
                status: 'PENDING',
            };
        }
        catch (error) {
            this.logger.error('Failed to process MTN MoMo disbursement', error);
            throw new common_1.HttpException('Failed to process disbursement', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    /**
     * Check account balance
     */
    async getAccountBalance() {
        const token = await this.getAccessToken();
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/collection/v1_0/account/balance`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.configService.get('MTN_MOMO_ENVIRONMENT', 'production'),
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                },
            }));
            return {
                availableBalance: parseFloat(response.data.availableBalance),
                currency: response.data.currency,
            };
        }
        catch (error) {
            this.logger.error('Failed to get MTN MoMo account balance', error);
            throw new common_1.HttpException('Failed to retrieve account balance', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    /**
     * Validate account holder
     */
    async validateAccountHolder(phoneNumber) {
        const token = await this.getAccessToken();
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/collection/v1_0/accountholder/msisdn/${formattedNumber}/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.configService.get('MTN_MOMO_ENVIRONMENT', 'production'),
                    'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                },
            }));
            return response.data.result === true;
        }
        catch (error) {
            this.logger.error(`Failed to validate account holder: ${phoneNumber}`, error);
            return false;
        }
    }
    /**
     * Generate payment QR code
     */
    async generateQrCode(amount, reference, description) {
        const qrData = {
            provider: 'MTN_MOMO',
            amount,
            currency: 'GHS',
            reference,
            description,
            timestamp: new Date().toISOString(),
        };
        const qrString = JSON.stringify(qrData);
        const qrCode = Buffer.from(qrString).toString('base64');
        return `mtnmomo://pay?data=${qrCode}`;
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        const secret = this.configService.get('MTN_MOMO_WEBHOOK_SECRET');
        const computedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return computedSignature === signature;
    }
    /**
     * Format phone number to international format
     */
    formatPhoneNumber(phoneNumber) {
        // Remove any non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        // Add Ghana country code if not present
        if (cleaned.startsWith('0')) {
            cleaned = '233' + cleaned.substring(1);
        }
        else if (!cleaned.startsWith('233')) {
            cleaned = '233' + cleaned;
        }
        return cleaned;
    }
};
exports.MtnMomoService = MtnMomoService;
exports.MtnMomoService = MtnMomoService = MtnMomoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], MtnMomoService);
//# sourceMappingURL=mtn-momo.service.js.map