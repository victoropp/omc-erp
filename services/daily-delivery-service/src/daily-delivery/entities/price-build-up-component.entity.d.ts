import { StationType, ProductGrade } from './daily-delivery.entity';
export declare enum ComponentType {
    BASE_PRICE = "BASE_PRICE",
    TAX = "TAX",
    LEVY = "LEVY",
    MARGIN = "MARGIN",
    MARKUP = "MARKUP"
}
export declare enum ValueType {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE",
    FORMULA = "FORMULA"
}
export declare class PriceBuildUpComponent {
    id: string;
    componentCode: string;
    componentName: string;
    componentType: ComponentType;
    productGrade: ProductGrade;
    stationType: StationType;
    effectiveDate: Date;
    expiryDate: Date;
    componentValue: number;
    valueType: ValueType;
    calculationFormula: string;
    currencyCode: string;
    isActive: boolean;
    isMandatory: boolean;
    displayOrder: number;
    description: string;
    regulatoryReference: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    isEffectiveOn(date: Date): boolean;
    calculateValue(basePrice: number, quantity: number): number;
    isExpired(): boolean;
    getEffectivePeriod(): string;
}
//# sourceMappingURL=price-build-up-component.entity.d.ts.map