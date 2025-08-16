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
exports.CreatePricingWindowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePricingWindowDto {
    windowId;
    startDate;
    endDate;
    npaGuidelineDocId;
    notes;
}
exports.CreatePricingWindowDto = CreatePricingWindowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025W15', description: 'Pricing window ID in YYYYWXX format' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 20),
    (0, class_validator_1.Matches)(/^\d{4}W\d{2}$/, { message: 'Window ID must be in format YYYYWXX (e.g., 2025W15)' }),
    __metadata("design:type", String)
], CreatePricingWindowDto.prototype, "windowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-04-07', description: 'Window start date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePricingWindowDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-04-20', description: 'Window end date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePricingWindowDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'UUID of NPA guideline document' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePricingWindowDto.prototype, "npaGuidelineDocId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Additional notes for this pricing window' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePricingWindowDto.prototype, "notes", void 0);
//# sourceMappingURL=create-pricing-window.dto.js.map