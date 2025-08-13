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
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { JournalEntryLine } from './journal-entry-line.entity';
import { AccountingPeriod } from './accounting-period.entity';

export enum JournalType {
  GENERAL = 'GENERAL',
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  CASH_RECEIPT = 'CASH_RECEIPT',
  CASH_PAYMENT = 'CASH_PAYMENT',
  INVENTORY = 'INVENTORY',
  PAYROLL = 'PAYROLL',
  DEPRECIATION = 'DEPRECIATION',
  ACCRUAL = 'ACCRUAL',
  ADJUSTMENT = 'ADJUSTMENT',
  CLOSING = 'CLOSING',
  OPENING = 'OPENING',
}

export enum JournalStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

@Entity('journal_entries')
@Index(['journal_number'], { unique: true })
@Index(['journal_date'])
@Index(['status'])
@Index(['source_module'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journal_number', length: 50, unique: true })
  @Index()
  journalNumber: string;

  @Column({ name: 'journal_date', type: 'date' })
  @Index()
  journalDate: Date;

  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @Column({ name: 'period_id', type: 'uuid', nullable: true })
  periodId?: string;

  @Column({
    name: 'journal_type',
    type: 'enum',
    enum: JournalType,
    default: JournalType.GENERAL,
  })
  journalType: JournalType;

  @Column({ name: 'source_module', length: 50, nullable: true })
  @Index()
  sourceModule?: string;

  @Column({ name: 'source_document_type', length: 50, nullable: true })
  sourceDocumentType?: string;

  @Column({ name: 'source_document_id', type: 'uuid', nullable: true })
  sourceDocumentId?: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'total_debit', type: 'decimal', precision: 20, scale: 2 })
  totalDebit: number;

  @Column({ name: 'total_credit', type: 'decimal', precision: 20, scale: 2 })
  totalCredit: number;

  @Column({
    type: 'enum',
    enum: JournalStatus,
    default: JournalStatus.DRAFT,
  })
  @Index()
  status: JournalStatus;

  @Column({ name: 'is_reversed', default: false })
  isReversed: boolean;

  @Column({ name: 'reversed_by', type: 'uuid', nullable: true })
  reversedBy?: string;

  @Column({ name: 'reversal_journal_id', type: 'uuid', nullable: true })
  reversalJournalId?: string;

  @Column({ name: 'posted_at', type: 'timestamptz', nullable: true })
  postedAt?: Date;

  @Column({ name: 'posted_by', type: 'uuid', nullable: true })
  postedBy?: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => AccountingPeriod, period => period.journalEntries)
  @JoinColumn({ name: 'period_id' })
  period?: AccountingPeriod;

  @OneToMany(() => JournalEntryLine, line => line.journalEntry, { 
    cascade: true,
    eager: false,
  })
  lines: JournalEntryLine[];

  @ManyToOne(() => JournalEntry, { nullable: true })
  @JoinColumn({ name: 'reversal_journal_id' })
  reversalJournal?: JournalEntry;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateBalance() {
    if (Math.abs(this.totalDebit - this.totalCredit) > 0.01) {
      throw new Error(`Journal entry ${this.journalNumber} is not balanced. Debit: ${this.totalDebit}, Credit: ${this.totalCredit}`);
    }
  }

  @BeforeInsert()
  generateJournalNumber() {
    if (!this.journalNumber) {
      const prefix = this.getJournalPrefix();
      const date = this.journalDate.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.journalNumber = `${prefix}-${date}-${random}`;
    }
  }

  // Helper methods
  private getJournalPrefix(): string {
    const prefixes = {
      [JournalType.GENERAL]: 'JE',
      [JournalType.SALES]: 'SJ',
      [JournalType.PURCHASE]: 'PJ',
      [JournalType.CASH_RECEIPT]: 'CR',
      [JournalType.CASH_PAYMENT]: 'CP',
      [JournalType.INVENTORY]: 'IJ',
      [JournalType.PAYROLL]: 'PR',
      [JournalType.DEPRECIATION]: 'DP',
      [JournalType.ACCRUAL]: 'AC',
      [JournalType.ADJUSTMENT]: 'AJ',
      [JournalType.CLOSING]: 'CJ',
      [JournalType.OPENING]: 'OJ',
    };
    return prefixes[this.journalType] || 'JE';
  }

  get isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }

  get canBePosted(): boolean {
    return this.status === JournalStatus.DRAFT && this.isBalanced && this.lines.length > 0;
  }

  get canBeReversed(): boolean {
    return this.status === JournalStatus.POSTED && !this.isReversed;
  }

  calculateTotals(): void {
    this.totalDebit = this.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    this.totalCredit = this.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  }
}