"use strict";
/**
 * Multi-tenant Architecture Package
 * Provides complete tenant isolation for SaaS deployment
 * Supports 197+ OMCs with data segregation and security
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantBackupService = exports.TenantUsageService = exports.TenantProvisioningService = exports.TenantAwareRepository = exports.TenantIsolationMiddleware = exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const crypto = __importStar(require("crypto"));
/**
 * Tenant Resolution Strategy
 */
let TenantService = class TenantService {
    request;
    masterDataSource;
    currentTenant;
    tenantDataSource;
    constructor(request, masterDataSource) {
        this.request = request;
        this.masterDataSource = masterDataSource;
        this.resolveTenant();
    }
    /**
     * Resolve tenant from request
     */
    async resolveTenant() {
        // 1. Try subdomain resolution
        const subdomain = this.extractSubdomain(this.request.hostname);
        if (subdomain) {
            this.currentTenant = await this.getTenantBySubdomain(subdomain);
            return;
        }
        // 2. Try header resolution (for API clients)
        const tenantId = this.request.headers['x-tenant-id'];
        if (tenantId) {
            this.currentTenant = await this.getTenantById(tenantId);
            return;
        }
        // 3. Try JWT token resolution
        const token = this.extractToken(this.request);
        if (token) {
            this.currentTenant = await this.getTenantFromToken(token);
            return;
        }
        throw new Error('Unable to resolve tenant');
    }
    /**
     * Get current tenant
     */
    getCurrentTenant() {
        if (!this.currentTenant) {
            throw new Error('No tenant context available');
        }
        return this.currentTenant;
    }
    /**
     * Get tenant-specific database connection
     */
    async getTenantConnection() {
        if (!this.tenantDataSource) {
            this.tenantDataSource = await this.createTenantConnection(this.currentTenant);
        }
        return this.tenantDataSource;
    }
    /**
     * Create tenant-specific database connection
     */
    async createTenantConnection(tenant) {
        return new typeorm_1.DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: tenant.database,
            schema: tenant.schema,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false,
            logging: process.env.NODE_ENV === 'development',
            extra: {
                // Connection pool settings per tenant
                max: this.getMaxConnections(tenant.tier),
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            },
        });
    }
    /**
     * Get max connections based on tenant tier
     */
    getMaxConnections(tier) {
        const limits = {
            starter: 5,
            growth: 10,
            professional: 20,
            enterprise: 50,
        };
        return limits[tier] || 5;
    }
    /**
     * Extract subdomain from hostname
     */
    extractSubdomain(hostname) {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
            return parts[0];
        }
        return null;
    }
    /**
     * Extract JWT token from request
     */
    extractToken(request) {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
    /**
     * Get tenant by subdomain
     */
    async getTenantBySubdomain(subdomain) {
        const result = await this.masterDataSource.query(`SELECT * FROM tenants WHERE subdomain = $1 AND status = 'active'`, [subdomain]);
        if (result.length === 0) {
            throw new Error(`Tenant not found: ${subdomain}`);
        }
        return result[0];
    }
    /**
     * Get tenant by ID
     */
    async getTenantById(tenantId) {
        const result = await this.masterDataSource.query(`SELECT * FROM tenants WHERE id = $1 AND status = 'active'`, [tenantId]);
        if (result.length === 0) {
            throw new Error(`Tenant not found: ${tenantId}`);
        }
        return result[0];
    }
    /**
     * Get tenant from JWT token
     */
    async getTenantFromToken(token) {
        // Decode JWT and extract tenant ID
        // Implementation depends on JWT library used
        const tenantId = this.decodeTokenTenantId(token);
        return this.getTenantById(tenantId);
    }
    decodeTokenTenantId(token) {
        // JWT decode implementation
        return 'tenant-id';
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, typeof (_b = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _b : Object])
], TenantService);
/**
 * Tenant Isolation Middleware
 */
let TenantIsolationMiddleware = class TenantIsolationMiddleware {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async use(req, res, next) {
        try {
            const tenant = this.tenantService.getCurrentTenant();
            // Validate tenant status
            if (tenant.status !== 'active') {
                throw new Error(`Tenant is ${tenant.status}`);
            }
            // Check expiration for trial tenants
            if (tenant.status === 'trial' && tenant.expiresAt && new Date() > tenant.expiresAt) {
                throw new Error('Trial period expired');
            }
            // Apply rate limiting based on tier
            await this.applyRateLimiting(tenant);
            // Set tenant context in request
            req['tenant'] = tenant;
            next();
        }
        catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
    async applyRateLimiting(tenant) {
        // Implement rate limiting based on tenant settings
    }
};
exports.TenantIsolationMiddleware = TenantIsolationMiddleware;
exports.TenantIsolationMiddleware = TenantIsolationMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [TenantService])
], TenantIsolationMiddleware);
/**
 * Tenant-aware Repository Base
 */
