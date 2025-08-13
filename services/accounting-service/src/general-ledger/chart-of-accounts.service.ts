import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, Not, IsNull } from 'typeorm';
import { 
  ChartOfAccount, 
  AccountType, 
  AccountCategory, 
  NormalBalance 
} from './entities/chart-of-account.entity';
import { GeneralLedgerEntry } from './entities/general-ledger-entry.entity';
import { 
  CreateChartOfAccountDto, 
  UpdateChartOfAccountDto,
  ChartOfAccountsQueryDto,
  AccountBalanceQueryDto,
} from './dto/chart-of-accounts.dto';

@Injectable()
export class ChartOfAccountsService {
  private readonly logger = new Logger(ChartOfAccountsService.name);

  constructor(
    @InjectRepository(ChartOfAccount)
    private readonly accountRepository: Repository<ChartOfAccount>,
    @InjectRepository(GeneralLedgerEntry)
    private readonly glRepository: Repository<GeneralLedgerEntry>,
  ) {}

  /**
   * Create a new account in the chart of accounts
   */
  async createAccount(createDto: CreateChartOfAccountDto): Promise<ChartOfAccount> {
    this.logger.log(`Creating account with code: ${createDto.accountCode}`);

    // Check if account code already exists
    const existingAccount = await this.accountRepository.findOne({
      where: { accountCode: createDto.accountCode },
    });

    if (existingAccount) {
      throw new ConflictException(`Account code ${createDto.accountCode} already exists`);
    }

    // Validate parent account if provided
    if (createDto.parentAccountCode) {
      const parentAccount = await this.accountRepository.findOne({
        where: { accountCode: createDto.parentAccountCode },
      });

      if (!parentAccount) {
        throw new BadRequestException(`Parent account ${createDto.parentAccountCode} not found`);
      }

      // Validate hierarchy rules
      this.validateAccountHierarchy(createDto.accountType, parentAccount.accountType);
    }

    // Validate account category against account type
    if (createDto.accountCategory) {
      this.validateAccountCategory(createDto.accountType, createDto.accountCategory);
    }

    // Validate normal balance
    this.validateNormalBalance(createDto.accountType, createDto.normalBalance);

    const account = this.accountRepository.create(createDto);
    const savedAccount = await this.accountRepository.save(account);

    this.logger.log(`Account created successfully: ${savedAccount.accountCode}`);
    return savedAccount;
  }

