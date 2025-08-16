import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  Headers, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions(
    @Query() query: any,
    @Headers() headers: any,
  ) {
    return this.transactionsService.getTransactions(query, headers);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics' })
  async getTransactionStats(@Headers() headers: any) {
    return this.transactionsService.getTransactionStats(headers);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get live transactions' })
  @ApiResponse({ status: 200, description: 'Live transaction data' })
  async getLiveTransactions(@Headers() headers: any) {
    return this.transactionsService.getLiveTransactions(headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  async getTransaction(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    return this.transactionsService.getTransaction(id, headers);
  }

  @Post()
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(
    @Body() transactionData: any,
    @Headers() headers: any,
  ) {
    return this.transactionsService.createTransaction(transactionData, headers);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateData: any,
    @Headers() headers: any,
  ) {
    return this.transactionsService.updateTransaction(id, updateData, headers);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  async deleteTransaction(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    return this.transactionsService.deleteTransaction(id, headers);
  }
}