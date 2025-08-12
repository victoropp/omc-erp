import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('suppliers')
@Index(['tenantId'])
@Index(['code'], { unique: true })
export class Supplier extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  businessRegistration: string;

  @Column({ type: 'int', nullable: true })
  paymentTerms: number; // Days

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;
}