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
var GhanaChartAccountsMappingService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GhanaChartAccountsMappingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let GhanaChartAccountsMappingService = GhanaChartAccountsMappingService_1 = class GhanaChartAccountsMappingService {
    httpService;
    logger = new common_1.Logger(GhanaChartAccountsMappingService_1.name);
    // Ghana-specific Chart of Accounts structure
    GHANA_CHART_OF_ACCOUNTS = [
        // ASSETS
        { accountCode: '1000', accountName: 'ASSETS', accountType: 'ASSET', category: 'HEADER', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: false },
        // Current Assets
        { accountCode: '1100', accountName: 'CURRENT ASSETS', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: false },
        { accountCode: '1110', accountName: 'Cash and Cash Equivalents', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'CASH_AND_EQUIVALENTS' },
        { accountCode: '1111', accountName: 'Petty Cash - GHS', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: false },
        { accountCode: '1112', accountName: 'Bank Account - GCB Bank', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '1113', accountName: 'Bank Account - Ecobank Ghana', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '1114', accountName: 'Mobile Money - MTN MoMo', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        // Trade Receivables
        { accountCode: '1200', accountName: 'TRADE RECEIVABLES', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'TRADE_RECEIVABLES' },
        { accountCode: '1210', accountName: 'Accounts Receivable - Customers', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true },
        { accountCode: '1215', accountName: 'Allowance for Expected Credit Losses', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'EXPECTED_CREDIT_LOSS' },
        { accountCode: '1220', accountName: 'UPPF Receivables', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'UPPF_RECEIVABLE' },
        { accountCode: '1225', accountName: 'Government Subsidies Receivable', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        // Inventory
        { accountCode: '1300', accountName: 'INVENTORY', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'INVENTORY' },
        { accountCode: '1310', accountName: 'Petrol (PMS) Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PMS_INVENTORY' },
        { accountCode: '1320', accountName: 'Diesel (AGO) Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'AGO_INVENTORY' },
        { accountCode: '1330', accountName: 'Industrial Fuel Oil (IFO) Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'IFO_INVENTORY' },
        { accountCode: '1340', accountName: 'LPG Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'LPG_INVENTORY' },
        { accountCode: '1350', accountName: 'Kerosene Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'KEROSENE_INVENTORY' },
        { accountCode: '1360', accountName: 'Lubricants Inventory', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'LUBRICANTS_INVENTORY' },
        // Contract Assets (IFRS 15)
        { accountCode: '1450', accountName: 'Contract Assets', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'CONTRACT_ASSETS' },
        { accountCode: '1455', accountName: 'Unbilled Revenue', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'UNBILLED_REVENUE' },
        // Fixed Assets
        { accountCode: '1500', accountName: 'FIXED ASSETS', accountType: 'ASSET', category: 'FIXED_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'PROPERTY_PLANT_EQUIPMENT' },
        { accountCode: '1510', accountName: 'Storage Tanks and Equipment', accountType: 'ASSET', category: 'FIXED_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '1520', accountName: 'Transportation Vehicles', accountType: 'ASSET', category: 'FIXED_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '1530', accountName: 'Filling Station Equipment', accountType: 'ASSET', category: 'FIXED_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        // LIABILITIES
        { accountCode: '2000', accountName: 'LIABILITIES', accountType: 'LIABILITY', category: 'HEADER', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: false },
        // Current Liabilities
        { accountCode: '2100', accountName: 'CURRENT LIABILITIES', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: false },
        { accountCode: '2110', accountName: 'Accounts Payable - Trade', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true },
        { accountCode: '2115', accountName: 'Accrued Expenses', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true },
        // Contract Liabilities (IFRS 15)
        { accountCode: '2120', accountName: 'Contract Liabilities', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'CONTRACT_LIABILITIES' },
        { accountCode: '2125', accountName: 'Deferred Revenue', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'DEFERRED_REVENUE' },
        // Tax Liabilities - Ghana Specific
        { accountCode: '2200', accountName: 'TAX LIABILITIES', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '2210', accountName: 'VAT Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'VAT_PAYABLE' },
        { accountCode: '2215', accountName: 'VAT Input Tax', accountType: 'ASSET', category: 'CURRENT_ASSET', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'VAT_INPUT' },
        { accountCode: '2220', accountName: 'Petroleum Tax Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PETROLEUM_TAX' },
        { accountCode: '2230', accountName: 'Energy Fund Levy Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'ENERGY_FUND_LEVY' },
        { accountCode: '2240', accountName: 'Road Fund Levy Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'ROAD_FUND_LEVY' },
        { accountCode: '2250', accountName: 'UPPF Levy Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'UPPF_LEVY' },
        { accountCode: '2260', accountName: 'Price Stabilization Levy Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PRICE_STABILIZATION_LEVY' },
        { accountCode: '2270', accountName: 'Customs Duty Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'CUSTOMS_DUTY' },
        { accountCode: '2280', accountName: 'Withholding Tax Payable', accountType: 'LIABILITY', category: 'CURRENT_LIABILITY', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'WITHHOLDING_TAX' },
        // REVENUE
        { accountCode: '4000', accountName: 'REVENUE', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: false, complianceRequired: true, ifrsCategory: 'REVENUE_FROM_CONTRACTS' },
        { accountCode: '4100', accountName: 'FUEL SALES REVENUE', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '4110', accountName: 'Petrol (PMS) Sales', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PMS_SALES' },
        { accountCode: '4120', accountName: 'Diesel (AGO) Sales', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'AGO_SALES' },
        { accountCode: '4130', accountName: 'Industrial Fuel Oil (IFO) Sales', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'IFO_SALES' },
        { accountCode: '4140', accountName: 'LPG Sales', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'LPG_SALES' },
        // Margin Revenue - Ghana Specific
        { accountCode: '4200', accountName: 'MARGIN REVENUE', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '4210', accountName: 'Primary Distribution Margin', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PRIMARY_DISTRIBUTION_MARGIN' },
        { accountCode: '4220', accountName: 'Marketing Margin', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'MARKETING_MARGIN' },
        { accountCode: '4230', accountName: 'Dealer Margin', accountType: 'REVENUE', category: 'REVENUE', normalBalance: 'CREDIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'DEALER_MARGIN' },
        // EXPENSES
        { accountCode: '5000', accountName: 'COST OF GOODS SOLD', accountType: 'EXPENSE', category: 'COST_OF_GOODS_SOLD', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true },
        { accountCode: '5100', accountName: 'FUEL PURCHASE COSTS', accountType: 'EXPENSE', category: 'COST_OF_GOODS_SOLD', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '5110', accountName: 'Petrol (PMS) Purchases', accountType: 'EXPENSE', category: 'COST_OF_GOODS_SOLD', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'PMS_PURCHASES' },
        { accountCode: '5120', accountName: 'Diesel (AGO) Purchases', accountType: 'EXPENSE', category: 'COST_OF_GOODS_SOLD', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true, taxReportingCode: 'AGO_PURCHASES' },
        // Operating Expenses
        { accountCode: '6000', accountName: 'OPERATING EXPENSES', accountType: 'EXPENSE', category: 'OPERATING_EXPENSE', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: false, complianceRequired: true },
        { accountCode: '6100', accountName: 'Transportation and Logistics', accountType: 'EXPENSE', category: 'OPERATING_EXPENSE', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '6200', accountName: 'Storage and Handling Costs', accountType: 'EXPENSE', category: 'OPERATING_EXPENSE', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
        { accountCode: '6300', accountName: 'Quality Control and Testing', accountType: 'EXPENSE', category: 'OPERATING_EXPENSE', normalBalance: 'DEBIT', isActive: true, ghanaSpecific: true, complianceRequired: true },
    ];
    // Transaction mapping templates
    TRANSACTION_MAPPINGS = [
        {
            transactionType: 'SUPPLIER_INVOICE',
            debitAccount: 'INVENTORY_BY_PRODUCT',
            creditAccount: '2110', // Accounts Payable
            taxAccounts: [
                { taxType: 'PETROLEUM_TAX', accountCode: '2220', accountName: 'Petroleum Tax Payable', isApplicable: true },
                { taxType: 'ENERGY_FUND_LEVY', accountCode: '2230', accountName: 'Energy Fund Levy Payable', isApplicable: true },
                { taxType: 'ROAD_FUND_LEVY', accountCode: '2240', accountName: 'Road Fund Levy Payable', isApplicable: true },
                { taxType: 'UPPF_LEVY', accountCode: '2250', accountName: 'UPPF Levy Payable', isApplicable: true },
                { taxType: 'VAT', accountCode: '2215', accountName: 'VAT Input Tax', isApplicable: true, rate: 0.125 },
                { taxType: 'WITHHOLDING_TAX', accountCode: '2280', accountName: 'Withholding Tax Payable', isApplicable: true, rate: 0.05 },
            ],
        },
        {
            transactionType: 'CUSTOMER_INVOICE',
            debitAccount: '1210', // Accounts Receivable
            creditAccount: 'REVENUE_BY_PRODUCT',
            taxAccounts: [
                { taxType: 'VAT', accountCode: '2210', accountName: 'VAT Payable', isApplicable: true, rate: 0.125 },
            ],
            marginAccounts: [
                { marginType: 'PRIMARY_DISTRIBUTION', accountCode: '4210', accountName: 'Primary Distribution Margin', applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE'] },
                { marginType: 'MARKETING', accountCode: '4220', accountName: 'Marketing Margin', applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE'] },
                { marginType: 'DEALER', accountCode: '4230', accountName: 'Dealer Margin', applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE'] },
            ],
        },
        {
            transactionType: 'DELIVERY_COMPLETION',
            debitAccount: '1450', // Contract Assets
            creditAccount: 'REVENUE_BY_PRODUCT',
        },
    ];
    constructor(httpService) {
        this.httpService = httpService;
    }
    /**
     * Get account mapping for specific product type
     */
    getInventoryAccountByProduct(productType) {
        const mapping = {
            'PMS': '1310',
            'AGO': '1320',
            'IFO': '1330',
            'LPG': '1340',
            'KEROSENE': '1350',
            'LUBRICANTS': '1360',
        };
        return mapping[productType] || '1300';
    }
    /**
     * Get revenue account mapping for specific product type
     */
    getRevenueAccountByProduct(productType) {
        const mapping = {
            'PMS': '4110',
            'AGO': '4120',
            'IFO': '4130',
            'LPG': '4140',
            'KEROSENE': '4150',
            'LUBRICANTS': '4160',
        };
        return mapping[productType] || '4100';
    }
    /**
     * Get cost of goods sold account mapping
     */
    getCOGSAccountByProduct(productType) {
        const mapping = {
            'PMS': '5110',
            'AGO': '5120',
            'IFO': '5130',
            'LPG': '5140',
            'KEROSENE': '5150',
            'LUBRICANTS': '5160',
        };
        return mapping[productType] || '5100';
    }
    /**
     * Get tax account mappings for Ghana petroleum industry
     */
    getTaxAccountMappings() {
        return [
            { taxType: 'PETROLEUM_TAX', accountCode: '2220', accountName: 'Petroleum Tax Payable', rate: 0.17, isApplicable: true },
            { taxType: 'ENERGY_FUND_LEVY', accountCode: '2230', accountName: 'Energy Fund Levy Payable', rate: 0.05, isApplicable: true },
            { taxType: 'ROAD_FUND_LEVY', accountCode: '2240', accountName: 'Road Fund Levy Payable', rate: 0.18, isApplicable: true },
            { taxType: 'PRICE_STABILIZATION_LEVY', accountCode: '2260', accountName: 'Price Stabilization Levy Payable', rate: 0, isApplicable: true },
            { taxType: 'UPPF_LEVY', accountCode: '2250', accountName: 'UPPF Levy Payable', rate: 0.46, isApplicable: true },
            { taxType: 'VAT', accountCode: '2210', accountName: 'VAT Payable', rate: 0.125, isApplicable: true },
            { taxType: 'WITHHOLDING_TAX', accountCode: '2280', accountName: 'Withholding Tax Payable', rate: 0.05, isApplicable: true },
            { taxType: 'CUSTOMS_DUTY', accountCode: '2270', accountName: 'Customs Duty Payable', rate: 0, isApplicable: true },
        ];
    }
    /**
     * Get margin account mappings for Ghana petroleum industry
     */
    getMarginAccountMappings() {
        return [
            {
                marginType: 'PRIMARY_DISTRIBUTION',
                accountCode: '4210',
                accountName: 'Primary Distribution Margin',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            },
            {
                marginType: 'MARKETING',
                accountCode: '4220',
                accountName: 'Marketing Margin',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            },
            {
                marginType: 'DEALER',
                accountCode: '4230',
                accountName: 'Dealer Margin',
                applicableProducts: ['PMS', 'AGO', 'IFO', 'LPG', 'KEROSENE', 'LUBRICANTS'],
            },
        ];
    }
    /**
     * Get transaction mapping for specific transaction type
     */
    getTransactionMapping(transactionType, productType, deliveryType) {
        const baseMapping = this.TRANSACTION_MAPPINGS.find(m => m.transactionType === transactionType);
        if (!baseMapping) {
            throw new Error(`No mapping found for transaction type: ${transactionType}`);
        }
        // Clone and customize mapping based on product type
        const mapping = { ...baseMapping };
        if (productType) {
            if (mapping.debitAccount === 'INVENTORY_BY_PRODUCT') {
                mapping.debitAccount = this.getInventoryAccountByProduct(productType);
            }
            if (mapping.creditAccount === 'REVENUE_BY_PRODUCT') {
                mapping.creditAccount = this.getRevenueAccountByProduct(productType);
            }
        }
        return mapping;
    }
    /**
     * Build journal entry lines for supplier invoice
     */
    buildSupplierInvoiceJournalLines(productType, subtotal, taxAmounts, costCenter, supplierId) {
        const lines = [];
        let lineNumber = 1;
        // Debit: Inventory
        lines.push({
            lineNumber: lineNumber++,
            accountCode: this.getInventoryAccountByProduct(productType),
            description: `Inventory purchase - ${productType}`,
            debitAmount: subtotal,
            creditAmount: 0,
            costCenter,
            dimension1: productType,
            dimension2: supplierId,
        });
        // Debit: Tax amounts
        const taxMappings = this.getTaxAccountMappings();
        for (const taxMapping of taxMappings) {
            const taxKey = taxMapping.taxType.toLowerCase();
            if (taxAmounts[taxKey] && taxAmounts[taxKey] > 0) {
                lines.push({
                    lineNumber: lineNumber++,
                    accountCode: taxMapping.accountCode,
                    description: taxMapping.accountName,
                    debitAmount: taxAmounts[taxKey],
                    creditAmount: 0,
                    costCenter,
                });
            }
        }
        // Credit: Accounts Payable
        const totalCredit = subtotal + Object.values(taxAmounts).reduce((sum, amount) => sum + amount, 0);
        lines.push({
            lineNumber: lineNumber++,
            accountCode: '2110', // Accounts Payable
            description: 'Supplier payable',
            debitAmount: 0,
            creditAmount: totalCredit,
            costCenter,
            dimension1: supplierId,
        });
        return lines;
    }
    /**
     * Build journal entry lines for customer invoice
     */
    buildCustomerInvoiceJournalLines(productType, subtotal, vatAmount, marginAmounts, customerId) {
        const lines = [];
        let lineNumber = 1;
        // Debit: Accounts Receivable
        const totalDebit = subtotal + vatAmount;
        lines.push({
            lineNumber: lineNumber++,
            accountCode: '1210', // Accounts Receivable
            description: 'Customer receivable',
            debitAmount: totalDebit,
            creditAmount: 0,
            dimension1: customerId,
        });
        // Credit: Revenue
        lines.push({
            lineNumber: lineNumber++,
            accountCode: this.getRevenueAccountByProduct(productType),
            description: `${productType} Sales Revenue`,
            debitAmount: 0,
            creditAmount: subtotal,
            dimension1: productType,
            dimension2: customerId,
        });
        // Credit: Margin accounts
        const marginMappings = this.getMarginAccountMappings();
        for (const marginMapping of marginMappings) {
            const marginKey = marginMapping.marginType.toLowerCase();
            if (marginAmounts[marginKey] && marginAmounts[marginKey] > 0) {
                lines.push({
                    lineNumber: lineNumber++,
                    accountCode: marginMapping.accountCode,
                    description: marginMapping.accountName,
                    debitAmount: 0,
                    creditAmount: marginAmounts[marginKey],
                });
            }
        }
        // Credit: VAT Payable
        if (vatAmount > 0) {
            lines.push({
                lineNumber: lineNumber++,
                accountCode: '2210', // VAT Payable
                description: 'VAT on Sales',
                debitAmount: 0,
                creditAmount: vatAmount,
            });
        }
        return lines;
    }
    /**
     * Validate account mapping compliance with Ghana regulations
     */
    validateGhanaCompliance(accountCode, transactionType) {
        const account = this.GHANA_CHART_OF_ACCOUNTS.find(a => a.accountCode === accountCode);
        if (!account) {
            return false;
        }
        // Check if compliance is required for this account
        if (account.complianceRequired) {
            // Perform specific compliance checks based on account type
            return this.performComplianceCheck(account, transactionType);
        }
        return true;
    }
    /**
     * Get IFRS-specific account mappings
     */
    getIFRSAccountMappings() {
        return this.GHANA_CHART_OF_ACCOUNTS.filter(account => account.ifrsCategory);
    }
    /**
     * Create full chart of accounts for Ghana OMC operations
     */
    async initializeGhanaChartOfAccounts(tenantId) {
        try {
            this.logger.log('Initializing Ghana Chart of Accounts...');
            for (const account of this.GHANA_CHART_OF_ACCOUNTS) {
                const accountData = {
                    tenantId,
                    accountCode: account.accountCode,
                    accountName: account.accountName,
                    accountType: account.accountType,
                    accountCategory: account.category,
                    normalBalance: account.normalBalance,
                    isActive: account.isActive,
                    isControlAccount: account.category === 'HEADER',
                    allowDirectPosting: account.category !== 'HEADER',
                    currencyCode: 'GHS',
                    taxReportingCode: account.taxReportingCode,
                    ifrsCategory: account.ifrsCategory,
                    ghanaSpecific: account.ghanaSpecific,
                    complianceRequired: account.complianceRequired,
                };
                await this.createChartOfAccount(accountData);
            }
            this.logger.log('Ghana Chart of Accounts initialized successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to initialize Ghana Chart of Accounts:', error);
            return false;
        }
    }
    /**
     * Get account balance with Ghana compliance validation
     */
    async getAccountBalanceWithCompliance(accountCode, asOfDate) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/accounting/chart-of-accounts/${accountCode}/balance`, {
                params: { asOfDate: asOfDate?.toISOString() },
            }));
            const balance = response.data;
            // Add Ghana-specific compliance information
            const account = this.GHANA_CHART_OF_ACCOUNTS.find(a => a.accountCode === accountCode);
            if (account?.ghanaSpecific) {
                balance.ghanaCompliance = {
                    isGhanaSpecific: true,
                    complianceRequired: account.complianceRequired,
                    taxReportingCode: account.taxReportingCode,
                    ifrsCategory: account.ifrsCategory,
                };
            }
            return balance;
        }
        catch (error) {
            this.logger.error(`Failed to get account balance for ${accountCode}:`, error);
            throw error;
        }
    }
    // Private helper methods
    async createChartOfAccount(accountData) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/accounting/chart-of-accounts', accountData));
            return response.data;
        }
        catch (error) {
            // Account might already exist, log warning but continue
            this.logger.warn(`Account ${accountData.accountCode} might already exist:`, error.message);
            return null;
        }
    }
    performComplianceCheck(account, transactionType) {
        // Implement specific Ghana compliance checks
        switch (account.taxReportingCode) {
            case 'VAT_PAYABLE':
            case 'VAT_INPUT':
                return this.validateVATCompliance(account, transactionType);
            case 'PETROLEUM_TAX':
            case 'ENERGY_FUND_LEVY':
            case 'ROAD_FUND_LEVY':
            case 'UPPF_LEVY':
                return this.validatePetroleumTaxCompliance(account, transactionType);
            default:
                return true;
        }
    }
    validateVATCompliance(account, transactionType) {
        // Implement VAT compliance validation
        return true;
    }
    validatePetroleumTaxCompliance(account, transactionType) {
        // Implement petroleum tax compliance validation
        return true;
    }
};
exports.GhanaChartAccountsMappingService = GhanaChartAccountsMappingService;
exports.GhanaChartAccountsMappingService = GhanaChartAccountsMappingService = GhanaChartAccountsMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], GhanaChartAccountsMappingService);
//# sourceMappingURL=ghana-chart-accounts-mapping.service.js.map