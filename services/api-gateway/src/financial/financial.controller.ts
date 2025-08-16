import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Financial Management')
@Controller('financial')
@UseGuards(ThrottlerGuard, JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ===== CHART OF ACCOUNTS =====
  @Get('chart-of-accounts')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Chart of Accounts' })
  @ApiResponse({ status: 200, description: 'Chart of Accounts retrieved' })
  @ApiQuery({ name: 'accountType', required: false, description: 'Filter by account type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  async getChartOfAccounts(
    @Query('accountType') accountType?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = { accountType, isActive };
    const result = await this.financialService.getChartOfAccounts(filters);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('chart-of-accounts')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccount(@Body() accountData: any, @Req() req: any) {
    const enrichedData = {
      ...accountData,
      createdBy: req.user.sub,
      createdAt: new Date().toISOString(),
    };
    
    const result = await this.financialService.createAccount(enrichedData);
    
    return {
      success: true,
      data: result,
      message: 'Account created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('chart-of-accounts/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  async updateAccount(
    @Param('id') accountId: string,
    @Body() accountData: any,
    @Req() req: any,
  ) {
    const enrichedData = {
      ...accountData,
      updatedBy: req.user.sub,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await this.financialService.updateAccount(accountId, enrichedData);
    
    return {
      success: true,
      data: result,
      message: 'Account updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('chart-of-accounts/:id')
  @Permissions('finance:delete')
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Param('id') accountId: string) {
    await this.financialService.deleteAccount(accountId);
    
    return {
      success: true,
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== GENERAL LEDGER =====
  @Get('general-ledger/trial-balance')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Trial Balance' })
  @ApiResponse({ status: 200, description: 'Trial Balance retrieved' })
  @ApiQuery({ name: 'periodId', required: false, description: 'Accounting period ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  async getTrialBalance(
    @Query('periodId') periodId?: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const result = await this.financialService.getTrialBalance(periodId, asOfDate);
    
    return {
      success: true,
      data: result,
      parameters: { periodId, asOfDate },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('general-ledger/account-balance/:accountCode')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Account Balance' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Account balance retrieved' })
  async getAccountBalance(
    @Param('accountCode') accountCode: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const result = await this.financialService.getAccountBalance(accountCode, asOfDate);
    
    return {
      success: true,
      data: result,
      accountCode,
      asOfDate,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('general-ledger/account-movements/:accountCode')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Account Movements (Ledger)' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'From date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'To date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Account movements retrieved' })
  async getAccountMovements(
    @Param('accountCode') accountCode: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const result = await this.financialService.getAccountMovements(accountCode, fromDate, toDate);
    
    return {
      success: true,
      data: result,
      parameters: { accountCode, fromDate, toDate },
      timestamp: new Date().toISOString(),
    };
  }

  // ===== JOURNAL ENTRIES =====
  @Get('journal-entries')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Journal Entries' })
  @ApiResponse({ status: 200, description: 'Journal entries retrieved' })
  @ApiQuery({ name: 'periodId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getJournalEntries(
    @Query('periodId') periodId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = { periodId, status, fromDate, toDate, page, limit };
    const result = await this.financialService.getJournalEntries(filters);
    
    return {
      success: true,
      data: result,
      filters,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('journal-entries/:id')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Journal Entry by ID' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry retrieved' })
  async getJournalEntry(@Param('id') journalId: string) {
    const result = await this.financialService.getJournalEntry(journalId);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('journal-entries')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create Journal Entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  async createJournalEntry(@Body() journalData: any, @Req() req: any) {
    const enrichedData = {
      ...journalData,
      createdBy: req.user.sub,
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
    };
    
    const result = await this.financialService.createJournalEntry(enrichedData);
    
    return {
      success: true,
      data: result,
      message: 'Journal entry created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('journal-entries/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update Journal Entry (Draft only)' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully' })
  async updateJournalEntry(
    @Param('id') journalId: string,
    @Body() journalData: any,
    @Req() req: any,
  ) {
    const enrichedData = {
      ...journalData,
      updatedBy: req.user.sub,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await this.financialService.updateJournalEntry(journalId, enrichedData);
    
    return {
      success: true,
      data: result,
      message: 'Journal entry updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('journal-entries/:id/post')
  @Permissions('finance:approve')
  @ApiOperation({ summary: 'Post Journal Entry to GL' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  async postJournalEntry(@Param('id') journalId: string, @Req() req: any) {
    const result = await this.financialService.postJournalEntry(journalId);
    
    return {
      success: true,
      data: result,
      message: 'Journal entry posted to General Ledger successfully',
      postedBy: req.user.sub,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('journal-entries/:id/reverse')
  @Permissions('finance:approve')
  @ApiOperation({ summary: 'Reverse Journal Entry' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry reversed successfully' })
  async reverseJournalEntry(
    @Param('id') journalId: string,
    @Body() reverseData: { reason: string },
    @Req() req: any,
  ) {
    const result = await this.financialService.reverseJournalEntry(journalId, reverseData.reason);
    
    return {
      success: true,
      data: result,
      message: 'Journal entry reversed successfully',
      reversedBy: req.user.sub,
      reason: reverseData.reason,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('journal-entries/:id')
  @Permissions('finance:delete')
  @ApiOperation({ summary: 'Delete Journal Entry (Draft only)' })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  async deleteJournalEntry(@Param('id') journalId: string) {
    await this.financialService.deleteJournalEntry(journalId);
    
    return {
      success: true,
      message: 'Journal entry deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== FINANCIAL REPORTING =====
  @Get('reports/profit-loss')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Profit & Loss Statement' })
  @ApiResponse({ status: 200, description: 'P&L statement retrieved' })
  @ApiQuery({ name: 'periodId', required: true, description: 'Accounting period ID' })
  @ApiQuery({ name: 'comparative', required: false, description: 'Include comparative period' })
  async getProfitLossStatement(
    @Query('periodId') periodId: string,
    @Query('comparative') comparative?: boolean,
  ) {
    const result = await this.financialService.getFinancialStatements(periodId, 'profit-loss');
    
    return {
      success: true,
      data: result,
      statementType: 'Profit & Loss Statement',
      periodId,
      comparative,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports/balance-sheet')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Balance Sheet' })
  @ApiResponse({ status: 200, description: 'Balance sheet retrieved' })
  @ApiQuery({ name: 'periodId', required: true, description: 'Accounting period ID' })
  async getBalanceSheet(@Query('periodId') periodId: string) {
    const result = await this.financialService.getFinancialStatements(periodId, 'balance-sheet');
    
    return {
      success: true,
      data: result,
      statementType: 'Balance Sheet',
      periodId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports/cash-flow')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Get Cash Flow Statement' })
  @ApiResponse({ status: 200, description: 'Cash flow statement retrieved' })
  @ApiQuery({ name: 'periodId', required: true, description: 'Accounting period ID' })
  async getCashFlowStatement(@Query('periodId') periodId: string) {
    const result = await this.financialService.getFinancialStatements(periodId, 'cash-flow');
    
    return {
      success: true,
      data: result,
      statementType: 'Cash Flow Statement',
      periodId,
      timestamp: new Date().toISOString(),
    };
  }

  // ===== TAX MANAGEMENT =====
  @Get('tax/ghana-rates')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Ghana Tax Rates' })
  @ApiResponse({ status: 200, description: 'Ghana tax rates retrieved' })
  @ApiQuery({ name: 'taxType', required: false, description: 'VAT, NHIL, GETFund, etc.' })
  async getGhanaTaxRates(@Query('taxType') taxType?: string) {
    const result = await this.financialService.getGhanaTaxRates(taxType);
    
    return {
      success: true,
      data: result,
      country: 'Ghana',
      taxType,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('tax/calculate')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Calculate Taxes' })
  @ApiResponse({ status: 200, description: 'Tax calculation completed' })
  async calculateTaxes(@Body() calculationData: any) {
    const result = await this.financialService.calculateTaxes(calculationData);
    
    return {
      success: true,
      data: result,
      calculationDate: new Date().toISOString(),
    };
  }

  @Post('tax/returns')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Submit Tax Return' })
  @ApiResponse({ status: 201, description: 'Tax return submitted successfully' })
  async submitTaxReturn(@Body() taxReturnData: any, @Req() req: any) {
    const enrichedData = {
      ...taxReturnData,
      submittedBy: req.user.sub,
      submittedAt: new Date().toISOString(),
    };
    
    const result = await this.financialService.submitTaxReturn(enrichedData);
    
    return {
      success: true,
      data: result,
      message: 'Tax return submitted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== SYSTEM HEALTH =====
  @Get('health')
  @ApiOperation({ summary: 'Financial service health check' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getHealthCheck() {
    const result = await this.financialService.getHealthCheck();
    return result;
  }

  // ===== FINANCIAL DASHBOARD =====
  @Get('dashboard/summary')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get Financial Dashboard Summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved' })
  @ApiQuery({ name: 'periodId', required: false })
  async getDashboardSummary(@Query('periodId') periodId?: string) {
    const [trialBalance, profitLoss, balanceSheet] = await Promise.all([
      this.financialService.getTrialBalance(periodId),
      this.financialService.getFinancialStatements(periodId || 'current', 'profit-loss'),
      this.financialService.getFinancialStatements(periodId || 'current', 'balance-sheet'),
    ]);

    return {
      success: true,
      data: {
        summary: {
          totalAssets: balanceSheet?.totalAssets || 0,
          totalLiabilities: balanceSheet?.totalLiabilities || 0,
          totalEquity: balanceSheet?.totalEquity || 0,
          totalRevenue: profitLoss?.totalRevenue || 0,
          totalExpenses: profitLoss?.totalExpenses || 0,
          netIncome: profitLoss?.netIncome || 0,
        },
        trialBalanceStatus: trialBalance?.isBalanced ? 'Balanced' : 'Out of Balance',
        lastUpdated: new Date().toISOString(),
      },
      periodId,
      timestamp: new Date().toISOString(),
    };
  }
}