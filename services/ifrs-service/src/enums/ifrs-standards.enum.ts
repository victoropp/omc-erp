/**
 * IFRS Standards Enumeration
 * Complete list of International Financial Reporting Standards and International Accounting Standards
 */
export enum IFRSStandard {
  // International Accounting Standards (IAS)
  IAS_1 = 'IAS_1',       // Presentation of Financial Statements
  IAS_2 = 'IAS_2',       // Inventories
  IAS_7 = 'IAS_7',       // Statement of Cash Flows
  IAS_8 = 'IAS_8',       // Accounting Policies, Changes in Accounting Estimates and Errors
  IAS_10 = 'IAS_10',     // Events after the Reporting Period
  IAS_12 = 'IAS_12',     // Income Taxes
  IAS_16 = 'IAS_16',     // Property, Plant and Equipment
  IAS_17 = 'IAS_17',     // Leases (superseded by IFRS 16)
  IAS_18 = 'IAS_18',     // Revenue (superseded by IFRS 15)
  IAS_19 = 'IAS_19',     // Employee Benefits
  IAS_20 = 'IAS_20',     // Government Grants
  IAS_21 = 'IAS_21',     // Foreign Currency Translation
  IAS_23 = 'IAS_23',     // Borrowing Costs
  IAS_24 = 'IAS_24',     // Related Party Disclosures
  IAS_26 = 'IAS_26',     // Retirement Benefit Plans
  IAS_27 = 'IAS_27',     // Separate Financial Statements
  IAS_28 = 'IAS_28',     // Investments in Associates and Joint Ventures
  IAS_29 = 'IAS_29',     // Financial Reporting in Hyperinflationary Economies
  IAS_32 = 'IAS_32',     // Financial Instruments: Presentation
  IAS_33 = 'IAS_33',     // Earnings per Share
  IAS_34 = 'IAS_34',     // Interim Financial Reporting
  IAS_36 = 'IAS_36',     // Impairment of Assets
  IAS_37 = 'IAS_37',     // Provisions, Contingent Liabilities and Contingent Assets
  IAS_38 = 'IAS_38',     // Intangible Assets
  IAS_39 = 'IAS_39',     // Financial Instruments: Recognition and Measurement
  IAS_40 = 'IAS_40',     // Investment Property
  IAS_41 = 'IAS_41',     // Agriculture

  // International Financial Reporting Standards (IFRS)
  IFRS_1 = 'IFRS_1',     // First-time Adoption of IFRS
  IFRS_2 = 'IFRS_2',     // Share-based Payment
  IFRS_3 = 'IFRS_3',     // Business Combinations
  IFRS_4 = 'IFRS_4',     // Insurance Contracts
  IFRS_5 = 'IFRS_5',     // Non-current Assets Held for Sale and Discontinued Operations
  IFRS_6 = 'IFRS_6',     // Exploration for and Evaluation of Mineral Resources
  IFRS_7 = 'IFRS_7',     // Financial Instruments: Disclosures
  IFRS_8 = 'IFRS_8',     // Operating Segments
  IFRS_9 = 'IFRS_9',     // Financial Instruments
  IFRS_10 = 'IFRS_10',   // Consolidated Financial Statements
  IFRS_11 = 'IFRS_11',   // Joint Arrangements
  IFRS_12 = 'IFRS_12',   // Disclosure of Interests in Other Entities
  IFRS_13 = 'IFRS_13',   // Fair Value Measurement
  IFRS_14 = 'IFRS_14',   // Regulatory Deferral Accounts
  IFRS_15 = 'IFRS_15',   // Revenue from Contracts with Customers
  IFRS_16 = 'IFRS_16',   // Leases
  IFRS_17 = 'IFRS_17',   // Insurance Contracts
  IFRS_18 = 'IFRS_18',   // General Presentation and Disclosure
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REQUIRES_ATTENTION = 'REQUIRES_ATTENTION',
  AUTOMATED_CORRECTION_APPLIED = 'AUTOMATED_CORRECTION_APPLIED',
  MANUAL_REVIEW_REQUIRED = 'MANUAL_REVIEW_REQUIRED',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TransactionCategory {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
}

export enum CorrectionType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  SYSTEM_GENERATED = 'SYSTEM_GENERATED',
  USER_INITIATED = 'USER_INITIATED',
}

export enum ReportType {
  COMPLIANCE_SUMMARY = 'COMPLIANCE_SUMMARY',
  DETAILED_ANALYSIS = 'DETAILED_ANALYSIS',
  EXCEPTION_REPORT = 'EXCEPTION_REPORT',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  REGULATORY_FILING = 'REGULATORY_FILING',
}

export enum AlertType {
  CRITICAL_NON_COMPLIANCE = 'CRITICAL_NON_COMPLIANCE',
  THRESHOLD_BREACH = 'THRESHOLD_BREACH',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CORRECTION_APPLIED = 'CORRECTION_APPLIED',
  MANUAL_REVIEW_NEEDED = 'MANUAL_REVIEW_NEEDED',
  REGULATORY_DEADLINE = 'REGULATORY_DEADLINE',
}

/**
 * IFRS 9 Financial Instrument Classifications
 */
export enum IFRS9Classification {
  AMORTIZED_COST = 'AMORTIZED_COST',
  FAIR_VALUE_OCI = 'FAIR_VALUE_OCI',
  FAIR_VALUE_P_L = 'FAIR_VALUE_P_L',
}

/**
 * IFRS 9 Credit Loss Stages
 */
export enum IFRS9Stage {
  STAGE_1 = 'STAGE_1', // 12-month ECL
  STAGE_2 = 'STAGE_2', // Lifetime ECL (not credit-impaired)
  STAGE_3 = 'STAGE_3', // Lifetime ECL (credit-impaired)
}

/**
 * IFRS 15 Revenue Recognition Methods
 */
export enum IFRS15RecognitionMethod {
  POINT_IN_TIME = 'POINT_IN_TIME',
  OVER_TIME = 'OVER_TIME',
}

/**
 * IFRS 16 Lease Classifications
 */
export enum IFRS16LeaseType {
  FINANCE_LEASE = 'FINANCE_LEASE',
  OPERATING_LEASE = 'OPERATING_LEASE',
}

export enum IFRS16Perspective {
  LESSEE = 'LESSEE',
  LESSOR = 'LESSOR',
}

/**
 * IAS 2 Inventory Valuation Methods
 */
export enum IAS2ValuationMethod {
  FIFO = 'FIFO',
  WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE',
  SPECIFIC_IDENTIFICATION = 'SPECIFIC_IDENTIFICATION',
}

/**
 * IAS 36 Impairment Testing Methods
 */
export enum IAS36TestingMethod {
  VALUE_IN_USE = 'VALUE_IN_USE',
  FAIR_VALUE_LESS_COSTS = 'FAIR_VALUE_LESS_COSTS',
  CASH_GENERATING_UNIT = 'CASH_GENERATING_UNIT',
}

/**
 * IAS 21 Functional Currency Types
 */
export enum IAS21CurrencyType {
  FUNCTIONAL = 'FUNCTIONAL',
  PRESENTATION = 'PRESENTATION',
  FOREIGN = 'FOREIGN',
}

export enum IAS21TranslationMethod {
  CURRENT_RATE = 'CURRENT_RATE',
  TEMPORAL = 'TEMPORAL',
  CURRENT_NON_CURRENT = 'CURRENT_NON_CURRENT',
}