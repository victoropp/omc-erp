import { UserStatus, UserRole, FuelType, PaymentMethod, TransactionStatus, PaymentStatus, StationType, StationStatus, TankType, TankStatus, CustomerType, CustomerStatus, LoyaltyTier, InvoiceStatus, SubscriptionPlan, SubscriptionStatus, Currency, PBUComponentCategory, PBUComponentUnit, PricingWindowStatus, UPPFClaimStatus, DeliveryStatus, DealerLoanStatus, RepaymentFrequency, AmortizationMethod, DealerSettlementStatus, RegulatoryDocType, InventoryMovementType, RouteStatus } from './enums';
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface User extends BaseEntity {
    tenantId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRole;
    status: UserStatus;
    lastLoginAt?: Date;
    emailVerifiedAt?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    createdBy?: string;
    updatedBy?: string;
}
export interface Tenant extends BaseEntity {
    companyName: string;
    companyCode: string;
    licenseNumber: string;
    businessRegistration?: string;
    taxIdentification?: string;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt?: Date;
    billingContact?: {
        name: string;
        email: string;
        phone: string;
        address: Address;
    };
    technicalContact?: {
        name: string;
        email: string;
        phone: string;
    };
    settings: Record<string, unknown>;
}
export interface Address {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    country: string;
    gpsCoordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface Station extends BaseEntity {
    tenantId: string;
    name: string;
    code: string;
    stationType: StationType;
    address: Address;
    managerId?: string;
    phoneNumber?: string;
    email?: string;
    operatingHours?: {
        [key: string]: {
            open: string;
            close: string;
        };
    };
    fuelTypes: FuelType[];
    status: StationStatus;
    commissionRate?: number;
    lastInspectionDate?: Date;
    licenseExpiryDate?: Date;
}
export interface Tank extends BaseEntity {
    stationId: string;
    tankNumber: number;
    fuelType: FuelType;
    capacity: number;
    currentLevel: number;
    minimumLevel: number;
    maximumLevel: number;
    tankType: TankType;
    material?: string;
    installationDate?: Date;
    lastCalibrationDate?: Date;
    calibrationCertificate?: string;
    status: TankStatus;
    sensorId?: string;
}
export interface Pump extends BaseEntity {
    stationId: string;
    pumpNumber: number;
    tankId: string;
    nozzleCount: number;
    pumpType: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    installationDate?: Date;
    lastCalibrationDate?: Date;
    calibrationCertificate?: string;
    status: string;
}
export interface Transaction extends BaseEntity {
    tenantId: string;
    stationId: string;
    pumpId: string;
    tankId: string;
    attendantId?: string;
    customerId?: string;
    shiftId?: string;
    fuelType: FuelType;
    quantityLiters: number;
    unitPrice: number;
    grossAmount: number;
    taxRate: number;
    taxAmount: number;
    serviceCharge: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    paymentStatus: PaymentStatus;
    paymentProcessedAt?: Date;
    receiptNumber: string;
    posReference?: string;
    transactionTime: Date;
    status: TransactionStatus;
    temperature?: number;
    density?: number;
    loyaltyPointsAwarded: number;
    discountAmount: number;
}
export interface Customer extends BaseEntity {
    tenantId: string;
    customerType: CustomerType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phoneNumber?: string;
    address?: Address;
    taxId?: string;
    businessRegistration?: string;
    creditLimit: number;
    paymentTerms: number;
    loyaltyCardNumber?: string;
    loyaltyPoints: number;
    loyaltyTier: LoyaltyTier;
    status: CustomerStatus;
    registrationDate: Date;
}
export interface Invoice extends BaseEntity {
    tenantId: string;
    invoiceNumber: string;
    customerId: string;
    stationId?: string;
    issueDate: Date;
    dueDate: Date;
    currency: Currency;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    paymentTerms?: number;
    lateFeeRate?: number;
    status: InvoiceStatus;
    notes?: string;
    createdBy?: string;
    lineItems: InvoiceLineItem[];
}
export interface InvoiceLineItem {
    id: string;
    description: string;
    fuelType?: FuelType;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxRate: number;
    taxAmount: number;
    lineOrder: number;
}
export interface StockReceipt extends BaseEntity {
    tenantId: string;
    stationId: string;
    supplierId: string;
    vehicleId?: string;
    driverId?: string;
    receiptNumber: string;
    deliveryNoteNumber?: string;
    purchaseOrderId?: string;
    totalQuantity: number;
    totalValue: number;
    currency: Currency;
    qualityCertificate?: string;
    temperatureRecorded?: number;
    densityRecorded?: number;
    qualityStatus: string;
    qualityNotes?: string;
    photos?: string[];
    documents?: string[];
    scheduledDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    receiptConfirmedAt?: Date;
    status: string;
    notes?: string;
    createdBy?: string;
    items: StockReceiptItem[];
}
export interface StockReceiptItem {
    id: string;
    tankId: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    temperature?: number;
    density?: number;
}
export interface Vehicle extends BaseEntity {
    tenantId: string;
    licensePlate: string;
    vehicleType: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    totalCapacity?: number;
    compartmentCount: number;
    compartmentConfig?: Array<{
        compartmentNumber: number;
        capacity: number;
        fuelType?: FuelType;
    }>;
    registrationExpiry?: Date;
    insuranceExpiry?: Date;
    roadWorthyExpiry?: Date;
    gpsDeviceId?: string;
    status: string;
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    currentDriverId?: string;
}
export interface Driver extends BaseEntity {
    tenantId: string;
    driverLicense: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    address?: Address;
    licenseClass: string;
    licenseExpiry: Date;
    hazmatCertified: boolean;
    hazmatExpiry?: Date;
    employeeId?: string;
    hireDate?: Date;
    status: string;
}
export interface Shift extends BaseEntity {
    tenantId: string;
    stationId: string;
    attendantId: string;
    shiftNumber: string;
    startTime: Date;
    endTime?: Date;
    openingCash: number;
    closingCash?: number;
    totalSales?: number;
    totalTransactions?: number;
    status: string;
    notes?: string;
}
export interface Supplier extends BaseEntity {
    tenantId: string;
    name: string;
    code: string;
    contactPerson?: string;
    email?: string;
    phoneNumber?: string;
    address?: Address;
    taxId?: string;
    businessRegistration?: string;
    paymentTerms?: number;
    creditLimit?: number;
    status: string;
}
export interface AuditLog {
    id: string;
    tenantId: string;
    tableName: string;
    operation: string;
    recordId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    changedBy: string;
    changedAt: Date;
    ipAddress?: string;
    userAgent?: string;
}
export interface PBUComponent extends BaseEntity {
    tenantId: string;
    componentCode: string;
    name: string;
    category: PBUComponentCategory;
    unit: PBUComponentUnit;
    rateValue: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    sourceDocId?: string;
    approvalRef?: string;
    isActive: boolean;
}
export interface PricingWindow extends BaseEntity {
    windowId: string;
    tenantId: string;
    startDate: Date;
    endDate: Date;
    npaGuidelineDocId?: string;
    status: PricingWindowStatus;
}
export interface StationPrice extends BaseEntity {
    stationId: string;
    productId: string;
    windowId: string;
    exPumpPrice: number;
    calcBreakdownJson: PriceBreakdown;
    publishedAt?: Date;
    tenantId: string;
}
export interface PriceBreakdown {
    components: Array<{
        code: string;
        name: string;
        value: number;
        unit: PBUComponentUnit;
    }>;
    totalPrice: number;
    sourceDocuments: string[];
}
export interface EqualisationPoint extends BaseEntity {
    routeId: string;
    routeName: string;
    depotId: string;
    kmThreshold: number;
    tariffPerLitreKm: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    tenantId: string;
}
export interface DeliveryConsignment extends BaseEntity {
    consignmentNumber: string;
    depotId: string;
    stationId: string;
    productId: string;
    routeId: string;
    litresLoaded: number;
    litresReceived?: number;
    kmPlanned: number;
    kmActual?: number;
    dispatchDate: Date;
    arrivalDate?: Date;
    gpsTraceId?: string;
    waybillNumber: string;
    status: DeliveryStatus;
    tenantId: string;
}
export interface UPPFClaim extends BaseEntity {
    claimId: string;
    windowId: string;
    deliveryId: string;
    routeId: string;
    kmBeyondEqualisation: number;
    litresMoved: number;
    tariffPerLitreKm: number;
    amountDue: number;
    status: UPPFClaimStatus;
    evidenceLinks: string[];
    submittedAt?: Date;
    approvedAt?: Date;
    paidAt?: Date;
    rejectionReason?: string;
    tenantId: string;
}
export interface DealerLoan extends BaseEntity {
    loanId: string;
    stationId: string;
    dealerId: string;
    principalAmount: number;
    interestRate: number;
    tenorMonths: number;
    repaymentFrequency: RepaymentFrequency;
    amortizationMethod: AmortizationMethod;
    startDate: Date;
    maturityDate: Date;
    status: DealerLoanStatus;
    outstandingBalance: number;
    tenantId: string;
}
export interface DealerSettlement extends BaseEntity {
    stationId: string;
    windowId: string;
    settlementDate: Date;
    totalLitresSold: number;
    grossDealerMargin: number;
    loanDeduction: number;
    otherDeductions: number;
    netPayable: number;
    status: DealerSettlementStatus;
    paymentDate?: Date;
    paymentReference?: string;
    tenantId: string;
}
export interface RegulatoryDoc extends BaseEntity {
    docId: string;
    type: RegulatoryDocType;
    title: string;
    fileUrl: string;
    fileHash: string;
    uploadDate: Date;
    effectiveDate: Date;
    tenantId: string;
    uploadedBy: string;
}
export interface GPSTrace extends BaseEntity {
    traceId: string;
    deliveryId: string;
    vehicleId: string;
    startTime: Date;
    endTime?: Date;
    totalKm: number;
    routePoints: GPSPoint[];
    tenantId: string;
}
export interface GPSPoint {
    latitude: number;
    longitude: number;
    timestamp: Date;
    speed?: number;
    heading?: number;
}
export interface Route extends BaseEntity {
    routeId: string;
    routeName: string;
    depotId: string;
    stationIds: string[];
    totalKm: number;
    estimatedTravelTime: number;
    status: RouteStatus;
    tenantId: string;
}
export interface InventoryMovement extends BaseEntity {
    tankId: string;
    transactionId?: string;
    deliveryId?: string;
    type: InventoryMovementType;
    quantity: number;
    previousLevel: number;
    newLevel: number;
    notes?: string;
    tenantId: string;
}
//# sourceMappingURL=models.d.ts.map