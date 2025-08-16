import { ProxyService } from '../proxy/proxy.service';
export declare class InventoryService {
    private readonly proxyService;
    private readonly serviceName;
    constructor(proxyService: ProxyService);
    getInventory(query: any, headers: any): Promise<any>;
    getTankLevels(headers: any): Promise<any>;
    updateInventory(data: any, headers: any): Promise<any>;
    getInventoryItem(id: string, headers: any): Promise<any>;
    createInventoryItem(data: any, headers: any): Promise<any>;
    updateInventoryItem(id: string, data: any, headers: any): Promise<any>;
}
//# sourceMappingURL=inventory.service.d.ts.map