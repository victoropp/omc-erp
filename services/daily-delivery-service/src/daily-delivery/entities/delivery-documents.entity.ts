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

export enum DocumentType {
  DELIVERY_RECEIPT = 'DELIVERY_RECEIPT',
  BILL_OF_LADING = 'BILL_OF_LADING',
  QUALITY_CERTIFICATE = 'QUALITY_CERTIFICATE',
  CUSTOMS_DOCUMENT = 'CUSTOMS_DOCUMENT',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  ENVIRONMENTAL_PERMIT = 'ENVIRONMENTAL_PERMIT',
  SAFETY_CERTIFICATE = 'SAFETY_CERTIFICATE',
  WAYBILL = 'WAYBILL',
  INVOICE_COPY = 'INVOICE_COPY',
  OTHER = 'OTHER'
}

@Entity('delivery_documents')
@Index(['deliveryId'])
@Index(['documentType'])
export class DeliveryDocuments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'document_name', length: 255 })
  documentName: string;

  @Column({ name: 'document_number', length: 100, nullable: true })
  documentNumber: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @ManyToOne(() => DailyDelivery, delivery => delivery.documents)
  @JoinColumn({ name: 'delivery_id' })
  delivery: DailyDelivery;
}