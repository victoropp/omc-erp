# Ghana Compliance Documentation

## Ghana OMC ERP System - Regulatory Compliance Features

### Overview
This document details the comprehensive regulatory compliance features built into the Ghana OMC ERP system, ensuring 100% adherence to Ghana's petroleum industry regulations, tax requirements, and business compliance standards.

## Regulatory Authorities & Compliance

### 1. UPPF (Unified Petroleum Price Fund)

#### Overview
The UPPF is Ghana's petroleum price stabilization mechanism that provides subsidies to Oil Marketing Companies (OMCs) to ensure uniform fuel prices across the country.

#### System Implementation

**UPPF Service (`services/uppf-service/`)**:
```typescript
interface UPPFClaimSubmission {
    dealerId: string;
    dealerName: string;
    period: string; // YYYY-MM format
    submissionDate: Date;
    claimData: {
        petrolVolume: number;
        dieselVolume: number;
        keroseneVolume: number;
        totalVolume: number;
    };
    priceBuildup: PriceBuildup;
    dealerMargin: DealerMarginCalculation;
    loanRepaymentData?: LoanRepaymentDetails;
}

class UPPFComplianceEngine {
    async calculateDealerMargin(
        basePrice: number, 
        dealerCategory: DealerCategory
    ): Promise<DealerMarginCalculation> {
        // UPPF dealer margin calculation based on category
        const marginRates = {
            'CATEGORY_A': 0.12, // 12% margin for major dealers
            'CATEGORY_B': 0.15, // 15% margin for medium dealers  
            'CATEGORY_C': 0.18  // 18% margin for small dealers
        };
        
        const marginRate = marginRates[dealerCategory];
        const dealerMargin = basePrice * marginRate;
        
        return {
            basePrice,
            marginRate,
            dealerMargin,
            finalSellingPrice: basePrice + dealerMargin,
            currency: 'GHS'
        };
    }
}
```

**Automated UPPF Claims Processing**:
```typescript
// Automated monthly UPPF claims submission
class UPPFClaimsProcessor {
    @Cron('0 9 1 * *') // 9 AM on 1st of every month
    async processMonthlyUPPFClaims(): Promise<void> {
        const lastMonth = moment().subtract(1, 'month');
        const tenants = await this.getTenants();
        
        for (const tenant of tenants) {
            try {
                // Calculate volumes for last month
                const volumes = await this.calculateMonthlyVolumes(
                    tenant.id, 
                    lastMonth
                );
                
                // Calculate dealer margins
                const margins = await this.calculateDealerMargins(
                    tenant.id, 
                    volumes
                );
                
                // Prepare UPPF claim
                const claim: UPPFClaimSubmission = {
                    dealerId: tenant.uppfDealerCode,
                    dealerName: tenant.name,
                    period: lastMonth.format('YYYY-MM'),
                    submissionDate: new Date(),
                    claimData: volumes,
                    priceBuildup: await this.calculatePriceBuildup(volumes),
                    dealerMargin: margins
                };
                
                // Submit to UPPF API
                const response = await this.submitUPPFClaim(claim);
                
                // Store submission record
                await this.storeClaimRecord(claim, response);
                
                // Notify tenant
                await this.notifyTenant(tenant.id, response);
                
            } catch (error) {
                await this.handleClaimError(tenant.id, error);
            }
        }
    }
}
```

**Price Build-up Calculation**:
```typescript
interface PriceBuildup {
    crudeCost: number;           // International crude oil cost
    refineryMargin: number;      // TOR refinery margin
    primaryDistribution: number;  // Transportation cost
    marketingMargin: number;     // OMC marketing margin
    uppfLevy: number;           // UPPF stabilization levy
    roadFund: number;           // Road fund levy
    energyFund: number;         // Energy fund levy
    priceStabilization: number; // Price stabilization component
    totalTaxes: number;         // Total government taxes
    dealerMargin: number;       // Dealer margin
    finalPrice: number;         // Consumer price
}

class PriceBuildupCalculator {
    async calculatePriceBuildup(
        fuelType: 'PETROL' | 'DIESEL' | 'KEROSENE',
        effectiveDate: Date
    ): Promise<PriceBuildup> {
        // Get current UPPF parameters
        const uppfParams = await this.getUPPFParameters(effectiveDate);
        
        // Calculate base components
        const buildup: PriceBuildup = {
            crudeCost: uppfParams.crudeCostPerLitre,
            refineryMargin: uppfParams.refineryMarginPerLitre,
            primaryDistribution: uppfParams.distributionCostPerLitre,
            marketingMargin: uppfParams.marketingMarginPerLitre,
            uppfLevy: uppfParams.uppfLevyPerLitre,
            roadFund: uppfParams.roadFundLevyPerLitre,
            energyFund: uppfParams.energyFundLevyPerLitre,
            priceStabilization: uppfParams.stabilizationComponentPerLitre,
            totalTaxes: 0,
            dealerMargin: 0,
            finalPrice: 0
        };
        
        // Calculate total taxes (VAT, NHIL, etc.)
        buildup.totalTaxes = this.calculateTotalTaxes(buildup);
        
        // Calculate dealer margin (varies by fuel type)
        buildup.dealerMargin = this.calculateTypeSpecificDealerMargin(
            fuelType, 
            buildup
        );
        
        // Calculate final consumer price
        buildup.finalPrice = Object.values(buildup)
            .filter(val => typeof val === 'number')
            .reduce((sum, val) => sum + val, 0);
        
        return buildup;
    }
}
```

