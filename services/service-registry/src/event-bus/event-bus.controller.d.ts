import { EventBusService } from './event-bus.service';
import { EventDto, EventType, EventPriority } from './dto/event.dto';
export declare class EventBusController {
    private readonly eventBusService;
    constructor(eventBusService: EventBusService);
    publishEvent(eventDto: EventDto): Promise<{
        success: boolean;
        eventId: string;
    }>;
    getEventHistory(limit?: number, offset?: number, type?: EventType, priority?: EventPriority, source?: string, startDate?: string, endDate?: string): Promise<{
        events: EventDto[];
        total: number;
        offset: number;
        limit: number;
    }>;
    getEventStatistics(): Promise<{
        totalEvents: number;
        eventsByType: Record<EventType, number>;
        eventsByPriority: Record<EventPriority, number>;
        eventsBySource: Record<string, number>;
        recentActivity: {
            lastHour: number;
            last24Hours: number;
            lastWeek: number;
        };
    }>;
    getEvent(id: string): Promise<EventDto | null>;
    replayEvent(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAvailableEventTypes(): {
        types: EventType[];
        priorities: EventPriority[];
    };
    clearEventHistory(olderThan?: string): Promise<void>;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        queueSize: number;
        processingErrors: number;
        lastEventProcessed: Date | null;
        subscribers: number;
    }>;
}
//# sourceMappingURL=event-bus.controller.d.ts.map