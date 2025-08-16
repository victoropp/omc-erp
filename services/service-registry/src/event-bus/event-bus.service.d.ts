import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache.service';
import { PublishEventDto, SystemEvent, EventType, EventPriority } from './dto/event.dto';
export declare class EventBusService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly cacheService;
    private readonly logger;
    private publisher;
    private subscriber;
    private eventHandlers;
    private readonly EVENT_CHANNEL;
    private readonly EVENTS_KEY;
    constructor(configService: ConfigService, cacheService: CacheService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    /**
     * Initialize the event bus
     */
    private initializeEventBus;
    /**
     * Publish an event to the event bus
     */
    publishEvent(publishDto: PublishEventDto): Promise<string>;
    /**
     * Subscribe to specific event types
     */
    subscribeToEvent(eventType: EventType | string, handler: Function): void;
    /**
     * Unsubscribe from event types
     */
    unsubscribeFromEvent(eventType: EventType | string, handler?: Function): void;
    /**
     * Get event history
     */
    getEventHistory(limit?: number, offset?: number, filters?: {
        type?: EventType;
        priority?: EventPriority;
        source?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<SystemEvent[]>;
    /**
     * Get event by ID
     */
    getEvent(eventId: string): Promise<SystemEvent | null>;
    /**
     * Emit service-specific events
     */
    emitServiceEvent(eventType: EventType, serviceId: string, data: any): Promise<string>;
    /**
     * Handle incoming events from Redis
     */
    private handleIncomingEvent;
    /**
     * Handle high priority events
     */
    private handleHighPriorityEvent;
    /**
     * Handle service health changes
     */
    private handleServiceHealthChange;
    /**
     * Handle system alerts
     */
    private handleSystemAlert;
    /**
     * Handle inventory alerts
     */
    private handleInventoryAlert;
    /**
     * Store event in history
     */
    private storeEvent;
    /**
     * Get event count
     */
    getEventCount(filters?: {
        type?: EventType;
        priority?: EventPriority;
        source?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<number>;
    /**
     * Get events by type
     */
    getEventsByType(): Promise<Record<EventType, number>>;
    /**
     * Get events by priority
     */
    getEventsByPriority(): Promise<Record<EventPriority, number>>;
    /**
     * Get events by source
     */
    getEventsBySource(): Promise<Record<string, number>>;
    /**
     * Clear event history
     */
    clearEventHistory(olderThan?: Date): Promise<void>;
    /**
     * Get event bus health status
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        queueSize: number;
        processingErrors: number;
        lastEventProcessed: Date | null;
        subscribers: number;
    }>;
    /**
     * Subscribe alias method for backwards compatibility
     */
    subscribe(eventType: EventType | string, handler: Function): void;
    /**
     * Mark event as processed
     */
    private markEventAsProcessed;
}
//# sourceMappingURL=event-bus.service.d.ts.map