import { Controller, Get, Post, Put, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getCustomers(@Query() query: any, @Headers() headers: any) {
    return this.customerService.forwardRequest('GET', '', query, headers);
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string, @Headers() headers: any) {
    return this.customerService.forwardRequest('GET', `/${id}`, null, headers);
  }

  @Post()
  async createCustomer(@Body() data: any, @Headers() headers: any) {
    return this.customerService.forwardRequest('POST', '', data, headers);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: string, @Body() data: any, @Headers() headers: any) {
    return this.customerService.forwardRequest('PUT', `/${id}`, data, headers);
  }
}