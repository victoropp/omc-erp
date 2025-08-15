import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Decimal } from 'decimal.js';
import { addDays } from 'date-fns';

import { DailyDelivery, DeliveryStatus } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
import { GhanaChartAccountsMappingService } from '../integration/ghana-chart-accounts-mapping.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';

interface APInvoice {
  id?: string;
  tenantId: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountDue: number;
  sourceDocumentType: string;
  sourceDocumentId: string;
  referenceNumber: string;
  withholdingTaxAmount: number;
  vatAmount: number;
  customsDutyAmount: number;
  contractLiabilityAmount: number;
  revenueRecognitionDate: Date;
  lineItems: APInvoiceLineItem[];
  status: string;
  createdBy: string;
}

interface APInvoiceLineItem {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  accountCode: string;
  costCenter?: string;
  dimension1?: string;
  dimension2?: string;
}

interface JournalEntryData {
  journalDate: Date;
  description: string;
  journalType: string;
  sourceModule: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  lines: JournalLineData[];
  createdBy: string;
}

interface JournalLineData {
  accountCode: string;
  description: string;
  debitAmount?: number;
  creditAmount?: number;
  costCenter?: string;
  dimension1?: string;
  dimension2?: string;
}

@Injectable()
export class SupplierInvoiceService {
  private readonly logger = new Logger(SupplierInvoiceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly validationService: DeliveryValidationService,
  ) {}

