import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { TaxAccrual, TaxType, PaymentStatus } from '../entities/tax-accrual.entity';
import { DailyDelivery } from '../entities/daily-delivery.entity';
import { 
  CreateTaxAccrualDto, 
  UpdateTaxAccrualDto, 
  MarkTaxAccrualPaidDto,
  QueryTaxAccrualDto,
  TaxAccrualResponseDto,
  TaxAccrualSummaryDto 
} from '../dto/tax-accrual.dto';

@Injectable()
export class TaxAccrualService {
  constructor(
    @InjectRepository(TaxAccrual)
    private readonly taxAccrualRepository: Repository<TaxAccrual>,
    @InjectRepository(DailyDelivery)
    private readonly deliveryRepository: Repository<DailyDelivery>,
  ) {}

  async create(createDto: CreateTaxAccrualDto): Promise<TaxAccrualResponseDto> {
    // Verify the delivery exists
    const delivery = await this.deliveryRepository.findOne({
      where: { id: createDto.deliveryId }
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${createDto.deliveryId} not found`);
    }

    // Validate tax calculation
    if (createDto.taxableAmount > 0 && createDto.taxRate > 0) {
      const expectedTaxAmount = (createDto.taxableAmount * createDto.taxRate) / 100;
      const tolerance = 0.01; // 1 cent tolerance
      
      if (Math.abs(createDto.taxAmount - expectedTaxAmount) > tolerance) {
        throw new BadRequestException(
          `Tax amount ${createDto.taxAmount} does not match calculated amount ${expectedTaxAmount.toFixed(2)}`
        );
      }
    }

    const taxAccrual = this.taxAccrualRepository.create(createDto);
    const saved = await this.taxAccrualRepository.save(taxAccrual);
    
    return this.mapToResponseDto(saved);
  }

  async findAll(queryDto: QueryTaxAccrualDto): Promise<{
    data: TaxAccrualResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.taxAccrualRepository.createQueryBuilder('ta')
      .leftJoinAndSelect('ta.delivery', 'delivery');

    // Apply filters
    if (queryDto.deliveryId) {
      queryBuilder.andWhere('ta.deliveryId = :deliveryId', { deliveryId: queryDto.deliveryId });
    }

    if (queryDto.taxType) {
      queryBuilder.andWhere('ta.taxType = :taxType', { taxType: queryDto.taxType });
    }

    if (queryDto.paymentStatus) {
      queryBuilder.andWhere('ta.paymentStatus = :paymentStatus', { paymentStatus: queryDto.paymentStatus });
    }

    if (queryDto.taxAuthority) {
      queryBuilder.andWhere('ta.taxAuthority ILIKE :taxAuthority', { taxAuthority: `%${queryDto.taxAuthority}%` });
    }

    if (queryDto.dueDateFrom && queryDto.dueDateTo) {
      queryBuilder.andWhere('ta.dueDate BETWEEN :dueDateFrom AND :dueDateTo', {
        dueDateFrom: queryDto.dueDateFrom,
        dueDateTo: queryDto.dueDateTo
      });
    } else if (queryDto.dueDateFrom) {
      queryBuilder.andWhere('ta.dueDate >= :dueDateFrom', { dueDateFrom: queryDto.dueDateFrom });
    } else if (queryDto.dueDateTo) {
      queryBuilder.andWhere('ta.dueDate <= :dueDateTo', { dueDateTo: queryDto.dueDateTo });
    }

    if (queryDto.overdue) {
      const today = new Date();
      queryBuilder.andWhere('ta.dueDate < :today', { today });
      queryBuilder.andWhere('ta.paymentStatus = :pendingStatus', { pendingStatus: PaymentStatus.PENDING });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || 'dueDate';
    const sortOrder = queryDto.sortOrder || 'ASC';
    queryBuilder.orderBy(`ta.${sortBy}`, sortOrder);

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const offset = (page - 1) * limit;
    
    queryBuilder.skip(offset).take(limit);

    const [accruals, total] = await queryBuilder.getManyAndCount();

    return {
      data: accruals.map(accrual => this.mapToResponseDto(accrual)),
      total,
      page,
      limit
    };
  }

  async findById(id: string): Promise<TaxAccrualResponseDto> {
    const accrual = await this.taxAccrualRepository.findOne({
      where: { id },
      relations: ['delivery']
    });
    
    if (!accrual) {
      throw new NotFoundException(`Tax accrual with ID ${id} not found`);
    }

    return this.mapToResponseDto(accrual);
  }

  async findByDeliveryId(deliveryId: string): Promise<TaxAccrualResponseDto[]> {
    const accruals = await this.taxAccrualRepository.find({
      where: { deliveryId },
      order: { taxType: 'ASC' }
    });

    return accruals.map(accrual => this.mapToResponseDto(accrual));
  }

  async update(id: string, updateDto: UpdateTaxAccrualDto): Promise<TaxAccrualResponseDto> {
    const accrual = await this.taxAccrualRepository.findOne({ where: { id } });
    
    if (!accrual) {
      throw new NotFoundException(`Tax accrual with ID ${id} not found`);
    }

    // Validate tax calculation if amounts are being updated
    if (updateDto.taxableAmount && updateDto.taxRate && updateDto.taxAmount) {
      const expectedTaxAmount = (updateDto.taxableAmount * updateDto.taxRate) / 100;
      const tolerance = 0.01;
      
      if (Math.abs(updateDto.taxAmount - expectedTaxAmount) > tolerance) {
        throw new BadRequestException(
          `Tax amount ${updateDto.taxAmount} does not match calculated amount ${expectedTaxAmount.toFixed(2)}`
        );
      }
    }

    Object.assign(accrual, updateDto);
    const updated = await this.taxAccrualRepository.save(accrual);
    
    return this.mapToResponseDto(updated);
  }

  async markAsPaid(id: string, markPaidDto: MarkTaxAccrualPaidDto): Promise<TaxAccrualResponseDto> {
    const accrual = await this.taxAccrualRepository.findOne({ where: { id } });
    
    if (!accrual) {
      throw new NotFoundException(`Tax accrual with ID ${id} not found`);
    }

    if (accrual.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Tax accrual is already marked as paid');
    }

    accrual.paymentStatus = PaymentStatus.PAID;
    accrual.paymentDate = markPaidDto.paymentDate;
    accrual.paymentReference = markPaidDto.paymentReference;
    accrual.updatedBy = markPaidDto.updatedBy;

    const updated = await this.taxAccrualRepository.save(accrual);
    
    return this.mapToResponseDto(updated);
  }

  async markAsOverdue(): Promise<number> {
    const today = new Date();
    
    const result = await this.taxAccrualRepository
      .createQueryBuilder()
      .update(TaxAccrual)
      .set({ paymentStatus: PaymentStatus.OVERDUE })
      .where('dueDate < :today', { today })
      .andWhere('paymentStatus = :pendingStatus', { pendingStatus: PaymentStatus.PENDING })
      .execute();

    return result.affected || 0;
  }

  async generateAccrualsForDelivery(deliveryId: string, createdBy: string): Promise<TaxAccrualResponseDto[]> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId }
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${deliveryId} not found`);
    }

    // Delete existing accruals for this delivery
    await this.taxAccrualRepository.delete({ deliveryId });

    const accruals = [];

    // Generate accruals based on delivery tax amounts
    if (delivery.petroleumTaxAmount > 0) {
      accruals.push(await this.createAccrualFromDelivery(
        delivery, TaxType.PETROLEUM_TAX, delivery.petroleumTaxAmount, 
        '5500', '2300', 'Ghana Revenue Authority', 30, createdBy
      ));
    }

    if (delivery.energyFundLevy > 0) {
      accruals.push(await this.createAccrualFromDelivery(
        delivery, TaxType.ENERGY_FUND_LEVY, delivery.energyFundLevy,
        '5510', '2310', 'Energy Commission', 30, createdBy
      ));
    }

    if (delivery.roadFundLevy > 0) {
      accruals.push(await this.createAccrualFromDelivery(
        delivery, TaxType.ROAD_FUND_LEVY, delivery.roadFundLevy,
        '5520', '2320', 'Ministry of Roads and Highways', 30, createdBy
      ));
    }

    if (delivery.priceStabilizationLevy > 0) {
      accruals.push(await this.createAccrualFromDelivery(
        delivery, TaxType.PRICE_STABILIZATION_LEVY, delivery.priceStabilizationLevy,
        '5530', '2330', 'Ministry of Energy', 30, createdBy
      ));
    }

    if (delivery.unifiedPetroleumPriceFundLevy > 0) {
      accruals.push(await this.createAccrualFromDelivery(
        delivery, TaxType.UPPF_LEVY, delivery.unifiedPetroleumPriceFundLevy,
        '5540', '2340', 'National Petroleum Authority', 15, createdBy
      ));
    }

    return accruals.filter(Boolean);
  }

