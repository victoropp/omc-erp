import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface MoMoPaymentRequest {
    amount: number;
    currency: string;
    externalId: string;
    payer: {
        partyIdType: 'MSISDN';
        partyId: string;
    };
    payerMessage: string;
    payeeNote: string;
}
export interface MoMoPaymentResponse {
    referenceId: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    reason?: string;
    financialTransactionId?: string;
}
export declare class MTNMoMoService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private apiUrl;
    private apiKey;
    private subscriptionKey;
    private environment;
    private callbackUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Request a payment from a customer via MTN Mobile Money
     */
    requestPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse>;
    /**
     * Check the status of a payment request
     */
    checkPaymentStatus(referenceId: string, accessToken?: string): Promise<MoMoPaymentResponse>;
    /**
     * Get account balance
     */
    getAccountBalance(): Promise<{
        availableBalance: number;
        currency: string;
    }>;
    /**
     * Validate customer account
     */
    validateCustomerAccount(phoneNumber: string): Promise<boolean>;
    /**
     * Process refund
     */
    processRefund(originalTransactionId: string, amount: number, currency: string, reason: string): Promise<{
        referenceId: string;
        status: string;
    }>;
    /**
     * Check refund status
     */
    private checkRefundStatus;
    /**
     * Get access token for API authentication
     */
    private getAccessToken;
    /**
     * Handle webhook callback from MTN MoMo
     */
    handleWebhookCallback(data: any): Promise<void>;
}
//# sourceMappingURL=mtn-momo.service.d.ts.map