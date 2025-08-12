import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { FuelType } from '@omc-erp/shared-types';
import { StockReceipt } from './StockReceipt';
import { Tank } from './Tank';

@Entity('stock_receipt_items')
export class StockReceiptItem extends BaseEntity {
  @Column({ type: 'uuid' })
  stockReceiptId: string;

  @Column({ type: 'uuid' })
  tankId: string;

  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  density: number;

  // Relations
  @ManyToOne(() => StockReceipt, (receipt) => receipt.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stockReceiptId' })
  stockReceipt: StockReceipt;

  @ManyToOne(() => Tank)
  @JoinColumn({ name: 'tankId' })
  tank: Tank;
}