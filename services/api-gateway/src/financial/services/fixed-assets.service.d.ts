import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
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
export declare class FixedAssetsService {
    private httpService;
    private configService;
    private cacheManager;
    private readonly logger;
    private readonly serviceUrl;
    constructor(httpService: HttpService, configService: ConfigService, cacheManager: Cache);
    getAssetById(assetId: string): Promise<FixedAsset>;
    updateAsset(assetId: string, assetData: Partial<FixedAsset>): Promise<FixedAsset>;
    deleteAsset(assetId: string): Promise<void>;
    getDepreciationSchedule(assetId: string): Promise<any>;
    getDepreciationEntries(assetId: string): Promise<DepreciationEntry[]>;
    recordDepreciation(depreciationData: {
        assetId: string;
        amount: number;
        depreciationDate: string;
        periodId: string;
        notes?: string;
        recordedBy: string;
        recordedAt: string;
    }): Promise<DepreciationEntry>;
    getMaintenanceHistory(assetId: string): Promise<MaintenanceRecord[]>;
    recordMaintenance(maintenanceData: {
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
    }): Promise<MaintenanceRecord>;
    recordDisposal(disposalData: {
        assetId: string;
        disposalDate: string;
        disposalMethod: 'SALE' | 'SCRAP' | 'DONATION' | 'TRADE_IN';
        disposalValue: number;
        buyerDetails?: string;
        reason: string;
        notes?: string;
        disposedBy: string;
        disposedAt: string;
    }): Promise<any>;
    transferAsset(transferData: {
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
    }): Promise<any>;
    getDepreciationSummary(filters: {
        periodId?: string;
        category?: string;
    }): Promise<any>;
    getAssetRegister(filters: {
        asOfDate?: string;
        category?: string;
        departmentId?: string;
    }): Promise<any>;
    getMaintenanceCosts(filters: {
        fromDate?: string;
        toDate?: string;
        assetId?: string;
    }): Promise<any>;
    getAssetUtilization(filters: {
        fromDate?: string;
        toDate?: string;
        departmentId?: string;
        category?: string;
    }): Promise<any>;
    getAssetValuation(asOfDate?: string): Promise<any>;
    private clearAssetCaches;
}
//# sourceMappingURL=fixed-assets.service.d.ts.map