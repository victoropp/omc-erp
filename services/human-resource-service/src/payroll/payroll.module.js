"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payroll_service_1 = require("./payroll.service");
const payroll_controller_1 = require("./payroll.controller");
const payroll_calculation_service_1 = require("./payroll-calculation.service");
const payroll_reporting_service_1 = require("./payroll-reporting.service");
const payroll_compliance_service_1 = require("./payroll-compliance.service");
// Payroll Entities
const payroll_entity_1 = require("./entities/payroll.entity");
const payroll_deduction_entity_1 = require("./entities/payroll-deduction.entity");
const payroll_allowance_entity_1 = require("./entities/payroll-allowance.entity");
// Employee Entity
const employee_entity_1 = require("../employee/entities/employee.entity");
let PayrollModule = class PayrollModule {
};
exports.PayrollModule = PayrollModule;
exports.PayrollModule = PayrollModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payroll_entity_1.Payroll,
                payroll_deduction_entity_1.PayrollDeduction,
                payroll_allowance_entity_1.PayrollAllowance,
                employee_entity_1.Employee,
            ]),
        ],
        controllers: [payroll_controller_1.PayrollController],
        providers: [
            payroll_service_1.PayrollService,
            payroll_calculation_service_1.PayrollCalculationService,
            payroll_reporting_service_1.PayrollReportingService,
            payroll_compliance_service_1.PayrollComplianceService,
        ],
        exports: [
            payroll_service_1.PayrollService,
            payroll_calculation_service_1.PayrollCalculationService,
            payroll_reporting_service_1.PayrollReportingService,
            payroll_compliance_service_1.PayrollComplianceService,
        ],
    })
], PayrollModule);
//# sourceMappingURL=payroll.module.js.map