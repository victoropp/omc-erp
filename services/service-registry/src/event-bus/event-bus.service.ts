import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { PublishEventDto, SystemEvent, EventType, EventPriority } from './dto/event.dto';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      this.logger.error(`Failed to initialize event bus: ${error.message}`);
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
      this.logger.error(`Failed to publish event: ${error.message}`);
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
    eventType?: EventType,
    source?: string,
    fromTimestamp?: Date,
    toTimestamp?: Date
  ): Promise<SystemEvent[]> {
    try {
      // Get events from cache/storage
      const events = await this.cacheManager.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      
      let filteredEvents = events;

      // Apply filters
      if (eventType) {
        filteredEvents = filteredEvents.filter(event => event.type === eventType);
      }

      if (source) {
        filteredEvents = filteredEvents.filter(event => event.source === source);
      }

      if (fromTimestamp) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) >= fromTimestamp
        );
      }

      if (toTimestamp) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) <= toTimestamp
        );
      }

      // Sort by timestamp (newest first) and limit
      return filteredEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to get event history: ${error.message}`);
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<SystemEvent | null> {
    try {
      const events = await this.cacheManager.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      return events.find(event => event.id === eventId) || null;
    } catch (error) {
      this.logger.error(`Failed to get event ${eventId}: ${error.message}`);
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
              this.logger.error(`Event handler error: ${error.message}`);
              return Promise.resolve();
            }
          })
        );
      }

      // Mark as processed
      await this.markEventAsProcessed(event.id);

    } catch (error) {
      this.logger.error(`Failed to handle incoming event: ${error.message}`);
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
    const { serviceId, oldStatus, newStatus } = event.data;
    
    if (newStatus === 'unhealthy' || newStatus === 'critical') {
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
      const events = await this.cacheManager.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      events.push(event);

      // Keep only the last 10000 events
      if (events.length > 10000) {
        events.splice(0, events.length - 10000);
      }

      await this.cacheManager.set(this.EVENTS_KEY, events, 86400000); // 24 hours
    } catch (error) {
      this.logger.error(`Failed to store event: ${error.message}`);
    }
  }

  /**
   * Mark event as processed
   */
  private async markEventAsProcessed(eventId: string): Promise<void> {
    try {
      const events = await this.cacheManager.get<SystemEvent[]>(this.EVENTS_KEY) || [];
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex > -1) {
        events[eventIndex].processed = true;
        await this.cacheManager.set(this.EVENTS_KEY, events, 86400000);
      }
    } catch (error) {
      this.logger.error(`Failed to mark event as processed: ${error.message}`);
    }
  }
}