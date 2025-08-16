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
var UPPFClaimsController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFClaimsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const logging_interceptor_1 = require("../interceptors/logging.interceptor");
const transform_interceptor_1 = require("../interceptors/transform.interceptor");
const uppf_claims_service_1 = require("../claims/uppf-claims.service");
const three_way_reconciliation_service_1 = require("../claims/three-way-reconciliation.service");
const gps_validation_service_1 = require("../claims/gps-validation.service");
const npa_submission_service_1 = require("../claims/npa-submission.service");
const uppf_entities_1 = require("../entities/uppf-entities");
const bulk_action_dto_1 = require("../dto/bulk-action.dto");
let UPPFClaimsController = UPPFClaimsController_1 = class UPPFClaimsController {
    uppfClaimsService;
    threeWayReconciliationService;
    gpsValidationService;
    npaSubmissionService;
    eventEmitter;
    logger = new common_1.Logger(UPPFClaimsController_1.name);
    constructor(uppfClaimsService, threeWayReconciliationService, gpsValidationService, npaSubmissionService, eventEmitter) {
        this.uppfClaimsService = uppfClaimsService;
        this.threeWayReconciliationService = threeWayReconciliationService;
        this.gpsValidationService = gpsValidationService;
        this.npaSubmissionService = npaSubmissionService;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create a new UPPF claim
     */
    async createClaim(createClaimDto, user) {
        try {
            this.logger.log(`Creating UPPF claim for consignment ${createClaimDto.consignmentId} by user ${user.username}`);
            // Check if claim already exists for this consignment
            const existingClaim = await this.uppfClaimsService.findByConsignmentId(createClaimDto.consignmentId);
            if (existingClaim) {
                throw new common_1.ConflictException('UPPF claim already exists for this consignment');
            }
            // Create the claim with enhanced validation
            const claim = await this.uppfClaimsService.createUppfClaim({
                ...createClaimDto,
                createdBy: user.username,
            });
            // Emit claim creation event for real-time updates
            this.eventEmitter.emit('uppf.claim.created', {
                claimId: claim.id,
                claimNumber: claim.claimNumber,
                dealerId: claim.dealerId,
                amount: claim.totalClaimAmount,
                createdBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`UPPF claim ${claim.claimNumber} created successfully`);
            return claim;
        }
        catch (error) {
            this.logger.error(`Failed to create UPPF claim: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get all UPPF claims with filtering and pagination
     */
    async getClaims(queryDto, user) {
        try {
            this.logger.log(`Retrieving UPPF claims for user ${user.username}`);
            // Apply user-based filtering if not admin
            if (!user.roles.includes('admin') && !user.roles.includes('uppf_manager')) {
                // Limit access based on user role/permissions
                if (user.roles.includes('dealer')) {
                    queryDto.dealerId = user.id; // Assume user.id maps to dealerId for dealer users
                }
            }
            const result = await this.uppfClaimsService.findWithPagination(queryDto);
            this.logger.log(`Retrieved ${result.items.length} UPPF claims (${result.total} total)`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve UPPF claims: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get a specific UPPF claim by ID
     */
    async getClaimById(id, user) {
        try {
            this.logger.log(`Retrieving UPPF claim ${id} for user ${user.username}`);
            const claim = await this.uppfClaimsService.findByIdWithDetails(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            // Check access permissions
            if (!user.roles.includes('admin') && !user.roles.includes('uppf_manager')) {
                if (user.roles.includes('dealer') && claim.dealerId !== user.id) {
                    throw new common_1.UnauthorizedException('Access denied to this claim');
                }
            }
            return claim;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve UPPF claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Update a UPPF claim
     */
    async updateClaim(id, updateClaimDto, user) {
        try {
            this.logger.log(`Updating UPPF claim ${id} by user ${user.username}`);
            const existingClaim = await this.uppfClaimsService.findById(id);
            if (!existingClaim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            // Validate status transitions
            if (updateClaimDto.status) {
                this.validateStatusTransition(existingClaim.status, updateClaimDto.status, user);
            }
            const updatedClaim = await this.uppfClaimsService.updateClaim(id, {
                ...updateClaimDto,
                lastModifiedBy: user.username,
            });
            // Emit claim update event
            this.eventEmitter.emit('uppf.claim.updated', {
                claimId: id,
                claimNumber: updatedClaim.claimNumber,
                oldStatus: existingClaim.status,
                newStatus: updatedClaim.status,
                updatedBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`UPPF claim ${id} updated successfully`);
            return updatedClaim;
        }
        catch (error) {
            this.logger.error(`Failed to update UPPF claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Delete a UPPF claim (soft delete)
     */
    async deleteClaim(id, user) {
        try {
            this.logger.log(`Deleting UPPF claim ${id} by user ${user.username}`);
            const claim = await this.uppfClaimsService.findById(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            // Only allow deletion of draft claims
            if (claim.status !== uppf_entities_1.UPPFClaimStatus.DRAFT) {
                throw new common_1.BadRequestException('Only draft claims can be deleted');
            }
            await this.uppfClaimsService.deleteClaim(id, user.username);
            // Emit claim deletion event
            this.eventEmitter.emit('uppf.claim.deleted', {
                claimId: id,
                claimNumber: claim.claimNumber,
                deletedBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`UPPF claim ${id} deleted successfully`);
            return { message: 'UPPF claim deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to delete UPPF claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Submit claims to NPA
     */
    async submitClaim(id, user) {
        try {
            this.logger.log(`Submitting UPPF claim ${id} to NPA by user ${user.username}`);
            const claim = await this.uppfClaimsService.findById(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            if (claim.status !== uppf_entities_1.UPPFClaimStatus.READY_TO_SUBMIT) {
                throw new common_1.BadRequestException('Claim is not ready for submission');
            }
            const submissionResult = await this.npaSubmissionService.submitSingleClaim(id, user.username);
            this.logger.log(`UPPF claim ${id} submitted to NPA successfully`);
            return {
                submissionRef: submissionResult.submissionReference,
                message: 'Claim submitted to NPA successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to submit UPPF claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Bulk submit claims to NPA
     */
    async bulkSubmitClaims(bulkActionDto, user) {
        try {
            this.logger.log(`Bulk submitting ${bulkActionDto.claimIds.length} UPPF claims by user ${user.username}`);
            const result = await this.npaSubmissionService.submitBulkClaims(bulkActionDto.claimIds, user.username);
            // Emit bulk submission event
            this.eventEmitter.emit('uppf.bulk_submission.completed', {
                claimIds: bulkActionDto.claimIds,
                submissionRef: result.submissionReference,
                submittedBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`Bulk submission completed: ${result.successCount} successful, ${result.failureCount} failed`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to bulk submit UPPF claims: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Perform bulk actions on claims
     */
    async bulkAction(bulkActionDto, user) {
        try {
            this.logger.log(`Performing bulk action ${bulkActionDto.action} on ${bulkActionDto.claimIds.length} claims by user ${user.username}`);
            const result = await this.uppfClaimsService.performBulkAction(bulkActionDto.action, bulkActionDto.claimIds, bulkActionDto.actionData, user.username);
            // Emit bulk action event
            this.eventEmitter.emit('uppf.bulk_action.completed', {
                action: bulkActionDto.action,
                claimIds: bulkActionDto.claimIds,
                result,
                performedBy: user.username,
                timestamp: new Date(),
            });
            this.logger.log(`Bulk action ${bulkActionDto.action} completed: ${result.successCount} successful, ${result.failureCount} failed`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to perform bulk action: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get claim statistics
     */
    async getClaimsStatistics(queryDto, user) {
        try {
            this.logger.log(`Retrieving UPPF claims statistics for user ${user.username}`);
            const statistics = await this.uppfClaimsService.getClaimsStatistics(queryDto);
            return statistics;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve claims statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Validate GPS for a claim
     */
    async validateGPS(id, user) {
        try {
            this.logger.log(`Validating GPS for UPPF claim ${id} by user ${user.username}`);
            const claim = await this.uppfClaimsService.findById(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            const validationResult = await this.gpsValidationService.validateGPSRoute(claim.consignmentId);
            // Update claim with GPS validation results
            await this.uppfClaimsService.updateClaim(id, {
                gpsConfidence: validationResult.confidence,
                gpsValidated: validationResult.isValid,
                lastModifiedBy: user.username,
            });
            this.logger.log(`GPS validation completed for claim ${id}`);
            return validationResult;
        }
        catch (error) {
            this.logger.error(`Failed to validate GPS for claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Perform three-way reconciliation
     */
    async performReconciliation(id, reconciliationDto, user) {
        try {
            this.logger.log(`Performing three-way reconciliation for claim ${id} by user ${user.username}`);
            const claim = await this.uppfClaimsService.findById(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            const reconciliation = await this.threeWayReconciliationService.processThreeWayReconciliation({
                ...reconciliationDto,
                consignmentId: claim.consignmentId,
            });
            // Update claim with reconciliation status
            await this.uppfClaimsService.updateClaim(id, {
                threeWayReconciled: reconciliation.isWithinTolerance,
                lastModifiedBy: user.username,
            });
            this.logger.log(`Three-way reconciliation completed for claim ${id}`);
            return reconciliation;
        }
        catch (error) {
            this.logger.error(`Failed to perform reconciliation for claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Get claim anomalies
     */
    async getClaimAnomalies(id, user) {
        try {
            this.logger.log(`Retrieving anomalies for claim ${id} by user ${user.username}`);
            const claim = await this.uppfClaimsService.findById(id);
            if (!claim) {
                throw new common_1.NotFoundException('UPPF claim not found');
            }
            const anomalies = await this.uppfClaimsService.getClaimAnomalies(id);
            return anomalies;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve anomalies for claim ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Export claims data
     */
    async exportClaimsCSV(queryDto, user) {
        try {
            this.logger.log(`Exporting UPPF claims to CSV for user ${user.username}`);
            const csvData = await this.uppfClaimsService.exportToCSV(queryDto);
            return {
                data: csvData,
                filename: `uppf-claims-${new Date().toISOString().split('T')[0]}.csv`,
                contentType: 'text/csv',
            };
        }
        catch (error) {
            this.logger.error(`Failed to export claims to CSV: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Helper methods
    validateStatusTransition(currentStatus, newStatus, user) {
        const allowedTransitions = {
            [uppf_entities_1.UPPFClaimStatus.DRAFT]: [uppf_entities_1.UPPFClaimStatus.READY_TO_SUBMIT, uppf_entities_1.UPPFClaimStatus.CANCELLED],
            [uppf_entities_1.UPPFClaimStatus.READY_TO_SUBMIT]: [uppf_entities_1.UPPFClaimStatus.SUBMITTED, uppf_entities_1.UPPFClaimStatus.DRAFT],
            [uppf_entities_1.UPPFClaimStatus.SUBMITTED]: [uppf_entities_1.UPPFClaimStatus.UNDER_REVIEW, uppf_entities_1.UPPFClaimStatus.REJECTED],
            [uppf_entities_1.UPPFClaimStatus.UNDER_REVIEW]: [uppf_entities_1.UPPFClaimStatus.APPROVED, uppf_entities_1.UPPFClaimStatus.REJECTED],
            [uppf_entities_1.UPPFClaimStatus.APPROVED]: [uppf_entities_1.UPPFClaimStatus.SETTLED],
            [uppf_entities_1.UPPFClaimStatus.SETTLED]: [], // No transitions allowed from settled
            [uppf_entities_1.UPPFClaimStatus.REJECTED]: [uppf_entities_1.UPPFClaimStatus.DRAFT], // Allow resubmission
            [uppf_entities_1.UPPFClaimStatus.CANCELLED]: [], // No transitions allowed from cancelled
        };
        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
        // Additional role-based validation
        if (newStatus === uppf_entities_1.UPPFClaimStatus.APPROVED && !user.roles.includes('finance_manager') && !user.roles.includes('admin')) {
            throw new common_1.UnauthorizedException('Only finance managers can approve claims');
        }
        if (newStatus === uppf_entities_1.UPPFClaimStatus.SETTLED && !user.roles.includes('finance_manager') && !user.roles.includes('admin')) {
            throw new common_1.UnauthorizedException('Only finance managers can settle claims');
        }
    }
};
exports.UPPFClaimsController = UPPFClaimsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create UPPF claim',
        description: 'Create a new UPPF claim with automatic calculation and validation'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'UPPF claim created successfully',
        type: uppf_entities_1.UPPFClaim
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Claim already exists for this consignment' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "createClaim", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get UPPF claims',
        description: 'Retrieve UPPF claims with advanced filtering, sorting, and pagination'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UPPF claims retrieved successfully'
    }),
    (0, swagger_1.ApiQuery)({ name: 'windowId', required: false, description: 'Filter by pricing window ID' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', required: false, description: 'Filter by dealer ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: uppf_entities_1.UPPFClaimStatus, isArray: true, description: 'Filter by claim status' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: uppf_entities_1.ClaimPriority, isArray: true, description: 'Filter by priority' }),
    (0, swagger_1.ApiQuery)({ name: 'automationLevel', required: false, enum: uppf_entities_1.AutomationLevel, isArray: true, description: 'Filter by automation level' }),
    (0, swagger_1.ApiQuery)({ name: 'productType', required: false, enum: uppf_entities_1.ProductType, isArray: true, description: 'Filter by product type' }),
    (0, swagger_1.ApiQuery)({ name: 'minAmount', required: false, type: Number, description: 'Minimum claim amount' }),
    (0, swagger_1.ApiQuery)({ name: 'maxAmount', required: false, type: Number, description: 'Maximum claim amount' }),
    (0, swagger_1.ApiQuery)({ name: 'minQualityScore', required: false, type: Number, description: 'Minimum quality score' }),
    (0, swagger_1.ApiQuery)({ name: 'hasAnomalies', required: false, type: Boolean, description: 'Filter claims with anomalies' }),
    (0, swagger_1.ApiQuery)({ name: 'blockchainVerified', required: false, type: Boolean, description: 'Filter blockchain verified claims' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: Date, description: 'Filter from date' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: Date, description: 'Filter to date' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "getClaims", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get UPPF claim by ID',
        description: 'Retrieve a specific UPPF claim with full details including anomalies and audit trail'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UPPF claim retrieved successfully',
        type: uppf_entities_1.UPPFClaim
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UPPF claim not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "getClaimById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update UPPF claim',
        description: 'Update UPPF claim status, priority, or other editable fields'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'UPPF claim updated successfully',
        type: uppf_entities_1.UPPFClaim
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UPPF claim not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid update data' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "updateClaim", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete UPPF claim',
        description: 'Soft delete a UPPF claim (only allowed for draft claims)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF claim deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'UPPF claim not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete non-draft claim' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "deleteClaim", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit UPPF claim to NPA',
        description: 'Submit a specific UPPF claim to NPA for processing'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Claim submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Claim not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Claim not ready for submission' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "submitClaim", null);
__decorate([
    (0, common_1.Post)('bulk/submit'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk submit UPPF claims to NPA',
        description: 'Submit multiple UPPF claims to NPA in a single batch'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Claims submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof bulk_action_dto_1.BulkActionDto !== "undefined" && bulk_action_dto_1.BulkActionDto) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "bulkSubmitClaims", null);
__decorate([
    (0, common_1.Post)('bulk/action'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform bulk actions on UPPF claims',
        description: 'Perform bulk actions like status updates, priority changes, etc.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk action completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bulk_action_dto_1.BulkActionDto !== "undefined" && bulk_action_dto_1.BulkActionDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "bulkAction", null);
__decorate([
    (0, common_1.Get)('statistics/summary'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get UPPF claims statistics',
        description: 'Retrieve comprehensive statistics for UPPF claims'
    }),
    (0, swagger_1.ApiQuery)({ name: 'windowId', required: false, description: 'Filter by pricing window' }),
    (0, swagger_1.ApiQuery)({ name: 'dealerId', required: false, description: 'Filter by dealer' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: Date, description: 'Statistics from date' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: Date, description: 'Statistics to date' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "getClaimsStatistics", null);
__decorate([
    (0, common_1.Post)(':id/validate-gps'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate GPS for UPPF claim',
        description: 'Trigger GPS validation for a specific claim'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'GPS validation completed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "validateGPS", null);
__decorate([
    (0, common_1.Post)(':id/reconcile'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform three-way reconciliation',
        description: 'Perform three-way reconciliation for a claim'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Three-way reconciliation completed' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "performReconciliation", null);
__decorate([
    (0, common_1.Get)(':id/anomalies'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'admin', 'viewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get claim anomalies',
        description: 'Retrieve all anomalies detected for a specific claim'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UPPF claim ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Anomalies retrieved successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "getClaimAnomalies", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_decorator_1.Roles)('uppf_manager', 'operations_manager', 'finance_manager', 'admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export UPPF claims to CSV',
        description: 'Export filtered UPPF claims data to CSV format'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CSV export generated successfully',
        headers: {
            'Content-Type': { description: 'text/csv' },
            'Content-Disposition': { description: 'attachment; filename="uppf-claims.csv"' },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UPPFClaimsController.prototype, "exportClaimsCSV", null);
exports.UPPFClaimsController = UPPFClaimsController = UPPFClaimsController_1 = __decorate([
    (0, swagger_1.ApiTags)('UPPF Claims'),
    (0, common_1.Controller)('uppf/claims'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor, transform_interceptor_1.TransformInterceptor),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiExtraModels)(uppf_entities_1.UPPFClaim, uppf_entities_1.ClaimAnomaly, uppf_entities_1.ThreeWayReconciliation),
    __metadata("design:paramtypes", [uppf_claims_service_1.UPPFClaimsService,
        three_way_reconciliation_service_1.ThreeWayReconciliationService,
        gps_validation_service_1.GPSValidationService,
        npa_submission_service_1.NPASubmissionService,
        event_emitter_1.EventEmitter2])
], UPPFClaimsController);
//# sourceMappingURL=uppf-claims.controller.js.map