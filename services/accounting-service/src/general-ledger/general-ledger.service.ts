import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

export interface JournalEntryData {
  journalDate: Date;
  description: string;
  journalType: 'GENERAL' | 'SALES' | 'PURCHASE' | 'CASH_RECEIPT' | 'CASH_PAYMENT' | 'INVENTORY';
  sourceModule?: string;
  sourceDocumentType?: string;
  sourceDocumentId?: string;
  lines: JournalLineData[];
}

export interface JournalLineData {
  accountCode: string;
  description?: string;
  debitAmount?: number;
  creditAmount?: number;
  stationId?: string;
  customerId?: string;
  supplierId?: string;
  costCenter?: string;
  project?: string;
}

export interface TrialBalanceData {
  accountCode: string;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

@Injectable()
export class GeneralLedgerService {
  private readonly logger = new Logger(GeneralLedgerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create automated journal entry for any transaction
   */
  async createJournalEntry(data: JournalEntryData): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate journal entry balance
      this.validateJournalEntry(data);

      // Get current accounting period
      const period = await this.getCurrentPeriod(queryRunner, data.journalDate);
      if (!period) {
        throw new BadRequestException('No open accounting period found for the transaction date');
      }

      // Generate journal number
      const journalNumber = await this.generateJournalNumber(queryRunner, data.journalType, data.journalDate);

      // Calculate totals
      const totalDebit = data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);

      // Create journal entry header
      const journalEntry = await queryRunner.manager.query(
        `INSERT INTO journal_entries (
          journal_number, journal_date, posting_date, period_id,
          journal_type, source_module, source_document_type, source_document_id,
          description, total_debit, total_credit, status, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          journalNumber,
          data.journalDate,
          new Date(),
          period.id,
          data.journalType,
          data.sourceModule,
          data.sourceDocumentType,
          data.sourceDocumentId,
          data.description,
          totalDebit,
          totalCredit,
          'POSTED',
          new Date(),
        ]
      );

      // Create journal entry lines and update GL
      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        
        // Validate account exists
        const account = await this.validateAccount(queryRunner, line.accountCode);

        // Create journal line
        await queryRunner.manager.query(
          `INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_code, description,
            debit_amount, credit_amount, base_debit_amount, base_credit_amount,
            station_id, customer_id, supplier_id, cost_center_code, project_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            journalEntry[0].id,
            i + 1,
            line.accountCode,
            line.description || data.description,
            line.debitAmount || 0,
            line.creditAmount || 0,
            line.debitAmount || 0, // Base amount (assuming no forex for now)
            line.creditAmount || 0,
            line.stationId,
            line.customerId,
            line.supplierId,
            line.costCenter,
            line.project,
          ]
        );

        // Post to General Ledger
        await this.postToGeneralLedger(
          queryRunner,
          journalEntry[0].id,
          account,
          line,
          data.journalDate,
          period.id
        );

