import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface FuelTransaction {
  transactionId: string;
  transactionNumber: string;
  stationId: string;
  dealerId: string;
  productId: string;
  volume: number;
  unitPrice: number;
  totalAmount: number;
  transactionDate: Date;
  paymentMethod: string;
  paymentReference?: string;
  customerId?: string;
  vehicleNumber?: string;
  pumpId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  priceBreakdown: {
    basePrice: number;
    taxes: number;
    levies: number;
    margins: number;
  };
  createdAt: Date;
}

export interface TransactionSummary {
  stationId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalTransactions: number;
    totalVolume: number;
    totalRevenue: number;
    averageTransactionSize: number;
    productBreakdown: { [productId: string]: { volume: number; revenue: number; transactions: number } };
  };
}

export interface DeliveryConsignment {
  consignmentId: string;
  deliveryNumber: string;
  depotId: string;
  stationId: string;
  productId: string;
  vehicleId: string;
  driverId: string;
  litresLoaded: number;
  litresReceived?: number;
  loadingTemp?: number;
  receivingTemp?: number;
  dispatchDatetime: Date;
  arrivalDatetime?: Date;
  routeId?: string;
  kmPlanned?: number;
  kmActual?: number;
  gpsTraceId?: string;
  waybillNumber?: string;
  sealNumbers?: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
  varianceLitres?: number;
  varianceReason?: string;
}

export interface PaymentTransaction {
  paymentId: string;
  paymentReference: string;
  dealerId: string;
  stationId?: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK';
  paymentDate: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  description: string;
  allocations?: Array<{
    settlementId?: string;
    loanId?: string;
    amount: number;
    description: string;
  }>;
}

@Injectable()
export class TransactionServiceIntegration {
  private readonly logger = new Logger(TransactionServiceIntegration.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('TRANSACTION_SERVICE_URL') || 'http://localhost:3005';
  }

  /**
   * Get fuel transactions for a station and period
   */
  async getStationTransactions(
    stationId: string,
    startDate: Date,
    endDate: Date,
    productId?: string
  ): Promise<FuelTransaction[]> {
    this.logger.log(`Fetching transactions for station ${stationId}: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      const params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      if (productId) {
        params.productId = productId;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/stations/${stationId}`, { params })
      );

