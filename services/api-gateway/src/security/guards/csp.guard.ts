import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from '../security.service';

@Injectable()
export class CSPGuard implements CanActivate {
  constructor(private securityService: SecurityService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const response = context.switchToHttp().getResponse();
    
    const policy = this.securityService.getSecurityPolicy();

    // Set Content Security Policy header
    const cspDirectives = Object.entries(policy.csp.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    response.header('Content-Security-Policy', cspDirectives);

    // Set additional security headers
    Object.entries(policy.headers).forEach(([header, value]) => {
      response.header(header, value);
    });

    return true;
  }
}