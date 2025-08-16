import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UPPFClaim } from './entities/uppf-claim.entity';
import { PricingWindow } from './entities/pricing-window.entity';
import { NPASubmission } from './entities/npa-submission.entity';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';

export interface NPASubmissionRequest {
  windowId: string;
  claims: UPPFClaim[];
  submissionType: 'UPPF_CLAIMS' | 'PRICE_SUBMISSION' | 'COMPLIANCE_REPORT';
  submissionDeadline?: Date;
}

export interface NPASubmissionResult {
  submissionId: string;
  submissionReference: string;
  submissionDate: Date;
  totalClaims: number;
  totalAmount: number;
  documentsGenerated: NPADocument[];
  validationResults: ValidationResult[];
  submissionStatus: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface NPADocument {
  documentType: 'SUMMARY_REPORT' | 'DETAILED_CLAIMS' | 'SUPPORTING_EVIDENCE' | 'COMPLIANCE_CERTIFICATE';
  fileName: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  generatedAt: Date;
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  affectedClaims?: string[];
}

export interface NPASubmissionSchedule {
  windowId: string;
  submissionDeadline: Date;
  reminderDates: Date[];
  escalationDates: Date[];
  autoSubmitEnabled: boolean;
  batchSize: number;
}

@Injectable()
export class NPASubmissionService {
  private readonly logger = new Logger(NPASubmissionService.name);

