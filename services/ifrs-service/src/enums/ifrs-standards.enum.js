"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAS21TranslationMethod = exports.IAS21CurrencyType = exports.IAS36TestingMethod = exports.IAS2ValuationMethod = exports.IFRS16Perspective = exports.IFRS16LeaseType = exports.IFRS15RecognitionMethod = exports.IFRS9Stage = exports.IFRS9Classification = exports.AlertType = exports.ReportType = exports.CorrectionType = exports.TransactionCategory = exports.IssueSeverity = exports.ComplianceStatus = exports.IFRSStandard = void 0;
/**
 * IFRS Standards Enumeration
 * Complete list of International Financial Reporting Standards and International Accounting Standards
 */
var IFRSStandard;
(function (IFRSStandard) {
    // International Accounting Standards (IAS)
    IFRSStandard["IAS_1"] = "IAS_1";
    IFRSStandard["IAS_2"] = "IAS_2";
    IFRSStandard["IAS_7"] = "IAS_7";
    IFRSStandard["IAS_8"] = "IAS_8";
    IFRSStandard["IAS_10"] = "IAS_10";
    IFRSStandard["IAS_12"] = "IAS_12";
    IFRSStandard["IAS_16"] = "IAS_16";
    IFRSStandard["IAS_17"] = "IAS_17";
    IFRSStandard["IAS_18"] = "IAS_18";
    IFRSStandard["IAS_19"] = "IAS_19";
    IFRSStandard["IAS_20"] = "IAS_20";
    IFRSStandard["IAS_21"] = "IAS_21";
    IFRSStandard["IAS_23"] = "IAS_23";
    IFRSStandard["IAS_24"] = "IAS_24";
    IFRSStandard["IAS_26"] = "IAS_26";
    IFRSStandard["IAS_27"] = "IAS_27";
    IFRSStandard["IAS_28"] = "IAS_28";
    IFRSStandard["IAS_29"] = "IAS_29";
    IFRSStandard["IAS_32"] = "IAS_32";
    IFRSStandard["IAS_33"] = "IAS_33";
    IFRSStandard["IAS_34"] = "IAS_34";
    IFRSStandard["IAS_36"] = "IAS_36";
    IFRSStandard["IAS_37"] = "IAS_37";
    IFRSStandard["IAS_38"] = "IAS_38";
    IFRSStandard["IAS_39"] = "IAS_39";
    IFRSStandard["IAS_40"] = "IAS_40";
    IFRSStandard["IAS_41"] = "IAS_41";
    // International Financial Reporting Standards (IFRS)
    IFRSStandard["IFRS_1"] = "IFRS_1";
    IFRSStandard["IFRS_2"] = "IFRS_2";
    IFRSStandard["IFRS_3"] = "IFRS_3";
    IFRSStandard["IFRS_4"] = "IFRS_4";
    IFRSStandard["IFRS_5"] = "IFRS_5";
    IFRSStandard["IFRS_6"] = "IFRS_6";
    IFRSStandard["IFRS_7"] = "IFRS_7";
    IFRSStandard["IFRS_8"] = "IFRS_8";
    IFRSStandard["IFRS_9"] = "IFRS_9";
    IFRSStandard["IFRS_10"] = "IFRS_10";
    IFRSStandard["IFRS_11"] = "IFRS_11";
    IFRSStandard["IFRS_12"] = "IFRS_12";
    IFRSStandard["IFRS_13"] = "IFRS_13";
    IFRSStandard["IFRS_14"] = "IFRS_14";
    IFRSStandard["IFRS_15"] = "IFRS_15";
    IFRSStandard["IFRS_16"] = "IFRS_16";
    IFRSStandard["IFRS_17"] = "IFRS_17";
    IFRSStandard["IFRS_18"] = "IFRS_18";
})(IFRSStandard || (exports.IFRSStandard = IFRSStandard = {}));
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["COMPLIANT"] = "COMPLIANT";
    ComplianceStatus["NON_COMPLIANT"] = "NON_COMPLIANT";
    ComplianceStatus["PARTIALLY_COMPLIANT"] = "PARTIALLY_COMPLIANT";
    ComplianceStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ComplianceStatus["REQUIRES_ATTENTION"] = "REQUIRES_ATTENTION";
    ComplianceStatus["AUTOMATED_CORRECTION_APPLIED"] = "AUTOMATED_CORRECTION_APPLIED";
    ComplianceStatus["MANUAL_REVIEW_REQUIRED"] = "MANUAL_REVIEW_REQUIRED";
    ComplianceStatus["NOT_APPLICABLE"] = "NOT_APPLICABLE";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
