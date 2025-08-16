import { BaseEntity } from './BaseEntity';
import { UserStatus, UserRole } from '@omc-erp/shared-types';
import { Tenant } from './Tenant';
export declare class User extends BaseEntity {
    tenantId: string;
    username: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    status: UserStatus;
    lastLoginAt: Date | null;
    emailVerifiedAt: Date | null;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdBy: string;
    updatedBy: string;
    tenant: Tenant;
    get fullName(): string;
    setPassword(password: string): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    isLocked(): boolean;
    incrementFailedLoginAttempts(): void;
    resetFailedLoginAttempts(): void;
    hashPassword(): Promise<void>;
}
//# sourceMappingURL=User.d.ts.map