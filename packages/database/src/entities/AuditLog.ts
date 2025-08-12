import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId'])
@Index(['tableName'])
@Index(['changedBy'])
@Index(['changedAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50 })
  tableName: string;

  @Column({ type: 'varchar', length: 10 })
  operation: string; // INSERT, UPDATE, DELETE

  @Column({ type: 'uuid' })
  recordId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'uuid' })
  changedBy: string;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;
}