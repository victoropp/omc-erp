/**
 * Multi-tenant Architecture Package
 * Provides complete tenant isolation for SaaS deployment
 * Supports 197+ OMCs with data segregation and security
 */
import { Request } from 'express';
import { DataSource, EntityManager } from 'typeorm';
export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    database: string;
    schema: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled';
    tier: 'starter' | 'growth' | 'professional' | 'enterprise';
    settings: TenantSettings;
    createdAt: Date;
    expiresAt?: Date;
}
export interface TenantSettings {
    stations: number;
    users: number;
    storage: number;
    apiRateLimit: number;
    features: string[];
    customDomain?: string;
    branding?: {
        logo?: string;
        primaryColor?: string;
        secondaryColor?: string;
    };
}
export interface TenantContext {
    tenant: Tenant;
    userId: string;
    permissions: string[];
    sessionId: string;
}
/**
 * Tenant Resolution Strategy
 */
export declare class TenantService {
    private request;
    private masterDataSource;
    private currentTenant;
    private tenantDataSource;
    constructor(request: Request, masterDataSource: DataSource);
    /**
     * Resolve tenant from request
     */
    private resolveTenant;
    /**
     * Get current tenant
     */
    getCurrentTenant(): Tenant;
    /**
     * Get tenant-specific database connection
     */
    getTenantConnection(): Promise<DataSource>;
    /**
     * Create tenant-specific database connection
     */
    private createTenantConnection;
    /**
     * Get max connections based on tenant tier
     */
    private getMaxConnections;
    /**
     * Extract subdomain from hostname
     */
    private extractSubdomain;
    /**
     * Extract JWT token from request
     */
    private extractToken;
    /**
     * Get tenant by subdomain
     */
    private getTenantBySubdomain;
    /**
     * Get tenant by ID
     */
    private getTenantById;
    /**
     * Get tenant from JWT token
     */
    private getTenantFromToken;
    private decodeTokenTenantId;
}
/**
 * Tenant Isolation Middleware
 */
export declare class TenantIsolationMiddleware {
    private tenantService;
    constructor(tenantService: TenantService);
    use(req: Request, res: Response, next: Function): Promise<void>;
    private applyRateLimiting;
}
/**
 * Tenant-aware Repository Base
 */
export declare class TenantAwareRepository<T> {
    private tenantService;
    private entityClass;
    protected entityManager: EntityManager;
    constructor(tenantService: TenantService, entityClass: any);
    initialize(): Promise<void>;
    findAll(): Promise<T[]>;
    findOne(id: string): Promise<T>;
    save(entity: T): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<void>;
    delete(id: string): Promise<void>;
}
/**
 * Tenant Provisioning Service
 */
export declare class TenantProvisioningService {
    private masterDataSource;
    constructor(masterDataSource: DataSource);
    /**
     * Provision new tenant
     */
    provisionTenant(name: string, subdomain: string, tier: string, adminEmail: string): Promise<Tenant>;
    /**
     * Upgrade tenant tier
     */
    upgradeTenant(tenantId: string, newTier: string): Promise<void>;
    /**
     * Suspend tenant
     */
    suspendTenant(tenantId: string, reason: string): Promise<void>;
    /**
     * Delete tenant (soft delete)
     */
    deleteTenant(tenantId: string): Promise<void>;
    private generateTenantId;
    private getDefaultSettings;
    private createTenantDatabase;
    private runTenantMigrations;
    private createAdminUser;
    private initializeDefaultData;
}
/**
 * Tenant Usage Tracking
 */
export declare class TenantUsageService {
    private tenantService;
    private masterDataSource;
    constructor(tenantService: TenantService, masterDataSource: DataSource);
    /**
     * Track API usage
     */
    trackApiUsage(endpoint: string, responseTime: number): Promise<void>;
    /**
     * Track storage usage
     */
    trackStorageUsage(bytes: number): Promise<void>;
    /**
     * Check usage limits
     */
    checkUsageLimits(): Promise<{
        withinLimits: boolean;
        usage: any;
        limits: any;
    }>;
    private isWithinLimits;
}
/**
 * Tenant Data Backup Service
 */
export declare class TenantBackupService {
    private tenantService;
    private masterDataSource;
    constructor(tenantService: TenantService, masterDataSource: DataSource);
    /**
     * Create tenant backup
     */
    createBackup(): Promise<string>;
    /**
     * Restore tenant backup
     */
    restoreBackup(backupId: string): Promise<void>;
    private generateBackupId;
    private performBackup;
    private performRestore;
}
declare const _default: {
    TenantService: typeof TenantService;
    TenantIsolationMiddleware: typeof TenantIsolationMiddleware;
    TenantAwareRepository: typeof TenantAwareRepository;
    TenantProvisioningService: typeof TenantProvisioningService;
    TenantUsageService: typeof TenantUsageService;
    TenantBackupService: typeof TenantBackupService;
};
export default _default;
//# sourceMappingURL=index.d.ts.map