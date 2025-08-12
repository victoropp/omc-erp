import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PricingWindow } from './pricing-window.entity';

@Entity('station_prices')
@Index(['stationId', 'productId', 'windowId'], { unique: true })
export class StationPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  stationId: string;

  @Column('varchar', { length: 10 })
  productId: string; // PMS, AGO, LPG

  @Column('varchar', { length: 20 })
  windowId: string;

  @Column('decimal', { precision: 8, scale: 4 })
  exPumpPrice: number;

  @Column('jsonb')
  calcBreakdownJson: {
    components: Array<{
      code: string;
      name: string;
      value: number;
      unit: string;
    }>;
    totalPrice: number;
    sourceDocuments: string[];
  };

  @Column('timestamp', { nullable: true })
  publishedAt?: Date;

  @Column('uuid')
  tenantId: string;

  @Column('uuid', { nullable: true })
  calculatedBy?: string;

  @Column('uuid', { nullable: true })
  publishedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PricingWindow, pricingWindow => pricingWindow.stationPrices)
  @JoinColumn({ name: 'windowId', referencedColumnName: 'windowId' })
  pricingWindow: PricingWindow;
}