import { Injectable } from '@nestjs/common';
import { DailyDelivery, ProductGrade } from '../entities/daily-delivery.entity';
import { CreateDailyDeliveryDto } from '../dto/create-daily-delivery.dto';
import { UpdateDailyDeliveryDto } from '../dto/update-daily-delivery.dto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class DeliveryValidationService {
  
  async validateDelivery(deliveryData: CreateDailyDeliveryDto | DailyDelivery): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!deliveryData.deliveryDate) errors.push('Delivery date is required');
    if (!deliveryData.supplierId) errors.push('Supplier is required');
    if (!deliveryData.customerId) errors.push('Customer is required');
    if (!deliveryData.depotId) errors.push('Depot is required');
    if (!deliveryData.psaNumber) errors.push('PSA number is required');
    if (!deliveryData.waybillNumber) errors.push('Waybill number is required');
    if (!deliveryData.vehicleRegistrationNumber) errors.push('Vehicle registration is required');
    if (!deliveryData.customerName) errors.push('Customer name is required');
    if (!deliveryData.deliveryLocation) errors.push('Delivery location is required');
    if (!deliveryData.transporterName) errors.push('Transporter name is required');

    // Quantity and pricing validation
    if (deliveryData.quantityLitres <= 0) errors.push('Quantity must be positive');
    if (deliveryData.unitPrice <= 0) errors.push('Unit price must be positive');
    
    // Calculate and verify total value
    const calculatedTotal = deliveryData.quantityLitres * deliveryData.unitPrice;
    if (deliveryData.totalValue && Math.abs(deliveryData.totalValue - calculatedTotal) > 0.01) {
      errors.push('Total value calculation mismatch');
    }

    // Ghana-specific validations
    if (deliveryData.productType === ProductGrade.PMS || deliveryData.productType === ProductGrade.AGO) {
      if (!deliveryData.npaPermitNumber) {
        warnings.push('NPA permit number recommended for controlled products');
      }
    }

    // Date validations
    const deliveryDate = typeof deliveryData.deliveryDate === 'string' 
      ? new Date(deliveryData.deliveryDate) 
      : deliveryData.deliveryDate;
    
    if (deliveryDate > new Date()) {
      errors.push('Delivery date cannot be in the future');
    }

    // Planned vs actual delivery time validation (for updates)
    if ('plannedDeliveryTime' in deliveryData && 'actualDeliveryTime' in deliveryData) {
      const plannedTime = typeof deliveryData.plannedDeliveryTime === 'string' 
        ? new Date(deliveryData.plannedDeliveryTime) 
        : deliveryData.plannedDeliveryTime;
      const actualTime = typeof deliveryData.actualDeliveryTime === 'string' 
        ? new Date(deliveryData.actualDeliveryTime) 
        : deliveryData.actualDeliveryTime;

      if (plannedTime && actualTime && actualTime < plannedTime) {
        warnings.push('Actual delivery time is before planned time');
      }
    }

    // Temperature validation
    if (deliveryData.temperatureAtLoading !== undefined && deliveryData.temperatureAtLoading !== null) {
      if (deliveryData.temperatureAtLoading < -50 || deliveryData.temperatureAtLoading > 100) {
        errors.push('Loading temperature out of valid range (-50°C to 100°C)');
      }
    }

    if (deliveryData.temperatureAtDischarge !== undefined && deliveryData.temperatureAtDischarge !== null) {
      if (deliveryData.temperatureAtDischarge < -50 || deliveryData.temperatureAtDischarge > 100) {
        errors.push('Discharge temperature out of valid range (-50°C to 100°C)');
      }
    }

    // Density validation
    if (deliveryData.densityAtLoading !== undefined && deliveryData.densityAtLoading !== null) {
      if (deliveryData.densityAtLoading < 0.5 || deliveryData.densityAtLoading > 1.5) {
        errors.push('Loading density out of valid range (0.5 to 1.5 g/cm³)');
      }
    }

    if (deliveryData.densityAtDischarge !== undefined && deliveryData.densityAtDischarge !== null) {
      if (deliveryData.densityAtDischarge < 0.5 || deliveryData.densityAtDischarge > 1.5) {
        errors.push('Discharge density out of valid range (0.5 to 1.5 g/cm³)');
      }
    }

    // Volume validation
    if ('netStandardVolume' in deliveryData && 'grossStandardVolume' in deliveryData) {
      if (deliveryData.netStandardVolume && deliveryData.grossStandardVolume) {
        if (deliveryData.netStandardVolume > deliveryData.grossStandardVolume) {
          warnings.push('Net standard volume exceeds gross standard volume');
        }
      }
    }

    // Risk assessment validation
    if (deliveryData.quantityLitres > 50000 && !deliveryData.securityEscortRequired) {
      warnings.push('Security escort recommended for high-volume deliveries');
    }

    // Environmental validation
    if ('carbonFootprintKg' in deliveryData && 'distanceTravelledKm' in deliveryData) {
      if (deliveryData.carbonFootprintKg && deliveryData.distanceTravelledKm) {
        const expectedFootprint = deliveryData.distanceTravelledKm * 2.6; // kg CO2 per km for trucks
        if (Math.abs(deliveryData.carbonFootprintKg - expectedFootprint) > expectedFootprint * 0.2) {
          warnings.push('Carbon footprint calculation may be inaccurate');
        }
      }
    }

    // Vehicle registration format validation (Ghana format)
    if (deliveryData.vehicleRegistrationNumber) {
      const ghanaVehicleRegex = /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{1,2}$/i;
      if (!ghanaVehicleRegex.test(deliveryData.vehicleRegistrationNumber)) {
        warnings.push('Vehicle registration number format may not be valid for Ghana');
      }
    }

    // Phone number validation (Ghana format)
    if (deliveryData.driverPhone) {
      const ghanaPhoneRegex = /^(\+233|0)[2-9]\d{8}$/;
      if (!ghanaPhoneRegex.test(deliveryData.driverPhone)) {
        warnings.push('Driver phone number format may not be valid for Ghana');
      }
    }

    // PSA number format validation
    if (deliveryData.psaNumber) {
      if (deliveryData.psaNumber.length < 5) {
        warnings.push('PSA number seems too short');
      }
    }

    // Waybill number format validation
    if (deliveryData.waybillNumber) {
      if (deliveryData.waybillNumber.length < 5) {
        warnings.push('Waybill number seems too short');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async validateForApproval(delivery: DailyDelivery): Promise<ValidationResult> {
    const baseValidation = await this.validateDelivery(delivery);
    const approvalErrors = [...baseValidation.errors];
    const approvalWarnings = [...baseValidation.warnings];

    // Additional approval-specific validations
    if (!delivery.deliveryInstructions && delivery.quantityLitres > 30000) {
      approvalWarnings.push('Delivery instructions recommended for large deliveries');
    }

    if (!delivery.insurancePolicyNumber && delivery.totalValue > 100000) {
      approvalErrors.push('Insurance policy required for high-value deliveries');
    }

    // Check for required documents based on delivery type and value
    if (delivery.totalValue > 200000) {
      if (!delivery.billOfLadingUrl) {
        approvalErrors.push('Bill of lading required for high-value deliveries');
      }
    }

    if (delivery.productType === ProductGrade.PMS || delivery.productType === ProductGrade.AGO) {
      if (!delivery.qualityCertificateUrl) {
        approvalWarnings.push('Quality certificate recommended for fuel deliveries');
      }
    }

    // Environmental compliance checks
    if (delivery.quantityLitres > 40000 && !delivery.environmentalPermitNumber) {
      approvalWarnings.push('Environmental permit may be required for large deliveries');
    }

    // GPS tracking validation for high-risk deliveries
    if ((delivery.riskAssessmentScore >= 7 || delivery.totalValue > 500000) && !delivery.gpsTrackingEnabled) {
      approvalWarnings.push('GPS tracking recommended for high-risk or high-value deliveries');
    }

    return {
      isValid: approvalErrors.length === 0,
      errors: approvalErrors,
      warnings: approvalWarnings
    };
  }

  async validateForInvoicing(delivery: DailyDelivery): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic invoicing requirements
    if (!delivery.actualDeliveryTime) {
      errors.push('Actual delivery time required for invoicing');
    }

    if (!delivery.performanceObligationSatisfied) {
      errors.push('Performance obligation must be satisfied before invoicing');
    }

    if (!delivery.deliveryReceiptUrl) {
      warnings.push('Delivery receipt recommended for invoicing');
    }

    // Volume variance check
    if (delivery.netStandardVolume && Math.abs(delivery.quantityLitres - delivery.netStandardVolume) > delivery.quantityLitres * 0.02) {
      warnings.push('Significant volume variance detected - verify measurements');
    }

    // Temperature variance check
    if (delivery.temperatureAtLoading && delivery.temperatureAtDischarge) {
      const tempDiff = Math.abs(delivery.temperatureAtLoading - delivery.temperatureAtDischarge);
      if (tempDiff > 10) {
        warnings.push('Large temperature difference between loading and discharge');
      }
    }

    // Quality specifications check for line items
    if (delivery.lineItems && delivery.lineItems.length > 0) {
      const itemsWithoutSpecs = delivery.lineItems.filter(item => !item.qualitySpecifications);
      if (itemsWithoutSpecs.length > 0) {
        warnings.push('Some line items missing quality specifications');
      }
    }

    // Tax and duty validation
    if (delivery.getTotalTaxes() === 0 && delivery.totalValue > 1000) {
      warnings.push('No taxes calculated for substantial delivery');
    }

    // Ghana-specific invoicing requirements
    if (delivery.totalValue > 50000 && !delivery.customsEntryNumber) {
      warnings.push('Customs entry number may be required for high-value deliveries');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async validateDeliveryUpdate(currentDelivery: DailyDelivery, updateData: UpdateDailyDeliveryDto): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Merge current delivery with update data for validation
    const mergedData = { ...currentDelivery, ...updateData };

    // Run standard validation
    const baseValidation = await this.validateDelivery(mergedData);
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // Status-specific validations
    if (currentDelivery.status === 'DELIVERED' && updateData.actualDeliveryTime) {
      const newDeliveryTime = new Date(updateData.actualDeliveryTime);
      const currentTime = new Date();
      if (newDeliveryTime > currentTime) {
        errors.push('Actual delivery time cannot be in the future');
      }
    }

    // Prevent critical field changes after approval
    if (currentDelivery.status === 'APPROVED' || currentDelivery.status === 'IN_TRANSIT' || currentDelivery.status === 'DELIVERED') {
      const criticalFields = ['quantityLitres', 'unitPrice', 'productType', 'supplierId', 'customerId', 'depotId'];
      
      for (const field of criticalFields) {
        if (updateData[field] !== undefined && updateData[field] !== currentDelivery[field]) {
          errors.push(`Cannot modify ${field} after delivery is approved`);
        }
      }
    }

    // Validate delivery rating
    if (updateData.deliveryRating !== undefined) {
      if (updateData.deliveryRating < 1 || updateData.deliveryRating > 5) {
        errors.push('Delivery rating must be between 1 and 5');
      }
      if (currentDelivery.status !== 'DELIVERED') {
        errors.push('Delivery rating can only be set for delivered items');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateBusinessRules(delivery: DailyDelivery): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Business rule: Same day multiple deliveries to same customer
    // This would require database check - placeholder for now
    warnings.push('Consider checking for same-day multiple deliveries to same customer');

    // Business rule: Delivery time window validation
    if (delivery.plannedDeliveryTime) {
      const deliveryHour = delivery.plannedDeliveryTime.getHours();
      if (deliveryHour < 6 || deliveryHour > 20) {
        warnings.push('Delivery planned outside normal business hours (6 AM - 8 PM)');
      }
    }

    // Business rule: Minimum delivery quantity
    const minQuantities = {
      [ProductGrade.PMS]: 1000,
      [ProductGrade.AGO]: 1000,
      [ProductGrade.IFO]: 5000,
      [ProductGrade.LPG]: 500,
      [ProductGrade.KEROSENE]: 500,
      [ProductGrade.LUBRICANTS]: 100,
    };

    const minQuantity = minQuantities[delivery.productType];
    if (minQuantity && delivery.quantityLitres < minQuantity) {
      warnings.push(`Quantity below recommended minimum of ${minQuantity} litres for ${delivery.productType}`);
    }

    // Business rule: Weekend delivery surcharge
    if (delivery.deliveryDate) {
      const dayOfWeek = delivery.deliveryDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
        warnings.push('Weekend delivery may incur additional charges');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateGhanaCompliance(delivery: DailyDelivery): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // NPA compliance for controlled products
    const controlledProducts = [ProductGrade.PMS, ProductGrade.AGO, ProductGrade.KEROSENE];
    if (controlledProducts.includes(delivery.productType)) {
      if (!delivery.npaPermitNumber) {
        errors.push('NPA permit number required for controlled petroleum products');
      }
    }

    // Customs compliance for imports
    if (delivery.totalValue > 100000 && !delivery.customsEntryNumber) {
      warnings.push('Customs entry number recommended for high-value deliveries');
    }

    // Tax compliance
    const expectedTaxRate = 0.15; // 15% typical petroleum tax
    const expectedTax = delivery.totalValue * expectedTaxRate;
    const actualTax = delivery.getTotalTaxes();
    
    if (Math.abs(actualTax - expectedTax) > expectedTax * 0.1) {
      warnings.push('Calculated taxes may not align with expected rates');
    }

    // UPPF levy validation
    if (delivery.unifiedPetroleumPriceFundLevy === 0 && delivery.totalValue > 1000) {
      warnings.push('UPPF levy may be required for this delivery');
    }

    // Environmental compliance
    if (delivery.quantityLitres > 50000 && !delivery.environmentalPermitNumber) {
      warnings.push('Environmental permit may be required for large fuel deliveries');
    }

    // Vehicle compliance
    if (!delivery.emissionCertificateNumber && delivery.quantityLitres > 20000) {
      warnings.push('Emission certificate recommended for large deliveries');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}