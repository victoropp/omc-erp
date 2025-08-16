import { FinancialService } from '../financial.service';
import { FixedAssetsService } from '../services/fixed-assets.service';
export declare class FixedAssetsController {
    private readonly financialService;
    private readonly fixedAssetsService;
    constructor(financialService: FinancialService, fixedAssetsService: FixedAssetsService);
    getFixedAssets(category?: string, status?: string, departmentId?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: any;
        filters: {
            category: string | undefined;
            status: string | undefined;
            departmentId: string | undefined;
            page: number | undefined;
            limit: number | undefined;
        };
        timestamp: string;
    }>;
    getFixedAsset(assetId: string): Promise<{
        success: boolean;
        data: import("../services/fixed-assets.service").FixedAsset;
        timestamp: string;
    }>;
    createFixedAsset(assetData: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    updateFixedAsset(assetId: string, assetData: any, req: any): Promise<{
        success: boolean;
        data: import("../services/fixed-assets.service").FixedAsset;
        message: string;
        timestamp: string;
    }>;
    deleteFixedAsset(assetId: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    getDepreciationSchedule(assetId: string): Promise<{
        success: boolean;
        data: any;
        assetId: string;
        timestamp: string;
    }>;
    calculateDepreciation(assetId: string, calculationData: {
        method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
        usefulLife?: number;
        salvageValue?: number;
        depreciationRate?: number;
        unitsProduced?: number;
        totalUnitsExpected?: number;
    }): Promise<{
        success: boolean;
        data: any;
        assetId: string;
        method: "STRAIGHT_LINE" | "DECLINING_BALANCE" | "UNITS_OF_PRODUCTION";
        timestamp: string;
    }>;
    recordDepreciation(assetId: string, depreciationData: {
        amount: number;
        depreciationDate: string;
        periodId: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        data: import("../services/fixed-assets.service").DepreciationEntry;
        message: string;
        timestamp: string;
    }>;
    runBatchDepreciation(periodId: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        periodId: string;
        processedBy: any;
        timestamp: string;
    }>;
    getMaintenanceHistory(assetId: string): Promise<{
        success: boolean;
        data: import("../services/fixed-assets.service").MaintenanceRecord[];
        assetId: string;
        timestamp: string;
    }>;
    recordMaintenance(assetId: string, maintenanceData: {
        maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
        description: string;
        cost: number;
        maintenanceDate: string;
        performedBy: string;
        nextScheduledDate?: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        data: import("../services/fixed-assets.service").MaintenanceRecord;
        message: string;
        timestamp: string;
    }>;
    recordDisposal(assetId: string, disposalData: {
        disposalDate: string;
        disposalMethod: 'SALE' | 'SCRAP' | 'DONATION' | 'TRADE_IN';
        disposalValue: number;
        buyerDetails?: string;
        reason: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    transferAsset(assetId: string, transferData: {
        fromDepartmentId?: string;
        toDepartmentId?: string;
        fromLocationId?: string;
        toLocationId?: string;
        transferDate: string;
        reason: string;
        notes?: string;
    }, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        timestamp: string;
    }>;
    getDepreciationSummary(periodId?: string, category?: string): Promise<{
        success: boolean;
        data: any;
        reportType: string;
        parameters: {
            periodId: string | undefined;
            category: string | undefined;
        };
        timestamp: string;
    }>;
    getAssetRegister(asOfDate?: string, category?: string, departmentId?: string): Promise<{
        success: boolean;
        data: any;
        reportType: string;
        parameters: {
            asOfDate: string | undefined;
            category: string | undefined;
            departmentId: string | undefined;
        };
        timestamp: string;
    }>;
    getMaintenanceCosts(fromDate?: string, toDate?: string, assetId?: string): Promise<{
        success: boolean;
        data: any;
        reportType: string;
        parameters: {
            fromDate: string | undefined;
            toDate: string | undefined;
            assetId: string | undefined;
        };
        timestamp: string;
    }>;
}
//# sourceMappingURL=fixed-assets.controller.d.ts.map