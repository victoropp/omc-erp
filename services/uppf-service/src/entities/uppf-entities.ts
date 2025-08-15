import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsNumber, IsString, IsBoolean, IsOptional, IsEnum, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enums for UPPF system
export enum UPPFClaimStatus {
  DRAFT = 'draft',
  READY_TO_SUBMIT = 'ready_to_submit',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  SETTLED = 'settled',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ClaimPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum AutomationLevel {
  FULL = 'full',
  PARTIAL = 'partial',
  MANUAL = 'manual',
}

export enum ProductType {
  PMS = 'PMS',
  AGO = 'AGO',
  KEROSENE = 'KEROSENE',
  LPG = 'LPG',
  IFO = 'IFO',
  LUBRICANTS = 'LUBRICANTS',
}

export enum AnomalyType {
  GPS_DEVIATION = 'GPS_DEVIATION',
  VOLUME_VARIANCE = 'VOLUME_VARIANCE',
  TIME_ANOMALY = 'TIME_ANOMALY',
  ROUTE_CHANGE = 'ROUTE_CHANGE',
  DOCUMENTATION_ISSUE = 'DOCUMENTATION_ISSUE',
  FUEL_LOSS = 'FUEL_LOSS',
  SPEED_VIOLATION = 'SPEED_VIOLATION',
  GEOFENCE_VIOLATION = 'GEOFENCE_VIOLATION',
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  VARIANCE_DETECTED = 'variance_detected',
  DISPUTED = 'disputed',
  RESOLVED = 'resolved',
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_SETTLED = 'partially_settled',
}

// Core UPPF Claim Entity
@Entity('uppf_claims')
@Index(['windowId', 'status'])
@Index(['dealerId', 'createdAt'])
@Index(['claimNumber'], { unique: true })
@Index(['status', 'submissionDate'])
export class UPPFClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @IsString()
  claimNumber: string;

  @Column({ length: 20 })
  @IsString()
  windowId: string;

  @Column({ type: 'uuid' })
  @IsString()
  consignmentId: string;

  @Column({ length: 50 })
  @IsString()
  dealerId: string;

  @Column({ length: 100 })
  @IsString()
  dealerName: string;

  @Column({ length: 50 })
  @IsString()
  routeId: string;

  @Column({ length: 100 })
  @IsString()
  routeName: string;

  @Column({ length: 50 })
  @IsString()
  depotId: string;

  @Column({ length: 100 })
  @IsString()
  depotName: string;

  @Column({ length: 50 })
  @IsString()
  stationId: string;

  @Column({ length: 100 })
  @IsString()
  stationName: string;

