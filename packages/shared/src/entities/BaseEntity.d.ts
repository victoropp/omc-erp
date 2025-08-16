/**
 * Base Entity Classes
 * Eliminates duplicate entity patterns across all microservices
 */
export declare enum EntityStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    DELETED = "DELETED"
}
export declare enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum Currency {
    GHS = "GHS",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP"
}
export declare abstract class BaseEntity {
    id: string;
    tenantId: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    updateTimestamps(): void;
}
export declare abstract class BusinessEntity extends BaseEntity {
    status: EntityStatus;
    notes: string;
    tags: string[];
    metadata: Record<string, any>;
    version: number;
    incrementVersion(): void;
}
export declare abstract class FinancialEntity extends BusinessEntity {
    currency: Currency;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    calculateTotals(): void;
}
export declare abstract class PersonEntity extends BusinessEntity {
    firstName: string;
    lastName: string;
    middleName: string;
    title: string;
    email: string;
    phone: string;
    mobile: string;
    dateOfBirth: Date;
    gender: string;
    ghanaCardNumber: string;
    tinNumber: string;
    sssnitNumber: string;
    get fullName(): string;
}
export declare abstract class OrganizationEntity extends BusinessEntity {
    organizationName: string;
    tradingName: string;
    registrationNumber: string;
    tinNumber: string;
    vatNumber: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    establishmentDate: Date;
}
export interface AddressMixin {
    streetAddress: string;
    city: string;
    region: string;
    district: string;
    postalCode: string;
    country: string;
    ghanaPostGPS: string;
    latitude: number;
    longitude: number;
}
export declare const AddressColumns: {
    streetAddress: () => any;
    city: () => any;
    region: () => any;
    district: () => any;
    postalCode: () => any;
    country: () => any;
    ghanaPostGPS: () => any;
    latitude: () => any;
    longitude: () => any;
};
export interface AuditMixin {
    auditTrail: AuditTrailEntry[];
}
export interface AuditTrailEntry {
    action: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    timestamp: Date;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
}
export declare abstract class TransactionEntity extends FinancialEntity {
    transactionNumber: string;
    transactionDate: Date;
    referenceNumber: string;
    description: string;
    externalReference: string;
    generateTransactionNumber(): void;
}
export declare abstract class InventoryItemEntity extends BusinessEntity {
    itemCode: string;
    itemName: string;
    description: string;
    category: string;
    unitOfMeasure: string;
    unitPrice: number;
    costPrice: number;
    reorderLevel: number;
    maximumLevel: number;
}
export { BaseEntity as default };
//# sourceMappingURL=BaseEntity.d.ts.map