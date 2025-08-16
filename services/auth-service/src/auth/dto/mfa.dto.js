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
exports.GenerateBackupCodesDto = exports.VerifyMfaDto = exports.DisableMfaDto = exports.VerifyMfaSetupDto = exports.SetupMfaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SetupMfaDto {
    currentPassword;
}
exports.SetupMfaDto = SetupMfaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current user password for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetupMfaDto.prototype, "currentPassword", void 0);
class VerifyMfaSetupDto {
    token;
}
exports.VerifyMfaSetupDto = VerifyMfaSetupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TOTP token from authenticator app' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMfaSetupDto.prototype, "token", void 0);
class DisableMfaDto {
    currentPassword;
    mfaToken;
}
exports.DisableMfaDto = DisableMfaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current user password for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DisableMfaDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TOTP token or backup code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DisableMfaDto.prototype, "mfaToken", void 0);
class VerifyMfaDto {
    token;
    mfaSessionToken;
    rememberDevice;
}
exports.VerifyMfaDto = VerifyMfaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TOTP token or backup code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMfaDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Temporary MFA session token' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMfaDto.prototype, "mfaSessionToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Remember this device for 30 days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VerifyMfaDto.prototype, "rememberDevice", void 0);
class GenerateBackupCodesDto {
    currentPassword;
    mfaToken;
}
exports.GenerateBackupCodesDto = GenerateBackupCodesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current user password for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateBackupCodesDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TOTP token for verification' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateBackupCodesDto.prototype, "mfaToken", void 0);
//# sourceMappingURL=mfa.dto.js.map