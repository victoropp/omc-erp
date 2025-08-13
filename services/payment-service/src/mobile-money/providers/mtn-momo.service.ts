import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface MoMoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MoMoCollectionRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

interface MoMoDisbursementRequest {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

@Injectable()
export class MtnMomoService {
  private readonly logger = new Logger(MtnMomoService.name);
  private accessToken: string;
  private tokenExpiry: Date;
  private readonly baseUrl: string;
  private readonly apiUser: string;
  private readonly apiKey: string;
  private readonly subscriptionKey: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MTN_MOMO_BASE_URL', 'https://proxy.momoapi.mtn.com');
    this.apiUser = this.configService.get<string>('MTN_MOMO_API_USER');
    this.apiKey = this.configService.get<string>('MTN_MOMO_API_KEY');
    this.subscriptionKey = this.configService.get<string>('MTN_MOMO_SUBSCRIPTION_KEY');
    this.callbackUrl = this.configService.get<string>('MTN_MOMO_CALLBACK_URL');
  }

  /**
   * Get or refresh access token for MTN MoMo API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
      
      const response = await firstValueFrom(
        this.httpService.post<MoMoTokenResponse>(
          `${this.baseUrl}/collection/token/`,
          {},
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
      
      this.logger.log('MTN MoMo access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get MTN MoMo access token', error);
      throw new HttpException('Failed to authenticate with MTN MoMo', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Request payment collection from customer
   */
  async requestCollection(
    amount: number,
    currency: string,
    phoneNumber: string,
    reference: string,
    description: string,
  ): Promise<{ referenceId: string; status: string }> {
    const token = await this.getAccessToken();
    const referenceId = uuidv4();

    const requestBody: MoMoCollectionRequest = {
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
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/collection/v1_0/requesttopay`,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Reference-Id': referenceId,
              'X-Target-Environment': this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'production'),
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
              'X-Callback-Url': this.callbackUrl,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`MTN MoMo collection request initiated: ${referenceId}`);
      
      return {
        referenceId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Failed to request MTN MoMo collection', error);
      throw new HttpException('Failed to initiate payment collection', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Check collection request status
   */
  async checkCollectionStatus(referenceId: string): Promise<{
    status: string;
    amount?: number;
    currency?: string;
    financialTransactionId?: string;
    reason?: string;
  }> {
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Target-Environment': this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'production'),
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            },
          },
        ),
      );

      const data = response.data;
      
      return {
        status: data.status,
        amount: parseFloat(data.amount),
        currency: data.currency,
        financialTransactionId: data.financialTransactionId,
        reason: data.reason,
      };
    } catch (error) {
      this.logger.error(`Failed to check collection status: ${referenceId}`, error);
      throw new HttpException('Failed to check payment status', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Process disbursement to customer
   */
  async processDisbursement(
    amount: number,
    currency: string,
    phoneNumber: string,
    reference: string,
    description: string,
  ): Promise<{ referenceId: string; status: string }> {
    const token = await this.getAccessToken();
    const referenceId = uuidv4();

    const requestBody: MoMoDisbursementRequest = {
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
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/disbursement/v1_0/transfer`,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Reference-Id': referenceId,
              'X-Target-Environment': this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'production'),
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
              'X-Callback-Url': this.callbackUrl,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`MTN MoMo disbursement initiated: ${referenceId}`);
      
      return {
        referenceId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Failed to process MTN MoMo disbursement', error);
      throw new HttpException('Failed to process disbursement', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Check account balance
   */
  async getAccountBalance(): Promise<{
    availableBalance: number;
    currency: string;
  }> {
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/collection/v1_0/account/balance`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Target-Environment': this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'production'),
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            },
          },
        ),
      );

      return {
        availableBalance: parseFloat(response.data.availableBalance),
        currency: response.data.currency,
      };
    } catch (error) {
      this.logger.error('Failed to get MTN MoMo account balance', error);
      throw new HttpException('Failed to retrieve account balance', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Validate account holder
   */
  async validateAccountHolder(phoneNumber: string): Promise<boolean> {
    const token = await this.getAccessToken();
    const formattedNumber = this.formatPhoneNumber(phoneNumber);

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/collection/v1_0/accountholder/msisdn/${formattedNumber}/active`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Target-Environment': this.configService.get<string>('MTN_MOMO_ENVIRONMENT', 'production'),
              'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            },
          },
        ),
      );

      return response.data.result === true;
    } catch (error) {
      this.logger.error(`Failed to validate account holder: ${phoneNumber}`, error);
      return false;
    }
  }

  /**
   * Generate payment QR code
   */
  async generateQrCode(
    amount: number,
    reference: string,
    description: string,
  ): Promise<string> {
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
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const secret = this.configService.get<string>('MTN_MOMO_WEBHOOK_SECRET');
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return computedSignature === signature;
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add Ghana country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    } else if (!cleaned.startsWith('233')) {
      cleaned = '233' + cleaned;
    }
    
    return cleaned;
  }
}