import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class PriceCalculationService {
    private pbuComponentsRepository;
    private stationPricesRepository;
    private eventEmitter;
    private readonly logger;
    constructor(pbuComponentsRepository: Repository<any>, stationPricesRepository: Repository<any>, eventEmitter: EventEmitter2);
    /**
     * Calculate ex-pump price for a product at a station
     * Implements the deterministic formula from blueprint:
     * ExPump = ExRefinery + Σ(Taxes_Levies) + Σ(Regulatory_Margins) + OMC_Margin + Dealer_Margin
     */
    calculateExPumpPrice(stationId: string, productId: string, windowId: string): Promise<{
        exPumpPrice: number;
        breakdown: any;
    }>;
    /**
     * Bulk calculate prices for all stations and products
     */
    bulkCalculatePrices(windowId: string): Promise<void>;
    /**
     * Handle component rate updates
     */
    updateComponentRate(componentCode: string, newRate: number, effectiveFrom: Date): Promise<void>;
    /**
     * Validate price calculations against NPA requirements
     */
    validatePriceCalculation(stationId: string, productId: string, windowId: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    /**
     * Generate NPA price submission
     */
    generateNPASubmission(windowId: string): Promise<any>;
    private getActiveStations;
    private getFuelProducts;
    private calculateAveragePrices;
    private extractComponentsUsed;
}
//# sourceMappingURL=price-calculation.service.d.ts.map