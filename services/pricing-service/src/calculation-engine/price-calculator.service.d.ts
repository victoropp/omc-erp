import { Repository } from 'typeorm';
import { PBUComponent } from '../pbu-components/entities/pbu-component.entity';
import { PBUComponentCategory, PBUComponentUnit } from '@omc-erp/shared-types';
export interface PriceCalculationInput {
    tenantId: string;
    productId: string;
    windowId: string;
    effectiveDate: Date;
    exRefineryPrice: number;
    overrides?: Array<{
        componentCode: string;
        value: number;
        reason?: string;
    }>;
}
export interface PriceCalculationResult {
    exPumpPrice: number;
    components: Array<{
        code: string;
        name: string;
        category: PBUComponentCategory;
        value: number;
        unit: PBUComponentUnit;
        isOverridden?: boolean;
        overrideReason?: string;
    }>;
    sourceDocuments: string[];
    calculationTimestamp: Date;
}
export declare class PriceCalculatorService {
    private readonly pbuComponentRepository;
    private readonly logger;
    constructor(pbuComponentRepository: Repository<PBUComponent>);
    /**
     * Calculate ex-pump price using the NPA PBU formula:
     * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
     */
    calculatePrice(input: PriceCalculationInput): Promise<PriceCalculationResult>;
    /**
     * Validate price calculation by checking against business rules
     */
    validateCalculation(result: PriceCalculationResult): Promise<{
        isValid: boolean;
        warnings: string[];
        errors: string[];
    }>;
    /**
     * Get PBU components snapshot for a specific window (for audit)
     */
    getComponentsSnapshot(tenantId: string, windowId: string, effectiveDate: Date): Promise<PBUComponent[]>;
    private getActiveComponents;
    private groupComponentsByCategory;
    private addComponentsToPrice;
    /**
     * Calculate dealer margin for a specific window and product
     */
    getDealerMarginRate(tenantId: string, productId: string, windowId: string): Promise<number>;
}
//# sourceMappingURL=price-calculator.service.d.ts.map