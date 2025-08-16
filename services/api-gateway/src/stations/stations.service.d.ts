import { ProxyService } from '../proxy/proxy.service';
export declare class StationsService {
    private readonly proxyService;
    private readonly serviceName;
    constructor(proxyService: ProxyService);
    getStations(query: any, headers: any): Promise<any>;
    getStationManagement(headers: any): Promise<any>;
    getStation(id: string, headers: any): Promise<any>;
    createStation(data: any, headers: any): Promise<any>;
    updateStation(id: string, data: any, headers: any): Promise<any>;
    deleteStation(id: string, headers: any): Promise<any>;
}
//# sourceMappingURL=stations.service.d.ts.map