import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupplyChainOrder, OrderStatus, OrderType, OrderPriority, ProductType } from './entities/supply-chain-order.entity';
import { Inventory, StockMovementType } from './entities/inventory.entity';
interface OrderCreationData {
    tenantId: string;
    orderType: OrderType;
    supplierId: string;
    supplierName: string;
    productType: ProductType;
    quantityOrdered: number;
    unitPrice: number;
    deliveryLocationId: string;
    requestedDeliveryDate: Date;
    priority?: OrderPriority;
    notes?: string;
}
interface InventoryMovementData {
    tenantId: string;
    inventoryId: string;
    movementType: StockMovementType;
    quantity: number;
    referenceNumber?: string;
    notes?: string;
}
interface StockTransferData {
    tenantId: string;
    fromLocationId: string;
    toLocationId: string;
    productType: string;
    quantity: number;
    transferDate: Date;
    notes?: string;
}
export declare class SupplyChainService {
    private orderRepository;
    private inventoryRepository;
    private eventEmitter;
    private readonly logger;
    constructor(orderRepository: Repository<SupplyChainOrder>, inventoryRepository: Repository<Inventory>, eventEmitter: EventEmitter2);
    createOrder(orderData: OrderCreationData): Promise<SupplyChainOrder>;
    approveOrder(orderId: string, approvedBy: string): Promise<SupplyChainOrder>;
    receiveDelivery(orderId: string, quantityReceived: number, qualityCertificateNumber?: string, notes?: string): Promise<SupplyChainOrder>;
    getOrdersByStatus(tenantId: string, status: OrderStatus): Promise<SupplyChainOrder[]>;
    getOrdersDueForDelivery(tenantId: string, daysAhead?: number): Promise<SupplyChainOrder[]>;
    getInventoryStatus(tenantId: string, locationId?: string): Promise<Inventory[]>;
    checkStockAvailability(tenantId: string, productType: string, quantity: number, locationId?: string): Promise<{
        available: boolean;
        totalAvailable: number;
        locations: any[];
    }>;
    recordInventoryMovement(movementData: InventoryMovementData): Promise<Inventory>;
    transferStock(transferData: StockTransferData): Promise<{
        fromInventory: Inventory;
        toInventory: Inventory;
    }>;
    getLowStockItems(tenantId: string): Promise<Inventory[]>;
    getExpiringProducts(tenantId: string, daysAhead?: number): Promise<Inventory[]>;
    getSupplyChainMetrics(tenantId: string, period?: string): Promise<any>;
    getForecastDemand(tenantId: string, productType: string, days?: number): Promise<any>;
    checkInventoryLevels(): Promise<void>;
    submitNPAStockReport(): Promise<void>;
    private reserveInventoryForOrder;
    private updateInventoryFromDelivery;
    private calculateOnTimeDeliveryRate;
    private calculateStockAccuracy;
    private getProductTypeBreakdown;
    private getHistoricalDemand;
    private getStartDateForPeriod;
    private groupInventoryByTenant;
    private sumProductQuantity;
}
export {};
//# sourceMappingURL=supply-chain.service.d.ts.map