      return response.data.transactions || [];

    } catch (error) {
      this.logger.error(`Failed to fetch transactions for station ${stationId}:`, error);
      return [];
    }
  }

  /**
   * Get transaction summary for volume calculation
   */
  async getTransactionSummary(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TransactionSummary | null> {
    this.logger.log(`Fetching transaction summary for station: ${stationId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/stations/${stationId}/summary`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch transaction summary for station ${stationId}:`, error);
      return null;
    }
  }

  /**
   * Get delivery consignments for UPPF claims
   */
  async getDeliveryConsignments(
    stationId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: string
  ): Promise<DeliveryConsignment[]> {
    this.logger.log('Fetching delivery consignments');

    try {
      const params: any = {};
      
      if (stationId) params.stationId = stationId;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (status) params.status = status;

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/deliveries`, { params })
      );

      return response.data.consignments || [];

    } catch (error) {
      this.logger.error('Failed to fetch delivery consignments:', error);
      return [];
    }
  }

  /**
   * Get specific delivery consignment by ID
   */
  async getDeliveryConsignmentById(consignmentId: string): Promise<DeliveryConsignment | null> {
    this.logger.log(`Fetching delivery consignment: ${consignmentId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/deliveries/${consignmentId}`)
      );

      return response.data;

    } catch (error) {
      this.logger.error(`Failed to fetch delivery consignment ${consignmentId}:`, error);
      return null;
    }
  }

  /**
   * Update delivery consignment status
   */
  async updateDeliveryStatus(
    consignmentId: string,
    status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED',
    notes?: string
  ): Promise<void> {
    this.logger.log(`Updating delivery status: ${consignmentId} -> ${status}`);

    try {
      await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/transactions/deliveries/${consignmentId}/status`, {
          status,
          notes,
          updatedAt: new Date()
        })
      );

      this.logger.log(`Delivery status updated: ${consignmentId}`);

    } catch (error) {
      this.logger.error(`Failed to update delivery status for ${consignmentId}:`, error);
      throw new Error(`Delivery status update failed: ${error.message}`);
    }
  }

  /**
   * Record dealer payment transaction
   */
  async recordPaymentTransaction(payment: {
    dealerId: string;
    stationId?: string;
    amount: number;
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CHECK';
    paymentReference: string;
    description: string;
    allocations?: Array<{
      settlementId?: string;
      loanId?: string;
      amount: number;
      description: string;
    }>;
    recordedBy: string;
  }): Promise<PaymentTransaction> {
    this.logger.log(`Recording payment transaction for dealer ${payment.dealerId}: ${payment.amount}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/transactions/payments`, {
          ...payment,
          paymentDate: new Date(),
          status: 'PENDING'
        })
      );

      this.logger.log(`Payment transaction recorded: ${response.data.paymentId}`);
      return response.data;

    } catch (error) {
      this.logger.error(`Failed to record payment transaction for dealer ${payment.dealerId}:`, error);
      throw new Error(`Payment transaction recording failed: ${error.message}`);
    }
  }

  /**
   * Get dealer payment transactions
   */
  async getDealerPaymentTransactions(
    dealerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaymentTransaction[]> {
    this.logger.log(`Fetching payment transactions for dealer: ${dealerId}`);

    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/payments/dealers/${dealerId}`, { params })
      );

      return response.data.payments || [];

    } catch (error) {
      this.logger.error(`Failed to fetch payment transactions for dealer ${dealerId}:`, error);
      return [];
    }
  }

  /**
   * Get transaction analytics for pricing decisions
   */
  async getTransactionAnalytics(
    startDate: Date,
    endDate: Date,
    groupBy: 'station' | 'product' | 'region' = 'station'
  ): Promise<Array<{
    groupKey: string;
    totalVolume: number;
    totalRevenue: number;
    transactionCount: number;
    averageUnitPrice: number;
    marketShare: number;
  }>> {
    this.logger.log(`Fetching transaction analytics: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/analytics`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            groupBy
          }
        })
      );

      return response.data.analytics || [];

    } catch (error) {
      this.logger.error('Failed to fetch transaction analytics:', error);
      return [];
    }
  }

  /**
   * Get fuel inventory movements for stock reconciliation
   */
  async getInventoryMovements(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    movementId: string;
    stationId: string;
    productId: string;
    movementType: 'DELIVERY' | 'SALE' | 'ADJUSTMENT' | 'LOSS';
    quantity: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
    timestamp: Date;
  }>> {
    this.logger.log(`Fetching inventory movements for station ${stationId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/inventory-movements/${stationId}`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      );

      return response.data.movements || [];

    } catch (error) {
      this.logger.error(`Failed to fetch inventory movements for station ${stationId}:`, error);
      return [];
    }
  }

  /**
   * Process bulk fuel transactions for settlement calculation
   */
  async processBulkTransactions(transactions: Array<{
    stationId: string;
    productId: string;
    volume: number;
    unitPrice: number;
    transactionDate: Date;
    dealerId: string;
  }>): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    this.logger.log(`Processing ${transactions.length} bulk transactions`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/transactions/bulk-process`, {
          transactions
        })
      );

      return response.data;

    } catch (error) {
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
  async getTransactionDisputes(
    stationId?: string,
    status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
  ): Promise<Array<{
    disputeId: string;
    transactionId: string;
    stationId: string;
    dealerId: string;
    disputeType: string;
    description: string;
    amount: number;
    status: string;
    reportedDate: Date;
    resolvedDate?: Date;
  }>> {
    this.logger.log('Fetching transaction disputes');

    try {
      const params: any = {};
      if (stationId) params.stationId = stationId;
      if (status) params.status = status;

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/disputes`, { params })
      );

      return response.data.disputes || [];

    } catch (error) {
      this.logger.error('Failed to fetch transaction disputes:', error);
      return [];
    }
  }

  /**
   * Health check for transaction service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    lastChecked: Date;
    dailyTransactions?: number;
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
        dailyTransactions: response.data?.dailyTransactions || 0
      };

    } catch (error) {
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
  async getRealTimeMetrics(): Promise<{
    activeTransactions: number;
    totalVolumeToday: number;
    totalRevenueToday: number;
    stationsOnline: number;
    averageTransactionValue: number;
    topSellingProduct: string;
  }> {
    this.logger.log('Fetching real-time transaction metrics');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/transactions/realtime-metrics`)
      );

      return response.data;

    } catch (error) {
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
  async validateTransactionIntegrity(
    stationId: string,
    date: Date
  ): Promise<{
    isValid: boolean;
    discrepancies: Array<{
      type: string;
      description: string;
      impact: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    totalVariance: number;
  }> {
    this.logger.log(`Validating transaction integrity for station ${stationId} on ${date.toISOString()}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/transactions/validate-integrity`, {
          stationId,
          date: date.toISOString()
        })
      );

      return response.data;

    } catch (error) {
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
}