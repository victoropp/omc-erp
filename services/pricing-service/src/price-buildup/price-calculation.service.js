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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PriceCalculationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCalculationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = __importDefault(require("decimal.js"));
let PriceCalculationService = PriceCalculationService_1 = class PriceCalculationService {
    pbuComponentsRepository;
    stationPricesRepository;
    eventEmitter;
    logger = new common_1.Logger(PriceCalculationService_1.name);
    constructor(pbuComponentsRepository, stationPricesRepository, eventEmitter) {
        this.pbuComponentsRepository = pbuComponentsRepository;
        this.stationPricesRepository = stationPricesRepository;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Calculate ex-pump price for a product at a station
     * Implements the deterministic formula from blueprint:
     * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
     */
    async calculateExPumpPrice(stationId, productId, windowId) {
        this.logger.log(`Calculating ex-pump price for station ${stationId}, product ${productId}`);
        // Get all active components for the pricing window
        const components = await this.pbuComponentsRepository.find({
            where: {
                isActive: true,
                effectiveFrom: { $lte: new Date() },
                effectiveTo: { $gte: new Date() },
            },
        });
        // Get ex-refinery price (base price)
        const exRefinery = components.find(c => c.componentCode === 'EXREF');
        if (!exRefinery) {
            throw new Error('Ex-refinery price not found');
        }
        const breakdown = {
            exRefinery: exRefinery.rateValue,
            components: [],
            taxesLevies: new decimal_js_1.default(0),
            regulatoryMargins: new decimal_js_1.default(0),
            omcMargin: new decimal_js_1.default(0),
            dealerMargin: new decimal_js_1.default(0),
            total: new decimal_js_1.default(0),
        };
        // Calculate each component
        for (const component of components) {
            let componentValue = new decimal_js_1.default(0);
            if (component.unit === 'GHS_per_litre') {
                componentValue = new decimal_js_1.default(component.rateValue);
            }
            else if (component.unit === 'percentage') {
                componentValue = new decimal_js_1.default(exRefinery.rateValue)
                    .mul(component.rateValue)
                    .div(100);
            }
            // Categorize components
            switch (component.category) {
                case 'levy':
                    breakdown.taxesLevies = breakdown.taxesLevies.add(componentValue);
                    break;
                case 'regulatory_margin':
                    breakdown.regulatoryMargins = breakdown.regulatoryMargins.add(componentValue);
                    break;
                case 'omc_margin':
                    breakdown.omcMargin = componentValue;
                    break;
                case 'dealer_margin':
                    breakdown.dealerMargin = componentValue;
                    break;
            }
            breakdown.components.push({
                code: component.componentCode,
                name: component.name,
                category: component.category,
                value: componentValue.toNumber(),
                unit: component.unit,
            });
        }
        // Calculate total ex-pump price
        breakdown.total = new decimal_js_1.default(breakdown.exRefinery)
            .add(breakdown.taxesLevies)
            .add(breakdown.regulatoryMargins)
            .add(breakdown.omcMargin)
            .add(breakdown.dealerMargin);
        // Save station price
        await this.stationPricesRepository.save({
            stationId,
            productId,
            windowId,
            exPumpPrice: breakdown.total.toNumber(),
            exRefineryPrice: breakdown.exRefinery,
            totalTaxesLevies: breakdown.taxesLevies.toNumber(),
            totalRegulatoryMargins: breakdown.regulatoryMargins.toNumber(),
            omcMargin: breakdown.omcMargin.toNumber(),
            dealerMargin: breakdown.dealerMargin.toNumber(),
            calcBreakdownJson: breakdown,
            publishedDate: new Date(),
        });
        // Emit price update event
        this.eventEmitter.emit('price.calculated', {
            stationId,
            productId,
            windowId,
            exPumpPrice: breakdown.total.toNumber(),
            breakdown,
        });
        return {
            exPumpPrice: breakdown.total.toNumber(),
            breakdown,
        };
    }
    /**
     * Bulk calculate prices for all stations and products
     */
    async bulkCalculatePrices(windowId) {
        this.logger.log(`Starting bulk price calculation for window ${windowId}`);
        const stations = await this.getActiveStations();
        const products = await this.getFuelProducts();
        let successCount = 0;
        let errorCount = 0;
        for (const station of stations) {
            for (const product of products) {
                try {
                    await this.calculateExPumpPrice(station.id, product.code, windowId);
                    successCount++;
                }
                catch (error) {
                    this.logger.error(`Failed to calculate price for station ${station.id}, product ${product.code}: ${error.message}`);
                    errorCount++;
                }
            }
        }
        this.logger.log(`Bulk calculation completed. Success: ${successCount}, Errors: ${errorCount}`);
        // Emit completion event
        this.eventEmitter.emit('price.bulk.calculation.completed', {
            windowId,
            successCount,
            errorCount,
            timestamp: new Date(),
        });
    }
    /**
     * Handle component rate updates
     */
    async updateComponentRate(componentCode, newRate, effectiveFrom) {
        this.logger.log(`Updating component ${componentCode} rate to ${newRate}`);
        // End current component validity
        await this.pbuComponentsRepository.update({
            componentCode,
            isActive: true,
        }, {
            effectiveTo: effectiveFrom,
            isActive: false,
        });
        // Create new component with updated rate
        await this.pbuComponentsRepository.save({
            componentCode,
            rateValue: newRate,
            effectiveFrom,
            isActive: true,
        });
        // Trigger recalculation for affected windows
        this.eventEmitter.emit('component.rate.updated', {
            componentCode,
            newRate,
            effectiveFrom,
        });
    }
    /**
     * Validate price calculations against NPA requirements
     */
    async validatePriceCalculation(stationId, productId, windowId) {
        const errors = [];
        try {
            const price = await this.stationPricesRepository.findOne({
                where: { stationId, productId, windowId },
            });
            if (!price) {
                errors.push('Price not found');
                return { isValid: false, errors };
            }
            // Validate each component is present
            const requiredComponents = [
                'EXREF', 'ESRL', 'PSRL', 'ROAD', 'EDRL',
                'BOST', 'UPPF', 'MARK', 'PRIM', 'OMC', 'DEAL',
            ];
            const breakdown = price.calcBreakdownJson;
            for (const code of requiredComponents) {
                const component = breakdown.components.find((c) => c.code === code);
                if (!component) {
                    errors.push(`Missing required component: ${code}`);
                }
            }
            // Validate total calculation
            const recalculatedTotal = new decimal_js_1.default(breakdown.exRefinery)
                .add(breakdown.taxesLevies)
                .add(breakdown.regulatoryMargins)
                .add(breakdown.omcMargin)
                .add(breakdown.dealerMargin);
            if (!recalculatedTotal.eq(price.exPumpPrice)) {
                errors.push('Total price mismatch in calculation');
            }
            // Validate against NPA minimum/maximum thresholds
            if (price.exPumpPrice < 10 || price.exPumpPrice > 30) {
                errors.push('Price outside acceptable range (10-30 GHS/L)');
            }
            return {
                isValid: errors.length === 0,
                errors,
            };
        }
        catch (error) {
            errors.push(`Validation error: ${error.message}`);
            return { isValid: false, errors };
        }
    }
    /**
     * Generate NPA price submission
     */
    async generateNPASubmission(windowId) {
        this.logger.log(`Generating NPA submission for window ${windowId}`);
        const prices = await this.stationPricesRepository.find({
            where: { windowId },
        });
        const submission = {
            windowId,
            submissionDate: new Date(),
            omcDetails: {
                name: 'Ghana OMC Ltd',
                license: 'NPA/OMC/2025/001',
            },
            priceDetails: prices.map(price => ({
                stationId: price.stationId,
                productId: price.productId,
                exPumpPrice: price.exPumpPrice,
                breakdown: price.calcBreakdownJson,
            })),
            summary: {
                totalStations: new Set(prices.map(p => p.stationId)).size,
                averagePrices: this.calculateAveragePrices(prices),
                componentsUsed: this.extractComponentsUsed(prices),
            },
        };
        return submission;
    }
    // Helper methods
    async getActiveStations() {
        // Implement station retrieval logic
        return [];
    }
    async getFuelProducts() {
        // Return fuel products
        return [
            { code: 'PMS', name: 'Premium Motor Spirit' },
            { code: 'AGO', name: 'Automotive Gas Oil' },
            { code: 'LPG', name: 'Liquefied Petroleum Gas' },
        ];
    }
    calculateAveragePrices(prices) {
        // Calculate average prices by product
        const byProduct = {};
        for (const price of prices) {
            if (!byProduct[price.productId]) {
                byProduct[price.productId] = [];
            }
            byProduct[price.productId].push(price.exPumpPrice);
        }
        const averages = {};
        for (const [productId, productPrices] of Object.entries(byProduct)) {
            const sum = productPrices.reduce((a, b) => a + b, 0);
            averages[productId] = sum / productPrices.length;
        }
        return averages;
    }
    extractComponentsUsed(prices) {
        if (prices.length === 0)
            return [];
        // Extract unique components from first price (all should be same)
        return prices[0].calcBreakdownJson.components.map((c) => ({
            code: c.code,
            name: c.name,
            value: c.value,
        }));
    }
};
exports.PriceCalculationService = PriceCalculationService;
exports.PriceCalculationService = PriceCalculationService = PriceCalculationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)('PbuComponents')),
    __param(1, (0, typeorm_1.InjectRepository)('StationPrices')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], PriceCalculationService);
//# sourceMappingURL=price-calculation.service.js.map