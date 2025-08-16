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
var CustomerInvoiceService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
const delivery_validation_service_1 = require("../daily-delivery/services/delivery-validation.service");
let CustomerInvoiceService = CustomerInvoiceService_1 = class CustomerInvoiceService {
    httpService;
    eventEmitter;
    validationService;
    logger = new common_1.Logger(CustomerInvoiceService_1.name);
    constructor(httpService, eventEmitter, validationService) {
        this.httpService = httpService;
        this.eventEmitter = eventEmitter;
        this.validationService = validationService;
    }
    async generateCustomerInvoice(delivery, generateDto) {
        try {
            // Validate delivery can be invoiced
            if (!generateDto.forceGeneration) {
                const validation = await this.validationService.validateForInvoicing(delivery);
                if (!validation.isValid) {
                    throw new common_1.BadRequestException(`Cannot generate customer invoice: ${validation.errors.join(', ')}`);
                }
            }
            // Check if already invoiced
            if (delivery.customerInvoiceId) {
                throw new common_1.BadRequestException('Customer invoice already generated for this delivery');
            }
            // Get customer information from external service
            const customer = await this.getCustomerInfo(delivery.customerId);
            if (!customer) {
                throw new common_1.BadRequestException('Customer information not found');
            }
            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber('AR', delivery.deliveryDate);
            // Calculate invoice dates
            const invoiceDate = generateDto.invoiceDate ? new Date(generateDto.invoiceDate) : (delivery.actualDeliveryTime || new Date());
            const dueDate = generateDto.dueDate ? new Date(generateDto.dueDate) : this.calculateDueDate(invoiceDate, customer.paymentTerms);
            // Calculate customer price (includes margins and taxes)
            const customerPrice = this.calculateCustomerPrice(delivery);
            const subtotal = delivery.quantityLitres * customerPrice;
            // Calculate taxes for customer
            const taxAmount = this.calculateCustomerTaxes(delivery, subtotal);
            // Calculate discount if applicable
            let discountAmount = 0;
            if (generateDto.applyDiscount && customer.discountPercentage > 0) {
                discountAmount = subtotal * (customer.discountPercentage / 100);
            }
            const totalAmount = subtotal + taxAmount - discountAmount;
            const amountDue = totalAmount;
            // Create invoice object
            const invoice = {
                tenantId: delivery.tenantId,
                customerId: delivery.customerId,
                invoiceNumber,
                invoiceDate,
                dueDate,
                currency: delivery.currency,
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                amountDue,
                sourceDocumentType: 'DAILY_DELIVERY',
                sourceDocumentId: delivery.id,
                referenceNumber: delivery.deliveryNumber,
                contractAssetAmount: delivery.contractAssetAmount,
                revenueRecognitionDate: delivery.revenueRecognitionDate || invoiceDate,
                revenueRecognitionAmount: delivery.revenueRecognitionAmount || totalAmount,
                lineItems: this.createCustomerInvoiceLineItems(delivery, customerPrice),
                status: 'DRAFT',
                createdBy: generateDto.generatedBy,
            };
            // Send to accounting service
            const createdInvoice = await this.createARInvoice(invoice);
            // Generate journal entries
            await this.generateCustomerInvoiceJournalEntries(createdInvoice, delivery, generateDto.generatedBy);
            // Update delivery with invoice information
            await this.updateDeliveryWithInvoiceInfo(delivery, createdInvoice);
            // Emit event for integration
            this.eventEmitter.emit('customer_invoice.generated', {
                deliveryId: delivery.id,
                invoiceId: createdInvoice.id,
                invoiceNumber: createdInvoice.invoiceNumber,
                customerId: delivery.customerId,
                amount: createdInvoice.totalAmount,
                tenantId: delivery.tenantId,
            });
            this.logger.log(`Customer invoice ${invoiceNumber} generated for delivery ${delivery.deliveryNumber}`);
            return createdInvoice;
        }
        catch (error) {
            this.logger.error('Failed to generate customer invoice:', error);
            throw error;
        }
    }
    async getCustomerInfo(customerId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/crm/customers/${customerId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get customer info for ${customerId}:`, error);
            return null;
        }
    }
    async generateInvoiceNumber(type, date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);
        return `${type}-${year}${month}-${timestamp}`;
    }
    calculateDueDate(invoiceDate, paymentTerms) {
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
            case 'COD':
                // Cash on delivery - same day
                break;
            case 'CIA':
                // Cash in advance - already paid
                dueDate.setDate(dueDate.getDate() - 1);
                break;
            default:
                dueDate.setDate(dueDate.getDate() + 30); // Default to 30 days
        }
        return dueDate;
    }
    calculateCustomerPrice(delivery) {
        // Customer price includes the base unit price plus all margins
        return delivery.unitPrice +
            (delivery.getTotalMargins() / delivery.quantityLitres);
    }
    calculateCustomerTaxes(delivery, subtotal) {
        const vatRate = 0.125; // 12.5% VAT in Ghana
        const nhilRate = 0.025; // 2.5% NHIL
        const getfRate = 0.025; // 2.5% GETFund
        const covidRate = 0.01; // 1% COVID-19 Health Recovery Levy
        const vatAmount = subtotal * vatRate;
        const nhilAmount = subtotal * nhilRate;
        const getfAmount = subtotal * getfRate;
        const covidAmount = subtotal * covidRate;
        return vatAmount + nhilAmount + getfAmount + covidAmount;
    }
    createCustomerInvoiceLineItems(delivery, customerPrice) {
        const lineItems = [];
        // Main delivery line
        lineItems.push({
            lineNumber: 1,
            description: `${delivery.productType} - ${delivery.quantityLitres}L delivered to ${delivery.deliveryLocation}`,
            quantity: delivery.quantityLitres,
            unitPrice: customerPrice,
            lineTotal: delivery.quantityLitres * customerPrice,
            accountCode: this.getSalesAccountCode(delivery.productType),
            costCenter: delivery.depotId,
            dimension1: delivery.productType,
            dimension2: delivery.customerId,
        });
        // Add margin lines for transparency
        if (delivery.primaryDistributionMargin > 0) {
            lineItems.push({
                lineNumber: 2,
                description: 'Primary Distribution Margin',
                quantity: 1,
                unitPrice: delivery.primaryDistributionMargin,
                lineTotal: delivery.primaryDistributionMargin,
                accountCode: '4120', // Distribution Margin Revenue
                costCenter: delivery.depotId,
            });
        }
        if (delivery.marketingMargin > 0) {
            lineItems.push({
                lineNumber: lineItems.length + 1,
                description: 'Marketing Margin',
                quantity: 1,
                unitPrice: delivery.marketingMargin,
                lineTotal: delivery.marketingMargin,
                accountCode: '4130', // Marketing Margin Revenue
                costCenter: delivery.depotId,
            });
        }
        if (delivery.dealerMargin > 0) {
            lineItems.push({
                lineNumber: lineItems.length + 1,
                description: 'Dealer Margin',
                quantity: 1,
                unitPrice: delivery.dealerMargin,
                lineTotal: delivery.dealerMargin,
                accountCode: '4140', // Dealer Margin Revenue
                costCenter: delivery.depotId,
            });
        }
        // Delivery charges if applicable
        if (delivery.deliveryType !== 'CUSTOMER_PICKUP') {
            const deliveryCharge = this.calculateDeliveryCharge(delivery);
            if (deliveryCharge > 0) {
                lineItems.push({
                    lineNumber: lineItems.length + 1,
                    description: 'Delivery Charges',
                    quantity: 1,
                    unitPrice: deliveryCharge,
                    lineTotal: deliveryCharge,
                    accountCode: '4200', // Delivery Revenue
                    costCenter: delivery.depotId,
                });
            }
        }
        return lineItems;
    }
    getSalesAccountCode(productType) {
        const accountCodes = {
            'PMS': '4010', // Petrol Sales Revenue
            'AGO': '4020', // Diesel Sales Revenue
            'IFO': '4030', // Industrial Fuel Oil Sales Revenue
            'LPG': '4040', // LPG Sales Revenue
            'KEROSENE': '4050', // Kerosene Sales Revenue
            'LUBRICANTS': '4060', // Lubricants Sales Revenue
        };
        return accountCodes[productType] || '4000'; // General Fuel Sales Revenue
    }
    getCOGSAccountCode(productType) {
        const accountCodes = {
            'PMS': '5010', // Petrol Cost of Sales
            'AGO': '5020', // Diesel Cost of Sales
            'IFO': '5030', // Industrial Fuel Oil Cost of Sales
            'LPG': '5040', // LPG Cost of Sales
            'KEROSENE': '5050', // Kerosene Cost of Sales
            'LUBRICANTS': '5060', // Lubricants Cost of Sales
        };
        return accountCodes[productType] || '5000'; // General Fuel Cost of Sales
    }
    calculateDeliveryCharge(delivery) {
        // Calculate delivery charge based on distance, volume, and delivery type
        let baseCharge = 0;
        switch (delivery.deliveryType) {
            case 'DEPOT_TO_STATION':
                baseCharge = delivery.quantityLitres * 0.02; // 2 pesewas per litre
                break;
            case 'DEPOT_TO_CUSTOMER':
                baseCharge = delivery.quantityLitres * 0.05; // 5 pesewas per litre
                break;
            case 'EMERGENCY_DELIVERY':
                baseCharge = delivery.quantityLitres * 0.10; // 10 pesewas per litre
                break;
            default:
                baseCharge = 0;
        }
        // Add distance-based charges if available
        if (delivery.distanceTravelledKm) {
            baseCharge += delivery.distanceTravelledKm * 2; // 2 GHS per km
        }
        // Weekend surcharge
        const deliveryDay = delivery.deliveryDate.getDay();
        if (deliveryDay === 0 || deliveryDay === 6) { // Sunday or Saturday
            baseCharge *= 1.5; // 50% surcharge
        }
        return Math.round(baseCharge * 100) / 100; // Round to 2 decimal places
    }
    async createARInvoice(invoice) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/ar-invoices', invoice));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create AR invoice in accounting service:', error);
            throw new common_1.BadRequestException('Failed to create customer invoice');
        }
    }
    async generateCustomerInvoiceJournalEntries(invoice, delivery, userId) {
        const journalEntry = {
            journalDate: invoice.invoiceDate,
            description: `Customer invoice for delivery ${delivery.deliveryNumber}`,
            journalType: 'SALES',
            sourceModule: 'DAILY_DELIVERY',
            sourceDocumentType: 'CUSTOMER_INVOICE',
            sourceDocumentId: invoice.id,
            createdBy: userId,
            lines: [],
        };
        // Debit: Accounts Receivable
        journalEntry.lines.push({
            accountCode: '1200', // Accounts Receivable
            description: `Customer invoice - ${delivery.customerName}`,
            debitAmount: invoice.totalAmount,
            creditAmount: 0,
            costCenter: delivery.depotId,
            dimension1: delivery.customerId,
        });
        // Credit: Sales Revenue
        journalEntry.lines.push({
            accountCode: this.getSalesAccountCode(delivery.productType),
            description: `Sales revenue - ${delivery.productType}`,
            debitAmount: 0,
            creditAmount: invoice.subtotal,
            costCenter: delivery.depotId,
            dimension1: delivery.productType,
            dimension2: delivery.customerId,
        });
        // Credit: Sales Tax if applicable
        if (invoice.taxAmount > 0) {
            journalEntry.lines.push({
                accountCode: '2150', // Sales Tax Payable
                description: 'Sales taxes collected',
                debitAmount: 0,
                creditAmount: invoice.taxAmount,
                costCenter: delivery.depotId,
            });
        }
        // Debit: Cost of Goods Sold and Credit: Inventory
        const costOfGoods = delivery.totalValue; // Original purchase cost
        journalEntry.lines.push({
            accountCode: this.getCOGSAccountCode(delivery.productType),
            description: `Cost of goods sold - ${delivery.productType}`,
            debitAmount: costOfGoods,
            creditAmount: 0,
            costCenter: delivery.depotId,
            dimension1: delivery.productType,
        });
        journalEntry.lines.push({
            accountCode: this.getInventoryAccountCode(delivery.productType),
            description: `Inventory reduction - ${delivery.productType}`,
            debitAmount: 0,
            creditAmount: costOfGoods,
            costCenter: delivery.depotId,
            dimension1: delivery.productType,
        });
        // Handle discount if applicable
        if (invoice.discountAmount > 0) {
            journalEntry.lines.push({
                accountCode: '6100', // Sales Discount
                description: 'Customer discount applied',
                debitAmount: invoice.discountAmount,
                creditAmount: 0,
                costCenter: delivery.depotId,
                dimension1: delivery.customerId,
            });
        }
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/journal-entries', journalEntry));
            this.logger.log(`Journal entry created for customer invoice ${invoice.invoiceNumber}`);
        }
        catch (error) {
            this.logger.error('Failed to create journal entry:', error);
            // Don't throw error as invoice is already created
        }
    }
    getInventoryAccountCode(productType) {
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
    async updateDeliveryWithInvoiceInfo(delivery, invoice) {
        try {
            const updateData = {
                customerInvoiceId: invoice.id,
                customerInvoiceNumber: invoice.invoiceNumber,
                status: 'INVOICED_CUSTOMER',
            };
            await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`/daily-deliveries/${delivery.id}`, updateData));
        }
        catch (error) {
            this.logger.error('Failed to update delivery with invoice info:', error);
            // Don't throw error as invoice is already created
        }
    }
    async getCustomerInvoice(invoiceId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/ar-invoices/${invoiceId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get customer invoice ${invoiceId}:`, error);
            throw new common_1.BadRequestException('Customer invoice not found');
        }
    }
    async cancelCustomerInvoice(invoiceId, reason, userId) {
        try {
            const cancelData = {
                status: 'CANCELLED',
                cancellationReason: reason,
                cancelledBy: userId,
                cancelledAt: new Date(),
            };
            await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`/accounting/ar-invoices/${invoiceId}/cancel`, cancelData));
            this.logger.log(`Customer invoice ${invoiceId} cancelled: ${reason}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel customer invoice ${invoiceId}:`, error);
            throw new common_1.BadRequestException('Failed to cancel customer invoice');
        }
    }
    async generateDeliveryReceipt(delivery) {
        try {
            const receiptData = {
                deliveryNumber: delivery.deliveryNumber,
                deliveryDate: delivery.deliveryDate,
                customerName: delivery.customerName,
                deliveryLocation: delivery.deliveryLocation,
                productType: delivery.productType,
                quantityLitres: delivery.quantityLitres,
                vehicleRegistrationNumber: delivery.vehicleRegistrationNumber,
                driverName: delivery.driverName,
                actualDeliveryTime: delivery.actualDeliveryTime,
                customerSignature: null, // To be filled by mobile app
                driverSignature: null, // To be filled by mobile app
            };
            // This would typically generate a PDF or electronic receipt
            this.logger.log(`Delivery receipt generated for delivery ${delivery.deliveryNumber}`);
            return receiptData;
        }
        catch (error) {
            this.logger.error('Failed to generate delivery receipt:', error);
            throw new common_1.BadRequestException('Failed to generate delivery receipt');
        }
    }
};
exports.CustomerInvoiceService = CustomerInvoiceService;
exports.CustomerInvoiceService = CustomerInvoiceService = CustomerInvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, event_emitter_1.EventEmitter2,
        delivery_validation_service_1.DeliveryValidationService])
], CustomerInvoiceService);
//# sourceMappingURL=customer-invoice.service.js.map