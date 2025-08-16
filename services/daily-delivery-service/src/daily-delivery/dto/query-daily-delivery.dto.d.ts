import { DeliveryStatus, DeliveryType, ProductGrade } from '../entities/daily-delivery.entity';
export declare class QueryDailyDeliveryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: DeliveryStatus;
    deliveryType?: DeliveryType;
    productType?: ProductGrade;
    supplierId?: string;
    customerId?: string;
    depotId?: string;
    transporterId?: string;
    fromDate?: string;
    toDate?: string;
    fromCreatedDate?: string;
    toCreatedDate?: string;
    minQuantity?: number;
    maxQuantity?: number;
    minValue?: number;
    maxValue?: number;
    vehicleRegistrationNumber?: string;
    psaNumber?: string;
    waybillNumber?: string;
    invoiceNumber?: string;
    npaPermitNumber?: string;
    gpsTrackedOnly?: boolean;
    delayedOnly?: boolean;
    invoicedOnly?: boolean;
    pendingApprovalsOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    includeLineItems?: boolean;
    includeApprovalHistory?: boolean;
    includeDocuments?: boolean;
}
//# sourceMappingURL=query-daily-delivery.dto.d.ts.map