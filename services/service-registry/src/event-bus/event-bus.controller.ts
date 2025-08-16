import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EventBusService } from './event-bus.service';
import { EventDto, EventType, EventPriority } from './dto/event.dto';

@ApiTags('Event Bus')
@Controller('events')
export class EventBusController {
  constructor(private readonly eventBusService: EventBusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish a new event' })
  @ApiResponse({ status: 201, description: 'Event published successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event data' })
  async publishEvent(@Body() eventDto: EventDto): Promise<{ success: boolean; eventId: string }> {
    const eventId = await this.eventBusService.publishEvent(eventDto);
    return { success: true, eventId };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get event history' })
  @ApiResponse({ status: 200, description: 'Event history retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of events to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of events to skip' })
  @ApiQuery({ name: 'type', required: false, enum: EventType, description: 'Filter by event type' })
  @ApiQuery({ name: 'priority', required: false, enum: EventPriority, description: 'Filter by event priority' })
  @ApiQuery({ name: 'source', required: false, type: String, description: 'Filter by event source' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter events from this date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter events to this date (ISO string)' })
  async getEventHistory(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
    @Query('type') type?: EventType,
    @Query('priority') priority?: EventPriority,
    @Query('source') source?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    events: EventDto[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const filters = {
      type,
      priority,
      source,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const events = await this.eventBusService.getEventHistory(limit, offset, filters);
    const total = await this.eventBusService.getEventCount(filters);

    return {
      events,
      total,
      offset,
      limit,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event bus statistics' })
  @ApiResponse({ status: 200, description: 'Event statistics retrieved successfully' })
  async getEventStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<EventType, number>;
    eventsByPriority: Record<EventPriority, number>;
    eventsBySource: Record<string, number>;
    recentActivity: {
      lastHour: number;
      last24Hours: number;
      lastWeek: number;
    };
  }> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      eventsByType,
      eventsByPriority,
      eventsBySource,
      eventsLastHour,
      eventsLast24Hours,
      eventsLastWeek,
    ] = await Promise.all([
      this.eventBusService.getEventCount(),
      this.eventBusService.getEventsByType(),
      this.eventBusService.getEventsByPriority(),
      this.eventBusService.getEventsBySource(),
      this.eventBusService.getEventCount({ startDate: lastHour }),
      this.eventBusService.getEventCount({ startDate: last24Hours }),
      this.eventBusService.getEventCount({ startDate: lastWeek }),
    ]);

    return {
      totalEvents,
      eventsByType,
      eventsByPriority,
      eventsBySource,
      recentActivity: {
        lastHour: eventsLastHour,
        last24Hours: eventsLast24Hours,
        lastWeek: eventsLastWeek,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('id') id: string): Promise<EventDto | null> {
    return await this.eventBusService.getEvent(id);
  }

  @Post('replay/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Replay a specific event' })
  @ApiParam({ name: 'id', description: 'Event ID to replay' })
  @ApiResponse({ status: 202, description: 'Event replay initiated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async replayEvent(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    const event = await this.eventBusService.getEvent(id);
    
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    // Create a replay event
    const replayEvent: EventDto = {
      ...event,
      id: undefined, // Will be generated
      timestamp: new Date(),
      tags: [...(event.tags || []), 'replay'],
      data: {
        ...event.data,
        originalEventId: id,
        replayedAt: new Date(),
      },
    };

    await this.eventBusService.publishEvent(replayEvent);
    
    return { success: true, message: 'Event replayed successfully' };
  }

  @Get('types/available')
  @ApiOperation({ summary: 'Get all available event types' })
  @ApiResponse({ status: 200, description: 'Available event types retrieved successfully' })
  getAvailableEventTypes(): { types: EventType[]; priorities: EventPriority[] } {
    return {
      types: Object.values(EventType),
      priorities: Object.values(EventPriority),
    };
  }

  @Post('clear-history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear event history (admin only)' })
  @ApiResponse({ status: 204, description: 'Event history cleared successfully' })
  @ApiQuery({ name: 'olderThan', required: false, type: String, description: 'Clear events older than this date (ISO string)' })
  async clearEventHistory(@Query('olderThan') olderThan?: string): Promise<void> {
    const cutoffDate = olderThan ? new Date(olderThan) : undefined;
    await this.eventBusService.clearEventHistory(cutoffDate);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get event bus health status' })
  @ApiResponse({ status: 200, description: 'Event bus health status' })
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    queueSize: number;
    processingErrors: number;
    lastEventProcessed: Date | null;
    subscribers: number;
  }> {
    return await this.eventBusService.getHealthStatus();
  }
}