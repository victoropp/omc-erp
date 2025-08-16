import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ServiceAuthService } from './service-auth.service';
import {
  ServiceApiKey,
  ServiceAuthRequest,
  ServiceAuthResponse,
  ServiceIdentity,
} from '../../../packages/shared-types/src/interfaces';

@ApiTags('Service Authentication')
@Controller('service-auth')
@UseGuards(ThrottlerGuard)
export class ServiceAuthController {
  private readonly logger = new Logger(ServiceAuthController.name);

  constructor(private readonly serviceAuthService: ServiceAuthService) {}

  @Post('generate-api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate API key for a service' })
  @ApiResponse({ status: 201, description: 'API key generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string', example: 'transaction-service' },
        environment: { type: 'string', example: 'development' },
        permissions: { type: 'array', items: { type: 'string' }, example: ['transactions:*'] },
      },
      required: ['serviceName'],
    },
  })
  async generateApiKey(
    @Body() body: { serviceName: string; environment?: string; permissions?: string[] }
  ): Promise<{ success: boolean; apiKey?: ServiceApiKey; error?: string }> {
    try {
      this.logger.log(`Generating API key for service: ${body.serviceName}`);
      
      const apiKey = await this.serviceAuthService.generateApiKey(body.serviceName);
      
      this.logger.log(`API key generated successfully for ${body.serviceName}`);
      return {
        success: true,
        apiKey,
      };
    } catch (error) {
      this.logger.error(`Failed to generate API key for ${body.serviceName}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate service and get access token' })
  @ApiResponse({ status: 200, description: 'Service authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceId: { type: 'string', example: 'srv_1234567890_abcdef12' },
        apiKey: { type: 'string', example: 'omc_sk_1234567890abcdef...' },
        targetService: { type: 'string', example: 'accounting-service' },
        operation: { type: 'string', example: 'create_journal_entry' },
      },
      required: ['serviceId', 'apiKey'],
    },
  })
  async authenticateService(@Body() request: ServiceAuthRequest): Promise<ServiceAuthResponse> {
    try {
      this.logger.debug(`Authenticating service: ${request.serviceId}`);
      
      const response = await this.serviceAuthService.authenticateService(request);
      
      if (response.success) {
        this.logger.log(`Service authenticated successfully: ${request.serviceId}`);
      } else {
        this.logger.warn(`Service authentication failed: ${request.serviceId} - ${response.error}`);
      }
      
      return response;
    } catch (error) {
      this.logger.error(`Service authentication error for ${request.serviceId}:`, error);
      return {
        success: false,
        error: 'Authentication service error',
      };
    }
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate service token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['token'],
    },
  })
  async validateToken(
    @Body() body: { token: string }
  ): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
      const payload = await this.serviceAuthService.validateServiceToken(body.token);
      
      if (payload) {
        return {
          valid: true,
          payload,
        };
      } else {
        return {
          valid: false,
          error: 'Invalid or expired token',
        };
      }
    } catch (error) {
      this.logger.error('Token validation error:', error);
      return {
        valid: false,
        error: 'Token validation failed',
      };
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh service token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token for refresh' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['token'],
    },
  })
  async refreshToken(
    @Body() body: { token: string }
  ): Promise<{ success: boolean; newToken?: string; expiresIn?: number; error?: string }> {
    try {
      const newToken = await this.serviceAuthService.refreshServiceToken(body.token);
      
      return {
        success: true,
        newToken,
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('validate-api-key/:apiKey')
  @ApiOperation({ summary: 'Validate API key and get service identity' })
  @ApiResponse({ status: 200, description: 'API key validation result' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async validateApiKey(
    @Param('apiKey') apiKey: string
  ): Promise<{ valid: boolean; serviceIdentity?: ServiceIdentity; error?: string }> {
    try {
      const serviceIdentity = await this.serviceAuthService.validateApiKey(apiKey);
      
      if (serviceIdentity) {
        return {
          valid: true,
          serviceIdentity,
        };
      } else {
        return {
          valid: false,
          error: 'Invalid or inactive API key',
        };
      }
    } catch (error) {
      this.logger.error('API key validation error:', error);
      return {
        valid: false,
        error: 'API key validation failed',
      };
    }
  }

  @Delete('revoke-api-key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 204, description: 'API key revoked successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string', example: 'omc_sk_1234567890abcdef...' },
      },
      required: ['apiKey'],
    },
  })
  async revokeApiKey(@Body() body: { apiKey: string }): Promise<void> {
    try {
      await this.serviceAuthService.revokeApiKey(body.apiKey);
      this.logger.log(`API key revoked successfully`);
    } catch (error) {
      this.logger.error('Failed to revoke API key:', error);
      throw error;
    }
  }

  @Post('bulk-generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate API keys for multiple services' })
  @ApiResponse({ status: 201, description: 'API keys generated successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              serviceName: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } },
            },
            required: ['serviceName'],
          },
          example: [
            { serviceName: 'transaction-service', permissions: ['transactions:*'] },
            { serviceName: 'accounting-service', permissions: ['accounting:*'] },
          ],
        },
      },
      required: ['services'],
    },
  })
  async bulkGenerateApiKeys(
    @Body() body: { services: Array<{ serviceName: string; permissions?: string[] }> }
  ): Promise<{ success: boolean; results: Array<{ serviceName: string; apiKey?: ServiceApiKey; error?: string }> }> {
    const results = [];

    for (const serviceConfig of body.services) {
      try {
        const apiKey = await this.serviceAuthService.generateApiKey(serviceConfig.serviceName);
        results.push({
          serviceName: serviceConfig.serviceName,
          apiKey,
        });
        this.logger.log(`API key generated for ${serviceConfig.serviceName}`);
      } catch (error) {
        results.push({
          serviceName: serviceConfig.serviceName,
          error: error.message,
        });
        this.logger.error(`Failed to generate API key for ${serviceConfig.serviceName}:`, error);
      }
    }

    return {
      success: results.every(r => !r.error),
      results,
    };
  }

  @Get('service-credentials/:serviceName')
  @ApiOperation({ summary: 'Get complete service credentials (API key + initial token)' })
  @ApiResponse({ status: 200, description: 'Service credentials retrieved' })
  async getServiceCredentials(
    @Param('serviceName') serviceName: string
  ): Promise<{ success: boolean; credentials?: any; error?: string }> {
    try {
      const credentials = await this.serviceAuthService.generateServiceCredentials(serviceName);
      
      this.logger.log(`Service credentials generated for ${serviceName}`);
      return {
        success: true,
        credentials,
      };
    } catch (error) {
      this.logger.error(`Failed to generate service credentials for ${serviceName}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('update-permissions/:serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update service permissions' })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: { type: 'array', items: { type: 'string' }, example: ['transactions:*', 'accounting:read'] },
      },
      required: ['permissions'],
    },
  })
  async updateServicePermissions(
    @Param('serviceId') serviceId: string,
    @Body() body: { permissions: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await this.serviceAuthService.updateServicePermissions(serviceId, body.permissions);
      
      if (success) {
        this.logger.log(`Permissions updated for service ${serviceId}`);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update permissions' };
      }
    } catch (error) {
      this.logger.error(`Failed to update permissions for ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Service authentication health check' })
  @ApiResponse({ status: 200, description: 'Service authentication is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}