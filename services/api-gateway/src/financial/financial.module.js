"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialModule = void 0;
const common_1 = require("@nestjs/common");
const financial_controller_1 = require("./financial.controller");
const financial_service_1 = require("./financial.service");
const fixed_assets_controller_1 = require("./controllers/fixed-assets.controller");
const fixed_assets_service_1 = require("./services/fixed-assets.service");
const axios_1 = require("@nestjs/axios");
let FinancialModule = class FinancialModule {
};
exports.FinancialModule = FinancialModule;
exports.FinancialModule = FinancialModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [
            financial_controller_1.FinancialController,
            fixed_assets_controller_1.FixedAssetsController,
        ],
        providers: [
            financial_service_1.FinancialService,
            fixed_assets_service_1.FixedAssetsService,
        ],
        exports: [financial_service_1.FinancialService],
    })
], FinancialModule);
//# sourceMappingURL=financial.module.js.map