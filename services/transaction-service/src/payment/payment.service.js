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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const shared_types_1 = require("@omc-erp/shared-types");
const event_emitter_1 = require("@nestjs/event-emitter");
let PaymentService = PaymentService_1 = class PaymentService {
    eventEmitter;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    async processPayment(request) {
        try {
            switch (request.method) {
                case shared_types_1.PaymentMethod.CASH:
                    return this.processCashPayment(request);
                case shared_types_1.PaymentMethod.CARD:
                    return this.processCardPayment(request);
                case shared_types_1.PaymentMethod.MOBILE_MONEY:
                    return this.processMobileMoneyPayment(request);
                case shared_types_1.PaymentMethod.CREDIT:
                    return this.processCreditPayment(request);
                case shared_types_1.PaymentMethod.VOUCHER:
                    return this.processVoucherPayment(request);
                default:
                    return {
                        success: false,
                        error: `Unsupported payment method: ${request.method}`,
                    };
            }
        }
        catch (error) {
            this.logger.error(`Payment processing failed for transaction ${request.transactionId}`, error);
            return {
                success: false,
                error: error.message || 'Payment processing failed',
            };
        }
    }
    async refundPayment(request) {
        try {
            // In a real implementation, this would integrate with payment gateways
            // For now, we'll simulate successful refund processing
            const reference = this.generateReference('REF');
            this.logger.log(`Processing refund for transaction ${request.transactionId}: ${request.amount} - ${request.reason}`);
            // Emit payment event
            this.eventEmitter.emit('payment.refunded', {
                transactionId: request.transactionId,
                amount: request.amount,
                reference,
                reason: request.reason,
            });
            return {
                success: true,
                reference,
            };
        }
        catch (error) {
            this.logger.error(`Refund processing failed for transaction ${request.transactionId}`, error);
            return {
                success: false,
                error: error.message || 'Refund processing failed',
            };
        }
    }
    async processCashPayment(request) {
        // Cash payments are processed immediately
        const reference = this.generateReference('CASH');
        this.logger.log(`Processing cash payment for transaction ${request.transactionId}: ${request.amount}`);
        // Emit payment event
        this.eventEmitter.emit('payment.processed', {
            transactionId: request.transactionId,
            method: shared_types_1.PaymentMethod.CASH,
            amount: request.amount,
            reference,
        });
        return {
            success: true,
            reference,
        };
    }
    async processCardPayment(request) {
        // In a real implementation, this would integrate with card processing services
        // For now, we'll simulate card processing
        const reference = this.generateReference('CARD');
        this.logger.log(`Processing card payment for transaction ${request.transactionId}: ${request.amount}`);
        // Simulate card processing delay
        await this.delay(1000);
        // Simulate 95% success rate for card payments
        if (Math.random() < 0.95) {
            this.eventEmitter.emit('payment.processed', {
                transactionId: request.transactionId,
                method: shared_types_1.PaymentMethod.CARD,
                amount: request.amount,
                reference,
                cardNumber: request.details?.cardNumber ? `****${request.details.cardNumber.slice(-4)}` : undefined,
            });
            return {
                success: true,
                reference,
                externalReference: `EXT_${reference}`,
            };
        }
        else {
            return {
                success: false,
                error: 'Card payment declined',
            };
        }
    }
    async processMobileMoneyPayment(request) {
        // In a real implementation, this would integrate with mobile money APIs (MTN, Vodafone, AirtelTigo)
        const reference = this.generateReference('MOMO');
        this.logger.log(`Processing mobile money payment for transaction ${request.transactionId}: ${request.amount}`);
        // Simulate mobile money processing delay
        await this.delay(2000);
        // Simulate 92% success rate for mobile money payments
        if (Math.random() < 0.92) {
            this.eventEmitter.emit('payment.processed', {
                transactionId: request.transactionId,
                method: shared_types_1.PaymentMethod.MOBILE_MONEY,
                amount: request.amount,
                reference,
                provider: request.details?.provider,
                phoneNumber: request.details?.phoneNumber,
            });
            return {
                success: true,
                reference,
                externalReference: `MOMO_${reference}`,
            };
        }
        else {
            return {
                success: false,
                error: 'Mobile money payment failed',
            };
        }
    }
    async processCreditPayment(request) {
        // Credit payments require approval and are processed differently
        const reference = this.generateReference('CREDIT');
        this.logger.log(`Processing credit payment for transaction ${request.transactionId}: ${request.amount}`);
        // In a real system, this would check credit limits and approval workflows
        this.eventEmitter.emit('payment.processed', {
            transactionId: request.transactionId,
            method: shared_types_1.PaymentMethod.CREDIT,
            amount: request.amount,
            reference,
        });
        return {
            success: true,
            reference,
        };
    }
    async processVoucherPayment(request) {
        // Voucher payments require validation against voucher database
        const reference = this.generateReference('VOUCHER');
        this.logger.log(`Processing voucher payment for transaction ${request.transactionId}: ${request.amount}`);
        // In a real system, this would validate voucher codes
        if (!request.details?.voucherCode) {
            return {
                success: false,
                error: 'Voucher code is required',
            };
        }
        // Simulate voucher validation
        const isValidVoucher = await this.validateVoucher(request.details.voucherCode, request.amount);
        if (isValidVoucher) {
            this.eventEmitter.emit('payment.processed', {
                transactionId: request.transactionId,
                method: shared_types_1.PaymentMethod.VOUCHER,
                amount: request.amount,
                reference,
                voucherCode: request.details.voucherCode,
            });
            return {
                success: true,
                reference,
            };
        }
        else {
            return {
                success: false,
                error: 'Invalid or insufficient voucher',
            };
        }
    }
    async validateVoucher(voucherCode, amount) {
        // Simulate voucher validation logic
        await this.delay(500);
        // For demo purposes, vouchers starting with "VALID" are considered valid
        return voucherCode.startsWith('VALID') && amount <= 1000;
    }
    generateReference(prefix) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}_${timestamp}_${random}`;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], PaymentService);
//# sourceMappingURL=payment.service.js.map