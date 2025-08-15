import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Decimal } from 'decimal.js';
import { addDays } from 'date-fns';

import { DailyDelivery, DeliveryStatus, StationType, RevenueRecognitionType } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';

export interface InvoiceGenerationRequest {
  deliveryIds: string[];
  generationType: 'SUPPLIER' | 'CUSTOMER' | 'BOTH';
  approvalRequired: boolean;
  invoiceDate?: Date;
  dueDate?: Date;
  forceGeneration?: boolean;
  bulkProcessing?: boolean;
  generatedBy: string;
}

export interface InvoiceGenerationResult {
  success: boolean;
  invoicesGenerated: number;
  errors: string[];
  invoiceIds: string[];
  journalEntryIds: string[];
  totalAmount: number;
  processingTime: number;
}

export interface APInvoiceData {
  tenantId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  description: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  purchaseOrderId?: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  referenceNumber: string;
  withholdingTaxAmount: number;
  vatAmount: number;
  customsDutyAmount: number;
  contractLiabilityAmount: number;
  revenueRecognitionDate: Date;
  lines: APInvoiceLineData[];
  ghanaCompliance: GhanaComplianceData;
}

export interface ARInvoiceData {
  tenantId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  description: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  salesOrderId?: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  referenceNumber: string;
  vatAmount: number;
  dealerMarginAmount: number;
  uppfLevyAmount: number;
  revenueRecognitionDate: Date;
  lines: ARInvoiceLineData[];
  ghanaCompliance: GhanaComplianceData;
}

export interface APInvoiceLineData {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountCode: string;
  costCenter?: string;
  productType?: string;
  supplierId?: string;
  taxCode?: string;
  taxAmount?: number;
}

export interface ARInvoiceLineData {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountCode: string;
  productType?: string;
  customerId?: string;
  taxCode?: string;
  taxAmount?: number;
  dealerMargin?: number;
  uppfLevy?: number;
}

export interface GhanaComplianceData {
  npaPermitNumber?: string;
  customsEntryNumber?: string;
  customsDutyPaid: number;
  petroleumTaxAmount: number;
  energyFundLevy: number;
  roadFundLevy: number;
  priceStabilizationLevy: number;
  primaryDistributionMargin: number;
  marketingMargin: number;
  dealerMargin: number;
  unifiedPetroleumPriceFundLevy: number;
  vatRate: number;
  withholdingTaxRate?: number;
}

export interface JournalEntryData {
  tenantId: string;
  journalDate: Date;
  description: string;
  journalType: string;
  sourceModule: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  referenceNumber: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLineData[];
  createdBy: string;
  approvalRequired: boolean;
  ifrsCompliant: boolean;
  ghanaCompliant: boolean;
}

export interface JournalLineData {
  lineNumber: number;
  accountCode: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: string;
  dimension1?: string;
  dimension2?: string;
  dimension3?: string;
  analyticsCodes?: string[];
}

@Injectable()
export class APARIntegrationService {
  private readonly logger = new Logger(APARIntegrationService.name);
  private readonly GHANA_VAT_RATE = 0.125; // 12.5%
  private readonly WITHHOLDING_TAX_RATE = 0.05; // 5%

  constructor(
    @InjectRepository(DailyDelivery)
    private readonly deliveryRepository: Repository<DailyDelivery>,
    @InjectRepository(DeliveryLineItem)
    private readonly lineItemRepository: Repository<DeliveryLineItem>,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly ghanaComplianceService: GhanaComplianceService,
    private readonly approvalService: ApprovalWorkflowService,
  ) {}

