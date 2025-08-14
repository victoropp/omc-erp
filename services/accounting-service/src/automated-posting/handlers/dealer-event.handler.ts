import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';

@Injectable()
export class DealerEventHandler {
  private readonly logger = new Logger(DealerEventHandler.name);

  constructor(
    private automatedPostingService: AutomatedPostingService,
  ) {}

  /**
   * Handle dealer settlement approved
   */
  @OnEvent('dealer.settlement.approved')
  async handleDealerSettlementApproved(payload: any) {
    try {
      this.logger.log(`Processing dealer settlement: ${payload.settlementId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.settlement.approved',
        transactionType: 'DEALER_SETTLEMENT',
        sourceDocumentType: 'DEALER_SETTLEMENT',
        sourceDocumentId: payload.settlementId,
        transactionData: {
          settlement_id: payload.settlementId,
          settlement_number: payload.settlementNumber,
          settlement_date: payload.settlementDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          window_id: payload.windowId,
          
          // Settlement period
          period_start: payload.periodStart,
          period_end: payload.periodEnd,
          period_days: payload.periodDays,
          
          // Earnings
          gross_dealer_margin: payload.grossDealerMargin,
          volume_sold_litres: payload.volumeSoldLitres,
          margin_per_litre: payload.grossDealerMargin / payload.volumeSoldLitres,
          other_income: payload.otherIncome || 0,
          total_earnings: payload.grossDealerMargin + (payload.otherIncome || 0),
          
          // Product breakdown
          product_sales: payload.productSales || [],
          margin_by_product: payload.marginByProduct || {},
          
          // Deductions
          loan_deduction: payload.loanDeduction || 0,
          shortage_deduction: payload.shortageDeduction || 0,
          damage_deduction: payload.damageDeduction || 0,
          advance_deduction: payload.advanceDeduction || 0,
          tax_deduction: payload.taxDeduction || 0,
          other_deductions: payload.otherDeductions || 0,
          total_deductions: payload.totalDeductions,
          
          // Loan details
          loan_ids: payload.loanIds || [],
          loan_installments: payload.loanInstallments || [],
          principal_repayment: payload.principalRepayment || 0,
          interest_payment: payload.interestPayment || 0,
          
          // Net settlement
          net_payable: payload.netPayable,
          settlement_method: payload.settlementMethod, // 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'OFFSET'
          
          // Tax calculations
          withholding_tax_rate: payload.withholdingTaxRate || 0,
          withholding_tax_amount: payload.withholdingTaxAmount || 0,
          vat_on_margin: payload.vatOnMargin || 0,
          
          // Payment details
          payment_status: payload.paymentStatus || 'PENDING',
          payment_date: payload.paymentDate,
          payment_reference: payload.paymentReference,
          bank_account_number: payload.bankAccountNumber,
          
          // Approval details
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          approval_notes: payload.approvalNotes,
          
          // Supporting documents
          volume_reconciliation: payload.volumeReconciliation || {},
          shortage_analysis: payload.shortageAnalysis || {},
          damage_reports: payload.damageReports || [],
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.settlementDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer settlement ${payload.settlementId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer margin accrual (monthly)
   */
  @OnEvent('dealer.margin.accrual')
  async handleDealerMarginAccrual(payload: any) {
    try {
      this.logger.log(`Processing dealer margin accrual: ${payload.accrualId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.margin.accrual',
        transactionType: 'DEALER_MARGIN_ACCRUAL',
        sourceDocumentType: 'MARGIN_ACCRUAL',
        sourceDocumentId: payload.accrualId,
        transactionData: {
          accrual_id: payload.accrualId,
          accrual_date: payload.accrualDate,
          accrual_period: payload.accrualPeriod,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Sales data for accrual
          period_sales_volume: payload.periodSalesVolume,
          period_sales_value: payload.periodSalesValue,
          
          // Margin calculation
          dealer_margin_rate: payload.dealerMarginRate,
          gross_margin_amount: payload.grossMarginAmount,
          
          // Product breakdown
          sales_by_product: payload.salesByProduct || {},
          margin_by_product: payload.marginByProduct || {},
          
          // Estimated deductions
          estimated_shortages: payload.estimatedShortages || 0,
          estimated_damages: payload.estimatedDamages || 0,
          estimated_other_deductions: payload.estimatedOtherDeductions || 0,
          
          // Net accrual
          net_accrual_amount: payload.netAccrualAmount,
          
          // Previous period adjustments
          previous_accrual_reversal: payload.previousAccrualReversal || 0,
          prior_period_adjustments: payload.priorPeriodAdjustments || 0,
          
          // Confidence and risk assessment
          accrual_confidence_level: payload.accrualConfidenceLevel || 90,
          risk_adjustment: payload.riskAdjustment || 0,
          
          // Supporting data
          daily_sales_data: payload.dailySalesData || [],
          pump_readings: payload.pumpReadings || [],
          delivery_receipts: payload.deliveryReceipts || [],
          
          // Approval
          calculated_by: payload.calculatedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.accrualDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer margin accrual ${payload.accrualId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer loan disbursement
   */
  @OnEvent('dealer.loan.disbursed')
  async handleDealerLoanDisbursed(payload: any) {
    try {
      this.logger.log(`Processing dealer loan disbursement: ${payload.loanId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.loan.disbursed',
        transactionType: 'DEALER_LOAN_DISBURSEMENT',
        sourceDocumentType: 'LOAN_DISBURSEMENT',
        sourceDocumentId: payload.loanId,
        transactionData: {
          loan_id: payload.loanId,
          loan_number: payload.loanNumber,
          disbursement_date: payload.disbursementDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Loan details
          loan_type: payload.loanType, // 'WORKING_CAPITAL', 'EQUIPMENT', 'INFRASTRUCTURE', 'OTHER'
          principal_amount: payload.principalAmount,
          disbursed_amount: payload.disbursedAmount,
          
          // Terms and conditions
          interest_rate: payload.interestRate,
          tenor_months: payload.tenorMonths,
          repayment_frequency: payload.repaymentFrequency, // 'DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY'
          grace_period_months: payload.gracePeriodMonths || 0,
          
          // Repayment schedule
          start_date: payload.startDate,
          end_date: payload.endDate,
          first_repayment_date: payload.firstRepaymentDate,
          monthly_installment: payload.monthlyInstallment,
          total_repayment_amount: payload.totalRepaymentAmount,
          
          // Charges and fees
          processing_fee: payload.processingFee || 0,
          legal_fee: payload.legalFee || 0,
          insurance_premium: payload.insurancePremium || 0,
          other_charges: payload.otherCharges || 0,
          total_charges: payload.totalCharges || 0,
          
          // Net disbursement
          net_disbursement: payload.disbursedAmount - (payload.totalCharges || 0),
          
          // Security and guarantees
          collateral_value: payload.collateralValue || 0,
          guarantor_info: payload.guarantorInfo || {},
          security_details: payload.securityDetails || {},
          
          // Disbursement method
          disbursement_method: payload.disbursementMethod, // 'BANK_TRANSFER', 'CASH', 'EQUIPMENT_PURCHASE'
          bank_account_number: payload.bankAccountNumber,
          disbursement_reference: payload.disbursementReference,
          
          // Purpose and utilization
          loan_purpose: payload.loanPurpose,
          intended_use: payload.intendedUse,
          equipment_details: payload.equipmentDetails || {},
          
          // Approval details
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          loan_committee_decision: payload.loanCommitteeDecision,
          
          // Monitoring and compliance
          utilization_monitoring_required: payload.utilizationMonitoringRequired || false,
          reporting_frequency: payload.reportingFrequency || 'MONTHLY',
          compliance_covenants: payload.complianceCovenants || [],
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.disbursementDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer loan disbursement ${payload.loanId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer loan repayment
   */
  @OnEvent('dealer.loan.repayment')
  async handleDealerLoanRepayment(payload: any) {
    try {
      this.logger.log(`Processing dealer loan repayment: ${payload.repaymentId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.loan.repayment',
        transactionType: 'DEALER_LOAN_REPAYMENT',
        sourceDocumentType: 'LOAN_REPAYMENT',
        sourceDocumentId: payload.repaymentId,
        transactionData: {
          repayment_id: payload.repaymentId,
          loan_id: payload.loanId,
          loan_number: payload.loanNumber,
          repayment_date: payload.repaymentDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Repayment details
          installment_number: payload.installmentNumber,
          due_date: payload.dueDate,
          repayment_amount: payload.repaymentAmount,
          
          // Breakdown
          principal_amount: payload.principalAmount,
          interest_amount: payload.interestAmount,
          penalty_amount: payload.penaltyAmount || 0,
          other_charges: payload.otherCharges || 0,
          
          // Payment status and timing
          payment_status: payload.paymentStatus, // 'ON_TIME', 'EARLY', 'LATE', 'PARTIAL', 'DEFAULTED'
          days_late: payload.daysLate || 0,
          early_payment_discount: payload.earlyPaymentDiscount || 0,
          
          // Outstanding balances after payment
          outstanding_principal: payload.outstandingPrincipal,
          outstanding_interest: payload.outstandingInterest || 0,
          total_outstanding: payload.totalOutstanding,
          
          // Payment method
          payment_method: payload.paymentMethod, // 'SETTLEMENT_DEDUCTION', 'DIRECT_PAYMENT', 'AUTO_DEDUCTION'
          payment_source: payload.paymentSource, // 'DEALER_MARGIN', 'CASH_PAYMENT', 'BANK_TRANSFER'
          settlement_id: payload.settlementId, // If paid via settlement deduction
          
          // Loan performance tracking
          payment_history: payload.paymentHistory || [],
          missed_payments_count: payload.missedPaymentsCount || 0,
          total_payments_made: payload.totalPaymentsMade || 0,
          remaining_installments: payload.remainingInstallments,
          
          // Risk assessment
          current_risk_rating: payload.currentRiskRating || 'STANDARD',
          delinquency_status: payload.delinquencyStatus || 'CURRENT',
          provision_required: payload.provisionRequired || 0,
          
          // Early settlement
          is_early_settlement: payload.isEarlySettlement || false,
          settlement_discount: payload.settlementDiscount || 0,
          
          // Restructuring (if applicable)
          is_restructured_loan: payload.isRestructuredLoan || false,
          restructure_reason: payload.restructureReason,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.repaymentDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer loan repayment ${payload.repaymentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer advance request
   */
  @OnEvent('dealer.advance.disbursed')
  async handleDealerAdvanceDisbursed(payload: any) {
    try {
      this.logger.log(`Processing dealer advance: ${payload.advanceId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.advance.disbursed',
        transactionType: 'DEALER_ADVANCE',
        sourceDocumentType: 'DEALER_ADVANCE',
        sourceDocumentId: payload.advanceId,
        transactionData: {
          advance_id: payload.advanceId,
          advance_number: payload.advanceNumber,
          advance_date: payload.advanceDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Advance details
          advance_amount: payload.advanceAmount,
          advance_purpose: payload.advancePurpose,
          repayment_method: payload.repaymentMethod, // 'SETTLEMENT_DEDUCTION', 'CASH_REPAYMENT'
          
          // Terms
          advance_period_days: payload.advancePeriodDays || 30,
          interest_rate: payload.interestRate || 0,
          service_charge: payload.serviceCharge || 0,
          expected_repayment_date: payload.expectedRepaymentDate,
          
          // Eligibility and limits
          dealer_credit_limit: payload.dealerCreditLimit,
          current_outstanding_advances: payload.currentOutstandingAdvances || 0,
          available_credit_limit: payload.availableCreditLimit,
          
          // Risk assessment
          dealer_performance_score: payload.dealerPerformanceScore || 80,
          advance_risk_rating: payload.advanceRiskRating || 'MEDIUM',
          collateral_required: payload.collateralRequired || false,
          
          // Approval workflow
          requested_by: payload.requestedBy,
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          approval_conditions: payload.approvalConditions || [],
          
          // Disbursement method
          disbursement_method: payload.disbursementMethod, // 'BANK_TRANSFER', 'CASH', 'OFFSET'
          bank_account_number: payload.bankAccountNumber,
          disbursement_reference: payload.disbursementReference,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.advanceDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer advance ${payload.advanceId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer commission/bonus
   */
  @OnEvent('dealer.commission.earned')
  async handleDealerCommissionEarned(payload: any) {
    try {
      this.logger.log(`Processing dealer commission: ${payload.commissionId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.commission.earned',
        transactionType: 'DEALER_COMMISSION',
        sourceDocumentType: 'DEALER_COMMISSION',
        sourceDocumentId: payload.commissionId,
        transactionData: {
          commission_id: payload.commissionId,
          commission_date: payload.commissionDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Commission type and basis
          commission_type: payload.commissionType, // 'VOLUME_BONUS', 'PERFORMANCE_BONUS', 'LOYALTY_BONUS', 'TARGET_ACHIEVEMENT'
          commission_period: payload.commissionPeriod,
          calculation_basis: payload.calculationBasis, // 'VOLUME', 'REVENUE', 'MARGIN', 'PERFORMANCE_METRIC'
          
          // Performance metrics
          target_volume: payload.targetVolume || 0,
          actual_volume: payload.actualVolume,
          achievement_percentage: payload.achievementPercentage,
          
          target_revenue: payload.targetRevenue || 0,
          actual_revenue: payload.actualRevenue || 0,
          
          // Commission calculation
          commission_rate: payload.commissionRate,
          base_amount: payload.baseAmount,
          commission_amount: payload.commissionAmount,
          
          // Bonus tiers
          bonus_tiers: payload.bonusTiers || [],
          applicable_tier: payload.applicableTier,
          tier_multiplier: payload.tierMultiplier || 1,
          
          // Performance factors
          quality_score: payload.qualityScore || 100,
          customer_satisfaction_score: payload.customerSatisfactionScore || 100,
          compliance_score: payload.complianceScore || 100,
          performance_adjustment: payload.performanceAdjustment || 0,
          
          // Final commission
          gross_commission: payload.grossCommission,
          deductions: payload.deductions || 0,
          net_commission: payload.netCommission,
          
          // Tax treatment
          taxable_amount: payload.taxableAmount,
          tax_rate: payload.taxRate || 0,
          tax_withheld: payload.taxWithheld || 0,
          
          // Payment details
          payment_method: payload.paymentMethod, // 'SETTLEMENT_ADDITION', 'DIRECT_PAYMENT', 'CREDIT_TO_ACCOUNT'
          payment_date: payload.paymentDate,
          
          // Approval
          calculated_by: payload.calculatedBy,
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.commissionDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer commission ${payload.commissionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle dealer performance adjustment
   */
  @OnEvent('dealer.performance.adjustment')
  async handleDealerPerformanceAdjustment(payload: any) {
    try {
      this.logger.log(`Processing dealer performance adjustment: ${payload.adjustmentId}`);

      const event: TransactionEvent = {
        eventType: 'dealer.performance.adjustment',
        transactionType: 'DEALER_PERFORMANCE_ADJUSTMENT',
        sourceDocumentType: 'PERFORMANCE_ADJUSTMENT',
        sourceDocumentId: payload.adjustmentId,
        transactionData: {
          adjustment_id: payload.adjustmentId,
          adjustment_date: payload.adjustmentDate,
          dealer_id: payload.dealerId,
          station_id: payload.stationId,
          
          // Adjustment type and reason
          adjustment_type: payload.adjustmentType, // 'PENALTY', 'BONUS', 'CORRECTION', 'RECONCILIATION'
          adjustment_reason: payload.adjustmentReason,
          adjustment_category: payload.adjustmentCategory, // 'SHORTAGE', 'DAMAGE', 'COMPLIANCE', 'PERFORMANCE'
          
          // Performance metrics
          performance_period: payload.performancePeriod,
          kpi_metrics: payload.kpiMetrics || {},
          performance_score: payload.performanceScore,
          benchmark_score: payload.benchmarkScore || 100,
          
          // Financial impact
          adjustment_amount: payload.adjustmentAmount,
          adjustment_direction: payload.adjustmentAmount >= 0 ? 'CREDIT' : 'DEBIT',
          
          // Supporting analysis
          root_cause_analysis: payload.rootCauseAnalysis,
          corrective_actions: payload.correctiveActions || [],
          preventive_measures: payload.preventiveMeasures || [],
          
          // Approval and review
          recommended_by: payload.recommendedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          
          // Impact on settlement
          affects_current_settlement: payload.affectsCurrentSettlement || false,
          settlement_period_impact: payload.settlementPeriodImpact,
          
          // Follow-up required
          monitoring_required: payload.monitoringRequired || false,
          review_date: payload.reviewDate,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.adjustmentDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling dealer performance adjustment ${payload.adjustmentId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}