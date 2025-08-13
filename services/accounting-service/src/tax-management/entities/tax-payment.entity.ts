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
import { TaxCalculation } from './tax-calculation.entity';
import { TaxConfiguration } from './tax-configuration.entity';

export enum TaxPaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  CLEARED = 'CLEARED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum TaxPaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH',
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
  GRA_PORTAL = 'GRA_PORTAL',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

@Entity('tax_payments')
@Index(['tenantId', 'taxCalculationId'])
@Index(['tenantId', 'paymentDate'])
@Index(['tenantId', 'status'])
@Index(['graReferenceNumber'])
export class TaxPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'payment_number', length: 50, unique: true })
  paymentNumber: string;

  @Column({ name: 'tax_calculation_id' })
  taxCalculationId: string;

  @Column({ name: 'tax_configuration_id' })
  taxConfigurationId: string;

  // Payment Details
  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'payment_amount', type: 'decimal', precision: 15, scale: 2 })
  paymentAmount: number;

  @Column({ 
    name: 'payment_method', 
    type: 'enum', 
    enum: TaxPaymentMethod 
  })
  paymentMethod: TaxPaymentMethod;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'bank_reference', length: 100, nullable: true })
  bankReference: string;

  @Column({ name: 'transaction_id', length: 100, nullable: true })
  transactionId: string;

  // Payment Breakdown
  @Column({ name: 'principal_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  principalAmount: number;

  @Column({ name: 'penalty_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ name: 'interest_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestAmount: number;

  @Column({ name: 'processing_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  processingFee: number;

  // Ghana Revenue Authority Integration
  @Column({ name: 'gra_reference_number', length: 100, nullable: true })
  graReferenceNumber: string;

  @Column({ name: 'gra_payment_id', length: 100, nullable: true })
  graPaymentId: string;

  @Column({ name: 'gra_receipt_number', length: 100, nullable: true })
  graReceiptNumber: string;

  @Column({ name: 'gra_confirmation_date', nullable: true })
  graConfirmationDate: Date;

  @Column({ name: 'gra_status', length: 50, nullable: true })
  graStatus: string;

  // Status and Processing
  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: TaxPaymentStatus,
    default: TaxPaymentStatus.PENDING
  })
  status: TaxPaymentStatus;

  @Column({ name: 'processing_date', nullable: true })
  processingDate: Date;

  @Column({ name: 'cleared_date', nullable: true })
  clearedDate: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  // Bank and Account Information
  @Column({ name: 'bank_account_id', nullable: true })
  bankAccountId: string;

  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string;

  // Currency and Exchange
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_currency_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  // Prepayment Information
  @Column({ name: 'is_prepayment', default: false })
  isPrepayment: boolean;

  @Column({ name: 'prepayment_period', length: 20, nullable: true })
  prepaymentPeriod: string; // e.g., "2024-Q1"

  @Column({ name: 'applied_to_calculation_id', nullable: true })
  appliedToCalculationId: string; // When prepayment is applied

  @Column({ name: 'application_date', nullable: true })
  applicationDate: Date;

  // Refund Information
  @Column({ name: 'is_refund', default: false })
  isRefund: boolean;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string;

  @Column({ name: 'original_payment_id', nullable: true })
  originalPaymentId: string;

  @Column({ name: 'refund_processed_date', nullable: true })
  refundProcessedDate: Date;

  // Installment Information
  @Column({ name: 'is_installment', default: false })
  isInstallment: boolean;

  @Column({ name: 'installment_number', nullable: true })
  installmentNumber: number;

  @Column({ name: 'total_installments', nullable: true })
  totalInstallments: number;

  @Column({ name: 'installment_agreement_id', nullable: true })
  installmentAgreementId: string;

  // Approval Workflow
  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // GL Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'posted_to_gl', default: false })
  postedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  // Supporting Documentation
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'receipt_url', length: 500, nullable: true })
  receiptUrl: string;

  @Column({ name: 'confirmation_email_sent', default: false })
  confirmationEmailSent: boolean;

  // Notes and Comments
  @Column({ name: 'payment_notes', type: 'text', nullable: true })
  paymentNotes: string;

  @Column({ name: 'processing_notes', type: 'text', nullable: true })
  processingNotes: string;

  // Automation and Integration
  @Column({ name: 'auto_payment', default: false })
  autoPayment: boolean;

  @Column({ name: 'scheduled_payment_date', nullable: true })
  scheduledPaymentDate: Date;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'last_retry_date', nullable: true })
  lastRetryDate: Date;

  @Column({ name: 'external_payment_id', length: 100, nullable: true })
  externalPaymentId: string;

  // Audit Fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => TaxCalculation, calculation => calculation.payments)
  @JoinColumn({ name: 'tax_calculation_id' })
  taxCalculation: TaxCalculation;

  @ManyToOne(() => TaxConfiguration)
  @JoinColumn({ name: 'tax_configuration_id' })
  taxConfiguration: TaxConfiguration;
}