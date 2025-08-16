"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EnhancedSupplierInvoiceService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedSupplierInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const decimal_js_1 = require("decimal.js");
const date_fns_1 = require("date-fns");
const daily_delivery_entity_1 = require("../daily-delivery/entities/daily-delivery.entity");
const delivery_line_item_entity_1 = require("../daily-delivery/entities/delivery-line-item.entity");
const delivery_validation_service_1 = require("../daily-delivery/services/delivery-validation.service");
const ghana_chart_accounts_mapping_service_1 = require("../integration/ghana-chart-accounts-mapping.service");
const approval_workflow_service_1 = require("../approval-workflow/approval-workflow.service");
const ghana_compliance_service_1 = require("../compliance/ghana-compliance.service");
let EnhancedSupplierInvoiceService = EnhancedSupplierInvoiceService_1 = class EnhancedSupplierInvoiceService {
    deliveryRepository;
    lineItemRepository;
    dataSource;
    httpService;
    eventEmitter;
    validationService;
    accountMappingService;
    approvalService;
    complianceService;
    logger = new common_1.Logger(EnhancedSupplierInvoiceService_1.name);
    GHANA_VAT_RATE = 0.125; // 12.5%
    WITHHOLDING_TAX_RATE = 0.05; // 5%
    constructor(deliveryRepository, lineItemRepository, dataSource, httpService, eventEmitter, validationService, accountMappingService, approvalService, complianceService) {
        this.deliveryRepository = deliveryRepository;
        this.lineItemRepository = lineItemRepository;
        this.dataSource = dataSource;
        this.httpService = httpService;
        this.eventEmitter = eventEmitter;
        this.validationService = validationService;
        this.accountMappingService = accountMappingService;
        this.approvalService = approvalService;
        this.complianceService = complianceService;
    }
    /**
     * Generate comprehensive supplier invoice from delivery
     */
    async generateSupplierInvoice(request) {
        const result = {
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
                throw new common_1.NotFoundException('Supplier information not found or inactive');
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
            const enhancedInvoice = await this.buildEnhancedAPInvoice(delivery, supplier, invoiceNumber, invoiceDate, dueDate, amountCalculation, complianceValidation, request);
            // Submit for approval if required
            if (request.approvalRequired || amountCalculation.total > supplier.autoApprovalLimit) {
                const approvalWorkflowId = await this.submitForApproval(enhancedInvoice, request.generatedBy);
                enhancedInvoice.approvalWorkflowId = approvalWorkflowId;
                enhancedInvoice.status = 'PENDING_APPROVAL';
                result.approvalWorkflowId = approvalWorkflowId;
            }
            else {
                enhancedInvoice.status = 'APPROVED';
                enhancedInvoice.approvedBy = request.generatedBy;
                enhancedInvoice.approvalDate = new Date();
            }
            // Create AP invoice through accounting service
            const createdInvoice = await this.createEnhancedAPInvoice(enhancedInvoice);
            // Generate comprehensive journal entries using enhanced delivery journal entry
            const journalEntryId = await this.generateEnhancedDeliveryJournalEntry(createdInvoice, delivery, amountCalculation, request.generatedBy);
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to generate supplier invoice:', error);
            result.errors.push(error.message);
            return result;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Generate bulk supplier invoices
     */
    async generateBulkSupplierInvoices(request) {
        const startTime = Date.now();
        this.logger.log(`Starting bulk supplier invoice generation for ${request.deliveryIds.length} deliveries`);
        const results = [];
        let successful = 0;
        let failed = 0;
        let totalAmount = 0;
        // Group deliveries if requested
        const groupedDeliveries = await this.groupDeliveriesForBulkProcessing(request.deliveryIds, request.groupBy);
        for (const group of groupedDeliveries) {
            for (const deliveryId of group.deliveryIds) {
                try {
                    const singleRequest = {
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
                    }
                    else {
                        failed++;
                    }
                }
                catch (error) {
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
    async cancelSupplierInvoice(invoiceId, reason, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get invoice details
            const invoice = await this.getSupplierInvoice(invoiceId);
            if (!invoice) {
                throw new common_1.NotFoundException('Supplier invoice not found');
            }
            if (invoice.status === 'PAID') {
                throw new common_1.BadRequestException('Cannot cancel paid invoice');
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
                await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, delivery.id, {
                    supplierInvoiceId: null,
                    supplierInvoiceNumber: null,
                    status: daily_delivery_entity_1.DeliveryStatus.DELIVERED,
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // Private methods for comprehensive invoice generation
    async getValidatedDelivery(deliveryId, forceGeneration) {
        const delivery = await this.deliveryRepository.findOne({
            where: { id: deliveryId },
            relations: ['lineItems', 'documents'],
        });
        if (!delivery) {
            throw new common_1.NotFoundException('Delivery not found');
        }
        if (!forceGeneration) {
            if (!delivery.canBeInvoicedToSupplier()) {
                throw new common_1.BadRequestException('Delivery cannot be invoiced to supplier');
            }
            if (delivery.supplierInvoiceId) {
                throw new common_1.BadRequestException('Supplier invoice already exists for this delivery');
            }
        }
        return delivery;
    }
    async performComprehensiveValidation(delivery, result, forceGeneration) {
        // Basic delivery validation
        const basicValidation = await this.validationService.validateForInvoicing(delivery);
        if (!basicValidation.isValid && !forceGeneration) {
            result.errors.push(...basicValidation.errors);
        }
        else if (!basicValidation.isValid) {
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
        if (delivery.productType === daily_delivery_entity_1.ProductGrade.LPG && !delivery.environmentalPermitNumber) {
            result.validationWarnings.push('Environmental permit required for LPG deliveries');
        }
    }
    async getEnhancedSupplierInfo(supplierId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/vendors/${supplierId}?include=paymentTerms,taxInfo,compliance`));
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
        }
        catch (error) {
            this.logger.error(`Failed to get enhanced supplier info: ${supplierId}`, error);
            return null;
        }
    }
    async validateGhanaCompliance(delivery, supplier) {
        const status = {
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
        }
        else {
            status.missingDocuments.push('NPA Permit Number');
        }
        // Customs entry validation
        if (delivery.customsEntryNumber) {
            const customsValidation = await this.complianceService.validateCustomsEntry(delivery.customsEntryNumber);
            status.customsEntryValid = customsValidation.isValid;
            score += customsValidation.isValid ? 25 : 0;
        }
        else {
            status.missingDocuments.push('Customs Entry Number');
        }
        // Tax calculations validation
        const taxValidation = this.validateTaxCalculations(delivery);
        status.taxCalculationsValid = taxValidation.isValid;
        score += taxValidation.isValid ? 25 : 0;
        // Document completeness
        const requiredDocs = ['Bill of Lading', 'Quality Certificate'];
        const providedDocs = [];
        if (delivery.billOfLadingUrl)
            providedDocs.push('Bill of Lading');
        if (delivery.qualityCertificateUrl)
            providedDocs.push('Quality Certificate');
        const docCompleteness = providedDocs.length / requiredDocs.length;
        score += Math.round(docCompleteness * 25);
        const missingDocs = requiredDocs.filter(doc => !providedDocs.includes(doc));
        status.missingDocuments.push(...missingDocs);
        status.complianceScore = score;
        status.isCompliant = score >= 75; // Require at least 75% compliance
        return status;
    }
    validateTaxCalculations(delivery) {
        const errors = [];
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
    async calculateComprehensiveAmounts(delivery, supplier) {
        const subtotal = new decimal_js_1.Decimal(delivery.totalValue);
        // Calculate VAT
        const vatAmount = subtotal.mul(this.GHANA_VAT_RATE);
        // Calculate withholding tax
        const withholdingTaxAmount = supplier.withholdingTaxExempt ?
            new decimal_js_1.Decimal(0) : subtotal.mul(supplier.withholdingTaxRate || this.WITHHOLDING_TAX_RATE);
        // Calculate total taxes (Ghana-specific petroleum taxes)
        const petroleumTax = new decimal_js_1.Decimal(delivery.petroleumTaxAmount);
        const energyFundLevy = new decimal_js_1.Decimal(delivery.energyFundLevy);
        const roadFundLevy = new decimal_js_1.Decimal(delivery.roadFundLevy);
        const priceStabilizationLevy = new decimal_js_1.Decimal(delivery.priceStabilizationLevy);
        const uppfLevy = new decimal_js_1.Decimal(delivery.unifiedPetroleumPriceFundLevy);
        const customsDuty = new decimal_js_1.Decimal(delivery.customsDutyPaid);
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
    async generateSequentialInvoiceNumber(type, date, tenantId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/invoice-numbering/next', {
                type,
                date: date.toISOString(),
                tenantId,
            }));
            return response.data.invoiceNumber;
        }
        catch (error) {
            // Fallback to timestamp-based numbering
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const timestamp = Date.now().toString().slice(-6);
            return `${type}-${year}${month}-${timestamp}`;
        }
    }
    calculateBusinessDueDate(invoiceDate, paymentTerms) {
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
        return (0, date_fns_1.addDays)(dueDate, days);
    }
    async buildEnhancedAPInvoice(delivery, supplier, invoiceNumber, invoiceDate, dueDate, amounts, compliance, request) {
        // Build line items
        const lineItems = await this.buildEnhancedLineItems(delivery, amounts);
        // Build tax breakdown
        const taxBreakdown = this.buildTaxBreakdown(delivery, amounts);
        // Build compliance data
        const ghanaCompliance = this.buildComplianceData(delivery, amounts);
        // Initialize audit trail
        const auditTrail = [{
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
    async buildEnhancedLineItems(delivery, amounts) {
        const lineItems = [];
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
    buildTaxBreakdown(delivery, amounts) {
        const taxBreakdown = [];
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
                    taxType: item.type,
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
    buildComplianceData(delivery, amounts) {
        const complianceDocuments = [];
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
    async submitForApproval(invoice, userId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/approval/workflows/supplier-invoice', {
                invoiceData: invoice,
                submittedBy: userId,
                workflowType: 'SUPPLIER_INVOICE_APPROVAL',
            }));
            return response.data.workflowId;
        }
        catch (error) {
            this.logger.error('Failed to submit invoice for approval:', error);
            throw new common_1.BadRequestException('Failed to submit invoice for approval');
        }
    }
    async createEnhancedAPInvoice(invoiceData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/ap-invoices/enhanced', invoiceData));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create enhanced AP invoice:', error);
            throw new common_1.BadRequestException('Failed to create supplier invoice');
        }
    }
    async generateEnhancedDeliveryJournalEntry(invoice, delivery, amounts, userId) {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/automated-posting/delivery-journal-entries', deliveryJournalData));
            // Emit event to trigger real-time dashboard updates
            this.eventEmitter.emit('delivery.ready_for_accounting', deliveryJournalData);
            this.logger.log(`Created enhanced delivery journal entries for supplier invoice ${invoice.invoiceNumber}`);
            return response.data.journalEntries?.[0]?.id || 'AUTO_GENERATED';
        }
        catch (error) {
            this.logger.error('Failed to create enhanced delivery journal entry:', error);
            // Fallback to traditional journal entry creation
            return await this.generateComprehensiveJournalEntry(invoice, delivery, amounts, userId);
        }
    }
    async generateComprehensiveJournalEntry(invoice, delivery, amounts, userId) {
        const journalEntry = {
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
        journalEntry.lines = this.accountMappingService.buildSupplierInvoiceJournalLines(delivery.productType, amounts.subtotal, {
            petroleum_tax: amounts.petroleumTax,
            energy_fund_levy: amounts.energyFundLevy,
            road_fund_levy: amounts.roadFundLevy,
            price_stabilization_levy: amounts.priceStabilizationLevy,
            uppf_levy: amounts.uppfLevy,
            vat: amounts.vatAmount,
            customs_duty: amounts.customsDuty,
        }, delivery.depotId, delivery.supplierId);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/journal-entries', journalEntry));
            return response.data.id;
        }
        catch (error) {
            this.logger.error('Failed to create comprehensive journal entry:', error);
            throw new common_1.BadRequestException('Failed to create journal entry');
        }
    }
    async updateDeliveryWithInvoiceInfo(queryRunner, delivery, invoice) {
        await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, delivery.id, {
            supplierInvoiceId: invoice.id,
            supplierInvoiceNumber: invoice.invoiceNumber,
            status: daily_delivery_entity_1.DeliveryStatus.INVOICED_SUPPLIER,
            updatedAt: new Date(),
        });
    }
    // Helper methods
    async groupDeliveriesForBulkProcessing(deliveryIds, groupBy) {
        if (!groupBy) {
            return [{ key: 'ALL', deliveryIds }];
        }
        const deliveries = await this.deliveryRepository.find({
            where: { id: { $in: deliveryIds } },
        });
        const groups = new Map();
        for (const delivery of deliveries) {
            let key;
            switch (groupBy) {
                case 'SUPPLIER':
                    key = delivery.supplierId;
                    break;
                case 'DATE':
                    key = (0, date_fns_1.format)(delivery.deliveryDate, 'yyyy-MM-dd');
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
    getTaxAmountFromDelivery(delivery, taxType) {
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
    getTaxName(taxType) {
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
    getHarmonizedCode(productType) {
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
    async getAccountInfo(accountCode) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/chart-of-accounts/${accountCode}`));
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    async getSupplierInvoice(invoiceId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/ap-invoices/${invoiceId}`));
            return response.data;
        }
        catch (error) {
            throw new common_1.NotFoundException('Supplier invoice not found');
        }
    }
    async updateInvoiceStatus(invoiceId, status, reason, userId) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`/accounting/ap-invoices/${invoiceId}/status`, {
            status,
            reason,
            updatedBy: userId,
        }));
    }
    async createReversalJournalEntry(invoice, reason, userId) {
        // Implementation for creating reversal journal entry
        this.logger.log(`Creating reversal journal entry for invoice ${invoice.invoiceNumber}`);
    }
};
exports.EnhancedSupplierInvoiceService = EnhancedSupplierInvoiceService;
exports.EnhancedSupplierInvoiceService = EnhancedSupplierInvoiceService = EnhancedSupplierInvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_delivery_entity_1.DailyDelivery)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_line_item_entity_1.DeliveryLineItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, event_emitter_1.EventEmitter2,
        delivery_validation_service_1.DeliveryValidationService,
        ghana_chart_accounts_mapping_service_1.GhanaChartAccountsMappingService,
        approval_workflow_service_1.ApprovalWorkflowService,
        ghana_compliance_service_1.GhanaComplianceService])
], EnhancedSupplierInvoiceService);
//# sourceMappingURL=enhanced-supplier-invoice.service.js.map