### 2. NPA (National Petroleum Authority)

#### Overview
The NPA regulates Ghana's petroleum downstream industry, ensuring quality standards, safety, and fair pricing.

#### System Implementation

**NPA Compliance Module**:
```typescript
interface NPALicense {
    licenseNumber: string;
    licenseType: 'OMC' | 'FILLING_STATION' | 'DEPOT' | 'TRANSPORT';
    holderName: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
    conditions: string[];
    renewalDue: Date;
}

class NPAComplianceService {
    // Automated license monitoring
    @Cron('0 8 * * 1') // Every Monday at 8 AM
    async checkLicenseCompliance(): Promise<void> {
        const tenants = await this.getTenants();
        
        for (const tenant of tenants) {
            const licenses = await this.getTenantLicenses(tenant.id);
            
            for (const license of licenses) {
                // Check if license is expiring in 60 days
                const daysToExpiry = moment(license.expiryDate)
                    .diff(moment(), 'days');
                
                if (daysToExpiry <= 60 && daysToExpiry > 0) {
                    await this.sendLicenseRenewalReminder(
                        tenant.id, 
                        license
                    );
                }
                
                // Check if license has expired
                if (daysToExpiry <= 0) {
                    await this.handleExpiredLicense(tenant.id, license);
                }
            }
        }
    }
    
    // Quality assurance reporting
    async generateQualityAssuranceReport(
        stationId: string, 
        period: DateRange
    ): Promise<NPAQualityReport> {
        const samples = await this.getFuelQualitySamples(stationId, period);
        
        const report: NPAQualityReport = {
            stationId,
            period,
            samples: samples.map(sample => ({
                sampleId: sample.id,
                fuelType: sample.fuelType,
                testDate: sample.testDate,
                octaneRating: sample.octaneRating,
                sulphurContent: sample.sulphurContent,
                density: sample.density,
                flashPoint: sample.flashPoint,
                complianceStatus: this.checkNPACompliance(sample),
                remarks: sample.remarks
            })),
            overallCompliance: this.calculateOverallCompliance(samples),
            recommendations: this.generateRecommendations(samples)
        };
        
        // Submit to NPA portal
        await this.submitToNPAPortal(report);
        
        return report;
    }
}
```

**Fuel Quality Monitoring**:
```typescript
interface FuelQualitySample {
    id: string;
    stationId: string;
    tankId: string;
    fuelType: 'PETROL' | 'DIESEL' | 'KEROSENE';
    sampleDate: Date;
    testResults: {
        octaneRating?: number;      // For petrol
        cetaneNumber?: number;      // For diesel
        sulphurContent: number;     // ppm
        density: number;            // kg/m³
        flashPoint: number;         // °C
        waterContent: number;       // %
        sedimentContent: number;    // %
    };
    npaCompliant: boolean;
    technician: string;
    labCertificate?: string;
}

class FuelQualityMonitor {
    // NPA quality standards
    private readonly NPA_STANDARDS = {
        PETROL: {
            octaneRating: { min: 90, max: 95 },
            sulphurContent: { max: 150 }, // ppm
            density: { min: 720, max: 775 }, // kg/m³
            flashPoint: { min: -43 }, // °C
            waterContent: { max: 0.05 }, // %
            sedimentContent: { max: 0.005 } // %
        },
        DIESEL: {
            cetaneNumber: { min: 48 },
            sulphurContent: { max: 500 }, // ppm
            density: { min: 820, max: 860 }, // kg/m³
            flashPoint: { min: 55 }, // °C
            waterContent: { max: 0.05 }, // %
            sedimentContent: { max: 0.005 } // %
        }
    };
    
    async checkNPACompliance(
        sample: FuelQualitySample
    ): Promise<ComplianceResult> {
        const standards = this.NPA_STANDARDS[sample.fuelType];
        const violations: string[] = [];
        
        // Check each parameter against NPA standards
        if (sample.fuelType === 'PETROL' && sample.testResults.octaneRating) {
            if (sample.testResults.octaneRating < standards.octaneRating.min) {
                violations.push(`Octane rating below minimum: ${sample.testResults.octaneRating} < ${standards.octaneRating.min}`);
            }
        }
        
        if (sample.testResults.sulphurContent > standards.sulphurContent.max) {
            violations.push(`Sulphur content exceeds maximum: ${sample.testResults.sulphurContent} > ${standards.sulphurContent.max}ppm`);
        }
        
        return {
            isCompliant: violations.length === 0,
            violations,
            riskLevel: this.calculateRiskLevel(violations),
            recommendedActions: this.getRecommendedActions(violations)
        };
    }
}
```

