import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Decimal } from 'decimal.js';
import { addDays, format } from 'date-fns';

import { DailyDelivery, DeliveryStatus, ProductGrade } from '../daily-delivery/entities/daily-delivery.entity';
import { DeliveryLineItem } from '../daily-delivery/entities/delivery-line-item.entity';
import { DeliveryValidationService } from '../daily-delivery/services/delivery-validation.service';
import { GhanaChartAccountsMappingService, TaxAccountMapping } from '../integration/ghana-chart-accounts-mapping.service';
import { ApprovalWorkflowService } from '../approval-workflow/approval-workflow.service';
import { GhanaComplianceService } from '../compliance/ghana-compliance.service';

export interface SupplierInvoiceGenerationRequest {
  deliveryId: string;
  invoiceDate?: Date;
  dueDate?: Date;
  forceGeneration?: boolean;
  approvalRequired?: boolean;
  generatedBy: string;
  notes?: string;
}

export interface BulkSupplierInvoiceRequest {
  deliveryIds: string[];
  invoiceDate?: Date;
  dueDate?: Date;
  groupBy?: 'SUPPLIER' | 'DATE' | 'PRODUCT_TYPE';
  forceGeneration?: boolean;
  approvalRequired?: boolean;
  generatedBy: string;
  notes?: string;
}

export interface SupplierInvoiceResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  totalAmount: number;
  errors: string[];
  validationWarnings: string[];
  complianceStatus: GhanaComplianceStatus;
  journalEntryId?: string;
  approvalWorkflowId?: string;
}

export interface GhanaComplianceStatus {
  isCompliant: boolean;
  npaPermitValid: boolean;
  customsEntryValid: boolean;
  taxCalculationsValid: boolean;
  missingDocuments: string[];
  complianceScore: number; // 0-100
}

export interface EnhancedAPInvoice {
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
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
  approvalRequired: boolean;
  approvalWorkflowId?: string;
  lineItems: EnhancedAPInvoiceLineItem[];
  taxBreakdown: TaxBreakdownItem[];
  ghanaCompliance: GhanaComplianceData;
  auditTrail: AuditTrailEntry[];
  createdBy: string;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface EnhancedAPInvoiceLineItem {
  lineNumber: number;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
  accountCode: string;
  accountName: string;
  costCenter?: string;
  dimension1?: string; // Product Type
  dimension2?: string; // Supplier ID
  dimension3?: string; // Location/Depot
  taxCode?: string;
  taxAmount?: number;
  withholdingTaxApplicable: boolean;
  vatApplicable: boolean;
  productType?: ProductGrade;
  complianceData?: LineItemComplianceData;
}

export interface TaxBreakdownItem {
  taxType: 'PETROLEUM_TAX' | 'ENERGY_FUND_LEVY' | 'ROAD_FUND_LEVY' | 'PRICE_STABILIZATION_LEVY' | 'UPPF_LEVY' | 'VAT' | 'WITHHOLDING_TAX' | 'CUSTOMS_DUTY';
  taxName: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  accountCode: string;
  isGhanaSpecific: boolean;
  complianceRequired: boolean;
}

export interface GhanaComplianceData {
  npaPermitNumber?: string;
  npaPermitValid: boolean;
  customsEntryNumber?: string;
  customsEntryValid: boolean;
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
  totalComplianceTaxes: number;
  complianceDocuments: ComplianceDocument[];
}

export interface LineItemComplianceData {
  productClassification: string;
  harmonizedCode?: string;
  environmentalImpactCode?: string;
  qualityStandard?: string;
  certificationRequired: boolean;
}

export interface ComplianceDocument {
  documentType: string;
  documentNumber?: string;
  isValid: boolean;
  expiryDate?: Date;
  url?: string;
}

export interface AuditTrailEntry {
  action: string;
  performedBy: string;
  performedAt: Date;
  details: string;
  ipAddress?: string;
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
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: string;
  dimension1?: string;
  dimension2?: string;
  dimension3?: string;
  analyticsCodes?: string[];
  taxCode?: string;
  complianceCode?: string;
}

@Injectable()
export class EnhancedSupplierInvoiceService {
  private readonly logger = new Logger(EnhancedSupplierInvoiceService.name);
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
    private readonly validationService: DeliveryValidationService,
    private readonly accountMappingService: GhanaChartAccountsMappingService,
    private readonly approvalService: ApprovalWorkflowService,
    private readonly complianceService: GhanaComplianceService,
  ) {}

