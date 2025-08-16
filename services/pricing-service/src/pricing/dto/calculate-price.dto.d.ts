export declare class PriceOverrideDto {
    componentCode: string;
    value: number;
    reason?: string;
}
export declare class CalculatePriceDto {
    stationId: string;
    productId: string;
    windowId: string;
    overrides?: PriceOverrideDto[];
    exRefineryPrice?: number;
    justification?: string;
}
//# sourceMappingURL=calculate-price.dto.d.ts.map