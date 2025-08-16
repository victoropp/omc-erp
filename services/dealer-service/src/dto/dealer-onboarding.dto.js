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
exports.DealerResponseDto = exports.ApproveDealerDto = exports.DealerCreditAssessmentDto = exports.UploadDealerDocumentsDto = exports.DealerDocumentDto = exports.CreateDealerDto = exports.DealerBusinessInfoDto = exports.DealerBankAccountDto = exports.DealerAddressDto = exports.DealerContactInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DealerContactInfoDto {
    primaryPhone;
    secondaryPhone;
    email;
    whatsappNumber;
}
exports.DealerContactInfoDto = DealerContactInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary phone number' }),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], DealerContactInfoDto.prototype, "primaryPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Secondary phone number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], DealerContactInfoDto.prototype, "secondaryPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], DealerContactInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'WhatsApp number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], DealerContactInfoDto.prototype, "whatsappNumber", void 0);
class DealerAddressDto {
    street;
    city;
    region;
    gpsAddress;
    postalCode;
    landmark;
}
exports.DealerAddressDto = DealerAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Region' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GPS address', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "gpsAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Postal code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Landmark', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerAddressDto.prototype, "landmark", void 0);
class DealerBankAccountDto {
    accountName;
    accountNumber;
    bankName;
    bankCode;
    branchCode;
    branchName;
}
exports.DealerBankAccountDto = DealerBankAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "branchCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBankAccountDto.prototype, "branchName", void 0);
class DealerBusinessInfoDto {
    registrationNumber;
    tinNumber;
    vatNumber;
    businessType;
    incorporationDate;
    employeeCount;
}
exports.DealerBusinessInfoDto = DealerBusinessInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business registration number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBusinessInfoDto.prototype, "registrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TIN number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBusinessInfoDto.prototype, "tinNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'VAT registration number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBusinessInfoDto.prototype, "vatNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerBusinessInfoDto.prototype, "businessType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of incorporation' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DealerBusinessInfoDto.prototype, "incorporationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of employees', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DealerBusinessInfoDto.prototype, "employeeCount", void 0);
class CreateDealerDto {
    stationId;
    firstName;
    lastName;
    nationalId;
    dateOfBirth;
    contactInfo;
    address;
    bankAccount;
    businessInfo;
    emergencyContactName;
    emergencyContactPhone;
    emergencyContactRelationship;
    expectedMonthlySales;
    previousExperience;
    requestedCreditLimit;
    notes;
}
exports.CreateDealerDto = CreateDealerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID where dealer operates' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'National ID number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "nationalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contact information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DealerContactInfoDto),
    __metadata("design:type", DealerContactInfoDto)
], CreateDealerDto.prototype, "contactInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Residential address' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DealerAddressDto),
    __metadata("design:type", DealerAddressDto)
], CreateDealerDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account details' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DealerBankAccountDto),
    __metadata("design:type", DealerBankAccountDto)
], CreateDealerDto.prototype, "bankAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DealerBusinessInfoDto),
    __metadata("design:type", DealerBusinessInfoDto)
], CreateDealerDto.prototype, "businessInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Emergency contact name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Emergency contact phone' }),
    (0, class_validator_1.IsPhoneNumber)('GH'),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Relationship to emergency contact' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected monthly sales volume (litres)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "expectedMonthlySales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Previous fuel retail experience (years)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "previousExperience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Credit limit requested (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDealerDto.prototype, "requestedCreditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealerDto.prototype, "notes", void 0);
class DealerDocumentDto {
    documentType;
    documentUrl;
    description;
    expiryDate;
}
exports.DealerDocumentDto = DealerDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerDocumentDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerDocumentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiry date if applicable', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DealerDocumentDto.prototype, "expiryDate", void 0);
class UploadDealerDocumentsDto {
    dealerId;
    documents;
}
exports.UploadDealerDocumentsDto = UploadDealerDocumentsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDealerDocumentsDto.prototype, "dealerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of documents to upload', type: [DealerDocumentDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DealerDocumentDto),
    __metadata("design:type", Array)
], UploadDealerDocumentsDto.prototype, "documents", void 0);
class DealerCreditAssessmentDto {
    creditScore;
    recommendedCreditLimit;
    riskRating;
    assessmentNotes;
    requiresGuarantor;
    collateralRequired;
}
exports.DealerCreditAssessmentDto = DealerCreditAssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Credit score', minimum: 300, maximum: 850 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(300),
    (0, class_validator_1.Max)(850),
    __metadata("design:type", Number)
], DealerCreditAssessmentDto.prototype, "creditScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recommended credit limit (GHS)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DealerCreditAssessmentDto.prototype, "recommendedCreditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Risk rating' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerCreditAssessmentDto.prototype, "riskRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment notes' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealerCreditAssessmentDto.prototype, "assessmentNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requires guarantor' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DealerCreditAssessmentDto.prototype, "requiresGuarantor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Collateral required (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DealerCreditAssessmentDto.prototype, "collateralRequired", void 0);
class ApproveDealerDto {
    approved;
    approvedCreditLimit;
    approvalNotes;
    conditions;
}
exports.ApproveDealerDto = ApproveDealerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval decision' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApproveDealerDto.prototype, "approved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approved credit limit (GHS)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ApproveDealerDto.prototype, "approvedCreditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval notes' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveDealerDto.prototype, "approvalNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conditions or restrictions', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ApproveDealerDto.prototype, "conditions", void 0);
class DealerResponseDto {
    id;
    dealerCode;
    fullName;
    stationId;
    status;
    contactInfo;
    creditLimit;
    outstandingBalance;
    lastActivityDate;
    createdAt;
}
exports.DealerResponseDto = DealerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer ID' }),
    __metadata("design:type", String)
], DealerResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dealer code' }),
    __metadata("design:type", String)
], DealerResponseDto.prototype, "dealerCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name' }),
    __metadata("design:type", String)
], DealerResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Station ID' }),
    __metadata("design:type", String)
], DealerResponseDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status' }),
    __metadata("design:type", String)
], DealerResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contact information' }),
    __metadata("design:type", DealerContactInfoDto)
], DealerResponseDto.prototype, "contactInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Credit limit' }),
    __metadata("design:type", Number)
], DealerResponseDto.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Outstanding balance' }),
    __metadata("design:type", Number)
], DealerResponseDto.prototype, "outstandingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last activity date' }),
    __metadata("design:type", Date)
], DealerResponseDto.prototype, "lastActivityDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation date' }),
    __metadata("design:type", Date)
], DealerResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=dealer-onboarding.dto.js.map