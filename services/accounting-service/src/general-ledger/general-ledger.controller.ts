import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { JournalEntryService } from './journal-entry.service';
import { AccountingPeriodService } from './accounting-period.service';
import { GeneralLedgerService } from './general-ledger.service';
import {
  CreateChartOfAccountDto,
  UpdateChartOfAccountDto,
  ChartOfAccountsQueryDto,
  AccountBalanceQueryDto,
} from './dto/chart-of-accounts.dto';
import {
  CreateJournalEntryDto,
  JournalEntryQueryDto,
} from './dto/create-journal-entry.dto';

@ApiTags('General Ledger')
@ApiBearerAuth('JWT-auth')
@Controller('general-ledger')
export class GeneralLedgerController {
  private readonly logger = new Logger(GeneralLedgerController.name);

  constructor(
    private readonly chartOfAccountsService: ChartOfAccountsService,
    private readonly journalEntryService: JournalEntryService,
    private readonly accountingPeriodService: AccountingPeriodService,
    private readonly generalLedgerService: GeneralLedgerService,
  ) {}

  // ====================================
  // CHART OF ACCOUNTS ENDPOINTS
  // ====================================

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account in chart of accounts' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid account data' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  async createAccount(@Body() createDto: CreateChartOfAccountDto) {
    this.logger.log(`Creating account: ${createDto.accountCode}`);
    return this.chartOfAccountsService.createAccount(createDto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get chart of accounts with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async getAccounts(@Query() query: ChartOfAccountsQueryDto) {
    this.logger.log('Retrieving chart of accounts');
    return this.chartOfAccountsService.findAccounts(query);
  }

  @Get('accounts/:accountCode')
  @ApiOperation({ summary: 'Get account by code' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountByCode(
    @Param('accountCode') accountCode: string,
    @Query('includeChildren') includeChildren: boolean = false,
  ) {
    this.logger.log(`Retrieving account: ${accountCode}`);
    return this.chartOfAccountsService.findAccountByCode(accountCode, includeChildren);
  }

  @Put('accounts/:accountCode')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @Param('accountCode') accountCode: string,
    @Body() updateDto: UpdateChartOfAccountDto,
  ) {
    this.logger.log(`Updating account: ${accountCode}`);
    return this.chartOfAccountsService.updateAccount(accountCode, updateDto);
  }

  @Delete('accounts/:accountCode')
  @ApiOperation({ summary: 'Delete (deactivate) an account' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with transactions' })
  async deleteAccount(@Param('accountCode') accountCode: string) {
    this.logger.log(`Deleting account: ${accountCode}`);
    await this.chartOfAccountsService.deleteAccount(accountCode);
    return { message: 'Account deleted successfully' };
  }

  @Get('accounts/:accountCode/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getAccountBalance(
    @Param('accountCode') accountCode: string,
    @Query() query: AccountBalanceQueryDto,
  ) {
    this.logger.log(`Getting balance for account: ${accountCode}`);
    return this.chartOfAccountsService.getAccountBalance(accountCode, query);
  }

  @Get('accounts/hierarchy/tree')
  @ApiOperation({ summary: 'Get complete account hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getAccountHierarchy(@Query('rootAccount') rootAccount?: string) {
    this.logger.log('Retrieving account hierarchy');
    return this.chartOfAccountsService.getAccountHierarchy(rootAccount);
  }

  @Get('accounts/types/:accountType')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiParam({ name: 'accountType', description: 'Account type' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async getAccountsByType(@Param('accountType') accountType: string) {
    this.logger.log(`Getting accounts by type: ${accountType}`);
    return this.chartOfAccountsService.getAccountsByType(accountType as any);
  }

  @Get('accounts/special/bank-accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'Bank accounts retrieved successfully' })
  async getBankAccounts() {
    this.logger.log('Getting bank accounts');
    return this.chartOfAccountsService.getBankAccounts();
  }

  @Get('accounts/special/reconcilable')
  @ApiOperation({ summary: 'Get all reconcilable accounts' })
  @ApiResponse({ status: 200, description: 'Reconcilable accounts retrieved successfully' })
  async getReconcilableAccounts() {
    this.logger.log('Getting reconcilable accounts');
    return this.chartOfAccountsService.getReconcilableAccounts();
  }

  // ====================================
  // JOURNAL ENTRIES ENDPOINTS
  // ====================================

  @Post('journal-entries')
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid journal entry data' })
  async createJournalEntry(@Body() createDto: CreateJournalEntryDto) {
    this.logger.log('Creating journal entry');
    return this.journalEntryService.createJournalEntry(createDto);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get journal entries with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Journal entries retrieved successfully' })
  async getJournalEntries(@Query() query: JournalEntryQueryDto) {
    this.logger.log('Retrieving journal entries');
    return this.journalEntryService.findJournalEntries(query);
  }

  @Get('journal-entries/:id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async getJournalEntryById(@Param('id') id: string) {
    this.logger.log(`Retrieving journal entry: ${id}`);
    return this.journalEntryService.findJournalEntryById(id);
  }

  @Post('journal-entries/:id/post')
  @ApiOperation({ summary: 'Post a journal entry to general ledger' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot post journal entry' })
  async postJournalEntry(@Param('id') id: string) {
    this.logger.log(`Posting journal entry: ${id}`);
    return this.journalEntryService.postJournalEntry(id);
  }

  @Post('journal-entries/:id/reverse')
  @ApiOperation({ summary: 'Reverse a posted journal entry' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry reversed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reverse journal entry' })
  async reverseJournalEntry(@Param('id') id: string) {
    this.logger.log(`Reversing journal entry: ${id}`);
    return this.journalEntryService.reverseJournalEntry(id);
  }

  @Delete('journal-entries/:id')
  @ApiOperation({ summary: 'Delete a draft journal entry' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete posted journal entry' })
  async deleteJournalEntry(@Param('id') id: string) {
    this.logger.log(`Deleting journal entry: ${id}`);
    await this.journalEntryService.deleteJournalEntry(id);
    return { message: 'Journal entry deleted successfully' };
  }

  // ====================================
  // GENERAL LEDGER ENDPOINTS
  // ====================================

  @Get('ledger/:accountCode')
  @ApiOperation({ summary: 'Get general ledger entries for an account' })
  @ApiParam({ name: 'accountCode', description: 'Account code' })
  @ApiResponse({ status: 200, description: 'Ledger entries retrieved successfully' })
  async getLedgerEntries(
    @Param('accountCode') accountCode: string,
    @Query() query: any,
  ) {
    this.logger.log(`Getting ledger entries for account: ${accountCode}`);
    return this.generalLedgerService.getLedgerEntries(accountCode, query);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Generate trial balance report' })
  @ApiResponse({ status: 200, description: 'Trial balance generated successfully' })
  async getTrialBalance(@Query() query: any) {
    this.logger.log('Generating trial balance');
    return this.generalLedgerService.generateTrialBalance(query);
  }

  @Get('trial-balance/snapshots')
  @ApiOperation({ summary: 'Get trial balance snapshots' })
  @ApiResponse({ status: 200, description: 'Trial balance snapshots retrieved successfully' })
  async getTrialBalanceSnapshots(@Query() query: any) {
    this.logger.log('Retrieving trial balance snapshots');
    return this.generalLedgerService.getTrialBalanceSnapshots(query);
  }

  @Post('trial-balance/snapshot')
  @ApiOperation({ summary: 'Create trial balance snapshot' })
  @ApiResponse({ status: 201, description: 'Trial balance snapshot created successfully' })
  async createTrialBalanceSnapshot(@Body() data: any) {
    this.logger.log('Creating trial balance snapshot');
    return this.generalLedgerService.createTrialBalanceSnapshot(data);
  }

  // ====================================
  // ACCOUNTING PERIODS ENDPOINTS
  // ====================================

  @Get('periods')
  @ApiOperation({ summary: 'Get accounting periods' })
  @ApiResponse({ status: 200, description: 'Accounting periods retrieved successfully' })
  async getAccountingPeriods(@Query() query: any) {
    this.logger.log('Retrieving accounting periods');
    return this.accountingPeriodService.findPeriods(query);
  }

  @Get('periods/current')
  @ApiOperation({ summary: 'Get current accounting period' })
  @ApiResponse({ status: 200, description: 'Current period retrieved successfully' })
  async getCurrentPeriod() {
    this.logger.log('Getting current accounting period');
    return this.accountingPeriodService.getCurrentPeriod();
  }

  @Post('periods')
  @ApiOperation({ summary: 'Create accounting period' })
  @ApiResponse({ status: 201, description: 'Accounting period created successfully' })
  async createAccountingPeriod(@Body() data: any) {
    this.logger.log('Creating accounting period');
    return this.accountingPeriodService.createPeriod(data);
  }

  @Post('periods/:id/close')
  @ApiOperation({ summary: 'Close accounting period' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiResponse({ status: 200, description: 'Accounting period closed successfully' })
  async closePeriod(@Param('id') id: string) {
    this.logger.log(`Closing accounting period: ${id}`);
    return this.accountingPeriodService.closePeriod(id);
  }

  @Post('periods/:id/reopen')
  @ApiOperation({ summary: 'Reopen closed accounting period' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiResponse({ status: 200, description: 'Accounting period reopened successfully' })
  async reopenPeriod(@Param('id') id: string) {
    this.logger.log(`Reopening accounting period: ${id}`);
    return this.accountingPeriodService.reopenPeriod(id);
  }

  // ====================================
  // REPORTING ENDPOINTS
  // ====================================

  @Get('reports/account-activity')
  @ApiOperation({ summary: 'Get account activity report' })
  @ApiResponse({ status: 200, description: 'Account activity report generated successfully' })
  async getAccountActivityReport(@Query() query: any) {
    this.logger.log('Generating account activity report');
    return this.generalLedgerService.generateAccountActivityReport(query);
  }

  @Get('reports/balance-summary')
  @ApiOperation({ summary: 'Get balance summary by account type' })
  @ApiResponse({ status: 200, description: 'Balance summary generated successfully' })
  async getBalanceSummary(@Query() query: any) {
    this.logger.log('Generating balance summary');
    return this.generalLedgerService.generateBalanceSummary(query);
  }

  @Get('reports/journal-register')
  @ApiOperation({ summary: 'Get journal register report' })
  @ApiResponse({ status: 200, description: 'Journal register generated successfully' })
  async getJournalRegister(@Query() query: any) {
    this.logger.log('Generating journal register');
    return this.journalEntryService.generateJournalRegister(query);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for General Ledger service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'General Ledger',
      timestamp: new Date().toISOString(),
    };
  }
}