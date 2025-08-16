import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationsDto } from './dto/query-stations.dto';
export declare class StationsController {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    create(createStationDto: CreateStationDto, req: any): Promise<import("@omc-erp/database").Station>;
    findAll(query: QueryStationsDto, req: any): Promise<any>;
    findNearby(latitude: number, longitude: number, radius: number | undefined, req: any): Promise<import("@omc-erp/database").Station[]>;
    findOne(id: string, req: any): Promise<import("@omc-erp/database").Station>;
    getStatistics(id: string, req: any): Promise<any>;
    findByCode(code: string, req: any): Promise<import("@omc-erp/database").Station>;
    update(id: string, updateStationDto: UpdateStationDto, req: any): Promise<import("@omc-erp/database").Station>;
    activate(id: string, req: any): Promise<import("@omc-erp/database").Station>;
    deactivate(id: string, body: {
        reason?: string;
    }, req: any): Promise<import("@omc-erp/database").Station>;
    remove(id: string, req: any): Promise<void>;
}
//# sourceMappingURL=stations.controller.d.ts.map