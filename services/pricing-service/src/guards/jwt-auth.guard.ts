import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    // Mock JWT validation - in real implementation, would validate with JWT library
    if (token === 'mock-valid-token' || token.startsWith('Bearer ')) {
      // Add user info to request
      request.user = {
        id: 'user-123',
        username: 'api-user',
        roles: ['pricing-admin']
      };
      return true;
    }

    throw new UnauthorizedException('Invalid access token');
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}