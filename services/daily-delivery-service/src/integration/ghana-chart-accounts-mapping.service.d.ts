import { HttpService } from '@nestjs/axios';
import { ProductGrade, DeliveryType } from '../daily-delivery/entities/daily-delivery.entity';
export interface GhanaAccountMapping {
    accountCode: string;
    accountName: string;
    accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    category: string;
    normalBalance: 'DEBIT' | 'CREDIT';
    isActive: boolean;
    ghanaSpecific: boolean;
    complianceRequired: boolean;
    taxReportingCode?: string;
    ifrsCategory?: string;
}
export interface TransactionMapping {
    transactionType: string;
    productType?: ProductGrade;
    deliveryType?: DeliveryType;
    debitAccount: string;
    creditAccount: string;
    taxAccounts?: TaxAccountMapping[];
    marginAccounts?: MarginAccountMapping[];
    complianceAccounts?: ComplianceAccountMapping[];
}
export interface TaxAccountMapping {
    taxType: 'PETROLEUM_TAX' | 'ENERGY_FUND_LEVY' | 'ROAD_FUND_LEVY' | 'PRICE_STABILIZATION_LEVY' | 'UPPF_LEVY' | 'VAT' | 'WITHHOLDING_TAX' | 'CUSTOMS_DUTY';
    accountCode: string;
    accountName: string;
    rate?: number;
    isApplicable: boolean;
}
export interface MarginAccountMapping {
    marginType: 'PRIMARY_DISTRIBUTION' | 'MARKETING' | 'DEALER';
    accountCode: string;
    accountName: string;
    applicableProducts: ProductGrade[];
}
export interface ComplianceAccountMapping {
    complianceType: 'NPA_PERMIT' | 'CUSTOMS_ENTRY' | 'ENVIRONMENTAL_PERMIT';
    accountCode: string;
    documentationRequired: boolean;
}
export declare class GhanaChartAccountsMappingService {
    private readonly httpService;
    private readonly logger;
    private readonly GHANA_CHART_OF_ACCOUNTS;
    private readonly TRANSACTION_MAPPINGS;
    constructor(httpService: HttpService);
    /**
     * Get account mapping for specific product type
     */
    getInventoryAccountByProduct(productType: ProductGrade): string;
    /**
     * Get revenue account mapping for specific product type
     */
    getRevenueAccountByProduct(productType: ProductGrade): string;
    /**
     * Get cost of goods sold account mapping
     */
    getCOGSAccountByProduct(productType: ProductGrade): string;
    /**
     * Get tax account mappings for Ghana petroleum industry
     */
    getTaxAccountMappings(): TaxAccountMapping[];
    /**
     * Get margin account mappings for Ghana petroleum industry
     */
    getMarginAccountMappings(): MarginAccountMapping[];
    /**
     * Get transaction mapping for specific transaction type
     */
    getTransactionMapping(transactionType: string, productType?: ProductGrade, deliveryType?: DeliveryType): TransactionMapping;
    /**
     * Build journal entry lines for supplier invoice
     */
    buildSupplierInvoiceJournalLines(productType: ProductGrade, subtotal: number, taxAmounts: {
        [key: string]: number;
    }, costCenter: string, supplierId: string): any[];
    /**
     * Build journal entry lines for customer invoice
     */
    buildCustomerInvoiceJournalLines(productType: ProductGrade, subtotal: number, vatAmount: number, marginAmounts: {
        [key: string]: number;
    }, customerId: string): any[];
    /**
     * Validate account mapping compliance with Ghana regulations
     */
    validateGhanaCompliance(accountCode: string, transactionType: string): boolean;
    /**
     * Get IFRS-specific account mappings
     */
    getIFRSAccountMappings(): GhanaAccountMapping[];
    /**
     * Create full chart of accounts for Ghana OMC operations
     */
    initializeGhanaChartOfAccounts(tenantId: string): Promise<boolean>;
    /**
     * Get account balance with Ghana compliance validation
     */
    getAccountBalanceWithCompliance(accountCode: string, asOfDate?: Date): Promise<any>;
    private createChartOfAccount;
    private performComplianceCheck;
    private validateVATCompliance;
    private validatePetroleumTaxCompliance;
}
//# sourceMappingURL=ghana-chart-accounts-mapping.service.d.ts.map