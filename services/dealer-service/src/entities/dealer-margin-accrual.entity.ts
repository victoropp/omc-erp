import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AccrualStatus {
  PENDING = 'pending',
  ACCRUED = 'accrued',
  POSTED_TO_GL = 'posted_to_gl',
  REVERSED = 'reversed',
}

@Entity('dealer_margin_accruals')
@Index(['stationId', 'accrualDate'])
@Index(['productType', 'accrualDate'])
@Index(['status', 'accrualDate'])
export class DealerMarginAccrual {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Station ID' })
  @Column('uuid')
  @Index()
  stationId: string;

  @ApiProperty({ description: 'Dealer ID' })
  @Column('uuid')
  @Index()
  dealerId: string;

  @ApiProperty({ description: 'Product type (PMS, AGO, LPG)' })
  @Column('varchar', { length: 10 })
  @Index()
  productType: string;

  @ApiProperty({ description: 'Accrual date' })
  @Column('date')
  @Index()
  accrualDate: Date;

  @ApiProperty({ description: 'Pricing window ID' })
  @Column('varchar', { length: 20 })
  @Index()
  windowId: string;

  @ApiProperty({ description: 'Litres sold on this date' })
  @Column('decimal', { precision: 12, scale: 3 })
  litresSold: number;

  @ApiProperty({ description: 'Dealer margin rate per litre' })
  @Column('decimal', { precision: 8, scale: 4 })
  marginRate: number;

  @ApiProperty({ description: 'Total margin amount accrued' })
  @Column('decimal', { precision: 12, scale: 2 })
  marginAmount: number;

  @ApiProperty({ description: 'Ex-pump price used for calculation' })
  @Column('decimal', { precision: 8, scale: 4 })
  exPumpPrice: number;

  @ApiProperty({ description: 'Cumulative litres sold in window' })
  @Column('decimal', { precision: 12, scale: 3 })
  cumulativeLitres: number;

  @ApiProperty({ description: 'Cumulative margin in window' })
  @Column('decimal', { precision: 12, scale: 2 })
  cumulativeMargin: number;

  @ApiProperty({ description: 'Accrual status', enum: AccrualStatus })
  @Column('varchar', { length: 20, default: AccrualStatus.PENDING })
  @Index()
  status: AccrualStatus;

  @ApiProperty({ description: 'GL journal entry ID when posted' })
  @Column('uuid', { nullable: true })
  journalEntryId: string;

  @ApiProperty({ description: 'GL account code for dealer margin' })
  @Column('varchar', { length: 20, nullable: true })
  glAccountCode: string;

  @ApiProperty({ description: 'Cost center code' })
  @Column('varchar', { length: 20, nullable: true })
  costCenter: string;

  @ApiProperty({ description: 'Reversal reason if reversed' })
  @Column('text', { nullable: true })
  reversalReason: string;

  @ApiProperty({ description: 'Original accrual ID if this is a reversal' })
  @Column('uuid', { nullable: true })
  originalAccrualId: string;

  @ApiProperty({ description: 'Additional calculation details' })
  @Column('jsonb', { nullable: true })
  calculationDetails: {
    transactionIds: string[];
    pbuBreakdown: Record<string, number>;
    adjustments: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
  };

  @ApiProperty({ description: 'Tenant ID' })
  @Column('uuid')
  @Index()
  tenantId: string;

  @ApiProperty({ description: 'Processed by user ID' })
  @Column('uuid', { nullable: true })
  processedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // Computed properties
  get isPosted(): boolean {
    return this.status === AccrualStatus.POSTED_TO_GL;
  }

  get isReversed(): boolean {
    return this.status === AccrualStatus.REVERSED;
  }
}