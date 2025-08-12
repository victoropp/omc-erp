// Fuel Types used in Ghana
export enum FuelType {
  PMS = 'PMS', // Premium Motor Spirit (Petrol)
  AGO = 'AGO', // Automotive Gas Oil (Diesel)
  IFO = 'IFO', // Industrial Fuel Oil
  LPG = 'LPG', // Liquefied Petroleum Gas
  KERO = 'KERO', // Kerosene
}

// Payment Methods
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  CREDIT = 'credit',
  VOUCHER = 'voucher',
}

// Transaction Status
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  DISPUTED = 'disputed',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// Station Type
export enum StationType {
  RETAIL = 'retail',
  DEPOT = 'depot',
  TERMINAL = 'terminal',
}

// Station Status
export enum StationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

// Tank Type
export enum TankType {
  UNDERGROUND = 'underground',
  ABOVE_GROUND = 'above_ground',
  MOBILE = 'mobile',
}

// Tank Status
export enum TankStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
}

// Vehicle Type
export enum VehicleType {
  TRUCK = 'truck',
  TANKER = 'tanker',
  VAN = 'van',
  MOTORCYCLE = 'motorcycle',
}

// Vehicle Status
export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
}

// Customer Type
export enum CustomerType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate',
}

// Customer Status
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  VIP = 'vip',
}

// Loyalty Tier
export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Subscription Plan
export enum SubscriptionPlan {
  STARTER = 'starter',
  GROWTH = 'growth',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// Subscription Status
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  REGIONAL_MANAGER = 'regional_manager',
  STATION_MANAGER = 'station_manager',
  OPERATOR = 'operator',
  ACCOUNTANT = 'accountant',
  AUDITOR = 'auditor',
  DRIVER = 'driver',
}

// Currency
export enum Currency {
  GHS = 'GHS', // Ghana Cedi
  USD = 'USD', // US Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
}

// Movement Type
export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  LOSS = 'loss',
}

// Quality Status
export enum QualityStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL = 'conditional',
}

// Receipt Status
export enum ReceiptStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

// Trip Status
export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed',
}

// Driver Status
export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

// Pump Type
export enum PumpType {
  DISPENSING = 'dispensing',
  LOADING = 'loading',
  TRANSFER = 'transfer',
}

// Pump Status
export enum PumpStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  FAULTY = 'faulty',
}

// Sensor Status
export enum SensorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  ERROR = 'error',
  OFFLINE = 'offline',
}

// Alert Type
export enum AlertType {
  LOW_FUEL = 'low_fuel',
  HIGH_TEMPERATURE = 'high_temperature',
  WATER_CONTAMINATION = 'water_contamination',
  PUMP_FAILURE = 'pump_failure',
  SECURITY_BREACH = 'security_breach',
  PAYMENT_FAILURE = 'payment_failure',
  MAINTENANCE_DUE = 'maintenance_due',
}

// Report Type
export enum ReportType {
  DAILY_SALES = 'daily_sales',
  INVENTORY = 'inventory',
  FINANCIAL = 'financial',
  REGULATORY = 'regulatory',
  PERFORMANCE = 'performance',
  AUDIT = 'audit',
}

// UPPF and Pricing Related Enums

// PBU Component Category
export enum PBUComponentCategory {
  LEVY = 'levy',
  REGULATORY_MARGIN = 'regulatory_margin',
  DISTRIBUTION_MARGIN = 'distribution_margin',
  OMC_MARGIN = 'omc_margin',
  DEALER_MARGIN = 'dealer_margin',
  OTHER = 'other',
}

// PBU Component Unit
export enum PBUComponentUnit {
  GHS_PER_LITRE = 'GHS_per_litre',
  PERCENTAGE = 'percentage',
}

// Pricing Window Status
export enum PricingWindowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

// UPPF Claim Status
export enum UPPFClaimStatus {
  DRAFT = 'draft',
  READY_TO_SUBMIT = 'ready_to_submit',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

// Delivery Consignment Status
export enum DeliveryStatus {
  LOADED = 'loaded',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  VARIANCE_FLAGGED = 'variance_flagged',
  DISPUTED = 'disputed',
}

// Dealer Loan Status
export enum DealerLoanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  RESTRUCTURED = 'restructured',
  SUSPENDED = 'suspended',
}

// Loan Repayment Frequency
export enum RepaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
}

// Amortization Method
export enum AmortizationMethod {
  REDUCING_BALANCE = 'reducing_balance',
  STRAIGHT_LINE = 'straight_line',
}

// Dealer Settlement Status
export enum DealerSettlementStatus {
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

// Regulatory Document Type
export enum RegulatoryDocType {
  PRICING_GUIDELINE = 'pricing_guideline',
  PBU_TEMPLATE = 'pbu_template',
  CIRCULAR = 'circular',
  ACT = 'act',
  REGULATION = 'regulation',
  POLICY = 'policy',
}

// Inventory Movement Type (Enhanced)
export enum InventoryMovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  LOSS = 'loss',
  RESERVED = 'reserved',
  RELEASED = 'released',
  REFUND = 'refund',
  SPILLAGE = 'spillage',
  EVAPORATION = 'evaporation',
}

// Route Status
export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended',
}