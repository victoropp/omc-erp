import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { ChartOfAccount } from './chart-of-account.entity';

@Entity('journal_entry_lines')
@Index(['journal_entry_id', 'line_number'], { unique: true })
@Index(['account_code'])
@Index(['station_id'])
@Index(['customer_id'])
@Index(['supplier_id'])
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journal_entry_id', type: 'uuid' })
  journalEntryId: string;

  @Column({ name: 'line_number', type: 'integer' })
  lineNumber: number;

  @Column({ name: 'account_code', length: 20 })
  @Index()
  accountCode: string;

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
    name: 'base_debit_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  baseDebitAmount: number;

  @Column({ 
    name: 'base_credit_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  baseCreditAmount: number;

  // Reference IDs for tracking
  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  @Index()
  stationId?: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  @Index()
  customerId?: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  @Index()
  supplierId?: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId?: string;

  @Column({ name: 'project_code', length: 50, nullable: true })
  projectCode?: string;

  @Column({ name: 'cost_center_code', length: 50, nullable: true })
  costCenterCode?: string;

  // Additional dimensions for reporting
  @Column({ name: 'department_code', length: 50, nullable: true })
  departmentCode?: string;

  @Column({ name: 'region_code', length: 50, nullable: true })
  regionCode?: string;

  @Column({ name: 'product_code', length: 50, nullable: true })
  productCode?: string;

  // Tax information
  @Column({ name: 'tax_code', length: 20, nullable: true })
  taxCode?: string;

  @Column({ 
    name: 'tax_amount', 
    type: 'decimal', 
    precision: 20, 
    scale: 2, 
    default: 0 
  })
  taxAmount: number;

  // Additional metadata
  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber?: string;

  @Column({ name: 'reference_date', type: 'date', nullable: true })
  referenceDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => JournalEntry, entry => entry.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @ManyToOne(() => ChartOfAccount, account => account.journalEntryLines)
  @JoinColumn({ name: 'account_code', referencedColumnName: 'accountCode' })
  account: ChartOfAccount;

  // Validation hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateLine() {
    // Ensure only debit OR credit is set, not both
    if (this.debitAmount > 0 && this.creditAmount > 0) {
      throw new Error('Journal entry line cannot have both debit and credit amounts');
    }

    // Ensure at least one amount is set
    if (this.debitAmount === 0 && this.creditAmount === 0) {
      throw new Error('Journal entry line must have either debit or credit amount');
    }

    // Calculate base amounts
    this.calculateBaseAmounts();
  }

  // Helper methods
  private calculateBaseAmounts() {
    if (this.currencyCode === 'GHS' || this.exchangeRate === 1) {
      this.baseDebitAmount = this.debitAmount;
      this.baseCreditAmount = this.creditAmount;
    } else {
      this.baseDebitAmount = this.debitAmount * this.exchangeRate;
      this.baseCreditAmount = this.creditAmount * this.exchangeRate;
    }
  }

  get netAmount(): number {
    return this.debitAmount - this.creditAmount;
  }

  get baseNetAmount(): number {
    return this.baseDebitAmount - this.baseCreditAmount;
  }

  get isDebitLine(): boolean {
    return this.debitAmount > 0;
  }

  get isCreditLine(): boolean {
    return this.creditAmount > 0;
  }

  // Convert to base currency
  getAmountInBaseCurrency(): number {
    return this.isDebitLine ? this.baseDebitAmount : this.baseCreditAmount;
  }

  // Clone for reversal
  createReversalLine(): Partial<JournalEntryLine> {
    return {
      accountCode: this.accountCode,
      description: `Reversal: ${this.description}`,
      debitAmount: this.creditAmount, // Flip amounts
      creditAmount: this.debitAmount,
      currencyCode: this.currencyCode,
      exchangeRate: this.exchangeRate,
      stationId: this.stationId,
      customerId: this.customerId,
      supplierId: this.supplierId,
      employeeId: this.employeeId,
      projectCode: this.projectCode,
      costCenterCode: this.costCenterCode,
      departmentCode: this.departmentCode,
      regionCode: this.regionCode,
      productCode: this.productCode,
      taxCode: this.taxCode,
      taxAmount: -this.taxAmount,
      referenceNumber: this.referenceNumber,
      referenceDate: this.referenceDate,
    };
  }
}