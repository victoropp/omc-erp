import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { StationType } from '../daily-delivery/entities/daily-delivery.entity';

export interface PriceBuildupRequest {
  productType: string;
  stationType: StationType;
  deliveryDate: string;
  quantity: number;
  customerId?: string;
  depotId?: string;
  effectiveDate?: Date;
}

export interface PriceBuildupComponent {
  componentId: string;
  componentName: string;
  componentType: 'BASE_COST' | 'MARGIN' | 'TAX' | 'LEVY' | 'FEE';
  valuePerLitre: number;
  applicableToStationTypes: StationType[];
  isGovernmentRegulated: boolean;
  lastUpdated: Date;
  source: string;
}

export interface PriceBuildupResponse {
  productType: string;
  stationType: StationType;
  effectiveDate: Date;
  validUntil: Date;
  pricingWindowId: string;
  basePrice: number;
  components: {
    baseCost: PriceBuildupComponent;
    margins: PriceBuildupComponent[];
    taxes: PriceBuildupComponent[];
    levies: PriceBuildupComponent[];
    fees: PriceBuildupComponent[];
  };
  calculatedPrices: {
    supplierCost: number;        // What we pay supplier
    inventoryCost: number;       // Cost for inventory valuation
    sellingPriceExclTax: number; // Before government taxes
    sellingPriceInclTax: number; // Final selling price
    customerPrice: number;       // What customer pays
  };
  marginBreakdown: {
    dealerMargin: number;
    marketingMargin: number;
    transportMargin: number;
    retailMargin: number;
    totalMargin: number;
  };
  taxBreakdown: {
    petroleumTax: number;
    energyFundLevy: number;
    roadFundLevy: number;
    priceStabilizationLevy: number;
    uppfLevy: number;
    vat: number;
    totalTax: number;
  };
  metadata: {
    calculatedBy: string;
    calculatedAt: Date;
    source: 'NPA_TEMPLATE' | 'MANUAL_OVERRIDE' | 'MARKET_PRICE';
    approvalRequired: boolean;
    approvedBy?: string;
    approvalDate?: Date;
  };
}

@Injectable()
export class PriceBuildupIntegrationService {
  private readonly logger = new Logger(PriceBuildupIntegrationService.name);

  constructor(
    private readonly httpService: HttpService,
  ) {}

