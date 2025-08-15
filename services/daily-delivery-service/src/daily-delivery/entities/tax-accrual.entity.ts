import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { DailyDelivery } from './daily-delivery.entity';

export enum TaxType {
  PETROLEUM_TAX = 'PETROLEUM_TAX',
  ENERGY_FUND_LEVY = 'ENERGY_FUND_LEVY',
  ROAD_FUND_LEVY = 'ROAD_FUND_LEVY',
  PRICE_STABILIZATION_LEVY = 'PRICE_STABILIZATION_LEVY',
  UPPF_LEVY = 'UPPF_LEVY',
  VAT = 'VAT',
  WITHHOLDING_TAX = 'WITHHOLDING_TAX',
  CUSTOMS_DUTY = 'CUSTOMS_DUTY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

@Entity('tax_accruals')
@Index(['deliveryId'])
@Index(['taxType'])
@Index(['dueDate'])
@Index(['paymentStatus'])
@Index(['taxAuthority'])
@Check(`tax_rate >= 0 AND tax_rate <= 100`)
@Check(`taxable_amount >= 0`)
@Check(`tax_amount >= 0`)
@Check(`payment_date IS NULL OR payment_date >= DATE(created_at)`)
export class TaxAccrual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @Column({ name: 'tax_type', type: 'enum', enum: TaxType })
  taxType: TaxType;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 8, scale: 4 })
  taxRate: number;

  @Column({ name: 'taxable_amount', type: 'decimal', precision: 15, scale: 2 })
  taxableAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2 })
  taxAmount: number;

  @Column({ name: 'tax_account_code', length: 20 })
  taxAccountCode: string;

  @Column({ name: 'liability_account_code', length: 20 })
  liabilityAccountCode: string;

  @Column({ name: 'tax_authority', length: 100, nullable: true })
  taxAuthority: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ name: 'payment_reference', length: 100, nullable: true })
  paymentReference: string;

  @Column({ name: 'currency_code', length: 3, default: 'GHS' })
  currencyCode: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'base_tax_amount', type: 'decimal', precision: 15, scale: 2 })
  baseTaxAmount: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Audit Fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => DailyDelivery, delivery => delivery.taxAccruals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: DailyDelivery;

  // Helper methods
  isOverdue(): boolean {
    return this.paymentStatus === PaymentStatus.PENDING && 
           this.dueDate !== null && 
           this.dueDate < new Date();
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  markAsPaid(paymentDate: Date, paymentReference: string, updatedBy: string): void {
    this.paymentStatus = PaymentStatus.PAID;
    this.paymentDate = paymentDate;
    this.paymentReference = paymentReference;
    this.updatedBy = updatedBy;
  }

  getEffectiveTaxRate(): number {
    if (this.taxableAmount === 0) return 0;
    return (this.taxAmount / this.taxableAmount) * 100;
  }

  getTaxDescription(): string {
    const typeDescriptions = {
      [TaxType.PETROLEUM_TAX]: 'Petroleum Tax',
      [TaxType.ENERGY_FUND_LEVY]: 'Energy Fund Levy',
      [TaxType.ROAD_FUND_LEVY]: 'Road Fund Levy',
      [TaxType.PRICE_STABILIZATION_LEVY]: 'Price Stabilization Levy',
      [TaxType.UPPF_LEVY]: 'UPPF Levy',
      [TaxType.VAT]: 'Value Added Tax',
      [TaxType.WITHHOLDING_TAX]: 'Withholding Tax',
      [TaxType.CUSTOMS_DUTY]: 'Customs Duty'
    };
    return typeDescriptions[this.taxType] || this.taxType;
  }

  getDaysUntilDue(): number {
    if (!this.dueDate) return 0;
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isPaymentRequired(): boolean {
    return this.paymentStatus === PaymentStatus.PENDING && this.taxAmount > 0;
  }
}