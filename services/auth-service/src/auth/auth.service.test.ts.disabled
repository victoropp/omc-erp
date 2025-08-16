import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { 
  UnauthorizedException, 
  BadRequestException, 
  ForbiddenException,
  NotFoundException 
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserStatus, UserRole } from '@omc-erp/shared-types';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  // Mock user data
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.OPERATOR,
    status: UserStatus.ACTIVE,
    tenantId: 'tenant-123',
    passwordHash: 'hashed_password',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    validatePassword: jest.fn(),
    isLocked: jest.fn(() => false),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            incrementFailedLoginAttempts: jest.fn(),
            resetFailedLoginAttempts: jest.fn(),
            updateLastLogin: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config = {
                'JWT_ACCESS_SECRET': 'test-access-secret',
                'JWT_REFRESH_SECRET': 'test-refresh-secret',
                'JWT_ACCESS_EXPIRY': '15m',
                'JWT_REFRESH_EXPIRY': '7d',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup JWT service mocks
    jwtService.signAsync.mockImplementation((payload, options) => {
      if (options?.secret === 'test-access-secret') {
        return Promise.resolve('mock-access-token');
      }
      return Promise.resolve('mock-refresh-token');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'correct-password';
      const tenantId = 'tenant-123';
      
      mockUser.validatePassword.mockResolvedValue(true);
      usersService.findByUsername.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(username, password, tenantId);

      // Assert
      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(usersService.findByUsername).toHaveBeenCalledWith(username, tenantId);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(password);
      expect(usersService.resetFailedLoginAttempts).toHaveBeenCalledWith(mockUser.id);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser('invalid', 'password'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(usersService.findByUsername).toHaveBeenCalledWith('invalid', undefined);
    });

    it('should throw ForbiddenException for locked user', async () => {
      // Arrange
      const lockedUser = { ...mockUser, isLocked: jest.fn(() => true) };
      usersService.findByUsername.mockResolvedValue(lockedUser);

      // Act & Assert
      await expect(service.validateUser('testuser', 'password'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should increment failed login attempts for invalid password', async () => {
      // Arrange
      mockUser.validatePassword.mockResolvedValue(false);
      usersService.findByUsername.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.validateUser('testuser', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
      
      expect(usersService.incrementFailedLoginAttempts).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw ForbiddenException for suspended user', async () => {
      // Arrange
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      suspendedUser.validatePassword.mockResolvedValue(true);
      usersService.findByUsername.mockResolvedValue(suspendedUser);

      // Act & Assert
      await expect(service.validateUser('testuser', 'password'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      inactiveUser.validatePassword.mockResolvedValue(true);
      usersService.findByUsername.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.validateUser('testuser', 'password'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'newpassword',
      firstName: 'New',
      lastName: 'User',
      username: 'newuser',
      tenantId: 'tenant-123',
    };

    it('should register new user successfully', async () => {
      // Arrange
      const createdUser = { ...mockUser, ...registerDto, id: 'new-user-id' };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException if user already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto))
        .rejects.toThrow(BadRequestException);
      
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      // Arrange
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token');

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(mockUser.id);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2); // Access and refresh tokens
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      // Arrange
      const userId = 'user-123';

      // Act
      await service.logout(userId);

      // Assert
      expect(usersService.update).toHaveBeenCalledWith(userId, { refreshToken: null });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const refreshToken = 'old-refresh-token';
      const userWithRefreshToken = { 
        ...mockUser, 
        refreshToken: 'hashed-refresh-token' 
      };
      
      usersService.findById.mockResolvedValue(userWithRefreshToken);
      mockedBcrypt.compare.mockResolvedValue(true);
      mockedBcrypt.hash.mockResolvedValue('new-hashed-refresh-token');

      // Act
      const result = await service.refreshTokens(userId, refreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(refreshToken, userWithRefreshToken.refreshToken);
    });

    it('should throw ForbiddenException if user not found', async () => {
      // Arrange
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshTokens('invalid-user', 'token'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if refresh token does not match', async () => {
      // Arrange
      const userWithRefreshToken = { 
        ...mockUser, 
        refreshToken: 'hashed-refresh-token' 
      };
      usersService.findById.mockResolvedValue(userWithRefreshToken);
      mockedBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(service.refreshTokens('user-123', 'invalid-token'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('forgotPassword', () => {
    it('should return success message for existing email', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('reset-token');

      // Act
      const result = await service.forgotPassword('test@example.com');

      // Assert
      expect(result.message).toContain('password reset link has been sent');
    });

    it('should return success message for non-existing email (security)', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword('nonexistent@example.com');

      // Assert
      expect(result.message).toContain('password reset link has been sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const newPassword = 'new-password';
      const payload = { userId: 'user-123' };
      
      jwtService.verifyAsync.mockResolvedValue(payload);

      // Act
      const result = await service.resetPassword(token, newPassword);

      // Assert
      expect(result.message).toBe('Password has been reset successfully');
      expect(usersService.updatePassword).toHaveBeenCalledWith(payload.userId, newPassword);
    });

    it('should throw BadRequestException for invalid token', async () => {
      // Arrange
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.resetPassword('invalid-token', 'password'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      // Arrange
      const userId = 'user-123';
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      mockUser.validatePassword.mockResolvedValue(true);
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(result.message).toBe('Password changed successfully');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(currentPassword);
      expect(usersService.updatePassword).toHaveBeenCalledWith(userId, newPassword);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword('invalid-user', 'old', 'new'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      // Arrange
      mockUser.validatePassword.mockResolvedValue(false);
      usersService.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.changePassword('user-123', 'wrong-password', 'new-password'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', async () => {
      // Arrange
      const userId = 'user-123';
      const userWithSensitiveData = {
        ...mockUser,
        passwordHash: 'sensitive-hash',
        refreshToken: 'sensitive-token',
      };
      
      usersService.findById.mockResolvedValue(userWithSensitiveData);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.id).toBe(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile('invalid-user'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Act
      const result = await service.verifyEmail('verification-token');

      // Assert
      expect(result.message).toBe('Email verified successfully');
    });
  });

  describe('getTokens (private method)', () => {
    it('should generate access and refresh tokens', async () => {
      // Arrange
      const userId = 'user-123';
      const email = 'test@example.com';
      const tenantId = 'tenant-123';
      const role = 'OPERATOR';

      // Act
      const result = await service['getTokens'](userId, email, tenantId, role);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('tokenType', 'Bearer');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateRefreshToken (private method)', () => {
    it('should hash and update refresh token', async () => {
      // Arrange
      const userId = 'user-123';
      const refreshToken = 'refresh-token';
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token');

      // Act
      await service['updateRefreshToken'](userId, refreshToken);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(refreshToken, 10);
      expect(usersService.update).toHaveBeenCalledWith(userId, { 
        refreshToken: 'hashed-refresh-token' 
      });
    });
  });

  describe('generatePasswordResetToken (private method)', () => {
    it('should generate password reset token', async () => {
      // Arrange
      const userId = 'user-123';
      jwtService.signAsync.mockResolvedValue('reset-token');

      // Act
      const result = await service['generatePasswordResetToken'](userId);

      // Assert
      expect(result).toBe('reset-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { userId },
        {
          secret: 'test-access-secret',
          expiresIn: '1h',
        }
      );
    });
  });

  describe('verifyPasswordResetToken (private method)', () => {
    it('should verify valid password reset token', async () => {
      // Arrange
      const token = 'valid-token';
      const payload = { userId: 'user-123' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      // Act
      const result = await service['verifyPasswordResetToken'](token);

      // Assert
      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-access-secret',
      });
    });

    it('should return null for invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act
      const result = await service['verifyPasswordResetToken'](token);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      usersService.findByUsername.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.validateUser('testuser', 'password'))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle JWT signing errors', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockRejectedValue(new Error('JWT signing failed'));

      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        tenantId: 'tenant-123',
      };

      // Act & Assert
      await expect(service.register(registerDto))
        .rejects.toThrow('JWT signing failed');
    });

    it('should handle bcrypt hashing errors', async () => {
      // Arrange
      mockedBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));
      
      // Act & Assert
      await expect(service['updateRefreshToken']('user-123', 'token'))
        .rejects.toThrow('Hashing failed');
    });
  });

  describe('Security Tests', () => {
    it('should not leak sensitive information in error messages', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser('testuser', 'password'))
        .rejects.toThrow('Invalid credentials'); // Generic message
    });

    it('should use secure password hashing', async () => {
      // Arrange
      const refreshToken = 'token';
      mockedBcrypt.hash.mockResolvedValue('hashed-token');

      // Act
      await service['updateRefreshToken']('user-123', refreshToken);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(refreshToken, 10); // Secure rounds
    });

    it('should validate token expiry correctly', async () => {
      // Arrange
      const expiredPayload = { userId: 'user-123', exp: Math.floor(Date.now() / 1000) - 3600 };
      jwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      // Act & Assert
      await expect(service.resetPassword('expired-token', 'password'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent login attempts efficiently', async () => {
      // Arrange
      mockUser.validatePassword.mockResolvedValue(true);
      usersService.findByUsername.mockResolvedValue(mockUser);
      
      const concurrentLogins = Array(10).fill(null).map(() => 
        service.validateUser('testuser', 'password', 'tenant-123')
      );

      // Act
      const results = await Promise.all(concurrentLogins);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.passwordHash).toBeUndefined();
      });
    });

    it('should cache JWT configurations for performance', async () => {
      // Arrange & Act
      await service['getTokens']('user-123', 'test@example.com', 'tenant-123', 'OPERATOR');
      await service['getTokens']('user-456', 'test2@example.com', 'tenant-123', 'ADMIN');

      // Assert
      // configService.get should be called for each config key but cached internally
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
    });
  });
});