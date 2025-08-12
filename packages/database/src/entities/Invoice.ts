import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { InvoiceStatus, Currency } from '@omc-erp/shared-types';
import { Customer } from './Customer';
import { Station } from './Station';
import { User } from './User';
import { InvoiceLineItem } from './InvoiceLineItem';

@Entity('invoices')
@Index(['tenantId'])
@Index(['invoiceNumber'], { unique: true })
@Index(['customerId'])
@Index(['status'])
@Index(['dueDate'])
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'uuid', nullable: true })
  stationId: string;

  // Invoice details
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.GHS,
  })
  currency: Currency;

  // Amounts
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountDue: number;

  // Payment terms
  @Column({ type: 'int', nullable: true })
  paymentTerms: number; // Days

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  lateFeeRate: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  // Relations
  @ManyToOne(() => Customer, (customer) => customer.invoices)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Station, { nullable: true })
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany(() => InvoiceLineItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  lineItems: InvoiceLineItem[];

  // Hooks
  @BeforeInsert()
  generateInvoiceNumber() {
    if (!this.invoiceNumber) {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      this.invoiceNumber = `INV-${year}-${timestamp}`;
    }
  }

  @BeforeInsert()
  calculateAmountDue() {
    this.amountDue = this.totalAmount - this.amountPaid;
  }

  // Methods
  isOverdue(): boolean {
    return this.status === InvoiceStatus.SENT && 
           this.dueDate < new Date() && 
           this.amountDue > 0;
  }

  isPaid(): boolean {
    return this.amountDue <= 0;
  }

  markAsPaid(): void {
    this.amountPaid = this.totalAmount;
    this.amountDue = 0;
    this.status = InvoiceStatus.PAID;
  }

  calculateLateFee(): number {
    if (!this.isOverdue()) return 0;
    
    const daysOverdue = Math.floor(
      (Date.now() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return this.totalAmount * this.lateFeeRate * daysOverdue;
  }

  recalculateTotals(): void {
    if (this.lineItems && this.lineItems.length > 0) {
      this.subtotal = this.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      this.taxAmount = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
      this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
      this.amountDue = this.totalAmount - this.amountPaid;
    }
  }
}