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
const Modal_1 = require("@/components/ui/Modal");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const ProductCategoriesManagement = () => {
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedType, setSelectedType] = (0, react_1.useState)('all');
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    const [showEditModal, setShowEditModal] = (0, react_1.useState)(false);
    const [editingCategory, setEditingCategory] = (0, react_1.useState)(null);
    const [showDeleteModal, setShowDeleteModal] = (0, react_1.useState)(false);
    const [deletingCategory, setDeletingCategory] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        code: '',
        type: 'fuel',
        description: '',
        specifications: {
            standardTests: [],
            qualityParameters: [],
            safetyRequirements: [],
            regulatoryRequirements: []
        }
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    const categoryTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'fuel', label: 'Fuel Products' },
        { value: 'lubricant', label: 'Lubricants' },
        { value: 'service', label: 'Services' },
        { value: 'accessory', label: 'Accessories' }
    ];
    const standardTests = {
        fuel: [
            'Octane Rating Test',
            'Density Measurement',
            'Flash Point Test',
            'Distillation Test',
            'Sulphur Content Test',
            'Benzene Content Test',
            'Gum Content Test',
            'Lead Content Test'
        ],
        lubricant: [
            'Viscosity Test',
            'Flash Point Test',
            'Pour Point Test',
            'Acid Number Test',
            'Base Number Test',
            'Foam Test',
            'Corrosion Test',
            'Oxidation Stability Test'
        ],
        service: [
            'Service Quality Assessment',
            'Customer Satisfaction Survey',
            'Compliance Check',
            'Safety Protocol Review'
        ],
        accessory: [
            'Durability Test',
            'Performance Test',
            'Safety Test',
            'Compatibility Test'
        ]
    };
    const qualityParameters = {
        fuel: [
            'Appearance (Clear & Bright)',
            'Color (ASTM D1500)',
            'Odor (Characteristic)',
            'Water Content',
            'Sediment & Water',
            'Copper Strip Corrosion',
            'Thermal Stability',
            'Oxidation Stability'
        ],
        lubricant: [
            'Kinematic Viscosity',
            'Viscosity Index',
            'Shear Stability',
            'Thermal Stability',
            'Oxidation Resistance',
            'Wear Protection',
            'Foam Characteristics',
            'Demulsibility'
        ],
        service: [
            'Response Time',
            'Service Quality',
            'Customer Satisfaction',
            'Compliance Rate',
            'Safety Record'
        ],
        accessory: [
            'Build Quality',
            'Performance Rating',
            'Durability Score',
            'Safety Rating',
            'Compatibility Score'
        ]
    };
    const safetyRequirements = {
        fuel: [
            'Flammable Liquid Storage',
            'Fire Prevention Measures',
            'Vapor Control Systems',
            'Emergency Response Plan',
            'Personal Protection Equipment',
            'Static Electricity Control',
            'Temperature Monitoring',
            'Leak Detection System'
        ],
        lubricant: [
            'Skin Contact Prevention',
            'Eye Protection',
            'Ventilation Requirements',
            'Spill Control Measures',
            'Fire Safety Measures',
            'Storage Requirements',
            'Disposal Guidelines',
            'First Aid Procedures'
        ],
        service: [
            'Staff Safety Training',
            'Equipment Safety Checks',
            'Emergency Procedures',
            'Safety Equipment Availability',
            'Risk Assessment',
            'Safety Documentation',
            'Incident Reporting',
            'Regular Safety Audits'
        ],
        accessory: [
            'Product Safety Testing',
            'Installation Safety',
            'Usage Guidelines',
            'Maintenance Safety',
            'Warning Labels',
            'Safety Certification',
            'User Manual Requirements',
            'Warranty Safety Terms'
        ]
    };
    const regulatoryRequirements = {
        fuel: [
            'NPA License & Approval',
            'Ghana Standards Authority (GSA) Certification',
            'EPA Environmental Compliance',
            'Fire Service Approval',
            'GRA Tax Compliance',
            'UPPF Registration',
            'Quality Control Certification',
            'Import/Export Permits'
        ],
        lubricant: [
            'Product Registration',
            'Quality Standards Compliance',
            'Environmental Approval',
            'Import Documentation',
            'Safety Data Sheets',
            'Labeling Requirements',
            'Disposal Regulations',
            'Distribution Permits'
        ],
        service: [
            'Business License',
            'Service Standards Compliance',
            'Staff Certification',
            'Safety Compliance',
            'Tax Registration',
            'Insurance Requirements',
            'Quality Assurance',
            'Customer Protection'
        ],
        accessory: [
            'Product Certification',
            'Safety Standards',
            'Import Documentation',
            'Quality Standards',
            'Labeling Requirements',
            'Warranty Compliance',
            'Distribution License',
            'Environmental Compliance'
        ]
    };
    (0, react_1.useEffect)(() => {
        fetchCategories();
    }, []);
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api_1.productService.getCategories();
            setCategories(response.data || []);
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            react_hot_toast_1.toast.error('Failed to fetch categories');
        }
        finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'fuel',
            description: '',
            specifications: {
                standardTests: [],
                qualityParameters: [],
                safetyRequirements: [],
                regulatoryRequirements: []
            }
        });
        setErrors({});
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name)
            newErrors.name = 'Category name is required';
        if (!formData.code)
            newErrors.code = 'Category code is required';
        if (!formData.type)
            newErrors.type = 'Category type is required';
        if (!formData.description)
            newErrors.description = 'Description is required';
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
            if (editingCategory) {
                await api_1.productService.updateCategory(editingCategory.id, formData);
                react_hot_toast_1.toast.success('Category updated successfully');
                setShowEditModal(false);
                setEditingCategory(null);
            }
            else {
                await api_1.productService.createCategory(formData);
                react_hot_toast_1.toast.success('Category created successfully');
                setShowCreateModal(false);
            }
            resetForm();
            fetchCategories();
        }
        catch (error) {
            console.error('Error saving category:', error);
            react_hot_toast_1.toast.error('Failed to save category');
        }
    };
    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            code: category.code,
            type: category.type,
            description: category.description,
            parent: category.parent,
            specifications: category.specifications
        });
        setShowEditModal(true);
    };
    const handleDelete = async () => {
        if (!deletingCategory)
            return;
        try {
            await api_1.productService.deleteCategory(deletingCategory.id);
            react_hot_toast_1.toast.success('Category deleted successfully');
            setShowDeleteModal(false);
            setDeletingCategory(null);
            fetchCategories();
        }
        catch (error) {
            console.error('Error deleting category:', error);
            react_hot_toast_1.toast.error('Failed to delete category');
        }
    };
    const handleSpecificationChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [type]: value
            }
        }));
    };
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'fuel': return 'primary';
            case 'lubricant': return 'secondary';
            case 'service': return 'success';
            case 'accessory': return 'warning';
            default: return 'default';
        }
    };
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || category.type === selectedType;
        return matchesSearch && matchesType;
    });
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Product Categories" subtitle="Manage product categories and specifications">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input_1.Input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            
            <Select_1.Select value={selectedType} onChange={(value) => setSelectedType(value)} options={categoryTypes} className="w-40"/>
          </div>

          <Button_1.Button onClick={() => setShowCreateModal(true)}>
            Add Category
          </Button_1.Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (Array.from({ length: 6 }).map((_, index) => (<Card_1.Card key={index} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </Card_1.Card>))) : (filteredCategories.map((category, index) => (<framer_motion_1.motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card_1.Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <ui_1.Badge variant={getTypeBadgeColor(category.type)}>
                          {category.type}
                        </ui_1.Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Code: {category.code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.productCount} products
                      </p>
                    </div>
                    <ui_1.Badge variant={category.status === 'active' ? 'success' : 'secondary'}>
                      {category.status}
                    </ui_1.Badge>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Specifications Summary */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Tests:</span>
                      <span className="font-medium">{category.specifications.standardTests?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Parameters:</span>
                      <span className="font-medium">{category.specifications.qualityParameters?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Safety:</span>
                      <span className="font-medium">{category.specifications.safetyRequirements?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Regulatory:</span>
                      <span className="font-medium">{category.specifications.regulatoryRequirements?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button_1.Button size="sm" variant="outline" onClick={() => handleEdit(category)} className="flex-1">
                      Edit
                    </Button_1.Button>
                    <Button_1.Button size="sm" variant="ghost" onClick={() => {
                setDeletingCategory(category);
                setShowDeleteModal(true);
            }} className="text-red-600 hover:text-red-700">
                      Delete
                    </Button_1.Button>
                  </div>
                </Card_1.Card>
              </framer_motion_1.motion.div>)))}
        </div>

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (<div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get started by creating your first product category.
            </p>
            <Button_1.Button onClick={() => setShowCreateModal(true)}>
              Create Category
            </Button_1.Button>
          </div>)}
      </div>

      {/* Create/Edit Modal */}
      <Modal_1.Modal isOpen={showCreateModal || showEditModal} onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingCategory(null);
            resetForm();
        }} title={editingCategory ? 'Edit Category' : 'Create New Category'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name *</label>
              <Input_1.Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Premium Petrol" error={errors.name}/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category Code *</label>
              <Input_1.Input value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} placeholder="e.g., FUEL-PET-PREM" error={errors.code}/>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category Type *</label>
              <Select_1.Select value={formData.type} onChange={(value) => setFormData(prev => ({ ...prev, type: value }))} options={categoryTypes.slice(1)} // Remove 'all' option
     error={errors.type}/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Detailed category description..." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3}/>
            {errors.description && (<p className="text-red-500 text-sm mt-1">{errors.description}</p>)}
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Specifications</h4>
            
            {/* Standard Tests */}
            <div>
              <label className="block text-sm font-medium mb-2">Standard Tests</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {standardTests[formData.type]?.map((test) => (<label key={test} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.specifications.standardTests.includes(test)} onChange={(e) => {
                const tests = e.target.checked
                    ? [...formData.specifications.standardTests, test]
                    : formData.specifications.standardTests.filter(t => t !== test);
                handleSpecificationChange('standardTests', tests);
            }} className="rounded"/>
                    {test}
                  </label>))}
              </div>
            </div>

            {/* Quality Parameters */}
            <div>
              <label className="block text-sm font-medium mb-2">Quality Parameters</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {qualityParameters[formData.type]?.map((param) => (<label key={param} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.specifications.qualityParameters.includes(param)} onChange={(e) => {
                const params = e.target.checked
                    ? [...formData.specifications.qualityParameters, param]
                    : formData.specifications.qualityParameters.filter(p => p !== param);
                handleSpecificationChange('qualityParameters', params);
            }} className="rounded"/>
                    {param}
                  </label>))}
              </div>
            </div>

            {/* Safety Requirements */}
            <div>
              <label className="block text-sm font-medium mb-2">Safety Requirements</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {safetyRequirements[formData.type]?.map((req) => (<label key={req} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.specifications.safetyRequirements.includes(req)} onChange={(e) => {
                const reqs = e.target.checked
                    ? [...formData.specifications.safetyRequirements, req]
                    : formData.specifications.safetyRequirements.filter(r => r !== req);
                handleSpecificationChange('safetyRequirements', reqs);
            }} className="rounded"/>
                    {req}
                  </label>))}
              </div>
            </div>

            {/* Regulatory Requirements */}
            <div>
              <label className="block text-sm font-medium mb-2">Regulatory Requirements</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                {regulatoryRequirements[formData.type]?.map((req) => (<label key={req} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.specifications.regulatoryRequirements.includes(req)} onChange={(e) => {
                const reqs = e.target.checked
                    ? [...formData.specifications.regulatoryRequirements, req]
                    : formData.specifications.regulatoryRequirements.filter(r => r !== req);
                handleSpecificationChange('regulatoryRequirements', reqs);
            }} className="rounded"/>
                    {req}
                  </label>))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button_1.Button type="button" variant="outline" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingCategory(null);
            resetForm();
        }}>
              Cancel
            </Button_1.Button>
            <Button_1.Button type="submit">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>

      {/* Delete Confirmation Modal */}
      <Modal_1.Modal isOpen={showDeleteModal} onClose={() => {
            setShowDeleteModal(false);
            setDeletingCategory(null);
        }} title="Delete Category">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the category "{deletingCategory?.name}"? 
            This action cannot be undone.
          </p>
          {deletingCategory && deletingCategory.productCount > 0 && (<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Warning: This category has {deletingCategory.productCount} products associated with it.
                Deleting this category may affect those products.
              </p>
            </div>)}
          <div className="flex justify-end gap-4">
            <Button_1.Button variant="outline" onClick={() => {
            setShowDeleteModal(false);
            setDeletingCategory(null);
        }}>
              Cancel
            </Button_1.Button>
            <Button_1.Button variant="danger" onClick={handleDelete}>
              Delete Category
            </Button_1.Button>
          </div>
        </div>
      </Modal_1.Modal>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ProductCategoriesManagement;
//# sourceMappingURL=categories.js.map