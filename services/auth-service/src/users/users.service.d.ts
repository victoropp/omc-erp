import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    role: 'admin' | 'user' | 'manager';
    tenantId: string;
    refreshToken?: string;
    failedLoginAttempts?: number;
    lockedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    isLocked(): boolean;
    validatePassword(password: string): Promise<boolean>;
}
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(registerDto: RegisterDto): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string, tenantId?: string): Promise<User | null>;
    findByUsername(username: string, tenantId?: string): Promise<User | null>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    updatePassword(id: string, newPassword: string): Promise<void>;
    updateLastLogin(id: string): Promise<void>;
    incrementFailedLoginAttempts(id: string): Promise<void>;
    resetFailedLoginAttempts(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    findAll(tenantId?: string): Promise<User[]>;
    verifyEmail(id: string): Promise<void>;
    suspendUser(id: string): Promise<void>;
    activateUser(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=users.service.d.ts.map