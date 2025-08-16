import { EmployeeContract } from './employee-contract.entity';
import { EmployeeLeave } from './employee-leave.entity';
import { EmployeePerformance } from './employee-performance.entity';
import { EmployeeTraining } from './employee-training.entity';
export declare enum EmployeeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    TERMINATED = "TERMINATED",
    SUSPENDED = "SUSPENDED",
    ON_LEAVE = "ON_LEAVE",
    PROBATION = "PROBATION",
    RETIRED = "RETIRED"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare enum MaritalStatus {
    SINGLE = "SINGLE",
    MARRIED = "MARRIED",
    DIVORCED = "DIVORCED",
    WIDOWED = "WIDOWED",
    SEPARATED = "SEPARATED"
}
export declare enum EmploymentType {
    PERMANENT = "PERMANENT",
    CONTRACT = "CONTRACT",
    TEMPORARY = "TEMPORARY",
    INTERN = "INTERN",
    CONSULTANT = "CONSULTANT",
    PART_TIME = "PART_TIME"
}
export declare enum EducationLevel {
    PRIMARY = "PRIMARY",
    SECONDARY = "SECONDARY",
    DIPLOMA = "DIPLOMA",
    BACHELOR = "BACHELOR",
    MASTER = "MASTER",
    DOCTORATE = "DOCTORATE",
    PROFESSIONAL = "PROFESSIONAL",
    OTHER = "OTHER"
}
export declare class Employee {
    id: string;
    tenantId: string;
    employeeNumber: string;
    payrollNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    preferredName: string;
    dateOfBirth: Date;
    gender: Gender;
    maritalStatus: MaritalStatus;
    nationality: string;
    religion: string;
    ghanaCardNumber: string;
    passportNumber: string;
    passportExpiryDate: Date;
    driversLicenseNumber: string;
    driversLicenseExpiry: Date;
    votersId: string;
    ssnit: string;
    tin: string;
    nhisNumber: string;
    email: string;
    personalEmail: string;
    phone: string;
    mobile: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    residentialAddress: string;
    residentialCity: string;
    residentialRegion: string;
    residentialPostalCode: string;
    ghanaPostGPS: string;
    mailingAddress: string;
    hometown: string;
    districtOfOrigin: string;
    hireDate: Date;
    startDate: Date;
    probationEndDate: Date;
    confirmationDate: Date;
    terminationDate: Date;
    retirementDate: Date;
    employmentType: EmploymentType;
    status: EmployeeStatus;
    jobTitle: string;
    jobGrade: string;
    jobLevel: string;
    department: string;
    division: string;
    costCenter: string;
    workLocation: string;
    reportingManagerId: string;
    reportingManagerName: string;
    functionalManagerId: string;
    basicSalary: number;
    currency: string;
    payFrequency: string;
    payGrade: string;
    overtimeEligible: boolean;
    commissionEligible: boolean;
    housingAllowance: number;
    transportAllowance: number;
    fuelAllowance: number;
    medicalAllowance: number;
    mealAllowance: number;
    educationAllowance: number;
    riskAllowance: number;
    responsibilityAllowance: number;
    annualLeaveEntitlement: number;
    sickLeaveEntitlement: number;
    maternityLeaveEntitlement: number;
    paternityLeaveEntitlement: number;
    compassionateLeaveEntitlement: number;
    studyLeaveEligible: boolean;
    noticePeriodDays: number;
    highestEducationLevel: EducationLevel;
    institution: string;
    fieldOfStudy: string;
    graduationYear: number;
    professionalCertifications: string;
    languages: string;
    petroleumSafetyTraining: boolean;
    petroleumSafetyCertExpiry: Date;
    hseCertification: boolean;
    hseCertExpiry: Date;
    firefightingCertification: boolean;
    firstAidCertification: boolean;
    forkliftLicense: boolean;
    hazmatCertification: boolean;
    confinedSpaceTraining: boolean;
    workingAtHeightTraining: boolean;
    performanceRating: number;
    lastAppraisalDate: Date;
    nextAppraisalDate: Date;
    careerLevel: string;
    successionPlanReady: boolean;
    highPotential: boolean;
    retentionRisk: string;
    bankName: string;
    bankAccountNumber: string;
    bankBranch: string;
    bankSortCode: string;
    mobileMoneyNumber: string;
    mobileMoneyNetwork: string;
    photoUrl: string;
    badgeNumber: string;
    biometricId: string;
    activeDirectoryUsername: string;
    employeePortalAccess: boolean;
    systemUserId: string;
    backgroundCheckCompleted: boolean;
    backgroundCheckDate: Date;
    medicalExamCompleted: boolean;
    medicalExamDate: Date;
    drugTestCompleted: boolean;
    drugTestDate: Date;
    securityClearanceLevel: string;
    bloodType: string;
    allergies: string;
    medicalConditions: string;
    nextOfKinName: string;
    nextOfKinPhone: string;
    nextOfKinRelationship: string;
    nextOfKinAddress: string;
    customFields: string;
    tags: string;
    notes: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    reportingManager: Employee;
    directReports: Employee[];
    contracts: EmployeeContract[];
    leaves: EmployeeLeave[];
    performanceReviews: EmployeePerformance[];
    trainings: EmployeeTraining[];
}
//# sourceMappingURL=employee.entity.d.ts.map