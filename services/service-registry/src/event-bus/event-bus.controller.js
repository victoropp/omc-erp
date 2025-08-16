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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_bus_service_1 = require("./event-bus.service");
const event_dto_1 = require("./dto/event.dto");
let EventBusController = class EventBusController {
    eventBusService;
    constructor(eventBusService) {
        this.eventBusService = eventBusService;
    }
    async publishEvent(eventDto) {
        const eventId = await this.eventBusService.publishEvent(eventDto);
        return { success: true, eventId };
    }
    async getEventHistory(limit = 100, offset = 0, type, priority, source, startDate, endDate) {
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
    async getEventStatistics() {
        const now = new Date();
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [totalEvents, eventsByType, eventsByPriority, eventsBySource, eventsLastHour, eventsLast24Hours, eventsLastWeek,] = await Promise.all([
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
    async getEvent(id) {
        return await this.eventBusService.getEvent(id);
    }
    async replayEvent(id) {
        const event = await this.eventBusService.getEvent(id);
        if (!event) {
            return { success: false, message: 'Event not found' };
        }
        // Create a replay event
        const replayEvent = {
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
    getAvailableEventTypes() {
        return {
            types: Object.values(event_dto_1.EventType),
            priorities: Object.values(event_dto_1.EventPriority),
        };
    }
    async clearEventHistory(olderThan) {
        const cutoffDate = olderThan ? new Date(olderThan) : undefined;
        await this.eventBusService.clearEventHistory(cutoffDate);
    }
    async getHealthStatus() {
        return await this.eventBusService.getHealthStatus();
    }
};
exports.EventBusController = EventBusController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a new event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Event published successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid event data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "publishEvent", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event history retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Maximum number of events to return' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, description: 'Number of events to skip' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: event_dto_1.EventType, description: 'Filter by event type' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: event_dto_1.EventPriority, description: 'Filter by event priority' }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, type: String, description: 'Filter by event source' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Filter events from this date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'Filter events to this date (ISO string)' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('priority')),
    __param(4, (0, common_1.Query)('source')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "getEventHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event bus statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "getEventStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific event by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('replay/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({ summary: 'Replay a specific event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID to replay' }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Event replay initiated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "replayEvent", null);
__decorate([
    (0, common_1.Get)('types/available'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available event types' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available event types retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], EventBusController.prototype, "getAvailableEventTypes", null);
__decorate([
    (0, common_1.Post)('clear-history'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Clear event history (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Event history cleared successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'olderThan', required: false, type: String, description: 'Clear events older than this date (ISO string)' }),
    __param(0, (0, common_1.Query)('olderThan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "clearEventHistory", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event bus health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event bus health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventBusController.prototype, "getHealthStatus", null);
exports.EventBusController = EventBusController = __decorate([
    (0, swagger_1.ApiTags)('Event Bus'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], EventBusController);
//# sourceMappingURL=event-bus.controller.js.map