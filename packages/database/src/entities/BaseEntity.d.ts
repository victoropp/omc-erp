import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';
export declare abstract class BaseEntity extends TypeOrmBaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=BaseEntity.d.ts.map