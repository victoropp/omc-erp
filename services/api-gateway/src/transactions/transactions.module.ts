import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}