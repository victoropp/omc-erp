import { PricingWindow } from './pricing-window.entity';
export declare class StationPrice {
    id: string;
    stationId: string;
    productId: string;
    windowId: string;
    exPumpPrice: number;
    calcBreakdownJson: {
        components: Array<{
            code: string;
            name: string;
            value: number;
            unit: string;
        }>;
        totalPrice: number;
        sourceDocuments: string[];
    };
    publishedAt?: Date;
    tenantId: string;
    calculatedBy?: string;
    publishedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    pricingWindow: PricingWindow;
}
//# sourceMappingURL=station-price.entity.d.ts.map