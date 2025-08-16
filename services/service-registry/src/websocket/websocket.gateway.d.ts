import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventBusService } from '../event-bus/event-bus.service';
import { ServiceRegistryService } from '../service-registry/service-registry.service';
import { SystemEvent } from '../event-bus/dto/event.dto';
import { ServiceInstance } from '../service-registry/entities/service.entity';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}
export declare class ServiceRegistryWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly eventBusService;
    private readonly serviceRegistryService;
    server: Server;
    private readonly logger;
    private connectedClients;
    private clientSubscriptions;
    constructor(eventBusService: EventBusService, serviceRegistryService: ServiceRegistryService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    /**
     * Subscribe to specific event types
     */
    handleSubscribe(data: {
        channels: string[];
    }, client: AuthenticatedSocket): Promise<void>;
    /**
     * Unsubscribe from event types
     */
    handleUnsubscribe(data: {
        channels: string[];
    }, client: AuthenticatedSocket): Promise<void>;
    /**
     * Get real-time service status
     */
    handleGetServiceStatus(data: {
        serviceId?: string;
    }, client: AuthenticatedSocket): Promise<void>;
    /**
     * Get system health dashboard
     */
    handleGetSystemDashboard(client: AuthenticatedSocket): Promise<void>;
    /**
     * Broadcast system event to all connected clients
     */
    broadcastSystemEvent(event: SystemEvent): Promise<void>;
    /**
     * Send service update to subscribers
     */
    broadcastServiceUpdate(service: ServiceInstance): Promise<void>;
    /**
     * Send alert to administrators
     */
    sendAlert(alert: {
        severity: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        message: string;
        service?: string;
        data?: any;
    }): Promise<void>;
    /**
     * Send performance metrics update
     */
    broadcastMetricsUpdate(metrics: {
        serviceId: string;
        metrics: any;
    }): Promise<void>;
    /**
     * Send initial system status to newly connected client
     */
    private sendSystemStatus;
    /**
     * Subscribe to system events from event bus
     */
    private subscribeToSystemEvents;
    /**
     * Handle service health changes
     */
    private handleServiceHealthChange;
    /**
     * Get appropriate channel for event type
     */
    private getChannelForEvent;
}
export {};
//# sourceMappingURL=websocket.gateway.d.ts.map