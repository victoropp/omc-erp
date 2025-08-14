import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

export interface NpaTemplateData {
  templateVersion: string;
  issueDate: Date;
  effectiveDate: Date;
  windowId: string;
  components: NpaComponentData[];
  metadata: {
    documentNumber: string;
    issuingAuthority: string;
    approvalReference: string;
    fileHash: string;
    processingDate: Date;
  };
}

export interface NpaComponentData {
  componentCode: string;
  componentName: string;
  category: string;
  unit: string;
  rateValue: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  applicableProducts: string[];
  remarks?: string;
}

export interface ProcessedNpaDocument {
  documentId: string;
  documentType: string;
  title: string;
  issueDate: Date;
  effectiveDate: Date;
  isProcessed: boolean;
  processedDate?: Date;
  extractedData?: NpaTemplateData;
  validationErrors: string[];
  isValid: boolean;
}

export interface NpaSubmissionPackage {
  submissionReference: string;
  submissionType: 'PRICE_SUBMISSION' | 'UPPF_CLAIMS' | 'COMPLIANCE_REPORT';
  windowId: string;
  documents: Array<{
    documentType: string;
    fileName: string;
    content: Buffer;
    metadata: any;
  }>;
  totalAmount?: number;
  claimsCount?: number;
  generatedAt: Date;
}

@Injectable()
export class NpaTemplateParserService {
  private readonly logger = new Logger(NpaTemplateParserService.name);

  // Standard NPA template patterns and validation rules
  private readonly NPA_COMPONENT_PATTERNS = {
    'EXREF': {
      aliases: ['ex-refinery', 'ex refinery price', 'refinery price'],
      expectedUnit: 'GHS_per_litre',
      category: 'other'
    },
    'ESRL': {
      aliases: ['energy sector recovery levy', 'esrl'],
      expectedUnit: 'GHS_per_litre',
      category: 'levy'
    },
    'PSRL': {
      aliases: ['price stabilisation recovery levy', 'psrl', 'stabilisation levy'],
      expectedUnit: 'GHS_per_litre',
      category: 'levy'
    },
    'ROAD': {
      aliases: ['road fund levy', 'road levy', 'road fund'],
      expectedUnit: 'GHS_per_litre',
      category: 'levy'
    },
    'EDRL': {
      aliases: ['energy debt recovery levy', 'edrl', 'debt recovery levy'],
      expectedUnit: 'GHS_per_litre',
      category: 'levy'
    },
    'BOST': {
      aliases: ['bost margin', 'bulk oil storage'],
      expectedUnit: 'GHS_per_litre',
      category: 'regulatory_margin'
    },
    'UPPF': {
      aliases: ['uppf margin', 'unified petroleum price fund', 'petroleum price fund'],
      expectedUnit: 'GHS_per_litre',
      category: 'regulatory_margin'
    },
    'MARK': {
      aliases: ['fuel marking margin', 'marking margin', 'marking fee'],
      expectedUnit: 'GHS_per_litre',
      category: 'regulatory_margin'
    },
    'PRIM': {
      aliases: ['primary distribution margin', 'distribution margin', 'primary margin'],
      expectedUnit: 'GHS_per_litre',
      category: 'distribution_margin'
    },
    'OMC': {
      aliases: ['omc margin', 'oil marketing company margin', 'marketing margin'],
      expectedUnit: 'GHS_per_litre',
      category: 'omc_margin'
    },
    'DEAL': {
      aliases: ['dealer margin', 'retailer margin', 'retail margin'],
      expectedUnit: 'GHS_per_litre',
      category: 'dealer_margin'
    }
  };

