import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';

@Injectable()
export class UppfEventHandler {
  private readonly logger = new Logger(UppfEventHandler.name);

  constructor(
    private automatedPostingService: AutomatedPostingService,
  ) {}

  /**
   * Handle UPPF claim submission
   */
  @OnEvent('uppf.claim.submitted')
  async handleUppfClaimSubmitted(payload: any) {
    try {
      this.logger.log(`Processing UPPF claim submission: ${payload.claimId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.claim.submitted',
        transactionType: 'UPPF_CLAIM_SUBMISSION',
        sourceDocumentType: 'UPPF_CLAIM',
        sourceDocumentId: payload.claimId,
        transactionData: {
          claim_id: payload.claimId,
          claim_number: payload.claimNumber,
          submission_date: payload.submissionDate,
          window_id: payload.windowId,
          consignment_id: payload.consignmentId,
          
          // Route and distance details
          route_id: payload.routeId,
          depot_id: payload.depotId,
          station_id: payload.stationId,
          km_planned: payload.kmPlanned,
          km_actual: payload.kmActual,
          km_beyond_equalisation: payload.kmBeyondEqualisation,
          equalisation_threshold: payload.equalisationThreshold,
          
          // Product and quantity details
          product_id: payload.productId,
          product_type: payload.productType,
          litres_moved: payload.litresMoved,
          
          // UPPF calculation
          tariff_per_litre_km: payload.tariffPerLitreKm,
          claim_amount: payload.claimAmount,
          calculated_amount: payload.calculatedAmount,
          
          // Supporting evidence
          gps_trace_id: payload.gpsTraceId,
          waybill_number: payload.waybillNumber,
          delivery_receipts: payload.deliveryReceipts || [],
          
          // Three-way reconciliation status
          three_way_reconciled: payload.threeWayReconciled || false,
          depot_loaded_litres: payload.depotLoadedLitres,
          transporter_delivered_litres: payload.transporterDeliveredLitres,
          station_received_litres: payload.stationReceivedLitres,
          
          // Variance analysis
          variance_litres: payload.varianceLitres || 0,
          variance_reason: payload.varianceReason,
          
          // Submission details
          submitted_by: payload.submittedBy,
          submission_reference: payload.submissionReference,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.submissionDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF claim submission ${payload.claimId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF claim approval by NPA
   */
  @OnEvent('uppf.claim.approved')
  async handleUppfClaimApproved(payload: any) {
    try {
      this.logger.log(`Processing UPPF claim approval: ${payload.claimId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.claim.approved',
        transactionType: 'UPPF_CLAIM_APPROVAL',
        sourceDocumentType: 'UPPF_CLAIM_APPROVAL',
        sourceDocumentId: payload.claimId,
        transactionData: {
          claim_id: payload.claimId,
          claim_number: payload.claimNumber,
          approval_date: payload.approvalDate,
          
          // Original claim details
          original_claim_amount: payload.originalClaimAmount,
          approved_amount: payload.approvedAmount,
          variance_amount: payload.approvedAmount - payload.originalClaimAmount,
          approval_percentage: (payload.approvedAmount / payload.originalClaimAmount) * 100,
          
          // NPA response details
          npa_response_reference: payload.npaResponseReference,
          npa_response_date: payload.npaResponseDate,
          approval_notes: payload.approvalNotes,
          
          // Settlement information
          expected_settlement_date: payload.expectedSettlementDate,
          settlement_method: payload.settlementMethod, // 'DIRECT_PAYMENT', 'OFFSET_AGAINST_DUES', 'VOUCHER'
          
          // Audit trail
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          
          // Related documents
          supporting_documents: payload.supportingDocuments || [],
          audit_report: payload.auditReport,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.approvalDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF claim approval ${payload.claimId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF claim settlement
   */
  @OnEvent('uppf.claim.settled')
  async handleUppfClaimSettled(payload: any) {
    try {
      this.logger.log(`Processing UPPF claim settlement: ${payload.claimId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.claim.settled',
        transactionType: 'UPPF_CLAIM_SETTLEMENT',
        sourceDocumentType: 'UPPF_SETTLEMENT',
        sourceDocumentId: payload.settlementId,
        transactionData: {
          settlement_id: payload.settlementId,
          claim_id: payload.claimId,
          claim_number: payload.claimNumber,
          settlement_date: payload.settlementDate,
          
          // Settlement amounts
          approved_amount: payload.approvedAmount,
          settled_amount: payload.settledAmount,
          settlement_variance: payload.settledAmount - payload.approvedAmount,
          
          // Settlement method and details
          settlement_method: payload.settlementMethod,
          payment_reference: payload.paymentReference,
          bank_reference: payload.bankReference,
          voucher_number: payload.voucherNumber,
          
          // Deductions (if any)
          administrative_charges: payload.administrativeCharges || 0,
          processing_fees: payload.processingFees || 0,
          withholding_tax: payload.withholdingTax || 0,
          other_deductions: payload.otherDeductions || 0,
          total_deductions: payload.totalDeductions || 0,
          
          // Net settlement
          gross_settlement: payload.settledAmount,
          net_settlement: payload.settledAmount - (payload.totalDeductions || 0),
          
          // Offset details (if applicable)
          offset_against_dues: payload.offsetAgainstDues || 0,
          offset_reference: payload.offsetReference,
          remaining_due_amount: payload.remainingDueAmount || 0,
          
          // Settlement reconciliation
          bank_account_credited: payload.bankAccountCredited,
          credit_value_date: payload.creditValueDate,
          
          // Audit and compliance
          settlement_approved_by: payload.settlementApprovedBy,
          compliance_verified: payload.complianceVerified || false,
          regulatory_reporting_done: payload.regulatoryReportingDone || false,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.settlementDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF claim settlement ${payload.claimId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF claim rejection
   */
  @OnEvent('uppf.claim.rejected')
  async handleUppfClaimRejected(payload: any) {
    try {
      this.logger.log(`Processing UPPF claim rejection: ${payload.claimId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.claim.rejected',
        transactionType: 'UPPF_CLAIM_REJECTION',
        sourceDocumentType: 'UPPF_CLAIM_REJECTION',
        sourceDocumentId: payload.claimId,
        transactionData: {
          claim_id: payload.claimId,
          claim_number: payload.claimNumber,
          rejection_date: payload.rejectionDate,
          
          // Original claim details
          original_claim_amount: payload.originalClaimAmount,
          rejected_amount: payload.rejectedAmount || payload.originalClaimAmount,
          
          // Rejection reasons
          rejection_reasons: payload.rejectionReasons || [],
          primary_rejection_reason: payload.primaryRejectionReason,
          detailed_explanation: payload.detailedExplanation,
          
          // NPA response details
          npa_response_reference: payload.npaResponseReference,
          npa_response_date: payload.npaResponseDate,
          rejection_category: payload.rejectionCategory, // 'DOCUMENTATION', 'CALCULATION_ERROR', 'ROUTE_DISPUTE', 'POLICY_VIOLATION'
          
          // Appeal information
          appeal_deadline: payload.appealDeadline,
          appeal_process: payload.appealProcess,
          can_resubmit: payload.canResubmit || false,
          resubmission_requirements: payload.resubmissionRequirements || [],
          
          // Impact assessment
          revenue_impact: payload.revenueImpact || 0,
          cash_flow_impact: payload.cashFlowImpact || 0,
          operational_impact: payload.operationalImpact,
          
          // Action required
          corrective_actions: payload.correctiveActions || [],
          responsible_parties: payload.responsibleParties || [],
          deadline_for_action: payload.deadlineForAction,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.rejectionDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF claim rejection ${payload.claimId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF accrual (monthly estimation)
   */
  @OnEvent('uppf.accrual.monthly')
  async handleUppfMonthlyAccrual(payload: any) {
    try {
      this.logger.log(`Processing UPPF monthly accrual: ${payload.accrualId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.accrual.monthly',
        transactionType: 'UPPF_ACCRUAL',
        sourceDocumentType: 'UPPF_ACCRUAL',
        sourceDocumentId: payload.accrualId,
        transactionData: {
          accrual_id: payload.accrualId,
          accrual_date: payload.accrualDate,
          accrual_period: payload.accrualPeriod, // 'YYYY-MM'
          station_id: payload.stationId,
          
          // Accrual calculation basis
          total_deliveries: payload.totalDeliveries,
          total_litres_moved: payload.totalLitresMoved,
          average_km_beyond_equalisation: payload.averageKmBeyondEqualisation,
          current_uppf_tariff: payload.currentUppfTariff,
          
          // Estimated UPPF amounts
          estimated_uppf_amount: payload.estimatedUppfAmount,
          confidence_level: payload.confidenceLevel || 85, // Percentage
          
          // Historical comparison
          previous_period_accrual: payload.previousPeriodAccrual || 0,
          variance_from_previous: payload.estimatedUppfAmount - (payload.previousPeriodAccrual || 0),
          historical_accuracy_rate: payload.historicalAccuracyRate || 90,
          
          // Risk assessment
          risk_factors: payload.riskFactors || [],
          risk_adjustment: payload.riskAdjustment || 0,
          final_accrual_amount: payload.estimatedUppfAmount + (payload.riskAdjustment || 0),
          
          // Supporting data
          delivery_routes: payload.deliveryRoutes || [],
          route_analysis: payload.routeAnalysis || {},
          
          // Reversal of previous accrual
          previous_accrual_reversal: payload.previousAccrualReversal || 0,
          net_accrual_amount: payload.finalAccrualAmount - (payload.previousAccrualReversal || 0),
          
          // Approval and review
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
      this.logger.error(`Error handling UPPF monthly accrual ${payload.accrualId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF reversal (when accrual/claim needs to be reversed)
   */
  @OnEvent('uppf.reversal')
  async handleUppfReversal(payload: any) {
    try {
      this.logger.log(`Processing UPPF reversal: ${payload.reversalId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.reversal',
        transactionType: 'UPPF_REVERSAL',
        sourceDocumentType: 'UPPF_REVERSAL',
        sourceDocumentId: payload.reversalId,
        transactionData: {
          reversal_id: payload.reversalId,
          reversal_date: payload.reversalDate,
          original_transaction_id: payload.originalTransactionId,
          original_transaction_type: payload.originalTransactionType, // 'CLAIM', 'ACCRUAL', 'SETTLEMENT'
          
          // Reversal details
          original_amount: payload.originalAmount,
          reversal_amount: payload.reversalAmount,
          partial_reversal: payload.partialReversal || false,
          
          // Reversal reasons
          reversal_reason: payload.reversalReason,
          reversal_category: payload.reversalCategory, // 'ERROR_CORRECTION', 'CLAIM_REJECTED', 'POLICY_CHANGE', 'AUDIT_ADJUSTMENT'
          detailed_explanation: payload.detailedExplanation,
          
          // Impact assessment
          financial_impact: payload.financialImpact,
          cash_flow_impact: payload.cashFlowImpact,
          period_impact: payload.periodImpact,
          
          // Corrective entries
          requires_corrective_entry: payload.requiresCorrectiveEntry || false,
          corrective_entry_amount: payload.correctiveEntryAmount || 0,
          corrective_entry_reason: payload.correctiveEntryReason,
          
          // Approval and authorization
          reversal_requested_by: payload.reversalRequestedBy,
          reversal_approved_by: payload.reversalApprovedBy,
          authorization_reference: payload.authorizationReference,
          
          // Related documents
          supporting_documents: payload.supportingDocuments || [],
          audit_trail_reference: payload.auditTrailReference,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.reversalDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF reversal ${payload.reversalId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle UPPF reconciliation (periodic reconciliation of claims vs settlements)
   */
  @OnEvent('uppf.reconciliation')
  async handleUppfReconciliation(payload: any) {
    try {
      this.logger.log(`Processing UPPF reconciliation: ${payload.reconciliationId}`);

      const event: TransactionEvent = {
        eventType: 'uppf.reconciliation',
        transactionType: 'UPPF_RECONCILIATION',
        sourceDocumentType: 'UPPF_RECONCILIATION',
        sourceDocumentId: payload.reconciliationId,
        transactionData: {
          reconciliation_id: payload.reconciliationId,
          reconciliation_date: payload.reconciliationDate,
          reconciliation_period: payload.reconciliationPeriod,
          station_id: payload.stationId,
          
          // Reconciliation summary
          total_claims_submitted: payload.totalClaimsSubmitted,
          total_claims_amount: payload.totalClaimsAmount,
          total_approved_amount: payload.totalApprovedAmount,
          total_settled_amount: payload.totalSettledAmount,
          
          // Outstanding items
          pending_claims_count: payload.pendingClaimsCount,
          pending_claims_amount: payload.pendingClaimsAmount,
          approved_but_unsettled_count: payload.approvedButUnsettledCount,
          approved_but_unsettled_amount: payload.approvedButUnsettledAmount,
          
          // Variances
          submission_approval_variance: payload.totalApprovedAmount - payload.totalClaimsAmount,
          approval_settlement_variance: payload.totalSettledAmount - payload.totalApprovedAmount,
          net_variance: payload.totalSettledAmount - payload.totalClaimsAmount,
          
          // Aging analysis
          outstanding_0_30_days: payload.outstanding0To30Days || 0,
          outstanding_31_60_days: payload.outstanding31To60Days || 0,
          outstanding_61_90_days: payload.outstanding61To90Days || 0,
          outstanding_over_90_days: payload.outstandingOver90Days || 0,
          
          // Accrual reconciliation
          accrued_amount: payload.accruedAmount || 0,
          accrual_variance: payload.accruedAmount - payload.totalClaimsAmount,
          accrual_adjustment_required: Math.abs(payload.accruedAmount - payload.totalClaimsAmount) > 1000,
          
          // Performance metrics
          claim_approval_rate: (payload.totalClaimsSubmitted > 0) ? 
            (payload.totalApprovedAmount / payload.totalClaimsAmount) * 100 : 0,
          settlement_efficiency_rate: (payload.totalApprovedAmount > 0) ? 
            (payload.totalSettledAmount / payload.totalApprovedAmount) * 100 : 0,
          
          // Action items
          reconciling_items: payload.reconcilingItems || [],
          follow_up_required: payload.followUpRequired || [],
          
          // Approval
          reconciled_by: payload.reconciledBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.reconciliationDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling UPPF reconciliation ${payload.reconciliationId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}