"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteStatus = exports.InventoryMovementType = exports.RegulatoryDocType = exports.DealerSettlementStatus = exports.AmortizationMethod = exports.RepaymentFrequency = exports.DealerLoanStatus = exports.DeliveryStatus = exports.UPPFClaimStatus = exports.PricingWindowStatus = exports.PBUComponentUnit = exports.PBUComponentCategory = exports.ReportType = exports.AlertType = exports.SensorStatus = exports.PumpStatus = exports.PumpType = exports.DriverStatus = exports.TripStatus = exports.ReceiptStatus = exports.QualityStatus = exports.MovementType = exports.Currency = exports.UserRole = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.InvoiceStatus = exports.LoyaltyTier = exports.CustomerStatus = exports.CustomerType = exports.VehicleStatus = exports.VehicleType = exports.TankStatus = exports.TankType = exports.StationStatus = exports.StationType = exports.UserStatus = exports.PaymentStatus = exports.TransactionStatus = exports.PaymentMethod = exports.FuelType = void 0;
// Fuel Types used in Ghana
var FuelType;
(function (FuelType) {
    FuelType["PMS"] = "PMS";
    FuelType["AGO"] = "AGO";
    FuelType["IFO"] = "IFO";
    FuelType["LPG"] = "LPG";
    FuelType["KERO"] = "KERO";
})(FuelType || (exports.FuelType = FuelType = {}));
// Payment Methods
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["MOBILE_MONEY"] = "mobile_money";
    PaymentMethod["CREDIT"] = "credit";
    PaymentMethod["VOUCHER"] = "voucher";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// Transaction Status
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["DISPUTED"] = "disputed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
// Payment Status
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// User Status
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Station Type
var StationType;
(function (StationType) {
    StationType["RETAIL"] = "retail";
    StationType["DEPOT"] = "depot";
    StationType["TERMINAL"] = "terminal";
})(StationType || (exports.StationType = StationType = {}));
// Station Status
var StationStatus;
(function (StationStatus) {
    StationStatus["ACTIVE"] = "active";
    StationStatus["INACTIVE"] = "inactive";
    StationStatus["MAINTENANCE"] = "maintenance";
    StationStatus["CLOSED"] = "closed";
})(StationStatus || (exports.StationStatus = StationStatus = {}));
// Tank Type
var TankType;
(function (TankType) {
    TankType["UNDERGROUND"] = "underground";
    TankType["ABOVE_GROUND"] = "above_ground";
    TankType["MOBILE"] = "mobile";
})(TankType || (exports.TankType = TankType = {}));
// Tank Status
var TankStatus;
(function (TankStatus) {
    TankStatus["ACTIVE"] = "active";
    TankStatus["INACTIVE"] = "inactive";
    TankStatus["MAINTENANCE"] = "maintenance";
    TankStatus["DECOMMISSIONED"] = "decommissioned";
})(TankStatus || (exports.TankStatus = TankStatus = {}));
// Vehicle Type
var VehicleType;
(function (VehicleType) {
    VehicleType["TRUCK"] = "truck";
    VehicleType["TANKER"] = "tanker";
    VehicleType["VAN"] = "van";
    VehicleType["MOTORCYCLE"] = "motorcycle";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
// Vehicle Status
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["ACTIVE"] = "active";
    VehicleStatus["INACTIVE"] = "inactive";
    VehicleStatus["MAINTENANCE"] = "maintenance";
    VehicleStatus["BREAKDOWN"] = "breakdown";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));
