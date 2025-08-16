import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}