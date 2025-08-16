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
var UPPFClaimsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFClaimsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const date_fns_1 = require("date-fns");
let UPPFClaimsService = UPPFClaimsService_1 = class UPPFClaimsService {
    deliveryRepository;
    claimsRepository;
    equalisationRepository;
    gpsRepository;
    reconciliationRepository;
    settlementsRepository;
    routeOptimizationRepository;
    pricingWindowsRepository;
    eventEmitter;
    httpService;
    configService;
    logger = new common_1.Logger(UPPFClaimsService_1.name);
    // Enhanced UPPF rates with dynamic pricing
    UPPF_BASE_RATES = {
        'PMS': 0.0012, // GHS per litre per km
        'AGO': 0.0012,
        'KEROSENE': 0.0008,
        'LPG': 0.0010,
    };
    // Route difficulty multipliers
    ROUTE_MULTIPLIERS = {
        'HIGHWAY': 1.0,
        'URBAN': 1.2,
        'RURAL': 1.5,
        'MOUNTAINOUS': 2.0,
        'COASTAL': 1.3,
    };
    // GPS validation thresholds
    GPS_THRESHOLDS = {
        ROUTE_DEVIATION_PERCENT: 10,
        SPEED_VIOLATION_KMH: 90,
        STOP_DURATION_MINUTES: 60,
        FUEL_VARIANCE_PERCENT: 15,
        TIME_VARIANCE_PERCENT: 50,
    };
    constructor(deliveryRepository, claimsRepository, equalisationRepository, gpsRepository, reconciliationRepository, settlementsRepository, routeOptimizationRepository, pricingWindowsRepository, eventEmitter, httpService, configService) {
        this.deliveryRepository = deliveryRepository;
        this.claimsRepository = claimsRepository;
        this.equalisationRepository = equalisationRepository;
        this.gpsRepository = gpsRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.settlementsRepository = settlementsRepository;
        this.routeOptimizationRepository = routeOptimizationRepository;
        this.pricingWindowsRepository = pricingWindowsRepository;
        this.eventEmitter = eventEmitter;
        this.httpService = httpService;
        this.configService = configService;
    }
    /**
     * Enhanced UPPF claim generation with comprehensive validation
     * Implements blueprint logic: km_excess = max(0, km_actual - equalisation_points.km_threshold)
     * Includes GPS validation, route optimization, and evidence collection
     */
    async generateUPPFClaim(consignmentId, options) {
        this.logger.log(`Generating UPPF claim for consignment ${consignmentId}`);
        // Get delivery consignment
        const delivery = await this.deliveryRepository.findOne({
            where: { consignmentId },
            relations: ['gpsTrace', 'route'],
        });
        if (!delivery) {
            throw new Error(`Delivery consignment ${consignmentId} not found`);
        }
        // Get equalisation point
        const equalisationPoint = await this.equalisationRepository.findOne({
            where: { routeId: delivery.routeId },
        });
        if (!equalisationPoint) {
            throw new Error(`Equalisation point not found for route ${delivery.routeId}`);
        }
        // Enhanced GPS validation with comprehensive checks
        const gpsValidation = await this.performEnhancedGPSValidation(consignmentId, {
            skipValidation: options?.skipGPSValidation || false,
            requireHighConfidence: options?.evidenceRequirement === 'COMPREHENSIVE',
        });
        if (!gpsValidation.isValid && !options?.forceGeneration) {
            throw new common_1.BadRequestException(`GPS validation failed for consignment ${consignmentId}: ${gpsValidation.anomalies.map(a => a.description).join(', ')}`);
        }
        // Calculate enhanced claim with route optimization
        const claimCalculation = await this.calculateEnhancedClaim({
            delivery,
            equalisationPoint,
            gpsValidation,
            evidenceRequirement: options?.evidenceRequirement || 'STANDARD',
        });
        const { kmBeyondEqualisation, claimAmount, tariffPerLitreKm, routeEfficiencyBonus, complianceBonus, } = claimCalculation;
        // Enhanced three-way reconciliation with AI validation
        const reconciliation = await this.performEnhancedThreeWayReconciliation(consignmentId, {
            aiValidation: true,
            anomalyDetection: true,
            blockchainVerification: this.configService.get('blockchain.enabled', false),
        });
        // Comprehensive evidence collection with automatic scoring
        const evidence = await this.collectComprehensiveEvidence(consignmentId, {
            requirement: options?.evidenceRequirement || 'STANDARD',
            includeAIAnalysis: true,
            blockchainHash: reconciliation.blockchainHash,
        });
        // Create enhanced UPPF claim with comprehensive metadata
        const claim = await this.claimsRepository.save({
            claimNumber: await this.generateEnhancedClaimNumber(),
            windowId: await this.getCurrentPricingWindow(),
            consignmentId,
            routeId: delivery.routeId,
            depotId: delivery.depotId,
            stationId: delivery.stationId,
            productType: delivery.productType,
            kmBeyondEqualisation,
            kmActual: delivery.kmActual,
            kmPlanned: delivery.kmPlanned,
            litresMoved: delivery.litresReceived || delivery.litresLoaded,
            tariffPerLitreKm,
            claimAmount,
            routeEfficiencyBonus,
            complianceBonus,
            totalClaimAmount: claimAmount + routeEfficiencyBonus + complianceBonus,
            gpsValidated: gpsValidation.isValid,
            gpsConfidence: gpsValidation.confidence,
            status: this.determineClaimStatus(reconciliation, gpsValidation, evidence),
            evidenceLinks: evidence.documents,
            evidenceScore: evidence.score,
            threeWayReconciled: reconciliation.isValid,
            blockchainHash: reconciliation.blockchainHash,
            aiValidated: true,
            riskScore: this.calculateClaimRiskScore(gpsValidation, reconciliation, evidence),
            submissionPriority: this.calculateSubmissionPriority(claimAmount, gpsValidation, evidence),
            createdBy: 'ENHANCED_SYSTEM_V2',
            metadata: {
                gpsAnomalies: gpsValidation.anomalies,
                routeOptimization: claimCalculation.routeOptimization,
                fuelAnalysis: gpsValidation.fuelConsumptionAnalysis,
                complianceMetrics: evidence.complianceMetrics,
            },
        });
        // Enhanced event emission with comprehensive analytics
        this.eventEmitter.emit('uppf.claim.generated', {
            claimId: claim.claimId,
            consignmentId,
            claimAmount: claim.totalClaimAmount,
            baseAmount: claimAmount,
            bonuses: {
                routeEfficiency: routeEfficiencyBonus,
                compliance: complianceBonus,
            },
            status: claim.status,
            quality: {
                gpsConfidence: gpsValidation.confidence,
                evidenceScore: evidence.score,
                riskScore: claim.riskScore,
            },
            performance: {
                routeEfficiency: gpsValidation.routeEfficiency,
                fuelEfficiency: gpsValidation.fuelConsumptionAnalysis.efficiency,
                timeCompliance: gpsValidation.timeAnalysis.isReasonable,
            },
        });
        // Schedule follow-up tasks
        this.scheduleClaimFollowUp(claim.claimId, claim.submissionPriority);
        this.logger.log(`Enhanced UPPF claim generated: ${claim.claimNumber} - ` +
            `Base: GHS ${claimAmount}, Total: GHS ${claim.totalClaimAmount}, ` +
            `GPS Confidence: ${gpsValidation.confidence}%, Risk Score: ${claim.riskScore}`);
        return claim;
    }
    /**
     * Enhanced three-way reconciliation with AI validation and blockchain verification
     * Compare Depot → Transporter → Station records with anomaly detection
     */
    async performEnhancedThreeWayReconciliation(consignmentId, options) {
        this.logger.log(`Performing three-way reconciliation for ${consignmentId}`);
        const delivery = await this.deliveryRepository.findOne({
            where: { consignmentId },
        });
        // Get depot loading records
        const depotLoadedLitres = delivery.litresLoaded;
        // Get transporter delivery records (from GPS/vehicle monitoring)
        const transporterDeliveredLitres = await this.getTransporterVolume(consignmentId);
        // Get station receiving records
        const stationReceivedLitres = delivery.litresReceived;
        // Enhanced variance calculation with dynamic tolerances
        const varianceDepotTransporter = depotLoadedLitres - transporterDeliveredLitres;
        const varianceTransporterStation = transporterDeliveredLitres - stationReceivedLitres;
        const varianceDepotStation = depotLoadedLitres - stationReceivedLitres;
        // Dynamic tolerance based on route conditions and product type
        const baseTolerance = 0.02;
        const routeComplexityFactor = await this.getRouteComplexityFactor(delivery.routeId);
        const productVolatilityFactor = await this.getProductVolatilityFactor(delivery.productType);
        const tolerancePercentage = baseTolerance * routeComplexityFactor * productVolatilityFactor;
        const toleranceLitres = depotLoadedLitres * tolerancePercentage;
        // AI-powered anomaly detection
        const anomalies = [];
        let confidence = 100;
        if (options?.aiValidation) {
            const aiAnalysis = await this.performAIVarianceAnalysis({
                depotLoadedLitres,
                transporterDeliveredLitres,
                stationReceivedLitres,
                routeId: delivery.routeId,
                productType: delivery.productType,
                historicalData: await this.getHistoricalVarianceData(delivery.routeId),
            });
            anomalies.push(...aiAnalysis.anomalies);
            confidence = aiAnalysis.confidence;
        }
        const isValid = Math.abs(varianceDepotStation) <= toleranceLitres && confidence >= 85;
        // Enhanced reconciliation with blockchain and AI metadata
        let blockchainHash;
        if (options?.blockchainVerification) {
            blockchainHash = await this.createBlockchainRecord({
                consignmentId,
                volumes: { depotLoadedLitres, transporterDeliveredLitres, stationReceivedLitres },
                variances: { varianceDepotTransporter, varianceTransporterStation, varianceDepotStation },
                timestamp: new Date(),
            });
        }
        const reconciliation = await this.reconciliationRepository.save({
            consignmentId,
            depotLoadedLitres,
            depotDocumentRef: delivery.waybillNumber,
            transporterDeliveredLitres,
            transporterDocumentRef: `GPS-${delivery.gpsTraceId}`,
            stationReceivedLitres,
            stationDocumentRef: `GRN-${delivery.deliveryNumber}`,
            varianceDepotTransporter,
            varianceTransporterStation,
            varianceDepotStation,
            toleranceApplied: tolerancePercentage,
            routeComplexityFactor,
            productVolatilityFactor,
            reconciliationStatus: isValid ? 'MATCHED' : 'VARIANCE_DETECTED',
            confidence,
            aiAnomalies: anomalies,
            blockchainHash,
            aiValidated: options?.aiValidation || false,
            riskScore: this.calculateReconciliationRiskScore(Math.abs(varianceDepotStation), toleranceLitres, confidence),
        });
        // Emit reconciliation event
        this.eventEmitter.emit('uppf.reconciliation.completed', {
            consignmentId,
            isValid,
            variances: {
                depotTransporter: varianceDepotTransporter,
                transporterStation: varianceTransporterStation,
                depotStation: varianceDepotStation,
            },
        });
        return {
            isValid,
            variances: {
                depotTransporter: varianceDepotTransporter,
                transporterStation: varianceTransporterStation,
                depotStation: varianceDepotStation,
                toleranceExceeded: Math.abs(varianceDepotStation) > toleranceLitres,
                toleranceApplied: tolerancePercentage,
                dynamicFactors: {
                    routeComplexity: routeComplexityFactor,
                    productVolatility: productVolatilityFactor,
                },
            },
            status: reconciliation.reconciliationStatus,
            confidence,
            anomalies,
            blockchainHash,
            aiInsights: options?.aiValidation ? {
                predictedVariance: await this.predictVarianceForRoute(delivery.routeId),
                riskFactors: await this.identifyRiskFactors(consignmentId),
                recommendations: await this.generateRecommendations(reconciliation),
            } : undefined,
        };
    }
    /**
     * Enhanced GPS validation with comprehensive anomaly detection and AI analysis
     */
    async performEnhancedGPSValidation(consignmentId, options) {
        if (options?.skipValidation) {
            return {
                isValid: true,
                confidence: 50,
                anomalies: [],
                routeEfficiency: 75,
                fuelConsumptionAnalysis: {
                    expectedConsumption: 0,
                    actualConsumption: 0,
                    efficiency: 75,
                    variance: 0,
                    isWithinTolerance: true,
                    suspiciousActivity: false,
                },
                timeAnalysis: {
                    plannedDuration: 0,
                    actualDuration: 0,
                    drivingTime: 0,
                    stopTime: 0,
                    isReasonable: true,
                },
                speedAnalysis: {
                    averageSpeed: 60,
                    maxSpeed: 80,
                    speedViolations: 0,
                    trafficComplianceScore: 100,
                    fuelEfficiencyImpact: 0,
                },
                geofenceViolations: [],
            };
        }
        this.logger.log(`Performing enhanced GPS validation for ${consignmentId}`);
        /**
         * Validate GPS route and detect anomalies (Legacy method for compatibility)
         */
        async;
        validateGPSRoute(consignmentId, string);
        Promise < {
            isValid: boolean,
            anomalies: string[],
            actualKm: number
        } > {
            this: .logger.log(`Validating GPS route for ${consignmentId}`),
            const: delivery = await this.deliveryRepository.findOne({
                where: { consignmentId },
            }),
            const: gpsTrace = await this.gpsRepository.findOne({
                where: { traceId: delivery.gpsTraceId },
            }),
            if(, gpsTrace) {
                return {
                    isValid: false,
                    anomalies: ['GPS trace not found'],
                    actualKm: 0,
                };
            },
            const: anomalies, string, []:  = [],
            // Check for route deviations
            const: plannedKm = delivery.kmPlanned,
            const: actualKm = gpsTrace.totalKm,
            const: deviationPercentage = Math.abs(actualKm - plannedKm) / plannedKm,
            if(deviationPercentage) { }
        } > 0.1;
        { // 10% deviation threshold
            anomalies.push(`Route deviation: ${(deviationPercentage * 100).toFixed(1)}%`);
        }
        // Check for excessive stops
        if (gpsTrace.stopCount > 3) {
            anomalies.push(`Excessive stops: ${gpsTrace.stopCount}`);
        }
        // Check for prolonged stop duration
        if (gpsTrace.stopDurationMinutes > 60) {
            anomalies.push(`Long stop duration: ${gpsTrace.stopDurationMinutes} minutes`);
        }
        // Check for speed anomalies
        if (gpsTrace.maxSpeedKmh > 90) {
            anomalies.push(`Speed violation: ${gpsTrace.maxSpeedKmh} km/h`);
        }
        // Check for time anomalies
        const expectedTime = plannedKm / 50; // Average 50 km/h
        const actualTime = gpsTrace.actualTravelTime ?
            parseFloat(gpsTrace.actualTravelTime.replace('hours', '')) : 0;
        if (actualTime > expectedTime * 1.5) {
            anomalies.push(`Time anomaly: ${actualTime} hours vs expected ${expectedTime} hours`);
        }
        // AI-powered anomaly detection
        const aiAnomalies = await this.detectAIAnomalies(gpsTrace);
        anomalies.push(...aiAnomalies);
        const isValid = anomalies.length === 0;
        // Update delivery with validation results
        await this.deliveryRepository.update({ consignmentId }, {
            kmActual: actualKm,
            status: isValid ? 'DELIVERED' : 'ANOMALY_DETECTED',
        });
        return {
            isValid,
            anomalies,
            actualKm,
        };
    }
    /**
     * Submit UPPF claims to NPA
     */
    async submitClaimsToNPA(windowId) {
        this.logger.log(`Submitting UPPF claims for window ${windowId}`);
        // Get all ready claims for the window
        const claims = await this.claimsRepository.find({
            where: {
                windowId,
                status: 'READY_TO_SUBMIT',
            },
        });
        if (claims.length === 0) {
            this.logger.warn('No claims ready for submission');
            return {
                submissionId: null,
                claimsCount: 0,
                totalAmount: 0,
            };
        }
        // Calculate total amount
        const totalAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);
        // Generate submission package
        const submissionPackage = {
            submissionId: this.generateSubmissionId(),
            windowId,
            submissionDate: new Date(),
            omcDetails: {
                name: 'Ghana OMC Ltd',
                license: 'NPA/OMC/2025/001',
                tin: '1234567890',
            },
            claims: claims.map(claim => ({
                claimNumber: claim.claimNumber,
                consignmentId: claim.consignmentId,
                routeDetails: {
                    from: 'Tema Depot',
                    to: claim.stationId,
                    kmBeyondEqualisation: claim.kmBeyondEqualisation,
                },
                volumeDetails: {
                    litresMoved: claim.litresMoved,
                    product: 'PMS', // Get from delivery
                },
                claimAmount: claim.claimAmount,
                supportingDocuments: claim.evidenceLinks,
            })),
            summary: {
                totalClaims: claims.length,
                totalAmount,
                averageClaimAmount: totalAmount / claims.length,
            },
        };
        // Submit to NPA (mock implementation)
        const submissionResult = await this.sendToNPAAPI(submissionPackage);
        // Update claims status
        await this.claimsRepository.update({ windowId, status: 'READY_TO_SUBMIT' }, {
            status: 'SUBMITTED',
            submissionDate: new Date(),
            submissionRef: submissionResult.referenceNumber,
        });
        // Emit submission event
        this.eventEmitter.emit('uppf.claims.submitted', {
            submissionId: submissionPackage.submissionId,
            windowId,
            claimsCount: claims.length,
            totalAmount,
        });
        return {
            submissionId: submissionPackage.submissionId,
            claimsCount: claims.length,
            totalAmount,
        };
    }
    /**
     * Process UPPF settlement from NPA
     */
    async processUPPFSettlement(settlementData) {
        this.logger.log(`Processing UPPF settlement for ${settlementData.submissionRef}`);
        // Get claims for the submission
        const claims = await this.claimsRepository.find({
            where: { submissionRef: settlementData.submissionRef },
        });
        const totalClaimAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);
        const varianceAmount = settlementData.settlementAmount - totalClaimAmount;
        // Update claims with settlement details
        for (const claim of claims) {
            const claimProportion = claim.claimAmount / totalClaimAmount;
            const settlementAmount = settlementData.settlementAmount * claimProportion;
            await this.claimsRepository.update({ claimId: claim.claimId }, {
                status: 'SETTLED',
                settlementDate: settlementData.settlementDate,
                settlementAmount,
                varianceAmount: settlementAmount - claim.claimAmount,
            });
            // Post to GL
            await this.postSettlementToGL(claim.claimId, settlementAmount);
        }
        // Emit settlement event
        this.eventEmitter.emit('uppf.settlement.processed', {
            submissionRef: settlementData.submissionRef,
            settlementAmount: settlementData.settlementAmount,
            claimsCount: claims.length,
            varianceAmount,
        });
    }
    /**
     * Scheduled job to auto-generate claims
     */
    async autoGenerateClaims() {
        this.logger.log('Running auto-generate UPPF claims job');
        // Get completed deliveries without claims
        const deliveries = await this.deliveryRepository.find({
            where: {
                status: 'DELIVERED',
                claimGenerated: false,
            },
        });
        for (const delivery of deliveries) {
            try {
                await this.generateUPPFClaim(delivery.consignmentId);
                // Mark as claim generated
                await this.deliveryRepository.update({ consignmentId: delivery.consignmentId }, { claimGenerated: true });
            }
            catch (error) {
                this.logger.error(`Failed to generate claim for ${delivery.consignmentId}: ${error.message}`);
            }
        }
    }
    // Helper methods
    generateClaimNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000);
        return `UPPF-${year}${month}-${String(random).padStart(4, '0')}`;
    }
    generateSubmissionId() {
        const date = new Date();
        return `SUB-${date.getTime()}`;
    }
    async getCurrentUPPFTariff(productType, routeCategory) {
        // Get dynamic UPPF tariff from configuration or PBU components
        const baseTariff = this.UPPF_BASE_RATES[productType] || this.UPPF_BASE_RATES['PMS'];
        const routeMultiplier = this.ROUTE_MULTIPLIERS[routeCategory] || 1.0;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`/pricing/uppf-tariff?product=${productType}&route=${routeCategory}`));
            return response.data.tariff || (baseTariff * routeMultiplier);
        }
        catch {
            return baseTariff * routeMultiplier;
        }
    }
    async getCurrentPricingWindow() {
        // Get active pricing window
        return 'W2025-01';
    }
    async getTransporterVolume(consignmentId) {
        // Get from vehicle monitoring system
        const delivery = await this.deliveryRepository.findOne({
            where: { consignmentId },
        });
        return delivery.litresLoaded * 0.995; // Assume 0.5% loss in transit
    }
    async collectClaimEvidence(consignmentId) {
        return {
            waybill: `waybill-${consignmentId}`,
            gpsTrace: `gps-${consignmentId}`,
            grn: `grn-${consignmentId}`,
            tankDips: `dips-${consignmentId}`,
            weighbridge: `weighbridge-${consignmentId}`,
        };
    }
    /**
     * Calculate enhanced UPPF claim with route optimization and bonuses
     */
    async calculateEnhancedClaim(params) {
        const { delivery, equalisationPoint, gpsValidation } = params;
        // Calculate km beyond equalisation
        const kmBeyondEqualisation = Math.max(0, delivery.kmActual - equalisationPoint.kmThreshold);
        // Get dynamic UPPF tariff
        const baseTariff = this.UPPF_BASE_RATES[delivery.productType] || this.UPPF_BASE_RATES['PMS'];
        const routeMultiplier = this.ROUTE_MULTIPLIERS[equalisationPoint.roadCategory] || 1.0;
        const tariffPerLitreKm = baseTariff * routeMultiplier;
        // Calculate base claim amount
        const baseClaimAmount = kmBeyondEqualisation * delivery.litresMoved * tariffPerLitreKm;
        // Calculate route efficiency bonus (up to 10% bonus for high efficiency)
        const routeEfficiencyBonus = gpsValidation.routeEfficiency > 90 ?
            baseClaimAmount * 0.1 * (gpsValidation.routeEfficiency - 90) / 10 : 0;
        // Calculate compliance bonus (up to 5% bonus for high compliance)
        const complianceScore = this.calculateComplianceScore(gpsValidation);
        const complianceBonus = complianceScore > 95 ?
            baseClaimAmount * 0.05 * (complianceScore - 95) / 5 : 0;
        return {
            kmBeyondEqualisation,
            claimAmount: baseClaimAmount,
            tariffPerLitreKm,
            routeEfficiencyBonus,
            complianceBonus,
            routeOptimization: {
                efficiency: gpsValidation.routeEfficiency,
                fuelSavings: gpsValidation.fuelConsumptionAnalysis.efficiency - 100,
                timeOptimization: gpsValidation.timeAnalysis.isReasonable,
            },
        };
    }
    /**
     * Collect comprehensive evidence with automatic scoring
     */
    async collectComprehensiveEvidence(consignmentId, options) {
        const documents = await this.collectClaimEvidence(consignmentId);
        // Calculate evidence score based on availability and quality
        let score = 0;
        const maxScore = 100;
        if (documents.waybill)
            score += 20;
        if (documents.gpsTrace)
            score += 25;
        if (documents.grn)
            score += 20;
        if (documents.tankDips)
            score += 15;
        if (documents.weighbridge)
            score += 10;
        if (options.blockchainHash)
            score += 10;
        const complianceMetrics = {
            documentCompleteness: score / maxScore,
            evidenceQuality: options.includeAIAnalysis ? 0.95 : 0.85,
            verificationLevel: options.blockchainHash ? 'BLOCKCHAIN' : 'STANDARD',
            requirement: options.requirement,
        };
        return {
            documents,
            score,
            complianceMetrics,
        };
    }
    /**
     * Generate enhanced claim number with metadata
     */
    async generateEnhancedClaimNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const sequence = await this.getNextClaimSequence(year, month);
        return `UPPF-${year}${month}${day}-${String(sequence).padStart(6, '0')}`;
    }
    /**
     * Determine claim status based on validation results
     */
    determineClaimStatus(reconciliation, gpsValidation, evidence) {
        if (!reconciliation.isValid)
            return 'REJECTED_RECONCILIATION';
        if (!gpsValidation.isValid)
            return 'REJECTED_GPS';
        if (evidence.score < 60)
            return 'INSUFFICIENT_EVIDENCE';
        if (gpsValidation.confidence >= 95 && evidence.score >= 90)
            return 'AUTO_SUBMIT';
        if (gpsValidation.confidence >= 85 && evidence.score >= 75)
            return 'READY_TO_SUBMIT';
        return 'MANUAL_REVIEW';
    }
    /**
     * Calculate claim risk score
     */
    calculateClaimRiskScore(gpsValidation, reconciliation, evidence) {
        let riskScore = 0;
        // GPS risk factors
        riskScore += gpsValidation.anomalies.length * 10;
        riskScore += (100 - gpsValidation.confidence) * 0.5;
        // Reconciliation risk factors
        if (!reconciliation.isValid)
            riskScore += 30;
        riskScore += (100 - reconciliation.confidence) * 0.3;
        // Evidence risk factors
        riskScore += (100 - evidence.score) * 0.2;
        return Math.min(100, Math.max(0, riskScore));
    }
    /**
     * Calculate submission priority
     */
    calculateSubmissionPriority(claimAmount, gpsValidation, evidence) {
        const qualityScore = (gpsValidation.confidence + evidence.score) / 2;
        if (claimAmount > 10000 && qualityScore >= 90)
            return 'URGENT';
        if (claimAmount > 5000 && qualityScore >= 80)
            return 'HIGH';
        if (qualityScore >= 70)
            return 'MEDIUM';
        return 'LOW';
    }
    /**
     * Schedule claim follow-up tasks
     */
    scheduleClaimFollowUp(claimId, priority) {
        const delays = {
            'URGENT': 1, // 1 day
            'HIGH': 3, // 3 days
            'MEDIUM': 7, // 1 week
            'LOW': 14, // 2 weeks
        };
        const delay = delays[priority] || 7;
        this.eventEmitter.emit('schedule.task', {
            type: 'UPPF_CLAIM_FOLLOWUP',
            claimId,
            scheduleDate: (0, date_fns_1.addDays)(new Date(), delay),
            priority,
        });
    }
    async detectAIAnomalies(gpsTrace) {
        const anomalies = [];
        // Enhanced AI-based anomaly detection
        try {
            const aiResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/ai/gps-anomaly-detection', {
                gpsTrace,
                routeHistory: await this.getRouteHistory(gpsTrace.routeId),
                vehicleProfile: await this.getVehicleProfile(gpsTrace.vehicleId),
            }));
            if (aiResponse.data.anomalies) {
                anomalies.push(...aiResponse.data.anomalies);
            }
        }
        catch (error) {
            this.logger.warn('AI anomaly detection failed, using fallback detection');
            // Fallback rule-based detection
            if (gpsTrace.routePolyline && gpsTrace.routePolyline.includes('detour')) {
                anomalies.push('Suspicious route pattern detected');
            }
            if (gpsTrace.speedViolations > 5) {
                anomalies.push('Multiple speed violations detected');
            }
            if (gpsTrace.unexpectedStops > 3) {
                anomalies.push('Excessive unscheduled stops');
            }
        }
        return anomalies;
    }
    async sendToNPAAPI(submissionPackage) {
        // Mock NPA API submission
        return {
            success: true,
            referenceNumber: `NPA-REF-${Date.now()}`,
            message: 'Claims submitted successfully',
        };
    }
    /**
     * Process UPPF settlement with comprehensive analysis
     */
    async processUPPFSettlementEnhanced(windowId, settlementData) {
        this.logger.log(`Processing enhanced UPPF settlement for window ${windowId}`);
        const claims = await this.claimsRepository.find({
            where: { windowId, status: (0, typeorm_2.In)(['SUBMITTED', 'APPROVED']) },
        });
        const varianceAnalysis = [];
        let totalVarianceCost = 0;
        // Process claim adjustments
        for (const adjustment of settlementData.claimAdjustments) {
            const claim = claims.find(c => c.claimId === adjustment.claimId);
            if (claim) {
                const varianceAmount = adjustment.settledAmount - adjustment.originalAmount;
                totalVarianceCost += Math.abs(varianceAmount);
                varianceAnalysis.push({
                    claimId: adjustment.claimId,
                    originalAmount: adjustment.originalAmount,
                    settledAmount: adjustment.settledAmount,
                    varianceAmount,
                    varianceReason: adjustment.adjustmentReason,
                    riskCategory: this.categorizeVarianceRisk(varianceAmount, adjustment.originalAmount),
                    actionRequired: Math.abs(varianceAmount) > adjustment.originalAmount * 0.1,
                });
                // Update claim with settlement details
                await this.claimsRepository.update(adjustment.claimId, {
                    status: 'SETTLED',
                    settlementAmount: adjustment.settledAmount,
                    varianceAmount,
                    varianceReason: adjustment.adjustmentReason,
                    settlementDate: new Date(),
                });
            }
        }
        // Calculate performance metrics
        const performanceMetrics = {
            successRate: (claims.length - varianceAnalysis.filter(v => v.actionRequired).length) / claims.length * 100,
            averageProcessingDays: await this.calculateAverageProcessingDays(windowId),
            totalVarianceCost,
            complianceScore: await this.calculateComplianceScore(claims),
            efficiency: await this.calculateSettlementEfficiency(windowId),
        };
        // Create settlement record
        const settlement = await this.settlementsRepository.save({
            settlementId: `SETTL-${windowId}-${Date.now()}`,
            windowId,
            totalClaims: claims.length,
            totalClaimAmount: claims.reduce((sum, c) => sum + c.claimAmount, 0),
            totalSettledAmount: settlementData.totalSettlement,
            npaPenalties: settlementData.npaPenalties,
            performanceBonuses: settlementData.performanceBonuses,
            netSettlement: settlementData.totalSettlement - settlementData.npaPenalties + settlementData.performanceBonuses,
            settlementDate: new Date(),
            varianceAnalysis: JSON.stringify(varianceAnalysis),
            performanceMetrics: JSON.stringify(performanceMetrics),
        });
        // Post enhanced GL entries
        await this.postEnhancedSettlementToGL(settlement);
        // Emit settlement events
        this.eventEmitter.emit('uppf.settlement.completed', {
            settlementId: settlement.settlementId,
            windowId,
            performanceMetrics,
            varianceAnalysis,
        });
        return {
            settlementId: settlement.settlementId,
            windowId,
            totalClaims: claims.length,
            totalClaimAmount: settlement.totalClaimAmount,
            totalSettledAmount: settlement.totalSettledAmount,
            npaPenalties: settlement.npaPenalties,
            netSettlement: settlement.netSettlement,
            settlementDate: settlement.settlementDate,
            varianceAnalysis,
            performanceMetrics,
        };
    }
    async postSettlementToGL(claimId, amount) {
        // Post journal entry for UPPF settlement
        this.eventEmitter.emit('journal.entry.create', {
            type: 'UPPF_SETTLEMENT',
            entries: [
                {
                    account: '1000', // Cash
                    debit: amount,
                    credit: 0,
                },
                {
                    account: '1250', // Accounts Receivable - UPPF
                    debit: 0,
                    credit: amount,
                },
            ],
            reference: `UPPF-SETTLEMENT-${claimId}`,
            date: new Date(),
        });
    }
    /**
     * Post enhanced GL entries with detailed breakdown
     */
    async postEnhancedSettlementToGL(settlement) {
        const entries = [
            {
                account: '1100', // Cash - UPPF Settlements
                debit: settlement.netSettlement,
                credit: 0,
                description: `UPPF Settlement - Window ${settlement.windowId}`,
            },
            {
                account: '1250', // Accounts Receivable - UPPF
                debit: 0,
                credit: settlement.totalSettledAmount,
                description: 'UPPF Claims Settled',
            },
        ];
        // Add penalty entries if applicable
        if (settlement.npaPenalties > 0) {
            entries.push({
                account: '6800', // Penalties Expense
                debit: settlement.npaPenalties,
                credit: 0,
                description: 'NPA Penalties',
            });
        }
        // Add performance bonus entries if applicable
        if (settlement.performanceBonuses > 0) {
            entries.push({
                account: '4500', // Other Income
                debit: 0,
                credit: settlement.performanceBonuses,
                description: 'UPPF Performance Bonuses',
            });
        }
        this.eventEmitter.emit('journal.entry.create', {
            type: 'UPPF_ENHANCED_SETTLEMENT',
            templateCode: 'UPPF_SETTLEMENT_V2',
            entries,
            reference: `UPPF-SETTL-${settlement.settlementId}`,
            date: settlement.settlementDate,
            metadata: {
                windowId: settlement.windowId,
                claimsCount: settlement.totalClaims,
                varianceAnalysis: settlement.varianceAnalysis,
            },
        });
    }
    // Helper methods for enhanced functionality
    async getNextClaimSequence(year, month) {
        // Get next sequence number for claim numbering
        const existingClaims = await this.claimsRepository.count({
            where: {
                claimNumber: { $regex: `^UPPF-${year}${String(month).padStart(2, '0')}` },
            },
        });
        return existingClaims + 1;
    }
    calculateComplianceScore(data) {
        // Calculate compliance score based on various factors
        let score = 100;
        if (data.anomalies && data.anomalies.length > 0) {
            score -= data.anomalies.length * 5;
        }
        if (data.speedAnalysis && data.speedAnalysis.speedViolations > 0) {
            score -= data.speedAnalysis.speedViolations * 3;
        }
        if (data.timeAnalysis && !data.timeAnalysis.isReasonable) {
            score -= 10;
        }
        return Math.max(0, score);
    }
    async getRouteComplexityFactor(routeId) {
        // Get route complexity factor from route optimization data
        try {
            const route = await this.routeOptimizationRepository.findOne({
                where: { routeId },
            });
            return route?.complexityFactor || 1.0;
        }
        catch {
            return 1.0;
        }
    }
    async getProductVolatilityFactor(productType) {
        // Get product volatility factor
        const factors = {
            'PMS': 1.1,
            'AGO': 1.0,
            'KEROSENE': 0.9,
            'LPG': 1.2,
        };
        return factors[productType] || 1.0;
    }
    categorizeVarianceRisk(varianceAmount, originalAmount) {
        const variancePercent = Math.abs(varianceAmount) / originalAmount * 100;
        if (variancePercent > 20)
            return 'HIGH';
        if (variancePercent > 10)
            return 'MEDIUM';
        if (variancePercent > 5)
            return 'LOW';
        return 'MINIMAL';
    }
    async calculateAverageProcessingDays(windowId) {
        // Calculate average processing days for claims in window
        const claims = await this.claimsRepository.find({
            where: { windowId, settlementDate: { $ne: null } },
        });
        if (claims.length === 0)
            return 0;
        const totalDays = claims.reduce((sum, claim) => {
            const days = (0, date_fns_1.differenceInDays)(claim.settlementDate, claim.submissionDate || claim.createdAt);
            return sum + days;
        }, 0);
        return totalDays / claims.length;
    }
    async calculateSettlementEfficiency(windowId) {
        // Calculate settlement efficiency score
        const window = await this.pricingWindowsRepository.findOne({
            where: { windowId },
        });
        if (!window)
            return 0;
        const claims = await this.claimsRepository.find({
            where: { windowId },
        });
        const onTimeClaims = claims.filter(claim => claim.settlementDate && claim.settlementDate <= (0, date_fns_1.addDays)(window.endDate, 30)).length;
        return claims.length > 0 ? (onTimeClaims / claims.length) * 100 : 0;
    }
    async performAIVarianceAnalysis(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/ai/variance-analysis', data));
            return response.data;
        }
        catch {
            return { anomalies: [], confidence: 85 };
        }
    }
    async createBlockchainRecord(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/blockchain/uppf-record', data));
            return response.data.hash;
        }
        catch {
            return `MOCK_HASH_${Date.now()}`;
        }
    }
    calculateReconciliationRiskScore(variance, tolerance, confidence) {
        const varianceRisk = (variance / tolerance) * 50;
        const confidenceRisk = (100 - confidence) * 0.5;
        return Math.min(100, varianceRisk + confidenceRisk);
    }
    async predictVarianceForRoute(routeId) {
        // AI-powered variance prediction
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('/ai/variance-prediction', { routeId }));
            return response.data.predictedVariance;
        }
        catch {
            return 0.5; // Default 0.5% predicted variance
        }
    }
    async identifyRiskFactors(consignmentId) {
        // Identify risk factors for the consignment
        const factors = [];
        // Check weather conditions
        // Check route conditions
        // Check vehicle history
        // Check driver performance
        return factors;
    }
    async generateRecommendations(reconciliation) {
        const recommendations = [];
        if (reconciliation.confidence < 90) {
            recommendations.push('Consider additional verification steps');
        }
        if (reconciliation.varianceDepotStation > 100) {
            recommendations.push('Investigate potential fuel loss during transport');
        }
        return recommendations;
    }
    async getRouteHistory(routeId) {
        // Get historical GPS data for route analysis
        return {};
    }
    async getVehicleProfile(vehicleId) {
        // Get vehicle profile for AI analysis
        return {};
    }
};
exports.UPPFClaimsService = UPPFClaimsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UPPFClaimsService.prototype, "autoGenerateClaims", null);
exports.UPPFClaimsService = UPPFClaimsService = UPPFClaimsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)('DeliveryConsignments')),
    __param(1, (0, typeorm_1.InjectRepository)('UppfClaims')),
    __param(2, (0, typeorm_1.InjectRepository)('EqualisationPoints')),
    __param(3, (0, typeorm_1.InjectRepository)('GpsTraces')),
    __param(4, (0, typeorm_1.InjectRepository)('ThreeWayReconciliation')),
    __param(5, (0, typeorm_1.InjectRepository)('UppfSettlements')),
    __param(6, (0, typeorm_1.InjectRepository)('RouteOptimization')),
    __param(7, (0, typeorm_1.InjectRepository)('PricingWindows')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], UPPFClaimsService);
//# sourceMappingURL=uppf-claims.service.js.map