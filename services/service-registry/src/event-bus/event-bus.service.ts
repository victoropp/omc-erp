import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache.service';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { PublishEventDto, SystemEvent, EventType, EventPriority } from './dto/event.dto';
import { ServiceStatus } from '../service-registry/dto/register-service.dto';

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private publisher: Redis;
  private subscriber: Redis;
  private eventHandlers: Map<string, Function[]> = new Map();
  private readonly EVENT_CHANNEL = 'omc_erp_events';
  private readonly EVENTS_KEY = 'events:history';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);
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
  private async initializeEventBus(): Promise<void> {
    try {
      await this.publisher.connect();
      await this.subscriber.connect();

      // Subscribe to the main event channel
      await this.subscriber.subscribe(this.EVENT_CHANNEL);
      
      this.subscriber.on('message', (channel: string, message: string) => {
        if (channel === this.EVENT_CHANNEL) {
          this.handleIncomingEvent(message);
        }
      });

      this.logger.log('Event bus initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize event bus: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Publish an event to the event bus
   */
  async publishEvent(publishDto: PublishEventDto): Promise<string> {
    const event: SystemEvent = {
      id: uuidv4(),
      type: publishDto.type,
      data: publishDto.data,
      source: publishDto.source,
      priority: publishDto.priority || EventPriority.NORMAL,
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
      if (event.priority === EventPriority.CRITICAL || event.priority === EventPriority.HIGH) {
        await this.handleHighPriorityEvent(event);
      }

      this.logger.debug(`Event published: ${event.type} (${event.id})`);
      return event.id;
    } catch (error) {
      this.logger.error(`Failed to publish event: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribeToEvent(eventType: EventType | string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    this.logger.debug(`Subscribed to event: ${eventType}`);
  }

  /**
   * Unsubscribe from event types
   */
  unsubscribeFromEvent(eventType: EventType | string, handler?: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }

    if (handler) {
      const handlers = this.eventHandlers.get(eventType)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(eventType);
    }

    this.logger.debug(`Unsubscribed from event: ${eventType}`);
  }

  /**
   * Get event history
   */
  async getEventHistory(
    limit: number = 100,
    offset: number = 0,
    filters?: {
      type?: EventType;
      priority?: EventPriority;
      source?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<SystemEvent[]> {
    try {
      // Get events from cache/storage
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      
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
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) >= filters.startDate!
        );
      }

      if (filters?.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) <= filters.endDate!
        );
      }

      // Sort by timestamp (newest first), apply offset and limit
      return filteredEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      this.logger.error(`Failed to get event history: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<SystemEvent | null> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      return events.find(event => event.id === eventId) || null;
    } catch (error) {
      this.logger.error(`Failed to get event ${eventId}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Emit service-specific events
   */
  async emitServiceEvent(eventType: EventType, serviceId: string, data: any): Promise<string> {
    return this.publishEvent({
      type: eventType,
      data: { serviceId, ...data },
      source: 'service-registry',
      priority: EventPriority.NORMAL,
      tags: ['service', 'registry'],
    });
  }

  /**
   * Handle incoming events from Redis
   */
  private async handleIncomingEvent(message: string): Promise<void> {
    try {
      const event: SystemEvent = JSON.parse(message);
      
      this.logger.debug(`Received event: ${event.type} from ${event.source}`);

      // Execute registered handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      const globalHandlers = this.eventHandlers.get('*') || []; // Global handlers
      
      const allHandlers = [...handlers, ...globalHandlers];
      
      if (allHandlers.length > 0) {
        await Promise.allSettled(
          allHandlers.map(handler => {
            try {
              return handler(event);
            } catch (error) {
              this.logger.error(`Event handler error: ${(error as Error).message}`);
              return Promise.resolve();
            }
          })
        );
      }

      // Mark as processed
      await this.markEventAsProcessed(event.id);

    } catch (error) {
      this.logger.error(`Failed to handle incoming event: ${(error as Error).message}`);
    }
  }

  /**
   * Handle high priority events
   */
  private async handleHighPriorityEvent(event: SystemEvent): Promise<void> {
    // Send to WebSocket for real-time notifications
    // This would be handled by WebSocket service
    
    switch (event.type) {
      case EventType.SERVICE_HEALTH_CHANGED:
        await this.handleServiceHealthChange(event);
        break;
      case EventType.SYSTEM_ALERT:
        await this.handleSystemAlert(event);
        break;
      case EventType.INVENTORY_LOW:
        await this.handleInventoryAlert(event);
        break;
      default:
        this.logger.debug(`High priority event ${event.type} received`);
    }
  }

  /**
   * Handle service health changes
   */
  private async handleServiceHealthChange(event: SystemEvent): Promise<void> {
    const { serviceId, newStatus } = event.data;
    
    if (newStatus === ServiceStatus.UNHEALTHY || newStatus === ServiceStatus.CRITICAL) {
      // Alert administrators
      await this.publishEvent({
        type: EventType.SYSTEM_ALERT,
        data: {
          severity: 'high',
          message: `Service ${serviceId} is ${newStatus}`,
          serviceId,
        },
        source: 'service-registry',
        priority: EventPriority.HIGH,
        tags: ['alert', 'service-health'],
      });
    }
  }

  /**
   * Handle system alerts
   */
  private async handleSystemAlert(event: SystemEvent): Promise<void> {
    // This would integrate with alerting systems like Slack, email, etc.
    this.logger.warn(`SYSTEM ALERT: ${event.data.message}`);
  }

  /**
   * Handle inventory alerts
   */
  private async handleInventoryAlert(event: SystemEvent): Promise<void> {
    // Notify relevant services about low inventory
    this.logger.warn(`INVENTORY ALERT: ${event.data.product} is low (${event.data.currentLevel})`);
  }

  /**
   * Store event in history
   */
  private async storeEvent(event: SystemEvent): Promise<void> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      events.push(event);

      // Keep only the last 10000 events
      if (events.length > 10000) {
        events.splice(0, events.length - 10000);
      }

      await this.cacheService.set(this.EVENTS_KEY, events, 86400000); // 24 hours
    } catch (error) {
      this.logger.error(`Failed to store event: ${(error as Error).message}`);
    }
  }

  /**
   * Get event count
   */
  async getEventCount(filters?: {
    type?: EventType;
    priority?: EventPriority;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
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
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) >= filters.startDate!
        );
      }

      if (filters?.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) <= filters.endDate!
        );
      }

      return filteredEvents.length;
    } catch (error) {
      this.logger.error(`Failed to get event count: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(): Promise<Record<EventType, number>> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const counts: Record<EventType, number> = {} as Record<EventType, number>;
      
      Object.values(EventType).forEach(type => {
        counts[type] = events.filter(event => event.type === type).length;
      });

      return counts;
    } catch (error) {
      this.logger.error(`Failed to get events by type: ${(error as Error).message}`);
      return {} as Record<EventType, number>;
    }
  }

  /**
   * Get events by priority
   */
  async getEventsByPriority(): Promise<Record<EventPriority, number>> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const counts: Record<EventPriority, number> = {} as Record<EventPriority, number>;
      
      Object.values(EventPriority).forEach(priority => {
        counts[priority] = events.filter(event => event.priority === priority).length;
      });

      return counts;
    } catch (error) {
      this.logger.error(`Failed to get events by priority: ${(error as Error).message}`);
      return {} as Record<EventPriority, number>;
    }
  }

  /**
   * Get events by source
   */
  async getEventsBySource(): Promise<Record<string, number>> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const counts: Record<string, number> = {};
      
      events.forEach(event => {
        counts[event.source] = (counts[event.source] || 0) + 1;
      });

      return counts;
    } catch (error) {
      this.logger.error(`Failed to get events by source: ${(error as Error).message}`);
      return {};
    }
  }

  /**
   * Clear event history
   */
  async clearEventHistory(olderThan?: Date): Promise<void> {
    try {
      if (olderThan) {
        const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
        const filteredEvents = events.filter(event => 
          new Date(event.timestamp) >= olderThan
        );
        await this.cacheService.set(this.EVENTS_KEY, filteredEvents, 86400000);
      } else {
        await this.cacheService.set(this.EVENTS_KEY, [], 86400000);
      }
    } catch (error) {
      this.logger.error(`Failed to clear event history: ${(error as Error).message}`);
    }
  }

  /**
   * Get event bus health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    queueSize: number;
    processingErrors: number;
    lastEventProcessed: Date | null;
    subscribers: number;
  }> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const recentErrors = events.filter(event => 
        event.type === EventType.SYSTEM_ERROR &&
        new Date(event.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // last hour
      ).length;

      const lastProcessedEvent = events
        .filter(event => event.processed)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const subscriberCount = Array.from(this.eventHandlers.values())
        .reduce((total, handlers) => total + handlers.length, 0);

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (recentErrors > 10) {
        status = 'unhealthy';
      } else if (recentErrors > 5) {
        status = 'degraded';
      }

      return {
        status,
        queueSize: events.filter(event => !event.processed).length,
        processingErrors: recentErrors,
        lastEventProcessed: lastProcessedEvent ? new Date(lastProcessedEvent.timestamp) : null,
        subscribers: subscriberCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get health status: ${(error as Error).message}`);
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
  subscribe(eventType: EventType | string, handler: Function): void {
    this.subscribeToEvent(eventType, handler);
  }

  /**
   * Mark event as processed
   */
  private async markEventAsProcessed(eventId: string): Promise<void> {
    try {
      const events = await this.cacheService.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex > -1) {
        events[eventIndex].processed = true;
        await this.cacheService.set(this.EVENTS_KEY, events, 86400000);
      }
    } catch (error) {
      this.logger.error(`Failed to mark event as processed: ${(error as Error).message}`);
    }
  }
}