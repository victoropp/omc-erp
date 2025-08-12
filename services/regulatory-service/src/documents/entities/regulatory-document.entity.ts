import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RegulatoryDocType } from '@omc-erp/shared-types';

@Entity('regulatory_documents')
@Index(['tenantId', 'type', 'effectiveDate'])
@Index(['fileHash'], { unique: true })
export class RegulatoryDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column({
    type: 'enum',
    enum: RegulatoryDocType,
  })
  type: RegulatoryDocType;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text')
  description?: string;

  @Column('varchar', { length: 50 })
  documentNumber: string; // NPA reference number

  @Column('varchar', { length: 20 })
  version: string;

  @Column('text')
  fileUrl: string;

  @Column('varchar', { length: 64, unique: true })
  fileHash: string; // SHA-256 hash for integrity verification

  @Column('varchar', { length: 100 })
  fileName: string;

  @Column('varchar', { length: 50 })
  mimeType: string;

  @Column('bigint')
  fileSize: number; // in bytes

  @Column('date')
  effectiveDate: Date;

  @Column('date', { nullable: true })
  expiryDate?: Date;

  @Column('date')
  publicationDate: Date;

  @Column('varchar', { length: 200, nullable: true })
  sourceUrl?: string; // Original NPA URL

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  metadata?: {
    // For PBU templates
    windowId?: string;
    components?: string[];
    // For pricing guidelines
    guidelineType?: string;
    applicableProducts?: string[];
    // For circulars
    circularType?: string;
    affectedParties?: string[];
    // For legal documents
    actNumber?: string;
    sections?: string[];
  };

  @Column('jsonb', { nullable: true })
  parsedContent?: {
    // For PBU templates - extracted component rates
    components?: Array<{
      code: string;
      name: string;
      category: string;
      rate: number;
      unit: string;
    }>;
    // For pricing guidelines - key requirements
    requirements?: string[];
    // For circulars - action items
    actionItems?: string[];
  };

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid')
  uploadedBy: string;

  @Column('uuid', { nullable: true })
  verifiedBy?: string;

  @Column('timestamp', { nullable: true })
  verifiedAt?: Date;

  @Column('uuid', { nullable: true })
  supersededBy?: string; // Reference to newer version

  @Column('uuid', { nullable: true })
  supersedes?: string; // Reference to older version

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isEffectiveOn(date: Date): boolean {
    return date >= this.effectiveDate && 
           (!this.expiryDate || date <= this.expiryDate) && 
           this.isActive;
  }

  isCurrentVersion(): boolean {
    return this.isActive && !this.supersededBy;
  }

  getFileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  getHumanReadableSize(): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let i = 0;
    
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024;
      i++;
    }
    
    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  }
}