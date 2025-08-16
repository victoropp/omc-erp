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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishEventDto = exports.EventPriority = exports.EventType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var EventType;
(function (EventType) {
    EventType["SERVICE_REGISTERED"] = "service.registered";
    EventType["SERVICE_DEREGISTERED"] = "service.deregistered";
    EventType["SERVICE_HEALTH_CHANGED"] = "service.health.changed";
    EventType["SERVICE_METRICS_UPDATED"] = "service.metrics.updated";
    EventType["TRANSACTION_CREATED"] = "transaction.created";
    EventType["TRANSACTION_COMPLETED"] = "transaction.completed";
    EventType["PRICE_UPDATED"] = "price.updated";
    EventType["INVENTORY_LOW"] = "inventory.low";
    EventType["UPPF_CLAIM_SUBMITTED"] = "uppf.claim.submitted";
    EventType["DEALER_SETTLEMENT"] = "dealer.settlement";
    EventType["SYSTEM_ALERT"] = "system.alert";
    EventType["SYSTEM_ERROR"] = "system.error";
    EventType["USER_ACTION"] = "user.action";
})(EventType || (exports.EventType = EventType = {}));
var EventPriority;
(function (EventPriority) {
    EventPriority["LOW"] = "low";
    EventPriority["NORMAL"] = "normal";
    EventPriority["HIGH"] = "high";
    EventPriority["CRITICAL"] = "critical";
})(EventPriority || (exports.EventPriority = EventPriority = {}));
class PublishEventDto {
    type;
    data;
    source;
    priority = EventPriority.NORMAL;
    tags = [];
    targets = [];
    correlationId;
    ttl = 3600; // 1 hour default
}
exports.PublishEventDto = PublishEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event type',
        enum: EventType,
        example: EventType.SERVICE_REGISTERED,
    }),
    (0, class_validator_1.IsEnum)(EventType),
    __metadata("design:type", String)
], PublishEventDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event data payload',
        example: { serviceId: 'auth-service-123', status: 'healthy' },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PublishEventDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event source service',
        example: 'auth-service',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event priority',
        enum: EventPriority,
        example: EventPriority.NORMAL,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(EventPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event tags for filtering',
        example: ['authentication', 'security'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PublishEventDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target services (empty for broadcast)',
        example: ['pricing-service', 'accounting-service'],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], PublishEventDto.prototype, "targets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event correlation ID',
        example: 'corr_123456789',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublishEventDto.prototype, "correlationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event time-to-live in seconds',
        example: 300,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PublishEventDto.prototype, "ttl", void 0);
//# sourceMappingURL=event.dto.js.map