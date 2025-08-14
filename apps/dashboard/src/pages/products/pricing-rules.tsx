import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui';
import { productService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface PricingRule {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'margin' | 'markup' | 'fixed' | 'formula' | 'tier';
  category?: string;
  product?: string;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    customerType?: string;
    location?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    seasonality?: string;
  };
  pricing: {
    method: 'percentage' | 'fixed' | 'formula';
    value?: number;
    formula?: string;
    tiers?: {
      min: number;
      max: number;
      value: number;
    }[];
  };
  status: 'active' | 'inactive' | 'scheduled';
  priority: number;
  validFrom: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
  appliedCount: number;
}

interface PricingRuleFormData {
  name: string;
  code: string;
  description: string;
  type: 'margin' | 'markup' | 'fixed' | 'formula' | 'tier';
  category?: string;
  product?: string;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    customerType?: string;
    location?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    seasonality?: string;
  };
  pricing: {
    method: 'percentage' | 'fixed' | 'formula';
    value?: number;
    formula?: string;
    tiers?: {
      min: number;
      max: number;
      value: number;
    }[];
  };
  priority: number;
  validFrom: string;
  validTo?: string;
}

const ProductPricingRules = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRule, setDeletingRule] = useState<PricingRule | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<PricingRuleFormData>({
    name: '',
    code: '',
    description: '',
    type: 'margin',
    conditions: {},
    pricing: {
      method: 'percentage',
      tiers: []
    },
    priority: 1,
    validFrom: new Date().toISOString().slice(0, 16)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const ruleTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'margin', label: 'Margin-based' },
    { value: 'markup', label: 'Markup-based' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'formula', label: 'Formula-based' },
    { value: 'tier', label: 'Tiered Pricing' }
  ];

  const ruleStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  const pricingMethods = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'formula', label: 'Custom Formula' }
  ];

  const customerTypes = [
    { value: 'retail', label: 'Retail Customer' },
    { value: 'wholesale', label: 'Wholesale Customer' },
    { value: 'corporate', label: 'Corporate Account' },
    { value: 'government', label: 'Government Entity' },
    { value: 'dealer', label: 'Dealer Network' }
  ];

  const locations = [
    { value: 'accra', label: 'Greater Accra Region' },
    { value: 'kumasi', label: 'Ashanti Region' },
    { value: 'tamale', label: 'Northern Region' },
    { value: 'cape-coast', label: 'Central Region' },
    { value: 'takoradi', label: 'Western Region' },
    { value: 'ho', label: 'Volta Region' }
  ];

  const seasonalityOptions = [
    { value: 'peak', label: 'Peak Season' },
    { value: 'off-peak', label: 'Off-Peak Season' },
    { value: 'holiday', label: 'Holiday Season' },
    { value: 'regular', label: 'Regular Season' }
  ];

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      const response = await productService.getPricingRules();
      setRules(response.data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      toast.error('Failed to fetch pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'margin',
      conditions: {},
      pricing: {
        method: 'percentage',
        tiers: []
      },
      priority: 1,
      validFrom: new Date().toISOString().slice(0, 16)
    });
    setErrors({});
    setActiveTab('basic');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Rule name is required';
    if (!formData.code) newErrors.code = 'Rule code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';

    if (formData.pricing.method === 'percentage' && (!formData.pricing.value || formData.pricing.value <= 0)) {
      newErrors.pricingValue = 'Valid percentage value is required';
    }

    if (formData.pricing.method === 'fixed' && (!formData.pricing.value || formData.pricing.value <= 0)) {
      newErrors.pricingValue = 'Valid fixed amount is required';
    }

    if (formData.pricing.method === 'formula' && !formData.pricing.formula) {
      newErrors.formula = 'Formula is required';
    }

    if (formData.type === 'tier' && (!formData.pricing.tiers || formData.pricing.tiers.length === 0)) {
      newErrors.tiers = 'At least one pricing tier is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      if (editingRule) {
        await productService.updatePricingRule(editingRule.id, formData);
        toast.success('Pricing rule updated successfully');
        setShowEditModal(false);
        setEditingRule(null);
      } else {
        await productService.createPricingRule(formData);
        toast.success('Pricing rule created successfully');
        setShowCreateModal(false);
      }
      
      resetForm();
      fetchPricingRules();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast.error('Failed to save pricing rule');
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      code: rule.code,
      description: rule.description,
      type: rule.type,
      category: rule.category,
      product: rule.product,
      conditions: rule.conditions,
      pricing: rule.pricing,
      priority: rule.priority,
      validFrom: rule.validFrom,
      validTo: rule.validTo
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!deletingRule) return;

    try {
      await productService.deletePricingRule(deletingRule.id);
      toast.success('Pricing rule deleted successfully');
      setShowDeleteModal(false);
      setDeletingRule(null);
      fetchPricingRules();
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      toast.error('Failed to delete pricing rule');
    }
  };

  const handleActivateRule = async (ruleId: string) => {
    try {
      await productService.activatePricingRule(ruleId);
      toast.success('Pricing rule activated');
      fetchPricingRules();
    } catch (error) {
      toast.error('Failed to activate pricing rule');
    }
  };

  const handleDeactivateRule = async (ruleId: string) => {
    try {
      await productService.deactivatePricingRule(ruleId);
      toast.success('Pricing rule deactivated');
      fetchPricingRules();
    } catch (error) {
      toast.error('Failed to deactivate pricing rule');
    }
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tiers: [
          ...(prev.pricing.tiers || []),
          { min: 0, max: 0, value: 0 }
        ]
      }
    }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tiers: prev.pricing.tiers?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateTier = (index: number, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        tiers: prev.pricing.tiers?.map((tier, i) => 
          i === index ? { ...tier, [field]: value } : tier
        ) || []
      }
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'margin': return 'primary';
      case 'markup': return 'secondary';
      case 'fixed': return 'success';
      case 'formula': return 'warning';
      case 'tier': return 'purple';
      default: return 'default';
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || rule.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || rule.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'pricing', label: 'Pricing Configuration' }
  ];

  return (
    <FuturisticDashboardLayout 
      title="Product Pricing Rules" 
      subtitle="Manage automated pricing rules and strategies"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search pricing rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                options={ruleTypes}
                className="w-40"
              />
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={ruleStatuses}
                className="w-32"
              />
            </div>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            Create Rule
          </Button>
        </div>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pricing Rules</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredRules.length} of {rules.length} rules
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rule</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Valid Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Applied</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule, index) => (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.code}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getTypeBadgeColor(rule.type)}>
                            {rule.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{rule.priority}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>From: {new Date(rule.validFrom).toLocaleDateString()}</div>
                            {rule.validTo && (
                              <div className="text-gray-500">To: {new Date(rule.validTo).toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium">{rule.appliedCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(rule)}
                            >
                              Edit
                            </Button>
                            {rule.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeactivateRule(rule.id)}
                                className="text-orange-600"
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleActivateRule(rule.id)}
                                className="text-green-600"
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeletingRule(rule);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {!loading && filteredRules.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No pricing rules found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create pricing rules to automate your product pricing strategy.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Rule
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingRule(null);
          resetForm();
        }}
        title={editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rule Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Wholesale Discount Rule"
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rule Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., WS-DISC-001"
                    error={errors.code}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rule Type</label>
                  <Select
                    value={formData.type}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                    options={ruleTypes.slice(1)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valid From *</label>
                  <Input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    error={errors.validFrom}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valid To (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.validTo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value || undefined }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed rule description..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.conditions.minQuantity || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        minQuantity: parseFloat(e.target.value) || undefined
                      }
                    }))}
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.conditions.maxQuantity || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        maxQuantity: parseFloat(e.target.value) || undefined
                      }
                    }))}
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Customer Type</label>
                  <Select
                    value={formData.conditions.customerType || ''}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        customerType: value || undefined
                      }
                    }))}
                    options={[{ value: '', label: 'All Customers' }, ...customerTypes]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Select
                    value={formData.conditions.location || ''}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        location: value || undefined
                      }
                    }))}
                    options={[{ value: '', label: 'All Locations' }, ...locations]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Seasonality</label>
                  <Select
                    value={formData.conditions.seasonality || ''}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      conditions: {
                        ...prev.conditions,
                        seasonality: value || undefined
                      }
                    }))}
                    options={[{ value: '', label: 'All Seasons' }, ...seasonalityOptions]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Range (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={formData.conditions.timeRange?.start || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          timeRange: {
                            start: e.target.value,
                            end: prev.conditions.timeRange?.end || ''
                          }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <Input
                      type="time"
                      value={formData.conditions.timeRange?.end || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: {
                          ...prev.conditions,
                          timeRange: {
                            start: prev.conditions.timeRange?.start || '',
                            end: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pricing Method</label>
                <Select
                  value={formData.pricing.method}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      method: value as any
                    }
                  }))}
                  options={pricingMethods}
                />
              </div>

              {formData.pricing.method === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Percentage Value *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.pricing.value || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        value: parseFloat(e.target.value) || undefined
                      }
                    }))}
                    placeholder="e.g., 15.5"
                    error={errors.pricingValue}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'margin' ? 'Margin percentage' : 'Markup percentage'}
                  </p>
                </div>
              )}

              {formData.pricing.method === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Fixed Amount *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricing.value || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        value: parseFloat(e.target.value) || undefined
                      }
                    }))}
                    placeholder="e.g., 2.50"
                    error={errors.pricingValue}
                  />
                  <p className="text-xs text-gray-500 mt-1">Fixed amount in Ghana Cedis</p>
                </div>
              )}

              {formData.pricing.method === 'formula' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Formula *</label>
                  <Input
                    value={formData.pricing.formula || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        formula: e.target.value
                      }
                    }))}
                    placeholder="e.g., (cost * 1.15) + 0.5"
                    error={errors.formula}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use variables: cost, quantity, customer_type, location
                  </p>
                </div>
              )}

              {formData.type === 'tier' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Pricing Tiers *</label>
                    <Button type="button" size="sm" onClick={addTier}>
                      Add Tier
                    </Button>
                  </div>
                  
                  {errors.tiers && (
                    <p className="text-red-500 text-sm mb-2">{errors.tiers}</p>
                  )}

                  <div className="space-y-2">
                    {formData.pricing.tiers?.map((tier, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Min Qty</label>
                          <Input
                            type="number"
                            min="0"
                            value={tier.min}
                            onChange={(e) => updateTier(index, 'min', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Qty</label>
                          <Input
                            type="number"
                            min="0"
                            value={tier.max}
                            onChange={(e) => updateTier(index, 'max', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Value</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tier.value}
                            onChange={(e) => updateTier(index, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTier(index)}
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingRule(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            
            <div className="flex gap-4">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                >
                  Previous
                </Button>
              )}
              
              {activeTab !== 'pricing' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingRule(null);
        }}
        title="Delete Pricing Rule"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the pricing rule "{deletingRule?.name}"? 
            This action cannot be undone.
          </p>
          {deletingRule && deletingRule.appliedCount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Warning: This rule has been applied {deletingRule.appliedCount} times.
                Deleting it may affect pricing calculations.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingRule(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Rule
            </Button>
          </div>
        </div>
      </Modal>
    </FuturisticDashboardLayout>
  );
};

export default ProductPricingRules;