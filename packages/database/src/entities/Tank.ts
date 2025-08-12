import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { FuelType, TankType, TankStatus } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Pump } from './Pump';
import { Transaction } from './Transaction';

@Entity('tanks')
@Index(['stationId', 'tankNumber'], { unique: true })
@Index(['stationId'])
@Index(['fuelType'])
export class Tank extends BaseEntity {
  @Column({ type: 'uuid' })
  stationId: string;

  @Column({ type: 'int' })
  tankNumber: number;

  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  capacity: number; // Liters

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  currentLevel: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  minimumLevel: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  maximumLevel: number;

  @Column({
    type: 'enum',
    enum: TankType,
    default: TankType.UNDERGROUND,
  })
  tankType: TankType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  material: string;

  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @Column({ type: 'date', nullable: true })
  lastCalibrationDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  calibrationCertificate: string;

  @Column({
    type: 'enum',
    enum: TankStatus,
    default: TankStatus.ACTIVE,
  })
  status: TankStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sensorId: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.tanks)
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @OneToMany(() => Pump, (pump) => pump.tank)
  pumps: Pump[];

  @OneToMany(() => Transaction, (transaction) => transaction.tank)
  transactions: Transaction[];

  // Computed properties
  get percentageFull(): number {
    return (this.currentLevel / this.capacity) * 100;
  }

  get availableCapacity(): number {
    return this.capacity - this.currentLevel;
  }

  // Methods
  isLowLevel(): boolean {
    return this.currentLevel <= this.minimumLevel;
  }

  isCriticalLevel(): boolean {
    return this.percentageFull < 10;
  }

  canDispense(quantity: number): boolean {
    return this.currentLevel >= quantity && this.status === TankStatus.ACTIVE;
  }

  updateLevel(quantity: number, operation: 'add' | 'subtract'): void {
    if (operation === 'add') {
      this.currentLevel = Math.min(this.currentLevel + quantity, this.maximumLevel);
    } else {
      this.currentLevel = Math.max(this.currentLevel - quantity, 0);
    }
  }

  requiresCalibration(): boolean {
    if (!this.lastCalibrationDate) return true;
    
    const monthsSinceCalibration = 
      (Date.now() - this.lastCalibrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsSinceCalibration >= 12; // Calibration required annually
  }
}