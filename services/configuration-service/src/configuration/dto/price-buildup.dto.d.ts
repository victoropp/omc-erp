import { PriceComponentType, PriceComponentCategory, PriceComponentStatus, StationType, ProductType } from '../entities/price-buildup.entity';
export declare class CreatePriceComponentDto {
    componentType: PriceComponentType;
    componentName: string;
    category: PriceComponentCategory;
    amount: number;
    currency?: string;
    isPercentage?: boolean;
    percentageBase?: PriceComponentType;
    calculationFormula?: string;
    stationType?: StationType;
    isMandatory?: boolean;
    isConfigurable?: boolean;
    minAmount?: number;
    maxAmount?: number;
    displayOrder?: number;
    description?: string;
    regulatoryReference?: string;
    externalSource?: string;
    externalReference?: string;
    effectiveDate: Date;
    expiryDate?: Date;
}
export declare class UpdatePriceComponentDto {
    componentName?: string;
    amount?: number;
    currency?: string;
    isPercentage?: boolean;
    percentageBase?: PriceComponentType;
    calculationFormula?: string;
    stationType?: StationType;
    isMandatory?: boolean;
    isConfigurable?: boolean;
    minAmount?: number;
    maxAmount?: number;
    displayOrder?: number;
    description?: string;
    regulatoryReference?: string;
    externalSource?: string;
    externalReference?: string;
    effectiveDate?: Date;
    expiryDate?: Date;
    isActive?: boolean;
}
export declare class CreatePriceBuildupVersionDto {
    productType: ProductType;
    effectiveDate: Date;
    expiryDate?: Date;
    changeReason?: string;
    approvalRequired?: boolean;
    components: CreatePriceComponentDto[];
}
export declare class UpdatePriceBuildupVersionDto {
    effectiveDate?: Date;
    expiryDate?: Date;
    changeReason?: string;
    status?: PriceComponentStatus;
    approvalRequired?: boolean;
    approvalNotes?: string;
    components?: UpdatePriceComponentDto[];
}
export declare class ApprovePriceBuildupDto {
    approvedBy: string;
    approvalNotes?: string;
    publishImmediately?: boolean;
}
export declare class PublishPriceBuildupDto {
    publishedBy: string;
    publishDate?: Date;
}
export declare class PriceBuildupQueryDto {
    productType?: ProductType;
    status?: PriceComponentStatus;
    effectiveDate?: Date;
    fromDate?: Date;
    toDate?: Date;
    createdBy?: string;
    includeComponents?: boolean;
    includeStationTypePricing?: boolean;
    page?: number;
    limit?: number;
}
export declare class StationTypeConfigurationDto {
    stationType: StationType;
    stationTypeName: string;
    description: string;
    isActive?: boolean;
    applicableComponents?: PriceComponentType[];
    supportedProducts?: ProductType[];
    baseDealerMargin?: number;
    baseTransportCost?: number;
    regulatoryCompliance?: string;
    operatingModel?: string;
    requiresSpecialPricing?: boolean;
}
export declare class BulkPriceUpdateDto {
    productType: ProductType;
    effectiveDate: Date;
    changeReason: string;
    componentUpdates: BulkComponentUpdateDto[];
    createNewVersion?: boolean;
    requireApproval?: boolean;
}
export declare class BulkComponentUpdateDto {
    componentType: PriceComponentType;
    newAmount: number;
    updateReason?: string;
    stationType?: StationType;
}
export declare class ExcelUploadDto {
    productType: ProductType;
    effectiveDate: Date;
    changeReason: string;
    uploadedBy: string;
    validateOnly?: boolean;
    overwriteExisting?: boolean;
}
export declare class PriceCalculationRequestDto {
    productType: ProductType;
    stationType: StationType;
    calculationDate?: Date;
    volume?: number;
    includeBreakdown?: boolean;
    excludeComponents?: PriceComponentType[];
}
export declare class PriceCalculationResponseDto {
    productType: ProductType;
    stationType: StationType;
    calculationDate: Date;
    totalPrice: number;
    currency: string;
    breakdown: PriceBreakdownDto[];
    metadata: {
        buildupVersionId: string;
        versionNumber: number;
        calculatedAt: Date;
        calculatedBy?: string;
    };
}
export declare class PriceBreakdownDto {
    componentType: PriceComponentType;
    componentName: string;
    category: PriceComponentCategory;
    amount: number;
    isPercentage: boolean;
    calculationBase?: number;
    displayOrder: number;
    description?: string;
}
export declare class AuditTrailQueryDto {
    buildupVersionId?: string;
    componentId?: string;
    actionType?: string;
    actionBy?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=price-buildup.dto.d.ts.map