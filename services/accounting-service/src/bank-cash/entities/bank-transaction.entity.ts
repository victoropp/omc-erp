import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { BankAccount } from './bank-account.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  CHECK_PAYMENT = 'CHECK_PAYMENT',
  ELECTRONIC_PAYMENT = 'ELECTRONIC_PAYMENT',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_FEE = 'BANK_FEE',
  INTEREST_EARNED = 'INTEREST_EARNED',
  REVERSAL = 'REVERSAL',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  RECONCILED = 'RECONCILED',
  VOID = 'VOID',
  RETURNED = 'RETURNED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  ELECTRONIC_TRANSFER = 'ELECTRONIC_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  ONLINE_BANKING = 'ONLINE_BANKING'
}

@Entity('bank_transactions')
@Index(['bankAccountId', 'transactionDate'])
@Index(['tenantId', 'transactionDate'])
@Index(['checkNumber'])
@Index(['referenceNumber'])
export class BankTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'bank_account_id' })
  bankAccountId: string;

  @Column({ name: 'transaction_number', length: 50, unique: true })
  transactionNumber: string;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @Column({ name: 'value_date', nullable: true })
  valueDate: Date; // When funds are available

  @Column({ 
    name: 'transaction_type', 
    type: 'enum', 
    enum: TransactionType 
  })
  transactionType: TransactionType;

  @Column({ 
    name: 'payment_method', 
    type: 'enum', 
    enum: PaymentMethod 
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string; // External reference

  @Column({ name: 'check_number', length: 20, nullable: true })
  checkNumber: string;

  @Column({ 
    name: 'amount', 
    type: 'decimal', 
    precision: 15, 
    scale: 2 
  })
  amount: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

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
    precision: 15, 
    scale: 2 
  })
  baseAmount: number; // Amount in base currency

  @Column({ 
    name: 'running_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2 
  })
  runningBalance: number;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  // Counterparty information
  @Column({ name: 'counterparty_name', length: 255, nullable: true })
  counterpartyName: string;

  @Column({ name: 'counterparty_account', length: 50, nullable: true })
  counterpartyAccount: string;

  @Column({ name: 'counterparty_bank', length: 255, nullable: true })
  counterpartyBank: string;

  @Column({ name: 'counterparty_reference', length: 100, nullable: true })
  counterpartyReference: string;

  // GL Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'is_posted_to_gl', default: false })
  isPostedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  // Reconciliation
  @Column({ name: 'reconciliation_id', nullable: true })
  reconciliationId: string;

  @Column({ name: 'is_reconciled', default: false })
  isReconciled: boolean;

  @Column({ name: 'reconciliation_date', nullable: true })
  reconciliationDate: Date;

  @Column({ name: 'statement_date', nullable: true })
  statementDate: Date;

  // Ghana specific
  @Column({ name: 'rtgs_reference', length: 50, nullable: true })
  rtgsReference: string; // Real Time Gross Settlement reference

  @Column({ name: 'mobile_money_reference', length: 50, nullable: true })
  mobileMoneyReference: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string; // MTN, Vodafone, AirtelTigo

  @Column({ name: 'bog_reportable', default: false })
  bogReportable: boolean; // Bank of Ghana reporting required

  // IFRS compliance
  @Column({ name: 'ifrs_category', length: 50, nullable: true })
  ifrsCategory: string; // IFRS 9 category

  @Column({ name: 'expected_credit_loss', type: 'decimal', precision: 15, scale: 2, default: 0 })
  expectedCreditLoss: number;

  @Column({ name: 'fair_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  fairValue: number;

  // Processing details
  @Column({ name: 'processing_date', nullable: true })
  processingDate: Date;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'authorized_by', nullable: true })
  authorizedBy: string;

  @Column({ name: 'authorization_date', nullable: true })
  authorizationDate: Date;

  // Additional metadata
  @Column({ name: 'source_system', length: 50, nullable: true })
  sourceSystem: string;

  @Column({ name: 'source_document_id', nullable: true })
  sourceDocumentId: string;

  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'attachments', type: 'text', nullable: true })
  attachments: string; // JSON array of attachment URLs

  // Audit fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => BankAccount, bankAccount => bankAccount.transactions)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;
}