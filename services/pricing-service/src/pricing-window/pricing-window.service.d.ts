import { Repository } from 'typeorm';
import { PricingWindow } from '../pricing/entities/pricing-window.entity';
import { StationPrice } from '../pricing/entities/station-price.entity';
import { PriceCalculationService } from '../price-buildup/price-calculation.service';
export interface CreatePricingWindowDto {
    windowNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
    submissionDeadline: Date;
    npaGuidelineDocId?: string;
    createdBy: string;
}
export interface PricingWindowSummary {
    windowId: string;
    windowNumber: number;
    year: number;
    status: string;
    startDate: Date;
    endDate: Date;
    totalStations: number;
    publishedStations: number;
    totalClaimsValue: number;
    averagePriceChange: number;
}
export interface WindowTransitionResult {
    previousWindow: PricingWindow;
    newWindow: PricingWindow;
    transitionDate: Date;
    impactedStations: number;
    priceChanges: any[];
}
export declare class PricingWindowService {
    private readonly pricingWindowRepository;
    private readonly stationPriceRepository;
    private readonly priceCalculationService;
    private readonly logger;
    private readonly WINDOW_DURATION_DAYS;
    private readonly SUBMISSION_LEAD_DAYS;
    constructor(pricingWindowRepository: Repository<PricingWindow>, stationPriceRepository: Repository<StationPrice>, priceCalculationService: PriceCalculationService);
    /**
     * Create a new pricing window manually
     */
    createPricingWindow(dto: CreatePricingWindowDto): Promise<PricingWindow>;
    /**
     * Automated bi-weekly pricing window creation
     * Runs every Monday at 6:00 AM Ghana Time
     */
    createBiWeeklyWindow(): Promise<PricingWindow>;
    /**
     * Calculate and publish prices for a pricing window
     */
    calculateAndPublishPrices(windowId: string, publishedBy: string, overrides?: any[]): Promise<{
        windowId: string;
        totalStationsUpdated: number;
        priceResults: any;
    }>;
    /**
     * Transition from current window to next window
     */
    transitionWindow(currentWindowId: string, nextWindowId: string): Promise<WindowTransitionResult>;
    /**
     * Get current active pricing window
     */
    getCurrentActiveWindow(): Promise<PricingWindow | null>;
    /**
     * Get pricing windows within a date range
     */
    getWindowsInDateRange(startDate: Date, endDate: Date): Promise<PricingWindow[]>;
    /**
     * Get window summary with statistics
     */
    getWindowSummary(windowId: string): Promise<PricingWindowSummary>;
    /**
     * Archive old pricing windows
     */
    archiveOldWindows(olderThanDays?: number): Promise<number>;
    private generateWindowId;
    private calculateWindowNumber;
    private validateWindowDates;
    private closePreviousWindow;
    private publishStationPrice;
    private getActiveStations;
    private getTotalActiveStationsCount;
    private getTotalClaimsValue;
    private getPreviousWindow;
}
//# sourceMappingURL=pricing-window.service.d.ts.map