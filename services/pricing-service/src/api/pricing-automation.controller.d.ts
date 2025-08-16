import { PriceCalculationService } from '../price-buildup/price-calculation.service';
import { PricingWindowService } from '../pricing-window/pricing-window.service';
import { UppfClaimsService } from '../uppf-claims/uppf-claims.service';
import { NpaTemplateParserService } from '../npa-integration/npa-template-parser.service';
export declare class CreatePricingWindowDto {
    windowNumber: number;
    year: number;
    startDate: string;
    endDate: string;
    submissionDeadline: string;
    npaGuidelineDocId?: string;
}
export declare class ComponentRateUpdateDto {
    componentCode: string;
    newRate: number;
    effectiveFrom: string;
    effectiveTo?: string;
    reason: string;
}
export declare class PriceCalculationRequestDto {
    windowId: string;
    overrides?: ComponentRateUpdateDto[];
    validateOnly?: boolean;
}
export declare class UppfClaimSubmissionDto {
    windowId: string;
    claimIds?: string[];
    submissionNotes?: string;
}
export declare class NpaResponseProcessingDto {
    submissionReference: string;
    responseReference: string;
    responseStatus: string;
    responseFile?: Buffer;
}
export declare class PricingAutomationController {
    private readonly priceCalculationService;
    private readonly pricingWindowService;
    private readonly uppfClaimsService;
    private readonly npaTemplateParser;
    private readonly logger;
    constructor(priceCalculationService: PriceCalculationService, pricingWindowService: PricingWindowService, uppfClaimsService: UppfClaimsService, npaTemplateParser: NpaTemplateParserService);
    /**
     * Create a new pricing window
     */
    createPricingWindow(dto: CreatePricingWindowDto, createdBy: string): Promise<{
        success: boolean;
        data: {
            windowId: string;
            windowNumber: any;
            year: any;
            status: import("@omc-erp/shared-types").PricingWindowStatus;
            startDate: Date;
            endDate: Date;
            submissionDeadline: any;
        };
        message: string;
    }>;
    /**
     * Update component rates
     */
    updateComponentRates(updates: ComponentRateUpdateDto[], updatedBy: string): Promise<{
        success: boolean;
        data: {
            updatedComponents: number;
            updates: {
                componentCode: string;
                oldRate: number;
                newRate: number;
                effectiveFrom: Date;
                effectiveTo: Date | undefined;
                reason: string;
                updatedBy: string;
                updatedAt: Date;
            }[];
        };
        message: string;
    }>;
    /**
     * Calculate prices for a pricing window
     */
    calculatePrices(windowId: string, withOverrides?: boolean): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: any;
    } | {
        success: boolean;
        data: {
            windowId: any;
            calculationDate: any;
            isValid: any;
            products: any;
        };
        message: string;
        errors?: undefined;
    }>;
    /**
     * Publish calculated prices to all stations
     */
    publishPricesToStations(windowId: string, publishedBy: string, options?: {
        overrides?: ComponentRateUpdateDto[];
    }): Promise<{
        success: boolean;
        data: {
            windowId: string;
            totalStationsUpdated: number;
            publishedAt: Date;
            pricesSummary: {
                productsCount: any;
                validationPassed: any;
            };
        };
        message: string;
    }>;
    /**
     * Submit UPPF claims to NPA
     */
    submitUppfClaims(dto: UppfClaimSubmissionDto, submittedBy: string): Promise<{
        success: boolean;
        data: {
            submissionReference: string;
            windowId: string;
            totalClaims: number;
            totalAmount: number;
            submissionDate: Date;
            notes: string | undefined;
        };
        message: string;
    }>;
    /**
     * Process NPA response for submitted claims
     */
    processNpaResponse(dto: NpaResponseProcessingDto): Promise<{
        success: boolean;
        data: {
            submissionReference: string;
            responseReference: string;
            responseStatus: string;
            approvedClaims: number;
            rejectedClaims: number;
            processedAt: Date;
        };
        message: string;
    }>;
    /**
     * Upload and parse NPA template document
     */
    uploadNpaTemplate(file: Express.Multer.File, documentType?: 'pricing_guideline' | 'pbu_template' | 'circular', autoImport?: boolean, replaceExisting?: boolean, importBy?: string): Promise<{
        success: boolean;
        data: {
            documentId: string;
            documentType: string;
            title: string;
            issueDate: Date;
            effectiveDate: Date;
            isValid: boolean;
            validationErrors: string[];
            extractedComponents: number;
            importResult: {
                imported: number;
                updated: number;
                skipped: number;
                errors: string[];
            } | null;
            processedAt: Date;
        };
        message: string;
        errors: string[];
    }>;
    /**
     * Get pricing window summary with analytics
     */
    getWindowSummary(windowId: string): Promise<{
        success: boolean;
        data: {
            window: import("../pricing-window/pricing-window.service").PricingWindowSummary;
            uppfClaims: import("../uppf-claims/uppf-claims.service").UppfClaimSummary;
            retrievedAt: Date;
        };
        message: string;
    }>;
    /**
     * Get current active pricing window
     */
    getCurrentWindow(): Promise<{
        success: boolean;
        data: {
            windowId: string;
            windowNumber: any;
            year: any;
            status: import("@omc-erp/shared-types").PricingWindowStatus;
            startDate: Date;
            endDate: Date;
            submissionDeadline: any;
            publishedAt: any;
        };
        message: string;
    }>;
    /**
     * Compare prices between two windows
     */
    comparePriceWindows(currentWindowId: string, previousWindowId: string): Promise<{
        success: boolean;
        data: {
            currentWindow: any;
            previousWindow: any;
            productComparisons: any;
            summary: {
                totalProducts: any;
                productsWithIncrease: any;
                productsWithDecrease: any;
                averagePercentageChange: number;
            };
            comparedAt: Date;
        };
        message: string;
    }>;
    /**
     * Get UPPF claims report for a date range
     */
    getUppfClaimsReport(startDate: string, endDate: string, format?: 'summary' | 'detailed'): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
}
//# sourceMappingURL=pricing-automation.controller.d.ts.map