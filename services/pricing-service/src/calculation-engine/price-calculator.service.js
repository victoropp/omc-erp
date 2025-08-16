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
var PriceCalculatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pbu_component_entity_1 = require("../pbu-components/entities/pbu-component.entity");
const shared_types_1 = require("@omc-erp/shared-types");
let PriceCalculatorService = PriceCalculatorService_1 = class PriceCalculatorService {
    pbuComponentRepository;
    logger = new common_1.Logger(PriceCalculatorService_1.name);
    constructor(pbuComponentRepository) {
        this.pbuComponentRepository = pbuComponentRepository;
    }
    /**
     * Calculate ex-pump price using the NPA PBU formula:
     * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
     */
    async calculatePrice(input) {
        this.logger.debug(`Calculating price for ${input.productId} in window ${input.windowId}`);
        // Get all active PBU components for the effective date
        const components = await this.getActiveComponents(input.tenantId, input.effectiveDate, input.productId);
        if (components.length === 0) {
            throw new common_1.BadRequestException(`No PBU components found for ${input.productId} on ${input.effectiveDate}`);
        }
        const result = {
            exPumpPrice: input.exRefineryPrice, // Start with ex-refinery price
            components: [
                {
                    code: 'EXREF',
                    name: 'Ex-Refinery Price',
                    category: shared_types_1.PBUComponentCategory.OTHER,
                    value: input.exRefineryPrice,
                    unit: shared_types_1.PBUComponentUnit.GHS_PER_LITRE,
                }
            ],
            sourceDocuments: [],
            calculationTimestamp: new Date(),
        };
        // Process each component category in order
        const componentsByCategory = this.groupComponentsByCategory(components);
        // 1. Add Taxes and Levies (EDRL, ROAD, PSRL, etc.)
        this.addComponentsToPrice(result, componentsByCategory[shared_types_1.PBUComponentCategory.LEVY] || [], input.overrides);
        // 2. Add Regulatory Margins (BOST, UPPF, Fuel Marking, Primary Distribution)
        this.addComponentsToPrice(result, componentsByCategory[shared_types_1.PBUComponentCategory.REGULATORY_MARGIN] || [], input.overrides);
        // 3. Add Distribution Margins
        this.addComponentsToPrice(result, componentsByCategory[shared_types_1.PBUComponentCategory.DISTRIBUTION_MARGIN] || [], input.overrides);
        // 4. Add OMC Margin
        this.addComponentsToPrice(result, componentsByCategory[shared_types_1.PBUComponentCategory.OMC_MARGIN] || [], input.overrides);
        // 5. Add Dealer Margin
        this.addComponentsToPrice(result, componentsByCategory[shared_types_1.PBUComponentCategory.DEALER_MARGIN] || [], input.overrides);
        // Collect source documents
        result.sourceDocuments = [...new Set(components
                .filter(c => c.sourceDocId)
                .map(c => c.sourceDocId))];
        this.logger.debug(`Calculated ex-pump price: GHS ${result.exPumpPrice.toFixed(4)} for ${input.productId}`);
        return result;
    }
    /**
     * Validate price calculation by checking against business rules
     */
    async validateCalculation(result) {
        const warnings = [];
        const errors = [];
        // Check minimum price thresholds
        if (result.exPumpPrice < 0.50) {
            errors.push('Ex-pump price below minimum threshold of GHS 0.50');
        }
        if (result.exPumpPrice > 50.00) {
            warnings.push('Ex-pump price above GHS 50.00 - please verify');
        }
        // Check component reasonableness
        const exRefinery = result.components.find(c => c.code === 'EXREF')?.value || 0;
        const totalTaxes = result.components
            .filter(c => c.category === shared_types_1.PBUComponentCategory.LEVY)
            .reduce((sum, c) => sum + c.value, 0);
        if (totalTaxes > exRefinery) {
            warnings.push('Total taxes exceed ex-refinery price - unusual but not invalid');
        }
        // Check for missing critical components
        const criticalComponents = ['EDRL', 'ROAD', 'BOST', 'UPPF'];
        const presentComponents = result.components.map(c => c.code);
        const missingCritical = criticalComponents.filter(code => !presentComponents.includes(code));
        if (missingCritical.length > 0) {
            warnings.push(`Missing critical components: ${missingCritical.join(', ')}`);
        }
        return {
            isValid: errors.length === 0,
            warnings,
            errors,
        };
    }
    /**
     * Get PBU components snapshot for a specific window (for audit)
     */
    async getComponentsSnapshot(tenantId, windowId, effectiveDate) {
        return this.pbuComponentRepository
            .createQueryBuilder('pbu')
            .where('pbu.tenantId = :tenantId', { tenantId })
            .andWhere('pbu.isActive = true')
            .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
            .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate })
            .orderBy('pbu.category', 'ASC')
            .addOrderBy('pbu.componentCode', 'ASC')
            .getMany();
    }
    async getActiveComponents(tenantId, effectiveDate, productId) {
        const query = this.pbuComponentRepository
            .createQueryBuilder('pbu')
            .where('pbu.tenantId = :tenantId', { tenantId })
            .andWhere('pbu.isActive = true')
            .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
            .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate });
        // TODO: Add product-specific component filtering if needed
        // Some components might be product-specific (e.g., LPG might have different rates)
        return query
            .orderBy('pbu.category', 'ASC')
            .addOrderBy('pbu.componentCode', 'ASC')
            .getMany();
    }
    groupComponentsByCategory(components) {
        return components.reduce((groups, component) => {
            if (!groups[component.category]) {
                groups[component.category] = [];
            }
            groups[component.category].push(component);
            return groups;
        }, {});
    }
    addComponentsToPrice(result, components, overrides) {
        components.forEach(component => {
            const override = overrides?.find(o => o.componentCode === component.componentCode);
            const value = override ? override.value : component.rateValue;
            // Handle percentage-based components
            const actualValue = component.unit === shared_types_1.PBUComponentUnit.PERCENTAGE
                ? (result.exPumpPrice * value) / 100
                : value;
            result.exPumpPrice += actualValue;
            result.components.push({
                code: component.componentCode,
                name: component.name,
                category: component.category,
                value: actualValue,
                unit: component.unit,
                isOverridden: !!override,
                overrideReason: override?.reason,
            });
        });
    }
    /**
     * Calculate dealer margin for a specific window and product
     */
    async getDealerMarginRate(tenantId, productId, windowId) {
        const effectiveDate = new Date(); // This should come from the pricing window
        const dealerMarginComponent = await this.pbuComponentRepository
            .createQueryBuilder('pbu')
            .where('pbu.tenantId = :tenantId', { tenantId })
            .andWhere('pbu.category = :category', { category: shared_types_1.PBUComponentCategory.DEALER_MARGIN })
            .andWhere('pbu.isActive = true')
            .andWhere('pbu.effectiveFrom <= :effectiveDate', { effectiveDate })
            .andWhere('(pbu.effectiveTo IS NULL OR pbu.effectiveTo >= :effectiveDate)', { effectiveDate })
            .getOne();
        return dealerMarginComponent?.rateValue || 0;
    }
};
exports.PriceCalculatorService = PriceCalculatorService;
exports.PriceCalculatorService = PriceCalculatorService = PriceCalculatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pbu_component_entity_1.PBUComponent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PriceCalculatorService);
//# sourceMappingURL=price-calculator.service.js.map