var IssueSeverity;
(function (IssueSeverity) {
    IssueSeverity["LOW"] = "LOW";
    IssueSeverity["MEDIUM"] = "MEDIUM";
    IssueSeverity["HIGH"] = "HIGH";
    IssueSeverity["CRITICAL"] = "CRITICAL";
})(IssueSeverity || (exports.IssueSeverity = IssueSeverity = {}));
var TransactionCategory;
(function (TransactionCategory) {
    TransactionCategory["REVENUE"] = "REVENUE";
    TransactionCategory["EXPENSE"] = "EXPENSE";
    TransactionCategory["ASSET"] = "ASSET";
    TransactionCategory["LIABILITY"] = "LIABILITY";
    TransactionCategory["EQUITY"] = "EQUITY";
})(TransactionCategory || (exports.TransactionCategory = TransactionCategory = {}));
var CorrectionType;
(function (CorrectionType) {
    CorrectionType["AUTOMATED"] = "AUTOMATED";
    CorrectionType["MANUAL"] = "MANUAL";
    CorrectionType["SYSTEM_GENERATED"] = "SYSTEM_GENERATED";
    CorrectionType["USER_INITIATED"] = "USER_INITIATED";
})(CorrectionType || (exports.CorrectionType = CorrectionType = {}));
var ReportType;
(function (ReportType) {
    ReportType["COMPLIANCE_SUMMARY"] = "COMPLIANCE_SUMMARY";
    ReportType["DETAILED_ANALYSIS"] = "DETAILED_ANALYSIS";
    ReportType["EXCEPTION_REPORT"] = "EXCEPTION_REPORT";
    ReportType["TREND_ANALYSIS"] = "TREND_ANALYSIS";
    ReportType["RISK_ASSESSMENT"] = "RISK_ASSESSMENT";
    ReportType["REGULATORY_FILING"] = "REGULATORY_FILING";
})(ReportType || (exports.ReportType = ReportType = {}));
var AlertType;
(function (AlertType) {
    AlertType["CRITICAL_NON_COMPLIANCE"] = "CRITICAL_NON_COMPLIANCE";
    AlertType["THRESHOLD_BREACH"] = "THRESHOLD_BREACH";
    AlertType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    AlertType["CORRECTION_APPLIED"] = "CORRECTION_APPLIED";
    AlertType["MANUAL_REVIEW_NEEDED"] = "MANUAL_REVIEW_NEEDED";
    AlertType["REGULATORY_DEADLINE"] = "REGULATORY_DEADLINE";
})(AlertType || (exports.AlertType = AlertType = {}));
/**
 * IFRS 9 Financial Instrument Classifications
 */
var IFRS9Classification;
(function (IFRS9Classification) {
    IFRS9Classification["AMORTIZED_COST"] = "AMORTIZED_COST";
    IFRS9Classification["FAIR_VALUE_OCI"] = "FAIR_VALUE_OCI";
    IFRS9Classification["FAIR_VALUE_P_L"] = "FAIR_VALUE_P_L";
})(IFRS9Classification || (exports.IFRS9Classification = IFRS9Classification = {}));
/**
 * IFRS 9 Credit Loss Stages
 */
var IFRS9Stage;
(function (IFRS9Stage) {
    IFRS9Stage["STAGE_1"] = "STAGE_1";
    IFRS9Stage["STAGE_2"] = "STAGE_2";
    IFRS9Stage["STAGE_3"] = "STAGE_3";
})(IFRS9Stage || (exports.IFRS9Stage = IFRS9Stage = {}));
/**
 * IFRS 15 Revenue Recognition Methods
 */
var IFRS15RecognitionMethod;
(function (IFRS15RecognitionMethod) {
    IFRS15RecognitionMethod["POINT_IN_TIME"] = "POINT_IN_TIME";
    IFRS15RecognitionMethod["OVER_TIME"] = "OVER_TIME";
})(IFRS15RecognitionMethod || (exports.IFRS15RecognitionMethod = IFRS15RecognitionMethod = {}));
/**
 * IFRS 16 Lease Classifications
 */
var IFRS16LeaseType;
(function (IFRS16LeaseType) {
    IFRS16LeaseType["FINANCE_LEASE"] = "FINANCE_LEASE";
    IFRS16LeaseType["OPERATING_LEASE"] = "OPERATING_LEASE";
})(IFRS16LeaseType || (exports.IFRS16LeaseType = IFRS16LeaseType = {}));
var IFRS16Perspective;
(function (IFRS16Perspective) {
    IFRS16Perspective["LESSEE"] = "LESSEE";
    IFRS16Perspective["LESSOR"] = "LESSOR";
})(IFRS16Perspective || (exports.IFRS16Perspective = IFRS16Perspective = {}));
/**
 * IAS 2 Inventory Valuation Methods
 */
var IAS2ValuationMethod;
(function (IAS2ValuationMethod) {
    IAS2ValuationMethod["FIFO"] = "FIFO";
    IAS2ValuationMethod["WEIGHTED_AVERAGE"] = "WEIGHTED_AVERAGE";
    IAS2ValuationMethod["SPECIFIC_IDENTIFICATION"] = "SPECIFIC_IDENTIFICATION";
})(IAS2ValuationMethod || (exports.IAS2ValuationMethod = IAS2ValuationMethod = {}));
/**
 * IAS 36 Impairment Testing Methods
 */
var IAS36TestingMethod;
(function (IAS36TestingMethod) {
    IAS36TestingMethod["VALUE_IN_USE"] = "VALUE_IN_USE";
    IAS36TestingMethod["FAIR_VALUE_LESS_COSTS"] = "FAIR_VALUE_LESS_COSTS";
    IAS36TestingMethod["CASH_GENERATING_UNIT"] = "CASH_GENERATING_UNIT";
})(IAS36TestingMethod || (exports.IAS36TestingMethod = IAS36TestingMethod = {}));
/**
 * IAS 21 Functional Currency Types
 */
var IAS21CurrencyType;
(function (IAS21CurrencyType) {
    IAS21CurrencyType["FUNCTIONAL"] = "FUNCTIONAL";
    IAS21CurrencyType["PRESENTATION"] = "PRESENTATION";
    IAS21CurrencyType["FOREIGN"] = "FOREIGN";
})(IAS21CurrencyType || (exports.IAS21CurrencyType = IAS21CurrencyType = {}));
var IAS21TranslationMethod;
(function (IAS21TranslationMethod) {
    IAS21TranslationMethod["CURRENT_RATE"] = "CURRENT_RATE";
    IAS21TranslationMethod["TEMPORAL"] = "TEMPORAL";
    IAS21TranslationMethod["CURRENT_NON_CURRENT"] = "CURRENT_NON_CURRENT";
})(IAS21TranslationMethod || (exports.IAS21TranslationMethod = IAS21TranslationMethod = {}));
//# sourceMappingURL=ifrs-standards.enum.js.map