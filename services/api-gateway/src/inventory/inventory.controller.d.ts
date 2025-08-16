import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventory(query: any, headers: any): Promise<any>;
    getTankLevels(headers: any): Promise<any>;
    updateInventory(updateData: any, headers: any): Promise<any>;
    getInventoryItem(id: string, headers: any): Promise<any>;
    createInventoryItem(itemData: any, headers: any): Promise<any>;
    updateInventoryItem(id: string, updateData: any, headers: any): Promise<any>;
}
//# sourceMappingURL=inventory.controller.d.ts.map