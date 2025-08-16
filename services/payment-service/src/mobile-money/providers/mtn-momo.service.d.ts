import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class MtnMomoService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private accessToken;
    private tokenExpiry;
    private readonly baseUrl;
    private readonly apiUser;
    private readonly apiKey;
    private readonly subscriptionKey;
    private readonly callbackUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Get or refresh access token for MTN MoMo API
     */
    private getAccessToken;
    /**
     * Request payment collection from customer
     */
    requestCollection(amount: number, currency: string, phoneNumber: string, reference: string, description: string): Promise<{
        referenceId: string;
        status: string;
    }>;
    /**
     * Check collection request status
     */
    checkCollectionStatus(referenceId: string): Promise<{
        status: string;
        amount?: number;
        currency?: string;
        financialTransactionId?: string;
        reason?: string;
    }>;
    /**
     * Process disbursement to customer
     */
    processDisbursement(amount: number, currency: string, phoneNumber: string, reference: string, description: string): Promise<{
        referenceId: string;
        status: string;
    }>;
    /**
     * Check account balance
     */
    getAccountBalance(): Promise<{
        availableBalance: number;
        currency: string;
    }>;
    /**
     * Validate account holder
     */
    validateAccountHolder(phoneNumber: string): Promise<boolean>;
    /**
     * Generate payment QR code
     */
    generateQrCode(amount: number, reference: string, description: string): Promise<string>;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: any, signature: string): boolean;
    /**
     * Format phone number to international format
     */
    private formatPhoneNumber;
}
//# sourceMappingURL=mtn-momo.service.d.ts.map