        // Update account balance
        await this.updateAccountBalance(queryRunner, line.accountCode, line.debitAmount || 0, line.creditAmount || 0);
      }

      await queryRunner.commitTransaction();

      // Emit event for other services
      this.eventEmitter.emit('journal.posted', {
        journalId: journalEntry[0].id,
        journalNumber: journalNumber,
        sourceModule: data.sourceModule,
        sourceDocumentId: data.sourceDocumentId,
      });

      this.logger.log(`Journal entry ${journalNumber} posted successfully`);
      return journalEntry[0];

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create journal entry:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Post to General Ledger
   */
  private async postToGeneralLedger(
    queryRunner: QueryRunner,
    journalEntryId: string,
    account: any,
    line: JournalLineData,
    transactionDate: Date,
    periodId: string
  ): Promise<void> {
    // Get current balance
    const currentBalance = await this.getAccountBalance(queryRunner, line.accountCode);
    
    // Calculate new balance based on normal balance
    let runningBalance = new Decimal(currentBalance);
    const debitAmount = new Decimal(line.debitAmount || 0);
    const creditAmount = new Decimal(line.creditAmount || 0);

    if (account.normal_balance === 'DEBIT') {
      runningBalance = runningBalance.plus(debitAmount).minus(creditAmount);
    } else {
      runningBalance = runningBalance.plus(creditAmount).minus(debitAmount);
    }

    // Insert GL entry
    await queryRunner.manager.query(
      `INSERT INTO general_ledger (
        account_code, journal_entry_id, journal_line_id,
        transaction_date, posting_date, period_id,
        description, debit_amount, credit_amount,
        running_balance, base_amount, station_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        line.accountCode,
        journalEntryId,
        'dummy-line-id', // You'd get this from the line insertion
        transactionDate,
        new Date(),
        periodId,
        line.description,
        line.debitAmount || 0,
        line.creditAmount || 0,
        runningBalance.toNumber(),
        (line.debitAmount || 0) - (line.creditAmount || 0),
        line.stationId,
      ]
    );
  }

  /**
   * Generate Trial Balance
   */
  async generateTrialBalance(periodId: string): Promise<TrialBalanceData[]> {
    try {
      const result = await this.dataSource.query(
        `WITH period_transactions AS (
          SELECT 
            gl.account_code,
            SUM(gl.debit_amount) as period_debit,
            SUM(gl.credit_amount) as period_credit
          FROM general_ledger gl
          WHERE gl.period_id = $1
          GROUP BY gl.account_code
        ),
        opening_balances AS (
          SELECT 
            coa.account_code,
            COALESCE(tb.closing_debit, 0) as opening_debit,
            COALESCE(tb.closing_credit, 0) as opening_credit
          FROM chart_of_accounts coa
          LEFT JOIN trial_balance_snapshots tb ON tb.account_code = coa.account_code
          WHERE tb.period_id = (
            SELECT id FROM accounting_periods 
            WHERE end_date < (SELECT start_date FROM accounting_periods WHERE id = $1)
            ORDER BY end_date DESC LIMIT 1
          )
        )
        SELECT 
          coa.account_code,
          coa.account_name,
          coa.account_type,
          COALESCE(ob.opening_debit, 0) as opening_debit,
          COALESCE(ob.opening_credit, 0) as opening_credit,
          COALESCE(pt.period_debit, 0) as period_debit,
          COALESCE(pt.period_credit, 0) as period_credit,
          CASE 
            WHEN coa.normal_balance = 'DEBIT' THEN
              COALESCE(ob.opening_debit, 0) + COALESCE(pt.period_debit, 0) - COALESCE(pt.period_credit, 0)
            ELSE 0
          END as closing_debit,
          CASE 
            WHEN coa.normal_balance = 'CREDIT' THEN
              COALESCE(ob.opening_credit, 0) + COALESCE(pt.period_credit, 0) - COALESCE(pt.period_debit, 0)
            ELSE 0
          END as closing_credit
        FROM chart_of_accounts coa
        LEFT JOIN opening_balances ob ON ob.account_code = coa.account_code
        LEFT JOIN period_transactions pt ON pt.account_code = coa.account_code
        WHERE coa.is_active = true
        ORDER BY coa.account_code`,
        [periodId]
      );

      // Validate trial balance
      const totalDebit = result.reduce((sum, row) => sum + row.closing_debit, 0);
      const totalCredit = result.reduce((sum, row) => sum + row.closing_credit, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        this.logger.warn(`Trial balance is out of balance: Debit=${totalDebit}, Credit=${totalCredit}`);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to generate trial balance:', error);
      throw error;
    }
  }

  /**
   * Generate Financial Statements
   */
  async generateFinancialStatements(periodId: string): Promise<any> {
    try {
      // Income Statement
      const incomeStatement = await this.generateIncomeStatement(periodId);
      
      // Balance Sheet
      const balanceSheet = await this.generateBalanceSheet(periodId);
      
      // Cash Flow Statement
      const cashFlow = await this.generateCashFlowStatement(periodId);

      return {
        incomeStatement,
        balanceSheet,
        cashFlow,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to generate financial statements:', error);
      throw error;
    }
  }

  /**
   * Generate Income Statement
   */
  private async generateIncomeStatement(periodId: string): Promise<any> {
    const result = await this.dataSource.query(
      `WITH revenue AS (
        SELECT 
          coa.account_code,
          coa.account_name,
          SUM(gl.credit_amount - gl.debit_amount) as amount
        FROM general_ledger gl
        JOIN chart_of_accounts coa ON coa.account_code = gl.account_code
        WHERE gl.period_id = $1
        AND coa.account_type = 'REVENUE'
        GROUP BY coa.account_code, coa.account_name
      ),
      expenses AS (
        SELECT 
          coa.account_code,
          coa.account_name,
          SUM(gl.debit_amount - gl.credit_amount) as amount
        FROM general_ledger gl
        JOIN chart_of_accounts coa ON coa.account_code = gl.account_code
        WHERE gl.period_id = $1
        AND coa.account_type = 'EXPENSE'
        GROUP BY coa.account_code, coa.account_name
      )
      SELECT 
        'Revenue' as category,
        account_code,
        account_name,
        amount
      FROM revenue
      UNION ALL
      SELECT 
        'Expense' as category,
        account_code,
        account_name,
        amount
      FROM expenses
      ORDER BY category, account_code`,
      [periodId]
    );

    const revenue = result.filter(r => r.category === 'Revenue').reduce((sum, r) => sum + r.amount, 0);
    const expenses = result.filter(r => r.category === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    const netIncome = revenue - expenses;

    return {
      details: result,
      summary: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netIncome: netIncome,
        profitMargin: revenue > 0 ? (netIncome / revenue * 100).toFixed(2) + '%' : '0%',
      }
    };
  }

  /**
   * Generate Balance Sheet
   */
  private async generateBalanceSheet(periodId: string): Promise<any> {
    const result = await this.dataSource.query(
      `SELECT 
        coa.account_type,
        coa.account_category,
        coa.account_code,
        coa.account_name,
        CASE 
          WHEN coa.normal_balance = 'DEBIT' THEN
            coa.current_balance
          ELSE
            -coa.current_balance
        END as balance
      FROM chart_of_accounts coa
      WHERE coa.is_active = true
      AND coa.account_type IN ('ASSET', 'LIABILITY', 'EQUITY')
      ORDER BY coa.account_type, coa.account_code`,
      []
    );

    const assets = result.filter(r => r.account_type === 'ASSET').reduce((sum, r) => sum + r.balance, 0);
    const liabilities = result.filter(r => r.account_type === 'LIABILITY').reduce((sum, r) => sum + Math.abs(r.balance), 0);
    const equity = result.filter(r => r.account_type === 'EQUITY').reduce((sum, r) => sum + Math.abs(r.balance), 0);

    return {
      details: result,
      summary: {
        totalAssets: assets,
        totalLiabilities: liabilities,
        totalEquity: equity,
        checkBalance: assets - (liabilities + equity), // Should be zero
      }
    };
  }

  /**
   * Generate Cash Flow Statement
   */
  private async generateCashFlowStatement(periodId: string): Promise<any> {
    const result = await this.dataSource.query(
      `WITH cash_movements AS (
        SELECT 
          je.journal_type,
          je.source_module,
          SUM(CASE 
            WHEN coa.account_category = 'CURRENT_ASSET' 
            AND coa.account_name LIKE '%Cash%' 
            THEN jel.debit_amount - jel.credit_amount 
            ELSE 0 
          END) as cash_change
        FROM journal_entries je
        JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
        JOIN chart_of_accounts coa ON coa.account_code = jel.account_code
        WHERE je.period_id = $1
        AND je.status = 'POSTED'
        GROUP BY je.journal_type, je.source_module
      )
      SELECT 
        CASE 
          WHEN source_module IN ('SALES', 'FUEL_SALES') THEN 'Operating'
          WHEN source_module IN ('FIXED_ASSETS') THEN 'Investing'
          WHEN source_module IN ('LOANS', 'EQUITY') THEN 'Financing'
          ELSE 'Operating'
        END as activity_type,
        source_module,
        journal_type,
        SUM(cash_change) as net_cash_flow
      FROM cash_movements
      GROUP BY activity_type, source_module, journal_type
      ORDER BY activity_type, source_module`,
      [periodId]
    );

    const operating = result.filter(r => r.activity_type === 'Operating').reduce((sum, r) => sum + r.net_cash_flow, 0);
    const investing = result.filter(r => r.activity_type === 'Investing').reduce((sum, r) => sum + r.net_cash_flow, 0);
    const financing = result.filter(r => r.activity_type === 'Financing').reduce((sum, r) => sum + r.net_cash_flow, 0);

    return {
      details: result,
      summary: {
        operatingCashFlow: operating,
        investingCashFlow: investing,
        financingCashFlow: financing,
        netCashFlow: operating + investing + financing,
      }
    };
  }

  /**
   * Period Closing Process
   */
  async closePeriod(periodId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if period can be closed
      const period = await queryRunner.manager.query(
        'SELECT * FROM accounting_periods WHERE id = $1',
        [periodId]
      );

      if (!period[0]) {
        throw new BadRequestException('Period not found');
      }

      if (period[0].is_closed) {
        throw new BadRequestException('Period is already closed');
      }

      // Generate and save trial balance snapshot
      const trialBalance = await this.generateTrialBalance(periodId);
      
      for (const account of trialBalance) {
        await queryRunner.manager.query(
          `INSERT INTO trial_balance_snapshots (
            period_id, snapshot_date, account_code,
            opening_debit, opening_credit, period_debit,
            period_credit, closing_debit, closing_credit
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (period_id, account_code) 
          DO UPDATE SET 
            closing_debit = EXCLUDED.closing_debit,
            closing_credit = EXCLUDED.closing_credit`,
          [
            periodId,
            period[0].end_date,
            account.accountCode,
            account.openingDebit,
            account.openingCredit,
            account.periodDebit,
            account.periodCredit,
            account.closingDebit,
            account.closingCredit,
          ]
        );
      }

      // If year-end, create closing entries
      if (period[0].is_year_end) {
        await this.createYearEndClosingEntries(queryRunner, periodId);
      }

      // Mark period as closed
      await queryRunner.manager.query(
        `UPDATE accounting_periods 
        SET is_closed = true, closed_date = $1, closed_by = $2
        WHERE id = $3`,
        [new Date(), userId, periodId]
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Period ${period[0].period_name} closed successfully`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to close period:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate journal entry balance
   */
  private validateJournalEntry(data: JournalEntryData): void {
    const totalDebit = data.lines.reduce((sum, line) => {
      return new Decimal(sum).plus(line.debitAmount || 0).toNumber();
    }, 0);

    const totalCredit = data.lines.reduce((sum, line) => {
      return new Decimal(sum).plus(line.creditAmount || 0).toNumber();
    }, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
      );
    }
  }

  /**
   * Get current accounting period
   */
  private async getCurrentPeriod(queryRunner: QueryRunner, transactionDate: Date): Promise<any> {
    const result = await queryRunner.manager.query(
      `SELECT * FROM accounting_periods 
      WHERE $1::date BETWEEN start_date AND end_date 
      AND is_closed = false
      LIMIT 1`,
      [transactionDate]
    );
    return result[0];
  }

  /**
   * Generate unique journal number
   */
  private async generateJournalNumber(
    queryRunner: QueryRunner,
    journalType: string,
    journalDate: Date
  ): Promise<string> {
    const prefix = journalType.substring(0, 3).toUpperCase();
    const dateStr = format(journalDate, 'yyyyMMdd');
    
    const result = await queryRunner.manager.query(
      `SELECT COUNT(*) as count 
      FROM journal_entries 
      WHERE journal_number LIKE $1`,
      [`${prefix}-${dateStr}-%`]
    );

    const sequence = (parseInt(result[0].count) + 1).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${sequence}`;
  }

  /**
   * Validate account exists and is active
   */
  private async validateAccount(queryRunner: QueryRunner, accountCode: string): Promise<any> {
    const result = await queryRunner.manager.query(
      'SELECT * FROM chart_of_accounts WHERE account_code = $1 AND is_active = true',
      [accountCode]
    );

    if (!result[0]) {
      throw new BadRequestException(`Account ${accountCode} not found or inactive`);
    }

    return result[0];
  }

  /**
   * Get account balance
   */
  private async getAccountBalance(queryRunner: QueryRunner, accountCode: string): Promise<number> {
    const result = await queryRunner.manager.query(
      'SELECT current_balance FROM chart_of_accounts WHERE account_code = $1',
      [accountCode]
    );
    return result[0]?.current_balance || 0;
  }

  /**
   * Update account balance
   */
  private async updateAccountBalance(
    queryRunner: QueryRunner,
    accountCode: string,
    debitAmount: number,
    creditAmount: number
  ): Promise<void> {
    await queryRunner.manager.query(
      `UPDATE chart_of_accounts 
      SET current_balance = current_balance + $1 - $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE account_code = $3`,
      [debitAmount, creditAmount, accountCode]
    );
  }

  /**
   * Create year-end closing entries
   */
  private async createYearEndClosingEntries(queryRunner: QueryRunner, periodId: string): Promise<void> {
    // Close revenue accounts to income summary
    await queryRunner.manager.query(
      `INSERT INTO journal_entries (journal_number, journal_date, posting_date, period_id, journal_type, description, total_debit, total_credit, status)
      SELECT 
        'CLS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-REV',
        (SELECT end_date FROM accounting_periods WHERE id = $1),
        CURRENT_DATE,
        $1,
        'GENERAL',
        'Close revenue accounts to income summary',
        SUM(credit_amount - debit_amount),
        SUM(credit_amount - debit_amount),
        'POSTED'
      FROM general_ledger gl
      JOIN chart_of_accounts coa ON coa.account_code = gl.account_code
      WHERE gl.period_id = $1
      AND coa.account_type = 'REVENUE'`,
      [periodId]
    );

    // Close expense accounts to income summary
    await queryRunner.manager.query(
      `INSERT INTO journal_entries (journal_number, journal_date, posting_date, period_id, journal_type, description, total_debit, total_credit, status)
      SELECT 
        'CLS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-EXP',
        (SELECT end_date FROM accounting_periods WHERE id = $1),
        CURRENT_DATE,
        $1,
        'GENERAL',
        'Close expense accounts to income summary',
        SUM(debit_amount - credit_amount),
        SUM(debit_amount - credit_amount),
        'POSTED'
      FROM general_ledger gl
      JOIN chart_of_accounts coa ON coa.account_code = gl.account_code
      WHERE gl.period_id = $1
      AND coa.account_type = 'EXPENSE'`,
      [periodId]
    );
  }
}