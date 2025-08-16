export declare class DealerContactInfoDto {
    primaryPhone: string;
    secondaryPhone?: string;
    email: string;
    whatsappNumber?: string;
}
export declare class DealerAddressDto {
    street: string;
    city: string;
    region: string;
    gpsAddress?: string;
    postalCode?: string;
    landmark?: string;
}
export declare class DealerBankAccountDto {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    branchCode?: string;
    branchName?: string;
}
export declare class DealerBusinessInfoDto {
    registrationNumber: string;
    tinNumber: string;
    vatNumber?: string;
    businessType: string;
    incorporationDate: string;
    employeeCount?: number;
}
export declare class CreateDealerDto {
    stationId: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    dateOfBirth: string;
    contactInfo: DealerContactInfoDto;
    address: DealerAddressDto;
    bankAccount: DealerBankAccountDto;
    businessInfo?: DealerBusinessInfoDto;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    expectedMonthlySales?: number;
    previousExperience?: number;
    requestedCreditLimit?: number;
    notes?: string;
}
export declare class DealerDocumentDto {
    documentType: string;
    documentUrl: string;
    description?: string;
    expiryDate?: string;
}
export declare class UploadDealerDocumentsDto {
    dealerId: string;
    documents: DealerDocumentDto[];
}
export declare class DealerCreditAssessmentDto {
    creditScore: number;
    recommendedCreditLimit: number;
    riskRating: string;
    assessmentNotes: string;
    requiresGuarantor: boolean;
    collateralRequired?: number;
}
export declare class ApproveDealerDto {
    approved: boolean;
    approvedCreditLimit?: number;
    approvalNotes: string;
    conditions?: string[];
}
export declare class DealerResponseDto {
    id: string;
    dealerCode: string;
    fullName: string;
    stationId: string;
    status: string;
    contactInfo: DealerContactInfoDto;
    creditLimit: number;
    outstandingBalance: number;
    lastActivityDate: Date;
    createdAt: Date;
}
//# sourceMappingURL=dealer-onboarding.dto.d.ts.map