import React from 'react';
interface DealerData {
    companyName: string;
    businessRegistrationNumber: string;
    taxId: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        region: string;
        postalCode: string;
        country: string;
    };
    businessType: string;
    yearEstablished: string;
    numberOfEmployees: string;
    annualRevenue: string;
    fuelTypes: string[];
    expectedVolume: string;
    distributionChannels: string[];
    targetRegions: string[];
    bankName: string;
    accountNumber: string;
    accountName: string;
    creditLimit: string;
    documents: {
        businessRegistration: File | null;
        taxCertificate: File | null;
        bankStatement: File | null;
        insuranceCertificate: File | null;
        directorIds: File[];
    };
    termsAccepted: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
}
interface DealerOnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (data: DealerData) => void;
}
export declare function DealerOnboardingWizard({ isOpen, onClose, onComplete }: DealerOnboardingWizardProps): React.JSX.Element;
export {};
//# sourceMappingURL=DealerOnboardingWizard.d.ts.map