  @Column({ type: 'enum', enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  volumeLitres: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  kmActual: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  kmPlanned: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  equalisationKm: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  kmBeyondEqualisation: number;

  @Column({ type: 'decimal', precision: 8, scale: 6 })
  @IsNumber()
  @Min(0)
  tariffPerLitreKm: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  baseClaimAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  routeEfficiencyBonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  complianceBonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  totalClaimAmount: number;

  @Column({ type: 'enum', enum: UPPFClaimStatus, default: UPPFClaimStatus.DRAFT })
  @IsEnum(UPPFClaimStatus)
  status: UPPFClaimStatus;

  @Column({ type: 'enum', enum: ClaimPriority, default: ClaimPriority.MEDIUM })
  @IsEnum(ClaimPriority)
  priority: ClaimPriority;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  gpsConfidence: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  evidenceScore: number;

  @Column({ type: 'enum', enum: AutomationLevel, default: AutomationLevel.MANUAL })
  @IsEnum(AutomationLevel)
  automationLevel: AutomationLevel;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  gpsValidated: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  threeWayReconciled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  blockchainVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiValidated: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  blockchainHash?: string;

  @Column({ type: 'json', nullable: true })
  evidenceLinks?: {
    waybill?: string;
    gpsTrace?: string;
    grn?: string;
    tankDips?: string;
    weighbridge?: string;
    qualityCertificate?: string;
    photos?: string[];
  };

  @Column({ type: 'json', nullable: true })
  metadata?: {
    gpsValidation?: any;
    routeOptimization?: any;
    fuelAnalysis?: any;
    complianceMetrics?: any;
    aiInsights?: any;
  };

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submissionDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvalDate?: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  settlementDate?: Date;

  @Column({ type: 'integer', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  processingDays?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  varianceAmount?: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  varianceReason?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  submissionRef?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  npaResponseRef?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Column({ length: 50 })
  @IsString()
  createdBy: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ClaimAnomaly, anomaly => anomaly.claim, { cascade: true })
  anomalies: ClaimAnomaly[];

  @OneToMany(() => ClaimAuditEntry, auditEntry => auditEntry.claim, { cascade: true })
  auditTrail: ClaimAuditEntry[];

  @ManyToOne(() => UPPFSettlement, settlement => settlement.claims, { nullable: true })
  @JoinColumn({ name: 'settlement_id' })
  settlement?: UPPFSettlement;

  @Column({ type: 'uuid', nullable: true })
  settlementId?: string;

  // Calculated fields
  get efficiencyRating(): string {
    if (this.qualityScore >= 95) return 'EXCELLENT';
    if (this.qualityScore >= 85) return 'GOOD';
    if (this.qualityScore >= 70) return 'AVERAGE';
    if (this.qualityScore >= 50) return 'POOR';
    return 'CRITICAL';
  }

  get riskRating(): string {
    if (this.riskScore <= 10) return 'LOW';
    if (this.riskScore <= 30) return 'MEDIUM';
    if (this.riskScore <= 60) return 'HIGH';
    return 'CRITICAL';
  }

  get isHighValue(): boolean {
    return this.totalClaimAmount > 50000;
  }

  get hasAnomalies(): boolean {
    return this.anomalies && this.anomalies.length > 0;
  }

  get totalBonuses(): number {
    return Number(this.routeEfficiencyBonus) + Number(this.complianceBonus);
  }

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  validateAndCalculate() {
    // Calculate total claim amount
    this.totalClaimAmount = Number(this.baseClaimAmount) + Number(this.routeEfficiencyBonus) + Number(this.complianceBonus);
    
    // Calculate processing days if applicable
    if (this.settlementDate && this.submissionDate) {
      this.processingDays = Math.floor(
        (this.settlementDate.getTime() - this.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Calculate variance amount if settled
    if (this.settlementAmount && this.totalClaimAmount) {
      this.varianceAmount = Number(this.settlementAmount) - Number(this.totalClaimAmount);
    }
  }
}

// Claim Anomaly Entity
@Entity('claim_anomalies')
@Index(['claimId', 'type'])
@Index(['severity', 'resolved'])
export class ClaimAnomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsString()
  claimId: string;

  @Column({ type: 'enum', enum: AnomalyType })
  @IsEnum(AnomalyType)
  type: AnomalyType;

  @Column({ type: 'enum', enum: AnomalySeverity })
  @IsEnum(AnomalySeverity)
  severity: AnomalySeverity;

  @Column({ type: 'text' })
  @IsString()
  description: string;

  @Column({ type: 'json', nullable: true })
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };

  @Column({ type: 'json', nullable: true })
  evidence?: {
    gpsTrace?: string;
    photos?: string[];
    documents?: string[];
    sensorData?: any;
  };

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  resolved: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  resolution?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resolvedAt?: Date;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  correctionSuggestion?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  impactScore: number;

  @CreateDateColumn()
  detectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => UPPFClaim, claim => claim.anomalies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id' })
  claim: UPPFClaim;
}

// Claim Audit Entry Entity
@Entity('claim_audit_entries')
@Index(['claimId', 'timestamp'])
@Index(['action', 'user'])
export class ClaimAuditEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @IsString()
  claimId: string;

  @Column({ length: 100 })
  @IsString()
  action: string;

  @Column({ length: 50 })
  @IsString()
  user: string;

  @Column({ type: 'text' })
  @IsString()
  details: string;

  @Column({ type: 'json', nullable: true })
  oldValue?: any;

  @Column({ type: 'json', nullable: true })
  newValue?: any;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @CreateDateColumn()
  timestamp: Date;

  // Relationships
  @ManyToOne(() => UPPFClaim, claim => claim.auditTrail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id' })
  claim: UPPFClaim;
}

// Three-Way Reconciliation Entity
@Entity('three_way_reconciliations')
@Index(['consignmentId'], { unique: true })
@Index(['reconciliationStatus', 'createdAt'])
export class ThreeWayReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @IsString()
  consignmentId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  depotLoadedLitres: number;

  @Column({ length: 100 })
  @IsString()
  depotDocumentRef: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  transporterDeliveredLitres: number;

  @Column({ length: 100 })
  @IsString()
  transporterDocumentRef: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  stationReceivedLitres: number;

  @Column({ length: 100 })
  @IsString()
  stationDocumentRef: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  varianceDepotTransporter: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  varianceTransporterStation: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  varianceDepotStation: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.02 })
  @IsNumber()
  @Min(0)
  @Max(1)
  toleranceApplied: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  @IsNumber()
  @Min(0)
  routeComplexityFactor: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  @IsNumber()
  @Min(0)
  productVolatilityFactor: number;

  @Column({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.PENDING })
  @IsEnum(ReconciliationStatus)
  reconciliationStatus: ReconciliationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;

  @Column({ type: 'json', nullable: true })
  aiAnomalies?: string[];

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  blockchainHash?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiValidated: boolean;

  @Column({ type: 'json', nullable: true })
  aiInsights?: {
    predictedVariance?: number;
    riskFactors?: string[];
    recommendations?: string[];
    confidence?: number;
  };

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  reconciledBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reconciledAt?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get isWithinTolerance(): boolean {
    const variancePercentage = Math.abs(this.varianceDepotStation) / this.depotLoadedLitres;
    return variancePercentage <= this.toleranceApplied;
  }

  get variancePercentage(): number {
    return (Math.abs(this.varianceDepotStation) / this.depotLoadedLitres) * 100;
  }

  get isHighRisk(): boolean {
    return this.riskScore > 70 || !this.isWithinTolerance;
  }
}

// UPPF Settlement Entity
@Entity('uppf_settlements')
@Index(['windowId'], { unique: true })
@Index(['status', 'settlementDate'])
export class UPPFSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @IsString()
  settlementId: string;

