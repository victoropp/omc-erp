import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from '../security.service';

@Injectable()
export class CorsGuard implements CanActivate {
  constructor(private securityService: SecurityService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const policy = this.securityService.getSecurityPolicy();
    const origin = request.headers.origin;

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      this.setCorsHeaders(response, policy, origin);
      response.status(200).end();
      return false; // Don't continue with the request
    }

    // Set CORS headers for actual requests
    this.setCorsHeaders(response, policy, origin);

    return true;
  }

  private setCorsHeaders(response: any, policy: any, origin: string) {
    // Check if origin is allowed
    const allowedOrigins = Array.isArray(policy.cors.origin) 
      ? policy.cors.origin 
      : [policy.cors.origin];

    if (policy.cors.origin === true || allowedOrigins.includes(origin)) {
      response.header('Access-Control-Allow-Origin', origin);
    }

    response.header('Access-Control-Allow-Methods', policy.cors.methods.join(', '));
    response.header('Access-Control-Allow-Headers', policy.cors.allowedHeaders.join(', '));
    response.header('Access-Control-Allow-Credentials', policy.cors.credentials.toString());
    response.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
}