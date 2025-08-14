import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Dealer {
  id: string;
  dealerCode: string;
  dealerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
  };
  businessInfo: {
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    vatRegistrationNumber?: string;
    licenseNumber: string;
    licenseExpiryDate: Date;
  };
  financialInfo: {
    creditLimit: number;
    currentOutstanding: number;
    paymentTerms: string;
    creditRating: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  onboardingDate: Date;
  lastActivityDate: Date;
}

export interface DealerCreditProfile {
  dealerId: string;
  creditLimit: number;
  currentOutstanding: number;
  availableCredit: number;
  creditUtilization: number;
  creditRating: string;
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    defaultedPayments: number;
    averagePaymentDays: number;
  };
  riskProfile: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastCreditReview: Date;
  nextReviewDue: Date;
}

export interface DealerPerformanceMetrics {
  dealerId: string;
  performancePeriod: {
    startDate: Date;
    endDate: Date;
  };
  salesMetrics: {
    totalVolume: { [productCode: string]: number };
    totalRevenue: number;
    averageDailySales: number;
    growthRate: number;
  };
  operationalMetrics: {
    stationsManaged: number;
    complianceScore: number;
    customerSatisfactionRating: number;
    operationalEfficiencyScore: number;
  };
  financialMetrics: {
    marginEarned: number;
    loanRepaymentRate: number;
    profitabilityScore: number;
  };
  overallRating: string;
}

@Injectable()
export class CustomerServiceIntegration {
  private readonly logger = new Logger(CustomerServiceIntegration.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('CUSTOMER_SERVICE_URL') || 'http://localhost:3004';
  }

