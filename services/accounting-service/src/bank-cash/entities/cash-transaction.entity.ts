import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

export enum CashTransactionType {
  CASH_RECEIPT = 'CASH_RECEIPT',
  CASH_PAYMENT = 'CASH_PAYMENT',
  PETTY_CASH_ADVANCE = 'PETTY_CASH_ADVANCE',
  PETTY_CASH_REPLENISHMENT = 'PETTY_CASH_REPLENISHMENT',
  CASH_ADJUSTMENT = 'CASH_ADJUSTMENT',
  TILL_COUNT = 'TILL_COUNT',
  CASH_DEPOSIT = 'CASH_DEPOSIT',
  CASH_WITHDRAWAL = 'CASH_WITHDRAWAL'
}

export enum CashAccountType {
  MAIN_CASH = 'MAIN_CASH',
  PETTY_CASH = 'PETTY_CASH',
  CASH_IN_TRANSIT = 'CASH_IN_TRANSIT',
  TILL_CASH = 'TILL_CASH',
  FUEL_SALES_CASH = 'FUEL_SALES_CASH'
}

@Entity('cash_transactions')
@Index(['tenantId', 'transactionDate'])
@Index(['stationId', 'transactionDate'])
@Index(['cashAccountType', 'transactionDate'])
export class CashTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'station_id', nullable: true })
  stationId: string;

  @Column({ name: 'cash_account_code', length: 20 })
  cashAccountCode: string; // GL account code

  @Column({ 
    name: 'cash_account_type', 
    type: 'enum', 
    enum: CashAccountType 
  })
  cashAccountType: CashAccountType;

  @Column({ name: 'transaction_number', length: 50, unique: true })
  transactionNumber: string;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @Column({ 
    name: 'transaction_type', 
    type: 'enum', 
    enum: CashTransactionType 
  })
  transactionType: CashTransactionType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

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
    name: 'running_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2 
  })
  runningBalance: number;

  // Counterparty details
  @Column({ name: 'payee_payer_name', length: 255, nullable: true })
  payeePayerName: string;

  @Column({ name: 'payee_payer_id', nullable: true })
  payeePayerId: string; // Customer ID, Supplier ID, Employee ID

  @Column({ name: 'payee_payer_type', length: 20, nullable: true })
  payeePayerType: string; // CUSTOMER, SUPPLIER, EMPLOYEE, OTHER

  // Cash counting and control
  @Column({ name: 'denomination_breakdown', type: 'text', nullable: true })
  denominationBreakdown: string; // JSON with cash denominations

  @Column({ name: 'till_id', length: 50, nullable: true })
  tillId: string;

  @Column({ name: 'cashier_id', nullable: true })
  cashierId: string;

  @Column({ name: 'supervisor_id', nullable: true })
  supervisorId: string;

  @Column({ name: 'authorized_by', nullable: true })
  authorizedBy: string;

  @Column({ name: 'authorization_date', nullable: true })
  authorizationDate: Date;

  // GL Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'is_posted_to_gl', default: false })
  isPostedToGL: boolean;

  @Column({ name: 'gl_posting_date', nullable: true })
  glPostingDate: Date;

  // Fuel sales specific (Ghana OMC)
  @Column({ name: 'fuel_type', length: 20, nullable: true })
  fuelType: string; // PETROL, DIESEL, KEROSENE

  @Column({ name: 'pump_id', length: 20, nullable: true })
  pumpId: string;

  @Column({ name: 'shift_id', length: 50, nullable: true })
  shiftId: string;

  @Column({ name: 'sales_period', nullable: true })
  salesPeriod: Date;

  // IFRS compliance
  @Column({ name: 'ifrs_category', length: 50, nullable: true })
  ifrsCategory: string;

  @Column({ name: 'fair_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  fairValue: number;

  // Risk management
  @Column({ name: 'risk_rating', length: 20, default: 'LOW' })
  riskRating: string; // LOW, MEDIUM, HIGH

  @Column({ name: 'fraud_check_performed', default: false })
  fraudCheckPerformed: boolean;

  @Column({ name: 'approval_required', default: false })
  approvalRequired: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  // Source and integration
  @Column({ name: 'source_system', length: 50, nullable: true })
  sourceSystem: string;

  @Column({ name: 'source_document_id', nullable: true })
  sourceDocumentId: string;

  @Column({ name: 'source_transaction_id', nullable: true })
  sourceTransactionId: string;

  @Column({ name: 'batch_id', nullable: true })
  batchId: string;

  // Additional details
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'attachments', type: 'text', nullable: true })
  attachments: string; // JSON array of attachment URLs

  @Column({ name: 'location_info', type: 'text', nullable: true })
  locationInfo: string; // JSON with GPS coordinates, etc.

  // Audit fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}