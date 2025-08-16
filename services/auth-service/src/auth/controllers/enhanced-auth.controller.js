"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../auth.service");
const mfa_service_1 = require("../services/mfa.service");
const rbac_service_1 = require("../services/rbac.service");
const oauth_service_1 = require("../services/oauth.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
const throttler_1 = require("@nestjs/throttler");
const roles_decorator_1 = require("../decorators/roles.decorator");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const mfa_dto_1 = require("../dto/mfa.dto");
const oauth_dto_1 = require("../dto/oauth.dto");
const rbac_dto_1 = require("../dto/rbac.dto");
const login_dto_1 = require("../dto/login.dto");
const register_dto_1 = require("../dto/register.dto");
let EnhancedAuthController = class EnhancedAuthController {
    authService;
    mfaService;
    rbacService;
    oauthService;
    constructor(authService, mfaService, rbacService, oauthService) {
        this.authService = authService;
        this.mfaService = mfaService;
        this.rbacService = rbacService;
        this.oauthService = oauthService;
    }
    // ===== BASIC AUTH OPERATIONS =====
    async register(registerDto, req) {
        const result = await this.authService.register(registerDto);
        return {
            ...result,
            securityInfo: {
                passwordStrengthPassed: true,
                emailVerificationRequired: true,
                mfaRecommended: true,
            },
        };
    }
    async login(loginDto, req) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const result = await this.authService.login(loginDto, ip, userAgent);
        // Add security headers and information
        return {
            ...result,
            loginInfo: {
                ip,
                timestamp: new Date().toISOString(),
                deviceTrustScore: this.calculateDeviceTrustScore(req),
                securityRecommendations: this.getSecurityRecommendations(result.user),
            },
        };
    }
    async logout(req) {
        await this.authService.logout(req.user.sub, req.user.sessionId);
        return { message: 'Logged out successfully' };
    }
    async logoutAll(req) {
        await this.authService.logout(req.user.sub); // No sessionId = logout all
        return { message: 'All sessions terminated' };
    }
    // ===== MFA OPERATIONS =====
    async setupMfa(req, setupDto) {
        // Verify current password first
        const user = await this.authService.verifyCurrentPassword(req.user.sub, setupDto.currentPassword);
        const mfaSetup = await this.mfaService.generateMfaSetup(req.user.sub, req.user.email);
        return {
            ...mfaSetup,
            instructions: {
                step1: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
                step2: 'Enter the 6-digit code from your app to verify setup',
                step3: 'Save your backup codes in a secure location',
            },
        };
    }
    async verifyMfaSetup(req, verifyDto) {
        const result = await this.mfaService.verifyMfaSetup(req.user.sub, verifyDto.token);
        // Update user MFA status in auth service
        await this.authService.enableUserMfa(req.user.sub, result.secret, result.backupCodes);
        return {
            message: 'MFA enabled successfully',
            backupCodes: result.backupCodes,
            warning: 'Store these backup codes securely. They can only be used once.',
        };
    }
    async verifyMfa(verifyDto, req) {
        const sessionData = await this.mfaService.getMfaSession(verifyDto.mfaSessionToken);
        if (!sessionData) {
            throw new common_1.UnauthorizedException('Invalid or expired MFA session');
        }
        const user = await this.authService.getUserById(sessionData.userId);
        const verification = await this.mfaService.verifyMfaToken(user.mfaSecret, verifyDto.token, user.mfaBackupCodes);
        if (!verification.isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        // Complete MFA session
        await this.mfaService.completeMfaSession(verifyDto.mfaSessionToken);
        // If backup code was used, update user's backup codes
        if (verification.backupCodeUsed) {
            await this.authService.removeUsedBackupCode(sessionData.userId, verifyDto.token);
        }
        // Handle trusted device
        let trustedDeviceId;
        if (verifyDto.rememberDevice) {
            const deviceFingerprint = this.mfaService.generateDeviceFingerprint(req);
            trustedDeviceId = await this.mfaService.createTrustedDevice(sessionData.userId, deviceFingerprint);
        }
        // Generate final auth tokens
        const tokens = await this.authService.generateTokensForUser(sessionData.userId);
        return {
            ...tokens,
            mfaVerified: true,
            backupCodeUsed: verification.backupCodeUsed,
            remainingBackupCodes: verification.remainingBackupCodes,
            trustedDeviceId,
        };
    }
    async disableMfa(req, disableDto) {
        await this.authService.disableMfa(req.user.sub, disableDto.currentPassword, disableDto.mfaToken);
        return {
            message: 'MFA disabled successfully',
            warning: 'Your account is now less secure. Consider re-enabling MFA.',
        };
    }
    async generateBackupCodes(req, generateDto) {
        const user = await this.authService.verifyCurrentPassword(req.user.sub, generateDto.currentPassword);
        // Verify MFA token
        const verification = await this.mfaService.verifyMfaToken(user.mfaSecret, generateDto.mfaToken);
        if (!verification.isValid) {
            throw new common_1.UnauthorizedException('Invalid MFA token');
        }
        const newBackupCodes = await this.mfaService.generateNewBackupCodes();
        await this.authService.updateBackupCodes(req.user.sub, newBackupCodes);
        return {
            backupCodes: newBackupCodes,
            message: 'New backup codes generated. Previous codes are no longer valid.',
        };
    }
    // ===== OAUTH OPERATIONS =====
    async getOAuthAuthUrl(provider, redirectUri, linkAccount) {
        const result = await this.oauthService.getAuthorizationUrl(provider, redirectUri, linkAccount);
        return {
            ...result,
            provider,
            instructions: `Visit the authorization URL to authenticate with ${provider}`,
        };
    }
    async handleOAuthCallback(provider, callbackDto, req) {
        const result = await this.oauthService.handleCallback(provider, callbackDto.code, callbackDto.state);
        if (result.isNewUser) {
            // Create new user from OAuth info
            const newUser = await this.authService.createUserFromOAuth(result.userInfo);
            const tokens = await this.authService.generateTokensForUser(newUser.id);
            return {
                ...tokens,
                user: newUser,
                isNewUser: true,
                provider,
                accountLinked: true,
            };
        }
        else {
            // Login existing user
            const tokens = await this.authService.generateTokensForUser(result.existingUserId);
            const user = await this.authService.getUserById(result.existingUserId);
            return {
                ...tokens,
                user,
                isNewUser: false,
                provider,
            };
        }
    }
    async linkOAuthAccount(provider, req, linkDto) {
        // Verify current password
        await this.authService.verifyCurrentPassword(req.user.sub, linkDto.currentPassword);
        await this.oauthService.linkOAuthAccount(req.user.sub, provider, linkDto.code, req.headers.origin || 'http://localhost:3000');
        return {
            message: `${provider} account linked successfully`,
            provider,
            linkedAt: new Date().toISOString(),
        };
    }
    async unlinkOAuthAccount(provider, req, unlinkDto) {
        // Verify current password
        await this.authService.verifyCurrentPassword(req.user.sub, unlinkDto.currentPassword);
        await this.oauthService.unlinkOAuthAccount(req.user.sub, provider);
        return {
            message: `${provider} account unlinked successfully`,
            provider,
        };
    }
    async getOAuthAccounts(req) {
        const accounts = await this.oauthService.getUserOAuthAccounts(req.user.sub);
        return {
            accounts,
            totalLinked: accounts.length,
            availableProviders: Object.values(oauth_service_1.OAuthProvider),
        };
    }
    // ===== RBAC OPERATIONS =====
    async createRole(createRoleDto) {
        const role = await this.rbacService.createRole(createRoleDto);
        return {
            role,
            message: 'Role created successfully',
        };
    }
    async getAllRoles() {
        const roles = await this.rbacService.getAllRoles();
        return {
            roles,
            totalRoles: roles.length,
        };
    }
    async updateRole(id, updateRoleDto) {
        const role = await this.rbacService.updateRole(id, updateRoleDto);
        return {
            role,
            message: 'Role updated successfully',
        };
    }
    async deleteRole(id) {
        await this.rbacService.deleteRole(id);
        return {
            message: 'Role deleted successfully',
        };
    }
    async assignRole(assignRoleDto, req) {
        await this.rbacService.assignRoleToUser(assignRoleDto.userId, assignRoleDto.roleId, req.user.sub);
        return {
            message: 'Role assigned successfully',
        };
    }
    async removeRole(removeRoleDto) {
        await this.rbacService.removeRoleFromUser(removeRoleDto.userId, removeRoleDto.roleId);
        return {
            message: 'Role removed successfully',
        };
    }
    async getUserRoles(userId) {
        const roles = await this.rbacService.getUserRoles(userId);
        return {
            userId,
            roles,
            totalRoles: roles.length,
        };
    }
    async getUserPermissions(userId) {
        const permissions = await this.rbacService.getUserPermissions(userId);
        return {
            userId,
            permissions,
            totalPermissions: permissions.length,
        };
    }
    async checkPermission(checkDto) {
        const hasPermission = await this.rbacService.hasPermission(checkDto.userId, checkDto.permission, checkDto.resource);
        return {
            userId: checkDto.userId,
            permission: checkDto.permission,
            resource: checkDto.resource,
            hasPermission,
            checkedAt: new Date().toISOString(),
        };
    }
    // ===== ENHANCED PROFILE & SECURITY =====
    async getSecurityOverview(req) {
        const user = await this.authService.getUserById(req.user.sub);
        const oauthAccounts = await this.oauthService.getUserOAuthAccounts(req.user.sub);
        const trustedDevices = await this.mfaService.getUserTrustedDevices(req.user.sub);
        return {
            userId: req.user.sub,
            security: {
                mfaEnabled: user.mfaEnabled,
                emailVerified: user.emailVerified,
                passwordLastChanged: user.passwordUpdatedAt,
                lastLoginAt: user.lastLoginAt,
                failedLoginAttempts: user.failedLoginAttempts,
                accountLocked: user.lockedUntil && user.lockedUntil > new Date(),
            },
            linkedAccounts: {
                oauth: oauthAccounts,
                totalLinked: oauthAccounts.length,
            },
            trustedDevices: {
                devices: trustedDevices,
                totalDevices: trustedDevices.length,
            },
            securityScore: this.calculateSecurityScore(user, oauthAccounts),
            recommendations: this.getSecurityRecommendations(user),
        };
    }
    async getActiveSessions(req) {
        const sessions = await this.authService.getUserSessions(req.user.sub);
        return {
            userId: req.user.sub,
            currentSessionId: req.user.sessionId,
            activeSessions: sessions,
            totalSessions: sessions.length,
        };
    }
    async terminateSession(sessionId, req) {
        await this.authService.terminateSession(req.user.sub, sessionId);
        return {
            message: 'Session terminated successfully',
            terminatedSessionId: sessionId,
        };
    }
    // ===== UTILITY METHODS =====
    calculateDeviceTrustScore(req) {
        let score = 50; // Base score
        // Factors that increase trust
        if (req.headers['user-agent'])
            score += 10;
        if (req.headers['accept-language'])
            score += 5;
        if (req.secure)
            score += 15; // HTTPS
        if (req.headers['x-forwarded-for'])
            score -= 10; // Proxy usage
        return Math.min(100, Math.max(0, score));
    }
    calculateSecurityScore(user, oauthAccounts) {
        let score = 0;
        // Base security factors
        if (user.emailVerified)
            score += 20;
        if (user.mfaEnabled)
            score += 30;
        if (oauthAccounts.length > 0)
            score += 10;
        if (!user.lockedUntil || user.lockedUntil < new Date())
            score += 10;
        if (user.failedLoginAttempts === 0)
            score += 10;
        // Password age factor
        if (user.passwordUpdatedAt) {
            const daysSinceUpdate = Math.floor((Date.now() - new Date(user.passwordUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceUpdate < 90)
                score += 10;
            else if (daysSinceUpdate > 365)
                score -= 10;
        }
        // Recent activity factor
        if (user.lastLoginAt) {
            const daysSinceLogin = Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLogin < 7)
                score += 10;
        }
        return Math.min(100, Math.max(0, score));
    }
    getSecurityRecommendations(user) {
        const recommendations = [];
        if (!user.mfaEnabled) {
            recommendations.push('Enable Multi-Factor Authentication for enhanced security');
        }
        if (!user.emailVerified) {
            recommendations.push('Verify your email address');
        }
        if (user.passwordUpdatedAt) {
            const daysSinceUpdate = Math.floor((Date.now() - new Date(user.passwordUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceUpdate > 180) {
                recommendations.push('Consider updating your password');
            }
        }
        if (user.failedLoginAttempts > 0) {
            recommendations.push('Review recent login attempts for suspicious activity');
        }
        if (recommendations.length === 0) {
            recommendations.push('Your account security looks good!');
        }
        return recommendations;
    }
};
exports.EnhancedAuthController = EnhancedAuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user with enhanced security' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input or user already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email/password and optional MFA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful or MFA required' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials or account locked' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many login attempts' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user and invalidate session' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Logout successful' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'All sessions terminated' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Post)('mfa/setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Setup Multi-Factor Authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA setup initiated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.SetupMfaDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "setupMfa", null);
__decorate([
    (0, common_1.Post)('mfa/verify-setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify and enable MFA setup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA enabled successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.VerifyMfaSetupDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "verifyMfaSetup", null);
__decorate([
    (0, common_1.Post)('mfa/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify MFA token during login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA verification successful' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mfa_dto_1.VerifyMfaDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "verifyMfa", null);
__decorate([
    (0, common_1.Post)('mfa/disable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Disable Multi-Factor Authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'MFA disabled successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.DisableMfaDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "disableMfa", null);
__decorate([
    (0, common_1.Post)('mfa/backup-codes/generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate new backup codes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'New backup codes generated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_dto_1.GenerateBackupCodesDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "generateBackupCodes", null);
__decorate([
    (0, common_1.Get)('oauth/:provider/authorize'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OAuth authorization URL' }),
    (0, swagger_1.ApiParam)({ name: 'provider', enum: oauth_service_1.OAuthProvider }),
    (0, swagger_1.ApiQuery)({ name: 'redirect_uri', description: 'Redirect URI after authentication' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('redirect_uri')),
    __param(2, (0, common_1.Query)('link_account')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof oauth_service_1.OAuthProvider !== "undefined" && oauth_service_1.OAuthProvider) === "function" ? _c : Object, String, String]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getOAuthAuthUrl", null);
__decorate([
    (0, common_1.Post)('oauth/:provider/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle OAuth callback' }),
    (0, swagger_1.ApiParam)({ name: 'provider', enum: oauth_service_1.OAuthProvider }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof oauth_service_1.OAuthProvider !== "undefined" && oauth_service_1.OAuthProvider) === "function" ? _d : Object, oauth_dto_1.OAuthCallbackDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "handleOAuthCallback", null);
__decorate([
    (0, common_1.Post)('oauth/:provider/link'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Link OAuth account to existing user' }),
    (0, swagger_1.ApiParam)({ name: 'provider', enum: oauth_service_1.OAuthProvider }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof oauth_service_1.OAuthProvider !== "undefined" && oauth_service_1.OAuthProvider) === "function" ? _e : Object, Object, oauth_dto_1.LinkOAuthAccountDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "linkOAuthAccount", null);
__decorate([
    (0, common_1.Delete)('oauth/:provider/unlink'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink OAuth account' }),
    (0, swagger_1.ApiParam)({ name: 'provider', enum: oauth_service_1.OAuthProvider }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof oauth_service_1.OAuthProvider !== "undefined" && oauth_service_1.OAuthProvider) === "function" ? _f : Object, Object, oauth_dto_1.UnlinkOAuthAccountDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "unlinkOAuthAccount", null);
__decorate([
    (0, common_1.Get)('oauth/accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get linked OAuth accounts' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getOAuthAccounts", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_dto_1.CreateRoleDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('users:read'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update role (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rbac_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete role (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('users/roles/assign'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('users:write'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign role to user' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_dto_1.AssignRoleDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Post)('users/roles/remove'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('users:write'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove role from user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_dto_1.RemoveRoleDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Get)('users/:id/roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('users:read'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user roles' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Get)('users/:id/permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('users:read'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Post)('permissions/check'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check user permission' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_dto_1.CheckPermissionDto]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Get)('profile/security'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get security overview' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getSecurityOverview", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active sessions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Terminate specific session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnhancedAuthController.prototype, "terminateSession", null);
exports.EnhancedAuthController = EnhancedAuthController = __decorate([
    (0, swagger_1.ApiTags)('Enhanced Authentication'),
    (0, common_1.Controller)('auth/v2'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        mfa_service_1.MfaService, typeof (_a = typeof rbac_service_1.RbacService !== "undefined" && rbac_service_1.RbacService) === "function" ? _a : Object, typeof (_b = typeof oauth_service_1.OAuthService !== "undefined" && oauth_service_1.OAuthService) === "function" ? _b : Object])
], EnhancedAuthController);
//# sourceMappingURL=enhanced-auth.controller.js.map