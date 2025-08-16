import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(req: any, _loginDto: LoginDto): Promise<{
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
    refreshTokens(req: any, _refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
    }>;
    logout(req: any): Promise<void>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
    verifyEmail(req: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map