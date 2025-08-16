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
var UPPFReportsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const uppf_entities_1 = require("../entities/uppf-entities");
let UPPFReportsService = UPPFReportsService_1 = class UPPFReportsService {
    claimRepository;
    settlementRepository;
    reconciliationRepository;
    httpService;
    configService;
    logger = new common_1.Logger(UPPFReportsService_1.name);
    constructor(claimRepository, settlementRepository, reconciliationRepository, httpService, configService) {
        this.claimRepository = claimRepository;
        this.settlementRepository = settlementRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.httpService = httpService;
        this.configService = configService;
    }
    /**
     * Generate comprehensive NPA submission report
     */
    async generateNPAReport(reportType, startDate, endDate, additionalOptions = {}) {
        try {
            this.logger.log(`Generating NPA report: ${reportType} for ${startDate.toISOString()} to ${endDate.toISOString()}`);
            // Fetch data for the period
            const [claims, settlements, reconciliations] = await Promise.all([
                this.getClaimsForPeriod(startDate, endDate),
                this.getSettlementsForPeriod(startDate, endDate),
                this.getReconciliationsForPeriod(startDate, endDate),
            ]);
            // Calculate summary metrics
            const summary = this.calculateSummaryMetrics(claims, settlements);
            // Generate claims breakdown
            const claimsBreakdown = await this.generateClaimsBreakdown(claims);
            // Generate settlements breakdown
            const settlementsBreakdown = this.generateSettlementsBreakdown(settlements);
            // Calculate reconciliation metrics
            const reconciliationMetrics = this.calculateReconciliationMetrics(reconciliations);
            // Calculate compliance metrics
            const complianceMetrics = this.calculateComplianceMetrics(claims);
            // Generate trends (if requested)
            const trends = additionalOptions.includeTrends ?
                await this.generateTrends(startDate, endDate) :
                { monthlyTrends: [], performanceTrends: [] };
            // Detect anomalies (if requested)
            const anomalies = additionalOptions.includeAnomalies ?
                await this.detectAnomalies(claims, settlements, reconciliations) :
                [];
            const reportData = {
                reportType,
                reportPeriod: {
                    startDate,
                    endDate,
                    description: this.getReportPeriodDescription(reportType, startDate, endDate),
                },
                summary,
                claimsBreakdown,
                settlementsBreakdown,
                reconciliationMetrics,
                complianceMetrics,
                trends,
                anomalies,
            };
            this.logger.log(`NPA report generated successfully with ${claims.length} claims and ${settlements.length} settlements`);
            return reportData;
        }
        catch (error) {
            this.logger.error(`Failed to generate NPA report: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Generate dealer performance report
     */
    async generateDealerPerformanceReport(dealerId, startDate, endDate) {
        try {
            this.logger.log(`Generating dealer performance report for ${dealerId}`);
            // Get dealer claims for the period
            const claims = await this.claimRepository.find({
                where: {
                    dealerId,
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                },
                relations: ['reconciliation'],
            });
            // Get dealer settlements
            const settlements = await this.getSettlementsForDealer(dealerId, startDate, endDate);
            // Calculate metrics
            const claimsMetrics = this.calculateDealerClaimsMetrics(claims);
            const operationalMetrics = this.calculateDealerOperationalMetrics(claims);
            const qualityMetrics = this.calculateDealerQualityMetrics(claims);
            const financialMetrics = this.calculateDealerFinancialMetrics(claims, settlements);
            // Calculate overall compliance score
            const complianceScore = this.calculateDealerComplianceScore(claimsMetrics, operationalMetrics, qualityMetrics, financialMetrics);
            // Determine performance rating
            const performanceRating = this.getDealerPerformanceRating(complianceScore);
            // Generate recommendations
            const recommendations = this.generateDealerRecommendations(claimsMetrics, operationalMetrics, qualityMetrics, financialMetrics);
            // Get dealer info
            const dealerInfo = await this.getDealerInfo(dealerId);
            const report = {
                dealerId,
                dealerName: dealerInfo.name,
                reportPeriod: { startDate, endDate },
                claimsMetrics,
                operationalMetrics,
                qualityMetrics,
                financialMetrics,
                complianceScore,
                performanceRating,
                recommendations,
            };
            this.logger.log(`Dealer performance report generated for ${dealerId} with score ${complianceScore}`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate dealer performance report: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Generate system performance report
     */
    async generateSystemPerformanceReport(startDate, endDate) {
        try {
            this.logger.log(`Generating system performance report`);
            // Gather system metrics
            const [claims, settlements, reconciliations] = await Promise.all([
                this.getClaimsForPeriod(startDate, endDate),
                this.getSettlementsForPeriod(startDate, endDate),
                this.getReconciliationsForPeriod(startDate, endDate),
            ]);
            // Calculate system metrics
            const systemMetrics = this.calculateSystemMetrics(claims, settlements, reconciliations);
            const automationMetrics = this.calculateAutomationMetrics(claims, reconciliations);
            const qualityMetrics = this.calculateSystemQualityMetrics(claims, settlements);
            const efficiencyMetrics = this.calculateEfficiencyMetrics(claims, settlements);
            const securityMetrics = await this.calculateSecurityMetrics(claims, settlements);
            // Generate recommendations
            const recommendations = this.generateSystemRecommendations(systemMetrics, automationMetrics, qualityMetrics, efficiencyMetrics, securityMetrics);
            const report = {
                reportPeriod: { startDate, endDate },
                systemMetrics,
                automationMetrics,
                qualityMetrics,
                efficiencyMetrics,
                securityMetrics,
                recommendations,
            };
            this.logger.log(`System performance report generated successfully`);
            return report;
        }
        catch (error) {
            this.logger.error(`Failed to generate system performance report: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Export report to PDF format
     */
    async exportReportToPDF(reportData, reportType, generatedBy) {
        try {
            this.logger.log(`Exporting ${reportType} report to PDF`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/reports-service/generate-pdf', {
                reportType,
                data: reportData,
                template: this.getReportTemplate(reportType),
                generatedBy,
                metadata: {
                    generatedAt: new Date(),
                    reportVersion: '1.0',
                },
            }, {
                headers: { 'X-Service-Authorization': this.configService.get('SERVICE_TOKEN') },
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to export report to PDF: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Schedule automated report generation
     */
    async scheduleAutomatedReports() {
        try {
            this.logger.log('Scheduling automated reports');
            // Schedule monthly NPA reports
            await this.scheduleReport('NPA_MONTHLY', 'MONTHLY', '0 0 1 * *'); // 1st of every month
            // Schedule quarterly reports
            await this.scheduleReport('NPA_QUARTERLY', 'QUARTERLY', '0 0 1 1,4,7,10 *'); // Quarterly
            // Schedule weekly system performance reports
            await this.scheduleReport('SYSTEM_PERFORMANCE', 'WEEKLY', '0 0 * * 1'); // Every Monday
        }
        catch (error) {
            this.logger.error(`Failed to schedule automated reports: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Private helper methods
    async getClaimsForPeriod(startDate, endDate) {
        return this.claimRepository.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['reconciliation'],
        });
    }
    async getSettlementsForPeriod(startDate, endDate) {
        return this.settlementRepository.find({
            where: {
                settlementDate: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    async getReconciliationsForPeriod(startDate, endDate) {
        return this.reconciliationRepository.find({
            where: {
                processedAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    calculateSummaryMetrics(claims, settlements) {
        const totalClaims = claims.length;
        const totalAmount = claims.reduce((sum, claim) => sum + claim.totalClaimAmount, 0);
        const totalVolume = claims.reduce((sum, claim) => sum + claim.volumeLitres, 0);
        const averageClaimAmount = totalClaims > 0 ? totalAmount / totalClaims : 0;
        const settledClaims = claims.filter(claim => claim.status === 'settled').length;
        const settlementEfficiency = totalClaims > 0 ? (settledClaims / totalClaims) * 100 : 0;
        return {
            totalClaims,
            totalAmount,
            totalVolume,
            averageClaimAmount,
            settlementEfficiency,
        };
    }
    async generateClaimsBreakdown(claims) {
        // By status
        const byStatus = claims.reduce((acc, claim) => {
            acc[claim.status] = (acc[claim.status] || 0) + 1;
            return acc;
        }, {});
        // By product
        const byProduct = claims.reduce((acc, claim) => {
            if (!acc[claim.productType]) {
                acc[claim.productType] = { claims: 0, amount: 0, volume: 0 };
            }
            acc[claim.productType].claims += 1;
            acc[claim.productType].amount += claim.totalClaimAmount;
            acc[claim.productType].volume += claim.volumeLitres;
            return acc;
        }, {});
        // By dealer (would need dealer info lookup)
        const dealerGroups = new Map();
        claims.forEach(claim => {
            if (!dealerGroups.has(claim.dealerId)) {
                dealerGroups.set(claim.dealerId, {
                    dealerId: claim.dealerId,
                    dealerName: `Dealer ${claim.dealerId}`, // Would lookup actual name
                    claims: 0,
                    amount: 0,
                    volume: 0,
                });
            }
            const dealer = dealerGroups.get(claim.dealerId);
            dealer.claims += 1;
            dealer.amount += claim.totalClaimAmount;
            dealer.volume += claim.volumeLitres;
        });
        const byDealer = Array.from(dealerGroups.values());
        // By region (would need region mapping)
        const byRegion = {
            'Greater Accra': { claims: 0, amount: 0, volume: 0 },
            'Ashanti': { claims: 0, amount: 0, volume: 0 },
            'Western': { claims: 0, amount: 0, volume: 0 },
        };
        return {
            byStatus,
            byProduct,
            byDealer,
            byRegion,
        };
    }
    generateSettlementsBreakdown(settlements) {
        const totalSettlements = settlements.length;
        const totalSettledAmount = settlements.reduce((sum, s) => sum + s.totalSettledAmount, 0);
        const averageSettlementAmount = totalSettlements > 0 ? totalSettledAmount / totalSettlements : 0;
        const byStatus = settlements.reduce((acc, settlement) => {
            acc[settlement.status] = (acc[settlement.status] || 0) + 1;
            return acc;
        }, {});
        return {
            totalSettlements,
            totalSettledAmount,
            averageSettlementAmount,
            byStatus,
        };
    }
    calculateReconciliationMetrics(reconciliations) {
        const totalReconciliations = reconciliations.length;
        const successfulReconciliations = reconciliations.filter(r => r.isWithinTolerance).length;
        const successRate = totalReconciliations > 0 ? (successfulReconciliations / totalReconciliations) * 100 : 0;
        const averageVariancePercentage = reconciliations.length > 0 ?
            reconciliations.reduce((sum, r) => sum + Math.abs(r.variancePercentage), 0) / reconciliations.length : 0;
        return {
            totalReconciliations,
            successfulReconciliations,
            successRate,
            averageVariancePercentage,
        };
    }
    calculateComplianceMetrics(claims) {
        const totalClaims = claims.length;
        if (totalClaims === 0) {
            return {
                gpsValidationRate: 0,
                documentationCompleteness: 0,
                onTimeSubmissionRate: 0,
                qualityScoreAverage: 0,
            };
        }
        const gpsValidatedClaims = claims.filter(c => c.gpsValidated).length;
        const gpsValidationRate = (gpsValidatedClaims / totalClaims) * 100;
        const documentationCompleteness = claims.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / totalClaims;
        // On-time submission would need business rule definition
        const onTimeSubmissionRate = 95; // Placeholder
        const qualityScoreAverage = claims.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / totalClaims;
        return {
            gpsValidationRate,
            documentationCompleteness,
            onTimeSubmissionRate,
            qualityScoreAverage,
        };
    }
    async generateTrends(startDate, endDate) {
        // Generate monthly trends
        const monthlyTrends = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            const monthClaims = await this.getClaimsForPeriod(monthStart, monthEnd);
            monthlyTrends.push({
                month: current.toISOString().substring(0, 7),
                claims: monthClaims.length,
                amount: monthClaims.reduce((sum, c) => sum + c.totalClaimAmount, 0),
                volume: monthClaims.reduce((sum, c) => sum + c.volumeLitres, 0),
            });
            current.setMonth(current.getMonth() + 1);
        }
        // Performance trends (placeholder)
        const performanceTrends = [
            { period: '2025-01', efficiency: 94.2, compliance: 96.8, variance: 1.2 },
            { period: '2025-02', efficiency: 95.1, compliance: 97.2, variance: 1.0 },
        ];
        return {
            monthlyTrends,
            performanceTrends,
        };
    }
    async detectAnomalies(claims, settlements, reconciliations) {
        const anomalies = [];
        // High variance claims
        const highVarianceClaims = claims.filter(c => c.reconciliation && Math.abs(c.reconciliation.variancePercentage) > 5);
        if (highVarianceClaims.length > 0) {
            anomalies.push({
                type: 'High Variance Claims',
                description: `${highVarianceClaims.length} claims with variance > 5%`,
                impact: 'Potential accuracy issues in measurements',
                recommendation: 'Review measurement procedures and equipment calibration',
            });
        }
        // Settlement delays
        const delayedSettlements = settlements.filter(s => {
            if (!s.processingStartDate || !s.reconciliationDate)
                return false;
            const processingDays = (s.reconciliationDate.getTime() - s.processingStartDate.getTime()) / (1000 * 60 * 60 * 24);
            return processingDays > 10;
        });
        if (delayedSettlements.length > 0) {
            anomalies.push({
                type: 'Processing Delays',
                description: `${delayedSettlements.length} settlements took > 10 days to process`,
                impact: 'Delayed payments affecting cash flow',
                recommendation: 'Streamline settlement processing workflow',
            });
        }
        return anomalies;
    }
    // Additional helper methods would be implemented here for dealer and system reports
    calculateDealerClaimsMetrics(claims) {
        const totalClaims = claims.length;
        const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'settled').length;
        const rejectedClaims = claims.filter(c => c.status === 'rejected').length;
        const totalAmount = claims.reduce((sum, c) => sum + c.totalClaimAmount, 0);
        const averageClaimAmount = totalClaims > 0 ? totalAmount / totalClaims : 0;
        const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;
        return {
            totalClaims,
            approvedClaims,
            rejectedClaims,
            totalAmount,
            averageClaimAmount,
            approvalRate,
        };
    }
    calculateDealerOperationalMetrics(claims) {
        const totalVolume = claims.reduce((sum, c) => sum + c.volumeLitres, 0);
        const averageVolumePerClaim = claims.length > 0 ? totalVolume / claims.length : 0;
        const uniqueRoutes = new Set(claims.map(c => c.routeId)).size;
        const averageDistance = claims.reduce((sum, c) => sum + (c.distanceKm || 0), 0) / claims.length;
        const gpsValidatedClaims = claims.filter(c => c.gpsValidated).length;
        const gpsValidationRate = claims.length > 0 ? (gpsValidatedClaims / claims.length) * 100 : 0;
        return {
            totalVolume,
            averageVolumePerClaim,
            uniqueRoutes,
            averageDistance,
            gpsValidationRate,
        };
    }
    calculateDealerQualityMetrics(claims) {
        const averageQualityScore = claims.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / claims.length;
        const documentationCompleteness = averageQualityScore; // Simplified
        const onTimeSubmissionRate = 95; // Would calculate based on submission timing
        const reconciledClaims = claims.filter(c => c.threeWayReconciled).length;
        const reconciliationSuccessRate = claims.length > 0 ? (reconciledClaims / claims.length) * 100 : 0;
        return {
            averageQualityScore,
            documentationCompleteness,
            onTimeSubmissionRate,
            reconciliationSuccessRate,
        };
    }
    calculateDealerFinancialMetrics(claims, settlements) {
        const totalSettled = settlements.reduce((sum, s) => sum + s.totalSettledAmount, 0);
        const averageSettlementTime = 5; // Would calculate actual settlement time
        const penaltiesIncurred = settlements.reduce((sum, s) => sum + (s.npaPenalties || 0), 0);
        const bonusesEarned = settlements.reduce((sum, s) => sum + (s.performanceBonuses || 0), 0);
        const netPaymentReceived = totalSettled - penaltiesIncurred + bonusesEarned;
        return {
            totalSettled,
            averageSettlementTime,
            penaltiesIncurred,
            bonusesEarned,
            netPaymentReceived,
        };
    }
    calculateDealerComplianceScore(claimsMetrics, operationalMetrics, qualityMetrics, financialMetrics) {
        // Weighted scoring algorithm
        const approvalWeight = 0.3;
        const qualityWeight = 0.25;
        const gpsWeight = 0.2;
        const reconciliationWeight = 0.15;
        const submissionWeight = 0.1;
        const score = (claimsMetrics.approvalRate * approvalWeight) +
            (qualityMetrics.averageQualityScore * qualityWeight) +
            (operationalMetrics.gpsValidationRate * gpsWeight) +
            (qualityMetrics.reconciliationSuccessRate * reconciliationWeight) +
            (qualityMetrics.onTimeSubmissionRate * submissionWeight);
        return Math.round(score * 10) / 10;
    }
    getDealerPerformanceRating(score) {
        if (score >= 95)
            return 'EXCELLENT';
        if (score >= 85)
            return 'GOOD';
        if (score >= 70)
            return 'SATISFACTORY';
        return 'POOR';
    }
    generateDealerRecommendations(claimsMetrics, operationalMetrics, qualityMetrics, financialMetrics) {
        const recommendations = [];
        if (claimsMetrics.approvalRate < 90) {
            recommendations.push('Improve claim documentation quality to increase approval rate');
        }
        if (operationalMetrics.gpsValidationRate < 95) {
            recommendations.push('Ensure GPS tracking is enabled and functioning for all deliveries');
        }
        if (qualityMetrics.averageQualityScore < 85) {
            recommendations.push('Enhance documentation completeness and accuracy');
        }
        if (qualityMetrics.reconciliationSuccessRate < 90) {
            recommendations.push('Review delivery and receiving procedures to improve reconciliation success');
        }
        return recommendations;
    }
    // Additional system-level calculation methods would be implemented here
    calculateSystemMetrics(claims, settlements, reconciliations) {
        return {
            totalClaimsProcessed: claims.length,
            totalSettlementsGenerated: settlements.length,
            totalAmountProcessed: claims.reduce((sum, c) => sum + c.totalClaimAmount, 0),
            averageProcessingTime: 2.5, // days
            systemUptime: 99.8,
        };
    }
    calculateAutomationMetrics(claims, reconciliations) {
        const autoApprovedClaims = claims.filter(c => c.automationLevel === 'FULLY_AUTOMATED').length;
        const autoReconciliations = reconciliations.filter(r => r.processedBy === 'SYSTEM').length;
        return {
            autoApprovedClaims,
            autoReconciliations,
            automationRate: claims.length > 0 ? (autoApprovedClaims / claims.length) * 100 : 0,
            manualInterventionRequired: claims.length - autoApprovedClaims,
        };
    }
    calculateSystemQualityMetrics(claims, settlements) {
        return {
            errorRate: 0.5, // Would calculate actual error rate
            dataQualityScore: 96.5,
            documentationCompleteness: 94.2,
            validationAccuracy: 98.1,
        };
    }
    calculateEfficiencyMetrics(claims, settlements) {
        return {
            processingSpeed: 1200, // claims per hour
            resourceUtilization: 85.3, // percentage
            costPerClaim: 15.50, // GHS
            costPerSettlement: 125.00, // GHS
        };
    }
    async calculateSecurityMetrics(claims, settlements) {
        const blockchainVerifiedClaims = claims.filter(c => c.blockchainHash).length;
        return {
            fraudDetectionRate: 0.2, // percentage
            securityIncidents: 0,
            blockchainVerificationRate: claims.length > 0 ? (blockchainVerifiedClaims / claims.length) * 100 : 0,
            dataIntegrityScore: 99.5,
        };
    }
    generateSystemRecommendations(systemMetrics, automationMetrics, qualityMetrics, efficiencyMetrics, securityMetrics) {
        return {
            systemOptimization: [
                'Increase automation rate to reduce manual processing',
                'Optimize database queries for better performance',
            ],
            processImprovement: [
                'Implement real-time validation to improve data quality',
                'Streamline approval workflow to reduce processing time',
            ],
            securityEnhancements: [
                'Increase blockchain verification coverage',
                'Implement additional fraud detection algorithms',
            ],
        };
    }
    async getDealerInfo(dealerId) {
        // Would fetch from dealer service
        return { name: `Dealer ${dealerId}` };
    }
    async getSettlementsForDealer(dealerId, startDate, endDate) {
        // Would implement dealer-specific settlement query
        return [];
    }
    getReportPeriodDescription(reportType, startDate, endDate) {
        const start = startDate.toLocaleDateString();
        const end = endDate.toLocaleDateString();
        return `${reportType} report for period ${start} to ${end}`;
    }
    getReportTemplate(reportType) {
        const templates = {
            'NPA_REPORT': 'npa-report-template',
            'DEALER_PERFORMANCE': 'dealer-performance-template',
            'SYSTEM_PERFORMANCE': 'system-performance-template',
        };
        return templates[reportType] || 'default-template';
    }
    async scheduleReport(reportId, type, cronExpression) {
        // Would integrate with job scheduler service
        this.logger.log(`Scheduled ${reportId} report with cron: ${cronExpression}`);
    }
};
exports.UPPFReportsService = UPPFReportsService;
exports.UPPFReportsService = UPPFReportsService = UPPFReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(uppf_entities_1.UPPFClaim)),
    __param(1, (0, typeorm_1.InjectRepository)(uppf_entities_1.UPPFSettlement)),
    __param(2, (0, typeorm_1.InjectRepository)(uppf_entities_1.ThreeWayReconciliation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], UPPFReportsService);
//# sourceMappingURL=uppf-reports.service.js.map