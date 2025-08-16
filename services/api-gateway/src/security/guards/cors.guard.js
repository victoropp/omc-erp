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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsGuard = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("../security.service");
let CorsGuard = class CorsGuard {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const policy = this.securityService.getSecurityPolicy();
        const origin = request.headers.origin;
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            this.setCorsHeaders(response, policy, origin);
            response.status(200).end();
            return false; // Don't continue with the request
        }
        // Set CORS headers for actual requests
        this.setCorsHeaders(response, policy, origin);
        return true;
    }
    setCorsHeaders(response, policy, origin) {
        // Check if origin is allowed
        const allowedOrigins = Array.isArray(policy.cors.origin)
            ? policy.cors.origin
            : [policy.cors.origin];
        if (policy.cors.origin === true || allowedOrigins.includes(origin)) {
            response.header('Access-Control-Allow-Origin', origin);
        }
        response.header('Access-Control-Allow-Methods', policy.cors.methods.join(', '));
        response.header('Access-Control-Allow-Headers', policy.cors.allowedHeaders.join(', '));
        response.header('Access-Control-Allow-Credentials', policy.cors.credentials.toString());
        response.header('Access-Control-Max-Age', '86400'); // 24 hours
    }
};
exports.CorsGuard = CorsGuard;
exports.CorsGuard = CorsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], CorsGuard);
//# sourceMappingURL=cors.guard.js.map