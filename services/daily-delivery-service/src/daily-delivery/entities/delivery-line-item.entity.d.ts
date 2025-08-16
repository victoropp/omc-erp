import { DailyDelivery, ProductGrade } from './daily-delivery.entity';
export declare class DeliveryLineItem {
    id: string;
    deliveryId: string;
    lineNumber: number;
    productCode: string;
    productName: string;
    productGrade: ProductGrade;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    tankNumber: string;
    compartmentNumber: string;
    batchNumber: string;
    qualitySpecifications: string;
    baseUnitPrice: number;
    totalTaxes: number;
    totalLevies: number;
    totalMargins: number;
    priceComponents: any;
    costCenterCode: string;
    profitCenterCode: string;
    glAccountCode: string;
    delivery: DailyDelivery;
    calculateLineTotal(): number;
    getTotalPricePerUnit(): number;
    getMarginPercentage(): number;
}
//# sourceMappingURL=delivery-line-item.entity.d.ts.map