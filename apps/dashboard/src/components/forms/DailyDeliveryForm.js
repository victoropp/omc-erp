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
exports.DailyDeliveryForm = void 0;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const DailyDeliveryForm = ({ initialData, onSave, onCancel, isEditMode = false }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        date: new Date().toISOString().split('T')[0],
        supplierCode: '',
        depotCode: '',
        customerName: '',
        location: '',
        stationType: 'DODO',
        revenueRecognitionType: 'IMMEDIATE',
        psaNumber: `PSA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        wbillNumber: `WB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        vehicleRegNumber: '',
        transporterCode: '',
        productType: 'petrol',
        productGrade: 'Premium',
        quantity: 0,
        unitPrice: 0,
        currency: 'GHS',
        notes: '',
        npaLicenseNumber: '',
        qualityCertificateNumber: '',
        epaPermitNumber: '',
        localContentPercentage: 0,
        driverName: '',
        driverLicense: '',
        driverPhone: '',
        loadingTime: '',
        expectedDeliveryTime: '',
        specialInstructions: '',
        temperatureRequired: false,
        temperatureRange: '',
        hazardousClassification: 'Non-Hazardous',
        insurancePolicyNumber: '',
        ...initialData
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [suppliers, setSuppliers] = (0, react_1.useState)([]);
    const [depots, setDepots] = (0, react_1.useState)([]);
    const [transporters, setTransporters] = (0, react_1.useState)([]);
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [complianceStatus, setComplianceStatus] = (0, react_1.useState)({
        npa: false,
        gra: false,
        epa: false,
        overall: false
    });
    (0, react_1.useEffect)(() => {
        loadMasterData();
    }, []);
    (0, react_1.useEffect)(() => {
        // Real-time validation as user types
        const validationTimer = setTimeout(() => {
            validateForm();
        }, 500);
        return () => clearTimeout(validationTimer);
    }, [formData]);
    const loadMasterData = async () => {
        try {
            const [suppliersData, depotsData, transportersData] = await Promise.all([
                api_1.dailyDeliveryService.getSuppliers(),
                api_1.dailyDeliveryService.getDepots(),
                api_1.dailyDeliveryService.getTransporters()
            ]);
            setSuppliers(suppliersData || [
                { code: 'SUP001', name: 'Tema Oil Refinery (TOR)' },
                { code: 'SUP002', name: 'Bulk Oil Storage Company' },
                { code: 'SUP003', name: 'Sentuo Oil Refinery' }
            ]);
            setDepots(depotsData || [
                { code: 'DEP001', name: 'Tema Main Depot' },
                { code: 'DEP002', name: 'Kumasi Depot' },
                { code: 'DEP003', name: 'Takoradi Depot' }
            ]);
            setTransporters(transportersData || [
                { code: 'TRA001', name: 'Golden Transport Ltd' },
                { code: 'TRA002', name: 'Ashanti Logistics' },
                { code: 'TRA003', name: 'Western Transport Co.' }
            ]);
        }
        catch (error) {
            console.error('Failed to load master data:', error);
        }
    };
    const validateForm = async () => {
        const newErrors = {};
        // Required field validations
        if (!formData.date)
            newErrors.date = 'Date is required';
        if (!formData.supplierCode)
            newErrors.supplierCode = 'Supplier is required';
        if (!formData.depotCode)
            newErrors.depotCode = 'Depot is required';
        if (!formData.customerName.trim())
            newErrors.customerName = 'Customer name is required';
        if (!formData.location.trim())
            newErrors.location = 'Location is required';
        if (!formData.stationType)
            newErrors.stationType = 'Station type is required';
        if (!formData.psaNumber.trim())
            newErrors.psaNumber = 'PSA number is required';
        if (!formData.wbillNumber.trim())
            newErrors.wbillNumber = 'W/Bill number is required';
        if (!formData.invoiceNumber.trim())
            newErrors.invoiceNumber = 'Invoice number is required';
        if (!formData.vehicleRegNumber.trim())
            newErrors.vehicleRegNumber = 'Vehicle registration is required';
        if (!formData.transporterCode)
            newErrors.transporterCode = 'Transporter is required';
        if (formData.quantity <= 0)
            newErrors.quantity = 'Quantity must be greater than 0';
        if (formData.unitPrice <= 0)
            newErrors.unitPrice = 'Unit price must be greater than 0';
        // Ghana-specific validations
        if (!formData.npaLicenseNumber.trim())
            newErrors.npaLicenseNumber = 'NPA License number is required';
        if (!formData.qualityCertificateNumber.trim())
            newErrors.qualityCertificateNumber = 'Quality certificate is required';
        if (formData.localContentPercentage < 0 || formData.localContentPercentage > 100) {
            newErrors.localContentPercentage = 'Local content percentage must be between 0-100';
        }
        // Vehicle registration format validation (Ghana format: XX-NNNN-YY)
        const vehicleRegex = /^[A-Z]{2}-\d{4}-\d{2}$/;
        if (formData.vehicleRegNumber && !vehicleRegex.test(formData.vehicleRegNumber)) {
            newErrors.vehicleRegNumber = 'Invalid Ghana vehicle registration format (e.g., GH-1234-23)';
        }
        // Phone number validation (Ghana format)
        const phoneRegex = /^\+233-?\d{2}-?\d{3}-?\d{4}$/;
        if (formData.driverPhone && !phoneRegex.test(formData.driverPhone)) {
            newErrors.driverPhone = 'Invalid Ghana phone format (+233-XX-XXX-XXXX)';
        }
        // PSA number format validation
        const psaRegex = /^PSA-\d{4}-\d{3}$/;
        if (formData.psaNumber && !psaRegex.test(formData.psaNumber)) {
            newErrors.psaNumber = 'Invalid PSA format (PSA-YYYY-NNN)';
        }
        // Date validations
        if (formData.date && new Date(formData.date) > new Date()) {
            newErrors.date = 'Date cannot be in the future';
        }
        // Time validations
        if (formData.expectedDeliveryTime && formData.loadingTime) {
            const loading = new Date(`1970-01-01T${formData.loadingTime}`);
            const delivery = new Date(`1970-01-01T${formData.expectedDeliveryTime}`);
            if (delivery <= loading) {
                newErrors.expectedDeliveryTime = 'Expected delivery time must be after loading time';
            }
        }
        setErrors(newErrors);
        // Real-time compliance validation
        if (Object.keys(newErrors).length === 0) {
            try {
                setValidating(true);
                const compliance = await api_1.dailyDeliveryService.validateGhanaCompliance(formData);
                setComplianceStatus(compliance || {
                    npa: false,
                    gra: false,
                    epa: false,
                    overall: false
                });
            }
            catch (error) {
                console.error('Compliance validation failed:', error);
            }
            finally {
                setValidating(false);
            }
        }
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        // Auto-calculate total value
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? value : formData.quantity;
            const unitPrice = field === 'unitPrice' ? value : formData.unitPrice;
            // Total value will be calculated on save
        }
        // Auto-generate numbers based on selections
        if (field === 'supplierCode' || field === 'productType') {
            generateDocumentNumbers();
        }
        // Auto-determine revenue recognition type based on station type
        if (field === 'stationType') {
            const newRevenueRecognitionType = (value === 'COCO' || value === 'DOCO') ? 'DEFERRED' : 'IMMEDIATE';
            setFormData(prev => ({ ...prev, revenueRecognitionType: newRevenueRecognitionType }));
        }
    };
    const generateDocumentNumbers = () => {
        const year = new Date().getFullYear();
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        if (!formData.psaNumber.includes(year.toString())) {
            setFormData(prev => ({
                ...prev,
                psaNumber: `PSA-${year}-${random}`,
                wbillNumber: `WB-${year}-${random}`,
                invoiceNumber: `INV-${year}-${random}`
            }));
        }
    };
    const handleCheckDuplicate = async () => {
        try {
            const result = await api_1.dailyDeliveryService.checkDuplicateDelivery(formData);
            if (result.isDuplicate) {
                react_hot_toast_1.toast.error(`Duplicate found: ${result.message}`);
                setErrors(prev => ({ ...prev, duplicate: result.message }));
            }
            else {
                react_hot_toast_1.toast.success('No duplicates found');
            }
        }
        catch (error) {
            console.error('Duplicate check failed:', error);
            react_hot_toast_1.toast.error('Failed to check duplicates');
        }
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const isValid = await validateForm();
            if (!isValid) {
                react_hot_toast_1.toast.error('Please fix validation errors');
                return;
            }
            // Calculate total value
            const totalValue = formData.quantity * formData.unitPrice;
            const finalData = { ...formData, totalValue };
            await onSave(finalData);
            react_hot_toast_1.toast.success(isEditMode ? 'Delivery updated successfully' : 'Delivery created successfully');
        }
        catch (error) {
            console.error('Failed to save delivery:', error);
            react_hot_toast_1.toast.error('Failed to save delivery');
        }
        finally {
            setLoading(false);
        }
    };
    const productGradeOptions = {
        petrol: [
            { value: 'Premium', label: 'Premium Gasoline' },
            { value: 'Regular', label: 'Regular Gasoline' },
            { value: 'Super', label: 'Super Gasoline' }
        ],
        diesel: [
            { value: 'Automotive Gas Oil', label: 'Automotive Gas Oil (AGO)' },
            { value: 'Marine Gas Oil', label: 'Marine Gas Oil (MGO)' },
            { value: 'Industrial Diesel', label: 'Industrial Diesel' }
        ],
        kerosene: [
            { value: 'Household Kerosene', label: 'Household Kerosene' },
            { value: 'Aviation Kerosene', label: 'Aviation Kerosene (Jet Fuel)' },
            { value: 'Industrial Kerosene', label: 'Industrial Kerosene' }
        ],
        lpg: [
            { value: 'Domestic LPG', label: 'Domestic LPG' },
            { value: 'Commercial LPG', label: 'Commercial LPG' },
            { value: 'Industrial LPG', label: 'Industrial LPG' }
        ]
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Compliance Status Banner */}
      {Object.values(complianceStatus).some(status => status) && (<div className={`p-4 rounded-lg border ${complianceStatus.overall
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs">NPA:</span>
              <span className={complianceStatus.npa ? 'text-green-400' : 'text-red-400'}>
                {complianceStatus.npa ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">GRA:</span>
              <span className={complianceStatus.gra ? 'text-green-400' : 'text-red-400'}>
                {complianceStatus.gra ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">EPA:</span>
              <span className={complianceStatus.epa ? 'text-green-400' : 'text-red-400'}>
                {complianceStatus.epa ? '✓' : '✗'}
              </span>
            </div>
            {validating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>}
          </div>
        </div>)}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ui_1.Input label="Date *" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} error={errors.date} required/>
          
          <ui_1.Select label="Supplier *" value={formData.supplierCode} onChange={(value) => handleInputChange('supplierCode', value)} options={suppliers.map(s => ({ value: s.code, label: s.name }))} error={errors.supplierCode} required/>
          
          <ui_1.Select label="Depot *" value={formData.depotCode} onChange={(value) => handleInputChange('depotCode', value)} options={depots.map(d => ({ value: d.code, label: d.name }))} error={errors.depotCode} required/>
        </div>
      </div>

      {/* Customer Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ui_1.Input label="Customer Name *" type="text" value={formData.customerName} onChange={(e) => handleInputChange('customerName', e.target.value)} error={errors.customerName} placeholder="Enter customer company name" required/>
          
          <ui_1.Input label="Location *" type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} error={errors.location} placeholder="Enter delivery location" required/>

          <ui_1.Select label="Station Type *" value={formData.stationType} onChange={(value) => handleInputChange('stationType', value)} options={[
            { value: 'COCO', label: 'COCO (Company Owned Company Operated)' },
            { value: 'DOCO', label: 'DOCO (Dealer Owned Company Operated)' },
            { value: 'DODO', label: 'DODO (Dealer Owned Dealer Operated)' },
            { value: 'INDUSTRIAL', label: 'Industrial Customer' },
            { value: 'COMMERCIAL', label: 'Commercial Customer' }
        ]} error={errors.stationType} required/>
        </div>

        {/* Revenue Recognition Info */}
        <div className="mt-4 p-3 bg-dark-700 rounded-lg border border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-dark-400">Revenue Recognition:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${formData.revenueRecognitionType === 'IMMEDIATE'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'}`}>
                {formData.revenueRecognitionType}
              </span>
            </div>
            <div className="text-xs text-dark-400">
              {formData.stationType === 'COCO' || formData.stationType === 'DOCO'
            ? 'Inventory movement (deferred revenue)'
            : 'Immediate sale transaction'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Numbers */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Document Numbers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ui_1.Input label="PSA Number *" type="text" value={formData.psaNumber} onChange={(e) => handleInputChange('psaNumber', e.target.value)} error={errors.psaNumber} placeholder="PSA-YYYY-NNN" required/>
          
          <ui_1.Input label="W/Bill Number *" type="text" value={formData.wbillNumber} onChange={(e) => handleInputChange('wbillNumber', e.target.value)} error={errors.wbillNumber} placeholder="WB-YYYY-NNN" required/>
          
          <ui_1.Input label="Invoice Number *" type="text" value={formData.invoiceNumber} onChange={(e) => handleInputChange('invoiceNumber', e.target.value)} error={errors.invoiceNumber} placeholder="INV-YYYY-NNN" required/>
        </div>
      </div>

      {/* Transport Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Transport Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui_1.Input label="Vehicle Registration Number *" type="text" value={formData.vehicleRegNumber} onChange={(e) => handleInputChange('vehicleRegNumber', e.target.value.toUpperCase())} error={errors.vehicleRegNumber} placeholder="GH-1234-23" required/>
          
          <ui_1.Select label="Transporter *" value={formData.transporterCode} onChange={(value) => handleInputChange('transporterCode', value)} options={transporters.map(t => ({ value: t.code, label: t.name }))} error={errors.transporterCode} required/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <ui_1.Input label="Driver Name" type="text" value={formData.driverName} onChange={(e) => handleInputChange('driverName', e.target.value)} placeholder="Enter driver full name"/>
          
          <ui_1.Input label="Driver License" type="text" value={formData.driverLicense} onChange={(e) => handleInputChange('driverLicense', e.target.value)} placeholder="Driver license number"/>
          
          <ui_1.Input label="Driver Phone" type="tel" value={formData.driverPhone} onChange={(e) => handleInputChange('driverPhone', e.target.value)} error={errors.driverPhone} placeholder="+233-XX-XXX-XXXX"/>
        </div>
      </div>

      {/* Product Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Product Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui_1.Select label="Product Type *" value={formData.productType} onChange={(value) => {
            handleInputChange('productType', value);
            handleInputChange('productGrade', productGradeOptions[value][0].value);
        }} options={[
            { value: 'petrol', label: 'Petrol/Gasoline' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'kerosene', label: 'Kerosene' },
            { value: 'lpg', label: 'LPG (Liquefied Petroleum Gas)' }
        ]} required/>
          
          <ui_1.Select label="Product Grade *" value={formData.productGrade} onChange={(value) => handleInputChange('productGrade', value)} options={productGradeOptions[formData.productType]} required/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <ui_1.Input label="Quantity *" type="number" value={formData.quantity} onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)} error={errors.quantity} min="0.01" step="0.01" placeholder="Enter quantity" required/>
          
          <ui_1.Input label="Unit Price *" type="number" value={formData.unitPrice} onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)} error={errors.unitPrice} min="0.01" step="0.01" placeholder="Price per liter" required/>
          
          <ui_1.Select label="Currency *" value={formData.currency} onChange={(value) => handleInputChange('currency', value)} options={[
            { value: 'GHS', label: 'Ghana Cedis (GHS)' },
            { value: 'USD', label: 'US Dollars (USD)' }
        ]} required/>
        </div>

        {/* Total Value Display */}
        <div className="mt-4 p-4 bg-dark-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-dark-400">Total Value:</span>
            <span className="text-xl font-bold text-green-400">
              {formData.currency} {(formData.quantity * formData.unitPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Ghana Compliance Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Ghana Compliance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui_1.Input label="NPA License Number *" type="text" value={formData.npaLicenseNumber} onChange={(e) => handleInputChange('npaLicenseNumber', e.target.value)} error={errors.npaLicenseNumber} placeholder="NPA License Number" required/>
          
          <ui_1.Input label="Quality Certificate Number *" type="text" value={formData.qualityCertificateNumber} onChange={(e) => handleInputChange('qualityCertificateNumber', e.target.value)} error={errors.qualityCertificateNumber} placeholder="Quality Certificate Number" required/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ui_1.Input label="EPA Permit Number" type="text" value={formData.epaPermitNumber} onChange={(e) => handleInputChange('epaPermitNumber', e.target.value)} placeholder="Environmental Protection Agency Permit"/>
          
          <ui_1.Input label="Local Content Percentage (%)" type="number" value={formData.localContentPercentage} onChange={(e) => handleInputChange('localContentPercentage', parseFloat(e.target.value) || 0)} error={errors.localContentPercentage} min="0" max="100" step="0.1" placeholder="0-100"/>
        </div>
      </div>

      {/* Scheduling Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Scheduling Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui_1.Input label="Loading Time" type="time" value={formData.loadingTime} onChange={(e) => handleInputChange('loadingTime', e.target.value)} placeholder="HH:MM"/>
          
          <ui_1.Input label="Expected Delivery Time" type="time" value={formData.expectedDeliveryTime} onChange={(e) => handleInputChange('expectedDeliveryTime', e.target.value)} error={errors.expectedDeliveryTime} placeholder="HH:MM"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-3">
            <input type="checkbox" id="temperatureRequired" checked={formData.temperatureRequired} onChange={(e) => handleInputChange('temperatureRequired', e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
            <label htmlFor="temperatureRequired" className="text-white">
              Temperature Controlled Transport Required
            </label>
          </div>

          {formData.temperatureRequired && (<ui_1.Input label="Temperature Range" type="text" value={formData.temperatureRange} onChange={(e) => handleInputChange('temperatureRange', e.target.value)} placeholder="e.g., -5°C to +5°C"/>)}
        </div>
      </div>

      {/* Safety & Insurance */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Safety & Insurance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui_1.Select label="Hazardous Classification" value={formData.hazardousClassification} onChange={(value) => handleInputChange('hazardousClassification', value)} options={[
            { value: 'Non-Hazardous', label: 'Non-Hazardous' },
            { value: 'Class 3 - Flammable Liquids', label: 'Class 3 - Flammable Liquids' },
            { value: 'Class 2 - Compressed Gases', label: 'Class 2 - Compressed Gases' },
            { value: 'Special Handling Required', label: 'Special Handling Required' }
        ]}/>
          
          <ui_1.Input label="Insurance Policy Number" type="text" value={formData.insurancePolicyNumber} onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)} placeholder="Insurance policy number"/>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Special Instructions
            </label>
            <textarea value={formData.specialInstructions} onChange={(e) => handleInputChange('specialInstructions', e.target.value)} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Any special handling or delivery instructions..."/>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Notes
            </label>
            <textarea value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Additional notes or comments..."/>
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="font-medium text-red-400 mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-red-300 space-y-1">
            {Object.entries(errors).map(([field, error]) => (<li key={field}>• {error}</li>))}
          </ul>
        </div>)}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-dark-600">
        <div className="flex space-x-4">
          <ui_1.Button variant="outline" onClick={handleCheckDuplicate} disabled={!formData.psaNumber || !formData.customerName}>
            Check Duplicates
          </ui_1.Button>
        </div>

        <div className="flex space-x-4">
          <ui_1.Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </ui_1.Button>
          <ui_1.Button variant="primary" onClick={handleSubmit} disabled={loading || Object.keys(errors).length > 0}>
            {loading ? (<div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>) : (isEditMode ? 'Update Delivery' : 'Create Delivery')}
          </ui_1.Button>
        </div>
      </div>
    </framer_motion_1.motion.div>);
};
exports.DailyDeliveryForm = DailyDeliveryForm;
//# sourceMappingURL=DailyDeliveryForm.js.map