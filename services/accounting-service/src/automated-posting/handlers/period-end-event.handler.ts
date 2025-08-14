import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AutomatedPostingService, TransactionEvent } from '../services/automated-posting.service';

@Injectable()
export class PeriodEndEventHandler {
  private readonly logger = new Logger(PeriodEndEventHandler.name);

  constructor(
    private automatedPostingService: AutomatedPostingService,
  ) {}

  /**
   * Handle month-end closing initiation
   */
  @OnEvent('period.end.month.initiated')
  async handleMonthEndInitiated(payload: any) {
    try {
      this.logger.log(`Processing month-end initiation: ${payload.periodId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.month.initiated',
        transactionType: 'MONTH_END_INITIATION',
        sourceDocumentType: 'PERIOD_END_PROCESS',
        sourceDocumentId: payload.processId,
        transactionData: {
          process_id: payload.processId,
          period_id: payload.periodId,
          period_name: payload.periodName,
          period_start_date: payload.periodStartDate,
          period_end_date: payload.periodEndDate,
          fiscal_year: payload.fiscalYear,
          
          // Process control
          initiated_by: payload.initiatedBy,
          initiation_date: payload.initiationDate,
          target_completion_date: payload.targetCompletionDate,
          
          // Pre-closing validations
          all_transactions_posted: payload.allTransactionsPosted || false,
          bank_reconciliations_complete: payload.bankReconciliationsComplete || false,
          inventory_counts_complete: payload.inventoryCountsComplete || false,
          uppf_reconciliations_complete: payload.uppfReconciliationsComplete || false,
          dealer_settlements_complete: payload.dealerSettlementsComplete || false,
          
          // Outstanding items
          outstanding_items_count: payload.outstandingItemsCount || 0,
          critical_outstanding_items: payload.criticalOutstandingItems || [],
          
          // Checklist status
          closing_checklist: payload.closingChecklist || [],
          checklist_completion_percentage: payload.checklistCompletionPercentage || 0,
          
          // Notifications sent
          notifications_sent_to: payload.notificationsSentTo || [],
          reminder_schedule: payload.reminderSchedule || [],
          
          // Risk factors
          closing_risk_factors: payload.closingRiskFactors || [],
          risk_mitigation_plans: payload.riskMitigationPlans || [],
          
          currency_code: payload.currencyCode || 'GHS',
        },
        stationId: payload.stationId,
        timestamp: new Date(payload.initiationDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling month-end initiation ${payload.processId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle accrual entries posting
   */
  @OnEvent('period.end.accruals.posted')
  async handleAccrualsPosted(payload: any) {
    try {
      this.logger.log(`Processing period-end accruals: ${payload.accrualBatchId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.accruals.posted',
        transactionType: 'PERIOD_END_ACCRUALS',
        sourceDocumentType: 'ACCRUAL_BATCH',
        sourceDocumentId: payload.accrualBatchId,
        transactionData: {
          accrual_batch_id: payload.accrualBatchId,
          period_id: payload.periodId,
          posting_date: payload.postingDate,
          
          // Accrual categories
          accrual_entries: payload.accrualEntries || [],
          total_accrual_amount: payload.totalAccrualAmount,
          
          // Revenue accruals
          unbilled_revenue: payload.unbilledRevenue || 0,
          accrued_interest_income: payload.accruedInterestIncome || 0,
          accrued_commission_income: payload.accruedCommissionIncome || 0,
          accrued_uppf_income: payload.accruedUppfIncome || 0,
          
          // Expense accruals
          accrued_salaries: payload.accruedSalaries || 0,
          accrued_utilities: payload.accruedUtilities || 0,
          accrued_rent: payload.accruedRent || 0,
          accrued_professional_fees: payload.accruedProfessionalFees || 0,
          accrued_interest_expense: payload.accruedInterestExpense || 0,
          
          // Dealer-related accruals
          accrued_dealer_margins: payload.accruedDealerMargins || 0,
          accrued_dealer_bonuses: payload.accruedDealerBonuses || 0,
          accrued_shortage_claims: payload.accruedShortageClaims || 0,
          
          // Tax accruals
          accrued_corporate_tax: payload.accruedCorporateTax || 0,
          accrued_withholding_tax: payload.accruedWithholdingTax || 0,
          accrued_vat: payload.accruedVat || 0,
          
          // Regulatory accruals
          accrued_regulatory_fees: payload.accruedRegulatoryFees || 0,
          accrued_levy_payments: payload.accruedLevyPayments || 0,
          
          // IFRS adjustments
          ifrs_revenue_deferrals: payload.ifrsRevenueDeferrals || 0,
          ifrs_expected_credit_losses: payload.ifrsExpectedCreditLosses || 0,
          ifrs_lease_adjustments: payload.ifrsLeaseAdjustments || 0,
          
          // Validation and approval
          total_debits: payload.totalDebits,
          total_credits: payload.totalCredits,
          variance_tolerance: payload.varianceTolerance || 0.01,
          
          calculated_by: payload.calculatedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          approval_date: payload.approvalDate,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        timestamp: new Date(payload.postingDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling period-end accruals ${payload.accrualBatchId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle depreciation calculation and posting
   */
  @OnEvent('period.end.depreciation.posted')
  async handleDepreciationPosted(payload: any) {
    try {
      this.logger.log(`Processing depreciation entries: ${payload.depreciationBatchId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.depreciation.posted',
        transactionType: 'DEPRECIATION_EXPENSE',
        sourceDocumentType: 'DEPRECIATION_BATCH',
        sourceDocumentId: payload.depreciationBatchId,
        transactionData: {
          depreciation_batch_id: payload.depreciationBatchId,
          period_id: payload.periodId,
          calculation_date: payload.calculationDate,
          posting_date: payload.postingDate,
          
          // Depreciation summary
          total_depreciation_expense: payload.totalDepreciationExpense,
          asset_count: payload.assetCount,
          
          // Asset categories
          building_depreciation: payload.buildingDepreciation || 0,
          equipment_depreciation: payload.equipmentDepreciation || 0,
          vehicle_depreciation: payload.vehicleDepreciation || 0,
          furniture_depreciation: payload.furnitureDepreciation || 0,
          it_equipment_depreciation: payload.itEquipmentDepreciation || 0,
          
          // Station-wise breakdown
          depreciation_by_station: payload.depreciationByStation || {},
          
          // IFRS 16 Lease depreciation
          rou_asset_depreciation: payload.rouAssetDepreciation || 0,
          lease_depreciation_breakdown: payload.leaseDepreciationBreakdown || {},
          
          // Impairment assessments
          impairment_indicators_identified: payload.impairmentIndicatorsIdentified || false,
          impairment_testing_required: payload.impairmentTestingRequired || [],
          impairment_losses_recognized: payload.impairmentLossesRecognized || 0,
          
          // Disposal considerations
          assets_held_for_disposal: payload.assetsHeldForDisposal || [],
          disposal_depreciation_adjustments: payload.disposalDepreciationAdjustments || 0,
          
          // Component depreciation
          component_based_depreciation: payload.componentBasedDepreciation || false,
          major_component_replacements: payload.majorComponentReplacements || [],
          
          // Validation checks
          depreciation_validation_passed: payload.depreciationValidationPassed || false,
          validation_exceptions: payload.validationExceptions || [],
          
          // Approval workflow
          calculated_by: payload.calculatedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        timestamp: new Date(payload.postingDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling depreciation posting ${payload.depreciationBatchId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle foreign exchange revaluation
   */
  @OnEvent('period.end.fx.revaluation')
  async handleFxRevaluation(payload: any) {
    try {
      this.logger.log(`Processing FX revaluation: ${payload.revaluationId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.fx.revaluation',
        transactionType: 'FX_REVALUATION',
        sourceDocumentType: 'FX_REVALUATION',
        sourceDocumentId: payload.revaluationId,
        transactionData: {
          revaluation_id: payload.revaluationId,
          period_id: payload.periodId,
          revaluation_date: payload.revaluationDate,
          functional_currency: payload.functionalCurrency || 'GHS',
          
          // Exchange rates
          period_end_rates: payload.periodEndRates || {},
          previous_period_rates: payload.previousPeriodRates || {},
          average_rates: payload.averageRates || {},
          
          // Monetary items revaluation
          foreign_currency_cash: payload.foreignCurrencyCash || {},
          foreign_currency_receivables: payload.foreignCurrencyReceivables || {},
          foreign_currency_payables: payload.foreignCurrencyPayables || {},
          foreign_currency_loans: payload.foreignCurrencyLoans || {},
          
          // Revaluation gains/losses
          total_revaluation_gain_loss: payload.totalRevaluationGainLoss,
          realized_fx_gains_losses: payload.realizedFxGainsLosses || 0,
          unrealized_fx_gains_losses: payload.unrealizedFxGainsLosses || 0,
          
          // Currency breakdown
          usd_revaluation_impact: payload.usdRevaluationImpact || 0,
          eur_revaluation_impact: payload.eurRevaluationImpact || 0,
          gbp_revaluation_impact: payload.gbpRevaluationImpact || 0,
          other_currencies_impact: payload.otherCurrenciesImpact || 0,
          
          // Non-monetary items (if applicable)
          foreign_currency_investments: payload.foreignCurrencyInvestments || {},
          investment_revaluation_method: payload.investmentRevaluationMethod,
          
          // Translation adjustments
          translation_adjustments: payload.translationAdjustments || 0,
          cumulative_translation_adjustment: payload.cumulativeTranslationAdjustment || 0,
          
          // Hedge accounting (if applicable)
          hedge_effectiveness_testing: payload.hedgeEffectivenessTesting || {},
          hedge_accounting_adjustments: payload.hedgeAccountingAdjustments || 0,
          
          // Rate sources and validation
          rate_sources: payload.rateSources || {},
          rate_validation_passed: payload.rateValidationPassed || false,
          rate_exceptions: payload.rateExceptions || [],
          
          // Prior period adjustments
          prior_period_fx_corrections: payload.priorPeriodFxCorrections || 0,
          
          // Approval
          calculated_by: payload.calculatedBy,
          approved_by: payload.approvedBy,
          
          currency_code: payload.functionalCurrency || 'GHS',
        },
        timestamp: new Date(payload.revaluationDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling FX revaluation ${payload.revaluationId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle provision calculations
   */
  @OnEvent('period.end.provisions.calculated')
  async handleProvisionsCalculated(payload: any) {
    try {
      this.logger.log(`Processing provisions calculation: ${payload.provisionBatchId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.provisions.calculated',
        transactionType: 'PROVISIONS_CALCULATION',
        sourceDocumentType: 'PROVISION_BATCH',
        sourceDocumentId: payload.provisionBatchId,
        transactionData: {
          provision_batch_id: payload.provisionBatchId,
          period_id: payload.periodId,
          calculation_date: payload.calculationDate,
          
          // Expected Credit Loss provisions (IFRS 9)
          ecl_provision_stage_1: payload.eclProvisionStage1 || 0,
          ecl_provision_stage_2: payload.eclProvisionStage2 || 0,
          ecl_provision_stage_3: payload.eclProvisionStage3 || 0,
          total_ecl_provision: payload.totalEclProvision || 0,
          ecl_provision_movement: payload.eclProvisionMovement || 0,
          
          // Inventory provisions (IAS 2)
          inventory_obsolescence_provision: payload.inventoryObsolescenceProvision || 0,
          inventory_nrv_provision: payload.inventoryNrvProvision || 0,
          total_inventory_provision: payload.totalInventoryProvision || 0,
          
          // Legal and regulatory provisions
          legal_claims_provision: payload.legalClaimsProvision || 0,
          regulatory_penalties_provision: payload.regulatoryPenaltiesProvision || 0,
          environmental_restoration_provision: payload.environmentalRestorationProvision || 0,
          
          // Employee benefit provisions
          leave_accrual_provision: payload.leaveAccrualProvision || 0,
          bonus_provision: payload.bonusProvision || 0,
          gratuity_provision: payload.gratuityProvision || 0,
          
          // Asset retirement obligations
          asset_retirement_obligations: payload.assetRetirementObligations || 0,
          dismantling_provisions: payload.dismantlingProvisions || 0,
          
          // Tax provisions
          uncertain_tax_positions: payload.uncertainTaxPositions || 0,
          tax_penalty_provisions: payload.taxPenaltyProvisions || 0,
          
          // Warranty and service provisions
          warranty_provisions: payload.warrantyProvisions || 0,
          service_contract_provisions: payload.serviceContractProvisions || 0,
          
          // Onerous contract provisions
          onerous_lease_provisions: payload.onerousLeaseProvisions || 0,
          onerous_supply_contract_provisions: payload.onerousSupplyContractProvisions || 0,
          
          // Total provisions movement
          total_provision_increase: payload.totalProvisionIncrease || 0,
          total_provision_release: payload.totalProvisionRelease || 0,
          net_provision_movement: payload.netProvisionMovement || 0,
          
          // Provision utilization
          provisions_utilized: payload.provisionsUtilized || 0,
          provision_reversals: payload.provisionReversals || 0,
          
          // Probability assessments
          high_probability_provisions: payload.highProbabilityProvisions || 0,
          medium_probability_provisions: payload.mediumProbabilityProvisions || 0,
          contingent_liabilities: payload.contingentLiabilities || 0,
          
          // Discount rate applications
          provisions_requiring_discounting: payload.provisionsRequiringDiscounting || [],
          discount_rates_used: payload.discountRatesUsed || {},
          unwinding_of_discount: payload.unwindingOfDiscount || 0,
          
          // External expert assessments
          external_valuations_obtained: payload.externalValuationsObtained || [],
          expert_opinion_adjustments: payload.expertOpinionAdjustments || 0,
          
          // Management judgment areas
          management_judgment_provisions: payload.managementJudgmentProvisions || [],
          judgment_sensitivity_analysis: payload.judgmentSensitivityAnalysis || {},
          
          // Approval
          calculated_by: payload.calculatedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        timestamp: new Date(payload.calculationDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling provisions calculation ${payload.provisionBatchId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle period-end closing completion
   */
  @OnEvent('period.end.closing.completed')
  async handleClosingCompleted(payload: any) {
    try {
      this.logger.log(`Processing period closing completion: ${payload.periodId}`);

      const event: TransactionEvent = {
        eventType: 'period.end.closing.completed',
        transactionType: 'PERIOD_CLOSING_COMPLETION',
        sourceDocumentType: 'PERIOD_CLOSING',
        sourceDocumentId: payload.closingId,
        transactionData: {
          closing_id: payload.closingId,
          period_id: payload.periodId,
          period_name: payload.periodName,
          closing_date: payload.closingDate,
          completion_date: payload.completionDate,
          
          // Financial results
          total_revenue: payload.totalRevenue,
          total_expenses: payload.totalExpenses,
          gross_profit: payload.grossProfit,
          operating_profit: payload.operatingProfit,
          net_profit_before_tax: payload.netProfitBeforeTax,
          tax_expense: payload.taxExpense,
          net_profit_after_tax: payload.netProfitAfterTax,
          
          // Balance sheet totals
          total_assets: payload.totalAssets,
          total_liabilities: payload.totalLiabilities,
          total_equity: payload.totalEquity,
          
          // Key ratios
          gross_margin_percentage: payload.grossMarginPercentage,
          operating_margin_percentage: payload.operatingMarginPercentage,
          net_margin_percentage: payload.netMarginPercentage,
          return_on_assets: payload.returnOnAssets,
          current_ratio: payload.currentRatio,
          debt_to_equity_ratio: payload.debtToEquityRatio,
          
          // Cash flow summary
          operating_cash_flow: payload.operatingCashFlow || 0,
          investing_cash_flow: payload.investingCashFlow || 0,
          financing_cash_flow: payload.financingCashFlow || 0,
          net_cash_flow: payload.netCashFlow || 0,
          
          // Closing process metrics
          total_journal_entries: payload.totalJournalEntries,
          total_adjusting_entries: payload.totalAdjustingEntries,
          total_closing_entries: payload.totalClosingEntries,
          closing_duration_hours: payload.closingDurationHours,
          
          // Quality assurance
          trial_balance_balanced: payload.trialBalanceBalanced || false,
          all_reconciliations_complete: payload.allReconciliationsComplete || false,
          management_review_complete: payload.managementReviewComplete || false,
          audit_review_complete: payload.auditReviewComplete || false,
          
          // Exceptions and adjustments
          closing_exceptions_count: payload.closingExceptionsCount || 0,
          material_adjustments_count: payload.materialAdjustmentsCount || 0,
          post_closing_adjustments: payload.postClosingAdjustments || [],
          
          // Compliance confirmations
          ifrs_compliance_confirmed: payload.ifrsComplianceConfirmed || false,
          local_gaap_compliance_confirmed: payload.localGaapComplianceConfirmed || false,
          regulatory_reporting_complete: payload.regulatoryReportingComplete || false,
          tax_compliance_confirmed: payload.taxComplianceConfirmed || false,
          
          // Sign-offs
          prepared_by: payload.preparedBy,
          reviewed_by: payload.reviewedBy,
          approved_by: payload.approvedBy,
          cfo_sign_off: payload.cfoSignOff || false,
          ceo_sign_off: payload.ceoSignOff || false,
          
          // Next period preparation
          next_period_opened: payload.nextPeriodOpened || false,
          opening_balances_posted: payload.openingBalancesPosted || false,
          budget_loaded: payload.budgetLoaded || false,
          
          // Archive and backup
          financial_statements_generated: payload.financialStatementsGenerated || false,
          data_archived: payload.dataArchived || false,
          backup_completed: payload.backupCompleted || false,
          
          currency_code: payload.currencyCode || 'GHS',
        },
        timestamp: new Date(payload.completionDate || Date.now()),
      };

      await this.automatedPostingService.processTransaction(event);

    } catch (error) {
      this.logger.error(`Error handling period closing completion ${payload.closingId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}