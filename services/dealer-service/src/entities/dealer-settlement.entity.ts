import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum DealerSettlementStatus {
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

@Entity('dealer_settlements')
@Index(['stationId', 'windowId'], { unique: true })
@Index(['status', 'settlementDate'])
@Index(['paymentDate'], { where: "status = 'approved'" })
export class DealerSettlement {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Station ID' })
  @Column('uuid')
  @Index()
  stationId: string;

  @ApiProperty({ description: 'Pricing window ID' })
  @Column('varchar', { length: 20 })
  @Index()
  windowId: string;

  @ApiProperty({ description: 'Settlement date' })
  @Column('date')
  @Index()
  settlementDate: Date;

  @ApiProperty({ description: 'Period start date' })
  @Column('date')
  periodStart: Date;

  @ApiProperty({ description: 'Period end date' })
  @Column('date')
  periodEnd: Date;

  @ApiProperty({ description: 'Total litres sold in period' })
  @Column('decimal', { precision: 12, scale: 3 })
  totalLitresSold: number;

  @ApiProperty({ description: 'Gross dealer margin earned' })
  @Column('decimal', { precision: 12, scale: 2 })
  grossDealerMargin: number;

  @ApiProperty({ description: 'Loan deduction amount' })
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  loanDeduction: number;

  @ApiProperty({ description: 'Other deductions (chargebacks, shortages, etc.)' })
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  otherDeductions: number;

  @ApiProperty({ description: 'Total deductions' })
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @ApiProperty({ description: 'Net amount payable to dealer' })
  @Column('decimal', { precision: 12, scale: 2 })
  netPayable: number;

  @ApiProperty({ description: 'Settlement status', enum: DealerSettlementStatus })
  @Column('varchar', { length: 20, default: DealerSettlementStatus.CALCULATED })
  @Index()
  status: DealerSettlementStatus;

  @ApiProperty({ description: 'Payment date' })
  @Column('date', { nullable: true })
  paymentDate: Date;

  @ApiProperty({ description: 'Payment reference' })
  @Column('varchar', { length: 100, nullable: true })
  paymentReference: string;

  @ApiProperty({ description: 'Detailed calculation breakdown' })
  @Column('jsonb', { nullable: true })
  calculationDetails: {
    salesByProduct: Record<string, {
      litres: number;
      marginRate: number;
      marginAmount: number;
    }>;
    deductionBreakdown: {
      loanRepayments: Array<{
        loanId: string;
        amount: number;
        installmentNumber: number;
      }>;
      chargebacks: number;
      shortages: number;
      penalties: number;
      other: number;
    };
    pbuBreakdown: Record<string, any>;
  };

  @ApiProperty({ description: 'Settlement statement URL' })
  @Column('varchar', { length: 500, nullable: true })
  settlementStatementUrl: string;

  @ApiProperty({ description: 'GL journal entry ID' })
  @Column('uuid', { nullable: true })
  journalEntryId: string;

  @ApiProperty({ description: 'Dispute reason if disputed' })
  @Column('text', { nullable: true })
  disputeReason: string;

  @ApiProperty({ description: 'Dispute resolution notes' })
  @Column('text', { nullable: true })
  disputeResolution: string;

  @ApiProperty({ description: 'Auto-payment enabled' })
  @Column('boolean', { default: true })
  autoPaymentEnabled: boolean;

  @ApiProperty({ description: 'Payment method preference' })
  @Column('varchar', { length: 50, default: 'bank_transfer' })
  paymentMethod: string;

  @ApiProperty({ description: 'Bank account details for payment' })
  @Column('jsonb', { nullable: true })
  bankAccountDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
  };

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

  @ApiProperty({ description: 'Paid by user ID' })
  @Column('uuid', { nullable: true })
  paidBy: string;

  @ApiProperty({ description: 'Approval timestamp' })
  @Column('timestamptz', { nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get deductionPercentage(): number {
    if (this.grossDealerMargin === 0) return 0;
    return (this.totalDeductions / this.grossDealerMargin) * 100;
  }

  get isNegativeBalance(): boolean {
    return this.netPayable < 0;
  }

  get isReadyForPayment(): boolean {
    return this.status === DealerSettlementStatus.APPROVED && this.netPayable > 0;
  }
}