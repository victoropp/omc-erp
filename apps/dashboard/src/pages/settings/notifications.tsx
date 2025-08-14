import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  enabled: boolean;
  config: Record<string, any>;
}

interface NotificationRule {
  id: string;
  name: string;
  event: string;
  description: string;
  enabled: boolean;
  channels: string[];
  conditions: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    source?: string;
    keywords?: string[];
  };
  throttle: {
    enabled: boolean;
    interval: number; // minutes
    maxPerInterval: number;
  };
}

const NotificationSettings: NextPage = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'rules' | 'test'>('channels');
  const [testChannel, setTestChannel] = useState('');
  const [testMessage, setTestMessage] = useState('This is a test notification from OMC ERP system.');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setChannels(sampleChannels);
      setRules(sampleRules);
    } catch (error) {
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
    setHasChanges(true);
  };

  const handleRuleToggle = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
    setHasChanges(true);
  };

  const handleRuleChannelToggle = (ruleId: string, channelId: string) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === ruleId) {
        const channels = rule.channels.includes(channelId)
          ? rule.channels.filter(id => id !== channelId)
          : [...rule.channels, channelId];
        return { ...rule, channels };
      }
      return rule;
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // In production, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!testChannel || !testMessage) {
      toast.error('Please select a channel and enter a test message');
      return;
    }

    try {
      setLoading(true);
      // In production, this would send via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Test notification sent successfully');
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'sms':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'push':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h4a1 1 0 011 1v3" />
          </svg>
        );
      case 'webhook':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'slack':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.042 15.165a2.528 2.528 0 01-2.52-2.523A2.528 2.528 0 015.042 10.12h2.52v2.522a2.528 2.528 0 01-2.52 2.523zM6.313 17.688a2.528 2.528 0 012.52-2.523h6.729a2.528 2.528 0 010 5.046H8.833a2.528 2.528 0 01-2.52-2.523z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
          </svg>
        );
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  // Sample data
  const sampleChannels: NotificationChannel[] = [
    {
      id: '1',
      name: 'Email Notifications',
      type: 'email',
      enabled: true,
      config: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        username: 'notifications@omc.com.gh',
        fromAddress: 'OMC ERP System <noreply@omc.com.gh>',
      },
    },
    {
      id: '2',
      name: 'SMS Alerts',
      type: 'sms',
      enabled: true,
      config: {
        provider: 'twilio',
        apiKey: 'AC*********************',
        fromNumber: '+233123456789',
      },
    },
    {
      id: '3',
      name: 'Push Notifications',
      type: 'push',
      enabled: false,
      config: {
        apiKey: 'AAAA*********************',
        appId: 'com.omc.erp',
      },
    },
    {
      id: '4',
      name: 'Slack Integration',
      type: 'slack',
      enabled: true,
      config: {
        webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        channel: '#omc-alerts',
      },
    },
    {
      id: '5',
      name: 'Webhook Alerts',
      type: 'webhook',
      enabled: false,
      config: {
        url: 'https://api.external-system.com/webhooks/omc',
        secret: 'webhook_secret_key',
      },
    },
  ];

  const sampleRules: NotificationRule[] = [
    {
      id: '1',
      name: 'System Critical Alerts',
      event: 'system.critical',
      description: 'Critical system failures and errors',
      enabled: true,
      channels: ['1', '2', '4'],
      conditions: {
        severity: 'critical',
      },
      throttle: {
        enabled: false,
        interval: 5,
        maxPerInterval: 1,
      },
    },
    {
      id: '2',
      name: 'Low Inventory Alerts',
      event: 'inventory.low',
      description: 'Fuel inventory levels below threshold',
      enabled: true,
      channels: ['1', '4'],
      conditions: {
        severity: 'medium',
        source: 'inventory',
        keywords: ['low', 'stock', 'fuel'],
      },
      throttle: {
        enabled: true,
        interval: 60,
        maxPerInterval: 3,
      },
    },
    {
      id: '3',
      name: 'Failed Transactions',
      event: 'transaction.failed',
      description: 'Payment processing failures',
      enabled: true,
      channels: ['1', '2'],
      conditions: {
        severity: 'high',
        source: 'payments',
      },
      throttle: {
        enabled: true,
        interval: 15,
        maxPerInterval: 5,
      },
    },
    {
      id: '4',
      name: 'Security Incidents',
      event: 'security.incident',
      description: 'Failed logins and security breaches',
      enabled: true,
      channels: ['1', '2', '4'],
      conditions: {
        severity: 'high',
        source: 'security',
        keywords: ['login', 'breach', 'unauthorized'],
      },
      throttle: {
        enabled: false,
        interval: 5,
        maxPerInterval: 1,
      },
    },
    {
      id: '5',
      name: 'UPPF Claim Status',
      event: 'uppf.status',
      description: 'UPPF claim approval and rejection notifications',
      enabled: true,
      channels: ['1'],
      conditions: {
        severity: 'medium',
        source: 'uppf',
      },
      throttle: {
        enabled: true,
        interval: 30,
        maxPerInterval: 10,
      },
    },
    {
      id: '6',
      name: 'Daily Reports',
      event: 'reports.daily',
      description: 'Daily operational and financial summaries',
      enabled: true,
      channels: ['1'],
      conditions: {
        severity: 'low',
        source: 'reports',
      },
      throttle: {
        enabled: false,
        interval: 1440,
        maxPerInterval: 1,
      },
    },
  ];

  const enabledChannelsCount = channels.filter(c => c.enabled).length;
  const enabledRulesCount = rules.filter(r => r.enabled).length;
  const totalNotifications = rules.reduce((sum, rule) => {
    return sum + (rule.enabled ? rule.channels.length : 0);
  }, 0);

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
              Notification Settings
            </h1>
            <p className="text-dark-400 mt-2">
              Configure notification channels and rules for system alerts
            </p>
          </div>
          <div className="flex space-x-4">
            {hasChanges && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  loadSettings();
                  setHasChanges(false);
                }}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Channels</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{enabledChannelsCount}</p>
              <p className="text-sm text-green-400">of {channels.length} configured</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Rules</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{enabledRulesCount}</p>
              <p className="text-sm text-dark-400">notification rules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Routes</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{totalNotifications}</p>
              <p className="text-sm text-dark-400">active routes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Last 24h</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">247</p>
              <p className="text-sm text-dark-400">notifications sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { id: 'channels', label: 'Channels', count: channels.length },
            { id: 'rules', label: 'Rules', count: rules.length },
            { id: 'test', label: 'Test', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-dark-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'channels' && (
            <Card>
              <CardHeader title="Notification Channels" />
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-600 text-dark-400'}`}>
                          {getChannelIcon(channel.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{channel.name}</p>
                          <p className="text-dark-400 text-sm capitalize">{channel.type} notifications</p>
                          {channel.config && (
                            <div className="mt-1 text-xs text-dark-500">
                              {channel.type === 'email' && `SMTP: ${channel.config.smtpHost}`}
                              {channel.type === 'sms' && `Provider: ${channel.config.provider}`}
                              {channel.type === 'slack' && `Channel: ${channel.config.channel}`}
                              {channel.type === 'webhook' && `URL: ${channel.config.url?.substring(0, 30)}...`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          channel.enabled 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {channel.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleChannelToggle(channel.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            channel.enabled ? 'bg-primary-500' : 'bg-dark-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              channel.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </motion.button>
                        <Button variant="ghost" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'rules' && (
            <Card>
              <CardHeader title="Notification Rules" />
              <CardContent>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-medium">{rule.name}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(rule.conditions.severity)}`}>
                              {rule.conditions.severity?.toUpperCase() || 'ALL'}
                            </span>
                          </div>
                          <p className="text-dark-400 text-sm mb-2">{rule.description}</p>
                          <p className="text-dark-500 text-xs">
                            Event: {rule.event}
                            {rule.conditions.source && ` | Source: ${rule.conditions.source}`}
                            {rule.throttle.enabled && ` | Throttle: ${rule.throttle.maxPerInterval} per ${rule.throttle.interval}min`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            rule.enabled 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {rule.enabled ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRuleToggle(rule.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              rule.enabled ? 'bg-primary-500' : 'bg-dark-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                rule.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="border-t border-dark-600 pt-3">
                        <p className="text-dark-400 text-sm mb-2">Notification Channels:</p>
                        <div className="flex flex-wrap gap-2">
                          {channels.map((channel) => {
                            const isSelected = rule.channels.includes(channel.id);
                            return (
                              <button
                                key={channel.id}
                                onClick={() => handleRuleChannelToggle(rule.id, channel.id)}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  isSelected
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'bg-dark-600 text-dark-400 border border-dark-600 hover:bg-dark-500'
                                }`}
                                disabled={!channel.enabled}
                              >
                                <div className="w-3 h-3">{getChannelIcon(channel.type)}</div>
                                <span>{channel.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'test' && (
            <Card>
              <CardHeader title="Test Notifications" />
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-400 font-medium text-sm">Test Notification System</p>
                      <p className="text-dark-300 text-sm mt-1">
                        Send test notifications to verify your channel configurations are working correctly.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Select
                      label="Select Channel"
                      options={[
                        { value: '', label: 'Choose a channel...' },
                        ...channels
                          .filter(c => c.enabled)
                          .map(c => ({ value: c.id, label: c.name }))
                      ]}
                      value={testChannel}
                      onChange={setTestChannel}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Test Type
                    </label>
                    <Select
                      options={[
                        { value: 'info', label: 'Information' },
                        { value: 'warning', label: 'Warning' },
                        { value: 'error', label: 'Error' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                      value="info"
                      onChange={() => {}}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Test Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your test message here..."
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-dark-400">
                    {testChannel && (
                      <p>
                        Test will be sent via: <span className="text-white font-medium">
                          {channels.find(c => c.id === testChannel)?.name}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleTestNotification}
                    disabled={!testChannel || !testMessage || loading}
                  >
                    {loading ? 'Sending...' : 'Send Test Notification'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

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
                <p className="text-blue-100 text-sm">Notification settings modified</p>
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

export default NotificationSettings;