class TenantAwareRepository {
    tenantService;
    entityClass;
    entityManager;
    constructor(tenantService, entityClass) {
        this.tenantService = tenantService;
        this.entityClass = entityClass;
    }
    async initialize() {
        const connection = await this.tenantService.getTenantConnection();
        this.entityManager = connection.manager;
    }
    async findAll() {
        await this.initialize();
        return this.entityManager.find(this.entityClass);
    }
    async findOne(id) {
        await this.initialize();
        return this.entityManager.findOne(this.entityClass, { where: { id } });
    }
    async save(entity) {
        await this.initialize();
        return this.entityManager.save(entity);
    }
    async update(id, entity) {
        await this.initialize();
        await this.entityManager.update(this.entityClass, id, entity);
    }
    async delete(id) {
        await this.initialize();
        await this.entityManager.delete(this.entityClass, id);
    }
}
exports.TenantAwareRepository = TenantAwareRepository;
/**
 * Tenant Provisioning Service
 */
let TenantProvisioningService = class TenantProvisioningService {
    masterDataSource;
    constructor(masterDataSource) {
        this.masterDataSource = masterDataSource;
    }
    /**
     * Provision new tenant
     */
    async provisionTenant(name, subdomain, tier, adminEmail) {
        const tenantId = this.generateTenantId();
        const database = `omc_${subdomain}`;
        const schema = `tenant_${tenantId}`;
        // 1. Create tenant record
        const tenant = {
            id: tenantId,
            name,
            subdomain,
            database,
            schema,
            status: tier === 'trial' ? 'trial' : 'active',
            tier: tier,
            settings: this.getDefaultSettings(tier),
            createdAt: new Date(),
            expiresAt: tier === 'trial' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
        };
        // 2. Create database and schema
        await this.createTenantDatabase(database, schema);
        // 3. Run migrations
        await this.runTenantMigrations(database, schema);
        // 4. Create admin user
        await this.createAdminUser(tenant, adminEmail);
        // 5. Initialize default data
        await this.initializeDefaultData(tenant);
        // 6. Save tenant record
        await this.masterDataSource.query(`INSERT INTO tenants (id, name, subdomain, database, schema, status, tier, settings, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [tenant.id, tenant.name, tenant.subdomain, tenant.database, tenant.schema,
            tenant.status, tenant.tier, JSON.stringify(tenant.settings), tenant.createdAt, tenant.expiresAt]);
        return tenant;
    }
    /**
     * Upgrade tenant tier
     */
    async upgradeTenant(tenantId, newTier) {
        await this.masterDataSource.query(`UPDATE tenants SET tier = $1, settings = $2, status = 'active', expires_at = NULL WHERE id = $3`, [newTier, JSON.stringify(this.getDefaultSettings(newTier)), tenantId]);
    }
    /**
     * Suspend tenant
     */
    async suspendTenant(tenantId, reason) {
        await this.masterDataSource.query(`UPDATE tenants SET status = 'suspended', suspension_reason = $1, suspended_at = NOW() WHERE id = $2`, [reason, tenantId]);
    }
    /**
     * Delete tenant (soft delete)
     */
    async deleteTenant(tenantId) {
        await this.masterDataSource.query(`UPDATE tenants SET status = 'cancelled', deleted_at = NOW() WHERE id = $1`, [tenantId]);
    }
    generateTenantId() {
        return 'OMC-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }
    getDefaultSettings(tier) {
        const settings = {
            starter: {
                stations: 5,
                users: 10,
                storage: 10,
                apiRateLimit: 100,
                features: ['basic_reporting', 'inventory', 'sales'],
            },
            growth: {
                stations: 20,
                users: 50,
                storage: 50,
                apiRateLimit: 500,
                features: ['basic_reporting', 'inventory', 'sales', 'analytics', 'mobile_app'],
            },
            professional: {
                stations: 50,
                users: 200,
                storage: 200,
                apiRateLimit: 2000,
                features: ['all_features', 'api_access', 'custom_reports'],
            },
            enterprise: {
                stations: -1, // unlimited
                users: -1, // unlimited
                storage: 1000,
                apiRateLimit: 10000,
                features: ['all_features', 'api_access', 'custom_reports', 'white_label', 'sla'],
            },
        };
        return settings[tier] || settings.starter;
    }
    async createTenantDatabase(database, schema) {
        // Create database if not exists
        await this.masterDataSource.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
        // Create schema
        const tenantConnection = new typeorm_1.DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database,
        });
        await tenantConnection.initialize();
        await tenantConnection.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        await tenantConnection.destroy();
    }
    async runTenantMigrations(database, schema) {
        // Run database migrations for tenant
        // Implementation depends on migration tool used
    }
    async createAdminUser(tenant, email) {
        // Create admin user for tenant
    }
    async initializeDefaultData(tenant) {
        // Initialize default data for tenant (fuel types, tax rates, etc.)
    }
};
exports.TenantProvisioningService = TenantProvisioningService;
exports.TenantProvisioningService = TenantProvisioningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_c = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _c : Object])
], TenantProvisioningService);
/**
 * Tenant Usage Tracking
 */
let TenantUsageService = class TenantUsageService {
    tenantService;
    masterDataSource;
    constructor(tenantService, masterDataSource) {
        this.tenantService = tenantService;
        this.masterDataSource = masterDataSource;
    }
    /**
     * Track API usage
     */
    async trackApiUsage(endpoint, responseTime) {
        const tenant = this.tenantService.getCurrentTenant();
        await this.masterDataSource.query(`INSERT INTO tenant_usage (tenant_id, endpoint, response_time, timestamp)
       VALUES ($1, $2, $3, NOW())`, [tenant.id, endpoint, responseTime]);
    }
    /**
     * Track storage usage
     */
    async trackStorageUsage(bytes) {
        const tenant = this.tenantService.getCurrentTenant();
        await this.masterDataSource.query(`UPDATE tenant_usage_summary 
       SET storage_used = storage_used + $1, updated_at = NOW()
       WHERE tenant_id = $2 AND month = DATE_TRUNC('month', NOW())`, [bytes, tenant.id]);
    }
    /**
     * Check usage limits
     */
    async checkUsageLimits() {
        const tenant = this.tenantService.getCurrentTenant();
        const usage = await this.masterDataSource.query(`SELECT * FROM tenant_usage_summary 
       WHERE tenant_id = $1 AND month = DATE_TRUNC('month', NOW())`, [tenant.id]);
        const limits = tenant.settings;
        return {
            withinLimits: this.isWithinLimits(usage[0], limits),
            usage: usage[0],
            limits,
        };
    }
    isWithinLimits(usage, limits) {
        if (!usage)
            return true;
        if (limits.storage !== -1 && usage.storage_used > limits.storage * 1024 * 1024 * 1024) {
            return false;
        }
        if (limits.apiRateLimit !== -1 && usage.api_calls > limits.apiRateLimit * 60 * 24 * 30) {
            return false;
        }
        return true;
    }
};
exports.TenantUsageService = TenantUsageService;
exports.TenantUsageService = TenantUsageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [TenantService, typeof (_d = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _d : Object])
], TenantUsageService);
/**
 * Tenant Data Backup Service
 */
let TenantBackupService = class TenantBackupService {
    tenantService;
    masterDataSource;
    constructor(tenantService, masterDataSource) {
        this.tenantService = tenantService;
        this.masterDataSource = masterDataSource;
    }
    /**
     * Create tenant backup
     */
    async createBackup() {
        const tenant = this.tenantService.getCurrentTenant();
        const backupId = this.generateBackupId();
        // Create backup
        const backupPath = await this.performBackup(tenant, backupId);
        // Record backup
        await this.masterDataSource.query(`INSERT INTO tenant_backups (id, tenant_id, path, size, created_at)
       VALUES ($1, $2, $3, $4, NOW())`, [backupId, tenant.id, backupPath, 0]);
        return backupId;
    }
    /**
     * Restore tenant backup
     */
    async restoreBackup(backupId) {
        const tenant = this.tenantService.getCurrentTenant();
        // Get backup info
        const backup = await this.masterDataSource.query(`SELECT * FROM tenant_backups WHERE id = $1 AND tenant_id = $2`, [backupId, tenant.id]);
        if (backup.length === 0) {
            throw new Error('Backup not found');
        }
        // Perform restoration
        await this.performRestore(tenant, backup[0]);
    }
    generateBackupId() {
        return 'BACKUP-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    }
    async performBackup(tenant, backupId) {
        // Implement backup logic (pg_dump for PostgreSQL)
        return `/backups/${tenant.id}/${backupId}.sql`;
    }
    async performRestore(tenant, backup) {
        // Implement restore logic
    }
};
exports.TenantBackupService = TenantBackupService;
exports.TenantBackupService = TenantBackupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [TenantService, typeof (_e = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _e : Object])
], TenantBackupService);
exports.default = {
    TenantService,
    TenantIsolationMiddleware,
    TenantAwareRepository,
    TenantProvisioningService,
    TenantUsageService,
    TenantBackupService,
};
//# sourceMappingURL=index.js.map