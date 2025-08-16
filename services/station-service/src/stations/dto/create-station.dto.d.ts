export declare class LocationDto {
    latitude: number;
    longitude: number;
    address?: string;
    region?: string;
}
export declare class CreateStationDto {
    name: string;
    code: string;
    address: string;
    phone: string;
    email?: string;
    location: LocationDto;
    managerName?: string;
    managerPhone?: string;
    managerEmail?: string;
    operatingHoursStart?: string;
    operatingHoursEnd?: string;
    isActive?: boolean;
    facilities?: Record<string, any>;
}
//# sourceMappingURL=create-station.dto.d.ts.map