// Customer Type
var CustomerType;
(function (CustomerType) {
    CustomerType["INDIVIDUAL"] = "individual";
    CustomerType["CORPORATE"] = "corporate";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
// Customer Status
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "active";
    CustomerStatus["INACTIVE"] = "inactive";
    CustomerStatus["SUSPENDED"] = "suspended";
    CustomerStatus["VIP"] = "vip";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
// Loyalty Tier
var LoyaltyTier;
(function (LoyaltyTier) {
    LoyaltyTier["BRONZE"] = "bronze";
    LoyaltyTier["SILVER"] = "silver";
    LoyaltyTier["GOLD"] = "gold";
    LoyaltyTier["PLATINUM"] = "platinum";
})(LoyaltyTier || (exports.LoyaltyTier = LoyaltyTier = {}));
// Invoice Status
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["VIEWED"] = "viewed";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
// Subscription Plan
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["STARTER"] = "starter";
    SubscriptionPlan["GROWTH"] = "growth";
    SubscriptionPlan["PROFESSIONAL"] = "professional";
    SubscriptionPlan["ENTERPRISE"] = "enterprise";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
// Subscription Status
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIAL"] = "trial";
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["SUSPENDED"] = "suspended";
    SubscriptionStatus["CANCELLED"] = "cancelled";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
// User Roles
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["COMPANY_ADMIN"] = "company_admin";
    UserRole["REGIONAL_MANAGER"] = "regional_manager";
    UserRole["STATION_MANAGER"] = "station_manager";
    UserRole["OPERATOR"] = "operator";
    UserRole["ACCOUNTANT"] = "accountant";
    UserRole["AUDITOR"] = "auditor";
    UserRole["DRIVER"] = "driver";
})(UserRole || (exports.UserRole = UserRole = {}));
// Currency
var Currency;
(function (Currency) {
    Currency["GHS"] = "GHS";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
})(Currency || (exports.Currency = Currency = {}));
// Movement Type
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "in";
    MovementType["OUT"] = "out";
    MovementType["ADJUSTMENT"] = "adjustment";
    MovementType["TRANSFER"] = "transfer";
    MovementType["LOSS"] = "loss";
})(MovementType || (exports.MovementType = MovementType = {}));
// Quality Status
var QualityStatus;
(function (QualityStatus) {
    QualityStatus["PENDING"] = "pending";
    QualityStatus["PASSED"] = "passed";
    QualityStatus["FAILED"] = "failed";
    QualityStatus["CONDITIONAL"] = "conditional";
})(QualityStatus || (exports.QualityStatus = QualityStatus = {}));
// Receipt Status
var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus["PENDING"] = "pending";
    ReceiptStatus["CONFIRMED"] = "confirmed";
    ReceiptStatus["DISPUTED"] = "disputed";
    ReceiptStatus["CANCELLED"] = "cancelled";
})(ReceiptStatus || (exports.ReceiptStatus = ReceiptStatus = {}));
// Trip Status
var TripStatus;
(function (TripStatus) {
    TripStatus["SCHEDULED"] = "scheduled";
    TripStatus["IN_PROGRESS"] = "in_progress";
    TripStatus["COMPLETED"] = "completed";
    TripStatus["CANCELLED"] = "cancelled";
    TripStatus["DELAYED"] = "delayed";
})(TripStatus || (exports.TripStatus = TripStatus = {}));
// Driver Status
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["ACTIVE"] = "active";
    DriverStatus["INACTIVE"] = "inactive";
    DriverStatus["SUSPENDED"] = "suspended";
    DriverStatus["TERMINATED"] = "terminated";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
// Pump Type
var PumpType;
(function (PumpType) {
    PumpType["DISPENSING"] = "dispensing";
    PumpType["LOADING"] = "loading";
    PumpType["TRANSFER"] = "transfer";
})(PumpType || (exports.PumpType = PumpType = {}));
// Pump Status
var PumpStatus;
(function (PumpStatus) {
    PumpStatus["ACTIVE"] = "active";
    PumpStatus["INACTIVE"] = "inactive";
    PumpStatus["MAINTENANCE"] = "maintenance";
    PumpStatus["FAULTY"] = "faulty";
})(PumpStatus || (exports.PumpStatus = PumpStatus = {}));
// Sensor Status
var SensorStatus;
(function (SensorStatus) {
    SensorStatus["NORMAL"] = "normal";
    SensorStatus["WARNING"] = "warning";
    SensorStatus["ERROR"] = "error";
    SensorStatus["OFFLINE"] = "offline";
})(SensorStatus || (exports.SensorStatus = SensorStatus = {}));
// Alert Type
var AlertType;
(function (AlertType) {
    AlertType["LOW_FUEL"] = "low_fuel";
    AlertType["HIGH_TEMPERATURE"] = "high_temperature";
    AlertType["WATER_CONTAMINATION"] = "water_contamination";
    AlertType["PUMP_FAILURE"] = "pump_failure";
    AlertType["SECURITY_BREACH"] = "security_breach";
    AlertType["PAYMENT_FAILURE"] = "payment_failure";
    AlertType["MAINTENANCE_DUE"] = "maintenance_due";
})(AlertType || (exports.AlertType = AlertType = {}));
// Report Type
var ReportType;
(function (ReportType) {
    ReportType["DAILY_SALES"] = "daily_sales";
    ReportType["INVENTORY"] = "inventory";
    ReportType["FINANCIAL"] = "financial";
    ReportType["REGULATORY"] = "regulatory";
    ReportType["PERFORMANCE"] = "performance";
    ReportType["AUDIT"] = "audit";
})(ReportType || (exports.ReportType = ReportType = {}));
// UPPF and Pricing Related Enums
// PBU Component Category
var PBUComponentCategory;
(function (PBUComponentCategory) {
    PBUComponentCategory["LEVY"] = "levy";
    PBUComponentCategory["REGULATORY_MARGIN"] = "regulatory_margin";
    PBUComponentCategory["DISTRIBUTION_MARGIN"] = "distribution_margin";
    PBUComponentCategory["OMC_MARGIN"] = "omc_margin";
    PBUComponentCategory["DEALER_MARGIN"] = "dealer_margin";
    PBUComponentCategory["OTHER"] = "other";
})(PBUComponentCategory || (exports.PBUComponentCategory = PBUComponentCategory = {}));
// PBU Component Unit
var PBUComponentUnit;
(function (PBUComponentUnit) {
    PBUComponentUnit["GHS_PER_LITRE"] = "GHS_per_litre";
    PBUComponentUnit["PERCENTAGE"] = "percentage";
})(PBUComponentUnit || (exports.PBUComponentUnit = PBUComponentUnit = {}));
// Pricing Window Status
var PricingWindowStatus;
(function (PricingWindowStatus) {
    PricingWindowStatus["DRAFT"] = "draft";
    PricingWindowStatus["ACTIVE"] = "active";
    PricingWindowStatus["CLOSED"] = "closed";
    PricingWindowStatus["ARCHIVED"] = "archived";
})(PricingWindowStatus || (exports.PricingWindowStatus = PricingWindowStatus = {}));
// UPPF Claim Status
var UPPFClaimStatus;
(function (UPPFClaimStatus) {
    UPPFClaimStatus["DRAFT"] = "draft";
    UPPFClaimStatus["READY_TO_SUBMIT"] = "ready_to_submit";
    UPPFClaimStatus["SUBMITTED"] = "submitted";
    UPPFClaimStatus["APPROVED"] = "approved";
    UPPFClaimStatus["PAID"] = "paid";
    UPPFClaimStatus["REJECTED"] = "rejected";
    UPPFClaimStatus["UNDER_REVIEW"] = "under_review";
})(UPPFClaimStatus || (exports.UPPFClaimStatus = UPPFClaimStatus = {}));
// Delivery Consignment Status
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["LOADED"] = "loaded";
    DeliveryStatus["IN_TRANSIT"] = "in_transit";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["VARIANCE_FLAGGED"] = "variance_flagged";
    DeliveryStatus["DISPUTED"] = "disputed";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
