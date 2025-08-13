import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as NodeCache from 'node-cache';
import { ConfigurationService } from './configuration.service';
import { 
  Configuration, 
  ConfigurationType, 
  ConfigurationStatus, 
  ConfigurationModule,
  ConfigurationDataType 
} from './entities/configuration.entity';

// Mock NodeCache
jest.mock('node-cache');
const MockNodeCache = NodeCache as jest.MockedClass<typeof NodeCache>;

// Mock crypto
jest.mock('crypto');
const mockCrypto = crypto as jest.Mocked<typeof crypto>;

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let configRepository: jest.Mocked<Repository<Configuration>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let mockCache: jest.Mocked<NodeCache>;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  const mockConfiguration: Configuration = {
    id: 'config-123',
    key: 'SYSTEM_CURRENCY',
    name: 'System Currency',
    description: 'Default currency for the system',
    value: 'GHS',
    encryptedValue: null,
    defaultValue: 'USD',
    module: ConfigurationModule.SYSTEM,
    type: ConfigurationType.OPERATIONAL,
    dataType: ConfigurationDataType.STRING,
    status: ConfigurationStatus.ACTIVE,
    isActive: true,
    isRequired: true,
    isSensitive: false,
    isEncrypted: false,
    environment: 'production',
    inheritanceLevel: 1,
    version: 1,
    tenantId: null, // System level config
    createdBy: mockUserId,
    updatedBy: null,
    approvedBy: null,
    changeReason: null,
    effectiveDate: new Date(),
    expiryDate: null,
    allowedValues: ['GHS', 'USD', 'EUR'],
    minValue: null,
    maxValue: null,
    regexPattern: null,
    uiGroup: 'General',
    uiOrder: 1,
    uiHelpText: 'Select the default currency',
    featureFlag: false,
    featureFlagPercentage: null,
    cacheTtlSeconds: 3600,
    accessCount: 0,
    lastAccessedDate: null,
    refreshFrequency: 'MANUAL',
    affects: [],
    dependencies: [],
    tags: ['currency', 'system'],
    previousValue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    getEffectiveValue: jest.fn(() => 'GHS'),
  } as Configuration;

  const mockTenantConfig: Configuration = {
    ...mockConfiguration,
    id: 'tenant-config-123',
    key: 'TENANT_CURRENCY',
    tenantId: mockTenantId,
    value: 'USD',
    inheritanceLevel: 2,
    getEffectiveValue: jest.fn(() => 'USD'),
  } as Configuration;

  const mockSensitiveConfig: Configuration = {
    ...mockConfiguration,
    id: 'sensitive-config-123',
    key: 'API_SECRET_KEY',
    name: 'API Secret Key',
    isSensitive: true,
    isEncrypted: true,
    value: null,
    encryptedValue: 'encrypted_secret_value',
    getEffectiveValue: jest.fn(() => 'decrypted_secret_value'),
  } as Configuration;

  beforeEach(async () => {
    // Create mock cache instance
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    MockNodeCache.mockImplementation(() => mockCache);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationService,
        {
          provide: getRepositoryToken(Configuration),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            increment: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
    configRepository = module.get(getRepositoryToken(Configuration));
    eventEmitter = module.get(EventEmitter2);

    // Setup crypto mocks
    const mockCipher = {
      update: jest.fn(() => 'encrypted_part'),
      final: jest.fn(() => '_final'),
    };
    const mockDecipher = {
      update: jest.fn(() => 'decrypted_part'),
      final: jest.fn(() => '_final'),
    };

    mockCrypto.createCipher = jest.fn(() => mockCipher as any);
    mockCrypto.createDecipher = jest.fn(() => mockDecipher as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfiguration', () => {
    const configKey = 'SYSTEM_CURRENCY';

    it('should return cached configuration if available', async () => {
      // Arrange
      const cachedValue = 'GHS';
      mockCache.get.mockReturnValue(cachedValue);

      // Act
      const result = await service.getConfiguration(configKey, mockTenantId);

      // Assert
      expect(result).toBe(cachedValue);
      expect(mockCache.get).toHaveBeenCalledWith(`config:${configKey}:${mockTenantId}:global`);
      expect(configRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database if not cached', async () => {
      // Arrange
      mockCache.get.mockReturnValue(undefined);
      
      // Mock getConfigurationHierarchy
      const hierarchyConfigs = [mockConfiguration];
      const getHierarchySpy = jest.spyOn(service as any, 'getConfigurationHierarchy')
        .mockResolvedValue(hierarchyConfigs);
      const resolveValueSpy = jest.spyOn(service as any, 'resolveConfigurationValue')
        .mockReturnValue('GHS');

      // Act
      const result = await service.getConfiguration(configKey, mockTenantId);

      // Assert
      expect(result).toBe('GHS');
      expect(getHierarchySpy).toHaveBeenCalledWith(configKey, mockTenantId, undefined);
      expect(resolveValueSpy).toHaveBeenCalledWith(hierarchyConfigs);
      expect(mockCache.set).toHaveBeenCalledWith(`config:${configKey}:${mockTenantId}:global`, 'GHS', 3600);
    });

    it('should skip cache when useCache is false', async () => {
      // Arrange
      const hierarchyConfigs = [mockConfiguration];
      const getHierarchySpy = jest.spyOn(service as any, 'getConfigurationHierarchy')
        .mockResolvedValue(hierarchyConfigs);
      const resolveValueSpy = jest.spyOn(service as any, 'resolveConfigurationValue')
        .mockReturnValue('GHS');

      // Act
      const result = await service.getConfiguration(configKey, mockTenantId, undefined, false);

      // Assert
      expect(result).toBe('GHS');
      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should increment access count', async () => {
      // Arrange
      mockCache.get.mockReturnValue('cached_value');

      // Act
      await service.getConfiguration(configKey, mockTenantId);

      // Assert
      // Access count is incremented asynchronously via setImmediate
      await new Promise(resolve => setImmediate(resolve));
      expect(configRepository.increment).toHaveBeenCalledWith(
        { key: configKey, tenantId: mockTenantId, module: undefined },
        'accessCount',
        1
      );
    });
  });

  describe('getMultipleConfigurations', () => {
    const configKeys = ['SYSTEM_CURRENCY', 'MAX_UPLOAD_SIZE'];

    it('should return multiple configurations', async () => {
      // Arrange
      const configs = [
        mockConfiguration,
        { ...mockConfiguration, key: 'MAX_UPLOAD_SIZE', value: '10MB' },
      ];
      configRepository.find.mockResolvedValue(configs);
      const resolveValueSpy = jest.spyOn(service as any, 'resolveConfigurationValue')
        .mockReturnValueOnce('GHS')
        .mockReturnValueOnce('10MB');

      // Act
      const result = await service.getMultipleConfigurations(configKeys, mockTenantId);

      // Assert
      expect(result).toEqual({
        SYSTEM_CURRENCY: 'GHS',
        MAX_UPLOAD_SIZE: '10MB',
      });
      expect(configRepository.find).toHaveBeenCalledWith({
        where: {
          key: In(configKeys),
          status: ConfigurationStatus.ACTIVE,
          isActive: true,
          tenantId: mockTenantId,
        },
        order: { inheritanceLevel: 'ASC', version: 'DESC' },
      });
    });

    it('should filter by module when provided', async () => {
      // Arrange
      const module = ConfigurationModule.SYSTEM;
      configRepository.find.mockResolvedValue([mockConfiguration]);
      jest.spyOn(service as any, 'resolveConfigurationValue').mockReturnValue('GHS');

      // Act
      await service.getMultipleConfigurations(configKeys, mockTenantId, module);

      // Assert
      expect(configRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          module,
        }),
        order: { inheritanceLevel: 'ASC', version: 'DESC' },
      });
    });
  });

  describe('createConfiguration', () => {
    const configData = {
      key: 'NEW_CONFIG',
      name: 'New Configuration',
      module: ConfigurationModule.SYSTEM,
      type: ConfigurationType.OPERATIONAL,
      dataType: ConfigurationDataType.STRING,
      value: 'test_value',
    };

    it('should create configuration successfully', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(null); // No existing config
      configRepository.create.mockReturnValue(mockConfiguration);
      configRepository.save.mockResolvedValue(mockConfiguration);
      const clearCacheSpy = jest.spyOn(service as any, 'clearConfigurationCache').mockImplementation();

      // Act
      const result = await service.createConfiguration(configData);

      // Assert
      expect(result).toBe(mockConfiguration);
      expect(configRepository.findOne).toHaveBeenCalledWith({
        where: {
          key: configData.key,
          tenantId: null,
          module: configData.module,
        },
      });
      expect(configRepository.create).toHaveBeenCalledWith(configData);
      expect(configRepository.save).toHaveBeenCalledWith(mockConfiguration);
      expect(clearCacheSpy).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('configuration.created', expect.any(Object));
    });

    it('should throw BadRequestException if configuration already exists', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(mockConfiguration);

      // Act & Assert
      await expect(service.createConfiguration(configData))
        .rejects.toThrow(BadRequestException);
      
      expect(configRepository.save).not.toHaveBeenCalled();
    });

    it('should encrypt sensitive values', async () => {
      // Arrange
      const sensitiveConfigData = {
        ...configData,
        isSensitive: true,
        value: 'sensitive_secret',
      };
      const encryptedConfig = {
        ...mockConfiguration,
        isSensitive: true,
        isEncrypted: true,
        encryptedValue: 'encrypted_secret_value',
        value: null,
      };

      configRepository.findOne.mockResolvedValue(null);
      configRepository.create.mockReturnValue(encryptedConfig);
      configRepository.save.mockResolvedValue(encryptedConfig);
      jest.spyOn(service as any, 'encryptValue').mockReturnValue('encrypted_secret_value');

      // Act
      const result = await service.createConfiguration(sensitiveConfigData);

      // Assert
      expect(service['encryptValue']).toHaveBeenCalledWith('sensitive_secret');
      expect(result.isEncrypted).toBe(true);
      expect(result.value).toBeNull();
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidConfigData = { key: '', name: '' }; // Missing required fields

      // Act & Assert
      await expect(service.createConfiguration(invalidConfigData))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateConfiguration', () => {
    const updateData = {
      value: 'updated_value',
      changeReason: 'Value update',
    };

    it('should update configuration successfully', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(mockConfiguration);
      const updatedConfig = { ...mockConfiguration, value: 'updated_value' };
      configRepository.save.mockResolvedValue(updatedConfig);
      jest.spyOn(service as any, 'validateConfigurationValue').mockImplementation();
      jest.spyOn(service as any, 'clearConfigurationCache').mockImplementation();

      // Act
      const result = await service.updateConfiguration(mockConfiguration.id, updateData, mockUserId);

      // Assert
      expect(result.value).toBe('updated_value');
      expect(result.updatedBy).toBe(mockUserId);
      expect(result.changeReason).toBe('Value update');
      expect(configRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('configuration.updated', expect.any(Object));
    });

    it('should throw NotFoundException if configuration not found', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateConfiguration('nonexistent', updateData))
        .rejects.toThrow(NotFoundException);
    });

    it('should encrypt sensitive values on update', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(mockSensitiveConfig);
      const encryptSpy = jest.spyOn(service as any, 'encryptValue').mockReturnValue('new_encrypted_value');
      configRepository.save.mockResolvedValue(mockSensitiveConfig);

      // Act
      await service.updateConfiguration(mockSensitiveConfig.id, updateData, mockUserId);

      // Assert
      expect(encryptSpy).toHaveBeenCalledWith('updated_value');
    });

    it('should refresh dependent configurations', async () => {
      // Arrange
      const configWithDependents = { ...mockConfiguration, affects: ['DEPENDENT_CONFIG'] };
      configRepository.findOne.mockResolvedValue(configWithDependents);
      configRepository.save.mockResolvedValue(configWithDependents);
      const refreshDependentsSpy = jest.spyOn(service as any, 'refreshDependentConfigurations').mockImplementation();

      // Act
      await service.updateConfiguration(configWithDependents.id, updateData, mockUserId);

      // Assert
      expect(refreshDependentsSpy).toHaveBeenCalledWith(['DEPENDENT_CONFIG']);
    });
  });

  describe('deleteConfiguration', () => {
    it('should soft delete configuration', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(mockConfiguration);
      const deletedConfig = { ...mockConfiguration, isActive: false, status: ConfigurationStatus.ARCHIVED };
      configRepository.save.mockResolvedValue(deletedConfig);
      jest.spyOn(service as any, 'clearConfigurationCache').mockImplementation();

      // Act
      await service.deleteConfiguration(mockConfiguration.id, mockUserId);

      // Assert
      expect(deletedConfig.isActive).toBe(false);
      expect(deletedConfig.status).toBe(ConfigurationStatus.ARCHIVED);
      expect(deletedConfig.updatedBy).toBe(mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('configuration.deleted', expect.any(Object));
    });

    it('should throw NotFoundException if configuration not found', async () => {
      // Arrange
      configRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteConfiguration('nonexistent', mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('isFeatureEnabled', () => {
    const featureKey = 'NEW_DASHBOARD_UI';

    it('should return true for enabled feature flag', async () => {
      // Arrange
      const featureConfig = {
        ...mockConfiguration,
        key: featureKey,
        featureFlag: true,
        value: 'true',
        getEffectiveValue: jest.fn(() => true),
      };
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([featureConfig]);

      // Act
      const result = await service.isFeatureEnabled(featureKey, mockTenantId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for disabled feature flag', async () => {
      // Arrange
      const featureConfig = {
        ...mockConfiguration,
        key: featureKey,
        featureFlag: true,
        value: 'false',
        getEffectiveValue: jest.fn(() => false),
      };
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([featureConfig]);

      // Act
      const result = await service.isFeatureEnabled(featureKey, mockTenantId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if feature flag config not found', async () => {
      // Arrange
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([]);

      // Act
      const result = await service.isFeatureEnabled(featureKey, mockTenantId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle gradual rollout based on percentage', async () => {
      // Arrange
      const featureConfig = {
        ...mockConfiguration,
        key: featureKey,
        featureFlag: true,
        featureFlagPercentage: 50, // 50% rollout
        getEffectiveValue: jest.fn(() => true),
      };
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([featureConfig]);
      
      // Mock crypto hash to return predictable result
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => '12345678'), // This will give percentage 0x12345678 % 100 = 48
      };
      mockCrypto.createHash = jest.fn(() => mockHash as any);

      // Act
      const result = await service.isFeatureEnabled(featureKey, mockTenantId, 'user-123');

      // Assert
      expect(result).toBe(true); // 48 < 50, so should be enabled
      expect(mockHash.update).toHaveBeenCalledWith(`${featureKey}:${mockTenantId}:user-123`);
    });
  });

  describe('validateConfigurationValue', () => {
    it('should validate required configuration', async () => {
      // Arrange
      const requiredConfig = { ...mockConfiguration, value: null, isRequired: true };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](requiredConfig))
        .toThrow(BadRequestException);
    });

    it('should validate number data type', () => {
      // Arrange
      const numberConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.NUMBER,
        value: '123.45',
        minValue: 100,
        maxValue: 200,
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](numberConfig))
        .not.toThrow();
    });

    it('should throw error for invalid number', () => {
      // Arrange
      const numberConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.NUMBER,
        value: 'not-a-number',
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](numberConfig))
        .toThrow(BadRequestException);
    });

    it('should validate number range', () => {
      // Arrange
      const numberConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.NUMBER,
        value: '50',
        minValue: 100,
        maxValue: 200,
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](numberConfig))
        .toThrow(BadRequestException);
    });

    it('should validate boolean data type', () => {
      // Arrange
      const booleanConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.BOOLEAN,
        value: 'true',
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](booleanConfig))
        .not.toThrow();
    });

    it('should throw error for invalid boolean', () => {
      // Arrange
      const booleanConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.BOOLEAN,
        value: 'maybe',
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](booleanConfig))
        .toThrow(BadRequestException);
    });

    it('should validate JSON data type', () => {
      // Arrange
      const jsonConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.JSON,
        value: '{"key": "value"}',
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](jsonConfig))
        .not.toThrow();
    });

    it('should throw error for invalid JSON', () => {
      // Arrange
      const jsonConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.JSON,
        value: '{invalid json}',
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](jsonConfig))
        .toThrow(BadRequestException);
    });

    it('should validate allowed values', () => {
      // Arrange
      const stringConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.STRING,
        value: 'EUR',
        allowedValues: ['GHS', 'USD', 'EUR'],
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](stringConfig))
        .not.toThrow();
    });

    it('should throw error for disallowed value', () => {
      // Arrange
      const stringConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.STRING,
        value: 'JPY',
        allowedValues: ['GHS', 'USD', 'EUR'],
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](stringConfig))
        .toThrow(BadRequestException);
    });

    it('should validate regex pattern', () => {
      // Arrange
      const stringConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.STRING,
        value: 'test@example.com',
        regexPattern: '^[^@]+@[^@]+\\.[^@]+$', // Email regex
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](stringConfig))
        .not.toThrow();
    });

    it('should throw error for regex pattern mismatch', () => {
      // Arrange
      const stringConfig = {
        ...mockConfiguration,
        dataType: ConfigurationDataType.STRING,
        value: 'not-an-email',
        regexPattern: '^[^@]+@[^@]+\\.[^@]+$', // Email regex
      };

      // Act & Assert
      expect(() => service['validateConfigurationValue'](stringConfig))
        .toThrow(BadRequestException);
    });
  });

  describe('resolveConfigurationValue', () => {
    it('should return value from highest priority active config', () => {
      // Arrange
      const systemConfig = { ...mockConfiguration, inheritanceLevel: 1, value: 'system_value' };
      const tenantConfig = { ...mockTenantConfig, inheritanceLevel: 2, value: 'tenant_value' };
      const configs = [systemConfig, tenantConfig];

      // Act
      const result = service['resolveConfigurationValue'](configs);

      // Assert
      expect(result).toBe('tenant_value'); // Higher priority
    });

    it('should skip inactive configurations', () => {
      // Arrange
      const activeConfig = { 
        ...mockConfiguration, 
        inheritanceLevel: 1, 
        status: ConfigurationStatus.ACTIVE,
        isActive: true,
        value: 'active_value',
        getEffectiveValue: () => 'active_value',
      };
      const inactiveConfig = { 
        ...mockTenantConfig, 
        inheritanceLevel: 2, 
        status: ConfigurationStatus.INACTIVE,
        isActive: false,
        value: 'inactive_value',
        getEffectiveValue: () => 'inactive_value',
      };
      const configs = [activeConfig, inactiveConfig];

      // Act
      const result = service['resolveConfigurationValue'](configs);

      // Assert
      expect(result).toBe('active_value'); // Only active config considered
    });

    it('should return null for empty config list', () => {
      // Act
      const result = service['resolveConfigurationValue']([]);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('encryptValue and decryptValue', () => {
    it('should encrypt and decrypt values correctly', () => {
      // Arrange
      const originalValue = 'secret_value';
      
      // Act
      const encrypted = service['encryptValue'](originalValue);
      const decrypted = service['decryptValue'](encrypted);

      // Assert
      expect(encrypted).toBe('encrypted_part_final');
      expect(decrypted).toBe('decrypted_part_final');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      configRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.getConfiguration('TEST_KEY', mockTenantId, undefined, false))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      mockCache.get.mockImplementation(() => { throw new Error('Cache error'); });
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([mockConfiguration]);
      jest.spyOn(service as any, 'resolveConfigurationValue').mockReturnValue('value');

      // Act - Should not throw, should fallback to database
      const result = await service.getConfiguration('TEST_KEY', mockTenantId);

      // Assert
      expect(result).toBe('value');
    });

    it('should handle encryption errors', () => {
      // Arrange
      const mockCipher = {
        update: jest.fn(() => { throw new Error('Encryption failed'); }),
        final: jest.fn(),
      };
      mockCrypto.createCipher = jest.fn(() => mockCipher as any);

      // Act & Assert
      expect(() => service['encryptValue']('test'))
        .toThrow('Encryption failed');
    });

    it('should handle decryption errors', () => {
      // Arrange
      const mockDecipher = {
        update: jest.fn(() => { throw new Error('Decryption failed'); }),
        final: jest.fn(),
      };
      mockCrypto.createDecipher = jest.fn(() => mockDecipher as any);

      // Act & Assert
      expect(() => service['decryptValue']('encrypted_value'))
        .toThrow('Decryption failed');
    });
  });

  describe('Performance Tests', () => {
    it('should efficiently handle bulk configuration updates', async () => {
      // Arrange
      const updates = Array.from({ length: 100 }, (_, i) => ({
        id: `config-${i}`,
        value: `value-${i}`,
        changeReason: `Update ${i}`,
      }));

      configRepository.findOne.mockResolvedValue(mockConfiguration);
      configRepository.save.mockResolvedValue(mockConfiguration);
      jest.spyOn(service as any, 'validateConfigurationValue').mockImplementation();

      const startTime = Date.now();

      // Act
      const results = await service.bulkUpdateConfigurations(updates, mockUserId);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert
      expect(results).toHaveLength(100);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent configuration access', async () => {
      // Arrange
      const configKey = 'TEST_CONFIG';
      mockCache.get.mockReturnValue(undefined);
      jest.spyOn(service as any, 'getConfigurationHierarchy').mockResolvedValue([mockConfiguration]);
      jest.spyOn(service as any, 'resolveConfigurationValue').mockReturnValue('test_value');

      const concurrentRequests = Array(20).fill(null).map(() => 
        service.getConfiguration(configKey, mockTenantId)
      );

      // Act
      const results = await Promise.all(concurrentRequests);

      // Assert
      expect(results).toHaveLength(20);
      results.forEach(result => expect(result).toBe('test_value'));
    });
  });

  describe('Cron Jobs', () => {
    it('should refresh cache for real-time configurations', async () => {
      // Arrange
      const realTimeConfigs = [
        { ...mockConfiguration, refreshFrequency: 'REAL_TIME' },
        { ...mockTenantConfig, refreshFrequency: 'REAL_TIME' },
      ];
      configRepository.find.mockResolvedValue(realTimeConfigs);

      // Act
      await service.refreshCache();

      // Assert
      expect(configRepository.find).toHaveBeenCalledWith({
        where: {
          isActive: true,
          status: ConfigurationStatus.ACTIVE,
          refreshFrequency: 'REAL_TIME',
        },
      });
      expect(mockCache.set).toHaveBeenCalledTimes(realTimeConfigs.length);
    });
  });
});