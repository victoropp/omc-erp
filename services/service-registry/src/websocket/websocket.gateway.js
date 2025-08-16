"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ServiceRegistryWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistryWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const event_bus_service_1 = require("../event-bus/event-bus.service");
const service_registry_service_1 = require("../service-registry/service-registry.service");
const event_dto_1 = require("../event-bus/dto/event.dto");
let ServiceRegistryWebSocketGateway = ServiceRegistryWebSocketGateway_1 = class ServiceRegistryWebSocketGateway {
    eventBusService;
    serviceRegistryService;
    server;
    logger = new common_1.Logger(ServiceRegistryWebSocketGateway_1.name);
    connectedClients = new Map();
    clientSubscriptions = new Map(); // clientId -> subscribed channels
    constructor(eventBusService, serviceRegistryService) {
        this.eventBusService = eventBusService;
        this.serviceRegistryService = serviceRegistryService;
        // Subscribe to system events
        this.subscribeToSystemEvents();
    }
    async handleConnection(client) {
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
        }
        catch (error) {
            this.logger.error(`Error during client connection: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.debug(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
        this.clientSubscriptions.delete(client.id);
    }
    /**
     * Subscribe to specific event types
     */
    async handleSubscribe(data, client) {
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
    async handleUnsubscribe(data, client) {
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
    async handleGetServiceStatus(data, client) {
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
            }
            else {
                const services = await this.serviceRegistryService.getAllServices();
                client.emit('all_services_status', {
                    services: Object.values(services),
                    timestamp: new Date(),
                });
            }
        }
        catch (error) {
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
    async handleGetSystemDashboard(client) {
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
        }
        catch (error) {
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
    async broadcastSystemEvent(event) {
        try {
            const channel = this.getChannelForEvent(event);
            this.server.to(channel).emit('system_event', {
                event,
                timestamp: new Date(),
            });
            this.logger.debug(`Broadcasted event ${event.type} to channel ${channel}`);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast system event: ${error.message}`);
        }
    }
    /**
     * Send service update to subscribers
     */
    async broadcastServiceUpdate(service) {
        try {
            const channel = 'service_updates';
            this.server.to(channel).emit('service_update', {
                service,
                timestamp: new Date(),
            });
            this.logger.debug(`Broadcasted service update for ${service.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast service update: ${error.message}`);
        }
    }
    /**
     * Send alert to administrators
     */
    async sendAlert(alert) {
        try {
            const channel = 'alerts';
            this.server.to(channel).emit('alert', {
                ...alert,
                timestamp: new Date(),
            });
            this.logger.debug(`Sent ${alert.severity} alert: ${alert.title}`);
        }
        catch (error) {
            this.logger.error(`Failed to send alert: ${error.message}`);
        }
    }
    /**
     * Send performance metrics update
     */
    async broadcastMetricsUpdate(metrics) {
        try {
            const channel = 'metrics';
            this.server.to(channel).emit('metrics_update', {
                ...metrics,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Failed to broadcast metrics update: ${error.message}`);
        }
    }
    /**
     * Send initial system status to newly connected client
     */
    async sendSystemStatus(client) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send system status: ${error.message}`);
        }
    }
    /**
     * Subscribe to system events from event bus
     */
    subscribeToSystemEvents() {
        // Subscribe to all events
        this.eventBusService.subscribeToEvent('*', (event) => {
            this.broadcastSystemEvent(event);
        });
        // Subscribe to specific high-priority events
        this.eventBusService.subscribeToEvent(event_dto_1.EventType.SERVICE_HEALTH_CHANGED, (event) => {
            this.handleServiceHealthChange(event);
        });
        this.eventBusService.subscribeToEvent(event_dto_1.EventType.SYSTEM_ALERT, (event) => {
            this.sendAlert({
                severity: event.data.severity || 'medium',
                title: 'System Alert',
                message: event.data.message || event.data.message,
                service: event.data.serviceId,
                data: event.data,
            });
        });
        this.eventBusService.subscribeToEvent(event_dto_1.EventType.SERVICE_METRICS_UPDATED, (event) => {
            this.broadcastMetricsUpdate({
                serviceId: event.data.serviceId,
                metrics: event.data.metrics,
            });
        });
    }
    /**
     * Handle service health changes
     */
    async handleServiceHealthChange(event) {
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
    getChannelForEvent(event) {
        switch (event.type) {
            case event_dto_1.EventType.SERVICE_REGISTERED:
            case event_dto_1.EventType.SERVICE_DEREGISTERED:
            case event_dto_1.EventType.SERVICE_HEALTH_CHANGED:
                return 'service_updates';
            case event_dto_1.EventType.SERVICE_METRICS_UPDATED:
                return 'metrics';
            case event_dto_1.EventType.SYSTEM_ALERT:
                return 'alerts';
            case event_dto_1.EventType.TRANSACTION_CREATED:
            case event_dto_1.EventType.TRANSACTION_COMPLETED:
                return 'transactions';
            case event_dto_1.EventType.PRICE_UPDATED:
                return 'pricing';
            case event_dto_1.EventType.INVENTORY_LOW:
                return 'inventory';
            case event_dto_1.EventType.UPPF_CLAIM_SUBMITTED:
                return 'uppf';
            case event_dto_1.EventType.DEALER_SETTLEMENT:
                return 'dealers';
            default:
                return 'general';
        }
    }
};
exports.ServiceRegistryWebSocketGateway = ServiceRegistryWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ServiceRegistryWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRegistryWebSocketGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRegistryWebSocketGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_service_status'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRegistryWebSocketGateway.prototype, "handleGetServiceStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_system_dashboard'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServiceRegistryWebSocketGateway.prototype, "handleGetSystemDashboard", null);
exports.ServiceRegistryWebSocketGateway = ServiceRegistryWebSocketGateway = ServiceRegistryWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'http://localhost:5000',
                'http://localhost:3001',
                'http://localhost:3000'
            ],
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService,
        service_registry_service_1.ServiceRegistryService])
], ServiceRegistryWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map