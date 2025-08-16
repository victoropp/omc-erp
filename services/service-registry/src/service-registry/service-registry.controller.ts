import { Controller, Post, Get, Delete, Put, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServiceRegistryService } from './service-registry.service';
import { RegisterServiceDto, ServiceStatus, ServiceType } from './dto/register-service.dto';
import { ServiceInstance, ServiceHealth, ServiceMetrics } from './entities/service.entity';

@ApiTags('service-registry')
@Controller('registry')
export class ServiceRegistryController {
  constructor(private readonly serviceRegistryService: ServiceRegistryService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new service instance' })
  @ApiResponse({ 
    status: 201, 
    description: 'Service successfully registered',
    type: 'ServiceInstance',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid service registration data' 
  })
  async registerService(@Body() registerDto: RegisterServiceDto): Promise<ServiceInstance> {
    try {
      return await this.serviceRegistryService.registerService(registerDto);
    } catch (error) {
      throw new HttpException(
        `Failed to register service: ${(error as Error).message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete('deregister/:serviceId')
  @ApiOperation({ summary: 'Deregister a service instance' })
  @ApiParam({ name: 'serviceId', description: 'Unique service identifier' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service successfully deregistered' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Service not found' 
  })
  async deregisterService(@Param('serviceId') serviceId: string): Promise<{ success: boolean }> {
    const success = await this.serviceRegistryService.deregisterService(serviceId);
    
    if (!success) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }

  @Put('heartbeat/:serviceId')
  @ApiOperation({ summary: 'Update service heartbeat' })
  @ApiParam({ name: 'serviceId', description: 'Unique service identifier' })
  @ApiResponse({ 
    status: 200, 
    description: 'Heartbeat updated successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Service not found' 
  })
  async updateHeartbeat(@Param('serviceId') serviceId: string): Promise<{ success: boolean }> {
    const success = await this.serviceRegistryService.updateHeartbeat(serviceId);
    
    if (!success) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }

  @Get('services')
  @ApiOperation({ summary: 'Get all registered services' })
  @ApiQuery({ 
    name: 'type', 
    enum: ServiceType, 
    required: false, 
    description: 'Filter by service type' 
  })
  @ApiQuery({ 
    name: 'status', 
    enum: ServiceStatus, 
    required: false, 
    description: 'Filter by service status' 
  })
  @ApiQuery({ 
    name: 'name', 
    required: false, 
    description: 'Filter by service name' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of registered services' 
  })
  async getServices(
    @Query('type') type?: ServiceType,
    @Query('status') status?: ServiceStatus,
    @Query('name') name?: string
  ): Promise<ServiceInstance[]> {
    const allServices = await this.serviceRegistryService.getAllServices();
    let services = Object.values(allServices);

    // Apply filters
    if (type) {
      services = services.filter(service => service.type === type);
    }

    if (status) {
      services = services.filter(service => service.status === status);
    }

    if (name) {
      services = services.filter(service => service.name === name);
    }

    return services;
  }

  @Get('services/:serviceId')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'serviceId', description: 'Unique service identifier' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service details' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Service not found' 
  })
  async getService(@Param('serviceId') serviceId: string): Promise<ServiceInstance> {
    const service = await this.serviceRegistryService.getService(serviceId);
    
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    return service;
  }

  @Get('services/:serviceId/health')
  @ApiOperation({ summary: 'Get service health status' })
  @ApiParam({ name: 'serviceId', description: 'Unique service identifier' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service health details' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Service or health data not found' 
  })
  async getServiceHealth(@Param('serviceId') serviceId: string): Promise<ServiceHealth> {
    const health = await this.serviceRegistryService.getServiceHealth(serviceId);
    
    if (!health) {
      throw new HttpException('Service health data not found', HttpStatus.NOT_FOUND);
    }

    return health;
  }

  @Get('services/:serviceId/metrics')
  @ApiOperation({ summary: 'Get service metrics' })
  @ApiParam({ name: 'serviceId', description: 'Unique service identifier' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service metrics data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Service or metrics data not found' 
  })
  async getServiceMetrics(@Param('serviceId') serviceId: string): Promise<ServiceMetrics> {
    const metrics = await this.serviceRegistryService.getServiceMetrics(serviceId);
    
    if (!metrics) {
      throw new HttpException('Service metrics data not found', HttpStatus.NOT_FOUND);
    }

    return metrics;
  }

  @Get('discovery/:serviceName')
  @ApiOperation({ summary: 'Discover healthy service instances by name' })
  @ApiParam({ name: 'serviceName', description: 'Service name to discover' })
  @ApiQuery({ 
    name: 'loadBalanced', 
    required: false, 
    description: 'Return single load-balanced instance' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Discovered service instances' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No healthy services found' 
  })
  async discoverService(
    @Param('serviceName') serviceName: string,
    @Query('loadBalanced') loadBalanced?: boolean
  ): Promise<ServiceInstance | ServiceInstance[]> {
    if (loadBalanced === true) {
      const service = await this.serviceRegistryService.getBalancedService(serviceName);
      
      if (!service) {
        throw new HttpException(
          `No healthy instances found for service: ${serviceName}`,
          HttpStatus.NOT_FOUND
        );
      }

      return service;
    }

    const services = await this.serviceRegistryService.getHealthyServices(serviceName);
    
    if (services.length === 0) {
      throw new HttpException(
        `No healthy instances found for service: ${serviceName}`,
        HttpStatus.NOT_FOUND
      );
    }

    return services;
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for service registry itself' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service registry is healthy' 
  })
  async getRegistryHealth(): Promise<{
    status: string;
    timestamp: Date;
    services: {
      total: number;
      healthy: number;
      unhealthy: number;
      starting: number;
    };
  }> {
    const allServices = await this.serviceRegistryService.getAllServices();
    const services = Object.values(allServices);

    const stats = services.reduce(
      (acc, service) => {
        acc.total++;
        
        switch (service.status) {
          case ServiceStatus.HEALTHY:
            acc.healthy++;
            break;
          case ServiceStatus.UNHEALTHY:
          case ServiceStatus.CRITICAL:
            acc.unhealthy++;
            break;
          case ServiceStatus.STARTING:
            acc.starting++;
            break;
        }
        
        return acc;
      },
      { total: 0, healthy: 0, unhealthy: 0, starting: 0 }
    );

    return {
      status: 'healthy',
      timestamp: new Date(),
      services: stats,
    };
  }
}