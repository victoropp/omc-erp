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
var FixedAssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedAssetsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let FixedAssetsService = FixedAssetsService_1 = class FixedAssetsService {
    httpService;
    configService;
    cacheManager;
    logger = new common_1.Logger(FixedAssetsService_1.name);
    serviceUrl;
    constructor(httpService, configService, cacheManager) {
        this.httpService = httpService;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.serviceUrl = this.configService.get('FIXED_ASSETS_SERVICE_URL', 'http://localhost:3006');
    }
    async getAssetById(assetId) {
        const cacheKey = `fixed_asset:${assetId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/assets/${assetId}`));
            const asset = response.data;
            await this.cacheManager.set(cacheKey, asset, 600000); // 10 minutes
            return asset;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new common_1.NotFoundException(`Fixed asset with ID ${assetId} not found`);
            }
            throw error;
        }
    }
    async updateAsset(assetId, assetData) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.put(`${this.serviceUrl}/assets/${assetId}`, assetData));
            // Clear cache
            await this.cacheManager.del(`fixed_asset:${assetId}`);
            await this.clearAssetCaches();
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to update asset ${assetId}`, error.response?.data || error.message);
            throw error;
        }
    }
    async deleteAsset(assetId) {
        // First check if asset can be deleted (no transactions, not disposed, etc.)
        const asset = await this.getAssetById(assetId);
        if (asset.status === 'DISPOSED') {
            throw new common_1.BadRequestException('Cannot delete disposed asset');
        }
        // Check for existing depreciation entries
        const depreciationEntries = await this.getDepreciationEntries(assetId);
        if (depreciationEntries.length > 0) {
            throw new common_1.BadRequestException('Cannot delete asset with depreciation entries');
        }
        try {
            await (0, rxjs_1.lastValueFrom)(this.httpService.delete(`${this.serviceUrl}/assets/${assetId}`));
            // Clear caches
            await this.cacheManager.del(`fixed_asset:${assetId}`);
            await this.clearAssetCaches();
            this.logger.log(`Asset ${assetId} deleted successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to delete asset ${assetId}`, error.response?.data || error.message);
            throw error;
        }
    }
    async getDepreciationSchedule(assetId) {
        const cacheKey = `depreciation_schedule:${assetId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/assets/${assetId}/depreciation/schedule`));
            const schedule = response.data;
            await this.cacheManager.set(cacheKey, schedule, 1800000); // 30 minutes
            return schedule;
        }
        catch (error) {
            this.logger.error(`Failed to get depreciation schedule for asset ${assetId}`, error.message);
            throw error;
        }
    }
    async getDepreciationEntries(assetId) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/assets/${assetId}/depreciation/entries`));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get depreciation entries for asset ${assetId}`, error.message);
            throw error;
        }
    }
    async recordDepreciation(depreciationData) {
        try {
            // Validate asset exists and is active
            const asset = await this.getAssetById(depreciationData.assetId);
            if (asset.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Can only record depreciation for active assets');
            }
            // Check if depreciation would exceed asset cost
            const currentAccumulated = asset.accumulatedDepreciation;
            const newAccumulated = currentAccumulated + depreciationData.amount;
            const maxDepreciation = asset.acquisitionCost - asset.salvageValue;
            if (newAccumulated > maxDepreciation) {
                throw new common_1.BadRequestException(`Depreciation amount would exceed maximum depreciable amount of ${maxDepreciation}`);
            }
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`${this.serviceUrl}/assets/${depreciationData.assetId}/depreciation/record`, depreciationData));
            // Clear related caches
            await this.cacheManager.del(`fixed_asset:${depreciationData.assetId}`);
            await this.cacheManager.del(`depreciation_schedule:${depreciationData.assetId}`);
            await this.clearAssetCaches();
            this.logger.log(`Depreciation recorded for asset ${depreciationData.assetId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to record depreciation', error.response?.data || error.message);
            throw error;
        }
    }
    async getMaintenanceHistory(assetId) {
        const cacheKey = `maintenance_history:${assetId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/assets/${assetId}/maintenance`));
            const history = response.data;
            await this.cacheManager.set(cacheKey, history, 600000); // 10 minutes
            return history;
        }
        catch (error) {
            this.logger.error(`Failed to get maintenance history for asset ${assetId}`, error.message);
            throw error;
        }
    }
    async recordMaintenance(maintenanceData) {
        try {
            // Validate asset exists
            await this.getAssetById(maintenanceData.assetId);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`${this.serviceUrl}/assets/${maintenanceData.assetId}/maintenance`, maintenanceData));
            // Clear maintenance cache
            await this.cacheManager.del(`maintenance_history:${maintenanceData.assetId}`);
            this.logger.log(`Maintenance recorded for asset ${maintenanceData.assetId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to record maintenance', error.response?.data || error.message);
            throw error;
        }
    }
    async recordDisposal(disposalData) {
        try {
            // Validate asset can be disposed
            const asset = await this.getAssetById(disposalData.assetId);
            if (asset.status === 'DISPOSED') {
                throw new common_1.BadRequestException('Asset is already disposed');
            }
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`${this.serviceUrl}/assets/${disposalData.assetId}/disposal`, disposalData));
            // Clear caches
            await this.cacheManager.del(`fixed_asset:${disposalData.assetId}`);
            await this.clearAssetCaches();
            this.logger.log(`Asset ${disposalData.assetId} disposed successfully`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to record disposal', error.response?.data || error.message);
            throw error;
        }
    }
    async transferAsset(transferData) {
        try {
            // Validate asset exists and can be transferred
            const asset = await this.getAssetById(transferData.assetId);
            if (asset.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Can only transfer active assets');
            }
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.post(`${this.serviceUrl}/assets/${transferData.assetId}/transfer`, transferData));
            // Clear caches
            await this.cacheManager.del(`fixed_asset:${transferData.assetId}`);
            await this.clearAssetCaches();
            this.logger.log(`Asset ${transferData.assetId} transferred successfully`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to transfer asset', error.response?.data || error.message);
            throw error;
        }
    }
    async getDepreciationSummary(filters) {
        const cacheKey = `depreciation_summary:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const params = new URLSearchParams();
            if (filters.periodId)
                params.append('periodId', filters.periodId);
            if (filters.category)
                params.append('category', filters.category);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/reports/depreciation-summary?${params.toString()}`));
            const summary = response.data;
            await this.cacheManager.set(cacheKey, summary, 1800000); // 30 minutes
            return summary;
        }
        catch (error) {
            this.logger.error('Failed to get depreciation summary', error.message);
            throw error;
        }
    }
    async getAssetRegister(filters) {
        const cacheKey = `asset_register:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const params = new URLSearchParams();
            if (filters.asOfDate)
                params.append('asOfDate', filters.asOfDate);
            if (filters.category)
                params.append('category', filters.category);
            if (filters.departmentId)
                params.append('departmentId', filters.departmentId);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/reports/asset-register?${params.toString()}`));
            const register = response.data;
            await this.cacheManager.set(cacheKey, register, 1800000); // 30 minutes
            return register;
        }
        catch (error) {
            this.logger.error('Failed to get asset register', error.message);
            throw error;
        }
    }
    async getMaintenanceCosts(filters) {
        try {
            const params = new URLSearchParams();
            if (filters.fromDate)
                params.append('fromDate', filters.fromDate);
            if (filters.toDate)
                params.append('toDate', filters.toDate);
            if (filters.assetId)
                params.append('assetId', filters.assetId);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/reports/maintenance-costs?${params.toString()}`));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get maintenance costs', error.message);
            throw error;
        }
    }
    async getAssetUtilization(filters) {
        try {
            const params = new URLSearchParams();
            if (filters.fromDate)
                params.append('fromDate', filters.fromDate);
            if (filters.toDate)
                params.append('toDate', filters.toDate);
            if (filters.departmentId)
                params.append('departmentId', filters.departmentId);
            if (filters.category)
                params.append('category', filters.category);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/reports/utilization?${params.toString()}`));
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get asset utilization', error.message);
            throw error;
        }
    }
    async getAssetValuation(asOfDate) {
        const cacheKey = `asset_valuation:${asOfDate || 'current'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const params = new URLSearchParams();
            if (asOfDate)
                params.append('asOfDate', asOfDate);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.serviceUrl}/reports/valuation?${params.toString()}`));
            const valuation = response.data;
            await this.cacheManager.set(cacheKey, valuation, 1800000); // 30 minutes
            return valuation;
        }
        catch (error) {
            this.logger.error('Failed to get asset valuation', error.message);
            throw error;
        }
    }
    async clearAssetCaches() {
        // In a real implementation, you'd use cache patterns or tags
        this.logger.debug('Clearing asset-related caches');
    }
};
exports.FixedAssetsService = FixedAssetsService;
exports.FixedAssetsService = FixedAssetsService = FixedAssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService, Object])
], FixedAssetsService);
//# sourceMappingURL=fixed-assets.service.js.map