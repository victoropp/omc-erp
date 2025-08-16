export declare class GPSPointDto {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
}
export declare class CreateUPPFClaimDto {
    deliveryId: string;
    routeId: string;
    kmActual: number;
    litresMoved: number;
    windowId: string;
    gpsTrace?: GPSPointDto[];
    waybillNumber?: string;
    evidenceLinks?: string[];
    notes?: string;
}
//# sourceMappingURL=create-uppf-claim.dto.d.ts.map