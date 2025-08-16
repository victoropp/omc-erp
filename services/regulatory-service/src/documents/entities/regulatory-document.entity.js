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
exports.RegulatoryDocument = void 0;
const typeorm_1 = require("typeorm");
const shared_types_1 = require("@omc-erp/shared-types");
let RegulatoryDocument = class RegulatoryDocument {
    id;
    tenantId;
    type;
    title;
    description;
    documentNumber; // NPA reference number
    version;
    fileUrl;
    fileHash; // SHA-256 hash for integrity verification
    fileName;
    mimeType;
    fileSize; // in bytes
    effectiveDate;
    expiryDate;
    publicationDate;
    sourceUrl; // Original NPA URL
    isActive;
    metadata;
    parsedContent;
    notes;
    uploadedBy;
    verifiedBy;
    verifiedAt;
    supersededBy; // Reference to newer version
    supersedes; // Reference to older version
    createdAt;
    updatedAt;
    // Helper methods
    isEffectiveOn(date) {
        return date >= this.effectiveDate &&
            (!this.expiryDate || date <= this.expiryDate) &&
            this.isActive;
    }
    isCurrentVersion() {
        return this.isActive && !this.supersededBy;
    }
    getFileExtension() {
        return this.fileName.split('.').pop()?.toLowerCase() || '';
    }
    getHumanReadableSize() {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        let size = this.fileSize;
        let i = 0;
        while (size >= 1024 && i < sizes.length - 1) {
            size /= 1024;
            i++;
        }
        return `${Math.round(size * 100) / 100} ${sizes[i]}`;
    }
};
exports.RegulatoryDocument = RegulatoryDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_types_1.RegulatoryDocType,
    }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 200 }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 64, unique: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "fileHash", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], RegulatoryDocument.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "publicationDate", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 200, nullable: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], RegulatoryDocument.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], RegulatoryDocument.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], RegulatoryDocument.prototype, "parsedContent", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "supersededBy", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], RegulatoryDocument.prototype, "supersedes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RegulatoryDocument.prototype, "updatedAt", void 0);
exports.RegulatoryDocument = RegulatoryDocument = __decorate([
    (0, typeorm_1.Entity)('regulatory_documents'),
    (0, typeorm_1.Index)(['tenantId', 'type', 'effectiveDate']),
    (0, typeorm_1.Index)(['fileHash'], { unique: true })
], RegulatoryDocument);
//# sourceMappingURL=regulatory-document.entity.js.map