  @Column({ length: 20 })
  @IsString()
  windowId: string;

  @Column({ type: 'integer' })
  @IsNumber()
  @Min(0)
  totalClaims: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @Min(0)
  totalClaimAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  @Min(0)
  totalSettledAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  npaPenalties: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  performanceBonuses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  netSettlement: number;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING })
  @IsEnum(SettlementStatus)
  status: SettlementStatus;

  @Column({ type: 'date' })
  @IsDate()
  @Type(() => Date)
  settlementDate: Date;

  @Column({ type: 'json', nullable: true })
  varianceAnalysis?: {
    claimId: string;
    originalAmount: number;
    settledAmount: number;
    varianceAmount: number;
    varianceReason: string;
    riskCategory: string;
    actionRequired: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  performanceMetrics?: {
    successRate: number;
    averageProcessingDays: number;
    totalVarianceCost: number;
    complianceScore: number;
    efficiency: number;
  };

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  npaSubmissionRef?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  bankTransactionRef?: string;

  @Column({ length: 50 })
  @IsString()
  processedBy: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => UPPFClaim, claim => claim.settlement)
  claims: UPPFClaim[];

  // Calculated properties
  get settlementEfficiency(): number {
    return this.totalClaimAmount > 0 ? (this.totalSettledAmount / this.totalClaimAmount) * 100 : 0;
  }

  get hasVariances(): boolean {
    return this.varianceAnalysis && this.varianceAnalysis.length > 0;
  }

  get totalVarianceAmount(): number {
    return this.totalClaimAmount - this.totalSettledAmount;
  }

  get isCompleted(): boolean {
    return this.status === SettlementStatus.COMPLETED;
  }
}

// Equalisation Points Entity
@Entity('equalisation_points')
@Index(['routeId'], { unique: true })
@Index(['regionId', 'isActive'])
export class EqualisationPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @IsString()
  routeId: string;

  @Column({ length: 50 })
  @IsString()
  depotId: string;

  @Column({ length: 100 })
  @IsString()
  depotName: string;

  @Column({ length: 50 })
  @IsString()
  stationId: string;

  @Column({ length: 100 })
  @IsString()
  stationName: string;

  @Column({ length: 100 })
  @IsString()
  routeName: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  kmThreshold: number;

  @Column({ length: 50 })
  @IsString()
  regionId: string;

  @Column({ length: 100 })
  @IsString()
  regionName: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  roadCategory?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  @IsNumber()
  @Min(0)
  trafficFactor: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  @IsNumber()
  @Min(0)
  complexityFactor: number;

  @Column({ type: 'json', nullable: true })
  routeConditions?: {
    roadQuality: string;
    trafficDensity: string;
    weatherImpact: string;
    seasonalFactors: string[];
    securityLevel: string;
  };

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'date' })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @Column({ length: 50 })
  @IsString()
  createdBy: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get adjustedThreshold(): number {
    return this.kmThreshold * this.trafficFactor * this.complexityFactor;
  }

  get isExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  get isCurrentlyActive(): boolean {
    return this.isActive && !this.isExpired && new Date() >= this.effectiveDate;
  }
}

