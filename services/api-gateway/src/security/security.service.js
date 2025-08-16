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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const helmet_1 = __importDefault(require("helmet"));
let SecurityService = SecurityService_1 = class SecurityService {
    configService;
    logger = new common_1.Logger(SecurityService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    getSecurityPolicy() {
        const isDevelopment = this.configService.get('NODE_ENV') === 'development';
        return {
            rateLimits: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: isDevelopment ? 1000 : 100, // limit each IP to 100 requests per windowMs
                message: 'Too many requests from this IP, please try again later',
            },
            cors: {
                origin: isDevelopment
                    ? ['http://localhost:3000', 'http://localhost:3001']
                    : this.configService.get('ALLOWED_ORIGINS', '').split(','),
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: [
                    'Origin',
                    'X-Requested-With',
                    'Content-Type',
                    'Accept',
                    'Authorization',
                    'x-trace-id',
                    'x-span-id',
                    'x-parent-span-id',
                    'x-api-version',
                    'x-client-version',
                ],
                credentials: true,
            },
            csp: {
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
                    'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
                    'font-src': ["'self'", 'fonts.gstatic.com'],
                    'img-src': ["'self'", 'data:', 'https:'],
                    'connect-src': ["'self'"],
                    'frame-ancestors': ["'none'"],
                },
            },
            headers: {
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            },
        };
    }
    generateApiKey(userId) {
        const timestamp = Date.now().toString();
        const random = crypto.randomBytes(16).toString('hex');
        const payload = `${userId}:${timestamp}:${random}`;
        return Buffer.from(payload).toString('base64');
    }
    validateApiKey(apiKey) {
        try {
            const payload = Buffer.from(apiKey, 'base64').toString('utf8');
            const [userId, timestamp] = payload.split(':');
            // Check if API key is not too old (24 hours)
            const keyAge = Date.now() - parseInt(timestamp);
            if (keyAge > 24 * 60 * 60 * 1000) {
                return null;
            }
            return { userId, timestamp: parseInt(timestamp) };
        }
        catch (error) {
            this.logger.warn('Invalid API key format', { apiKey: apiKey.substring(0, 10) + '...' });
            return null;
        }
    }
    sanitizeUserInput(input) {
        if (typeof input === 'string') {
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                .replace(/javascript:/gi, '') // Remove javascript: protocols
                .replace(/on\w+\s*=/gi, '') // Remove event handlers
                .trim();
        }
        if (Array.isArray(input)) {
            return input.map(item => this.sanitizeUserInput(item));
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                sanitized[key] = this.sanitizeUserInput(value);
            }
            return sanitized;
        }
        return input;
    }
    hashPassword(password, salt) {
        const actualSalt = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
        return { hash, salt: actualSalt };
    }
    verifyPassword(password, hash, salt) {
        const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }
    encryptSensitiveData(data) {
        const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-please!';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher('aes-256-cbc', key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decryptSensitiveData(encryptedData) {
        const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-please!';
        const [_ivHex, encrypted] = encryptedData.split(':');
        // const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    generateCSRFToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    validateCSRFToken(token, sessionToken) {
        return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(sessionToken, 'hex'));
    }
    createSecurityHeaders() {
        const policy = this.getSecurityPolicy();
        return (0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: policy.csp.directives,
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            frameguard: { action: 'deny' },
            noSniff: true,
            xssFilter: true,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        });
    }
    logSecurityEvent(event, details, request) {
        this.logger.warn(`Security Event: ${event}`, {
            event,
            details,
            ip: request?.ip,
            userAgent: request?.headers?.['user-agent'],
            traceId: request?.traceId,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityService);
//# sourceMappingURL=security.service.js.map