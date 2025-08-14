import { IsString, IsNumber, IsArray, IsOptional, IsUrl, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceStatus {
  STARTING = 'starting',
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
  MAINTENANCE = 'maintenance',
  SHUTDOWN = 'shutdown',
}

export enum ServiceType {
  API = 'api',
  WORKER = 'worker',
  DATABASE = 'database',
  CACHE = 'cache',
  GATEWAY = 'gateway',
  EXTERNAL = 'external',
}

export class RegisterServiceDto {
  @ApiProperty({
    description: 'Unique service name',
    example: 'auth-service',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Service version',
    example: '1.0.0',
  })
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Service host/IP address',
    example: 'localhost',
  })
  @IsString()
  host: string;

  @ApiProperty({
    description: 'Service port',
    example: 3001,
  })
  @IsNumber()
  port: number;

  @ApiProperty({
    description: 'Service type',
    enum: ServiceType,
    example: ServiceType.API,
  })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({
    description: 'Health check endpoint',
    example: '/health',
    required: false,
  })
  @IsString()
  @IsOptional()
  healthEndpoint?: string = '/health';

  @ApiProperty({
    description: 'Service tags for categorization',
    example: ['authentication', 'security'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({
    description: 'Service metadata',
    example: { database: 'postgres', cache: 'redis' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any> = {};

  @ApiProperty({
    description: 'Service dependencies',
    example: ['postgres', 'redis'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[] = [];

  @ApiProperty({
    description: 'Load balancing weight',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weight?: number = 100;

  @ApiProperty({
    description: 'Service environment',
    example: 'production',
    required: false,
  })
  @IsString()
  @IsOptional()
  environment?: string = process.env.NODE_ENV || 'development';
}