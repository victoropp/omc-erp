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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_service_1 = require("../common/cache.service");
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
const event_dto_1 = require("./dto/event.dto");
const register_service_dto_1 = require("../service-registry/dto/register-service.dto");
let EventBusService = EventBusService_1 = class EventBusService {
    configService;
    cacheService;
    logger = new common_1.Logger(EventBusService_1.name);
    publisher;
    subscriber;
    eventHandlers = new Map();
    EVENT_CHANNEL = 'omc_erp_events';
    EVENTS_KEY = 'events:history';
    constructor(configService, cacheService) {
        this.configService = configService;
        this.cacheService = cacheService;
        const redisConfig = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            retryDelayOnFailover: 100,
            enableReadyCheck: true,
            lazyConnect: true,
        };
        this.publisher = new ioredis_1.default(redisConfig);
        this.subscriber = new ioredis_1.default(redisConfig);
    }
    async onModuleInit() {
        await this.initializeEventBus();
    }
    async onModuleDestroy() {
        await this.publisher.disconnect();
        await this.subscriber.disconnect();
    }
    /**
     * Initialize the event bus
     */
    async initializeEventBus() {
        try {
            await this.publisher.connect();
            await this.subscriber.connect();
            // Subscribe to the main event channel
            await this.subscriber.subscribe(this.EVENT_CHANNEL);
            this.subscriber.on('message', (channel, message) => {
                if (channel === this.EVENT_CHANNEL) {
                    this.handleIncomingEvent(message);
                }
            });
            this.logger.log('Event bus initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize event bus: ${error.message}`);
            throw error;
        }
    }
    /**
     * Publish an event to the event bus
     */
    async publishEvent(publishDto) {
        const event = {
            id: (0, uuid_1.v4)(),
            type: publishDto.type,
            data: publishDto.data,
            source: publishDto.source,
            priority: publishDto.priority || event_dto_1.EventPriority.NORMAL,
            tags: publishDto.tags || [],
            targets: publishDto.targets || [],
            correlationId: publishDto.correlationId,
            timestamp: new Date(),
            ttl: publishDto.ttl || 3600,
            retryCount: 0,
            processed: false,
        };
        try {
            // Store event in history
            await this.storeEvent(event);
            // Publish to Redis channel
            await this.publisher.publish(this.EVENT_CHANNEL, JSON.stringify(event));
            // Handle high priority events immediately
            if (event.priority === event_dto_1.EventPriority.CRITICAL || event.priority === event_dto_1.EventPriority.HIGH) {
                await this.handleHighPriorityEvent(event);
            }
            this.logger.debug(`Event published: ${event.type} (${event.id})`);
            return event.id;
        }
        catch (error) {
            this.logger.error(`Failed to publish event: ${error.message}`);
            throw error;
        }
    }
    /**
     * Subscribe to specific event types
     */
    subscribeToEvent(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
        this.logger.debug(`Subscribed to event: ${eventType}`);
    }
    /**
     * Unsubscribe from event types
     */
    unsubscribeFromEvent(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            return;
        }
        if (handler) {
            const handlers = this.eventHandlers.get(eventType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        else {
            this.eventHandlers.delete(eventType);
        }
        this.logger.debug(`Unsubscribed from event: ${eventType}`);
    }
    /**
     * Get event history
     */
    async getEventHistory(limit = 100, offset = 0, filters) {
        try {
            // Get events from cache/storage
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            let filteredEvents = events;
            // Apply filters
            if (filters?.type) {
                filteredEvents = filteredEvents.filter(event => event.type === filters.type);
            }
            if (filters?.priority) {
                filteredEvents = filteredEvents.filter(event => event.priority === filters.priority);
            }
            if (filters?.source) {
                filteredEvents = filteredEvents.filter(event => event.source === filters.source);
            }
            if (filters?.startDate) {
                filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= filters.startDate);
            }
            if (filters?.endDate) {
                filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= filters.endDate);
            }
            // Sort by timestamp (newest first), apply offset and limit
            return filteredEvents
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(offset, offset + limit);
        }
        catch (error) {
            this.logger.error(`Failed to get event history: ${error.message}`);
            return [];
        }
    }
    /**
     * Get event by ID
     */
    async getEvent(eventId) {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            return events.find(event => event.id === eventId) || null;
        }
        catch (error) {
            this.logger.error(`Failed to get event ${eventId}: ${error.message}`);
            return null;
        }
    }
    /**
     * Emit service-specific events
     */
    async emitServiceEvent(eventType, serviceId, data) {
        return this.publishEvent({
            type: eventType,
            data: { serviceId, ...data },
            source: 'service-registry',
            priority: event_dto_1.EventPriority.NORMAL,
            tags: ['service', 'registry'],
        });
    }
    /**
     * Handle incoming events from Redis
     */
    async handleIncomingEvent(message) {
        try {
            const event = JSON.parse(message);
            this.logger.debug(`Received event: ${event.type} from ${event.source}`);
            // Execute registered handlers
            const handlers = this.eventHandlers.get(event.type) || [];
            const globalHandlers = this.eventHandlers.get('*') || []; // Global handlers
            const allHandlers = [...handlers, ...globalHandlers];
            if (allHandlers.length > 0) {
                await Promise.allSettled(allHandlers.map(handler => {
                    try {
                        return handler(event);
                    }
                    catch (error) {
                        this.logger.error(`Event handler error: ${error.message}`);
                        return Promise.resolve();
                    }
                }));
            }
            // Mark as processed
            await this.markEventAsProcessed(event.id);
        }
        catch (error) {
            this.logger.error(`Failed to handle incoming event: ${error.message}`);
        }
    }
    /**
     * Handle high priority events
     */
    async handleHighPriorityEvent(event) {
        // Send to WebSocket for real-time notifications
        // This would be handled by WebSocket service
        switch (event.type) {
            case event_dto_1.EventType.SERVICE_HEALTH_CHANGED:
                await this.handleServiceHealthChange(event);
                break;
            case event_dto_1.EventType.SYSTEM_ALERT:
                await this.handleSystemAlert(event);
                break;
            case event_dto_1.EventType.INVENTORY_LOW:
                await this.handleInventoryAlert(event);
                break;
            default:
                this.logger.debug(`High priority event ${event.type} received`);
        }
    }
    /**
     * Handle service health changes
     */
    async handleServiceHealthChange(event) {
        const { serviceId, newStatus } = event.data;
        if (newStatus === register_service_dto_1.ServiceStatus.UNHEALTHY || newStatus === register_service_dto_1.ServiceStatus.CRITICAL) {
            // Alert administrators
            await this.publishEvent({
                type: event_dto_1.EventType.SYSTEM_ALERT,
                data: {
                    severity: 'high',
                    message: `Service ${serviceId} is ${newStatus}`,
                    serviceId,
                },
                source: 'service-registry',
                priority: event_dto_1.EventPriority.HIGH,
                tags: ['alert', 'service-health'],
            });
        }
    }
    /**
     * Handle system alerts
     */
    async handleSystemAlert(event) {
        // This would integrate with alerting systems like Slack, email, etc.
        this.logger.warn(`SYSTEM ALERT: ${event.data.message}`);
    }
    /**
     * Handle inventory alerts
     */
    async handleInventoryAlert(event) {
        // Notify relevant services about low inventory
        this.logger.warn(`INVENTORY ALERT: ${event.data.product} is low (${event.data.currentLevel})`);
    }
    /**
     * Store event in history
     */
    async storeEvent(event) {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            events.push(event);
            // Keep only the last 10000 events
            if (events.length > 10000) {
                events.splice(0, events.length - 10000);
            }
            await this.cacheService.set(this.EVENTS_KEY, events, 86400000); // 24 hours
        }
        catch (error) {
            this.logger.error(`Failed to store event: ${error.message}`);
        }
    }
    /**
     * Get event count
     */
    async getEventCount(filters) {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            let filteredEvents = events;
            // Apply filters
            if (filters?.type) {
                filteredEvents = filteredEvents.filter(event => event.type === filters.type);
            }
            if (filters?.priority) {
                filteredEvents = filteredEvents.filter(event => event.priority === filters.priority);
            }
            if (filters?.source) {
                filteredEvents = filteredEvents.filter(event => event.source === filters.source);
            }
            if (filters?.startDate) {
                filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= filters.startDate);
            }
            if (filters?.endDate) {
                filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= filters.endDate);
            }
            return filteredEvents.length;
        }
        catch (error) {
            this.logger.error(`Failed to get event count: ${error.message}`);
            return 0;
        }
    }
    /**
     * Get events by type
     */
    async getEventsByType() {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            const counts = {};
            Object.values(event_dto_1.EventType).forEach(type => {
                counts[type] = events.filter(event => event.type === type).length;
            });
            return counts;
        }
        catch (error) {
            this.logger.error(`Failed to get events by type: ${error.message}`);
            return {};
        }
    }
    /**
     * Get events by priority
     */
    async getEventsByPriority() {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            const counts = {};
            Object.values(event_dto_1.EventPriority).forEach(priority => {
                counts[priority] = events.filter(event => event.priority === priority).length;
            });
            return counts;
        }
        catch (error) {
            this.logger.error(`Failed to get events by priority: ${error.message}`);
            return {};
        }
    }
    /**
     * Get events by source
     */
    async getEventsBySource() {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            const counts = {};
            events.forEach(event => {
                counts[event.source] = (counts[event.source] || 0) + 1;
            });
            return counts;
        }
        catch (error) {
            this.logger.error(`Failed to get events by source: ${error.message}`);
            return {};
        }
    }
    /**
     * Clear event history
     */
    async clearEventHistory(olderThan) {
        try {
            if (olderThan) {
                const events = await this.cacheService.get(this.EVENTS_KEY) || [];
                const filteredEvents = events.filter(event => new Date(event.timestamp) >= olderThan);
                await this.cacheService.set(this.EVENTS_KEY, filteredEvents, 86400000);
            }
            else {
                await this.cacheService.set(this.EVENTS_KEY, [], 86400000);
            }
        }
        catch (error) {
            this.logger.error(`Failed to clear event history: ${error.message}`);
        }
    }
    /**
     * Get event bus health status
     */
    async getHealthStatus() {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            const recentErrors = events.filter(event => event.type === event_dto_1.EventType.SYSTEM_ERROR &&
                new Date(event.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // last hour
            ).length;
            const lastProcessedEvent = events
                .filter(event => event.processed)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            const subscriberCount = Array.from(this.eventHandlers.values())
                .reduce((total, handlers) => total + handlers.length, 0);
            let status = 'healthy';
            if (recentErrors > 10) {
                status = 'unhealthy';
            }
            else if (recentErrors > 5) {
                status = 'degraded';
            }
            return {
                status,
                queueSize: events.filter(event => !event.processed).length,
                processingErrors: recentErrors,
                lastEventProcessed: lastProcessedEvent ? new Date(lastProcessedEvent.timestamp) : null,
                subscribers: subscriberCount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get health status: ${error.message}`);
            return {
                status: 'unhealthy',
                queueSize: 0,
                processingErrors: 0,
                lastEventProcessed: null,
                subscribers: 0,
            };
        }
    }
    /**
     * Subscribe alias method for backwards compatibility
     */
    subscribe(eventType, handler) {
        this.subscribeToEvent(eventType, handler);
    }
    /**
     * Mark event as processed
     */
    async markEventAsProcessed(eventId) {
        try {
            const events = await this.cacheService.get(this.EVENTS_KEY) || [];
            const eventIndex = events.findIndex(e => e.id === eventId);
            if (eventIndex > -1) {
                events[eventIndex].processed = true;
                await this.cacheService.set(this.EVENTS_KEY, events, 86400000);
            }
        }
        catch (error) {
            this.logger.error(`Failed to mark event as processed: ${error.message}`);
        }
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        cache_service_1.CacheService])
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map