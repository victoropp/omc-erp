import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index 
} from 'typeorm';
import { BankTransaction } from './bank-transaction.entity';
import { BankReconciliation } from './bank-reconciliation.entity';

export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  MONEY_MARKET = 'MONEY_MARKET',
  CREDIT_LINE = 'CREDIT_LINE',
  FOREIGN_CURRENCY = 'FOREIGN_CURRENCY',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  FROZEN = 'FROZEN'
}

@Entity('bank_accounts')
@Index(['tenantId', 'accountNumber'])
@Index(['tenantId', 'isActive'])
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'account_code', length: 20 })
  accountCode: string; // GL account code

  @Column({ name: 'account_name', length: 255 })
  accountName: string;

  @Column({ name: 'bank_name', length: 255 })
  bankName: string;

  @Column({ name: 'bank_code', length: 20, nullable: true })
  bankCode: string; // Ghana bank code

  @Column({ name: 'branch_name', length: 255, nullable: true })
  branchName: string;

  @Column({ name: 'branch_code', length: 20, nullable: true })
  branchCode: string;

  @Column({ name: 'account_number', length: 50 })
  accountNumber: string;

  @Column({ name: 'iban', length: 50, nullable: true })
  iban: string; // International Bank Account Number

  @Column({ name: 'swift_code', length: 20, nullable: true })
  swiftCode: string;

  @Column({ 
    name: 'account_type', 
    type: 'enum', 
    enum: BankAccountType,
    default: BankAccountType.CHECKING
  })
  accountType: BankAccountType;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ 
    name: 'current_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  currentBalance: number;

  @Column({ 
    name: 'book_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  bookBalance: number; // Balance per books (GL)

  @Column({ 
    name: 'available_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  availableBalance: number; // Available for use (after holds)

  @Column({ 
    name: 'overdraft_limit', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  overdraftLimit: number;

  @Column({ 
    name: 'minimum_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  minimumBalance: number;

  @Column({ 
    name: 'interest_rate', 
    type: 'decimal', 
    precision: 8, 
    scale: 4, 
    default: 0 
  })
  interestRate: number; // Annual interest rate

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: BankAccountStatus,
    default: BankAccountStatus.ACTIVE
  })
  status: BankAccountStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_reconciliation_required', default: true })
  isReconciliationRequired: boolean;

  @Column({ name: 'last_reconciliation_date', nullable: true })
  lastReconciliationDate: Date;

  @Column({ name: 'last_statement_date', nullable: true })
  lastStatementDate: Date;

  @Column({ 
    name: 'last_statement_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    nullable: true 
  })
  lastStatementBalance: number;

  // Ghana-specific fields
  @Column({ name: 'ghana_bank_code', length: 10, nullable: true })
  ghanaBankCode: string; // Bank of Ghana assigned code

  @Column({ name: 'rtgs_code', length: 10, nullable: true })
  rtgsCode: string; // Real Time Gross Settlement code

  @Column({ name: 'is_foreign_account', default: false })
  isForeignAccount: boolean;

  @Column({ name: 'bog_reporting_required', default: false })
  bogReportingRequired: boolean; // Bank of Ghana reporting

  // IFRS compliance fields
  @Column({ name: 'ifrs_classification', length: 50, nullable: true })
  ifrsClassification: string; // IFRS 9 classification

  @Column({ name: 'fair_value_measurement', default: false })
  fairValueMeasurement: boolean;

  @Column({ name: 'hedge_accounting', default: false })
  hedgeAccounting: boolean;

  // Contact and authorization
  @Column({ name: 'contact_person', length: 255, nullable: true })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string;

  @Column({ name: 'authorized_signatories', type: 'text', nullable: true })
  authorizedSignatories: string; // JSON array of authorized persons

  @Column({ name: 'signature_requirements', type: 'text', nullable: true })
  signatureRequirements: string; // JSON rules for check signing

  // Audit and tracking
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => BankTransaction, transaction => transaction.bankAccount)
  transactions: BankTransaction[];

  @OneToMany(() => BankReconciliation, reconciliation => reconciliation.bankAccount)
  reconciliations: BankReconciliation[];
}