import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { GeneralLedgerEntry } from './general-ledger-entry.entity';

@Entity('accounting_periods')
@Index(['fiscal_year', 'period_number'], { unique: true })
export class AccountingPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'period_name', length: 100 })
  periodName: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'fiscal_year', type: 'integer' })
  @Index()
  fiscalYear: number;

  @Column({ name: 'period_number', type: 'integer' })
  periodNumber: number;

  @Column({ name: 'is_closed', default: false })
  @Index()
  isClosed: boolean;

  @Column({ name: 'closed_date', type: 'timestamptz', nullable: true })
  closedDate?: Date;

  @Column({ name: 'closed_by', type: 'uuid', nullable: true })
  closedBy?: string;

  @Column({ name: 'is_year_end', default: false })
  isYearEnd: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @OneToMany(() => JournalEntry, entry => entry.period)
  journalEntries: JournalEntry[];

  @OneToMany(() => GeneralLedgerEntry, entry => entry.period)
  generalLedgerEntries: GeneralLedgerEntry[];

  // Helper methods
  get isCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  get periodDisplayName(): string {
    return `${this.periodName} (${this.fiscalYear})`;
  }

  canPostTransactions(): boolean {
    return !this.isClosed && this.isCurrentPeriod;
  }

  getDaysInPeriod(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
}