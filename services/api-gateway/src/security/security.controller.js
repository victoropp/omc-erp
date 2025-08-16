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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_service_1 = require("./security.service");
const throttler_1 = require("@nestjs/throttler");
let SecurityController = class SecurityController {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    getSecurityPolicy() {
        const policy = this.securityService.getSecurityPolicy();
        // Remove sensitive information before sending
        return {
            rateLimits: {
                windowMs: policy.rateLimits.windowMs,
                max: policy.rateLimits.max,
            },
            cors: {
                methods: policy.cors.methods,
                allowedHeaders: policy.cors.allowedHeaders,
            },
            headers: Object.keys(policy.headers),
        };
    }
    generateApiKey(body) {
        const apiKey = this.securityService.generateApiKey(body.userId);
        return {
            apiKey,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            usage: 'Include in x-api-key header for requests',
        };
    }
    validateApiKey(body) {
        const result = this.securityService.validateApiKey(body.apiKey);
        return {
            valid: !!result,
            userId: result?.userId,
            timestamp: result?.timestamp,
        };
    }
    sanitizeInput(body) {
        const sanitized = this.securityService.sanitizeUserInput(body.input);
        return {
            original: body.input,
            sanitized,
        };
    }
    getCSRFToken(req) {
        const token = this.securityService.generateCSRFToken();
        // Store token in session for validation
        req.session = req.session || {};
        req.session.csrfToken = token;
        return {
            token,
            usage: 'Include in x-csrf-token header for state-changing requests',
        };
    }
    getSecurityHealth(req) {
        const headers = req.headers;
        const hasSecureHeaders = {
            hasAuthorization: !!headers.authorization,
            hasApiKey: !!headers['x-api-key'],
            hasTraceId: !!headers['x-trace-id'],
            hasUserAgent: !!headers['user-agent'],
            isSecureTransport: req.secure || headers['x-forwarded-proto'] === 'https',
        };
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            security: hasSecureHeaders,
            environment: process.env.NODE_ENV,
        };
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('policy'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current security policy' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security policy retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSecurityPolicy", null);
__decorate([
    (0, common_1.Post)('api-key/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate new API key' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API key generated successfully' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "generateApiKey", null);
__decorate([
    (0, common_1.Post)('api-key/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate API key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API key validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Post)('sanitize'),
    (0, swagger_1.ApiOperation)({ summary: 'Sanitize user input for security' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Input sanitized successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "sanitizeInput", null);
__decorate([
    (0, common_1.Get)('csrf-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get CSRF token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSRF token generated' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getCSRFToken", null);
__decorate([
    (0, common_1.Get)('health/security'),
    (0, swagger_1.ApiOperation)({ summary: 'Security health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security health status' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSecurityHealth", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)('Security'),
    (0, common_1.Controller)('security'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map