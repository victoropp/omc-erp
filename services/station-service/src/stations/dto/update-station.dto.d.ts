import { CreateStationDto } from './create-station.dto';
import { StationStatus } from '@omc-erp/shared-types';
declare const UpdateStationDto_base: import("@nestjs/common").Type<Partial<CreateStationDto>>;
export declare class UpdateStationDto extends UpdateStationDto_base {
    status?: StationStatus;
}
export {};
//# sourceMappingURL=update-station.dto.d.ts.map