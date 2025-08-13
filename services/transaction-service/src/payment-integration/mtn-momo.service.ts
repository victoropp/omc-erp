import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

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

@Injectable()
export class MTNMoMoService {
  private readonly logger = new Logger(MTNMoMoService.name);
  private apiUrl: string;
  private apiKey: string;
  private subscriptionKey: string;
  private environment: string;
  private callbackUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('MTN_MOMO_API_URL', 'https://sandbox.momodeveloper.mtn.com');
    this.apiKey = this.configService.get<string>('MTN_MOMO_API_KEY', '');
    this.subscriptionKey = this.configService.get<string>('MTN_MOMO_SUBSCRIPTION_KEY', '');
    this.environment = this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'sandbox');
    this.callbackUrl = this.configService.get<string>('MTN_MOMO_CALLBACK_URL', '');
  }

  /**
   * Request a payment from a customer via MTN Mobile Money
   */
  async requestPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
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
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/collection/v1_0/requesttopay`,
          request,
          { headers }
        )
      );

      // Check payment status
      const status = await this.checkPaymentStatus(referenceId, accessToken);

      return {
        referenceId,
        status: status.status,
        reason: status.reason,
        financialTransactionId: status.financialTransactionId,
      };
    } catch (error) {
      this.logger.error('MTN MoMo payment request failed:', error);
      throw new Error(`MTN MoMo payment failed: ${error.message}`);
    }
  }

  /**
   * Check the status of a payment request
   */
  async checkPaymentStatus(referenceId: string, accessToken?: string): Promise<MoMoPaymentResponse> {
    try {
      if (!accessToken) {
        accessToken = await this.getAccessToken();
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.environment,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/collection/v1_0/requesttopay/${referenceId}`,
          { headers }
        )
      );

      return {
        referenceId,
        status: response.data.status,
        reason: response.data.reason,
        financialTransactionId: response.data.financialTransactionId,
      };
    } catch (error) {
      this.logger.error('Failed to check payment status:', error);
      throw new Error(`Failed to check payment status: ${error.message}`);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<{ availableBalance: number; currency: string }> {
    try {
      const accessToken = await this.getAccessToken();

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.environment,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/collection/v1_0/account/balance`,
          { headers }
        )
      );

      return {
        availableBalance: response.data.availableBalance,
        currency: response.data.currency,
      };
    } catch (error) {
      this.logger.error('Failed to get account balance:', error);
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }

  /**
   * Validate customer account
   */
  async validateCustomerAccount(phoneNumber: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.environment,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`,
          { headers }
        )
      );

      return response.data.result === true;
    } catch (error) {
      this.logger.error('Failed to validate customer account:', error);
      return false;
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    originalTransactionId: string,
    amount: number,
    currency: string,
    reason: string
  ): Promise<{ referenceId: string; status: string }> {
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

      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/collection/v2_0/refund`,
          refundRequest,
          { headers }
        )
      );

      // Check refund status
      const refundStatus = await this.checkRefundStatus(referenceId, accessToken);

      return {
        referenceId,
        status: refundStatus,
      };
    } catch (error) {
      this.logger.error('Failed to process refund:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Check refund status
   */
  private async checkRefundStatus(referenceId: string, accessToken: string): Promise<string> {
    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': this.environment,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/collection/v1_0/refund/${referenceId}`,
          { headers }
        )
      );

      return response.data.status;
    } catch (error) {
      this.logger.error('Failed to check refund status:', error);
      return 'FAILED';
    }
  }

  /**
   * Get access token for API authentication
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiKey}`).toString('base64');

      const headers = {
        'Authorization': `Basic ${auth}`,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/collection/token/`,
          {},
          { headers }
        )
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get access token:', error);
      throw new Error('Failed to authenticate with MTN MoMo API');
    }
  }

  /**
   * Handle webhook callback from MTN MoMo
   */
  async handleWebhookCallback(data: any): Promise<void> {
    try {
      this.logger.log('Received MTN MoMo webhook callback:', data);

      // Process the webhook data
      const { referenceId, status, financialTransactionId } = data;

      // Update payment status in database
      // This would be implemented based on your database structure
      
      // Emit event for other services to react
      // Example: this.eventEmitter.emit('payment.updated', { referenceId, status });

      this.logger.log(`Payment ${referenceId} status updated to ${status}`);
    } catch (error) {
      this.logger.error('Failed to handle webhook callback:', error);
      throw error;
    }
  }
}