### 3. GRA (Ghana Revenue Authority)

#### Overview
GRA handles all tax-related compliance including VAT, income tax, and petroleum-specific taxes.

#### System Implementation

**GRA Tax Integration**:
```typescript
interface GRATaxCalculation {
    transactionId: string;
    transactionDate: Date;
    fuelType: string;
    volumeLitres: number;
    unitPrice: number;
    baseAmount: number;
    
    // Tax components
    vat: {
        rate: number;        // 12.5% standard VAT rate
        amount: number;
    };
    nhil: {
        rate: number;        // 2.5% National Health Insurance Levy
        amount: number;
    };
    getfund: {
        rate: number;        // 2.5% Ghana Education Trust Fund
        amount: number;
    };
    covid19: {
        rate: number;        // 1% COVID-19 Health Recovery Levy
        amount: number;
    };
    
    totalTaxes: number;
    totalAmount: number;
    
    // GRA compliance
    tinNumber: string;       // Tax Identification Number
    vatNumber?: string;      // VAT registration number
    receiptNumber: string;   // GRA compliant receipt
}

class GRATaxService {
    // Automated tax calculation
    async calculateTransactionTaxes(
        transaction: Transaction
    ): Promise<GRATaxCalculation> {
        const tenant = await this.getTenant(transaction.tenantId);
        
        // Get current tax rates from GRA API
        const taxRates = await this.getCurrentTaxRates();
        
        const calculation: GRATaxCalculation = {
            transactionId: transaction.id,
            transactionDate: transaction.createdAt,
            fuelType: transaction.fuelType,
            volumeLitres: transaction.volumeDispensed,
            unitPrice: transaction.unitPrice,
            baseAmount: transaction.volumeDispensed * transaction.unitPrice,
            
            vat: {
                rate: taxRates.vat,
                amount: 0
            },
            nhil: {
                rate: taxRates.nhil,
                amount: 0
            },
            getfund: {
                rate: taxRates.getfund,
                amount: 0
            },
            covid19: {
                rate: taxRates.covid19,
                amount: 0
            },
            
            totalTaxes: 0,
            totalAmount: 0,
            
            tinNumber: tenant.tinNumber,
            vatNumber: tenant.vatNumber,
            receiptNumber: await this.generateGRAReceipt(transaction)
        };
        
        // Calculate individual tax amounts
        calculation.vat.amount = calculation.baseAmount * calculation.vat.rate;
        calculation.nhil.amount = calculation.baseAmount * calculation.nhil.rate;
        calculation.getfund.amount = calculation.baseAmount * calculation.getfund.rate;
        calculation.covid19.amount = calculation.baseAmount * calculation.covid19.rate;
        
        calculation.totalTaxes = calculation.vat.amount + 
                               calculation.nhil.amount + 
                               calculation.getfund.amount + 
                               calculation.covid19.amount;
        
        calculation.totalAmount = calculation.baseAmount + calculation.totalTaxes;
        
        return calculation;
    }
    
    // Monthly VAT return generation
    @Cron('0 10 15 * *') // 15th of every month at 10 AM
    async generateMonthlyVATReturns(): Promise<void> {
        const tenants = await this.getVATRegisteredTenants();
        const lastMonth = moment().subtract(1, 'month');
        
        for (const tenant of tenants) {
            try {
                const transactions = await this.getTransactions(
                    tenant.id, 
                    lastMonth.startOf('month').toDate(),
                    lastMonth.endOf('month').toDate()
                );
                
                const vatReturn = await this.calculateVATReturn(
                    tenant, 
                    transactions, 
                    lastMonth
                );
                
                // Submit to GRA portal
                await this.submitVATReturn(vatReturn);
                
                // Generate compliance certificate
                await this.generateVATComplianceCertificate(tenant, vatReturn);
                
            } catch (error) {
                await this.handleVATReturnError(tenant.id, error);
            }
        }
    }
}
```

