import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DealerLoan } from './dealer-loan.entity';

export enum PaymentType {
  REGULAR = 'regular',
  EARLY = 'early',
  PARTIAL = 'partial',
  PENALTY = 'penalty',
  SETTLEMENT_DEDUCTION = 'settlement_deduction',
  MANUAL = 'manual',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('dealer_loan_payments')
@Index(['loanId', 'paymentDate'])
@Index(['paymentStatus', 'paymentDate'])
export class DealerLoanPayment {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Payment reference number' })
  @Column({ unique: true, length: 50 })
  @Index()
  paymentReference: string;

  @ApiProperty({ description: 'Associated loan ID' })
  @Column('uuid')
  @Index()
  loanId: string;

  @ApiProperty({ description: 'Payment date' })
  @Column('timestamptz')
  @Index()
  paymentDate: Date;

  @ApiProperty({ description: 'Due date for this payment' })
  @Column('date')
  dueDate: Date;

  @ApiProperty({ description: 'Principal amount paid' })
  @Column('decimal', { precision: 15, scale: 2 })
  principalAmount: number;

  @ApiProperty({ description: 'Interest amount paid' })
  @Column('decimal', { precision: 15, scale: 2 })
  interestAmount: number;

  @ApiProperty({ description: 'Penalty amount paid' })
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @ApiProperty({ description: 'Total payment amount' })
  @Column('decimal', { precision: 15, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Outstanding balance after payment' })
  @Column('decimal', { precision: 15, scale: 2 })
  outstandingBalanceAfter: number;

  @ApiProperty({ description: 'Payment type', enum: PaymentType })
  @Column('varchar', { length: 30 })
  paymentType: PaymentType;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column('varchar', { length: 20, default: PaymentStatus.COMPLETED })
  @Index()
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Payment method' })
  @Column('varchar', { length: 50, nullable: true })
  paymentMethod: string;

  @ApiProperty({ description: 'Transaction reference from payment system' })
  @Column('varchar', { length: 100, nullable: true })
  transactionReference: string;

  @ApiProperty({ description: 'Settlement ID if paid via settlement deduction' })
  @Column('uuid', { nullable: true })
  settlementId: string;

  @ApiProperty({ description: 'Days late when payment was made' })
  @Column('integer', { default: 0 })
  daysLate: number;

  @ApiProperty({ description: 'Early payment discount applied' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  earlyPaymentDiscount: number;

  @ApiProperty({ description: 'Payment notes' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'Tenant ID' })
  @Column('uuid')
  @Index()
  tenantId: string;

  @ApiProperty({ description: 'User who processed payment' })
  @Column('uuid', { nullable: true })
  processedBy: string;

  @ApiProperty({ description: 'Reversal reason if payment was reversed' })
  @Column('text', { nullable: true })
  reversalReason: string;

  @ApiProperty({ description: 'Original payment ID if this is a reversal' })
  @Column('uuid', { nullable: true })
  originalPaymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => DealerLoan, loan => loan.payments)
  @JoinColumn({ name: 'loanId', referencedColumnName: 'id' })
  loan: DealerLoan;

  // Computed properties
  get isLatePayment(): boolean {
    return this.daysLate > 0;
  }

  get isEarlyPayment(): boolean {
    return this.paymentType === PaymentType.EARLY;
  }
}