import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { PumpType, PumpStatus } from '@omc-erp/shared-types';
import { Station } from './Station';
import { Tank } from './Tank';
import { Transaction } from './Transaction';

@Entity('pumps')
@Index(['stationId', 'pumpNumber'], { unique: true })
@Index(['stationId'])
@Index(['tankId'])
export class Pump extends BaseEntity {
  @Column({ type: 'uuid' })
  stationId: string;

  @Column({ type: 'int' })
  pumpNumber: number;

  @Column({ type: 'uuid' })
  tankId: string;

  @Column({ type: 'int', default: 1 })
  nozzleCount: number;

  @Column({
    type: 'enum',
    enum: PumpType,
    default: PumpType.DISPENSING,
  })
  pumpType: PumpType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @Column({ type: 'date', nullable: true })
  lastCalibrationDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  calibrationCertificate: string;

  @Column({
    type: 'enum',
    enum: PumpStatus,
    default: PumpStatus.ACTIVE,
  })
  status: PumpStatus;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  totalDispensed: number; // Total lifetime liters dispensed

  @Column({ type: 'int', default: 0 })
  transactionCount: number; // Total lifetime transactions

  // Relations
  @ManyToOne(() => Station, (station) => station.pumps)
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @ManyToOne(() => Tank, (tank) => tank.pumps)
  @JoinColumn({ name: 'tankId' })
  tank: Tank;

  @OneToMany(() => Transaction, (transaction) => transaction.pump)
  transactions: Transaction[];

  // Methods
  isOperational(): boolean {
    return this.status === PumpStatus.ACTIVE;
  }

  requiresCalibration(): boolean {
    if (!this.lastCalibrationDate) return true;
    
    const monthsSinceCalibration = 
      (Date.now() - this.lastCalibrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsSinceCalibration >= 6; // Calibration required every 6 months
  }

  requiresMaintenance(): boolean {
    // Maintenance required after every 50,000 liters or 5,000 transactions
    return this.totalDispensed >= 50000 || this.transactionCount >= 5000;
  }

  recordTransaction(quantity: number): void {
    this.totalDispensed += quantity;
    this.transactionCount++;
  }
}