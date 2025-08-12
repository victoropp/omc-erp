import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import {
  CustomerType,
  CustomerStatus,
  LoyaltyTier,
} from '@omc-erp/shared-types';
import { Transaction } from './Transaction';
import { Invoice } from './Invoice';

@Entity('customers')
@Index(['tenantId'])
@Index(['email'])
@Index(['phoneNumber'])
@Index(['loyaltyCardNumber'], { unique: true, where: 'loyalty_card_number IS NOT NULL' })
export class Customer extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  customerType: CustomerType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

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

  // Business details
  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  businessRegistration: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'int', default: 0 })
  paymentTerms: number; // Days

  // Loyalty program
  @Column({ type: 'varchar', length: 50, nullable: true })
  loyaltyCardNumber: string;

  @Column({ type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({
    type: 'enum',
    enum: LoyaltyTier,
    default: LoyaltyTier.BRONZE,
  })
  loyaltyTier: LoyaltyTier;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  registrationDate: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions: Transaction[];

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  // Virtual properties
  get fullName(): string {
    if (this.customerType === CustomerType.CORPORATE) {
      return this.companyName || '';
    }
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get displayName(): string {
    return this.customerType === CustomerType.CORPORATE
      ? this.companyName || 'Unknown Company'
      : this.fullName || 'Unknown Customer';
  }

  // Methods
  addLoyaltyPoints(points: number): void {
    this.loyaltyPoints += points;
    this.updateLoyaltyTier();
  }

  redeemLoyaltyPoints(points: number): boolean {
    if (this.loyaltyPoints >= points) {
      this.loyaltyPoints -= points;
      this.updateLoyaltyTier();
      return true;
    }
    return false;
  }

  updateLoyaltyTier(): void {
    if (this.loyaltyPoints >= 10000) {
      this.loyaltyTier = LoyaltyTier.PLATINUM;
    } else if (this.loyaltyPoints >= 5000) {
      this.loyaltyTier = LoyaltyTier.GOLD;
    } else if (this.loyaltyPoints >= 1000) {
      this.loyaltyTier = LoyaltyTier.SILVER;
    } else {
      this.loyaltyTier = LoyaltyTier.BRONZE;
    }
  }

  hasCredit(): boolean {
    return this.creditLimit > 0;
  }

  canPurchaseOnCredit(amount: number): boolean {
    if (!this.hasCredit()) return false;
    
    // Calculate current outstanding amount from unpaid invoices
    // This would need to be implemented with actual invoice query
    const outstandingAmount = 0; // Placeholder
    
    return (outstandingAmount + amount) <= this.creditLimit;
  }
}