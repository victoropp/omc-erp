import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

export enum IFRSStandard {
  IFRS_1 = 'IFRS 1 - First-time Adoption',
  IFRS_2 = 'IFRS 2 - Share-based Payment',
  IFRS_3 = 'IFRS 3 - Business Combinations',
  IFRS_4 = 'IFRS 4 - Insurance Contracts',
  IFRS_5 = 'IFRS 5 - Non-current Assets Held for Sale',
  IFRS_6 = 'IFRS 6 - Exploration for and Evaluation of Mineral Resources',
  IFRS_7 = 'IFRS 7 - Financial Instruments: Disclosures',
  IFRS_8 = 'IFRS 8 - Operating Segments',
  IFRS_9 = 'IFRS 9 - Financial Instruments',
  IFRS_10 = 'IFRS 10 - Consolidated Financial Statements',
  IFRS_11 = 'IFRS 11 - Joint Arrangements',
  IFRS_12 = 'IFRS 12 - Disclosure of Interests in Other Entities',
  IFRS_13 = 'IFRS 13 - Fair Value Measurement',
  IFRS_14 = 'IFRS 14 - Regulatory Deferral Accounts',
  IFRS_15 = 'IFRS 15 - Revenue from Contracts with Customers',
  IFRS_16 = 'IFRS 16 - Leases',
  IFRS_17 = 'IFRS 17 - Insurance Contracts',
  IAS_1 = 'IAS 1 - Presentation of Financial Statements',
  IAS_2 = 'IAS 2 - Inventories',
  IAS_7 = 'IAS 7 - Statement of Cash Flows',
  IAS_8 = 'IAS 8 - Accounting Policies',
  IAS_10 = 'IAS 10 - Events after the Reporting Period',
  IAS_12 = 'IAS 12 - Income Taxes',
  IAS_16 = 'IAS 16 - Property, Plant and Equipment',
  IAS_19 = 'IAS 19 - Employee Benefits',
  IAS_20 = 'IAS 20 - Government Grants',
  IAS_21 = 'IAS 21 - Effects of Changes in Foreign Exchange Rates',
  IAS_23 = 'IAS 23 - Borrowing Costs',
  IAS_24 = 'IAS 24 - Related Party Disclosures',
  IAS_26 = 'IAS 26 - Accounting and Reporting by Retirement Benefit Plans',
  IAS_27 = 'IAS 27 - Separate Financial Statements',
  IAS_28 = 'IAS 28 - Investments in Associates',
  IAS_29 = 'IAS 29 - Financial Reporting in Hyperinflationary Economies',
  IAS_32 = 'IAS 32 - Financial Instruments: Presentation',
  IAS_33 = 'IAS 33 - Earnings per Share',
  IAS_34 = 'IAS 34 - Interim Financial Reporting',
  IAS_36 = 'IAS 36 - Impairment of Assets',
  IAS_37 = 'IAS 37 - Provisions, Contingent Liabilities',
  IAS_38 = 'IAS 38 - Intangible Assets',
  IAS_40 = 'IAS 40 - Investment Property',
  IAS_41 = 'IAS 41 - Agriculture'
}

export enum AdjustmentType {
  MEASUREMENT = 'MEASUREMENT',
  RECOGNITION = 'RECOGNITION',
  CLASSIFICATION = 'CLASSIFICATION',
  PRESENTATION = 'PRESENTATION',
  DISCLOSURE = 'DISCLOSURE',
  RECLASSIFICATION = 'RECLASSIFICATION',
  IMPAIRMENT = 'IMPAIRMENT',
  FAIR_VALUE = 'FAIR_VALUE'
}

export enum AdjustmentStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  REJECTED = 'REJECTED',
  REVERSED = 'REVERSED'
}

