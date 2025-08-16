"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyDeliveryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const event_emitter_1 = require("@nestjs/event-emitter");
const daily_delivery_controller_1 = require("./controllers/daily-delivery.controller");
const daily_delivery_service_1 = require("./services/daily-delivery.service");
const delivery_validation_service_1 = require("./services/delivery-validation.service");
const price_build_up_service_1 = require("./services/price-build-up.service");
const tax_accrual_service_1 = require("./services/tax-accrual.service");
const daily_delivery_entity_1 = require("./entities/daily-delivery.entity");
const delivery_line_item_entity_1 = require("./entities/delivery-line-item.entity");
const delivery_approval_history_entity_1 = require("./entities/delivery-approval-history.entity");
const delivery_documents_entity_1 = require("./entities/delivery-documents.entity");
const price_build_up_component_entity_1 = require("./entities/price-build-up-component.entity");
const tax_accrual_entity_1 = require("./entities/tax-accrual.entity");
let DailyDeliveryModule = class DailyDeliveryModule {
};
exports.DailyDeliveryModule = DailyDeliveryModule;
exports.DailyDeliveryModule = DailyDeliveryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                daily_delivery_entity_1.DailyDelivery,
                delivery_line_item_entity_1.DeliveryLineItem,
                delivery_approval_history_entity_1.DeliveryApprovalHistory,
                delivery_documents_entity_1.DeliveryDocuments,
                price_build_up_component_entity_1.PriceBuildUpComponent,
                tax_accrual_entity_1.TaxAccrual,
            ]),
            axios_1.HttpModule,
            event_emitter_1.EventEmitterModule,
        ],
        controllers: [daily_delivery_controller_1.DailyDeliveryController],
        providers: [
            daily_delivery_service_1.DailyDeliveryService,
            delivery_validation_service_1.DeliveryValidationService,
            price_build_up_service_1.PriceBuildUpService,
            tax_accrual_service_1.TaxAccrualService,
        ],
        exports: [
            daily_delivery_service_1.DailyDeliveryService,
            delivery_validation_service_1.DeliveryValidationService,
            price_build_up_service_1.PriceBuildUpService,
            tax_accrual_service_1.TaxAccrualService,
        ],
    })
], DailyDeliveryModule);
//# sourceMappingURL=daily-delivery.module.js.map