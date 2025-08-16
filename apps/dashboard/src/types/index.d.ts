/**
 * Comprehensive Type Definitions for Ghana OMC ERP System
 * All interfaces and types used across the application
 */
export * from './shared';
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    phoneNumber?: string;
    profilePicture?: string;
    lastLoginAt?: string;
    companyId?: string;
    stationId?: string;
    permissions: Permission[];
}
export interface Permission {
    module: string;
    actions: string[];
}
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface DashboardMetrics {
    totalRevenue: number;
    totalTransactions: number;
    activeStations: number;
    fuelSold: number;
    averagePrice: number;
    profitMargin: number;
    customerSatisfaction: number;
    complianceScore: number;
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
        pointRadius?: number;
        pointHoverRadius?: number;
        borderDash?: number[];
        [key: string]: any;
    }[];
}
export interface SystemHealth {
    overallStatus: 'healthy' | 'warning' | 'critical';
    services: {
        name: string;
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        responseTime: number;
    }[];
    databaseStatus: string;
    apiGatewayStatus: string;
    paymentGatewayStatus: string;
}
export interface Account extends BaseEntity {
    code: string;
    name: string;
    type: AccountType;
    parentAccountId?: string;
    balance: number;
    currency: Currency;
    isActive: boolean;
    ifrsClassification?: string;
}
export declare enum AccountType {
    ASSET = "asset",
    LIABILITY = "liability",
    EQUITY = "equity",
    REVENUE = "revenue",
    EXPENSE = "expense"
}
export interface JournalEntry extends BaseEntity {
    entryNumber: string;
    date: string;
    reference: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    status: JournalEntryStatus;
    approvedBy?: string;
    approvedAt?: string;
    lineItems: JournalLineItem[];
}
export declare enum JournalEntryStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    POSTED = "posted",
    REJECTED = "rejected"
}
export interface JournalLineItem {
    accountId: string;
    account: Account;
    debit: number;
    credit: number;
    description: string;
}
export interface FinancialReport {
    period: string;
    reportType: 'balance_sheet' | 'profit_loss' | 'cash_flow' | 'trial_balance';
    data: any;
    generatedAt: string;
    generatedBy: string;
}
export interface TaxCalculation extends BaseEntity {
    period: string;
    vatAmount: number;
    nhilAmount: number;
    getfundAmount: number;
    totalTaxes: number;
    taxableIncome: number;
    status: 'calculated' | 'filed' | 'paid';
}
export interface FixedAsset extends BaseEntity {
    name: string;
    assetCode: string;
    category: string;
    purchaseDate: string;
    purchasePrice: number;
    salvageValue: number;
    usefulLife: number;
    depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
    accumulatedDepreciation: number;
    bookValue: number;
    location?: string;
    status: 'active' | 'disposed' | 'fully_depreciated';
}
export interface Employee extends BaseEntity {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    hireDate: string;
    position: string;
    department: string;
    salary: number;
    currency: Currency;
    status: EmployeeStatus;
    manager?: Employee;
    bankAccountDetails: {
        bankName: string;
        accountNumber: string;
        sortCode?: string;
    };
    taxInformation: {
        tinNumber: string;
        ssnit: string;
        taxRate: number;
    };
}
export declare enum EmployeeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ON_LEAVE = "on_leave",
    TERMINATED = "terminated"
}
export interface PayrollEntry extends BaseEntity {
    employeeId: string;
    employee: Employee;
    period: string;
    basicSalary: number;
    allowances: PayrollComponent[];
    deductions: PayrollComponent[];
    grossPay: number;
    netPay: number;
    taxAmount: number;
    ssnitAmount: number;
    status: 'draft' | 'calculated' | 'approved' | 'paid';
}
export interface PayrollComponent {
    name: string;
    amount: number;
    type: 'allowance' | 'deduction';
    isTaxable: boolean;
}
export interface LeaveRequest extends BaseEntity {
    employeeId: string;
    employee: Employee;
    leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency';
    startDate: string;
    endDate: string;
    numberOfDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
}
export interface PerformanceReview extends BaseEntity {
    employeeId: string;
    employee: Employee;
    reviewPeriod: string;
    reviewDate: string;
    reviewerId: string;
    reviewer: Employee;
    overallRating: number;
    goals: PerformanceGoal[];
    competencies: PerformanceCompetency[];
    comments: string;
    status: 'draft' | 'completed' | 'acknowledged';
}
export interface PerformanceGoal {
    description: string;
    targetDate: string;
    achievement: number;
    rating: number;
}
export interface PerformanceCompetency {
    name: string;
    rating: number;
    comments: string;
}
export interface Station extends BaseEntity {
    stationCode: string;
    name: string;
    address: string;
    city: string;
    region: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    status: StationStatus;
    managerId: string;
    manager: Employee;
    tanks: Tank[];
    pumps: Pump[];
    lastInspectionDate?: string;
    npaLicense: {
        licenseNumber: string;
        expiryDate: string;
        status: 'active' | 'expired' | 'suspended';
    };
}
export interface Tank extends BaseEntity {
    stationId: string;
    tankNumber: string;
    fuelType: FuelType;
    capacity: number;
    currentLevel: number;
    minimumLevel: number;
    lastFillDate?: string;
    sensors: TankSensor[];
}
export interface TankSensor {
    sensorType: 'level' | 'temperature' | 'water_detection';
    value: number;
    unit: string;
    timestamp: string;
    status: 'normal' | 'warning' | 'critical';
}
export interface Pump extends BaseEntity {
    stationId: string;
    pumpNumber: string;
    fuelType: FuelType;
    tankId: string;
    status: 'active' | 'inactive' | 'maintenance';
    totalizer: number;
    lastMaintenanceDate?: string;
}
export interface Vehicle extends BaseEntity {
    vehicleNumber: string;
    type: 'tanker' | 'van' | 'truck' | 'car';
    capacity?: number;
    driverId?: string;
    driver?: Employee;
    status: 'available' | 'in_transit' | 'maintenance' | 'out_of_service';
    currentLocation?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
}
export interface Delivery extends BaseEntity {
    deliveryNumber: string;
    vehicleId: string;
    vehicle: Vehicle;
    driverId: string;
    driver: Employee;
    sourceLocation: string;
    destinationStationId: string;
    destinationStation: Station;
    fuelType: FuelType;
    quantity: number;
    scheduledDate: string;
    actualDeliveryDate?: string;
    status: DeliveryStatus;
    documentsUploaded: boolean;
}
export declare enum DeliveryStatus {
    SCHEDULED = "scheduled",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    DELAYED = "delayed"
}
export interface InventoryItem extends BaseEntity {
    itemCode: string;
    name: string;
    category: 'fuel' | 'lubricant' | 'additive' | 'spare_parts' | 'consumables';
    unit: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    unitCost: number;
    totalValue: number;
    lastStockTakeDate?: string;
}
export interface PurchaseOrder extends BaseEntity {
    orderNumber: string;
    vendorId: string;
    vendor: Vendor;
    orderDate: string;
    expectedDeliveryDate: string;
    status: PurchaseOrderStatus;
    totalAmount: number;
    currency: Currency;
    items: PurchaseOrderItem[];
    approvedBy?: string;
    approvedAt?: string;
}
export declare enum PurchaseOrderStatus {
    DRAFT = "draft",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    SENT = "sent",
    PARTIALLY_RECEIVED = "partially_received",
    FULLY_RECEIVED = "fully_received",
    CANCELLED = "cancelled"
}
export interface PurchaseOrderItem {
    itemId: string;
    item: InventoryItem;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
}
export interface Vendor extends BaseEntity {
    name: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    address: string;
    tinNumber?: string;
    paymentTerms: string;
    currency: Currency;
    status: 'active' | 'inactive' | 'blacklisted';
    rating: number;
}
export interface Customer extends BaseEntity {
    customerCode: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    region?: string;
    customerType: 'individual' | 'corporate';
    loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalPurchases: number;
    lastPurchaseDate?: string;
    loyaltyPoints: number;
    status: CustomerStatus;
}
export declare enum CustomerStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    VIP = "vip"
}
export interface Lead extends BaseEntity {
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
    company?: string;
    source: 'website' | 'referral' | 'advertising' | 'cold_call' | 'social_media';
    status: LeadStatus;
    assignedToId?: string;
    assignedTo?: Employee;
    expectedValue: number;
    followUpDate?: string;
    notes: string;
}
export declare enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    QUALIFIED = "qualified",
    PROPOSAL_SENT = "proposal_sent",
    NEGOTIATING = "negotiating",
    CONVERTED = "converted",
    LOST = "lost"
}
export interface LoyaltyProgram extends BaseEntity {
    name: string;
    description: string;
    pointsPerLiter: number;
    tierThresholds: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
    };
    rewards: LoyaltyReward[];
    status: 'active' | 'inactive';
}
export interface LoyaltyReward {
    name: string;
    pointsCost: number;
    description: string;
    category: 'discount' | 'free_fuel' | 'merchandise' | 'service';
    value: number;
}
export interface SupportTicket extends BaseEntity {
    ticketNumber: string;
    customerId?: string;
    customer?: Customer;
    subject: string;
    description: string;
    category: 'technical' | 'billing' | 'complaint' | 'inquiry' | 'feedback';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedToId?: string;
    assignedTo?: Employee;
    resolutionDate?: string;
    resolutionNotes?: string;
    customerSatisfactionRating?: number;
}
export interface PricingWindow extends BaseEntity {
    windowCode: string;
    effectiveDate: string;
    endDate?: string;
    status: PricingWindowStatus;
    exchangeRate: number;
    fuelPrices: FuelPrice[];
    approvedBy?: string;
    approvedAt?: string;
}
export interface FuelPrice {
    fuelType: FuelType;
    basePrice: number;
    dealerMargin: number;
    taxes: number;
    finalPrice: number;
    currency: Currency;
}
export interface PBUComponent extends BaseEntity {
    name: string;
    category: 'crude_oil' | 'refinery_margin' | 'transportation' | 'taxes' | 'dealer_margin' | 'other';
    value: number;
    currency: Currency;
    unit: string;
    effectiveDate: string;
    source: string;
    isFixed: boolean;
}
export interface UPPFClaim extends BaseEntity {
    claimNumber: string;
    stationId: string;
    station: Station;
    period: string;
    fuelType: FuelType;
    volumeSold: number;
    claimAmount: number;
    currency: Currency;
    status: UPPFClaimStatus;
    submittedAt?: string;
    approvedAt?: string;
    paidAt?: string;
    supportingDocuments: Document[];
}
export interface Document {
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: string;
    uploadedBy: string;
    documentType: string;
    url: string;
}
export interface DealerSettlement extends BaseEntity {
    settlementNumber: string;
    stationId: string;
    station: Station;
    period: string;
    totalSales: number;
    commission: number;
    deductions: number;
    netAmount: number;
    currency: Currency;
    status: 'pending' | 'calculated' | 'approved' | 'paid';
    paidAt?: string;
}
export interface Transaction extends BaseEntity {
    transactionId: string;
    stationId: string;
    station: Station;
    customerId?: string;
    customer?: Customer;
    pumpId: string;
    pump: Pump;
    fuelType: FuelType;
    quantity: number;
    pricePerLiter: number;
    totalAmount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    status: TransactionStatus;
    operatorId: string;
    operator: Employee;
    timestamp: string;
    loyaltyPointsEarned: number;
    receiptNumber: string;
}
export interface TransactionSummary {
    totalTransactions: number;
    totalAmount: number;
    totalVolume: number;
    averageTransactionValue: number;
    topFuelType: FuelType;
    topPaymentMethod: PaymentMethod;
    hourlyData: {
        hour: number;
        transactions: number;
        amount: number;
        volume: number;
    }[];
}
export interface RiskAssessment extends BaseEntity {
    riskCode: string;
    title: string;
    description: string;
    category: 'operational' | 'financial' | 'regulatory' | 'environmental' | 'safety';
    probability: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    mitigationActions: RiskMitigation[];
    owner: string;
    status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed';
    nextReviewDate: string;
}
export interface RiskMitigation {
    action: string;
    owner: string;
    dueDate: string;
    status: 'planned' | 'in_progress' | 'completed';
    completedDate?: string;
}
export interface AuditFinding extends BaseEntity {
    findingNumber: string;
    auditType: 'internal' | 'external' | 'regulatory';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    auditDate: string;
    auditorName: string;
    findings: string;
    recommendation: string;
    managementResponse?: string;
    correctionDeadline: string;
    status: 'open' | 'in_progress' | 'closed' | 'verified';
    responsiblePerson: string;
}
export interface Contract extends BaseEntity {
    contractNumber: string;
    title: string;
    contractType: 'supply' | 'service' | 'employment' | 'lease' | 'insurance' | 'other';
    vendorId?: string;
    vendor?: Vendor;
    startDate: string;
    endDate: string;
    value: number;
    currency: Currency;
    status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
    renewalOptions: number;
    keyTerms: string[];
    documents: Document[];
    renewalNotificationDays: number;
    autoRenewal: boolean;
}
export interface QualityCheck extends BaseEntity {
    checkNumber: string;
    stationId: string;
    station: Station;
    fuelType: FuelType;
    checkDate: string;
    inspector: string;
    parameters: QualityParameter[];
    overallResult: 'pass' | 'fail' | 'marginal';
    comments?: string;
    correctionRequired: boolean;
    correctionDeadline?: string;
}
export interface QualityParameter {
    parameter: string;
    expectedValue: number;
    actualValue: number;
    unit: string;
    tolerance: number;
    result: 'pass' | 'fail' | 'marginal';
}
export interface NPALicense extends BaseEntity {
    licenseNumber: string;
    stationId: string;
    station: Station;
    licenseType: 'retail' | 'wholesale' | 'storage' | 'transportation';
    issueDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'suspended' | 'revoked';
    conditions: string[];
    renewalInProgress: boolean;
    fees: {
        licenseeFee: number;
        applicationFee: number;
        renewalFee: number;
    };
}
export interface EPACompliance extends BaseEntity {
    stationId: string;
    station: Station;
    complianceType: 'environmental_impact' | 'waste_management' | 'air_quality' | 'water_quality';
    assessmentDate: string;
    nextAssessmentDate: string;
    complianceLevel: 'compliant' | 'partially_compliant' | 'non_compliant';
    findings: string[];
    correctiveActions: {
        action: string;
        dueDate: string;
        status: 'pending' | 'in_progress' | 'completed';
    }[];
    certificate?: Document;
}
export interface GRAIntegration extends BaseEntity {
    stationId: string;
    station: Station;
    period: string;
    totalSales: number;
    vatAmount: number;
    nhilAmount: number;
    getfundAmount: number;
    status: 'pending' | 'filed' | 'accepted' | 'rejected';
    filingDate?: string;
    acknowledgmentNumber?: string;
    rejectionReason?: string;
}
export interface BOGReport extends BaseEntity {
    reportType: 'forex_transaction' | 'quarterly_return' | 'annual_return';
    period: string;
    totalForexTransactions: number;
    currency: Currency;
    reportData: any;
    status: 'draft' | 'submitted' | 'accepted' | 'rejected';
    submissionDate?: string;
    acknowledgmentNumber?: string;
    dueDate: string;
}
export interface LocalContentData extends BaseEntity {
    stationId: string;
    station: Station;
    period: string;
    localEmployees: number;
    totalEmployees: number;
    localSuppliersPurchases: number;
    totalPurchases: number;
    localContentPercentage: number;
    complianceThreshold: number;
    isCompliant: boolean;
    supportingDocuments: Document[];
}
export interface DailyDelivery extends BaseEntity {
    date: string;
    supplier: {
        code: string;
        name: string;
        address: string;
        contactPerson: string;
        phone: string;
        email: string;
    };
    depot: {
        code: string;
        name: string;
        location: string;
        capacity: number;
    };
    customerName: string;
    location: string;
    psaNumber: string;
    wbillNumber: string;
    invoiceNumber: string;
    vehicleRegNumber: string;
    transporter: {
        code: string;
        name: string;
        contactPerson: string;
        phone: string;
    };
    product: {
        type: 'petrol' | 'diesel' | 'kerosene' | 'lpg';
        grade: string;
        quantity: number;
        unit: 'liters' | 'tons';
    };
    unitPrice: number;
    totalValue: number;
    currency: 'GHS' | 'USD';
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
    approvalStatus: {
        level: number;
        approvedBy?: string;
        approvedAt?: string;
        comments?: string;
    };
    compliance: {
        npaCompliant: boolean;
        graCompliant: boolean;
        epaCompliant: boolean;
        localContentPercentage: number;
    };
    documents: {
        deliveryNote: boolean;
        qualityCertificate: boolean;
        invoiceGenerated: boolean;
        receiptNumber?: string;
    };
    timestamps: {
        createdAt: string;
        updatedAt: string;
        submittedAt?: string;
        approvedAt?: string;
    };
    createdBy: {
        id: string;
        name: string;
        department: string;
    };
    notes?: string;
}
export interface SystemConfiguration {
    module: string;
    settings: {
        [key: string]: any;
    };
    lastUpdated: string;
    updatedBy: string;
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: {
        total: number;
        page: number;
        limit: number;
    };
}
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
    required: boolean;
    placeholder?: string;
    options?: SelectOption[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        custom?: (value: any) => string | undefined;
    };
}
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface TableColumn<T> {
    key: keyof T;
    header: string;
    width?: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}
export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        onPageChange: (page: number) => void;
        onLimitChange: (limit: number) => void;
    };
    onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
    onFilter?: (filters: Record<string, any>) => void;
    onRowClick?: (row: T) => void;
    selection?: {
        selectedRows: string[];
        onSelectionChange: (selectedRows: string[]) => void;
    };
}
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    children: React.ReactNode;
}
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actions?: NotificationAction[];
}
export interface NotificationAction {
    label: string;
    action: () => void;
    type: 'primary' | 'secondary' | 'danger';
}
export { UserRole, FuelType, PaymentMethod, TransactionStatus, UserStatus, StationStatus, Currency, PricingWindowStatus, UPPFClaimStatus } from './shared';
//# sourceMappingURL=index.d.ts.map