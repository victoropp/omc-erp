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
import { StationType, ProductGrade } from './daily-delivery.entity';

export enum ComponentType {
  BASE_PRICE = 'BASE_PRICE',
  TAX = 'TAX',
  LEVY = 'LEVY',
  MARGIN = 'MARGIN',
  MARKUP = 'MARKUP'
}

export enum ValueType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  FORMULA = 'FORMULA'
}

@Entity('price_build_up_components')
@Index(['productGrade', 'stationType'])
@Index(['effectiveDate'])
@Index(['componentCode'])
@Index(['componentType'])
@Index(['productGrade', 'stationType', 'effectiveDate'], { 
  where: 'is_active = true AND expiry_date IS NULL',
  unique: true 
})
@Check(`component_value >= 0`)
@Check(`expiry_date IS NULL OR effective_date <= expiry_date`)
@Check(`value_type IN ('FIXED', 'PERCENTAGE', 'FORMULA')`)
export class PriceBuildUpComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'component_code', length: 50 })
  componentCode: string;

  @Column({ name: 'component_name', length: 200 })
  componentName: string;

  @Column({ name: 'component_type', type: 'enum', enum: ComponentType })
  componentType: ComponentType;

  @Column({ name: 'product_grade', type: 'enum', enum: ProductGrade })
  productGrade: ProductGrade;

  @Column({ name: 'station_type', type: 'enum', enum: StationType })
  stationType: StationType;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'component_value', type: 'decimal', precision: 15, scale: 4 })
  componentValue: number;

  @Column({ name: 'value_type', type: 'enum', enum: ValueType, default: ValueType.FIXED })
  valueType: ValueType;

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula: string;

  @Column({ name: 'currency_code', length: 3, default: 'GHS' })
  currencyCode: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_mandatory', type: 'boolean', default: false })
  isMandatory: boolean;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'regulatory_reference', length: 100, nullable: true })
  regulatoryReference: string;

  // Audit Fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Helper methods
  isEffectiveOn(date: Date): boolean {
    return this.effectiveDate <= date && 
           (this.expiryDate === null || this.expiryDate >= date);
  }

  calculateValue(basePrice: number, quantity: number): number {
    switch (this.valueType) {
      case ValueType.FIXED:
        return this.componentValue;
      case ValueType.PERCENTAGE:
        return (basePrice * this.componentValue) / 100;
      case ValueType.FORMULA:
        // In a real implementation, this would use a formula parser
        return this.componentValue;
      default:
        return this.componentValue;
    }
  }

  isExpired(): boolean {
    return this.expiryDate !== null && this.expiryDate < new Date();
  }

  getEffectivePeriod(): string {
    const start = this.effectiveDate.toISOString().split('T')[0];
    const end = this.expiryDate ? this.expiryDate.toISOString().split('T')[0] : 'Ongoing';
    return `${start} to ${end}`;
  }
}