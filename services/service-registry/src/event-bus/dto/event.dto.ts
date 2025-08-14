import { IsString, IsObject, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  SERVICE_REGISTERED = 'service.registered',
  SERVICE_DEREGISTERED = 'service.deregistered',
  SERVICE_HEALTH_CHANGED = 'service.health.changed',
  SERVICE_METRICS_UPDATED = 'service.metrics.updated',
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_COMPLETED = 'transaction.completed',
  PRICE_UPDATED = 'price.updated',
  INVENTORY_LOW = 'inventory.low',
  UPPF_CLAIM_SUBMITTED = 'uppf.claim.submitted',
  DEALER_SETTLEMENT = 'dealer.settlement',
  SYSTEM_ALERT = 'system.alert',
  USER_ACTION = 'user.action',
}

export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class PublishEventDto {
  @ApiProperty({
    description: 'Event type',
    enum: EventType,
    example: EventType.SERVICE_REGISTERED,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'Event data payload',
    example: { serviceId: 'auth-service-123', status: 'healthy' },
  })
  @IsObject()
  data: any;

  @ApiProperty({
    description: 'Event source service',
    example: 'auth-service',
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Event priority',
    enum: EventPriority,
    example: EventPriority.NORMAL,
    required: false,
  })
  @IsEnum(EventPriority)
  @IsOptional()
  priority?: EventPriority = EventPriority.NORMAL;

  @ApiProperty({
    description: 'Event tags for filtering',
    example: ['authentication', 'security'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({
    description: 'Target services (empty for broadcast)',
    example: ['pricing-service', 'accounting-service'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targets?: string[] = [];

  @ApiProperty({
    description: 'Event correlation ID',
    example: 'corr_123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  correlationId?: string;

  @ApiProperty({
    description: 'Event time-to-live in seconds',
    example: 300,
    required: false,
  })
  @IsOptional()
  ttl?: number = 3600; // 1 hour default
}

export interface SystemEvent {
  id: string;
  type: EventType;
  data: any;
  source: string;
  priority: EventPriority;
  tags: string[];
  targets: string[];
  correlationId?: string;
  timestamp: Date;
  ttl: number;
  retryCount?: number;
  processed?: boolean;
}