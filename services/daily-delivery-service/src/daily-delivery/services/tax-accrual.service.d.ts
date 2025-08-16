import { Repository } from 'typeorm';
import { TaxAccrual } from '../entities/tax-accrual.entity';
import { DailyDelivery } from '../entities/daily-delivery.entity';
import { CreateTaxAccrualDto, UpdateTaxAccrualDto, MarkTaxAccrualPaidDto, QueryTaxAccrualDto, TaxAccrualResponseDto, TaxAccrualSummaryDto } from '../dto/tax-accrual.dto';
export declare class TaxAccrualService {
    private readonly taxAccrualRepository;
    private readonly deliveryRepository;
    constructor(taxAccrualRepository: Repository<TaxAccrual>, deliveryRepository: Repository<DailyDelivery>);
    create(createDto: CreateTaxAccrualDto): Promise<TaxAccrualResponseDto>;
    findAll(queryDto: QueryTaxAccrualDto): Promise<{
        data: TaxAccrualResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<TaxAccrualResponseDto>;
    findByDeliveryId(deliveryId: string): Promise<TaxAccrualResponseDto[]>;
    update(id: string, updateDto: UpdateTaxAccrualDto): Promise<TaxAccrualResponseDto>;
    markAsPaid(id: string, markPaidDto: MarkTaxAccrualPaidDto): Promise<TaxAccrualResponseDto>;
    markAsOverdue(): Promise<number>;
    generateAccrualsForDelivery(deliveryId: string, createdBy: string): Promise<TaxAccrualResponseDto[]>;
    getSummary(queryDto?: Partial<QueryTaxAccrualDto>): Promise<TaxAccrualSummaryDto>;
    private createAccrualFromDelivery;
    private mapToResponseDto;
}
//# sourceMappingURL=tax-accrual.service.d.ts.map