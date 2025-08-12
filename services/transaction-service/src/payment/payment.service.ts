import { Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '@omc-erp/shared-types';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface PaymentRequest {
  transactionId: string;
  amount: number;
  method: PaymentMethod;
  details?: {
    provider?: string;
    phoneNumber?: string;
    cardNumber?: string;
    voucherCode?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  error?: string;
  externalReference?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      switch (request.method) {
        case PaymentMethod.CASH:
          return this.processCashPayment(request);
        case PaymentMethod.CARD:
          return this.processCardPayment(request);
        case PaymentMethod.MOBILE_MONEY:
          return this.processMobileMoneyPayment(request);
        case PaymentMethod.CREDIT:
          return this.processCreditPayment(request);
        case PaymentMethod.VOUCHER:
          return this.processVoucherPayment(request);
        default:
          return {
            success: false,
            error: `Unsupported payment method: ${request.method}`,
          };
      }
    } catch (error) {
      this.logger.error(`Payment processing failed for transaction ${request.transactionId}`, error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  async refundPayment(request: RefundRequest): Promise<PaymentResult> {
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
    } catch (error) {
      this.logger.error(`Refund processing failed for transaction ${request.transactionId}`, error);
      return {
        success: false,
        error: error.message || 'Refund processing failed',
      };
    }
  }

  private async processCashPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Cash payments are processed immediately
    const reference = this.generateReference('CASH');
    
    this.logger.log(`Processing cash payment for transaction ${request.transactionId}: ${request.amount}`);

    // Emit payment event
    this.eventEmitter.emit('payment.processed', {
      transactionId: request.transactionId,
      method: PaymentMethod.CASH,
      amount: request.amount,
      reference,
    });

    return {
      success: true,
      reference,
    };
  }

  private async processCardPayment(request: PaymentRequest): Promise<PaymentResult> {
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
        method: PaymentMethod.CARD,
        amount: request.amount,
        reference,
        cardNumber: request.details?.cardNumber ? `****${request.details.cardNumber.slice(-4)}` : undefined,
      });

      return {
        success: true,
        reference,
        externalReference: `EXT_${reference}`,
      };
    } else {
      return {
        success: false,
        error: 'Card payment declined',
      };
    }
  }

  private async processMobileMoneyPayment(request: PaymentRequest): Promise<PaymentResult> {
    // In a real implementation, this would integrate with mobile money APIs (MTN, Vodafone, AirtelTigo)
    const reference = this.generateReference('MOMO');
    
    this.logger.log(`Processing mobile money payment for transaction ${request.transactionId}: ${request.amount}`);

    // Simulate mobile money processing delay
    await this.delay(2000);

    // Simulate 92% success rate for mobile money payments
    if (Math.random() < 0.92) {
      this.eventEmitter.emit('payment.processed', {
        transactionId: request.transactionId,
        method: PaymentMethod.MOBILE_MONEY,
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
    } else {
      return {
        success: false,
        error: 'Mobile money payment failed',
      };
    }
  }

  private async processCreditPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Credit payments require approval and are processed differently
    const reference = this.generateReference('CREDIT');
    
    this.logger.log(`Processing credit payment for transaction ${request.transactionId}: ${request.amount}`);

    // In a real system, this would check credit limits and approval workflows
    
    this.eventEmitter.emit('payment.processed', {
      transactionId: request.transactionId,
      method: PaymentMethod.CREDIT,
      amount: request.amount,
      reference,
    });

    return {
      success: true,
      reference,
    };
  }

  private async processVoucherPayment(request: PaymentRequest): Promise<PaymentResult> {
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
        method: PaymentMethod.VOUCHER,
        amount: request.amount,
        reference,
        voucherCode: request.details.voucherCode,
      });

      return {
        success: true,
        reference,
      };
    } else {
      return {
        success: false,
        error: 'Invalid or insufficient voucher',
      };
    }
  }

  private async validateVoucher(voucherCode: string, amount: number): Promise<boolean> {
    // Simulate voucher validation logic
    await this.delay(500);
    
    // For demo purposes, vouchers starting with "VALID" are considered valid
    return voucherCode.startsWith('VALID') && amount <= 1000;
  }

  private generateReference(prefix: string): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}_${timestamp}_${random}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}