import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tank, InventoryMovement } from '@omc-erp/database';
import { InventoryMovementType } from '@omc-erp/shared-types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Tank)
    private readonly tankRepository: Repository<Tank>,
    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkAvailability(tankId: string, requestedQuantity: number): Promise<boolean> {
    const tank = await this.tankRepository.findOne({
      where: { id: tankId },
    });

    if (!tank) {
      return false;
    }

    const availableQuantity = tank.currentVolume - tank.minimumLevel;
    return availableQuantity >= requestedQuantity;
  }

  async reserveInventory(tankId: string, quantity: number, transactionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tank = await queryRunner.manager.findOne(Tank, {
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
        type: InventoryMovementType.RESERVED,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deductInventory(tankId: string, quantity: number, transactionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tank = await queryRunner.manager.findOne(Tank, {
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
        type: InventoryMovementType.SALE,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseInventory(tankId: string, quantity: number, transactionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tank = await queryRunner.manager.findOne(Tank, {
        where: { id: tankId },
      });

      if (!tank) {
        throw new Error('Tank not found');
      }

      // Create inventory movement record
      const movement = this.inventoryMovementRepository.create({
        tankId,
        transactionId,
        type: InventoryMovementType.RELEASED,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async returnInventory(tankId: string, quantity: number, transactionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tank = await queryRunner.manager.findOne(Tank, {
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
        type: InventoryMovementType.REFUND,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTankLevel(tankId: string): Promise<{ current: number; capacity: number; reserved: number; available: number }> {
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

  async getInventoryMovements(tankId: string, limit = 50): Promise<InventoryMovement[]> {
    return this.inventoryMovementRepository.find({
      where: { tankId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private checkTankAvailability(tank: Tank, requestedQuantity: number): boolean {
    const availableQuantity = tank.currentVolume - (tank.reservedVolume || 0) - tank.minimumLevel;
    return availableQuantity >= requestedQuantity;
  }
}