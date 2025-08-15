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
  UploadedFile,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { PriceBuildupService } from '../services/price-buildup.service';
import { StationTypeConfigurationService } from '../services/station-type-config.service';
import {
  CreatePriceBuildupVersionDto,
  UpdatePriceBuildupVersionDto,
  ApprovePriceBuildupDto,
  PublishPriceBuildupDto,
  PriceBuildupQueryDto,
  StationTypeConfigurationDto,
  BulkPriceUpdateDto,
  ExcelUploadDto,
  PriceCalculationRequestDto,
  PriceCalculationResponseDto,
  AuditTrailQueryDto,
} from '../dto/price-buildup.dto';
import { PriceBuildupVersion, StationType, ProductType } from '../entities/price-buildup.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Price Build-up Configuration')
@Controller('price-buildup')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PriceBuildupController {
  constructor(
    private readonly priceBuildupService: PriceBuildupService,
    private readonly stationTypeConfigService: StationTypeConfigurationService,
  ) {}

  // ===== PRICE BUILDUP VERSION MANAGEMENT =====

  @Post('versions')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Create new price buildup version' })
  @ApiResponse({ status: 201, description: 'Price buildup version created successfully', type: PriceBuildupVersion })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - overlapping effective dates' })
  async createPriceBuildupVersion(
    @Body() createDto: CreatePriceBuildupVersionDto,
    @CurrentUser() user: any,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.createPriceBuildupVersion(createDto, user.id);
  }

  @Get('versions')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get price buildup versions with filtering' })
  @ApiResponse({ status: 200, description: 'Price buildup versions retrieved successfully' })
  async getPriceBuildupVersions(
    @Query() query: PriceBuildupQueryDto,
  ): Promise<{
    data: PriceBuildupVersion[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.priceBuildupService.findPriceBuildupVersions(query);
  }

  @Get('versions/:id')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get price buildup version by ID' })
  @ApiParam({ name: 'id', description: 'Price buildup version ID' })
  @ApiResponse({ status: 200, description: 'Price buildup version found', type: PriceBuildupVersion })
  @ApiResponse({ status: 404, description: 'Price buildup version not found' })
  async getPriceBuildupVersionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.findBuildupVersionById(id);
  }

  @Put('versions/:id')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Update price buildup version' })
  @ApiParam({ name: 'id', description: 'Price buildup version ID' })
  @ApiResponse({ status: 200, description: 'Price buildup version updated successfully', type: PriceBuildupVersion })
  @ApiResponse({ status: 400, description: 'Bad request - cannot modify published version' })
  @ApiResponse({ status: 404, description: 'Price buildup version not found' })
  async updatePriceBuildupVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePriceBuildupVersionDto,
    @CurrentUser() user: any,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.updatePriceBuildupVersion(id, updateDto, user.id);
  }

  @Post('versions/:id/approve')
  @Roles('admin', 'pricing_approver')
  @ApiOperation({ summary: 'Approve price buildup version' })
  @ApiParam({ name: 'id', description: 'Price buildup version ID' })
  @ApiResponse({ status: 200, description: 'Price buildup version approved successfully', type: PriceBuildupVersion })
  @ApiResponse({ status: 400, description: 'Bad request - version cannot be approved' })
  async approvePriceBuildupVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApprovePriceBuildupDto,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.approvePriceBuildupVersion(id, approveDto);
  }

  @Post('versions/:id/publish')
  @Roles('admin', 'pricing_publisher')
  @ApiOperation({ summary: 'Publish price buildup version' })
  @ApiParam({ name: 'id', description: 'Price buildup version ID' })
  @ApiResponse({ status: 200, description: 'Price buildup version published successfully', type: PriceBuildupVersion })
  @ApiResponse({ status: 400, description: 'Bad request - version cannot be published' })
  async publishPriceBuildupVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() publishDto: PublishPriceBuildupDto,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.publishPriceBuildupVersion(id, publishDto);
  }

  // ===== PRICE CALCULATION =====

  @Post('calculate')
  @Roles('admin', 'pricing_manager', 'pricing_viewer', 'station_operator')
  @ApiOperation({ summary: 'Calculate price for specific product and station type' })
  @ApiResponse({ status: 200, description: 'Price calculated successfully', type: PriceCalculationResponseDto })
  @ApiResponse({ status: 404, description: 'No active price buildup found' })
  async calculatePrice(
    @Body() request: PriceCalculationRequestDto,
  ): Promise<PriceCalculationResponseDto> {
    return this.priceBuildupService.calculatePrice(request);
  }

  @Get('history/:productType/:stationType')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get price history for product and station type' })
  @ApiParam({ name: 'productType', enum: ProductType, description: 'Product type' })
  @ApiParam({ name: 'stationType', enum: StationType, description: 'Station type' })
  @ApiQuery({ name: 'fromDate', type: Date, description: 'Start date for history' })
  @ApiQuery({ name: 'toDate', type: Date, description: 'End date for history' })
  @ApiResponse({ status: 200, description: 'Price history retrieved successfully' })
  async getPriceHistory(
    @Param('productType') productType: ProductType,
    @Param('stationType') stationType: StationType,
    @Query('fromDate') fromDate: Date,
    @Query('toDate') toDate: Date,
  ): Promise<PriceCalculationResponseDto[]> {
    return this.priceBuildupService.getPriceHistory(productType, stationType, fromDate, toDate);
  }

  // ===== BULK OPERATIONS =====

  @Post('bulk-update')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Bulk update price components' })
  @ApiResponse({ status: 200, description: 'Bulk update completed successfully', type: PriceBuildupVersion })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async bulkUpdatePrices(
    @Body() bulkUpdateDto: BulkPriceUpdateDto,
    @CurrentUser() user: any,
  ): Promise<PriceBuildupVersion> {
    return this.priceBuildupService.bulkUpdatePrices(bulkUpdateDto, user.id);
  }

  @Post('upload-excel')
  @Roles('admin', 'pricing_manager')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload price components from Excel file' })
  @ApiResponse({ status: 200, description: 'Excel file processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - file validation failed' })
  async uploadFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: ExcelUploadDto,
  ): Promise<{ success: boolean; message: string; errors?: string[]; buildupVersionId?: string }> {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      throw new BadRequestException('Invalid file type. Please upload an Excel (.xlsx) file');
    }

    return this.priceBuildupService.uploadFromExcel(file.buffer, uploadDto);
  }

  @Get('template/excel')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Download Excel template for price component upload' })
  @ApiResponse({ status: 200, description: 'Excel template downloaded successfully' })
  async downloadExcelTemplate(): Promise<any> {
    // TODO: Implement Excel template generation
    throw new BadRequestException('Excel template download not implemented yet');
  }

  // ===== STATION TYPE CONFIGURATION =====

  @Post('station-types')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Create station type configuration' })
  @ApiResponse({ status: 201, description: 'Station type configuration created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - station type already exists' })
  async createStationTypeConfiguration(
    @Body() stationTypeDto: StationTypeConfigurationDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.stationTypeConfigService.createStationTypeConfiguration(stationTypeDto, user.id);
  }

  @Get('station-types')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get all station type configurations' })
  @ApiResponse({ status: 200, description: 'Station type configurations retrieved successfully' })
  async getAllStationTypeConfigurations(): Promise<any[]> {
    return this.stationTypeConfigService.getAllStationTypeConfigurations();
  }

  @Get('station-types/:stationType')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get station type configuration by type' })
  @ApiParam({ name: 'stationType', enum: StationType, description: 'Station type' })
  @ApiResponse({ status: 200, description: 'Station type configuration found' })
  @ApiResponse({ status: 404, description: 'Station type configuration not found' })
  async getStationTypeConfiguration(
    @Param('stationType') stationType: StationType,
  ): Promise<any> {
    const config = await this.stationTypeConfigService.getStationTypeConfiguration(stationType);
    if (!config) {
      throw new BadRequestException(`Station type configuration for ${stationType} not found`);
    }
    return config;
  }

  @Put('station-types/:stationType')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Update station type configuration' })
  @ApiParam({ name: 'stationType', enum: StationType, description: 'Station type' })
  @ApiResponse({ status: 200, description: 'Station type configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Station type configuration not found' })
  async updateStationTypeConfiguration(
    @Param('stationType') stationType: StationType,
    @Body() updateDto: Partial<StationTypeConfigurationDto>,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.stationTypeConfigService.updateStationTypeConfiguration(stationType, updateDto, user.id);
  }

  @Get('station-types/by-product/:productType')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get station types that support a specific product' })
  @ApiParam({ name: 'productType', enum: ProductType, description: 'Product type' })
  @ApiResponse({ status: 200, description: 'Station types retrieved successfully' })
  async getStationTypesByProduct(
    @Param('productType') productType: ProductType,
  ): Promise<StationType[]> {
    return this.stationTypeConfigService.getStationTypesByProduct(productType);
  }

  // ===== AUDIT TRAIL =====

  @Get('audit-trail')
  @Roles('admin', 'pricing_manager', 'auditor')
  @ApiOperation({ summary: 'Get price buildup audit trail' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  async getAuditTrail(
    @Query() query: AuditTrailQueryDto,
  ): Promise<any> {
    return this.priceBuildupService.getAuditTrail(query);
  }

  // ===== UTILITY ENDPOINTS =====

  @Post('initialize-defaults')
  @Roles('admin')
  @ApiOperation({ summary: 'Initialize default station type configurations' })
  @ApiResponse({ status: 200, description: 'Default configurations initialized successfully' })
  @HttpCode(HttpStatus.OK)
  async initializeDefaults(
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.stationTypeConfigService.initializeDefaultStationTypeConfigurations(user.id);
    return { message: 'Default station type configurations initialized successfully' };
  }

  @Post('validate-configuration')
  @Roles('admin', 'pricing_manager')
  @ApiOperation({ summary: 'Validate station type and product combination' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateStationTypeForProduct(
    @Body() validation: { stationType: StationType; productType: ProductType },
  ): Promise<{ valid: boolean; message: string }> {
    const isValid = await this.stationTypeConfigService.validateStationTypeForProduct(
      validation.stationType,
      validation.productType,
    );

    return {
      valid: isValid,
      message: isValid 
        ? `${validation.stationType} supports ${validation.productType}` 
        : `${validation.stationType} does not support ${validation.productType}`,
    };
  }

  @Get('components/applicable/:stationType')
  @Roles('admin', 'pricing_manager', 'pricing_viewer')
  @ApiOperation({ summary: 'Get applicable price components for station type' })
  @ApiParam({ name: 'stationType', enum: StationType, description: 'Station type' })
  @ApiResponse({ status: 200, description: 'Applicable components retrieved successfully' })
  async getApplicableComponents(
    @Param('stationType') stationType: StationType,
  ): Promise<any> {
    const components = await this.stationTypeConfigService.getApplicableComponentsForStationType(stationType);
    return { stationType, applicableComponents: components };
  }
}