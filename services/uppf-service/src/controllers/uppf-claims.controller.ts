import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpException,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { UPPFClaimsService } from '../claims/uppf-claims.service';
import { ThreeWayReconciliationService } from '../claims/three-way-reconciliation.service';
import { GPSValidationService } from '../claims/gps-validation.service';
import { NPASubmissionService } from '../claims/npa-submission.service';
import {
  UPPFClaim,
  ClaimAnomaly,
  ThreeWayReconciliation,
  UPPFClaimStatus,
  ClaimPriority,
  AutomationLevel,
  ProductType,
  CreateUPPFClaimDto,
  UpdateUPPFClaimDto,
  UPPFClaimQueryDto,
  CreateThreeWayReconciliationDto,
} from '../entities/uppf-entities';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';
import { BulkActionDto, BulkActionResult } from '../dto/bulk-action.dto';
import { UPPFClaimStatisticsDto } from '../dto/statistics.dto';

interface User {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
}

@ApiTags('UPPF Claims')
@Controller('uppf/claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
@ApiExtraModels(UPPFClaim, ClaimAnomaly, ThreeWayReconciliation)
export class UPPFClaimsController {
  private readonly logger = new Logger(UPPFClaimsController.name);

  constructor(
    private readonly uppfClaimsService: UPPFClaimsService,
    private readonly threeWayReconciliationService: ThreeWayReconciliationService,
    private readonly gpsValidationService: GPSValidationService,
    private readonly npaSubmissionService: NPASubmissionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new UPPF claim
   */
  @Post()
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Create UPPF claim',
    description: 'Create a new UPPF claim with automatic calculation and validation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'UPPF claim created successfully',
    type: UPPFClaim 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Claim already exists for this consignment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createClaim(
    @Body() createClaimDto: CreateUPPFClaimDto,
    @CurrentUser() user: User,
  ): Promise<UPPFClaim> {
    try {
      this.logger.log(`Creating UPPF claim for consignment ${createClaimDto.consignmentId} by user ${user.username}`);

      // Check if claim already exists for this consignment
      const existingClaim = await this.uppfClaimsService.findByConsignmentId(createClaimDto.consignmentId);
      if (existingClaim) {
        throw new ConflictException('UPPF claim already exists for this consignment');
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

    } catch (error) {
      this.logger.error(`Failed to create UPPF claim: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all UPPF claims with filtering and pagination
   */
  @Get()
  @Roles('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get UPPF claims',
    description: 'Retrieve UPPF claims with advanced filtering, sorting, and pagination'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'UPPF claims retrieved successfully'
  })
  @ApiQuery({ name: 'windowId', required: false, description: 'Filter by pricing window ID' })
  @ApiQuery({ name: 'dealerId', required: false, description: 'Filter by dealer ID' })
  @ApiQuery({ name: 'status', required: false, enum: UPPFClaimStatus, isArray: true, description: 'Filter by claim status' })
  @ApiQuery({ name: 'priority', required: false, enum: ClaimPriority, isArray: true, description: 'Filter by priority' })
  @ApiQuery({ name: 'automationLevel', required: false, enum: AutomationLevel, isArray: true, description: 'Filter by automation level' })
  @ApiQuery({ name: 'productType', required: false, enum: ProductType, isArray: true, description: 'Filter by product type' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum claim amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum claim amount' })
  @ApiQuery({ name: 'minQualityScore', required: false, type: Number, description: 'Minimum quality score' })
  @ApiQuery({ name: 'hasAnomalies', required: false, type: Boolean, description: 'Filter claims with anomalies' })
  @ApiQuery({ name: 'blockchainVerified', required: false, type: Boolean, description: 'Filter blockchain verified claims' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date, description: 'Filter from date' })
  @ApiQuery({ name: 'dateTo', required: false, type: Date, description: 'Filter to date' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  async getClaims(
    @Query() queryDto: UPPFClaimQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<UPPFClaim>> {
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

    } catch (error) {
      this.logger.error(`Failed to retrieve UPPF claims: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a specific UPPF claim by ID
   */
  @Get(':id')
  @Roles('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get UPPF claim by ID',
    description: 'Retrieve a specific UPPF claim with full details including anomalies and audit trail'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'UPPF claim retrieved successfully',
    type: UPPFClaim 
  })
  @ApiResponse({ status: 404, description: 'UPPF claim not found' })
  async getClaimById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<UPPFClaim> {
    try {
      this.logger.log(`Retrieving UPPF claim ${id} for user ${user.username}`);

      const claim = await this.uppfClaimsService.findByIdWithDetails(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
      }

      // Check access permissions
      if (!user.roles.includes('admin') && !user.roles.includes('uppf_manager')) {
        if (user.roles.includes('dealer') && claim.dealerId !== user.id) {
          throw new UnauthorizedException('Access denied to this claim');
        }
      }

      return claim;

    } catch (error) {
      this.logger.error(`Failed to retrieve UPPF claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a UPPF claim
   */
  @Put(':id')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Update UPPF claim',
    description: 'Update UPPF claim status, priority, or other editable fields'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'UPPF claim updated successfully',
    type: UPPFClaim 
  })
  @ApiResponse({ status: 404, description: 'UPPF claim not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async updateClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClaimDto: UpdateUPPFClaimDto,
    @CurrentUser() user: User,
  ): Promise<UPPFClaim> {
    try {
      this.logger.log(`Updating UPPF claim ${id} by user ${user.username}`);

      const existingClaim = await this.uppfClaimsService.findById(id);
      if (!existingClaim) {
        throw new NotFoundException('UPPF claim not found');
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

    } catch (error) {
      this.logger.error(`Failed to update UPPF claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a UPPF claim (soft delete)
   */
  @Delete(':id')
  @Roles('uppf_manager', 'admin')
  @ApiOperation({ 
    summary: 'Delete UPPF claim',
    description: 'Soft delete a UPPF claim (only allowed for draft claims)'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ status: 200, description: 'UPPF claim deleted successfully' })
  @ApiResponse({ status: 404, description: 'UPPF claim not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-draft claim' })
  async deleteClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting UPPF claim ${id} by user ${user.username}`);

      const claim = await this.uppfClaimsService.findById(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
      }

      // Only allow deletion of draft claims
      if (claim.status !== UPPFClaimStatus.DRAFT) {
        throw new BadRequestException('Only draft claims can be deleted');
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

    } catch (error) {
      this.logger.error(`Failed to delete UPPF claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Submit claims to NPA
   */
  @Post(':id/submit')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Submit UPPF claim to NPA',
    description: 'Submit a specific UPPF claim to NPA for processing'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ status: 200, description: 'Claim submitted successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiResponse({ status: 400, description: 'Claim not ready for submission' })
  async submitClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ submissionRef: string; message: string }> {
    try {
      this.logger.log(`Submitting UPPF claim ${id} to NPA by user ${user.username}`);

      const claim = await this.uppfClaimsService.findById(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
      }

      if (claim.status !== UPPFClaimStatus.READY_TO_SUBMIT) {
        throw new BadRequestException('Claim is not ready for submission');
      }

      const submissionResult = await this.npaSubmissionService.submitSingleClaim(id, user.username);

      this.logger.log(`UPPF claim ${id} submitted to NPA successfully`);
      return {
        submissionRef: submissionResult.submissionReference,
        message: 'Claim submitted to NPA successfully',
      };

    } catch (error) {
      this.logger.error(`Failed to submit UPPF claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Bulk submit claims to NPA
   */
  @Post('bulk/submit')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Bulk submit UPPF claims to NPA',
    description: 'Submit multiple UPPF claims to NPA in a single batch'
  })
  @ApiResponse({ status: 200, description: 'Claims submitted successfully' })
  async bulkSubmitClaims(
    @Body() bulkActionDto: BulkActionDto,
    @CurrentUser() user: User,
  ): Promise<BulkActionResult> {
    try {
      this.logger.log(`Bulk submitting ${bulkActionDto.claimIds.length} UPPF claims by user ${user.username}`);

      const result = await this.npaSubmissionService.submitBulkClaims(
        bulkActionDto.claimIds,
        user.username,
      );

      // Emit bulk submission event
      this.eventEmitter.emit('uppf.bulk_submission.completed', {
        claimIds: bulkActionDto.claimIds,
        submissionRef: result.submissionReference,
        submittedBy: user.username,
        timestamp: new Date(),
      });

      this.logger.log(`Bulk submission completed: ${result.successCount} successful, ${result.failureCount} failed`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to bulk submit UPPF claims: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform bulk actions on claims
   */
  @Post('bulk/action')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Perform bulk actions on UPPF claims',
    description: 'Perform bulk actions like status updates, priority changes, etc.'
  })
  @ApiResponse({ status: 200, description: 'Bulk action completed successfully' })
  async bulkAction(
    @Body() bulkActionDto: BulkActionDto,
    @CurrentUser() user: User,
  ): Promise<BulkActionResult> {
    try {
      this.logger.log(`Performing bulk action ${bulkActionDto.action} on ${bulkActionDto.claimIds.length} claims by user ${user.username}`);

      const result = await this.uppfClaimsService.performBulkAction(
        bulkActionDto.action,
        bulkActionDto.claimIds,
        bulkActionDto.actionData,
        user.username,
      );

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

    } catch (error) {
      this.logger.error(`Failed to perform bulk action: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get claim statistics
   */
  @Get('statistics/summary')
  @Roles('uppf_manager', 'operations_manager', 'finance_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get UPPF claims statistics',
    description: 'Retrieve comprehensive statistics for UPPF claims'
  })
  @ApiQuery({ name: 'windowId', required: false, description: 'Filter by pricing window' })
  @ApiQuery({ name: 'dealerId', required: false, description: 'Filter by dealer' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date, description: 'Statistics from date' })
  @ApiQuery({ name: 'dateTo', required: false, type: Date, description: 'Statistics to date' })
  async getClaimsStatistics(
    @Query() queryDto: any,
    @CurrentUser() user: User,
  ): Promise<UPPFClaimStatisticsDto> {
    try {
      this.logger.log(`Retrieving UPPF claims statistics for user ${user.username}`);

      const statistics = await this.uppfClaimsService.getClaimsStatistics(queryDto);
      
      return statistics;

    } catch (error) {
      this.logger.error(`Failed to retrieve claims statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate GPS for a claim
   */
  @Post(':id/validate-gps')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Validate GPS for UPPF claim',
    description: 'Trigger GPS validation for a specific claim'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ status: 200, description: 'GPS validation completed' })
  async validateGPS(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    try {
      this.logger.log(`Validating GPS for UPPF claim ${id} by user ${user.username}`);

      const claim = await this.uppfClaimsService.findById(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
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

    } catch (error) {
      this.logger.error(`Failed to validate GPS for claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform three-way reconciliation
   */
  @Post(':id/reconcile')
  @Roles('uppf_manager', 'operations_manager', 'admin')
  @ApiOperation({ 
    summary: 'Perform three-way reconciliation',
    description: 'Perform three-way reconciliation for a claim'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ status: 200, description: 'Three-way reconciliation completed' })
  async performReconciliation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reconciliationDto: CreateThreeWayReconciliationDto,
    @CurrentUser() user: User,
  ): Promise<ThreeWayReconciliation> {
    try {
      this.logger.log(`Performing three-way reconciliation for claim ${id} by user ${user.username}`);

      const claim = await this.uppfClaimsService.findById(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
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

    } catch (error) {
      this.logger.error(`Failed to perform reconciliation for claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get claim anomalies
   */
  @Get(':id/anomalies')
  @Roles('uppf_manager', 'operations_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get claim anomalies',
    description: 'Retrieve all anomalies detected for a specific claim'
  })
  @ApiParam({ name: 'id', description: 'UPPF claim ID' })
  @ApiResponse({ status: 200, description: 'Anomalies retrieved successfully' })
  async getClaimAnomalies(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ClaimAnomaly[]> {
    try {
      this.logger.log(`Retrieving anomalies for claim ${id} by user ${user.username}`);

      const claim = await this.uppfClaimsService.findById(id);
      if (!claim) {
        throw new NotFoundException('UPPF claim not found');
      }

      const anomalies = await this.uppfClaimsService.getClaimAnomalies(id);
      
      return anomalies;

    } catch (error) {
      this.logger.error(`Failed to retrieve anomalies for claim ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export claims data
   */
  @Get('export/csv')
  @Roles('uppf_manager', 'operations_manager', 'finance_manager', 'admin')
  @ApiOperation({ 
    summary: 'Export UPPF claims to CSV',
    description: 'Export filtered UPPF claims data to CSV format'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV export generated successfully',
    headers: {
      'Content-Type': { description: 'text/csv' },
      'Content-Disposition': { description: 'attachment; filename="uppf-claims.csv"' },
    },
  })
  async exportClaimsCSV(
    @Query() queryDto: UPPFClaimQueryDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    try {
      this.logger.log(`Exporting UPPF claims to CSV for user ${user.username}`);

      const csvData = await this.uppfClaimsService.exportToCSV(queryDto);
      
      return {
        data: csvData,
        filename: `uppf-claims-${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv',
      };

    } catch (error) {
      this.logger.error(`Failed to export claims to CSV: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper methods
  private validateStatusTransition(
    currentStatus: UPPFClaimStatus, 
    newStatus: UPPFClaimStatus, 
    user: User
  ): void {
    const allowedTransitions: { [key in UPPFClaimStatus]: UPPFClaimStatus[] } = {
      [UPPFClaimStatus.DRAFT]: [UPPFClaimStatus.READY_TO_SUBMIT, UPPFClaimStatus.CANCELLED],
      [UPPFClaimStatus.READY_TO_SUBMIT]: [UPPFClaimStatus.SUBMITTED, UPPFClaimStatus.DRAFT],
      [UPPFClaimStatus.SUBMITTED]: [UPPFClaimStatus.UNDER_REVIEW, UPPFClaimStatus.REJECTED],
      [UPPFClaimStatus.UNDER_REVIEW]: [UPPFClaimStatus.APPROVED, UPPFClaimStatus.REJECTED],
      [UPPFClaimStatus.APPROVED]: [UPPFClaimStatus.SETTLED],
      [UPPFClaimStatus.SETTLED]: [], // No transitions allowed from settled
      [UPPFClaimStatus.REJECTED]: [UPPFClaimStatus.DRAFT], // Allow resubmission
      [UPPFClaimStatus.CANCELLED]: [], // No transitions allowed from cancelled
    };

    const allowed = allowedTransitions[currentStatus] || [];
    
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Additional role-based validation
    if (newStatus === UPPFClaimStatus.APPROVED && !user.roles.includes('finance_manager') && !user.roles.includes('admin')) {
      throw new UnauthorizedException('Only finance managers can approve claims');
    }

    if (newStatus === UPPFClaimStatus.SETTLED && !user.roles.includes('finance_manager') && !user.roles.includes('admin')) {
      throw new UnauthorizedException('Only finance managers can settle claims');
    }
  }
}