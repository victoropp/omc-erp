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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const router_1 = require("next/router");
const CreateProduct = () => {
    const router = (0, router_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [suppliers, setSuppliers] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('basic');
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        code: '',
        category: '',
        type: 'fuel',
        description: '',
        basePrice: 0,
        cost: 0,
        taxRate: 12.5, // Ghana VAT
        currency: 'GHS',
        unit: 'litre',
        reorderLevel: 1000,
        maxStock: 10000,
        minStock: 500,
        leadTime: 7,
        supplier: '',
        specifications: {},
        qualityParameters: {},
        safetyData: {},
        regulatoryInfo: {
            npaApproved: false,
            epaCompliant: false
        }
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    const productTypes = [
        { value: 'fuel', label: 'Fuel' },
        { value: 'lubricant', label: 'Lubricant' },
        { value: 'service', label: 'Service' }
    ];
    const fuelCategories = [
        { value: 'petrol-95', label: 'Petrol (95 Octane)' },
        { value: 'petrol-91', label: 'Petrol (91 Octane)' },
        { value: 'diesel-ago', label: 'Diesel (AGO)' },
        { value: 'kerosene-dpk', label: 'Kerosene (DPK)' },
        { value: 'lpg', label: 'LPG' },
        { value: 'jet-fuel', label: 'Jet Fuel' },
        { value: 'fuel-oil', label: 'Fuel Oil' }
    ];
    const lubricantCategories = [
        { value: 'engine-oil', label: 'Engine Oil' },
        { value: 'gear-oil', label: 'Gear Oil' },
        { value: 'hydraulic-oil', label: 'Hydraulic Oil' },
        { value: 'grease', label: 'Grease' },
        { value: 'brake-fluid', label: 'Brake Fluid' },
        { value: 'coolant', label: 'Coolant' }
    ];
    const serviceCategories = [
        { value: 'car-wash', label: 'Car Wash' },
        { value: 'maintenance', label: 'Vehicle Maintenance' },
        { value: 'tire-service', label: 'Tire Service' },
        { value: 'consultation', label: 'Technical Consultation' }
    ];
    const units = [
        { value: 'litre', label: 'Litre' },
        { value: 'gallon', label: 'Gallon' },
        { value: 'kilogram', label: 'Kilogram' },
        { value: 'piece', label: 'Piece' },
        { value: 'service', label: 'Service Unit' }
    ];
    const currencies = [
        { value: 'GHS', label: 'Ghana Cedi (GHS)' },
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' }
    ];
    (0, react_1.useEffect)(() => {
        fetchCategories();
        fetchSuppliers();
    }, []);
    const fetchCategories = async () => {
        try {
            const response = await api_1.productService.getCategories();
            setCategories(response.data || []);
        }
        catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const fetchSuppliers = async () => {
        try {
            // Mock supplier data for now
            setSuppliers([
                { value: 'tema-oil-refinery', label: 'Tema Oil Refinery (TOR)' },
                { value: 'sentuo-oil-refinery', label: 'Sentuo Oil Refinery' },
                { value: 'shell-ghana', label: 'Shell Ghana' },
                { value: 'total-ghana', label: 'Total Ghana' },
                { value: 'goil', label: 'GOIL' }
            ]);
        }
        catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };
    const getCategoriesByType = () => {
        switch (formData.type) {
            case 'fuel':
                return fuelCategories;
            case 'lubricant':
                return lubricantCategories;
            case 'service':
                return serviceCategories;
            default:
                return [];
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    const handleSpecificationChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [field]: value
            }
        }));
    };
    const handleQualityParameterChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            qualityParameters: {
                ...prev.qualityParameters,
                [field]: value
            }
        }));
    };
    const handleSafetyDataChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            safetyData: {
                ...prev.safetyData,
                [field]: value
            }
        }));
    };
    const handleRegulatoryChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            regulatoryInfo: {
                ...prev.regulatoryInfo,
                [field]: value
            }
        }));
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name)
            newErrors.name = 'Product name is required';
        if (!formData.code)
            newErrors.code = 'Product code is required';
        if (!formData.category)
            newErrors.category = 'Category is required';
        if (!formData.type)
            newErrors.type = 'Product type is required';
        if (!formData.basePrice || formData.basePrice <= 0)
            newErrors.basePrice = 'Valid base price is required';
        if (!formData.cost || formData.cost <= 0)
            newErrors.cost = 'Valid cost is required';
        if (!formData.supplier)
            newErrors.supplier = 'Supplier is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            react_hot_toast_1.toast.error('Please fix the validation errors');
            return;
        }
        try {
            setLoading(true);
            await api_1.productService.createProduct(formData);
            react_hot_toast_1.toast.success('Product created successfully');
            router.push('/products');
        }
        catch (error) {
            console.error('Error creating product:', error);
            react_hot_toast_1.toast.error('Failed to create product');
        }
        finally {
            setLoading(false);
        }
    };
    const tabs = [
        { id: 'basic', label: 'Basic Information' },
        { id: 'pricing', label: 'Pricing & Inventory' },
        { id: 'specifications', label: 'Technical Specifications' },
        { id: 'quality', label: 'Quality Parameters' },
        { id: 'safety', label: 'Safety & Regulatory' }
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Create New Product" subtitle="Add a new product to your inventory">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Navigation */}
          <Card_1.Card>
            <Card_1.CardContent className="p-0">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    {tab.label}
                  </button>))}
              </div>
            </Card_1.CardContent>
          </Card_1.Card>

          {/* Tab Content */}
          <Card_1.Card>
            <Card_1.CardContent className="p-6">
              {activeTab === 'basic' && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Basic Product Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Product Name *</label>
                      <Input_1.Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="e.g., Petrol 95 Octane" error={errors.name}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Product Code *</label>
                      <Input_1.Input value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} placeholder="e.g., FUEL-PET-95" error={errors.code}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Product Type *</label>
                      <Select_1.Select value={formData.type} onChange={(value) => {
                handleInputChange('type', value);
                handleInputChange('category', ''); // Reset category when type changes
            }} options={productTypes} error={errors.type}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <Select_1.Select value={formData.category} onChange={(value) => handleInputChange('category', value)} options={getCategoriesByType()} error={errors.category} disabled={!formData.type} placeholder="Select a category"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Unit of Measure</label>
                      <Select_1.Select value={formData.unit} onChange={(value) => handleInputChange('unit', value)} options={units}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Supplier *</label>
                      <Select_1.Select value={formData.supplier} onChange={(value) => handleInputChange('supplier', value)} options={suppliers} error={errors.supplier} placeholder="Select a supplier"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Detailed product description..." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={4}/>
                  </div>
                </framer_motion_1.motion.div>)}

              {activeTab === 'pricing' && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Pricing & Inventory Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Base Price *</label>
                      <Input_1.Input type="number" step="0.01" value={formData.basePrice} onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)} placeholder="0.00" error={errors.basePrice}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cost Price *</label>
                      <Input_1.Input type="number" step="0.01" value={formData.cost} onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)} placeholder="0.00" error={errors.cost}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                      <Input_1.Input type="number" step="0.1" value={formData.taxRate} onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)} placeholder="12.5"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <Select_1.Select value={formData.currency} onChange={(value) => handleInputChange('currency', value)} options={currencies}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Reorder Level</label>
                      <Input_1.Input type="number" value={formData.reorderLevel} onChange={(e) => handleInputChange('reorderLevel', parseInt(e.target.value) || 0)} placeholder="1000"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Maximum Stock</label>
                      <Input_1.Input type="number" value={formData.maxStock} onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)} placeholder="10000"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Stock</label>
                      <Input_1.Input type="number" value={formData.minStock} onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)} placeholder="500"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
                      <Input_1.Input type="number" value={formData.leadTime} onChange={(e) => handleInputChange('leadTime', parseInt(e.target.value) || 0)} placeholder="7"/>
                    </div>
                  </div>

                  {/* Pricing Calculation */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Pricing Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Cost Price:</span>
                        <div className="font-bold text-lg">₵{formData.cost.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tax ({formData.taxRate}%):</span>
                        <div className="font-bold text-lg">₵{(formData.basePrice * formData.taxRate / 100).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Selling Price:</span>
                        <div className="font-bold text-lg text-green-600">₵{(formData.basePrice + (formData.basePrice * formData.taxRate / 100)).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Gross Margin:</span>
                      <div className="font-bold text-lg text-blue-600">
                        {formData.basePrice > 0 ? (((formData.basePrice - formData.cost) / formData.basePrice) * 100).toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </div>
                </framer_motion_1.motion.div>)}

              {activeTab === 'specifications' && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                  
                  {formData.type === 'fuel' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Octane Rating</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.octaneRating || ''} onChange={(e) => handleSpecificationChange('octaneRating', parseFloat(e.target.value) || undefined)} placeholder="e.g., 95.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Density (kg/m³)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.density || ''} onChange={(e) => handleSpecificationChange('density', parseFloat(e.target.value) || undefined)} placeholder="e.g., 750.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Flash Point (°C)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.flashPoint || ''} onChange={(e) => handleSpecificationChange('flashPoint', parseFloat(e.target.value) || undefined)} placeholder="e.g., -40.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Pour Point (°C)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.pourPoint || ''} onChange={(e) => handleSpecificationChange('pourPoint', parseFloat(e.target.value) || undefined)} placeholder="e.g., -50.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Sulphur Content (ppm)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.sulphurContent || ''} onChange={(e) => handleSpecificationChange('sulphurContent', parseFloat(e.target.value) || undefined)} placeholder="e.g., 10.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">API Gravity</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.apiGravity || ''} onChange={(e) => handleSpecificationChange('apiGravity', parseFloat(e.target.value) || undefined)} placeholder="e.g., 45.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Net Heat (MJ/kg)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.netHeat || ''} onChange={(e) => handleSpecificationChange('netHeat', parseFloat(e.target.value) || undefined)} placeholder="e.g., 42.5"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Benzene Content (%)</label>
                        <Input_1.Input type="number" step="0.01" value={formData.specifications.benzeneContent || ''} onChange={(e) => handleSpecificationChange('benzeneContent', parseFloat(e.target.value) || undefined)} placeholder="e.g., 1.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Aromatics (%)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.aromatics || ''} onChange={(e) => handleSpecificationChange('aromatics', parseFloat(e.target.value) || undefined)} placeholder="e.g., 35.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Olefins (%)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.olefins || ''} onChange={(e) => handleSpecificationChange('olefins', parseFloat(e.target.value) || undefined)} placeholder="e.g., 18.0"/>
                      </div>
                    </div>)}

                  {formData.type === 'lubricant' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Viscosity</label>
                        <Input_1.Input value={formData.specifications.viscosity || ''} onChange={(e) => handleSpecificationChange('viscosity', e.target.value)} placeholder="e.g., SAE 10W-40"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Flash Point (°C)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.flashPoint || ''} onChange={(e) => handleSpecificationChange('flashPoint', parseFloat(e.target.value) || undefined)} placeholder="e.g., 200.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Pour Point (°C)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.pourPoint || ''} onChange={(e) => handleSpecificationChange('pourPoint', parseFloat(e.target.value) || undefined)} placeholder="e.g., -30.0"/>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Density (kg/m³)</label>
                        <Input_1.Input type="number" step="0.1" value={formData.specifications.density || ''} onChange={(e) => handleSpecificationChange('density', parseFloat(e.target.value) || undefined)} placeholder="e.g., 850.0"/>
                      </div>
                    </div>)}
                </framer_motion_1.motion.div>)}

              {activeTab === 'quality' && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Quality Parameters</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Moisture Content (%)</label>
                      <Input_1.Input type="number" step="0.01" value={formData.qualityParameters.moistureContent || ''} onChange={(e) => handleQualityParameterChange('moistureContent', parseFloat(e.target.value) || undefined)} placeholder="e.g., 0.05"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Sediment Content (%)</label>
                      <Input_1.Input type="number" step="0.01" value={formData.qualityParameters.sedimentContent || ''} onChange={(e) => handleQualityParameterChange('sedimentContent', parseFloat(e.target.value) || undefined)} placeholder="e.g., 0.01"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Copper Content (mg/kg)</label>
                      <Input_1.Input type="number" step="0.1" value={formData.qualityParameters.copper || ''} onChange={(e) => handleQualityParameterChange('copper', parseFloat(e.target.value) || undefined)} placeholder="e.g., 0.1"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Corrosion Rating</label>
                      <Input_1.Input value={formData.qualityParameters.corrosion || ''} onChange={(e) => handleQualityParameterChange('corrosion', e.target.value)} placeholder="e.g., 1a"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Oxidation Stability (minutes)</label>
                      <Input_1.Input type="number" value={formData.qualityParameters.oxidationStability || ''} onChange={(e) => handleQualityParameterChange('oxidationStability', parseInt(e.target.value) || undefined)} placeholder="e.g., 480"/>
                    </div>
                  </div>
                </framer_motion_1.motion.div>)}

              {activeTab === 'safety' && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Safety & Regulatory Information</h3>
                  
                  <div className="space-y-6">
                    {/* Safety Data */}
                    <div>
                      <h4 className="font-medium mb-4">Safety Data</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Flash Point Min (°C)</label>
                          <Input_1.Input type="number" step="0.1" value={formData.safetyData.flashPointMin || ''} onChange={(e) => handleSafetyDataChange('flashPointMin', parseFloat(e.target.value) || undefined)} placeholder="e.g., -40.0"/>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Auto Ignition Temp (°C)</label>
                          <Input_1.Input type="number" step="0.1" value={formData.safetyData.autoIgnitionTemp || ''} onChange={(e) => handleSafetyDataChange('autoIgnitionTemp', parseFloat(e.target.value) || undefined)} placeholder="e.g., 280.0"/>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Vapor Pressure (kPa)</label>
                          <Input_1.Input type="number" step="0.1" value={formData.safetyData.vaporPressure || ''} onChange={(e) => handleSafetyDataChange('vaporPressure', parseFloat(e.target.value) || undefined)} placeholder="e.g., 45.0"/>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Toxicity Level</label>
                          <Input_1.Input value={formData.safetyData.toxicity || ''} onChange={(e) => handleSafetyDataChange('toxicity', e.target.value)} placeholder="e.g., Low"/>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Environmental Impact</label>
                        <textarea value={formData.safetyData.environmentalImpact || ''} onChange={(e) => handleSafetyDataChange('environmentalImpact', e.target.value)} placeholder="Describe environmental impact and precautions..." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3}/>
                      </div>
                    </div>

                    {/* Regulatory Information */}
                    <div>
                      <h4 className="font-medium mb-4">Regulatory Compliance</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.regulatoryInfo.npaApproved} onChange={(e) => handleRegulatoryChange('npaApproved', e.target.checked)} className="rounded"/>
                            <span className="text-sm font-medium">NPA Approved</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.regulatoryInfo.epaCompliant} onChange={(e) => handleRegulatoryChange('epaCompliant', e.target.checked)} className="rounded"/>
                            <span className="text-sm font-medium">EPA Compliant</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">GHS Classification</label>
                            <Input_1.Input value={formData.regulatoryInfo.ghsClassification || ''} onChange={(e) => handleRegulatoryChange('ghsClassification', e.target.value)} placeholder="e.g., Flam. Liq. 2"/>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">UN Number</label>
                            <Input_1.Input value={formData.regulatoryInfo.unNumber || ''} onChange={(e) => handleRegulatoryChange('unNumber', e.target.value)} placeholder="e.g., UN1203"/>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Packing Group</label>
                            <Input_1.Input value={formData.regulatoryInfo.packingGroup || ''} onChange={(e) => handleRegulatoryChange('packingGroup', e.target.value)} placeholder="e.g., II"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </framer_motion_1.motion.div>)}
            </Card_1.CardContent>
          </Card_1.Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button_1.Button type="button" variant="outline" onClick={() => router.push('/products')}>
              Cancel
            </Button_1.Button>
            
            <div className="flex gap-4">
              {activeTab !== 'basic' && (<Button_1.Button type="button" variant="outline" onClick={() => {
                const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                }
            }}>
                  Previous
                </Button_1.Button>)}
              
              {activeTab !== 'safety' ? (<Button_1.Button type="button" onClick={() => {
                const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                }
            }}>
                  Next
                </Button_1.Button>) : (<Button_1.Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Product'}
                </Button_1.Button>)}
            </div>
          </div>
        </form>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = CreateProduct;
//# sourceMappingURL=create.js.map