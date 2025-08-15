import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Logger,
  BadRequestException,
  NotFoundException,
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
import { UPPFSettlementsService } from '../settlements/uppf-settlements.service';
import { UPPFClaimsService } from '../claims/uppf-claims.service';
import {
  UPPFSettlement,
  SettlementStatus,
  CreateUPPFSettlementDto,
} from '../entities/uppf-entities';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

interface User {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
}

interface SettlementQueryDto {
  windowId?: string;
  status?: SettlementStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface SettlementSummaryDto {
  totalSettlements: number;
  totalAmount: number;
  totalClaims: number;
  averageProcessingDays: number;
  settlementsByStatus: { [key: string]: number };
  monthlyTrends: Array<{
    month: string;
    settlements: number;
    amount: number;
    claims: number;
  }>;
  performanceMetrics: {
    efficiency: number;
    successRate: number;
    varianceRate: number;
    complianceScore: number;
  };
}

interface ProcessSettlementDto {
  windowId: string;
  claimIds: string[];
  settlementAmount: number;
  npaPenalties?: number;
  performanceBonuses?: number;
  npaSubmissionRef?: string;
  paymentReference?: string;
  notes?: string;
}

@ApiTags('UPPF Settlements')
@Controller('uppf/settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@ApiBearerAuth()
@ApiExtraModels(UPPFSettlement)
export class UPPFSettlementsController {
  private readonly logger = new Logger(UPPFSettlementsController.name);

  constructor(
    private readonly settlementsService: UPPFSettlementsService,
    private readonly claimsService: UPPFClaimsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new UPPF settlement
   */
  @Post()
  @Roles('finance_manager', 'admin')
  @ApiOperation({ 
    summary: 'Create UPPF settlement',
    description: 'Create a new UPPF settlement for a pricing window'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Settlement created successfully',
    type: UPPFSettlement 
  })
  @ApiResponse({ status: 400, description: 'Invalid settlement data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Finance manager role required' })
  async createSettlement(
    @Body() createSettlementDto: CreateUPPFSettlementDto,
    @CurrentUser() user: User,
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Creating UPPF settlement for window ${createSettlementDto.windowId} by user ${user.username}`);

      // Validate that all claims exist and are approved
      const claims = await this.claimsService.findByIds(createSettlementDto.claimIds);
      const unapprovedClaims = claims.filter(claim => claim.status !== 'approved');
      
      if (unapprovedClaims.length > 0) {
        throw new BadRequestException(
          `Cannot settle unapproved claims: ${unapprovedClaims.map(c => c.claimNumber).join(', ')}`
        );
      }

      // Check if settlement already exists for this window
      const existingSettlement = await this.settlementsService.findByWindowId(createSettlementDto.windowId);
      if (existingSettlement) {
        throw new BadRequestException(`Settlement already exists for window ${createSettlementDto.windowId}`);
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

    } catch (error) {
      this.logger.error(`Failed to create UPPF settlement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all settlements with filtering and pagination
   */
  @Get()
  @Roles('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get UPPF settlements',
    description: 'Retrieve UPPF settlements with filtering and pagination'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Settlements retrieved successfully'
  })
  @ApiQuery({ name: 'windowId', required: false, description: 'Filter by pricing window ID' })
  @ApiQuery({ name: 'status', required: false, enum: SettlementStatus, isArray: true, description: 'Filter by settlement status' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date, description: 'Filter from date' })
  @ApiQuery({ name: 'dateTo', required: false, type: Date, description: 'Filter to date' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum settlement amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum settlement amount' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: settlementDate)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  async getSettlements(
    @Query() queryDto: SettlementQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<UPPFSettlement>> {
    try {
      this.logger.log(`Retrieving UPPF settlements for user ${user.username}`);

      const result = await this.settlementsService.findWithPagination(queryDto);
      
      this.logger.log(`Retrieved ${result.items.length} settlements (${result.total} total)`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to retrieve settlements: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a specific settlement by ID
   */
  @Get(':id')
  @Roles('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get settlement by ID',
    description: 'Retrieve a specific settlement with full details'
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Settlement retrieved successfully',
    type: UPPFSettlement 
  })
  @ApiResponse({ status: 404, description: 'Settlement not found' })
  async getSettlementById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Retrieving settlement ${id} for user ${user.username}`);

      const settlement = await this.settlementsService.findByIdWithClaims(id);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      return settlement;

    } catch (error) {
      this.logger.error(`Failed to retrieve settlement ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process settlement payment
   */
  @Put(':id/process')
  @Roles('finance_manager', 'admin')
  @ApiOperation({ 
    summary: 'Process settlement payment',
    description: 'Mark settlement as processed and update payment details'
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ status: 200, description: 'Settlement processed successfully' })
  @ApiResponse({ status: 404, description: 'Settlement not found' })
  @ApiResponse({ status: 400, description: 'Settlement cannot be processed' })
  async processSettlement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() processDto: ProcessSettlementDto,
    @CurrentUser() user: User,
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Processing settlement ${id} by user ${user.username}`);

      const settlement = await this.settlementsService.findById(id);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      if (settlement.status !== SettlementStatus.PENDING) {
        throw new BadRequestException('Settlement is not in pending status');
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

    } catch (error) {
      this.logger.error(`Failed to process settlement ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get settlement summary and statistics
   */
  @Get('statistics/summary')
  @Roles('finance_manager', 'uppf_manager', 'operations_manager', 'admin', 'viewer')
  @ApiOperation({ 
    summary: 'Get settlement statistics',
    description: 'Retrieve comprehensive settlement statistics and performance metrics'
  })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date, description: 'Statistics from date' })
  @ApiQuery({ name: 'dateTo', required: false, type: Date, description: 'Statistics to date' })
  @ApiQuery({ name: 'windowId', required: false, description: 'Filter by specific window' })
  @ApiResponse({ 
    status: 200, 
    description: 'Settlement statistics retrieved successfully'
  })
  async getSettlementStatistics(
    @Query() queryDto: any,
    @CurrentUser() user: User,
  ): Promise<SettlementSummaryDto> {
    try {
      this.logger.log(`Retrieving settlement statistics for user ${user.username}`);

      const statistics = await this.settlementsService.getSettlementStatistics(queryDto);
      
      return statistics;

    } catch (error) {
      this.logger.error(`Failed to retrieve settlement statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate settlement report
   */
  @Post(':id/report')
  @Roles('finance_manager', 'uppf_manager', 'admin')
  @ApiOperation({ 
    summary: 'Generate settlement report',
    description: 'Generate a comprehensive settlement report with claims breakdown'
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Settlement report generated successfully'
  })
  async generateSettlementReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @CurrentUser() user: User,
  ): Promise<{ reportUrl: string; reportId: string }> {
    try {
      this.logger.log(`Generating settlement report for ${id} in ${format} format by user ${user.username}`);

      const settlement = await this.settlementsService.findByIdWithClaims(id);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      const report = await this.settlementsService.generateSettlementReport(id, format, user.username);

      this.logger.log(`Settlement report generated: ${report.reportId}`);
      return report;

    } catch (error) {
      this.logger.error(`Failed to generate settlement report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reconcile settlement with bank payment
   */
  @Put(':id/reconcile')
  @Roles('finance_manager', 'admin')
  @ApiOperation({ 
    summary: 'Reconcile settlement with bank payment',
    description: 'Reconcile settlement with actual bank payment received'
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ status: 200, description: 'Settlement reconciled successfully' })
  async reconcileSettlement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reconcileDto: {
      bankTransactionRef: string;
      actualAmount: number;
      reconciliationDate: Date;
      notes?: string;
    },
    @CurrentUser() user: User,
  ): Promise<UPPFSettlement> {
    try {
      this.logger.log(`Reconciling settlement ${id} with bank payment by user ${user.username}`);

      const settlement = await this.settlementsService.findById(id);
      if (!settlement) {
        throw new NotFoundException('Settlement not found');
      }

      if (settlement.status !== SettlementStatus.PROCESSING) {
        throw new BadRequestException('Settlement must be in processing status for reconciliation');
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

    } catch (error) {
      this.logger.error(`Failed to reconcile settlement ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get claims eligible for settlement
   */
  @Get('eligible-claims/:windowId')
  @Roles('finance_manager', 'uppf_manager', 'admin')
  @ApiOperation({ 
    summary: 'Get claims eligible for settlement',
    description: 'Retrieve approved claims eligible for settlement in a pricing window'
  })
  @ApiParam({ name: 'windowId', description: 'Pricing window ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Eligible claims retrieved successfully'
  })
  async getEligibleClaims(
    @Param('windowId') windowId: string,
    @CurrentUser() user: User,
  ): Promise<any[]> {
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

    } catch (error) {
      this.logger.error(`Failed to retrieve eligible claims: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export settlement data
   */
  @Get('export/csv')
  @Roles('finance_manager', 'uppf_manager', 'admin')
  @ApiOperation({ 
    summary: 'Export settlements to CSV',
    description: 'Export settlement data to CSV format'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'CSV export generated successfully'
  })
  async exportSettlementsCSV(
    @Query() queryDto: SettlementQueryDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    try {
      this.logger.log(`Exporting settlements to CSV for user ${user.username}`);

      const csvData = await this.settlementsService.exportToCSV(queryDto);
      
      return {
        data: csvData,
        filename: `uppf-settlements-${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv',
      };

    } catch (error) {
      this.logger.error(`Failed to export settlements to CSV: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper methods
  private groupClaimsByDealer(claims: any[]): any {
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

  private groupClaimsByProduct(claims: any[]): any {
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
}