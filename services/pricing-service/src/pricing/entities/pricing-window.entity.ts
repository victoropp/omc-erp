import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PricingWindowStatus } from '@omc-erp/shared-types';
import { StationPrice } from './station-price.entity';

@Entity('pricing_windows')
export class PricingWindow {
  @PrimaryColumn('varchar', { length: 20 })
  windowId: string; // 2025W15 format

  @Column('uuid')
  tenantId: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('uuid', { nullable: true })
  npaGuidelineDocId?: string;

  @Column({
    type: 'enum',
    enum: PricingWindowStatus,
    default: PricingWindowStatus.DRAFT,
  })
  status: PricingWindowStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StationPrice, stationPrice => stationPrice.pricingWindow)
  stationPrices: StationPrice[];
}