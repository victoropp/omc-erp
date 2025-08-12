// Local shared types for the dashboard app

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

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// Station Status
export enum StationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

// Currency
export enum Currency {
  GHS = 'GHS', // Ghana Cedi
  USD = 'USD', // US Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
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