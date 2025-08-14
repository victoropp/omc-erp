import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DealerLoanPayment } from './dealer-loan-payment.entity';

export enum DealerLoanStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  RESTRUCTURED = 'restructured',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum RepaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
}

export enum AmortizationMethod {
  REDUCING_BALANCE = 'reducing_balance',
  FLAT_RATE = 'flat_rate',
  INTEREST_ONLY = 'interest_only',
}

@Entity('dealer_loans')
@Index(['stationId', 'status'])
@Index(['dealerId', 'status'])
@Index(['nextPaymentDate'], { where: "status = 'active'" })
export class DealerLoan {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Loan reference number' })
  @Column({ unique: true, length: 50 })
  @Index()
  loanId: string;

  @ApiProperty({ description: 'Station ID (dealer location)' })
  @Column('uuid')
  @Index()
  stationId: string;

  @ApiProperty({ description: 'Dealer user ID' })
  @Column('uuid')
  @Index()
  dealerId: string;

  @ApiProperty({ description: 'Principal loan amount' })
  @Column('decimal', { precision: 15, scale: 2 })
  principalAmount: number;

  @ApiProperty({ description: 'Annual interest rate (decimal)' })
  @Column('decimal', { precision: 5, scale: 4 })
  interestRate: number;

  @ApiProperty({ description: 'Loan tenor in months' })
  @Column('integer')
  tenorMonths: number;

  @ApiProperty({ description: 'Repayment frequency', enum: RepaymentFrequency })
  @Column('varchar', { length: 20 })
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ description: 'Amortization method', enum: AmortizationMethod })
  @Column('varchar', { length: 20, default: AmortizationMethod.REDUCING_BALANCE })
  amortizationMethod: AmortizationMethod;

  @ApiProperty({ description: 'Loan start date' })
  @Column('date')
  startDate: Date;

  @ApiProperty({ description: 'Loan maturity date' })
  @Column('date')
  maturityDate: Date;

  @ApiProperty({ description: 'Current loan status', enum: DealerLoanStatus })
  @Column('varchar', { length: 20, default: DealerLoanStatus.DRAFT })
  @Index()
  status: DealerLoanStatus;

  @ApiProperty({ description: 'Outstanding balance' })
  @Column('decimal', { precision: 15, scale: 2 })
  outstandingBalance: number;

  @ApiProperty({ description: 'Total amount paid' })
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalPaid: number;

  @ApiProperty({ description: 'Total interest paid' })
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalInterestPaid: number;

  @ApiProperty({ description: 'Last payment date' })
  @Column('date', { nullable: true })
  lastPaymentDate: Date;

  @ApiProperty({ description: 'Next payment due date' })
  @Column('date', { nullable: true })
  @Index()
  nextPaymentDate: Date;

  @ApiProperty({ description: 'Expected installment amount' })
  @Column('decimal', { precision: 15, scale: 2 })
  installmentAmount: number;

  @ApiProperty({ description: 'Days past due' })
  @Column('integer', { default: 0 })
  daysPastDue: number;

  @ApiProperty({ description: 'Penalty amount due' })
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @ApiProperty({ description: 'Penalty rate for late payments' })
  @Column('decimal', { precision: 5, scale: 4, default: 0.02 })
  penaltyRate: number;

  @ApiProperty({ description: 'Grace period days' })
  @Column('integer', { default: 7 })
  gracePeriodDays: number;

  @ApiProperty({ description: 'Loan agreement document ID' })
  @Column('uuid', { nullable: true })
  loanAgreementDocId: string;

  @ApiProperty({ description: 'Collateral details' })
  @Column('jsonb', { nullable: true })
  collateralDetails: Record<string, any>;

  @ApiProperty({ description: 'Guarantor details' })
  @Column('jsonb', { nullable: true })
  guarantorDetails: Record<string, any>;

  @ApiProperty({ description: 'Amortization schedule' })
  @Column('jsonb', { nullable: true })
  amortizationSchedule: Array<{
    installmentNumber: number;
    dueDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    outstandingBalance: number;
  }>;

  @ApiProperty({ description: 'Auto-deduction enabled' })
  @Column('boolean', { default: true })
  autoDeductionEnabled: boolean;

  @ApiProperty({ description: 'Maximum deduction percentage from settlements' })
  @Column('decimal', { precision: 5, scale: 2, default: 80.0 })
  maxDeductionPercentage: number;

  @ApiProperty({ description: 'Loan purpose/notes' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'Tenant ID' })
  @Column('uuid')
  @Index()
  tenantId: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Column('uuid', { nullable: true })
  createdBy: string;

  @ApiProperty({ description: 'Approved by user ID' })
  @Column('uuid', { nullable: true })
  approvedBy: string;

  @ApiProperty({ description: 'Approval date' })
  @Column('timestamptz', { nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: 'Completed date' })
  @Column('timestamptz', { nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => DealerLoanPayment, payment => payment.loan)
  payments: DealerLoanPayment[];

  // Computed properties
  get isOverdue(): boolean {
    return this.daysPastDue > this.gracePeriodDays;
  }

  get totalAmountDue(): number {
    return this.outstandingBalance + this.penaltyAmount;
  }

  get paymentsRemaining(): number {
    if (!this.amortizationSchedule) return 0;
    return this.amortizationSchedule.filter(s => s.outstandingBalance > 0).length;
  }
}