import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ServiceTokenPayload } from '../interfaces';

export const SERVICE_PERMISSIONS_KEY = 'servicePermissions';
export const SERVICE_AUTH_OPTIONAL_KEY = 'serviceAuthOptional';

export const ServicePermissions = (...permissions: string[]) => 
  SetMetadata(SERVICE_PERMISSIONS_KEY, permissions);

export const ServiceAuthOptional = () => 
  SetMetadata(SERVICE_AUTH_OPTIONAL_KEY, true);

interface ServiceAuthenticatedRequest extends Request {
  serviceAuth?: {
    serviceId: string;
    serviceName: string;
    permissions: string[];
    environment: string;
    tokenPayload: ServiceTokenPayload;
  };
  headers: Record<string, string>;
}

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly logger = new Logger(ServiceAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      SERVICE_AUTH_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      SERVICE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<ServiceAuthenticatedRequest>();
    
    try {
      // Extract service token from headers
      const serviceToken = this.extractServiceToken(request);
      
      if (!serviceToken) {
        if (isOptional) {
          return true;
        }
        throw new UnauthorizedException('Service token required');
      }

      // Validate and decode token
      const tokenPayload = await this.validateServiceToken(serviceToken);
      
      // Attach service auth info to request
      request.serviceAuth = {
        serviceId: tokenPayload.sub,
        serviceName: tokenPayload.serviceName,
        permissions: tokenPayload.permissions,
        environment: tokenPayload.environment,
        tokenPayload,
      };

      // Check permissions if required
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = this.checkPermissions(tokenPayload.permissions, requiredPermissions);
        if (!hasPermission) {
          throw new ForbiddenException('Insufficient service permissions');
        }
      }

      // Log successful authentication
      this.logger.debug(`Service authenticated: ${tokenPayload.serviceName} (${tokenPayload.sub})`);
      
      return true;
    } catch (error) {
      if (isOptional) {
        this.logger.debug(`Optional service auth failed: ${error.message}`);
        return true;
      }

      this.logger.error(`Service authentication failed: ${error.message}`, {
        path: request.url,
        method: request.method,
        serviceToken: this.extractServiceToken(request) ? 'present' : 'missing',
      });

      throw error;
    }
  }

  private extractServiceToken(request: ServiceAuthenticatedRequest): string | null {
    // Try multiple header formats
    const authHeader = request.headers['authorization'];
    const serviceTokenHeader = request.headers['x-service-token'];
    const directToken = request.headers['service-token'];

    if (authHeader && authHeader.startsWith('ServiceBearer ')) {
      return authHeader.substring(14);
    }

    if (serviceTokenHeader) {
      return serviceTokenHeader;
    }

    if (directToken) {
      return directToken;
    }

    return null;
  }

  private async validateServiceToken(token: string): Promise<ServiceTokenPayload> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SERVICE_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT service secret not configured');
      }

      const payload = jwt.verify(token, jwtSecret) as ServiceTokenPayload;
      
      // Validate token structure
      if (!this.isValidTokenPayload(payload)) {
        throw new Error('Invalid token payload structure');
      }

      // Check environment match
      const currentEnv = this.configService.get<string>('NODE_ENV', 'development');
      if (payload.environment !== currentEnv) {
        throw new Error('Environment mismatch');
      }

      // Check token expiration with grace period
      const now = Math.floor(Date.now() / 1000);
      const gracePeriod = 60; // 60 seconds grace period
      if (payload.exp < (now - gracePeriod)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Service token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid service token format');
      } else {
        throw new UnauthorizedException(`Token validation failed: ${error.message}`);
      }
    }
  }

  private isValidTokenPayload(payload: any): payload is ServiceTokenPayload {
    return payload &&
           typeof payload.sub === 'string' &&
           typeof payload.serviceName === 'string' &&
           Array.isArray(payload.permissions) &&
           typeof payload.environment === 'string' &&
           typeof payload.iat === 'number' &&
           typeof payload.exp === 'number' &&
           typeof payload.iss === 'string' &&
           typeof payload.aud === 'string';
  }

  private checkPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    // Check for admin or wildcard permissions
    if (userPermissions.includes('*') || userPermissions.includes('admin')) {
      return true;
    }

    // Check each required permission
    return requiredPermissions.every(required => {
      // Exact match
      if (userPermissions.includes(required)) {
        return true;
      }

      // Wildcard match (e.g., 'transactions:*' matches 'transactions:read')
      const [resource] = required.split(':');
      if (userPermissions.includes(`${resource}:*`)) {
        return true;
      }

      return false;
    });
  }
}

// Export helper decorators for common permission patterns
export const ReadPermission = (resource: string) => ServicePermissions(`${resource}:read`);
export const WritePermission = (resource: string) => ServicePermissions(`${resource}:create`, `${resource}:update`);
export const DeletePermission = (resource: string) => ServicePermissions(`${resource}:delete`);
export const FullPermission = (resource: string) => ServicePermissions(`${resource}:*`);

// Helper function to get service auth from request
export function getServiceAuth(request: any): ServiceTokenPayload | null {
  return request.serviceAuth?.tokenPayload || null;
}

// Helper function to check if service has specific permission
export function hasServicePermissionInRequest(request: any, permission: string): boolean {
  const serviceAuth = getServiceAuth(request);
  if (!serviceAuth) return false;

  return serviceAuth.permissions.includes(permission) ||
         serviceAuth.permissions.includes('*') ||
         serviceAuth.permissions.includes('admin');
}