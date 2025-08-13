import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum ContractType {
  SUPPLY_AGREEMENT = 'SUPPLY_AGREEMENT',
  SERVICE_AGREEMENT = 'SERVICE_AGREEMENT',
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  DISTRIBUTION_AGREEMENT = 'DISTRIBUTION_AGREEMENT',
  TRANSPORTATION_AGREEMENT = 'TRANSPORTATION_AGREEMENT',
  STORAGE_AGREEMENT = 'STORAGE_AGREEMENT',
  FRANCHISE_AGREEMENT = 'FRANCHISE_AGREEMENT',
  LEASE_AGREEMENT = 'LEASE_AGREEMENT',
  EMPLOYMENT_CONTRACT = 'EMPLOYMENT_CONTRACT',
  CONSULTANCY_AGREEMENT = 'CONSULTANCY_AGREEMENT',
  NDA = 'NDA',
  SLA = 'SLA',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED',
  RENEWED = 'RENEWED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentTerms {
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  IMMEDIATE = 'IMMEDIATE',
  ON_DELIVERY = 'ON_DELIVERY',
  MILESTONE_BASED = 'MILESTONE_BASED',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
}

export enum RenewalType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
}

@Entity('contracts')
@Index(['tenantId', 'contractNumber'], { unique: true })
@Index(['tenantId', 'status'])
@Index(['tenantId', 'expiryDate'])
@Index(['tenantId', 'contractType'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', length: 50 })
  tenantId: string;

  @Column({ name: 'contract_number', length: 100, unique: true })
  contractNumber: string;

  @Column({ name: 'contract_title', length: 500 })
  contractTitle: string;

  @Column({ name: 'contract_type', type: 'enum', enum: ContractType })
  contractType: ContractType;

  @Column({ name: 'status', type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  // Parties Information
  @Column({ name: 'party_a_id', length: 50 })
  partyAId: string; // Usually the company

  @Column({ name: 'party_a_name', length: 255 })
  partyAName: string;

  @Column({ name: 'party_a_representative', length: 255, nullable: true })
  partyARepresentative: string;

  @Column({ name: 'party_a_designation', length: 100, nullable: true })
  partyADesignation: string;

  @Column({ name: 'party_b_id', length: 50 })
  partyBId: string; // Vendor/Customer/Employee

  @Column({ name: 'party_b_name', length: 255 })
  partyBName: string;

  @Column({ name: 'party_b_representative', length: 255, nullable: true })
  partyBRepresentative: string;

  @Column({ name: 'party_b_designation', length: 100, nullable: true })
  partyBDesignation: string;

  @Column({ name: 'party_b_type', length: 50 })
  partyBType: string; // VENDOR, CUSTOMER, EMPLOYEE, PARTNER

  // Contract Duration
  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  @Column({ name: 'duration_months', type: 'int', nullable: true })
  durationMonths: number;

  @Column({ name: 'notice_period_days', type: 'int', default: 30 })
  noticePeriodDays: number;

  // Financial Terms
  @Column({ name: 'contract_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  contractValue: number;

  @Column({ name: 'currency', length: 10, default: 'GHS' })
  currency: string;

  @Column({ name: 'payment_terms', type: 'enum', enum: PaymentTerms, default: PaymentTerms.NET_30 })
  paymentTerms: PaymentTerms;

  @Column({ name: 'billing_frequency', length: 50, nullable: true })
  billingFrequency: string; // MONTHLY, QUARTERLY, ANNUALLY, PER_DELIVERY

  @Column({ name: 'minimum_order_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumOrderValue: number;

  @Column({ name: 'maximum_order_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumOrderValue: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ name: 'penalty_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  penaltyRate: number; // Late payment penalty

  @Column({ name: 'security_deposit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  securityDeposit: number;

  // Product/Service Details
  @Column({ name: 'products_services', type: 'simple-array', nullable: true })
  productsServices: string[];

  @Column({ name: 'delivery_terms', type: 'text', nullable: true })
  deliveryTerms: string;

  @Column({ name: 'quality_specifications', type: 'text', nullable: true })
  qualitySpecifications: string;

  @Column({ name: 'volume_commitment', type: 'decimal', precision: 15, scale: 2, nullable: true })
  volumeCommitment: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 4, nullable: true })
  unitPrice: number;

  @Column({ name: 'price_adjustment_clause', type: 'text', nullable: true })
  priceAdjustmentClause: string;

  // Ghana Specific Fields
  @Column({ name: 'requires_npa_approval', type: 'boolean', default: false })
  requiresNpaApproval: boolean;

  @Column({ name: 'npa_approval_number', length: 100, nullable: true })
  npaApprovalNumber: string;

  @Column({ name: 'npa_approval_date', type: 'date', nullable: true })
  npaApprovalDate: Date;

  @Column({ name: 'local_content_requirement', type: 'decimal', precision: 5, scale: 2, default: 0 })
  localContentRequirement: number;

  @Column({ name: 'tax_exemption_applicable', type: 'boolean', default: false })
  taxExemptionApplicable: boolean;

  @Column({ name: 'withholding_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  withholdingTaxRate: number;

  @Column({ name: 'vat_applicable', type: 'boolean', default: true })
  vatApplicable: boolean;

  @Column({ name: 'stamp_duty_paid', type: 'boolean', default: false })
  stampDutyPaid: boolean;

  @Column({ name: 'stamp_duty_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  stampDutyAmount: number;

  // Performance Terms
  @Column({ name: 'sla_defined', type: 'boolean', default: false })
  slaDefined: boolean;

  @Column({ name: 'uptime_requirement', type: 'decimal', precision: 5, scale: 2, nullable: true })
  uptimeRequirement: number; // Percentage

  @Column({ name: 'response_time_hours', type: 'int', nullable: true })
  responseTimeHours: number;

  @Column({ name: 'resolution_time_hours', type: 'int', nullable: true })
  resolutionTimeHours: number;

  @Column({ name: 'performance_bond_required', type: 'boolean', default: false })
  performanceBondRequired: boolean;

  @Column({ name: 'performance_bond_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  performanceBondAmount: number;

  @Column({ name: 'kpi_metrics', type: 'simple-json', nullable: true })
  kpiMetrics: any;

  // Insurance and Liability
  @Column({ name: 'insurance_required', type: 'boolean', default: false })
  insuranceRequired: boolean;

  @Column({ name: 'insurance_coverage_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  insuranceCoverageAmount: number;

  @Column({ name: 'liability_cap', type: 'decimal', precision: 15, scale: 2, nullable: true })
  liabilityCap: number;

  @Column({ name: 'indemnification_clause', type: 'text', nullable: true })
  indemnificationClause: string;

  @Column({ name: 'force_majeure_clause', type: 'text', nullable: true })
  forceMajeureClause: string;

  // Termination Terms
  @Column({ name: 'termination_clause', type: 'text', nullable: true })
  terminationClause: string;

  @Column({ name: 'early_termination_allowed', type: 'boolean', default: false })
  earlyTerminationAllowed: boolean;

  @Column({ name: 'early_termination_penalty', type: 'decimal', precision: 15, scale: 2, nullable: true })
  earlyTerminationPenalty: number;

  @Column({ name: 'termination_notice_required', type: 'boolean', default: true })
  terminationNoticeRequired: boolean;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ name: 'termination_reason', type: 'text', nullable: true })
  terminationReason: string;

  // Renewal Information
  @Column({ name: 'renewable', type: 'boolean', default: false })
  renewable: boolean;

  @Column({ name: 'renewal_type', type: 'enum', enum: RenewalType, nullable: true })
  renewalType: RenewalType;

  @Column({ name: 'renewal_notice_days', type: 'int', default: 60 })
  renewalNoticeDays: number;

  @Column({ name: 'max_renewals', type: 'int', nullable: true })
  maxRenewals: number;

  @Column({ name: 'renewal_count', type: 'int', default: 0 })
  renewalCount: number;

  @Column({ name: 'last_renewal_date', type: 'date', nullable: true })
  lastRenewalDate: Date;

  @Column({ name: 'next_renewal_date', type: 'date', nullable: true })
  nextRenewalDate: Date;

  // Compliance and Legal
  @Column({ name: 'governing_law', length: 100, default: 'Laws of Ghana' })
  governingLaw: string;

  @Column({ name: 'dispute_resolution', length: 100, default: 'Arbitration' })
  disputeResolution: string;

  @Column({ name: 'arbitration_venue', length: 255, nullable: true })
  arbitrationVenue: string;

  @Column({ name: 'confidentiality_clause', type: 'boolean', default: true })
  confidentialityClause: boolean;

  @Column({ name: 'non_compete_clause', type: 'boolean', default: false })
  nonCompeteClause: boolean;

  @Column({ name: 'non_solicitation_clause', type: 'boolean', default: false })
  nonSolicitationClause: boolean;

  // Approvals and Signatures
  @Column({ name: 'legal_review_completed', type: 'boolean', default: false })
  legalReviewCompleted: boolean;

  @Column({ name: 'legal_review_date', type: 'date', nullable: true })
  legalReviewDate: Date;

  @Column({ name: 'legal_reviewer', length: 255, nullable: true })
  legalReviewer: string;

  @Column({ name: 'approved_by', length: 255, nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ name: 'signed_date', type: 'date', nullable: true })
  signedDate: Date;

  @Column({ name: 'party_a_signature_date', type: 'date', nullable: true })
  partyASignatureDate: Date;

  @Column({ name: 'party_b_signature_date', type: 'date', nullable: true })
  partyBSignatureDate: Date;

  @Column({ name: 'witness_1_name', length: 255, nullable: true })
  witness1Name: string;

  @Column({ name: 'witness_2_name', length: 255, nullable: true })
  witness2Name: string;

  // Amendments and Variations
  @Column({ name: 'amendment_count', type: 'int', default: 0 })
  amendmentCount: number;

  @Column({ name: 'last_amendment_date', type: 'date', nullable: true })
  lastAmendmentDate: Date;

  @Column({ name: 'amendment_history', type: 'simple-json', nullable: true })
  amendmentHistory: any[];

  // Performance Tracking
  @Column({ name: 'compliance_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  complianceScore: number;

  @Column({ name: 'performance_score', type: 'decimal', precision: 5, scale: 2, default: 100 })
  performanceScore: number;

  @Column({ name: 'disputes_count', type: 'int', default: 0 })
  disputesCount: number;

  @Column({ name: 'breaches_count', type: 'int', default: 0 })
  breachesCount: number;

  @Column({ name: 'claims_raised', type: 'decimal', precision: 15, scale: 2, default: 0 })
  claimsRaised: number;

  @Column({ name: 'claims_settled', type: 'decimal', precision: 15, scale: 2, default: 0 })
  claimsSettled: number;

  // Alerts and Notifications
  @Column({ name: 'expiry_alert_sent', type: 'boolean', default: false })
  expiryAlertSent: boolean;

  @Column({ name: 'expiry_alert_date', type: 'date', nullable: true })
  expiryAlertDate: Date;

  @Column({ name: 'renewal_alert_sent', type: 'boolean', default: false })
  renewalAlertSent: boolean;

  @Column({ name: 'renewal_alert_date', type: 'date', nullable: true })
  renewalAlertDate: Date;

  // Document Management
  @Column({ name: 'original_document_url', length: 500, nullable: true })
  originalDocumentUrl: string;

  @Column({ name: 'signed_document_url', length: 500, nullable: true })
  signedDocumentUrl: string;

  @Column({ name: 'supporting_documents', type: 'simple-array', nullable: true })
  supportingDocuments: string[];

  @Column({ name: 'document_version', type: 'int', default: 1 })
  documentVersion: number;

  // Additional Information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_template', type: 'boolean', default: false })
  isTemplate: boolean;

  @Column({ name: 'parent_contract_id', length: 50, nullable: true })
  parentContractId: string; // For amendments or renewals

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy: string;

  // Calculated fields
  @BeforeInsert()
  @BeforeUpdate()
  calculateFields() {
    // Calculate duration in months
    if (this.effectiveDate && this.expiryDate) {
      const months = (this.expiryDate.getFullYear() - this.effectiveDate.getFullYear()) * 12
        + (this.expiryDate.getMonth() - this.effectiveDate.getMonth());
      this.durationMonths = months;
    }

    // Set next renewal date
    if (this.renewable && this.expiryDate) {
      const renewalNoticeDate = new Date(this.expiryDate);
      renewalNoticeDate.setDate(renewalNoticeDate.getDate() - this.renewalNoticeDays);
      this.nextRenewalDate = renewalNoticeDate;
    }

    // Update status based on dates
    const today = new Date();
    if (this.expiryDate && this.expiryDate < today && this.status === ContractStatus.ACTIVE) {
      this.status = ContractStatus.EXPIRED;
    }

    // Generate contract number if not exists
    if (!this.contractNumber) {
      const prefix = this.contractType === ContractType.SUPPLY_AGREEMENT ? 'SA' :
                    this.contractType === ContractType.SERVICE_AGREEMENT ? 'SVC' :
                    this.contractType === ContractType.PURCHASE_AGREEMENT ? 'PA' : 'CON';
      this.contractNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  }
}