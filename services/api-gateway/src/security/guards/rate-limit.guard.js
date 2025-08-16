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
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
// import { Observable } from 'rxjs';
const security_service_1 = require("../security.service");
const common_2 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let RateLimitGuard = class RateLimitGuard {
    securityService;
    cacheManager;
    constructor(securityService, cacheManager) {
        this.securityService = securityService;
        this.cacheManager = cacheManager;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const clientId = this.getClientIdentifier(request);
        const endpoint = `${request.method}:${request.route?.path || request.url}`;
        // Check different rate limit tiers
        const rateLimits = [
            { key: 'short', windowMs: 1000, limit: 10 }, // 10 per second
            { key: 'medium', windowMs: 10000, limit: 50 }, // 50 per 10 seconds  
            { key: 'long', windowMs: 60000, limit: 300 }, // 300 per minute
            { key: 'daily', windowMs: 86400000, limit: 10000 }, // 10k per day
        ];
        for (const rateLimit of rateLimits) {
            const allowed = await this.checkRateLimit(clientId, endpoint, rateLimit.key, rateLimit.windowMs, rateLimit.limit);
            if (!allowed) {
                this.securityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                    clientId,
                    endpoint,
                    tier: rateLimit.key,
                    limit: rateLimit.limit,
                    window: rateLimit.windowMs,
                }, request);
                response.header('X-RateLimit-Limit', rateLimit.limit.toString());
                response.header('X-RateLimit-Remaining', '0');
                response.header('X-RateLimit-Reset', new Date(Date.now() + rateLimit.windowMs).toISOString());
                throw new common_1.HttpException({
                    error: 'Rate limit exceeded',
                    message: `Too many requests. Limit: ${rateLimit.limit} per ${rateLimit.windowMs / 1000}s`,
                    tier: rateLimit.key,
                    retryAfter: Math.ceil(rateLimit.windowMs / 1000),
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        return true;
    }
    getClientIdentifier(request) {
        // Use API key if available, otherwise use IP + User Agent combo
        const apiKey = request.headers['x-api-key'];
        if (apiKey) {
            const keyData = this.securityService.validateApiKey(apiKey);
            if (keyData) {
                return `api:${keyData.userId}`;
            }
        }
        const ip = request.ip || request.connection.remoteAddress;
        const userAgent = request.headers['user-agent'] || 'unknown';
        return `ip:${ip}:${this.hashString(userAgent)}`;
    }
    async checkRateLimit(clientId, endpoint, tier, windowMs, limit) {
        const now = Date.now();
        const windowStart = Math.floor(now / windowMs) * windowMs;
        const cacheKey = `rate_limit:${tier}:${clientId}:${endpoint}:${windowStart}`;
        const current = await this.cacheManager.get(cacheKey) || 0;
        if (current >= limit) {
            return false;
        }
        // Increment counter with TTL
        const ttlMs = windowMs + (now - windowStart);
        await this.cacheManager.set(cacheKey, current + 1, ttlMs);
        return true;
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [security_service_1.SecurityService, Object])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map