  async getSummary(queryDto: Partial<QueryTaxAccrualDto> = {}): Promise<TaxAccrualSummaryDto> {
    const queryBuilder = this.taxAccrualRepository.createQueryBuilder('ta');

    // Apply basic filters
    if (queryDto.taxType) {
      queryBuilder.andWhere('ta.taxType = :taxType', { taxType: queryDto.taxType });
    }

    if (queryDto.dueDateFrom && queryDto.dueDateTo) {
      queryBuilder.andWhere('ta.dueDate BETWEEN :dueDateFrom AND :dueDateTo', {
        dueDateFrom: queryDto.dueDateFrom,
        dueDateTo: queryDto.dueDateTo
      });
    }

    const accruals = await queryBuilder.getMany();

    // Calculate summary statistics
    const totalAccruals = accruals.length;
    const totalAmount = accruals.reduce((sum, accrual) => sum + accrual.taxAmount, 0);
    
    const pending = accruals.filter(a => a.paymentStatus === PaymentStatus.PENDING);
    const paid = accruals.filter(a => a.paymentStatus === PaymentStatus.PAID);
    const overdue = accruals.filter(a => a.isOverdue());

    const pendingAmount = pending.reduce((sum, accrual) => sum + accrual.taxAmount, 0);
    const paidAmount = paid.reduce((sum, accrual) => sum + accrual.taxAmount, 0);
    const overdueAmount = overdue.reduce((sum, accrual) => sum + accrual.taxAmount, 0);

    // Group by tax type
    const byTaxType = Object.values(TaxType).map(taxType => {
      const typeAccruals = accruals.filter(a => a.taxType === taxType);
      const typePending = typeAccruals.filter(a => a.paymentStatus === PaymentStatus.PENDING);
      const typePaid = typeAccruals.filter(a => a.paymentStatus === PaymentStatus.PAID);

      return {
        taxType,
        count: typeAccruals.length,
        totalAmount: typeAccruals.reduce((sum, a) => sum + a.taxAmount, 0),
        pendingAmount: typePending.reduce((sum, a) => sum + a.taxAmount, 0),
        paidAmount: typePaid.reduce((sum, a) => sum + a.taxAmount, 0)
      };
    }).filter(item => item.count > 0);

    // Group by authority
    const authorityMap = new Map<string, any>();
    accruals.forEach(accrual => {
      if (!accrual.taxAuthority) return;
      
      if (!authorityMap.has(accrual.taxAuthority)) {
        authorityMap.set(accrual.taxAuthority, {
          authority: accrual.taxAuthority,
          count: 0,
          totalAmount: 0,
          pendingAmount: 0
        });
      }

      const authData = authorityMap.get(accrual.taxAuthority);
      authData.count++;
      authData.totalAmount += accrual.taxAmount;
      
      if (accrual.paymentStatus === PaymentStatus.PENDING) {
        authData.pendingAmount += accrual.taxAmount;
      }
    });

    return {
      totalAccruals,
      totalAmount,
      pendingAmount,
      paidAmount,
      overdueAmount,
      pendingCount: pending.length,
      paidCount: paid.length,
      overdueCount: overdue.length,
      byTaxType,
      byAuthority: Array.from(authorityMap.values())
    };
  }

