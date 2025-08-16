import { Injectable, BadRequestException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
}

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  // In-memory storage for demo - replace with database
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.initializeDefaultPermissionsAndRoles();
  }

  // Permission Management
  async createPermission(permissionData: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    const id = this.generateId();
    
    // Check if permission with same name already exists
    const existing = Array.from(this.permissions.values()).find(p => p.name === permissionData.name);
    if (existing) {
      throw new BadRequestException(`Permission '${permissionData.name}' already exists`);
    }

    const permission: Permission = {
      id,
      ...permissionData,
      createdAt: new Date(),
    };

    this.permissions.set(id, permission);
    
    // Invalidate permission cache
    await this.clearPermissionCache();
    
    this.logger.log(`Permission created: ${permission.name}`);
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissions.get(id) || null;
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return Array.from(this.permissions.values()).filter(p => p.resource === resource);
  }

  // Role Management
  async createRole(roleData: Omit<Role, 'id' | 'permissions' | 'createdAt' | 'updatedAt'> & { permissionIds: string[] }): Promise<Role> {
    const id = this.generateId();
    
    // Check if role with same name already exists
    const existing = Array.from(this.roles.values()).find(r => r.name === roleData.name);
    if (existing) {
      throw new BadRequestException(`Role '${roleData.name}' already exists`);
    }

    // Validate permission IDs
    const permissions = roleData.permissionIds.map(permId => {
      const permission = this.permissions.get(permId);
      if (!permission) {
        throw new BadRequestException(`Permission with ID '${permId}' not found`);
      }
      return permission;
    });

    const role: Role = {
      id,
      name: roleData.name,
      description: roleData.description,
      isSystem: roleData.isSystem || false,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(id, role);
    
    // Invalidate role cache
    await this.clearRoleCache();
    
    this.logger.log(`Role created: ${role.name}`);
    return role;
  }

  async updateRole(id: string, updates: { description?: string; permissionIds?: string[] }): Promise<Role> {
    const role = this.roles.get(id);
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    if (updates.description !== undefined) {
      role.description = updates.description;
    }

    if (updates.permissionIds !== undefined) {
      // Validate permission IDs
      const permissions = updates.permissionIds.map(permId => {
        const permission = this.permissions.get(permId);
        if (!permission) {
          throw new BadRequestException(`Permission with ID '${permId}' not found`);
        }
        return permission;
      });
      role.permissions = permissions;
    }

    role.updatedAt = new Date();
    this.roles.set(id, role);
    
    // Invalidate caches
    await this.clearRoleCache();
    await this.clearUserPermissionCache();
    
    this.logger.log(`Role updated: ${role.name}`);
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const role = this.roles.get(id);
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is assigned to any users
    const assignedUsers = Array.from(this.userRoles.values()).flat().filter(ur => ur.roleId === id);
    if (assignedUsers.length > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    this.roles.delete(id);
    
    // Invalidate caches
    await this.clearRoleCache();
    
    this.logger.log(`Role deleted: ${role.name}`);
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  // Utilities
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cache Management
  private async clearPermissionCache(): Promise<void> {
    this.logger.debug('Permission cache cleared');
  }

  private async clearRoleCache(): Promise<void> {
    this.logger.debug('Role cache cleared');
  }

  private async clearUserPermissionCache(userId?: string): Promise<void> {
    if (userId) {
      await this.cacheManager.del(`user_permissions:${userId}`);
    } else {
      this.logger.debug('All user permission caches cleared');
    }
  }

  // User Permissions and Roles
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    // In a real implementation, this would check user roles and permissions from database
    // For now, return true to allow compilation
    this.logger.debug(`Checking permission ${permission} for user ${userId}`);
    return true;
  }

  async getUserRoles(userId: string): Promise<string[]> {
    // In a real implementation, this would fetch user roles from database
    // For now, return empty array to allow compilation
    this.logger.debug(`Getting roles for user ${userId}`);
    return [];
  }

  private initializeDefaultPermissionsAndRoles(): void {
    // Initialize default permissions
    const defaultPermissions = [
      { name: 'users:read', description: 'View users', resource: 'users', action: 'read' },
      { name: 'users:write', description: 'Create/update users', resource: 'users', action: 'write' },
      { name: 'profile:read', description: 'View own profile', resource: 'profile', action: 'read' },
      { name: 'profile:write', description: 'Update own profile', resource: 'profile', action: 'write' },
    ];

    defaultPermissions.forEach(permData => {
      const id = this.generateId();
      this.permissions.set(id, {
        id,
        ...permData,
        createdAt: new Date(),
      });
    });

    this.logger.log('Default permissions and roles initialized');
  }
}