import { FuelType, PaymentMethod, TransactionStatus, UserRole, UserStatus, StationType, CustomerType, VehicleType } from './enums';
export interface LoginDto {
    username: string;
    password: string;
    tenantId?: string;
}
export interface RegisterDto {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    tenantId: string;
}
export interface TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}
export interface RefreshTokenDto {
    refreshToken: string;
}
export interface CreateUserDto {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRole;
    tenantId: string;
}
export interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: UserRole;
    status?: UserStatus;
}
export interface CreateStationDto {
    name: string;
    code: string;
    stationType: StationType;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
        gpsCoordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    managerId?: string;
    phoneNumber?: string;
    email?: string;
    fuelTypes: FuelType[];
    operatingHours?: Record<string, {
        open: string;
        close: string;
    }>;
}
export interface UpdateStationDto {
    name?: string;
    address?: {
        street?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };
    managerId?: string;
    phoneNumber?: string;
    email?: string;
    operatingHours?: Record<string, {
        open: string;
        close: string;
    }>;
    status?: string;
}
export interface CreateTransactionDto {
    stationId: string;
    pumpId: string;
    attendantId?: string;
    customerId?: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    paymentMethod: PaymentMethod;
    paymentDetails?: {
        provider?: string;
        phoneNumber?: string;
        cardNumber?: string;
        voucherCode?: string;
    };
    posReference?: string;
}
export interface UpdateTransactionDto {
    status?: TransactionStatus;
    paymentStatus?: string;
    paymentReference?: string;
    notes?: string;
}
export interface CreateTankDto {
    stationId: string;
    tankNumber: number;
    fuelType: FuelType;
    capacity: number;
    minimumLevel: number;
    maximumLevel: number;
    tankType: string;
    material?: string;
    sensorId?: string;
}
export interface UpdateTankDto {
    currentLevel?: number;
    minimumLevel?: number;
    maximumLevel?: number;
    status?: string;
    lastCalibrationDate?: Date;
    calibrationCertificate?: string;
}
export interface CreateCustomerDto {
    customerType: CustomerType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phoneNumber?: string;
    address?: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
    };
    taxId?: string;
    businessRegistration?: string;
    creditLimit?: number;
    paymentTerms?: number;
}
export interface UpdateCustomerDto {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };
    creditLimit?: number;
    paymentTerms?: number;
    status?: string;
}
export interface CreateInvoiceDto {
    customerId: string;
    stationId?: string;
    dueDate: Date;
    lineItems: CreateInvoiceLineItemDto[];
    paymentTerms?: number;
    notes?: string;
}
export interface CreateInvoiceLineItemDto {
    description: string;
    fuelType?: FuelType;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}
export interface CreateStockReceiptDto {
    stationId: string;
    supplierId: string;
    vehicleId?: string;
    driverId?: string;
    deliveryNoteNumber?: string;
    purchaseOrderId?: string;
    items: CreateStockReceiptItemDto[];
    qualityCertificate?: string;
    temperatureRecorded?: number;
    densityRecorded?: number;
    photos?: string[];
    documents?: string[];
    notes?: string;
}
export interface CreateStockReceiptItemDto {
    tankId: string;
    fuelType: FuelType;
    quantity: number;
    unitPrice: number;
    temperature?: number;
    density?: number;
}
export interface CreateVehicleDto {
    licensePlate: string;
    vehicleType: VehicleType;
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
    gpsDeviceId?: string;
}
export interface UpdateVehicleDto {
    registrationExpiry?: Date;
    insuranceExpiry?: Date;
    roadWorthyExpiry?: Date;
    status?: string;
    currentDriverId?: string;
}
export interface CreateDriverDto {
    driverLicense: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        country: string;
    };
    licenseClass: string;
    licenseExpiry: Date;
    hazmatCertified?: boolean;
    hazmatExpiry?: Date;
    employeeId?: string;
    hireDate?: Date;
}
export interface UpdateDriverDto {
    phoneNumber?: string;
    email?: string;
    address?: {
        street?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        country?: string;
    };
    licenseExpiry?: Date;
    hazmatCertified?: boolean;
    hazmatExpiry?: Date;
    status?: string;
}
export interface GenerateReportDto {
    reportType: string;
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
    filters?: {
        stationIds?: string[];
        fuelTypes?: FuelType[];
        customerIds?: string[];
    };
    format: 'pdf' | 'excel' | 'csv';
    delivery?: {
        method: 'email' | 'download';
        recipients?: string[];
    };
}
export interface PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponseDto<T> {
    data: T[];
    pagination: {
        currentPage: number;
        perPage: number;
        totalPages: number;
        totalRecords: number;
    };
}
export interface SearchDto {
    query: string;
    filters?: Record<string, unknown>;
    pagination?: PaginationDto;
}
export interface DashboardMetricsDto {
    todaySales: number;
    monthSales: number;
    activeStations: number;
    totalInventory: number;
    pendingTransactions: number;
    lowStockAlerts: number;
    recentTransactions: Array<{
        id: string;
        stationName: string;
        amount: number;
        time: Date;
    }>;
    salesTrend: Array<{
        date: string;
        amount: number;
    }>;
}
export interface CreateNotificationDto {
    type: string;
    title: string;
    message: string;
    recipientId?: string;
    recipientRole?: UserRole;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data?: Record<string, unknown>;
}
export interface TankReadingDto {
    tankId: string;
    stationId: string;
    fuelLevel: number;
    temperature?: number;
    pressure?: number;
    waterLevel?: number;
    density?: number;
    sensorStatus: string;
    timestamp: Date;
}
export interface PumpTransactionLogDto {
    pumpId: string;
    stationId: string;
    transactionId?: string;
    fuelType?: FuelType;
    quantity?: number;
    flowRate?: number;
    duration?: number;
    pumpStatus: string;
    errorCodes?: number[];
    timestamp: Date;
}
//# sourceMappingURL=dto.d.ts.map