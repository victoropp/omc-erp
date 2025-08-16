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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBuildupController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const price_buildup_service_1 = require("../services/price-buildup.service");
const station_type_config_service_1 = require("../services/station-type-config.service");
const price_buildup_dto_1 = require("../dto/price-buildup.dto");
const price_buildup_entity_1 = require("../entities/price-buildup.entity");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let PriceBuildupController = class PriceBuildupController {
    priceBuildupService;
    stationTypeConfigService;
    constructor(priceBuildupService, stationTypeConfigService) {
        this.priceBuildupService = priceBuildupService;
        this.stationTypeConfigService = stationTypeConfigService;
    }
    // ===== PRICE BUILDUP VERSION MANAGEMENT =====
    async createPriceBuildupVersion(createDto, user) {
        return this.priceBuildupService.createPriceBuildupVersion(createDto, user.id);
    }
    async getPriceBuildupVersions(query) {
        return this.priceBuildupService.findPriceBuildupVersions(query);
    }
    async getPriceBuildupVersionById(id) {
        return this.priceBuildupService.findBuildupVersionById(id);
    }
    async updatePriceBuildupVersion(id, updateDto, user) {
        return this.priceBuildupService.updatePriceBuildupVersion(id, updateDto, user.id);
    }
    async approvePriceBuildupVersion(id, approveDto) {
        return this.priceBuildupService.approvePriceBuildupVersion(id, approveDto);
    }
    async publishPriceBuildupVersion(id, publishDto) {
        return this.priceBuildupService.publishPriceBuildupVersion(id, publishDto);
    }
    // ===== PRICE CALCULATION =====
    async calculatePrice(request) {
        return this.priceBuildupService.calculatePrice(request);
    }
    async getPriceHistory(productType, stationType, fromDate, toDate) {
        return this.priceBuildupService.getPriceHistory(productType, stationType, fromDate, toDate);
    }
    // ===== BULK OPERATIONS =====
    async bulkUpdatePrices(bulkUpdateDto, user) {
        return this.priceBuildupService.bulkUpdatePrices(bulkUpdateDto, user.id);
    }
    async uploadFromExcel(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException('Excel file is required');
        }
        if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            throw new common_1.BadRequestException('Invalid file type. Please upload an Excel (.xlsx) file');
        }
        return this.priceBuildupService.uploadFromExcel(file.buffer, uploadDto);
    }
    async downloadExcelTemplate() {
        // TODO: Implement Excel template generation
        throw new common_1.BadRequestException('Excel template download not implemented yet');
    }
    // ===== STATION TYPE CONFIGURATION =====
    async createStationTypeConfiguration(stationTypeDto, user) {
        return this.stationTypeConfigService.createStationTypeConfiguration(stationTypeDto, user.id);
    }
    async getAllStationTypeConfigurations() {
        return this.stationTypeConfigService.getAllStationTypeConfigurations();
    }
    async getStationTypeConfiguration(stationType) {
        const config = await this.stationTypeConfigService.getStationTypeConfiguration(stationType);
        if (!config) {
            throw new common_1.BadRequestException(`Station type configuration for ${stationType} not found`);
        }
        return config;
    }
    async updateStationTypeConfiguration(stationType, updateDto, user) {
        return this.stationTypeConfigService.updateStationTypeConfiguration(stationType, updateDto, user.id);
    }
    async getStationTypesByProduct(productType) {
        return this.stationTypeConfigService.getStationTypesByProduct(productType);
    }
    // ===== AUDIT TRAIL =====
    async getAuditTrail(query) {
        return this.priceBuildupService.getAuditTrail(query);
    }
    // ===== UTILITY ENDPOINTS =====
    async initializeDefaults(user) {
        await this.stationTypeConfigService.initializeDefaultStationTypeConfigurations(user.id);
        return { message: 'Default station type configurations initialized successfully' };
    }
    async validateStationTypeForProduct(validation) {
        const isValid = await this.stationTypeConfigService.validateStationTypeForProduct(validation.stationType, validation.productType);
        return {
            valid: isValid,
            message: isValid
                ? `${validation.stationType} supports ${validation.productType}`
                : `${validation.stationType} does not support ${validation.productType}`,
        };
    }
    async getApplicableComponents(stationType) {
        const components = await this.stationTypeConfigService.getApplicableComponentsForStationType(stationType);
        return { stationType, applicableComponents: components };
    }
};
exports.PriceBuildupController = PriceBuildupController;
__decorate([
    (0, common_1.Post)('versions'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new price buildup version' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Price buildup version created successfully', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict - overlapping effective dates' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.CreatePriceBuildupVersionDto, Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "createPriceBuildupVersion", null);
__decorate([
    (0, common_1.Get)('versions'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price buildup versions with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price buildup versions retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.PriceBuildupQueryDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getPriceBuildupVersions", null);
__decorate([
    (0, common_1.Get)('versions/:id'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price buildup version by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Price buildup version ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price buildup version found', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Price buildup version not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getPriceBuildupVersionById", null);
__decorate([
    (0, common_1.Put)('versions/:id'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update price buildup version' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Price buildup version ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price buildup version updated successfully', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - cannot modify published version' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Price buildup version not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, price_buildup_dto_1.UpdatePriceBuildupVersionDto, Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "updatePriceBuildupVersion", null);
__decorate([
    (0, common_1.Post)('versions/:id/approve'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_approver'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve price buildup version' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Price buildup version ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price buildup version approved successfully', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - version cannot be approved' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, price_buildup_dto_1.ApprovePriceBuildupDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "approvePriceBuildupVersion", null);
__decorate([
    (0, common_1.Post)('versions/:id/publish'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_publisher'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish price buildup version' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Price buildup version ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price buildup version published successfully', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - version cannot be published' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, price_buildup_dto_1.PublishPriceBuildupDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "publishPriceBuildupVersion", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer', 'station_operator'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate price for specific product and station type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price calculated successfully', type: price_buildup_dto_1.PriceCalculationResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active price buildup found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.PriceCalculationRequestDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Get)('history/:productType/:stationType'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price history for product and station type' }),
    (0, swagger_1.ApiParam)({ name: 'productType', enum: price_buildup_entity_1.ProductType, description: 'Product type' }),
    (0, swagger_1.ApiParam)({ name: 'stationType', enum: price_buildup_entity_1.StationType, description: 'Station type' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', type: Date, description: 'Start date for history' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', type: Date, description: 'End date for history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price history retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __param(1, (0, common_1.Param)('stationType')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update price components' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk update completed successfully', type: price_buildup_entity_1.PriceBuildupVersion }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.BulkPriceUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "bulkUpdatePrices", null);
__decorate([
    (0, common_1.Post)('upload-excel'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload price components from Excel file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - file validation failed' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, price_buildup_dto_1.ExcelUploadDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "uploadFromExcel", null);
__decorate([
    (0, common_1.Get)('template/excel'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Download Excel template for price component upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel template downloaded successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "downloadExcelTemplate", null);
__decorate([
    (0, common_1.Post)('station-types'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create station type configuration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Station type configuration created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - station type already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.StationTypeConfigurationDto, Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "createStationTypeConfiguration", null);
__decorate([
    (0, common_1.Get)('station-types'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all station type configurations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station type configurations retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getAllStationTypeConfigurations", null);
__decorate([
    (0, common_1.Get)('station-types/:stationType'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station type configuration by type' }),
    (0, swagger_1.ApiParam)({ name: 'stationType', enum: price_buildup_entity_1.StationType, description: 'Station type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station type configuration found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station type configuration not found' }),
    __param(0, (0, common_1.Param)('stationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getStationTypeConfiguration", null);
__decorate([
    (0, common_1.Put)('station-types/:stationType'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update station type configuration' }),
    (0, swagger_1.ApiParam)({ name: 'stationType', enum: price_buildup_entity_1.StationType, description: 'Station type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station type configuration updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station type configuration not found' }),
    __param(0, (0, common_1.Param)('stationType')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "updateStationTypeConfiguration", null);
__decorate([
    (0, common_1.Get)('station-types/by-product/:productType'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get station types that support a specific product' }),
    (0, swagger_1.ApiParam)({ name: 'productType', enum: price_buildup_entity_1.ProductType, description: 'Product type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station types retrieved successfully' }),
    __param(0, (0, common_1.Param)('productType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getStationTypesByProduct", null);
__decorate([
    (0, common_1.Get)('audit-trail'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'auditor'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price buildup audit trail' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit trail retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_buildup_dto_1.AuditTrailQueryDto]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getAuditTrail", null);
__decorate([
    (0, common_1.Post)('initialize-defaults'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize default station type configurations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default configurations initialized successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "initializeDefaults", null);
__decorate([
    (0, common_1.Post)('validate-configuration'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate station type and product combination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "validateStationTypeForProduct", null);
__decorate([
    (0, common_1.Get)('components/applicable/:stationType'),
    (0, roles_decorator_1.Roles)('admin', 'pricing_manager', 'pricing_viewer'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicable price components for station type' }),
    (0, swagger_1.ApiParam)({ name: 'stationType', enum: price_buildup_entity_1.StationType, description: 'Station type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Applicable components retrieved successfully' }),
    __param(0, (0, common_1.Param)('stationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PriceBuildupController.prototype, "getApplicableComponents", null);
exports.PriceBuildupController = PriceBuildupController = __decorate([
    (0, swagger_1.ApiTags)('Price Build-up Configuration'),
    (0, common_1.Controller)('price-buildup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [price_buildup_service_1.PriceBuildupService,
        station_type_config_service_1.StationTypeConfigurationService])
], PriceBuildupController);
//# sourceMappingURL=price-buildup.controller.js.map