// GPS Trace Entity
@Entity('gps_traces')
@Index(['consignmentId'], { unique: true })
@Index(['vehicleId', 'startTime'])
export class GPSTrace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @IsString()
  consignmentId: string;

  @Column({ length: 50 })
  @IsString()
  vehicleId: string;

  @Column({ length: 50 })
  @IsString()
  driverId: string;

  @Column({ type: 'timestamp' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @Column({ type: 'timestamp' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  totalKm: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  @IsNumber()
  @Min(0)
  plannedKm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(0)
  averageSpeed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(0)
  maxSpeed: number;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  @Min(0)
  stopCount: number;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  @Min(0)
  stopDurationMinutes: number;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  @Min(0)
  speedViolations: number;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  @Min(0)
  unexpectedStops: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  routeEfficiency: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  routePolyline?: string;

  @Column({ type: 'json', nullable: true })
  gpsPoints?: {
    lat: number;
    lon: number;
    timestamp: Date;
    speed: number;
    heading: number;
    accuracy: number;
  }[];

  @Column({ type: 'json', nullable: true })
  anomalies?: {
    type: string;
    description: string;
    location: { lat: number; lon: number };
    timestamp: Date;
    severity: string;
  }[];

  @Column({ type: 'json', nullable: true })
  fuelAnalysis?: {
    expectedConsumption: number;
    actualConsumption: number;
    efficiency: number;
    variance: number;
    isWithinTolerance: boolean;
    suspiciousActivity: boolean;
  };

  @Column({ type: 'json', nullable: true })
  timeAnalysis?: {
    plannedDuration: number;
    actualDuration: number;
    drivingTime: number;
    stopTime: number;
    delayReason?: string;
    isReasonable: boolean;
  };

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  validated: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiAnalyzed: boolean;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @IsString()
  validatedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validatedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculated properties
  get deviationPercentage(): number {
    return this.plannedKm > 0 ? Math.abs(this.totalKm - this.plannedKm) / this.plannedKm * 100 : 0;
  }

  get hasAnomalies(): boolean {
    return this.anomalies && this.anomalies.length > 0;
  }

  get durationHours(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
  }

  get isHighConfidence(): boolean {
    return this.confidence >= 85;
  }

  get isEfficient(): boolean {
    return this.routeEfficiency >= 80 && this.deviationPercentage <= 10;
  }
}

// Export all entities
export const UPPFEntities = [
  UPPFClaim,
  ClaimAnomaly,
  ClaimAuditEntry,
  ThreeWayReconciliation,
  UPPFSettlement,
  EqualisationPoint,
  GPSTrace,
];

// Export DTOs for API usage
export interface CreateUPPFClaimDto {
  consignmentId: string;
  dealerId: string;
  dealerName: string;
  routeId: string;
  productType: ProductType;
  volumeLitres: number;
  kmActual: number;
  kmPlanned: number;
  tariffPerLitreKm?: number;
  evidenceLinks?: any;
  createdBy: string;
  notes?: string;
}

export interface UpdateUPPFClaimDto {
  status?: UPPFClaimStatus;
  priority?: ClaimPriority;
  notes?: string;
  settlementAmount?: number;
  varianceReason?: string;
  lastModifiedBy: string;
}

export interface UPPFClaimQueryDto {
  windowId?: string;
  dealerId?: string;
  status?: UPPFClaimStatus[];
  priority?: ClaimPriority[];
  automationLevel?: AutomationLevel[];
  productType?: ProductType[];
  minAmount?: number;
  maxAmount?: number;
  minQualityScore?: number;
  hasAnomalies?: boolean;
  blockchainVerified?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateThreeWayReconciliationDto {
  consignmentId: string;
  depotLoadedLitres: number;
  depotDocumentRef: string;
  transporterDeliveredLitres: number;
  transporterDocumentRef: string;
  stationReceivedLitres: number;
  stationDocumentRef: string;
  notes?: string;
}

export interface CreateUPPFSettlementDto {
  windowId: string;
  claimIds: string[];
  totalSettledAmount: number;
  npaPenalties?: number;
  performanceBonuses?: number;
  npaSubmissionRef?: string;
  paymentReference?: string;
  processedBy: string;
  notes?: string;
}