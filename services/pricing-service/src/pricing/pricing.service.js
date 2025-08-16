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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const pricing_window_entity_1 = require("./entities/pricing-window.entity");
const station_price_entity_1 = require("./entities/station-price.entity");
const shared_types_1 = require("@omc-erp/shared-types");
const uuid_1 = require("uuid");
let PricingService = class PricingService {
    pricingWindowRepository;
    stationPriceRepository;
    eventEmitter;
    constructor(pricingWindowRepository, stationPriceRepository, eventEmitter) {
        this.pricingWindowRepository = pricingWindowRepository;
        this.stationPriceRepository = stationPriceRepository;
        this.eventEmitter = eventEmitter;
    }
    async createPricingWindow(createPricingWindowDto, tenantId, userId) {
        // Check if window already exists
        const existingWindow = await this.pricingWindowRepository.findOne({
            where: { windowId: createPricingWindowDto.windowId, tenantId },
        });
        if (existingWindow) {
            throw new common_1.ConflictException('Pricing window already exists');
        }
        // Validate dates
        const startDate = new Date(createPricingWindowDto.startDate);
        const endDate = new Date(createPricingWindowDto.endDate);
        if (startDate >= endDate) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        // Check for overlapping windows
        const overlappingWindow = await this.pricingWindowRepository
            .createQueryBuilder('pw')
            .where('pw.tenantId = :tenantId', { tenantId })
            .andWhere('(pw.startDate <= :endDate AND pw.endDate >= :startDate)', { startDate, endDate })
            .getOne();
        if (overlappingWindow) {
            throw new common_1.ConflictException('Pricing window overlaps with existing window');
        }
        const pricingWindow = this.pricingWindowRepository.create({
            ...createPricingWindowDto,
            tenantId,
            startDate,
            endDate,
            status: shared_types_1.PricingWindowStatus.DRAFT,
            createdBy: userId,
        });
        const savedWindow = await this.pricingWindowRepository.save(pricingWindow);
        // Emit event
        this.eventEmitter.emit('pricing-window.created', {
            windowId: savedWindow.windowId,
            tenantId,
            startDate: savedWindow.startDate,
            endDate: savedWindow.endDate,
        });
        return savedWindow;
    }
    async findAllWindows(tenantId, status) {
        const query = this.pricingWindowRepository.createQueryBuilder('pw')
            .where('pw.tenantId = :tenantId', { tenantId })
            .orderBy('pw.startDate', 'DESC');
        if (status) {
            query.andWhere('pw.status = :status', { status });
        }
        return query.getMany();
    }
    async findWindow(windowId, tenantId) {
        const window = await this.pricingWindowRepository.findOne({
            where: { windowId, tenantId },
            relations: ['stationPrices'],
        });
        if (!window) {
            throw new common_1.NotFoundException('Pricing window not found');
        }
        return window;
    }
    async getActiveWindow(tenantId) {
        const now = new Date();
        return this.pricingWindowRepository.findOne({
            where: {
                tenantId,
                status: shared_types_1.PricingWindowStatus.ACTIVE,
                startDate: { $lte: now },
                endDate: { $gte: now },
            },
        });
    }
    async activateWindow(windowId, tenantId, userId) {
        const window = await this.findWindow(windowId, tenantId);
        if (window.status !== shared_types_1.PricingWindowStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft windows can be activated');
        }
        // Deactivate any currently active window
        await this.pricingWindowRepository.update({ tenantId, status: shared_types_1.PricingWindowStatus.ACTIVE }, { status: shared_types_1.PricingWindowStatus.CLOSED });
        // Activate the new window
        window.status = shared_types_1.PricingWindowStatus.ACTIVE;
        window.approvedBy = userId;
        window.approvedAt = new Date();
        window.updatedAt = new Date();
        const savedWindow = await this.pricingWindowRepository.save(window);
        // Emit event
        this.eventEmitter.emit('pricing-window.activated', {
            windowId: savedWindow.windowId,
            tenantId,
            activatedBy: userId,
        });
        return savedWindow;
    }
    async calculateStationPrice(calculatePriceDto, tenantId, userId) {
        const { stationId, productId, windowId } = calculatePriceDto;
        // Verify pricing window exists and is active
        const window = await this.findWindow(windowId, tenantId);
        // TODO: Integrate with PBU Components Service and Calculation Engine
        // For now, we'll create a mock calculation
        const mockBreakdown = {
            components: [
                { code: 'EXREF', name: 'Ex-Refinery Price', value: 8.904, unit: 'GHS_per_litre' },
                { code: 'EDRL', name: 'Energy Debt Recovery Levy', value: 0.490, unit: 'GHS_per_litre' },
                { code: 'ROAD', name: 'Road Fund Levy', value: 0.840, unit: 'GHS_per_litre' },
                { code: 'PSRL', name: 'Price Stabilisation Recovery Levy', value: 0.160, unit: 'GHS_per_litre' },
                { code: 'BOST', name: 'BOST Margin', value: 0.150, unit: 'GHS_per_litre' },
                { code: 'UPPF', name: 'UPPF Margin', value: 0.200, unit: 'GHS_per_litre' },
                { code: 'MARK', name: 'Fuel Marking', value: 0.080, unit: 'GHS_per_litre' },
                { code: 'PRIM', name: 'Primary Distribution', value: 0.220, unit: 'GHS_per_litre' },
                { code: 'OMC', name: 'OMC Margin', value: 0.300, unit: 'GHS_per_litre' },
                { code: 'DEAL', name: 'Dealer Margin', value: 0.350, unit: 'GHS_per_litre' },
            ],
            totalPrice: 0,
            sourceDocuments: [window.npaGuidelineDocId || 'NPA-2025-W15-GUIDE'].filter(Boolean),
        };
        // Apply overrides if provided
        if (calculatePriceDto.overrides?.length) {
            calculatePriceDto.overrides.forEach(override => {
                const component = mockBreakdown.components.find(c => c.code === override.componentCode);
                if (component) {
                    component.value = override.value;
                }
            });
        }
        // Calculate total price
        mockBreakdown.totalPrice = mockBreakdown.components.reduce((sum, comp) => sum + comp.value, 0);
        // Check if station price already exists for this window
        let stationPrice = await this.stationPriceRepository.findOne({
            where: { stationId, productId, windowId, tenantId },
        });
        if (stationPrice) {
            // Update existing price
            stationPrice.exPumpPrice = mockBreakdown.totalPrice;
            stationPrice.calcBreakdownJson = mockBreakdown;
            stationPrice.calculatedBy = userId;
            stationPrice.updatedAt = new Date();
        }
        else {
            // Create new price
            stationPrice = this.stationPriceRepository.create({
                id: (0, uuid_1.v4)(),
                stationId,
                productId,
                windowId,
                exPumpPrice: mockBreakdown.totalPrice,
                calcBreakdownJson: mockBreakdown,
                tenantId,
                calculatedBy: userId,
            });
        }
        const savedPrice = await this.stationPriceRepository.save(stationPrice);
        // Emit event
        this.eventEmitter.emit('station-price.calculated', {
            stationId,
            productId,
            windowId,
            price: savedPrice.exPumpPrice,
            tenantId,
        });
        return savedPrice;
    }
    async publishStationPrice(stationId, productId, windowId, tenantId, userId) {
        const stationPrice = await this.stationPriceRepository.findOne({
            where: { stationId, productId, windowId, tenantId },
        });
        if (!stationPrice) {
            throw new common_1.NotFoundException('Station price not found');
        }
        if (stationPrice.publishedAt) {
            throw new common_1.BadRequestException('Price already published');
        }
        stationPrice.publishedAt = new Date();
        stationPrice.publishedBy = userId;
        stationPrice.updatedAt = new Date();
        const savedPrice = await this.stationPriceRepository.save(stationPrice);
        // Emit event
        this.eventEmitter.emit('station-price.published', {
            stationId,
            productId,
            windowId,
            price: savedPrice.exPumpPrice,
            publishedAt: savedPrice.publishedAt,
            tenantId,
        });
        return savedPrice;
    }
    async getStationPrices(windowId, tenantId, stationId, productId) {
        const query = this.stationPriceRepository.createQueryBuilder('sp')
            .where('sp.windowId = :windowId AND sp.tenantId = :tenantId', { windowId, tenantId });
        if (stationId) {
            query.andWhere('sp.stationId = :stationId', { stationId });
        }
        if (productId) {
            query.andWhere('sp.productId = :productId', { productId });
        }
        return query
            .orderBy('sp.stationId', 'ASC')
            .addOrderBy('sp.productId', 'ASC')
            .getMany();
    }
    async calculateAllStationPrices(windowId, tenantId, stations, products, userId) {
        const results = [];
        for (const stationId of stations) {
            for (const productId of products) {
                try {
                    const calculateDto = {
                        stationId,
                        productId,
                        windowId,
                    };
                    const price = await this.calculateStationPrice(calculateDto, tenantId, userId);
                    results.push(price);
                }
                catch (error) {
                    // Log error but continue with other calculations
                    console.error(`Failed to calculate price for station ${stationId}, product ${productId}:`, error.message);
                }
            }
        }
        // Emit bulk calculation event
        this.eventEmitter.emit('pricing-window.bulk-calculated', {
            windowId,
            tenantId,
            calculatedPrices: results.length,
            totalRequested: stations.length * products.length,
        });
        return results;
    }
    // Scheduled task to check for expired windows
    async checkExpiredWindows() {
        const now = new Date();
        const expiredWindows = await this.pricingWindowRepository.find({
            where: {
                status: shared_types_1.PricingWindowStatus.ACTIVE,
                endDate: { $lt: now },
            },
        });
        for (const window of expiredWindows) {
            window.status = shared_types_1.PricingWindowStatus.CLOSED;
            await this.pricingWindowRepository.save(window);
            this.eventEmitter.emit('pricing-window.expired', {
                windowId: window.windowId,
                tenantId: window.tenantId,
            });
        }
    }
    // Generate NPA submission file
    async generateNPASubmissionFile(windowId, tenantId) {
        const window = await this.findWindow(windowId, tenantId);
        const prices = await this.getStationPrices(windowId, tenantId);
        // Group prices by station and product for NPA format
        const submissionData = {
            windowId,
            submissionDate: new Date().toISOString(),
            totalStations: new Set(prices.map(p => p.stationId)).size,
            totalProducts: new Set(prices.map(p => p.productId)).size,
            pricesByStation: prices.reduce((acc, price) => {
                const key = `${price.stationId}-${price.productId}`;
                acc[key] = {
                    stationId: price.stationId,
                    productId: price.productId,
                    exPumpPrice: price.exPumpPrice,
                    breakdown: price.calcBreakdownJson.components,
                    calculatedAt: price.updatedAt,
                    publishedAt: price.publishedAt,
                };
                return acc;
            }, {}),
        };
        return submissionData;
    }
};
exports.PricingService = PricingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricingService.prototype, "checkExpiredWindows", null);
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pricing_window_entity_1.PricingWindow)),
    __param(1, (0, typeorm_1.InjectRepository)(station_price_entity_1.StationPrice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], PricingService);
//# sourceMappingURL=pricing.service.js.map