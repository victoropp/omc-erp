import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface MfaVerificationResult {
  isValid: boolean;
  backupCodeUsed?: boolean;
  remainingBackupCodes?: number;
}

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly backupCodeLength = 8;
  private readonly backupCodesCount = 10;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async generateMfaSetup(userId: string, userEmail: string): Promise<MfaSetupResponse> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `OMC ERP (${userEmail})`,
      issuer: 'OMC ERP System',
      length: 32,
    });

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store setup data temporarily (10 minutes)
    await this.cacheManager.set(
      `mfa_setup:${userId}`,
      {
        secret: secret.base32,
        backupCodes,
        userEmail,
        timestamp: Date.now(),
      },
      10 * 60 * 1000 // 10 minutes
    );

    this.logger.log(`MFA setup initiated for user ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
      qrCodeDataUrl,
      backupCodes,
    };
  }

  async verifyMfaSetup(userId: string, token: string): Promise<{ secret: string; backupCodes: string[] }> {
    const setupData = await this.cacheManager.get(`mfa_setup:${userId}`) as any;
    
    if (!setupData) {
      throw new BadRequestException('MFA setup session expired or not found');
    }

    // Verify the TOTP token
    const isValid = speakeasy.totp.verify({
      secret: setupData.secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps tolerance
    });

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP token');
    }

    // Clear the setup cache
    await this.cacheManager.del(`mfa_setup:${userId}`);

    this.logger.log(`MFA setup completed for user ${userId}`);

    return {
      secret: setupData.secret,
      backupCodes: setupData.backupCodes,
    };
  }

  async verifyMfaToken(
    secret: string,
    token: string,
    backupCodes?: string[]
  ): Promise<MfaVerificationResult> {
    // First try TOTP verification
    const isValidTotp = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (isValidTotp) {
      return {
        isValid: true,
        backupCodeUsed: false,
      };
    }

    // If TOTP fails, try backup codes
    if (backupCodes && backupCodes.length > 0) {
      const normalizedToken = token.toUpperCase().replace(/\s/g, '');
      const codeIndex = backupCodes.indexOf(normalizedToken);
      
      if (codeIndex !== -1) {
        return {
          isValid: true,
          backupCodeUsed: true,
          remainingBackupCodes: backupCodes.length - 1,
        };
      }
    }

    return { isValid: false };
  }

  async generateNewBackupCodes(): Promise<string[]> {
    return this.generateBackupCodes();
  }

  async createMfaSession(userId: string, deviceInfo?: any): Promise<string> {
    const sessionId = uuidv4();
    const sessionData = {
      userId,
      deviceInfo,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };

    await this.cacheManager.set(
      `mfa_session:${sessionId}`,
      sessionData,
      5 * 60 * 1000 // 5 minutes
    );

    return sessionId;
  }

  async getMfaSession(sessionId: string): Promise<any> {
    return this.cacheManager.get(`mfa_session:${sessionId}`);
  }

  async completeMfaSession(sessionId: string): Promise<void> {
    await this.cacheManager.del(`mfa_session:${sessionId}`);
  }

  async createTrustedDevice(userId: string, deviceFingerprint: string): Promise<string> {
    const deviceId = uuidv4();
    const deviceData = {
      userId,
      fingerprint: deviceFingerprint,
      createdAt: new Date(),
      lastUsed: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    await this.cacheManager.set(
      `trusted_device:${deviceId}`,
      deviceData,
      30 * 24 * 60 * 60 * 1000 // 30 days
    );

    this.logger.log(`Trusted device created for user ${userId}`);
    return deviceId;
  }

  async isTrustedDevice(deviceId: string, deviceFingerprint: string): Promise<boolean> {
    const deviceData = await this.cacheManager.get(`trusted_device:${deviceId}`) as any;
    
    if (!deviceData) {
      return false;
    }

    // Check if device fingerprint matches and hasn't expired
    if (deviceData.fingerprint === deviceFingerprint && new Date() < new Date(deviceData.expiresAt)) {
      // Update last used timestamp
      deviceData.lastUsed = new Date();
      await this.cacheManager.set(
        `trusted_device:${deviceId}`,
        deviceData,
        30 * 24 * 60 * 60 * 1000
      );
      
      return true;
    }

    return false;
  }

  async revokeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    const deviceData = await this.cacheManager.get(`trusted_device:${deviceId}`) as any;
    
    if (deviceData && deviceData.userId === userId) {
      await this.cacheManager.del(`trusted_device:${deviceId}`);
      this.logger.log(`Trusted device ${deviceId} revoked for user ${userId}`);
    }
  }

  async getUserTrustedDevices(_userId: string): Promise<any[]> {
    // This is a simplified implementation
    // In production, you'd need a more efficient way to query trusted devices by userId
    const devices: any[] = [];
    
    // This would require a more sophisticated caching strategy or database storage
    // For now, return empty array
    return devices;
  }

  generateDeviceFingerprint(request: any): string {
    const userAgent = request.headers['user-agent'] || '';
    const acceptLanguage = request.headers['accept-language'] || '';
    const acceptEncoding = request.headers['accept-encoding'] || '';
    
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + acceptLanguage + acceptEncoding)
      .digest('hex');
    
    return fingerprint;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.backupCodesCount; i++) {
      // Generate 8-character codes with letters and numbers
      let code = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      
      for (let j = 0; j < this.backupCodeLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      codes.push(code);
    }
    
    return codes;
  }

  async sendMfaNotification(userId: string, method: 'sms' | 'email', code?: string): Promise<void> {
    // This would integrate with SMS/Email services
    // For now, just log the notification
    
    if (method === 'sms') {
      this.logger.log(`SMS MFA code would be sent to user ${userId}: ${code}`);
    } else if (method === 'email') {
      this.logger.log(`Email MFA code would be sent to user ${userId}: ${code}`);
    }
  }

  generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  async storeSmsCode(userId: string, code: string, phoneNumber: string): Promise<void> {
    await this.cacheManager.set(
      `sms_code:${userId}`,
      {
        code,
        phoneNumber,
        createdAt: new Date(),
      },
      5 * 60 * 1000 // 5 minutes
    );
  }

  async verifySmsCode(userId: string, code: string): Promise<boolean> {
    const storedData = await this.cacheManager.get(`sms_code:${userId}`) as any;
    
    if (!storedData) {
      return false;
    }

    const isValid = storedData.code === code;
    
    if (isValid) {
      // Remove the code after successful verification
      await this.cacheManager.del(`sms_code:${userId}`);
    }
    
    return isValid;
  }

  async getMfaRecoveryCodes(_userId: string): Promise<string[]> {
    // This would typically fetch from database
    // For now, return empty array
    return [];
  }

  async invalidateAllMfaSessions(userId: string): Promise<void> {
    // This would remove all MFA-related cache entries for the user
    // Implementation would depend on your caching strategy
    
    this.logger.log(`All MFA sessions invalidated for user ${userId}`);
  }
}