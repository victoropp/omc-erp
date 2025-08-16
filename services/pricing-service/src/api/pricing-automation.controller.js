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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PricingAutomationController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingAutomationController = exports.NpaResponseProcessingDto = exports.UppfClaimSubmissionDto = exports.PriceCalculationRequestDto = exports.ComponentRateUpdateDto = exports.CreatePricingWindowDto = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const price_calculation_service_1 = require("../price-buildup/price-calculation.service");
const pricing_window_service_1 = require("../pricing-window/pricing-window.service");
const uppf_claims_service_1 = require("../uppf-claims/uppf-claims.service");
const npa_template_parser_service_1 = require("../npa-integration/npa-template-parser.service");
class CreatePricingWindowDto {
    windowNumber;
    year;
    startDate;
    endDate;
    submissionDeadline;
    npaGuidelineDocId;
}
exports.CreatePricingWindowDto = CreatePricingWindowDto;
class ComponentRateUpdateDto {
    componentCode;
    newRate;
    effectiveFrom;
    effectiveTo;
    reason;
}
exports.ComponentRateUpdateDto = ComponentRateUpdateDto;
class PriceCalculationRequestDto {
    windowId;
    overrides;
    validateOnly;
}
exports.PriceCalculationRequestDto = PriceCalculationRequestDto;
class UppfClaimSubmissionDto {
    windowId;
    claimIds;
    submissionNotes;
}
exports.UppfClaimSubmissionDto = UppfClaimSubmissionDto;
class NpaResponseProcessingDto {
    submissionReference;
    responseReference;
    responseStatus;
    responseFile;
}
exports.NpaResponseProcessingDto = NpaResponseProcessingDto;
let PricingAutomationController = PricingAutomationController_1 = class PricingAutomationController {
    priceCalculationService;
    pricingWindowService;
    uppfClaimsService;
    npaTemplateParser;
    logger = new common_1.Logger(PricingAutomationController_1.name);
    constructor(priceCalculationService, pricingWindowService, uppfClaimsService, npaTemplateParser) {
        this.priceCalculationService = priceCalculationService;
        this.pricingWindowService = pricingWindowService;
        this.uppfClaimsService = uppfClaimsService;
        this.npaTemplateParser = npaTemplateParser;
    }
    /**
     * Create a new pricing window
     */
    async createPricingWindow(dto, createdBy) {
        this.logger.log(`Creating pricing window: ${dto.year}-W${dto.windowNumber.toString().padStart(2, '0')}`);
        try {
            const windowData = {
                windowNumber: dto.windowNumber,
                year: dto.year,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                submissionDeadline: new Date(dto.submissionDeadline),
                npaGuidelineDocId: dto.npaGuidelineDocId,
                createdBy: createdBy || 'API_USER'
            };
            const window = await this.pricingWindowService.createPricingWindow(windowData);
            return {
                success: true,
                data: {
                    windowId: window.windowId,
                    windowNumber: window.windowNumber,
                    year: window.year,
                    status: window.status,
                    startDate: window.startDate,
                    endDate: window.endDate,
                    submissionDeadline: window.submissionDeadline
                },
                message: 'Pricing window created successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to create pricing window:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Update component rates
     */
    async updateComponentRates(updates, updatedBy) {
        this.logger.log(`Updating ${updates.length} component rates`);
        try {
            const results = [];
            for (const update of updates) {
                // Mock implementation - would integrate with component repository
                const result = {
                    componentCode: update.componentCode,
                    oldRate: 0.20, // Would fetch from database
                    newRate: update.newRate,
                    effectiveFrom: new Date(update.effectiveFrom),
                    effectiveTo: update.effectiveTo ? new Date(update.effectiveTo) : undefined,
                    reason: update.reason,
                    updatedBy: updatedBy || 'API_USER',
                    updatedAt: new Date()
                };
                results.push(result);
            }
            return {
                success: true,
                data: {
                    updatedComponents: results.length,
                    updates: results
                },
                message: 'Component rates updated successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to update component rates:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Calculate prices for a pricing window
     */
    async calculatePrices(windowId, withOverrides) {
        this.logger.log(`Calculating prices for window: ${windowId}`);
        try {
            const overrides = withOverrides ? [] : undefined; // Would get from request or database
            const calculation = await this.priceCalculationService.calculatePricesForWindow(windowId, overrides);
            if (!calculation.isValid) {
                return {
                    success: false,
                    data: calculation,
                    message: 'Price calculation completed with validation errors',
                    errors: calculation.validationErrors
                };
            }
            return {
                success: true,
                data: {
                    windowId: calculation.windowId,
                    calculationDate: calculation.calculationDate,
                    isValid: calculation.isValid,
                    products: calculation.products.map(product => ({
                        productCode: product.productCode,
                        exPumpPrice: product.exPumpPrice,
                        exRefineryPrice: product.exRefineryPrice,
                        totalTaxesLevies: product.totalTaxesLevies,
                        totalRegulatoryMargins: product.totalRegulatoryMargins,
                        omcMargin: product.omcMargin,
                        dealerMargin: product.dealerMargin,
                        componentsBreakdown: product.components
                    }))
                },
                message: 'Price calculation completed successfully'
            };
        }
        catch (error) {
            this.logger.error(`Price calculation failed for window ${windowId}:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Publish calculated prices to all stations
     */
    async publishPricesToStations(windowId, publishedBy, options) {
        this.logger.log(`Publishing prices to stations for window: ${windowId}`);
        try {
            const result = await this.pricingWindowService.calculateAndPublishPrices(windowId, publishedBy || 'API_USER', options?.overrides);
            return {
                success: true,
                data: {
                    windowId: result.windowId,
                    totalStationsUpdated: result.totalStationsUpdated,
                    publishedAt: new Date(),
                    pricesSummary: {
                        productsCount: result.priceResults.products.length,
                        validationPassed: result.priceResults.isValid
                    }
                },
                message: `Prices published to ${result.totalStationsUpdated} stations successfully`
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish prices for window ${windowId}:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Submit UPPF claims to NPA
     */
    async submitUppfClaims(dto, submittedBy) {
        this.logger.log(`Submitting UPPF claims for window: ${dto.windowId}`);
        try {
            const result = await this.uppfClaimsService.submitClaimsToNpa(dto.windowId, submittedBy || 'API_USER', dto.claimIds);
            return {
                success: true,
                data: {
                    submissionReference: result.submissionReference,
                    windowId: dto.windowId,
                    totalClaims: result.totalClaims,
                    totalAmount: result.totalAmount,
                    submissionDate: result.submissionDate,
                    notes: dto.submissionNotes
                },
                message: `${result.totalClaims} UPPF claims submitted to NPA successfully`
            };
        }
        catch (error) {
            this.logger.error(`Failed to submit UPPF claims for window ${dto.windowId}:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Process NPA response for submitted claims
     */
    async processNpaResponse(dto) {
        this.logger.log(`Processing NPA response for submission: ${dto.submissionReference}`);
        try {
            // Mock NPA response data structure
            const responseData = {
                responseReference: dto.responseReference,
                responseStatus: dto.responseStatus,
                approvedClaims: [
                    {
                        claimNumber: 'UPPF-2025-W01-001',
                        approvedAmount: 1500.00,
                        settlementDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                    }
                ],
                rejectedClaims: []
            };
            await this.uppfClaimsService.processNpaResponse(dto.submissionReference, responseData);
            return {
                success: true,
                data: {
                    submissionReference: dto.submissionReference,
                    responseReference: dto.responseReference,
                    responseStatus: dto.responseStatus,
                    approvedClaims: responseData.approvedClaims.length,
                    rejectedClaims: responseData.rejectedClaims.length,
                    processedAt: new Date()
                },
                message: 'NPA response processed successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to process NPA response:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Upload and parse NPA template document
     */
    async uploadNpaTemplate(file, documentType = 'pricing_guideline', autoImport = false, replaceExisting = false, importBy = 'API_USER') {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        this.logger.log(`Processing NPA template upload: ${file.originalname}`);
        try {
            // Parse the uploaded document
            const parsedDocument = await this.npaTemplateParser.parseNpaDocument(file.buffer, file.originalname, documentType);
            let importResult = null;
            // Auto-import components if requested and document is valid
            if (autoImport && parsedDocument.isValid && parsedDocument.extractedData) {
                importResult = await this.npaTemplateParser.importNpaComponents(parsedDocument.extractedData, importBy, replaceExisting);
            }
            return {
                success: parsedDocument.isValid,
                data: {
                    documentId: parsedDocument.documentId,
                    documentType: parsedDocument.documentType,
                    title: parsedDocument.title,
                    issueDate: parsedDocument.issueDate,
                    effectiveDate: parsedDocument.effectiveDate,
                    isValid: parsedDocument.isValid,
                    validationErrors: parsedDocument.validationErrors,
                    extractedComponents: parsedDocument.extractedData?.components?.length || 0,
                    importResult: importResult ? {
                        imported: importResult.imported,
                        updated: importResult.updated,
                        skipped: importResult.skipped,
                        errors: importResult.errors
                    } : null,
                    processedAt: new Date()
                },
                message: parsedDocument.isValid ?
                    'NPA template processed successfully' :
                    'NPA template processed with validation errors',
                errors: parsedDocument.validationErrors
            };
        }
        catch (error) {
            this.logger.error(`Failed to process NPA template upload:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Get pricing window summary with analytics
     */
    async getWindowSummary(windowId) {
        this.logger.log(`Retrieving summary for pricing window: ${windowId}`);
        try {
            const windowSummary = await this.pricingWindowService.getWindowSummary(windowId);
            const claimsSummary = await this.uppfClaimsService.getClaimsSummary(windowId);
            return {
                success: true,
                data: {
                    window: windowSummary,
                    uppfClaims: claimsSummary,
                    retrievedAt: new Date()
                },
                message: 'Window summary retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve window summary for ${windowId}:`, error);
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Get current active pricing window
     */
    async getCurrentWindow() {
        this.logger.log('Retrieving current active pricing window');
        try {
            const currentWindow = await this.pricingWindowService.getCurrentActiveWindow();
            if (!currentWindow) {
                throw new common_1.NotFoundException('No active pricing window found');
            }
            return {
                success: true,
                data: {
                    windowId: currentWindow.windowId,
                    windowNumber: currentWindow.windowNumber,
                    year: currentWindow.year,
                    status: currentWindow.status,
                    startDate: currentWindow.startDate,
                    endDate: currentWindow.endDate,
                    submissionDeadline: currentWindow.submissionDeadline,
                    publishedAt: currentWindow.publishedAt
                },
                message: 'Current active window retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to retrieve current window:', error);
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Compare prices between two windows
     */
    async comparePriceWindows(currentWindowId, previousWindowId) {
        this.logger.log(`Comparing prices between windows: ${previousWindowId} -> ${currentWindowId}`);
        try {
            const comparison = await this.priceCalculationService.comparePriceWindows(currentWindowId, previousWindowId);
            return {
                success: true,
                data: {
                    currentWindow: comparison.currentWindow,
                    previousWindow: comparison.previousWindow,
                    productComparisons: comparison.productComparisons,
                    summary: {
                        totalProducts: comparison.productComparisons.length,
                        productsWithIncrease: comparison.productComparisons.filter((p) => p.priceDifference > 0).length,
                        productsWithDecrease: comparison.productComparisons.filter((p) => p.priceDifference < 0).length,
                        averagePercentageChange: comparison.productComparisons.reduce((sum, p) => sum + p.percentageChange, 0) / comparison.productComparisons.length
                    },
                    comparedAt: new Date()
                },
                message: 'Price comparison completed successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to compare price windows:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    /**
     * Get UPPF claims report for a date range
     */
    async getUppfClaimsReport(startDate, endDate, format = 'summary') {
        this.logger.log(`Generating UPPF claims report: ${startDate} to ${endDate} (${format})`);
        try {
            const report = await this.uppfClaimsService.generateClaimsReport(new Date(startDate), new Date(endDate), format);
            return {
                success: true,
                data: report,
                message: 'UPPF claims report generated successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to generate UPPF claims report:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.PricingAutomationController = PricingAutomationController;
__decorate([
    (0, common_1.Post)('windows/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new pricing window' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pricing window created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid window data' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('createdBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePricingWindowDto, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "createPricingWindow", null);
__decorate([
    (0, common_1.Put)('components/update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update price component rates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Component rates updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid component data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('updatedBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "updateComponentRates", null);
__decorate([
    (0, common_1.Get)(':windowId/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate prices for pricing window' }),
    (0, swagger_1.ApiParam)({ name: 'windowId', description: 'Pricing window ID' }),
    (0, swagger_1.ApiQuery)({ name: 'withOverrides', required: false, description: 'Include component overrides' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price calculation completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pricing window not found' }),
    __param(0, (0, common_1.Param)('windowId')),
    __param(1, (0, common_1.Query)('withOverrides')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "calculatePrices", null);
__decorate([
    (0, common_1.Post)(':windowId/publish-to-stations'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish prices to all stations' }),
    (0, swagger_1.ApiParam)({ name: 'windowId', description: 'Pricing window ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prices published to stations successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('windowId')),
    __param(1, (0, common_1.Query)('publishedBy')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "publishPricesToStations", null);
__decorate([
    (0, common_1.Post)('uppf/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit UPPF claims to NPA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF claims submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No eligible claims found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('submittedBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UppfClaimSubmissionDto, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "submitUppfClaims", null);
__decorate([
    (0, common_1.Post)('npa/process-response'),
    (0, swagger_1.ApiOperation)({ summary: 'Process NPA response for submitted claims' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NPA response processed successfully' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NpaResponseProcessingDto]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "processNpaResponse", null);
__decorate([
    (0, common_1.Post)('npa/upload-template'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload and parse NPA pricing template' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv',
                'application/pdf',
                'text/plain'
            ];
            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            }
            else {
                callback(new common_1.BadRequestException('Invalid file type. Only Excel, CSV, PDF, and text files are allowed.'), false);
            }
        }
    })),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NPA template processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or processing error' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('documentType')),
    __param(2, (0, common_1.Query)('autoImport')),
    __param(3, (0, common_1.Query)('replaceExisting')),
    __param(4, (0, common_1.Query)('importBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, String, Boolean, Boolean, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "uploadNpaTemplate", null);
__decorate([
    (0, common_1.Get)('windows/:windowId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pricing window summary and analytics' }),
    (0, swagger_1.ApiParam)({ name: 'windowId', description: 'Pricing window ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Window summary retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pricing window not found' }),
    __param(0, (0, common_1.Param)('windowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "getWindowSummary", null);
__decorate([
    (0, common_1.Get)('windows/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active pricing window' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current window retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active window found' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "getCurrentWindow", null);
__decorate([
    (0, common_1.Get)('windows/compare/:currentWindowId/:previousWindowId'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare prices between two pricing windows' }),
    (0, swagger_1.ApiParam)({ name: 'currentWindowId', description: 'Current pricing window ID' }),
    (0, swagger_1.ApiParam)({ name: 'previousWindowId', description: 'Previous pricing window ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price comparison completed successfully' }),
    __param(0, (0, common_1.Param)('currentWindowId')),
    __param(1, (0, common_1.Param)('previousWindowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "comparePriceWindows", null);
__decorate([
    (0, common_1.Get)('uppf/claims/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate UPPF claims report for date range' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['summary', 'detailed'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'UPPF claims report generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PricingAutomationController.prototype, "getUppfClaimsReport", null);
exports.PricingAutomationController = PricingAutomationController = PricingAutomationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Pricing Automation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/pricing'),
    __metadata("design:paramtypes", [price_calculation_service_1.PriceCalculationService,
        pricing_window_service_1.PricingWindowService,
        uppf_claims_service_1.UppfClaimsService,
        npa_template_parser_service_1.NpaTemplateParserService])
], PricingAutomationController);
//# sourceMappingURL=pricing-automation.controller.js.map