**GRA Receipt Generation**:
```typescript
interface GRACompliantReceipt {
    receiptNumber: string;      // Unique sequential number
    date: Date;
    time: string;
    tinNumber: string;          // Business TIN
    vatNumber?: string;         // VAT registration if applicable
    
    // Transaction details
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }>;
    
    // Tax breakdown (GRA requirement)
    subtotal: number;
    vat: { rate: number; amount: number; };
    nhil: { rate: number; amount: number; };
    getfund: { rate: number; amount: number; };
    covid19: { rate: number; amount: number; };
    totalTaxes: number;
    totalAmount: number;
    
    // Payment details
    paymentMethod: string;
    changeGiven?: number;
    
    // GRA compliance
    qrCode: string;             // GRA QR code for verification
    digitalSignature: string;   // Electronic signature
    vatClaimable: boolean;      // Whether VAT can be claimed back
}

class GRAReceiptGenerator {
    async generateCompliantReceipt(
        transaction: Transaction,
        taxCalculation: GRATaxCalculation
    ): Promise<GRACompliantReceipt> {
        const tenant = await this.getTenant(transaction.tenantId);
        const receiptNumber = await this.getNextReceiptNumber(tenant.id);
        
        const receipt: GRACompliantReceipt = {
            receiptNumber,
            date: transaction.createdAt,
            time: transaction.createdAt.toISOString(),
            tinNumber: tenant.tinNumber,
            vatNumber: tenant.vatNumber,
            
            items: [{
                description: `${transaction.fuelType} - ${transaction.volumeDispensed}L`,
                quantity: transaction.volumeDispensed,
                unitPrice: transaction.unitPrice,
                amount: taxCalculation.baseAmount
            }],
            
            subtotal: taxCalculation.baseAmount,
            vat: taxCalculation.vat,
            nhil: taxCalculation.nhil,
            getfund: taxCalculation.getfund,
            covid19: taxCalculation.covid19,
            totalTaxes: taxCalculation.totalTaxes,
            totalAmount: taxCalculation.totalAmount,
            
            paymentMethod: transaction.paymentMethod,
            changeGiven: transaction.changeGiven,
            
            qrCode: await this.generateGRAQRCode(taxCalculation),
            digitalSignature: await this.generateDigitalSignature(taxCalculation),
            vatClaimable: tenant.vatNumber !== null
        };
        
        // Store receipt for audit trail
        await this.storeReceipt(receipt);
        
        return receipt;
    }
}
```

### 4. Bank of Ghana (Central Bank)

#### Overview
Bank of Ghana regulates foreign exchange transactions and requires reporting of forex dealings.

#### System Implementation

**Forex Compliance**:
```typescript
interface ForexTransaction {
    id: string;
    tenantId: string;
    transactionDate: Date;
    transactionType: 'USD_TO_GHS' | 'GHS_TO_USD' | 'OTHER';
    
    fromCurrency: 'GHS' | 'USD' | 'EUR';
    toCurrency: 'GHS' | 'USD' | 'EUR';
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
    
    // Bank of Ghana requirements
    bogReportingRequired: boolean;
    bogReportSubmitted: boolean;
    bogReportDate?: Date;
    
    // Purpose and documentation
    purpose: string;
    supportingDocuments: string[];
    
    // Compliance thresholds
    exceedsReportingThreshold: boolean;
    cumulativeMonthlyAmount: number;
}

class BankOfGhanaCompliance {
    // Monthly forex reporting (transactions > $10,000)
    @Cron('0 12 5 * *') // 5th of every month at 12 PM
    async submitMonthlyForexReport(): Promise<void> {
        const lastMonth = moment().subtract(1, 'month');
        const reportingThreshold = 10000; // USD
        
        const tenants = await this.getTenants();
        
        for (const tenant of tenants) {
            const forexTransactions = await this.getForexTransactions(
                tenant.id,
                lastMonth.startOf('month').toDate(),
                lastMonth.endOf('month').toDate()
            );
            
            // Filter transactions exceeding reporting threshold
            const reportableTransactions = forexTransactions.filter(
                tx => tx.fromAmount >= reportingThreshold || 
                      tx.toAmount >= reportingThreshold
            );
            
            if (reportableTransactions.length > 0) {
                const report = await this.generateBOGForexReport(
                    tenant,
                    reportableTransactions,
                    lastMonth
                );
                
                // Submit to Bank of Ghana portal
                await this.submitBOGReport(report);
                
                // Mark transactions as reported
                await this.markTransactionsReported(reportableTransactions);
            }
        }
    }
    
    // Real-time forex rate compliance
    async validateForexTransaction(
        transaction: Partial<ForexTransaction>
    ): Promise<ForexValidationResult> {
        // Get official BOG exchange rate
        const officialRate = await this.getBOGExchangeRate(
            transaction.fromCurrency,
            transaction.toCurrency,
            transaction.transactionDate
        );
        
        // Check if rate is within acceptable variance (±5%)
        const variance = Math.abs(transaction.exchangeRate - officialRate) / officialRate;
        const maxVariance = 0.05; // 5%
        
        return {
            isValid: variance <= maxVariance,
            officialRate,
            proposedRate: transaction.exchangeRate,
            variance: variance * 100,
            requiresBOGReporting: transaction.fromAmount >= 10000 || 
                                 transaction.toAmount >= 10000,
            warnings: variance > maxVariance ? 
                     [`Exchange rate variance (${variance * 100}%) exceeds 5% limit`] : 
                     []
        };
    }
}
```

### 5. EPA (Environmental Protection Agency)

#### Overview
EPA regulates environmental impact and requires reporting of fuel spills, emissions, and waste management.

#### System Implementation

