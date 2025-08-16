"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClaimsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const uppf_claim_entity_1 = require("./entities/uppf-claim.entity");
const delivery_consignment_entity_1 = require("./entities/delivery-consignment.entity");
const equalisation_point_entity_1 = require("./entities/equalisation-point.entity");
const gps_trace_entity_1 = require("./entities/gps-trace.entity");
const shared_types_1 = require("@omc-erp/shared-types");
const geolib = __importStar(require("geolib"));
let ClaimsService = ClaimsService_1 = class ClaimsService {
    uppfClaimRepository;
    deliveryRepository;
    equalisationRepository;
    gpsTraceRepository;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(ClaimsService_1.name);
    constructor(uppfClaimRepository, deliveryRepository, equalisationRepository, gpsTraceRepository, dataSource, eventEmitter) {
        this.uppfClaimRepository = uppfClaimRepository;
        this.deliveryRepository = deliveryRepository;
        this.equalisationRepository = equalisationRepository;
        this.gpsTraceRepository = gpsTraceRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create UPPF claim from delivery with automatic calculation
     * Implements the blueprint formula: claim_amount = km_excess * litres_delivered * tariff_per_litre_km
     */
    async createClaim(createClaimDto, tenantId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 1. Get delivery consignment
            const delivery = await this.deliveryRepository.findOne({
                where: { id: createClaimDto.deliveryId, tenantId },
            });
            if (!delivery) {
                throw new common_1.NotFoundException('Delivery consignment not found');
            }
            // 2. Get equalisation point for the route
            const equalisationPoint = await this.equalisationRepository.findOne({
                where: { routeId: createClaimDto.routeId, tenantId },
                order: { effectiveFrom: 'DESC' }, // Get latest effective rate
            });
            if (!equalisationPoint) {
                throw new common_1.NotFoundException(`Equalisation point not found for route ${createClaimDto.routeId}`);
            }
            // 3. Calculate km beyond equalisation (blueprint: km_excess = max(0, km_actual - equalisation_points.km_threshold))
            const kmBeyondEqualisation = Math.max(0, createClaimDto.kmActual - equalisationPoint.kmThreshold);
            if (kmBeyondEqualisation <= 0) {
                throw new common_1.BadRequestException(`No UPPF claim applicable. Actual distance (${createClaimDto.kmActual}km) does not exceed equalisation threshold (${equalisationPoint.kmThreshold}km)`);
            }
            // 4. Calculate claim amount (blueprint: claim_amount = km_excess * litres_delivered * tariff_per_litre_km)
            const amountDue = kmBeyondEqualisation * createClaimDto.litresMoved * equalisationPoint.tariffPerLitreKm;
            // 5. Create GPS trace if provided
            let gpsTraceId;
            if (createClaimDto.gpsTrace && createClaimDto.gpsTrace.length > 0) {
                const gpsTrace = await this.createGPSTrace(createClaimDto.deliveryId, createClaimDto.gpsTrace, tenantId);
                gpsTraceId = gpsTrace.id;
            }
            // 6. Create UPPF claim
            const claim = this.uppfClaimRepository.create({
                claimId: this.generateClaimId(createClaimDto.windowId),
                windowId: createClaimDto.windowId,
                deliveryId: createClaimDto.deliveryId,
                routeId: createClaimDto.routeId,
                kmBeyondEqualisation,
                litresMoved: createClaimDto.litresMoved,
                tariffPerLitreKm: equalisationPoint.tariffPerLitreKm,
                amountDue,
                status: shared_types_1.UPPFClaimStatus.DRAFT,
                evidenceLinks: createClaimDto.evidenceLinks || [],
                tenantId,
                createdBy: userId,
            });
            const savedClaim = await queryRunner.manager.save(claim);
            // 7. Perform three-way reconciliation
            const reconciliationResult = await this.performThreeWayReconciliation(delivery, createClaimDto);
            if (reconciliationResult.hasVariances) {
                savedClaim.status = shared_types_1.UPPFClaimStatus.UNDER_REVIEW;
                savedClaim.notes = `Variances detected: ${reconciliationResult.variances.join(', ')}`;
                await queryRunner.manager.save(savedClaim);
                this.eventEmitter.emit('uppf-claim.variance-flagged', {
                    claimId: savedClaim.claimId,
                    variances: reconciliationResult.variances,
                    tenantId,
                });
            }
            else {
                savedClaim.status = shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT;
                await queryRunner.manager.save(savedClaim);
            }
            await queryRunner.commitTransaction();
            // 8. Emit events
            this.eventEmitter.emit('uppf-claim.created', {
                claimId: savedClaim.claimId,
                deliveryId: createClaimDto.deliveryId,
                amountDue,
                routeId: createClaimDto.routeId,
                tenantId,
            });
            this.logger.log(`Created UPPF claim ${savedClaim.claimId}: ${kmBeyondEqualisation}km × ${createClaimDto.litresMoved}L × GHS${equalisationPoint.tariffPerLitreKm} = GHS${amountDue.toFixed(2)}`);
            return savedClaim;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Three-way reconciliation: depot load vs station received vs transporter trip
     * Blueprint requirement: "Three-way reconcile: depot load vs. station received vs. transporter trip; flag variances."
     */
    async performThreeWayReconciliation(delivery, claimData) {
        const variances = [];
        const reconciliation = {
            depotLoaded: delivery.litresLoaded,
            stationReceived: delivery.litresReceived || 0,
            claimedMoved: claimData.litresMoved,
            volumeVariance: 0,
            distanceVariance: 0,
        };
        // Volume reconciliation
        const volumeTolerance = 50; // 50L tolerance
        reconciliation.volumeVariance = Math.abs(delivery.litresLoaded - (delivery.litresReceived || 0));
        if (reconciliation.volumeVariance > volumeTolerance) {
            variances.push(`Volume variance: ${reconciliation.volumeVariance.toFixed(1)}L exceeds tolerance of ${volumeTolerance}L`);
        }
        // Check if claimed litres match received litres
        const claimVolumeVariance = Math.abs(claimData.litresMoved - (delivery.litresReceived || delivery.litresLoaded));
        if (claimVolumeVariance > volumeTolerance) {
            variances.push(`Claimed litres (${claimData.litresMoved}L) don't match delivery records`);
        }
        // Distance reconciliation (if we have GPS data)
        if (claimData.gpsTrace && claimData.gpsTrace.length > 1) {
            const gpsDistance = this.calculateGPSDistance(claimData.gpsTrace);
            reconciliation.distanceVariance = Math.abs(claimData.kmActual - gpsDistance);
            const distanceTolerance = claimData.kmActual * 0.1; // 10% tolerance
            if (reconciliation.distanceVariance > distanceTolerance) {
                variances.push(`Distance variance: GPS trace shows ${gpsDistance.toFixed(1)}km vs claimed ${claimData.kmActual}km`);
            }
        }
        return {
            hasVariances: variances.length > 0,
            variances,
            reconciliation,
        };
    }
    /**
     * Route anomaly detection using GPS patterns
     * Blueprint AI feature: "Route validation model: flag abnormal detours vs historical baselines"
     */
    async detectRouteAnomalies(gpsTrace, routeId, tenantId) {
        // TODO: Implement ML-based route anomaly detection
        // For now, basic checks
        const anomalies = [];
        if (gpsTrace.length < 2) {
            anomalies.push('Insufficient GPS points for route validation');
            return { hasAnomalies: true, anomalies, confidence: 0.9 };
        }
        // Check for unusual stops (more than 2 hours at non-depot/station locations)
        let previousPoint = gpsTrace[0];
        let stationaryTime = 0;
        for (let i = 1; i < gpsTrace.length; i++) {
            const currentPoint = gpsTrace[i];
            const distance = geolib.getDistance({ latitude: previousPoint.latitude, longitude: previousPoint.longitude }, { latitude: currentPoint.latitude, longitude: currentPoint.longitude });
            const timeDiff = new Date(currentPoint.timestamp).getTime() - new Date(previousPoint.timestamp).getTime();
            if (distance < 100 && timeDiff > 2 * 60 * 60 * 1000) { // Stationary for >2 hours within 100m
                stationaryTime += timeDiff;
            }
            previousPoint = currentPoint;
        }
        if (stationaryTime > 4 * 60 * 60 * 1000) { // More than 4 hours total stationary time
            anomalies.push('Excessive stationary time detected - possible unauthorized stops');
        }
        return {
            hasAnomalies: anomalies.length > 0,
            anomalies,
            confidence: 0.7,
        };
    }
    /**
     * Batch submit claims for a pricing window
     * Blueprint requirement: "Batch submit claim set per window with auto-generated schedules & attachments"
     */
    async batchSubmitClaims(windowId, tenantId, userId) {
        const readyToSubmitClaims = await this.uppfClaimRepository.find({
            where: {
                windowId,
                tenantId,
                status: shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT,
            },
        });
        if (readyToSubmitClaims.length === 0) {
            throw new common_1.BadRequestException(`No claims ready to submit for window ${windowId}`);
        }
        const submissionReference = `UPPF-${windowId}-${Date.now()}`;
        const totalAmount = readyToSubmitClaims.reduce((sum, claim) => sum + claim.amountDue, 0);
        // Update all claims to submitted status
        await this.uppfClaimRepository.update({ windowId, tenantId, status: shared_types_1.UPPFClaimStatus.READY_TO_SUBMIT }, {
            status: shared_types_1.UPPFClaimStatus.SUBMITTED,
            submittedAt: new Date(),
            submittedBy: userId,
            submissionReference,
        });
        // Generate NPA submission format
        const submissionPackage = await this.generateNPASubmissionPackage(readyToSubmitClaims, submissionReference);
        this.eventEmitter.emit('uppf-claims.batch-submitted', {
            windowId,
            submissionReference,
            claimCount: readyToSubmitClaims.length,
            totalAmount,
            tenantId,
        });
        return {
            submittedClaims: readyToSubmitClaims.map(c => c.claimId),
            totalAmount,
            submissionReference,
        };
    }
    /**
     * Generate variance dashboard data
     * Blueprint requirement: "Variance dashboards. Compare expected vs paid UPPF; flag short-pays and aging."
     */
    async getVarianceDashboard(tenantId) {
        const claims = await this.uppfClaimRepository
            .createQueryBuilder('claim')
            .where('claim.tenantId = :tenantId', { tenantId })
            .andWhere('claim.submittedAt IS NOT NULL')
            .orderBy('claim.submittedAt', 'DESC')
            .take(1000) // Last 1000 claims
            .getMany();
        const dashboard = {
            summary: {
                totalSubmitted: 0,
                totalPaid: 0,
                totalPending: 0,
                shortPayAmount: 0,
            },
            aging: {
                under30Days: 0,
                days30to60: 0,
                days60to90: 0,
                over90Days: 0,
            },
            paymentVariances: [],
        };
        const now = new Date();
        claims.forEach(claim => {
            dashboard.summary.totalSubmitted += claim.amountDue;
            if (claim.status === shared_types_1.UPPFClaimStatus.PAID) {
                dashboard.summary.totalPaid += claim.amountPaid || claim.amountDue;
                if (claim.amountPaid && claim.amountPaid < claim.amountDue) {
                    const shortfall = claim.amountDue - claim.amountPaid;
                    dashboard.summary.shortPayAmount += shortfall;
                    dashboard.paymentVariances.push({
                        claimId: claim.claimId,
                        expected: claim.amountDue,
                        received: claim.amountPaid,
                        variance: shortfall,
                    });
                }
            }
            else {
                dashboard.summary.totalPending += claim.amountDue;
                if (claim.submittedAt) {
                    const daysAgo = Math.floor((now.getTime() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysAgo < 30)
                        dashboard.aging.under30Days++;
                    else if (daysAgo < 60)
                        dashboard.aging.days30to60++;
                    else if (daysAgo < 90)
                        dashboard.aging.days60to90++;
                    else
                        dashboard.aging.over90Days++;
                }
            }
        });
        return dashboard;
    }
    // Helper methods
    generateClaimId(windowId) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `UPPF-${windowId}-${timestamp}-${random}`;
    }
    calculateGPSDistance(gpsTrace) {
        let totalDistance = 0;
        for (let i = 1; i < gpsTrace.length; i++) {
            const distance = geolib.getDistance({ latitude: gpsTrace[i - 1].latitude, longitude: gpsTrace[i - 1].longitude }, { latitude: gpsTrace[i].latitude, longitude: gpsTrace[i].longitude });
            totalDistance += distance;
        }
        return totalDistance / 1000; // Convert meters to kilometers
    }
    async createGPSTrace(deliveryId, gpsPoints, tenantId) {
        const gpsTrace = this.gpsTraceRepository.create({
            deliveryId,
            tenantId,
            startTime: new Date(gpsPoints[0].timestamp),
            endTime: new Date(gpsPoints[gpsPoints.length - 1].timestamp),
            totalKm: this.calculateGPSDistance(gpsPoints),
            routePoints: gpsPoints,
        });
        return this.gpsTraceRepository.save(gpsTrace);
    }
    async generateNPASubmissionPackage(claims, submissionReference) {
        // Generate NPA-compliant submission format
        return {
            submissionReference,
            submissionDate: new Date().toISOString(),
            totalClaims: claims.length,
            totalAmount: claims.reduce((sum, claim) => sum + claim.amountDue, 0),
            claims: claims.map(claim => ({
                claimId: claim.claimId,
                windowId: claim.windowId,
                routeId: claim.routeId,
                kmBeyondEqualisation: claim.kmBeyondEqualisation,
                litresMoved: claim.litresMoved,
                tariffRate: claim.tariffPerLitreKm,
                amountDue: claim.amountDue,
                evidenceLinks: claim.evidenceLinks,
            })),
        };
    }
    // Scheduled task to check aging claims
    async checkAgingClaims() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
        const agingClaims = await this.uppfClaimRepository.find({
            where: {
                status: shared_types_1.UPPFClaimStatus.SUBMITTED,
                submittedAt: { $lt: cutoffDate },
            },
        });
        for (const claim of agingClaims) {
            this.eventEmitter.emit('uppf-claim.aging-alert', {
                claimId: claim.claimId,
                windowId: claim.windowId,
                amountDue: claim.amountDue,
                daysAging: Math.floor((Date.now() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
                tenantId: claim.tenantId,
            });
        }
    }
};
exports.ClaimsService = ClaimsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClaimsService.prototype, "checkAgingClaims", null);
exports.ClaimsService = ClaimsService = ClaimsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(uppf_claim_entity_1.UPPFClaim)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_consignment_entity_1.DeliveryConsignment)),
    __param(2, (0, typeorm_1.InjectRepository)(equalisation_point_entity_1.EqualisationPoint)),
    __param(3, (0, typeorm_1.InjectRepository)(gps_trace_entity_1.GPSTrace)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map