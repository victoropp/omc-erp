export declare class AuditLog {
    id: string;
    tenantId: string;
    tableName: string;
    operation: string;
    recordId: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    changedBy: string;
    changedAt: Date;
    ipAddress: string;
    userAgent: string;
}
//# sourceMappingURL=AuditLog.d.ts.map