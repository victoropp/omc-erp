import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException, 
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // In production, verify the JWT token properly
      // For now, we'll do basic validation
      const payload = jwt.decode(token);
      
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add user info to request for downstream services
      request['user'] = payload;
      request.headers['x-user-id'] = payload['sub'] || payload['userId'];
      request.headers['x-user-role'] = payload['role'] || 'user';
      
      return true;
    } catch (error: any) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// Decorator to mark routes as public
export const Public = () => (target: any, _key?: string, descriptor?: PropertyDescriptor) => {
  if (descriptor) {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
  } else {
    Reflect.defineMetadata('isPublic', true, target);
  }
};