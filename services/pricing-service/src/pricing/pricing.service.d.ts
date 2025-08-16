import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PricingWindow } from './entities/pricing-window.entity';
import { StationPrice } from './entities/station-price.entity';
import { CreatePricingWindowDto } from './dto/create-pricing-window.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { PricingWindowStatus } from '@omc-erp/shared-types';
export declare class PricingService {
    private readonly pricingWindowRepository;
    private readonly stationPriceRepository;
    private readonly eventEmitter;
    constructor(pricingWindowRepository: Repository<PricingWindow>, stationPriceRepository: Repository<StationPrice>, eventEmitter: EventEmitter2);
    createPricingWindow(createPricingWindowDto: CreatePricingWindowDto, tenantId: string, userId?: string): Promise<PricingWindow>;
    findAllWindows(tenantId: string, status?: PricingWindowStatus): Promise<PricingWindow[]>;
    findWindow(windowId: string, tenantId: string): Promise<PricingWindow>;
    getActiveWindow(tenantId: string): Promise<PricingWindow | null>;
    activateWindow(windowId: string, tenantId: string, userId?: string): Promise<PricingWindow>;
    calculateStationPrice(calculatePriceDto: CalculatePriceDto, tenantId: string, userId?: string): Promise<StationPrice>;
    publishStationPrice(stationId: string, productId: string, windowId: string, tenantId: string, userId?: string): Promise<StationPrice>;
    getStationPrices(windowId: string, tenantId: string, stationId?: string, productId?: string): Promise<StationPrice[]>;
    calculateAllStationPrices(windowId: string, tenantId: string, stations: string[], products: string[], userId?: string): Promise<StationPrice[]>;
    checkExpiredWindows(): Promise<void>;
    generateNPASubmissionFile(windowId: string, tenantId: string): Promise<any>;
}
//# sourceMappingURL=pricing.service.d.ts.map