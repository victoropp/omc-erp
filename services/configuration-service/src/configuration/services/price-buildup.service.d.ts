import { Repository, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PriceBuildupVersion, PriceComponent, StationTypePricing, PriceBuildupAuditTrail, StationType, ProductType } from '../entities/price-buildup.entity';
import { CreatePriceBuildupVersionDto, UpdatePriceBuildupVersionDto, ApprovePriceBuildupDto, PublishPriceBuildupDto, PriceBuildupQueryDto, BulkPriceUpdateDto, ExcelUploadDto, PriceCalculationRequestDto, PriceCalculationResponseDto, AuditTrailQueryDto } from '../dto/price-buildup.dto';
export declare class PriceBuildupService {
    private buildupRepository;
    private componentRepository;
    private stationPricingRepository;
    private auditRepository;
    private eventEmitter;
    private entityManager;
    private readonly logger;
    private readonly cache;
    constructor(buildupRepository: Repository<PriceBuildupVersion>, componentRepository: Repository<PriceComponent>, stationPricingRepository: Repository<StationTypePricing>, auditRepository: Repository<PriceBuildupAuditTrail>, eventEmitter: EventEmitter2, entityManager: EntityManager);
    createPriceBuildupVersion(createDto: CreatePriceBuildupVersionDto, createdBy: string): Promise<PriceBuildupVersion>;
    updatePriceBuildupVersion(id: string, updateDto: UpdatePriceBuildupVersionDto, updatedBy: string): Promise<PriceBuildupVersion>;
    approvePriceBuildupVersion(id: string, approveDto: ApprovePriceBuildupDto): Promise<PriceBuildupVersion>;
    publishPriceBuildupVersion(id: string, publishDto: PublishPriceBuildupDto): Promise<PriceBuildupVersion>;
    calculatePrice(request: PriceCalculationRequestDto): Promise<PriceCalculationResponseDto>;
    getPriceHistory(productType: ProductType, stationType: StationType, fromDate: Date, toDate: Date): Promise<PriceCalculationResponseDto[]>;
    bulkUpdatePrices(bulkUpdateDto: BulkPriceUpdateDto, updatedBy: string): Promise<PriceBuildupVersion>;
    uploadFromExcel(file: Buffer, uploadDto: ExcelUploadDto): Promise<{
        success: boolean;
        message: string;
        errors?: string[];
        buildupVersionId?: string;
    }>;
    findPriceBuildupVersions(query: PriceBuildupQueryDto): Promise<{
        data: PriceBuildupVersion[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBuildupVersionById(id: string): Promise<PriceBuildupVersion>;
    getAuditTrail(query: AuditTrailQueryDto): Promise<{
        data: PriceBuildupAuditTrail[];
        total: number;
        page: number;
        limit: number;
    }>;
    private validateEffectiveDateRange;
    private getNextVersionNumber;
    private generateStationTypePricing;
    private getActivePriceBuildupVersion;
    private calculatePriceBreakdown;
    private calculateBasePrice;
    private calculateTotalByCategory;
    private deactivatePreviousVersions;
    private createAuditTrail;
    private parseExcelRow;
    private buildPriceCacheKey;
    private clearPriceCache;
}
//# sourceMappingURL=price-buildup.service.d.ts.map