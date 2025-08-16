"use strict";
/**
 * Comprehensive Type Definitions for Ghana OMC ERP System
 * All interfaces and types used across the application
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFClaimStatus = exports.PricingWindowStatus = exports.Currency = exports.StationStatus = exports.UserStatus = exports.TransactionStatus = exports.PaymentMethod = exports.FuelType = exports.UserRole = exports.LeadStatus = exports.CustomerStatus = exports.PurchaseOrderStatus = exports.DeliveryStatus = exports.EmployeeStatus = exports.JournalEntryStatus = exports.AccountType = void 0;
// Re-export shared types
__exportStar(require("./shared"), exports);
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "asset";
    AccountType["LIABILITY"] = "liability";
    AccountType["EQUITY"] = "equity";
    AccountType["REVENUE"] = "revenue";
    AccountType["EXPENSE"] = "expense";
})(AccountType || (exports.AccountType = AccountType = {}));
var JournalEntryStatus;
(function (JournalEntryStatus) {
    JournalEntryStatus["DRAFT"] = "draft";
    JournalEntryStatus["PENDING_APPROVAL"] = "pending_approval";
    JournalEntryStatus["APPROVED"] = "approved";
    JournalEntryStatus["POSTED"] = "posted";
    JournalEntryStatus["REJECTED"] = "rejected";
})(JournalEntryStatus || (exports.JournalEntryStatus = JournalEntryStatus = {}));
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "active";
    EmployeeStatus["INACTIVE"] = "inactive";
    EmployeeStatus["ON_LEAVE"] = "on_leave";
    EmployeeStatus["TERMINATED"] = "terminated";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["SCHEDULED"] = "scheduled";
    DeliveryStatus["IN_TRANSIT"] = "in_transit";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["CANCELLED"] = "cancelled";
    DeliveryStatus["DELAYED"] = "delayed";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "draft";
    PurchaseOrderStatus["PENDING_APPROVAL"] = "pending_approval";
    PurchaseOrderStatus["APPROVED"] = "approved";
    PurchaseOrderStatus["SENT"] = "sent";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "partially_received";
    PurchaseOrderStatus["FULLY_RECEIVED"] = "fully_received";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "active";
    CustomerStatus["INACTIVE"] = "inactive";
    CustomerStatus["SUSPENDED"] = "suspended";
    CustomerStatus["VIP"] = "vip";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["PROPOSAL_SENT"] = "proposal_sent";
    LeadStatus["NEGOTIATING"] = "negotiating";
    LeadStatus["CONVERTED"] = "converted";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
// Export commonly used enums
var shared_1 = require("./shared");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return shared_1.UserRole; } });
Object.defineProperty(exports, "FuelType", { enumerable: true, get: function () { return shared_1.FuelType; } });
Object.defineProperty(exports, "PaymentMethod", { enumerable: true, get: function () { return shared_1.PaymentMethod; } });
Object.defineProperty(exports, "TransactionStatus", { enumerable: true, get: function () { return shared_1.TransactionStatus; } });
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return shared_1.UserStatus; } });
Object.defineProperty(exports, "StationStatus", { enumerable: true, get: function () { return shared_1.StationStatus; } });
Object.defineProperty(exports, "Currency", { enumerable: true, get: function () { return shared_1.Currency; } });
Object.defineProperty(exports, "PricingWindowStatus", { enumerable: true, get: function () { return shared_1.PricingWindowStatus; } });
Object.defineProperty(exports, "UPPFClaimStatus", { enumerable: true, get: function () { return shared_1.UPPFClaimStatus; } });
//# sourceMappingURL=index.js.map