// Dealer Loan Status
var DealerLoanStatus;
(function (DealerLoanStatus) {
    DealerLoanStatus["ACTIVE"] = "active";
    DealerLoanStatus["COMPLETED"] = "completed";
    DealerLoanStatus["DEFAULTED"] = "defaulted";
    DealerLoanStatus["RESTRUCTURED"] = "restructured";
    DealerLoanStatus["SUSPENDED"] = "suspended";
})(DealerLoanStatus || (exports.DealerLoanStatus = DealerLoanStatus = {}));
// Loan Repayment Frequency
var RepaymentFrequency;
(function (RepaymentFrequency) {
    RepaymentFrequency["DAILY"] = "daily";
    RepaymentFrequency["WEEKLY"] = "weekly";
    RepaymentFrequency["BI_WEEKLY"] = "bi_weekly";
    RepaymentFrequency["MONTHLY"] = "monthly";
})(RepaymentFrequency || (exports.RepaymentFrequency = RepaymentFrequency = {}));
// Amortization Method
var AmortizationMethod;
(function (AmortizationMethod) {
    AmortizationMethod["REDUCING_BALANCE"] = "reducing_balance";
    AmortizationMethod["STRAIGHT_LINE"] = "straight_line";
})(AmortizationMethod || (exports.AmortizationMethod = AmortizationMethod = {}));
// Dealer Settlement Status
var DealerSettlementStatus;
(function (DealerSettlementStatus) {
    DealerSettlementStatus["CALCULATED"] = "calculated";
    DealerSettlementStatus["APPROVED"] = "approved";
    DealerSettlementStatus["PAID"] = "paid";
    DealerSettlementStatus["DISPUTED"] = "disputed";
})(DealerSettlementStatus || (exports.DealerSettlementStatus = DealerSettlementStatus = {}));
// Regulatory Document Type
var RegulatoryDocType;
(function (RegulatoryDocType) {
    RegulatoryDocType["PRICING_GUIDELINE"] = "pricing_guideline";
    RegulatoryDocType["PBU_TEMPLATE"] = "pbu_template";
    RegulatoryDocType["CIRCULAR"] = "circular";
    RegulatoryDocType["ACT"] = "act";
    RegulatoryDocType["REGULATION"] = "regulation";
    RegulatoryDocType["POLICY"] = "policy";
})(RegulatoryDocType || (exports.RegulatoryDocType = RegulatoryDocType = {}));
// Inventory Movement Type (Enhanced)
var InventoryMovementType;
(function (InventoryMovementType) {
    InventoryMovementType["PURCHASE"] = "purchase";
    InventoryMovementType["SALE"] = "sale";
    InventoryMovementType["TRANSFER"] = "transfer";
    InventoryMovementType["ADJUSTMENT"] = "adjustment";
    InventoryMovementType["LOSS"] = "loss";
    InventoryMovementType["RESERVED"] = "reserved";
    InventoryMovementType["RELEASED"] = "released";
    InventoryMovementType["REFUND"] = "refund";
    InventoryMovementType["SPILLAGE"] = "spillage";
    InventoryMovementType["EVAPORATION"] = "evaporation";
})(InventoryMovementType || (exports.InventoryMovementType = InventoryMovementType = {}));
// Route Status
var RouteStatus;
(function (RouteStatus) {
    RouteStatus["ACTIVE"] = "active";
    RouteStatus["INACTIVE"] = "inactive";
    RouteStatus["UNDER_REVIEW"] = "under_review";
    RouteStatus["SUSPENDED"] = "suspended";
})(RouteStatus || (exports.RouteStatus = RouteStatus = {}));
//# sourceMappingURL=enums.js.map