import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntryLine } from './journal-entry-line.entity';
import { GeneralLedgerEntry } from './general-ledger-entry.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountCategory {
  // Assets
  CURRENT_ASSET = 'CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  INTANGIBLE_ASSET = 'INTANGIBLE_ASSET',
  INVESTMENT = 'INVESTMENT',
  
  // Liabilities
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  
  // Equity
  EQUITY = 'EQUITY',
  
  // Revenue
  REVENUE = 'REVENUE',
  OTHER_INCOME = 'OTHER_INCOME',
  
  // Expenses
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  ADMINISTRATIVE_EXPENSE = 'ADMINISTRATIVE_EXPENSE',
  FINANCIAL_EXPENSE = 'FINANCIAL_EXPENSE',
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('chart_of_accounts')
@Index(['account_code'], { unique: true })
@Index(['parent_account_code'])
@Index(['account_type'])
@Index(['is_active'])
export class ChartOfAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_code', length: 20, unique: true })
  @Index()
  accountCode: string;

  @Column({ name: 'parent_account_code', length: 20, nullable: true })
  parentAccountCode?: string;

  @Column({ name: 'account_name', length: 200 })
  accountName: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({
    name: 'account_category',
    type: 'enum',
    enum: AccountCategory,
    nullable: true,
  })
  accountCategory?: AccountCategory;

  @Column({
    name: 'normal_balance',
    type: 'enum',
    enum: NormalBalance,
  })
  normalBalance: NormalBalance;

  @Column({ name: 'is_control_account', default: false })
  isControlAccount: boolean;

  @Column({ name: 'is_bank_account', default: false })
  isBankAccount: boolean;

  @Column({ name: 'is_reconcilable', default: false })
  isReconcilable: boolean;

  @Column({ name: 'currency_code', length: 3, default: 'GHS' })
  currencyCode: string;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 20, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ name: 'current_balance', type: 'decimal', precision: 20, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => ChartOfAccount, { nullable: true })
  @JoinColumn({ name: 'parent_account_code', referencedColumnName: 'accountCode' })
  parentAccount?: ChartOfAccount;

  @OneToMany(() => ChartOfAccount, account => account.parentAccount)
  childAccounts: ChartOfAccount[];

  @OneToMany(() => JournalEntryLine, line => line.account)
  journalEntryLines: JournalEntryLine[];

  @OneToMany(() => GeneralLedgerEntry, entry => entry.account)
  generalLedgerEntries: GeneralLedgerEntry[];

  // Virtual properties for balance calculations
  get debitBalance(): number {
    return this.normalBalance === NormalBalance.DEBIT ? this.currentBalance : 0;
  }

  get creditBalance(): number {
    return this.normalBalance === NormalBalance.CREDIT ? this.currentBalance : 0;
  }

  // Helper method to determine if account is a balance sheet account
  get isBalanceSheetAccount(): boolean {
    return [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY].includes(this.accountType);
  }

  // Helper method to determine if account is an income statement account
  get isIncomeStatementAccount(): boolean {
    return [AccountType.REVENUE, AccountType.EXPENSE].includes(this.accountType);
  }
}