import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { EmployeeContract } from './employee-contract.entity';
import { EmployeeLeave } from './employee-leave.entity';
import { EmployeePerformance } from './employee-performance.entity';
import { EmployeeTraining } from './employee-training.entity';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE',
  PROBATION = 'PROBATION',
  RETIRED = 'RETIRED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED'
}

export enum EmploymentType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN',
  CONSULTANT = 'CONSULTANT',
  PART_TIME = 'PART_TIME'
}

export enum EducationLevel {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  DIPLOMA = 'DIPLOMA',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
  PROFESSIONAL = 'PROFESSIONAL',
  OTHER = 'OTHER'
}

@Entity('employees')
@Index(['tenantId', 'employeeNumber'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'department'])
@Index(['ghanaCardNumber'])
@Index(['passportNumber'])
@Index(['ssnit'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'employee_number', length: 50, unique: true })
  employeeNumber: string;

  @Column({ name: 'payroll_number', length: 50, nullable: true })
  payrollNumber: string;

  // Personal Information
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'full_name', length: 300 })
  fullName: string;

  @Column({ name: 'preferred_name', length: 100, nullable: true })
  preferredName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ 
    name: 'gender', 
    type: 'enum', 
    enum: Gender 
  })
  gender: Gender;

  @Column({ 
    name: 'marital_status', 
    type: 'enum', 
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE
  })
  maritalStatus: MaritalStatus;

  @Column({ name: 'nationality', length: 100, default: 'Ghanaian' })
  nationality: string;

  @Column({ name: 'religion', length: 100, nullable: true })
  religion: string;

  // Ghana-Specific Identification
  @Column({ name: 'ghana_card_number', length: 20, unique: true, nullable: true })
  ghanaCardNumber: string;

  @Column({ name: 'passport_number', length: 20, unique: true, nullable: true })
  passportNumber: string;

  @Column({ name: 'passport_expiry_date', type: 'date', nullable: true })
  passportExpiryDate: Date;

  @Column({ name: 'drivers_license_number', length: 20, nullable: true })
  driversLicenseNumber: string;

  @Column({ name: 'drivers_license_expiry', type: 'date', nullable: true })
  driversLicenseExpiry: Date;

  @Column({ name: 'voters_id', length: 20, nullable: true })
  votersId: string;

  // Social Security and Tax
  @Column({ name: 'ssnit', length: 20, unique: true, nullable: true })
  ssnit: string; // Social Security and National Insurance Trust

  @Column({ name: 'tin', length: 20, unique: true, nullable: true })
  tin: string; // Tax Identification Number

  @Column({ name: 'nhis_number', length: 20, nullable: true })
  nhisNumber: string; // National Health Insurance Scheme

  // Contact Information
  @Column({ name: 'email', length: 255, unique: true })
  email: string;

  @Column({ name: 'personal_email', length: 255, nullable: true })
  personalEmail: string;

  @Column({ name: 'phone', length: 20 })
  phone: string;

  @Column({ name: 'mobile', length: 20, nullable: true })
  mobile: string;

  @Column({ name: 'emergency_contact_name', length: 255 })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', length: 20 })
  emergencyContactPhone: string;

  @Column({ name: 'emergency_contact_relationship', length: 100 })
  emergencyContactRelationship: string;

  // Address Information
  @Column({ name: 'residential_address', type: 'text' })
  residentialAddress: string;

  @Column({ name: 'residential_city', length: 100 })
  residentialCity: string;

  @Column({ name: 'residential_region', length: 100 })
  residentialRegion: string;

  @Column({ name: 'residential_postal_code', length: 20, nullable: true })
  residentialPostalCode: string;

  @Column({ name: 'ghana_post_gps', length: 20, nullable: true })
  ghanaPostGPS: string; // Ghana Post GPS address

  @Column({ name: 'mailing_address', type: 'text', nullable: true })
  mailingAddress: string;

  @Column({ name: 'hometown', length: 255, nullable: true })
  hometown: string;

  @Column({ name: 'district_of_origin', length: 100, nullable: true })
  districtOfOrigin: string;

  // Employment Information
  @Column({ name: 'hire_date', type: 'date' })
  hireDate: Date;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'probation_end_date', type: 'date', nullable: true })
  probationEndDate: Date;

  @Column({ name: 'confirmation_date', type: 'date', nullable: true })
  confirmationDate: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ name: 'retirement_date', type: 'date', nullable: true })
  retirementDate: Date;

  @Column({ 
    name: 'employment_type', 
    type: 'enum', 
    enum: EmploymentType,
    default: EmploymentType.PERMANENT
  })
  employmentType: EmploymentType;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: EmployeeStatus,
    default: EmployeeStatus.PROBATION
  })
  status: EmployeeStatus;

  // Job Information
  @Column({ name: 'job_title', length: 255 })
  jobTitle: string;

  @Column({ name: 'job_grade', length: 20, nullable: true })
  jobGrade: string;

  @Column({ name: 'job_level', length: 20, nullable: true })
  jobLevel: string;

  @Column({ name: 'department', length: 100 })
  department: string;

  @Column({ name: 'division', length: 100, nullable: true })
  division: string;

  @Column({ name: 'cost_center', length: 20, nullable: true })
  costCenter: string;

  @Column({ name: 'work_location', length: 255 })
  workLocation: string;

  @Column({ name: 'reporting_manager_id', nullable: true })
  reportingManagerId: string;

  @Column({ name: 'reporting_manager_name', length: 255, nullable: true })
  reportingManagerName: string;

  @Column({ name: 'functional_manager_id', nullable: true })
  functionalManagerId: string;

  // Compensation
  @Column({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ name: 'currency', length: 3, default: 'GHS' })
  currency: string;

  @Column({ name: 'pay_frequency', length: 20, default: 'MONTHLY' })
  payFrequency: string; // WEEKLY, BIWEEKLY, MONTHLY

  @Column({ name: 'pay_grade', length: 20, nullable: true })
  payGrade: string;

  @Column({ name: 'overtime_eligible', default: true })
  overtimeEligible: boolean;

  @Column({ name: 'commission_eligible', default: false })
  commissionEligible: boolean;

  // Benefits and Allowances
  @Column({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  housingAllowance: number;

  @Column({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fuelAllowance: number;

  @Column({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  mealAllowance: number;

  @Column({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  educationAllowance: number;

  @Column({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  riskAllowance: number;

  @Column({ name: 'responsibility_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  responsibilityAllowance: number;

  // Ghana Labor Law Compliance
  @Column({ name: 'annual_leave_entitlement', default: 15 })
  annualLeaveEntitlement: number; // Minimum 15 days in Ghana

  @Column({ name: 'sick_leave_entitlement', default: 12 })
  sickLeaveEntitlement: number;

  @Column({ name: 'maternity_leave_entitlement', default: 84 })
  maternityLeaveEntitlement: number; // 12 weeks in Ghana

  @Column({ name: 'paternity_leave_entitlement', default: 7 })
  paternityLeaveEntitlement: number; // 1 week in Ghana

  @Column({ name: 'compassionate_leave_entitlement', default: 3 })
  compassionateLeaveEntitlement: number;

  @Column({ name: 'study_leave_eligible', default: false })
  studyLeaveEligible: boolean;

  @Column({ name: 'notice_period_days', default: 30 })
  noticePeriodDays: number;

  // Education and Qualifications
  @Column({ 
    name: 'highest_education_level', 
    type: 'enum', 
    enum: EducationLevel,
    nullable: true
  })
  highestEducationLevel: EducationLevel;

  @Column({ name: 'institution', length: 255, nullable: true })
  institution: string;

  @Column({ name: 'field_of_study', length: 255, nullable: true })
  fieldOfStudy: string;

  @Column({ name: 'graduation_year', nullable: true })
  graduationYear: number;

  @Column({ name: 'professional_certifications', type: 'text', nullable: true })
  professionalCertifications: string; // JSON array

  @Column({ name: 'languages', type: 'text', nullable: true })
  languages: string; // JSON array of languages

  // Ghana OMC Specific Fields
  @Column({ name: 'petroleum_safety_training', default: false })
  petroleumSafetyTraining: boolean;

  @Column({ name: 'petroleum_safety_cert_expiry', type: 'date', nullable: true })
  petroleumSafetyCertExpiry: Date;

  @Column({ name: 'hse_certification', default: false })
  hseCertification: boolean;

  @Column({ name: 'hse_cert_expiry', type: 'date', nullable: true })
  hseCertExpiry: Date;

  @Column({ name: 'firefighting_certification', default: false })
  firefightingCertification: boolean;

  @Column({ name: 'first_aid_certification', default: false })
  firstAidCertification: boolean;

  @Column({ name: 'forklift_license', default: false })
  forkliftLicense: boolean;

  @Column({ name: 'hazmat_certification', default: false })
  hazmatCertification: boolean;

  @Column({ name: 'confined_space_training', default: false })
  confinedSpaceTraining: boolean;

  @Column({ name: 'working_at_height_training', default: false })
  workingAtHeightTraining: boolean;

  // Performance and Development
  @Column({ name: 'performance_rating', type: 'decimal', precision: 3, scale: 1, nullable: true })
  performanceRating: number; // Out of 5

  @Column({ name: 'last_appraisal_date', nullable: true })
  lastAppraisalDate: Date;

  @Column({ name: 'next_appraisal_date', nullable: true })
  nextAppraisalDate: Date;

  @Column({ name: 'career_level', length: 50, nullable: true })
  careerLevel: string;

  @Column({ name: 'succession_plan_ready', default: false })
  successionPlanReady: boolean;

  @Column({ name: 'high_potential', default: false })
  highPotential: boolean;

  @Column({ name: 'retention_risk', length: 20, default: 'LOW' })
  retentionRisk: string; // LOW, MEDIUM, HIGH

  // Bank Account Information
  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_branch', length: 255, nullable: true })
  bankBranch: string;

  @Column({ name: 'bank_sort_code', length: 20, nullable: true })
  bankSortCode: string;

  @Column({ name: 'mobile_money_number', length: 20, nullable: true })
  mobileMoneyNumber: string;

  @Column({ name: 'mobile_money_network', length: 20, nullable: true })
  mobileMoneyNetwork: string; // MTN, Vodafone, AirtelTigo

  // System and Integration
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'badge_number', length: 50, nullable: true })
  badgeNumber: string;

  @Column({ name: 'biometric_id', length: 100, nullable: true })
  biometricId: string;

  @Column({ name: 'active_directory_username', length: 100, nullable: true })
  activeDirectoryUsername: string;

  @Column({ name: 'employee_portal_access', default: true })
  employeePortalAccess: boolean;

  @Column({ name: 'system_user_id', nullable: true })
  systemUserId: string;

  // Compliance and Audit
  @Column({ name: 'background_check_completed', default: false })
  backgroundCheckCompleted: boolean;

  @Column({ name: 'background_check_date', nullable: true })
  backgroundCheckDate: Date;

  @Column({ name: 'medical_exam_completed', default: false })
  medicalExamCompleted: boolean;

  @Column({ name: 'medical_exam_date', nullable: true })
  medicalExamDate: Date;

  @Column({ name: 'drug_test_completed', default: false })
  drugTestCompleted: boolean;

  @Column({ name: 'drug_test_date', nullable: true })
  drugTestDate: Date;

  @Column({ name: 'security_clearance_level', length: 50, nullable: true })
  securityClearanceLevel: string;

  // Additional Information
  @Column({ name: 'blood_type', length: 10, nullable: true })
  bloodType: string;

  @Column({ name: 'allergies', type: 'text', nullable: true })
  allergies: string;

  @Column({ name: 'medical_conditions', type: 'text', nullable: true })
  medicalConditions: string;

  @Column({ name: 'next_of_kin_name', length: 255, nullable: true })
  nextOfKinName: string;

  @Column({ name: 'next_of_kin_phone', length: 20, nullable: true })
  nextOfKinPhone: string;

  @Column({ name: 'next_of_kin_relationship', length: 100, nullable: true })
  nextOfKinRelationship: string;

  @Column({ name: 'next_of_kin_address', type: 'text', nullable: true })
  nextOfKinAddress: string;

  // Flexible Fields
  @Column({ name: 'custom_fields', type: 'text', nullable: true })
  customFields: string; // JSON for tenant-specific fields

  @Column({ name: 'tags', type: 'text', nullable: true })
  tags: string; // JSON array

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

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
  @ManyToOne(() => Employee, employee => employee.directReports, { nullable: true })
  @JoinColumn({ name: 'reporting_manager_id' })
  reportingManager: Employee;

  @OneToMany(() => Employee, employee => employee.reportingManager)
  directReports: Employee[];

  @OneToMany(() => EmployeeContract, contract => contract.employee)
  contracts: EmployeeContract[];

  @OneToMany(() => EmployeeLeave, leave => leave.employee)
  leaves: EmployeeLeave[];

  @OneToMany(() => EmployeePerformance, performance => performance.employee)
  performanceReviews: EmployeePerformance[];

  @OneToMany(() => EmployeeTraining, training => training.employee)
  trainings: EmployeeTraining[];
}