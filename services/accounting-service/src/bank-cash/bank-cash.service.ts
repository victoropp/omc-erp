import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { format, startOfDay, endOfDay } from 'date-fns';

import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction, TransactionType, TransactionStatus, PaymentMethod } from './entities/bank-transaction.entity';
import { CashTransaction, CashTransactionType, CashAccountType } from './entities/cash-transaction.entity';

export interface BankTransactionData {
  bankAccountId: string;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  amount: number;
  currency?: string;
  description: string;
  referenceNumber?: string;
  checkNumber?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  transactionDate?: Date;
  valueDate?: Date;
  sourceSystem?: string;
  sourceDocumentId?: string;
}

export interface CashTransactionData {
  cashAccountCode: string;
  cashAccountType: CashAccountType;
  transactionType: CashTransactionType;
  amount: number;
  description: string;
  referenceNumber?: string;
  payeePayerName?: string;
  payeePayerId?: string;
  payeePayerType?: string;
  tillId?: string;
  cashierId?: string;
  stationId?: string;
  denominationBreakdown?: any;
  transactionDate?: Date;
}

export interface CashFlowProjection {
  date: Date;
  openingBalance: number;
  projectedInflows: number;
  projectedOutflows: number;
  projectedClosingBalance: number;
  currency: string;
  details: {
    inflows: Array<{ source: string; amount: number; }>;
    outflows: Array<{ destination: string; amount: number; }>;
  };
}

@Injectable()
export class BankCashService {
  private readonly logger = new Logger(BankCashService.name);

  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(CashTransaction)
    private cashTransactionRepo: Repository<CashTransaction>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== BANK ACCOUNT MANAGEMENT =====

  async createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate account number uniqueness
      const existingAccount = await this.bankAccountRepo.findOne({
        where: { 
          tenantId: data.tenantId, 
          accountNumber: data.accountNumber 
        }
      });

      if (existingAccount) {
        throw new BadRequestException('Bank account number already exists');
      }

      // Generate account code if not provided
      if (!data.accountCode) {
        data.accountCode = await this.generateBankAccountCode(queryRunner, data.accountType);
      }

      // Create bank account
      const bankAccount = this.bankAccountRepo.create(data);
      const savedAccount = await queryRunner.manager.save(bankAccount);

      // Create corresponding GL account if it doesn't exist
      await this.createOrUpdateGLAccount(queryRunner, savedAccount);

      await queryRunner.commitTransaction();

      this.logger.log(`Bank account ${savedAccount.accountNumber} created successfully`);
      return savedAccount;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBankAccounts(tenantId: string): Promise<BankAccount[]> {
    return this.bankAccountRepo.find({
      where: { tenantId, isActive: true },
      order: { accountName: 'ASC' }
    });
  }

