import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { EventDto, EventType, EventPriority } from './dto/event.dto';

export interface EventHandler {
  eventType: EventType;
  priority?: number;
  handler: (event: EventDto) => Promise<void> | void;
  description?: string;
}

export interface EventSubscription {
  id: string;
  eventType: EventType;
  callback: (event: EventDto) => Promise<void> | void;
  filter?: (event: EventDto) => boolean;
  active: boolean;
  subscribedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

@Injectable()
export class EventHandlerService {
  private readonly logger = new Logger(EventHandlerService.name);
  private readonly handlers = new Map<EventType, EventHandler[]>();
  private readonly subscriptions = new Map<string, EventSubscription>();
  private eventProcessingStats = {
    totalProcessed: 0,
    totalErrors: 0,
    processingTimes: [] as number[],
    lastProcessed: null as Date | null,
  };

  constructor(private readonly eventBusService: EventBusService) {
    this.initializeDefaultHandlers();
    this.startEventProcessing();
  }

  /**
   * Register an event handler
   */
  registerHandler(handler: EventHandler): void {
    if (!this.handlers.has(handler.eventType)) {
      this.handlers.set(handler.eventType, []);
    }

    const existingHandlers = this.handlers.get(handler.eventType)!;
    existingHandlers.push(handler);

    // Sort by priority (higher priority first)
    existingHandlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.logger.log(`Registered handler for event type: ${handler.eventType}`);
  }

  /**
   * Subscribe to events with a callback
   */
  subscribe(
    eventType: EventType,
    callback: (event: EventDto) => Promise<void> | void,
    options?: {
      filter?: (event: EventDto) => boolean;
      id?: string;
    }
  ): string {
    const id = options?.id || this.generateSubscriptionId();
    
    const subscription: EventSubscription = {
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
  unsubscribe(subscriptionId: string): boolean {
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
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.active);
  }

  /**
   * Process an event through all handlers and subscriptions
   */
  async processEvent(event: EventDto): Promise<void> {
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
      
    } catch (error) {
      this.eventProcessingStats.totalErrors++;
      this.logger.error(`Failed to process event ${event.id}: ${(error as Error).message}`);
      
      // Publish error event
      await this.eventBusService.publishEvent({
        type: EventType.SYSTEM_ERROR,
        data: {
          originalEvent: event,
          error: (error as Error).message,
          processingTime: Date.now() - startTime,
        },
        source: 'event-handler-service',
        priority: EventPriority.HIGH,
        tags: ['event-processing-error'],
      });
      
      throw error;
    }
  }

  /**
   * Get event processing statistics
   */
  getProcessingStats(): {
    totalProcessed: number;
    totalErrors: number;
    averageProcessingTime: number;
    lastProcessed: Date | null;
    activeSubscriptions: number;
    registeredHandlers: number;
  } {
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
  private async processEventHandlers(event: EventDto): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.length === 0) {
      return;
    }

    const promises = handlers.map(async (handler) => {
      try {
        await Promise.resolve(handler.handler(event));
      } catch (error) {
        this.logger.error(`Handler failed for event ${event.id}: ${(error as Error).message}`);
        throw error;
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Process event through active subscriptions
   */
  private async processEventSubscriptions(event: EventDto): Promise<void> {
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
      } catch (error) {
        this.logger.error(`Subscription ${subscription.id} failed for event ${event.id}: ${(error as Error).message}`);
        throw error;
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Initialize default event handlers
   */
  private initializeDefaultHandlers(): void {
    // Service registration handler
    this.registerHandler({
      eventType: EventType.SERVICE_REGISTERED,
      priority: 10,
      handler: async (event: EventDto) => {
        this.logger.log(`Service registered: ${event.data.serviceName} at ${event.data.host}:${event.data.port}`);
      },
      description: 'Log service registration events',
    });

    // Service deregistration handler
    this.registerHandler({
      eventType: EventType.SERVICE_DEREGISTERED,
      priority: 10,
      handler: async (event: EventDto) => {
        this.logger.log(`Service deregistered: ${event.data.serviceName} (${event.data.serviceId})`);
      },
      description: 'Log service deregistration events',
    });

    // Service health change handler
    this.registerHandler({
      eventType: EventType.SERVICE_HEALTH_CHANGED,
      priority: 10,
      handler: async (event: EventDto) => {
        const { serviceName, oldStatus, newStatus } = event.data;
        if (newStatus === 'unhealthy') {
          this.logger.warn(`Service ${serviceName} became unhealthy (was ${oldStatus})`);
        } else if (newStatus === 'healthy' && oldStatus === 'unhealthy') {
          this.logger.log(`Service ${serviceName} recovered (was ${oldStatus})`);
        }
      },
      description: 'Log service health changes',
    });

    // System alert handler
    this.registerHandler({
      eventType: EventType.SYSTEM_ALERT,
      priority: 10,
      handler: async (event: EventDto) => {
        const { severity, title, message } = event.data;
        if (severity === 'critical') {
          this.logger.error(`CRITICAL ALERT: ${title} - ${message}`);
        } else if (severity === 'high') {
          this.logger.warn(`HIGH ALERT: ${title} - ${message}`);
        } else {
          this.logger.log(`ALERT: ${title} - ${message}`);
        }
      },
      description: 'Log system alerts',
    });

    // System error handler
    this.registerHandler({
      eventType: EventType.SYSTEM_ERROR,
      priority: 10,
      handler: async (event: EventDto) => {
        this.logger.error(`System error: ${event.data.error}`);
      },
      description: 'Log system errors',
    });

    this.logger.log('Default event handlers initialized');
  }

  /**
   * Start processing events from the event bus
   */
  private startEventProcessing(): void {
    // Subscribe to all event types for processing
    Object.values(EventType).forEach(eventType => {
      this.eventBusService.subscribe(eventType, async (event: EventDto) => {
        await this.processEvent(event);
      });
    });

    this.logger.log('Event processing started');
  }

  /**
   * Generate a unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}