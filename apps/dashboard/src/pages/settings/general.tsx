import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface GeneralSettings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
    taxNumber: string;
  };
  localization: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    numberFormat: string;
  };
  system: {
    sessionTimeout: number;
    autoBackup: boolean;
    backupFrequency: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: string;
  };
  fiscal: {
    yearStart: string;
    yearEnd: string;
    currentPeriod: string;
  };
}

const GeneralSettings: NextPage = () => {
  const [settings, setSettings] = useState<GeneralSettings>({
    company: {
      name: 'Ghana Oil Marketing Company',
      address: 'P.O. Box 123, Accra, Ghana',
      phone: '+233-302-123456',
      email: 'info@omc.com.gh',
      website: 'https://omc.com.gh',
      logo: '/company-logo.png',
      taxNumber: 'TIN-12345678',
    },
    localization: {
      timezone: 'Africa/Accra',
      currency: 'GHS',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,000.00',
    },
    system: {
      sessionTimeout: 30,
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
    },
    fiscal: {
      yearStart: '01-01',
      yearEnd: '12-31',
      currentPeriod: '2024',
    },
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from API
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section: keyof GeneralSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // In production, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      loadSettings();
      setHasChanges(false);
      toast.info('Settings reset to defaults');
    }
  };

  const timezoneOptions = [
    { value: 'Africa/Accra', label: 'Ghana (GMT)' },
    { value: 'Africa/Lagos', label: 'West Africa Time (WAT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
  ];

  const currencyOptions = [
    { value: 'GHS', label: 'Ghana Cedi (₵)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'tw', label: 'Twi' },
    { value: 'ga', label: 'Ga' },
    { value: 'fr', label: 'French' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const logLevelOptions = [
    { value: 'debug', label: 'Debug (Verbose)' },
    { value: 'info', label: 'Info (Normal)' },
    { value: 'warn', label: 'Warning (Important)' },
    { value: 'error', label: 'Error (Critical Only)' },
  ];

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              General Settings
            </h1>
            <p className="text-dark-400 mt-2">
              Configure system-wide preferences and company information
            </p>
          </div>
          <div className="flex space-x-4">
            {hasChanges && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetSettings}
              >
                Reset Changes
              </Button>
            )}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveSettings}
              disabled={!hasChanges || loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>

        {/* Company Information */}
        <Card>
          <CardHeader title="Company Information" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                value={settings.company.name}
                onChange={(e) => handleSettingChange('company', 'name', e.target.value)}
                required
              />
              <Input
                label="Tax Number"
                value={settings.company.taxNumber}
                onChange={(e) => handleSettingChange('company', 'taxNumber', e.target.value)}
                placeholder="TIN-XXXXXXXXX"
              />
            </div>
            
            <Input
              label="Address"
              value={settings.company.address}
              onChange={(e) => handleSettingChange('company', 'address', e.target.value)}
              placeholder="Complete business address"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Phone Number"
                type="tel"
                value={settings.company.phone}
                onChange={(e) => handleSettingChange('company', 'phone', e.target.value)}
                placeholder="+233-XXX-XXXXXX"
              />
              <Input
                label="Email Address"
                type="email"
                value={settings.company.email}
                onChange={(e) => handleSettingChange('company', 'email', e.target.value)}
                placeholder="info@company.com"
              />
              <Input
                label="Website"
                type="url"
                value={settings.company.website}
                onChange={(e) => handleSettingChange('company', 'website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Company Logo
              </label>
              <div className="flex items-center space-x-4">
                {settings.company.logo && (
                  <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                    <img 
                      src={settings.company.logo} 
                      alt="Company Logo" 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-dark-400 text-sm">Logo</span>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    placeholder="Logo URL or upload path"
                    value={settings.company.logo}
                    onChange={(e) => handleSettingChange('company', 'logo', e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localization Settings */}
        <Card>
          <CardHeader title="Localization & Regional Settings" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Timezone"
                options={timezoneOptions}
                value={settings.localization.timezone}
                onChange={(value) => handleSettingChange('localization', 'timezone', value)}
              />
              <Select
                label="Default Currency"
                options={currencyOptions}
                value={settings.localization.currency}
                onChange={(value) => handleSettingChange('localization', 'currency', value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Language"
                options={languageOptions}
                value={settings.localization.language}
                onChange={(value) => handleSettingChange('localization', 'language', value)}
              />
              <Select
                label="Date Format"
                options={dateFormatOptions}
                value={settings.localization.dateFormat}
                onChange={(value) => handleSettingChange('localization', 'dateFormat', value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number Format
                </label>
                <div className="flex items-center space-x-4">
                  <Input
                    value={settings.localization.numberFormat}
                    onChange={(e) => handleSettingChange('localization', 'numberFormat', e.target.value)}
                    placeholder="1,000.00"
                  />
                  <span className="text-dark-400 text-sm">Preview: 1,234.56</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader title="System Configuration" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Session Timeout (minutes)
                </label>
                <Input
                  type="number"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => handleSettingChange('system', 'sessionTimeout', Number(e.target.value))}
                  min="5"
                  max="480"
                />
                <p className="text-dark-400 text-sm mt-1">
                  How long users can stay logged in without activity
                </p>
              </div>
              <Select
                label="Log Level"
                options={logLevelOptions}
                value={settings.system.logLevel}
                onChange={(value) => handleSettingChange('system', 'logLevel', value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Automatic Backup</p>
                  <p className="text-dark-400 text-sm">Enable scheduled system backups</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('system', 'autoBackup', !settings.system.autoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.autoBackup ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.system.autoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
              
              {settings.system.autoBackup && (
                <div className="ml-4">
                  <Select
                    label="Backup Frequency"
                    options={backupFrequencyOptions}
                    value={settings.system.backupFrequency}
                    onChange={(value) => handleSettingChange('system', 'backupFrequency', value)}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-dark-400 text-sm">Temporarily disable system access for maintenance</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.maintenanceMode ? 'bg-red-500' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Debug Mode</p>
                  <p className="text-dark-400 text-sm">Enable verbose logging for troubleshooting</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('system', 'debugMode', !settings.system.debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.debugMode ? 'bg-yellow-500' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.system.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fiscal Year Settings */}
        <Card>
          <CardHeader title="Fiscal Year Configuration" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Fiscal Year Start"
                type="text"
                value={settings.fiscal.yearStart}
                onChange={(e) => handleSettingChange('fiscal', 'yearStart', e.target.value)}
                placeholder="MM-DD"
                pattern="[0-9]{2}-[0-9]{2}"
              />
              <Input
                label="Fiscal Year End"
                type="text"
                value={settings.fiscal.yearEnd}
                onChange={(e) => handleSettingChange('fiscal', 'yearEnd', e.target.value)}
                placeholder="MM-DD"
                pattern="[0-9]{2}-[0-9]{2}"
              />
              <Input
                label="Current Period"
                type="text"
                value={settings.fiscal.currentPeriod}
                onChange={(e) => handleSettingChange('fiscal', 'currentPeriod', e.target.value)}
                placeholder="YYYY"
              />
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 font-medium text-sm">Fiscal Year Information</p>
                  <p className="text-dark-300 text-sm mt-1">
                    Current fiscal year: {settings.fiscal.yearStart} to {settings.fiscal.yearEnd} ({settings.fiscal.currentPeriod})
                  </p>
                  <p className="text-dark-400 text-xs mt-1">
                    Changes to fiscal year settings may affect financial reporting and require system restart.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Notice */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 p-4 bg-primary-600 rounded-lg shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-white">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Unsaved Changes</p>
                <p className="text-blue-100 text-sm">You have unsaved changes</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveSettings}
                disabled={loading}
                className="ml-4 border-white text-white hover:bg-white hover:text-primary-600"
              >
                {loading ? 'Saving...' : 'Save Now'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default GeneralSettings;