  async getBankAccountBalance(accountId: string): Promise<any> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: accountId }
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Get latest transactions for running balance verification
    const latestTransaction = await this.bankTransactionRepo.findOne({
      where: { bankAccountId: accountId },
      order: { createdAt: 'DESC' }
    });

    return {
      accountId: account.id,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      currency: account.currency,
      bookBalance: account.bookBalance,
      currentBalance: account.currentBalance,
      availableBalance: account.availableBalance,
      overdraftLimit: account.overdraftLimit,
      lastTransactionDate: latestTransaction?.transactionDate,
      lastReconciliationDate: account.lastReconciliationDate,
      pendingTransactions: await this.getPendingTransactionsCount(accountId),
    };
  }

  // ===== BANK TRANSACTIONS =====

  async createBankTransaction(data: BankTransactionData): Promise<BankTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate bank account
      const bankAccount = await queryRunner.manager.findOne(BankAccount, {
        where: { id: data.bankAccountId, isActive: true }
      });

      if (!bankAccount) {
        throw new BadRequestException('Bank account not found or inactive');
      }

      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        queryRunner, 
        'BANK', 
        data.transactionDate || new Date()
      );

      // Calculate running balance
      const currentBalance = new Decimal(bankAccount.currentBalance);
      let newBalance: Decimal;

      if (data.transactionType === TransactionType.DEPOSIT || 
          data.transactionType === TransactionType.TRANSFER_IN ||
          data.transactionType === TransactionType.INTEREST_EARNED) {
        newBalance = currentBalance.plus(data.amount);
      } else {
        newBalance = currentBalance.minus(data.amount);
      }

      // Check overdraft limits
      if (newBalance.toNumber() < -bankAccount.overdraftLimit) {
        throw new BadRequestException('Transaction exceeds overdraft limit');
      }

      // Create bank transaction
      const transaction = this.bankTransactionRepo.create({
        ...data,
        tenantId: bankAccount.tenantId,
        transactionNumber,
        transactionDate: data.transactionDate || new Date(),
        currency: data.currency || bankAccount.currency,
        baseAmount: data.amount, // Assuming same currency for now
        exchangeRate: 1,
        runningBalance: newBalance.toNumber(),
        status: TransactionStatus.PENDING,
        createdBy: 'system', // Should come from auth context
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update bank account balance
      await queryRunner.manager.update(BankAccount, 
        { id: data.bankAccountId }, 
        { 
          currentBalance: newBalance.toNumber(),
          updatedAt: new Date()
        }
      );

      // Create journal entry for GL integration
      await this.createBankTransactionJournalEntry(queryRunner, savedTransaction, bankAccount);

      await queryRunner.commitTransaction();

      // Emit event for other services
      this.eventEmitter.emit('bank-transaction.created', {
        transactionId: savedTransaction.id,
        bankAccountId: data.bankAccountId,
        amount: data.amount,
        type: data.transactionType,
      });

      this.logger.log(`Bank transaction ${transactionNumber} created successfully`);
      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBankTransactions(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
    status?: TransactionStatus
  ): Promise<BankTransaction[]> {
    const query = this.bankTransactionRepo.createQueryBuilder('bt')
      .where('bt.bankAccountId = :accountId', { accountId })
      .orderBy('bt.transactionDate', 'DESC')
      .addOrderBy('bt.createdAt', 'DESC');

    if (startDate && endDate) {
      query.andWhere('bt.transactionDate BETWEEN :startDate AND :endDate', {
        startDate: startOfDay(startDate),
        endDate: endOfDay(endDate),
      });
    }

    if (status) {
      query.andWhere('bt.status = :status', { status });
    }

    return query.getMany();
  }

  // ===== CASH TRANSACTIONS =====

  async createCashTransaction(data: CashTransactionData): Promise<CashTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        queryRunner, 
        'CASH', 
        data.transactionDate || new Date()
      );

      // Get current cash account balance
      const currentBalance = await this.getCashAccountBalance(
        queryRunner, 
        data.cashAccountCode
      );

      // Calculate running balance
      let newBalance: Decimal = new Decimal(currentBalance);
      
      if (data.transactionType === CashTransactionType.CASH_RECEIPT ||
          data.transactionType === CashTransactionType.PETTY_CASH_REPLENISHMENT ||
          data.transactionType === CashTransactionType.CASH_DEPOSIT) {
        newBalance = newBalance.plus(data.amount);
      } else {
        newBalance = newBalance.minus(data.amount);
      }

      // Check if sufficient funds available (for payments)
      if (newBalance.toNumber() < 0 && 
          !this.isCashAdvanceTransaction(data.transactionType)) {
        throw new BadRequestException('Insufficient cash balance');
      }

      // Create cash transaction
      const transaction = this.cashTransactionRepo.create({
        ...data,
        transactionNumber,
        transactionDate: data.transactionDate || new Date(),
        currency: 'GHS', // Default to Ghana Cedis
        runningBalance: newBalance.toNumber(),
        createdBy: 'system', // Should come from auth context
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update cash account balance in GL
      await this.updateCashAccountBalance(
        queryRunner, 
        data.cashAccountCode, 
        newBalance.toNumber()
      );

      // Create journal entry for GL integration
      await this.createCashTransactionJournalEntry(queryRunner, savedTransaction);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('cash-transaction.created', {
        transactionId: savedTransaction.id,
        accountCode: data.cashAccountCode,
        amount: data.amount,
        type: data.transactionType,
      });

      this.logger.log(`Cash transaction ${transactionNumber} created successfully`);
      return savedTransaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCashTransactions(
    tenantId: string,
    accountCode?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CashTransaction[]> {
    const query = this.cashTransactionRepo.createQueryBuilder('ct')
      .where('ct.tenantId = :tenantId', { tenantId })
      .orderBy('ct.transactionDate', 'DESC')
      .addOrderBy('ct.createdAt', 'DESC');

    if (accountCode) {
      query.andWhere('ct.cashAccountCode = :accountCode', { accountCode });
    }

    if (startDate && endDate) {
      query.andWhere('ct.transactionDate BETWEEN :startDate AND :endDate', {
        startDate: startOfDay(startDate),
        endDate: endOfDay(endDate),
      });
    }

    return query.getMany();
  }

  // ===== CASH FLOW MANAGEMENT =====

  async generateCashFlowProjection(
    tenantId: string,
    days: number = 30
  ): Promise<CashFlowProjection[]> {
    const projections: CashFlowProjection[] = [];
    const startDate = new Date();
    
    // Get current cash position
    const currentCashPosition = await this.getCurrentCashPosition(tenantId);
    
    for (let i = 0; i < days; i++) {
      const projectionDate = new Date(startDate);
      projectionDate.setDate(startDate.getDate() + i);

      // Get historical patterns for this day of week/month
      const historicalInflows = await this.getHistoricalInflows(tenantId, projectionDate);
      const historicalOutflows = await this.getHistoricalOutflows(tenantId, projectionDate);

      // Get scheduled transactions
      const scheduledInflows = await this.getScheduledInflows(tenantId, projectionDate);
      const scheduledOutflows = await this.getScheduledOutflows(tenantId, projectionDate);

      const totalInflows = historicalInflows + scheduledInflows;
      const totalOutflows = historicalOutflows + scheduledOutflows;

      const openingBalance = i === 0 ? 
        currentCashPosition.totalCash : 
        projections[i - 1].projectedClosingBalance;

      projections.push({
        date: projectionDate,
        openingBalance,
        projectedInflows: totalInflows,
        projectedOutflows: totalOutflows,
        projectedClosingBalance: openingBalance + totalInflows - totalOutflows,
        currency: 'GHS',
        details: {
          inflows: [
            { source: 'Fuel Sales', amount: historicalInflows * 0.7 },
            { source: 'Other Revenue', amount: historicalInflows * 0.2 },
            { source: 'Scheduled Receipts', amount: scheduledInflows },
          ],
          outflows: [
            { source: 'Fuel Purchases', amount: historicalOutflows * 0.5 },
            { source: 'Operating Expenses', amount: historicalOutflows * 0.3 },
            { source: 'Scheduled Payments', amount: scheduledOutflows },
          ]
        }
      });
    }

    return projections;
  }

  async getCurrentCashPosition(tenantId: string): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT 
        coa.account_code,
        coa.account_name,
        coa.current_balance,
        coa.currency
      FROM chart_of_accounts coa
      WHERE coa.tenant_id = $1
        AND coa.account_type = 'ASSET'
        AND coa.account_category = 'CURRENT_ASSET'
        AND (coa.account_name LIKE '%Cash%' 
          OR coa.account_name LIKE '%Bank%'
          OR coa.account_name LIKE '%Petty Cash%')
        AND coa.is_active = true
      ORDER BY coa.account_code
    `, [tenantId]);

    const totalCash = result.reduce((sum, account) => sum + account.current_balance, 0);
    
    return {
      totalCash,
      accounts: result,
      asOfDate: new Date(),
      currency: 'GHS'
    };
  }

  // ===== AUTOMATED TASKS =====

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyCashPositionReport(): Promise<void> {
    this.logger.log('Starting daily cash position report generation');
    
    try {
      // Get all active tenants
      const tenants = await this.dataSource.query(
        'SELECT DISTINCT tenant_id FROM bank_accounts WHERE is_active = true'
      );

      for (const tenant of tenants) {
        const cashPosition = await this.getCurrentCashPosition(tenant.tenant_id);
        
        // Check for low cash alerts
        if (cashPosition.totalCash < 10000) { // GHS 10,000 threshold
          this.eventEmitter.emit('cash-position.low', {
            tenantId: tenant.tenant_id,
            currentBalance: cashPosition.totalCash,
            threshold: 10000
          });
        }

        // Generate cash flow projection
        const projection = await this.generateCashFlowProjection(tenant.tenant_id, 7);
        
        // Check for projected negative balances
        const negativeProjections = projection.filter(p => p.projectedClosingBalance < 0);
        if (negativeProjections.length > 0) {
          this.eventEmitter.emit('cash-flow.negative-projection', {
            tenantId: tenant.tenant_id,
            negativeProjections
          });
        }
      }

      this.logger.log('Daily cash position report completed');
    } catch (error) {
      this.logger.error('Failed to generate daily cash position report:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async updateBankBalances(): Promise<void> {
    this.logger.log('Starting bank balance update process');
    
    try {
      // This would integrate with Ghana banking APIs to fetch latest balances
      // For now, we'll update based on unreconciled transactions
      
      const bankAccounts = await this.bankAccountRepo.find({
        where: { isActive: true }
      });

      for (const account of bankAccounts) {
        const reconciledBalance = await this.calculateReconciledBalance(account.id);
        
        if (Math.abs(account.currentBalance - reconciledBalance) > 0.01) {
          await this.bankAccountRepo.update(
            { id: account.id },
            { 
              bookBalance: account.currentBalance,
              currentBalance: reconciledBalance,
              updatedAt: new Date()
            }
          );
        }
      }

      this.logger.log('Bank balance update completed');
    } catch (error) {
      this.logger.error('Failed to update bank balances:', error);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async generateBankAccountCode(
    queryRunner: QueryRunner, 
    accountType: string
  ): Promise<string> {
    const prefix = this.getBankAccountPrefix(accountType);
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count FROM bank_accounts WHERE account_code LIKE $1`,
      [`${prefix}%`]
    );
    
    const sequence = (parseInt(result[0].count) + 1).toString().padStart(3, '0');
    return `${prefix}${sequence}`;
  }

  private getBankAccountPrefix(accountType: string): string {
    const prefixes = {
      'CHECKING': '1001',
      'SAVINGS': '1002',
      'MONEY_MARKET': '1003',
      'FOREIGN_CURRENCY': '1004',
      'MOBILE_MONEY': '1005'
    };
    return prefixes[accountType] || '1000';
  }

  private async generateTransactionNumber(
    queryRunner: QueryRunner,
    type: string,
    date: Date
  ): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = type === 'BANK' ? 'BT' : 'CT';
    
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count 
       FROM ${type === 'BANK' ? 'bank_transactions' : 'cash_transactions'} 
       WHERE transaction_number LIKE $1`,
      [`${prefix}-${dateStr}-%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${sequence}`;
  }

  private async createOrUpdateGLAccount(
    queryRunner: QueryRunner,
    bankAccount: BankAccount
  ): Promise<void> {
    // Check if GL account exists
    const glAccount = await queryRunner.manager.query(
      'SELECT * FROM chart_of_accounts WHERE account_code = $1',
      [bankAccount.accountCode]
    );

    if (glAccount.length === 0) {
      // Create new GL account
      await queryRunner.manager.query(
        `INSERT INTO chart_of_accounts (
          tenant_id, account_code, account_name, account_type,
          account_category, normal_balance, is_active, current_balance,
          currency, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          bankAccount.tenantId,
          bankAccount.accountCode,
          bankAccount.accountName,
          'ASSET',
          'CURRENT_ASSET',
          'DEBIT',
          true,
          bankAccount.currentBalance,
          bankAccount.currency,
          bankAccount.createdBy,
          new Date()
        ]
      );
    }
  }

  private async createBankTransactionJournalEntry(
    queryRunner: QueryRunner,
    transaction: BankTransaction,
    bankAccount: BankAccount
  ): Promise<void> {
    // This would integrate with the GeneralLedgerService
    // For now, we'll create a basic journal entry structure
    
    const isDebitTransaction = [
      TransactionType.DEPOSIT,
      TransactionType.TRANSFER_IN,
      TransactionType.INTEREST_EARNED
    ].includes(transaction.transactionType);

    const journalLines = [{
      accountCode: bankAccount.accountCode,
      description: transaction.description,
      debitAmount: isDebitTransaction ? transaction.amount : 0,
      creditAmount: isDebitTransaction ? 0 : transaction.amount,
    }];

    // The corresponding credit/debit would depend on the transaction type
    // This would be handled by the calling service
  }

  private async createCashTransactionJournalEntry(
    queryRunner: QueryRunner,
    transaction: CashTransaction
  ): Promise<void> {
    const isDebitTransaction = [
      CashTransactionType.CASH_RECEIPT,
      CashTransactionType.PETTY_CASH_REPLENISHMENT,
      CashTransactionType.CASH_DEPOSIT
    ].includes(transaction.transactionType);

    // Similar to bank transactions, this would create journal entries
    // for proper GL integration
  }

  private async getCashAccountBalance(
    queryRunner: QueryRunner,
    accountCode: string
  ): Promise<number> {
    const result = await queryRunner.manager.query(
      'SELECT current_balance FROM chart_of_accounts WHERE account_code = $1',
      [accountCode]
    );
    return result[0]?.current_balance || 0;
  }

  private async updateCashAccountBalance(
    queryRunner: QueryRunner,
    accountCode: string,
    newBalance: number
  ): Promise<void> {
    await queryRunner.manager.query(
      `UPDATE chart_of_accounts 
       SET current_balance = $1, updated_at = $2
       WHERE account_code = $3`,
      [newBalance, new Date(), accountCode]
    );
  }

  private isCashAdvanceTransaction(transactionType: CashTransactionType): boolean {
    return transactionType === CashTransactionType.PETTY_CASH_ADVANCE;
  }

  private async getPendingTransactionsCount(accountId: string): Promise<number> {
    const result = await this.bankTransactionRepo.count({
      where: { 
        bankAccountId: accountId, 
        status: TransactionStatus.PENDING 
      }
    });
    return result;
  }

  private async calculateReconciledBalance(accountId: string): Promise<number> {
    const result = await this.dataSource.query(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN transaction_type IN ('DEPOSIT', 'TRANSFER_IN', 'INTEREST_EARNED') 
          THEN amount 
          ELSE -amount 
        END
      ), 0) as balance
      FROM bank_transactions 
      WHERE bank_account_id = $1 
        AND status IN ('CLEARED', 'RECONCILED')
    `, [accountId]);
    
    return result[0]?.balance || 0;
  }

  private async getHistoricalInflows(tenantId: string, date: Date): Promise<number> {
    // Get historical average inflows for this day of week/month
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    const result = await this.dataSource.query(`
      SELECT AVG(amount) as avg_inflow
      FROM cash_transactions ct
      WHERE ct.tenant_id = $1
        AND ct.transaction_type IN ('CASH_RECEIPT', 'CASH_DEPOSIT')
        AND (EXTRACT(DOW FROM ct.transaction_date) = $2 
          OR EXTRACT(DAY FROM ct.transaction_date) = $3)
        AND ct.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    `, [tenantId, dayOfWeek, dayOfMonth]);
    
    return result[0]?.avg_inflow || 0;
  }

  private async getHistoricalOutflows(tenantId: string, date: Date): Promise<number> {
    // Similar to inflows but for outgoing transactions
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    const result = await this.dataSource.query(`
      SELECT AVG(amount) as avg_outflow
      FROM cash_transactions ct
      WHERE ct.tenant_id = $1
        AND ct.transaction_type IN ('CASH_PAYMENT', 'PETTY_CASH_ADVANCE')
        AND (EXTRACT(DOW FROM ct.transaction_date) = $2 
          OR EXTRACT(DAY FROM ct.transaction_date) = $3)
        AND ct.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    `, [tenantId, dayOfWeek, dayOfMonth]);
    
    return result[0]?.avg_outflow || 0;
  }

  private async getScheduledInflows(tenantId: string, date: Date): Promise<number> {
    // This would check for scheduled receipts, recurring income, etc.
    // For now, returning 0 as this would require additional tables
    return 0;
  }

  private async getScheduledOutflows(tenantId: string, date: Date): Promise<number> {
    // This would check for scheduled payments, recurring expenses, etc.
    // For now, returning 0 as this would require additional tables
    return 0;
  }
}