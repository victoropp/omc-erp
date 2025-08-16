"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SupplyChainService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplyChainService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const supply_chain_order_entity_1 = require("./entities/supply-chain-order.entity");
const inventory_entity_1 = require("./entities/inventory.entity");
const Decimal = __importStar(require("decimal.js"));
let SupplyChainService = SupplyChainService_1 = class SupplyChainService {
    orderRepository;
    inventoryRepository;
    eventEmitter;
    logger = new common_1.Logger(SupplyChainService_1.name);
    constructor(orderRepository, inventoryRepository, eventEmitter) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.eventEmitter = eventEmitter;
    }
    // ===== ORDER MANAGEMENT =====
    async createOrder(orderData) {
        try {
            const order = this.orderRepository.create({
                ...orderData,
                status: supply_chain_order_entity_1.OrderStatus.DRAFT,
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
        }
        catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`);
            throw error;
        }
    }
    async approveOrder(orderId, approvedBy) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.status !== supply_chain_order_entity_1.OrderStatus.PENDING_APPROVAL && order.status !== supply_chain_order_entity_1.OrderStatus.DRAFT) {
            throw new common_1.BadRequestException(`Order ${order.orderNumber} cannot be approved in status ${order.status}`);
        }
        order.status = supply_chain_order_entity_1.OrderStatus.APPROVED;
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
    async receiveDelivery(orderId, quantityReceived, qualityCertificateNumber, notes) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.status !== supply_chain_order_entity_1.OrderStatus.APPROVED && order.status !== supply_chain_order_entity_1.OrderStatus.IN_TRANSIT && order.status !== supply_chain_order_entity_1.OrderStatus.PARTIALLY_DELIVERED) {
            throw new common_1.BadRequestException(`Cannot receive delivery for order in status ${order.status}`);
        }
        // Update order quantities
        const previousDelivered = order.quantityDelivered;
        order.quantityDelivered = new Decimal(order.quantityDelivered).plus(quantityReceived).toNumber();
        order.quantityOutstanding = new Decimal(order.quantityOrdered).minus(order.quantityDelivered).toNumber();
        // Update status based on delivery
        if (order.quantityOutstanding <= 0) {
            order.status = supply_chain_order_entity_1.OrderStatus.DELIVERED;
            order.actualDeliveryDate = new Date();
        }
        else {
            order.status = supply_chain_order_entity_1.OrderStatus.PARTIALLY_DELIVERED;
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
    async getOrdersByStatus(tenantId, status) {
        return this.orderRepository.find({
            where: { tenantId, status },
            order: { orderDate: 'DESC' },
        });
    }
    async getOrdersDueForDelivery(tenantId, daysAhead = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.orderRepository.find({
            where: {
                tenantId,
                status: (0, typeorm_2.In)([supply_chain_order_entity_1.OrderStatus.APPROVED, supply_chain_order_entity_1.OrderStatus.IN_TRANSIT]),
                requestedDeliveryDate: (0, typeorm_2.LessThanOrEqual)(futureDate),
            },
            order: { requestedDeliveryDate: 'ASC' },
        });
    }
    // ===== INVENTORY MANAGEMENT =====
    async getInventoryStatus(tenantId, locationId) {
        const where = { tenantId, isActive: true };
        if (locationId) {
            where.locationId = locationId;
        }
        return this.inventoryRepository.find({
            where,
            order: { productType: 'ASC', locationName: 'ASC' },
        });
    }
    async checkStockAvailability(tenantId, productType, quantity, locationId) {
        const where = { tenantId, productType, isActive: true };
        if (locationId) {
            where.locationId = locationId;
        }
        const inventory = await this.inventoryRepository.find({ where });
        const totalAvailable = inventory.reduce((sum, item) => new Decimal(sum).plus(item.quantityAvailable).toNumber(), 0);
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
    async recordInventoryMovement(movementData) {
        const inventory = await this.inventoryRepository.findOne({
            where: { id: movementData.inventoryId, tenantId: movementData.tenantId },
        });
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory ${movementData.inventoryId} not found`);
        }
        const previousQuantity = inventory.quantityOnHand;
        switch (movementData.movementType) {
            case inventory_entity_1.StockMovementType.RECEIPT:
                inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).plus(movementData.quantity).toNumber();
                inventory.lastReceiptDate = new Date();
                break;
            case inventory_entity_1.StockMovementType.ISSUE:
                if (inventory.quantityAvailable < movementData.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock. Available: ${inventory.quantityAvailable}`);
                }
                inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).minus(movementData.quantity).toNumber();
                inventory.lastIssueDate = new Date();
                break;
            case inventory_entity_1.StockMovementType.ADJUSTMENT:
                inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).plus(movementData.quantity).toNumber();
                break;
            case inventory_entity_1.StockMovementType.WRITE_OFF:
                inventory.quantityOnHand = new Decimal(inventory.quantityOnHand).minus(Math.abs(movementData.quantity)).toNumber();
                break;
            case inventory_entity_1.StockMovementType.PHYSICAL_COUNT:
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
    async transferStock(transferData) {
        // Find source inventory
        const fromInventory = await this.inventoryRepository.findOne({
            where: {
                tenantId: transferData.tenantId,
                locationId: transferData.fromLocationId,
                productType: transferData.productType,
            },
        });
        if (!fromInventory) {
            throw new common_1.NotFoundException(`Source inventory not found`);
        }
        if (fromInventory.quantityAvailable < transferData.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for transfer. Available: ${fromInventory.quantityAvailable}`);
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
                status: inventory_entity_1.InventoryStatus.AVAILABLE,
            });
        }
        // Perform transfer
        fromInventory.quantityOnHand = new Decimal(fromInventory.quantityOnHand).minus(transferData.quantity).toNumber();
        toInventory.quantityOnHand = new Decimal(toInventory.quantityOnHand).plus(transferData.quantity).toNumber();
        // Update movement information
        const now = new Date();
        fromInventory.lastMovementType = inventory_entity_1.StockMovementType.TRANSFER;
        fromInventory.lastMovementDate = now;
        fromInventory.lastMovementQuantity = -transferData.quantity;
        toInventory.lastMovementType = inventory_entity_1.StockMovementType.TRANSFER;
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
    async getLowStockItems(tenantId) {
        return this.inventoryRepository.find({
            where: {
                tenantId,
                isActive: true,
                lowStockAlert: true,
            },
            order: { quantityAvailable: 'ASC' },
        });
    }
    async getExpiringProducts(tenantId, daysAhead = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.inventoryRepository.find({
            where: {
                tenantId,
                isActive: true,
                expiryDate: (0, typeorm_2.LessThanOrEqual)(futureDate),
            },
            order: { expiryDate: 'ASC' },
        });
    }
    // ===== SUPPLY CHAIN ANALYTICS =====
    async getSupplyChainMetrics(tenantId, period = 'monthly') {
        const startDate = this.getStartDateForPeriod(period);
        // Get orders metrics
        const orders = await this.orderRepository.find({
            where: {
                tenantId,
                orderDate: (0, typeorm_2.MoreThanOrEqual)(startDate),
            },
        });
        const orderMetrics = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === supply_chain_order_entity_1.OrderStatus.PENDING_APPROVAL).length,
            approvedOrders: orders.filter(o => o.status === supply_chain_order_entity_1.OrderStatus.APPROVED).length,
            deliveredOrders: orders.filter(o => o.status === supply_chain_order_entity_1.OrderStatus.DELIVERED).length,
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
    async getForecastDemand(tenantId, productType, days = 30) {
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
    async submitNPAStockReport() {
        this.logger.log('Submitting daily NPA stock report');
        const inventory = await this.inventoryRepository.find({
            where: {
                isActive: true,
                locationType: (0, typeorm_2.In)([inventory_entity_1.InventoryLocation.DEPOT, inventory_entity_1.InventoryLocation.STATION]),
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
    async reserveInventoryForOrder(order) {
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
    async updateInventoryFromDelivery(order, quantityReceived) {
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
                status: inventory_entity_1.InventoryStatus.AVAILABLE,
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
    calculateOnTimeDeliveryRate(orders) {
        const deliveredOrders = orders.filter(o => o.status === supply_chain_order_entity_1.OrderStatus.DELIVERED);
        if (deliveredOrders.length === 0)
            return 100;
        const onTimeOrders = deliveredOrders.filter(o => {
            if (!o.confirmedDeliveryDate || !o.actualDeliveryDate)
                return true;
            return o.actualDeliveryDate <= o.confirmedDeliveryDate;
        });
        return (onTimeOrders.length / deliveredOrders.length) * 100;
    }
    calculateStockAccuracy(inventory) {
        const countedItems = inventory.filter(i => i.lastStockTakeDate && i.stockVariance !== null);
        if (countedItems.length === 0)
            return 100;
        const accurateItems = countedItems.filter(i => Math.abs(i.stockVariance) <= i.quantityOnHand * 0.02); // 2% tolerance
        return (accurateItems.length / countedItems.length) * 100;
    }
    getProductTypeBreakdown(inventory) {
        const breakdown = {};
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
    async getHistoricalDemand(tenantId, productType, days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const orders = await this.orderRepository.find({
            where: {
                tenantId,
                productType,
                orderDate: (0, typeorm_2.MoreThanOrEqual)(startDate),
                status: (0, typeorm_2.In)([supply_chain_order_entity_1.OrderStatus.DELIVERED, supply_chain_order_entity_1.OrderStatus.COMPLETED]),
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
    getStartDateForPeriod(period) {
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
    groupInventoryByTenant(inventory) {
        return inventory.reduce((groups, item) => {
            if (!groups[item.tenantId]) {
                groups[item.tenantId] = [];
            }
            groups[item.tenantId].push(item);
            return groups;
        }, {});
    }
    sumProductQuantity(inventory, productType) {
        return inventory
            .filter(i => i.productType === productType)
            .reduce((sum, i) => sum + i.quantityOnHand, 0);
    }
};
exports.SupplyChainService = SupplyChainService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupplyChainService.prototype, "checkInventoryLevels", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupplyChainService.prototype, "submitNPAStockReport", null);
exports.SupplyChainService = SupplyChainService = SupplyChainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(supply_chain_order_entity_1.SupplyChainOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _c : Object])
], SupplyChainService);
//# sourceMappingURL=supply-chain.service.js.map