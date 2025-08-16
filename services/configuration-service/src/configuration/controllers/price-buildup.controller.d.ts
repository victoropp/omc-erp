import { PriceBuildupService } from '../services/price-buildup.service';
import { StationTypeConfigurationService } from '../services/station-type-config.service';
import { CreatePriceBuildupVersionDto, UpdatePriceBuildupVersionDto, ApprovePriceBuildupDto, PublishPriceBuildupDto, PriceBuildupQueryDto, StationTypeConfigurationDto, BulkPriceUpdateDto, ExcelUploadDto, PriceCalculationRequestDto, PriceCalculationResponseDto, AuditTrailQueryDto } from '../dto/price-buildup.dto';
import { PriceBuildupVersion, StationType, ProductType } from '../entities/price-buildup.entity';
export declare class PriceBuildupController {
    private readonly priceBuildupService;
    private readonly stationTypeConfigService;
    constructor(priceBuildupService: PriceBuildupService, stationTypeConfigService: StationTypeConfigurationService);
    createPriceBuildupVersion(createDto: CreatePriceBuildupVersionDto, user: any): Promise<PriceBuildupVersion>;
    getPriceBuildupVersions(query: PriceBuildupQueryDto): Promise<{
        data: PriceBuildupVersion[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPriceBuildupVersionById(id: string): Promise<PriceBuildupVersion>;
    updatePriceBuildupVersion(id: string, updateDto: UpdatePriceBuildupVersionDto, user: any): Promise<PriceBuildupVersion>;
    approvePriceBuildupVersion(id: string, approveDto: ApprovePriceBuildupDto): Promise<PriceBuildupVersion>;
    publishPriceBuildupVersion(id: string, publishDto: PublishPriceBuildupDto): Promise<PriceBuildupVersion>;
    calculatePrice(request: PriceCalculationRequestDto): Promise<PriceCalculationResponseDto>;
    getPriceHistory(productType: ProductType, stationType: StationType, fromDate: Date, toDate: Date): Promise<PriceCalculationResponseDto[]>;
    bulkUpdatePrices(bulkUpdateDto: BulkPriceUpdateDto, user: any): Promise<PriceBuildupVersion>;
    uploadFromExcel(file: Express.Multer.File, uploadDto: ExcelUploadDto): Promise<{
        success: boolean;
        message: string;
        errors?: string[];
        buildupVersionId?: string;
    }>;
    downloadExcelTemplate(): Promise<any>;
    createStationTypeConfiguration(stationTypeDto: StationTypeConfigurationDto, user: any): Promise<any>;
    getAllStationTypeConfigurations(): Promise<any[]>;
    getStationTypeConfiguration(stationType: StationType): Promise<any>;
    updateStationTypeConfiguration(stationType: StationType, updateDto: Partial<StationTypeConfigurationDto>, user: any): Promise<any>;
    getStationTypesByProduct(productType: ProductType): Promise<StationType[]>;
    getAuditTrail(query: AuditTrailQueryDto): Promise<any>;
    initializeDefaults(user: any): Promise<{
        message: string;
    }>;
    validateStationTypeForProduct(validation: {
        stationType: StationType;
        productType: ProductType;
    }): Promise<{
        valid: boolean;
        message: string;
    }>;
    getApplicableComponents(stationType: StationType): Promise<any>;
}
//# sourceMappingURL=price-buildup.controller.d.ts.map