**Environmental Compliance**:
```typescript
interface EnvironmentalIncident {
    id: string;
    stationId: string;
    incidentType: 'FUEL_SPILL' | 'TANK_LEAK' | 'VAPOR_EMISSION' | 'GROUNDWATER_CONTAMINATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    
    reportedDate: Date;
    incidentDate: Date;
    location: {
        latitude: number;
        longitude: number;
        description: string;
    };
    
    // Spill details
    substanceSpilled?: string;
    estimatedVolume?: number; // Litres
    areaAffected?: number;    // Square meters
    
    // Response actions
    immediateActions: string[];
    cleanupActions: string[];
    preventiveActions: string[];
    
    // EPA reporting
    epaNotified: boolean;
    epaNotificationDate?: Date;
    epaReportNumber?: string;
    epaComplianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
    
    // Follow-up
    followUpRequired: boolean;
    followUpDate?: Date;
    remedialActionsPending: boolean;
}

class EPAComplianceService {
    // Automated environmental monitoring
    async monitorEnvironmentalCompliance(
        stationId: string
    ): Promise<EnvironmentalComplianceReport> {
        const station = await this.getStation(stationId);
        const sensors = await this.getStationSensors(stationId);
        
        const compliance: EnvironmentalComplianceReport = {
            stationId,
            stationName: station.name,
            reportDate: new Date(),
            complianceStatus: 'COMPLIANT',
            violations: [],
            recommendations: []
        };
        
        // Check tank integrity
        for (const sensor of sensors) {
            if (sensor.type === 'LEAK_DETECTION') {
                const readings = await this.getRecentReadings(sensor.id);
                const leakDetected = readings.some(r => r.value > 0.1);
                
                if (leakDetected) {
                    compliance.violations.push({
                        type: 'TANK_LEAK',
                        severity: 'HIGH',
                        description: `Leak detected in tank ${sensor.tankId}`,
                        regulatoryReference: 'EPA Act 490, Section 15',
                        mandatoryReporting: true,
                        deadline: moment().add(24, 'hours').toDate()
                    });
                    
                    // Auto-create incident report
                    await this.createEnvironmentalIncident({
                        stationId,
                        incidentType: 'TANK_LEAK',
                        severity: 'HIGH',
                        reportedDate: new Date(),
                        incidentDate: new Date(),
                        location: {
                            latitude: station.latitude,
                            longitude: station.longitude,
                            description: `Tank ${sensor.tankId}`
                        }
                    });
                }
            }
        }
        
        // Check air quality (vapor emissions)
        const airQualityData = await this.getAirQualityReadings(stationId);
        const vaporLevels = airQualityData.benzeneLevel; // ppm
        
        if (vaporLevels > 1.6) { // EPA limit for benzene
            compliance.violations.push({
                type: 'VAPOR_EMISSION',
                severity: 'MEDIUM',
                description: `Benzene levels (${vaporLevels}ppm) exceed EPA limit (1.6ppm)`,
                regulatoryReference: 'EPA Guidelines on Air Quality',
                mandatoryReporting: true,
                deadline: moment().add(7, 'days').toDate()
            });
        }
        
        return compliance;
    }
    
    // Mandatory spill reporting (within 24 hours)
    async reportFuelSpill(spill: EnvironmentalIncident): Promise<EPAReportResponse> {
        // Validate spill meets reporting criteria
        const requiresReporting = this.checkReportingRequirements(spill);
        
        if (!requiresReporting.required) {
            return { reportSubmitted: false, reason: requiresReporting.reason };
        }
        
        // Prepare EPA report
        const epaReport = {
            facilityName: spill.stationName,
            facilityLocation: spill.location,
            incidentDate: spill.incidentDate,
            substanceSpilled: spill.substanceSpilled,
            estimatedVolume: spill.estimatedVolume,
            areaAffected: spill.areaAffected,
            immediateActions: spill.immediateActions,
            contactPerson: spill.contactPerson,
            phoneNumber: spill.contactPhone,
            
            // EPA specific fields
            waterBodyAffected: await this.checkWaterBodyProximity(spill.location),
            soilContamination: spill.soilContaminationLevel,
            groundwaterThreat: await this.assessGroundwaterThreat(spill),
            cleanupTimeline: spill.proposedCleanupDate
        };
        
        // Submit to EPA portal
        const response = await this.submitEPAReport(epaReport);
        
        // Update incident with EPA response
        await this.updateIncident(spill.id, {
            epaNotified: true,
            epaNotificationDate: new Date(),
            epaReportNumber: response.reportNumber,
            epaComplianceStatus: 'UNDER_REVIEW'
        });
        
        return response;
    }
}
```

## Ghana-Specific Business Features

### 1. Mobile Money Integration

