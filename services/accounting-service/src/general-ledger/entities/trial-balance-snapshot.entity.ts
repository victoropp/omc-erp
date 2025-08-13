import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountingPeriod } from './accounting-period.entity';
import { ChartOfAccount } from './chart-of-account.entity';

@Entity('trial_balance_snapshots')
@Index(['period_id', 'account_code'], { unique: true })
@Index(['snapshot_date'])
@Index(['account_code'])
export class TrialBalanceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'period_id', type: 'uuid' })
  periodId: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  @Index()
  snapshotDate: Date;

  @Column({ name: 'account_code', length: 20 })
  @Index()
  accountCode: string;

  // Opening balances
  @Column({ 
    name: 'opening_debit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  openingDebit: number;

  @Column({ 
    name: 'opening_credit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  openingCredit: number;

  // Period activity
  @Column({ 
    name: 'period_debit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  periodDebit: number;

  @Column({ 
    name: 'period_credit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  periodCredit: number;

  // Closing balances
  @Column({ 
    name: 'closing_debit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  closingDebit: number;

  @Column({ 
    name: 'closing_credit', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  closingCredit: number;

  // Additional fields for reconciliation
  @Column({ 
    name: 'prior_year_adjustment', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  priorYearAdjustment: number;

  @Column({ 
    name: 'reclassification_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  reclassificationAmount: number;

  // Metadata
  @Column({ name: 'transaction_count', type: 'integer', default: 0 })
  transactionCount: number;

  @Column({ name: 'is_balanced', default: true })
  isBalanced: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => AccountingPeriod)
  @JoinColumn({ name: 'period_id' })
  period: AccountingPeriod;

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'account_code', referencedColumnName: 'accountCode' })
  account: ChartOfAccount;

  // Calculated properties
  get openingBalance(): number {
    return this.openingDebit - this.openingCredit;
  }

  get periodNetMovement(): number {
    return this.periodDebit - this.periodCredit;
  }

  get closingBalance(): number {
    return this.closingDebit - this.closingCredit;
  }

  get totalDebits(): number {
    return this.openingDebit + this.periodDebit;
  }

  get totalCredits(): number {
    return this.openingCredit + this.periodCredit;
  }

  get netMovement(): number {
    return this.totalDebits - this.totalCredits;
  }

  // Helper methods for different account types
  getBalanceForAccountType(accountType: string): number {
    const isDebitAccount = ['ASSET', 'EXPENSE'].includes(accountType);
    
    if (isDebitAccount) {
      return this.closingDebit - this.closingCredit;
    } else {
      return this.closingCredit - this.closingDebit;
    }
  }

  getOpeningBalanceForAccountType(accountType: string): number {
    const isDebitAccount = ['ASSET', 'EXPENSE'].includes(accountType);
    
    if (isDebitAccount) {
      return this.openingDebit - this.openingCredit;
    } else {
      return this.openingCredit - this.openingDebit;
    }
  }

  // Validate that debits equal credits
  validateBalance(): boolean {
    const totalDebits = this.openingDebit + this.periodDebit;
    const totalCredits = this.openingCredit + this.periodCredit;
    const closingBalanceCheck = this.closingDebit - this.closingCredit;
    const calculatedClosing = this.openingBalance + this.periodNetMovement;
    
    this.isBalanced = Math.abs(closingBalanceCheck - calculatedClosing) < 0.01;
    return this.isBalanced;
  }

  // Create summary for reporting
  getTrialBalanceSummary() {
    return {
      accountCode: this.accountCode,
      openingDebit: this.openingDebit,
      openingCredit: this.openingCredit,
      periodDebit: this.periodDebit,
      periodCredit: this.periodCredit,
      closingDebit: this.closingDebit,
      closingCredit: this.closingCredit,
      openingBalance: this.openingBalance,
      periodNetMovement: this.periodNetMovement,
      closingBalance: this.closingBalance,
      transactionCount: this.transactionCount,
      isBalanced: this.isBalanced,
    };
  }

  // Static method to calculate from GL entries
  static calculateFromGLEntries(
    accountCode: string,
    periodId: string,
    glEntries: any[],
    openingBalance: number = 0,
  ): Partial<TrialBalanceSnapshot> {
    const periodDebit = glEntries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
    const periodCredit = glEntries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
    
    const openingDebit = openingBalance >= 0 ? openingBalance : 0;
    const openingCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;
    
    const closingBalance = openingBalance + (periodDebit - periodCredit);
    const closingDebit = closingBalance >= 0 ? closingBalance : 0;
    const closingCredit = closingBalance < 0 ? Math.abs(closingBalance) : 0;

    return {
      periodId,
      accountCode,
      openingDebit,
      openingCredit,
      periodDebit,
      periodCredit,
      closingDebit,
      closingCredit,
      transactionCount: glEntries.length,
      snapshotDate: new Date(),
    };
  }
}