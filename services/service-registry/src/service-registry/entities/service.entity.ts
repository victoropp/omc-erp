import { ServiceStatus, ServiceType } from '../dto/register-service.dto';

export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  type: ServiceType;
  status: ServiceStatus;
  healthEndpoint: string;
  tags: string[];
  metadata: Record<string, any>;
  dependencies: string[];
  weight: number;
  environment: string;
  registeredAt: Date;
  lastHeartbeat: Date;
  healthCheckCount: number;
  consecutiveFailures: number;
  totalRequests?: number;
  averageResponseTime?: number;
  errorRate?: number;
}

export interface ServiceHealth {
  serviceId: string;
  status: ServiceStatus;
  timestamp: Date;
  responseTime: number;
  details?: {
    uptime?: number;
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: {
      usage: number;
    };
    dependencies?: {
      [key: string]: {
        status: 'healthy' | 'unhealthy';
        responseTime?: number;
        error?: string;
      };
    };
    customMetrics?: Record<string, any>;
  };
  error?: string;
}

export interface ServiceMetrics {
  serviceId: string;
  timestamp: Date;
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections?: number;
    customMetrics?: Record<string, number>;
  };
}