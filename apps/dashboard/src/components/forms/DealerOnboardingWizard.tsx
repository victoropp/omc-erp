import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Select, Modal } from '@/components/ui';
import { operationsService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

interface DealerData {
  // Basic Information
  companyName: string;
  businessRegistrationNumber: string;
  taxId: string;
  contactPerson: string;
  email: string;
  phone: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  
  // Business Information
  businessType: string;
  yearEstablished: string;
  numberOfEmployees: string;
  annualRevenue: string;
  
  // Fuel Distribution
  fuelTypes: string[];
  expectedVolume: string;
  distributionChannels: string[];
  targetRegions: string[];
  
  // Financial Information
  bankName: string;
  accountNumber: string;
  accountName: string;
  creditLimit: string;
  
  // Documents
  documents: {
    businessRegistration: File | null;
    taxCertificate: File | null;
    bankStatement: File | null;
    insuranceCertificate: File | null;
    directorIds: File[];
  };
  
  // Terms & Agreements
  termsAccepted: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

interface DealerOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: DealerData) => void;
}

export function DealerOnboardingWizard({
  isOpen,
  onClose,
  onComplete
}: DealerOnboardingWizardProps) {
  const { actualTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dealerData, setDealerData] = useState<DealerData>({
    companyName: '',
    businessRegistrationNumber: '',
    taxId: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Ghana',
    },
    businessType: '',
    yearEstablished: '',
    numberOfEmployees: '',
    annualRevenue: '',
    fuelTypes: [],
    expectedVolume: '',
    distributionChannels: [],
    targetRegions: [],
    bankName: '',
    accountNumber: '',
    accountName: '',
    creditLimit: '',
    documents: {
      businessRegistration: null,
      taxCertificate: null,
      bankStatement: null,
      insuranceCertificate: null,
      directorIds: [],
    },
    termsAccepted: false,
    dataProcessingConsent: false,
    marketingConsent: false,
  });

  const totalSteps = 6;

  const businessTypeOptions = [
    { value: 'retail', label: 'Retail Fuel Station' },
    { value: 'wholesale', label: 'Wholesale Distributor' },
    { value: 'industrial', label: 'Industrial Customer' },
    { value: 'transport', label: 'Transport Company' },
    { value: 'marine', label: 'Marine Bunker Supplier' },
  ];

  const fuelTypeOptions = [
    { value: 'PMS', label: 'Petrol (PMS)' },
    { value: 'AGO', label: 'Diesel (AGO)' },
    { value: 'LPG', label: 'Liquefied Petroleum Gas (LPG)' },
    { value: 'KERO', label: 'Kerosene' },
    { value: 'IFO', label: 'Industrial Fuel Oil (IFO)' },
    { value: 'AVGAS', label: 'Aviation Gasoline' },
    { value: 'JETFUEL', label: 'Jet Fuel' },
  ];

  const regionOptions = [
    { value: 'Greater Accra', label: 'Greater Accra' },
    { value: 'Ashanti', label: 'Ashanti' },
    { value: 'Western', label: 'Western' },
    { value: 'Eastern', label: 'Eastern' },
    { value: 'Central', label: 'Central' },
    { value: 'Northern', label: 'Northern' },
    { value: 'Upper East', label: 'Upper East' },
    { value: 'Upper West', label: 'Upper West' },
    { value: 'Volta', label: 'Volta' },
    { value: 'Brong Ahafo', label: 'Brong Ahafo' },
  ];

  const distributionChannelOptions = [
    { value: 'retail', label: 'Retail Stations' },
    { value: 'commercial', label: 'Commercial Sales' },
    { value: 'industrial', label: 'Industrial Supply' },
    { value: 'marine', label: 'Marine Bunker' },
    { value: 'aviation', label: 'Aviation Fuel' },
  ];

  const updateDealerData = (path: string, value: any) => {
    setDealerData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!dealerData.companyName) newErrors.companyName = 'Company name is required';
        if (!dealerData.businessRegistrationNumber) newErrors.businessRegistrationNumber = 'Business registration number is required';
        if (!dealerData.contactPerson) newErrors.contactPerson = 'Contact person is required';
        if (!dealerData.email) newErrors.email = 'Email is required';
        if (!dealerData.phone) newErrors.phone = 'Phone number is required';
        break;
        
      case 2:
        if (!dealerData.address.street) newErrors['address.street'] = 'Street address is required';
        if (!dealerData.address.city) newErrors['address.city'] = 'City is required';
        if (!dealerData.address.region) newErrors['address.region'] = 'Region is required';
        break;
        
      case 3:
        if (!dealerData.businessType) newErrors.businessType = 'Business type is required';
        if (!dealerData.yearEstablished) newErrors.yearEstablished = 'Year established is required';
        break;
        
      case 4:
        if (dealerData.fuelTypes.length === 0) newErrors.fuelTypes = 'At least one fuel type is required';
        if (!dealerData.expectedVolume) newErrors.expectedVolume = 'Expected volume is required';
        break;
        
      case 5:
        if (!dealerData.bankName) newErrors.bankName = 'Bank name is required';
        if (!dealerData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!dealerData.accountName) newErrors.accountName = 'Account name is required';
        break;
        
      case 6:
        if (!dealerData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!dealerData.dataProcessingConsent) newErrors.dataProcessingConsent = 'Data processing consent is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      // Submit to API
      const response = await operationsService.createStation(dealerData);
      onComplete?.(dealerData);
      onClose();
    } catch (error) {
      console.error('Failed to submit dealer onboarding:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (field: string, file: File) => {
    if (field.includes('directorIds')) {
      updateDealerData('documents.directorIds', [...dealerData.documents.directorIds, file]);
    } else {
      updateDealerData(`documents.${field}`, file);
    }
  };

  const stepTitles = [
    'Basic Information',
    'Address & Contact',
    'Business Details',
    'Fuel Distribution',
    'Financial Information',
    'Documents & Terms'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.companyName}
                  onChange={(e) => updateDealerData('companyName', e.target.value)}
                  placeholder="Enter company name"
                  error={errors.companyName}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Business Registration Number <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.businessRegistrationNumber}
                  onChange={(e) => updateDealerData('businessRegistrationNumber', e.target.value)}
                  placeholder="Enter registration number"
                  error={errors.businessRegistrationNumber}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Tax ID / TIN
                </label>
                <Input
                  value={dealerData.taxId}
                  onChange={(e) => updateDealerData('taxId', e.target.value)}
                  placeholder="Enter tax ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Contact Person <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.contactPerson}
                  onChange={(e) => updateDealerData('contactPerson', e.target.value)}
                  placeholder="Enter contact person name"
                  error={errors.contactPerson}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  value={dealerData.email}
                  onChange={(e) => updateDealerData('email', e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.phone}
                  onChange={(e) => updateDealerData('phone', e.target.value)}
                  placeholder="Enter phone number"
                  error={errors.phone}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Street Address <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.address.street}
                  onChange={(e) => updateDealerData('address.street', e.target.value)}
                  placeholder="Enter street address"
                  error={errors['address.street']}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={dealerData.address.city}
                    onChange={(e) => updateDealerData('address.city', e.target.value)}
                    placeholder="Enter city"
                    error={errors['address.city']}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Region <span className="text-red-400">*</span>
                  </label>
                  <Select
                    options={regionOptions}
                    value={dealerData.address.region}
                    onChange={(value) => updateDealerData('address.region', value)}
                    placeholder="Select region"
                    error={errors['address.region']}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Postal Code
                  </label>
                  <Input
                    value={dealerData.address.postalCode}
                    onChange={(e) => updateDealerData('address.postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    Country
                  </label>
                  <Input
                    value={dealerData.address.country}
                    onChange={(e) => updateDealerData('address.country', e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Business Type <span className="text-red-400">*</span>
                </label>
                <Select
                  options={businessTypeOptions}
                  value={dealerData.businessType}
                  onChange={(value) => updateDealerData('businessType', value)}
                  placeholder="Select business type"
                  error={errors.businessType}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Year Established <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={dealerData.yearEstablished}
                  onChange={(e) => updateDealerData('yearEstablished', e.target.value)}
                  placeholder="Enter year established"
                  error={errors.yearEstablished}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Number of Employees
                </label>
                <Select
                  options={[
                    { value: '1-10', label: '1-10 employees' },
                    { value: '11-50', label: '11-50 employees' },
                    { value: '51-100', label: '51-100 employees' },
                    { value: '100+', label: '100+ employees' },
                  ]}
                  value={dealerData.numberOfEmployees}
                  onChange={(value) => updateDealerData('numberOfEmployees', value)}
                  placeholder="Select employee count"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Annual Revenue (GHS)
                </label>
                <Select
                  options={[
                    { value: '0-1M', label: 'Less than 1M' },
                    { value: '1M-5M', label: '1M - 5M' },
                    { value: '5M-10M', label: '5M - 10M' },
                    { value: '10M+', label: 'More than 10M' },
                  ]}
                  value={dealerData.annualRevenue}
                  onChange={(value) => updateDealerData('annualRevenue', value)}
                  placeholder="Select revenue range"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Fuel Types <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fuelTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dealerData.fuelTypes.includes(option.value)}
                      onChange={(e) => {
                        const newFuelTypes = e.target.checked
                          ? [...dealerData.fuelTypes, option.value]
                          : dealerData.fuelTypes.filter(type => type !== option.value);
                        updateDealerData('fuelTypes', newFuelTypes);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.fuelTypes && (
                <p className="text-red-400 text-sm mt-1">{errors.fuelTypes}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Expected Monthly Volume (Litres) <span className="text-red-400">*</span>
                </label>
                <Select
                  options={[
                    { value: '0-10K', label: 'Less than 10,000L' },
                    { value: '10K-50K', label: '10,000 - 50,000L' },
                    { value: '50K-100K', label: '50,000 - 100,000L' },
                    { value: '100K-500K', label: '100,000 - 500,000L' },
                    { value: '500K+', label: 'More than 500,000L' },
                  ]}
                  value={dealerData.expectedVolume}
                  onChange={(value) => updateDealerData('expectedVolume', value)}
                  placeholder="Select expected volume"
                  error={errors.expectedVolume}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Distribution Channels
                </label>
                <div className="space-y-2">
                  {distributionChannelOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dealerData.distributionChannels.includes(option.value)}
                        onChange={(e) => {
                          const newChannels = e.target.checked
                            ? [...dealerData.distributionChannels, option.value]
                            : dealerData.distributionChannels.filter(channel => channel !== option.value);
                          updateDealerData('distributionChannels', newChannels);
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-white text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Target Regions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {regionOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dealerData.targetRegions.includes(option.value)}
                      onChange={(e) => {
                        const newRegions = e.target.checked
                          ? [...dealerData.targetRegions, option.value]
                          : dealerData.targetRegions.filter(region => region !== option.value);
                        updateDealerData('targetRegions', newRegions);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.bankName}
                  onChange={(e) => updateDealerData('bankName', e.target.value)}
                  placeholder="Enter bank name"
                  error={errors.bankName}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Account Number <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.accountNumber}
                  onChange={(e) => updateDealerData('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  error={errors.accountNumber}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Account Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={dealerData.accountName}
                  onChange={(e) => updateDealerData('accountName', e.target.value)}
                  placeholder="Enter account name"
                  error={errors.accountName}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Requested Credit Limit (GHS)
                </label>
                <Select
                  options={[
                    { value: '0-100K', label: 'Up to 100,000' },
                    { value: '100K-500K', label: '100,000 - 500,000' },
                    { value: '500K-1M', label: '500,000 - 1,000,000' },
                    { value: '1M+', label: 'More than 1,000,000' },
                  ]}
                  value={dealerData.creditLimit}
                  onChange={(value) => updateDealerData('creditLimit', value)}
                  placeholder="Select credit limit"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Required Documents</h4>
              <p className="text-sm text-dark-400">
                Please upload the following documents to complete your application:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'businessRegistration', label: 'Business Registration Certificate' },
                  { key: 'taxCertificate', label: 'Tax Certificate / TIN' },
                  { key: 'bankStatement', label: 'Bank Statement (Last 3 months)' },
                  { key: 'insuranceCertificate', label: 'Insurance Certificate' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-dark-400 mb-2">
                      {label}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(key, file);
                      }}
                      className="block w-full text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Terms & Agreements</h4>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dealerData.termsAccepted}
                    onChange={(e) => updateDealerData('termsAccepted', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <span className="text-white text-sm">
                      I accept the <button className="text-primary-400 hover:text-primary-300">Terms and Conditions</button>
                    </span>
                    {errors.termsAccepted && (
                      <p className="text-red-400 text-xs mt-1">{errors.termsAccepted}</p>
                    )}
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dealerData.dataProcessingConsent}
                    onChange={(e) => updateDealerData('dataProcessingConsent', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div>
                    <span className="text-white text-sm">
                      I consent to the processing of my personal data for the purpose of this application
                    </span>
                    {errors.dataProcessingConsent && (
                      <p className="text-red-400 text-xs mt-1">{errors.dataProcessingConsent}</p>
                    )}
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dealerData.marketingConsent}
                    onChange={(e) => updateDealerData('marketingConsent', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <span className="text-white text-sm">
                    I would like to receive marketing communications and product updates (optional)
                  </span>
                </label>
              </div>
            </div>
            
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dealer Onboarding" size="2xl">
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-full h-0.5 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-dark-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </h3>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-dark-700">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < totalSteps ? (
              <Button variant="primary" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}