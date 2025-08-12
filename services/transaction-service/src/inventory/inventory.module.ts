import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Tank, InventoryMovement } from '@omc-erp/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tank, InventoryMovement]),
  ],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}