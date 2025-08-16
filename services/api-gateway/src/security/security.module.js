"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const security_service_1 = require("./security.service");
const cors_guard_1 = require("./guards/cors.guard");
const csp_guard_1 = require("./guards/csp.guard");
const rate_limit_guard_1 = require("./guards/rate-limit.guard");
const security_controller_1 = require("./security.controller");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        controllers: [security_controller_1.SecurityController],
        providers: [
            security_service_1.SecurityService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: cors_guard_1.CorsGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: csp_guard_1.CSPGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: rate_limit_guard_1.RateLimitGuard,
            },
        ],
        exports: [security_service_1.SecurityService],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map