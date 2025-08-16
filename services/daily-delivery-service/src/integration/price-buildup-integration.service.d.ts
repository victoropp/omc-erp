import { HttpService } from '@nestjs/axios';
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
        supplierCost: number;
        inventoryCost: number;
        sellingPriceExclTax: number;
        sellingPriceInclTax: number;
        customerPrice: number;
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
export declare class PriceBuildupIntegrationService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    /**
     * Fetch price build-up components from pricing service
     */
    fetchPriceBuildupComponents(request: PriceBuildupRequest): Promise<PriceBuildupResponse>;
    /**
     * Store price build-up snapshot for audit and historical tracking
     */
    storePriceBuildupSnapshot(deliveryId: string, priceBuildupResponse: PriceBuildupResponse): Promise<void>;
    /**
     * Validate price build-up against current NPA templates
     */
    validateAginstNPATemplate(priceBuildupResponse: PriceBuildupResponse): Promise<{
        isValid: boolean;
        deviations: string[];
        warnings: string[];
    }>;
    /**
     * Calculate dealer margin accruals based on price build-up
     */
    calculateDealerMarginAccrual(deliveryId: string, priceBuildupResponse: PriceBuildupResponse, quantity: number): Promise<{
        totalAccrual: number;
        marginComponents: Array<{
            componentName: string;
            ratePerLitre: number;
            totalAmount: number;
        }>;
    }>;
    /**
     * Calculate UPPF levy claims based on price build-up
     */
    calculateUPPFClaims(deliveryId: string, priceBuildupResponse: PriceBuildupResponse, quantity: number): Promise<{
        totalUppfLevy: number;
        claimableAmount: number;
        subsidyComponents: Array<{
            componentName: string;
            ratePerLitre: number;
            totalAmount: number;
            isClaimable: boolean;
        }>;
    }>;
    /**
     * Generate mock price build-up response for fallback
     */
    private generateMockPriceBuildupResponse;
    /**
     * Get historical price build-up data for comparison
     */
    getHistoricalPriceData(productType: string, stationType: StationType, fromDate: Date, toDate: Date): Promise<PriceBuildupResponse[]>;
}
//# sourceMappingURL=price-buildup-integration.service.d.ts.map