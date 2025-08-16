"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPPFModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
// Entities
const uppf_entities_1 = require("./entities/uppf-entities");
// Services
const uppf_claims_service_1 = require("./claims/uppf-claims.service");
const uppf_settlements_service_1 = require("./settlements/uppf-settlements.service");
const uppf_reports_service_1 = require("./reports/uppf-reports.service");
const three_way_reconciliation_service_1 = require("./claims/three-way-reconciliation.service");
const gps_validation_service_1 = require("./claims/gps-validation.service");
const npa_submission_service_1 = require("./claims/npa-submission.service");
// Controllers
const uppf_claims_controller_1 = require("./controllers/uppf-claims.controller");
const uppf_settlements_controller_1 = require("./controllers/uppf-settlements.controller");
let UPPFModule = class UPPFModule {
};
exports.UPPFModule = UPPFModule;
exports.UPPFModule = UPPFModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            axios_1.HttpModule,
            event_emitter_1.EventEmitterModule,
            typeorm_1.TypeOrmModule.forFeature([
                uppf_entities_1.UPPFClaim,
                uppf_entities_1.UPPFSettlement,
                uppf_entities_1.ClaimAnomaly,
                uppf_entities_1.ThreeWayReconciliation,
                uppf_entities_1.EqualisationPoint,
                uppf_entities_1.GPSTrace,
            ]),
        ],
        providers: [
            uppf_claims_service_1.UPPFClaimsService,
            uppf_settlements_service_1.UPPFSettlementsService,
            uppf_reports_service_1.UPPFReportsService,
            three_way_reconciliation_service_1.ThreeWayReconciliationService,
            gps_validation_service_1.GPSValidationService,
            npa_submission_service_1.NPASubmissionService,
        ],
        controllers: [
            uppf_claims_controller_1.UPPFClaimsController,
            uppf_settlements_controller_1.UPPFSettlementsController,
        ],
        exports: [
            uppf_claims_service_1.UPPFClaimsService,
            uppf_settlements_service_1.UPPFSettlementsService,
            uppf_reports_service_1.UPPFReportsService,
            three_way_reconciliation_service_1.ThreeWayReconciliationService,
            gps_validation_service_1.GPSValidationService,
            npa_submission_service_1.NPASubmissionService,
        ],
    })
], UPPFModule);
//# sourceMappingURL=uppf.module.js.map