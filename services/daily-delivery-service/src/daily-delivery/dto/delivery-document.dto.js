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
exports.VerifyDocumentDto = exports.CreateDeliveryDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const delivery_documents_entity_1 = require("../entities/delivery-documents.entity");
class CreateDeliveryDocumentDto {
    deliveryId;
    documentType;
    documentName;
    documentNumber;
    fileUrl;
    fileSizeBytes;
    mimeType;
    isRequired;
    uploadedBy;
}
exports.CreateDeliveryDocumentDto = CreateDeliveryDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: delivery_documents_entity_1.DocumentType, description: 'Document type' }),
    (0, class_validator_1.IsEnum)(delivery_documents_entity_1.DocumentType),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "documentName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Document number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDeliveryDocumentDto.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MIME type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is required document' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDeliveryDocumentDto.prototype, "isRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded by user ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDeliveryDocumentDto.prototype, "uploadedBy", void 0);
class VerifyDocumentDto {
    verifiedBy;
    comments;
}
exports.VerifyDocumentDto = VerifyDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verified by user ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "verifiedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Verification comments' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyDocumentDto.prototype, "comments", void 0);
//# sourceMappingURL=delivery-document.dto.js.map