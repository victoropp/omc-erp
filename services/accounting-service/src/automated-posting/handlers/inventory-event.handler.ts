import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';

@Injectable()
export class InventoryEventHandler {
  private readonly logger = new Logger(InventoryEventHandler.name);

  constructor(
    private automatedPostingService: AutomatedPostingService,
  ) {}

  /**
   * Handle inventory receipt (stock delivery)
   */
  @OnEvent('inventory.receipt.approved')
  async handleInventoryReceiptApproved(payload: any) {
    try {
      this.logger.log(`Processing inventory receipt: ${payload.receiptId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.receipt.approved',
        transactionType: 'INVENTORY_RECEIPT',
        sourceDocumentType: 'STOCK_RECEIPT',
        sourceDocumentId: payload.receiptId,
        transactionData: {
          receipt_id: payload.receiptId,
          receipt_number: payload.receiptNumber,
          receipt_date: payload.receiptDate,
          station_id: payload.stationId,
          supplier_id: payload.supplierId,
          
          // Delivery details
          delivery_note_number: payload.deliveryNoteNumber,
          waybill_number: payload.waybillNumber,
          truck_number: payload.truckNumber,
          driver_name: payload.driverName,
          driver_license: payload.driverLicense,
          
          // Receipt items
          receipt_items: payload.receiptItems || [],
          total_quantity: payload.totalQuantity,
          total_value: payload.totalValue,
          
          // Quality and temperature data
          temperature_readings: payload.temperatureReadings || {},
          quality_certificates: payload.qualityCertificates || [],
          
          // Variance analysis
          expected_quantity: payload.expectedQuantity,
          variance_quantity: payload.varianceQuantity || 0,
          variance_amount: payload.varianceAmount || 0,
          
          // IAS 2 inventory valuation data
          unit_costs: payload.unitCosts || {},
          landed_costs: payload.landedCosts || {},
          inventory_valuation_method: payload.inventoryValuationMethod || 'FIFO',
          
          // Supplier invoice details
          supplier_invoice_number: payload.supplierInvoiceNumber,
          supplier_invoice_date: payload.supplierInvoiceDate,
          supplier_invoice_amount: payload.supplierInvoiceAmount,
          
          currency_code: payload.currencyCode || 'GHS',
          exchange_rate: payload.exchangeRate || 1,
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.receiptDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory receipt ${payload.receiptId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory issue/consumption
   */
  @OnEvent('inventory.issued')
  async handleInventoryIssued(payload: any) {
    try {
      this.logger.log(`Processing inventory issue: ${payload.issueId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.issued',
        transactionType: 'INVENTORY_ISSUE',
        sourceDocumentType: 'INVENTORY_ISSUE',
        sourceDocumentId: payload.issueId,
        transactionData: {
          issue_id: payload.issueId,
          issue_number: payload.issueNumber,
          issue_date: payload.issueDate,
          station_id: payload.stationId,
          issued_to: payload.issuedTo,
          
          // Issue details
          issue_items: payload.issueItems || [],
          total_quantity: payload.totalQuantity,
          total_cost: payload.totalCost,
          issue_reason: payload.issueReason, // 'SALE', 'INTERNAL_USE', 'WASTE', 'TRANSFER'
          
          // Cost calculation
          cost_method: payload.costMethod || 'FIFO',
          unit_costs: payload.unitCosts || {},
          average_costs: payload.averageCosts || {},
          
          // Related sale transaction (if applicable)
          related_sale_id: payload.relatedSaleId,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.issueDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory issue ${payload.issueId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory transfer between stations
   */
  @OnEvent('inventory.transfer.completed')
  async handleInventoryTransferCompleted(payload: any) {
    try {
      this.logger.log(`Processing inventory transfer: ${payload.transferId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.transfer.completed',
        transactionType: 'INVENTORY_TRANSFER',
        sourceDocumentType: 'INVENTORY_TRANSFER',
        sourceDocumentId: payload.transferId,
        transactionData: {
          transfer_id: payload.transferId,
          transfer_number: payload.transferNumber,
          transfer_date: payload.transferDate,
          from_station_id: payload.fromStationId,
          to_station_id: payload.toStationId,
          
          // Transfer items
          transfer_items: payload.transferItems || [],
          total_quantity: payload.totalQuantity,
          total_value: payload.totalValue,
          
          // Transfer costs
          transportation_cost: payload.transportationCost || 0,
          handling_cost: payload.handlingCost || 0,
          insurance_cost: payload.insuranceCost || 0,
          total_transfer_cost: payload.totalTransferCost || 0,
          
          // Vehicle and logistics
          vehicle_id: payload.vehicleId,
          driver_id: payload.driverId,
          departure_time: payload.departureTime,
          arrival_time: payload.arrivalTime,
          
          // Variance tracking
          sent_quantity: payload.sentQuantity,
          received_quantity: payload.receivedQuantity,
          variance_quantity: payload.varianceQuantity || 0,
          variance_reason: payload.varianceReason,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.fromStationId, // Primary station for accounting
        timestamp: new Date(payload.transferDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory transfer ${payload.transferId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory adjustment (stock take variances)
   */
  @OnEvent('inventory.adjustment.approved')
  async handleInventoryAdjustmentApproved(payload: any) {
    try {
      this.logger.log(`Processing inventory adjustment: ${payload.adjustmentId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.adjustment.approved',
        transactionType: 'INVENTORY_ADJUSTMENT',
        sourceDocumentType: 'INVENTORY_ADJUSTMENT',
        sourceDocumentId: payload.adjustmentId,
        transactionData: {
          adjustment_id: payload.adjustmentId,
          adjustment_number: payload.adjustmentNumber,
          adjustment_date: payload.adjustmentDate,
          station_id: payload.stationId,
          stock_take_id: payload.stockTakeId,
          
          // Adjustment details
          adjustment_items: payload.adjustmentItems || [],
          total_variance_quantity: payload.totalVarianceQuantity,
          total_variance_value: payload.totalVarianceValue,
          
          // Variance analysis
          system_quantities: payload.systemQuantities || {},
          physical_quantities: payload.physicalQuantities || {},
          variance_reasons: payload.varianceReasons || {},
          
          // Approval details
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          investigation_notes: payload.investigationNotes,
          
          // Cost impact
          shrinkage_cost: payload.shrinkageCost || 0,
          gain_value: payload.gainValue || 0,
          net_adjustment_value: payload.netAdjustmentValue,
          
          // IAS 2 compliance
          net_realizable_value: payload.netRealizableValue || {},
          obsolete_inventory: payload.obsoleteInventory || {},
          writedown_required: payload.writedownRequired || false,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.adjustmentDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory adjustment ${payload.adjustmentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory valuation adjustment (NRV, obsolescence)
   */
  @OnEvent('inventory.valuation.adjustment')
  async handleInventoryValuationAdjustment(payload: any) {
    try {
      this.logger.log(`Processing inventory valuation adjustment: ${payload.adjustmentId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.valuation.adjustment',
        transactionType: 'INVENTORY_VALUATION_ADJUSTMENT',
        sourceDocumentType: 'VALUATION_ADJUSTMENT',
        sourceDocumentId: payload.adjustmentId,
        transactionData: {
          adjustment_id: payload.adjustmentId,
          adjustment_date: payload.adjustmentDate,
          station_id: payload.stationId,
          product_id: payload.productId,
          
          // Valuation details
          cost_basis: payload.costBasis,
          net_realizable_value: payload.netRealizableValue,
          writedown_amount: payload.writedownAmount,
          writedown_reason: payload.writedownReason, // 'OBSOLESCENCE', 'DAMAGE', 'MARKET_DECLINE', 'EXPIRY'
          
          // Market data
          current_market_price: payload.currentMarketPrice,
          estimated_selling_price: payload.estimatedSellingPrice,
          cost_of_completion: payload.costOfCompletion || 0,
          selling_costs: payload.sellingCosts || 0,
          
          // Quantity affected
          affected_quantity: payload.affectedQuantity,
          unit_writedown: payload.unitWritedown,
          
          // Recovery potential
          expected_recovery_percentage: payload.expectedRecoveryPercentage || 0,
          recovery_timeline_months: payload.recoveryTimelineMonths,
          
          // IAS 2 compliance flags
          inventory_adjustment_required: true,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.adjustmentDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory valuation adjustment ${payload.adjustmentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory waste/loss
   */
  @OnEvent('inventory.waste.recorded')
  async handleInventoryWasteRecorded(payload: any) {
    try {
      this.logger.log(`Processing inventory waste: ${payload.wasteId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.waste.recorded',
        transactionType: 'INVENTORY_WASTE',
        sourceDocumentType: 'INVENTORY_WASTE',
        sourceDocumentId: payload.wasteId,
        transactionData: {
          waste_id: payload.wasteId,
          waste_date: payload.wasteDate,
          station_id: payload.stationId,
          recorded_by: payload.recordedBy,
          
          // Waste details
          product_id: payload.productId,
          product_type: payload.productType,
          waste_quantity: payload.wasteQuantity,
          waste_value: payload.wasteValue,
          unit_cost: payload.unitCost,
          
          // Waste reason and category
          waste_reason: payload.wasteReason, // 'SPILLAGE', 'EVAPORATION', 'CONTAMINATION', 'EXPIRY', 'DAMAGE'
          waste_category: payload.wasteCategory, // 'NORMAL', 'ABNORMAL', 'EXTRAORDINARY'
          
          // Investigation and approval
          investigation_required: payload.investigationRequired || false,
          investigation_notes: payload.investigationNotes,
          approved_by: payload.approvedBy,
          
          // Environmental and regulatory
          environmental_impact: payload.environmentalImpact,
          regulatory_reporting_required: payload.regulatoryReportingRequired || false,
          disposal_method: payload.disposalMethod,
          disposal_cost: payload.disposalCost || 0,
          
          // Insurance claim potential
          insurance_claimable: payload.insuranceClaimable || false,
          insurance_claim_amount: payload.insuranceClaimAmount || 0,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.wasteDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory waste ${payload.wasteId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle inventory revaluation (periodic market adjustment)
   */
  @OnEvent('inventory.revaluation')
  async handleInventoryRevaluation(payload: any) {
    try {
      this.logger.log(`Processing inventory revaluation: ${payload.revaluationId}`);

      const event: TransactionEvent = {
        eventType: 'inventory.revaluation',
        transactionType: 'INVENTORY_REVALUATION',
        sourceDocumentType: 'INVENTORY_REVALUATION',
        sourceDocumentId: payload.revaluationId,
        transactionData: {
          revaluation_id: payload.revaluationId,
          revaluation_date: payload.revaluationDate,
          station_id: payload.stationId,
          revaluation_method: payload.revaluationMethod, // 'MARKET_PRICE', 'REPLACEMENT_COST', 'NET_REALIZABLE_VALUE'
          
          // Revaluation details
          product_revaluations: payload.productRevaluations || [],
          total_book_value: payload.totalBookValue,
          total_market_value: payload.totalMarketValue,
          total_revaluation_amount: payload.totalRevaluationAmount,
          
          // Market data sources
          price_source: payload.priceSource, // 'NPA_PRICING', 'MARKET_SURVEY', 'SUPPLIER_QUOTE'
          price_effective_date: payload.priceEffectiveDate,
          price_validity_period: payload.priceValidityPeriod,
          
          // Approval and documentation
          approved_by: payload.approvedBy,
          supporting_documentation: payload.supportingDocumentation || [],
          external_valuation_report: payload.externalValuationReport,
          
          // Frequency and next review
          revaluation_frequency: payload.revaluationFrequency, // 'MONTHLY', 'QUARTERLY', 'ANNUALLY'
          next_revaluation_date: payload.nextRevaluationDate,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.revaluationDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling inventory revaluation ${payload.revaluationId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle consignment inventory transactions
   */
  @OnEvent('consignment.inventory.movement')
  async handleConsignmentInventoryMovement(payload: any) {
    try {
      this.logger.log(`Processing consignment inventory movement: ${payload.movementId}`);

      const event: TransactionEvent = {
        eventType: 'consignment.inventory.movement',
        transactionType: 'CONSIGNMENT_INVENTORY',
        sourceDocumentType: 'CONSIGNMENT_MOVEMENT',
        sourceDocumentId: payload.movementId,
        transactionData: {
          movement_id: payload.movementId,
          movement_date: payload.movementDate,
          movement_type: payload.movementType, // 'RECEIPT', 'SALE', 'RETURN'
          station_id: payload.stationId,
          consignor_id: payload.consignorId,
          
          // Consignment details
          consignment_agreement_id: payload.consignmentAgreementId,
          consignment_terms: payload.consignmentTerms || {},
          
          // Movement details
          product_id: payload.productId,
          quantity: payload.quantity,
          unit_value: payload.unitValue,
          total_value: payload.totalValue,
          
          // Commission and fees
          commission_rate: payload.commissionRate || 0,
          commission_amount: payload.commissionAmount || 0,
          handling_fee: payload.handlingFee || 0,
          storage_fee: payload.storageFee || 0,
          
          // Settlement details
          settlement_due_date: payload.settlementDueDate,
          payment_terms: payload.paymentTerms,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.movementDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling consignment inventory movement ${payload.movementId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}