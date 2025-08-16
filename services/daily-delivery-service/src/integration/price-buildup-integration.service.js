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
var PriceBuildupIntegrationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBuildupIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const daily_delivery_entity_1 = require("../daily-delivery/entities/daily-delivery.entity");
let PriceBuildupIntegrationService = PriceBuildupIntegrationService_1 = class PriceBuildupIntegrationService {
    httpService;
    logger = new common_1.Logger(PriceBuildupIntegrationService_1.name);
    constructor(httpService) {
        this.httpService = httpService;
    }
    /**
     * Fetch price build-up components from pricing service
     */
    async fetchPriceBuildupComponents(request) {
        this.logger.log(`Fetching price build-up for ${request.productType} at ${request.stationType} station`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/pricing/buildup/calculate', {
                productType: request.productType,
                stationType: request.stationType,
                deliveryDate: request.deliveryDate,
                quantity: request.quantity,
                customerId: request.customerId,
                depotId: request.depotId,
                effectiveDate: request.effectiveDate || new Date()
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch price build-up from pricing service', error);
            // Fall back to mock data if pricing service is unavailable
            return this.generateMockPriceBuildupResponse(request);
        }
    }
    /**
     * Store price build-up snapshot for audit and historical tracking
     */
    async storePriceBuildupSnapshot(deliveryId, priceBuildupResponse) {
        this.logger.log(`Storing price build-up snapshot for delivery ${deliveryId}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post('/pricing/snapshots', {
                deliveryId,
                priceBuildupSnapshot: priceBuildupResponse,
                snapshotDate: new Date(),
                retentionPeriod: '7_YEARS' // For tax and audit compliance
            }));
        }
        catch (error) {
            this.logger.error('Failed to store price build-up snapshot', error);
            // Don't throw error as this is for audit purposes
        }
    }
    /**
     * Validate price build-up against current NPA templates
     */
    async validateAginstNPATemplate(priceBuildupResponse) {
        this.logger.log('Validating price build-up against NPA template');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/pricing/npa-validation', {
                priceBuildup: priceBuildupResponse,
                validationDate: new Date()
            }));
            return response.data;
        }
        catch (error) {
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
    async calculateDealerMarginAccrual(deliveryId, priceBuildupResponse, quantity) {
        this.logger.log(`Calculating dealer margin accrual for delivery ${deliveryId}`);
        const marginComponents = [];
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
    async calculateUPPFClaims(deliveryId, priceBuildupResponse, quantity) {
        this.logger.log(`Calculating UPPF claims for delivery ${deliveryId}`);
        const subsidyComponents = [];
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
    generateMockPriceBuildupResponse(request) {
        const baseCost = {
            componentId: 'BASE_COST_001',
            componentName: 'Base Product Cost',
            componentType: 'BASE_COST',
            valuePerLitre: 4.50,
            applicableToStationTypes: [daily_delivery_entity_1.StationType.COCO, daily_delivery_entity_1.StationType.DOCO, daily_delivery_entity_1.StationType.DODO, daily_delivery_entity_1.StationType.INDUSTRIAL, daily_delivery_entity_1.StationType.COMMERCIAL],
            isGovernmentRegulated: false,
            lastUpdated: new Date(),
            source: 'SUPPLIER_INVOICE'
        };
        const dealerMargin = {
            componentId: 'MARGIN_DEALER',
            componentName: 'Dealer Margin',
            componentType: 'MARGIN',
            valuePerLitre: request.stationType === daily_delivery_entity_1.StationType.DODO ? 0.15 : 0,
            applicableToStationTypes: [daily_delivery_entity_1.StationType.DODO],
            isGovernmentRegulated: true,
            lastUpdated: new Date(),
            source: 'NPA_TEMPLATE'
        };
        const mockResponse = {
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
                sellingPriceExclTax: request.stationType === daily_delivery_entity_1.StationType.DODO ? 4.65 : 4.50,
                sellingPriceInclTax: request.stationType === daily_delivery_entity_1.StationType.DODO ? 5.59 : 5.44,
                customerPrice: request.stationType === daily_delivery_entity_1.StationType.DODO ? 5.59 : 5.44
            },
            marginBreakdown: {
                dealerMargin: request.stationType === daily_delivery_entity_1.StationType.DODO ? 0.15 : 0,
                marketingMargin: 0.10,
                transportMargin: 0.05,
                retailMargin: request.stationType === daily_delivery_entity_1.StationType.DODO ? 0.18 : 0,
                totalMargin: request.stationType === daily_delivery_entity_1.StationType.DODO ? 0.48 : 0.15
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
    async getHistoricalPriceData(productType, stationType, fromDate, toDate) {
        this.logger.log(`Fetching historical price data for ${productType} from ${fromDate} to ${toDate}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('/pricing/historical', {
                params: {
                    productType,
                    stationType,
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString()
                }
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch historical price data', error);
            return [];
        }
    }
};
exports.PriceBuildupIntegrationService = PriceBuildupIntegrationService;
exports.PriceBuildupIntegrationService = PriceBuildupIntegrationService = PriceBuildupIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], PriceBuildupIntegrationService);
//# sourceMappingURL=price-buildup-integration.service.js.map