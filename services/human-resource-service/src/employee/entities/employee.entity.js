"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = exports.EducationLevel = exports.EmploymentType = exports.MaritalStatus = exports.Gender = exports.EmployeeStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_contract_entity_1 = require("./employee-contract.entity");
const employee_leave_entity_1 = require("./employee-leave.entity");
const employee_performance_entity_1 = require("./employee-performance.entity");
const employee_training_entity_1 = require("./employee-training.entity");
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "ACTIVE";
    EmployeeStatus["INACTIVE"] = "INACTIVE";
    EmployeeStatus["TERMINATED"] = "TERMINATED";
    EmployeeStatus["SUSPENDED"] = "SUSPENDED";
    EmployeeStatus["ON_LEAVE"] = "ON_LEAVE";
    EmployeeStatus["PROBATION"] = "PROBATION";
    EmployeeStatus["RETIRED"] = "RETIRED";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
    MaritalStatus["SEPARATED"] = "SEPARATED";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["PERMANENT"] = "PERMANENT";
    EmploymentType["CONTRACT"] = "CONTRACT";
    EmploymentType["TEMPORARY"] = "TEMPORARY";
    EmploymentType["INTERN"] = "INTERN";
    EmploymentType["CONSULTANT"] = "CONSULTANT";
    EmploymentType["PART_TIME"] = "PART_TIME";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));
