export declare enum EventType {
    SERVICE_REGISTERED = "service.registered",
    SERVICE_DEREGISTERED = "service.deregistered",
    SERVICE_HEALTH_CHANGED = "service.health.changed",
    SERVICE_METRICS_UPDATED = "service.metrics.updated",
    TRANSACTION_CREATED = "transaction.created",
    TRANSACTION_COMPLETED = "transaction.completed",
    PRICE_UPDATED = "price.updated",
    INVENTORY_LOW = "inventory.low",
    UPPF_CLAIM_SUBMITTED = "uppf.claim.submitted",
    DEALER_SETTLEMENT = "dealer.settlement",
    SYSTEM_ALERT = "system.alert",
    SYSTEM_ERROR = "system.error",
    USER_ACTION = "user.action"
}
export declare enum EventPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class PublishEventDto {
    type: EventType;
    data: any;
    source: string;
    priority?: EventPriority;
    tags?: string[];
    targets?: string[];
    correlationId?: string;
    ttl?: number;
}
export interface SystemEvent {
    id: string;
    type: EventType;
    data: any;
    source: string;
    priority: EventPriority;
    tags: string[];
    targets: string[];
    correlationId?: string;
    timestamp: Date;
    ttl: number;
    retryCount?: number;
    processed?: boolean;
}
export type EventDto = SystemEvent;
//# sourceMappingURL=event.dto.d.ts.map