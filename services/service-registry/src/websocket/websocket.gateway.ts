import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventBusService } from '../event-bus/event-bus.service';
import { ServiceRegistryService } from '../service-registry/service-registry.service';
import { EventType, SystemEvent } from '../event-bus/dto/event.dto';
import { ServiceInstance } from '../service-registry/entities/service.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/ws',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();
  private clientSubscriptions = new Map<string, Set<string>>(); // clientId -> subscribed channels

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly serviceRegistryService: ServiceRegistryService,
  ) {
    // Subscribe to system events
    this.subscribeToSystemEvents();
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.debug(`Client connected: ${client.id}`);
    
    try {
      // Extract user info from token (simplified - in production, use proper JWT validation)
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (token) {
        // In production, validate JWT and extract user info
        client.userId = 'user123'; // Mock user ID
        client.userRole = 'admin'; // Mock user role
      }

      this.connectedClients.set(client.id, client);
      this.clientSubscriptions.set(client.id, new Set());

      // Send initial connection confirmation
      client.emit('connection_established', {
        clientId: client.id,
        timestamp: new Date(),
        message: 'Connected to OMC ERP WebSocket',
      });

      // Send current system status
      await this.sendSystemStatus(client);

    } catch (error) {
      this.logger.error(`Error during client connection: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    this.clientSubscriptions.delete(client.id);
  }

  /**
   * Subscribe to specific event types
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { channels } = data;
    const clientSubscriptions = this.clientSubscriptions.get(client.id) || new Set();

    for (const channel of channels) {
      clientSubscriptions.add(channel);
      await client.join(channel);
    }

    this.clientSubscriptions.set(client.id, clientSubscriptions);

    client.emit('subscription_confirmed', {
      channels,
      timestamp: new Date(),
    });

    this.logger.debug(`Client ${client.id} subscribed to channels: ${channels.join(', ')}`);
  }

  /**
   * Unsubscribe from event types
   */
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { channels } = data;
    const clientSubscriptions = this.clientSubscriptions.get(client.id) || new Set();

    for (const channel of channels) {
      clientSubscriptions.delete(channel);
      await client.leave(channel);
    }

    this.clientSubscriptions.set(client.id, clientSubscriptions);

    client.emit('unsubscription_confirmed', {
      channels,
      timestamp: new Date(),
    });

    this.logger.debug(`Client ${client.id} unsubscribed from channels: ${channels.join(', ')}`);
  }

  /**
   * Get real-time service status
   */
  @SubscribeMessage('get_service_status')
  async handleGetServiceStatus(
    @MessageBody() data: { serviceId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (data.serviceId) {
        const service = await this.serviceRegistryService.getService(data.serviceId);
        const health = await this.serviceRegistryService.getServiceHealth(data.serviceId);
        const metrics = await this.serviceRegistryService.getServiceMetrics(data.serviceId);

        client.emit('service_status', {
          service,
          health,
          metrics,
          timestamp: new Date(),
        });
      } else {
        const services = await this.serviceRegistryService.getAllServices();
        client.emit('all_services_status', {
          services: Object.values(services),
          timestamp: new Date(),
        });
      }
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get service status',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get system health dashboard
   */
  @SubscribeMessage('get_system_dashboard')
  async handleGetSystemDashboard(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const services = await this.serviceRegistryService.getAllServices();
      const serviceList = Object.values(services);

      const dashboard = {
        totalServices: serviceList.length,
        healthyServices: serviceList.filter(s => s.status === 'healthy').length,
        unhealthyServices: serviceList.filter(s => s.status === 'unhealthy').length,
        services: serviceList,
        timestamp: new Date(),
      };

      client.emit('system_dashboard', dashboard);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get system dashboard',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Broadcast system event to all connected clients
   */
  async broadcastSystemEvent(event: SystemEvent): Promise<void> {
    try {
      const channel = this.getChannelForEvent(event);
      
      this.server.to(channel).emit('system_event', {
        event,
        timestamp: new Date(),
      });

      this.logger.debug(`Broadcasted event ${event.type} to channel ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast system event: ${error.message}`);
    }
  }

  /**
   * Send service update to subscribers
   */
  async broadcastServiceUpdate(service: ServiceInstance): Promise<void> {
    try {
      const channel = 'service_updates';
      
      this.server.to(channel).emit('service_update', {
        service,
        timestamp: new Date(),
      });

      this.logger.debug(`Broadcasted service update for ${service.name}`);
    } catch (error) {
      this.logger.error(`Failed to broadcast service update: ${error.message}`);
    }
  }

  /**
   * Send alert to administrators
   */
  async sendAlert(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    service?: string;
    data?: any;
  }): Promise<void> {
    try {
      const channel = 'alerts';
      
      this.server.to(channel).emit('alert', {
        ...alert,
        timestamp: new Date(),
      });

      this.logger.debug(`Sent ${alert.severity} alert: ${alert.title}`);
    } catch (error) {
      this.logger.error(`Failed to send alert: ${error.message}`);
    }
  }

  /**
   * Send performance metrics update
   */
  async broadcastMetricsUpdate(metrics: {
    serviceId: string;
    metrics: any;
  }): Promise<void> {
    try {
      const channel = 'metrics';
      
      this.server.to(channel).emit('metrics_update', {
        ...metrics,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast metrics update: ${error.message}`);
    }
  }

  /**
   * Send initial system status to newly connected client
   */
  private async sendSystemStatus(client: AuthenticatedSocket): Promise<void> {
    try {
      const services = await this.serviceRegistryService.getAllServices();
      const serviceList = Object.values(services);

      const systemStatus = {
        totalServices: serviceList.length,
        healthyServices: serviceList.filter(s => s.status === 'healthy').length,
        unhealthyServices: serviceList.filter(s => s.status === 'unhealthy').length,
        criticalServices: serviceList.filter(s => s.status === 'critical').length,
        timestamp: new Date(),
      };

      client.emit('system_status', systemStatus);
    } catch (error) {
      this.logger.error(`Failed to send system status: ${error.message}`);
    }
  }

  /**
   * Subscribe to system events from event bus
   */
  private subscribeToSystemEvents(): void {
    // Subscribe to all events
    this.eventBusService.subscribeToEvent('*', (event: SystemEvent) => {
      this.broadcastSystemEvent(event);
    });

    // Subscribe to specific high-priority events
    this.eventBusService.subscribeToEvent(EventType.SERVICE_HEALTH_CHANGED, (event: SystemEvent) => {
      this.handleServiceHealthChange(event);
    });

    this.eventBusService.subscribeToEvent(EventType.SYSTEM_ALERT, (event: SystemEvent) => {
      this.sendAlert({
        severity: event.data.severity || 'medium',
        title: 'System Alert',
        message: event.data.message || event.message,
        service: event.data.serviceId,
        data: event.data,
      });
    });

    this.eventBusService.subscribeToEvent(EventType.SERVICE_METRICS_UPDATED, (event: SystemEvent) => {
      this.broadcastMetricsUpdate({
        serviceId: event.data.serviceId,
        metrics: event.data.metrics,
      });
    });
  }

  /**
   * Handle service health changes
   */
  private async handleServiceHealthChange(event: SystemEvent): Promise<void> {
    const { serviceId, oldStatus, newStatus } = event.data;
    
    if (newStatus === 'unhealthy' || newStatus === 'critical') {
      await this.sendAlert({
        severity: newStatus === 'critical' ? 'critical' : 'high',
        title: 'Service Health Alert',
        message: `Service ${serviceId} status changed from ${oldStatus} to ${newStatus}`,
        service: serviceId,
        data: event.data,
      });
    }

    // Broadcast service update
    const service = await this.serviceRegistryService.getService(serviceId);
    if (service) {
      await this.broadcastServiceUpdate(service);
    }
  }

  /**
   * Get appropriate channel for event type
   */
  private getChannelForEvent(event: SystemEvent): string {
    switch (event.type) {
      case EventType.SERVICE_REGISTERED:
      case EventType.SERVICE_DEREGISTERED:
      case EventType.SERVICE_HEALTH_CHANGED:
        return 'service_updates';
      case EventType.SERVICE_METRICS_UPDATED:
        return 'metrics';
      case EventType.SYSTEM_ALERT:
        return 'alerts';
      case EventType.TRANSACTION_CREATED:
      case EventType.TRANSACTION_COMPLETED:
        return 'transactions';
      case EventType.PRICE_UPDATED:
        return 'pricing';
      case EventType.INVENTORY_LOW:
        return 'inventory';
      case EventType.UPPF_CLAIM_SUBMITTED:
        return 'uppf';
      case EventType.DEALER_SETTLEMENT:
        return 'dealers';
      default:
        return 'general';
    }
  }
}