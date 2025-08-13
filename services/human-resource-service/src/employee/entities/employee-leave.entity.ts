import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { Employee } from './employee.entity';

export enum LeaveType {
  ANNUAL_LEAVE = 'ANNUAL_LEAVE',
  SICK_LEAVE = 'SICK_LEAVE',
  MATERNITY_LEAVE = 'MATERNITY_LEAVE',
  PATERNITY_LEAVE = 'PATERNITY_LEAVE',
  COMPASSIONATE_LEAVE = 'COMPASSIONATE_LEAVE',
  STUDY_LEAVE = 'STUDY_LEAVE',
  SABBATICAL_LEAVE = 'SABBATICAL_LEAVE',
  UNPAID_LEAVE = 'UNPAID_LEAVE',
  EMERGENCY_LEAVE = 'EMERGENCY_LEAVE',
  CASUAL_LEAVE = 'CASUAL_LEAVE',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY',
  COMPENSATORY_LEAVE = 'COMPENSATORY_LEAVE',
  MEDICAL_LEAVE = 'MEDICAL_LEAVE',
  BEREAVEMENT_LEAVE = 'BEREAVEMENT_LEAVE'
}

export enum LeaveStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  TAKEN = 'TAKEN',
  PARTIALLY_TAKEN = 'PARTIALLY_TAKEN',
  EXPIRED = 'EXPIRED'
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