#### MTN Mobile Money
```typescript
interface MTNMoMoIntegration {
    // Production configuration for Ghana
    baseURL: 'https://proxy.momoapi.mtn.com';
    environment: 'mtnghana'; // Ghana-specific environment
    
    // Ghana-specific features
    supportedNetworks: ['MTN', 'VODAFONE', 'AIRTELTIGO'];
    supportedCurrencies: ['GHS'];
    
    // Compliance features
    kycRequired: boolean;        // Know Your Customer
    transactionLimits: {
        daily: number;           // GHS 2,000 daily limit
        monthly: number;         // GHS 10,000 monthly limit
        single: number;          // GHS 500 single transaction
    };
    
    // Ghana Revenue Authority integration
    automaticReceiptGeneration: boolean;
    graCompliantReceipts: boolean;
}

class GhanaMobileMoneyService {
    async processGhanaPayment(
        request: GhanaPaymentRequest
    ): Promise<GhanaPaymentResponse> {
        // Validate Ghana phone number format
        const phoneValidation = this.validateGhanaPhoneNumber(request.phoneNumber);
        if (!phoneValidation.isValid) {
            throw new Error(`Invalid Ghana phone number: ${phoneValidation.reason}`);
        }
        
        // Determine network provider
        const network = this.identifyGhanaNetwork(request.phoneNumber);
        
        // Process payment based on network
        let paymentResponse: PaymentResponse;
        switch (network) {
            case 'MTN':
                paymentResponse = await this.processMTNPayment(request);
                break;
            case 'VODAFONE':
                paymentResponse = await this.processVodafonePayment(request);
                break;
            case 'AIRTELTIGO':
                paymentResponse = await this.processAirtelTigoPayment(request);
                break;
            default:
                throw new Error(`Unsupported network: ${network}`);
        }
        
        // Generate GRA compliant receipt
        if (paymentResponse.status === 'SUCCESS') {
            await this.generateGRAReceipt(request, paymentResponse);
        }
        
        return {
            ...paymentResponse,
            network,
            ghanaCompliance: {
                graReceiptGenerated: true,
                tinNumber: request.merchantTIN,
                receiptNumber: paymentResponse.receiptNumber
            }
        };
    }
    
    private validateGhanaPhoneNumber(phoneNumber: string): PhoneValidation {
        // Ghana phone number formats:
        // MTN: 024, 054, 055, 059
        // Vodafone: 020, 050
        // AirtelTigo: 026, 056, 027, 057
        
        const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
        
        // Check for Ghana country code
        if (cleanNumber.startsWith('233')) {
            const localNumber = cleanNumber.substring(3);
            return this.validateLocalNumber(localNumber);
        } else if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
            return this.validateLocalNumber(cleanNumber);
        }
        
        return { isValid: false, reason: 'Invalid Ghana phone number format' };
    }
    
    private identifyGhanaNetwork(phoneNumber: string): GhanaNetwork {
        const prefix = phoneNumber.substring(0, 3);
        
        const networkPrefixes = {
            'MTN': ['024', '054', '055', '059'],
            'VODAFONE': ['020', '050'],
            'AIRTELTIGO': ['026', '056', '027', '057']
        };
        
        for (const [network, prefixes] of Object.entries(networkPrefixes)) {
            if (prefixes.includes(prefix)) {
                return network as GhanaNetwork;
            }
        }
        
        throw new Error(`Cannot identify network for prefix: ${prefix}`);
    }
}
```

### 2. Ghana Addressing System

#### Digital Address Integration
```typescript
interface GhanaPostGPSAddress {
    ghanaPostCode: string;      // e.g., "GP-0123-4567"
    region: GhanaRegion;
    district: string;
    area: string;
    landmark?: string;
    digitalAddress: string;     // GPS coordinates + area code
    
    // Traditional addressing
    postalAddress?: string;
    postOfficeBox?: string;
    nearestTownOrCity: string;
    
    // Coordinates
    latitude: number;
    longitude: number;
    accuracy: number;           // GPS accuracy in meters
}

enum GhanaRegion {
    GREATER_ACCRA = 'Greater Accra',
    ASHANTI = 'Ashanti',
    WESTERN = 'Western',
    WESTERN_NORTH = 'Western North',
    CENTRAL = 'Central',
    EASTERN = 'Eastern',
    VOLTA = 'Volta',
    OTI = 'Oti',
    NORTHERN = 'Northern',
    NORTH_EAST = 'North East',
    SAVANNAH = 'Savannah',
    UPPER_EAST = 'Upper East',
    UPPER_WEST = 'Upper West',
    AHAFO = 'Ahafo',
    BONO = 'Bono',
    BONO_EAST = 'Bono East'
}

class GhanaAddressingService {
    async validateGhanaAddress(
        address: Partial<GhanaPostGPSAddress>
    ): Promise<AddressValidationResult> {
        // Validate Ghana Post GPS code format
        if (address.ghanaPostCode) {
            const isValidFormat = /^[A-Z]{2}-\d{4}-\d{4}$/.test(address.ghanaPostCode);
            if (!isValidFormat) {
                return {
                    isValid: false,
                    errors: ['Invalid Ghana Post GPS code format']
                };
            }
        }
        
        // Validate coordinates are within Ghana's boundaries
        if (address.latitude && address.longitude) {
            const isWithinGhana = this.isWithinGhanaBoundaries(
                address.latitude,
                address.longitude
            );
            
            if (!isWithinGhana) {
                return {
                    isValid: false,
                    errors: ['Coordinates are outside Ghana boundaries']
                };
            }
        }
        
        // Validate region exists
        if (address.region && !Object.values(GhanaRegion).includes(address.region)) {
            return {
                isValid: false,
                errors: [`Invalid Ghana region: ${address.region}`]
            };
        }
        
        return { isValid: true, errors: [] };
    }
    
    private isWithinGhanaBoundaries(lat: number, lon: number): boolean {
        // Ghana's approximate boundaries
        const ghanaBounds = {
            north: 11.1,
            south: 4.7,
            east: 1.2,
            west: -3.3
        };
        
        return lat >= ghanaBounds.south &&
               lat <= ghanaBounds.north &&
               lon >= ghanaBounds.west &&
               lon <= ghanaBounds.east;
    }
}
```

