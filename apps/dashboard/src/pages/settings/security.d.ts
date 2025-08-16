import { NextPage } from 'next';
interface SecuritySettings {
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
        maxAge: number;
        preventReuse: number;
    };
    sessionManagement: {
        maxSessions: number;
        sessionTimeout: number;
        rememberMeDuration: number;
        logoutOnClose: boolean;
    };
    twoFactor: {
        enabled: boolean;
        required: boolean;
        methods: string[];
        backupCodes: boolean;
    };
    loginSecurity: {
        maxFailedAttempts: number;
        lockoutDuration: number;
        enableCaptcha: boolean;
        ipWhitelist: string[];
    };
    encryption: {
        dataEncryption: boolean;
        encryptionMethod: string;
        keyRotation: number;
        backupEncryption: boolean;
    };
    apiSecurity: {
        rateLimiting: boolean;
        requestsPerMinute: number;
        requireApiKey: boolean;
        corsEnabled: boolean;
        allowedOrigins: string[];
    };
}
declare const SecuritySettings: NextPage;
export default SecuritySettings;
//# sourceMappingURL=security.d.ts.map