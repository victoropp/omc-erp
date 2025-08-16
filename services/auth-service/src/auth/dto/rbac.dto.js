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
exports.CheckPermissionDto = exports.CreatePermissionDto = exports.RemoveRoleDto = exports.AssignRoleDto = exports.UpdateRoleDto = exports.CreateRoleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateRoleDto {
    name;
    description;
    permissionIds;
    isSystem;
}
exports.CreateRoleDto = CreateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role name (unique)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of permission IDs for this role' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], CreateRoleDto.prototype, "permissionIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a system role (cannot be deleted)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateRoleDto.prototype, "isSystem", void 0);
class UpdateRoleDto {
    description;
    permissionIds;
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of permission IDs for this role', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], UpdateRoleDto.prototype, "permissionIds", void 0);
class AssignRoleDto {
    userId;
    roleId;
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID to assign role to' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role ID to assign' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "roleId", void 0);
class RemoveRoleDto {
    userId;
    roleId;
}
exports.RemoveRoleDto = RemoveRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID to remove role from' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RemoveRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role ID to remove' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RemoveRoleDto.prototype, "roleId", void 0);
class CreatePermissionDto {
    name;
    description;
    resource;
    action;
}
exports.CreatePermissionDto = CreatePermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Permission name (unique)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Permission description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource this permission applies to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "resource", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action this permission allows' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePermissionDto.prototype, "action", void 0);
class CheckPermissionDto {
    userId;
    permission;
    resource;
}
exports.CheckPermissionDto = CheckPermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID to check permissions for' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CheckPermissionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Permission name to check' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CheckPermissionDto.prototype, "permission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resource context (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckPermissionDto.prototype, "resource", void 0);
//# sourceMappingURL=rbac.dto.js.map