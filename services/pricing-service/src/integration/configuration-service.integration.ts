import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

@Injectable()
export class ConfigurationServiceIntegration {
  private readonly logger = new Logger(ConfigurationServiceIntegration.name);
  private readonly baseUrl: string;
  private configurationCache: Map<string, { data: any; timestamp: Date }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('CONFIGURATION_SERVICE_URL') || 'http://localhost:3003';
  }

  /**
   * Get pricing configuration from configuration service
   */
  async getPricingConfiguration(): Promise<PricingConfiguration> {
    const cacheKey = 'pricing-configuration';
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log('Fetching pricing configuration from configuration service');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/pricing`)
      );

      const configuration = response.data;
      
      // Cache the result
      this.setCacheData(cacheKey, configuration);
      
      return configuration;

    } catch (error) {
      this.logger.error('Failed to fetch pricing configuration:', error);
      
      // Return default configuration as fallback
      return this.getDefaultPricingConfiguration();
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfiguration(): Promise<SystemConfiguration> {
    const cacheKey = 'system-configuration';
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log('Fetching system configuration from configuration service');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/system`)
      );

      const configuration = response.data;
      this.setCacheData(cacheKey, configuration);
      
      return configuration;

    } catch (error) {
      this.logger.error('Failed to fetch system configuration:', error);
      return this.getDefaultSystemConfiguration();
    }
  }

  /**
   * Update component rate in configuration service
   */
  async updateComponentRate(update: {
    componentCode: string;
    newRate: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    reason: string;
    updatedBy: string;
  }): Promise<void> {
    this.logger.log(`Updating component rate: ${update.componentCode} -> ${update.newRate}`);

    try {
      await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/configuration/pricing/component-rates/${update.componentCode}`, update)
      );

      // Clear related cache
      this.clearCache('pricing-configuration');
      
      this.logger.log(`Component rate updated successfully: ${update.componentCode}`);

    } catch (error) {
      this.logger.error(`Failed to update component rate ${update.componentCode}:`, error);
      throw new Error(`Component rate update failed: ${error.message}`);
    }
  }

  /**
   * Get tax rates configuration
   */
  async getTaxRates(): Promise<{
    vat: number;
    nhil: number;
    getfund: number;
    withholdingTax: number;
    esrl: number;
    psrl: number;
    roadFund: number;
    edrl: number;
  }> {
    const cacheKey = 'tax-rates';
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log('Fetching tax rates from configuration service');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/tax-rates`)
      );

      const taxRates = response.data;
      this.setCacheData(cacheKey, taxRates);
      
      return taxRates;

    } catch (error) {
      this.logger.error('Failed to fetch tax rates:', error);
      
      // Return default tax rates
      return {
        vat: 0.125,        // 12.5% VAT
        nhil: 0.025,       // 2.5% NHIL
        getfund: 0.025,    // 2.5% GETFUND
        withholdingTax: 0.075, // 7.5% WHT
        esrl: 0.20,        // GHS 0.20 per litre
        psrl: 0.16,        // GHS 0.16 per litre
        roadFund: 0.48,    // GHS 0.48 per litre
        edrl: 0.49         // GHS 0.49 per litre
      };
    }
  }

  /**
   * Get approval thresholds configuration
   */
  async getApprovalThresholds(): Promise<{
    journalEntry: number;
    loanDisbursement: number;
    dealerSettlement: number;
    uppfClaim: number;
    priceVariance: number;
  }> {
    const cacheKey = 'approval-thresholds';
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log('Fetching approval thresholds from configuration service');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/approval-thresholds`)
      );

      const thresholds = response.data;
      this.setCacheData(cacheKey, thresholds);
      
      return thresholds;

    } catch (error) {
      this.logger.error('Failed to fetch approval thresholds:', error);
      
      // Return default thresholds
      return {
        journalEntry: 5000.00,
        loanDisbursement: 50000.00,
        dealerSettlement: 10000.00,
        uppfClaim: 5000.00,
        priceVariance: 0.05  // 5%
      };
    }
  }

  /**
   * Get integration settings for external services
   */
  async getIntegrationSettings(serviceName: string): Promise<{
    enabled: boolean;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    authConfig?: any;
  } | null> {
    const cacheKey = `integration-${serviceName}`;
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log(`Fetching integration settings for: ${serviceName}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/integrations/${serviceName}`)
      );

      const settings = response.data;
      this.setCacheData(cacheKey, settings);
      
      return settings;

    } catch (error) {
      this.logger.error(`Failed to fetch integration settings for ${serviceName}:`, error);
      return null;
    }
  }

  /**
   * Update system configuration
   */
  async updateSystemConfiguration(update: {
    section: string;
    key: string;
    value: any;
    updatedBy: string;
    reason?: string;
  }): Promise<void> {
    this.logger.log(`Updating system configuration: ${update.section}.${update.key}`);

    try {
      await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/configuration/system/${update.section}/${update.key}`, update)
      );

      // Clear system configuration cache
      this.clearCache('system-configuration');
      
      this.logger.log(`System configuration updated: ${update.section}.${update.key}`);

    } catch (error) {
      this.logger.error(`Failed to update system configuration:`, error);
      throw new Error(`System configuration update failed: ${error.message}`);
    }
  }

  /**
   * Get UPPF configuration settings
   */
  async getUppfConfiguration(): Promise<{
    tariffRate: number;
    equalizationThreshold: number;
    claimSubmissionDeadline: number; // days
    autoSubmissionEnabled: boolean;
    threeWayReconciliationRequired: boolean;
    varianceTolerance: number;
  }> {
    const cacheKey = 'uppf-configuration';
    
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.logger.log('Fetching UPPF configuration from configuration service');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/configuration/uppf`)
      );

      const config = response.data;
      this.setCacheData(cacheKey, config);
      
      return config;

    } catch (error) {
      this.logger.error('Failed to fetch UPPF configuration:', error);
      
      // Return default UPPF configuration
      return {
        tariffRate: 0.0012,              // GHS 0.12 pesewas per litre per km
        equalizationThreshold: 100,       // 100 km
        claimSubmissionDeadline: 7,       // 7 days
        autoSubmissionEnabled: true,
        threeWayReconciliationRequired: true,
        varianceTolerance: 0.02           // 2%
      };
    }
  }

  /**
   * Health check for configuration service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    lastChecked: Date;
  }> {
    const startTime = Date.now();
    
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 })
      );

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastChecked: new Date()
      };

    } catch (error) {
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
  clearCache(key?: string): void {
    if (key) {
      this.configurationCache.delete(key);
      this.logger.debug(`Cache cleared for key: ${key}`);
    } else {
      this.configurationCache.clear();
      this.logger.debug('All configuration cache cleared');
    }
  }

  // Private helper methods

  private getCachedData(key: string): any | null {
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

  private setCacheData(key: string, data: any): void {
    this.configurationCache.set(key, {
      data,
      timestamp: new Date()
    });
  }

  private getDefaultPricingConfiguration(): PricingConfiguration {
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

  private getDefaultSystemConfiguration(): SystemConfiguration {
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
}