  async generateSupplierInvoice(
    delivery: DailyDelivery, 
    generateDto: GenerateSupplierInvoiceDto
  ): Promise<APInvoice> {
    try {
      // Validate delivery can be invoiced
      if (!generateDto.forceGeneration) {
        const validation = await this.validationService.validateForInvoicing(delivery);
        if (!validation.isValid) {
          throw new BadRequestException(`Cannot generate supplier invoice: ${validation.errors.join(', ')}`);
        }
      }

      // Check if already invoiced
      if (delivery.supplierInvoiceId) {
        throw new BadRequestException('Supplier invoice already generated for this delivery');
      }

      // Get vendor information from external service
      const vendor = await this.getVendorInfo(delivery.supplierId);
      if (!vendor) {
        throw new BadRequestException('Vendor information not found');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber('AP', delivery.deliveryDate);

      // Calculate invoice dates
      const invoiceDate = generateDto.invoiceDate ? new Date(generateDto.invoiceDate) : (delivery.actualDeliveryTime || new Date());
      const dueDate = generateDto.dueDate ? new Date(generateDto.dueDate) : this.calculateDueDate(invoiceDate, vendor.paymentTerms);

      // Calculate amounts
      const subtotal = delivery.totalValue;
      const taxAmount = delivery.getTotalTaxes();
      const withholdingTaxAmount = this.calculateWithholdingTax(delivery, vendor);
      const vatAmount = this.calculateVAT(delivery, vendor);
      const totalAmount = subtotal + taxAmount;
      const amountDue = totalAmount - withholdingTaxAmount;

      // Create invoice object
      const invoice: APInvoice = {
        tenantId: delivery.tenantId,
        vendorId: delivery.supplierId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        currency: delivery.currency,
        subtotal,
        taxAmount,
        totalAmount,
        amountDue,
        sourceDocumentType: 'DAILY_DELIVERY',
        sourceDocumentId: delivery.id,
        referenceNumber: delivery.deliveryNumber,
        withholdingTaxAmount,
        vatAmount,
        customsDutyAmount: delivery.customsDutyPaid,
        contractLiabilityAmount: delivery.contractLiabilityAmount,
        revenueRecognitionDate: delivery.revenueRecognitionDate || invoiceDate,
        lineItems: this.createSupplierInvoiceLineItems(delivery),
        status: 'DRAFT',
        createdBy: generateDto.generatedBy,
      };

      // Send to accounting service
      const createdInvoice = await this.createAPInvoice(invoice);

      // Generate journal entries
      await this.generateSupplierInvoiceJournalEntries(createdInvoice, delivery, generateDto.generatedBy);

      // Update delivery with invoice information
      await this.updateDeliveryWithInvoiceInfo(delivery, createdInvoice);

      // Emit event for integration
      this.eventEmitter.emit('supplier_invoice.generated', {
        deliveryId: delivery.id,
        invoiceId: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        supplierId: delivery.supplierId,
        amount: createdInvoice.totalAmount,
        tenantId: delivery.tenantId,
      });

      this.logger.log(`Supplier invoice ${invoiceNumber} generated for delivery ${delivery.deliveryNumber}`);
      return createdInvoice;

    } catch (error) {
      this.logger.error('Failed to generate supplier invoice:', error);
      throw error;
    }
  }

  private async getVendorInfo(vendorId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/vendors/${vendorId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get vendor info for ${vendorId}:`, error);
      return null;
    }
  }

  private async generateInvoiceNumber(type: string, date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `${type}-${year}${month}-${timestamp}`;
  }

  private calculateDueDate(invoiceDate: Date, paymentTerms: string): Date {
    const dueDate = new Date(invoiceDate);
    
    switch (paymentTerms) {
      case 'NET_7':
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'NET_15':
        dueDate.setDate(dueDate.getDate() + 15);
        break;
      case 'NET_30':
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case 'NET_45':
        dueDate.setDate(dueDate.getDate() + 45);
        break;
      case 'NET_60':
        dueDate.setDate(dueDate.getDate() + 60);
        break;
      case 'NET_90':
        dueDate.setDate(dueDate.getDate() + 90);
        break;
      case 'COD':
        // Cash on delivery - same day
        break;
      default:
        dueDate.setDate(dueDate.getDate() + 30); // Default to 30 days
    }
    
    return dueDate;
  }

  private calculateWithholdingTax(delivery: DailyDelivery, vendor: any): number {
    if (vendor.withholdingTaxExempt) {
      return 0;
    }
    
    const withholdingRate = vendor.withholdingTaxRate || 0.05; // Default 5% withholding tax in Ghana
    return delivery.totalValue * withholdingRate;
  }

  private calculateVAT(delivery: DailyDelivery, vendor: any): number {
    const vatRate = 0.125; // 12.5% VAT in Ghana
    return delivery.totalValue * vatRate;
  }

  private createSupplierInvoiceLineItems(delivery: DailyDelivery): APInvoiceLineItem[] {
    const lineItems: APInvoiceLineItem[] = [];
    
    // Main delivery line
    lineItems.push({
      lineNumber: 1,
      description: `${delivery.productType} - ${delivery.quantityLitres}L delivered from ${delivery.loadingTerminal || 'Depot'} to ${delivery.customerName}`,
      quantity: delivery.quantityLitres,
      unitPrice: delivery.unitPrice,
      lineTotal: delivery.totalValue,
      accountCode: this.getInventoryAccountCode(delivery.productType),
      costCenter: delivery.depotId,
      dimension1: delivery.productType,
      dimension2: delivery.supplierId,
    });

    // Add tax lines if applicable
    if (delivery.petroleumTaxAmount > 0) {
      lineItems.push({
        lineNumber: 2,
        description: 'Petroleum Tax',
        quantity: 1,
        unitPrice: delivery.petroleumTaxAmount,
        lineTotal: delivery.petroleumTaxAmount,
        accountCode: '2220', // Petroleum Tax Payable
        costCenter: delivery.depotId,
      });
    }

    if (delivery.energyFundLevy > 0) {
      lineItems.push({
        lineNumber: lineItems.length + 1,
        description: 'Energy Fund Levy',
        quantity: 1,
        unitPrice: delivery.energyFundLevy,
        lineTotal: delivery.energyFundLevy,
        accountCode: '2230', // Energy Fund Levy Payable
        costCenter: delivery.depotId,
      });
    }

    if (delivery.roadFundLevy > 0) {
      lineItems.push({
        lineNumber: lineItems.length + 1,
        description: 'Road Fund Levy',
        quantity: 1,
        unitPrice: delivery.roadFundLevy,
        lineTotal: delivery.roadFundLevy,
        accountCode: '2240', // Road Fund Levy Payable
        costCenter: delivery.depotId,
      });
    }

    if (delivery.unifiedPetroleumPriceFundLevy > 0) {
      lineItems.push({
        lineNumber: lineItems.length + 1,
        description: 'UPPF Levy',
        quantity: 1,
        unitPrice: delivery.unifiedPetroleumPriceFundLevy,
        lineTotal: delivery.unifiedPetroleumPriceFundLevy,
        accountCode: '2250', // UPPF Levy Payable
        costCenter: delivery.depotId,
      });
    }

    return lineItems;
  }

  private getInventoryAccountCode(productType: string): string {
    const accountCodes = {
      'PMS': '1310', // Petrol Inventory
      'AGO': '1320', // Diesel Inventory
      'IFO': '1330', // Industrial Fuel Oil Inventory
      'LPG': '1340', // LPG Inventory
      'KEROSENE': '1350', // Kerosene Inventory
      'LUBRICANTS': '1360', // Lubricants Inventory
    };
    return accountCodes[productType] || '1300'; // General Fuel Inventory
  }

  private async createAPInvoice(invoice: APInvoice): Promise<APInvoice> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/ap-invoices', invoice)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create AP invoice in accounting service:', error);
      throw new BadRequestException('Failed to create supplier invoice');
    }
  }

  private async generateSupplierInvoiceJournalEntries(
    invoice: APInvoice, 
    delivery: DailyDelivery, 
    userId: string
  ): Promise<void> {
    const journalEntry: JournalEntryData = {
      journalDate: invoice.invoiceDate,
      description: `Supplier invoice for delivery ${delivery.deliveryNumber}`,
      journalType: 'PURCHASE',
      sourceModule: 'DAILY_DELIVERY',
      sourceDocumentType: 'SUPPLIER_INVOICE',
      sourceDocumentId: invoice.id,
      createdBy: userId,
      lines: [],
    };

    // Debit: Inventory
    journalEntry.lines.push({
      accountCode: this.getInventoryAccountCode(delivery.productType),
      description: `Inventory purchase - ${delivery.productType}`,
      debitAmount: delivery.totalValue,
      creditAmount: 0,
      costCenter: delivery.depotId,
      dimension1: delivery.productType,
      dimension2: delivery.supplierId,
    });

    // Debit: Tax amounts
    if (delivery.petroleumTaxAmount > 0) {
      journalEntry.lines.push({
        accountCode: '2220',
        description: 'Petroleum Tax',
        debitAmount: delivery.petroleumTaxAmount,
        creditAmount: 0,
        costCenter: delivery.depotId,
      });
    }

    if (delivery.energyFundLevy > 0) {
      journalEntry.lines.push({
        accountCode: '2230',
        description: 'Energy Fund Levy',
        debitAmount: delivery.energyFundLevy,
        creditAmount: 0,
        costCenter: delivery.depotId,
      });
    }

    if (delivery.roadFundLevy > 0) {
      journalEntry.lines.push({
        accountCode: '2240',
        description: 'Road Fund Levy',
        debitAmount: delivery.roadFundLevy,
        creditAmount: 0,
        costCenter: delivery.depotId,
      });
    }

    if (delivery.unifiedPetroleumPriceFundLevy > 0) {
      journalEntry.lines.push({
        accountCode: '2250',
        description: 'UPPF Levy',
        debitAmount: delivery.unifiedPetroleumPriceFundLevy,
        creditAmount: 0,
        costCenter: delivery.depotId,
      });
    }

    // Credit: Accounts Payable
    journalEntry.lines.push({
      accountCode: '2100', // Accounts Payable
      description: `Supplier payable - ${delivery.transporterName}`,
      debitAmount: 0,
      creditAmount: invoice.totalAmount,
      costCenter: delivery.depotId,
      dimension1: delivery.supplierId,
    });

    // Credit: Withholding Tax if applicable
    if (invoice.withholdingTaxAmount > 0) {
      journalEntry.lines.push({
        accountCode: '2180', // Withholding Tax Payable
        description: 'Withholding tax on supplier invoice',
        debitAmount: 0,
        creditAmount: invoice.withholdingTaxAmount,
        costCenter: delivery.depotId,
      });
    }

    try {
      await firstValueFrom(
        this.httpService.post('/accounting/journal-entries', journalEntry)
      );
      this.logger.log(`Journal entry created for supplier invoice ${invoice.invoiceNumber}`);
    } catch (error) {
      this.logger.error('Failed to create journal entry:', error);
      // Don't throw error as invoice is already created
    }
  }

  private async updateDeliveryWithInvoiceInfo(delivery: DailyDelivery, invoice: APInvoice): Promise<void> {
    try {
      const updateData = {
        supplierInvoiceId: invoice.id,
        supplierInvoiceNumber: invoice.invoiceNumber,
        status: 'INVOICED_SUPPLIER',
      };

      await firstValueFrom(
        this.httpService.patch(`/daily-deliveries/${delivery.id}`, updateData)
      );
    } catch (error) {
      this.logger.error('Failed to update delivery with invoice info:', error);
      // Don't throw error as invoice is already created
    }
  }

  async getSupplierInvoice(invoiceId: string): Promise<APInvoice> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/ap-invoices/${invoiceId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get supplier invoice ${invoiceId}:`, error);
      throw new BadRequestException('Supplier invoice not found');
    }
  }

  async cancelSupplierInvoice(invoiceId: string, reason: string, userId: string): Promise<void> {
    try {
      const cancelData = {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledBy: userId,
        cancelledAt: new Date(),
      };

      await firstValueFrom(
        this.httpService.patch(`/accounting/ap-invoices/${invoiceId}/cancel`, cancelData)
      );

      this.logger.log(`Supplier invoice ${invoiceId} cancelled: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to cancel supplier invoice ${invoiceId}:`, error);
      throw new BadRequestException('Failed to cancel supplier invoice');
    }
  }
}