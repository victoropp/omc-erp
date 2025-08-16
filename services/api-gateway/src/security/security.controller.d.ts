import { SecurityService } from './security.service';
export declare class SecurityController {
    private securityService;
    constructor(securityService: SecurityService);
    getSecurityPolicy(): {
        rateLimits: {
            windowMs: number;
            max: number;
        };
        cors: {
            methods: string[];
            allowedHeaders: string[];
        };
        headers: string[];
    };
    generateApiKey(body: {
        userId: string;
    }): {
        apiKey: string;
        expiresAt: string;
        usage: string;
    };
    validateApiKey(body: {
        apiKey: string;
    }): {
        valid: boolean;
        userId: string | undefined;
        timestamp: number | undefined;
    };
    sanitizeInput(body: {
        input: any;
    }): {
        original: any;
        sanitized: any;
    };
    getCSRFToken(req: any): {
        token: string;
        usage: string;
    };
    getSecurityHealth(req: any): {
        status: string;
        timestamp: string;
        security: {
            hasAuthorization: boolean;
            hasApiKey: boolean;
            hasTraceId: boolean;
            hasUserAgent: boolean;
            isSecureTransport: any;
        };
        environment: "development" | "production" | "test";
    };
}
//# sourceMappingURL=security.controller.d.ts.map