@Entity('ifrs_adjustments')
@Index(['tenantId', 'adjustmentDate'])
@Index(['ifrsStandard', 'adjustmentType'])
@Index(['status'])
export class IFRSAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'adjustment_number', length: 50, unique: true })
  adjustmentNumber: string;

  @Column({ name: 'adjustment_date' })
  adjustmentDate: Date;

  @Column({ name: 'accounting_period_id' })
  accountingPeriodId: string;

  @Column({ 
    name: 'ifrs_standard', 
    type: 'enum', 
    enum: IFRSStandard 
  })
  ifrsStandard: IFRSStandard;

  @Column({ 
    name: 'adjustment_type', 
    type: 'enum', 
    enum: AdjustmentType 
  })
  adjustmentType: AdjustmentType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'rationale', type: 'text' })
  rationale: string; // Business rationale for the adjustment

  @Column({ name: 'affected_accounts', type: 'text' })
  affectedAccounts: string; // JSON array of affected GL accounts

  @Column({ 
    name: 'total_debit_amount', 
    type: 'decimal', 
    precision: 15, 
    scale: 2 
  })
  totalDebitAmount: number;

  @Column({ 
    name: 'total_credit_amount', 
    type: 'decimal', 
    precision: 15, 
    scale: 2 
  })
  totalCreditAmount: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: AdjustmentStatus,
    default: AdjustmentStatus.DRAFT
  })
  status: AdjustmentStatus;

  // Journal Entry Integration
  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @Column({ name: 'is_posted_to_gl', default: false })
  isPostedToGL: boolean;

  @Column({ name: 'posting_date', nullable: true })
  postingDate: Date;

  // Source Information
  @Column({ name: 'source_system', length: 50, nullable: true })
  sourceSystem: string;

  @Column({ name: 'source_document_id', nullable: true })
  sourceDocumentId: string;

  @Column({ name: 'source_transaction_id', nullable: true })
  sourceTransactionId: string;

  // IFRS Specific Fields
  @Column({ name: 'ifrs_paragraph_reference', length: 100, nullable: true })
  ifrsParagraphReference: string; // Specific IFRS paragraph

  @Column({ name: 'interpretation_reference', length: 100, nullable: true })
  interpretationReference: string; // IFRIC interpretation

  @Column({ name: 'measurement_model', length: 50, nullable: true })
  measurementModel: string; // Cost model, fair value model, etc.

  @Column({ name: 'fair_value_hierarchy', length: 20, nullable: true })
  fairValueHierarchy: string; // Level 1, 2, or 3

  @Column({ name: 'recurring_measurement', default: false })
  recurringMeasurement: boolean;

  @Column({ name: 'next_measurement_date', nullable: true })
  nextMeasurementDate: Date;

  // Ghana Specific Compliance
  @Column({ name: 'icag_compliant', default: false })
  icagCompliant: boolean; // Institute of Chartered Accountants Ghana

  @Column({ name: 'gse_reporting_impact', default: false })
  gseReportingImpact: boolean; // Ghana Stock Exchange impact

  @Column({ name: 'sec_filing_impact', default: false })
  secFilingImpact: boolean; // Securities and Exchange Commission

  // Risk and Control
  @Column({ name: 'risk_assessment', length: 20, default: 'MEDIUM' })
  riskAssessment: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ name: 'requires_external_audit', default: false })
  requiresExternalAudit: boolean;

  @Column({ name: 'audit_trail', type: 'text', nullable: true })
  auditTrail: string; // JSON array of audit events

  // Approval Workflow
  @Column({ name: 'prepared_by' })
  preparedBy: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'review_date', nullable: true })
  reviewDate: Date;

  @Column({ name: 'approval_date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Impact Analysis
  @Column({ name: 'financial_statement_impact', type: 'text', nullable: true })
  financialStatementImpact: string; // JSON with impact details

  @Column({ name: 'ratio_impact_analysis', type: 'text', nullable: true })
  ratioImpactAnalysis: string; // Impact on key financial ratios

  @Column({ name: 'comparative_period_impact', default: false })
  comparativePeriodImpact: boolean;

  // Documentation and Evidence
  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'calculation_workings', type: 'text', nullable: true })
  calculationWorkings: string; // Detailed calculations

  @Column({ name: 'management_assumptions', type: 'text', nullable: true })
  managementAssumptions: string; // Key assumptions made

  // Reversal Information
  @Column({ name: 'is_reversible', default: true })
  isReversible: boolean;

  @Column({ name: 'reversal_date', nullable: true })
  reversalDate: Date;

  @Column({ name: 'reversed_by', nullable: true })
  reversedBy: string;

  @Column({ name: 'reversal_reason', type: 'text', nullable: true })
  reversalReason: string;

  @Column({ name: 'reversal_journal_entry_id', nullable: true })
  reversalJournalEntryId: string;

  // Notifications and Alerts
  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  @Column({ name: 'stakeholders_notified', type: 'text', nullable: true })
  stakeholdersNotified: string; // JSON array of notified parties

  @Column({ name: 'disclosure_required', default: false })
  disclosureRequired: boolean;

  @Column({ name: 'disclosure_notes', type: 'text', nullable: true })
  disclosureNotes: string;

  // Automation and AI
  @Column({ name: 'auto_generated', default: false })
  autoGenerated: boolean;

  @Column({ name: 'ai_confidence_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  aiConfidenceScore: number; // 0.0000 to 1.0000

  @Column({ name: 'ai_model_version', length: 50, nullable: true })
  aiModelVersion: string;

  @Column({ name: 'manual_review_required', default: true })
  manualReviewRequired: boolean;

  // Audit and Compliance
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_modified_by', nullable: true })
  lastModifiedBy: string;

  @Column({ name: 'version_number', default: 1 })
  versionNumber: number;

  @Column({ name: 'is_current_version', default: true })
  isCurrentVersion: boolean;
}