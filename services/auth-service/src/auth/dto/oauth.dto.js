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
exports.UnlinkOAuthAccountDto = exports.LinkOAuthAccountDto = exports.OAuthCallbackDto = exports.OAuthAuthorizationDto = exports.OAuthProvider = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var OAuthProvider;
(function (OAuthProvider) {
    OAuthProvider["GOOGLE"] = "google";
    OAuthProvider["MICROSOFT"] = "microsoft";
    OAuthProvider["GITHUB"] = "github";
})(OAuthProvider || (exports.OAuthProvider = OAuthProvider = {}));
class OAuthAuthorizationDto {
    provider;
    redirectUri;
    scopes;
    state;
}
exports.OAuthAuthorizationDto = OAuthAuthorizationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth provider', enum: OAuthProvider }),
    (0, class_validator_1.IsEnum)(OAuthProvider),
    __metadata("design:type", String)
], OAuthAuthorizationDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redirect URI after authentication' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], OAuthAuthorizationDto.prototype, "redirectUri", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth scopes requested', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OAuthAuthorizationDto.prototype, "scopes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State parameter for CSRF protection', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OAuthAuthorizationDto.prototype, "state", void 0);
class OAuthCallbackDto {
    code;
    provider;
    state;
    redirectUri;
}
exports.OAuthCallbackDto = OAuthCallbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authorization code from OAuth provider' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth provider', enum: OAuthProvider }),
    (0, class_validator_1.IsEnum)(OAuthProvider),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State parameter for CSRF protection', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redirect URI used in authorization', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "redirectUri", void 0);
class LinkOAuthAccountDto {
    provider;
    code;
    currentPassword;
}
exports.LinkOAuthAccountDto = LinkOAuthAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth provider', enum: OAuthProvider }),
    (0, class_validator_1.IsEnum)(OAuthProvider),
    __metadata("design:type", String)
], LinkOAuthAccountDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authorization code from OAuth provider' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LinkOAuthAccountDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current user password for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LinkOAuthAccountDto.prototype, "currentPassword", void 0);
class UnlinkOAuthAccountDto {
    provider;
    currentPassword;
}
exports.UnlinkOAuthAccountDto = UnlinkOAuthAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth provider to unlink', enum: OAuthProvider }),
    (0, class_validator_1.IsEnum)(OAuthProvider),
    __metadata("design:type", String)
], UnlinkOAuthAccountDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current user password for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UnlinkOAuthAccountDto.prototype, "currentPassword", void 0);
//# sourceMappingURL=oauth.dto.js.map