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
exports.CSPGuard = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("../security.service");
let CSPGuard = class CSPGuard {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    canActivate(context) {
        const response = context.switchToHttp().getResponse();
        const policy = this.securityService.getSecurityPolicy();
        // Set Content Security Policy header
        const cspDirectives = Object.entries(policy.csp.directives)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');
        response.header('Content-Security-Policy', cspDirectives);
        // Set additional security headers
        Object.entries(policy.headers).forEach(([header, value]) => {
            response.header(header, value);
        });
        return true;
    }
};
exports.CSPGuard = CSPGuard;
exports.CSPGuard = CSPGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], CSPGuard);
//# sourceMappingURL=csp.guard.js.map