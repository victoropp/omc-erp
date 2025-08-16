import { EventBusService } from './event-bus.service';
import { EventDto, EventType } from './dto/event.dto';
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
export declare class EventHandlerService {
    private readonly eventBusService;
    private readonly logger;
    private readonly handlers;
    private readonly subscriptions;
    private eventProcessingStats;
    constructor(eventBusService: EventBusService);
    /**
     * Register an event handler
     */
    registerHandler(handler: EventHandler): void;
    /**
     * Subscribe to events with a callback
     */
    subscribe(eventType: EventType, callback: (event: EventDto) => Promise<void> | void, options?: {
        filter?: (event: EventDto) => boolean;
        id?: string;
    }): string;
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Get all active subscriptions
     */
    getSubscriptions(): EventSubscription[];
    /**
     * Process an event through all handlers and subscriptions
     */
    processEvent(event: EventDto): Promise<void>;
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
    };
    /**
     * Process event through registered handlers
     */
    private processEventHandlers;
    /**
     * Process event through active subscriptions
     */
    private processEventSubscriptions;
    /**
     * Initialize default event handlers
     */
    private initializeDefaultHandlers;
    /**
     * Start processing events from the event bus
     */
    private startEventProcessing;
    /**
     * Generate a unique subscription ID
     */
    private generateSubscriptionId;
}
//# sourceMappingURL=event-handler.service.d.ts.map