  /**
   * Main entry point for invoice generation from deliveries
   */
  async generateInvoicesFromDeliveries(request: InvoiceGenerationRequest): Promise<InvoiceGenerationResult> {
    const startTime = Date.now();
    this.logger.log(`Starting invoice generation for ${request.deliveryIds.length} deliveries`);

    const result: InvoiceGenerationResult = {
      success: false,
      invoicesGenerated: 0,
      errors: [],
      invoiceIds: [],
      journalEntryIds: [],
      totalAmount: 0,
      processingTime: 0,
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Get deliveries with validation
      const deliveries = await this.getValidatedDeliveries(request.deliveryIds, request.forceGeneration);
      
      if (deliveries.length === 0) {
        throw new BadRequestException('No valid deliveries found for invoice generation');
      }

      // Start transaction for batch processing
      await queryRunner.startTransaction();

      // Process each delivery
      for (const delivery of deliveries) {
        try {
          await this.processDeliveryInvoicing(delivery, request, result, queryRunner);
        } catch (error) {
          this.logger.error(`Failed to process delivery ${delivery.deliveryNumber}:`, error);
          result.errors.push(`Delivery ${delivery.deliveryNumber}: ${error.message}`);
          
          if (!request.bulkProcessing) {
            throw error; // Fail fast if not bulk processing
          }
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      result.success = result.errors.length === 0 || request.bulkProcessing;
      result.processingTime = Date.now() - startTime;

      // Emit completion event
      this.eventEmitter.emit('invoice_generation.completed', {
        result,
        request,
        processingTime: result.processingTime,
      });

      this.logger.log(`Invoice generation completed: ${result.invoicesGenerated} invoices generated`);
      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Invoice generation failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate supplier invoice (AP) from delivery with station type consideration
   */
  async generateSupplierInvoice(delivery: DailyDelivery, userId: string, invoiceDate?: Date, dueDate?: Date): Promise<string> {
    this.logger.log(`Generating supplier invoice for delivery ${delivery.deliveryNumber} (Station: ${delivery.stationType})`);

    // Validate delivery state
    this.validateDeliveryForSupplierInvoicing(delivery);

    // Station type specific validations
    if (delivery.stationType === StationType.COCO || delivery.stationType === StationType.DOCO) {
      // For COCO/DOCO, we're purchasing inventory, not making an immediate sale
      this.logger.log('Processing as inventory purchase for COCO/DOCO station');
    } else {
      // For DODO/Industrial/Commercial, this is a pass-through transaction
      this.logger.log('Processing as pass-through transaction for direct sale');
    }

    // Get supplier information
    const supplier = await this.getSupplierInfo(delivery.supplierId);
    if (!supplier) {
      throw new NotFoundException('Supplier information not found');
    }

    // Calculate invoice amounts
    const amounts = this.calculateSupplierInvoiceAmounts(delivery, supplier);

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber('AP', invoiceDate || new Date());

    // Calculate dates
    const actualInvoiceDate = invoiceDate || delivery.actualDeliveryTime || new Date();
    const actualDueDate = dueDate || this.calculateDueDate(actualInvoiceDate, supplier.paymentTerms);

    // Build AP invoice data
    const apInvoiceData: APInvoiceData = {
      tenantId: delivery.tenantId,
      vendorId: delivery.supplierId,
      invoiceNumber,
      invoiceDate: actualInvoiceDate,
      dueDate: actualDueDate,
      description: `Fuel delivery - ${delivery.deliveryNumber}`,
      subtotal: amounts.subtotal,
      taxAmount: amounts.totalTax,
      totalAmount: amounts.total,
      currency: delivery.currency,
      sourceDocumentType: 'DAILY_DELIVERY',
      sourceDocumentId: delivery.id,
      referenceNumber: delivery.deliveryNumber,
      withholdingTaxAmount: amounts.withholdingTax,
      vatAmount: amounts.vat,
      customsDutyAmount: delivery.customsDutyPaid,
      contractLiabilityAmount: delivery.contractLiabilityAmount,
      revenueRecognitionDate: delivery.revenueRecognitionDate || actualInvoiceDate,
      lines: this.buildSupplierInvoiceLines(delivery, amounts),
      ghanaCompliance: this.buildGhanaComplianceData(delivery),
    };

    // Create AP invoice through accounting service
    const createdInvoice = await this.createAPInvoice(apInvoiceData);

    // Generate journal entries
    const journalEntryId = await this.generateSupplierInvoiceJournalEntry(createdInvoice, delivery, userId);

    // Update delivery status
    await this.updateDeliveryWithSupplierInvoice(delivery, createdInvoice);

    // Emit event
    this.eventEmitter.emit('supplier_invoice.generated', {
      deliveryId: delivery.id,
      invoiceId: createdInvoice.id,
      invoiceNumber: createdInvoice.invoiceNumber,
      amount: createdInvoice.totalAmount,
      journalEntryId,
    });

    this.logger.log(`Supplier invoice ${invoiceNumber} generated successfully`);
    return createdInvoice.id;
  }

  /**
   * Generate customer invoice (AR) from delivery with station type logic
   */
  async generateCustomerInvoice(delivery: DailyDelivery, userId: string, invoiceDate?: Date, dueDate?: Date): Promise<string> {
    this.logger.log(`Generating customer invoice for delivery ${delivery.deliveryNumber} (Station: ${delivery.stationType})`);

    // Station type specific logic
    if (delivery.stationType === StationType.COCO || delivery.stationType === StationType.DOCO) {
      // For COCO/DOCO, this should be an internal transfer, not a customer invoice
      throw new BadRequestException('COCO/DOCO stations require inventory transfers, not customer invoices. Use internal transfer process.');
    }

    // Validate delivery state
    this.validateDeliveryForCustomerInvoicing(delivery);

    // Get customer information
    const customer = await this.getCustomerInfo(delivery.customerId);
    if (!customer) {
      throw new NotFoundException('Customer information not found');
    }

    // Calculate invoice amounts
    const amounts = this.calculateCustomerInvoiceAmounts(delivery, customer);

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber('AR', invoiceDate || new Date());

    // Calculate dates
    const actualInvoiceDate = invoiceDate || delivery.actualDeliveryTime || new Date();
    const actualDueDate = dueDate || this.calculateDueDate(actualInvoiceDate, customer.paymentTerms);

    // Build AR invoice data
    const arInvoiceData: ARInvoiceData = {
      tenantId: delivery.tenantId,
      customerId: delivery.customerId,
      invoiceNumber,
      invoiceDate: actualInvoiceDate,
      dueDate: actualDueDate,
      description: `Fuel delivery - ${delivery.deliveryNumber}`,
      subtotal: amounts.subtotal,
      taxAmount: amounts.totalTax,
      totalAmount: amounts.total,
      currency: delivery.currency,
      sourceDocumentType: 'DAILY_DELIVERY',
      sourceDocumentId: delivery.id,
      referenceNumber: delivery.deliveryNumber,
      vatAmount: amounts.vat,
      dealerMarginAmount: delivery.dealerMargin,
      uppfLevyAmount: delivery.unifiedPetroleumPriceFundLevy,
      revenueRecognitionDate: delivery.revenueRecognitionDate || actualInvoiceDate,
      lines: this.buildCustomerInvoiceLines(delivery, amounts),
      ghanaCompliance: this.buildGhanaComplianceData(delivery),
    };

    // Create AR invoice through accounting service
    const createdInvoice = await this.createARInvoice(arInvoiceData);

    // Generate journal entries
    const journalEntryId = await this.generateCustomerInvoiceJournalEntry(createdInvoice, delivery, userId);

    // Update delivery status
    await this.updateDeliveryWithCustomerInvoice(delivery, createdInvoice);

    // Emit event
    this.eventEmitter.emit('customer_invoice.generated', {
      deliveryId: delivery.id,
      invoiceId: createdInvoice.id,
      invoiceNumber: createdInvoice.invoiceNumber,
      amount: createdInvoice.totalAmount,
      journalEntryId,
    });

    this.logger.log(`Customer invoice ${invoiceNumber} generated successfully`);
    return createdInvoice.id;
  }

  /**
   * Generate automated journal entries for delivery completion
   */
  async generateDeliveryCompletionJournalEntry(delivery: DailyDelivery, userId: string): Promise<string> {
    this.logger.log(`Generating delivery completion journal entry for ${delivery.deliveryNumber}`);

    const journalEntry: JournalEntryData = {
      tenantId: delivery.tenantId,
      journalDate: delivery.actualDeliveryTime || new Date(),
      description: `Delivery completion - ${delivery.deliveryNumber}`,
      journalType: 'DELIVERY_COMPLETION',
      sourceModule: 'DAILY_DELIVERY',
      sourceDocumentType: 'DELIVERY_COMPLETION',
      sourceDocumentId: delivery.id,
      referenceNumber: delivery.deliveryNumber,
      totalDebit: 0,
      totalCredit: 0,
      lines: [],
      createdBy: userId,
      approvalRequired: false,
      ifrsCompliant: true,
      ghanaCompliant: true,
    };

    // Add IFRS revenue recognition entries
    if (delivery.revenueRecognitionAmount > 0) {
      // Dr. Contract Asset / Cr. Revenue
      journalEntry.lines.push({
        lineNumber: 1,
        accountCode: '1450', // Contract Assets
        description: 'Revenue recognition - delivery completed',
        debitAmount: delivery.revenueRecognitionAmount,
        creditAmount: 0,
        costCenter: delivery.depotId,
        dimension1: delivery.productType,
        dimension2: delivery.customerId,
      });

      journalEntry.lines.push({
        lineNumber: 2,
        accountCode: '4100', // Revenue
        description: 'Revenue recognition - delivery completed',
        debitAmount: 0,
        creditAmount: delivery.revenueRecognitionAmount,
        costCenter: delivery.depotId,
        dimension1: delivery.productType,
        dimension2: delivery.customerId,
      });

      journalEntry.totalDebit = delivery.revenueRecognitionAmount;
      journalEntry.totalCredit = delivery.revenueRecognitionAmount;
    }

    // Create journal entry
    const createdEntry = await this.createJournalEntry(journalEntry);

    this.logger.log(`Delivery completion journal entry created: ${createdEntry.id}`);
    return createdEntry.id;
  }

  /**
   * Process bulk invoice generation with approval workflow
   */
  async processBulkInvoiceGeneration(deliveryIds: string[], userId: string): Promise<InvoiceGenerationResult> {
    const request: InvoiceGenerationRequest = {
      deliveryIds,
      generationType: 'BOTH',
      approvalRequired: true,
      bulkProcessing: true,
      generatedBy: userId,
    };

    // Submit for approval if required
    const approvalWorkflowId = await this.approvalService.submitBulkInvoiceGeneration(request, userId);
    
    // Generate invoices (will be pending approval)
    const result = await this.generateInvoicesFromDeliveries(request);

    // Add approval workflow info to result
    (result as any).approvalWorkflowId = approvalWorkflowId;

    return result;
  }

  // Event handlers for automated invoice generation

  @OnEvent('delivery.status_changed')
  async handleDeliveryStatusChange(payload: any): Promise<void> {
    if (payload.newStatus === DeliveryStatus.DELIVERED) {
      const delivery = await this.deliveryRepository.findOne({ where: { id: payload.deliveryId } });
      if (delivery) {
        // Auto-generate completion journal entry
        await this.generateDeliveryCompletionJournalEntry(delivery, payload.updatedBy || 'system');

        // Check if auto-invoicing is enabled
        const autoInvoiceSettings = await this.getAutoInvoiceSettings(delivery.tenantId);
        if (autoInvoiceSettings.enabled) {
          await this.processAutoInvoiceGeneration(delivery, autoInvoiceSettings);
        }
      }
    }
  }

  // Private helper methods

  private async getValidatedDeliveries(deliveryIds: string[], forceGeneration = false): Promise<DailyDelivery[]> {
    const deliveries = await this.deliveryRepository.find({
      where: { id: deliveryIds.length === 1 ? deliveryIds[0] : undefined },
      relations: ['lineItems'],
    });

    if (deliveryIds.length > 1) {
      const foundIds = deliveries.map(d => d.id);
      const missingIds = deliveryIds.filter(id => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new NotFoundException(`Deliveries not found: ${missingIds.join(', ')}`);
      }
    }

    const validDeliveries = deliveries.filter(delivery => {
      if (!forceGeneration) {
        return delivery.status === DeliveryStatus.DELIVERED && 
               delivery.canBeInvoicedToSupplier() && 
               delivery.canBeInvoicedToCustomer();
      }
      return true;
    });

    return validDeliveries;
  }

  private async processDeliveryInvoicing(
    delivery: DailyDelivery,
    request: InvoiceGenerationRequest,
    result: InvoiceGenerationResult,
    queryRunner: any
  ): Promise<void> {
    let supplierInvoiceId: string;
    let customerInvoiceId: string;

    // Generate supplier invoice
    if (request.generationType === 'SUPPLIER' || request.generationType === 'BOTH') {
      if (!delivery.supplierInvoiceId) {
        supplierInvoiceId = await this.generateSupplierInvoice(
          delivery, 
          request.generatedBy, 
          request.invoiceDate, 
          request.dueDate
        );
        result.invoiceIds.push(supplierInvoiceId);
        result.invoicesGenerated++;
      }
    }

    // Generate customer invoice
    if (request.generationType === 'CUSTOMER' || request.generationType === 'BOTH') {
      if (!delivery.customerInvoiceId) {
        customerInvoiceId = await this.generateCustomerInvoice(
          delivery, 
          request.generatedBy, 
          request.invoiceDate, 
          request.dueDate
        );
        result.invoiceIds.push(customerInvoiceId);
        result.invoicesGenerated++;
      }
    }

    // Update total amount
    result.totalAmount += delivery.totalValue;

    // Generate completion journal entry
    const journalEntryId = await this.generateDeliveryCompletionJournalEntry(delivery, request.generatedBy);
    result.journalEntryIds.push(journalEntryId);
  }

  private validateDeliveryForSupplierInvoicing(delivery: DailyDelivery): void {
    if (!delivery.canBeInvoicedToSupplier()) {
      throw new BadRequestException('Delivery cannot be invoiced to supplier');
    }
    if (delivery.supplierInvoiceId) {
      throw new BadRequestException('Supplier invoice already exists for this delivery');
    }
  }

  private validateDeliveryForCustomerInvoicing(delivery: DailyDelivery): void {
    if (!delivery.canBeInvoicedToCustomer()) {
      throw new BadRequestException('Delivery cannot be invoiced to customer');
    }
    if (delivery.customerInvoiceId) {
      throw new BadRequestException('Customer invoice already exists for this delivery');
    }
  }

  private calculateSupplierInvoiceAmounts(delivery: DailyDelivery, supplier: any) {
    const priceBuildupComponents = delivery.getPriceBuildupComponents();
    let subtotal = delivery.totalValue;
    
    // For supplier invoices, use base cost without margins
    if (priceBuildupComponents && priceBuildupComponents.basePrice) {
      subtotal = priceBuildupComponents.basePrice * delivery.quantityLitres;
    }

    const vat = new Decimal(subtotal).mul(this.GHANA_VAT_RATE).toNumber();
    const withholdingTax = supplier.withholdingTaxExempt ? 0 : 
      new Decimal(subtotal).mul(this.WITHHOLDING_TAX_RATE).toNumber();
    
    // Calculate taxes from price build-up if available
    let governmentTaxes = delivery.getTotalTaxes();
    if (priceBuildupComponents && priceBuildupComponents.taxes) {
      const taxes = priceBuildupComponents.taxes;
      const quantity = delivery.quantityLitres;
      governmentTaxes = quantity * (
        (taxes.petroleumTax || 0) +
        (taxes.energyFundLevy || 0) +
        (taxes.roadFundLevy || 0) +
        (taxes.priceStabilizationLevy || 0) +
        (taxes.uppfLevy || 0)
      );
    }

    const totalTax = governmentTaxes + vat;
    const total = subtotal + totalTax;

    return {
      subtotal,
      vat,
      withholdingTax,
      totalTax: totalTax,
      governmentTaxes,
      total,
      priceBuildupComponents
    };
  }

  private calculateCustomerInvoiceAmounts(delivery: DailyDelivery, customer: any) {
    const priceBuildupComponents = delivery.getPriceBuildupComponents();
    let subtotal = delivery.totalValue + delivery.getTotalMargins();
    
    // For customer invoices, use selling price with all margins
    if (priceBuildupComponents) {
      const basePrice = priceBuildupComponents.basePrice || 0;
      const dealerMargin = priceBuildupComponents.dealerMargin || 0;
      const marketingMargin = priceBuildupComponents.marketingMargin || 0;
      
      // Calculate selling price based on station type
      let sellingPricePerLitre = basePrice;
      
      if (delivery.stationType === StationType.DODO) {
        // DODO gets dealer margin
        sellingPricePerLitre += dealerMargin;
      }
      
      if (delivery.stationType === StationType.INDUSTRIAL || delivery.stationType === StationType.COMMERCIAL) {
        // Industrial/Commercial may get different pricing
        sellingPricePerLitre += marketingMargin;
      }
      
      subtotal = sellingPricePerLitre * delivery.quantityLitres;
    }

    const vat = new Decimal(subtotal).mul(this.GHANA_VAT_RATE).toNumber();
    
    // Calculate government taxes from price build-up if available
    let governmentTaxes = delivery.getTotalTaxes();
    if (priceBuildupComponents && priceBuildupComponents.taxes) {
      const taxes = priceBuildupComponents.taxes;
      const quantity = delivery.quantityLitres;
      governmentTaxes = quantity * (
        (taxes.petroleumTax || 0) +
        (taxes.energyFundLevy || 0) +
        (taxes.roadFundLevy || 0) +
        (taxes.priceStabilizationLevy || 0) +
        (taxes.uppfLevy || 0)
      );
    }
    
    const totalTax = governmentTaxes + vat;
    const total = subtotal + totalTax;

    return {
      subtotal,
      vat,
      totalTax,
      governmentTaxes,
      total,
      priceBuildupComponents,
      sellingPricePerLitre: subtotal / delivery.quantityLitres
    };
  }

  private buildSupplierInvoiceLines(delivery: DailyDelivery, amounts: any): APInvoiceLineData[] {
    const lines: APInvoiceLineData[] = [];

    // Main product line
    lines.push({
      lineNumber: 1,
      description: `${delivery.productType} - ${delivery.quantityLitres}L`,
      quantity: delivery.quantityLitres,
      unitPrice: delivery.unitPrice,
      lineTotal: delivery.totalValue,
      accountCode: this.getInventoryAccountCode(delivery.productType),
      costCenter: delivery.depotId,
      productType: delivery.productType,
      supplierId: delivery.supplierId,
    });

    // Add tax lines
    this.addTaxLines(lines, delivery, 'SUPPLIER');

    return lines;
  }

  private buildCustomerInvoiceLines(delivery: DailyDelivery, amounts: any): ARInvoiceLineData[] {
    const lines: ARInvoiceLineData[] = [];

    // Main product line
    lines.push({
      lineNumber: 1,
      description: `${delivery.productType} - ${delivery.quantityLitres}L`,
      quantity: delivery.quantityLitres,
      unitPrice: delivery.unitPrice + (delivery.getTotalMargins() / delivery.quantityLitres),
      lineTotal: delivery.totalValue + delivery.getTotalMargins(),
      accountCode: this.getRevenueAccountCode(delivery.productType),
      productType: delivery.productType,
      customerId: delivery.customerId,
      dealerMargin: delivery.dealerMargin,
      uppfLevy: delivery.unifiedPetroleumPriceFundLevy,
    });

    return lines;
  }

  private addTaxLines(lines: any[], delivery: DailyDelivery, invoiceType: 'SUPPLIER' | 'CUSTOMER'): void {
    let lineNumber = lines.length + 1;

    if (delivery.petroleumTaxAmount > 0) {
      lines.push({
        lineNumber: lineNumber++,
        description: 'Petroleum Tax',
        quantity: 1,
        unitPrice: delivery.petroleumTaxAmount,
        lineTotal: delivery.petroleumTaxAmount,
        accountCode: '2220',
        taxCode: 'PETROLEUM_TAX',
        taxAmount: delivery.petroleumTaxAmount,
      });
    }

    // Add other tax lines as needed
    if (delivery.energyFundLevy > 0) {
      lines.push({
        lineNumber: lineNumber++,
        description: 'Energy Fund Levy',
        quantity: 1,
        unitPrice: delivery.energyFundLevy,
        lineTotal: delivery.energyFundLevy,
        accountCode: '2230',
        taxCode: 'ENERGY_FUND_LEVY',
        taxAmount: delivery.energyFundLevy,
      });
    }

    // Continue for other taxes...
  }

  private buildGhanaComplianceData(delivery: DailyDelivery): GhanaComplianceData {
    return {
      npaPermitNumber: delivery.npaPermitNumber,
      customsEntryNumber: delivery.customsEntryNumber,
      customsDutyPaid: delivery.customsDutyPaid,
      petroleumTaxAmount: delivery.petroleumTaxAmount,
      energyFundLevy: delivery.energyFundLevy,
      roadFundLevy: delivery.roadFundLevy,
      priceStabilizationLevy: delivery.priceStabilizationLevy,
      primaryDistributionMargin: delivery.primaryDistributionMargin,
      marketingMargin: delivery.marketingMargin,
      dealerMargin: delivery.dealerMargin,
      unifiedPetroleumPriceFundLevy: delivery.unifiedPetroleumPriceFundLevy,
      vatRate: this.GHANA_VAT_RATE,
      withholdingTaxRate: this.WITHHOLDING_TAX_RATE,
    };
  }

  private getInventoryAccountCode(productType: string): string {
    const codes = {
      'PMS': '1310',
      'AGO': '1320',
      'IFO': '1330',
      'LPG': '1340',
      'KEROSENE': '1350',
      'LUBRICANTS': '1360',
    };
    return codes[productType] || '1300';
  }

  private getRevenueAccountCode(productType: string): string {
    const codes = {
      'PMS': '4110',
      'AGO': '4120',
      'IFO': '4130',
      'LPG': '4140',
      'KEROSENE': '4150',
      'LUBRICANTS': '4160',
    };
    return codes[productType] || '4100';
  }

  private async generateInvoiceNumber(type: 'AP' | 'AR', date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `${type}-${year}${month}-${timestamp}`;
  }

  private calculateDueDate(invoiceDate: Date, paymentTerms: string): Date {
    const dueDate = new Date(invoiceDate);
    const termMap = {
      'NET_7': 7,
      'NET_15': 15,
      'NET_30': 30,
      'NET_45': 45,
      'NET_60': 60,
      'NET_90': 90,
    };
    const days = termMap[paymentTerms] || 30;
    return addDays(dueDate, days);
  }

  // External service integration methods
  private async getSupplierInfo(supplierId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/vendors/${supplierId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get supplier info: ${supplierId}`, error);
      return null;
    }
  }

  private async getCustomerInfo(customerId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/customers/${customerId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get customer info: ${customerId}`, error);
      return null;
    }
  }

  private async createAPInvoice(invoiceData: APInvoiceData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/ap-invoices', invoiceData)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create AP invoice', error);
      throw new BadRequestException('Failed to create supplier invoice');
    }
  }

  private async createARInvoice(invoiceData: ARInvoiceData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/ar-invoices', invoiceData)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create AR invoice', error);
      throw new BadRequestException('Failed to create customer invoice');
    }
  }

  private async createJournalEntry(entryData: JournalEntryData): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/journal-entries', entryData)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create journal entry', error);
      throw new BadRequestException('Failed to create journal entry');
    }
  }

  private async generateSupplierInvoiceJournalEntry(invoice: any, delivery: DailyDelivery, userId: string): Promise<string> {
    // Implementation for supplier invoice journal entry
    return 'journal-entry-id';
  }

  private async generateCustomerInvoiceJournalEntry(invoice: any, delivery: DailyDelivery, userId: string): Promise<string> {
    // Implementation for customer invoice journal entry
    return 'journal-entry-id';
  }

  private async updateDeliveryWithSupplierInvoice(delivery: DailyDelivery, invoice: any): Promise<void> {
    await this.deliveryRepository.update(delivery.id, {
      supplierInvoiceId: invoice.id,
      supplierInvoiceNumber: invoice.invoiceNumber,
      status: DeliveryStatus.INVOICED_SUPPLIER,
    });
  }

  private async updateDeliveryWithCustomerInvoice(delivery: DailyDelivery, invoice: any): Promise<void> {
    await this.deliveryRepository.update(delivery.id, {
      customerInvoiceId: invoice.id,
      customerInvoiceNumber: invoice.invoiceNumber,
      status: delivery.supplierInvoiceId ? DeliveryStatus.COMPLETED : DeliveryStatus.INVOICED_CUSTOMER,
    });
  }

  private async getAutoInvoiceSettings(tenantId: string): Promise<any> {
    // Get auto-invoice configuration
    return { enabled: false };
  }

  private async processAutoInvoiceGeneration(delivery: DailyDelivery, settings: any): Promise<void> {
    // Process automated invoice generation based on settings
  }
}