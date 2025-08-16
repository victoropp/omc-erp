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
var StationServiceIntegration_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationServiceIntegration = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let StationServiceIntegration = StationServiceIntegration_1 = class StationServiceIntegration {
    httpService;
    configService;
    logger = new common_1.Logger(StationServiceIntegration_1.name);
    baseUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('STATION_SERVICE_URL') || 'http://localhost:3006';
    }
    /**
     * Get all active stations
     */
    async getActiveStations() {
        this.logger.log('Fetching all active stations');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations`, {
                params: { status: 'ACTIVE' }
            }));
            return response.data.stations || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch active stations:', error);
            // Return fallback stations for pricing
            return this.getFallbackStations();
        }
    }
    /**
     * Get station by ID
     */
    async getStationById(stationId) {
        this.logger.log(`Fetching station details: ${stationId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/${stationId}`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch station ${stationId}:`, error);
            return null;
        }
    }
    /**
     * Get stations by dealer ID
     */
    async getStationsByDealer(dealerId) {
        this.logger.log(`Fetching stations for dealer: ${dealerId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations`, {
                params: { dealerId }
            }));
            return response.data.stations || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch stations for dealer ${dealerId}:`, error);
            return [];
        }
    }
    /**
     * Update station prices for a pricing window
     */
    async updateStationPrices(priceUpdates) {
        this.logger.log(`Updating prices for ${priceUpdates.length} station-product combinations`);
        let successful = 0;
        let failed = 0;
        const errors = [];
        for (const update of priceUpdates) {
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/stations/${update.stationId}/prices/${update.productId}`, {
                    windowId: update.windowId,
                    exPumpPrice: update.exPumpPrice,
                    effectiveDate: update.effectiveDate,
                    priceBreakdown: update.priceBreakdown
                }));
                successful++;
            }
            catch (error) {
                failed++;
                errors.push({
                    stationId: update.stationId,
                    error: error.message
                });
                this.logger.error(`Failed to update price for station ${update.stationId}:`, error);
            }
        }
        this.logger.log(`Price update completed: ${successful} successful, ${failed} failed`);
        return {
            successful,
            failed,
            errors
        };
    }
    /**
     * Get station sales data for a period
     */
    async getStationSalesData(stationId, startDate, endDate, productId) {
        this.logger.log(`Fetching sales data for station ${stationId}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            const params = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
            if (productId) {
                params.productId = productId;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/${stationId}/sales`, { params }));
            return response.data.salesData || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch sales data for station ${stationId}:`, error);
            return [];
        }
    }
    /**
     * Get station inventory levels
     */
    async getStationInventory(stationId) {
        this.logger.log(`Fetching inventory for station: ${stationId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/${stationId}/inventory`));
            return response.data.inventory || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch inventory for station ${stationId}:`, error);
            return [];
        }
    }
    /**
     * Get stations requiring restock
     */
    async getStationsRequiringRestock() {
        this.logger.log('Fetching stations requiring restock');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/restock-required`));
            return response.data.stations || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch stations requiring restock:', error);
            return [];
        }
    }
    /**
     * Get station performance metrics
     */
    async getStationPerformanceMetrics(stationId, startDate, endDate) {
        this.logger.log(`Fetching performance metrics for station: ${stationId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/${stationId}/performance`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch performance metrics for station ${stationId}:`, error);
            return null;
        }
    }
    /**
     * Update station status
     */
    async updateStationStatus(stationId, status, reason) {
        this.logger.log(`Updating station status: ${stationId} -> ${status}`);
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.baseUrl}/api/stations/${stationId}/status`, {
                status,
                reason,
                updatedAt: new Date()
            }));
            this.logger.log(`Station status updated successfully: ${stationId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update station status for ${stationId}:`, error);
            throw new Error(`Station status update failed: ${error.message}`);
        }
    }
    /**
     * Get stations by region
     */
    async getStationsByRegion(regionName) {
        this.logger.log(`Fetching stations in region: ${regionName}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations`, {
                params: { region: regionName }
            }));
            return response.data.stations || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch stations in region ${regionName}:`, error);
            return [];
        }
    }
    /**
     * Publish price change notification to stations
     */
    async publishPriceChangeNotification(notification) {
        this.logger.log(`Publishing price change notification to ${notification.stationIds.length} stations`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/api/stations/notifications/price-change`, notification));
            return {
                notifiedStations: response.data.notifiedStations || 0,
                failedNotifications: response.data.failedNotifications || []
            };
        }
        catch (error) {
            this.logger.error('Failed to publish price change notification:', error);
            return {
                notifiedStations: 0,
                failedNotifications: notification.stationIds
            };
        }
    }
    /**
     * Health check for station service
     */
    async healthCheck() {
        const startTime = Date.now();
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/health`, { timeout: 5000 }));
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
                lastChecked: new Date(),
                stationsOnline: response.data?.stationsOnline || 0
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.logger.warn('Station service health check failed:', error.message);
            return {
                status: 'unhealthy',
                responseTime,
                lastChecked: new Date()
            };
        }
    }
    /**
     * Get station count by status
     */
    async getStationCountByStatus() {
        this.logger.log('Fetching station count by status');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/api/stations/statistics/count-by-status`));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch station count by status:', error);
            return {
                active: 0,
                inactive: 0,
                maintenance: 0,
                total: 0
            };
        }
    }
    // Private helper methods
    getFallbackStations() {
        // Return mock stations for fallback when service is unavailable
        return [
            {
                id: 'STATION-001',
                stationCode: 'GH001',
                stationName: 'Accra Central Station',
                dealerId: 'DEALER-001',
                dealerName: 'Accra Fuel Services',
                location: {
                    address: '123 Independence Ave',
                    city: 'Accra',
                    region: 'Greater Accra'
                },
                status: 'ACTIVE',
                equipmentInfo: {
                    tankCapacity: { PMS: 30000, AGO: 25000, LPG: 15000 },
                    pumps: [
                        { pumpId: 'PUMP-001', productCode: 'PMS', isActive: true },
                        { pumpId: 'PUMP-002', productCode: 'AGO', isActive: true }
                    ]
                },
                operationalInfo: {
                    operatingHours: '24/7',
                    lastRestockDate: new Date(),
                    currentStock: { PMS: 25000, AGO: 20000, LPG: 12000 }
                },
                createdAt: new Date()
            },
            {
                id: 'STATION-002',
                stationCode: 'GH002',
                stationName: 'Kumasi Junction Station',
                dealerId: 'DEALER-002',
                dealerName: 'Kumasi Energy Hub',
                location: {
                    address: '456 Kejetia Road',
                    city: 'Kumasi',
                    region: 'Ashanti'
                },
                status: 'ACTIVE',
                equipmentInfo: {
                    tankCapacity: { PMS: 35000, AGO: 30000, LPG: 20000 },
                    pumps: [
                        { pumpId: 'PUMP-003', productCode: 'PMS', isActive: true },
                        { pumpId: 'PUMP-004', productCode: 'AGO', isActive: true },
                        { pumpId: 'PUMP-005', productCode: 'LPG', isActive: true }
                    ]
                },
                operationalInfo: {
                    operatingHours: '6:00 AM - 10:00 PM',
                    lastRestockDate: new Date(),
                    currentStock: { PMS: 30000, AGO: 25000, LPG: 18000 }
                },
                createdAt: new Date()
            }
        ];
    }
};
exports.StationServiceIntegration = StationServiceIntegration;
exports.StationServiceIntegration = StationServiceIntegration = StationServiceIntegration_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], StationServiceIntegration);
//# sourceMappingURL=station-service.integration.js.map