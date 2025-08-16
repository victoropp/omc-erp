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
var UPPFSettlementsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFSettlementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const logging_interceptor_1 = require("../interceptors/logging.interceptor");
const transform_interceptor_1 = require("../interceptors/transform.interceptor");
const uppf_settlements_service_1 = require("../settlements/uppf-settlements.service");
const uppf_claims_service_1 = require("../claims/uppf-claims.service");
const uppf_entities_1 = require("../entities/uppf-entities");
let UPPFSettlementsController = UPPFSettlementsController_1 = class UPPFSettlementsController {
    settlementsService;
    claimsService;
    eventEmitter;
    logger = new common_1.Logger(UPPFSettlementsController_1.name);
    constructor(settlementsService, claimsService, eventEmitter) {
        this.settlementsService = settlementsService;
        this.claimsService = claimsService;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create a new UPPF settlement
     */
    async createSettlement(createSettlementDto, user) {
        try {
            this.logger.log(`Creating UPPF settlement for window ${createSettlementDto.windowId} by user ${user.username}`);
            // Validate that all claims exist and are approved
            const claims = await this.claimsService.findByIds(createSettlementDto.claimIds);
            const unapprovedClaims = claims.filter(claim => claim.status !== 'approved');
            if (unapprovedClaims.length > 0) {
                throw new common_1.BadRequestException(`Cannot settle unapproved claims: ${unapprovedClaims.map(c => c.claimNumber).join(', ')}`);
            }
            // Check if settlement already exists for this window
            const existingSettlement = await this.settlementsService.findByWindowId(createSettlementDto.windowId);
            if (existingSettlement) {
                throw new common_1.BadRequestException(`Settlement already exists for window ${createSettlementDto.windowId}`);
            }
            const settlement = await this.settlementsService.createSettlement({
                ...createSettlementDto,
                processedBy: user.username,
            });
            // Emit settlement creation event
            this.eventEmitter.emit('uppf.settlement.created', {
                settlementId: settlement.settlementId,
                windowId: settlement.windowId,
                totalAmount: settlement.totalSettledAmount,
                claimsCount: settlement.totalClaims,
                createdBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`UPPF settlement ${settlement.settlementId} created successfully`);
            return settlement;
        }
        catch (error) {
            this.logger.error(`Failed to create UPPF settlement: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get all settlements with filtering and pagination
     */
    async getSettlements(queryDto, user) {
        try {
            this.logger.log(`Retrieving UPPF settlements for user ${user.username}`);
            const result = await this.settlementsService.findWithPagination(queryDto);
            this.logger.log(`Retrieved ${result.items.length} settlements (${result.total} total)`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve settlements: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get a specific settlement by ID
     */
    async getSettlementById(id, user) {
        try {
            this.logger.log(`Retrieving settlement ${id} for user ${user.username}`);
            const settlement = await this.settlementsService.findByIdWithClaims(id);
            if (!settlement) {
                throw new common_1.NotFoundException('Settlement not found');
            }
            return settlement;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve settlement ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Process settlement payment
     */
    async processSettlement(id, processDto, user) {
        try {
            this.logger.log(`Processing settlement ${id} by user ${user.username}`);
            const settlement = await this.settlementsService.findById(id);
            if (!settlement) {
                throw new common_1.NotFoundException('Settlement not found');
            }
            if (settlement.status !== uppf_entities_1.SettlementStatus.PENDING) {
                throw new common_1.BadRequestException('Settlement is not in pending status');
            }
            const processedSettlement = await this.settlementsService.processSettlement(id, {
                paymentReference: processDto.paymentReference,
                bankTransactionRef: processDto.paymentReference,
                notes: processDto.notes,
                processedBy: user.username,
            });
            // Emit settlement processed event
            this.eventEmitter.emit('uppf.settlement.processed', {
                settlementId: settlement.settlementId,
                windowId: settlement.windowId,
                totalAmount: settlement.totalSettledAmount,
                processedBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`Settlement ${id} processed successfully`);
            return processedSettlement;
        }
        catch (error) {
            this.logger.error(`Failed to process settlement ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get settlement summary and statistics
     */
    async getSettlementStatistics(queryDto, user) {
        try {
            this.logger.log(`Retrieving settlement statistics for user ${user.username}`);
            const statistics = await this.settlementsService.getSettlementStatistics(queryDto);
            return statistics;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve settlement statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Generate settlement report
     */
    async generateSettlementReport(id, format = 'pdf', user) {
        try {
            this.logger.log(`Generating settlement report for ${id} in ${format} format by user ${user.username}`);
            const settlement = await this.settlementsService.findByIdWithClaims(id);
            if (!settlement) {
                throw new common_1.NotFoundException('Settlement not found');
            }
            const report = await this.settlementsService.generateSettlementReport(id, format, user.username);
            this.logger.log(`Settlement report generated: ${report.reportId}`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate settlement report: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Reconcile settlement with bank payment
     */
    async reconcileSettlement(id, reconcileDto, user) {
        try {
            this.logger.log(`Reconciling settlement ${id} with bank payment by user ${user.username}`);
            const settlement = await this.settlementsService.findById(id);
            if (!settlement) {
                throw new common_1.NotFoundException('Settlement not found');
            }
            if (settlement.status !== uppf_entities_1.SettlementStatus.PROCESSING) {
                throw new common_1.BadRequestException('Settlement must be in processing status for reconciliation');
            }
            const reconciledSettlement = await this.settlementsService.reconcileSettlement(id, {
                ...reconcileDto,
                reconciledBy: user.username,
            });
            // Emit reconciliation event
            this.eventEmitter.emit('uppf.settlement.reconciled', {
                settlementId: settlement.settlementId,
                expectedAmount: settlement.totalSettledAmount,
                actualAmount: reconcileDto.actualAmount,
                variance: reconcileDto.actualAmount - settlement.totalSettledAmount,
                reconciledBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`Settlement ${id} reconciled successfully`);
            return reconciledSettlement;
        }
        catch (error) {
            this.logger.error(`Failed to reconcile settlement ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get claims eligible for settlement
     */
    async getEligibleClaims(windowId, user) {
        try {
            this.logger.log(`Retrieving eligible claims for settlement in window ${windowId} by user ${user.username}`);
            const eligibleClaims = await this.claimsService.findEligibleForSettlement(windowId);
            // Calculate summary
            const summary = {
                totalClaims: eligibleClaims.length,
                totalAmount: eligibleClaims.reduce((sum, claim) => sum + claim.totalClaimAmount, 0),
                averageAmount: eligibleClaims.length > 0 ?
                    eligibleClaims.reduce((sum, claim) => sum + claim.totalClaimAmount, 0) / eligibleClaims.length : 0,
                dealerBreakdown: this.groupClaimsByDealer(eligibleClaims),
                productBreakdown: this.groupClaimsByProduct(eligibleClaims),
            };
            return {
                claims: eligibleClaims,
                summary,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve eligible claims: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Export settlement data
     */
    async exportSettlementsCSV(queryDto, user) {
        try {
            this.logger.log(`Exporting settlements to CSV for user ${user.username}`);
            const csvData = await this.settlementsService.exportToCSV(queryDto);
            return {
                data: csvData,
                filename: `uppf-settlements-${new Date().toISOString().split('T')[0]}.csv`,
                contentType: 'text/csv',
            };
        }
        catch (error) {
            this.logger.error(`Failed to export settlements to CSV: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Helper methods
    groupClaimsByDealer(claims) {
        return claims.reduce((acc, claim) => {
            if (!acc[claim.dealerId]) {
                acc[claim.dealerId] = {
                    dealerName: claim.dealerName,
                    claims: 0,
                    totalAmount: 0,
                };
            }
            acc[claim.dealerId].claims++;
            acc[claim.dealerId].totalAmount += claim.totalClaimAmount;
            return acc;
        }, {});
    }
    groupClaimsByProduct(claims) {
        return claims.reduce((acc, claim) => {
            if (!acc[claim.productType]) {
                acc[claim.productType] = {
                    claims: 0,
                    totalAmount: 0,
                    totalVolume: 0,
                };
            }
            acc[claim.productType].claims++;
            acc[claim.productType].totalAmount += claim.totalClaimAmount;
            acc[claim.productType].totalVolume += claim.volumeLitres;
            return acc;
        }, {});
    }
};
exports.UPPFSettlementsController = UPPFSettlementsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create UPPF settlement',
        description: 'Create a new UPPF settlement for a pricing window'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Settlement created successfully',
        type: uppf_entities_1.UPPFSettlement
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid settlement data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Finance manager role required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "createSettlement", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get UPPF settlements',
        description: 'Retrieve UPPF settlements with filtering and pagination'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlements retrieved successfully'
    }),
    (0, swagger_1.ApiQuery)({ name: 'windowId', required: false, description: 'Filter by pricing window ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: uppf_entities_1.SettlementStatus, isArray: true, description: 'Filter by settlement status' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: Date, description: 'Filter from date' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: Date, description: 'Filter to date' }),
    (0, swagger_1.ApiQuery)({ name: 'minAmount', required: false, type: Number, description: 'Minimum settlement amount' }),
    (0, swagger_1.ApiQuery)({ name: 'maxAmount', required: false, type: Number, description: 'Maximum settlement amount' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort field (default: settlementDate)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "getSettlements", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement by ID',
        description: 'Retrieve a specific settlement with full details'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement retrieved successfully',
        type: uppf_entities_1.UPPFSettlement
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settlement not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "getSettlementById", null);
__decorate([
    (0, common_1.Put)(':id/process'),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process settlement payment',
        description: 'Mark settlement as processed and update payment details'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Settlement not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Settlement cannot be processed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "processSettlement", null);
__decorate([
    (0, common_1.Get)('statistics/summary'),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement statistics',
        description: 'Retrieve comprehensive settlement statistics and performance metrics'
    }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: Date, description: 'Statistics from date' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: Date, description: 'Statistics to date' }),
    (0, swagger_1.ApiQuery)({ name: 'windowId', required: false, description: 'Filter by specific window' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement statistics retrieved successfully'
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "getSettlementStatistics", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate settlement report',
        description: 'Generate a comprehensive settlement report with claims breakdown'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement report generated successfully'
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "generateSettlementReport", null);
__decorate([
    (0, common_1.Put)(':id/reconcile'),
    (0, roles_decorator_1.Roles)('finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reconcile settlement with bank payment',
        description: 'Reconcile settlement with actual bank payment received'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement reconciled successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "reconcileSettlement", null);
__decorate([
    (0, common_1.Get)('eligible-claims/:windowId'),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get claims eligible for settlement',
        description: 'Retrieve approved claims eligible for settlement in a pricing window'
    }),
    (0, swagger_1.ApiParam)({ name: 'windowId', description: 'Pricing window ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Eligible claims retrieved successfully'
    }),
    __param(0, (0, common_1.Param)('windowId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "getEligibleClaims", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_decorator_1.Roles)('finance_manager', 'uppf_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export settlements to CSV',
        description: 'Export settlement data to CSV format'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CSV export generated successfully'
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFSettlementsController.prototype, "exportSettlementsCSV", null);
exports.UPPFSettlementsController = UPPFSettlementsController = UPPFSettlementsController_1 = __decorate([
    (0, swagger_1.ApiTags)('UPPF Settlements'),
    (0, common_1.Controller)('uppf/settlements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor, transform_interceptor_1.TransformInterceptor),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiExtraModels)(uppf_entities_1.UPPFSettlement),
    __metadata("design:paramtypes", [uppf_settlements_service_1.UPPFSettlementsService,
        uppf_claims_service_1.UPPFClaimsService,
        event_emitter_1.EventEmitter2])
], UPPFSettlementsController);
//# sourceMappingURL=uppf-settlements.controller.js.map