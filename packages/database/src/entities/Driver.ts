import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { DriverStatus } from '@omc-erp/shared-types';

@Entity('drivers')
@Index(['tenantId'])
@Index(['driverLicense'], { unique: true })
export class Driver extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  driverLicense: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
  };

  @Column({ type: 'varchar', length: 10 })
  licenseClass: string;

  @Column({ type: 'date' })
  licenseExpiry: Date;

  @Column({ type: 'boolean', default: false })
  hazmatCertified: boolean;

  @Column({ type: 'date', nullable: true })
  hazmatExpiry: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeId: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.ACTIVE,
  })
  status: DriverStatus;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Methods
  isLicenseValid(): boolean {
    return this.licenseExpiry > new Date();
  }

  isHazmatValid(): boolean {
    return this.hazmatCertified && this.hazmatExpiry && this.hazmatExpiry > new Date();
  }
}