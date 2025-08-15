import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DailyDelivery } from './daily-delivery.entity';

export enum ApprovalAction {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  ESCALATED = 'ESCALATED'
}

@Entity('delivery_approval_history')
@Index(['deliveryId'])
@Index(['approvedBy'])
export class DeliveryApprovalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @Column({ name: 'approval_step', type: 'integer' })
  approvalStep: number;

  @Column({ name: 'action', type: 'enum', enum: ApprovalAction })
  action: ApprovalAction;

  @Column({ name: 'approved_by', type: 'uuid' })
  approvedBy: string;

  @Column({ name: 'approver_role', length: 100 })
  approverRole: string;

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'decision_deadline', type: 'timestamp', nullable: true })
  decisionDeadline: Date;

  @Column({ name: 'escalation_flag', type: 'boolean', default: false })
  escalationFlag: boolean;

  @CreateDateColumn({ name: 'action_date' })
  actionDate: Date;

  @ManyToOne(() => DailyDelivery, delivery => delivery.approvalHistory)
  @JoinColumn({ name: 'delivery_id' })
  delivery: DailyDelivery;
}