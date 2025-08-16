"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employee_service_1 = require("./employee.service");
const employee_controller_1 = require("./employee.controller");
// Employee Entities
const employee_entity_1 = require("./entities/employee.entity");
const employee_contract_entity_1 = require("./entities/employee-contract.entity");
const employee_leave_entity_1 = require("./entities/employee-leave.entity");
const employee_performance_entity_1 = require("./entities/employee-performance.entity");
const employee_training_entity_1 = require("./entities/employee-training.entity");
let EmployeeModule = class EmployeeModule {
};
exports.EmployeeModule = EmployeeModule;
exports.EmployeeModule = EmployeeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                employee_entity_1.Employee,
                employee_contract_entity_1.EmployeeContract,
                employee_leave_entity_1.EmployeeLeave,
                employee_performance_entity_1.EmployeePerformance,
                employee_training_entity_1.EmployeeTraining,
            ]),
        ],
        controllers: [employee_controller_1.EmployeeController],
        providers: [employee_service_1.EmployeeService],
        exports: [employee_service_1.EmployeeService],
    })
], EmployeeModule);
//# sourceMappingURL=employee.module.js.map