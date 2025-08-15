import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SalesTransactionData {
  transactionId: string;
  stationId: string;
  productType: string;
  litresSold: number;
  exPumpPrice: number;
  transactionDate: Date;
  windowId: string;
}

export interface DealerMarginIntegrationDto {
  stationId: string;
  dealerId: string;
  accrualDate: Date;
  transactions: SalesTransactionData[];
  windowId: string;
  tenantId: string;
  processedBy?: string;
}

@Injectable()
export class DealerMarginIntegrationService {
  private readonly logger = new Logger(DealerMarginIntegrationService.name);
  private readonly dealerServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.dealerServiceUrl = this.configService.get('DEALER_SERVICE_URL', 'http://localhost:3004');
  }

  /**
   * Process daily sales data and send to dealer service for margin accrual
   */
  async processDailySalesForMarginAccrual(
    stationId: string,
    salesDate: Date,
    tenantId: string,
  ): Promise<void> {
    this.logger.log(`Processing daily sales for margin accrual: Station ${stationId}, Date ${salesDate.toDateString()}`);

    try {
      // Get daily sales data from the delivery system
      const salesData = await this.getDailySalesData(stationId, salesDate, tenantId);
      
      if (salesData.length === 0) {
        this.logger.log(`No sales data found for station ${stationId} on ${salesDate.toDateString()}`);
        return;
      }

      // Group transactions by product and aggregate
      const transactionGroups = this.aggregateTransactions(salesData);
      
      // Get current pricing window
      const windowId = await this.getCurrentPricingWindow(salesDate);
      
      if (!windowId) {
        this.logger.warn(`No pricing window found for date ${salesDate.toDateString()}`);
        return;
      }

      // Prepare dealer margin accrual data
      const marginAccrualData: DealerMarginIntegrationDto = {
        stationId,
        dealerId: stationId, // Assuming stationId maps to dealerId
        accrualDate: salesDate,
        transactions: transactionGroups,
        windowId,
        tenantId,
        processedBy: 'daily-delivery-system',
      };

      // Send to dealer service
      await this.sendToDealarService(marginAccrualData);

      // Emit event for successful processing
      this.eventEmitter.emit('dealer.margin.integration.processed', {
        stationId,
        accrualDate: salesDate,
        transactionCount: transactionGroups.length,
        windowId,
        tenantId,
      });

      this.logger.log(`Margin accrual data sent to dealer service for station ${stationId}`);

    } catch (error) {
      this.logger.error(`Failed to process margin accrual for station ${stationId}:`, error);
      
      // Emit error event
      this.eventEmitter.emit('dealer.margin.integration.failed', {
        stationId,
        accrualDate: salesDate,
        error: error.message,
        tenantId,
      });

      throw error;
    }
  }

  /**
   * Listen for daily delivery completion events
   */
  @OnEvent('daily-delivery.completed')
  async handleDailyDeliveryCompleted(payload: any): Promise<void> {
    this.logger.log(`Handling daily delivery completed event for station ${payload.stationId}`);

    try {
      // Wait a bit for all transactions to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Process margin accrual for the delivery date
      await this.processDailySalesForMarginAccrual(
        payload.stationId,
        new Date(payload.deliveryDate),
        payload.tenantId,
      );

    } catch (error) {
      this.logger.error(`Failed to handle daily delivery completion for margin accrual:`, error);
    }
  }

  /**
   * Listen for sales transaction events
   */
  @OnEvent('sales.transaction.completed')
  async handleSalesTransactionCompleted(payload: any): Promise<void> {
    this.logger.log(`Handling sales transaction completed event: ${payload.transactionId}`);

    // Store transaction for batch processing
    await this.queueTransactionForProcessing(payload);
  }

  /**
   * Listen for pricing window changes
   */
  @OnEvent('pricing.window.changed')
  async handlePricingWindowChanged(payload: any): Promise<void> {
    this.logger.log(`Handling pricing window change: ${payload.windowId}`);

    // Trigger margin recalculation for active stations if needed
    if (payload.impactsMargins) {
      await this.triggerMarginRecalculation(payload.windowId, payload.tenantId);
    }
  }

  /**
   * Process batch margin accruals for multiple stations
   */
  async processBatchMarginAccruals(
    stationDates: Array<{ stationId: string; date: Date }>,
    tenantId: string,
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ stationId: string; date: string; error: string }>;
  }> {
    this.logger.log(`Processing batch margin accruals for ${stationDates.length} station-dates`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ stationId: string; date: string; error: string }>,
    };

    // Process in batches of 10 to avoid overwhelming the dealer service
    const batchSize = 10;
    for (let i = 0; i < stationDates.length; i += batchSize) {
      const batch = stationDates.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ stationId, date }) => {
        try {
          await this.processDailySalesForMarginAccrual(stationId, date, tenantId);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            stationId,
            date: date.toDateString(),
            error: error.message,
          });
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < stationDates.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Emit batch completion event
    this.eventEmitter.emit('dealer.margin.batch.processed', {
      totalRequested: stationDates.length,
      successful: results.successful,
      failed: results.failed,
      tenantId,
    });

    this.logger.log(`Batch margin accrual processing completed: ${results.successful} successful, ${results.failed} failed`);
    
    return results;
  }

  /**
   * Get reconciliation report between deliveries and margin accruals
   */
  async getMarginReconciliationReport(
    stationId: string,
    fromDate: Date,
    toDate: Date,
    tenantId: string,
  ): Promise<{
    period: { from: Date; to: Date };
    stationId: string;
    summary: {
      deliveryDays: number;
      marginAccrualDays: number;
      matchingDays: number;
      discrepancyDays: number;
    };
    discrepancies: Array<{
      date: Date;
      deliveryVolume: number;
      accrualVolume: number;
      variance: number;
      possibleReasons: string[];
    }>;
    recommendations: string[];
  }> {
    this.logger.log(`Generating margin reconciliation report for station ${stationId}`);

    try {
      // Get delivery data for the period
      const deliveries = await this.getDeliveryData(stationId, fromDate, toDate, tenantId);
      
      // Get margin accrual data from dealer service
      const accruals = await this.getMarginAccrualData(stationId, fromDate, toDate, tenantId);

      // Reconcile the data
      const reconciliation = this.reconcileDeliveryWithAccruals(deliveries, accruals);

      const report = {
        period: { from: fromDate, to: toDate },
        stationId,
        summary: {
          deliveryDays: deliveries.length,
          marginAccrualDays: accruals.length,
          matchingDays: reconciliation.matches,
          discrepancyDays: reconciliation.discrepancies.length,
        },
        discrepancies: reconciliation.discrepancies,
        recommendations: this.generateReconciliationRecommendations(reconciliation),
      };

      return report;

    } catch (error) {
      this.logger.error(`Failed to generate margin reconciliation report:`, error);
      throw error;
    }
  }

  // Private helper methods

  private async getDailySalesData(
    stationId: string,
    salesDate: Date,
    tenantId: string,
  ): Promise<SalesTransactionData[]> {
    // This would integrate with the actual transaction/sales system
    // For now, return mock data

    const transactions: SalesTransactionData[] = [];

    // Mock sales data - in reality this would query the transaction service
    const mockProducts = ['PMS', 'AGO', 'LPG'];
    const mockTransactions = 5 + Math.floor(Math.random() * 15); // 5-20 transactions

    for (let i = 0; i < mockTransactions; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const basePrice = product === 'PMS' ? 11.50 : product === 'AGO' ? 11.80 : 9.20;
      
      transactions.push({
        transactionId: `TXN-${stationId}-${salesDate.getTime()}-${i}`,
        stationId,
        productType: product,
        litresSold: 100 + Math.random() * 500, // 100-600 litres per transaction
        exPumpPrice: basePrice + (Math.random() - 0.5) * 0.2, // ±0.1 price variation
        transactionDate: salesDate,
        windowId: `2025W${Math.ceil(new Date().getDate() / 14)}`, // Mock window ID
      });
    }

    return transactions;
  }

  private aggregateTransactions(transactions: SalesTransactionData[]): SalesTransactionData[] {
    // Group by product type and aggregate
    const productGroups = new Map<string, SalesTransactionData>();

    for (const transaction of transactions) {
      const key = transaction.productType;
      
      if (productGroups.has(key)) {
        const existing = productGroups.get(key)!;
        existing.litresSold += transaction.litresSold;
        // Weighted average price
        existing.exPumpPrice = (existing.exPumpPrice + transaction.exPumpPrice) / 2;
      } else {
        productGroups.set(key, { ...transaction });
      }
    }

    return Array.from(productGroups.values());
  }

  private async getCurrentPricingWindow(date: Date): Promise<string | null> {
    // This would integrate with the pricing service to get the current window
    // For now, return a mock window ID
    const weekOfYear = Math.ceil((date.getDate()) / 14);
    return `2025W${weekOfYear}`;
  }

  private async sendToDealarService(data: DealerMarginIntegrationDto): Promise<void> {
    const url = `${this.dealerServiceUrl}/api/dealer-management/margins/process-daily`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            'X-Service': 'daily-delivery-service',
          },
          timeout: 30000, // 30 seconds
        })
      );

      if (response.status !== 201) {
        throw new Error(`Dealer service returned status: ${response.status}`);
      }

      this.logger.log(`Successfully sent margin data to dealer service: ${response.data.message}`);

    } catch (error) {
      this.logger.error(`Failed to send data to dealer service:`, error);
      throw new Error(`Dealer service communication failed: ${error.message}`);
    }
  }

  private async queueTransactionForProcessing(transactionData: any): Promise<void> {
    // This would queue the transaction for batch processing
    // For now, just log it
    this.logger.log(`Queued transaction for processing: ${transactionData.transactionId}`);
  }

  private async triggerMarginRecalculation(windowId: string, tenantId: string): Promise<void> {
    // This would trigger recalculation of margins for the new pricing window
    this.logger.log(`Triggering margin recalculation for window: ${windowId}`);
    
    // Get active stations and trigger recalculation
    // For now, just emit an event
    this.eventEmitter.emit('dealer.margin.recalculation.triggered', {
      windowId,
      reason: 'pricing_window_changed',
      tenantId,
    });
  }

  private async getDeliveryData(
    stationId: string,
    fromDate: Date,
    toDate: Date,
    tenantId: string,
  ): Promise<any[]> {
    // This would get delivery data from the delivery system
    return [];
  }

  private async getMarginAccrualData(
    stationId: string,
    fromDate: Date,
    toDate: Date,
    tenantId: string,
  ): Promise<any[]> {
    try {
      const url = `${this.dealerServiceUrl}/api/dealer-management/margins`;
      const params = {
        stationId,
        tenantId,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      };

      const response = await firstValueFrom(
        this.httpService.get(url, { params, timeout: 15000 })
      );

      return response.data.margins || [];

    } catch (error) {
      this.logger.error(`Failed to get margin accrual data from dealer service:`, error);
      return [];
    }
  }

  private reconcileDeliveryWithAccruals(deliveries: any[], accruals: any[]): any {
    const matches = 0;
    const discrepancies: Array<{
      date: Date;
      deliveryVolume: number;
      accrualVolume: number;
      variance: number;
      possibleReasons: string[];
    }> = [];

    // Reconciliation logic would go here
    // For now, return empty reconciliation

    return { matches, discrepancies };
  }

  private generateReconciliationRecommendations(reconciliation: any): string[] {
    const recommendations: string[] = [];

    if (reconciliation.discrepancies.length > 0) {
      recommendations.push('Review discrepancies between delivery volumes and sales transactions');
      recommendations.push('Verify transaction recording accuracy');
      recommendations.push('Check for timing differences between delivery and sales');
    }

    if (reconciliation.matches / (reconciliation.matches + reconciliation.discrepancies.length) < 0.95) {
      recommendations.push('Improve data synchronization between delivery and sales systems');
    }

    return recommendations;
  }

  /**
   * Health check for the integration service
   */
  async healthCheck(): Promise<{
    status: string;
    dealerServiceConnection: boolean;
    lastProcessedDate: Date | null;
    pendingTransactions: number;
  }> {
    let dealerServiceConnection = false;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.dealerServiceUrl}/api/dealer-management/health`, {
          timeout: 5000,
        })
      );
      dealerServiceConnection = response.status === 200;
    } catch (error) {
      this.logger.warn(`Dealer service health check failed: ${error.message}`);
    }

    return {
      status: dealerServiceConnection ? 'healthy' : 'degraded',
      dealerServiceConnection,
      lastProcessedDate: null, // Would track actual last processed date
      pendingTransactions: 0, // Would track pending transactions
    };
  }
}