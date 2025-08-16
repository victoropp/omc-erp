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
var CustomerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const date_fns_1 = require("date-fns");
let CustomerService = CustomerService_1 = class CustomerService {
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(CustomerService_1.name);
    constructor(dataSource, eventEmitter) {
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    /**
     * Create a new customer
     */
    async createCustomer(data) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Generate customer code
            const customerCode = await this.generateCustomerCode(queryRunner, data.customerType);
            // Validate email uniqueness
            const existingEmail = await queryRunner.manager.query('SELECT id FROM customers WHERE email = $1', [data.email]);
            if (existingEmail.length > 0) {
                throw new common_1.BadRequestException('Email already exists');
            }
            // Get AR account code based on customer type
            const arAccountCode = await this.getARAccountCode(queryRunner, data.customerType);
            // Create customer
            const customer = await queryRunner.manager.query(`INSERT INTO customers (
          customer_code, customer_type, category_id, company_name,
          first_name, last_name, email, phone_primary, phone_secondary,
          tin_number, business_registration_number, address_line1, address_line2,
          city, region, postal_code, credit_limit, payment_terms_days,
          discount_percentage, account_receivable_code, loyalty_points,
          loyalty_tier, preferred_station_id, sales_rep_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING *`, [
                customerCode,
                data.customerType,
                data.categoryId,
                data.companyName,
                data.firstName,
                data.lastName,
                data.email,
                data.phonePrimary,
                data.phoneSecondary,
                data.tinNumber,
                data.businessRegistrationNumber,
                data.addressLine1,
                data.addressLine2,
                data.city,
                data.region,
                data.postalCode,
                data.creditLimit || 0,
                data.paymentTermsDays || 0,
                data.discountPercentage || 0,
                arAccountCode,
                0, // Initial loyalty points
                'BRONZE', // Initial tier
                data.preferredStationId,
                data.salesRepId,
            ]);
            // Create sub-ledger account for customer
            await this.createCustomerSubLedger(queryRunner, customer[0]);
            // Initialize loyalty account
            await this.initializeLoyaltyAccount(queryRunner, customer[0].id);
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('customer.created', {
                customerId: customer[0].id,
                customerCode: customerCode,
                customerType: data.customerType,
            });
            this.logger.log(`Customer ${customerCode} created successfully`);
            return customer[0];
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to create customer:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Process loyalty points earning
     */
    async earnLoyaltyPoints(customerId, transactionAmount, litersQuantity, referenceType, referenceId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get customer and loyalty program
            const customer = await queryRunner.manager.query('SELECT * FROM customers WHERE id = $1', [customerId]);
            if (!customer[0]) {
                throw new common_1.NotFoundException('Customer not found');
            }
            // Get active loyalty program
            const loyaltyProgram = await queryRunner.manager.query(`SELECT * FROM loyalty_programs 
        WHERE is_active = true 
        AND CURRENT_DATE BETWEEN valid_from AND COALESCE(valid_to, '9999-12-31')
        LIMIT 1`);
            if (!loyaltyProgram[0]) {
                this.logger.warn('No active loyalty program found');
                return null;
            }
            // Calculate points
            const pointsFromAmount = Math.floor(transactionAmount * (loyaltyProgram[0].points_per_cedi || 1));
            const pointsFromLiters = Math.floor(litersQuantity * (loyaltyProgram[0].points_per_liter || 1));
            const totalPoints = pointsFromAmount + pointsFromLiters;
            // Apply tier multiplier
            const tierMultiplier = this.getTierMultiplier(customer[0].loyalty_tier);
            const finalPoints = Math.floor(totalPoints * tierMultiplier);
            // Update customer points
            const newBalance = customer[0].loyalty_points + finalPoints;
            await queryRunner.manager.query('UPDATE customers SET loyalty_points = $1 WHERE id = $2', [newBalance, customerId]);
            // Record transaction
            const loyaltyTransaction = await queryRunner.manager.query(`INSERT INTO loyalty_transactions (
          customer_id, transaction_type, points_amount,
          balance_after, reference_type, reference_id,
          description, expiry_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`, [
                customerId,
                'EARNED',
                finalPoints,
                newBalance,
                referenceType,
                referenceId,
                `Earned ${finalPoints} points from fuel purchase`,
                (0, date_fns_1.addMonths)(new Date(), 12), // Points expire after 12 months
            ]);
            // Check for tier upgrade
            await this.checkTierUpgrade(queryRunner, customerId, newBalance);
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('loyalty.earned', {
                customerId,
                pointsEarned: finalPoints,
                newBalance,
                transactionId: loyaltyTransaction[0].id,
            });
            return {
                pointsEarned: finalPoints,
                newBalance,
                tier: customer[0].loyalty_tier,
                transaction: loyaltyTransaction[0],
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to earn loyalty points:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Redeem loyalty points
     */
    async redeemLoyaltyPoints(customerId, pointsToRedeem, redemptionType, description) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get customer
            const customer = await queryRunner.manager.query('SELECT * FROM customers WHERE id = $1', [customerId]);
            if (!customer[0]) {
                throw new common_1.NotFoundException('Customer not found');
            }
            // Check sufficient points
            if (customer[0].loyalty_points < pointsToRedeem) {
                throw new common_1.BadRequestException(`Insufficient points. Available: ${customer[0].loyalty_points}, Requested: ${pointsToRedeem}`);
            }
            // Get loyalty program for redemption rate
            const loyaltyProgram = await queryRunner.manager.query(`SELECT * FROM loyalty_programs 
        WHERE is_active = true 
        LIMIT 1`);
            const redemptionValue = pointsToRedeem * (loyaltyProgram[0]?.redemption_rate || 0.01);
            const newBalance = customer[0].loyalty_points - pointsToRedeem;
            // Update customer points
            await queryRunner.manager.query('UPDATE customers SET loyalty_points = $1 WHERE id = $2', [newBalance, customerId]);
            // Record transaction
            const loyaltyTransaction = await queryRunner.manager.query(`INSERT INTO loyalty_transactions (
          customer_id, transaction_type, points_amount,
          balance_after, reference_type, description
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`, [
                customerId,
                'REDEEMED',
                -pointsToRedeem,
                newBalance,
                redemptionType,
                description,
            ]);
            // Check for tier downgrade
            await this.checkTierDowngrade(queryRunner, customerId, newBalance);
            await queryRunner.commitTransaction();
            // Emit event
            this.eventEmitter.emit('loyalty.redeemed', {
                customerId,
                pointsRedeemed: pointsToRedeem,
                redemptionValue,
                newBalance,
                transactionId: loyaltyTransaction[0].id,
            });
            return {
                pointsRedeemed: pointsToRedeem,
                redemptionValue,
                newBalance,
                transaction: loyaltyTransaction[0],
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to redeem loyalty points:', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Create or update customer vehicle
     */
    async registerVehicle(data) {
        try {
            // Check if vehicle already exists
            const existing = await this.dataSource.query('SELECT id FROM customer_vehicles WHERE vehicle_number = $1', [data.vehicleNumber]);
            if (existing.length > 0) {
                // Update existing vehicle
                await this.dataSource.query(`UPDATE customer_vehicles SET
            customer_id = $1, vehicle_type = $2, make = $3,
            model = $4, year = $5, fuel_type = $6,
            tank_capacity = $7, average_consumption = $8,
            driver_name = $9, driver_phone = $10
          WHERE vehicle_number = $11`, [
                    data.customerId,
                    data.vehicleType,
                    data.make,
                    data.model,
                    data.year,
                    data.fuelType,
                    data.tankCapacity,
                    data.averageConsumption,
                    data.driverName,
                    data.driverPhone,
                    data.vehicleNumber,
                ]);
                return existing[0];
            }
            else {
                // Create new vehicle
                const vehicle = await this.dataSource.query(`INSERT INTO customer_vehicles (
            customer_id, vehicle_number, vehicle_type, make,
            model, year, fuel_type, tank_capacity,
            average_consumption, driver_name, driver_phone
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`, [
                    data.customerId,
                    data.vehicleNumber,
                    data.vehicleType,
                    data.make,
                    data.model,
                    data.year,
                    data.fuelType,
                    data.tankCapacity,
                    data.averageConsumption,
                    data.driverName,
                    data.driverPhone,
                ]);
                this.logger.log(`Vehicle ${data.vehicleNumber} registered for customer ${data.customerId}`);
                return vehicle[0];
            }
        }
        catch (error) {
            this.logger.error('Failed to register vehicle:', error);
            throw error;
        }
    }
    /**
     * Get customer statement
     */
    async getCustomerStatement(customerId, startDate, endDate) {
        try {
            // Get customer details
            const customer = await this.dataSource.query('SELECT * FROM customers WHERE id = $1', [customerId]);
            if (!customer[0]) {
                throw new common_1.NotFoundException('Customer not found');
            }
            // Get transactions
            const transactions = await this.dataSource.query(`SELECT 
          ft.transaction_date,
          ft.transaction_number,
          ft.product_type,
          ft.quantity_liters,
          ft.unit_price,
          ft.total_amount,
          ft.payment_status,
          s.name as station_name
        FROM fuel_transactions ft
        JOIN stations s ON s.id = ft.station_id
        WHERE ft.customer_id = $1
        AND ft.transaction_date BETWEEN $2 AND $3
        ORDER BY ft.transaction_date DESC`, [customerId, startDate, endDate]);
            // Get invoices
            const invoices = await this.dataSource.query(`SELECT 
          invoice_number,
          invoice_date,
          due_date,
          total_amount,
          paid_amount,
          balance_amount,
          status
        FROM invoices
        WHERE customer_id = $1
        AND invoice_date BETWEEN $2 AND $3
        ORDER BY invoice_date DESC`, [customerId, startDate, endDate]);
            // Get payments
            const payments = await this.dataSource.query(`SELECT 
          pt.initiated_at as payment_date,
          pt.amount,
          pt.status,
          pm.method_name
        FROM payment_transactions pt
        JOIN payment_methods pm ON pm.id = pt.payment_method_id
        WHERE pt.reference_type = 'INVOICE'
        AND pt.reference_id IN (
          SELECT id FROM invoices WHERE customer_id = $1
        )
        AND pt.initiated_at BETWEEN $2 AND $3
        ORDER BY pt.initiated_at DESC`, [customerId, startDate, endDate]);
            // Get loyalty transactions
            const loyaltyTransactions = await this.dataSource.query(`SELECT 
          created_at as transaction_date,
          transaction_type,
          points_amount,
          balance_after,
          description
        FROM loyalty_transactions
        WHERE customer_id = $1
        AND created_at BETWEEN $2 AND $3
        ORDER BY created_at DESC`, [customerId, startDate, endDate]);
            // Calculate summary
            const totalPurchases = transactions.reduce((sum, t) => sum + t.total_amount, 0);
            const totalInvoiced = invoices.reduce((sum, i) => sum + i.total_amount, 0);
            const totalPaid = payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
            const outstandingBalance = customer[0].current_balance;
            return {
                customer: customer[0],
                period: { startDate, endDate },
                transactions,
                invoices,
                payments,
                loyaltyTransactions,
                summary: {
                    totalPurchases,
                    totalInvoiced,
                    totalPaid,
                    outstandingBalance,
                    loyaltyPointsBalance: customer[0].loyalty_points,
                    loyaltyTier: customer[0].loyalty_tier,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer statement:', error);
            throw error;
        }
    }
    /**
     * Get customer analytics
     */
    async getCustomerAnalytics(customerId) {
        try {
            // Purchase frequency
            const purchaseFrequency = await this.dataSource.query(`SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          COUNT(*) as transaction_count,
          SUM(quantity_liters) as total_liters,
          SUM(total_amount) as total_amount
        FROM fuel_transactions
        WHERE customer_id = $1
        AND transaction_date > NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY month`, [customerId]);
            // Product preferences
            const productPreferences = await this.dataSource.query(`SELECT 
          product_type,
          COUNT(*) as purchase_count,
          SUM(quantity_liters) as total_liters,
          SUM(total_amount) as total_amount,
          AVG(quantity_liters) as avg_quantity
        FROM fuel_transactions
        WHERE customer_id = $1
        GROUP BY product_type
        ORDER BY total_amount DESC`, [customerId]);
            // Station preferences
            const stationPreferences = await this.dataSource.query(`SELECT 
          s.name as station_name,
          COUNT(*) as visit_count,
          SUM(ft.total_amount) as total_spent,
          MAX(ft.transaction_date) as last_visit
        FROM fuel_transactions ft
        JOIN stations s ON s.id = ft.station_id
        WHERE ft.customer_id = $1
        GROUP BY s.id, s.name
        ORDER BY visit_count DESC`, [customerId]);
            // Payment behavior
            const paymentBehavior = await this.dataSource.query(`SELECT 
          pm.method_name,
          COUNT(*) as usage_count,
          SUM(pt.amount) as total_amount
        FROM payment_transactions pt
        JOIN payment_methods pm ON pm.id = pt.payment_method_id
        WHERE pt.reference_type = 'FUEL_TRANSACTION'
        AND pt.reference_id IN (
          SELECT id FROM fuel_transactions WHERE customer_id = $1
        )
        GROUP BY pm.id, pm.method_name
        ORDER BY usage_count DESC`, [customerId]);
            // Lifetime value
            const lifetimeValue = await this.dataSource.query(`SELECT 
          COUNT(DISTINCT ft.id) as total_transactions,
          SUM(ft.total_amount) as lifetime_spent,
          AVG(ft.total_amount) as avg_transaction_value,
          MIN(ft.transaction_date) as first_purchase,
          MAX(ft.transaction_date) as last_purchase,
          COUNT(DISTINCT DATE_TRUNC('month', ft.transaction_date)) as active_months
        FROM fuel_transactions ft
        WHERE ft.customer_id = $1`, [customerId]);
            return {
                purchaseFrequency,
                productPreferences,
                stationPreferences,
                paymentBehavior,
                lifetimeValue: lifetimeValue[0],
            };
        }
        catch (error) {
            this.logger.error('Failed to get customer analytics:', error);
            throw error;
        }
    }
    /**
     * Process loyalty tier upgrades/downgrades
     */
    async processLoyaltyTiers() {
        try {
            this.logger.log('Processing loyalty tier updates...');
            // Get tier thresholds from configuration
            const tierThresholds = {
                BRONZE: 0,
                SILVER: 5000,
                GOLD: 20000,
                PLATINUM: 50000,
            };
            // Update all customer tiers based on points
            for (const [tier, threshold] of Object.entries(tierThresholds)) {
                await this.dataSource.query(`UPDATE customers 
          SET loyalty_tier = $1
          WHERE loyalty_points >= $2
          AND loyalty_points < $3`, [
                    tier,
                    threshold,
                    tierThresholds[Object.keys(tierThresholds)[Object.keys(tierThresholds).indexOf(tier) + 1]] || 999999999,
                ]);
            }
            this.logger.log('Loyalty tier updates completed');
        }
        catch (error) {
            this.logger.error('Failed to process loyalty tiers:', error);
        }
    }
    /**
     * Process expired loyalty points
     */
    async processExpiredPoints() {
        try {
            this.logger.log('Processing expired loyalty points...');
            // Find expired points
            const expiredPoints = await this.dataSource.query(`SELECT 
          customer_id,
          SUM(points_amount) as expired_amount
        FROM loyalty_transactions
        WHERE transaction_type = 'EARNED'
        AND expiry_date < CURRENT_DATE
        AND points_amount > 0
        AND NOT EXISTS (
          SELECT 1 FROM loyalty_transactions lt2
          WHERE lt2.reference_type = 'EXPIRY'
          AND lt2.reference_id = loyalty_transactions.id::text
        )
        GROUP BY customer_id`);
            for (const record of expiredPoints) {
                // Create expiry transaction
                await this.dataSource.query(`INSERT INTO loyalty_transactions (
            customer_id, transaction_type, points_amount,
            balance_after, description
          ) VALUES ($1, $2, $3, 
            (SELECT loyalty_points - $3 FROM customers WHERE id = $1),
            $4)`, [
                    record.customer_id,
                    'EXPIRED',
                    -record.expired_amount,
                    `${record.expired_amount} points expired`,
                ]);
                // Update customer balance
                await this.dataSource.query(`UPDATE customers 
          SET loyalty_points = loyalty_points - $1
          WHERE id = $2`, [record.expired_amount, record.customer_id]);
            }
            this.logger.log(`Processed ${expiredPoints.length} expired point records`);
        }
        catch (error) {
            this.logger.error('Failed to process expired points:', error);
        }
    }
    /**
     * Helper methods
     */
    async generateCustomerCode(queryRunner, customerType) {
        const prefix = customerType === 'INDIVIDUAL' ? 'IND' :
            customerType === 'CORPORATE' ? 'COR' : 'GOV';
        const result = await queryRunner.manager.query(`SELECT COUNT(*) as count FROM customers WHERE customer_type = $1`, [customerType]);
        const sequence = (parseInt(result[0].count) + 1).toString().padStart(6, '0');
        return `${prefix}-${sequence}`;
    }
    async getARAccountCode(queryRunner, customerType) {
        // Different AR accounts for different customer types
        const accountMap = {
            'INDIVIDUAL': '1211',
            'CORPORATE': '1212',
            'GOVERNMENT': '1213',
        };
        return accountMap[customerType] || '1210';
    }
    async createCustomerSubLedger(queryRunner, customer) {
        // Create sub-ledger account for customer
        await queryRunner.manager.query(`INSERT INTO chart_of_accounts (
        account_code, parent_account_code, account_name,
        account_type, account_category, normal_balance,
        is_control_account, currency_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (account_code) DO NOTHING`, [
            `${customer.account_receivable_code}-${customer.customer_code}`,
            customer.account_receivable_code,
            `AR - ${customer.company_name || `${customer.first_name} ${customer.last_name}`}`,
            'ASSET',
            'CURRENT_ASSET',
            'DEBIT',
            false,
            'GHS',
        ]);
    }
    async initializeLoyaltyAccount(queryRunner, customerId) {
        // Initialize with welcome bonus if configured
        const welcomeBonus = await queryRunner.manager.query(`SELECT config_value FROM system_configurations 
      WHERE module_name = 'LOYALTY' AND config_key = 'WELCOME_BONUS'`);
        if (welcomeBonus[0]?.config_value) {
            const bonusPoints = parseInt(welcomeBonus[0].config_value);
            await queryRunner.manager.query(`INSERT INTO loyalty_transactions (
          customer_id, transaction_type, points_amount,
          balance_after, description
        ) VALUES ($1, $2, $3, $4, $5)`, [
                customerId,
                'EARNED',
                bonusPoints,
                bonusPoints,
                'Welcome bonus',
            ]);
            await queryRunner.manager.query(`UPDATE customers SET loyalty_points = $1 WHERE id = $2`, [bonusPoints, customerId]);
        }
    }
    getTierMultiplier(tier) {
        const multipliers = {
            'BRONZE': 1.0,
            'SILVER': 1.1,
            'GOLD': 1.25,
            'PLATINUM': 1.5,
        };
        return multipliers[tier] || 1.0;
    }
    async checkTierUpgrade(queryRunner, customerId, newBalance) {
        const tierThresholds = [
            { tier: 'PLATINUM', threshold: 50000 },
            { tier: 'GOLD', threshold: 20000 },
            { tier: 'SILVER', threshold: 5000 },
            { tier: 'BRONZE', threshold: 0 },
        ];
        for (const { tier, threshold } of tierThresholds) {
            if (newBalance >= threshold) {
                await queryRunner.manager.query(`UPDATE customers SET loyalty_tier = $1 WHERE id = $2 AND loyalty_tier != $1`, [tier, customerId]);
                break;
            }
        }
    }
    async checkTierDowngrade(queryRunner, customerId, newBalance) {
        // Similar to upgrade but in reverse
        await this.checkTierUpgrade(queryRunner, customerId, newBalance);
    }
};
exports.CustomerService = CustomerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerService.prototype, "processLoyaltyTiers", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerService.prototype, "processExpiredPoints", null);
exports.CustomerService = CustomerService = CustomerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], CustomerService);
//# sourceMappingURL=customer.service.js.map