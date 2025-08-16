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
var EnhancedCustomerInvoiceService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCustomerInvoiceService = void 0;
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
let EnhancedCustomerInvoiceService = EnhancedCustomerInvoiceService_1 = class EnhancedCustomerInvoiceService {
    deliveryRepository;
    lineItemRepository;
    dataSource;
    httpService;
    eventEmitter;
    validationService;
    accountMappingService;
    approvalService;
    complianceService;
    logger = new common_1.Logger(EnhancedCustomerInvoiceService_1.name);
    GHANA_VAT_RATE = 0.125; // 12.5%
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
     * Generate comprehensive customer invoice from delivery
     */
    async generateCustomerInvoice(request) {
        const result = {
            success: false,
            totalAmount: 0,
            dealerMarginAmount: 0,
            uppfClaimAmount: 0,
            errors: [],
            validationWarnings: [],
            creditLimitStatus: {
                currentBalance: 0,
                creditLimit: 0,
                availableCredit: 0,
                utilizationPercentage: 0,
                exceedsLimit: false,
                recommendedAction: 'APPROVE',
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
            // Get customer information with credit limit validation
            const customer = await this.getEnhancedCustomerInfo(delivery.customerId);
            if (!customer) {
                throw new common_1.NotFoundException('Customer information not found or inactive');
            }
            // Validate credit limit
            const creditLimitValidation = await this.validateCreditLimit(customer, delivery.totalValue);
            result.creditLimitStatus = creditLimitValidation;
            if (creditLimitValidation.exceedsLimit && !request.forceGeneration) {
                result.errors.push('Customer credit limit exceeded');
                return result;
            }
            // Get dealer information
            const dealerInfo = await this.getDealerInformation(delivery.customerId);
            // Calculate comprehensive amounts with margin breakdown
            const amountCalculation = await this.calculateComprehensiveAmounts(delivery, customer, dealerInfo);
            result.totalAmount = amountCalculation.total;
            result.dealerMarginAmount = amountCalculation.totalMargins;
            // Generate invoice number with proper sequencing
            const invoiceNumber = await this.generateSequentialInvoiceNumber('AR', request.invoiceDate || new Date(), delivery.tenantId);
            // Calculate dates with business rules
            const invoiceDate = request.invoiceDate || delivery.actualDeliveryTime || new Date();
            const dueDate = request.dueDate || this.calculateBusinessDueDate(invoiceDate, customer.paymentTerms);
            // Build enhanced AR invoice
            const enhancedInvoice = await this.buildEnhancedARInvoice(delivery, customer, dealerInfo, invoiceNumber, invoiceDate, dueDate, amountCalculation, request);
            // Generate UPPF claim if requested and eligible
            if (request.includeUPPFClaim && dealerInfo.uppfEligible) {
                const uppfClaim = await this.generateUPPFClaim(delivery, dealerInfo, request.generatedBy);
                enhancedInvoice.uppfClaim = uppfClaim;
                result.uppfClaimId = uppfClaim.claimId;
                result.uppfClaimAmount = uppfClaim.claimAmount;
            }
            // Submit for approval if required
            if (request.approvalRequired || creditLimitValidation.recommendedAction !== 'APPROVE') {
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
            // Create AR invoice through accounting service
            const createdInvoice = await this.createEnhancedARInvoice(enhancedInvoice);
            // Generate comprehensive journal entries using enhanced delivery journal entry with IFRS compliance
            const journalEntryId = await this.generateEnhancedDeliveryJournalEntry(createdInvoice, delivery, amountCalculation, request.generatedBy);
            // Update delivery with invoice information
            await this.updateDeliveryWithInvoiceInfo(queryRunner, delivery, createdInvoice);
            // Update customer balance and credit utilization
            await this.updateCustomerBalance(queryRunner, customer, amountCalculation.total);
            // Commit transaction
            await queryRunner.commitTransaction();
            // Prepare successful result
            result.success = true;
            result.invoiceId = createdInvoice.id;
            result.invoiceNumber = createdInvoice.invoiceNumber;
            result.journalEntryId = journalEntryId;
            // Emit comprehensive event
            this.eventEmitter.emit('customer_invoice.generated', {
                deliveryId: delivery.id,
                invoiceId: createdInvoice.id,
                invoiceNumber: createdInvoice.invoiceNumber,
                customerId: delivery.customerId,
                amount: createdInvoice.totalAmount,
                dealerMarginAmount: result.dealerMarginAmount,
                uppfClaimId: result.uppfClaimId,
                creditLimitStatus: result.creditLimitStatus,
                journalEntryId,
                approvalRequired: request.approvalRequired,
                approvalWorkflowId: result.approvalWorkflowId,
            });
            this.logger.log(`Enhanced customer invoice ${invoiceNumber} generated successfully for delivery ${delivery.deliveryNumber}`);
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to generate customer invoice:', error);
            result.errors.push(error.message);
            return result;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Generate bulk customer invoices
     */
    async generateBulkCustomerInvoices(request) {
        const startTime = Date.now();
        this.logger.log(`Starting bulk customer invoice generation for ${request.deliveryIds.length} deliveries`);
        const results = [];
        let successful = 0;
        let failed = 0;
        let totalAmount = 0;
        let totalDealerMargins = 0;
        let totalUPPFClaims = 0;
        let creditLimitExceeded = 0;
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
                        includeUPPFClaim: request.includeUPPFClaim,
                        generatedBy: request.generatedBy,
                        notes: request.notes,
                    };
                    const result = await this.generateCustomerInvoice(singleRequest);
                    results.push(result);
                    if (result.success) {
                        successful++;
                        totalAmount += result.totalAmount;
                        totalDealerMargins += result.dealerMarginAmount;
                        totalUPPFClaims += result.uppfClaimAmount;
                    }
                    else {
                        failed++;
                    }
                    if (result.creditLimitStatus.exceedsLimit) {
                        creditLimitExceeded++;
                    }
                }
                catch (error) {
                    failed++;
                    results.push({
                        success: false,
                        totalAmount: 0,
                        dealerMarginAmount: 0,
                        uppfClaimAmount: 0,
                        errors: [error.message],
                        validationWarnings: [],
                        creditLimitStatus: {
                            currentBalance: 0,
                            creditLimit: 0,
                            availableCredit: 0,
                            utilizationPercentage: 0,
                            exceedsLimit: false,
                            recommendedAction: 'APPROVE',
                        },
                    });
                }
            }
        }
        const processingTime = Date.now() - startTime;
        // Emit bulk completion event
        this.eventEmitter.emit('bulk_customer_invoices.generated', {
            request,
            results,
            summary: {
                total: request.deliveryIds.length,
                successful,
                failed,
                totalAmount,
                totalDealerMargins,
                totalUPPFClaims,
                creditLimitExceeded,
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
                totalDealerMargins,
                totalUPPFClaims,
                creditLimitExceeded,
                processingTime,
            },
        };
    }
    /**
     * Generate UPPF claim from delivery
     */
    async generateUPPFClaim(delivery, dealerInfo, userId) {
        const claimAmount = new decimal_js_1.Decimal(delivery.quantityLitres)
            .mul(delivery.unifiedPetroleumPriceFundLevy)
            .div(delivery.quantityLitres) // Rate per litre
            .mul(delivery.quantityLitres)
            .toNumber();
        const uppfClaim = {
            claimId: await this.generateClaimId(),
            claimAmount,
            eligibleVolume: delivery.quantityLitres,
            ratePerLitre: delivery.unifiedPetroleumPriceFundLevy / delivery.quantityLitres,
            claimPeriod: {
                startDate: delivery.deliveryDate,
                endDate: delivery.actualDeliveryTime || new Date(),
            },
            status: 'PENDING',
            submissionDeadline: (0, date_fns_1.addDays)(delivery.deliveryDate, 30), // 30 days to submit
            supportingDocuments: [
                delivery.deliveryReceiptUrl,
                delivery.billOfLadingUrl,
                delivery.qualityCertificateUrl,
            ].filter(Boolean),
        };
        // Submit to UPPF service
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/uppf/claims', {
                claimData: uppfClaim,
                deliveryId: delivery.id,
                dealerId: dealerInfo.dealerId,
                submittedBy: userId,
            }));
            uppfClaim.claimId = response.data.claimId;
            uppfClaim.status = 'SUBMITTED';
        }
        catch (error) {
            this.logger.error('Failed to submit UPPF claim:', error);
            // Keep as PENDING for manual submission
        }
        return uppfClaim;
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
            if (!delivery.canBeInvoicedToCustomer()) {
                throw new common_1.BadRequestException('Delivery cannot be invoiced to customer');
            }
            if (delivery.customerInvoiceId) {
                throw new common_1.BadRequestException('Customer invoice already exists for this delivery');
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
        // Delivery completion validation
        if (!delivery.actualDeliveryTime) {
            result.errors.push('Delivery must be completed before invoicing');
        }
        // Product quality validation
        if (!delivery.netStandardVolume && delivery.quantityLitres) {
            result.validationWarnings.push('Net standard volume calculation missing');
        }
        // Customer acceptance validation
        if (!delivery.customerFeedback && !forceGeneration) {
            result.validationWarnings.push('Customer acceptance/feedback not recorded');
        }
        // Margin calculation validation
        const expectedMargins = delivery.getTotalMargins();
        if (expectedMargins <= 0) {
            result.validationWarnings.push('Dealer margins not properly calculated');
        }
    }
    async getEnhancedCustomerInfo(customerId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/customers/${customerId}?include=creditLimit,paymentTerms,paymentHistory`));
            const customer = response.data;
            // Validate customer is active
            if (!customer.isActive || customer.status !== 'ACTIVE') {
                return null;
            }
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to get enhanced customer info: ${customerId}`, error);
            return null;
        }
    }
    async validateCreditLimit(customer, invoiceAmount) {
        const currentBalance = customer.currentBalance || 0;
        const creditLimit = customer.creditLimit || 0;
        const newBalance = currentBalance + invoiceAmount;
        const availableCredit = Math.max(0, creditLimit - currentBalance);
        const utilizationPercentage = creditLimit > 0 ? (newBalance / creditLimit) * 100 : 0;
        const exceedsLimit = newBalance > creditLimit && creditLimit > 0;
        let recommendedAction = 'APPROVE';
        if (exceedsLimit) {
            if (utilizationPercentage > 150) {
                recommendedAction = 'REJECT';
            }
            else if (utilizationPercentage > 110) {
                recommendedAction = 'REVIEW';
            }
        }
        return {
            currentBalance,
            creditLimit,
            availableCredit,
            utilizationPercentage,
            exceedsLimit,
            recommendedAction,
        };
    }
    async getDealerInformation(customerId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/dealer/info/${customerId}?include=margins,paymentHistory,uppfEligibility`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get dealer information: ${customerId}`, error);
            // Return default dealer info
            return {
                dealerId: customerId,
                dealerName: 'Unknown Dealer',
                dealerCode: 'UNK',
                stationLocation: 'Unknown',
                dealerType: 'DOCO',
                creditRating: 'UNKNOWN',
                paymentHistory: {
                    averagePaymentDays: 30,
                    paymentReliabilityScore: 50,
                    totalOutstanding: 0,
                    overdueAmount: 0,
                },
                uppfEligible: false,
                marginStructure: {
                    primaryDistributionRate: 0.05,
                    marketingMarginRate: 0.03,
                    dealerMarginRate: 0.07,
                    totalMarginPercentage: 0.15,
                    effectiveDate: new Date(),
                },
            };
        }
    }
    async calculateComprehensiveAmounts(delivery, customer, dealerInfo) {
        const baseValue = new decimal_js_1.Decimal(delivery.totalValue);
        // Calculate margins
        const primaryDistributionMargin = new decimal_js_1.Decimal(delivery.primaryDistributionMargin);
        const marketingMargin = new decimal_js_1.Decimal(delivery.marketingMargin);
        const dealerMargin = new decimal_js_1.Decimal(delivery.dealerMargin);
        const totalMargins = primaryDistributionMargin.plus(marketingMargin).plus(dealerMargin);
        // Calculate subtotal (base value + margins)
        const subtotal = baseValue.plus(totalMargins);
        // Calculate VAT
        const vatAmount = subtotal.mul(this.GHANA_VAT_RATE);
        // Total amount
        const totalAmount = subtotal.plus(vatAmount);
        return {
            baseValue: baseValue.toNumber(),
            primaryDistributionMargin: primaryDistributionMargin.toNumber(),
            marketingMargin: marketingMargin.toNumber(),
            dealerMargin: dealerMargin.toNumber(),
            totalMargins: totalMargins.toNumber(),
            subtotal: subtotal.toNumber(),
            vatAmount: vatAmount.toNumber(),
            total: totalAmount.toNumber(),
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
    async buildEnhancedARInvoice(delivery, customer, dealerInfo, invoiceNumber, invoiceDate, dueDate, amounts, request) {
        // Build line items
        const lineItems = await this.buildEnhancedLineItems(delivery, amounts);
        // Build margin breakdown
        const marginBreakdown = this.buildMarginBreakdown(delivery, amounts);
        // Build IFRS data
        const ifrsData = this.buildIFRSData(delivery, amounts);
        // Initialize audit trail
        const auditTrail = [{
                action: 'CREATED',
                performedBy: request.generatedBy,
                performedAt: new Date(),
                details: `Invoice created from delivery ${delivery.deliveryNumber}`,
            }];
        return {
            tenantId: delivery.tenantId,
            customerId: delivery.customerId,
            invoiceNumber,
            invoiceDate,
            dueDate,
            currency: delivery.currency,
            subtotal: amounts.subtotal,
            taxAmount: amounts.vatAmount,
            totalAmount: amounts.total,
            outstandingAmount: amounts.total,
            sourceDocumentType: 'DAILY_DELIVERY',
            sourceDocumentId: delivery.id,
            referenceNumber: delivery.deliveryNumber,
            vatAmount: amounts.vatAmount,
            dealerMarginAmount: amounts.totalMargins,
            uppfLevyAmount: delivery.unifiedPetroleumPriceFundLevy,
            revenueRecognitionDate: delivery.revenueRecognitionDate || invoiceDate,
            status: 'DRAFT',
            approvalRequired: request.approvalRequired,
            lineItems,
            marginBreakdown,
            dealerInfo,
            ifrsData,
            auditTrail,
            createdBy: request.generatedBy,
        };
    }
    async buildEnhancedLineItems(delivery, amounts) {
        const lineItems = [];
        // Main product line
        const revenueAccount = this.accountMappingService.getRevenueAccountByProduct(delivery.productType);
        const revenueAccountInfo = await this.getAccountInfo(revenueAccount);
        const unitPriceWithMargins = amounts.subtotal / delivery.quantityLitres;
        lineItems.push({
            lineNumber: 1,
            description: `${delivery.productType} - ${delivery.quantityLitres}L delivered to ${delivery.customerName}`,
            quantity: delivery.quantityLitres,
            unitOfMeasure: 'LITRES',
            unitPrice: unitPriceWithMargins,
            lineTotal: amounts.subtotal,
            accountCode: revenueAccount,
            accountName: revenueAccountInfo?.accountName || 'Fuel Sales Revenue',
            productType: delivery.productType,
            customerId: delivery.customerId,
            dealerMargin: amounts.dealerMargin,
            uppfLevy: delivery.unifiedPetroleumPriceFundLevy,
            qualitySpecs: {
                density: delivery.densityAtDischarge,
                temperature: delivery.temperatureAtDischarge,
                netStandardVolume: delivery.netStandardVolume,
                volumeCorrectionFactor: delivery.volumeCorrectionFactor,
                qualityGrade: delivery.productType,
                testCertificateUrl: delivery.qualityCertificateUrl,
            },
            ifrsAllocation: {
                performanceObligationId: 'FUEL_DELIVERY',
                allocatedAmount: amounts.subtotal,
                satisfactionDate: delivery.actualDeliveryTime,
                deferredRevenueAmount: 0,
            },
        });
        // VAT line
        if (amounts.vatAmount > 0) {
            lineItems.push({
                lineNumber: 2,
                description: 'VAT (12.5%)',
                quantity: 1,
                unitOfMeasure: 'EACH',
                unitPrice: amounts.vatAmount,
                lineTotal: amounts.vatAmount,
                accountCode: '2210', // VAT Payable
                accountName: 'VAT Payable',
                taxCode: 'VAT_STANDARD',
                taxAmount: amounts.vatAmount,
            });
        }
        return lineItems;
    }
    buildMarginBreakdown(delivery, amounts) {
        const marginBreakdown = [];
        const marginMappings = this.accountMappingService.getMarginAccountMappings();
        if (amounts.primaryDistributionMargin > 0) {
            const mapping = marginMappings.find(m => m.marginType === 'PRIMARY_DISTRIBUTION');
            marginBreakdown.push({
                marginType: 'PRIMARY_DISTRIBUTION',
                marginName: 'Primary Distribution Margin',
                marginRate: amounts.primaryDistributionMargin / amounts.baseValue,
                baseAmount: amounts.baseValue,
                marginAmount: amounts.primaryDistributionMargin,
                accountCode: mapping?.accountCode || '4210',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            });
        }
        if (amounts.marketingMargin > 0) {
            const mapping = marginMappings.find(m => m.marginType === 'MARKETING');
            marginBreakdown.push({
                marginType: 'MARKETING',
                marginName: 'Marketing Margin',
                marginRate: amounts.marketingMargin / amounts.baseValue,
                baseAmount: amounts.baseValue,
                marginAmount: amounts.marketingMargin,
                accountCode: mapping?.accountCode || '4220',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            });
        }
        if (amounts.dealerMargin > 0) {
            const mapping = marginMappings.find(m => m.marginType === 'DEALER');
            marginBreakdown.push({
                marginType: 'DEALER',
                marginName: 'Dealer Margin',
                marginRate: amounts.dealerMargin / amounts.baseValue,
                baseAmount: amounts.baseValue,
                marginAmount: amounts.dealerMargin,
                accountCode: mapping?.accountCode || '4230',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            });
        }
        return marginBreakdown;
    }
    buildIFRSData(delivery, amounts) {
        return {
            performanceObligations: [{
                    obligationId: 'FUEL_DELIVERY',
                    description: 'Deliver fuel to customer location',
                    satisfactionMethod: 'DELIVERY',
                    allocationAmount: amounts.total,
                    satisfiedDate: delivery.actualDeliveryTime,
                    percentComplete: 100,
                }],
            revenueRecognitionPattern: 'POINT_IN_TIME',
            contractModifications: [],
            variableConsideration: {
                bonusAmount: 0,
                penaltyAmount: 0,
                discountAmount: 0,
                probabilityWeightedAmount: amounts.total,
                constraintAmount: 0,
            },
        };
    }
    async submitForApproval(invoice, userId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/approval/workflows/customer-invoice', {
                invoiceData: invoice,
                submittedBy: userId,
                workflowType: 'CUSTOMER_INVOICE_APPROVAL',
            }));
            return response.data.workflowId;
        }
        catch (error) {
            this.logger.error('Failed to submit invoice for approval:', error);
            throw new common_1.BadRequestException('Failed to submit invoice for approval');
        }
    }
    async createEnhancedARInvoice(invoiceData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/ar-invoices/enhanced', invoiceData));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create enhanced AR invoice:', error);
            throw new common_1.BadRequestException('Failed to create customer invoice');
        }
    }
    async generateEnhancedDeliveryJournalEntry(invoice, delivery, amounts, userId) {
        try {
            // Determine station type for customer invoices (DODO/Others for immediate sales)
            const stationType = delivery.stationType || 'DODO'; // Default to DODO for customer invoices
            // Use the enhanced delivery journal entry system
            const deliveryJournalData = {
                deliveryId: delivery.id,
                stationType: stationType,
                productType: delivery.productType,
                quantity: delivery.quantityLitres,
                unitPrice: delivery.unitPrice,
                totalValue: amounts.baseValue,
                customerId: delivery.customerId,
                stationId: delivery.dischargeTerminal || delivery.customerId,
                taxBreakdown: {
                    petroleumTax: 0, // Not applicable for customer sales
                    energyFundLevy: 0,
                    roadFundLevy: 0,
                    priceStabilizationLevy: 0,
                    uppfLevy: 0,
                    vat: amounts.vatAmount,
                    customsDuty: 0,
                },
                margins: {
                    primaryDistribution: amounts.primaryDistributionMargin,
                    marketing: amounts.marketingMargin,
                    dealer: amounts.dealerMargin,
                },
                deliveryDate: invoice.invoiceDate,
                tenantId: delivery.tenantId,
            };
            // Call the automated posting service to handle the journal entries
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/automated-posting/delivery-journal-entries', deliveryJournalData));
            // Emit event to trigger real-time dashboard updates
            this.eventEmitter.emit('delivery.ready_for_accounting', deliveryJournalData);
            // Emit IFRS compliance event for revenue recognition
            this.eventEmitter.emit('ifrs.revenue_recognition.triggered', {
                deliveryId: delivery.id,
                invoiceId: invoice.id,
                revenueAmount: amounts.subtotal,
                recognitionDate: delivery.actualDeliveryTime || invoice.invoiceDate,
                ifrsData: invoice.ifrsData,
            });
            this.logger.log(`Created enhanced delivery journal entries for customer invoice ${invoice.invoiceNumber}`);
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
            description: `Customer invoice - ${delivery.deliveryNumber}`,
            journalType: 'SALES_INVOICE',
            sourceModule: 'DAILY_DELIVERY',
            sourceDocumentType: 'CUSTOMER_INVOICE',
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
        journalEntry.lines = this.accountMappingService.buildCustomerInvoiceJournalLines(delivery.productType, amounts.subtotal, amounts.vatAmount, {
            primary_distribution: amounts.primaryDistributionMargin,
            marketing: amounts.marketingMargin,
            dealer: amounts.dealerMargin,
        }, delivery.customerId);
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
        const newStatus = delivery.supplierInvoiceId ? daily_delivery_entity_1.DeliveryStatus.COMPLETED : daily_delivery_entity_1.DeliveryStatus.INVOICED_CUSTOMER;
        await queryRunner.manager.update(daily_delivery_entity_1.DailyDelivery, delivery.id, {
            customerInvoiceId: invoice.id,
            customerInvoiceNumber: invoice.invoiceNumber,
            status: newStatus,
            updatedAt: new Date(),
        });
    }
    async updateCustomerBalance(queryRunner, customer, invoiceAmount) {
        const newBalance = customer.currentBalance + invoiceAmount;
        const newAvailableCredit = Math.max(0, customer.creditLimit - newBalance);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`/accounting/customers/${customer.id}/balance`, {
                currentBalance: newBalance,
                availableCredit: newAvailableCredit,
            }));
        }
        catch (error) {
            this.logger.error('Failed to update customer balance:', error);
            // Don't throw error as invoice is already created
        }
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
                case 'CUSTOMER':
                    key = delivery.customerId;
                    break;
                case 'DATE':
                    key = (0, date_fns_1.format)(delivery.deliveryDate, 'yyyy-MM-dd');
                    break;
                case 'PRODUCT_TYPE':
                    key = delivery.productType;
                    break;
                case 'STATION':
                    key = delivery.dischargeTerminal || 'UNKNOWN';
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
    async generateClaimId() {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        return `UPPF-${year}-${timestamp}`;
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
};
exports.EnhancedCustomerInvoiceService = EnhancedCustomerInvoiceService;
exports.EnhancedCustomerInvoiceService = EnhancedCustomerInvoiceService = EnhancedCustomerInvoiceService_1 = __decorate([
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
], EnhancedCustomerInvoiceService);
//# sourceMappingURL=enhanced-customer-invoice.service.js.map