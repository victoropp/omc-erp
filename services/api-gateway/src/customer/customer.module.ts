import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [HttpModule, ProxyModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}