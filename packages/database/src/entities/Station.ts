import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { StationType, StationStatus, FuelType } from '@omc-erp/shared-types';
import { Tenant } from './Tenant';
import { User } from './User';
import { Tank } from './Tank';
import { Pump } from './Pump';
import { Transaction } from './Transaction';

@Entity('stations')
@Index(['code', 'tenantId'], { unique: true })
@Index(['tenantId'])
@Index(['managerId'])
export class Station extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({
    type: 'enum',
    enum: StationType,
    default: StationType.RETAIL,
  })
  stationType: StationType;

  @Column({ type: 'jsonb' })
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };

  @Column({
    type: 'enum',
    enum: FuelType,
    array: true,
    default: [FuelType.PMS, FuelType.AGO],
  })
  fuelTypes: FuelType[];

  @Column({
    type: 'enum',
    enum: StationStatus,
    default: StationStatus.ACTIVE,
  })
  status: StationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  commissionRate: number;

  @Column({ type: 'date', nullable: true })
  lastInspectionDate: Date;

  @Column({ type: 'date', nullable: true })
  licenseExpiryDate: Date;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.stations)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @OneToMany(() => Tank, (tank) => tank.station)
  tanks: Tank[];

  @OneToMany(() => Pump, (pump) => pump.station)
  pumps: Pump[];

  @OneToMany(() => Transaction, (transaction) => transaction.station)
  transactions: Transaction[];

  // Methods
  isOperational(): boolean {
    return this.status === StationStatus.ACTIVE;
  }

  hasLowInventory(): boolean {
    if (!this.tanks) return false;
    return this.tanks.some(tank => {
      const percentageFull = (tank.currentLevel / tank.capacity) * 100;
      return percentageFull < 25;
    });
  }

  getTotalCapacity(): number {
    if (!this.tanks) return 0;
    return this.tanks.reduce((total, tank) => total + tank.capacity, 0);
  }

  getTotalInventory(): number {
    if (!this.tanks) return 0;
    return this.tanks.reduce((total, tank) => total + tank.currentLevel, 0);
  }
}