import { ConfigService } from '@nestjs/config';
export interface SecurityPolicy {
    rateLimits: {
        windowMs: number;
        max: number;
        message: string;
    };
    cors: {
        origin: string | string[] | boolean;
        methods: string[];
        allowedHeaders: string[];
        credentials: boolean;
    };
    csp: {
        directives: Record<string, string[]>;
    };
    headers: Record<string, string>;
}
export declare class SecurityService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getSecurityPolicy(): SecurityPolicy;
    generateApiKey(userId: string): string;
    validateApiKey(apiKey: string): {
        userId: string;
        timestamp: number;
    } | null;
    sanitizeUserInput(input: any): any;
    hashPassword(password: string, salt?: string): {
        hash: string;
        salt: string;
    };
    verifyPassword(password: string, hash: string, salt: string): boolean;
    encryptSensitiveData(data: string): string;
    decryptSensitiveData(encryptedData: string): string;
    generateCSRFToken(): string;
    validateCSRFToken(token: string, sessionToken: string): boolean;
    createSecurityHeaders(): (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
    logSecurityEvent(event: string, details: any, request?: any): void;
}
//# sourceMappingURL=security.service.d.ts.map