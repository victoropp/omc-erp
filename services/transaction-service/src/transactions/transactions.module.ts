import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PaymentModule } from '../payment/payment.module';
import { Transaction, Tank, Pump, Station, Customer, Shift } from '@omc-erp/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Tank, Pump, Station, Customer, Shift]),
    InventoryModule,
    PaymentModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}