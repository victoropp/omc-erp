import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as NodeCache from 'node-cache';
import { 
  Configuration, 
  ConfigurationType, 
  ConfigurationStatus, 
  ConfigurationModule,
  ConfigurationDataType 
} from './entities/configuration.entity';

interface ConfigurationQuery {
  tenantId?: string;
  module?: ConfigurationModule;
  type?: ConfigurationType;
  status?: ConfigurationStatus;
  environment?: string;
  keys?: string[];
}

interface ConfigurationUpdate {
  value?: string;
  status?: ConfigurationStatus;
  changeReason?: string;
  approvedBy?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

interface ConfigurationHierarchy {
  systemConfigs: Configuration[];
  tenantConfigs: Configuration[];
  moduleConfigs: Configuration[];
  userConfigs: Configuration[];
}

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);
  private readonly cache = new NodeCache({ 
    stdTTL: 3600, // 1 hour default
    checkperiod: 600, // Check for expired keys every 10 minutes
    useClones: false 
  });
  private readonly encryptionKey = process.env.CONFIG_ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===== CONFIGURATION RETRIEVAL =====

  async getConfiguration(
    key: string,
    tenantId?: string,
    module?: ConfigurationModule,
    useCache: boolean = true
  ): Promise<any> {
    const cacheKey = this.buildCacheKey(key, tenantId, module);
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        await this.incrementAccessCount(key, tenantId, module);
        return cached;
      }
    }

    // Get configuration hierarchy
    const configs = await this.getConfigurationHierarchy(key, tenantId, module);
    const effectiveValue = this.resolveConfigurationValue(configs);

    // Cache the result
    if (useCache) {
      const config = configs.find(c => c.key === key);
      const ttl = config?.cacheTtlSeconds || 3600;
      this.cache.set(cacheKey, effectiveValue, ttl);
    }

    // Update access tracking
    await this.incrementAccessCount(key, tenantId, module);

    return effectiveValue;
  }

  async getMultipleConfigurations(
    keys: string[],
    tenantId?: string,
    module?: ConfigurationModule
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    // Batch fetch configurations
    const where: FindOptionsWhere<Configuration> = {
      key: In(keys),
      status: ConfigurationStatus.ACTIVE,
      isActive: true,
    };

    if (tenantId) where.tenantId = tenantId;
    if (module) where.module = module;

    const configs = await this.configRepository.find({
      where,
      order: { inheritanceLevel: 'ASC', version: 'DESC' },
    });

    // Resolve each configuration
    for (const key of keys) {
      const keyConfigs = configs.filter(c => c.key === key);
      if (keyConfigs.length > 0) {
        results[key] = this.resolveConfigurationValue(keyConfigs);
      }
    }

    return results;
  }

  async getModuleConfigurations(
    module: ConfigurationModule,
    tenantId?: string,
    environment?: string
  ): Promise<Record<string, any>> {
    const where: FindOptionsWhere<Configuration> = {
      module,
      status: ConfigurationStatus.ACTIVE,
      isActive: true,
    };

    if (tenantId) where.tenantId = tenantId;
    if (environment) where.environment = environment;

    const configs = await this.configRepository.find({
      where,
      order: { uiGroup: 'ASC', uiOrder: 'ASC' },
    });

    const result: Record<string, any> = {};
    const groupedByKey = this.groupConfigurationsByKey(configs);

    for (const [key, keyConfigs] of Object.entries(groupedByKey)) {
      result[key] = this.resolveConfigurationValue(keyConfigs);
    }

    return result;
  }

  async getAllConfigurations(query: ConfigurationQuery = {}): Promise<Configuration[]> {
    const where: FindOptionsWhere<Configuration> = {
      isActive: true,
    };

    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.module) where.module = query.module;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.environment) where.environment = query.environment;
    if (query.keys) where.key = In(query.keys);

    return this.configRepository.find({
      where,
      order: { module: 'ASC', key: 'ASC', inheritanceLevel: 'ASC' },
    });
  }

  // ===== CONFIGURATION MANAGEMENT =====

  async createConfiguration(configData: Partial<Configuration>): Promise<Configuration> {
    try {
      // Validate required fields
      this.validateConfigurationData(configData);

      // Check for existing configuration
      const existing = await this.configRepository.findOne({
        where: {
          key: configData.key,
          tenantId: configData.tenantId || null,
          module: configData.module,
        },
      });

      if (existing) {
        throw new BadRequestException(`Configuration ${configData.key} already exists for this tenant/module`);
      }

      // Create configuration
      const config = this.configRepository.create(configData);
      
      // Handle sensitive/encrypted values
      if (config.isSensitive && config.value) {
        config.encryptedValue = this.encryptValue(config.value);
        config.value = null; // Clear plain text value
        config.isEncrypted = true;
      }

      const savedConfig = await this.configRepository.save(config);

      // Clear related cache entries
      this.clearConfigurationCache(savedConfig.key, savedConfig.tenantId, savedConfig.module);

      // Emit event
      this.eventEmitter.emit('configuration.created', {
        configurationId: savedConfig.id,
        key: savedConfig.key,
        module: savedConfig.module,
        tenantId: savedConfig.tenantId,
      });

      this.logger.log(`Configuration created: ${savedConfig.key}`);
      return savedConfig;
    } catch (error) {
      this.logger.error(`Failed to create configuration: ${error.message}`);
      throw error;
    }
  }

  async updateConfiguration(
    id: string,
    updateData: ConfigurationUpdate,
    updatedBy?: string
  ): Promise<Configuration> {
    const config = await this.configRepository.findOne({ where: { id } });
    
    if (!config) {
      throw new NotFoundException(`Configuration ${id} not found`);
    }

    // Store previous value for auditing
    config.previousValue = config.value || config.encryptedValue;
    config.updatedBy = updatedBy;

    // Update fields
    if (updateData.value !== undefined) {
      if (config.isSensitive) {
        config.encryptedValue = this.encryptValue(updateData.value);
        config.value = null;
      } else {
        config.value = updateData.value;
      }
    }

    if (updateData.status) config.status = updateData.status;
    if (updateData.changeReason) config.changeReason = updateData.changeReason;
    if (updateData.approvedBy) config.approvedBy = updateData.approvedBy;
    if (updateData.effectiveDate) config.effectiveDate = updateData.effectiveDate;
    if (updateData.expiryDate) config.expiryDate = updateData.expiryDate;

    // Validate the new value
    this.validateConfigurationValue(config);

    const updatedConfig = await this.configRepository.save(config);

    // Clear cache
    this.clearConfigurationCache(config.key, config.tenantId, config.module);

    // Emit events
    this.eventEmitter.emit('configuration.updated', {
      configurationId: updatedConfig.id,
      key: updatedConfig.key,
      module: updatedConfig.module,
      tenantId: updatedConfig.tenantId,
      previousValue: config.previousValue,
      newValue: updateData.value,
    });

    // If this affects other configurations, refresh them
    if (config.affects && config.affects.length > 0) {
      await this.refreshDependentConfigurations(config.affects);
    }

    this.logger.log(`Configuration updated: ${updatedConfig.key}`);
    return updatedConfig;
  }

  async deleteConfiguration(id: string, deletedBy?: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { id } });
    
    if (!config) {
      throw new NotFoundException(`Configuration ${id} not found`);
    }

    // Soft delete
    config.isActive = false;
    config.status = ConfigurationStatus.ARCHIVED;
    config.updatedBy = deletedBy;

    await this.configRepository.save(config);

    // Clear cache
    this.clearConfigurationCache(config.key, config.tenantId, config.module);

    // Emit event
    this.eventEmitter.emit('configuration.deleted', {
      configurationId: config.id,
      key: config.key,
      module: config.module,
      tenantId: config.tenantId,
    });

    this.logger.log(`Configuration deleted: ${config.key}`);
  }

  async bulkUpdateConfigurations(
    updates: Array<{ id: string; value: any; changeReason?: string }>,
    updatedBy?: string
  ): Promise<Configuration[]> {
    const results: Configuration[] = [];

    for (const update of updates) {
      try {
        const result = await this.updateConfiguration(
          update.id,
          { 
            value: update.value?.toString(),
            changeReason: update.changeReason 
          },
          updatedBy
        );
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to update configuration ${update.id}: ${error.message}`);
      }
    }

    return results;
  }

  // ===== VALIDATION AND SECURITY =====

  private validateConfigurationData(configData: Partial<Configuration>): void {
    if (!configData.key) {
      throw new BadRequestException('Configuration key is required');
    }

    if (!configData.name) {
      throw new BadRequestException('Configuration name is required');
    }

    if (!configData.module) {
      throw new BadRequestException('Configuration module is required');
    }

    if (!configData.type) {
      throw new BadRequestException('Configuration type is required');
    }

    if (!configData.dataType) {
      throw new BadRequestException('Configuration data type is required');
    }
  }

  private validateConfigurationValue(config: Configuration): void {
    const value = config.value || (config.isEncrypted ? this.decryptValue(config.encryptedValue) : null);
    
    if (!value && config.isRequired) {
      throw new BadRequestException(`Configuration ${config.key} is required`);
    }

    if (!value) return;

    // Validate based on data type
    switch (config.dataType) {
      case ConfigurationDataType.NUMBER:
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          throw new BadRequestException(`Configuration ${config.key} must be a valid number`);
        }
        if (config.minValue !== null && numValue < config.minValue) {
          throw new BadRequestException(`Configuration ${config.key} must be >= ${config.minValue}`);
        }
        if (config.maxValue !== null && numValue > config.maxValue) {
          throw new BadRequestException(`Configuration ${config.key} must be <= ${config.maxValue}`);
        }
        break;

      case ConfigurationDataType.BOOLEAN:
        if (!['true', 'false'].includes(value.toLowerCase())) {
          throw new BadRequestException(`Configuration ${config.key} must be true or false`);
        }
        break;

      case ConfigurationDataType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`Configuration ${config.key} must be valid JSON`);
        }
        break;

      case ConfigurationDataType.STRING:
        if (config.allowedValues && config.allowedValues.length > 0) {
          if (!config.allowedValues.includes(value)) {
            throw new BadRequestException(`Configuration ${config.key} must be one of: ${config.allowedValues.join(', ')}`);
          }
        }
        if (config.regexPattern) {
          const regex = new RegExp(config.regexPattern);
          if (!regex.test(value)) {
            throw new BadRequestException(`Configuration ${config.key} does not match required pattern`);
          }
        }
        break;
    }
  }

  // ===== FEATURE FLAGS =====

  async isFeatureEnabled(
    featureKey: string,
    tenantId?: string,
    userId?: string
  ): Promise<boolean> {
    const config = await this.getConfigurationHierarchy(featureKey, tenantId);
    const featureConfig = config.find(c => c.featureFlag);
    
    if (!featureConfig) {
      return false;
    }

    const isEnabled = featureConfig.getEffectiveValue();
    
    // Handle gradual rollout
    if (featureConfig.featureFlagPercentage && featureConfig.featureFlagPercentage < 100) {
      const hash = crypto.createHash('md5')
        .update(`${featureKey}:${tenantId || 'system'}:${userId || 'anonymous'}`)
        .digest('hex');
      const percentage = parseInt(hash.substring(0, 8), 16) % 100;
      return percentage < featureConfig.featureFlagPercentage;
    }

    return Boolean(isEnabled);
  }

  async enableFeature(featureKey: string, tenantId?: string, percentage?: number): Promise<void> {
    const config = await this.configRepository.findOne({
      where: { key: featureKey, tenantId, featureFlag: true },
    });

    if (config) {
      await this.updateConfiguration(config.id, { 
        value: 'true',
        changeReason: `Feature enabled${percentage ? ` for ${percentage}% rollout` : ''}`
      });
      
      if (percentage) {
        config.featureFlagPercentage = percentage;
        await this.configRepository.save(config);
      }
    }
  }

  async disableFeature(featureKey: string, tenantId?: string): Promise<void> {
    const config = await this.configRepository.findOne({
      where: { key: featureKey, tenantId, featureFlag: true },
    });

    if (config) {
      await this.updateConfiguration(config.id, { 
        value: 'false',
        changeReason: 'Feature disabled'
      });
    }
  }

  // ===== ENVIRONMENT AND DEPLOYMENT =====

  async getEnvironmentConfigurations(environment: string): Promise<Configuration[]> {
    return this.configRepository.find({
      where: [
        { environment },
        { environment: 'ALL' },
      ],
      order: { module: 'ASC', key: 'ASC' },
    });
  }

  async promoteConfigurations(
    fromEnvironment: string,
    toEnvironment: string,
    configIds: string[]
  ): Promise<void> {
    const configs = await this.configRepository.find({
      where: { id: In(configIds), environment: fromEnvironment },
    });

    for (const config of configs) {
      const newConfig = { ...config };
      newConfig.id = undefined; // Let TypeORM generate new ID
      newConfig.environment = toEnvironment;
      newConfig.status = ConfigurationStatus.PENDING_APPROVAL;
      
      await this.configRepository.save(newConfig);
    }

    this.logger.log(`Promoted ${configs.length} configurations from ${fromEnvironment} to ${toEnvironment}`);
  }

  // ===== CACHING AND PERFORMANCE =====

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshCache(): Promise<void> {
    this.logger.log('Refreshing configuration cache');
    
    // Get all active configurations
    const configs = await this.configRepository.find({
      where: { 
        isActive: true,
        status: ConfigurationStatus.ACTIVE,
        refreshFrequency: 'REAL_TIME'
      },
    });

    // Update cache for real-time configurations
    for (const config of configs) {
      const cacheKey = this.buildCacheKey(config.key, config.tenantId, config.module);
      const value = config.getEffectiveValue();
      this.cache.set(cacheKey, value, config.cacheTtlSeconds || 3600);
    }
  }

  private clearConfigurationCache(key: string, tenantId?: string, module?: ConfigurationModule): void {
    const patterns = [
      this.buildCacheKey(key, tenantId, module),
      this.buildCacheKey(key, tenantId),
      this.buildCacheKey(key, undefined, module),
      this.buildCacheKey(key),
    ];

    patterns.forEach(pattern => {
      this.cache.del(pattern);
    });
  }

  private buildCacheKey(key: string, tenantId?: string, module?: ConfigurationModule): string {
    return `config:${key}:${tenantId || 'system'}:${module || 'global'}`;
  }

  // ===== HELPER METHODS =====

  private async getConfigurationHierarchy(
    key: string,
    tenantId?: string,
    module?: ConfigurationModule
  ): Promise<Configuration[]> {
    const where: FindOptionsWhere<Configuration>[] = [
      { key, tenantId: null, module }, // System level
    ];

    if (tenantId) {
      where.push({ key, tenantId, module }); // Tenant level
    }

    if (module) {
      where.push({ key, tenantId: null, module: undefined }); // Global system
      if (tenantId) {
        where.push({ key, tenantId, module: undefined }); // Global tenant
      }
    }

    return this.configRepository.find({
      where,
      order: { inheritanceLevel: 'ASC', version: 'DESC' },
    });
  }

  private resolveConfigurationValue(configs: Configuration[]): any {
    if (configs.length === 0) return null;

    // Sort by inheritance level (highest priority last)
    const sortedConfigs = configs.sort((a, b) => a.inheritanceLevel - b.inheritanceLevel);
    
    // Find the highest priority active configuration
    for (let i = sortedConfigs.length - 1; i >= 0; i--) {
      const config = sortedConfigs[i];
      if (config.status === ConfigurationStatus.ACTIVE && config.isActive) {
        const now = new Date();
        
        // Check if configuration is effective
        if (config.effectiveDate && config.effectiveDate > now) continue;
        if (config.expiryDate && config.expiryDate < now) continue;
        
        return config.getEffectiveValue();
      }
    }

    return null;
  }

  private groupConfigurationsByKey(configs: Configuration[]): Record<string, Configuration[]> {
    return configs.reduce((groups, config) => {
      if (!groups[config.key]) {
        groups[config.key] = [];
      }
      groups[config.key].push(config);
      return groups;
    }, {} as Record<string, Configuration[]>);
  }

  private async incrementAccessCount(key: string, tenantId?: string, module?: ConfigurationModule): Promise<void> {
    // Update access count asynchronously
    setImmediate(async () => {
      try {
        await this.configRepository.increment(
          { key, tenantId, module },
          'accessCount',
          1
        );
        await this.configRepository.update(
          { key, tenantId, module },
          { lastAccessedDate: new Date() }
        );
      } catch (error) {
        // Ignore errors in access tracking
      }
    });
  }

  private async refreshDependentConfigurations(dependentKeys: string[]): Promise<void> {
    for (const key of dependentKeys) {
      this.cache.del(`config:${key}:*`);
    }
  }

  private encryptValue(value: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptValue(encryptedValue: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}