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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const CreateUPPFClaim = () => {
    const [currentStep, setCurrentStep] = (0, react_1.useState)(1);
    const [formData, setFormData] = (0, react_1.useState)({
        route: '',
        dealer: '',
        station: '',
        fuelType: '',
        quantity: 0,
        unitPrice: 0,
        region: '',
        vehicleNumber: '',
        driverName: '',
        driverLicense: '',
        loadingDate: '',
        deliveryDate: '',
        documents: [],
        notes: ''
    });
    const totalSteps = 4;
    const dealerOptions = [
        { value: 'golden-star', label: 'Golden Star Petroleum' },
        { value: 'allied-oil', label: 'Allied Oil Company' },
        { value: 'star-oil', label: 'Star Oil Ltd' },
        { value: 'total-ghana', label: 'Total Ghana' },
        { value: 'shell-ghana', label: 'Shell Ghana' },
        { value: 'goil', label: 'Ghana Oil Company (GOIL)' }
    ];
    const stationOptions = [
        { value: 'achimota-shell', label: 'Achimota Shell' },
        { value: 'tema-oil-refinery', label: 'Tema Oil Refinery' },
        { value: 'takoradi-main', label: 'Takoradi Main Depot' },
        { value: 'achimota-total', label: 'Achimota Total' },
        { value: 'tema-bulk-oil', label: 'Tema Bulk Oil Storage' }
    ];
    const fuelTypeOptions = [
        { value: 'PMS', label: 'Petrol (PMS)' },
        { value: 'AGO', label: 'Diesel (AGO)' },
        { value: 'LPG', label: 'Gas (LPG)' },
        { value: 'KERO', label: 'Kerosene' }
    ];
    const regionOptions = [
        { value: 'Greater Accra', label: 'Greater Accra' },
        { value: 'Ashanti Region', label: 'Ashanti' },
        { value: 'Northern Region', label: 'Northern' },
        { value: 'Western Region', label: 'Western' },
        { value: 'Eastern Region', label: 'Eastern' },
        { value: 'Central Region', label: 'Central' },
        { value: 'Volta Region', label: 'Volta' },
        { value: 'Upper East', label: 'Upper East' },
        { value: 'Upper West', label: 'Upper West' },
        { value: 'Brong Ahafo', label: 'Brong Ahafo' }
    ];
    const routeOptions = [
        { value: 'TEMA-KUMASI-001', label: 'TEMA-KUMASI-001' },
        { value: 'ACCRA-TAMALE-002', label: 'ACCRA-TAMALE-002' },
        { value: 'TAKORADI-WA-001', label: 'TAKORADI-WA-001' },
        { value: 'ACCRA-BOLGA-003', label: 'ACCRA-BOLGA-003' },
        { value: 'TEMA-SUNYANI-002', label: 'TEMA-SUNYANI-002' },
        { value: 'TAKORADI-TAMALE-001', label: 'TAKORADI-TAMALE-001' }
    ];
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleFileUpload = (files) => {
        if (files) {
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, ...Array.from(files)]
            }));
        }
    };
    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };
    const calculateUPPFRate = () => {
        // Mock UPPF rate calculation based on fuel type and region
        const baseRates = {
            'PMS': 8.333,
            'AGO': 5.208,
            'LPG': 3.125,
            'KERO': 4.167
        };
        const regionalMultipliers = {
            'Greater Accra': 1.0,
            'Ashanti Region': 1.1,
            'Northern Region': 1.3,
            'Upper East': 1.4,
            'Upper West': 1.4,
            'Western Region': 1.2,
            'Eastern Region': 1.1,
            'Central Region': 1.1,
            'Volta Region': 1.2,
            'Brong Ahafo': 1.2
        };
        const baseRate = baseRates[formData.fuelType] || 0;
        const multiplier = regionalMultipliers[formData.region] || 1;
        return baseRate * multiplier;
    };
    const calculateTotalAmount = () => {
        return formData.quantity * formData.unitPrice;
    };
    const calculateUPPFAmount = () => {
        return formData.quantity * calculateUPPFRate();
    };
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };
    const handleSubmit = () => {
        // Handle form submission
        console.log('Submitting claim:', formData);
        // Redirect to claims list or show success message
    };
    const stepTitles = [
        'Route & Dealer Information',
        'Fuel & Quantity Details',
        'Transport Information',
        'Documents & Review'
    ];
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Route <span className="text-red-400">*</span>
                </label>
                <Select_1.Select options={routeOptions} value={formData.route} onChange={(value) => handleInputChange('route', value)} placeholder="Select route"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Dealer <span className="text-red-400">*</span>
                </label>
                <Select_1.Select options={dealerOptions} value={formData.dealer} onChange={(value) => handleInputChange('dealer', value)} placeholder="Select dealer"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Loading Station <span className="text-red-400">*</span>
                </label>
                <Select_1.Select options={stationOptions} value={formData.station} onChange={(value) => handleInputChange('station', value)} placeholder="Select loading station"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Destination Region <span className="text-red-400">*</span>
                </label>
                <Select_1.Select options={regionOptions} value={formData.region} onChange={(value) => handleInputChange('region', value)} placeholder="Select destination region"/>
              </div>
            </div>
          </div>);
            case 2:
                return (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Fuel Type <span className="text-red-400">*</span>
                </label>
                <Select_1.Select options={fuelTypeOptions} value={formData.fuelType} onChange={(value) => handleInputChange('fuelType', value)} placeholder="Select fuel type"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Quantity (Litres) <span className="text-red-400">*</span>
                </label>
                <Input_1.Input type="number" value={formData.quantity || ''} onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)} placeholder="Enter quantity in litres"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Unit Price (₵) <span className="text-red-400">*</span>
                </label>
                <Input_1.Input type="number" step="0.01" value={formData.unitPrice || ''} onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)} placeholder="Enter unit price"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  UPPF Rate (₵/L)
                </label>
                <div className="p-3 bg-dark-900/50 rounded-lg border border-white/10">
                  <span className="text-white font-medium">
                    ₵{calculateUPPFRate().toFixed(3)}
                  </span>
                  <p className="text-xs text-dark-400 mt-1">Auto-calculated based on fuel type and region</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            {formData.quantity > 0 && formData.unitPrice > 0 && (<Card_1.Card className="p-6 bg-primary-900/20 border-primary-500/30">
                <h4 className="text-lg font-semibold text-white mb-4">Calculation Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-dark-400">Total Fuel Value</p>
                    <p className="text-xl font-bold text-white">₵{calculateTotalAmount().toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">UPPF Rate per Litre</p>
                    <p className="text-xl font-bold text-white">₵{calculateUPPFRate().toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total UPPF Claim</p>
                    <p className="text-xl font-bold text-green-400">₵{calculateUPPFAmount().toLocaleString()}</p>
                  </div>
                </div>
              </Card_1.Card>)}
          </div>);
            case 3:
                return (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Vehicle Number <span className="text-red-400">*</span>
                </label>
                <Input_1.Input value={formData.vehicleNumber} onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} placeholder="e.g., GE-4578-22"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Driver Name <span className="text-red-400">*</span>
                </label>
                <Input_1.Input value={formData.driverName} onChange={(e) => handleInputChange('driverName', e.target.value)} placeholder="Enter driver's full name"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Driver License Number <span className="text-red-400">*</span>
                </label>
                <Input_1.Input value={formData.driverLicense} onChange={(e) => handleInputChange('driverLicense', e.target.value)} placeholder="Enter driver's license number"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Loading Date <span className="text-red-400">*</span>
                </label>
                <Input_1.Input type="date" value={formData.loadingDate} onChange={(e) => handleInputChange('loadingDate', e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Delivery Date <span className="text-red-400">*</span>
                </label>
                <Input_1.Input type="date" value={formData.deliveryDate} onChange={(e) => handleInputChange('deliveryDate', e.target.value)}/>
              </div>
            </div>
          </div>);
            case 4:
                return (<div className="space-y-6">
            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Required Documents <span className="text-red-400">*</span>
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" id="file-upload"/>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-dark-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p className="text-white mb-2">Click to upload documents</p>
                  <p className="text-sm text-dark-400">PDF, JPG, PNG files up to 10MB each</p>
                </label>
              </div>
              
              <div className="text-sm text-dark-400 mt-2">
                <p className="font-medium mb-1">Required documents:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Delivery Note</li>
                  <li>Waybill</li>
                  <li>GPS Tracking Log</li>
                  <li>Driver's License (copy)</li>
                  <li>Vehicle Registration (copy)</li>
                </ul>
              </div>

              {/* Uploaded Files */}
              {formData.documents.length > 0 && (<div className="mt-4">
                  <p className="text-sm font-medium text-dark-400 mb-2">Uploaded Files:</p>
                  <div className="space-y-2">
                    {formData.documents.map((file, index) => (<div key={index} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span className="text-white text-sm">{file.name}</span>
                          <span className="text-xs text-dark-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button onClick={() => removeDocument(index)} className="text-red-400 hover:text-red-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>))}
                  </div>
                </div>)}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Additional Notes
              </label>
              <textarea value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Enter any additional notes or comments..." rows={4} className="w-full p-3 bg-dark-900/50 border border-white/20 rounded-lg text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"/>
            </div>

            {/* Final Review */}
            <Card_1.Card className="p-6 bg-gradient-primary/10 border-primary-500/30">
              <h4 className="text-lg font-semibold text-white mb-4">Claim Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Route:</span>
                    <span className="text-white">{formData.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Dealer:</span>
                    <span className="text-white">{formData.dealer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Fuel Type:</span>
                    <span className="text-white">{formData.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Quantity:</span>
                    <span className="text-white">{formData.quantity.toLocaleString()} L</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Unit Price:</span>
                    <span className="text-white">₵{formData.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">UPPF Rate:</span>
                    <span className="text-white">₵{calculateUPPFRate().toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-white/20 pt-2">
                    <span className="text-white">Total UPPF Claim:</span>
                    <span className="text-green-400">₵{calculateUPPFAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card_1.Card>
          </div>);
            default:
                return null;
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            Create New UPPF Claim
          </h1>
          <p className="text-dark-400">
            Submit a new Under-Recovery of Petroleum Pricing Fund claim
          </p>
        </framer_motion_1.motion.div>

        {/* Progress Indicator */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            return (<div key={stepNumber} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-medium transition-colors ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                        ? 'border-primary-500 text-primary-400 bg-primary-500/20'
                        : 'border-white/20 text-dark-400'}`}>
                      {isCompleted ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>) : (stepNumber)}
                    </div>
                    {index < totalSteps - 1 && (<div className={`w-full h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-white/20'}`}/>)}
                  </div>);
        })}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                Step {currentStep}: {stepTitles[currentStep - 1]}
              </h3>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Form Content */}
        <framer_motion_1.motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <Card_1.Card className="p-8">
            {renderStep()}
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Navigation Buttons */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-between">
          <Button_1.Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button_1.Button>
          
          <div className="flex space-x-4">
            <Button_1.Button variant="outline">
              Save as Draft
            </Button_1.Button>
            {currentStep < totalSteps ? (<Button_1.Button variant="primary" onClick={nextStep}>
                Next Step
              </Button_1.Button>) : (<Button_1.Button variant="primary" onClick={handleSubmit}>
                Submit Claim
              </Button_1.Button>)}
          </div>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = CreateUPPFClaim;
//# sourceMappingURL=create.js.map