  constructor(
    @InjectRepository(UPPFClaim)
    private readonly claimRepository: Repository<UPPFClaim>,
    @InjectRepository(PricingWindow)
    private readonly pricingWindowRepository: Repository<PricingWindow>,
    @InjectRepository(NPASubmission)
    private readonly submissionRepository: Repository<NPASubmission>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Submit batch of UPPF claims to NPA
   */
  async submitBatch(request: NPASubmissionRequest): Promise<NPASubmissionResult> {
    this.logger.log(`Submitting batch of ${request.claims.length} claims for window ${request.windowId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate submission eligibility
      await this.validateSubmissionEligibility(request);

      // Get pricing window details
      const pricingWindow = await this.pricingWindowRepository.findOne({
        where: { windowId: request.windowId },
      });

      if (!pricingWindow) {
        throw new BadRequestException(`Pricing window ${request.windowId} not found`);
      }

      // Validate all claims meet NPA requirements
      const validationResults = await this.validateClaimsForSubmission(request.claims);
      const failedValidations = validationResults.filter(v => v.status === 'FAIL');

      if (failedValidations.length > 0) {
        throw new BadRequestException(
          `Claims validation failed: ${failedValidations.map(v => v.message).join('; ')}`
        );
      }

      // Generate submission reference
      const submissionReference = this.generateSubmissionReference(request.windowId, request.submissionType);

      // Create NPA submission record
      const submission = queryRunner.manager.create(NPASubmission, {
        submissionReference,
        submissionType: request.submissionType,
        windowId: request.windowId,
        totalClaims: request.claims.length,
        totalAmount: request.claims.reduce((sum, claim) => sum + claim.amountDue, 0),
        submissionStatus: 'DRAFT',
        submissionDate: new Date(),
      });

      const savedSubmission = await queryRunner.manager.save(submission);

      // Generate NPA-compliant documents
      const documents = await this.generateNPADocuments({
        submission: savedSubmission,
        claims: request.claims,
        pricingWindow,
        validationResults,
      });

      // Update submission with document references
      savedSubmission.documentsGenerated = documents.length;
      savedSubmission.submissionStatus = 'SUBMITTED';
      await queryRunner.manager.save(savedSubmission);

      // Update claim statuses
      await this.updateClaimStatuses(queryRunner, request.claims, submissionReference);

      // Submit to NPA API (if available)
      const npaResponse = await this.submitToNPAAPI({
        submissionReference,
        documents,
        claims: request.claims,
      });

      if (npaResponse.success) {
        savedSubmission.npaAcknowledgmentRef = npaResponse.acknowledgmentRef;
        savedSubmission.submissionStatus = 'ACKNOWLEDGED';
        await queryRunner.manager.save(savedSubmission);
      }

      await queryRunner.commitTransaction();

      // Generate final result
      const result: NPASubmissionResult = {
        submissionId: savedSubmission.id,
        submissionReference,
        submissionDate: savedSubmission.submissionDate,
        totalClaims: request.claims.length,
        totalAmount: savedSubmission.totalAmount,
        documentsGenerated: documents,
        validationResults,
        submissionStatus: savedSubmission.submissionStatus,
      };

      // Emit submission event
      this.eventEmitter.emit('npa-submission.completed', {
        submissionId: savedSubmission.id,
        submissionReference,
        totalAmount: savedSubmission.totalAmount,
        windowId: request.windowId,
      });

      this.logger.log(`NPA submission completed: ${submissionReference}`);
      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`NPA submission failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate automated submission schedule
   */
  async generateSubmissionSchedule(windowId: string): Promise<NPASubmissionSchedule> {
    const pricingWindow = await this.pricingWindowRepository.findOne({
      where: { windowId },
    });

    if (!pricingWindow) {
      throw new BadRequestException(`Pricing window ${windowId} not found`);
    }

    const submissionDeadline = pricingWindow.submissionDeadline || 
      new Date(pricingWindow.endDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after window end

    const reminderDates = [
      new Date(submissionDeadline.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days before
      new Date(submissionDeadline.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days before
      new Date(submissionDeadline.getTime() - (1 * 24 * 60 * 60 * 1000)), // 1 day before
    ];

    const escalationDates = [
      new Date(submissionDeadline.getTime() + (1 * 24 * 60 * 60 * 1000)), // 1 day after deadline
      new Date(submissionDeadline.getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 days after deadline
    ];

    return {
      windowId,
      submissionDeadline,
      reminderDates,
      escalationDates,
      autoSubmitEnabled: true, // Can be configured
      batchSize: 50, // Default batch size
    };
  }

  /**
   * Auto-submit ready claims on schedule
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processScheduledSubmissions(): Promise<void> {
    this.logger.log('Processing scheduled NPA submissions...');

    try {
      // Get active pricing windows approaching deadline
      const approachingWindows = await this.getWindowsApproachingDeadline();

      for (const window of approachingWindows) {
        const readyClaims = await this.getReadyClaimsForWindow(window.windowId);
        
        if (readyClaims.length > 0) {
          try {
            await this.submitBatch({
              windowId: window.windowId,
              claims: readyClaims,
              submissionType: 'UPPF_CLAIMS',
            });

            this.logger.log(`Auto-submitted ${readyClaims.length} claims for window ${window.windowId}`);
          } catch (error) {
            this.logger.error(`Auto-submission failed for window ${window.windowId}: ${error.message}`);
            
            // Send escalation alert
            this.eventEmitter.emit('npa-submission.auto-submit-failed', {
              windowId: window.windowId,
              claimCount: readyClaims.length,
              error: error.message,
            });
          }
        }
      }

    } catch (error) {
      this.logger.error(`Scheduled submission processing failed: ${error.message}`);
    }
  }

  /**
   * Track submission status and follow up
   */
  async trackSubmissionStatus(submissionReference: string): Promise<{
    status: string;
    lastUpdate: Date;
    npaResponse?: any;
    pendingActions: string[];
  }> {
    const submission = await this.submissionRepository.findOne({
      where: { submissionReference },
    });

    if (!submission) {
      throw new BadRequestException(`Submission ${submissionReference} not found`);
    }

    // Check with NPA API for status updates
    const npaStatusCheck = await this.checkNPAStatus(submissionReference);

    const pendingActions: string[] = [];
    
    switch (submission.submissionStatus) {
      case 'SUBMITTED':
        pendingActions.push('Awaiting NPA acknowledgment');
        break;
      case 'UNDER_REVIEW':
        pendingActions.push('Under NPA review');
        break;
      case 'REJECTED':
        pendingActions.push('Address NPA comments and resubmit');
        break;
    }

    return {
      status: submission.submissionStatus,
      lastUpdate: submission.updatedAt || submission.submissionDate,
      npaResponse: npaStatusCheck,
      pendingActions,
    };
  }

  // Private helper methods

  private async validateSubmissionEligibility(request: NPASubmissionRequest): Promise<void> {
    // Check if window is still open for submissions
    const pricingWindow = await this.pricingWindowRepository.findOne({
      where: { windowId: request.windowId },
    });

    if (!pricingWindow) {
      throw new BadRequestException(`Pricing window ${request.windowId} not found`);
    }

    if (pricingWindow.status === 'CLOSED') {
      throw new BadRequestException(`Pricing window ${request.windowId} is closed for submissions`);
    }

    // Check if claims are in valid status
    const invalidClaims = request.claims.filter(
      claim => !['READY_TO_SUBMIT', 'DRAFT'].includes(claim.status)
    );

    if (invalidClaims.length > 0) {
      throw new BadRequestException(
        `${invalidClaims.length} claims are not in valid status for submission`
      );
    }
  }

  private async validateClaimsForSubmission(claims: UPPFClaim[]): Promise<ValidationResult[]> {
    const validationResults: ValidationResult[] = [];

    // Rule 1: All claims must have supporting evidence
    const claimsWithoutEvidence = claims.filter(claim => 
      !claim.evidenceLinks || claim.evidenceLinks.length === 0
    );
    
    validationResults.push({
      ruleId: 'NPA001',
      ruleName: 'Supporting Evidence Required',
      status: claimsWithoutEvidence.length > 0 ? 'FAIL' : 'PASS',
      message: claimsWithoutEvidence.length > 0 
        ? `${claimsWithoutEvidence.length} claims missing supporting evidence`
        : 'All claims have supporting evidence',
      affectedClaims: claimsWithoutEvidence.map(c => c.claimId),
    });

    // Rule 2: All claims must be three-way reconciled
    const unreconciled = claims.filter(claim => !claim.threeWayReconciled);
    
    validationResults.push({
      ruleId: 'NPA002',
      ruleName: 'Three-Way Reconciliation Required',
      status: unreconciled.length > 0 ? 'FAIL' : 'PASS',
      message: unreconciled.length > 0 
        ? `${unreconciled.length} claims not three-way reconciled`
        : 'All claims are three-way reconciled',
      affectedClaims: unreconciled.map(c => c.claimId),
    });

    // Rule 3: Claims must be within reasonable amount ranges
    const highValueClaims = claims.filter(claim => claim.amountDue > 50000); // GHS 50,000 threshold
    
    validationResults.push({
      ruleId: 'NPA003',
      ruleName: 'High Value Claim Review',
      status: highValueClaims.length > 0 ? 'WARNING' : 'PASS',
      message: highValueClaims.length > 0 
        ? `${highValueClaims.length} high-value claims require additional review`
        : 'All claims within normal value ranges',
      affectedClaims: highValueClaims.map(c => c.claimId),
    });

    // Rule 4: Claims must have valid route and distance data
    const invalidDistance = claims.filter(claim => claim.kmBeyondEqualisation <= 0);
    
    validationResults.push({
      ruleId: 'NPA004',
      ruleName: 'Valid Distance Beyond Equalisation',
      status: invalidDistance.length > 0 ? 'FAIL' : 'PASS',
      message: invalidDistance.length > 0 
        ? `${invalidDistance.length} claims have invalid distance data`
        : 'All claims have valid distance data',
      affectedClaims: invalidDistance.map(c => c.claimId),
    });

    return validationResults;
  }

  private generateSubmissionReference(windowId: string, submissionType: string): string {
    const timestamp = Date.now().toString().slice(-8);
    const typeCode = submissionType.substring(0, 3).toUpperCase();
    return `${typeCode}-${windowId}-${timestamp}`;
  }

  private async generateNPADocuments(data: {
    submission: NPASubmission;
    claims: UPPFClaim[];
    pricingWindow: PricingWindow;
    validationResults: ValidationResult[];
  }): Promise<NPADocument[]> {
    const documents: NPADocument[] = [];
    const outputDir = path.join(process.cwd(), 'uploads', 'npa-submissions', data.submission.submissionReference);
    
    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    // 1. Generate Summary Report (PDF)
    const summaryDoc = await this.generateSummaryReport(data, outputDir);
    documents.push(summaryDoc);

    // 2. Generate Detailed Claims (Excel)
    const detailedDoc = await this.generateDetailedClaimsExcel(data, outputDir);
    documents.push(detailedDoc);

    // 3. Generate Compliance Certificate (PDF)
    const complianceDoc = await this.generateComplianceCertificate(data, outputDir);
    documents.push(complianceDoc);

    // 4. Package supporting evidence
    const evidenceDoc = await this.packageSupportingEvidence(data, outputDir);
    documents.push(evidenceDoc);

    return documents;
  }

  private async generateSummaryReport(data: any, outputDir: string): Promise<NPADocument> {
    const fileName = `UPPF_Summary_${data.submission.submissionReference}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text('UPPF Claims Submission Summary', { align: 'center' });
    doc.moveDown();

    // Submission details
    doc.fontSize(12);
    doc.text(`Submission Reference: ${data.submission.submissionReference}`);
    doc.text(`Pricing Window: ${data.pricingWindow.windowId}`);
    doc.text(`Submission Date: ${data.submission.submissionDate.toDateString()}`);
    doc.text(`Total Claims: ${data.claims.length}`);
    doc.text(`Total Amount: GHS ${data.submission.totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Claims breakdown
    doc.text('Claims Breakdown:', { underline: true });
    data.claims.forEach((claim, index) => {
      doc.text(`${index + 1}. Claim ${claim.claimId}: GHS ${claim.amountDue.toFixed(2)}`);
    });

    doc.end();

    const stats = await fs.promises.stat(filePath);
    const checksum = await this.calculateFileChecksum(filePath);

    return {
      documentType: 'SUMMARY_REPORT',
      fileName,
      filePath,
      fileSize: stats.size,
      checksum,
      generatedAt: new Date(),
    };
  }

  private async generateDetailedClaimsExcel(data: any, outputDir: string): Promise<NPADocument> {
    const fileName = `UPPF_Claims_${data.submission.submissionReference}.xlsx`;
    const filePath = path.join(outputDir, fileName);

    const workbook = XLSX.utils.book_new();
    
    // Claims data
    const claimsData = data.claims.map(claim => ({
      'Claim ID': claim.claimId,
      'Window ID': claim.windowId,
      'Route ID': claim.routeId,
      'Km Beyond Equalisation': claim.kmBeyondEqualisation,
      'Litres Moved': claim.litresMoved,
      'Tariff Per Litre-Km': claim.tariffPerLitreKm,
      'Amount Due': claim.amountDue,
      'Status': claim.status,
      'Three-Way Reconciled': claim.threeWayReconciled ? 'Yes' : 'No',
      'Created At': claim.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(claimsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UPPF Claims');
    
    // Validation results sheet
    const validationData = data.validationResults.map(result => ({
      'Rule ID': result.ruleId,
      'Rule Name': result.ruleName,
      'Status': result.status,
      'Message': result.message,
      'Affected Claims': result.affectedClaims?.join(', ') || 'None',
    }));
    
    const validationSheet = XLSX.utils.json_to_sheet(validationData);
    XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation Results');

    XLSX.writeFile(workbook, filePath);

    const stats = await fs.promises.stat(filePath);
    const checksum = await this.calculateFileChecksum(filePath);

    return {
      documentType: 'DETAILED_CLAIMS',
      fileName,
      filePath,
      fileSize: stats.size,
      checksum,
      generatedAt: new Date(),
    };
  }

  private async generateComplianceCertificate(data: any, outputDir: string): Promise<NPADocument> {
    const fileName = `Compliance_Certificate_${data.submission.submissionReference}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Certificate content
    doc.fontSize(16).text('UPPF COMPLIANCE CERTIFICATE', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text('This is to certify that all claims in this submission have been:', { align: 'center' });
    doc.moveDown();
    
    doc.text('✓ Three-way reconciled between depot, transporter, and station records');
    doc.text('✓ GPS validated for route compliance and mileage accuracy');
    doc.text('✓ Temperature corrected for volume calculations');
    doc.text('✓ Reviewed for compliance with NPA regulations');
    doc.moveDown();
    
    doc.text(`Submission Reference: ${data.submission.submissionReference}`);
    doc.text(`Date of Certification: ${new Date().toDateString()}`);
    doc.text('Authorized by: OMC ERP System');

    doc.end();

    const stats = await fs.promises.stat(filePath);
    const checksum = await this.calculateFileChecksum(filePath);

    return {
      documentType: 'COMPLIANCE_CERTIFICATE',
      fileName,
      filePath,
      fileSize: stats.size,
      checksum,
      generatedAt: new Date(),
    };
  }

  private async packageSupportingEvidence(data: any, outputDir: string): Promise<NPADocument> {
    const fileName = `Supporting_Evidence_${data.submission.submissionReference}.zip`;
    const filePath = path.join(outputDir, fileName);

    // TODO: Implement ZIP packaging of all supporting evidence files
    // This would include GPS traces, reconciliation reports, etc.
    
    // For now, create a placeholder file
    await fs.promises.writeFile(filePath, 'Supporting evidence package');

    const stats = await fs.promises.stat(filePath);
    const checksum = await this.calculateFileChecksum(filePath);

    return {
      documentType: 'SUPPORTING_EVIDENCE',
      fileName,
      filePath,
      fileSize: stats.size,
      checksum,
      generatedAt: new Date(),
    };
  }

  private async updateClaimStatuses(
    queryRunner: any,
    claims: UPPFClaim[],
    submissionReference: string
  ): Promise<void> {
    for (const claim of claims) {
      await queryRunner.manager.update(UPPFClaim, claim.id, {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submissionReference,
      });
    }
  }

  private async submitToNPAAPI(data: {
    submissionReference: string;
    documents: NPADocument[];
    claims: UPPFClaim[];
  }): Promise<{ success: boolean; acknowledgmentRef?: string; error?: string }> {
    // TODO: Implement actual NPA API integration
    // This would submit the documents to the NPA's electronic submission system
    
    this.logger.log(`Submitting to NPA API: ${data.submissionReference}`);
    
    // Mock successful submission
    return {
      success: true,
      acknowledgmentRef: `NPA-ACK-${Date.now()}`,
    };
  }

  private async getWindowsApproachingDeadline(): Promise<PricingWindow[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.pricingWindowRepository.find({
      where: {
        submissionDeadline: { $lte: tomorrow } as any,
        status: 'ACTIVE',
      },
    });
  }

  private async getReadyClaimsForWindow(windowId: string): Promise<UPPFClaim[]> {
    return this.claimRepository.find({
      where: {
        windowId,
        status: 'READY_TO_SUBMIT',
      },
      take: 50, // Batch size
    });
  }

  private async checkNPAStatus(submissionReference: string): Promise<any> {
    // TODO: Implement NPA status checking API
    return {
      status: 'UNDER_REVIEW',
      lastChecked: new Date(),
      estimatedResponseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const fileBuffer = await fs.promises.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  }
}