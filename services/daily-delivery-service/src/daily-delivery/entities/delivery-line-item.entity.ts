import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DailyDelivery, ProductGrade } from './daily-delivery.entity';

@Entity('delivery_line_items')
@Index(['deliveryId'])
@Index(['costCenterCode'])
@Index(['glAccountCode'])
export class DeliveryLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @Column({ name: 'line_number', type: 'integer' })
  lineNumber: number;

  @Column({ name: 'product_code', length: 50 })
  productCode: string;

  @Column({ name: 'product_name', length: 255 })
  productName: string;

  @Column({ name: 'product_grade', type: 'enum', enum: ProductGrade })
  productGrade: ProductGrade;

  @Column({ name: 'quantity', type: 'decimal', precision: 15, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 15, scale: 2 })
  lineTotal: number;

  @Column({ name: 'tank_number', length: 50, nullable: true })
  tankNumber: string;

  @Column({ name: 'compartment_number', length: 50, nullable: true })
  compartmentNumber: string;

  @Column({ name: 'batch_number', length: 100, nullable: true })
  batchNumber: string;

  @Column({ name: 'quality_specifications', type: 'text', nullable: true })
  qualitySpecifications: string; // JSON

  // Price Component Breakdown
  @Column({ name: 'base_unit_price', type: 'decimal', precision: 15, scale: 4, default: 0 })
  baseUnitPrice: number;

  @Column({ name: 'total_taxes', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalTaxes: number;

  @Column({ name: 'total_levies', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalLevies: number;

  @Column({ name: 'total_margins', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalMargins: number;

  @Column({ name: 'price_components', type: 'jsonb', nullable: true })
  priceComponents: any;

  @Column({ name: 'cost_center_code', length: 50, nullable: true })
  costCenterCode: string;

  @Column({ name: 'profit_center_code', length: 50, nullable: true })
  profitCenterCode: string;

  @Column({ name: 'gl_account_code', length: 20, nullable: true })
  glAccountCode: string;

  @ManyToOne(() => DailyDelivery, delivery => delivery.lineItems)
  @JoinColumn({ name: 'delivery_id' })
  delivery: DailyDelivery;

  // Helper methods for price calculations
  calculateLineTotal(): number {
    return this.quantity * (this.baseUnitPrice + (this.totalTaxes + this.totalLevies + this.totalMargins) / this.quantity);
  }

  getTotalPricePerUnit(): number {
    if (this.quantity === 0) return 0;
    return this.lineTotal / this.quantity;
  }

  getMarginPercentage(): number {
    if (this.baseUnitPrice === 0) return 0;
    return (this.totalMargins / this.quantity) / this.baseUnitPrice * 100;
  }
}