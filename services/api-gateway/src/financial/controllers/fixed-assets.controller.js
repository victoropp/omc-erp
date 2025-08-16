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
exports.FixedAssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const financial_service_1 = require("../financial.service");
const fixed_assets_service_1 = require("../services/fixed-assets.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../auth/decorators/permissions.decorator");
const throttler_1 = require("@nestjs/throttler");
let FixedAssetsController = class FixedAssetsController {
    financialService;
    fixedAssetsService;
    constructor(financialService, fixedAssetsService) {
        this.financialService = financialService;
        this.fixedAssetsService = fixedAssetsService;
    }
    async getFixedAssets(category, status, departmentId, page, limit) {
        const filters = { category, status, departmentId, page, limit };
        const result = await this.financialService.getFixedAssets(filters);
        return {
            success: true,
            data: result,
            filters,
            timestamp: new Date().toISOString(),
        };
    }
    async getFixedAsset(assetId) {
        const result = await this.fixedAssetsService.getAssetById(assetId);
        return {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
    async createFixedAsset(assetData, req) {
        const enrichedData = {
            ...assetData,
            createdBy: req.user.sub,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
        };
        const result = await this.financialService.createFixedAsset(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Fixed asset created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async updateFixedAsset(assetId, assetData, req) {
        const enrichedData = {
            ...assetData,
            updatedBy: req.user.sub,
            updatedAt: new Date().toISOString(),
        };
        const result = await this.fixedAssetsService.updateAsset(assetId, enrichedData);
        return {
            success: true,
            data: result,
            message: 'Fixed asset updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteFixedAsset(assetId) {
        await this.fixedAssetsService.deleteAsset(assetId);
        return {
            success: true,
            message: 'Fixed asset deleted successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== DEPRECIATION MANAGEMENT =====
    async getDepreciationSchedule(assetId) {
        const result = await this.fixedAssetsService.getDepreciationSchedule(assetId);
        return {
            success: true,
            data: result,
            assetId,
            timestamp: new Date().toISOString(),
        };
    }
    async calculateDepreciation(assetId, calculationData) {
        const result = await this.financialService.calculateDepreciation(assetId, calculationData.method, calculationData);
        return {
            success: true,
            data: result,
            assetId,
            method: calculationData.method,
            timestamp: new Date().toISOString(),
        };
    }
    async recordDepreciation(assetId, depreciationData, req) {
        const enrichedData = {
            ...depreciationData,
            assetId,
            recordedBy: req.user.sub,
            recordedAt: new Date().toISOString(),
        };
        const result = await this.fixedAssetsService.recordDepreciation(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Depreciation recorded successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async runBatchDepreciation(periodId, req) {
        const result = await this.financialService.runDepreciationSchedule(periodId);
        return {
            success: true,
            data: result,
            message: 'Batch depreciation completed successfully',
            periodId,
            processedBy: req.user.sub,
            timestamp: new Date().toISOString(),
        };
    }
    // ===== ASSET MAINTENANCE =====
    async getMaintenanceHistory(assetId) {
        const result = await this.fixedAssetsService.getMaintenanceHistory(assetId);
        return {
            success: true,
            data: result,
            assetId,
            timestamp: new Date().toISOString(),
        };
    }
    async recordMaintenance(assetId, maintenanceData, req) {
        const enrichedData = {
            ...maintenanceData,
            assetId,
            recordedBy: req.user.sub,
            recordedAt: new Date().toISOString(),
        };
        const result = await this.fixedAssetsService.recordMaintenance(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Maintenance recorded successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== ASSET DISPOSAL =====
    async recordDisposal(assetId, disposalData, req) {
        const enrichedData = {
            ...disposalData,
            assetId,
            disposedBy: req.user.sub,
            disposedAt: new Date().toISOString(),
        };
        const result = await this.fixedAssetsService.recordDisposal(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Asset disposal recorded successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== ASSET TRANSFER =====
    async transferAsset(assetId, transferData, req) {
        const enrichedData = {
            ...transferData,
            assetId,
            transferredBy: req.user.sub,
            transferredAt: new Date().toISOString(),
        };
        const result = await this.fixedAssetsService.transferAsset(enrichedData);
        return {
            success: true,
            data: result,
            message: 'Asset transferred successfully',
            timestamp: new Date().toISOString(),
        };
    }
    // ===== ASSET REPORTS =====
    async getDepreciationSummary(periodId, category) {
        const result = await this.fixedAssetsService.getDepreciationSummary({
            periodId,
            category,
        });
        return {
            success: true,
            data: result,
            reportType: 'Depreciation Summary',
            parameters: { periodId, category },
            timestamp: new Date().toISOString(),
        };
    }
    async getAssetRegister(asOfDate, category, departmentId) {
        const result = await this.fixedAssetsService.getAssetRegister({
            asOfDate,
            category,
            departmentId,
        });
        return {
            success: true,
            data: result,
            reportType: 'Asset Register',
            parameters: { asOfDate, category, departmentId },
            timestamp: new Date().toISOString(),
        };
    }
    async getMaintenanceCosts(fromDate, toDate, assetId) {
        const result = await this.fixedAssetsService.getMaintenanceCosts({
            fromDate,
            toDate,
            assetId,
        });
        return {
            success: true,
            data: result,
            reportType: 'Maintenance Costs',
            parameters: { fromDate, toDate, assetId },
            timestamp: new Date().toISOString(),
        };
    }
};
exports.FixedAssetsController = FixedAssetsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Fixed Assets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fixed assets retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Asset category' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Asset status' }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false, description: 'Department ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('departmentId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getFixedAssets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Fixed Asset by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fixed asset retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getFixedAsset", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Fixed Asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Fixed asset created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "createFixedAsset", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Fixed Asset' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fixed asset updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "updateFixedAsset", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('finance:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Fixed Asset' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fixed asset deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "deleteFixedAsset", null);
__decorate([
    (0, common_1.Get)(':id/depreciation'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Asset Depreciation Schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Depreciation schedule retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getDepreciationSchedule", null);
__decorate([
    (0, common_1.Post)(':id/depreciation/calculate'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate Asset Depreciation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Depreciation calculated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "calculateDepreciation", null);
__decorate([
    (0, common_1.Post)(':id/depreciation/record'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Record Depreciation Entry' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Depreciation recorded successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "recordDepreciation", null);
__decorate([
    (0, common_1.Post)('depreciation/run-batch/:periodId'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Run Batch Depreciation for Period' }),
    (0, swagger_1.ApiParam)({ name: 'periodId', description: 'Accounting Period ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch depreciation completed' }),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "runBatchDepreciation", null);
__decorate([
    (0, common_1.Get)(':id/maintenance'),
    (0, permissions_decorator_1.Permissions)('finance:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Asset Maintenance History' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance history retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getMaintenanceHistory", null);
__decorate([
    (0, common_1.Post)(':id/maintenance'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Record Asset Maintenance' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Maintenance recorded successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "recordMaintenance", null);
__decorate([
    (0, common_1.Post)(':id/disposal'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Record Asset Disposal' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset disposal recorded successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "recordDisposal", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, permissions_decorator_1.Permissions)('finance:write'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer Asset Between Departments/Locations' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Asset ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset transferred successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "transferAsset", null);
__decorate([
    (0, common_1.Get)('reports/depreciation-summary'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Depreciation Summary Report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Depreciation summary retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'periodId', required: false, description: 'Period ID' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Asset category' }),
    __param(0, (0, common_1.Query)('periodId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getDepreciationSummary", null);
__decorate([
    (0, common_1.Get)('reports/asset-register'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Asset Register Report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset register retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'asOfDate', required: false, description: 'As of date' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Asset category' }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false, description: 'Department ID' }),
    __param(0, (0, common_1.Query)('asOfDate')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getAssetRegister", null);
__decorate([
    (0, common_1.Get)('reports/maintenance-costs'),
    (0, permissions_decorator_1.Permissions)('reports:read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Maintenance Costs Report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance costs report retrieved' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'assetId', required: false }),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FixedAssetsController.prototype, "getMaintenanceCosts", null);
exports.FixedAssetsController = FixedAssetsController = __decorate([
    (0, swagger_1.ApiTags)('Fixed Assets Management'),
    (0, common_1.Controller)('financial/fixed-assets'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard, jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [financial_service_1.FinancialService,
        fixed_assets_service_1.FixedAssetsService])
], FixedAssetsController);
//# sourceMappingURL=fixed-assets.controller.js.map