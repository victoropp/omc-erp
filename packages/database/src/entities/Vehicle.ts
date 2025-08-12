import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { VehicleType, VehicleStatus, FuelType } from '@omc-erp/shared-types';
import { Driver } from './Driver';

@Entity('vehicles')
@Index(['tenantId'])
@Index(['licensePlate'], { unique: true })
export class Vehicle extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  licensePlate: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  make: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vin: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  totalCapacity: number; // Liters

  @Column({ type: 'int', default: 1 })
  compartmentCount: number;

  @Column({ type: 'jsonb', nullable: true })
  compartmentConfig: Array<{
    compartmentNumber: number;
    capacity: number;
    fuelType?: FuelType;
  }>;

  @Column({ type: 'date', nullable: true })
  registrationExpiry: Date;

  @Column({ type: 'date', nullable: true })
  insuranceExpiry: Date;

  @Column({ type: 'date', nullable: true })
  roadWorthyExpiry: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gpsDeviceId: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ type: 'jsonb', nullable: true })
  currentLocation: {
    latitude: number;
    longitude: number;
  };

  @Column({ type: 'uuid', nullable: true })
  currentDriverId: string;

  // Relations
  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'currentDriverId' })
  currentDriver: Driver;
}