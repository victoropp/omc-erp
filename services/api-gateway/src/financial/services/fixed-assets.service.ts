import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

export interface FixedAsset {
  id: string;
  assetNumber: string;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  usefulLife: number;
  salvageValue: number;
  depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
  status: 'ACTIVE' | 'DISPOSED' | 'UNDER_MAINTENANCE' | 'RETIRED';
  locationId?: string;
  departmentId?: string;
  responsiblePersonId?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  warrantyExpiryDate?: string;
  insuranceDetails?: any;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  depreciationDate: string;
  periodId: string;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  method: string;
  isReversed: boolean;
  journalEntryId?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  description: string;
  cost: number;
  maintenanceDate: string;
  performedBy: string;
  nextScheduledDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  attachments?: string[];
  createdAt: string;
  createdBy: string;
}

@Injectable()
export class FixedAssetsService {
  private readonly logger = new Logger(FixedAssetsService.name);
  private readonly serviceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.serviceUrl = this.configService.get('FIXED_ASSETS_SERVICE_URL', 'http://localhost:3006');
  }

  async getAssetById(assetId: string): Promise<FixedAsset> {
    const cacheKey = `fixed_asset:${assetId}`;
    const cached = await this.cacheManager.get<FixedAsset>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.serviceUrl}/assets/${assetId}`)
      );
      
      const asset = response.data;
      await this.cacheManager.set(cacheKey, asset, 600000); // 10 minutes
      
      return asset;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Fixed asset with ID ${assetId} not found`);
      }
      throw error;
    }
  }

  async updateAsset(assetId: string, assetData: Partial<FixedAsset>): Promise<FixedAsset> {
    try {
      const response = await lastValueFrom(
        this.httpService.put(`${this.serviceUrl}/assets/${assetId}`, assetData)
      );
      
      // Clear cache
      await this.cacheManager.del(`fixed_asset:${assetId}`);
      await this.clearAssetCaches();
      
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to update asset ${assetId}`, error.response?.data || error.message);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    // First check if asset can be deleted (no transactions, not disposed, etc.)
    const asset = await this.getAssetById(assetId);
    
    if (asset.status === 'DISPOSED') {
      throw new BadRequestException('Cannot delete disposed asset');
    }

    // Check for existing depreciation entries
    const depreciationEntries = await this.getDepreciationEntries(assetId);
    if (depreciationEntries.length > 0) {
      throw new BadRequestException('Cannot delete asset with depreciation entries');
    }

    try {
      await lastValueFrom(
        this.httpService.delete(`${this.serviceUrl}/assets/${assetId}`)
      );
      
      // Clear caches
      await this.cacheManager.del(`fixed_asset:${assetId}`);
      await this.clearAssetCaches();
      
      this.logger.log(`Asset ${assetId} deleted successfully`);
    } catch (error: any) {
      this.logger.error(`Failed to delete asset ${assetId}`, error.response?.data || error.message);
      throw error;
    }
  }

  async getDepreciationSchedule(assetId: string): Promise<any> {
    const cacheKey = `depreciation_schedule:${assetId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.serviceUrl}/assets/${assetId}/depreciation/schedule`)
      );
      
      const schedule = response.data;
      await this.cacheManager.set(cacheKey, schedule, 1800000); // 30 minutes
      
      return schedule;
    } catch (error: any) {
      this.logger.error(`Failed to get depreciation schedule for asset ${assetId}`, error.message);
      throw error;
    }
  }

  async getDepreciationEntries(assetId: string): Promise<DepreciationEntry[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.serviceUrl}/assets/${assetId}/depreciation/entries`)
      );
      
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get depreciation entries for asset ${assetId}`, error.message);
      throw error;
    }
  }

  async recordDepreciation(depreciationData: {
    assetId: string;
    amount: number;
    depreciationDate: string;
    periodId: string;
    notes?: string;
    recordedBy: string;
    recordedAt: string;
  }): Promise<DepreciationEntry> {
    try {
      // Validate asset exists and is active
      const asset = await this.getAssetById(depreciationData.assetId);
      
      if (asset.status !== 'ACTIVE') {
        throw new BadRequestException('Can only record depreciation for active assets');
      }

      // Check if depreciation would exceed asset cost
      const currentAccumulated = asset.accumulatedDepreciation;
      const newAccumulated = currentAccumulated + depreciationData.amount;
      const maxDepreciation = asset.acquisitionCost - asset.salvageValue;
      
      if (newAccumulated > maxDepreciation) {
        throw new BadRequestException(
          `Depreciation amount would exceed maximum depreciable amount of ${maxDepreciation}`
        );
      }

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.serviceUrl}/assets/${depreciationData.assetId}/depreciation/record`,
          depreciationData
        )
      );
      
      // Clear related caches
      await this.cacheManager.del(`fixed_asset:${depreciationData.assetId}`);
      await this.cacheManager.del(`depreciation_schedule:${depreciationData.assetId}`);
      await this.clearAssetCaches();
      
      this.logger.log(`Depreciation recorded for asset ${depreciationData.assetId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to record depreciation', error.response?.data || error.message);
      throw error;
    }
  }

  async getMaintenanceHistory(assetId: string): Promise<MaintenanceRecord[]> {
    const cacheKey = `maintenance_history:${assetId}`;
    const cached = await this.cacheManager.get<MaintenanceRecord[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.serviceUrl}/assets/${assetId}/maintenance`)
      );
      
      const history = response.data;
      await this.cacheManager.set(cacheKey, history, 600000); // 10 minutes
      
      return history;
    } catch (error: any) {
      this.logger.error(`Failed to get maintenance history for asset ${assetId}`, error.message);
      throw error;
    }
  }

  async recordMaintenance(maintenanceData: {
    assetId: string;
    maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
    description: string;
    cost: number;
    maintenanceDate: string;
    performedBy: string;
    nextScheduledDate?: string;
    notes?: string;
    recordedBy: string;
    recordedAt: string;
  }): Promise<MaintenanceRecord> {
    try {
      // Validate asset exists
      await this.getAssetById(maintenanceData.assetId);

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.serviceUrl}/assets/${maintenanceData.assetId}/maintenance`,
          maintenanceData
        )
      );
      
      // Clear maintenance cache
      await this.cacheManager.del(`maintenance_history:${maintenanceData.assetId}`);
      
      this.logger.log(`Maintenance recorded for asset ${maintenanceData.assetId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to record maintenance', error.response?.data || error.message);
      throw error;
    }
  }

  async recordDisposal(disposalData: {
    assetId: string;
    disposalDate: string;
    disposalMethod: 'SALE' | 'SCRAP' | 'DONATION' | 'TRADE_IN';
    disposalValue: number;
    buyerDetails?: string;
    reason: string;
    notes?: string;
    disposedBy: string;
    disposedAt: string;
  }): Promise<any> {
    try {
      // Validate asset can be disposed
      const asset = await this.getAssetById(disposalData.assetId);
      
      if (asset.status === 'DISPOSED') {
        throw new BadRequestException('Asset is already disposed');
      }

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.serviceUrl}/assets/${disposalData.assetId}/disposal`,
          disposalData
        )
      );
      
      // Clear caches
      await this.cacheManager.del(`fixed_asset:${disposalData.assetId}`);
      await this.clearAssetCaches();
      
      this.logger.log(`Asset ${disposalData.assetId} disposed successfully`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to record disposal', error.response?.data || error.message);
      throw error;
    }
  }

  async transferAsset(transferData: {
    assetId: string;
    fromDepartmentId?: string;
    toDepartmentId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    transferDate: string;
    reason: string;
    notes?: string;
    transferredBy: string;
    transferredAt: string;
  }): Promise<any> {
    try {
      // Validate asset exists and can be transferred
      const asset = await this.getAssetById(transferData.assetId);
      
      if (asset.status !== 'ACTIVE') {
        throw new BadRequestException('Can only transfer active assets');
      }

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.serviceUrl}/assets/${transferData.assetId}/transfer`,
          transferData
        )
      );
      
      // Clear caches
      await this.cacheManager.del(`fixed_asset:${transferData.assetId}`);
      await this.clearAssetCaches();
      
      this.logger.log(`Asset ${transferData.assetId} transferred successfully`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to transfer asset', error.response?.data || error.message);
      throw error;
    }
  }

  async getDepreciationSummary(filters: {
    periodId?: string;
    category?: string;
  }): Promise<any> {
    const cacheKey = `depreciation_summary:${JSON.stringify(filters)}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (filters.periodId) params.append('periodId', filters.periodId);
      if (filters.category) params.append('category', filters.category);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.serviceUrl}/reports/depreciation-summary?${params.toString()}`
        )
      );
      
      const summary = response.data;
      await this.cacheManager.set(cacheKey, summary, 1800000); // 30 minutes
      
      return summary;
    } catch (error: any) {
      this.logger.error('Failed to get depreciation summary', error.message);
      throw error;
    }
  }

  async getAssetRegister(filters: {
    asOfDate?: string;
    category?: string;
    departmentId?: string;
  }): Promise<any> {
    const cacheKey = `asset_register:${JSON.stringify(filters)}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (filters.asOfDate) params.append('asOfDate', filters.asOfDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.serviceUrl}/reports/asset-register?${params.toString()}`
        )
      );
      
      const register = response.data;
      await this.cacheManager.set(cacheKey, register, 1800000); // 30 minutes
      
      return register;
    } catch (error: any) {
      this.logger.error('Failed to get asset register', error.message);
      throw error;
    }
  }

  async getMaintenanceCosts(filters: {
    fromDate?: string;
    toDate?: string;
    assetId?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.assetId) params.append('assetId', filters.assetId);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.serviceUrl}/reports/maintenance-costs?${params.toString()}`
        )
      );
      
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get maintenance costs', error.message);
      throw error;
    }
  }

  async getAssetUtilization(filters: {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
    category?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.category) params.append('category', filters.category);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.serviceUrl}/reports/utilization?${params.toString()}`
        )
      );
      
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get asset utilization', error.message);
      throw error;
    }
  }

  async getAssetValuation(asOfDate?: string): Promise<any> {
    const cacheKey = `asset_valuation:${asOfDate || 'current'}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (asOfDate) params.append('asOfDate', asOfDate);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.serviceUrl}/reports/valuation?${params.toString()}`
        )
      );
      
      const valuation = response.data;
      await this.cacheManager.set(cacheKey, valuation, 1800000); // 30 minutes
      
      return valuation;
    } catch (error: any) {
      this.logger.error('Failed to get asset valuation', error.message);
      throw error;
    }
  }

  private async clearAssetCaches(): Promise<void> {
    // In a real implementation, you'd use cache patterns or tags
    this.logger.debug('Clearing asset-related caches');
  }
}