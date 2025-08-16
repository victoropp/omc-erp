import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
export interface MfaSetupResponse {
    secret: string;
    qrCodeUrl: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
}
export interface MfaVerificationResult {
    isValid: boolean;
    backupCodeUsed?: boolean;
    remainingBackupCodes?: number;
}
export declare class MfaService {
    private configService;
    private cacheManager;
    private readonly logger;
    private readonly backupCodeLength;
    private readonly backupCodesCount;
    constructor(configService: ConfigService, cacheManager: Cache);
    generateMfaSetup(userId: string, userEmail: string): Promise<MfaSetupResponse>;
}
//# sourceMappingURL=mfa.service.d.ts.map