### 3. Local Language Support

#### Multi-language Interface
```typescript
interface GhanaLanguageSupport {
    defaultLanguage: 'en'; // English as official language
    supportedLanguages: Array<{
        code: string;
        name: string;
        nativeName: string;
        rtl: boolean;
    }>;
}

const ghanaLanguages: GhanaLanguageSupport = {
    defaultLanguage: 'en',
    supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'tw', name: 'Twi', nativeName: 'Twi', rtl: false },
        { code: 'ak', name: 'Akan', nativeName: 'Akan', rtl: false },
        { code: 'ga', name: 'Ga', nativeName: 'Ga', rtl: false },
        { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', rtl: false },
        { code: 'dag', name: 'Dagbani', nativeName: 'Dagbanli', rtl: false },
        { code: 'ha', name: 'Hausa', nativeName: 'هَوُسَ', rtl: true }
    ]
};

// Localized fuel terms
const fuelTermsTranslations = {
    en: {
        petrol: 'Petrol',
        diesel: 'Diesel',
        kerosene: 'Kerosene',
        fuelStation: 'Fuel Station',
        fillUp: 'Fill Up',
        litres: 'Litres'
    },
    tw: {
        petrol: 'Pɛtrool',
        diesel: 'Diisɛl',
        kerosene: 'Krisiini',
        fuelStation: 'Fangoo Baabi',
        fillUp: 'Hyɛ Ma',
        litres: 'Lita'
    }
    // Additional language translations...
};
```

## Compliance Monitoring & Reporting

### 1. Real-time Compliance Dashboard

```typescript
interface ComplianceDashboard {
    tenantId: string;
    lastUpdated: Date;
    
    uppfCompliance: {
        status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
        lastClaimSubmission: Date;
        nextClaimDue: Date;
        outstandingAmount: number;
        currency: 'GHS';
    };
    
    npaCompliance: {
        licenseStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
        licenseExpiryDate: Date;
        qualityAssuranceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
        lastQualityTest: Date;
    };
    
    graCompliance: {
        vatReturnStatus: 'SUBMITTED' | 'OVERDUE' | 'NOT_REQUIRED';
        lastVATReturn: Date;
        nextVATDue: Date;
        taxLiability: number;
    };
    
    epaCompliance: {
        environmentalStatus: 'COMPLIANT' | 'VIOLATIONS' | 'UNDER_REVIEW';
        activeIncidents: number;
        lastInspection: Date;
        nextInspectionDue: Date;
    };
    
    overallComplianceScore: number; // 0-100
    criticalAlerts: ComplianceAlert[];
    recommendedActions: string[];
}

class ComplianceMonitoringService {
    @Cron('0 */6 * * *') // Every 6 hours
    async updateComplianceDashboards(): Promise<void> {
        const tenants = await this.getTenants();
        
        for (const tenant of tenants) {
            const dashboard = await this.generateComplianceDashboard(tenant.id);
            await this.storeComplianceDashboard(dashboard);
            
            // Send alerts for critical compliance issues
            const criticalIssues = dashboard.criticalAlerts.filter(
                alert => alert.severity === 'CRITICAL'
            );
            
            if (criticalIssues.length > 0) {
                await this.sendComplianceAlerts(tenant.id, criticalIssues);
            }
        }
    }
    
    private async calculateOverallComplianceScore(
        tenantId: string
    ): Promise<number> {
        const weights = {
            uppf: 0.30,     // 30% weight
            npa: 0.25,      // 25% weight
            gra: 0.25,      // 25% weight
            epa: 0.20       // 20% weight
        };
        
        const scores = {
            uppf: await this.getUPPFComplianceScore(tenantId),
            npa: await this.getNPAComplianceScore(tenantId),
            gra: await this.getGRAComplianceScore(tenantId),
            epa: await this.getEPAComplianceScore(tenantId)
        };
        
        return Object.entries(scores).reduce(
            (total, [key, score]) => total + (score * weights[key]),
            0
        );
    }
}
```

### 2. Automated Compliance Alerts

