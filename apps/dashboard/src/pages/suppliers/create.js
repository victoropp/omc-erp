"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const link_1 = __importDefault(require("next/link"));
const router_1 = require("next/router");
const CreateSupplier = () => {
    const router = (0, router_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [currentStep, setCurrentStep] = (0, react_1.useState)(1);
    const [formData, setFormData] = (0, react_1.useState)({
        // Basic Information
        name: '',
        type: 'fuel',
        category: 'primary',
        registrationNumber: '',
        taxId: '',
        establishmentDate: '',
        // Contact Information
        primaryContactName: '',
        primaryContactTitle: '',
        phone: '',
        alternativePhone: '',
        email: '',
        alternativeEmail: '',
        website: '',
        // Address Information
        streetAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Ghana',
        // Business Information
        businessDescription: '',
        industryExperience: '',
        employeeCount: '',
        annualRevenue: '',
        // Financial Information
        bankName: '',
        accountNumber: '',
        accountName: '',
        swiftCode: '',
        paymentTerms: 'NET 30',
        creditLimit: '',
        // Certifications and Compliance
        certifications: [],
        licenses: [],
        insuranceDetails: '',
        complianceNotes: '',
        // Supply Capabilities
        products: [],
        services: [],
        capacity: '',
        deliveryRadius: '',
        minimumOrderQuantity: '',
        leadTime: '',
        // References
        reference1Name: '',
        reference1Company: '',
        reference1Phone: '',
        reference1Email: '',
        reference2Name: '',
        reference2Company: '',
        reference2Phone: '',
        reference2Email: '',
        // Additional Information
        notes: '',
        attachments: []
    });
    const supplierTypes = [
        { value: 'fuel', label: 'Fuel Supplier' },
        { value: 'equipment', label: 'Equipment Supplier' },
        { value: 'service', label: 'Service Provider' },
        { value: 'logistics', label: 'Logistics Provider' },
        { value: 'maintenance', label: 'Maintenance Services' },
        { value: 'construction', label: 'Construction Services' },
        { value: 'consulting', label: 'Consulting Services' },
        { value: 'other', label: 'Other' }
    ];
    const supplierCategories = [
        { value: 'primary', label: 'Primary Supplier' },
        { value: 'secondary', label: 'Secondary Supplier' },
        { value: 'backup', label: 'Backup Supplier' },
        { value: 'strategic', label: 'Strategic Partner' },
        { value: 'preferred', label: 'Preferred Supplier' }
    ];
    const paymentTermsOptions = [
        { value: 'COD', label: 'Cash on Delivery' },
        { value: 'NET 15', label: 'Net 15 Days' },
        { value: 'NET 30', label: 'Net 30 Days' },
        { value: 'NET 45', label: 'Net 45 Days' },
        { value: 'NET 60', label: 'Net 60 Days' },
        { value: 'NET 90', label: 'Net 90 Days' }
    ];
    const ghanaRegions = [
        'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
        'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo',
        'Western North', 'Ahafo', 'Bono', 'Bono East', 'Oti', 'Savannah', 'North East'
    ];
    const steps = [
        { number: 1, title: 'Basic Information', description: 'Company details and classification' },
        { number: 2, title: 'Contact & Address', description: 'Contact information and location' },
        { number: 3, title: 'Business Details', description: 'Business profile and capabilities' },
        { number: 4, title: 'Financial Information', description: 'Banking and payment details' },
        { number: 5, title: 'Certifications', description: 'Licenses and compliance information' },
        { number: 6, title: 'Review & Submit', description: 'Review all information before submission' }
    ];
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleArrayInput = (field, value) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        }
    };
    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };
    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Success simulation
            router.push('/suppliers');
        }
        catch (error) {
            console.error('Error creating supplier:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier Type *
                </label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required>
                  {supplierTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier Category *
                </label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required>
                  {supplierCategories.map(category => (<option key={category.value} value={category.value}>{category.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration Number
                </label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Identification Number
                </label>
                <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Establishment Date
                </label>
                <input type="date" name="establishmentDate" value={formData.establishmentDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>
            </div>
          </div>);
            case 2:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact & Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Contact Name *
                </label>
                <input type="text" name="primaryContactName" value={formData.primaryContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Title
                </label>
                <input type="text" name="primaryContactTitle" value={formData.primaryContactTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Phone *
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alternative Phone
                </label>
                <input type="tel" name="alternativePhone" value={formData.alternativePhone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Email *
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address *
                </label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region *
                </label>
                <select name="region" value={formData.region} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required>
                  <option value="">Select Region</option>
                  {ghanaRegions.map(region => (<option key={region} value={region}>{region}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postal Code
                </label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>
            </div>
          </div>);
            case 3:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Description
                </label>
                <textarea name="businessDescription" value={formData.businessDescription} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry Experience (Years)
                </label>
                <input type="number" name="industryExperience" value={formData.industryExperience} onChange={handleInputChange} min="0" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee Count
                </label>
                <select name="employeeCount" value={formData.employeeCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300">
                  <option value="">Select Range</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-100">51-100 employees</option>
                  <option value="101-500">101-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Revenue (₵)
                </label>
                <input type="number" name="annualRevenue" value={formData.annualRevenue} onChange={handleInputChange} min="0" step="1000" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supply Capacity
                </label>
                <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="e.g., 1000 barrels/day" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Radius (km)
                </label>
                <input type="number" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleInputChange} min="0" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Order Quantity
                </label>
                <input type="text" name="minimumOrderQuantity" value={formData.minimumOrderQuantity} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lead Time (Days)
                </label>
                <input type="number" name="leadTime" value={formData.leadTime} onChange={handleInputChange} min="0" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>
            </div>
          </div>);
            case 4:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number *
                </label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Name *
                </label>
                <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SWIFT Code
                </label>
                <input type="text" name="swiftCode" value={formData.swiftCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Payment Terms *
                </label>
                <select name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required>
                  {paymentTermsOptions.map(term => (<option key={term.value} value={term.value}>{term.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credit Limit (₵)
                </label>
                <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleInputChange} min="0" step="1000" className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>
            </div>
          </div>);
            case 5:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications & Compliance</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certifications
                </label>
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex-1">{cert}</span>
                      <button type="button" onClick={() => removeArrayItem('certifications', index)} className="text-red-500 hover:text-red-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>))}
                  <div className="flex space-x-3">
                    <input type="text" placeholder="Add certification" onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInput('certifications', e.target.value);
                            e.target.value = '';
                        }
                    }} className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                    <button type="button" onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleArrayInput('certifications', input.value);
                        input.value = '';
                    }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Licenses
                </label>
                <div className="space-y-3">
                  {formData.licenses.map((license, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex-1">{license}</span>
                      <button type="button" onClick={() => removeArrayItem('licenses', index)} className="text-red-500 hover:text-red-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>))}
                  <div className="flex space-x-3">
                    <input type="text" placeholder="Add license" onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInput('licenses', e.target.value);
                            e.target.value = '';
                        }
                    }} className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                    <button type="button" onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleArrayInput('licenses', input.value);
                        input.value = '';
                    }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Details
                </label>
                <textarea name="insuranceDetails" value={formData.insuranceDetails} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compliance Notes
                </label>
                <textarea name="complianceNotes" value={formData.complianceNotes} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"/>
              </div>
            </div>
          </div>);
            case 6:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review & Submit</h3>
            
            <div className="space-y-6">
              <Card_1.Card className="p-6">
                <h4 className="font-semibold text-lg mb-4">Supplier Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Company Name</p>
                    <p className="font-medium">{formData.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="font-medium capitalize">{formData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="font-medium capitalize">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium">{formData.email || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{formData.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-medium">{formData.city}, {formData.region}</p>
                  </div>
                </div>
              </Card_1.Card>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Review Information</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Please review all information carefully before submitting. Once submitted, the supplier will be added to the system and can be assigned to contracts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>);
            default:
                return null;
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Add New Supplier
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Register a new supplier with comprehensive information
            </p>
          </div>
          <link_1.default href="/suppliers">
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
              ← Back to Suppliers
            </framer_motion_1.motion.button>
          </link_1.default>
        </framer_motion_1.motion.div>

        {/* Progress Steps */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (<div key={step.number} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentStep >= step.number
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {currentStep > step.number ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>) : (step.number)}
                  </div>
                  {index < steps.length - 1 && (<div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}/>)}
                </div>))}
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">{steps[currentStep - 1]?.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{steps[currentStep - 1]?.description}</p>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Form Content */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card_1.Card className="p-8">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {currentStep > 1 && (<framer_motion_1.motion.button type="button" onClick={handlePrevious} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
                      ← Previous
                    </framer_motion_1.motion.button>)}
                </div>

                <div>
                  {currentStep < steps.length ? (<framer_motion_1.motion.button type="button" onClick={handleNext} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
                      Next →
                    </framer_motion_1.motion.button>) : (<framer_motion_1.motion.button type="submit" disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                      {loading ? (<div className="flex items-center space-x-2">
                          <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          <span>Creating Supplier...</span>
                        </div>) : ('Create Supplier')}
                    </framer_motion_1.motion.button>)}
                </div>
              </div>
            </form>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = CreateSupplier;
//# sourceMappingURL=create.js.map