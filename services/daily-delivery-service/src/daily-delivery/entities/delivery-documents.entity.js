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
exports.DeliveryDocuments = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const daily_delivery_entity_1 = require("./daily-delivery.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["DELIVERY_RECEIPT"] = "DELIVERY_RECEIPT";
    DocumentType["BILL_OF_LADING"] = "BILL_OF_LADING";
    DocumentType["QUALITY_CERTIFICATE"] = "QUALITY_CERTIFICATE";
    DocumentType["CUSTOMS_DOCUMENT"] = "CUSTOMS_DOCUMENT";
    DocumentType["INSURANCE_CERTIFICATE"] = "INSURANCE_CERTIFICATE";
    DocumentType["ENVIRONMENTAL_PERMIT"] = "ENVIRONMENTAL_PERMIT";
    DocumentType["SAFETY_CERTIFICATE"] = "SAFETY_CERTIFICATE";
    DocumentType["WAYBILL"] = "WAYBILL";
    DocumentType["INVOICE_COPY"] = "INVOICE_COPY";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
let DeliveryDocuments = class DeliveryDocuments {
    id;
    deliveryId;
    documentType;
    documentName;
    documentNumber;
    fileUrl;
    fileSizeBytes;
    mimeType;
    isRequired;
    isVerified;
    verifiedBy;
    verificationDate;
    uploadedBy;
    uploadedAt;
    delivery;
};
exports.DeliveryDocuments = DeliveryDocuments;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_id', type: 'uuid' }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "deliveryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_type', type: 'enum', enum: DocumentType }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_name', length: 255 }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "documentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'document_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_url', type: 'text' }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size_bytes', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DeliveryDocuments.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_required', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DeliveryDocuments.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DeliveryDocuments.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verified_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verification_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DeliveryDocuments.prototype, "verificationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_by', type: 'uuid' }),
    __metadata("design:type", String)
], DeliveryDocuments.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'uploaded_at' }),
    __metadata("design:type", Date)
], DeliveryDocuments.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_delivery_entity_1.DailyDelivery, delivery => delivery.documents),
    (0, typeorm_1.JoinColumn)({ name: 'delivery_id' }),
    __metadata("design:type", daily_delivery_entity_1.DailyDelivery)
], DeliveryDocuments.prototype, "delivery", void 0);
exports.DeliveryDocuments = DeliveryDocuments = __decorate([
    (0, typeorm_1.Entity)('delivery_documents'),
    (0, typeorm_1.Index)(['deliveryId']),
    (0, typeorm_1.Index)(['documentType'])
], DeliveryDocuments);
//# sourceMappingURL=delivery-documents.entity.js.map