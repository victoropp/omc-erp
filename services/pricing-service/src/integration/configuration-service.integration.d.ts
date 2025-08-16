import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface PricingConfiguration {
    componentRates: Array<{
        componentCode: string;
        componentName: string;
        rateValue: number;
        unit: string;
        effectiveFrom: Date;
        effectiveTo?: Date;
    }>;
    pricingRules: {
        biWeeklyWindowEnabled: boolean;
        autoPublishPrices: boolean;
        autoSubmitUppfClaims: boolean;
        dealerMarginCalculationMethod: string;
        uppfTariffRate: number;
        taxRates: {
            vat: number;
            nhil: number;
            getfund: number;
            withholdingTax: number;
        };
    };
    toleranceLevels: {
        priceVariance: number;
        volumeVariance: number;
        claimVariance: number;
    };
    approvalThresholds: {
        journalEntryAmount: number;
        loanDisbursementAmount: number;
        settlementAmount: number;
        uppfClaimAmount: number;
    };
}
export interface SystemConfiguration {
    integrationSettings: {
        accountingService: {
            enabled: boolean;
            baseUrl: string;
            timeout: number;
            retryAttempts: number;
        };
        stationService: {
            enabled: boolean;
            baseUrl: string;
            timeout: number;
        };
        npaIntegration: {
            enabled: boolean;
            submissionEndpoint: string;
            responseEndpoint: string;
            authToken?: string;
        };
    };
    automationSettings: {
        scheduledJobs: Array<{
            jobName: string;
            cronExpression: string;
            enabled: boolean;
            timezone: string;
        }>;
        backgroundProcessing: {
            maxConcurrentJobs: number;
            jobTimeout: number;
            retryAttempts: number;
        };
    };
    reportingSettings: {
        defaultReportFormat: string;
        stakeholderEmails: string[];
        reportSchedule: string;
    };
}
export declare class ConfigurationServiceIntegration {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private configurationCache;
    private readonly CACHE_TTL;
    constructor(httpService: HttpService, configService: ConfigService);
    /**
     * Get pricing configuration from configuration service
     */
    getPricingConfiguration(): Promise<PricingConfiguration>;
    /**
     * Get system configuration
     */
    getSystemConfiguration(): Promise<SystemConfiguration>;
    /**
     * Update component rate in configuration service
     */
    updateComponentRate(update: {
        componentCode: string;
        newRate: number;
        effectiveFrom: Date;
        effectiveTo?: Date;
        reason: string;
        updatedBy: string;
    }): Promise<void>;
    /**
     * Get tax rates configuration
     */
    getTaxRates(): Promise<{
        vat: number;
        nhil: number;
        getfund: number;
        withholdingTax: number;
        esrl: number;
        psrl: number;
        roadFund: number;
        edrl: number;
    }>;
    /**
     * Get approval thresholds configuration
     */
    getApprovalThresholds(): Promise<{
        journalEntry: number;
        loanDisbursement: number;
        dealerSettlement: number;
        uppfClaim: number;
        priceVariance: number;
    }>;
    /**
     * Get integration settings for external services
     */
    getIntegrationSettings(serviceName: string): Promise<{
        enabled: boolean;
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
        authConfig?: any;
    } | null>;
    /**
     * Update system configuration
     */
    updateSystemConfiguration(update: {
        section: string;
        key: string;
        value: any;
        updatedBy: string;
        reason?: string;
    }): Promise<void>;
    /**
     * Get UPPF configuration settings
     */
    getUppfConfiguration(): Promise<{
        tariffRate: number;
        equalizationThreshold: number;
        claimSubmissionDeadline: number;
        autoSubmissionEnabled: boolean;
        threeWayReconciliationRequired: boolean;
        varianceTolerance: number;
    }>;
    /**
     * Health check for configuration service
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        lastChecked: Date;
    }>;
    /**
     * Clear configuration cache
     */
    clearCache(key?: string): void;
    private getCachedData;
    private setCacheData;
    private getDefaultPricingConfiguration;
    private getDefaultSystemConfiguration;
}
//# sourceMappingURL=configuration-service.integration.d.ts.map