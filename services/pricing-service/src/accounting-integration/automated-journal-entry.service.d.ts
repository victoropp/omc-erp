import { EventEmitter2 } from '@nestjs/event-emitter';
export interface JournalEntryLine {
    accountCode: string;
    accountName: string;
    debitAmount?: number;
    creditAmount?: number;
    description: string;
    costCenter?: string;
    projectCode?: string;
    reference?: string;
}
export interface AutomatedJournalEntry {
    entryId: string;
    entryNumber: string;
    entryDate: Date;
    description: string;
    reference: string;
    sourceDocument: string;
    sourceDocumentId: string;
    templateCode: string;
    totalDebit: number;
    totalCredit: number;
    lines: JournalEntryLine[];
    status: 'DRAFT' | 'POSTED' | 'REVERSED';
    postedBy?: string;
    postedAt?: Date;
    reversalReference?: string;
    createdAt: Date;
}
export interface JournalEntryTemplate {
    templateCode: string;
    templateName: string;
    description: string;
    transactionType: string;
    accountMappingRules: any;
    approvalRequired: boolean;
    approvalThreshold?: number;
    isActive: boolean;
}
export interface AccountingEventData {
    eventType: string;
    sourceDocumentId: string;
    sourceDocument: string;
    templateCode: string;
    amount?: number;
    data: any;
    createdBy: string;
    effectiveDate?: Date;
}
export declare class AutomatedJournalEntryService {
    private readonly eventEmitter;
    private readonly logger;
    private readonly ACCOUNT_CODES;
    private readonly JOURNAL_TEMPLATES;
    constructor(eventEmitter: EventEmitter2);
    /**
     * Process fuel sale transaction
     */
    processFuelSaleTransaction(eventData: AccountingEventData): Promise<AutomatedJournalEntry>;
    /**
     * Process UPPF claim recognition
     */
    processUppfClaimTransaction(eventData: AccountingEventData): Promise<AutomatedJournalEntry>;
    /**
     * Process dealer settlement transaction
     */
    processDealerSettlementTransaction(eventData: AccountingEventData): Promise<AutomatedJournalEntry>;
    /**
     * Process loan disbursement transaction
     */
    processLoanDisbursementTransaction(eventData: AccountingEventData): Promise<AutomatedJournalEntry>;
    /**
     * Process UPPF settlement received from NPA
     */
    processUppfSettlementTransaction(eventData: AccountingEventData): Promise<AutomatedJournalEntry>;
    /**
     * Create and save journal entry
     */
    private createJournalEntry;
    /**
     * Approve and post pending journal entries
     */
    approveJournalEntry(entryId: string, approvedBy: string): Promise<AutomatedJournalEntry>;
    /**
     * Reverse a posted journal entry
     */
    reverseJournalEntry(entryId: string, reversalReason: string, reversedBy: string): Promise<AutomatedJournalEntry>;
    /**
     * Get journal entries summary for a period
     */
    getJournalEntriesSummary(startDate: Date, endDate: Date, templateCode?: string): Promise<{
        totalEntries: number;
        totalAmount: number;
        byTemplate: {
            [templateCode: string]: {
                count: number;
                amount: number;
            };
        };
        byStatus: {
            [status: string]: number;
        };
    }>;
    private generateJournalEntryNumber;
    private generateUUID;
    private saveJournalEntry;
    private getJournalEntryById;
    private updateJournalEntry;
}
//# sourceMappingURL=automated-journal-entry.service.d.ts.map