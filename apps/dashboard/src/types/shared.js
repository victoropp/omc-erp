"use strict";
// Local shared types for the dashboard app
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFClaimStatus = exports.PricingWindowStatus = exports.Currency = exports.StationStatus = exports.UserStatus = exports.TransactionStatus = exports.PaymentMethod = exports.FuelType = exports.UserRole = void 0;
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
// User Status
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Station Status
var StationStatus;
(function (StationStatus) {
    StationStatus["ACTIVE"] = "active";
    StationStatus["INACTIVE"] = "inactive";
    StationStatus["MAINTENANCE"] = "maintenance";
    StationStatus["CLOSED"] = "closed";
})(StationStatus || (exports.StationStatus = StationStatus = {}));
// Currency
var Currency;
(function (Currency) {
    Currency["GHS"] = "GHS";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
})(Currency || (exports.Currency = Currency = {}));
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
//# sourceMappingURL=shared.js.map