  /**
   * Fetch price build-up components from pricing service
   */
  async fetchPriceBuildupComponents(request: PriceBuildupRequest): Promise<PriceBuildupResponse> {
    this.logger.log(`Fetching price build-up for ${request.productType} at ${request.stationType} station`);

    try {
      const response = await firstValueFrom(
        this.httpService.post('/pricing/buildup/calculate', {
          productType: request.productType,
          stationType: request.stationType,
          deliveryDate: request.deliveryDate,
          quantity: request.quantity,
          customerId: request.customerId,
          depotId: request.depotId,
          effectiveDate: request.effectiveDate || new Date()
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch price build-up from pricing service', error);
      
      // Fall back to mock data if pricing service is unavailable
      return this.generateMockPriceBuildupResponse(request);
    }
  }

  /**
   * Store price build-up snapshot for audit and historical tracking
   */
  async storePriceBuildupSnapshot(deliveryId: string, priceBuildupResponse: PriceBuildupResponse): Promise<void> {
    this.logger.log(`Storing price build-up snapshot for delivery ${deliveryId}`);

    try {
      await firstValueFrom(
        this.httpService.post('/pricing/snapshots', {
          deliveryId,
          priceBuildupSnapshot: priceBuildupResponse,
          snapshotDate: new Date(),
          retentionPeriod: '7_YEARS' // For tax and audit compliance
        })
      );
    } catch (error) {
      this.logger.error('Failed to store price build-up snapshot', error);
      // Don't throw error as this is for audit purposes
    }
  }

  /**
   * Validate price build-up against current NPA templates
   */
  async validateAginstNPATemplate(priceBuildupResponse: PriceBuildupResponse): Promise<{
    isValid: boolean;
    deviations: string[];
    warnings: string[];
  }> {
    this.logger.log('Validating price build-up against NPA template');

    try {
      const response = await firstValueFrom(
        this.httpService.post('/pricing/npa-validation', {
          priceBuildup: priceBuildupResponse,
          validationDate: new Date()
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to validate against NPA template', error);
      return {
        isValid: false,
        deviations: ['Unable to validate against NPA template - service unavailable'],
        warnings: []
      };
    }
  }

  /**
   * Calculate dealer margin accruals based on price build-up
   */
  async calculateDealerMarginAccrual(deliveryId: string, priceBuildupResponse: PriceBuildupResponse, quantity: number): Promise<{
    totalAccrual: number;
    marginComponents: Array<{
      componentName: string;
      ratePerLitre: number;
      totalAmount: number;
    }>;
  }> {
    this.logger.log(`Calculating dealer margin accrual for delivery ${deliveryId}`);

    const marginComponents: Array<{
      componentName: string;
      ratePerLitre: number;
      totalAmount: number;
    }> = [];

    // Calculate dealer margin accruals
    if (priceBuildupResponse.marginBreakdown.dealerMargin > 0) {
      marginComponents.push({
        componentName: 'Dealer Margin',
        ratePerLitre: priceBuildupResponse.marginBreakdown.dealerMargin,
        totalAmount: priceBuildupResponse.marginBreakdown.dealerMargin * quantity
      });
    }

    if (priceBuildupResponse.marginBreakdown.marketingMargin > 0) {
      marginComponents.push({
        componentName: 'Marketing Margin',
        ratePerLitre: priceBuildupResponse.marginBreakdown.marketingMargin,
        totalAmount: priceBuildupResponse.marginBreakdown.marketingMargin * quantity
      });
    }

    if (priceBuildupResponse.marginBreakdown.transportMargin > 0) {
      marginComponents.push({
        componentName: 'Transport Margin',
        ratePerLitre: priceBuildupResponse.marginBreakdown.transportMargin,
        totalAmount: priceBuildupResponse.marginBreakdown.transportMargin * quantity
      });
    }

    const totalAccrual = marginComponents.reduce((sum, component) => sum + component.totalAmount, 0);

    return {
      totalAccrual,
      marginComponents
    };
  }

  /**
   * Calculate UPPF levy claims based on price build-up
   */
  async calculateUPPFClaims(deliveryId: string, priceBuildupResponse: PriceBuildupResponse, quantity: number): Promise<{
    totalUppfLevy: number;
    claimableAmount: number;
    subsidyComponents: Array<{
      componentName: string;
      ratePerLitre: number;
      totalAmount: number;
      isClaimable: boolean;
    }>;
  }> {
    this.logger.log(`Calculating UPPF claims for delivery ${deliveryId}`);

    const subsidyComponents: Array<{
      componentName: string;
      ratePerLitre: number;
      totalAmount: number;
      isClaimable: boolean;
    }> = [];

    // Add UPPF levy
    subsidyComponents.push({
      componentName: 'UPPF Levy',
      ratePerLitre: priceBuildupResponse.taxBreakdown.uppfLevy,
      totalAmount: priceBuildupResponse.taxBreakdown.uppfLevy * quantity,
      isClaimable: true
    });

    // Add price stabilization levy if applicable
    if (priceBuildupResponse.taxBreakdown.priceStabilizationLevy > 0) {
      subsidyComponents.push({
        componentName: 'Price Stabilization Levy',
        ratePerLitre: priceBuildupResponse.taxBreakdown.priceStabilizationLevy,
        totalAmount: priceBuildupResponse.taxBreakdown.priceStabilizationLevy * quantity,
        isClaimable: true
      });
    }

    const totalUppfLevy = priceBuildupResponse.taxBreakdown.uppfLevy * quantity;
    const claimableAmount = subsidyComponents
      .filter(component => component.isClaimable)
      .reduce((sum, component) => sum + component.totalAmount, 0);

    return {
      totalUppfLevy,
      claimableAmount,
      subsidyComponents
    };
  }

  /**
   * Generate mock price build-up response for fallback
   */
  private generateMockPriceBuildupResponse(request: PriceBuildupRequest): PriceBuildupResponse {
    const baseCost: PriceBuildupComponent = {
      componentId: 'BASE_COST_001',
      componentName: 'Base Product Cost',
      componentType: 'BASE_COST',
      valuePerLitre: 4.50,
      applicableToStationTypes: [StationType.COCO, StationType.DOCO, StationType.DODO, StationType.INDUSTRIAL, StationType.COMMERCIAL],
      isGovernmentRegulated: false,
      lastUpdated: new Date(),
      source: 'SUPPLIER_INVOICE'
    };

    const dealerMargin: PriceBuildupComponent = {
      componentId: 'MARGIN_DEALER',
      componentName: 'Dealer Margin',
      componentType: 'MARGIN',
      valuePerLitre: request.stationType === StationType.DODO ? 0.15 : 0,
      applicableToStationTypes: [StationType.DODO],
      isGovernmentRegulated: true,
      lastUpdated: new Date(),
      source: 'NPA_TEMPLATE'
    };

    const mockResponse: PriceBuildupResponse = {
      productType: request.productType,
      stationType: request.stationType,
      effectiveDate: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      pricingWindowId: `PW-${Date.now()}`,
      basePrice: 4.50,
      components: {
        baseCost: baseCost,
        margins: [dealerMargin],
        taxes: [],
        levies: [],
        fees: []
      },
      calculatedPrices: {
        supplierCost: 4.50,
        inventoryCost: 4.50,
        sellingPriceExclTax: request.stationType === StationType.DODO ? 4.65 : 4.50,
        sellingPriceInclTax: request.stationType === StationType.DODO ? 5.59 : 5.44,
        customerPrice: request.stationType === StationType.DODO ? 5.59 : 5.44
      },
      marginBreakdown: {
        dealerMargin: request.stationType === StationType.DODO ? 0.15 : 0,
        marketingMargin: 0.10,
        transportMargin: 0.05,
        retailMargin: request.stationType === StationType.DODO ? 0.18 : 0,
        totalMargin: request.stationType === StationType.DODO ? 0.48 : 0.15
      },
      taxBreakdown: {
        petroleumTax: 0.20,
        energyFundLevy: 0.05,
        roadFundLevy: 0.07,
        priceStabilizationLevy: 0.16,
        uppfLevy: 0.46,
        vat: 0,
        totalTax: 0.94
      },
      metadata: {
        calculatedBy: 'FALLBACK_SERVICE',
        calculatedAt: new Date(),
        source: 'MANUAL_OVERRIDE',
        approvalRequired: false
      }
    };

    return mockResponse;
  }

  /**
   * Get historical price build-up data for comparison
   */
  async getHistoricalPriceData(productType: string, stationType: StationType, fromDate: Date, toDate: Date): Promise<PriceBuildupResponse[]> {
    this.logger.log(`Fetching historical price data for ${productType} from ${fromDate} to ${toDate}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get('/pricing/historical', {
          params: {
            productType,
            stationType,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString()
          }
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch historical price data', error);
      return [];
    }
  }
}