export declare enum FuelType {
    PMS = "PMS",// Premium Motor Spirit (Petrol)
    AGO = "AGO",// Automotive Gas Oil (Diesel)
    IFO = "IFO",// Industrial Fuel Oil
    LPG = "LPG",// Liquefied Petroleum Gas
    KERO = "KERO"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    MOBILE_MONEY = "mobile_money",
    CREDIT = "credit",
    VOUCHER = "voucher"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    FAILED = "failed",
    DISPUTED = "disputed"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_VERIFICATION = "pending_verification"
}
export declare enum StationType {
    RETAIL = "retail",
    DEPOT = "depot",
    TERMINAL = "terminal"
}
export declare enum StationStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    CLOSED = "closed"
}
export declare enum TankType {
    UNDERGROUND = "underground",
    ABOVE_GROUND = "above_ground",
    MOBILE = "mobile"
}
export declare enum TankStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    DECOMMISSIONED = "decommissioned"
}
export declare enum VehicleType {
    TRUCK = "truck",
    TANKER = "tanker",
    VAN = "van",
    MOTORCYCLE = "motorcycle"
}
export declare enum VehicleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    BREAKDOWN = "breakdown"
}
export declare enum CustomerType {
    INDIVIDUAL = "individual",
    CORPORATE = "corporate"
}
export declare enum CustomerStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    VIP = "vip"
}
export declare enum LoyaltyTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    SENT = "sent",
    VIEWED = "viewed",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
export declare enum SubscriptionPlan {
    STARTER = "starter",
    GROWTH = "growth",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise"
}
export declare enum SubscriptionStatus {
    TRIAL = "trial",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled"
}
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    COMPANY_ADMIN = "company_admin",
    REGIONAL_MANAGER = "regional_manager",
    STATION_MANAGER = "station_manager",
    OPERATOR = "operator",
    ACCOUNTANT = "accountant",
    AUDITOR = "auditor",
    DRIVER = "driver"
}
export declare enum Currency {
    GHS = "GHS",// Ghana Cedi
    USD = "USD",// US Dollar
    EUR = "EUR",// Euro
    GBP = "GBP"
}
export declare enum MovementType {
    IN = "in",
    OUT = "out",
    ADJUSTMENT = "adjustment",
    TRANSFER = "transfer",
    LOSS = "loss"
}
export declare enum QualityStatus {
    PENDING = "pending",
    PASSED = "passed",
    FAILED = "failed",
    CONDITIONAL = "conditional"
}
export declare enum ReceiptStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    DISPUTED = "disputed",
    CANCELLED = "cancelled"
}
export declare enum TripStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    DELAYED = "delayed"
}
export declare enum DriverStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    TERMINATED = "terminated"
}
export declare enum PumpType {
    DISPENSING = "dispensing",
    LOADING = "loading",
    TRANSFER = "transfer"
}
export declare enum PumpStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    FAULTY = "faulty"
}
export declare enum SensorStatus {
    NORMAL = "normal",
    WARNING = "warning",
    ERROR = "error",
    OFFLINE = "offline"
}
export declare enum AlertType {
    LOW_FUEL = "low_fuel",
    HIGH_TEMPERATURE = "high_temperature",
    WATER_CONTAMINATION = "water_contamination",
    PUMP_FAILURE = "pump_failure",
    SECURITY_BREACH = "security_breach",
    PAYMENT_FAILURE = "payment_failure",
    MAINTENANCE_DUE = "maintenance_due"
}
export declare enum ReportType {
    DAILY_SALES = "daily_sales",
    INVENTORY = "inventory",
    FINANCIAL = "financial",
    REGULATORY = "regulatory",
    PERFORMANCE = "performance",
    AUDIT = "audit"
}
export declare enum PBUComponentCategory {
    LEVY = "levy",
    REGULATORY_MARGIN = "regulatory_margin",
    DISTRIBUTION_MARGIN = "distribution_margin",
    OMC_MARGIN = "omc_margin",
    DEALER_MARGIN = "dealer_margin",
    OTHER = "other"
}
export declare enum PBUComponentUnit {
    GHS_PER_LITRE = "GHS_per_litre",
    PERCENTAGE = "percentage"
}
export declare enum PricingWindowStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    CLOSED = "closed",
    ARCHIVED = "archived"
}
export declare enum UPPFClaimStatus {
    DRAFT = "draft",
    READY_TO_SUBMIT = "ready_to_submit",
    SUBMITTED = "submitted",
    APPROVED = "approved",
    PAID = "paid",
    REJECTED = "rejected",
    UNDER_REVIEW = "under_review"
}
export declare enum DeliveryStatus {
    LOADED = "loaded",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    VARIANCE_FLAGGED = "variance_flagged",
    DISPUTED = "disputed"
}
export declare enum DealerLoanStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted",
    RESTRUCTURED = "restructured",
    SUSPENDED = "suspended"
}
export declare enum RepaymentFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    BI_WEEKLY = "bi_weekly",
    MONTHLY = "monthly"
}
export declare enum AmortizationMethod {
    REDUCING_BALANCE = "reducing_balance",
    STRAIGHT_LINE = "straight_line"
}
export declare enum DealerSettlementStatus {
    CALCULATED = "calculated",
    APPROVED = "approved",
    PAID = "paid",
    DISPUTED = "disputed"
}
export declare enum RegulatoryDocType {
    PRICING_GUIDELINE = "pricing_guideline",
    PBU_TEMPLATE = "pbu_template",
    CIRCULAR = "circular",
    ACT = "act",
    REGULATION = "regulation",
    POLICY = "policy"
}
export declare enum InventoryMovementType {
    PURCHASE = "purchase",
    SALE = "sale",
    TRANSFER = "transfer",
    ADJUSTMENT = "adjustment",
    LOSS = "loss",
    RESERVED = "reserved",
    RELEASED = "released",
    REFUND = "refund",
    SPILLAGE = "spillage",
    EVAPORATION = "evaporation"
}
export declare enum RouteStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    UNDER_REVIEW = "under_review",
    SUSPENDED = "suspended"
}
//# sourceMappingURL=enums.d.ts.map