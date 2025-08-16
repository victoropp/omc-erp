import { ComponentType, ValueType } from '../entities/price-build-up-component.entity';
import { ProductGrade, StationType } from '../entities/daily-delivery.entity';
export declare class CreatePriceBuildUpComponentDto {
    componentCode: string;
    componentName: string;
    componentType: ComponentType;
    productGrade: ProductGrade;
    stationType: StationType;
    effectiveDate: Date;
    expiryDate?: Date;
    componentValue: number;
    valueType: ValueType;
    calculationFormula?: string;
    currencyCode?: string;
    isActive?: boolean;
    isMandatory?: boolean;
    displayOrder?: number;
    description?: string;
    regulatoryReference?: string;
    createdBy: string;
}
export declare class UpdatePriceBuildUpComponentDto {
    componentName?: string;
    componentType?: ComponentType;
    expiryDate?: Date;
    componentValue?: number;
    valueType?: ValueType;
    calculationFormula?: string;
    currencyCode?: string;
    isActive?: boolean;
    isMandatory?: boolean;
    displayOrder?: number;
    description?: string;
    regulatoryReference?: string;
    updatedBy: string;
}
export declare class QueryPriceBuildUpComponentDto {
    productGrade?: ProductGrade;
    stationType?: StationType;
    componentType?: ComponentType;
    effectiveDate?: Date;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class PriceBuildUpComponentResponseDto {
    id: string;
    componentCode: string;
    componentName: string;
    componentType: ComponentType;
    productGrade: ProductGrade;
    stationType: StationType;
    effectiveDate: Date;
    expiryDate?: Date;
    componentValue: number;
    valueType: ValueType;
    calculationFormula?: string;
    currencyCode: string;
    isActive: boolean;
    isMandatory: boolean;
    displayOrder: number;
    description?: string;
    regulatoryReference?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
//# sourceMappingURL=price-build-up-component.dto.d.ts.map