@Entity('employee_leaves')
@Index(['tenantId', 'employeeId'])
@Index(['tenantId', 'leaveStatus'])
@Index(['leaveStartDate', 'leaveEndDate'])
@Index(['leaveType'])
export class EmployeeLeave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'leave_request_number', length: 50, unique: true })
  leaveRequestNumber: string;

  // Leave Details
  @Column({ 
    name: 'leave_type', 
    type: 'enum', 
    enum: LeaveType 
  })
  leaveType: LeaveType;

  @Column({ 
    name: 'leave_status', 
    type: 'enum', 
    enum: LeaveStatus,
    default: LeaveStatus.DRAFT
  })
  leaveStatus: LeaveStatus;

  @Column({ name: 'leave_start_date', type: 'date' })
  leaveStartDate: Date;

  @Column({ name: 'leave_end_date', type: 'date' })
  leaveEndDate: Date;

  @Column({ name: 'total_days_requested', type: 'decimal', precision: 5, scale: 2 })
  totalDaysRequested: number;

  @Column({ name: 'total_days_approved', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalDaysApproved: number;

  @Column({ name: 'total_days_taken', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalDaysTaken: number;

  @Column({ name: 'working_days_requested', type: 'decimal', precision: 5, scale: 2 })
  workingDaysRequested: number;

  @Column({ name: 'working_days_approved', type: 'decimal', precision: 5, scale: 2, default: 0 })
  workingDaysApproved: number;

  @Column({ name: 'working_days_taken', type: 'decimal', precision: 5, scale: 2, default: 0 })
  workingDaysTaken: number;

  @Column({ name: 'half_day_start', default: false })
  halfDayStart: boolean;

  @Column({ name: 'half_day_end', default: false })
  halfDayEnd: boolean;

  // Request Information
  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'request_date', type: 'date' })
  requestDate: Date;

  @Column({ name: 'requested_by' })
  requestedBy: string;

  @Column({ name: 'emergency_leave', default: false })
  emergencyLeave: boolean;

  @Column({ name: 'contact_during_leave', type: 'text', nullable: true })
  contactDuringLeave: string;

  @Column({ name: 'handover_notes', type: 'text', nullable: true })
  handoverNotes: string;

  @Column({ name: 'covering_employee_id', nullable: true })
  coveringEmployeeId: string;

  @Column({ name: 'covering_employee_name', length: 255, nullable: true })
  coveringEmployeeName: string;

  // Approval Workflow
  @Column({ name: 'immediate_supervisor_id', nullable: true })
  immediateSupervisorId: string;

  @Column({ name: 'immediate_supervisor_name', length: 255, nullable: true })
  immediateSupervisorName: string;

  @Column({ name: 'immediate_supervisor_approval', nullable: true })
  immediateSupervisorApproval: boolean;

  @Column({ name: 'immediate_supervisor_approval_date', type: 'date', nullable: true })
  immediateSupervisorApprovalDate: Date;

  @Column({ name: 'immediate_supervisor_comments', type: 'text', nullable: true })
  immediateSupervisorComments: string;

  @Column({ name: 'hr_approval', nullable: true })
  hrApproval: boolean;

  @Column({ name: 'hr_approval_date', type: 'date', nullable: true })
  hrApprovalDate: Date;

  @Column({ name: 'hr_approved_by', length: 255, nullable: true })
  hrApprovedBy: string;

  @Column({ name: 'hr_comments', type: 'text', nullable: true })
  hrComments: string;

  @Column({ name: 'final_approval', nullable: true })
  finalApproval: boolean;

  @Column({ name: 'final_approval_date', type: 'date', nullable: true })
  finalApprovalDate: Date;

  @Column({ name: 'final_approved_by', length: 255, nullable: true })
  finalApprovedBy: string;

  @Column({ name: 'final_approval_comments', type: 'text', nullable: true })
  finalApprovalComments: string;

  // Leave Balance Impact
  @Column({ name: 'leave_balance_before', type: 'decimal', precision: 5, scale: 2, default: 0 })
  leaveBalanceBefore: number;

  @Column({ name: 'leave_balance_after', type: 'decimal', precision: 5, scale: 2, default: 0 })
  leaveBalanceAfter: number;

  @Column({ name: 'carryover_impact', type: 'decimal', precision: 5, scale: 2, default: 0 })
  carryoverImpact: number;

  @Column({ name: 'accrual_impact', type: 'decimal', precision: 5, scale: 2, default: 0 })
  accrualImpact: number;

  // Payment Information
  @Column({ 
    name: 'payment_status', 
    type: 'enum', 
    enum: PaymentStatus,
    default: PaymentStatus.NOT_APPLICABLE
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'paid_leave', default: true })
  paidLeave: boolean;

  @Column({ name: 'payment_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  paymentPercentage: number; // Percentage of salary paid during leave

  @Column({ name: 'daily_rate', type: 'decimal', precision: 15, scale: 2, default: 0 })
  dailyRate: number;

  @Column({ name: 'total_payment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaymentAmount: number;

  @Column({ name: 'payment_processed', default: false })
  paymentProcessed: boolean;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date;

  // Ghana Labor Law Compliance
  @Column({ name: 'ghana_labor_act_compliant', default: true })
  ghanaLaborActCompliant: boolean;

  @Column({ name: 'statutory_leave', default: false })
  statutoryLeave: boolean; // Leave mandated by Ghana labor law

  @Column({ name: 'medical_certificate_required', default: false })
  medicalCertificateRequired: boolean;

  @Column({ name: 'medical_certificate_provided', default: false })
  medicalCertificateProvided: boolean;

  @Column({ name: 'medical_certificate_url', length: 500, nullable: true })
  medicalCertificateUrl: string;

  @Column({ name: 'return_to_work_clearance', default: false })
  returnToWorkClearance: boolean;

  @Column({ name: 'fitness_for_duty_required', default: false })
  fitnessForDutyRequired: boolean;

  // Ghana OMC Specific
  @Column({ name: 'safety_impact_assessment', default: false })
  safetyImpactAssessment: boolean;

  @Column({ name: 'critical_operation_period', default: false })
  criticalOperationPeriod: boolean; // During critical petroleum operations

  @Column({ name: 'replacement_coverage_confirmed', default: false })
  replacementCoverageConfirmed: boolean;

  @Column({ name: 'security_clearance_impact', default: false })
  securityClearanceImpact: boolean;

  @Column({ name: 'hse_notification_required', default: false })
  hseNotificationRequired: boolean;

  // Return to Work
  @Column({ name: 'planned_return_date', type: 'date', nullable: true })
  plannedReturnDate: Date;

  @Column({ name: 'actual_return_date', type: 'date', nullable: true })
  actualReturnDate: Date;

  @Column({ name: 'early_return', default: false })
  earlyReturn: boolean;

  @Column({ name: 'late_return', default: false })
  lateReturn: boolean;

  @Column({ name: 'return_to_work_interview', default: false })
  returnToWorkInterview: boolean;

  @Column({ name: 'return_to_work_date', type: 'date', nullable: true })
  returnToWorkDate: Date;

  @Column({ name: 'return_to_work_notes', type: 'text', nullable: true })
  returnToWorkNotes: string;

  // Leave Extension/Reduction
  @Column({ name: 'extension_requested', default: false })
  extensionRequested: boolean;

  @Column({ name: 'extension_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  extensionDays: number;

  @Column({ name: 'extension_approved', default: false })
  extensionApproved: boolean;

  @Column({ name: 'extension_reason', type: 'text', nullable: true })
  extensionReason: string;

  @Column({ name: 'reduction_requested', default: false })
  reductionRequested: boolean;

  @Column({ name: 'reduction_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  reductionDays: number;

  @Column({ name: 'reduction_approved', default: false })
  reductionApproved: boolean;

  // Document Management
  @Column({ name: 'leave_application_document', length: 500, nullable: true })
  leaveApplicationDocument: string;

  @Column({ name: 'approval_document', length: 500, nullable: true })
  approvalDocument: string;

  @Column({ name: 'supporting_documents', type: 'text', nullable: true })
  supportingDocuments: string; // JSON array of document URLs

  @Column({ name: 'handover_document', length: 500, nullable: true })
  handoverDocument: string;

  // Integration and Automation
  @Column({ name: 'calendar_blocked', default: false })
  calendarBlocked: boolean;

  @Column({ name: 'payroll_integration_processed', default: false })
  payrollIntegrationProcessed: boolean;

  @Column({ name: 'attendance_system_updated', default: false })
  attendanceSystemUpdated: boolean;

  @Column({ name: 'email_notifications_sent', default: false })
  emailNotificationsSent: boolean;

  // Annual Leave Specific
  @Column({ name: 'leave_year', length: 4, nullable: true })
  leaveYear: string;

  @Column({ name: 'carried_forward_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  carriedForwardDays: number;

  @Column({ name: 'forfeit_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  forfeitDays: number;

  @Column({ name: 'encashed_days', type: 'decimal', precision: 5, scale: 2, default: 0 })
  encashedDays: number;

  @Column({ name: 'encashment_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  encashmentAmount: number;

  // Reporting and Analytics
  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'location', length: 255, nullable: true })
  location: string;

  @Column({ name: 'project_impact', type: 'text', nullable: true })
  projectImpact: string;

  @Column({ name: 'productivity_impact', length: 20, default: 'NONE' })
  productivityImpact: string; // NONE, LOW, MEDIUM, HIGH

  // Notes and Comments
  @Column({ name: 'employee_notes', type: 'text', nullable: true })
  employeeNotes: string;

  @Column({ name: 'manager_notes', type: 'text', nullable: true })
  managerNotes: string;

  @Column({ name: 'hr_notes', type: 'text', nullable: true })
  hrNotes: string;

  @Column({ name: 'system_notes', type: 'text', nullable: true })
  systemNotes: string;

  // Audit Fields
  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Employee, employee => employee.leaves)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Employee, employee => employee.id, { nullable: true })
  @JoinColumn({ name: 'covering_employee_id' })
  coveringEmployee: Employee;
}