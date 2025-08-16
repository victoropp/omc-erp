"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleAppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
let SimpleAppModule = class SimpleAppModule {
};
exports.SimpleAppModule = SimpleAppModule;
exports.SimpleAppModule = SimpleAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Configuration
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            // JWT
            jwt_1.JwtModule.register({
                secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
                signOptions: {
                    expiresIn: '15m',
                },
            }),
            // Passport
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
        ],
        controllers: [],
        providers: [],
    })
], SimpleAppModule);
//# sourceMappingURL=simple-app.module.js.map