  private async createAccrualFromDelivery(
    delivery: DailyDelivery,
    taxType: TaxType,
    taxAmount: number,
    taxAccountCode: string,
    liabilityAccountCode: string,
    taxAuthority: string,
    dueDays: number,
    createdBy: string
  ): Promise<TaxAccrualResponseDto> {
    const dueDate = new Date(delivery.deliveryDate);
    dueDate.setDate(dueDate.getDate() + dueDays);

    const createDto: CreateTaxAccrualDto = {
      deliveryId: delivery.id,
      taxType,
      taxRate: 0, // Rate not always available from delivery
      taxableAmount: delivery.totalValue,
      taxAmount,
      taxAccountCode,
      liabilityAccountCode,
      taxAuthority,
      dueDate,
      currencyCode: delivery.currency,
      exchangeRate: 1,
      baseTaxAmount: taxAmount,
      description: `${taxType} for delivery ${delivery.deliveryNumber}`,
      createdBy
    };

    return this.create(createDto);
  }

  private mapToResponseDto(accrual: TaxAccrual): TaxAccrualResponseDto {
    return {
      id: accrual.id,
      deliveryId: accrual.deliveryId,
      taxType: accrual.taxType,
      taxRate: accrual.taxRate,
      taxableAmount: accrual.taxableAmount,
      taxAmount: accrual.taxAmount,
      taxAccountCode: accrual.taxAccountCode,
      liabilityAccountCode: accrual.liabilityAccountCode,
      taxAuthority: accrual.taxAuthority,
      dueDate: accrual.dueDate,
      paymentStatus: accrual.paymentStatus,
      paymentDate: accrual.paymentDate,
      paymentReference: accrual.paymentReference,
      currencyCode: accrual.currencyCode,
      exchangeRate: accrual.exchangeRate,
      baseTaxAmount: accrual.baseTaxAmount,
      description: accrual.description,
      createdAt: accrual.createdAt,
      updatedAt: accrual.updatedAt,
      createdBy: accrual.createdBy,
      updatedBy: accrual.updatedBy,
      // Computed properties
      isOverdue: accrual.isOverdue(),
      daysOverdue: accrual.getDaysOverdue(),
      daysUntilDue: accrual.getDaysUntilDue(),
      effectiveTaxRate: accrual.getEffectiveTaxRate()
    };
  }
}