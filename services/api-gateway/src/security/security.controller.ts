import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Security')
@Controller('security')
@UseGuards(ThrottlerGuard)
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get('policy')
  @ApiOperation({ summary: 'Get current security policy' })
  @ApiResponse({ status: 200, description: 'Security policy retrieved' })
  getSecurityPolicy() {
    const policy = this.securityService.getSecurityPolicy();
    // Remove sensitive information before sending
    return {
      rateLimits: {
        windowMs: policy.rateLimits.windowMs,
        max: policy.rateLimits.max,
      },
      cors: {
        methods: policy.cors.methods,
        allowedHeaders: policy.cors.allowedHeaders,
      },
      headers: Object.keys(policy.headers),
    };
  }

  @Post('api-key/generate')
  @ApiOperation({ summary: 'Generate new API key' })
  @ApiResponse({ status: 201, description: 'API key generated successfully' })
  @ApiBearerAuth()
  generateApiKey(@Body() body: { userId: string }) {
    const apiKey = this.securityService.generateApiKey(body.userId);
    
    return {
      apiKey,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      usage: 'Include in x-api-key header for requests',
    };
  }

  @Post('api-key/validate')
  @ApiOperation({ summary: 'Validate API key' })
  @ApiResponse({ status: 200, description: 'API key validation result' })
  validateApiKey(@Body() body: { apiKey: string }) {
    const result = this.securityService.validateApiKey(body.apiKey);
    
    return {
      valid: !!result,
      userId: result?.userId,
      timestamp: result?.timestamp,
    };
  }

  @Post('sanitize')
  @ApiOperation({ summary: 'Sanitize user input for security' })
  @ApiResponse({ status: 200, description: 'Input sanitized successfully' })
  sanitizeInput(@Body() body: { input: any }) {
    const sanitized = this.securityService.sanitizeUserInput(body.input);
    
    return {
      original: body.input,
      sanitized,
    };
  }

  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token generated' })
  getCSRFToken(@Req() req: any) {
    const token = this.securityService.generateCSRFToken();
    
    // Store token in session for validation
    req.session = req.session || {};
    req.session.csrfToken = token;
    
    return {
      token,
      usage: 'Include in x-csrf-token header for state-changing requests',
    };
  }

  @Get('health/security')
  @ApiOperation({ summary: 'Security health check' })
  @ApiResponse({ status: 200, description: 'Security health status' })
  getSecurityHealth(@Req() req: any) {
    const headers = req.headers;
    const hasSecureHeaders = {
      hasAuthorization: !!headers.authorization,
      hasApiKey: !!headers['x-api-key'],
      hasTraceId: !!headers['x-trace-id'],
      hasUserAgent: !!headers['user-agent'],
      isSecureTransport: req.secure || headers['x-forwarded-proto'] === 'https',
    };

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      security: hasSecureHeaders,
      environment: process.env.NODE_ENV,
    };
  }
}