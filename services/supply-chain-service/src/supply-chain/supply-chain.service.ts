import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In, Not, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupplyChainOrder, OrderStatus, OrderType, OrderPriority, ProductType } from './entities/supply-chain-order.entity';
import { Inventory, InventoryStatus, InventoryLocation, StockMovementType } from './entities/inventory.entity';
import * as Decimal from 'decimal.js';

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

@Injectable()
export class SupplyChainService {
  private readonly logger = new Logger(SupplyChainService.name);

  constructor(
    @InjectRepository(SupplyChainOrder)
    private orderRepository: Repository<SupplyChainOrder>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== ORDER MANAGEMENT =====

  async createOrder(orderData: OrderCreationData): Promise<SupplyChainOrder> {
    try {
      const order = this.orderRepository.create({
        ...orderData,
        status: OrderStatus.DRAFT,
        orderDate: new Date(),
        totalAmount: new Decimal(orderData.quantityOrdered).mul(orderData.unitPrice).toNumber(),
        quantityOutstanding: orderData.quantityOrdered,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Emit order created event
      this.eventEmitter.emit('order.created', {
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        orderType: savedOrder.orderType,
        supplierId: savedOrder.supplierId,
        amount: savedOrder.totalAmount,
      });

      this.logger.log(`Order created: ${savedOrder.orderNumber}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  async approveOrder(orderId: string, approvedBy: string): Promise<SupplyChainOrder> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING_APPROVAL && order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(`Order ${order.orderNumber} cannot be approved in status ${order.status}`);
    }

    order.status = OrderStatus.APPROVED;
    order.approvalDate = new Date();
    order.approvedBy = approvedBy;

    const updatedOrder = await this.orderRepository.save(order);

    // Reserve inventory for approved order
    await this.reserveInventoryForOrder(order);

    // Emit order approved event
    this.eventEmitter.emit('order.approved', {
      orderId: updatedOrder.id,
      tenantId: updatedOrder.tenantId,
      approvedBy: approvedBy,
    });

    return updatedOrder;
  }

  async receiveDelivery(
    orderId: string,
    quantityReceived: number,
    qualityCertificateNumber?: string,
    notes?: string
  ): Promise<SupplyChainOrder> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status !== OrderStatus.APPROVED && order.status !== OrderStatus.IN_TRANSIT && order.status !== OrderStatus.PARTIALLY_DELIVERED) {
      throw new BadRequestException(`Cannot receive delivery for order in status ${order.status}`);
    }

    // Update order quantities
    const previousDelivered = order.quantityDelivered;
    order.quantityDelivered = new Decimal(order.quantityDelivered).plus(quantityReceived).toNumber();
    order.quantityOutstanding = new Decimal(order.quantityOrdered).minus(order.quantityDelivered).toNumber();

    // Update status based on delivery
    if (order.quantityOutstanding <= 0) {
      order.status = OrderStatus.DELIVERED;
      order.actualDeliveryDate = new Date();
    } else {
      order.status = OrderStatus.PARTIALLY_DELIVERED;
    }

    if (qualityCertificateNumber) {
      order.qualityCertificateNumber = qualityCertificateNumber;
    }

    if (notes) {
      order.notes = (order.notes || '') + '\n' + notes;
    }

    const updatedOrder = await this.orderRepository.save(order);

    // Update inventory
    await this.updateInventoryFromDelivery(order, quantityReceived);

    // Emit delivery received event
    this.eventEmitter.emit('order.delivery.received', {
      orderId: updatedOrder.id,
      tenantId: updatedOrder.tenantId,
      quantityReceived: quantityReceived,
      totalDelivered: updatedOrder.quantityDelivered,
    });

    return updatedOrder;
  }

  async getOrdersByStatus(tenantId: string, status: OrderStatus): Promise<SupplyChainOrder[]> {
    return this.orderRepository.find({
      where: { tenantId, status },
      order: { orderDate: 'DESC' },
    });
  }

  async getOrdersDueForDelivery(tenantId: string, daysAhead: number = 7): Promise<SupplyChainOrder[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.orderRepository.find({
      where: {
        tenantId,
        status: In([OrderStatus.APPROVED, OrderStatus.IN_TRANSIT]),
        requestedDeliveryDate: LessThanOrEqual(futureDate),
      },
      order: { requestedDeliveryDate: 'ASC' },
    });
  }

  // ===== INVENTORY MANAGEMENT =====

  async getInventoryStatus(tenantId: string, locationId?: string): Promise<Inventory[]> {
    const where: any = { tenantId, isActive: true };
    if (locationId) {
      where.locationId = locationId;
    }

    return this.inventoryRepository.find({
      where,
      order: { productType: 'ASC', locationName: 'ASC' },
    });
  }

  async checkStockAvailability(
    tenantId: string,
    productType: string,
    quantity: number,
    locationId?: string
  ): Promise<{ available: boolean; totalAvailable: number; locations: any[] }> {
    const where: any = { tenantId, productType, isActive: true };
    if (locationId) {
      where.locationId = locationId;
    }

    const inventory = await this.inventoryRepository.find({ where });

    const totalAvailable = inventory.reduce((sum, item) => 
      new Decimal(sum).plus(item.quantityAvailable).toNumber(), 0
    );

    const locations = inventory.map(item => ({
      locationId: item.locationId,
      locationName: item.locationName,
      available: item.quantityAvailable,
      onHand: item.quantityOnHand,
      reserved: item.quantityReserved,
    }));

    return {
      available: totalAvailable >= quantity,
      totalAvailable,
      locations,
    };
  }

  async recordInventoryMovement(movementData: InventoryMovementData): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: movementData.inventoryId, tenantId: movementData.tenantId },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory ${movementData.inventoryId} not found`);
    }

    const previousQuantity = inventory.quantityOnHand;

    switch (movementData.movementType) {
      case StockMovementType.RECEIPT:
        inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).plus(movementData.quantity).toNumber();
        inventory.lastReceiptDate = new Date();
        break;
      
      case StockMovementType.ISSUE:
        if (inventory.quantityAvailable < movementData.quantity) {
          throw new BadRequestException(`Insufficient stock. Available: ${inventory.quantityAvailable}`);
        }
        inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).minus(movementData.quantity).toNumber();
        inventory.lastIssueDate = new Date();
        break;
      
      case StockMovementType.ADJUSTMENT:
        inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).plus(movementData.quantity).toNumber();
        break;
      
      case StockMovementType.WRITE_OFF:
        inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).minus(Math.abs(movementData.quantity)).toNumber();
        break;
      
      case StockMovementType.PHYSICAL_COUNT:
        inventory.stockVariance = new Decimal(movementData.quantity).minus(inventory.quantityOnHand).toNumber();
        inventory.quantityOnHand = movementData.quantity;
        inventory.lastStockTakeDate = new Date();
        inventory.lastStockTakeQuantity = movementData.quantity;
        break;
    }

