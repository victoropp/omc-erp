import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

/**
 * Base Entity Classes
 * Eliminates duplicate entity patterns across all microservices
 */

// Common enums used across entities
export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Currency {
  GHS = 'GHS',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

// Base entity with common fields
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', nullable: false })
  @Index()
  tenantId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    // This can be overridden by child classes
  }
}

// Business entity with additional business fields
export abstract class BusinessEntity extends BaseEntity {
  @Column({
    name: 'status',
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  @Index()
  status: EntityStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'version', default: 1 })
  version: number;

  @BeforeUpdate()
  incrementVersion() {
    this.version += 1;
  }
}

// Financial entity with currency and amount fields
export abstract class FinancialEntity extends BusinessEntity {
  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: Currency;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotals() {
    this.totalAmount = this.amount + this.taxAmount;
    super.updateTimestamps();
  }
}

// Person entity for individuals
export abstract class PersonEntity extends BusinessEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName: string;

  @Column({ name: 'title', length: 50, nullable: true })
  title: string;

  @Column({ name: 'email', length: 255, nullable: true })
  @Index()
  email: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'mobile', length: 20, nullable: true })
  mobile: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'gender', length: 10, nullable: true })
  gender: string;

  // Ghana-specific fields
  @Column({ name: 'ghana_card_number', length: 20, nullable: true })
  @Index()
  ghanaCardNumber: string;

  @Column({ name: 'tin_number', length: 20, nullable: true })
  @Index()
  tinNumber: string;

  @Column({ name: 'sssnit_number', length: 20, nullable: true })
  sssnitNumber: string;

  get fullName(): string {
    return [this.title, this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }
}

// Organization entity for companies
export abstract class OrganizationEntity extends BusinessEntity {
  @Column({ name: 'organization_name', length: 255 })
  organizationName: string;

  @Column({ name: 'trading_name', length: 255, nullable: true })
  tradingName: string;

  @Column({ name: 'registration_number', length: 100, nullable: true })
  @Index()
  registrationNumber: string;

  @Column({ name: 'tin_number', length: 20, nullable: true })
  @Index()
  tinNumber: string;

  @Column({ name: 'vat_number', length: 20, nullable: true })
  @Index()
  vatNumber: string;

  @Column({ name: 'email', length: 255, nullable: true })
  @Index()
  email: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'website', length: 255, nullable: true })
  website: string;

  @Column({ name: 'industry', length: 100, nullable: true })
  industry: string;

  @Column({ name: 'establishment_date', type: 'date', nullable: true })
  establishmentDate: Date;
}

// Address mixin interface
export interface AddressMixin {
  streetAddress: string;
  city: string;
  region: string;
  district: string;
  postalCode: string;
  country: string;
  ghanaPostGPS: string;
  latitude: number;
  longitude: number;
}

// Address entity columns mixin
export const AddressColumns = {
  streetAddress: () => Column({ name: 'street_address', type: 'text', nullable: true }),
  city: () => Column({ name: 'city', length: 100, nullable: true }),
  region: () => Column({ name: 'region', length: 100, nullable: true }),
  district: () => Column({ name: 'district', length: 100, nullable: true }),
  postalCode: () => Column({ name: 'postal_code', length: 20, nullable: true }),
  country: () => Column({ name: 'country', length: 50, default: 'Ghana' }),
  ghanaPostGPS: () => Column({ name: 'ghana_post_gps', length: 20, nullable: true }),
  latitude: () => Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true }),
  longitude: () => Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true }),
};

// Audit trail mixin
export interface AuditMixin {
  auditTrail: AuditTrailEntry[];
}

export interface AuditTrailEntry {
  action: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: Date;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
}

// Transaction entity for financial transactions
export abstract class TransactionEntity extends FinancialEntity {
  @Column({ name: 'transaction_number', length: 50, unique: true })
  @Index()
  transactionNumber: string;

  @Column({ name: 'transaction_date', type: 'timestamp' })
  @Index()
  transactionDate: Date;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  @Index()
  referenceNumber: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'external_reference', length: 100, nullable: true })
  externalReference: string;

  @BeforeInsert()
  generateTransactionNumber() {
    if (!this.transactionNumber) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.transactionNumber = `TXN-${timestamp}-${random}`;
    }
    super.calculateTotals();
  }
}

// Inventory item entity
export abstract class InventoryItemEntity extends BusinessEntity {
  @Column({ name: 'item_code', length: 50 })
  @Index()
  itemCode: string;

  @Column({ name: 'item_name', length: 255 })
  itemName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category', length: 100 })
  @Index()
  category: string;

  @Column({ name: 'unit_of_measure', length: 20 })
  unitOfMeasure: string;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  costPrice: number;

  @Column({ name: 'reorder_level', type: 'int', default: 0 })
  reorderLevel: number;

  @Column({ name: 'maximum_level', type: 'int', default: 0 })
  maximumLevel: number;
}

export { BaseEntity as default };