import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChartOfAccount } from './chart-of-account.entity';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntryLine } from './journal-entry-line.entity';
import { AccountingPeriod } from './accounting-period.entity';

@Entity('general_ledger')
@Index(['account_code', 'transaction_date'])
@Index(['period_id'])
@Index(['station_id'])
@Index(['reference_type', 'reference_id'])
@Index(['journal_entry_id'])
export class GeneralLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_code', length: 20 })
  @Index()
  accountCode: string;

  @Column({ name: 'journal_entry_id', type: 'uuid' })
  journalEntryId: string;

  @Column({ name: 'journal_line_id', type: 'uuid' })
  journalLineId: string;

  @Column({ name: 'transaction_date', type: 'date' })
  @Index()
  transactionDate: Date;

  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @Column({ name: 'period_id', type: 'uuid', nullable: true })
  periodId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ 
    name: 'debit_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  debitAmount: number;

  @Column({ 
    name: 'credit_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  creditAmount: number;

  @Column({ 
    name: 'running_balance', 
    type: 'decimal', 
    precision: 20, 
    scale: 2 
  })
  runningBalance: number;

  @Column({ name: 'currency_code', length: 3, default: 'GHS' })
  currencyCode: string;

  @Column({ 
    name: 'exchange_rate', 
    type: 'decimal', 
    precision: 10, 
    scale: 6, 
    default: 1 
  })
  exchangeRate: number;

  @Column({ 
    name: 'base_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2 
  })
  baseAmount: number;

  // Reference information
  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  @Index()
  stationId?: string;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType?: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId?: string;

  // Reconciliation
  @Column({ name: 'is_reconciled', default: false })
  isReconciled: boolean;

  @Column({ name: 'reconciliation_date', type: 'date', nullable: true })
  reconciliationDate?: Date;

  @Column({ name: 'reconciliation_reference', length: 100, nullable: true })
  reconciliationReference?: string;

  // Additional dimensions
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId?: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId?: string;

  @Column({ name: 'project_code', length: 50, nullable: true })
  projectCode?: string;

  @Column({ name: 'cost_center_code', length: 50, nullable: true })
  costCenterCode?: string;

  @Column({ name: 'department_code', length: 50, nullable: true })
  departmentCode?: string;

  @Column({ name: 'region_code', length: 50, nullable: true })
  regionCode?: string;

  @Column({ name: 'product_code', length: 50, nullable: true })
  productCode?: string;

  // Sequence number for ordering within account
  @Column({ name: 'sequence_number', type: 'bigint', nullable: true })
  sequenceNumber?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => ChartOfAccount, account => account.generalLedgerEntries)
  @JoinColumn({ name: 'account_code', referencedColumnName: 'accountCode' })
  account: ChartOfAccount;

  @ManyToOne(() => JournalEntry)
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @ManyToOne(() => JournalEntryLine)
  @JoinColumn({ name: 'journal_line_id' })
  journalLine: JournalEntryLine;

  @ManyToOne(() => AccountingPeriod, period => period.generalLedgerEntries)
  @JoinColumn({ name: 'period_id' })
  period?: AccountingPeriod;

  // Helper methods
  get netAmount(): number {
    return this.debitAmount - this.creditAmount;
  }

  get isDebitEntry(): boolean {
    return this.debitAmount > 0;
  }

  get isCreditEntry(): boolean {
    return this.creditAmount > 0;
  }

  get amountForBalance(): number {
    // For normal balance calculation
    return this.isDebitEntry ? this.debitAmount : -this.creditAmount;
  }

  // Get display amount based on account normal balance
  getDisplayAmount(account: ChartOfAccount): number {
    if (account.normalBalance === 'DEBIT') {
      return this.debitAmount - this.creditAmount;
    } else {
      return this.creditAmount - this.debitAmount;
    }
  }

  // Check if this entry affects the account's normal balance positively
  increasesNormalBalance(account: ChartOfAccount): boolean {
    if (account.normalBalance === 'DEBIT') {
      return this.debitAmount > 0;
    } else {
      return this.creditAmount > 0;
    }
  }

  // Get the effective amount for balance calculations
  getEffectiveAmount(account: ChartOfAccount): number {
    if (account.normalBalance === 'DEBIT') {
      return this.debitAmount - this.creditAmount;
    } else {
      return this.creditAmount - this.debitAmount;
    }
  }
}