import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateCustomerDto {
    customerType: 'INDIVIDUAL' | 'CORPORATE' | 'GOVERNMENT';
    categoryId?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phonePrimary: string;
    phoneSecondary?: string;
    tinNumber?: string;
    businessRegistrationNumber?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    postalCode?: string;
    creditLimit?: number;
    paymentTermsDays?: number;
    discountPercentage?: number;
    preferredStationId?: string;
    salesRepId?: string;
}
export interface LoyaltyTransactionDto {
    customerId: string;
    transactionType: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
    pointsAmount: number;
    referenceType?: string;
    referenceId?: string;
    description: string;
}
export interface CustomerVehicleDto {
    customerId: string;
    vehicleNumber: string;
    vehicleType?: string;
    make?: string;
    model?: string;
    year?: number;
    fuelType: 'PETROL' | 'DIESEL' | 'LPG';
    tankCapacity?: number;
    averageConsumption?: number;
    driverName?: string;
    driverPhone?: string;
}
export declare class CustomerService {
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(dataSource: DataSource, eventEmitter: EventEmitter2);
    /**
     * Create a new customer
     */
    createCustomer(data: CreateCustomerDto): Promise<any>;
    /**
     * Process loyalty points earning
     */
    earnLoyaltyPoints(customerId: string, transactionAmount: number, litersQuantity: number, referenceType: string, referenceId: string): Promise<any>;
    /**
     * Redeem loyalty points
     */
    redeemLoyaltyPoints(customerId: string, pointsToRedeem: number, redemptionType: string, description: string): Promise<any>;
    /**
     * Create or update customer vehicle
     */
    registerVehicle(data: CustomerVehicleDto): Promise<any>;
    /**
     * Get customer statement
     */
    getCustomerStatement(customerId: string, startDate: Date, endDate: Date): Promise<any>;
    /**
     * Get customer analytics
     */
    getCustomerAnalytics(customerId: string): Promise<any>;
    /**
     * Process loyalty tier upgrades/downgrades
     */
    processLoyaltyTiers(): Promise<void>;
    /**
     * Process expired loyalty points
     */
    processExpiredPoints(): Promise<void>;
    /**
     * Helper methods
     */
    private generateCustomerCode;
    private getARAccountCode;
    private createCustomerSubLedger;
    private initializeLoyaltyAccount;
    private getTierMultiplier;
    private checkTierUpgrade;
    private checkTierDowngrade;
}
//# sourceMappingURL=customer.service.d.ts.map