    inventory.lastMovementType = movementData.movementType;
    inventory.lastMovementDate = new Date();
    inventory.lastMovementQuantity = movementData.quantity;

    const updatedInventory = await this.inventoryRepository.save(inventory);

    // Emit inventory movement event
    this.eventEmitter.emit('inventory.movement', {
      inventoryId: updatedInventory.id,
      tenantId: updatedInventory.tenantId,
      movementType: movementData.movementType,
      quantity: movementData.quantity,
      previousQuantity,
      newQuantity: updatedInventory.quantityOnHand,
    });

    return updatedInventory;
  }

  async transferStock(transferData: StockTransferData): Promise<{ fromInventory: Inventory; toInventory: Inventory }> {
    // Find source inventory
    const fromInventory = await this.inventoryRepository.findOne({
      where: {
        tenantId: transferData.tenantId,
        locationId: transferData.fromLocationId,
        productType: transferData.productType,
      },
    });

    if (!fromInventory) {
      throw new NotFoundException(`Source inventory not found`);
    }

    if (fromInventory.quantityAvailable < transferData.quantity) {
      throw new BadRequestException(`Insufficient stock for transfer. Available: ${fromInventory.quantityAvailable}`);
    }

    // Find or create destination inventory
    let toInventory = await this.inventoryRepository.findOne({
      where: {
        tenantId: transferData.tenantId,
        locationId: transferData.toLocationId,
        productType: transferData.productType,
      },
    });

    if (!toInventory) {
      // Create new inventory record at destination
      toInventory = this.inventoryRepository.create({
        tenantId: transferData.tenantId,
        locationId: transferData.toLocationId,
        locationName: `Location ${transferData.toLocationId}`,
        productType: transferData.productType,
        productCode: fromInventory.productCode,
        productName: fromInventory.productName,
        unitOfMeasure: fromInventory.unitOfMeasure,
        quantityOnHand: 0,
        status: InventoryStatus.AVAILABLE,
      });
    }

    // Perform transfer
    fromInventory.quantityOnHand = new Decimal(fromInventory.quantityOnHand).minus(transferData.quantity).toNumber();
    toInventory.quantityOnHand = new Decimal(toInventory.quantityOnHand).plus(transferData.quantity).toNumber();

    // Update movement information
    const now = new Date();
    fromInventory.lastMovementType = StockMovementType.TRANSFER;
    fromInventory.lastMovementDate = now;
    fromInventory.lastMovementQuantity = -transferData.quantity;

    toInventory.lastMovementType = StockMovementType.TRANSFER;
    toInventory.lastMovementDate = now;
    toInventory.lastMovementQuantity = transferData.quantity;

    // Save both inventory records
    const [updatedFrom, updatedTo] = await Promise.all([
      this.inventoryRepository.save(fromInventory),
      this.inventoryRepository.save(toInventory),
    ]);

    // Emit transfer event
    this.eventEmitter.emit('inventory.transfer', {
      tenantId: transferData.tenantId,
      fromLocationId: transferData.fromLocationId,
      toLocationId: transferData.toLocationId,
      productType: transferData.productType,
      quantity: transferData.quantity,
    });

    return { fromInventory: updatedFrom, toInventory: updatedTo };
  }

  async getLowStockItems(tenantId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: {
        tenantId,
        isActive: true,
        lowStockAlert: true,
      },
      order: { quantityAvailable: 'ASC' },
    });
  }

  async getExpiringProducts(tenantId: string, daysAhead: number = 30): Promise<Inventory[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.inventoryRepository.find({
      where: {
        tenantId,
        isActive: true,
        expiryDate: LessThanOrEqual(futureDate),
      },
      order: { expiryDate: 'ASC' },
    });
  }

  // ===== SUPPLY CHAIN ANALYTICS =====

  async getSupplyChainMetrics(tenantId: string, period: string = 'monthly'): Promise<any> {
    const startDate = this.getStartDateForPeriod(period);
    
    // Get orders metrics
    const orders = await this.orderRepository.find({
      where: {
        tenantId,
        orderDate: MoreThanOrEqual(startDate),
      },
    });

    const orderMetrics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING_APPROVAL).length,
      approvedOrders: orders.filter(o => o.status === OrderStatus.APPROVED).length,
      deliveredOrders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      totalOrderValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0,
      onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(orders),
    };

    // Get inventory metrics
    const inventory = await this.inventoryRepository.find({
      where: { tenantId, isActive: true },
    });

    const inventoryMetrics = {
      totalSKUs: inventory.length,
      totalInventoryValue: inventory.reduce((sum, i) => sum + i.totalValue, 0),
      lowStockItems: inventory.filter(i => i.lowStockAlert).length,
      expiringItems: inventory.filter(i => i.expiryAlert).length,
      averageTurnoverRatio: inventory.reduce((sum, i) => sum + (i.turnoverRatio || 0), 0) / inventory.length,
      stockAccuracy: this.calculateStockAccuracy(inventory),
    };

    // Product type breakdown
    const productBreakdown = this.getProductTypeBreakdown(inventory);

    return {
      period,
      startDate,
      endDate: new Date(),
      orderMetrics,
      inventoryMetrics,
      productBreakdown,
      alerts: {
        lowStock: inventory.filter(i => i.lowStockAlert).map(i => ({
          product: i.productName,
          location: i.locationName,
          available: i.quantityAvailable,
          minimum: i.minimumStockLevel,
        })),
        expiring: inventory.filter(i => i.expiryAlert).map(i => ({
          product: i.productName,
          location: i.locationName,
          expiryDate: i.expiryDate,
          quantity: i.quantityOnHand,
        })),
      },
    };
  }

  async getForecastDemand(tenantId: string, productType: string, days: number = 30): Promise<any> {
    // Get historical data
    const historicalData = await this.getHistoricalDemand(tenantId, productType, 90);
    
    // Simple moving average forecast
    const averageDailyDemand = historicalData.totalDemand / historicalData.days;
    const forecastedDemand = averageDailyDemand * days;

    // Calculate safety stock based on variability
    const safetyStock = averageDailyDemand * 7; // 7 days safety stock

    return {
      productType,
      forecastPeriodDays: days,
      forecastedDemand,
      averageDailyDemand,
      safetyStock,
      reorderPoint: (averageDailyDemand * 14) + safetyStock, // 14 days lead time
      confidence: 0.85, // 85% confidence level
      historicalData,
    };
  }

  // ===== SCHEDULED TASKS =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkInventoryLevels() {
    this.logger.log('Running daily inventory level check');
    
    const allInventory = await this.inventoryRepository.find({
      where: { isActive: true },
    });

    for (const inventory of allInventory) {
      // Check for low stock
      if (inventory.quantityAvailable <= inventory.reorderPoint && !inventory.reorderAlert) {
        inventory.reorderAlert = true;
        await this.inventoryRepository.save(inventory);

        this.eventEmitter.emit('inventory.reorder.alert', {
          inventoryId: inventory.id,
          tenantId: inventory.tenantId,
          productType: inventory.productType,
          locationName: inventory.locationName,
          available: inventory.quantityAvailable,
          reorderPoint: inventory.reorderPoint,
        });
      }

      // Check for expiring products
      if (inventory.expiryDate) {
        const daysToExpiry = Math.floor((inventory.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 30 && !inventory.expiryAlert) {
          inventory.expiryAlert = true;
          await this.inventoryRepository.save(inventory);

          this.eventEmitter.emit('inventory.expiry.alert', {
            inventoryId: inventory.id,
            tenantId: inventory.tenantId,
            productType: inventory.productType,
            expiryDate: inventory.expiryDate,
            daysToExpiry,
          });
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async submitNPAStockReport() {
    this.logger.log('Submitting daily NPA stock report');
    
    const inventory = await this.inventoryRepository.find({
      where: {
        isActive: true,
        locationType: In([InventoryLocation.DEPOT, InventoryLocation.STATION]),
      },
    });

    // Group by tenant and prepare reports
    const reportsByTenant = this.groupInventoryByTenant(inventory);
    
    for (const [tenantId, tenantInventory] of Object.entries(reportsByTenant)) {
      const report = {
        tenantId,
        reportDate: new Date(),
        totalPetrol: this.sumProductQuantity(tenantInventory, 'PETROL'),
        totalDiesel: this.sumProductQuantity(tenantInventory, 'DIESEL'),
        totalKerosene: this.sumProductQuantity(tenantInventory, 'KEROSENE'),
        totalLPG: this.sumProductQuantity(tenantInventory, 'LPG'),
        locations: tenantInventory.length,
      };

      // Mark as submitted
      for (const inv of tenantInventory) {
        inv.npaStockReportSubmitted = true;
        inv.npaStockReportDate = new Date();
        await this.inventoryRepository.save(inv);
      }

      this.eventEmitter.emit('npa.stock.report.submitted', report);
    }
  }

  // ===== HELPER METHODS =====

  private async reserveInventoryForOrder(order: SupplyChainOrder): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        tenantId: order.tenantId,
        locationId: order.deliveryLocationId,
        productType: order.productType,
      },
    });

    if (inventory) {
      inventory.quantityReserved = new Decimal(inventory.quantityReserved).plus(order.quantityOrdered).toNumber();
      await this.inventoryRepository.save(inventory);
    }
  }

  private async updateInventoryFromDelivery(order: SupplyChainOrder, quantityReceived: number): Promise<void> {
    let inventory = await this.inventoryRepository.findOne({
      where: {
        tenantId: order.tenantId,
        locationId: order.deliveryLocationId,
        productType: order.productType,
      },
    });

    if (!inventory) {
      // Create new inventory record
      inventory = this.inventoryRepository.create({
        tenantId: order.tenantId,
        locationId: order.deliveryLocationId,
        locationName: order.deliveryAddress || `Location ${order.deliveryLocationId}`,
        productType: order.productType,
        productCode: order.productType,
        productName: order.productType,
        quantityOnHand: 0,
        unitCost: order.unitPrice,
        status: InventoryStatus.AVAILABLE,
      });
    }

    // Update quantities
    inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).plus(quantityReceived).toNumber();
    inventory.quantityReserved = Math.max(0, new Decimal(inventory.quantityReserved).minus(quantityReceived).toNumber());
    inventory.lastReceiptDate = new Date();
    inventory.lastPurchasePrice = order.unitPrice;
    inventory.lastPurchaseDate = new Date();
    inventory.supplierId = order.supplierId;
    inventory.supplierName = order.supplierName;

    // Update cost using weighted average
    const totalValue = new Decimal(inventory.totalValue).plus(new Decimal(quantityReceived).mul(order.unitPrice));
    const totalQuantity = new Decimal(inventory.quantityOnHand);
    inventory.unitCost = totalValue.div(totalQuantity).toNumber();

    await this.inventoryRepository.save(inventory);
  }

  private calculateOnTimeDeliveryRate(orders: SupplyChainOrder[]): number {
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    if (deliveredOrders.length === 0) return 100;

    const onTimeOrders = deliveredOrders.filter(o => {
      if (!o.confirmedDeliveryDate || !o.actualDeliveryDate) return true;
      return o.actualDeliveryDate <= o.confirmedDeliveryDate;
    });

    return (onTimeOrders.length / deliveredOrders.length) * 100;
  }

  private calculateStockAccuracy(inventory: Inventory[]): number {
    const countedItems = inventory.filter(i => i.lastStockTakeDate && i.stockVariance !== null);
    if (countedItems.length === 0) return 100;

    const accurateItems = countedItems.filter(i => Math.abs(i.stockVariance) <= i.quantityOnHand * 0.02); // 2% tolerance
    return (accurateItems.length / countedItems.length) * 100;
  }

  private getProductTypeBreakdown(inventory: Inventory[]): any {
    const breakdown: any = {};
    
    for (const item of inventory) {
      if (!breakdown[item.productType]) {
        breakdown[item.productType] = {
          quantity: 0,
          value: 0,
          locations: new Set(),
        };
      }
      
      breakdown[item.productType].quantity += item.quantityOnHand;
      breakdown[item.productType].value += item.totalValue;
      breakdown[item.productType].locations.add(item.locationId);
    }

    // Convert Sets to counts
    for (const product in breakdown) {
      breakdown[product].locationCount = breakdown[product].locations.size;
      delete breakdown[product].locations;
    }

    return breakdown;
  }

  private async getHistoricalDemand(tenantId: string, productType: string, days: number): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.orderRepository.find({
      where: {
        tenantId,
        productType,
        orderDate: MoreThanOrEqual(startDate),
        status: In([OrderStatus.DELIVERED, OrderStatus.COMPLETED]),
      },
    });

    const totalDemand = orders.reduce((sum, o) => sum + o.quantityDelivered, 0);

    return {
      days,
      totalDemand,
      orderCount: orders.length,
      averageOrderSize: orders.length > 0 ? totalDemand / orders.length : 0,
    };
  }

  private getStartDateForPeriod(period: string): Date {
    const date = new Date();
    
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    
    return date;
  }

  private groupInventoryByTenant(inventory: Inventory[]): { [key: string]: Inventory[] } {
    return inventory.reduce((groups, item) => {
      if (!groups[item.tenantId]) {
        groups[item.tenantId] = [];
      }
      groups[item.tenantId].push(item);
      return groups;
    }, {} as { [key: string]: Inventory[] });
  }

  private sumProductQuantity(inventory: Inventory[], productType: string): number {
    return inventory
      .filter(i => i.productType === productType)
      .reduce((sum, i) => sum + i.quantityOnHand, 0);
  }
}