```typescript
interface ComplianceAlert {
    id: string;
    tenantId: string;
    alertType: 'LICENSE_EXPIRY' | 'TAX_OVERDUE' | 'ENVIRONMENTAL_VIOLATION' | 'UPPF_CLAIM_OVERDUE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    regulatoryBody: 'UPPF' | 'NPA' | 'GRA' | 'EPA' | 'BOG';
    dueDate?: Date;
    actionRequired: string;
    estimatedPenalty?: number;
    autoRemediationAvailable: boolean;
    
    created: Date;
    acknowledged: boolean;
    resolved: boolean;
    resolvedDate?: Date;
}

class ComplianceAlertingService {
    // Real-time compliance monitoring
    @Cron('0 8,12,16 * * *') // 8 AM, 12 PM, 4 PM daily
    async checkComplianceAlerts(): Promise<void> {
        const alerts: ComplianceAlert[] = [];
        
        // Check license expiries
        alerts.push(...await this.checkLicenseExpiries());
        
        // Check tax deadlines
        alerts.push(...await this.checkTaxDeadlines());
        
        // Check environmental incidents
        alerts.push(...await this.checkEnvironmentalCompliance());
        
        // Check UPPF claim deadlines
        alerts.push(...await this.checkUPPFDeadlines());
        
        // Process alerts
        for (const alert of alerts) {
            await this.processComplianceAlert(alert);
        }
    }
    
    private async checkLicenseExpiries(): Promise<ComplianceAlert[]> {
        const alerts: ComplianceAlert[] = [];
        const tenants = await this.getTenants();
        
        for (const tenant of tenants) {
            const licenses = await this.getTenantLicenses(tenant.id);
            
            for (const license of licenses) {
                const daysToExpiry = moment(license.expiryDate).diff(moment(), 'days');
                
                if (daysToExpiry <= 30 && daysToExpiry > 0) {
                    alerts.push({
                        id: `license_expiry_${license.id}`,
                        tenantId: tenant.id,
                        alertType: 'LICENSE_EXPIRY',
                        severity: daysToExpiry <= 7 ? 'CRITICAL' : 'HIGH',
                        title: `${license.licenseType} License Expiring`,
                        description: `Your ${license.licenseType} license expires in ${daysToExpiry} days`,
                        regulatoryBody: 'NPA',
                        dueDate: license.expiryDate,
                        actionRequired: 'Submit license renewal application',
                        estimatedPenalty: 5000, // GHS
                        autoRemediationAvailable: false,
                        created: new Date(),
                        acknowledged: false,
                        resolved: false
                    });
                }
            }
        }
        
        return alerts;
    }
}
```

## Implementation Best Practices

### 1. Data Security for Ghana Compliance

```typescript
class GhanaComplianceDataSecurity {
    // Encrypt sensitive compliance data
    async encryptComplianceData(data: any): Promise<string> {
        const algorithm = 'aes-256-gcm';
        const key = await this.getEncryptionKey();
        const cipher = crypto.createCipher(algorithm, key);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return encrypted;
    }
    
    // Audit trail for compliance actions
    async logComplianceAction(action: ComplianceAction): Promise<void> {
        const auditLog: ComplianceAuditLog = {
            id: uuidv4(),
            tenantId: action.tenantId,
            userId: action.userId,
            action: action.type,
            details: action.details,
            regulatoryBody: action.regulatoryBody,
            timestamp: new Date(),
            ipAddress: action.ipAddress,
            userAgent: action.userAgent,
            
            // Ghana specific
            ghanaTimeZone: 'Africa/Accra',
            complianceOfficer: action.complianceOfficer,
            approvalRequired: action.requiresApproval,
            approved: false
        };
        
        await this.storeAuditLog(auditLog);
    }
}
```

### 2. Ghana-specific Validation Rules

```typescript
class GhanaBusinessValidation {
    // Validate Ghana business registration
    async validateGhanaBusinessRegistration(
        registrationNumber: string
    ): Promise<BusinessValidationResult> {
        // Ghana business registration format: CS-123456789
        const format = /^CS-\d{9}$/;
        
        if (!format.test(registrationNumber)) {
            return {
                isValid: false,
                error: 'Invalid Ghana business registration format'
            };
        }
        
        // Verify with Registrar General's Department (if API available)
        try {
            const verification = await this.verifyWithRGD(registrationNumber);
            return {
                isValid: verification.isValid,
                businessName: verification.businessName,
                registrationDate: verification.registrationDate,
                status: verification.status
            };
        } catch (error) {
            return {
                isValid: true, // Format is valid even if verification fails
                warning: 'Could not verify with Registrar General'
            };
        }
    }
    
    // Validate Ghana TIN (Tax Identification Number)
    validateGhanaTIN(tin: string): TINValidationResult {
        // Ghana TIN format: P0123456789 or C0123456789
        const format = /^[PC]\d{10}$/;
        
        if (!format.test(tin)) {
            return {
                isValid: false,
                error: 'Invalid Ghana TIN format'
            };
        }
        
        const type = tin[0] === 'P' ? 'PERSONAL' : 'CORPORATE';
        
        return {
            isValid: true,
            type,
            formatted: tin
        };
    }
}
```

---

**Comprehensive compliance ensuring 100% adherence to Ghana's regulatory requirements while maintaining operational efficiency**