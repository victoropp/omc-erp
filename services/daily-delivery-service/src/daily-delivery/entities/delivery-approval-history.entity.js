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
exports.DeliveryApprovalHistory = exports.ApprovalAction = void 0;
const typeorm_1 = require("typeorm");
const daily_delivery_entity_1 = require("./daily-delivery.entity");
var ApprovalAction;
(function (ApprovalAction) {
    ApprovalAction["SUBMITTED"] = "SUBMITTED";
    ApprovalAction["APPROVED"] = "APPROVED";
    ApprovalAction["REJECTED"] = "REJECTED";
    ApprovalAction["RETURNED"] = "RETURNED";
    ApprovalAction["CANCELLED"] = "CANCELLED";
    ApprovalAction["ESCALATED"] = "ESCALATED";
})(ApprovalAction || (exports.ApprovalAction = ApprovalAction = {}));
let DeliveryApprovalHistory = class DeliveryApprovalHistory {
    id;
    deliveryId;
    approvalStep;
    action;
    approvedBy;
    approverRole;
    comments;
    decisionDeadline;
    escalationFlag;
    actionDate;
    delivery;
};
exports.DeliveryApprovalHistory = DeliveryApprovalHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_id', type: 'uuid' }),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "deliveryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_step', type: 'integer' }),
    __metadata("design:type", Number)
], DeliveryApprovalHistory.prototype, "approvalStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action', type: 'enum', enum: ApprovalAction }),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid' }),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approver_role', length: 100 }),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "approverRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliveryApprovalHistory.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'decision_deadline', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DeliveryApprovalHistory.prototype, "decisionDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escalation_flag', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DeliveryApprovalHistory.prototype, "escalationFlag", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'action_date' }),
    __metadata("design:type", Date)
], DeliveryApprovalHistory.prototype, "actionDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_delivery_entity_1.DailyDelivery, delivery => delivery.approvalHistory),
    (0, typeorm_1.JoinColumn)({ name: 'delivery_id' }),
    __metadata("design:type", daily_delivery_entity_1.DailyDelivery)
], DeliveryApprovalHistory.prototype, "delivery", void 0);
exports.DeliveryApprovalHistory = DeliveryApprovalHistory = __decorate([
    (0, typeorm_1.Entity)('delivery_approval_history'),
    (0, typeorm_1.Index)(['deliveryId']),
    (0, typeorm_1.Index)(['approvedBy'])
], DeliveryApprovalHistory);
//# sourceMappingURL=delivery-approval-history.entity.js.map