import { DailyDelivery } from '../entities/daily-delivery.entity';
import { CreateDailyDeliveryDto } from '../dto/create-daily-delivery.dto';
import { UpdateDailyDeliveryDto } from '../dto/update-daily-delivery.dto';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class DeliveryValidationService {
    validateDelivery(deliveryData: CreateDailyDeliveryDto | DailyDelivery): Promise<ValidationResult>;
    validateForApproval(delivery: DailyDelivery): Promise<ValidationResult>;
    validateForInvoicing(delivery: DailyDelivery): Promise<ValidationResult>;
    validateDeliveryUpdate(currentDelivery: DailyDelivery, updateData: UpdateDailyDeliveryDto): Promise<ValidationResult>;
    validateBusinessRules(delivery: DailyDelivery): ValidationResult;
    validateGhanaCompliance(delivery: DailyDelivery): ValidationResult;
}
//# sourceMappingURL=delivery-validation.service.d.ts.map