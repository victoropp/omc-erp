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
var AutomatedJournalEntryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedJournalEntryService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let AutomatedJournalEntryService = AutomatedJournalEntryService_1 = class AutomatedJournalEntryService {
    eventEmitter;
    logger = new common_1.Logger(AutomatedJournalEntryService_1.name);
    // Standard chart of accounts mapping for Ghana OMC operations
    ACCOUNT_CODES = {
        // Assets
        'CASH_BANK': '1000',
        'ACCOUNTS_RECEIVABLE': '1200',
        'UPPF_RECEIVABLE': '1250',
        'DEALER_ADVANCES': '1260',
        'FUEL_INVENTORY': '1400',
        'PREPAID_EXPENSES': '1500',
        'FIXED_ASSETS': '1800',
        // Liabilities
        'ACCOUNTS_PAYABLE': '2000',
        'ACCRUED_EXPENSES': '2100',
        'TAX_PAYABLE_VAT': '2310',
        'TAX_PAYABLE_NHIL': '2320',
        'TAX_PAYABLE_GETFUND': '2330',
        'TAX_PAYABLE_WHT': '2340',
        'DEALER_PAYABLE': '2400',
        'LOAN_PAYABLE': '2500',
        // Equity
        'SHARE_CAPITAL': '3000',
        'RETAINED_EARNINGS': '3500',
        // Revenue
        'FUEL_SALES_PMS': '4100',
        'FUEL_SALES_AGO': '4110',
        'FUEL_SALES_LPG': '4120',
        'UPPF_INCOME': '4200',
        'INTEREST_INCOME': '4300',
        // Expenses
        'COST_OF_SALES': '5000',
        'DEALER_MARGINS': '5200',
        'OPERATING_EXPENSES': '6000',
        'INTEREST_EXPENSE': '7000'
    };
    // Pre-configured journal entry templates
    JOURNAL_TEMPLATES = {
        'FUEL_SALE': {
            templateCode: 'FUEL_SALE',
            templateName: 'Fuel Sale with Components',
            description: 'Complete fuel sale with all tax and levy components',
            transactionType: 'SALE',
            accountMappingRules: {
                debit: [
                    { account: 'ACCOUNTS_RECEIVABLE', amountField: 'totalAmount' }
                ],
                credit: [
                    { account: 'FUEL_SALES_PMS', amountField: 'baseSalesAmount' },
                    { account: 'TAX_PAYABLE_VAT', amountField: 'vatAmount' },
                    { account: 'TAX_PAYABLE_NHIL', amountField: 'nhilAmount' },
                    { account: 'TAX_PAYABLE_GETFUND', amountField: 'getfundAmount' }
                ]
            },
            approvalRequired: false,
            isActive: true
        },
        'UPPF_CLAIM': {
            templateCode: 'UPPF_CLAIM',
            templateName: 'UPPF Claim Recognition',
            description: 'Recognition of UPPF claim receivable',
            transactionType: 'UPPF_CLAIM',
            accountMappingRules: {
                debit: [
                    { account: 'UPPF_RECEIVABLE', amountField: 'claimAmount' }
                ],
                credit: [
                    { account: 'UPPF_INCOME', amountField: 'claimAmount' }
                ]
            },
            approvalRequired: true,
            approvalThreshold: 5000.00,
            isActive: true
        },
        'DEALER_MARGIN': {
            templateCode: 'DEALER_MARGIN',
            templateName: 'Dealer Margin Accrual',
            description: 'Accrual of dealer margin payable',
            transactionType: 'DEALER_MARGIN',
            accountMappingRules: {
                debit: [
                    { account: 'DEALER_MARGINS', amountField: 'marginAmount' }
                ],
                credit: [
                    { account: 'DEALER_PAYABLE', amountField: 'marginAmount' }
                ]
            },
            approvalRequired: false,
            isActive: true
        },
        'DEALER_SETTLEMENT': {
            templateCode: 'DEALER_SETTLEMENT',
            templateName: 'Dealer Settlement with Loan Deduction',
            description: 'Settlement of dealer payable with loan deductions',
            transactionType: 'DEALER_SETTLEMENT',
            accountMappingRules: {
                debit: [
                    { account: 'DEALER_PAYABLE', amountField: 'grossMargin' },
                    { account: 'INTEREST_INCOME', amountField: 'interestComponent' }
                ],
                credit: [
                    { account: 'LOAN_PAYABLE', amountField: 'loanDeduction' },
                    { account: 'CASH_BANK', amountField: 'netPayment' },
                    { account: 'TAX_PAYABLE_WHT', amountField: 'withholdingTax' }
                ]
            },
            approvalRequired: true,
            approvalThreshold: 10000.00,
            isActive: true
        },
        'LOAN_DISBURSEMENT': {
            templateCode: 'LOAN_DISBURSEMENT',
            templateName: 'Dealer Loan Disbursement',
            description: 'Disbursement of loan to dealer',
            transactionType: 'LOAN_DISBURSEMENT',
            accountMappingRules: {
                debit: [
                    { account: 'DEALER_ADVANCES', amountField: 'loanAmount' }
                ],
                credit: [
                    { account: 'CASH_BANK', amountField: 'loanAmount' }
                ]
            },
            approvalRequired: true,
            approvalThreshold: 50000.00,
            isActive: true
        },
        'UPPF_SETTLEMENT': {
            templateCode: 'UPPF_SETTLEMENT',
            templateName: 'UPPF Settlement Received',
            description: 'Receipt of UPPF claim settlement from NPA',
            transactionType: 'UPPF_SETTLEMENT',
            accountMappingRules: {
                debit: [
                    { account: 'CASH_BANK', amountField: 'settlementAmount' }
                ],
                credit: [
                    { account: 'UPPF_RECEIVABLE', amountField: 'originalClaimAmount' },
                    { account: 'UPPF_INCOME', amountField: 'varianceAmount', condition: 'variance_positive' }
                ]
            },
            approvalRequired: false,
            isActive: true
        }
    };
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    /**
     * Process fuel sale transaction
     */
    async processFuelSaleTransaction(eventData) {
        this.logger.log(`Processing fuel sale transaction: ${eventData.sourceDocumentId}`);
        try {
            const saleData = eventData.data;
            const journalLines = [];
            // Calculate total amount with all components
            const baseAmount = saleData.volume * saleData.basePrice;
            const vatAmount = baseAmount * 0.125; // 12.5% VAT
            const nhilAmount = baseAmount * 0.025; // 2.5% NHIL
            const getfundAmount = baseAmount * 0.025; // 2.5% GETFUND
            const totalAmount = baseAmount + vatAmount + nhilAmount + getfundAmount;
            // Debit: Accounts Receivable
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
                accountName: 'Accounts Receivable - Trade',
                debitAmount: totalAmount,
                description: `Fuel sale - ${saleData.productCode} - ${saleData.volume}L`,
                reference: saleData.invoiceNumber
            });
            // Credit: Sales Revenue
            const salesAccountCode = saleData.productCode === 'PMS' ?
                this.ACCOUNT_CODES.FUEL_SALES_PMS :
                saleData.productCode === 'AGO' ? this.ACCOUNT_CODES.FUEL_SALES_AGO :
                    this.ACCOUNT_CODES.FUEL_SALES_LPG;
            journalLines.push({
                accountCode: salesAccountCode,
                accountName: `Fuel Sales - ${saleData.productCode}`,
                creditAmount: baseAmount,
                description: `Sales revenue - ${saleData.productCode}`,
                reference: saleData.invoiceNumber
            });
            // Credit: Tax Payables
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.TAX_PAYABLE_VAT,
                accountName: 'VAT Payable',
                creditAmount: vatAmount,
                description: 'VAT on fuel sales',
                reference: saleData.invoiceNumber
            }, {
                accountCode: this.ACCOUNT_CODES.TAX_PAYABLE_NHIL,
                accountName: 'NHIL Payable',
                creditAmount: nhilAmount,
                description: 'NHIL on fuel sales',
                reference: saleData.invoiceNumber
            }, {
                accountCode: this.ACCOUNT_CODES.TAX_PAYABLE_GETFUND,
                accountName: 'GETFUND Payable',
                creditAmount: getfundAmount,
                description: 'GETFUND on fuel sales',
                reference: saleData.invoiceNumber
            });
            const journalEntry = await this.createJournalEntry({
                templateCode: 'FUEL_SALE',
                sourceDocument: 'FUEL_INVOICE',
                sourceDocumentId: eventData.sourceDocumentId,
                description: `Fuel sale - ${saleData.stationId} - ${saleData.volume}L ${saleData.productCode}`,
                reference: saleData.invoiceNumber,
                lines: journalLines,
                createdBy: eventData.createdBy,
                effectiveDate: eventData.effectiveDate
            });
            return journalEntry;
        }
        catch (error) {
            this.logger.error('Failed to process fuel sale transaction:', error);
            throw error;
        }
    }
    /**
     * Process UPPF claim recognition
     */
    async processUppfClaimTransaction(eventData) {
        this.logger.log(`Processing UPPF claim transaction: ${eventData.sourceDocumentId}`);
        try {
            const claimData = eventData.data;
            const journalLines = [];
            // Debit: UPPF Receivable
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.UPPF_RECEIVABLE,
                accountName: 'UPPF Claims Receivable',
                debitAmount: claimData.claimAmount,
                description: `UPPF claim - ${claimData.claimNumber}`,
                reference: claimData.claimNumber,
                projectCode: claimData.windowId
            });
            // Credit: UPPF Income
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.UPPF_INCOME,
                accountName: 'UPPF Income',
                creditAmount: claimData.claimAmount,
                description: `UPPF income recognition - ${claimData.claimNumber}`,
                reference: claimData.claimNumber,
                projectCode: claimData.windowId
            });
            const journalEntry = await this.createJournalEntry({
                templateCode: 'UPPF_CLAIM',
                sourceDocument: 'UPPF_CLAIM',
                sourceDocumentId: eventData.sourceDocumentId,
                description: `UPPF claim recognition - ${claimData.claimNumber} - GHS ${claimData.claimAmount.toFixed(2)}`,
                reference: claimData.claimNumber,
                lines: journalLines,
                createdBy: eventData.createdBy,
                effectiveDate: eventData.effectiveDate
            });
            return journalEntry;
        }
        catch (error) {
            this.logger.error('Failed to process UPPF claim transaction:', error);
            throw error;
        }
    }
    /**
     * Process dealer settlement transaction
     */
    async processDealerSettlementTransaction(eventData) {
        this.logger.log(`Processing dealer settlement transaction: ${eventData.sourceDocumentId}`);
        try {
            const settlementData = eventData.data;
            const journalLines = [];
            // Debit: Dealer Payable (clear the liability)
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.DEALER_PAYABLE,
                accountName: 'Dealer Payable',
                debitAmount: settlementData.grossMargin,
                description: `Dealer settlement - ${settlementData.dealerId}`,
                reference: settlementData.settlementNumber,
                costCenter: settlementData.stationId
            });
            // Credit: Loan Payable (if loan deduction)
            if (settlementData.loanDeduction > 0) {
                journalLines.push({
                    accountCode: this.ACCOUNT_CODES.LOAN_PAYABLE,
                    accountName: 'Dealer Loans Payable',
                    creditAmount: settlementData.loanDeduction,
                    description: `Loan deduction - ${settlementData.dealerId}`,
                    reference: settlementData.settlementNumber,
                    costCenter: settlementData.stationId
                });
            }
            // Credit: Withholding Tax Payable
            if (settlementData.withholdingTax > 0) {
                journalLines.push({
                    accountCode: this.ACCOUNT_CODES.TAX_PAYABLE_WHT,
                    accountName: 'Withholding Tax Payable',
                    creditAmount: settlementData.withholdingTax,
                    description: `WHT on dealer payment - ${settlementData.dealerId}`,
                    reference: settlementData.settlementNumber
                });
            }
            // Credit: Cash/Bank (net payment)
            if (settlementData.netPayment > 0) {
                journalLines.push({
                    accountCode: this.ACCOUNT_CODES.CASH_BANK,
                    accountName: 'Cash at Bank',
                    creditAmount: settlementData.netPayment,
                    description: `Dealer payment - ${settlementData.dealerId}`,
                    reference: settlementData.paymentReference || settlementData.settlementNumber,
                    costCenter: settlementData.stationId
                });
            }
            const journalEntry = await this.createJournalEntry({
                templateCode: 'DEALER_SETTLEMENT',
                sourceDocument: 'DEALER_SETTLEMENT',
                sourceDocumentId: eventData.sourceDocumentId,
                description: `Dealer settlement - ${settlementData.dealerId} - ${settlementData.settlementNumber}`,
                reference: settlementData.settlementNumber,
                lines: journalLines,
                createdBy: eventData.createdBy,
                effectiveDate: eventData.effectiveDate
            });
            return journalEntry;
        }
        catch (error) {
            this.logger.error('Failed to process dealer settlement transaction:', error);
            throw error;
        }
    }
    /**
     * Process loan disbursement transaction
     */
    async processLoanDisbursementTransaction(eventData) {
        this.logger.log(`Processing loan disbursement transaction: ${eventData.sourceDocumentId}`);
        try {
            const loanData = eventData.data;
            const journalLines = [];
            // Debit: Dealer Advances (or Loans Receivable)
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.DEALER_ADVANCES,
                accountName: 'Dealer Advances/Loans',
                debitAmount: loanData.loanAmount,
                description: `Loan disbursement - ${loanData.dealerId} - ${loanData.loanType}`,
                reference: loanData.loanNumber,
                costCenter: loanData.stationId
            });
            // Credit: Cash/Bank
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.CASH_BANK,
                accountName: 'Cash at Bank',
                creditAmount: loanData.loanAmount,
                description: `Loan disbursement payment - ${loanData.dealerId}`,
                reference: loanData.disbursementReference || loanData.loanNumber,
                costCenter: loanData.stationId
            });
            const journalEntry = await this.createJournalEntry({
                templateCode: 'LOAN_DISBURSEMENT',
                sourceDocument: 'LOAN_AGREEMENT',
                sourceDocumentId: eventData.sourceDocumentId,
                description: `Loan disbursement - ${loanData.dealerId} - GHS ${loanData.loanAmount.toFixed(2)}`,
                reference: loanData.loanNumber,
                lines: journalLines,
                createdBy: eventData.createdBy,
                effectiveDate: eventData.effectiveDate
            });
            return journalEntry;
        }
        catch (error) {
            this.logger.error('Failed to process loan disbursement transaction:', error);
            throw error;
        }
    }
    /**
     * Process UPPF settlement received from NPA
     */
    async processUppfSettlementTransaction(eventData) {
        this.logger.log(`Processing UPPF settlement transaction: ${eventData.sourceDocumentId}`);
        try {
            const settlementData = eventData.data;
            const journalLines = [];
            // Debit: Cash/Bank
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.CASH_BANK,
                accountName: 'Cash at Bank',
                debitAmount: settlementData.settlementAmount,
                description: `UPPF settlement received - ${settlementData.submissionReference}`,
                reference: settlementData.npaPaymentReference,
                projectCode: settlementData.windowId
            });
            // Credit: UPPF Receivable (clear the receivable)
            journalLines.push({
                accountCode: this.ACCOUNT_CODES.UPPF_RECEIVABLE,
                accountName: 'UPPF Claims Receivable',
                creditAmount: settlementData.originalClaimAmount,
                description: `UPPF receivable settlement - ${settlementData.submissionReference}`,
                reference: settlementData.npaPaymentReference,
                projectCode: settlementData.windowId
            });
            // Handle variance (if settlement amount differs from claim amount)
            const variance = settlementData.settlementAmount - settlementData.originalClaimAmount;
            if (Math.abs(variance) > 0.01) {
                if (variance > 0) {
                    // Additional income
                    journalLines.push({
                        accountCode: this.ACCOUNT_CODES.UPPF_INCOME,
                        accountName: 'UPPF Income',
                        creditAmount: variance,
                        description: `UPPF settlement variance (favorable) - ${settlementData.submissionReference}`,
                        reference: settlementData.npaPaymentReference
                    });
                }
                else {
                    // Income reduction
                    journalLines.push({
                        accountCode: this.ACCOUNT_CODES.UPPF_INCOME,
                        accountName: 'UPPF Income',
                        debitAmount: Math.abs(variance),
                        description: `UPPF settlement variance (unfavorable) - ${settlementData.submissionReference}`,
                        reference: settlementData.npaPaymentReference
                    });
                }
            }
            const journalEntry = await this.createJournalEntry({
                templateCode: 'UPPF_SETTLEMENT',
                sourceDocument: 'NPA_SETTLEMENT',
                sourceDocumentId: eventData.sourceDocumentId,
                description: `UPPF settlement received - ${settlementData.submissionReference} - GHS ${settlementData.settlementAmount.toFixed(2)}`,
                reference: settlementData.npaPaymentReference,
                lines: journalLines,
                createdBy: eventData.createdBy,
                effectiveDate: eventData.effectiveDate
            });
            return journalEntry;
        }
        catch (error) {
            this.logger.error('Failed to process UPPF settlement transaction:', error);
            throw error;
        }
    }
    /**
     * Create and save journal entry
     */
    async createJournalEntry(entryData) {
        const template = this.JOURNAL_TEMPLATES[entryData.templateCode];
        if (!template) {
            throw new Error(`Journal entry template not found: ${entryData.templateCode}`);
        }
        // Validate journal entry balance
        const totalDebit = entryData.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
        const totalCredit = entryData.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal entry is not balanced: Debit ${totalDebit.toFixed(2)}, Credit ${totalCredit.toFixed(2)}`);
        }
        // Generate entry number
        const entryNumber = await this.generateJournalEntryNumber(entryData.templateCode);
        const journalEntry = {
            entryId: this.generateUUID(),
            entryNumber,
            entryDate: entryData.effectiveDate || new Date(),
            description: entryData.description,
            reference: entryData.reference,
            sourceDocument: entryData.sourceDocument,
            sourceDocumentId: entryData.sourceDocumentId,
            templateCode: entryData.templateCode,
            totalDebit,
            totalCredit,
            lines: entryData.lines,
            status: template.approvalRequired && totalDebit >= (template.approvalThreshold || 0) ? 'DRAFT' : 'POSTED',
            postedBy: template.approvalRequired ? undefined : 'SYSTEM_AUTO',
            postedAt: template.approvalRequired ? undefined : new Date(),
            createdAt: new Date()
        };
        // Save journal entry (mock implementation)
        const savedEntry = await this.saveJournalEntry(journalEntry);
        // Emit events
        this.eventEmitter.emit('journal.entry.created', {
            entryId: savedEntry.entryId,
            entryNumber: savedEntry.entryNumber,
            templateCode: savedEntry.templateCode,
            amount: savedEntry.totalDebit,
            requiresApproval: savedEntry.status === 'DRAFT'
        });
        if (savedEntry.status === 'POSTED') {
            this.eventEmitter.emit('journal.entry.posted', {
                entryId: savedEntry.entryId,
                entryNumber: savedEntry.entryNumber,
                amount: savedEntry.totalDebit
            });
        }
        this.logger.log(`Journal entry created: ${savedEntry.entryNumber} - ${savedEntry.status}`);
        return savedEntry;
    }
    /**
     * Approve and post pending journal entries
     */
    async approveJournalEntry(entryId, approvedBy) {
        this.logger.log(`Approving journal entry: ${entryId}`);
        // Get entry (mock implementation)
        const entry = await this.getJournalEntryById(entryId);
        if (!entry) {
            throw new Error(`Journal entry not found: ${entryId}`);
        }
        if (entry.status !== 'DRAFT') {
            throw new Error(`Journal entry ${entryId} is not in DRAFT status`);
        }
        // Update status
        entry.status = 'POSTED';
        entry.postedBy = approvedBy;
        entry.postedAt = new Date();
        // Save updated entry
        const updatedEntry = await this.updateJournalEntry(entry);
        // Emit event
        this.eventEmitter.emit('journal.entry.approved', {
            entryId: updatedEntry.entryId,
            entryNumber: updatedEntry.entryNumber,
            approvedBy,
            amount: updatedEntry.totalDebit
        });
        this.logger.log(`Journal entry approved and posted: ${updatedEntry.entryNumber}`);
        return updatedEntry;
    }
    /**
     * Reverse a posted journal entry
     */
    async reverseJournalEntry(entryId, reversalReason, reversedBy) {
        this.logger.log(`Reversing journal entry: ${entryId}`);
        // Get original entry
        const originalEntry = await this.getJournalEntryById(entryId);
        if (!originalEntry) {
            throw new Error(`Journal entry not found: ${entryId}`);
        }
        if (originalEntry.status !== 'POSTED') {
            throw new Error(`Only posted journal entries can be reversed`);
        }
        // Create reversal lines (swap debits and credits)
        const reversalLines = originalEntry.lines.map(line => ({
            ...line,
            debitAmount: line.creditAmount,
            creditAmount: line.debitAmount,
            description: `REVERSAL: ${line.description}`
        }));
        // Create reversal entry
        const reversalEntryNumber = await this.generateJournalEntryNumber('REVERSAL');
        const reversalEntry = {
            entryId: this.generateUUID(),
            entryNumber: reversalEntryNumber,
            entryDate: new Date(),
            description: `REVERSAL: ${originalEntry.description} - ${reversalReason}`,
            reference: originalEntry.reference,
            sourceDocument: originalEntry.sourceDocument,
            sourceDocumentId: originalEntry.sourceDocumentId,
            templateCode: 'REVERSAL',
            totalDebit: originalEntry.totalCredit,
            totalCredit: originalEntry.totalDebit,
            lines: reversalLines,
            status: 'POSTED',
            postedBy: reversedBy,
            postedAt: new Date(),
            createdAt: new Date()
        };
        // Save reversal entry
        const savedReversalEntry = await this.saveJournalEntry(reversalEntry);
        // Update original entry
        originalEntry.status = 'REVERSED';
        originalEntry.reversalReference = reversalEntryNumber;
        await this.updateJournalEntry(originalEntry);
        // Emit event
        this.eventEmitter.emit('journal.entry.reversed', {
            originalEntryId: entryId,
            reversalEntryId: savedReversalEntry.entryId,
            reversalReason,
            reversedBy
        });
        this.logger.log(`Journal entry reversed: ${originalEntry.entryNumber} -> ${reversalEntryNumber}`);
        return savedReversalEntry;
    }
    /**
     * Get journal entries summary for a period
     */
    async getJournalEntriesSummary(startDate, endDate, templateCode) {
        // Mock implementation - would query database
        return {
            totalEntries: 100,
            totalAmount: 50000.00,
            byTemplate: {
                'FUEL_SALE': { count: 50, amount: 30000.00 },
                'UPPF_CLAIM': { count: 20, amount: 15000.00 },
                'DEALER_SETTLEMENT': { count: 30, amount: 5000.00 }
            },
            byStatus: {
                'POSTED': 85,
                'DRAFT': 10,
                'REVERSED': 5
            }
        };
    }
    // Private helper methods
    async generateJournalEntryNumber(templateCode) {
        // Mock implementation - would generate sequential number
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        return `JE-${templateCode}-${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    generateUUID() {
        return 'uuid-' + Math.random().toString(36).substr(2, 9);
    }
    async saveJournalEntry(entry) {
        // Mock implementation - would save to database
        return entry;
    }
    async getJournalEntryById(entryId) {
        // Mock implementation - would fetch from database
        return null;
    }
    async updateJournalEntry(entry) {
        // Mock implementation - would update in database
        return entry;
    }
};
exports.AutomatedJournalEntryService = AutomatedJournalEntryService;
__decorate([
    (0, event_emitter_1.OnEvent)('accounting.fuel.sale'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutomatedJournalEntryService.prototype, "processFuelSaleTransaction", null);
__decorate([
    (0, event_emitter_1.OnEvent)('accounting.uppf.claim'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutomatedJournalEntryService.prototype, "processUppfClaimTransaction", null);
__decorate([
    (0, event_emitter_1.OnEvent)('accounting.dealer.settlement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutomatedJournalEntryService.prototype, "processDealerSettlementTransaction", null);
__decorate([
    (0, event_emitter_1.OnEvent)('accounting.loan.disbursement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutomatedJournalEntryService.prototype, "processLoanDisbursementTransaction", null);
__decorate([
    (0, event_emitter_1.OnEvent)('accounting.uppf.settlement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutomatedJournalEntryService.prototype, "processUppfSettlementTransaction", null);
exports.AutomatedJournalEntryService = AutomatedJournalEntryService = AutomatedJournalEntryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], AutomatedJournalEntryService);
//# sourceMappingURL=automated-journal-entry.service.js.map