  /**
   * Generate comprehensive supplier invoice from delivery
   */
  async generateSupplierInvoice(request: SupplierInvoiceGenerationRequest): Promise<SupplierInvoiceResult> {
    const result: SupplierInvoiceResult = {
      success: false,
      totalAmount: 0,
      errors: [],
      validationWarnings: [],
      complianceStatus: {
        isCompliant: false,
        npaPermitValid: false,
        customsEntryValid: false,
        taxCalculationsValid: false,
        missingDocuments: [],
        complianceScore: 0,
      },
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Get and validate delivery
      const delivery = await this.getValidatedDelivery(request.deliveryId, request.forceGeneration);
      
      // Perform comprehensive validation
      await this.performComprehensiveValidation(delivery, result, request.forceGeneration);
      
      if (result.errors.length > 0 && !request.forceGeneration) {
        return result;
      }

      // Start transaction
      await queryRunner.startTransaction();

      // Get supplier information with enhanced validation
      const supplier = await this.getEnhancedSupplierInfo(delivery.supplierId);
      if (!supplier) {
        throw new NotFoundException('Supplier information not found or inactive');
      }

      // Perform Ghana compliance validation
      const complianceValidation = await this.validateGhanaCompliance(delivery, supplier);
      result.complianceStatus = complianceValidation;

      if (!complianceValidation.isCompliant && !request.forceGeneration) {
        result.errors.push('Ghana compliance validation failed');
        return result;
      }

      // Calculate comprehensive amounts with tax breakdown
      const amountCalculation = await this.calculateComprehensiveAmounts(delivery, supplier);

      // Generate invoice number with proper sequencing
      const invoiceNumber = await this.generateSequentialInvoiceNumber('AP', request.invoiceDate || new Date(), delivery.tenantId);

      // Calculate dates with business rules
      const invoiceDate = request.invoiceDate || delivery.actualDeliveryTime || new Date();
      const dueDate = request.dueDate || this.calculateBusinessDueDate(invoiceDate, supplier.paymentTerms);

      // Build enhanced AP invoice
      const enhancedInvoice = await this.buildEnhancedAPInvoice(
        delivery,
        supplier,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amountCalculation,
        complianceValidation,
        request
      );

      // Submit for approval if required
      if (request.approvalRequired || amountCalculation.total > supplier.autoApprovalLimit) {
        const approvalWorkflowId = await this.submitForApproval(enhancedInvoice, request.generatedBy);
        enhancedInvoice.approvalWorkflowId = approvalWorkflowId;
        enhancedInvoice.status = 'PENDING_APPROVAL';
        result.approvalWorkflowId = approvalWorkflowId;
      } else {
        enhancedInvoice.status = 'APPROVED';
        enhancedInvoice.approvedBy = request.generatedBy;
        enhancedInvoice.approvalDate = new Date();
      }

      // Create AP invoice through accounting service
      const createdInvoice = await this.createEnhancedAPInvoice(enhancedInvoice);

      // Generate comprehensive journal entries using enhanced delivery journal entry
      const journalEntryId = await this.generateEnhancedDeliveryJournalEntry(
        createdInvoice,
        delivery,
        amountCalculation,
        request.generatedBy
      );

      // Update delivery with invoice information
      await this.updateDeliveryWithInvoiceInfo(queryRunner, delivery, createdInvoice);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Prepare successful result
      result.success = true;
      result.invoiceId = createdInvoice.id;
      result.invoiceNumber = createdInvoice.invoiceNumber;
      result.totalAmount = createdInvoice.totalAmount;
      result.journalEntryId = journalEntryId;

      // Emit comprehensive event
      this.eventEmitter.emit('supplier_invoice.generated', {
        deliveryId: delivery.id,
        invoiceId: createdInvoice.id,
        invoiceNumber: createdInvoice.invoiceNumber,
        supplierId: delivery.supplierId,
        amount: createdInvoice.totalAmount,
        complianceStatus: complianceValidation,
        journalEntryId,
        approvalRequired: request.approvalRequired,
        approvalWorkflowId: result.approvalWorkflowId,
      });

      this.logger.log(`Enhanced supplier invoice ${invoiceNumber} generated successfully for delivery ${delivery.deliveryNumber}`);
      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate supplier invoice:', error);
      result.errors.push(error.message);
      return result;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate bulk supplier invoices
   */
  async generateBulkSupplierInvoices(request: BulkSupplierInvoiceRequest): Promise<{
    success: boolean;
    results: SupplierInvoiceResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      totalAmount: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    this.logger.log(`Starting bulk supplier invoice generation for ${request.deliveryIds.length} deliveries`);

    const results: SupplierInvoiceResult[] = [];
    let successful = 0;
    let failed = 0;
    let totalAmount = 0;

    // Group deliveries if requested
    const groupedDeliveries = await this.groupDeliveriesForBulkProcessing(request.deliveryIds, request.groupBy);

    for (const group of groupedDeliveries) {
      for (const deliveryId of group.deliveryIds) {
        try {
          const singleRequest: SupplierInvoiceGenerationRequest = {
            deliveryId,
            invoiceDate: request.invoiceDate,
            dueDate: request.dueDate,
            forceGeneration: request.forceGeneration,
            approvalRequired: request.approvalRequired,
            generatedBy: request.generatedBy,
            notes: request.notes,
          };

          const result = await this.generateSupplierInvoice(singleRequest);
          results.push(result);

          if (result.success) {
            successful++;
            totalAmount += result.totalAmount;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          results.push({
            success: false,
            totalAmount: 0,
            errors: [error.message],
            validationWarnings: [],
            complianceStatus: {
              isCompliant: false,
              npaPermitValid: false,
              customsEntryValid: false,
              taxCalculationsValid: false,
              missingDocuments: [],
              complianceScore: 0,
            },
          });
        }
      }
    }

    const processingTime = Date.now() - startTime;

    // Emit bulk completion event
    this.eventEmitter.emit('bulk_supplier_invoices.generated', {
      request,
      results,
      summary: {
        total: request.deliveryIds.length,
        successful,
        failed,
        totalAmount,
        processingTime,
      },
    });

    return {
      success: successful > 0,
      results,
      summary: {
        total: request.deliveryIds.length,
        successful,
        failed,
        totalAmount,
        processingTime,
      },
    };
  }

  /**
   * Cancel supplier invoice with proper reversals
   */
  async cancelSupplierInvoice(invoiceId: string, reason: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get invoice details
      const invoice = await this.getSupplierInvoice(invoiceId);
      if (!invoice) {
        throw new NotFoundException('Supplier invoice not found');
      }

      if (invoice.status === 'PAID') {
        throw new BadRequestException('Cannot cancel paid invoice');
      }

      // Cancel the invoice
      await this.updateInvoiceStatus(invoiceId, 'CANCELLED', reason, userId);

      // Create reversal journal entry
      await this.createReversalJournalEntry(invoice, reason, userId);

      // Update delivery status
      const delivery = await this.deliveryRepository.findOne({ 
        where: { supplierInvoiceId: invoiceId } 
      });
      
      if (delivery) {
        await queryRunner.manager.update(DailyDelivery, delivery.id, {
          supplierInvoiceId: null,
          supplierInvoiceNumber: null,
          status: DeliveryStatus.DELIVERED,
        });
      }

      await queryRunner.commitTransaction();

      // Emit cancellation event
      this.eventEmitter.emit('supplier_invoice.cancelled', {
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        reason,
        cancelledBy: userId,
        deliveryId: delivery?.id,
      });

      this.logger.log(`Supplier invoice ${invoice.invoiceNumber} cancelled: ${reason}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Private methods for comprehensive invoice generation

  private async getValidatedDelivery(deliveryId: string, forceGeneration: boolean): Promise<DailyDelivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['lineItems', 'documents'],
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (!forceGeneration) {
      if (!delivery.canBeInvoicedToSupplier()) {
        throw new BadRequestException('Delivery cannot be invoiced to supplier');
      }
      if (delivery.supplierInvoiceId) {
        throw new BadRequestException('Supplier invoice already exists for this delivery');
      }
    }

    return delivery;
  }

  private async performComprehensiveValidation(
    delivery: DailyDelivery,
    result: SupplierInvoiceResult,
    forceGeneration: boolean
  ): Promise<void> {
    // Basic delivery validation
    const basicValidation = await this.validationService.validateForInvoicing(delivery);
    if (!basicValidation.isValid && !forceGeneration) {
      result.errors.push(...basicValidation.errors);
    } else if (!basicValidation.isValid) {
      result.validationWarnings.push(...basicValidation.errors);
    }

    // Financial validation
    if (delivery.totalValue <= 0) {
      result.errors.push('Delivery total value must be greater than zero');
    }

    if (!delivery.unitPrice || delivery.unitPrice <= 0) {
      result.errors.push('Valid unit price is required');
    }

    if (!delivery.quantityLitres || delivery.quantityLitres <= 0) {
      result.errors.push('Valid quantity is required');
    }

    // Document validation
    if (!delivery.psaNumber) {
      result.validationWarnings.push('PSA number is missing');
    }

    if (!delivery.waybillNumber) {
      result.errors.push('Waybill number is required');
    }

    // Quality validation
    if (!delivery.netStandardVolume && (delivery.temperatureAtLoading || delivery.densityAtLoading)) {
      result.validationWarnings.push('Temperature or density provided but net standard volume not calculated');
    }

    // Environmental compliance
    if (delivery.productType === ProductGrade.LPG && !delivery.environmentalPermitNumber) {
      result.validationWarnings.push('Environmental permit required for LPG deliveries');
    }
  }

  private async getEnhancedSupplierInfo(supplierId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/vendors/${supplierId}?include=paymentTerms,taxInfo,compliance`)
      );
      
      const supplier = response.data;
      
      // Validate supplier is active and approved
      if (!supplier.isActive || supplier.status !== 'APPROVED') {
        return null;
      }

      // Add default values for missing properties
      supplier.autoApprovalLimit = supplier.autoApprovalLimit || 50000; // Default GHS 50,000
      supplier.withholdingTaxExempt = supplier.withholdingTaxExempt || false;
      supplier.withholdingTaxRate = supplier.withholdingTaxRate || this.WITHHOLDING_TAX_RATE;
      
      return supplier;
    } catch (error) {
      this.logger.error(`Failed to get enhanced supplier info: ${supplierId}`, error);
      return null;
    }
  }

  private async validateGhanaCompliance(delivery: DailyDelivery, supplier: any): Promise<GhanaComplianceStatus> {
    const status: GhanaComplianceStatus = {
      isCompliant: false,
      npaPermitValid: false,
      customsEntryValid: false,
      taxCalculationsValid: false,
      missingDocuments: [],
      complianceScore: 0,
    };

    let score = 0;
    const maxScore = 100;

    // NPA Permit validation
    if (delivery.npaPermitNumber) {
      const npaValidation = await this.complianceService.validateNPAPermit(delivery.npaPermitNumber);
      status.npaPermitValid = npaValidation.isValid;
      score += npaValidation.isValid ? 25 : 0;
    } else {
      status.missingDocuments.push('NPA Permit Number');
    }

    // Customs entry validation
    if (delivery.customsEntryNumber) {
      const customsValidation = await this.complianceService.validateCustomsEntry(delivery.customsEntryNumber);
      status.customsEntryValid = customsValidation.isValid;
      score += customsValidation.isValid ? 25 : 0;
    } else {
      status.missingDocuments.push('Customs Entry Number');
    }

    // Tax calculations validation
    const taxValidation = this.validateTaxCalculations(delivery);
    status.taxCalculationsValid = taxValidation.isValid;
    score += taxValidation.isValid ? 25 : 0;

    // Document completeness
    const requiredDocs = ['Bill of Lading', 'Quality Certificate'];
    const providedDocs = [];
    
    if (delivery.billOfLadingUrl) providedDocs.push('Bill of Lading');
    if (delivery.qualityCertificateUrl) providedDocs.push('Quality Certificate');

    const docCompleteness = providedDocs.length / requiredDocs.length;
    score += Math.round(docCompleteness * 25);

    const missingDocs = requiredDocs.filter(doc => !providedDocs.includes(doc));
    status.missingDocuments.push(...missingDocs);

    status.complianceScore = score;
    status.isCompliant = score >= 75; // Require at least 75% compliance

    return status;
  }

  private validateTaxCalculations(delivery: DailyDelivery): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate petroleum tax calculation
    const expectedPetroleumTax = delivery.totalValue * 0.17; // 17%
    if (Math.abs(delivery.petroleumTaxAmount - expectedPetroleumTax) > 0.01) {
      errors.push(`Petroleum tax calculation mismatch. Expected: ${expectedPetroleumTax}, Actual: ${delivery.petroleumTaxAmount}`);
    }

    // Validate UPPF levy
    const expectedUPPF = delivery.quantityLitres * 0.46; // GHS 0.46 per litre
    if (Math.abs(delivery.unifiedPetroleumPriceFundLevy - expectedUPPF) > 0.01) {
      errors.push(`UPPF levy calculation mismatch. Expected: ${expectedUPPF}, Actual: ${delivery.unifiedPetroleumPriceFundLevy}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async calculateComprehensiveAmounts(delivery: DailyDelivery, supplier: any) {
    const subtotal = new Decimal(delivery.totalValue);
    
    // Calculate VAT
    const vatAmount = subtotal.mul(this.GHANA_VAT_RATE);
    
    // Calculate withholding tax
    const withholdingTaxAmount = supplier.withholdingTaxExempt ? 
      new Decimal(0) : subtotal.mul(supplier.withholdingTaxRate || this.WITHHOLDING_TAX_RATE);

    // Calculate total taxes (Ghana-specific petroleum taxes)
    const petroleumTax = new Decimal(delivery.petroleumTaxAmount);
    const energyFundLevy = new Decimal(delivery.energyFundLevy);
    const roadFundLevy = new Decimal(delivery.roadFundLevy);
    const priceStabilizationLevy = new Decimal(delivery.priceStabilizationLevy);
    const uppfLevy = new Decimal(delivery.unifiedPetroleumPriceFundLevy);
    const customsDuty = new Decimal(delivery.customsDutyPaid);

    const totalTaxes = petroleumTax
      .plus(energyFundLevy)
      .plus(roadFundLevy)
      .plus(priceStabilizationLevy)
      .plus(uppfLevy)
      .plus(vatAmount);

    const totalAmount = subtotal.plus(totalTaxes);
    const amountDue = totalAmount.minus(withholdingTaxAmount);

    return {
      subtotal: subtotal.toNumber(),
      vatAmount: vatAmount.toNumber(),
      withholdingTaxAmount: withholdingTaxAmount.toNumber(),
      petroleumTax: petroleumTax.toNumber(),
      energyFundLevy: energyFundLevy.toNumber(),
      roadFundLevy: roadFundLevy.toNumber(),
      priceStabilizationLevy: priceStabilizationLevy.toNumber(),
      uppfLevy: uppfLevy.toNumber(),
      customsDuty: customsDuty.toNumber(),
      totalTaxes: totalTaxes.toNumber(),
      total: totalAmount.toNumber(),
      amountDue: amountDue.toNumber(),
    };
  }

  private async generateSequentialInvoiceNumber(
    type: string,
    date: Date,
    tenantId: string
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/invoice-numbering/next', {
          type,
          date: date.toISOString(),
          tenantId,
        })
      );
      return response.data.invoiceNumber;
    } catch (error) {
      // Fallback to timestamp-based numbering
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-6);
      return `${type}-${year}${month}-${timestamp}`;
    }
  }

  private calculateBusinessDueDate(invoiceDate: Date, paymentTerms: string): Date {
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

  private async buildEnhancedAPInvoice(
    delivery: DailyDelivery,
    supplier: any,
    invoiceNumber: string,
    invoiceDate: Date,
    dueDate: Date,
    amounts: any,
    compliance: GhanaComplianceStatus,
    request: SupplierInvoiceGenerationRequest
  ): Promise<EnhancedAPInvoice> {
    // Build line items
    const lineItems = await this.buildEnhancedLineItems(delivery, amounts);

    // Build tax breakdown
    const taxBreakdown = this.buildTaxBreakdown(delivery, amounts);

    // Build compliance data
    const ghanaCompliance = this.buildComplianceData(delivery, amounts);

    // Initialize audit trail
    const auditTrail: AuditTrailEntry[] = [{
      action: 'CREATED',
      performedBy: request.generatedBy,
      performedAt: new Date(),
      details: `Invoice created from delivery ${delivery.deliveryNumber}`,
    }];

    return {
      tenantId: delivery.tenantId,
      vendorId: delivery.supplierId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      currency: delivery.currency,
      subtotal: amounts.subtotal,
      taxAmount: amounts.totalTaxes,
      totalAmount: amounts.total,
      amountDue: amounts.amountDue,
      sourceDocumentType: 'DAILY_DELIVERY',
      sourceDocumentId: delivery.id,
      referenceNumber: delivery.deliveryNumber,
      withholdingTaxAmount: amounts.withholdingTaxAmount,
      vatAmount: amounts.vatAmount,
      customsDutyAmount: amounts.customsDuty,
      contractLiabilityAmount: delivery.contractLiabilityAmount,
      revenueRecognitionDate: delivery.revenueRecognitionDate || invoiceDate,
      status: 'DRAFT',
      approvalRequired: request.approvalRequired || amounts.total > supplier.autoApprovalLimit,
      lineItems,
      taxBreakdown,
      ghanaCompliance,
      auditTrail,
      createdBy: request.generatedBy,
    };
  }

  private async buildEnhancedLineItems(delivery: DailyDelivery, amounts: any): Promise<EnhancedAPInvoiceLineItem[]> {
    const lineItems: EnhancedAPInvoiceLineItem[] = [];

    // Main product line
    const inventoryAccount = this.accountMappingService.getInventoryAccountByProduct(delivery.productType);
    const inventoryAccountInfo = await this.getAccountInfo(inventoryAccount);

    lineItems.push({
      lineNumber: 1,
      description: `${delivery.productType} - ${delivery.quantityLitres}L delivered from ${delivery.loadingTerminal || 'Depot'}`,
      quantity: delivery.quantityLitres,
      unitOfMeasure: 'LITRES',
      unitPrice: delivery.unitPrice,
      lineTotal: delivery.totalValue,
      accountCode: inventoryAccount,
      accountName: inventoryAccountInfo?.accountName || 'Fuel Inventory',
      costCenter: delivery.depotId,
      dimension1: delivery.productType,
      dimension2: delivery.supplierId,
      dimension3: delivery.depotId,
      withholdingTaxApplicable: true,
      vatApplicable: true,
      productType: delivery.productType,
      complianceData: {
        productClassification: `PETROLEUM_${delivery.productType}`,
        harmonizedCode: this.getHarmonizedCode(delivery.productType),
        environmentalImpactCode: 'HIGH',
        qualityStandard: 'GHANA_STANDARD_GS_304',
        certificationRequired: true,
      },
    });

    // Add tax lines
    let lineNumber = 2;
    const taxMappings = this.accountMappingService.getTaxAccountMappings();

    for (const taxMapping of taxMappings) {
      const taxAmount = this.getTaxAmountFromDelivery(delivery, taxMapping.taxType);
      if (taxAmount > 0) {
        const taxAccountInfo = await this.getAccountInfo(taxMapping.accountCode);
        
        lineItems.push({
          lineNumber: lineNumber++,
          description: taxMapping.accountName,
          quantity: 1,
          unitOfMeasure: 'EACH',
          unitPrice: taxAmount,
          lineTotal: taxAmount,
          accountCode: taxMapping.accountCode,
          accountName: taxMapping.accountName,
          costCenter: delivery.depotId,
          taxCode: taxMapping.taxType,
          taxAmount: taxAmount,
          withholdingTaxApplicable: false,
          vatApplicable: false,
        });
      }
    }

    return lineItems;
  }

  private buildTaxBreakdown(delivery: DailyDelivery, amounts: any): TaxBreakdownItem[] {
    const taxBreakdown: TaxBreakdownItem[] = [];

    const taxItems = [
      { type: 'PETROLEUM_TAX', amount: amounts.petroleumTax, rate: 0.17, account: '2220' },
      { type: 'ENERGY_FUND_LEVY', amount: amounts.energyFundLevy, rate: 0.05, account: '2230' },
      { type: 'ROAD_FUND_LEVY', amount: amounts.roadFundLevy, rate: 0.18, account: '2240' },
      { type: 'PRICE_STABILIZATION_LEVY', amount: amounts.priceStabilizationLevy, rate: 0, account: '2260' },
      { type: 'UPPF_LEVY', amount: amounts.uppfLevy, rate: 0.46, account: '2250' },
      { type: 'VAT', amount: amounts.vatAmount, rate: this.GHANA_VAT_RATE, account: '2215' },
      { type: 'WITHHOLDING_TAX', amount: amounts.withholdingTaxAmount, rate: this.WITHHOLDING_TAX_RATE, account: '2280' },
      { type: 'CUSTOMS_DUTY', amount: amounts.customsDuty, rate: 0, account: '2270' },
    ];

    for (const item of taxItems) {
      if (item.amount > 0) {
        taxBreakdown.push({
          taxType: item.type as any,
          taxName: this.getTaxName(item.type),
          taxRate: item.rate,
          taxableAmount: item.type === 'VAT' ? amounts.subtotal : delivery.quantityLitres,
          taxAmount: item.amount,
          accountCode: item.account,
          isGhanaSpecific: ['PETROLEUM_TAX', 'ENERGY_FUND_LEVY', 'ROAD_FUND_LEVY', 'UPPF_LEVY'].includes(item.type),
          complianceRequired: true,
        });
      }
    }

    return taxBreakdown;
  }

  private buildComplianceData(delivery: DailyDelivery, amounts: any): GhanaComplianceData {
    const complianceDocuments: ComplianceDocument[] = [];

    // Add compliance documents
    if (delivery.npaPermitNumber) {
      complianceDocuments.push({
        documentType: 'NPA_PERMIT',
        documentNumber: delivery.npaPermitNumber,
        isValid: true, // This should be validated
      });
    }

    if (delivery.customsEntryNumber) {
      complianceDocuments.push({
        documentType: 'CUSTOMS_ENTRY',
        documentNumber: delivery.customsEntryNumber,
        isValid: true, // This should be validated
      });
    }

    return {
      npaPermitNumber: delivery.npaPermitNumber,
      npaPermitValid: true, // This should be validated
      customsEntryNumber: delivery.customsEntryNumber,
      customsEntryValid: true, // This should be validated
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
      totalComplianceTaxes: amounts.totalTaxes,
      complianceDocuments,
    };
  }

  private async submitForApproval(invoice: EnhancedAPInvoice, userId: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/approval/workflows/supplier-invoice', {
          invoiceData: invoice,
          submittedBy: userId,
          workflowType: 'SUPPLIER_INVOICE_APPROVAL',
        })
      );
      return response.data.workflowId;
    } catch (error) {
      this.logger.error('Failed to submit invoice for approval:', error);
      throw new BadRequestException('Failed to submit invoice for approval');
    }
  }

  private async createEnhancedAPInvoice(invoiceData: EnhancedAPInvoice): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/ap-invoices/enhanced', invoiceData)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create enhanced AP invoice:', error);
      throw new BadRequestException('Failed to create supplier invoice');
    }
  }

  private async generateEnhancedDeliveryJournalEntry(
    invoice: any,
    delivery: DailyDelivery,
    amounts: any,
    userId: string
  ): Promise<string> {
    try {
      // Use the enhanced delivery journal entry system
      const deliveryJournalData = {
        deliveryId: delivery.id,
        stationType: 'COCO', // COCO/DOCO for supplier invoices
        productType: delivery.productType,
        quantity: delivery.quantityLitres,
        unitPrice: delivery.unitPrice,
        totalValue: amounts.subtotal,
        supplierId: delivery.supplierId,
        stationId: delivery.depotId,
        taxBreakdown: {
          petroleumTax: amounts.petroleumTax,
          energyFundLevy: amounts.energyFundLevy,
          roadFundLevy: amounts.roadFundLevy,
          priceStabilizationLevy: amounts.priceStabilizationLevy,
          uppfLevy: amounts.uppfLevy,
          vat: amounts.vatAmount,
          customsDuty: amounts.customsDuty,
        },
        deliveryDate: invoice.invoiceDate,
        tenantId: delivery.tenantId,
      };

      // Call the automated posting service to handle the journal entries
      const response = await firstValueFrom(
        this.httpService.post('/automated-posting/delivery-journal-entries', deliveryJournalData)
      );

      // Emit event to trigger real-time dashboard updates
      this.eventEmitter.emit('delivery.ready_for_accounting', deliveryJournalData);

      this.logger.log(`Created enhanced delivery journal entries for supplier invoice ${invoice.invoiceNumber}`);
      
      return response.data.journalEntries?.[0]?.id || 'AUTO_GENERATED';

    } catch (error) {
      this.logger.error('Failed to create enhanced delivery journal entry:', error);
      
      // Fallback to traditional journal entry creation
      return await this.generateComprehensiveJournalEntry(invoice, delivery, amounts, userId);
    }
  }

  private async generateComprehensiveJournalEntry(
    invoice: any,
    delivery: DailyDelivery,
    amounts: any,
    userId: string
  ): Promise<string> {
    const journalEntry: JournalEntryData = {
      tenantId: delivery.tenantId,
      journalDate: invoice.invoiceDate,
      description: `Supplier invoice - ${delivery.deliveryNumber}`,
      journalType: 'PURCHASE_INVOICE',
      sourceModule: 'DAILY_DELIVERY',
      sourceDocumentType: 'SUPPLIER_INVOICE',
      sourceDocumentId: invoice.id,
      referenceNumber: invoice.invoiceNumber,
      totalDebit: amounts.total,
      totalCredit: amounts.total,
      lines: [],
      createdBy: userId,
      approvalRequired: false,
      ifrsCompliant: true,
      ghanaCompliant: true,
    };

    // Build comprehensive journal lines using account mapping service
    journalEntry.lines = this.accountMappingService.buildSupplierInvoiceJournalLines(
      delivery.productType,
      amounts.subtotal,
      {
        petroleum_tax: amounts.petroleumTax,
        energy_fund_levy: amounts.energyFundLevy,
        road_fund_levy: amounts.roadFundLevy,
        price_stabilization_levy: amounts.priceStabilizationLevy,
        uppf_levy: amounts.uppfLevy,
        vat: amounts.vatAmount,
        customs_duty: amounts.customsDuty,
      },
      delivery.depotId,
      delivery.supplierId
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post('/accounting/journal-entries', journalEntry)
      );
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to create comprehensive journal entry:', error);
      throw new BadRequestException('Failed to create journal entry');
    }
  }

  private async updateDeliveryWithInvoiceInfo(
    queryRunner: any,
    delivery: DailyDelivery,
    invoice: any
  ): Promise<void> {
    await queryRunner.manager.update(DailyDelivery, delivery.id, {
      supplierInvoiceId: invoice.id,
      supplierInvoiceNumber: invoice.invoiceNumber,
      status: DeliveryStatus.INVOICED_SUPPLIER,
      updatedAt: new Date(),
    });
  }

  // Helper methods

  private async groupDeliveriesForBulkProcessing(
    deliveryIds: string[],
    groupBy?: 'SUPPLIER' | 'DATE' | 'PRODUCT_TYPE'
  ): Promise<Array<{ key: string; deliveryIds: string[] }>> {
    if (!groupBy) {
      return [{ key: 'ALL', deliveryIds }];
    }

    const deliveries = await this.deliveryRepository.find({
      where: { id: { $in: deliveryIds } as any },
    });

    const groups = new Map<string, string[]>();

    for (const delivery of deliveries) {
      let key: string;
      switch (groupBy) {
        case 'SUPPLIER':
          key = delivery.supplierId;
          break;
        case 'DATE':
          key = format(delivery.deliveryDate, 'yyyy-MM-dd');
          break;
        case 'PRODUCT_TYPE':
          key = delivery.productType;
          break;
        default:
          key = 'ALL';
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(delivery.id);
    }

    return Array.from(groups.entries()).map(([key, deliveryIds]) => ({ key, deliveryIds }));
  }

  private getTaxAmountFromDelivery(delivery: DailyDelivery, taxType: string): number {
    switch (taxType) {
      case 'PETROLEUM_TAX':
        return delivery.petroleumTaxAmount;
      case 'ENERGY_FUND_LEVY':
        return delivery.energyFundLevy;
      case 'ROAD_FUND_LEVY':
        return delivery.roadFundLevy;
      case 'PRICE_STABILIZATION_LEVY':
        return delivery.priceStabilizationLevy;
      case 'UPPF_LEVY':
        return delivery.unifiedPetroleumPriceFundLevy;
      case 'CUSTOMS_DUTY':
        return delivery.customsDutyPaid;
      default:
        return 0;
    }
  }

  private getTaxName(taxType: string): string {
    const names = {
      'PETROLEUM_TAX': 'Petroleum Tax',
      'ENERGY_FUND_LEVY': 'Energy Fund Levy',
      'ROAD_FUND_LEVY': 'Road Fund Levy',
      'PRICE_STABILIZATION_LEVY': 'Price Stabilization Levy',
      'UPPF_LEVY': 'UPPF Levy',
      'VAT': 'Value Added Tax',
      'WITHHOLDING_TAX': 'Withholding Tax',
      'CUSTOMS_DUTY': 'Customs Duty',
    };
    return names[taxType] || taxType;
  }

  private getHarmonizedCode(productType: ProductGrade): string {
    const codes = {
      'PMS': '2710.12.11',
      'AGO': '2710.20.11',
      'IFO': '2710.20.19',
      'LPG': '2711.12.00',
      'KEROSENE': '2710.19.11',
      'LUBRICANTS': '2710.19.99',
    };
    return codes[productType] || '2710.00.00';
  }

  private async getAccountInfo(accountCode: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/chart-of-accounts/${accountCode}`)
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  private async getSupplierInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/accounting/ap-invoices/${invoiceId}`)
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException('Supplier invoice not found');
    }
  }

  private async updateInvoiceStatus(invoiceId: string, status: string, reason: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.patch(`/accounting/ap-invoices/${invoiceId}/status`, {
        status,
        reason,
        updatedBy: userId,
      })
    );
  }

  private async createReversalJournalEntry(invoice: any, reason: string, userId: string): Promise<void> {
    // Implementation for creating reversal journal entry
    this.logger.log(`Creating reversal journal entry for invoice ${invoice.invoiceNumber}`);
  }
}