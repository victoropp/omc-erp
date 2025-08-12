import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new fuel transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 422, description: 'Insufficient inventory' })
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.transactionsService.create(createTransactionDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async findAll(@Query() query: QueryTransactionsDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.findAll(query, tenantId);
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily transaction summary' })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved' })
  async getDailySummary(@Query('date') date: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.getDailySummary(date || new Date().toISOString(), tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.findOne(id, tenantId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a pending transaction' })
  @ApiResponse({ status: 200, description: 'Transaction completed' })
  async complete(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.complete(id, tenantId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled' })
  async cancel(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.cancel(id, body.reason, tenantId);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a completed transaction' })
  @ApiResponse({ status: 200, description: 'Transaction refunded' })
  async refund(@Param('id') id: string, @Body() body: { amount?: number; reason: string }, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.refund(id, body.amount, body.reason, tenantId);
  }

  @Get('station/:stationId')
  @ApiOperation({ summary: 'Get transactions by station' })
  @ApiResponse({ status: 200, description: 'Station transactions retrieved' })
  async getByStation(
    @Param('stationId') stationId: string,
    @Query() query: QueryTransactionsDto,
    @Request() req,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.findByStation(stationId, query, tenantId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get transactions by customer' })
  @ApiResponse({ status: 200, description: 'Customer transactions retrieved' })
  async getByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: QueryTransactionsDto,
    @Request() req,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.transactionsService.findByCustomer(customerId, query, tenantId);
  }
}