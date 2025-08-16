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
var PricingWindowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingWindowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const pricing_window_entity_1 = require("../pricing/entities/pricing-window.entity");
const station_price_entity_1 = require("../pricing/entities/station-price.entity");
const price_calculation_service_1 = require("../price-buildup/price-calculation.service");
let PricingWindowService = PricingWindowService_1 = class PricingWindowService {
    pricingWindowRepository;
    stationPriceRepository;
    priceCalculationService;
    logger = new common_1.Logger(PricingWindowService_1.name);
    // Ghana bi-weekly pricing window schedule (every 2 weeks)
    WINDOW_DURATION_DAYS = 14;
    SUBMISSION_LEAD_DAYS = 2;
    constructor(pricingWindowRepository, stationPriceRepository, priceCalculationService) {
        this.pricingWindowRepository = pricingWindowRepository;
        this.stationPriceRepository = stationPriceRepository;
        this.priceCalculationService = priceCalculationService;
    }
    /**
     * Create a new pricing window manually
     */
    async createPricingWindow(dto) {
        this.logger.log(`Creating pricing window ${dto.year}-${dto.windowNumber.toString().padStart(2, '0')}`);
        // Validate window dates
        await this.validateWindowDates(dto.startDate, dto.endDate, dto.year, dto.windowNumber);
        // Generate window ID
        const windowId = this.generateWindowId(dto.year, dto.windowNumber);
        // Check for duplicate windows
        const existingWindow = await this.pricingWindowRepository.findOne({
            where: { windowId }
        });
        if (existingWindow) {
            throw new common_1.BadRequestException(`Pricing window ${windowId} already exists`);
        }
        // Create the window
        const newWindow = this.pricingWindowRepository.create({
            windowId,
            windowNumber: dto.windowNumber,
            year: dto.year,
            startDate: dto.startDate,
            endDate: dto.endDate,
            submissionDeadline: dto.submissionDeadline,
            npaGuidelineDocId: dto.npaGuidelineDocId,
            status: 'DRAFT',
            approvalStatus: 'PENDING',
            createdBy: dto.createdBy
        });
        const savedWindow = await this.pricingWindowRepository.save(newWindow);
        this.logger.log(`Pricing window ${windowId} created successfully`);
        return savedWindow;
    }
    /**
     * Automated bi-weekly pricing window creation
     * Runs every Monday at 6:00 AM Ghana Time
     */
    async createBiWeeklyWindow() {
        this.logger.log('Starting automated bi-weekly window creation');
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            // Calculate window number based on current date
            const windowNumber = this.calculateWindowNumber(currentDate);
            // Calculate window dates (current window starts today)
            const startDate = new Date(currentDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + this.WINDOW_DURATION_DAYS - 1);
            endDate.setHours(23, 59, 59, 999);
            // Submission deadline is 2 days before window end
            const submissionDeadline = new Date(endDate);
            submissionDeadline.setDate(submissionDeadline.getDate() - this.SUBMISSION_LEAD_DAYS);
            submissionDeadline.setHours(17, 0, 0, 0); // 5 PM deadline
            // Check if window already exists
            const windowId = this.generateWindowId(year, windowNumber);
            const existingWindow = await this.pricingWindowRepository.findOne({
                where: { windowId }
            });
            if (existingWindow) {
                this.logger.log(`Window ${windowId} already exists, skipping creation`);
                return existingWindow;
            }
            // Close previous active window
            await this.closePreviousWindow();
            // Create new window
            const newWindow = await this.createPricingWindow({
                windowNumber,
                year,
                startDate,
                endDate,
                submissionDeadline,
                createdBy: 'SYSTEM_AUTOMATED'
            });
            // Auto-calculate prices for new window
            await this.calculateAndPublishPrices(newWindow.windowId, 'SYSTEM_AUTOMATED');
            this.logger.log(`Automated window creation completed: ${windowId}`);
            return newWindow;
        }
        catch (error) {
            this.logger.error('Automated window creation failed:', error);
            throw error;
        }
    }
    /**
     * Calculate and publish prices for a pricing window
     */
    async calculateAndPublishPrices(windowId, publishedBy, overrides) {
        this.logger.log(`Calculating and publishing prices for window: ${windowId}`);
        // Calculate prices using price calculation service
        const priceResults = await this.priceCalculationService.calculatePricesForWindow(windowId, overrides);
        if (!priceResults.isValid) {
            throw new common_1.BadRequestException(`Price calculation failed: ${priceResults.validationErrors.join(', ')}`);
        }
        // Get all active stations
        const activeStations = await this.getActiveStations();
        let totalStationsUpdated = 0;
        // Publish prices to each station for each product
        for (const station of activeStations) {
            for (const product of priceResults.products) {
                await this.publishStationPrice({
                    stationId: station.id,
                    productId: product.productCode,
                    windowId,
                    exPumpPrice: product.exPumpPrice,
                    exRefineryPrice: product.exRefineryPrice,
                    totalTaxesLevies: product.totalTaxesLevies,
                    totalRegulatoryMargins: product.totalRegulatoryMargins,
                    omcMargin: product.omcMargin,
                    dealerMargin: product.dealerMargin,
                    calcBreakdownJson: product.components,
                    publishedDate: new Date()
                });
            }
            totalStationsUpdated++;
        }
        // Update window status to ACTIVE
        await this.pricingWindowRepository.update({ windowId }, {
            status: 'ACTIVE',
            publishedAt: new Date()
        });
        this.logger.log(`Prices published to ${totalStationsUpdated} stations for window ${windowId}`);
        return {
            windowId,
            totalStationsUpdated,
            priceResults
        };
    }
    /**
     * Transition from current window to next window
     */
    async transitionWindow(currentWindowId, nextWindowId) {
        this.logger.log(`Transitioning from window ${currentWindowId} to ${nextWindowId}`);
        const [currentWindow, nextWindow] = await Promise.all([
            this.pricingWindowRepository.findOne({ where: { windowId: currentWindowId } }),
            this.pricingWindowRepository.findOne({ where: { windowId: nextWindowId } })
        ]);
        if (!currentWindow || !nextWindow) {
            throw new common_1.BadRequestException('Invalid window IDs for transition');
        }
        // Close current window
        currentWindow.status = 'CLOSED';
        await this.pricingWindowRepository.save(currentWindow);
        // Activate next window
        nextWindow.status = 'ACTIVE';
        await this.pricingWindowRepository.save(nextWindow);
        // Calculate price changes between windows
        const priceChanges = await this.priceCalculationService.comparePriceWindows(nextWindowId, currentWindowId);
        // Count impacted stations
        const impactedStations = await this.stationPriceRepository.count({
            where: { windowId: nextWindowId }
        });
        const transitionResult = {
            previousWindow: currentWindow,
            newWindow: nextWindow,
            transitionDate: new Date(),
            impactedStations,
            priceChanges: priceChanges.productComparisons
        };
        this.logger.log(`Window transition completed: ${impactedStations} stations impacted`);
        return transitionResult;
    }
    /**
     * Get current active pricing window
     */
    async getCurrentActiveWindow() {
        return await this.pricingWindowRepository.findOne({
            where: {
                status: 'ACTIVE',
                startDate: (0, typeorm_2.Between)(new Date(Date.now() - 86400000), new Date()),
                endDate: (0, typeorm_2.Between)(new Date(), new Date(Date.now() + 86400000 * 14))
            },
            order: { startDate: 'DESC' }
        });
    }
    /**
     * Get pricing windows within a date range
     */
    async getWindowsInDateRange(startDate, endDate) {
        return await this.pricingWindowRepository.find({
            where: {
                startDate: (0, typeorm_2.Between)(startDate, endDate)
            },
            order: { startDate: 'ASC' }
        });
    }
    /**
     * Get window summary with statistics
     */
    async getWindowSummary(windowId) {
        const window = await this.pricingWindowRepository.findOne({
            where: { windowId }
        });
        if (!window) {
            throw new common_1.BadRequestException(`Pricing window ${windowId} not found`);
        }
        // Get station statistics
        const stationStats = await this.stationPriceRepository
            .createQueryBuilder('sp')
            .select('COUNT(DISTINCT sp.stationId)', 'publishedStations')
            .where('sp.windowId = :windowId', { windowId })
            .getRawOne();
        // Calculate average price change (compared to previous window)
        let averagePriceChange = 0;
        const previousWindow = await this.getPreviousWindow(window);
        if (previousWindow) {
            const comparison = await this.priceCalculationService.comparePriceWindows(windowId, previousWindow.windowId);
            averagePriceChange = comparison.productComparisons.reduce((sum, comp) => sum + comp.percentageChange, 0) / comparison.productComparisons.length;
        }
        return {
            windowId: window.windowId,
            windowNumber: window.windowNumber,
            year: window.year,
            status: window.status,
            startDate: window.startDate,
            endDate: window.endDate,
            totalStations: await this.getTotalActiveStationsCount(),
            publishedStations: parseInt(stationStats.publishedStations) || 0,
            totalClaimsValue: await this.getTotalClaimsValue(windowId),
            averagePriceChange: Math.round(averagePriceChange * 100) / 100
        };
    }
    /**
     * Archive old pricing windows
     */
    async archiveOldWindows(olderThanDays = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.pricingWindowRepository
            .createQueryBuilder()
            .update(pricing_window_entity_1.PricingWindow)
            .set({ status: 'ARCHIVED' })
            .where('endDate < :cutoffDate', { cutoffDate })
            .andWhere('status != :status', { status: 'ARCHIVED' })
            .execute();
        this.logger.log(`Archived ${result.affected} pricing windows older than ${olderThanDays} days`);
        return result.affected || 0;
    }
    // Private helper methods
    generateWindowId(year, windowNumber) {
        return `${year}-W${windowNumber.toString().padStart(2, '0')}`;
    }
    calculateWindowNumber(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return Math.ceil(dayOfYear / this.WINDOW_DURATION_DAYS);
    }
    async validateWindowDates(startDate, endDate, year, windowNumber) {
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        if (startDate.getFullYear() !== year) {
            throw new common_1.BadRequestException('Start date year must match window year');
        }
        // Check for overlapping windows
        const overlapping = await this.pricingWindowRepository
            .createQueryBuilder('pw')
            .where('pw.year = :year', { year })
            .andWhere('pw.windowNumber != :windowNumber', { windowNumber })
            .andWhere('(pw.startDate BETWEEN :startDate AND :endDate) OR ' +
            '(pw.endDate BETWEEN :startDate AND :endDate) OR ' +
            '(pw.startDate <= :startDate AND pw.endDate >= :endDate)', { startDate, endDate })
            .getOne();
        if (overlapping) {
            throw new common_1.BadRequestException(`Window dates overlap with existing window ${overlapping.windowId}`);
        }
    }
    async closePreviousWindow() {
        await this.pricingWindowRepository
            .createQueryBuilder()
            .update(pricing_window_entity_1.PricingWindow)
            .set({ status: 'CLOSED' })
            .where('status = :status', { status: 'ACTIVE' })
            .execute();
    }
    async publishStationPrice(priceData) {
        await this.stationPriceRepository.save(this.stationPriceRepository.create(priceData));
    }
    async getActiveStations() {
        // This would typically query the stations service
        // For now, returning mock data structure
        return [
            { id: 'STATION-001' },
            { id: 'STATION-002' }
            // In real implementation, fetch from stations service
        ];
    }
    async getTotalActiveStationsCount() {
        // Mock implementation - would integrate with stations service
        return 150;
    }
    async getTotalClaimsValue(windowId) {
        // Mock implementation - would integrate with UPPF claims service
        return 0;
    }
    async getPreviousWindow(currentWindow) {
        return await this.pricingWindowRepository.findOne({
            where: {
                year: currentWindow.year,
                windowNumber: currentWindow.windowNumber - 1
            }
        });
    }
};
exports.PricingWindowService = PricingWindowService;
__decorate([
    (0, schedule_1.Cron)('0 6 * * 1', {
        timeZone: 'Africa/Accra'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricingWindowService.prototype, "createBiWeeklyWindow", null);
exports.PricingWindowService = PricingWindowService = PricingWindowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pricing_window_entity_1.PricingWindow)),
    __param(1, (0, typeorm_1.InjectRepository)(station_price_entity_1.StationPrice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        price_calculation_service_1.PriceCalculationService])
], PricingWindowService);
//# sourceMappingURL=pricing-window.service.js.map