  /**
   * Get dealer information by ID
   */
  async getDealerById(dealerId: string): Promise<Dealer | null> {
    this.logger.log(`Fetching dealer information: ${dealerId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}`)
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch dealer ${dealerId}:`, error);
      return null;
    }
  }

  /**
   * Get all active dealers
   */
  async getActiveDealers(): Promise<Dealer[]> {
    this.logger.log('Fetching all active dealers');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers`, {
          params: { status: 'ACTIVE' }
        })
      );

      return response.data.dealers || [];

    } catch (error) {
      this.logger.error('Failed to fetch active dealers:', error);
      return [];
    }
  }

  /**
   * Get dealer credit profile
   */
  async getDealerCreditProfile(dealerId: string): Promise<DealerCreditProfile | null> {
    this.logger.log(`Fetching credit profile for dealer: ${dealerId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/credit-profile`)
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch credit profile for dealer ${dealerId}:`, error);
      
      // Return default credit profile for fallback
      return this.getDefaultCreditProfile(dealerId);
    }
  }

  /**
   * Update dealer credit limit
   */
  async updateDealerCreditLimit(
    dealerId: string,
    newCreditLimit: number,
    reason: string,
    updatedBy: string
  ): Promise<void> {
    this.logger.log(`Updating credit limit for dealer ${dealerId}: ${newCreditLimit}`);

    try {
      await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/dealers/${dealerId}/credit-limit`, {
          newCreditLimit,
          reason,
          updatedBy,
          updatedAt: new Date()
        })
      );

      this.logger.log(`Credit limit updated successfully for dealer: ${dealerId}`);

    } catch (error) {
      this.logger.error(`Failed to update credit limit for dealer ${dealerId}:`, error);
      throw new Error(`Credit limit update failed: ${error.message}`);
    }
  }

  /**
   * Get dealer performance metrics
   */
  async getDealerPerformanceMetrics(
    dealerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DealerPerformanceMetrics | null> {
    this.logger.log(`Fetching performance metrics for dealer: ${dealerId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/performance`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch performance metrics for dealer ${dealerId}:`, error);
      return null;
    }
  }

  /**
   * Check dealer creditworthiness for loan application
   */
  async checkDealerCreditworthiness(
    dealerId: string,
    requestedAmount: number,
    loanType: string
  ): Promise<{
    isEligible: boolean;
    approvedAmount: number;
    creditRating: string;
    riskScore: number;
    conditions: string[];
    reasons: string[];
  }> {
    this.logger.log(`Checking creditworthiness for dealer ${dealerId}: ${requestedAmount}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/dealers/${dealerId}/credit-assessment`, {
          requestedAmount,
          loanType,
          assessmentDate: new Date()
        })
      );

      return response.data;

    } catch (error) {
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
  async recordDealerPayment(payment: {
    dealerId: string;
    paymentAmount: number;
    paymentDate: Date;
    paymentMethod: string;
    paymentReference: string;
    allocations: Array<{
      invoiceId?: string;
      loanId?: string;
      amount: number;
      description: string;
    }>;
    recordedBy: string;
  }): Promise<void> {
    this.logger.log(`Recording payment for dealer ${payment.dealerId}: ${payment.paymentAmount}`);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/dealers/${payment.dealerId}/payments`, payment)
      );

      this.logger.log(`Payment recorded successfully for dealer: ${payment.dealerId}`);

    } catch (error) {
      this.logger.error(`Failed to record payment for dealer ${payment.dealerId}:`, error);
      throw new Error(`Payment recording failed: ${error.message}`);
    }
  }

  /**
   * Get dealer outstanding balance
   */
  async getDealerOutstandingBalance(dealerId: string): Promise<{
    totalOutstanding: number;
    breakdown: {
      tradeReceivables: number;
      loanReceivables: number;
      overdueAmount: number;
      currentAmount: number;
    };
    agingAnalysis: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  }> {
    this.logger.log(`Fetching outstanding balance for dealer: ${dealerId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers/${dealerId}/outstanding-balance`)
      );

      return response.data;

    } catch (error) {
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
  async updateDealerStatus(
    dealerId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    reason: string,
    updatedBy: string
  ): Promise<void> {
    this.logger.log(`Updating dealer status: ${dealerId} -> ${status}`);

    try {
      await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/dealers/${dealerId}/status`, {
          status,
          reason,
          updatedBy,
          updatedAt: new Date()
        })
      );

      this.logger.log(`Dealer status updated successfully: ${dealerId}`);

    } catch (error) {
      this.logger.error(`Failed to update dealer status for ${dealerId}:`, error);
      throw new Error(`Dealer status update failed: ${error.message}`);
    }
  }

  /**
   * Get dealers requiring credit review
   */
  async getDealersRequiringCreditReview(): Promise<Array<{
    dealerId: string;
    dealerName: string;
    currentCreditLimit: number;
    creditUtilization: number;
    lastReviewDate: Date;
    reviewDueDate: Date;
    riskProfile: string;
  }>> {
    this.logger.log('Fetching dealers requiring credit review');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/dealers/credit-review-required`)
      );

      return response.data.dealers || [];

    } catch (error) {
      this.logger.error('Failed to fetch dealers requiring credit review:', error);
      return [];
    }
  }

  /**
   * Send dealer notification
   */
  async sendDealerNotification(notification: {
    dealerId: string;
    notificationType: 'PRICE_CHANGE' | 'PAYMENT_DUE' | 'CREDIT_LIMIT_UPDATE' | 'SETTLEMENT_READY';
    subject: string;
    message: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    channels: Array<'EMAIL' | 'SMS' | 'PUSH'>;
    sendBy: string;
  }): Promise<{
    sent: boolean;
    channels: Array<{ channel: string; status: string; error?: string }>;
  }> {
    this.logger.log(`Sending notification to dealer ${notification.dealerId}: ${notification.notificationType}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/dealers/${notification.dealerId}/notifications`, notification)
      );

      return response.data;

    } catch (error) {
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
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    lastChecked: Date;
    activeDealers?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 })
      );

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        activeDealers: response.data?.activeDealers || 0
      };

    } catch (error) {
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

  private getDefaultCreditProfile(dealerId: string): DealerCreditProfile {
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
}