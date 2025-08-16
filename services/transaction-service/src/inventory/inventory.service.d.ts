import { Repository, DataSource } from 'typeorm';
import { Tank, InventoryMovement } from '@omc-erp/database';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class InventoryService {
    private readonly tankRepository;
    private readonly inventoryMovementRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(tankRepository: Repository<Tank>, inventoryMovementRepository: Repository<InventoryMovement>, dataSource: DataSource, eventEmitter: EventEmitter2);
    checkAvailability(tankId: string, requestedQuantity: number): Promise<boolean>;
    reserveInventory(tankId: string, quantity: number, transactionId: string): Promise<void>;
    deductInventory(tankId: string, quantity: number, transactionId: string): Promise<void>;
    releaseInventory(tankId: string, quantity: number, transactionId: string): Promise<void>;
    returnInventory(tankId: string, quantity: number, transactionId: string): Promise<void>;
    getTankLevel(tankId: string): Promise<{
        current: number;
        capacity: number;
        reserved: number;
        available: number;
    }>;
    getInventoryMovements(tankId: string, limit?: number): Promise<InventoryMovement[]>;
    private checkTankAvailability;
}
//# sourceMappingURL=inventory.service.d.ts.map