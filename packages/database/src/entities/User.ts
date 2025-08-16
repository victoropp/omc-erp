import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { UserStatus, UserRole } from '@omc-erp/shared-types';
import { Tenant } from './Tenant';
// import * as bcrypt from 'bcrypt';

@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
@Index(['username', 'tenantId'], { unique: true })
@Index(['tenantId'])
export class User extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPERATOR,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Methods
  async setPassword(password: string): Promise<void> {
    // TODO: Implement bcrypt hashing
    this.passwordHash = password;
  }

  async validatePassword(password: string): Promise<boolean> {
    // TODO: Implement bcrypt comparison
    return this.passwordHash === password;
  }

  isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts++;
    if (this.failedLoginAttempts >= 5) {
      // Lock account for 30 minutes after 5 failed attempts
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Password is already hashed, do nothing
  }
}