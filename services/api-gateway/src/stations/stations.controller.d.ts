import { StationsService } from './stations.service';
export declare class StationsController {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    getStations(query: any, headers: any): Promise<any>;
    getStationManagement(headers: any): Promise<any>;
    getStation(id: string, headers: any): Promise<any>;
    createStation(stationData: any, headers: any): Promise<any>;
    updateStation(id: string, updateData: any, headers: any): Promise<any>;
    deleteStation(id: string, headers: any): Promise<any>;
}
//# sourceMappingURL=stations.controller.d.ts.map