  private readonly FUEL_PRODUCT_MAPPINGS = {
    'PMS': ['premium motor spirit', 'petrol', 'gasoline', 'pms'],
    'AGO': ['automotive gas oil', 'diesel', 'ago'],
    'LPG': ['liquefied petroleum gas', 'cooking gas', 'lpg'],
    'DPK': ['dual purpose kerosene', 'kerosene', 'dpk'],
    'RFO': ['residual fuel oil', 'fuel oil', 'rfo']
  };

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Parse NPA pricing guideline document
   */
  async parseNpaDocument(
    fileBuffer: Buffer,
    fileName: string,
    documentType: 'pricing_guideline' | 'pbu_template' | 'circular' = 'pricing_guideline'
  ): Promise<ProcessedNpaDocument> {
    this.logger.log(`Parsing NPA document: ${fileName}`);

    try {
      // Calculate file hash for integrity check
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Determine file type and extract content
      const extractedContent = await this.extractContentFromFile(fileBuffer, fileName);
      
      // Parse the extracted content
      const parsedData = await this.parseDocumentContent(extractedContent, documentType);
      
      // Validate extracted data
      const validationResult = this.validateNpaData(parsedData);

      const processedDocument: ProcessedNpaDocument = {
        documentId: this.generateDocumentId(),
        documentType,
        title: this.extractDocumentTitle(extractedContent),
        issueDate: parsedData.issueDate,
        effectiveDate: parsedData.effectiveDate,
        isProcessed: validationResult.isValid,
        processedDate: validationResult.isValid ? new Date() : undefined,
        extractedData: validationResult.isValid ? parsedData : undefined,
        validationErrors: validationResult.errors,
        isValid: validationResult.isValid
      };

      if (processedDocument.isValid) {
        // Emit event for downstream processing
        this.eventEmitter.emit('npa.document.processed', {
          documentId: processedDocument.documentId,
          windowId: parsedData.windowId,
          componentsCount: parsedData.components.length
        });
      }

      this.logger.log(
        `NPA document parsing completed: ${fileName} - Valid: ${processedDocument.isValid}`
      );

      return processedDocument;

    } catch (error) {
      this.logger.error(`Failed to parse NPA document ${fileName}:`, error);
      throw new BadRequestException(`Document parsing failed: ${error.message}`);
    }
  }

