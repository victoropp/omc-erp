import { AuthService } from '../auth.service';
import { MfaService } from '../services/mfa.service';
import { RbacService } from '../services/rbac.service';
import { OAuthService, OAuthProvider } from '../services/oauth.service';
import { SetupMfaDto, VerifyMfaSetupDto, DisableMfaDto, VerifyMfaDto, GenerateBackupCodesDto } from '../dto/mfa.dto';
import { OAuthCallbackDto, LinkOAuthAccountDto, UnlinkOAuthAccountDto } from '../dto/oauth.dto';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RemoveRoleDto, CheckPermissionDto } from '../dto/rbac.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
export declare class EnhancedAuthController {
    private readonly authService;
    private readonly mfaService;
    private readonly rbacService;
    private readonly oauthService;
    constructor(authService: AuthService, mfaService: MfaService, rbacService: RbacService, oauthService: OAuthService);
    register(registerDto: RegisterDto, req: any): Promise<{
        securityInfo: {
            passwordStrengthPassed: boolean;
            emailVerificationRequired: boolean;
            mfaRecommended: boolean;
        };
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
    login(loginDto: LoginDto, req: any): Promise<{
        loginInfo: {
            ip: any;
            timestamp: string;
            deviceTrustScore: number;
            securityRecommendations: string[];
        };
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
    logout(req: any): Promise<{
        message: string;
    }>;
    logoutAll(req: any): Promise<{
        message: string;
    }>;
    setupMfa(req: any, setupDto: SetupMfaDto): Promise<{
        instructions: {
            step1: string;
            step2: string;
            step3: string;
        };
        secret: string;
        qrCodeUrl: string;
        qrCodeDataUrl: string;
        backupCodes: string[];
    }>;
    verifyMfaSetup(req: any, verifyDto: VerifyMfaSetupDto): Promise<{
        message: string;
        backupCodes: any;
        warning: string;
    }>;
    verifyMfa(verifyDto: VerifyMfaDto, req: any): Promise<any>;
    disableMfa(req: any, disableDto: DisableMfaDto): Promise<{
        message: string;
        warning: string;
    }>;
    generateBackupCodes(req: any, generateDto: GenerateBackupCodesDto): Promise<{
        backupCodes: any;
        message: string;
    }>;
    getOAuthAuthUrl(provider: OAuthProvider, redirectUri: string, linkAccount?: string): Promise<any>;
    handleOAuthCallback(provider: OAuthProvider, callbackDto: OAuthCallbackDto, req: any): Promise<any>;
    linkOAuthAccount(provider: OAuthProvider, req: any, linkDto: LinkOAuthAccountDto): Promise<{
        message: string;
        provider: OAuthProvider;
        linkedAt: string;
    }>;
    unlinkOAuthAccount(provider: OAuthProvider, req: any, unlinkDto: UnlinkOAuthAccountDto): Promise<{
        message: string;
        provider: OAuthProvider;
    }>;
    getOAuthAccounts(req: any): Promise<{
        accounts: any;
        totalLinked: any;
        availableProviders: unknown[];
    }>;
    createRole(createRoleDto: CreateRoleDto): Promise<{
        role: any;
        message: string;
    }>;
    getAllRoles(): Promise<{
        roles: any;
        totalRoles: any;
    }>;
    updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        role: any;
        message: string;
    }>;
    deleteRole(id: string): Promise<{
        message: string;
    }>;
    assignRole(assignRoleDto: AssignRoleDto, req: any): Promise<{
        message: string;
    }>;
    removeRole(removeRoleDto: RemoveRoleDto): Promise<{
        message: string;
    }>;
    getUserRoles(userId: string): Promise<{
        userId: string;
        roles: any;
        totalRoles: any;
    }>;
    getUserPermissions(userId: string): Promise<{
        userId: string;
        permissions: any;
        totalPermissions: any;
    }>;
    checkPermission(checkDto: CheckPermissionDto): Promise<{
        userId: string;
        permission: string;
        resource: string | undefined;
        hasPermission: any;
        checkedAt: string;
    }>;
    getSecurityOverview(req: any): Promise<{
        userId: any;
        security: {
            mfaEnabled: any;
            emailVerified: any;
            passwordLastChanged: any;
            lastLoginAt: any;
            failedLoginAttempts: any;
            accountLocked: any;
        };
        linkedAccounts: {
            oauth: any;
            totalLinked: any;
        };
        trustedDevices: {
            devices: any;
            totalDevices: any;
        };
        securityScore: number;
        recommendations: string[];
    }>;
    getActiveSessions(req: any): Promise<{
        userId: any;
        currentSessionId: any;
        activeSessions: any;
        totalSessions: any;
    }>;
    terminateSession(sessionId: string, req: any): Promise<{
        message: string;
        terminatedSessionId: string;
    }>;
    private calculateDeviceTrustScore;
    private calculateSecurityScore;
    private getSecurityRecommendations;
}
//# sourceMappingURL=enhanced-auth.controller.d.ts.map