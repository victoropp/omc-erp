import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Station } from './Station';
import { User } from './User';
import { Transaction } from './Transaction';

@Entity('shifts')
@Index(['tenantId'])
@Index(['stationId'])
@Index(['attendantId'])
@Index(['shiftNumber'], { unique: true })
export class Shift extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  stationId: string;

  @Column({ type: 'uuid' })
  attendantId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  shiftNumber: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endTime: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  openingCash: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  closingCash: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalSales: number;

  @Column({ type: 'int', nullable: true })
  totalTransactions: number;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Station)
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'attendantId' })
  attendant: User;

  @OneToMany(() => Transaction, (transaction) => transaction.shift)
  transactions: Transaction[];

  // Methods
  isOpen(): boolean {
    return this.status === 'open';
  }

  calculateTotals(): void {
    if (this.transactions && this.transactions.length > 0) {
      this.totalTransactions = this.transactions.length;
      this.totalSales = this.transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.totalAmount, 0);
    }
  }
}