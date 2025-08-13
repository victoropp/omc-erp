import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';

interface ConfigurationModule {
  name: string;
  icon: React.ReactNode;
  description: string;
  configs: ConfigItem[];
}

interface ConfigItem {
  key: string;
  label: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  options?: { value: string; label: string }[];
  description?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export default function SystemConfigurationPage() {
  const { actualTheme } = useTheme();
  const [selectedModule, setSelectedModule] = useState<string>('GENERAL');
  const [configurations, setConfigurations] = useState<ConfigurationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, any>>({});

  // Configuration modules
  const modules: ConfigurationModule[] = [
    {
      name: 'GENERAL',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'General system settings and company information',
      configs: [
        {
          key: 'company_name',
          label: 'Company Name',
          value: 'Ghana Oil Marketing Company',
          type: 'string',
          description: 'Your company name for reports and documents',
        },
        {
          key: 'fiscal_year_start',
          label: 'Fiscal Year Start',
          value: '01-01',
          type: 'string',
          description: 'Start date of fiscal year (MM-DD format)',
        },
        {
          key: 'default_currency',
          label: 'Default Currency',
          value: 'GHS',
          type: 'select',
          options: [
            { value: 'GHS', label: 'Ghana Cedi (GHS)' },
            { value: 'USD', label: 'US Dollar (USD)' },
            { value: 'EUR', label: 'Euro (EUR)' },
            { value: 'GBP', label: 'British Pound (GBP)' },
          ],
        },
        {
          key: 'multi_station',
          label: 'Multi-Station Mode',
          value: true,
          type: 'boolean',
          description: 'Enable management of multiple stations',
        },
      ],
    },
    {
      name: 'ACCOUNTING',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'General Ledger and accounting configuration',
      configs: [
        {
          key: 'auto_journal_entries',
          label: 'Automatic Journal Entries',
          value: true,
          type: 'boolean',
          description: 'Automatically create journal entries for transactions',
        },
        {
          key: 'require_approval',
          label: 'Require Journal Approval',
          value: false,
          type: 'boolean',
          description: 'Require approval before posting journal entries',
        },
        {
          key: 'decimal_places',
          label: 'Decimal Places',
          value: 2,
          type: 'number',
          validation: { min: 0, max: 4 },
        },
        {
          key: 'default_accounts',
          label: 'Default GL Accounts',
          value: {
            cash: '1100',
            bank: '1200',
            accounts_receivable: '1210',
            accounts_payable: '2100',
            inventory: '1300',
            revenue: '4000',
            cost_of_sales: '5000',
          },
          type: 'json',
          description: 'Default account codes for automated entries',
        },
      ],
    },
    {
      name: 'INVENTORY',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      description: 'Inventory management and stock control settings',
      configs: [
        {
          key: 'low_stock_threshold',
          label: 'Low Stock Alert (%)',
          value: 20,
          type: 'number',
          validation: { min: 5, max: 50 },
          description: 'Percentage threshold for low stock alerts',
        },
        {
          key: 'critical_stock_threshold',
          label: 'Critical Stock Alert (%)',
          value: 10,
          type: 'number',
          validation: { min: 1, max: 20 },
          description: 'Percentage threshold for critical stock alerts',
        },
        {
          key: 'auto_reorder',
          label: 'Automatic Reordering',
          value: false,
          type: 'boolean',
          description: 'Automatically create purchase orders at reorder point',
        },
        {
          key: 'allow_negative_stock',
          label: 'Allow Negative Stock',
          value: false,
          type: 'boolean',
          description: 'Allow sales when stock is zero',
        },
      ],
    },
    {
      name: 'SALES',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Sales and customer management configuration',
      configs: [
        {
          key: 'default_payment_terms',
          label: 'Default Payment Terms (Days)',
          value: 30,
          type: 'number',
          validation: { min: 0, max: 90 },
        },
        {
          key: 'credit_limit_check',
          label: 'Enforce Credit Limits',
          value: true,
          type: 'boolean',
          description: 'Block sales if customer exceeds credit limit',
        },
        {
          key: 'loyalty_enabled',
          label: 'Loyalty Program Enabled',
          value: true,
          type: 'boolean',
        },
        {
          key: 'points_per_liter',
          label: 'Loyalty Points per Liter',
          value: 1,
          type: 'number',
          validation: { min: 0, max: 10 },
        },
        {
          key: 'points_per_cedi',
          label: 'Loyalty Points per Cedi',
          value: 1,
          type: 'number',
          validation: { min: 0, max: 10 },
        },
      ],
    },
    {
      name: 'PAYMENT',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Payment methods and gateway configuration',
      configs: [
        {
          key: 'mtn_momo_enabled',
          label: 'MTN Mobile Money',
          value: true,
          type: 'boolean',
        },
        {
          key: 'mtn_momo_api_key',
          label: 'MTN MoMo API Key',
          value: '********',
          type: 'string',
          description: 'MTN Mobile Money API credentials',
        },
        {
          key: 'vodafone_cash_enabled',
          label: 'Vodafone Cash',
          value: true,
          type: 'boolean',
        },
        {
          key: 'vodafone_merchant_id',
          label: 'Vodafone Merchant ID',
          value: 'MERCHANT123',
          type: 'string',
        },
        {
          key: 'payment_timeout',
          label: 'Payment Timeout (seconds)',
          value: 300,
          type: 'number',
          validation: { min: 60, max: 600 },
        },
      ],
    },
    {
      name: 'IOT',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      description: 'IoT sensors and monitoring configuration',
      configs: [
        {
          key: 'iot_enabled',
          label: 'IoT Monitoring Enabled',
          value: true,
          type: 'boolean',
        },
        {
          key: 'tank_reading_interval',
          label: 'Tank Reading Interval (seconds)',
          value: 300,
          type: 'number',
          validation: { min: 60, max: 3600 },
        },
        {
          key: 'temperature_alert_high',
          label: 'High Temperature Alert (°C)',
          value: 40,
          type: 'number',
          validation: { min: 30, max: 50 },
        },
        {
          key: 'temperature_alert_low',
          label: 'Low Temperature Alert (°C)',
          value: 10,
          type: 'number',
          validation: { min: 0, max: 20 },
        },
        {
          key: 'water_level_alert',
          label: 'Water Level Alert (mm)',
          value: 50,
          type: 'number',
          validation: { min: 10, max: 100 },
        },
      ],
    },
  ];

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from the API
      // const response = await fetch('/api/configurations');
      // const data = await response.json();
      setConfigurations(modules);
    } catch (error) {
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (moduleKey: string, configKey: string, value: any) => {
    setEditedConfigs(prev => ({
      ...prev,
      [`${moduleKey}.${configKey}`]: value,
    }));
  };

  const handleSaveConfigurations = async () => {
    try {
      setSaving(true);
      
      // Validate all edited configs
      for (const [key, value] of Object.entries(editedConfigs)) {
        // Add validation logic here
      }

      // In production, this would save to the API
      // await fetch('/api/configurations', {
      //   method: 'POST',
      //   body: JSON.stringify(editedConfigs),
      // });

      toast.success('Configurations saved successfully');
      setEditedConfigs({});
    } catch (error) {
      toast.error('Failed to save configurations');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigInput = (module: string, config: ConfigItem) => {
    const key = `${module}.${config.key}`;
    const value = editedConfigs[key] ?? config.value;

    switch (config.type) {
      case 'boolean':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleConfigChange(module, config.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value
                ? 'bg-primary-500'
                : actualTheme === 'dark' ? 'bg-dark-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </motion.button>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(module, config.key, Number(e.target.value))}
            min={config.validation?.min}
            max={config.validation?.max}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              actualTheme === 'dark'
                ? 'bg-dark-700 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-primary-500`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleConfigChange(module, config.key, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              actualTheme === 'dark'
                ? 'bg-dark-700 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-primary-500`}
          >
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(module, config.key, parsed);
              } catch {
                handleConfigChange(module, config.key, e.target.value);
              }
            }}
            rows={6}
            className={`w-full px-3 py-2 rounded-lg border font-mono text-sm transition-colors ${
              actualTheme === 'dark'
                ? 'bg-dark-700 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-primary-500`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(module, config.key, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              actualTheme === 'dark'
                ? 'bg-dark-700 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-primary-500`}
          />
        );
    }
  };

  const selectedModuleData = modules.find(m => m.name === selectedModule);

  return (
    <FuturisticDashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            System Configuration
          </h1>
          <p className={`${
            actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
          }`}>
            Manage system-wide settings and configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Selector */}
          <div className="lg:col-span-1">
            <div className={`glass rounded-xl p-4 border ${
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Configuration Modules
              </h2>
              
              <div className="space-y-2">
                {modules.map(module => (
                  <motion.button
                    key={module.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedModule(module.name)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      selectedModule === module.name
                        ? 'bg-gradient-primary text-white'
                        : actualTheme === 'dark'
                        ? 'hover:bg-white/10 text-dark-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {module.icon}
                    <span className="font-medium">{module.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Editor */}
          <div className="lg:col-span-3">
            <div className={`glass rounded-xl p-6 border ${
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              {selectedModuleData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      {selectedModuleData.icon}
                      <h2 className={`text-xl font-semibold ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedModuleData.name} Configuration
                      </h2>
                    </div>
                    <p className={`${
                      actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
                    }`}>
                      {selectedModuleData.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {selectedModuleData.configs.map(config => (
                      <div key={config.key}>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`font-medium ${
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {config.label}
                          </label>
                          {editedConfigs[`${selectedModule}.${config.key}`] !== undefined && (
                            <span className="text-xs text-yellow-500">Modified</span>
                          )}
                        </div>
                        
                        {config.description && (
                          <p className={`text-sm mb-2 ${
                            actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
                          }`}>
                            {config.description}
                          </p>
                        )}
                        
                        {renderConfigInput(selectedModule, config)}
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  {Object.keys(editedConfigs).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex justify-end space-x-4"
                    >
                      <button
                        onClick={() => setEditedConfigs({})}
                        className={`px-6 py-2 rounded-lg border transition-colors ${
                          actualTheme === 'dark'
                            ? 'border-dark-500 text-dark-300 hover:bg-dark-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveConfigurations}
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </FuturisticDashboardLayout>
  );
}