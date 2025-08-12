import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { SubscriptionPlan, SubscriptionStatus } from '@omc-erp/shared-types';
import { User } from './User';
import { Station } from './Station';

@Entity('tenants')
@Index(['companyCode'], { unique: true })
@Index(['licenseNumber'], { unique: true })
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  companyCode: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  licenseNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  businessRegistration: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxIdentification: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.STARTER,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  billingContact: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      region: string;
      postalCode?: string;
      country: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  technicalContact: {
    name: string;
    email: string;
    phone: string;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Station, (station) => station.tenant)
  stations: Station[];
}