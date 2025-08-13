import { IsString, IsArray, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name (unique)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'List of permission IDs for this role' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds: string[];

  @ApiProperty({ description: 'Whether this is a system role (cannot be deleted)', required: false })
  @IsOptional()
  isSystem?: boolean;
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'List of permission IDs for this role', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds?: string[];
}

export class AssignRoleDto {
  @ApiProperty({ description: 'User ID to assign role to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsUUID()
  roleId: string;
}

export class RemoveRoleDto {
  @ApiProperty({ description: 'User ID to remove role from' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Role ID to remove' })
  @IsUUID()
  roleId: string;
}

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name (unique)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Permission description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Resource this permission applies to' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ description: 'Action this permission allows' })
  @IsString()
  @IsNotEmpty()
  action: string;
}

export class CheckPermissionDto {
  @ApiProperty({ description: 'User ID to check permissions for' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Permission name to check' })
  @IsString()
  @IsNotEmpty()
  permission: string;

  @ApiProperty({ description: 'Resource context (optional)' })
  @IsOptional()
  @IsString()
  resource?: string;
}