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
var ConfigurationServiceIntegration_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationServiceIntegration = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ConfigurationServiceIntegration = ConfigurationServiceIntegration_1 = class ConfigurationServiceIntegration {
    httpService;
    configService;
    logger = new common_1.Logger(ConfigurationServiceIntegration_1.name);
    baseUrl;
    configurationCache = new Map();
    CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('CONFIGURATION_SERVICE_URL') || 'http://localhost:3003';
    }
    /**
     * Get pricing configuration from configuration service
     */
    async getPricingConfiguration() {
        const cacheKey = 'pricing-configuration';
        // Check cache first
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log('Fetching pricing configuration from configuration service');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/pricing`));
            const configuration = response.data;
            // Cache the result
            this.setCacheData(cacheKey, configuration);
            return configuration;
        }
        catch (error) {
            this.logger.error('Failed to fetch pricing configuration:', error);
            // Return default configuration as fallback
            return this.getDefaultPricingConfiguration();
        }
    }
    /**
     * Get system configuration
     */
    async getSystemConfiguration() {
        const cacheKey = 'system-configuration';
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log('Fetching system configuration from configuration service');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/system`));
            const configuration = response.data;
            this.setCacheData(cacheKey, configuration);
            return configuration;
        }
        catch (error) {
            this.logger.error('Failed to fetch system configuration:', error);
            return this.getDefaultSystemConfiguration();
        }
    }
    /**
     * Update component rate in configuration service
     */
    async updateComponentRate(update) {
        this.logger.log(`Updating component rate: ${update.componentCode} -> ${update.newRate}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/configuration/pricing/component-rates/${update.componentCode}`, update));
            // Clear related cache
            this.clearCache('pricing-configuration');
            this.logger.log(`Component rate updated successfully: ${update.componentCode}`);
        }
        catch (error) {
            this.logger.error(`Failed to update component rate ${update.componentCode}:`, error);
            throw new Error(`Component rate update failed: ${error.message}`);
        }
    }
    /**
     * Get tax rates configuration
     */
    async getTaxRates() {
        const cacheKey = 'tax-rates';
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log('Fetching tax rates from configuration service');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/tax-rates`));
            const taxRates = response.data;
            this.setCacheData(cacheKey, taxRates);
            return taxRates;
        }
        catch (error) {
            this.logger.error('Failed to fetch tax rates:', error);
            // Return default tax rates
            return {
                vat: 0.125, // 12.5% VAT
                nhil: 0.025, // 2.5% NHIL
                getfund: 0.025, // 2.5% GETFUND
                withholdingTax: 0.075, // 7.5% WHT
                esrl: 0.20, // GHS 0.20 per litre
                psrl: 0.16, // GHS 0.16 per litre
                roadFund: 0.48, // GHS 0.48 per litre
                edrl: 0.49 // GHS 0.49 per litre
            };
        }
    }
    /**
     * Get approval thresholds configuration
     */
    async getApprovalThresholds() {
        const cacheKey = 'approval-thresholds';
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log('Fetching approval thresholds from configuration service');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/approval-thresholds`));
            const thresholds = response.data;
            this.setCacheData(cacheKey, thresholds);
            return thresholds;
        }
        catch (error) {
            this.logger.error('Failed to fetch approval thresholds:', error);
            // Return default thresholds
            return {
                journalEntry: 5000.00,
                loanDisbursement: 50000.00,
                dealerSettlement: 10000.00,
                uppfClaim: 5000.00,
                priceVariance: 0.05 // 5%
            };
        }
    }
    /**
     * Get integration settings for external services
     */
    async getIntegrationSettings(serviceName) {
        const cacheKey = `integration-${serviceName}`;
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log(`Fetching integration settings for: ${serviceName}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/integrations/${serviceName}`));
            const settings = response.data;
            this.setCacheData(cacheKey, settings);
            return settings;
        }
        catch (error) {
            this.logger.error(`Failed to fetch integration settings for ${serviceName}:`, error);
            return null;
        }
    }
    /**
     * Update system configuration
     */
    async updateSystemConfiguration(update) {
        this.logger.log(`Updating system configuration: ${update.section}.${update.key}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/configuration/system/${update.section}/${update.key}`, update));
            // Clear system configuration cache
            this.clearCache('system-configuration');
            this.logger.log(`System configuration updated: ${update.section}.${update.key}`);
        }
        catch (error) {
            this.logger.error(`Failed to update system configuration:`, error);
            throw new Error(`System configuration update failed: ${error.message}`);
        }
    }
    /**
     * Get UPPF configuration settings
     */
    async getUppfConfiguration() {
        const cacheKey = 'uppf-configuration';
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        this.logger.log('Fetching UPPF configuration from configuration service');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/configuration/uppf`));
            const config = response.data;
            this.setCacheData(cacheKey, config);
            return config;
        }
        catch (error) {
            this.logger.error('Failed to fetch UPPF configuration:', error);
            // Return default UPPF configuration
            return {
                tariffRate: 0.0012, // GHS 0.12 pesewas per litre per km
                equalizationThreshold: 100, // 100 km
                claimSubmissionDeadline: 7, // 7 days
                autoSubmissionEnabled: true,
                threeWayReconciliationRequired: true,
                varianceTolerance: 0.02 // 2%
            };
        }
    }
    /**
     * Health check for configuration service
     */
    async healthCheck() {
        const startTime = Date.now();
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 }));
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date()
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.warn('Configuration service health check failed:', error.message);
            return {
                status: 'unhealthy',
                responseTime,
                lastChecked: new Date()
            };
        }
    }
    /**
     * Clear configuration cache
     */
    clearCache(key) {
        if (key) {
            this.configurationCache.delete(key);
            this.logger.debug(`Cache cleared for key: ${key}`);
        }
        else {
            this.configurationCache.clear();
            this.logger.debug('All configuration cache cleared');
        }
    }
    // Private helper methods
    getCachedData(key) {
        const cached = this.configurationCache.get(key);
        if (!cached) {
            return null;
        }
        const now = new Date();
        const isExpired = (now.getTime() - cached.timestamp.getTime()) > this.CACHE_TTL;
        if (isExpired) {
            this.configurationCache.delete(key);
            return null;
        }
        return cached.data;
    }
    setCacheData(key, data) {
        this.configurationCache.set(key, {
            data,
            timestamp: new Date()
        });
    }
    getDefaultPricingConfiguration() {
        return {
            componentRates: [
                { componentCode: 'EXREF', componentName: 'Ex-Refinery Price', rateValue: 0.0, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'ESRL', componentName: 'Energy Sector Recovery Levy', rateValue: 0.20, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'PSRL', componentName: 'Price Stabilisation & Recovery Levy', rateValue: 0.16, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'ROAD', componentName: 'Road Fund Levy', rateValue: 0.48, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'BOST', componentName: 'BOST Margin', rateValue: 0.09, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'UPPF', componentName: 'UPPF Margin', rateValue: 0.10, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'OMC', componentName: 'OMC Margin', rateValue: 0.30, unit: 'GHS_per_litre', effectiveFrom: new Date() },
                { componentCode: 'DEAL', componentName: 'Dealer Margin', rateValue: 0.35, unit: 'GHS_per_litre', effectiveFrom: new Date() }
            ],
            pricingRules: {
                biWeeklyWindowEnabled: true,
                autoPublishPrices: true,
                autoSubmitUppfClaims: true,
                dealerMarginCalculationMethod: 'FIXED_RATE',
                uppfTariffRate: 0.0012,
                taxRates: {
                    vat: 0.125,
                    nhil: 0.025,
                    getfund: 0.025,
                    withholdingTax: 0.075
                }
            },
            toleranceLevels: {
                priceVariance: 0.05,
                volumeVariance: 0.02,
                claimVariance: 0.02
            },
            approvalThresholds: {
                journalEntryAmount: 5000.00,
                loanDisbursementAmount: 50000.00,
                settlementAmount: 10000.00,
                uppfClaimAmount: 5000.00
            }
        };
    }
    getDefaultSystemConfiguration() {
        return {
            integrationSettings: {
                accountingService: {
                    enabled: true,
                    baseUrl: 'http://localhost:3002',
                    timeout: 30000,
                    retryAttempts: 3
                },
                stationService: {
                    enabled: true,
                    baseUrl: 'http://localhost:3006',
                    timeout: 15000
                },
                npaIntegration: {
                    enabled: false,
                    submissionEndpoint: 'https://npa.gov.gh/api/submissions',
                    responseEndpoint: 'https://npa.gov.gh/api/responses'
                }
            },
            automationSettings: {
                scheduledJobs: [
                    { jobName: 'biWeeklyWindowCreation', cronExpression: '0 6 * * 1', enabled: true, timezone: 'Africa/Accra' },
                    { jobName: 'dailyPriceValidation', cronExpression: '0 7 * * *', enabled: true, timezone: 'Africa/Accra' },
                    { jobName: 'weeklyUppfClaimsProcessing', cronExpression: '0 14 * * 5', enabled: true, timezone: 'Africa/Accra' }
                ],
                backgroundProcessing: {
                    maxConcurrentJobs: 5,
                    jobTimeout: 300000,
                    retryAttempts: 3
                }
            },
            reportingSettings: {
                defaultReportFormat: 'PDF',
                stakeholderEmails: ['manager@omccompany.com', 'finance@omccompany.com'],
                reportSchedule: '0 8 * * *'
            }
        };
    }
};
exports.ConfigurationServiceIntegration = ConfigurationServiceIntegration;
exports.ConfigurationServiceIntegration = ConfigurationServiceIntegration = ConfigurationServiceIntegration_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], ConfigurationServiceIntegration);
//# sourceMappingURL=configuration-service.integration.js.map