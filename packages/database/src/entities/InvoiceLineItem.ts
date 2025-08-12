import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { FuelType } from '@omc-erp/shared-types';
import { Invoice } from './Invoice';

@Entity('invoice_line_items')
export class InvoiceLineItem extends BaseEntity {
  @Column({ type: 'uuid' })
  invoiceId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: FuelType,
    nullable: true,
  })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.175 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxAmount: number;

  @Column({ type: 'int' })
  lineOrder: number;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.lineItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  calculateAmounts() {
    this.lineTotal = this.quantity * this.unitPrice;
    this.taxAmount = this.lineTotal * this.taxRate;
  }

  // Methods
  getTotalAmount(): number {
    return this.lineTotal + this.taxAmount;
  }
}