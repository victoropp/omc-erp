import { CreateDailyDeliveryDto } from './create-daily-delivery.dto';
declare const UpdateDailyDeliveryDto_base: import("@nestjs/common").Type<Partial<CreateDailyDeliveryDto>>;
export declare class UpdateDailyDeliveryDto extends UpdateDailyDeliveryDto_base {
    updatedBy?: string;
    actualDeliveryTime?: string;
    customerFeedback?: string;
    deliveryRating?: number;
    performanceObligationSatisfied?: boolean;
}
export {};
//# sourceMappingURL=update-daily-delivery.dto.d.ts.map