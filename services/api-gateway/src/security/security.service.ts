import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import helmet from 'helmet';

export interface SecurityPolicy {
  rateLimits: {
    windowMs: number;
    max: number;
    message: string;
  };
  cors: {
    origin: string | string[] | boolean;
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  csp: {
    directives: Record<string, string[]>;
  };
  headers: Record<string, string>;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private configService: ConfigService) {}

  getSecurityPolicy(): SecurityPolicy {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    return {
      rateLimits: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 1000 : 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later',
      },
      cors: {
        origin: isDevelopment 
          ? ['http://localhost:3000', 'http://localhost:3001']
          : this.configService.get('ALLOWED_ORIGINS', '').split(','),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'x-trace-id',
          'x-span-id',
          'x-parent-span-id',
          'x-api-version',
          'x-client-version',
        ],
        credentials: true,
      },
      csp: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          'font-src': ["'self'", 'fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'none'"],
        },
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
    };
  }

  generateApiKey(userId: string): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const payload = `${userId}:${timestamp}:${random}`;
    return Buffer.from(payload).toString('base64');
  }

  validateApiKey(apiKey: string): { userId: string; timestamp: number } | null {
    try {
      const payload = Buffer.from(apiKey, 'base64').toString('utf8');
      const [userId, timestamp] = payload.split(':');
      
      // Check if API key is not too old (24 hours)
      const keyAge = Date.now() - parseInt(timestamp);
      if (keyAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return { userId, timestamp: parseInt(timestamp) };
    } catch (error) {
      this.logger.warn('Invalid API key format', { apiKey: apiKey.substring(0, 10) + '...' });
      return null;
    }
  }

  sanitizeUserInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeUserInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeUserInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  encryptSensitiveData(data: string): string {
    const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-please!';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptSensitiveData(encryptedData: string): string {
    const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-32-chars-long-please!';
    const [_ivHex, encrypted] = encryptedData.split(':');
    // const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  createSecurityHeaders() {
    const policy = this.getSecurityPolicy();
    return helmet({
      contentSecurityPolicy: {
        directives: policy.csp.directives,
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });
  }

  logSecurityEvent(event: string, details: any, request?: any) {
    this.logger.warn(`Security Event: ${event}`, {
      event,
      details,
      ip: request?.ip,
      userAgent: request?.headers?.['user-agent'],
      traceId: request?.traceId,
      timestamp: new Date().toISOString(),
    });
  }
}