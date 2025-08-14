import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';

@Injectable()
export class TransactionEventHandler {
  private readonly logger = new Logger(TransactionEventHandler.name);

  constructor(
    private automatedPostingService: AutomatedPostingService,
  ) {}

  /**
   * Handle fuel transaction completion
   */
  @OnEvent('fuel.transaction.completed')
  async handleFuelTransactionCompleted(payload: any) {
    try {
      this.logger.log(`Processing fuel transaction: ${payload.transactionId}`);

      const event: TransactionEvent = {
        eventType: 'fuel.transaction.completed',
        transactionType: 'FUEL_SALE',
        sourceDocumentType: 'FUEL_TRANSACTION',
        sourceDocumentId: payload.transactionId,
        transactionData: {
          transaction_id: payload.transactionId,
          transaction_number: payload.transactionNumber,
          transaction_date: payload.transactionDate,
          station_id: payload.stationId,
          pump_id: payload.pumpId,
          attendant_id: payload.attendantId,
          customer_id: payload.customerId,
          vehicle_id: payload.vehicleId,
          product_type: payload.productType,
          quantity_liters: payload.quantityLiters,
          unit_price: payload.unitPrice,
          total_amount: payload.totalAmount,
          discount_amount: payload.discountAmount || 0,
          tax_amount: payload.taxAmount || 0,
          net_amount: payload.netAmount,
          payment_method_id: payload.paymentMethodId,
          payment_status: payload.paymentStatus,
          is_credit_sale: payload.isCreditSale || false,
          loyalty_points_earned: payload.loyaltyPointsEarned || 0,
          
          // Price buildup components
          ex_pump_price: payload.priceBreakdown?.exPumpPrice,
          uppf_component: payload.priceBreakdown?.uppfComponent,
          omc_margin: payload.priceBreakdown?.omcMargin,
          dealer_margin: payload.priceBreakdown?.dealerMargin,
          tax_breakdown: payload.priceBreakdown?.taxes || {},
          
          // IFRS 15 data
          performance_obligations: this.extractPerformanceObligations(payload),
          contract_details: payload.contractDetails,
          
          // Multi-currency support
          currency_code: payload.currencyCode || 'GHS',
          exchange_rate: payload.exchangeRate || 1,
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.transactionDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling fuel transaction ${payload.transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle fuel transaction reversal
   */
  @OnEvent('fuel.transaction.reversed')
  async handleFuelTransactionReversed(payload: any) {
    try {
      this.logger.log(`Processing fuel transaction reversal: ${payload.originalTransactionId}`);

      const event: TransactionEvent = {
        eventType: 'fuel.transaction.reversed',
        transactionType: 'FUEL_SALE_REVERSAL',
        sourceDocumentType: 'FUEL_TRANSACTION_REVERSAL',
        sourceDocumentId: payload.reversalId,
        transactionData: {
          reversal_id: payload.reversalId,
          original_transaction_id: payload.originalTransactionId,
          reversal_date: payload.reversalDate,
          reversal_reason: payload.reversalReason,
          reversed_by: payload.reversedBy,
          
          // Original transaction data for reversal entries
          original_amount: -Math.abs(payload.originalAmount), // Negative for reversal
          original_quantity: -Math.abs(payload.originalQuantity),
          station_id: payload.stationId,
          product_type: payload.productType,
          customer_id: payload.customerId,
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.reversalDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling fuel transaction reversal ${payload.reversalId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle cash sale transaction
   */
  @OnEvent('cash.sale.completed')
  async handleCashSaleCompleted(payload: any) {
    try {
      this.logger.log(`Processing cash sale: ${payload.saleId}`);

      const event: TransactionEvent = {
        eventType: 'cash.sale.completed',
        transactionType: 'CASH_SALE',
        sourceDocumentType: 'CASH_SALE',
        sourceDocumentId: payload.saleId,
        transactionData: {
          sale_id: payload.saleId,
          sale_number: payload.saleNumber,
          sale_date: payload.saleDate,
          station_id: payload.stationId,
          attendant_id: payload.attendantId,
          customer_id: payload.customerId,
          
          // Sale items
          sale_items: payload.items || [],
          subtotal_amount: payload.subtotalAmount,
          discount_amount: payload.discountAmount || 0,
          tax_amount: payload.taxAmount || 0,
          total_amount: payload.totalAmount,
          
          // Payment information
          payment_method: payload.paymentMethod || 'CASH',
          cash_received: payload.cashReceived,
          change_given: payload.changeGiven || 0,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.saleDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling cash sale ${payload.saleId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle credit sale transaction
   */
  @OnEvent('credit.sale.completed')
  async handleCreditSaleCompleted(payload: any) {
    try {
      this.logger.log(`Processing credit sale: ${payload.saleId}`);

      const event: TransactionEvent = {
        eventType: 'credit.sale.completed',
        transactionType: 'CREDIT_SALE',
        sourceDocumentType: 'CREDIT_SALE',
        sourceDocumentId: payload.saleId,
        transactionData: {
          sale_id: payload.saleId,
          sale_number: payload.saleNumber,
          sale_date: payload.saleDate,
          station_id: payload.stationId,
          attendant_id: payload.attendantId,
          customer_id: payload.customerId,
          
          // Credit terms
          credit_limit: payload.creditLimit,
          payment_terms_days: payload.paymentTermsDays,
          due_date: payload.dueDate,
          
          // Sale details
          subtotal_amount: payload.subtotalAmount,
          discount_amount: payload.discountAmount || 0,
          tax_amount: payload.taxAmount || 0,
          total_amount: payload.totalAmount,
          
          // IFRS 9 data for ECL calculation
          customer_credit_rating: payload.customerCreditRating,
          customer_category: payload.customerCategory,
          historical_payment_behavior: payload.historicalPaymentBehavior,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.saleDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling credit sale ${payload.saleId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle payment received transaction
   */
  @OnEvent('payment.received')
  async handlePaymentReceived(payload: any) {
    try {
      this.logger.log(`Processing payment received: ${payload.paymentId}`);

      const event: TransactionEvent = {
        eventType: 'payment.received',
        transactionType: 'PAYMENT_RECEIVED',
        sourceDocumentType: 'PAYMENT_TRANSACTION',
        sourceDocumentId: payload.paymentId,
        transactionData: {
          payment_id: payload.paymentId,
          payment_number: payload.paymentNumber,
          payment_date: payload.paymentDate,
          customer_id: payload.customerId,
          station_id: payload.stationId,
          
          // Payment details
          payment_amount: payload.paymentAmount,
          payment_method: payload.paymentMethod,
          reference_number: payload.referenceNumber,
          bank_account: payload.bankAccount,
          
          // Applied to invoices/receivables
          applied_invoices: payload.appliedInvoices || [],
          unapplied_amount: payload.unappliedAmount || 0,
          
          // Discounts and adjustments
          early_payment_discount: payload.earlyPaymentDiscount || 0,
          late_payment_charges: payload.latePaymentCharges || 0,
          
          // Foreign currency
          currency_code: payload.currencyCode || 'GHS',
          exchange_rate: payload.exchangeRate || 1,
          functional_currency_amount: payload.functionalCurrencyAmount,
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.paymentDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling payment received ${payload.paymentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle write-off transaction
   */
  @OnEvent('receivable.writeoff')
  async handleReceivableWriteOff(payload: any) {
    try {
      this.logger.log(`Processing receivable write-off: ${payload.writeOffId}`);

      const event: TransactionEvent = {
        eventType: 'receivable.writeoff',
        transactionType: 'RECEIVABLE_WRITEOFF',
        sourceDocumentType: 'WRITEOFF_TRANSACTION',
        sourceDocumentId: payload.writeOffId,
        transactionData: {
          writeoff_id: payload.writeOffId,
          writeoff_date: payload.writeOffDate,
          customer_id: payload.customerId,
          station_id: payload.stationId,
          
          // Write-off details
          writeoff_amount: payload.writeOffAmount,
          writeoff_reason: payload.writeOffReason,
          writeoff_category: payload.writeOffCategory, // 'BAD_DEBT', 'CUSTOMER_DISPUTE', 'UNCOLLECTIBLE'
          approved_by: payload.approvedBy,
          
          // Original receivable details
          original_invoice_ids: payload.originalInvoiceIds || [],
          original_sale_date: payload.originalSaleDate,
          days_outstanding: payload.daysOutstanding,
          
          // Recovery potential
          expected_recovery_amount: payload.expectedRecoveryAmount || 0,
          recovery_probability: payload.recoveryProbability || 0,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.writeOffDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling receivable write-off ${payload.writeOffId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle recovery of written-off receivable
   */
  @OnEvent('receivable.recovery')
  async handleReceivableRecovery(payload: any) {
    try {
      this.logger.log(`Processing receivable recovery: ${payload.recoveryId}`);

      const event: TransactionEvent = {
        eventType: 'receivable.recovery',
        transactionType: 'RECEIVABLE_RECOVERY',
        sourceDocumentType: 'RECOVERY_TRANSACTION',
        sourceDocumentId: payload.recoveryId,
        transactionData: {
          recovery_id: payload.recoveryId,
          recovery_date: payload.recoveryDate,
          customer_id: payload.customerId,
          station_id: payload.stationId,
          
          // Recovery details
          recovery_amount: payload.recoveryAmount,
          original_writeoff_id: payload.originalWriteOffId,
          original_writeoff_amount: payload.originalWriteOffAmount,
          recovery_method: payload.recoveryMethod, // 'PAYMENT', 'ASSET_RECOVERY', 'SETTLEMENT'
          
          // Collection details
          collection_agency: payload.collectionAgency,
          collection_costs: payload.collectionCosts || 0,
          legal_costs: payload.legalCosts || 0,
          net_recovery_amount: payload.recoveryAmount - (payload.collectionCosts || 0) - (payload.legalCosts || 0),
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        customerId: payload.customerId,
        timestamp: new Date(payload.recoveryDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling receivable recovery ${payload.recoveryId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract performance obligations for IFRS 15
   */
  private extractPerformanceObligations(payload: any): Array<{
    obligation_id: string;
    description: string;
    allocated_value: number;
    satisfaction_method: string;
  }> {
    // For fuel sales, typically one performance obligation
    return [{
      obligation_id: `FUEL_DELIVERY_${payload.transactionId}`,
      description: `Fuel delivery - ${payload.productType} ${payload.quantityLiters}L`,
      allocated_value: payload.totalAmount,
      satisfaction_method: 'POINT_IN_TIME', // Fuel delivery is point-in-time
    }];
  }
}