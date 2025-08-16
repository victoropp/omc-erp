import { PBUComponentCategory, PBUComponentUnit } from '@omc-erp/shared-types';
export declare class PBUComponent {
    id: string;
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
    notes?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    isEffectiveOn(date: Date): boolean;
    getDisplayValue(): string;
}
//# sourceMappingURL=pbu-component.entity.d.ts.map