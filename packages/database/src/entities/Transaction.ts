import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import {
  FuelType,
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
} from '@omc-erp/shared-types';
import { Station } from './Station';
import { Tank } from './Tank';
import { Pump } from './Pump';
import { User } from './User';
import { Customer } from './Customer';
import { Shift } from './Shift';

@Entity('fuel_transactions')
@Index(['tenantId', 'transactionTime'])
@Index(['stationId', 'transactionTime'])
@Index(['receiptNumber'], { unique: true })
@Index(['paymentStatus'])
@Index(['status'])
@Index(['customerId'])
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  stationId: string;

  @Column({ type: 'uuid' })
  pumpId: string;

  @Column({ type: 'uuid' })
  tankId: string;

  @Column({ type: 'uuid', nullable: true })
  attendantId: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'uuid', nullable: true })
  shiftId: string;

  // Fuel details
  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantityLiters: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  // Taxes and charges
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.175 })
  taxRate: number; // 17.5% VAT in Ghana

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  serviceCharge: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  // Payment details
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paymentProcessedAt: Date;

  // Transaction metadata
  @Column({ type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  posReference: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  transactionTime: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Quality metrics
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  density: number;

  // Loyalty and discounts
  @Column({ type: 'int', default: 0 })
  loyaltyPointsAwarded: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  // Relations
  @ManyToOne(() => Station, (station) => station.transactions)
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @ManyToOne(() => Tank)
  @JoinColumn({ name: 'tankId' })
  tank: Tank;

  @ManyToOne(() => Pump, (pump) => pump.transactions)
  @JoinColumn({ name: 'pumpId' })
  pump: Pump;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'attendantId' })
  attendant: User;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Shift, { nullable: true })
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  // Hooks
  @BeforeInsert()
  calculateAmounts() {
    // Calculate gross amount
    this.grossAmount = this.quantityLiters * this.unitPrice;
    
    // Calculate tax
    this.taxAmount = this.grossAmount * this.taxRate;
    
    // Calculate total
    this.totalAmount = this.grossAmount + this.taxAmount + this.serviceCharge - this.discountAmount;
    
    // Calculate loyalty points (1 point per 10 GHS spent)
    this.loyaltyPointsAwarded = Math.floor(this.totalAmount / 10);
  }

  @BeforeInsert()
  generateReceiptNumber() {
    if (!this.receiptNumber) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.receiptNumber = `RCP${timestamp}${random}`;
    }
  }

  // Methods
  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.COMPLETED;
  }

  canBeRefunded(): boolean {
    return this.isCompleted() && this.isPaid();
  }

  getNetAmount(): number {
    return this.grossAmount - this.discountAmount;
  }
}