var EducationLevel;
(function (EducationLevel) {
    EducationLevel["PRIMARY"] = "PRIMARY";
    EducationLevel["SECONDARY"] = "SECONDARY";
    EducationLevel["DIPLOMA"] = "DIPLOMA";
    EducationLevel["BACHELOR"] = "BACHELOR";
    EducationLevel["MASTER"] = "MASTER";
    EducationLevel["DOCTORATE"] = "DOCTORATE";
    EducationLevel["PROFESSIONAL"] = "PROFESSIONAL";
    EducationLevel["OTHER"] = "OTHER";
})(EducationLevel || (exports.EducationLevel = EducationLevel = {}));
let Employee = class Employee {
    id;
    tenantId;
    employeeNumber;
    payrollNumber;
    // Personal Information
    firstName;
    middleName;
    lastName;
    fullName;
    preferredName;
    dateOfBirth;
    gender;
    maritalStatus;
    nationality;
    religion;
    // Ghana-Specific Identification
    ghanaCardNumber;
    passportNumber;
    passportExpiryDate;
    driversLicenseNumber;
    driversLicenseExpiry;
    votersId;
    // Social Security and Tax
    ssnit; // Social Security and National Insurance Trust
    tin; // Tax Identification Number
    nhisNumber; // National Health Insurance Scheme
    // Contact Information
    email;
    personalEmail;
    phone;
    mobile;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelationship;
    // Address Information
    residentialAddress;
    residentialCity;
    residentialRegion;
    residentialPostalCode;
    ghanaPostGPS; // Ghana Post GPS address
    mailingAddress;
    hometown;
    districtOfOrigin;
    // Employment Information
    hireDate;
    startDate;
    probationEndDate;
    confirmationDate;
    terminationDate;
    retirementDate;
    employmentType;
    status;
    // Job Information
    jobTitle;
    jobGrade;
    jobLevel;
    department;
    division;
    costCenter;
    workLocation;
    reportingManagerId;
    reportingManagerName;
    functionalManagerId;
    // Compensation
    basicSalary;
    currency;
    payFrequency; // WEEKLY, BIWEEKLY, MONTHLY
    payGrade;
    overtimeEligible;
    commissionEligible;
    // Benefits and Allowances
    housingAllowance;
    transportAllowance;
    fuelAllowance;
    medicalAllowance;
    mealAllowance;
    educationAllowance;
    riskAllowance;
    responsibilityAllowance;
    // Ghana Labor Law Compliance
    annualLeaveEntitlement; // Minimum 15 days in Ghana
    sickLeaveEntitlement;
    maternityLeaveEntitlement; // 12 weeks in Ghana
    paternityLeaveEntitlement; // 1 week in Ghana
    compassionateLeaveEntitlement;
    studyLeaveEligible;
    noticePeriodDays;
    // Education and Qualifications
    highestEducationLevel;
    institution;
    fieldOfStudy;
    graduationYear;
    professionalCertifications; // JSON array
    languages; // JSON array of languages
    // Ghana OMC Specific Fields
    petroleumSafetyTraining;
    petroleumSafetyCertExpiry;
    hseCertification;
    hseCertExpiry;
    firefightingCertification;
    firstAidCertification;
    forkliftLicense;
    hazmatCertification;
    confinedSpaceTraining;
    workingAtHeightTraining;
    // Performance and Development
    performanceRating; // Out of 5
    lastAppraisalDate;
    nextAppraisalDate;
    careerLevel;
    successionPlanReady;
    highPotential;
    retentionRisk; // LOW, MEDIUM, HIGH
    // Bank Account Information
    bankName;
    bankAccountNumber;
    bankBranch;
    bankSortCode;
    mobileMoneyNumber;
    mobileMoneyNetwork; // MTN, Vodafone, AirtelTigo
    // System and Integration
    photoUrl;
    badgeNumber;
    biometricId;
    activeDirectoryUsername;
    employeePortalAccess;
    systemUserId;
    // Compliance and Audit
    backgroundCheckCompleted;
    backgroundCheckDate;
    medicalExamCompleted;
    medicalExamDate;
    drugTestCompleted;
    drugTestDate;
    securityClearanceLevel;
    // Additional Information
    bloodType;
    allergies;
    medicalConditions;
    nextOfKinName;
    nextOfKinPhone;
    nextOfKinRelationship;
    nextOfKinAddress;
    // Flexible Fields
    customFields; // JSON for tenant-specific fields
    tags; // JSON array
    notes;
    // Audit Fields
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
    // Relationships
    reportingManager;
    directReports;
    contracts;
    leaves;
    performanceReviews;
    trainings;
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Employee.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_number', length: 50, unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payroll_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "payrollNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'middle_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', length: 300 }),
    __metadata("design:type", String)
], Employee.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "preferredName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date' }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'gender',
        type: 'enum',
        enum: Gender
    }),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'marital_status',
        type: 'enum',
        enum: MaritalStatus,
        default: MaritalStatus.SINGLE
    }),
    __metadata("design:type", String)
], Employee.prototype, "maritalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nationality', length: 100, default: 'Ghanaian' }),
    __metadata("design:type", String)
], Employee.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'religion', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "religion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_card_number', length: 20, unique: true, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "ghanaCardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'passport_number', length: 20, unique: true, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "passportNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'passport_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "passportExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drivers_license_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "driversLicenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drivers_license_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "driversLicenseExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voters_id', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "votersId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ssnit', length: 20, unique: true, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "ssnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tin', length: 20, unique: true, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "tin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nhis_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nhisNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 255, unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'personal_email', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "personalEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', length: 20 }),
    __metadata("design:type", String)
], Employee.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_name', length: 255 }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_phone', length: 20 }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_relationship', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residential_address', type: 'text' }),
    __metadata("design:type", String)
], Employee.prototype, "residentialAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residential_city', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "residentialCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residential_region', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "residentialRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'residential_postal_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "residentialPostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ghana_post_gps', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "ghanaPostGPS", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mailing_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "mailingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hometown', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "hometown", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'district_of_origin', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "districtOfOrigin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hire_date', type: 'date' }),
    __metadata("design:type", Date)
], Employee.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Employee.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'probation_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "probationEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confirmation_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "confirmationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termination_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retirement_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "retirementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employment_type',
        type: 'enum',
        enum: EmploymentType,
        default: EmploymentType.PERMANENT
    }),
    __metadata("design:type", String)
], Employee.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.PROBATION
    }),
    __metadata("design:type", String)
], Employee.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_title', length: 255 }),
    __metadata("design:type", String)
], Employee.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_grade', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "jobGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_level', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "jobLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department', length: 100 }),
    __metadata("design:type", String)
], Employee.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'division', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_center', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_location', length: 255 }),
    __metadata("design:type", String)
], Employee.prototype, "workLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reporting_manager_id', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "reportingManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reporting_manager_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "reportingManagerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'functional_manager_id', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "functionalManagerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'basic_salary', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Employee.prototype, "basicSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'GHS' }),
    __metadata("design:type", String)
], Employee.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_frequency', length: 20, default: 'MONTHLY' }),
    __metadata("design:type", String)
], Employee.prototype, "payFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pay_grade', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "payGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overtime_eligible', default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "overtimeEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'commission_eligible', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "commissionEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'housing_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "housingAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transport_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "transportAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuel_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "fuelAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "medicalAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meal_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "mealAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'education_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "educationAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "riskAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsibility_allowance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "responsibilityAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annual_leave_entitlement', default: 15 }),
    __metadata("design:type", Number)
], Employee.prototype, "annualLeaveEntitlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sick_leave_entitlement', default: 12 }),
    __metadata("design:type", Number)
], Employee.prototype, "sickLeaveEntitlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maternity_leave_entitlement', default: 84 }),
    __metadata("design:type", Number)
], Employee.prototype, "maternityLeaveEntitlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paternity_leave_entitlement', default: 7 }),
    __metadata("design:type", Number)
], Employee.prototype, "paternityLeaveEntitlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compassionate_leave_entitlement', default: 3 }),
    __metadata("design:type", Number)
], Employee.prototype, "compassionateLeaveEntitlement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'study_leave_eligible', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "studyLeaveEligible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notice_period_days', default: 30 }),
    __metadata("design:type", Number)
], Employee.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'highest_education_level',
        type: 'enum',
        enum: EducationLevel,
        nullable: true
    }),
    __metadata("design:type", String)
], Employee.prototype, "highestEducationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'institution', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "institution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_of_study', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "fieldOfStudy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'graduation_year', nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "graduationYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'professional_certifications', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "professionalCertifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'languages', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "languages", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_safety_training', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "petroleumSafetyTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'petroleum_safety_cert_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "petroleumSafetyCertExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hse_certification', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "hseCertification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hse_cert_expiry', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "hseCertExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'firefighting_certification', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "firefightingCertification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_aid_certification', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "firstAidCertification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'forklift_license', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "forkliftLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hazmat_certification', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "hazmatCertification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confined_space_training', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "confinedSpaceTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'working_at_height_training', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "workingAtHeightTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performance_rating', type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "performanceRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_appraisal_date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "lastAppraisalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_appraisal_date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "nextAppraisalDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'career_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "careerLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'succession_plan_ready', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "successionPlanReady", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'high_potential', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "highPotential", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retention_risk', length: 20, default: 'LOW' }),
    __metadata("design:type", String)
], Employee.prototype, "retentionRisk", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_branch', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_sort_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bankSortCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "mobileMoneyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mobile_money_network', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "mobileMoneyNetwork", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'badge_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "badgeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'biometric_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "biometricId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'active_directory_username', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "activeDirectoryUsername", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_portal_access', default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "employeePortalAccess", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_user_id', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "systemUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'background_check_completed', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "backgroundCheckCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'background_check_date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "backgroundCheckDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_exam_completed', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "medicalExamCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_exam_date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "medicalExamDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_test_completed', default: false }),
    __metadata("design:type", Boolean)
], Employee.prototype, "drugTestCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'drug_test_date', nullable: true }),
    __metadata("design:type", Date)
], Employee.prototype, "drugTestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'security_clearance_level', length: 50, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "securityClearanceLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blood_type', length: 10, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "bloodType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allergies', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medical_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "medicalConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_of_kin_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nextOfKinName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_of_kin_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nextOfKinPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_of_kin_relationship', length: 100, nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nextOfKinRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_of_kin_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "nextOfKinAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'custom_fields', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tags', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], Employee.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Employee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Employee.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee, employee => employee.directReports, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reporting_manager_id' }),
    __metadata("design:type", Employee)
], Employee.prototype, "reportingManager", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Employee, employee => employee.reportingManager),
    __metadata("design:type", Array)
], Employee.prototype, "directReports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_contract_entity_1.EmployeeContract, contract => contract.employee),
    __metadata("design:type", Array)
], Employee.prototype, "contracts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_leave_entity_1.EmployeeLeave, leave => leave.employee),
    __metadata("design:type", Array)
], Employee.prototype, "leaves", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_performance_entity_1.EmployeePerformance, performance => performance.employee),
    __metadata("design:type", Array)
], Employee.prototype, "performanceReviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_training_entity_1.EmployeeTraining, training => training.employee),
    __metadata("design:type", Array)
], Employee.prototype, "trainings", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees'),
    (0, typeorm_1.Index)(['tenantId', 'employeeNumber']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'department']),
    (0, typeorm_1.Index)(['ghanaCardNumber']),
    (0, typeorm_1.Index)(['passportNumber']),
    (0, typeorm_1.Index)(['ssnit'])
], Employee);
//# sourceMappingURL=employee.entity.js.map