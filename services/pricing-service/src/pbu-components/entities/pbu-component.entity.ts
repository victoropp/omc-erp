import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PBUComponentCategory, PBUComponentUnit } from '@omc-erp/shared-types';

@Entity('pbu_components')
@Index(['componentCode', 'tenantId', 'effectiveFrom'], { unique: false })
@Index(['tenantId', 'isActive', 'effectiveFrom'])
export class PBUComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('varchar', { length: 10 })
  componentCode: string; // EDRL, PSRL, BOST, UPPF, etc.

  @Column('varchar', { length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: PBUComponentCategory,
  })
  category: PBUComponentCategory;

  @Column({
    type: 'enum',
    enum: PBUComponentUnit,
  })
  unit: PBUComponentUnit;

  @Column('decimal', { precision: 10, scale: 6 })
  rateValue: number;

  @Column('timestamp')
  effectiveFrom: Date;

  @Column('timestamp', { nullable: true })
  effectiveTo?: Date;

  @Column('uuid', { nullable: true })
  sourceDocId?: string; // FK to regulatory_docs

  @Column('varchar', { length: 50, nullable: true })
  approvalRef?: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if component is effective for a given date
  isEffectiveOn(date: Date): boolean {
    return date >= this.effectiveFrom && 
           (!this.effectiveTo || date <= this.effectiveTo) && 
           this.isActive;
  }

  // Helper method to get display value based on unit
  getDisplayValue(): string {
    if (this.unit === PBUComponentUnit.PERCENTAGE) {
      return `${this.rateValue}%`;
    }
    return `GHS ${this.rateValue.toFixed(4)}`;
  }
}