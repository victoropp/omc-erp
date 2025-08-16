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
var DealerSettlementStatementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerSettlementStatementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const dealer_settlement_entity_1 = require("../entities/dealer-settlement.entity");
const dealer_loan_entity_1 = require("../entities/dealer-loan.entity");
let DealerSettlementStatementService = DealerSettlementStatementService_1 = class DealerSettlementStatementService {
    settlementRepository;
    loanRepository;
    eventEmitter;
    logger = new common_1.Logger(DealerSettlementStatementService_1.name);
    constructor(settlementRepository, loanRepository, eventEmitter) {
        this.settlementRepository = settlementRepository;
        this.loanRepository = loanRepository;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Generate comprehensive settlement statement
     * Blueprint: "deliver a dealer settlement statement each window with the PBU breakdown, loan deduction line, and net payment"
     */
    async generateSettlementStatement(settlementId, tenantId, template = { templateType: 'DETAILED', format: 'PDF', language: 'EN', includeCharts: true, includeLoanDetails: true, includePerformanceMetrics: true }) {
        this.logger.log(`Generating settlement statement for settlement ${settlementId}`);
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId, tenantId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException('Settlement not found');
        }
        // Get additional data
        const [dealerInfo, companyInfo, previousSettlement, activeLoans] = await Promise.all([
            this.getDealerInfo(settlement.stationId, tenantId),
            this.getCompanyInfo(tenantId),
            this.getPreviousSettlement(settlement.stationId, settlement.windowId, tenantId),
            this.getActiveLoans(settlement.stationId, tenantId),
        ]);
        // Build statement
        const statement = {
            companyInfo,
            dealerInfo,
            statementDetails: this.buildStatementDetails(settlement),
            salesSummary: this.buildSalesSummary(settlement),
            priceBuildUp: this.buildPriceBuildUp(settlement),
            marginCalculation: this.buildMarginCalculation(settlement),
            deductionsDetail: this.buildDeductionsDetail(settlement, activeLoans),
            settlementSummary: this.buildSettlementSummary(settlement),
            paymentInstructions: this.buildPaymentInstructions(dealerInfo, settlement),
            performanceMetrics: this.buildPerformanceMetrics(settlement, previousSettlement),
            loanSummary: template.includeLoanDetails ? this.buildLoanSummary(activeLoans) : undefined,
            complianceInfo: this.buildComplianceInfo(settlement),
            footer: this.buildFooter(),
        };
        // Emit statement generated event
        this.eventEmitter.emit('dealer.settlement.statement.generated', {
            settlementId,
            stationId: settlement.stationId,
            statementNumber: statement.statementDetails.statementNumber,
            netAmount: statement.settlementSummary.finalNetAmount,
            tenantId,
        });
        return statement;
    }
    /**
     * Generate multiple settlement statements for batch processing
     */
    async generateBatchStatements(settlementIds, tenantId, template = { templateType: 'STANDARD', format: 'PDF', language: 'EN', includeCharts: false, includeLoanDetails: true, includePerformanceMetrics: false }) {
        this.logger.log(`Generating batch settlement statements for ${settlementIds.length} settlements`);
        const statements = [];
        const errors = [];
        for (const settlementId of settlementIds) {
            try {
                const statement = await this.generateSettlementStatement(settlementId, tenantId, template);
                statements.push(statement);
            }
            catch (error) {
                errors.push({ settlementId, error: error.message });
                this.logger.error(`Failed to generate statement for settlement ${settlementId}:`, error);
            }
        }
        this.eventEmitter.emit('dealer.settlement.batch.statements.generated', {
            totalRequested: settlementIds.length,
            successful: statements.length,
            failed: errors.length,
            tenantId,
        });
        return { statements, errors };
    }
    /**
     * Convert statement to PDF format
     */
    async generatePDFStatement(statement, template) {
        // This would integrate with PDF generation library (like Puppeteer, jsPDF, etc.)
        // For now, return mock PDF buffer
        const htmlContent = this.generateHTMLStatement(statement, template);
        // Mock PDF generation
        const pdfBuffer = Buffer.from(`PDF content for ${statement.statementDetails.statementNumber}`, 'utf8');
        this.logger.log(`Generated PDF statement: ${statement.statementDetails.statementNumber}`);
        return pdfBuffer;
    }
    /**
     * Convert statement to HTML format
     */
    generateHTMLStatement(statement, template) {
        const html = `
<!DOCTYPE html>
<html lang="${template.language.toLowerCase()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dealer Settlement Statement - ${statement.statementDetails.statementNumber}</title>
    <style>
        ${this.getStatementCSS()}
    </style>
</head>
<body>
    <div class="statement-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <img src="${statement.companyInfo.logo || '/logo.png'}" alt="Company Logo" class="logo">
                <div class="company-details">
                    <h1>${statement.companyInfo.name}</h1>
                    <p>${statement.companyInfo.address}</p>
                    <p>Tel: ${statement.companyInfo.phone} | Email: ${statement.companyInfo.email}</p>
                </div>
            </div>
            <div class="statement-title">
                <h2>DEALER SETTLEMENT STATEMENT</h2>
                <p class="statement-number">${statement.statementDetails.statementNumber}</p>
            </div>
        </div>

        <!-- Dealer Information -->
        <div class="dealer-info section">
            <h3>Dealer Information</h3>
            <div class="dealer-details">
                <p><strong>Dealer:</strong> ${statement.dealerInfo.dealerName}</p>
                <p><strong>Station:</strong> ${statement.dealerInfo.stationName}</p>
                <p><strong>Address:</strong> ${statement.dealerInfo.stationAddress}</p>
                <p><strong>Contact:</strong> ${statement.dealerInfo.contactPerson} - ${statement.dealerInfo.phone}</p>
            </div>
        </div>

        <!-- Statement Details -->
        <div class="statement-details section">
            <h3>Statement Details</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Statement Period:</span>
                    <span class="value">${this.formatDate(statement.statementDetails.periodStart)} - ${this.formatDate(statement.statementDetails.periodEnd)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Pricing Window:</span>
                    <span class="value">${statement.statementDetails.windowId}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Statement Date:</span>
                    <span class="value">${this.formatDate(statement.statementDetails.statementDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Payment Due:</span>
                    <span class="value">${this.formatDate(statement.statementDetails.dueDate)}</span>
                </div>
            </div>
        </div>

        <!-- Sales Summary -->
        <div class="sales-summary section">
            <h3>Sales Summary</h3>
            <div class="summary-stats">
                <div class="stat">
                    <span class="stat-value">${this.formatNumber(statement.salesSummary.totalLitresSold)}</span>
                    <span class="stat-label">Total Litres Sold</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${statement.salesSummary.operationalDays}</span>
                    <span class="stat-label">Operational Days</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.formatNumber(statement.salesSummary.averageDailySales)}</span>
                    <span class="stat-label">Avg Daily Sales</span>
                </div>
            </div>
            
            <table class="product-breakdown">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Litres Sold</th>
                        <th>Avg Price</th>
                        <th>Gross Revenue</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    ${statement.salesSummary.productBreakdown.map(product => `
                        <tr>
                            <td>${product.productType}</td>
                            <td>${this.formatNumber(product.litresSold)}</td>
                            <td>${this.formatCurrency(product.averagePrice)}</td>
                            <td>${this.formatCurrency(product.grossRevenue)}</td>
                            <td>${product.percentage.toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Price Build Up -->
        <div class="price-buildup section">
            <h3>Price Build-Up Analysis (per litre)</h3>
            <table class="pbu-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ex-Refinery Price</td>
                        <td>-</td>
                        <td>${this.formatCurrency(statement.priceBuildUp.exRefineryPrice)}</td>
                    </tr>
                    ${statement.priceBuildUp.taxesAndLevies.map(tax => `
                        <tr>
                            <td>${tax.component}</td>
                            <td>${this.formatCurrency(tax.rate)}</td>
                            <td>${this.formatCurrency(tax.amount)}</td>
                        </tr>
                    `).join('')}
                    ${statement.priceBuildUp.regulatoryMargins.map(margin => `
                        <tr>
                            <td>${margin.component}</td>
                            <td>${this.formatCurrency(margin.rate)}</td>
                            <td>${this.formatCurrency(margin.amount)}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td>OMC Margin</td>
                        <td>${this.formatCurrency(statement.priceBuildUp.omcMargin.rate)}</td>
                        <td>${this.formatCurrency(statement.priceBuildUp.omcMargin.amount)}</td>
                    </tr>
                    <tr class="dealer-margin-row">
                        <td><strong>Dealer Margin</strong></td>
                        <td><strong>${this.formatCurrency(statement.priceBuildUp.dealerMargin.rate)}</strong></td>
                        <td><strong>${this.formatCurrency(statement.priceBuildUp.dealerMargin.amount)}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Total Ex-Pump Price</strong></td>
                        <td>-</td>
                        <td><strong>${this.formatCurrency(statement.priceBuildUp.totalExPumpPrice)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Margin Calculation -->
        <div class="margin-calculation section">
            <h3>Margin Calculation</h3>
            <div class="margin-stats">
                <div class="stat">
                    <span class="stat-value">${this.formatCurrency(statement.marginCalculation.grossMarginEarned)}</span>
                    <span class="stat-label">Gross Margin Earned</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.formatCurrency(statement.marginCalculation.marginPerLitre)}</span>
                    <span class="stat-label">Margin per Litre</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${statement.marginCalculation.marginEfficiency.toFixed(1)}%</span>
                    <span class="stat-label">Margin Efficiency</span>
                </div>
            </div>
        </div>

        <!-- Deductions -->
        <div class="deductions section">
            <h3>Deductions</h3>
            
            ${statement.deductionsDetail.loanRepayments ? `
            <div class="loan-repayments">
                <h4>Loan Repayments</h4>
                <table class="deductions-table">
                    <thead>
                        <tr>
                            <th>Loan Ref</th>
                            <th>Type</th>
                            <th>Inst #</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Penalty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${statement.deductionsDetail.loanRepayments.loanBreakdown.map(loan => `
                            <tr>
                                <td>${loan.loanReference}</td>
                                <td>${loan.loanType}</td>
                                <td>${loan.installmentNumber}</td>
                                <td>${this.formatCurrency(loan.principalAmount)}</td>
                                <td>${this.formatCurrency(loan.interestAmount)}</td>
                                <td>${this.formatCurrency(loan.penaltyAmount)}</td>
                                <td>${this.formatCurrency(loan.totalAmount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="6"><strong>Total Loan Repayments</strong></td>
                            <td><strong>${this.formatCurrency(statement.deductionsDetail.loanRepayments.totalAmount)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            ` : ''}

            <div class="other-deductions">
                <h4>Other Deductions</h4>
                <table class="deductions-table">
                    <tbody>
                        <tr>
                            <td>Chargebacks</td>
                            <td>${statement.deductionsDetail.otherDeductions.chargebacks.reason}</td>
                            <td>${this.formatCurrency(statement.deductionsDetail.otherDeductions.chargebacks.amount)}</td>
                        </tr>
                        <tr>
                            <td>Shortages</td>
                            <td>${statement.deductionsDetail.otherDeductions.shortages.details}</td>
                            <td>${this.formatCurrency(statement.deductionsDetail.otherDeductions.shortages.amount)}</td>
                        </tr>
                        <tr>
                            <td>Penalties</td>
                            <td>${statement.deductionsDetail.otherDeductions.penalties.description}</td>
                            <td>${this.formatCurrency(statement.deductionsDetail.otherDeductions.penalties.amount)}</td>
                        </tr>
                        ${statement.deductionsDetail.otherDeductions.adjustments.map(adj => `
                            <tr>
                                <td>${adj.type}</td>
                                <td>${adj.reason}</td>
                                <td>${this.formatCurrency(adj.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Settlement Summary -->
        <div class="settlement-summary section">
            <h3>Settlement Summary</h3>
            <table class="summary-table">
                <tbody>
                    <tr>
                        <td>Gross Margin Earned</td>
                        <td>${this.formatCurrency(statement.settlementSummary.grossMarginEarned)}</td>
                    </tr>
                    <tr>
                        <td>Total Deductions</td>
                        <td>(${this.formatCurrency(statement.settlementSummary.totalDeductions)})</td>
                    </tr>
                    <tr>
                        <td>Net Amount Payable</td>
                        <td>${this.formatCurrency(statement.settlementSummary.netAmountPayable)}</td>
                    </tr>
                    ${statement.settlementSummary.vatAmount ? `
                        <tr>
                            <td>VAT (12.5%)</td>
                            <td>${this.formatCurrency(statement.settlementSummary.vatAmount)}</td>
                        </tr>
                    ` : ''}
                    ${statement.settlementSummary.withholdingTax ? `
                        <tr>
                            <td>Withholding Tax</td>
                            <td>(${this.formatCurrency(statement.settlementSummary.withholdingTax)})</td>
                        </tr>
                    ` : ''}
                    <tr class="final-amount">
                        <td><strong>Final Net Amount</strong></td>
                        <td><strong>${this.formatCurrency(statement.settlementSummary.finalNetAmount)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="payment-status">
                <p><strong>Payment Status:</strong> ${statement.settlementSummary.paymentStatus}</p>
                <p><strong>Expected Payment Date:</strong> ${this.formatDate(statement.settlementSummary.expectedPaymentDate)}</p>
            </div>
        </div>

        ${template.includePerformanceMetrics ? `
        <!-- Performance Metrics -->
        <div class="performance-metrics section">
            <h3>Performance Metrics</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Margin Performance</h4>
                    <p>Current: ${this.formatCurrency(statement.performanceMetrics.marginPerformance.currentPeriod)}</p>
                    <p>Previous: ${this.formatCurrency(statement.performanceMetrics.marginPerformance.previousPeriod)}</p>
                    <p class="trend ${statement.performanceMetrics.marginPerformance.trend.toLowerCase()}">
                        ${statement.performanceMetrics.marginPerformance.trend} (${statement.performanceMetrics.marginPerformance.variance > 0 ? '+' : ''}${statement.performanceMetrics.marginPerformance.variance.toFixed(1)}%)
                    </p>
                </div>
                <div class="metric-card">
                    <h4>Volume Performance</h4>
                    <p>Current: ${this.formatNumber(statement.performanceMetrics.volumePerformance.currentPeriod)} L</p>
                    <p>Previous: ${this.formatNumber(statement.performanceMetrics.volumePerformance.previousPeriod)} L</p>
                    <p class="trend ${statement.performanceMetrics.volumePerformance.trend.toLowerCase()}">
                        ${statement.performanceMetrics.volumePerformance.trend} (${statement.performanceMetrics.volumePerformance.variance > 0 ? '+' : ''}${statement.performanceMetrics.volumePerformance.variance.toFixed(1)}%)
                    </p>
                </div>
                <div class="metric-card">
                    <h4>Payment Reliability</h4>
                    <p>On-time: ${statement.performanceMetrics.paymentReliability.onTimePayments}/${statement.performanceMetrics.paymentReliability.totalPayments}</p>
                    <p>Reliability: ${statement.performanceMetrics.paymentReliability.reliability.toFixed(1)}%</p>
                    <p class="rating">${statement.performanceMetrics.paymentReliability.rating}</p>
                </div>
            </div>
        </div>
        ` : ''}

        ${statement.loanSummary ? `
        <!-- Loan Summary -->
        <div class="loan-summary section">
            <h3>Loan Summary</h3>
            <div class="loan-stats">
                <div class="stat">
                    <span class="stat-value">${statement.loanSummary.activeLoans}</span>
                    <span class="stat-label">Active Loans</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.formatCurrency(statement.loanSummary.totalOutstanding)}</span>
                    <span class="stat-label">Total Outstanding</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.formatCurrency(statement.loanSummary.monthlyObligations)}</span>
                    <span class="stat-label">Monthly Obligations</span>
                </div>
            </div>
            <p><strong>Next Payment Due:</strong> ${this.formatDate(statement.loanSummary.nextPaymentDue)}</p>
            <p><strong>Loan Performance:</strong> <span class="performance ${statement.loanSummary.loanPerformance.toLowerCase()}">${statement.loanSummary.loanPerformance}</span></p>
        </div>
        ` : ''}

        <!-- Payment Instructions -->
        <div class="payment-instructions section">
            <h3>Payment Instructions</h3>
            <div class="bank-details">
                <h4>Bank Details</h4>
                <p><strong>Account Name:</strong> ${statement.paymentInstructions.bankDetails.accountName}</p>
                <p><strong>Account Number:</strong> ${statement.paymentInstructions.bankDetails.accountNumber}</p>
                <p><strong>Bank:</strong> ${statement.paymentInstructions.bankDetails.bankName}</p>
                <p><strong>Bank Code:</strong> ${statement.paymentInstructions.bankDetails.bankCode}</p>
                ${statement.paymentInstructions.bankDetails.swiftCode ? `<p><strong>SWIFT Code:</strong> ${statement.paymentInstructions.bankDetails.swiftCode}</p>` : ''}
            </div>
            <div class="payment-terms">
                <p><strong>Payment Method:</strong> ${statement.paymentInstructions.paymentMethod}</p>
                <p><strong>Payment Terms:</strong> ${statement.paymentInstructions.paymentTerms}</p>
                <div class="notes">
                    ${statement.paymentInstructions.notes.map(note => `<p>• ${note}</p>`).join('')}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="terms">
                <h4>Terms & Conditions</h4>
                ${statement.footer.terms.map(term => `<p>• ${term}</p>`).join('')}
            </div>
            <div class="signature">
                <div class="signature-line">
                    <p><strong>${statement.footer.signature.name}</strong></p>
                    <p>${statement.footer.signature.title}</p>
                    <p>Date: ${this.formatDate(statement.footer.signature.date)}</p>
                </div>
            </div>
            <div class="generated-info">
                <p>Generated on: ${this.formatDate(statement.footer.generatedAt)}</p>
                <p>Version: ${statement.footer.version}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
        return html;
    }
    /**
     * Export statement to Excel format
     */
    async generateExcelStatement(statement) {
        // This would integrate with Excel generation library (like ExcelJS)
        // For now, return mock Excel buffer
        const excelBuffer = Buffer.from(`Excel content for ${statement.statementDetails.statementNumber}`, 'utf8');
        this.logger.log(`Generated Excel statement: ${statement.statementDetails.statementNumber}`);
        return excelBuffer;
    }
    // Private helper methods for building statement sections
    buildStatementDetails(settlement) {
        return {
            statementNumber: `STMT-${settlement.stationId.slice(-4)}-${settlement.windowId}-${Date.now()}`,
            settlementId: settlement.id,
            windowId: settlement.windowId,
            periodStart: settlement.periodStart,
            periodEnd: settlement.periodEnd,
            statementDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            currency: 'GHS',
        };
    }
    buildSalesSummary(settlement) {
        const calculationDetails = settlement.calculationDetails;
        const totalLitres = settlement.totalLitresSold;
        const periodDays = Math.ceil((settlement.periodEnd.getTime() - settlement.periodStart.getTime()) / (24 * 60 * 60 * 1000));
        // Build product breakdown from calculation details
        const productBreakdown = Object.entries(calculationDetails?.salesByProduct || {}).map(([product, data]) => {
            const grossRevenue = data.litresSold * data.exPumpPrice;
            return {
                productType: product,
                litresSold: data.litresSold,
                averagePrice: data.exPumpPrice,
                grossRevenue,
                percentage: totalLitres > 0 ? (data.litresSold / totalLitres) * 100 : 0,
            };
        });
        return {
            totalLitresSold: totalLitres,
            operationalDays: periodDays, // Simplified
            averageDailySales: totalLitres / Math.max(periodDays, 1),
            productBreakdown,
        };
    }
    buildPriceBuildUp(settlement) {
        // This would get actual PBU data from pricing service
        // For now, use mock data based on typical Ghana fuel pricing structure
        return {
            exRefineryPrice: 8.904,
            taxesAndLevies: [
                { component: 'Energy Debt Recovery Levy', rate: 0.490, amount: 0.490 },
                { component: 'Road Fund Levy', rate: 0.840, amount: 0.840 },
                { component: 'Price Stabilisation & Recovery Levy', rate: 0.160, amount: 0.160 },
            ],
            regulatoryMargins: [
                { component: 'BOST Margin', rate: 0.150, amount: 0.150 },
                { component: 'UPPF Margin', rate: 0.200, amount: 0.200 },
                { component: 'Fuel Marking Margin', rate: 0.100, amount: 0.100 },
                { component: 'Primary Distribution Margin', rate: 0.150, amount: 0.150 },
            ],
            omcMargin: {
                rate: 0.300,
                amount: 0.300,
            },
            dealerMargin: {
                rate: 0.350,
                amount: 0.350,
                percentage: 3.1, // 0.35 out of ~11.3 total price
            },
            totalExPumpPrice: 11.284,
        };
    }
    buildMarginCalculation(settlement) {
        const marginPerLitre = settlement.totalLitresSold > 0 ? settlement.grossDealerMargin / settlement.totalLitresSold : 0;
        const expectedMarginPerLitre = 0.35; // Standard rate
        const marginEfficiency = (marginPerLitre / expectedMarginPerLitre) * 100;
        // Mock daily breakdown - would get from actual margin accruals
        const dailyMarginBreakdown = [];
        const startDate = new Date(settlement.periodStart);
        const endDate = new Date(settlement.periodEnd);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        for (let i = 0; i < Math.min(totalDays, 14); i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dailyMarginBreakdown.push({
                date,
                litresSold: settlement.totalLitresSold / totalDays,
                marginEarned: settlement.grossDealerMargin / totalDays,
                marginRate: marginPerLitre,
            });
        }
        return {
            grossMarginEarned: settlement.grossDealerMargin,
            marginPerLitre,
            marginEfficiency,
            dailyMarginBreakdown,
        };
    }
    buildDeductionsDetail(settlement, activeLoans) {
        const loanRepayments = settlement.loanDeduction > 0 ? {
            totalAmount: settlement.loanDeduction,
            loanBreakdown: activeLoans.map((loan, index) => ({
                loanReference: loan.loanId,
                loanType: 'WORKING_CAPITAL', // Simplified
                installmentNumber: Math.floor(index + 1),
                principalAmount: settlement.loanDeduction * 0.7 / activeLoans.length,
                interestAmount: settlement.loanDeduction * 0.25 / activeLoans.length,
                penaltyAmount: settlement.loanDeduction * 0.05 / activeLoans.length,
                totalAmount: settlement.loanDeduction / activeLoans.length,
                outstandingBalance: loan.outstandingBalance,
            })),
        } : undefined;
        return {
            loanRepayments,
            otherDeductions: {
                chargebacks: {
                    amount: 0,
                    reason: 'No chargebacks this period',
                },
                shortages: {
                    amount: 0,
                    details: 'No shortages reported',
                },
                penalties: {
                    amount: 0,
                    description: 'No penalties applied',
                },
                adjustments: [],
            },
            totalDeductions: settlement.totalDeductions,
        };
    }
    buildSettlementSummary(settlement) {
        // Calculate tax amounts (simplified)
        const vatAmount = settlement.netPayable > 0 ? settlement.netPayable * 0.125 : 0; // 12.5% VAT
        const withholdingTax = settlement.netPayable > 0 ? settlement.netPayable * 0.075 : 0; // 7.5% WHT
        const finalNetAmount = settlement.netPayable - withholdingTax + vatAmount;
        return {
            grossMarginEarned: settlement.grossDealerMargin,
            totalDeductions: settlement.totalDeductions,
            netAmountPayable: settlement.netPayable,
            vatAmount: vatAmount > 0 ? vatAmount : undefined,
            withholdingTax: withholdingTax > 0 ? withholdingTax : undefined,
            finalNetAmount,
            paymentStatus: settlement.status,
            expectedPaymentDate: settlement.paymentDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        };
    }
    buildPaymentInstructions(dealerInfo, settlement) {
        return {
            bankDetails: {
                accountName: dealerInfo.dealerName,
                accountNumber: settlement.bankAccountDetails?.accountNumber || 'TBD',
                bankName: settlement.bankAccountDetails?.bankName || 'TBD',
                bankCode: settlement.bankAccountDetails?.bankCode || 'TBD',
                swiftCode: settlement.bankAccountDetails?.swiftCode,
            },
            paymentMethod: settlement.paymentMethod || 'Bank Transfer',
            paymentTerms: 'Payment within 3 business days of statement date',
            notes: [
                'Please quote settlement statement number in payment reference',
                'Payments are processed within 1-2 business days of receipt',
                'Contact your account manager for any payment queries',
            ],
        };
    }
    buildPerformanceMetrics(settlement, previousSettlement) {
        const currentMargin = settlement.grossDealerMargin;
        const currentVolume = settlement.totalLitresSold;
        const previousMargin = previousSettlement?.grossDealerMargin || 0;
        const previousVolume = previousSettlement?.totalLitresSold || 0;
        const marginVariance = previousMargin > 0 ? ((currentMargin - previousMargin) / previousMargin) * 100 : 0;
        const volumeVariance = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0;
        return {
            marginPerformance: {
                currentPeriod: currentMargin,
                previousPeriod: previousMargin,
                variance: marginVariance,
                trend: marginVariance > 5 ? 'IMPROVING' : marginVariance < -5 ? 'DECLINING' : 'STABLE',
            },
            volumePerformance: {
                currentPeriod: currentVolume,
                previousPeriod: previousVolume,
                variance: volumeVariance,
                trend: volumeVariance > 5 ? 'GROWING' : volumeVariance < -5 ? 'DECLINING' : 'STABLE',
            },
            paymentReliability: {
                onTimePayments: 8, // Mock data
                totalPayments: 10,
                reliability: 80,
                rating: 'GOOD',
            },
        };
    }
    buildLoanSummary(activeLoans) {
        if (activeLoans.length === 0)
            return undefined;
        const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
        const monthlyObligations = activeLoans.reduce((sum, loan) => sum + loan.installmentAmount, 0);
        const nextPaymentDues = activeLoans
            .filter(loan => loan.nextPaymentDate)
            .map(loan => loan.nextPaymentDate)
            .sort((a, b) => a.getTime() - b.getTime());
        const averageDaysOverdue = activeLoans.reduce((sum, loan) => sum + loan.daysPastDue, 0) / activeLoans.length;
        let loanPerformance = 'GOOD';
        if (averageDaysOverdue > 30)
            loanPerformance = 'POOR';
        else if (averageDaysOverdue > 7)
            loanPerformance = 'SATISFACTORY';
        return {
            activeLoans: activeLoans.length,
            totalOutstanding,
            monthlyObligations,
            nextPaymentDue: nextPaymentDues[0] || new Date(),
            loanPerformance,
        };
    }
    buildComplianceInfo(settlement) {
        return {
            regulatoryCompliance: true,
            taxCompliance: true,
            documentationComplete: true,
            issues: [],
        };
    }
    buildFooter() {
        return {
            terms: [
                'This statement is computer generated and does not require signature',
                'All amounts are in Ghana Cedis (GHS) unless otherwise stated',
                'Settlement is subject to reconciliation and adjustment',
                'Disputes must be raised within 7 days of statement date',
            ],
            signature: {
                name: 'Finance Manager',
                title: 'Settlements Department',
                date: new Date(),
            },
            generatedAt: new Date(),
            version: '2.1',
        };
    }
    // Data fetching helper methods
    async getDealerInfo(stationId, tenantId) {
        // This would integrate with dealer/station service
        return {
            dealerId: stationId,
            dealerName: `Dealer ${stationId.slice(-4)}`,
            stationName: `Station ${stationId.slice(-4)}`,
            stationAddress: 'Station Address, Ghana',
            contactPerson: 'Station Manager',
            phone: '+233 XX XXX XXXX',
            email: 'station@example.com',
        };
    }
    async getCompanyInfo(tenantId) {
        // This would get company info from configuration
        return {
            name: 'Ghana OMC Company Ltd',
            address: 'Corporate Head Office, Accra, Ghana',
            phone: '+233 30 XXX XXXX',
            email: 'info@omcghana.com',
            logo: '/assets/logo.png',
        };
    }
    async getPreviousSettlement(stationId, currentWindowId, tenantId) {
        // Get the previous settlement for comparison
        return this.settlementRepository.findOne({
            where: { stationId, tenantId },
            order: { settlementDate: 'DESC' },
            skip: 1, // Skip current settlement
        });
    }
    async getActiveLoans(stationId, tenantId) {
        return this.loanRepository.find({
            where: { stationId, tenantId, status: 'active' },
            order: { startDate: 'ASC' },
        });
    }
    // Formatting helper methods
    formatDate(date) {
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    formatCurrency(amount) {
        return `GHS ${amount.toFixed(2)}`;
    }
    formatNumber(num) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    getStatementCSS() {
        return `
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .statement-container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      
      .header { display: flex; justify-content: between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
      .company-info { display: flex; align-items: center; }
      .logo { width: 80px; height: 80px; margin-right: 20px; }
      .company-details h1 { margin: 0; color: #333; }
      .statement-title { text-align: right; }
      .statement-title h2 { margin: 0; color: #333; }
      .statement-number { font-size: 18px; font-weight: bold; color: #666; }
      
      .section { margin-bottom: 30px; }
      .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
      
      .dealer-details p, .details-grid .detail-item { margin: 5px 0; }
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .detail-item { display: flex; justify-content: between; }
      .detail-item .label { font-weight: bold; min-width: 120px; }
      
      .summary-stats, .margin-stats, .loan-stats { display: flex; justify-content: space-around; margin: 20px 0; }
      .stat { text-align: center; }
      .stat-value { display: block; font-size: 24px; font-weight: bold; color: #2c5282; }
      .stat-label { display: block; font-size: 12px; color: #666; margin-top: 5px; }
      
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f8f9fa; font-weight: bold; }
      .total-row, .final-amount { background-color: #f0f8ff; font-weight: bold; }
      .dealer-margin-row { background-color: #e8f5e8; }
      
      .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .metric-card h4 { margin: 0 0 10px 0; color: #333; }
      .trend.improving, .trend.growing { color: #22c55e; }
      .trend.declining { color: #ef4444; }
      .trend.stable { color: #6b7280; }
      
      .payment-status { margin-top: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
      
      .bank-details, .payment-terms { margin: 15px 0; }
      .bank-details h4 { margin: 0 0 10px 0; }
      .notes p { margin: 5px 0; }
      
      .footer { margin-top: 40px; border-top: 2px solid #333; padding-top: 20px; }
      .footer .terms h4 { margin: 0 0 10px 0; }
      .footer .terms p { margin: 3px 0; font-size: 12px; }
      .signature { text-align: right; margin: 20px 0; }
      .signature-line { border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 10px; }
      .generated-info { text-align: center; font-size: 10px; color: #666; margin-top: 20px; }
      
      @media print {
        body { padding: 0; background: white; }
        .statement-container { box-shadow: none; }
      }
    `;
    }
};
exports.DealerSettlementStatementService = DealerSettlementStatementService;
exports.DealerSettlementStatementService = DealerSettlementStatementService = DealerSettlementStatementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dealer_settlement_entity_1.DealerSettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(dealer_loan_entity_1.DealerLoan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], DealerSettlementStatementService);
//# sourceMappingURL=dealer-settlement-statement.service.js.map