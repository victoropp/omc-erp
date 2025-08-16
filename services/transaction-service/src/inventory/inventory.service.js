"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const database_1 = require("@omc-erp/database");
const shared_types_1 = require("@omc-erp/shared-types");
const event_emitter_1 = require("@nestjs/event-emitter");
let InventoryService = InventoryService_1 = class InventoryService {
    tankRepository;
    inventoryMovementRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(tankRepository, inventoryMovementRepository, dataSource, eventEmitter) {
        this.tankRepository = tankRepository;
        this.inventoryMovementRepository = inventoryMovementRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    async checkAvailability(tankId, requestedQuantity) {
        const tank = await this.tankRepository.findOne({
            where: { id: tankId },
        });
        if (!tank) {
            return false;
        }
        const availableQuantity = tank.currentVolume - tank.minimumLevel;
        return availableQuantity >= requestedQuantity;
    }
    async reserveInventory(tankId, quantity, transactionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tank = await queryRunner.manager.findOne(database_1.Tank, {
                where: { id: tankId },
            });
            if (!tank) {
                throw new Error('Tank not found');
            }
            // Check availability again within transaction
            if (!this.checkTankAvailability(tank, quantity)) {
                throw new Error('Insufficient inventory');
            }
            // Create inventory movement record
            const movement = this.inventoryMovementRepository.create({
                tankId,
                transactionId,
                type: shared_types_1.InventoryMovementType.RESERVED,
                quantity,
                previousLevel: tank.currentVolume,
                newLevel: tank.currentVolume, // Reserved doesn't change actual level yet
                notes: `Reserved ${quantity}L for transaction ${transactionId}`,
                createdAt: new Date(),
            });
            await queryRunner.manager.save(movement);
            // Update tank reserved quantity
            tank.reservedVolume = (tank.reservedVolume || 0) + quantity;
            await queryRunner.manager.save(tank);
            await queryRunner.commitTransaction();
            this.logger.log(`Reserved ${quantity}L from tank ${tankId} for transaction ${transactionId}`);
            // Emit inventory event
            this.eventEmitter.emit('inventory.reserved', {
                tankId,
                transactionId,
                quantity,
                availableAfter: tank.currentVolume - tank.reservedVolume,
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deductInventory(tankId, quantity, transactionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tank = await queryRunner.manager.findOne(database_1.Tank, {
                where: { id: tankId },
            });
            if (!tank) {
                throw new Error('Tank not found');
            }
            const previousLevel = tank.currentVolume;
            tank.currentVolume -= quantity;
            tank.reservedVolume = Math.max(0, (tank.reservedVolume || 0) - quantity);
            // Create inventory movement record
            const movement = this.inventoryMovementRepository.create({
                tankId,
                transactionId,
                type: shared_types_1.InventoryMovementType.SALE,
                quantity: -quantity, // Negative for outgoing
                previousLevel,
                newLevel: tank.currentVolume,
                notes: `Fuel dispensed for transaction ${transactionId}`,
                createdAt: new Date(),
            });
            await queryRunner.manager.save(movement);
            await queryRunner.manager.save(tank);
            await queryRunner.commitTransaction();
            this.logger.log(`Deducted ${quantity}L from tank ${tankId} for transaction ${transactionId}`);
            // Emit inventory events
            this.eventEmitter.emit('inventory.deducted', {
                tankId,
                transactionId,
                quantity,
                previousLevel,
                newLevel: tank.currentVolume,
            });
            // Check for low inventory alert
            if (tank.currentVolume <= tank.minimumLevel) {
                this.eventEmitter.emit('inventory.low', {
                    tankId,
                    currentLevel: tank.currentVolume,
                    minimumLevel: tank.minimumLevel,
                    fuelType: tank.fuelType,
                });
            }
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async releaseInventory(tankId, quantity, transactionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tank = await queryRunner.manager.findOne(database_1.Tank, {
                where: { id: tankId },
            });
            if (!tank) {
                throw new Error('Tank not found');
            }
            // Create inventory movement record
            const movement = this.inventoryMovementRepository.create({
                tankId,
                transactionId,
                type: shared_types_1.InventoryMovementType.RELEASED,
                quantity: 0, // No actual quantity change
                previousLevel: tank.currentVolume,
                newLevel: tank.currentVolume,
                notes: `Released ${quantity}L reservation for cancelled transaction ${transactionId}`,
                createdAt: new Date(),
            });
            await queryRunner.manager.save(movement);
            // Update tank reserved quantity
            tank.reservedVolume = Math.max(0, (tank.reservedVolume || 0) - quantity);
            await queryRunner.manager.save(tank);
            await queryRunner.commitTransaction();
            this.logger.log(`Released ${quantity}L reservation from tank ${tankId} for transaction ${transactionId}`);
            // Emit inventory event
            this.eventEmitter.emit('inventory.released', {
                tankId,
                transactionId,
                quantity,
                availableAfter: tank.currentVolume - tank.reservedVolume,
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async returnInventory(tankId, quantity, transactionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tank = await queryRunner.manager.findOne(database_1.Tank, {
                where: { id: tankId },
            });
            if (!tank) {
                throw new Error('Tank not found');
            }
            const previousLevel = tank.currentVolume;
            tank.currentVolume += quantity;
            // Create inventory movement record
            const movement = this.inventoryMovementRepository.create({
                tankId,
                transactionId,
                type: shared_types_1.InventoryMovementType.REFUND,
                quantity,
                previousLevel,
                newLevel: tank.currentVolume,
                notes: `Inventory returned for refunded transaction ${transactionId}`,
                createdAt: new Date(),
            });
            await queryRunner.manager.save(movement);
            await queryRunner.manager.save(tank);
            await queryRunner.commitTransaction();
            this.logger.log(`Returned ${quantity}L to tank ${tankId} for refunded transaction ${transactionId}`);
            // Emit inventory event
            this.eventEmitter.emit('inventory.returned', {
                tankId,
                transactionId,
                quantity,
                previousLevel,
                newLevel: tank.currentVolume,
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTankLevel(tankId) {
        const tank = await this.tankRepository.findOne({
            where: { id: tankId },
        });
        if (!tank) {
            throw new Error('Tank not found');
        }
        return {
            current: tank.currentVolume,
            capacity: tank.capacity,
            reserved: tank.reservedVolume || 0,
            available: tank.currentVolume - (tank.reservedVolume || 0),
        };
    }
    async getInventoryMovements(tankId, limit = 50) {
        return this.inventoryMovementRepository.find({
            where: { tankId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    checkTankAvailability(tank, requestedQuantity) {
        const availableQuantity = tank.currentVolume - (tank.reservedVolume || 0) - tank.minimumLevel;
        return availableQuantity >= requestedQuantity;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Tank)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.InventoryMovement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map