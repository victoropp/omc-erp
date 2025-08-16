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
var EventHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandlerService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("./event-bus.service");
const event_dto_1 = require("./dto/event.dto");
let EventHandlerService = EventHandlerService_1 = class EventHandlerService {
    eventBusService;
    logger = new common_1.Logger(EventHandlerService_1.name);
    handlers = new Map();
    subscriptions = new Map();
    eventProcessingStats = {
        totalProcessed: 0,
        totalErrors: 0,
        processingTimes: [],
        lastProcessed: null,
    };
    constructor(eventBusService) {
        this.eventBusService = eventBusService;
        this.initializeDefaultHandlers();
        this.startEventProcessing();
    }
    /**
     * Register an event handler
     */
    registerHandler(handler) {
        if (!this.handlers.has(handler.eventType)) {
            this.handlers.set(handler.eventType, []);
        }
        const existingHandlers = this.handlers.get(handler.eventType);
        existingHandlers.push(handler);
        // Sort by priority (higher priority first)
        existingHandlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.logger.log(`Registered handler for event type: ${handler.eventType}`);
    }
    /**
     * Subscribe to events with a callback
     */
    subscribe(eventType, callback, options) {
        const id = options?.id || this.generateSubscriptionId();
        const subscription = {
            id,
            eventType,
            callback,
            filter: options?.filter,
            active: true,
            subscribedAt: new Date(),
            triggerCount: 0,
        };
        this.subscriptions.set(id, subscription);
        this.logger.log(`Created subscription ${id} for event type: ${eventType}`);
        return id;
    }
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            this.subscriptions.delete(subscriptionId);
            this.logger.log(`Removed subscription: ${subscriptionId}`);
            return true;
        }
        return false;
    }
    /**
     * Get all active subscriptions
     */
    getSubscriptions() {
        return Array.from(this.subscriptions.values()).filter(sub => sub.active);
    }
    /**
     * Process an event through all handlers and subscriptions
     */
    async processEvent(event) {
        const startTime = Date.now();
        try {
            this.eventProcessingStats.totalProcessed++;
            this.eventProcessingStats.lastProcessed = new Date();
            // Process registered handlers
            await this.processEventHandlers(event);
            // Process subscriptions
            await this.processEventSubscriptions(event);
            const processingTime = Date.now() - startTime;
            this.eventProcessingStats.processingTimes.push(processingTime);
            // Keep only last 1000 processing times for stats
            if (this.eventProcessingStats.processingTimes.length > 1000) {
                this.eventProcessingStats.processingTimes = this.eventProcessingStats.processingTimes.slice(-1000);
            }
            this.logger.debug(`Processed event ${event.id} in ${processingTime}ms`);
        }
        catch (error) {
            this.eventProcessingStats.totalErrors++;
            this.logger.error(`Failed to process event ${event.id}: ${error.message}`);
            // Publish error event
            await this.eventBusService.publishEvent({
                type: event_dto_1.EventType.SYSTEM_ERROR,
                data: {
                    originalEvent: event,
                    error: error.message,
                    processingTime: Date.now() - startTime,
                },
                source: 'event-handler-service',
                priority: event_dto_1.EventPriority.HIGH,
                tags: ['event-processing-error'],
            });
            throw error;
        }
    }
    /**
     * Get event processing statistics
     */
    getProcessingStats() {
        const processingTimes = this.eventProcessingStats.processingTimes;
        const averageProcessingTime = processingTimes.length > 0
            ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
            : 0;
        return {
            totalProcessed: this.eventProcessingStats.totalProcessed,
            totalErrors: this.eventProcessingStats.totalErrors,
            averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
            lastProcessed: this.eventProcessingStats.lastProcessed,
            activeSubscriptions: this.getSubscriptions().length,
            registeredHandlers: Array.from(this.handlers.values()).reduce((total, handlers) => total + handlers.length, 0),
        };
    }
    /**
     * Process event through registered handlers
     */
    async processEventHandlers(event) {
        const handlers = this.handlers.get(event.type);
        if (!handlers || handlers.length === 0) {
            return;
        }
        const promises = handlers.map(async (handler) => {
            try {
                await Promise.resolve(handler.handler(event));
            }
            catch (error) {
                this.logger.error(`Handler failed for event ${event.id}: ${error.message}`);
                throw error;
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * Process event through active subscriptions
     */
    async processEventSubscriptions(event) {
        const relevantSubscriptions = Array.from(this.subscriptions.values())
            .filter(sub => sub.active && sub.eventType === event.type)
            .filter(sub => !sub.filter || sub.filter(event));
        if (relevantSubscriptions.length === 0) {
            return;
        }
        const promises = relevantSubscriptions.map(async (subscription) => {
            try {
                await Promise.resolve(subscription.callback(event));
                subscription.lastTriggered = new Date();
                subscription.triggerCount++;
            }
            catch (error) {
                this.logger.error(`Subscription ${subscription.id} failed for event ${event.id}: ${error.message}`);
                throw error;
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * Initialize default event handlers
     */
    initializeDefaultHandlers() {
        // Service registration handler
        this.registerHandler({
            eventType: event_dto_1.EventType.SERVICE_REGISTERED,
            priority: 10,
            handler: async (event) => {
                this.logger.log(`Service registered: ${event.data.serviceName} at ${event.data.host}:${event.data.port}`);
            },
            description: 'Log service registration events',
        });
        // Service deregistration handler
        this.registerHandler({
            eventType: event_dto_1.EventType.SERVICE_DEREGISTERED,
            priority: 10,
            handler: async (event) => {
                this.logger.log(`Service deregistered: ${event.data.serviceName} (${event.data.serviceId})`);
            },
            description: 'Log service deregistration events',
        });
        // Service health change handler
        this.registerHandler({
            eventType: event_dto_1.EventType.SERVICE_HEALTH_CHANGED,
            priority: 10,
            handler: async (event) => {
                const { serviceName, oldStatus, newStatus } = event.data;
                if (newStatus === 'unhealthy') {
                    this.logger.warn(`Service ${serviceName} became unhealthy (was ${oldStatus})`);
                }
                else if (newStatus === 'healthy' && oldStatus === 'unhealthy') {
                    this.logger.log(`Service ${serviceName} recovered (was ${oldStatus})`);
                }
            },
            description: 'Log service health changes',
        });
        // System alert handler
        this.registerHandler({
            eventType: event_dto_1.EventType.SYSTEM_ALERT,
            priority: 10,
            handler: async (event) => {
                const { severity, title, message } = event.data;
                if (severity === 'critical') {
                    this.logger.error(`CRITICAL ALERT: ${title} - ${message}`);
                }
                else if (severity === 'high') {
                    this.logger.warn(`HIGH ALERT: ${title} - ${message}`);
                }
                else {
                    this.logger.log(`ALERT: ${title} - ${message}`);
                }
            },
            description: 'Log system alerts',
        });
        // System error handler
        this.registerHandler({
            eventType: event_dto_1.EventType.SYSTEM_ERROR,
            priority: 10,
            handler: async (event) => {
                this.logger.error(`System error: ${event.data.error}`);
            },
            description: 'Log system errors',
        });
        this.logger.log('Default event handlers initialized');
    }
    /**
     * Start processing events from the event bus
     */
    startEventProcessing() {
        // Subscribe to all event types for processing
        Object.values(event_dto_1.EventType).forEach(eventType => {
            this.eventBusService.subscribe(eventType, async (event) => {
                await this.processEvent(event);
            });
        });
        this.logger.log('Event processing started');
    }
    /**
     * Generate a unique subscription ID
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.EventHandlerService = EventHandlerService;
exports.EventHandlerService = EventHandlerService = EventHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], EventHandlerService);
//# sourceMappingURL=event-handler.service.js.map