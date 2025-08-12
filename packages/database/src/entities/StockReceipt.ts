import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ReceiptStatus, QualityStatus, Currency } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Supplier } from './Supplier';
import { Vehicle } from './Vehicle';
import { Driver } from './Driver';
import { StockReceiptItem } from './StockReceiptItem';

@Entity('stock_receipts')
@Index(['tenantId'])
@Index(['receiptNumber'], { unique: true })
@Index(['stationId'])
export class StockReceipt extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  stationId: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'uuid', nullable: true })
  vehicleId: string;

  @Column({ type: 'uuid', nullable: true })
  driverId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deliveryNoteNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  purchaseOrderId: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  totalQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.GHS,
  })
  currency: Currency;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qualityCertificate: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatureRecorded: number;

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  densityRecorded: number;

  @Column({
    type: 'enum',
    enum: QualityStatus,
    default: QualityStatus.PENDING,
  })
  qualityStatus: QualityStatus;

  @Column({ type: 'text', nullable: true })
  qualityNotes: string;

  @Column({ type: 'text', array: true, nullable: true })
  photos: string[];

  @Column({ type: 'text', array: true, nullable: true })
  documents: string[];

  @Column({ type: 'timestamptz', nullable: true })
  scheduledDeliveryTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualDeliveryTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  receiptConfirmedAt: Date;

  @Column({
    type: 'enum',
    enum: ReceiptStatus,
    default: ReceiptStatus.PENDING,
  })
  status: ReceiptStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  // Relations
  @ManyToOne(() => Station)
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @OneToMany(() => StockReceiptItem, (item) => item.stockReceipt, {
    cascade: true,
    eager: true,
  })
  items: StockReceiptItem[];
}