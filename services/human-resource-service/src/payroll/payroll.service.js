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
var PayrollService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const date_fns_1 = require("date-fns");
const payroll_entity_1 = require("./entities/payroll.entity");
const employee_entity_1 = require("../employee/entities/employee.entity");
let PayrollService = PayrollService_1 = class PayrollService {
    payrollRepo;
    employeeRepo;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(PayrollService_1.name);
    // Ghana Tax Brackets 2024 (GHS per annum)
    ghanaTaxBrackets = [
        { minIncome: 0, maxIncome: 4800, rate: 0, cumulativeTax: 0 }, // First GHS 4,800 - 0%
        { minIncome: 4800, maxIncome: 7200, rate: 5, cumulativeTax: 0 }, // Next GHS 2,400 - 5%
        { minIncome: 7200, maxIncome: 40000, rate: 10, cumulativeTax: 120 }, // Next GHS 32,800 - 10%
        { minIncome: 40000, maxIncome: 80000, rate: 17.5, cumulativeTax: 3400 }, // Next GHS 40,000 - 17.5%
        { minIncome: 80000, maxIncome: 150000, rate: 25, cumulativeTax: 10400 }, // Next GHS 70,000 - 25%
        { minIncome: 150000, maxIncome: Infinity, rate: 30, cumulativeTax: 27900 } // Above GHS 150,000 - 30%
    ];
    // Ghana Minimum Wage 2024
    ghanaMinimumWage = 18.15; // GHS per day
    constructor(payrollRepo, employeeRepo, dataSource, eventEmitter) {
        this.payrollRepo = payrollRepo;
        this.employeeRepo = employeeRepo;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    // ===== PAYROLL CALCULATION =====
    async calculatePayroll(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const employee = await this.employeeRepo.findOne({
                where: { id: data.employeeId }
            });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
            if (employee.status !== employee_entity_1.EmployeeStatus.ACTIVE) {
                throw new common_1.BadRequestException('Employee is not active');
            }
            // Check if payroll already exists for this period
            const existingPayroll = await this.payrollRepo.findOne({
                where: {
                    employeeId: data.employeeId,
                    payrollPeriod: data.payrollPeriod
                }
            });
            if (existingPayroll && existingPayroll.status !== payroll_entity_1.PayrollStatus.DRAFT) {
                throw new common_1.BadRequestException('Payroll already processed for this period');
            }
            // Generate payroll number
            const payrollNumber = await this.generatePayrollNumber(queryRunner, data.payrollPeriod);
            // Calculate working days
            const workingDays = (0, date_fns_1.getDaysInMonth)(data.periodStartDate);
            // Calculate prorated salary
            const proratedSalary = this.calculateProratedSalary(employee.basicSalary, workingDays, data.actualDaysWorked);
            // Calculate overtime
            const overtimePay = this.calculateOvertimePay(employee.basicSalary, data.overtimeHours || 0, workingDays);
            // Calculate allowances
            const totalAllowances = this.calculateTotalAllowances(employee);
            // Calculate bonuses
            const totalBonuses = (data.bonuses || []).reduce((sum, bonus) => sum + bonus.amount, 0);
            // Calculate gross pay
            const grossPay = proratedSalary + overtimePay + totalAllowances + totalBonuses;
            // Calculate taxable income (some allowances may be non-taxable)
            const taxableIncome = this.calculateTaxableIncome(grossPay, employee);
            // Calculate income tax (PAYE)
            const { incomeTax, taxRate } = this.calculateIncomeTax(taxableIncome, employee);
            // Calculate SSNIT contributions
            const { employeeContribution: ssnitEmployee, employerContribution: ssnitEmployer } = this.calculateSSNITContributions(grossPay);
            // Calculate Tier 2 pension contributions
            const { employeeContribution: tier2Employee, employerContribution: tier2Employer } = this.calculateTier2Contributions(grossPay);
            // Calculate other deductions
            const customDeductions = (data.deductions || []).reduce((sum, ded) => sum + ded.amount, 0);
            // Total deductions
            const totalDeductions = incomeTax + ssnitEmployee + tier2Employee + customDeductions;
            // Net pay calculation
            const netPay = grossPay - totalDeductions;
            const netPayRounded = Math.round(netPay * 100) / 100;
            // Check minimum wage compliance
            const dailyPay = netPay / data.actualDaysWorked;
            const minimumWageCompliance = dailyPay >= this.ghanaMinimumWage;
            // Get YTD calculations
            const ytdCalculations = await this.calculateYTDAmounts(data.employeeId, data.payrollPeriod, grossPay, netPay, incomeTax, ssnitEmployee);
            // Create payroll record
            const payroll = existingPayroll || this.payrollRepo.create({
                tenantId: data.tenantId,
                payrollNumber,
                employeeId: data.employeeId,
                employeeNumber: employee.employeeNumber,
                employeeName: employee.fullName,
                payrollPeriod: data.payrollPeriod,
                periodStartDate: data.periodStartDate,
                periodEndDate: data.periodEndDate,
                workingDays,
                actualDaysWorked: data.actualDaysWorked,
                createdBy: data.calculatedBy,
            });
            // Update payroll calculations
            Object.assign(payroll, {
                basicSalary: employee.basicSalary,
                proratedSalary,
                overtimeHours: data.overtimeHours || 0,
                overtimePay,
                // Allowances
                housingAllowance: employee.housingAllowance,
                transportAllowance: employee.transportAllowance,
                fuelAllowance: employee.fuelAllowance,
                medicalAllowance: employee.medicalAllowance,
                mealAllowance: employee.mealAllowance,
                educationAllowance: employee.educationAllowance,
                riskAllowance: employee.riskAllowance,
                responsibilityAllowance: employee.responsibilityAllowance,
                totalAllowances,
                // Bonuses
                totalBonuses,
                // Gross and taxable
                grossPay,
                taxableIncome,
                // Taxes
                incomeTax,
                taxRateApplied: taxRate,
                // SSNIT
                ssnitEmployeeContribution: ssnitEmployee,
                ssnitEmployerContribution: ssnitEmployer,
                ssnitTotal: ssnitEmployee + ssnitEmployer,
                // Tier 2 Pension
                tier2EmployeeContribution: tier2Employee,
                tier2EmployerContribution: tier2Employer,
                totalPensionContributions: ssnitEmployee + tier2Employee,
                // Deductions
                totalDeductions,
                // Net Pay
                netPay: netPayRounded,
                netPayRounded,
                roundingDifference: netPay - netPayRounded,
                // Employer costs
                totalEmployerContribution: ssnitEmployer + tier2Employer,
                totalCostToCompany: grossPay + ssnitEmployer + tier2Employer,
                // Compliance
                minimumWageCompliance,
                minimumWageAmount: this.ghanaMinimumWage * data.actualDaysWorked,
                // Payment details
                paymentMethod: employee.bankAccountNumber ? payroll_entity_1.PaymentMethod.BANK_TRANSFER : payroll_entity_1.PaymentMethod.MOBILE_MONEY,
                bankAccountNumber: employee.bankAccountNumber,
                bankName: employee.bankName,
                mobileMoneyNumber: employee.mobileMoneyNumber,
                mobileMoneyNetwork: employee.mobileMoneyNetwork,
                // YTD amounts
                ytdGrossPay: ytdCalculations.grossPay,
                ytdNetPay: ytdCalculations.netPay,
                ytdIncomeTax: ytdCalculations.incomeTax,
                ytdSsnitEmployee: ytdCalculations.ssnitEmployee,
                // Status
                status: payroll_entity_1.PayrollStatus.CALCULATED,
                calculatedBy: data.calculatedBy,
                calculationDate: new Date(),
                // Employee details
                costCenter: employee.costCenter,
                department: employee.department,
                jobTitle: employee.jobTitle,
            });
            const savedPayroll = await queryRunner.manager.save(payroll);
            await queryRunner.commitTransaction();
            // Emit payroll calculated event
            this.eventEmitter.emit('payroll.calculated', {
                payrollId: savedPayroll.id,
                employeeId: data.employeeId,
                employeeName: employee.fullName,
                payrollPeriod: data.payrollPeriod,
                grossPay,
                netPay: netPayRounded,
                tenantId: data.tenantId,
            });
            this.logger.log(`Payroll calculated for ${employee.fullName} (${employee.employeeNumber}), Period: ${data.payrollPeriod}, Net Pay: GHS ${netPayRounded}`);
            return savedPayroll;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async approvePayroll(payrollId, approvedBy) {
        const payroll = await this.payrollRepo.findOne({
            where: { id: payrollId },
            relations: ['employee']
        });
        if (!payroll) {
            throw new common_1.NotFoundException('Payroll not found');
        }
        if (payroll.status !== payroll_entity_1.PayrollStatus.CALCULATED) {
            throw new common_1.BadRequestException('Payroll must be calculated before approval');
        }
        await this.payrollRepo.update(payrollId, {
            status: payroll_entity_1.PayrollStatus.APPROVED,
            approvedBy,
            approvalDate: new Date(),
        });
        // Emit approval event
        this.eventEmitter.emit('payroll.approved', {
            payrollId,
            employeeId: payroll.employeeId,
            approvedBy,
            netPay: payroll.netPay,
        });
        this.logger.log(`Payroll approved for ${payroll.employeeName}, Period: ${payroll.payrollPeriod}, Approved by: ${approvedBy}`);
        return await this.payrollRepo.findOne({ where: { id: payrollId } });
    }
    async processPayrollPayment(payrollId, processedBy) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const payroll = await this.payrollRepo.findOne({
                where: { id: payrollId },
                relations: ['employee']
            });
            if (!payroll) {
                throw new common_1.NotFoundException('Payroll not found');
            }
            if (payroll.status !== payroll_entity_1.PayrollStatus.APPROVED) {
                throw new common_1.BadRequestException('Payroll must be approved before processing payment');
            }
            // Generate payment reference
            const paymentReference = await this.generatePaymentReference(queryRunner, payroll.payrollPeriod);
            // Create journal entries for payroll
            await this.createPayrollJournalEntries(queryRunner, payroll);
            // Update payroll status
            await queryRunner.manager.update(payroll_entity_1.Payroll, payrollId, {
                status: payroll_entity_1.PayrollStatus.PROCESSED,
                processedBy,
                processingDate: new Date(),
                paymentReference,
                paymentDate: new Date(),
            });
            await queryRunner.commitTransaction();
            // Emit payment processed event
            this.eventEmitter.emit('payroll.payment-processed', {
                payrollId,
                employeeId: payroll.employeeId,
                paymentReference,
                netPay: payroll.netPay,
                processedBy,
            });
            this.logger.log(`Payroll payment processed for ${payroll.employeeName}, Reference: ${paymentReference}, Amount: GHS ${payroll.netPay}`);
            return await this.payrollRepo.findOne({ where: { id: payrollId } });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // ===== PAYROLL REPORTING =====
    async generatePayrollSummary(tenantId, payrollPeriod) {
        const payrolls = await this.payrollRepo.find({
            where: {
                tenantId,
                payrollPeriod,
                status: payroll_entity_1.PayrollStatus.APPROVED,
            }
        });
        const totalEmployees = payrolls.length;
        const totalGrossPay = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
        const totalNetPay = payrolls.reduce((sum, p) => sum + p.netPay, 0);
        const totalIncomeTax = payrolls.reduce((sum, p) => sum + p.incomeTax, 0);
        const totalSSNITEmployee = payrolls.reduce((sum, p) => sum + p.ssnitEmployeeContribution, 0);
        const totalSSNITEmployer = payrolls.reduce((sum, p) => sum + p.ssnitEmployerContribution, 0);
        const totalCostToCompany = payrolls.reduce((sum, p) => sum + p.totalCostToCompany, 0);
        const averageNetPay = totalEmployees > 0 ? totalNetPay / totalEmployees : 0;
        return {
            tenantId,
            payrollPeriod,
            totalEmployees,
            totalGrossPay,
            totalNetPay,
            totalIncomeTax,
            totalSSNITEmployee,
            totalSSNITEmployer,
            totalCostToCompany,
            averageNetPay,
        };
    }
    // ===== AUTOMATED PROCESSES =====
    async monthlyPayrollReminders() {
        this.logger.log('Starting monthly payroll reminders');
        try {
            // Send payroll processing reminders
            await this.sendPayrollProcessingReminders();
            // Generate payroll reports
            await this.generateMonthlyPayrollReports();
            this.logger.log('Monthly payroll reminders completed successfully');
        }
        catch (error) {
            this.logger.error('Failed to complete monthly payroll reminders:', error);
        }
    }
    // ===== PRIVATE HELPER METHODS =====
    calculateProratedSalary(basicSalary, workingDays, actualDaysWorked) {
        return (basicSalary / workingDays) * actualDaysWorked;
    }
    calculateOvertimePay(basicSalary, overtimeHours, workingDays) {
        if (overtimeHours <= 0)
            return 0;
        const hourlyRate = basicSalary / (workingDays * 8); // Assuming 8 hours per day
        return hourlyRate * overtimeHours * 1.5; // 1.5x overtime rate in Ghana
    }
    calculateTotalAllowances(employee) {
        return [
            employee.housingAllowance,
            employee.transportAllowance,
            employee.fuelAllowance,
            employee.medicalAllowance,
            employee.mealAllowance,
            employee.educationAllowance,
            employee.riskAllowance,
            employee.responsibilityAllowance,
        ].reduce((sum, allowance) => sum + (allowance || 0), 0);
    }
    calculateTaxableIncome(grossPay, employee) {
        // Some allowances may be non-taxable up to certain limits in Ghana
        // For simplicity, we're making most allowances taxable
        return grossPay;
    }
    calculateIncomeTax(annualTaxableIncome, employee) {
        // Personal relief in Ghana (tax-free amount)
        const personalRelief = 4800; // GHS 4,800 per annum
        const adjustedIncome = Math.max(0, annualTaxableIncome - personalRelief);
        let tax = 0;
        let applicableRate = 0;
        for (const bracket of this.ghanaTaxBrackets) {
            if (adjustedIncome > bracket.minIncome) {
                const taxableAtThisBracket = Math.min(adjustedIncome - bracket.minIncome, bracket.maxIncome - bracket.minIncome);
                tax = bracket.cumulativeTax + (taxableAtThisBracket * bracket.rate / 100);
                applicableRate = bracket.rate;
            }
            else {
                break;
            }
        }
        // Convert to monthly tax
        const monthlyTax = tax / 12;
        return {
            incomeTax: Math.max(0, monthlyTax),
            taxRate: applicableRate
        };
    }
    calculateSSNITContributions(grossPay) {
        // SSNIT contribution rates in Ghana
        const employeeRate = 0.055; // 5.5%
        const employerRate = 0.13; // 13%
        // SSNIT ceiling (maximum salary subject to SSNIT)
        const ssnitCeiling = 5000; // GHS 5,000 per month (example)
        const contributoryIncome = Math.min(grossPay, ssnitCeiling);
        return {
            employeeContribution: contributoryIncome * employeeRate,
            employerContribution: contributoryIncome * employerRate,
        };
    }
    calculateTier2Contributions(grossPay) {
        // Tier 2 pension contribution rates in Ghana
        const employeeRate = 0.05; // 5%
        const employerRate = 0.05; // 5%
        return {
            employeeContribution: grossPay * employeeRate,
            employerContribution: grossPay * employerRate,
        };
    }
    async calculateYTDAmounts(employeeId, currentPeriod, currentGross, currentNet, currentTax, currentSSNIT) {
        const year = currentPeriod.substring(0, 4);
        const ytdPayrolls = await this.payrollRepo.find({
            where: {
                employeeId,
                payrollPeriod: (0, typeorm_2.Between)(`${year}-01`, currentPeriod),
                status: payroll_entity_1.PayrollStatus.APPROVED,
            }
        });
        const ytdGross = ytdPayrolls.reduce((sum, p) => sum + p.grossPay, 0) + currentGross;
        const ytdNet = ytdPayrolls.reduce((sum, p) => sum + p.netPay, 0) + currentNet;
        const ytdTax = ytdPayrolls.reduce((sum, p) => sum + p.incomeTax, 0) + currentTax;
        const ytdSSNIT = ytdPayrolls.reduce((sum, p) => sum + p.ssnitEmployeeContribution, 0) + currentSSNIT;
        return {
            grossPay: ytdGross,
            netPay: ytdNet,
            incomeTax: ytdTax,
            ssnitEmployee: ytdSSNIT,
        };
    }
    async generatePayrollNumber(queryRunner, period) {
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM payrolls WHERE payroll_number LIKE $1`, [`PAY-${period}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `PAY-${period}-${sequence}`;
    }
    async generatePaymentReference(queryRunner, period) {
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM payrolls WHERE payment_reference LIKE $1`, [`PAYREF-${period}-%`]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `PAYREF-${period}-${sequence}`;
    }
    // Placeholder methods for complex processes
    async createPayrollJournalEntries(queryRunner, payroll) { }
    async sendPayrollProcessingReminders() { }
    async generateMonthlyPayrollReports() { }
};
exports.PayrollService = PayrollService;
__decorate([
    (0, schedule_1.Cron)('0 0 25 * *') // 25th of every month
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollService.prototype, "monthlyPayrollReminders", null);
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map