  /**
   * Import parsed NPA data into system components
   */
  async importNpaComponents(
    npaData: NpaTemplateData,
    importBy: string,
    replaceExisting: boolean = false
  ): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    this.logger.log(`Importing NPA components for window: ${npaData.windowId}`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      for (const component of npaData.components) {
        try {
          const existingComponent = await this.findExistingComponent(
            component.componentCode,
            component.effectiveFrom
          );

          if (existingComponent && !replaceExisting) {
            skipped++;
            continue;
          }

          if (existingComponent && replaceExisting) {
            await this.updateComponent(existingComponent.id, {
              rateValue: component.rateValue,
              effectiveTo: component.effectiveTo,
              updatedBy: importBy,
              updatedAt: new Date()
            });
            updated++;
          } else {
            await this.createComponent({
              componentCode: component.componentCode,
              name: component.componentName,
              category: component.category,
              unit: component.unit,
              rateValue: component.rateValue,
              effectiveFrom: component.effectiveFrom,
              effectiveTo: component.effectiveTo,
              sourceDocId: npaData.metadata.documentNumber,
              approvalRef: npaData.metadata.approvalReference,
              npaCircularRef: npaData.metadata.documentNumber,
              createdBy: importBy
            });
            imported++;
          }

        } catch (error) {
          errors.push(`Failed to process component ${component.componentCode}: ${error.message}`);
        }
      }

      // Emit event for component updates
      this.eventEmitter.emit('npa.components.imported', {
        windowId: npaData.windowId,
        imported,
        updated,
        skipped
      });

      this.logger.log(
        `NPA components import completed - Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`
      );

      return { imported, updated, skipped, errors };

    } catch (error) {
      this.logger.error('NPA components import failed:', error);
      throw error;
    }
  }

  /**
   * Generate NPA submission package
   */
  async generateNpaSubmissionPackage(
    submissionType: 'PRICE_SUBMISSION' | 'UPPF_CLAIMS' | 'COMPLIANCE_REPORT',
    windowId: string,
    data: any
  ): Promise<NpaSubmissionPackage> {
    this.logger.log(`Generating NPA submission package: ${submissionType} for window ${windowId}`);

    const submissionReference = this.generateSubmissionReference(submissionType, windowId);
    const documents: Array<{ documentType: string; fileName: string; content: Buffer; metadata: any }> = [];

    try {
      switch (submissionType) {
        case 'PRICE_SUBMISSION':
          documents.push(...await this.generatePriceSubmissionDocuments(windowId, data));
          break;
        
        case 'UPPF_CLAIMS':
          documents.push(...await this.generateUppfClaimsDocuments(windowId, data));
          break;
        
        case 'COMPLIANCE_REPORT':
          documents.push(...await this.generateComplianceReportDocuments(windowId, data));
          break;
      }

      const submissionPackage: NpaSubmissionPackage = {
        submissionReference,
        submissionType,
        windowId,
        documents,
        totalAmount: data.totalAmount,
        claimsCount: data.claimsCount,
        generatedAt: new Date()
      };

      // Emit event
      this.eventEmitter.emit('npa.submission.generated', {
        submissionReference,
        submissionType,
        documentCount: documents.length
      });

      this.logger.log(
        `NPA submission package generated: ${submissionReference} with ${documents.length} documents`
      );

      return submissionPackage;

    } catch (error) {
      this.logger.error(`Failed to generate NPA submission package:`, error);
      throw error;
    }
  }

  /**
   * Validate NPA response format
   */
  async validateNpaResponse(
    responseFile: Buffer,
    expectedSubmissionRef: string
  ): Promise<{
    isValid: boolean;
    submissionReference: string;
    responseReference: string;
    responseStatus: string;
    approvedItems: any[];
    rejectedItems: any[];
    validationErrors: string[];
  }> {
    this.logger.log(`Validating NPA response for submission: ${expectedSubmissionRef}`);

    try {
      // Parse response file (assuming CSV/Excel format)
      const responseContent = await this.extractContentFromFile(responseFile, 'npa-response');
      const parsedResponse = this.parseNpaResponseContent(responseContent);

      // Validate response structure
      const validationErrors: string[] = [];
      
      if (parsedResponse.submissionReference !== expectedSubmissionRef) {
        validationErrors.push(
          `Submission reference mismatch: expected ${expectedSubmissionRef}, got ${parsedResponse.submissionReference}`
        );
      }

      if (!parsedResponse.responseReference) {
        validationErrors.push('Missing NPA response reference');
      }

      if (!['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'].includes(parsedResponse.responseStatus)) {
        validationErrors.push(`Invalid response status: ${parsedResponse.responseStatus}`);
      }

      const isValid = validationErrors.length === 0;

      this.logger.log(`NPA response validation completed - Valid: ${isValid}`);

      return {
        isValid,
        submissionReference: parsedResponse.submissionReference,
        responseReference: parsedResponse.responseReference,
        responseStatus: parsedResponse.responseStatus,
        approvedItems: parsedResponse.approvedItems || [],
        rejectedItems: parsedResponse.rejectedItems || [],
        validationErrors
      };

    } catch (error) {
      this.logger.error('NPA response validation failed:', error);
      return {
        isValid: false,
        submissionReference: expectedSubmissionRef,
        responseReference: '',
        responseStatus: 'ERROR',
        approvedItems: [],
        rejectedItems: [],
        validationErrors: [`Validation failed: ${error.message}`]
      };
    }
  }

  // Private helper methods

  private async extractContentFromFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'xlsx':
      case 'xls':
        return this.extractFromExcel(fileBuffer);
      case 'csv':
        return fileBuffer.toString('utf-8');
      case 'pdf':
        return this.extractFromPdf(fileBuffer);
      case 'txt':
        return fileBuffer.toString('utf-8');
      default:
        throw new BadRequestException(`Unsupported file format: ${fileExtension}`);
    }
  }

  private async parseDocumentContent(
    content: string,
    documentType: string
  ): Promise<NpaTemplateData> {
    // Parse content based on NPA standard format
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Extract metadata
    const issueDate = this.extractDate(content, 'issue date');
    const effectiveDate = this.extractDate(content, 'effective date');
    const windowId = this.extractWindowId(content);
    const documentNumber = this.extractDocumentNumber(content);
    
    // Extract components
    const components = this.extractComponents(content);
    
    return {
      templateVersion: '1.0',
      issueDate,
      effectiveDate,
      windowId,
      components,
      metadata: {
        documentNumber,
        issuingAuthority: 'NPA',
        approvalReference: this.extractApprovalReference(content),
        fileHash: '',
        processingDate: new Date()
      }
    };
  }

  private validateNpaData(data: NpaTemplateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate dates
    if (!data.issueDate || !data.effectiveDate) {
      errors.push('Missing required dates (issue date or effective date)');
    }

    if (data.effectiveDate < data.issueDate) {
      errors.push('Effective date cannot be before issue date');
    }

    // Validate components
    if (!data.components || data.components.length === 0) {
      errors.push('No price components found in document');
    }

    const requiredComponents = ['EXREF', 'ESRL', 'PSRL', 'ROAD', 'BOST', 'UPPF', 'OMC', 'DEAL'];
    const foundComponents = data.components.map(c => c.componentCode);
    
    for (const required of requiredComponents) {
      if (!foundComponents.includes(required)) {
        errors.push(`Missing required component: ${required}`);
      }
    }

    // Validate component values
    for (const component of data.components) {
      if (component.rateValue < 0) {
        errors.push(`Invalid rate value for ${component.componentCode}: ${component.rateValue}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private extractComponents(content: string): NpaComponentData[] {
    const components: NpaComponentData[] = [];
    const lines = content.toLowerCase().split('\n');

    // Look for component patterns in content
    for (const [componentCode, pattern] of Object.entries(this.NPA_COMPONENT_PATTERNS)) {
      const componentLine = lines.find(line => 
        pattern.aliases.some(alias => line.includes(alias))
      );

      if (componentLine) {
        const rateValue = this.extractNumericValue(componentLine);
        const applicableProducts = this.extractApplicableProducts(componentLine);

        if (rateValue !== null) {
          components.push({
            componentCode,
            componentName: this.formatComponentName(componentCode),
            category: pattern.category,
            unit: pattern.expectedUnit,
            rateValue,
            effectiveFrom: new Date(), // Would be extracted from document
            applicableProducts
          });
        }
      }
    }

    return components;
  }

  private extractDate(content: string, dateType: string): Date {
    // Mock implementation - would use regex to find dates
    const datePattern = new RegExp(`${dateType}[:\\s]*(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})`, 'i');
    const match = content.match(datePattern);
    
    if (match) {
      return new Date(match[1]);
    }
    
    return new Date(); // Default to current date
  }

  private extractWindowId(content: string): string {
    // Mock implementation - would extract window ID from content
    const windowPattern = /window[:\s]*(\d{4}-W\d{2})/i;
    const match = content.match(windowPattern);
    return match ? match[1] : '2025-W01';
  }

  private extractDocumentNumber(content: string): string {
    // Mock implementation - would extract document number
    const docPattern = /document[:\s]*([A-Z0-9\/\-]+)/i;
    const match = content.match(docPattern);
    return match ? match[1] : 'NPA-DOC-' + Date.now();
  }

  private extractApprovalReference(content: string): string {
    // Mock implementation - would extract approval reference
    return 'NPA-APP-' + Date.now();
  }

  private extractNumericValue(line: string): number | null {
    const numericPattern = /(\d+\.?\d*)/;
    const match = line.match(numericPattern);
    return match ? parseFloat(match[1]) : null;
  }

  private extractApplicableProducts(line: string): string[] {
    const defaultProducts = ['PMS', 'AGO', 'LPG'];
    
    // Check if specific products are mentioned
    for (const [productCode, aliases] of Object.entries(this.FUEL_PRODUCT_MAPPINGS)) {
      if (aliases.some(alias => line.includes(alias))) {
        return [productCode];
      }
    }
    
    return defaultProducts;
  }

  private formatComponentName(componentCode: string): string {
    const names = {
      'EXREF': 'Ex-Refinery Price',
      'ESRL': 'Energy Sector Recovery Levy',
      'PSRL': 'Price Stabilisation & Recovery Levy',
      'ROAD': 'Road Fund Levy',
      'EDRL': 'Energy Debt Recovery Levy',
      'BOST': 'BOST Margin',
      'UPPF': 'UPPF Margin',
      'MARK': 'Fuel Marking Margin',
      'PRIM': 'Primary Distribution Margin',
      'OMC': 'OMC Margin',
      'DEAL': 'Dealer/Retailer Margin'
    };
    
    return names[componentCode] || componentCode;
  }

  private extractDocumentTitle(content: string): string {
    const lines = content.split('\n').filter(Boolean);
    return lines[0] || 'NPA Pricing Document';
  }

  private generateDocumentId(): string {
    return 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }

  private generateSubmissionReference(submissionType: string, windowId: string): string {
    return `NPA-${submissionType}-${windowId}-${Date.now()}`;
  }

  // Mock implementations for external service calls

  private async extractFromExcel(buffer: Buffer): Promise<string> {
    // Mock implementation - would use xlsx library
    return 'extracted excel content';
  }

  private async extractFromPdf(buffer: Buffer): Promise<string> {
    // Mock implementation - would use pdf parser
    return 'extracted pdf content';
  }

  private async findExistingComponent(componentCode: string, effectiveFrom: Date): Promise<any> {
    // Mock implementation - would query database
    return null;
  }

  private async updateComponent(id: string, data: any): Promise<void> {
    // Mock implementation - would update database
  }

  private async createComponent(data: any): Promise<void> {
    // Mock implementation - would create in database
  }

  private async generatePriceSubmissionDocuments(windowId: string, data: any): Promise<any[]> {
    // Mock implementation - would generate price submission docs
    return [];
  }

  private async generateUppfClaimsDocuments(windowId: string, data: any): Promise<any[]> {
    // Mock implementation - would generate UPPF claims docs
    return [];
  }

  private async generateComplianceReportDocuments(windowId: string, data: any): Promise<any[]> {
    // Mock implementation - would generate compliance docs
    return [];
  }

  private parseNpaResponseContent(content: string): any {
    // Mock implementation - would parse NPA response format
    return {
      submissionReference: '',
      responseReference: '',
      responseStatus: 'APPROVED',
      approvedItems: [],
      rejectedItems: []
    };
  }
}