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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FinancialService } from '../financial.service';
import { FixedAssetsService } from '../services/fixed-assets.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Fixed Assets Management')
@Controller('financial/fixed-assets')
@UseGuards(ThrottlerGuard, JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FixedAssetsController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly fixedAssetsService: FixedAssetsService,
  ) {}

  @Get()
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Fixed Assets' })
  @ApiResponse({ status: 200, description: 'Fixed assets retrieved' })
  @ApiQuery({ name: 'category', required: false, description: 'Asset category' })
  @ApiQuery({ name: 'status', required: false, description: 'Asset status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Department ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getFixedAssets(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = { category, status, departmentId, page, limit };
    const result = await this.financialService.getFixedAssets(filters);
    
    return {
      success: true,
      data: result,
      filters,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Fixed Asset by ID' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Fixed asset retrieved' })
  async getFixedAsset(@Param('id') assetId: string) {
    const result = await this.fixedAssetsService.getAssetById(assetId);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create Fixed Asset' })
  @ApiResponse({ status: 201, description: 'Fixed asset created successfully' })
  async createFixedAsset(@Body() assetData: any, @Req() req: any) {
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

  @Put(':id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update Fixed Asset' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Fixed asset updated successfully' })
  async updateFixedAsset(
    @Param('id') assetId: string,
    @Body() assetData: any,
    @Req() req: any,
  ) {
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

  @Delete(':id')
  @Permissions('finance:delete')
  @ApiOperation({ summary: 'Delete Fixed Asset' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Fixed asset deleted successfully' })
  async deleteFixedAsset(@Param('id') assetId: string) {
    await this.fixedAssetsService.deleteAsset(assetId);
    
    return {
      success: true,
      message: 'Fixed asset deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== DEPRECIATION MANAGEMENT =====
  @Get(':id/depreciation')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Asset Depreciation Schedule' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Depreciation schedule retrieved' })
  async getDepreciationSchedule(@Param('id') assetId: string) {
    const result = await this.fixedAssetsService.getDepreciationSchedule(assetId);
    
    return {
      success: true,
      data: result,
      assetId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/depreciation/calculate')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Calculate Asset Depreciation' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Depreciation calculated successfully' })
  async calculateDepreciation(
    @Param('id') assetId: string,
    @Body() calculationData: {
      method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
      usefulLife?: number;
      salvageValue?: number;
      depreciationRate?: number;
      unitsProduced?: number;
      totalUnitsExpected?: number;
    },
  ) {
    const result = await this.financialService.calculateDepreciation(
      assetId,
      calculationData.method,
      calculationData,
    );
    
    return {
      success: true,
      data: result,
      assetId,
      method: calculationData.method,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/depreciation/record')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Record Depreciation Entry' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 201, description: 'Depreciation recorded successfully' })
  async recordDepreciation(
    @Param('id') assetId: string,
    @Body() depreciationData: {
      amount: number;
      depreciationDate: string;
      periodId: string;
      notes?: string;
    },
    @Req() req: any,
  ) {
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

  @Post('depreciation/run-batch/:periodId')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Run Batch Depreciation for Period' })
  @ApiParam({ name: 'periodId', description: 'Accounting Period ID' })
  @ApiResponse({ status: 200, description: 'Batch depreciation completed' })
  async runBatchDepreciation(
    @Param('periodId') periodId: string,
    @Req() req: any,
  ) {
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
  @Get(':id/maintenance')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Asset Maintenance History' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Maintenance history retrieved' })
  async getMaintenanceHistory(@Param('id') assetId: string) {
    const result = await this.fixedAssetsService.getMaintenanceHistory(assetId);
    
    return {
      success: true,
      data: result,
      assetId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/maintenance')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Record Asset Maintenance' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 201, description: 'Maintenance recorded successfully' })
  async recordMaintenance(
    @Param('id') assetId: string,
    @Body() maintenanceData: {
      maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
      description: string;
      cost: number;
      maintenanceDate: string;
      performedBy: string;
      nextScheduledDate?: string;
      notes?: string;
    },
    @Req() req: any,
  ) {
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
  @Post(':id/disposal')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Record Asset Disposal' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset disposal recorded successfully' })
  async recordDisposal(
    @Param('id') assetId: string,
    @Body() disposalData: {
      disposalDate: string;
      disposalMethod: 'SALE' | 'SCRAP' | 'DONATION' | 'TRADE_IN';
      disposalValue: number;
      buyerDetails?: string;
      reason: string;
      notes?: string;
    },
    @Req() req: any,
  ) {
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
  @Post(':id/transfer')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Transfer Asset Between Departments/Locations' })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset transferred successfully' })
  async transferAsset(
    @Param('id') assetId: string,
    @Body() transferData: {
      fromDepartmentId?: string;
      toDepartmentId?: string;
      fromLocationId?: string;
      toLocationId?: string;
      transferDate: string;
      reason: string;
      notes?: string;
    },
    @Req() req: any,
  ) {
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
  @Get('reports/depreciation-summary')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Depreciation Summary Report' })
  @ApiResponse({ status: 200, description: 'Depreciation summary retrieved' })
  @ApiQuery({ name: 'periodId', required: false, description: 'Period ID' })
  @ApiQuery({ name: 'category', required: false, description: 'Asset category' })
  async getDepreciationSummary(
    @Query('periodId') periodId?: string,
    @Query('category') category?: string,
  ) {
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

  @Get('reports/asset-register')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Asset Register Report' })
  @ApiResponse({ status: 200, description: 'Asset register retrieved' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date' })
  @ApiQuery({ name: 'category', required: false, description: 'Asset category' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Department ID' })
  async getAssetRegister(
    @Query('asOfDate') asOfDate?: string,
    @Query('category') category?: string,
    @Query('departmentId') departmentId?: string,
  ) {
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

  @Get('reports/maintenance-costs')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Maintenance Costs Report' })
  @ApiResponse({ status: 200, description: 'Maintenance costs report retrieved' })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'assetId', required: false })
  async getMaintenanceCosts(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('assetId') assetId?: string,
  ) {
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
}