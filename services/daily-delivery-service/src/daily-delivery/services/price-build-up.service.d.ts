import { Repository } from 'typeorm';
import { PriceBuildUpComponent, ComponentType } from '../entities/price-build-up-component.entity';
import { StationType, ProductGrade } from '../entities/daily-delivery.entity';
import { CreatePriceBuildUpComponentDto, UpdatePriceBuildUpComponentDto, QueryPriceBuildUpComponentDto, PriceBuildUpComponentResponseDto } from '../dto/price-build-up-component.dto';
export declare class PriceBuildUpService {
    private readonly priceBuildUpRepository;
    constructor(priceBuildUpRepository: Repository<PriceBuildUpComponent>);
    create(createDto: CreatePriceBuildUpComponentDto): Promise<PriceBuildUpComponentResponseDto>;
    findAll(queryDto: QueryPriceBuildUpComponentDto): Promise<{
        data: PriceBuildUpComponentResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<PriceBuildUpComponentResponseDto>;
    findEffectiveComponents(productGrade: ProductGrade, stationType: StationType, effectiveDate?: Date): Promise<PriceBuildUpComponentResponseDto[]>;
    update(id: string, updateDto: UpdatePriceBuildUpComponentDto): Promise<PriceBuildUpComponentResponseDto>;
    deactivate(id: string, updatedBy: string): Promise<void>;
    expire(id: string, expiryDate: Date, updatedBy: string): Promise<void>;
    calculatePriceBuildup(productGrade: ProductGrade, stationType: StationType, basePrice: number, quantity: number, effectiveDate?: Date): Promise<{
        components: Array<{
            code: string;
            name: string;
            type: ComponentType;
            value: number;
            calculatedAmount: number;
        }>;
        totalPrice: number;
        breakdown: {
            basePrice: number;
            totalTaxes: number;
            totalLevies: number;
            totalMargins: number;
        };
    }>;
    generatePriceSnapshot(productGrade: ProductGrade, stationType: StationType, effectiveDate?: Date): Promise<any>;
    private calculateComponentValue;
    private mapToResponseDto;
}
//# sourceMappingURL=price-build-up.service.d.ts.map