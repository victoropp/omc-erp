export declare class SetupMfaDto {
    currentPassword: string;
}
export declare class VerifyMfaSetupDto {
    token: string;
}
export declare class DisableMfaDto {
    currentPassword: string;
    mfaToken: string;
}
export declare class VerifyMfaDto {
    token: string;
    mfaSessionToken: string;
    rememberDevice?: boolean;
}
export declare class GenerateBackupCodesDto {
    currentPassword: string;
    mfaToken: string;
}
//# sourceMappingURL=mfa.dto.d.ts.map