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
exports.ProcessApprovalDto = exports.SubmitForApprovalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const delivery_approval_history_entity_1 = require("../entities/delivery-approval-history.entity");
class SubmitForApprovalDto {
    comments;
    submittedBy;
}
exports.SubmitForApprovalDto = SubmitForApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comments for approval submission' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitForApprovalDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID submitting for approval' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitForApprovalDto.prototype, "submittedBy", void 0);
class ProcessApprovalDto {
    action;
    comments;
    approvedBy;
    decisionDeadline;
}
exports.ProcessApprovalDto = ProcessApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: delivery_approval_history_entity_1.ApprovalAction, description: 'Approval action' }),
    (0, class_validator_1.IsEnum)(delivery_approval_history_entity_1.ApprovalAction),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approval comments' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID processing the approval' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "approvedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Decision deadline' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "decisionDeadline", void 0);
//# sourceMappingURL=approval-action.dto.js.map