  /**
   * Get all accounts with filtering and pagination
   */
  async findAccounts(query: ChartOfAccountsQueryDto): Promise<{
    accounts: ChartOfAccount[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.buildAccountQuery(query);

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    queryBuilder.skip(offset).take(query.limit);

    // Apply sorting
    queryBuilder.orderBy(`account.${query.sortBy}`, query.sortOrder);

    const [accounts, total] = await queryBuilder.getManyAndCount();

    // Load hierarchy if requested
    if (query.includeHierarchy) {
      for (const account of accounts) {
        account.childAccounts = await this.getChildAccounts(account.accountCode);
      }
    }

    return {
      accounts,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Get a single account by code
   */
  async findAccountByCode(accountCode: string, includeChildren = false): Promise<ChartOfAccount> {
    const account = await this.accountRepository.findOne({
      where: { accountCode },
      relations: ['parentAccount'],
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountCode} not found`);
    }

    if (includeChildren) {
      account.childAccounts = await this.getChildAccounts(accountCode);
    }

    return account;
  }

  /**
   * Update an account
   */
  async updateAccount(accountCode: string, updateDto: UpdateChartOfAccountDto): Promise<ChartOfAccount> {
    this.logger.log(`Updating account: ${accountCode}`);

    const account = await this.findAccountByCode(accountCode);

    // Validate parent account if being changed
    if (updateDto.parentAccountCode && updateDto.parentAccountCode !== account.parentAccountCode) {
      // Check for circular reference
      await this.validateNoCircularReference(accountCode, updateDto.parentAccountCode);

      const parentAccount = await this.accountRepository.findOne({
        where: { accountCode: updateDto.parentAccountCode },
      });

      if (!parentAccount) {
        throw new BadRequestException(`Parent account ${updateDto.parentAccountCode} not found`);
      }

      this.validateAccountHierarchy(account.accountType, parentAccount.accountType);
    }

    // Check if account has transactions before allowing certain changes
    if (updateDto.accountCategory !== account.accountCategory || 
        updateDto.isActive === false) {
      const hasTransactions = await this.accountHasTransactions(accountCode);
      if (hasTransactions && updateDto.isActive === false) {
        throw new BadRequestException('Cannot deactivate account with existing transactions');
      }
    }

    Object.assign(account, updateDto);
    const updatedAccount = await this.accountRepository.save(account);

    this.logger.log(`Account updated successfully: ${accountCode}`);
    return updatedAccount;
  }

  /**
   * Delete an account (soft delete by deactivating)
   */
  async deleteAccount(accountCode: string): Promise<void> {
    this.logger.log(`Deleting account: ${accountCode}`);

    const account = await this.findAccountByCode(accountCode);

    // Check if account has transactions
    const hasTransactions = await this.accountHasTransactions(accountCode);
    if (hasTransactions) {
      throw new BadRequestException('Cannot delete account with existing transactions');
    }

    // Check if account has child accounts
    const childAccounts = await this.getChildAccounts(accountCode);
    if (childAccounts.length > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // Soft delete by deactivating
    account.isActive = false;
    await this.accountRepository.save(account);

    this.logger.log(`Account deactivated: ${accountCode}`);
  }

  /**
   * Get account balance as of a specific date
   */
  async getAccountBalance(
    accountCode: string, 
    query: AccountBalanceQueryDto = {}
  ): Promise<{
    accountCode: string;
    accountName: string;
    balance: number;
    debitBalance: number;
    creditBalance: number;
    asOfDate: Date;
    includesChildren: boolean;
    childrenBalances?: any[];
  }> {
    const account = await this.findAccountByCode(accountCode);
    const asOfDate = query.asOfDate || new Date();

    let accountCodes = [accountCode];

    // Include child accounts if requested
    if (query.includeChildren) {
      const childAccounts = await this.getAllChildAccounts(accountCode);
      accountCodes = [accountCode, ...childAccounts.map(child => child.accountCode)];
    }

    // Get GL entries for the account(s) up to the specified date
    const glEntries = await this.glRepository.find({
      where: {
        accountCode: In(accountCodes),
        transactionDate: query.asOfDate ? { $lte: asOfDate } : undefined,
      },
    });

    // Calculate balances
    const totalDebit = glEntries.reduce((sum, entry) => sum + entry.debitAmount, 0);
    const totalCredit = glEntries.reduce((sum, entry) => sum + entry.creditAmount, 0);

    let balance: number;
    let debitBalance = 0;
    let creditBalance = 0;

    if (account.normalBalance === NormalBalance.DEBIT) {
      balance = totalDebit - totalCredit;
      debitBalance = balance > 0 ? balance : 0;
      creditBalance = balance < 0 ? Math.abs(balance) : 0;
    } else {
      balance = totalCredit - totalDebit;
      creditBalance = balance > 0 ? balance : 0;
      debitBalance = balance < 0 ? Math.abs(balance) : 0;
    }

    const result = {
      accountCode,
      accountName: account.accountName,
      balance,
      debitBalance,
      creditBalance,
      asOfDate,
      includesChildren: query.includeChildren,
    };

    // Include individual child balances if requested
    if (query.includeChildren) {
      const childrenBalances = [];
      const childAccounts = await this.getAllChildAccounts(accountCode);
      
      for (const child of childAccounts) {
        const childBalance = await this.getAccountBalance(child.accountCode, {
          ...query,
          includeChildren: false,
        });
        childrenBalances.push(childBalance);
      }
      
      (result as any).childrenBalances = childrenBalances;
    }

    return result;
  }

  /**
   * Get account hierarchy tree
   */
  async getAccountHierarchy(rootAccountCode?: string): Promise<ChartOfAccount[]> {
    let whereClause: any = { isActive: true };
    
    if (rootAccountCode) {
      whereClause.parentAccountCode = rootAccountCode;
    } else {
      whereClause.parentAccountCode = IsNull();
    }

    const accounts = await this.accountRepository.find({
      where: whereClause,
      order: { accountCode: 'ASC' },
    });

    // Recursively load children
    for (const account of accounts) {
      account.childAccounts = await this.getAccountHierarchy(account.accountCode);
    }

    return accounts;
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(accountType: AccountType): Promise<ChartOfAccount[]> {
    return this.accountRepository.find({
      where: { accountType, isActive: true },
      order: { accountCode: 'ASC' },
    });
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<ChartOfAccount[]> {
    return this.accountRepository.find({
      where: { isBankAccount: true, isActive: true },
      order: { accountCode: 'ASC' },
    });
  }

  /**
   * Get reconcilable accounts
   */
  async getReconcilableAccounts(): Promise<ChartOfAccount[]> {
    return this.accountRepository.find({
      where: { isReconcilable: true, isActive: true },
      order: { accountCode: 'ASC' },
    });
  }

  /**
   * Update account balance (called when GL entries are posted)
   */
  async updateAccountBalance(accountCode: string, debitAmount: number, creditAmount: number): Promise<void> {
    const account = await this.findAccountByCode(accountCode);
    
    if (account.normalBalance === NormalBalance.DEBIT) {
      account.currentBalance += (debitAmount - creditAmount);
    } else {
      account.currentBalance += (creditAmount - debitAmount);
    }

    await this.accountRepository.save(account);
  }

  // Private helper methods

  private buildAccountQuery(query: ChartOfAccountsQueryDto): SelectQueryBuilder<ChartOfAccount> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.parentAccount', 'parentAccount');

    if (query.accountCode) {
      queryBuilder.andWhere('account.accountCode ILIKE :accountCode', {
        accountCode: `%${query.accountCode}%`,
      });
    }

    if (query.accountName) {
      queryBuilder.andWhere('account.accountName ILIKE :accountName', {
        accountName: `%${query.accountName}%`,
      });
    }

    if (query.accountType) {
      queryBuilder.andWhere('account.accountType = :accountType', {
        accountType: query.accountType,
      });
    }

    if (query.accountCategory) {
      queryBuilder.andWhere('account.accountCategory = :accountCategory', {
        accountCategory: query.accountCategory,
      });
    }

    if (query.parentAccountCode) {
      queryBuilder.andWhere('account.parentAccountCode = :parentAccountCode', {
        parentAccountCode: query.parentAccountCode,
      });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('account.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.controlAccountsOnly) {
      queryBuilder.andWhere('account.isControlAccount = true');
    }

    if (query.bankAccountsOnly) {
      queryBuilder.andWhere('account.isBankAccount = true');
    }

    if (query.reconcilableOnly) {
      queryBuilder.andWhere('account.isReconcilable = true');
    }

    if (query.currencyCode) {
      queryBuilder.andWhere('account.currencyCode = :currencyCode', {
        currencyCode: query.currencyCode,
      });
    }

    return queryBuilder;
  }

  private async getChildAccounts(parentAccountCode: string): Promise<ChartOfAccount[]> {
    return this.accountRepository.find({
      where: { parentAccountCode, isActive: true },
      order: { accountCode: 'ASC' },
    });
  }

  private async getAllChildAccounts(parentAccountCode: string): Promise<ChartOfAccount[]> {
    const childAccounts = await this.getChildAccounts(parentAccountCode);
    const allChildren = [...childAccounts];

    for (const child of childAccounts) {
      const grandChildren = await this.getAllChildAccounts(child.accountCode);
      allChildren.push(...grandChildren);
    }

    return allChildren;
  }

  private async accountHasTransactions(accountCode: string): Promise<boolean> {
    const count = await this.glRepository.count({
      where: { accountCode },
    });
    return count > 0;
  }

  private async validateNoCircularReference(accountCode: string, newParentCode: string): Promise<void> {
    let currentParent = newParentCode;
    const visited = new Set<string>();

    while (currentParent) {
      if (visited.has(currentParent)) {
        throw new BadRequestException('Circular reference detected in account hierarchy');
      }
      
      if (currentParent === accountCode) {
        throw new BadRequestException('Cannot set account as its own ancestor');
      }

      visited.add(currentParent);

      const parent = await this.accountRepository.findOne({
        where: { accountCode: currentParent },
      });

      currentParent = parent?.parentAccountCode;
    }
  }

  private validateAccountHierarchy(accountType: AccountType, parentAccountType: AccountType): void {
    // Define valid parent-child relationships
    const validRelationships = {
      [AccountType.ASSET]: [AccountType.ASSET],
      [AccountType.LIABILITY]: [AccountType.LIABILITY],
      [AccountType.EQUITY]: [AccountType.EQUITY],
      [AccountType.REVENUE]: [AccountType.REVENUE],
      [AccountType.EXPENSE]: [AccountType.EXPENSE],
    };

    if (!validRelationships[accountType]?.includes(parentAccountType)) {
      throw new BadRequestException(
        `Invalid hierarchy: ${accountType} cannot be a child of ${parentAccountType}`
      );
    }
  }

  private validateAccountCategory(accountType: AccountType, category: AccountCategory): void {
    const validCategories = {
      [AccountType.ASSET]: [
        AccountCategory.CURRENT_ASSET,
        AccountCategory.FIXED_ASSET,
        AccountCategory.INTANGIBLE_ASSET,
        AccountCategory.INVESTMENT,
      ],
      [AccountType.LIABILITY]: [
        AccountCategory.CURRENT_LIABILITY,
        AccountCategory.LONG_TERM_LIABILITY,
      ],
      [AccountType.EQUITY]: [AccountCategory.EQUITY],
      [AccountType.REVENUE]: [
        AccountCategory.REVENUE,
        AccountCategory.OTHER_INCOME,
      ],
      [AccountType.EXPENSE]: [
        AccountCategory.COST_OF_GOODS_SOLD,
        AccountCategory.OPERATING_EXPENSE,
        AccountCategory.ADMINISTRATIVE_EXPENSE,
        AccountCategory.FINANCIAL_EXPENSE,
      ],
    };

    if (!validCategories[accountType]?.includes(category)) {
      throw new BadRequestException(
        `Invalid category ${category} for account type ${accountType}`
      );
    }
  }

  private validateNormalBalance(accountType: AccountType, normalBalance: NormalBalance): void {
    const expectedNormalBalance = {
      [AccountType.ASSET]: NormalBalance.DEBIT,
      [AccountType.EXPENSE]: NormalBalance.DEBIT,
      [AccountType.LIABILITY]: NormalBalance.CREDIT,
      [AccountType.EQUITY]: NormalBalance.CREDIT,
      [AccountType.REVENUE]: NormalBalance.CREDIT,
    };

    if (expectedNormalBalance[accountType] !== normalBalance) {
      throw new BadRequestException(
        `Invalid normal balance ${normalBalance} for account type ${accountType}. Expected ${expectedNormalBalance[accountType]}`
      );
    }
  }
}