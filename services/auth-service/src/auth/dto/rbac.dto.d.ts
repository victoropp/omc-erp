export declare class CreateRoleDto {
    name: string;
    description: string;
    permissionIds: string[];
    isSystem?: boolean;
}
export declare class UpdateRoleDto {
    description?: string;
    permissionIds?: string[];
}
export declare class AssignRoleDto {
    userId: string;
    roleId: string;
}
export declare class RemoveRoleDto {
    userId: string;
    roleId: string;
}
export declare class CreatePermissionDto {
    name: string;
    description: string;
    resource: string;
    action: string;
}
export declare class CheckPermissionDto {
    userId: string;
    permission: string;
    resource?: string;
}
//# sourceMappingURL=rbac.dto.d.ts.map