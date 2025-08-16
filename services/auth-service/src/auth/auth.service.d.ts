import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateUser(username: string, password: string, tenantId?: string): Promise<any>;
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "user" | "admin" | "manager";
            tenantId: string;
        };
    }>;
    login(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            tenantId: any;
        };
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        status: "active" | "inactive" | "suspended" | "pending";
        role: "admin" | "user" | "manager";
        tenantId: string;
        failedLoginAttempts?: number;
        lockedUntil?: Date;
        createdAt: Date;
        updatedAt: Date;
        isLocked(): boolean;
        validatePassword(password: string): Promise<boolean>;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    private getTokens;
    private updateRefreshToken;
    private generatePasswordResetToken;
    private verifyPasswordResetToken;
}
//# sourceMappingURL=auth.service.d.ts.map