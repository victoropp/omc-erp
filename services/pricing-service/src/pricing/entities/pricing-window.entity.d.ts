import { PricingWindowStatus } from '@omc-erp/shared-types';
import { StationPrice } from './station-price.entity';
export declare class PricingWindow {
    windowId: string;
    tenantId: string;
    startDate: Date;
    endDate: Date;
    npaGuidelineDocId?: string;
    status: PricingWindowStatus;
    notes?: string;
    createdBy?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    stationPrices: StationPrice[];
}
//# sourceMappingURL=pricing-window.entity.d.ts.map