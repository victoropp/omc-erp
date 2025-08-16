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
var APARIntegrationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.APARIntegrationService = void 0;
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
const ghana_compliance_service_1 = require("../compliance/ghana-compliance.service");
const approval_workflow_service_1 = require("../approval-workflow/approval-workflow.service");
let APARIntegrationService = APARIntegrationService_1 = class APARIntegrationService {
    deliveryRepository;
    lineItemRepository;
    dataSource;
    httpService;
    eventEmitter;
    ghanaComplianceService;
    approvalService;
    logger = new common_1.Logger(APARIntegrationService_1.name);
    GHANA_VAT_RATE = 0.125; // 12.5%
    WITHHOLDING_TAX_RATE = 0.05; // 5%
    constructor(deliveryRepository, lineItemRepository, dataSource, httpService, eventEmitter, ghanaComplianceService, approvalService) {
        this.deliveryRepository = deliveryRepository;
        this.lineItemRepository = lineItemRepository;
        this.dataSource = dataSource;
        this.httpService = httpService;
        this.eventEmitter = eventEmitter;
        this.ghanaComplianceService = ghanaComplianceService;
        this.approvalService = approvalService;
    }
    /**
     * Main entry point for invoice generation from deliveries
     */
    async generateInvoicesFromDeliveries(request) {
        const startTime = Date.now();
        this.logger.log(`Starting invoice generation for ${request.deliveryIds.length} deliveries`);
        const result = {
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
                throw new common_1.BadRequestException('No valid deliveries found for invoice generation');
            }
            // Start transaction for batch processing
            await queryRunner.startTransaction();
            // Process each delivery
            for (const delivery of deliveries) {
                try {
                    await this.processDeliveryInvoicing(delivery, request, result, queryRunner);
                }
                catch (error) {
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Invoice generation failed:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Generate supplier invoice (AP) from delivery with station type consideration
     */
    async generateSupplierInvoice(delivery, userId, invoiceDate, dueDate) {
        this.logger.log(`Generating supplier invoice for delivery ${delivery.deliveryNumber} (Station: ${delivery.stationType})`);
        // Validate delivery state
        this.validateDeliveryForSupplierInvoicing(delivery);
        // Station type specific validations
        if (delivery.stationType === daily_delivery_entity_1.StationType.COCO || delivery.stationType === daily_delivery_entity_1.StationType.DOCO) {
            // For COCO/DOCO, we're purchasing inventory, not making an immediate sale
            this.logger.log('Processing as inventory purchase for COCO/DOCO station');
        }
        else {
            // For DODO/Industrial/Commercial, this is a pass-through transaction
            this.logger.log('Processing as pass-through transaction for direct sale');
        }
        // Get supplier information
        const supplier = await this.getSupplierInfo(delivery.supplierId);
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier information not found');
        }
        // Calculate invoice amounts
        const amounts = this.calculateSupplierInvoiceAmounts(delivery, supplier);
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber('AP', invoiceDate || new Date());
        // Calculate dates
        const actualInvoiceDate = invoiceDate || delivery.actualDeliveryTime || new Date();
        const actualDueDate = dueDate || this.calculateDueDate(actualInvoiceDate, supplier.paymentTerms);
        // Build AP invoice data
        const apInvoiceData = {
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
    async generateCustomerInvoice(delivery, userId, invoiceDate, dueDate) {
        this.logger.log(`Generating customer invoice for delivery ${delivery.deliveryNumber} (Station: ${delivery.stationType})`);
        // Station type specific logic
        if (delivery.stationType === daily_delivery_entity_1.StationType.COCO || delivery.stationType === daily_delivery_entity_1.StationType.DOCO) {
            // For COCO/DOCO, this should be an internal transfer, not a customer invoice
            throw new common_1.BadRequestException('COCO/DOCO stations require inventory transfers, not customer invoices. Use internal transfer process.');
        }
        // Validate delivery state
        this.validateDeliveryForCustomerInvoicing(delivery);
        // Get customer information
        const customer = await this.getCustomerInfo(delivery.customerId);
        if (!customer) {
            throw new common_1.NotFoundException('Customer information not found');
        }
        // Calculate invoice amounts
        const amounts = this.calculateCustomerInvoiceAmounts(delivery, customer);
        // Generate invoice number
        const invoiceNumber = await this.generateInvoiceNumber('AR', invoiceDate || new Date());
        // Calculate dates
        const actualInvoiceDate = invoiceDate || delivery.actualDeliveryTime || new Date();
        const actualDueDate = dueDate || this.calculateDueDate(actualInvoiceDate, customer.paymentTerms);
        // Build AR invoice data
        const arInvoiceData = {
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
    async generateDeliveryCompletionJournalEntry(delivery, userId) {
        this.logger.log(`Generating delivery completion journal entry for ${delivery.deliveryNumber}`);
        const journalEntry = {
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
    async processBulkInvoiceGeneration(deliveryIds, userId) {
        const request = {
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
        result.approvalWorkflowId = approvalWorkflowId;
        return result;
    }
    // Event handlers for automated invoice generation
    async handleDeliveryStatusChange(payload) {
        if (payload.newStatus === daily_delivery_entity_1.DeliveryStatus.DELIVERED) {
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
    async getValidatedDeliveries(deliveryIds, forceGeneration = false) {
        const deliveries = await this.deliveryRepository.find({
            where: { id: deliveryIds.length === 1 ? deliveryIds[0] : undefined },
            relations: ['lineItems'],
        });
        if (deliveryIds.length > 1) {
            const foundIds = deliveries.map(d => d.id);
            const missingIds = deliveryIds.filter(id => !foundIds.includes(id));
            if (missingIds.length > 0) {
                throw new common_1.NotFoundException(`Deliveries not found: ${missingIds.join(', ')}`);
            }
        }
        const validDeliveries = deliveries.filter(delivery => {
            if (!forceGeneration) {
                return delivery.status === daily_delivery_entity_1.DeliveryStatus.DELIVERED &&
                    delivery.canBeInvoicedToSupplier() &&
                    delivery.canBeInvoicedToCustomer();
            }
            return true;
        });
        return validDeliveries;
    }
    async processDeliveryInvoicing(delivery, request, result, queryRunner) {
        let supplierInvoiceId;
        let customerInvoiceId;
        // Generate supplier invoice
        if (request.generationType === 'SUPPLIER' || request.generationType === 'BOTH') {
            if (!delivery.supplierInvoiceId) {
                supplierInvoiceId = await this.generateSupplierInvoice(delivery, request.generatedBy, request.invoiceDate, request.dueDate);
                result.invoiceIds.push(supplierInvoiceId);
                result.invoicesGenerated++;
            }
        }
        // Generate customer invoice
        if (request.generationType === 'CUSTOMER' || request.generationType === 'BOTH') {
            if (!delivery.customerInvoiceId) {
                customerInvoiceId = await this.generateCustomerInvoice(delivery, request.generatedBy, request.invoiceDate, request.dueDate);
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
    validateDeliveryForSupplierInvoicing(delivery) {
        if (!delivery.canBeInvoicedToSupplier()) {
            throw new common_1.BadRequestException('Delivery cannot be invoiced to supplier');
        }
        if (delivery.supplierInvoiceId) {
            throw new common_1.BadRequestException('Supplier invoice already exists for this delivery');
        }
    }
    validateDeliveryForCustomerInvoicing(delivery) {
        if (!delivery.canBeInvoicedToCustomer()) {
            throw new common_1.BadRequestException('Delivery cannot be invoiced to customer');
        }
        if (delivery.customerInvoiceId) {
            throw new common_1.BadRequestException('Customer invoice already exists for this delivery');
        }
    }
    calculateSupplierInvoiceAmounts(delivery, supplier) {
        const priceBuildupComponents = delivery.getPriceBuildupComponents();
        let subtotal = delivery.totalValue;
        // For supplier invoices, use base cost without margins
        if (priceBuildupComponents && priceBuildupComponents.basePrice) {
            subtotal = priceBuildupComponents.basePrice * delivery.quantityLitres;
        }
        const vat = new decimal_js_1.Decimal(subtotal).mul(this.GHANA_VAT_RATE).toNumber();
        const withholdingTax = supplier.withholdingTaxExempt ? 0 :
            new decimal_js_1.Decimal(subtotal).mul(this.WITHHOLDING_TAX_RATE).toNumber();
        // Calculate taxes from price build-up if available
        let governmentTaxes = delivery.getTotalTaxes();
        if (priceBuildupComponents && priceBuildupComponents.taxes) {
            const taxes = priceBuildupComponents.taxes;
            const quantity = delivery.quantityLitres;
            governmentTaxes = quantity * ((taxes.petroleumTax || 0) +
                (taxes.energyFundLevy || 0) +
                (taxes.roadFundLevy || 0) +
                (taxes.priceStabilizationLevy || 0) +
                (taxes.uppfLevy || 0));
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
    calculateCustomerInvoiceAmounts(delivery, customer) {
        const priceBuildupComponents = delivery.getPriceBuildupComponents();
        let subtotal = delivery.totalValue + delivery.getTotalMargins();
        // For customer invoices, use selling price with all margins
        if (priceBuildupComponents) {
            const basePrice = priceBuildupComponents.basePrice || 0;
            const dealerMargin = priceBuildupComponents.dealerMargin || 0;
            const marketingMargin = priceBuildupComponents.marketingMargin || 0;
            // Calculate selling price based on station type
            let sellingPricePerLitre = basePrice;
            if (delivery.stationType === daily_delivery_entity_1.StationType.DODO) {
                // DODO gets dealer margin
                sellingPricePerLitre += dealerMargin;
            }
            if (delivery.stationType === daily_delivery_entity_1.StationType.INDUSTRIAL || delivery.stationType === daily_delivery_entity_1.StationType.COMMERCIAL) {
                // Industrial/Commercial may get different pricing
                sellingPricePerLitre += marketingMargin;
            }
            subtotal = sellingPricePerLitre * delivery.quantityLitres;
        }
        const vat = new decimal_js_1.Decimal(subtotal).mul(this.GHANA_VAT_RATE).toNumber();
        // Calculate government taxes from price build-up if available
        let governmentTaxes = delivery.getTotalTaxes();
        if (priceBuildupComponents && priceBuildupComponents.taxes) {
            const taxes = priceBuildupComponents.taxes;
            const quantity = delivery.quantityLitres;
            governmentTaxes = quantity * ((taxes.petroleumTax || 0) +
                (taxes.energyFundLevy || 0) +
                (taxes.roadFundLevy || 0) +
                (taxes.priceStabilizationLevy || 0) +
                (taxes.uppfLevy || 0));
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
    buildSupplierInvoiceLines(delivery, amounts) {
        const lines = [];
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
    buildCustomerInvoiceLines(delivery, amounts) {
        const lines = [];
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
    addTaxLines(lines, delivery, invoiceType) {
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
    buildGhanaComplianceData(delivery) {
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
    getInventoryAccountCode(productType) {
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
    getRevenueAccountCode(productType) {
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
    async generateInvoiceNumber(type, date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);
        return `${type}-${year}${month}-${timestamp}`;
    }
    calculateDueDate(invoiceDate, paymentTerms) {
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
    // External service integration methods
    async getSupplierInfo(supplierId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/vendors/${supplierId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get supplier info: ${supplierId}`, error);
            return null;
        }
    }
    async getCustomerInfo(customerId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/customers/${customerId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get customer info: ${customerId}`, error);
            return null;
        }
    }
    async createAPInvoice(invoiceData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/ap-invoices', invoiceData));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create AP invoice', error);
            throw new common_1.BadRequestException('Failed to create supplier invoice');
        }
    }
    async createARInvoice(invoiceData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/ar-invoices', invoiceData));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create AR invoice', error);
            throw new common_1.BadRequestException('Failed to create customer invoice');
        }
    }
    async createJournalEntry(entryData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/journal-entries', entryData));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create journal entry', error);
            throw new common_1.BadRequestException('Failed to create journal entry');
        }
    }
    async generateSupplierInvoiceJournalEntry(invoice, delivery, userId) {
        // Implementation for supplier invoice journal entry
        return 'journal-entry-id';
    }
    async generateCustomerInvoiceJournalEntry(invoice, delivery, userId) {
        // Implementation for customer invoice journal entry
        return 'journal-entry-id';
    }
    async updateDeliveryWithSupplierInvoice(delivery, invoice) {
        await this.deliveryRepository.update(delivery.id, {
            supplierInvoiceId: invoice.id,
            supplierInvoiceNumber: invoice.invoiceNumber,
            status: daily_delivery_entity_1.DeliveryStatus.INVOICED_SUPPLIER,
        });
    }
    async updateDeliveryWithCustomerInvoice(delivery, invoice) {
        await this.deliveryRepository.update(delivery.id, {
            customerInvoiceId: invoice.id,
            customerInvoiceNumber: invoice.invoiceNumber,
            status: delivery.supplierInvoiceId ? daily_delivery_entity_1.DeliveryStatus.COMPLETED : daily_delivery_entity_1.DeliveryStatus.INVOICED_CUSTOMER,
        });
    }
    async getAutoInvoiceSettings(tenantId) {
        // Get auto-invoice configuration
        return { enabled: false };
    }
    async processAutoInvoiceGeneration(delivery, settings) {
        // Process automated invoice generation based on settings
    }
};
exports.APARIntegrationService = APARIntegrationService;
__decorate([
    (0, event_emitter_1.OnEvent)('delivery.status_changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], APARIntegrationService.prototype, "handleDeliveryStatusChange", null);
exports.APARIntegrationService = APARIntegrationService = APARIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_delivery_entity_1.DailyDelivery)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_line_item_entity_1.DeliveryLineItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, event_emitter_1.EventEmitter2,
        ghana_compliance_service_1.GhanaComplianceService,
        approval_workflow_service_1.ApprovalWorkflowService])
], APARIntegrationService);
//# sourceMappingURL=ap-ar-integration.service.js.map