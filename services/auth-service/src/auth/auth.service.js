"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(username, password, tenantId) {
        const user = await this.usersService.findByUsername(username, tenantId);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // Check if user is locked
        if (user.isLocked()) {
            throw new common_1.ForbiddenException('Account is locked. Please try again later.');
        }
        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await this.usersService.incrementFailedLoginAttempts(user.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // Check user status
        if (user.status === UserStatus.SUSPENDED) {
            throw new common_1.ForbiddenException('Account is suspended');
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new common_1.ForbiddenException('Account is inactive');
        }
        // Reset failed login attempts on successful login
        await this.usersService.resetFailedLoginAttempts(user.id);
        await this.usersService.updateLastLogin(user.id);
        const { passwordHash, ...result } = user;
        return result;
    }
    async register(registerDto) {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        // Create new user
        const user = await this.usersService.create(registerDto);
        // Generate tokens
        const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
            },
            ...tokens,
        };
    }
    async login(user) {
        const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
            },
            ...tokens,
        };
    }
    async logout(userId) {
        await this.usersService.update(userId, { refreshToken: null });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const tokens = await this.getTokens(user.id, user.email, user.tenantId, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not
            return { message: 'If the email exists, a password reset link has been sent.' };
        }
        // Generate reset token
        const resetToken = await this.generatePasswordResetToken(user.id);
        // TODO: Send email with reset token
        // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
        return { message: 'If the email exists, a password reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        // Verify reset token
        const payload = await this.verifyPasswordResetToken(token);
        if (!payload) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        // Update password
        await this.usersService.updatePassword(payload.userId, newPassword);
        return { message: 'Password has been reset successfully' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Validate current password
        const isPasswordValid = await user.validatePassword(currentPassword);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        // Update password
        await this.usersService.updatePassword(userId, newPassword);
        return { message: 'Password changed successfully' };
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, refreshToken, ...profile } = user;
        return profile;
    }
    async verifyEmail(token) {
        // TODO: Implement email verification
        return { message: 'Email verified successfully' };
    }
    // Helper methods
    async getTokens(userId, email, tenantId, role) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
                tenantId,
                role,
            }, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900, // 15 minutes in seconds
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersService.update(userId, { refreshToken: hashedRefreshToken });
    }
    async generatePasswordResetToken(userId) {
        return this.jwtService.signAsync({ userId }, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '1h',
        });
    }
    async verifyPasswordResetToken(token) {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map