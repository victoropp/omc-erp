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
const ui_1 = require("@/components/ui");
const react_hot_toast_1 = require("react-hot-toast");
const SecuritySettings = () => {
    const [settings, setSettings] = (0, react_1.useState)({
        passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
            maxAge: 90,
            preventReuse: 5,
        },
        sessionManagement: {
            maxSessions: 3,
            sessionTimeout: 30,
            rememberMeDuration: 30,
            logoutOnClose: false,
        },
        twoFactor: {
            enabled: true,
            required: false,
            methods: ['totp', 'sms'],
            backupCodes: true,
        },
        loginSecurity: {
            maxFailedAttempts: 5,
            lockoutDuration: 15,
            enableCaptcha: true,
            ipWhitelist: [],
        },
        encryption: {
            dataEncryption: true,
            encryptionMethod: 'AES-256',
            keyRotation: 365,
            backupEncryption: true,
        },
        apiSecurity: {
            rateLimiting: true,
            requestsPerMinute: 60,
            requireApiKey: true,
            corsEnabled: true,
            allowedOrigins: ['https://omc.com.gh'],
        },
    });
    const [securityEvents, setSecurityEvents] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [hasChanges, setHasChanges] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('password');
    const [newIpAddress, setNewIpAddress] = (0, react_1.useState)('');
    const [newOrigin, setNewOrigin] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadSettings();
        loadSecurityEvents();
    }, []);
    const loadSettings = async () => {
        try {
            setLoading(true);
            // In production, this would fetch from API
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load security settings');
        }
        finally {
            setLoading(false);
        }
    };
    const loadSecurityEvents = async () => {
        try {
            setSecurityEvents(sampleSecurityEvents);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load security events');
        }
    };
    const handleSettingChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
        setHasChanges(true);
    };
    const handleArraySettingAdd = (section, field, value) => {
        if (!value.trim())
            return;
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: [...prev[section][field], value],
            },
        }));
        setHasChanges(true);
    };
    const handleArraySettingRemove = (section, field, index) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: prev[section][field].filter((_, i) => i !== index),
            },
        }));
        setHasChanges(true);
    };
    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            // In production, this would save to API
            await new Promise(resolve => setTimeout(resolve, 1000));
            react_hot_toast_1.toast.success('Security settings saved successfully');
            setHasChanges(false);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to save security settings');
        }
        finally {
            setLoading(false);
        }
    };
    const generateBackupCodes = () => {
        const codes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
        react_hot_toast_1.toast.success('New backup codes generated');
        return codes;
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
            default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
        }
    };
    const getPasswordStrength = () => {
        let strength = 0;
        const policy = settings.passwordPolicy;
        if (policy.minLength >= 8)
            strength += 20;
        if (policy.requireUppercase)
            strength += 20;
        if (policy.requireLowercase)
            strength += 20;
        if (policy.requireNumbers)
            strength += 20;
        if (policy.requireSymbols)
            strength += 20;
        return strength;
    };
    // Sample security events
    const sampleSecurityEvents = [
        {
            id: '1',
            type: 'Failed Login',
            description: 'Multiple failed login attempts from suspicious IP',
            severity: 'high',
            timestamp: '2024-01-13T15:30:00Z',
            ipAddress: '185.220.100.240',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            resolved: false,
        },
        {
            id: '2',
            type: 'Password Change',
            description: 'User password changed successfully',
            severity: 'low',
            timestamp: '2024-01-13T14:20:00Z',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            resolved: true,
        },
        {
            id: '3',
            type: 'Account Lockout',
            description: 'User account locked due to exceeded failed attempts',
            severity: 'medium',
            timestamp: '2024-01-13T13:45:00Z',
            ipAddress: '10.0.1.25',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
            resolved: true,
        },
        {
            id: '4',
            type: '2FA Enabled',
            description: 'Two-factor authentication enabled for user account',
            severity: 'low',
            timestamp: '2024-01-13T12:30:00Z',
            ipAddress: '192.168.1.50',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            resolved: true,
        },
    ];
    const passwordStrength = getPasswordStrength();
    const unresolvedEvents = securityEvents.filter(e => !e.resolved).length;
    const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Security Settings
            </h1>
            <p className="text-dark-400 mt-2">
              Configure security policies and monitor system security
            </p>
          </div>
          <div className="flex space-x-4">
            {hasChanges && (<ui_1.Button variant="outline" size="sm" onClick={() => {
                loadSettings();
                setHasChanges(false);
            }}>
                Reset Changes
              </ui_1.Button>)}
            <ui_1.Button variant="primary" size="sm" onClick={handleSaveSettings} disabled={!hasChanges || loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Password Strength</h3>
              <p className={`text-3xl font-bold mb-1 ${passwordStrength >= 80 ? 'text-green-400' :
            passwordStrength >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {passwordStrength}%
              </p>
              <p className="text-sm text-dark-400">Policy compliance</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">2FA Enabled</h3>
              <p className={`text-3xl font-bold mb-1 ${settings.twoFactor.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {settings.twoFactor.enabled ? 'YES' : 'NO'}
              </p>
              <p className="text-sm text-dark-400">
                {settings.twoFactor.required ? 'Required' : 'Optional'}
              </p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Security Events</h3>
              <p className={`text-3xl font-bold mb-1 ${unresolvedEvents === 0 ? 'text-green-400' :
            criticalEvents > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                {unresolvedEvents}
              </p>
              <p className="text-sm text-dark-400">Unresolved</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Data Encryption</h3>
              <p className={`text-3xl font-bold mb-1 ${settings.encryption.dataEncryption ? 'text-green-400' : 'text-red-400'}`}>
                {settings.encryption.dataEncryption ? 'ON' : 'OFF'}
              </p>
              <p className="text-sm text-dark-400">{settings.encryption.encryptionMethod}</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-dark-800 p-1 rounded-lg">
          {[
            { id: 'password', label: 'Password Policy' },
            { id: 'sessions', label: 'Sessions' },
            { id: '2fa', label: 'Two-Factor Auth' },
            { id: 'login', label: 'Login Security' },
            { id: 'encryption', label: 'Encryption' },
            { id: 'api', label: 'API Security' },
            { id: 'events', label: 'Security Events' },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 rounded text-xs font-medium transition-colors ${activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Tab Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'password' && (<ui_1.Card>
              <ui_1.CardHeader title="Password Policy Configuration"/>
              <ui_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Minimum Password Length
                    </label>
                    <ui_1.Input type="number" value={settings.passwordPolicy.minLength} onChange={(e) => handleSettingChange('passwordPolicy', 'minLength', Number(e.target.value))} min="4" max="32"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Password Maximum Age (days)
                    </label>
                    <ui_1.Input type="number" value={settings.passwordPolicy.maxAge} onChange={(e) => handleSettingChange('passwordPolicy', 'maxAge', Number(e.target.value))} min="0" max="365"/>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Prevent Password Reuse (last N passwords)
                  </label>
                  <ui_1.Input type="number" value={settings.passwordPolicy.preventReuse} onChange={(e) => handleSettingChange('passwordPolicy', 'preventReuse', Number(e.target.value))} min="0" max="24"/>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Character Requirements</h4>
                  {[
                { key: 'requireUppercase', label: 'Require uppercase letters (A-Z)' },
                { key: 'requireLowercase', label: 'Require lowercase letters (a-z)' },
                { key: 'requireNumbers', label: 'Require numbers (0-9)' },
                { key: 'requireSymbols', label: 'Require symbols (!@#$...)' },
            ].map((requirement) => (<div key={requirement.key} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <span className="text-white">{requirement.label}</span>
                      <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('passwordPolicy', requirement.key, !settings.passwordPolicy[requirement.key])} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordPolicy[requirement.key] ? 'bg-primary-500' : 'bg-dark-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.passwordPolicy[requirement.key] ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </framer_motion_1.motion.button>
                    </div>))}
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-400 font-medium">Password Strength Score</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${passwordStrength >= 80 ? 'bg-green-500/20 text-green-400' :
                passwordStrength >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'}`}>
                      {passwordStrength}%
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${passwordStrength >= 80 ? 'bg-green-500/20' :
                passwordStrength >= 60 ? 'bg-yellow-500/20' :
                    'bg-red-500/20'}`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength >= 80 ? 'bg-green-400' :
                passwordStrength >= 60 ? 'bg-yellow-400' :
                    'bg-red-400'}`} style={{ width: `${passwordStrength}%` }}/>
                  </div>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'sessions' && (<ui_1.Card>
              <ui_1.CardHeader title="Session Management"/>
              <ui_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Maximum Concurrent Sessions
                    </label>
                    <ui_1.Input type="number" value={settings.sessionManagement.maxSessions} onChange={(e) => handleSettingChange('sessionManagement', 'maxSessions', Number(e.target.value))} min="1" max="10"/>
                    <p className="text-dark-400 text-sm mt-1">
                      Number of simultaneous logins allowed per user
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Session Timeout (minutes)
                    </label>
                    <ui_1.Input type="number" value={settings.sessionManagement.sessionTimeout} onChange={(e) => handleSettingChange('sessionManagement', 'sessionTimeout', Number(e.target.value))} min="5" max="480"/>
                    <p className="text-dark-400 text-sm mt-1">
                      Idle time before automatic logout
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Remember Me Duration (days)
                  </label>
                  <ui_1.Input type="number" value={settings.sessionManagement.rememberMeDuration} onChange={(e) => handleSettingChange('sessionManagement', 'rememberMeDuration', Number(e.target.value))} min="1" max="365"/>
                  <p className="text-dark-400 text-sm mt-1">
                    How long "Remember Me" sessions last
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auto Logout on Browser Close</p>
                    <p className="text-dark-400 text-sm">End sessions when browser is closed</p>
                  </div>
                  <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('sessionManagement', 'logoutOnClose', !settings.sessionManagement.logoutOnClose)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.sessionManagement.logoutOnClose ? 'bg-primary-500' : 'bg-dark-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sessionManagement.logoutOnClose ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </framer_motion_1.motion.button>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === '2fa' && (<ui_1.Card>
              <ui_1.CardHeader title="Two-Factor Authentication"/>
              <ui_1.CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Enable Two-Factor Authentication</p>
                    <p className="text-dark-400 text-sm">Add an extra layer of security to user accounts</p>
                  </div>
                  <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('twoFactor', 'enabled', !settings.twoFactor.enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactor.enabled ? 'bg-primary-500' : 'bg-dark-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactor.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </framer_motion_1.motion.button>
                </div>
                
                {settings.twoFactor.enabled && (<>
                    <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Require 2FA for All Users</p>
                        <p className="text-dark-400 text-sm">Make two-factor authentication mandatory</p>
                      </div>
                      <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('twoFactor', 'required', !settings.twoFactor.required)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactor.required ? 'bg-primary-500' : 'bg-dark-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactor.required ? 'translate-x-6' : 'translate-x-1'}`}/>
                      </framer_motion_1.motion.button>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Available 2FA Methods</h4>
                      <div className="space-y-3">
                        {[
                    { key: 'totp', label: 'TOTP (Google Authenticator, Authy)', icon: '🔐' },
                    { key: 'sms', label: 'SMS Text Messages', icon: '📱' },
                    { key: 'email', label: 'Email Codes', icon: '📧' },
                ].map((method) => (<div key={method.key} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{method.icon}</span>
                              <span className="text-white">{method.label}</span>
                            </div>
                            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                        const methods = settings.twoFactor.methods.includes(method.key)
                            ? settings.twoFactor.methods.filter(m => m !== method.key)
                            : [...settings.twoFactor.methods, method.key];
                        handleSettingChange('twoFactor', 'methods', methods);
                    }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactor.methods.includes(method.key) ? 'bg-primary-500' : 'bg-dark-600'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactor.methods.includes(method.key) ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </framer_motion_1.motion.button>
                          </div>))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Enable Backup Codes</p>
                        <p className="text-dark-400 text-sm">Generate one-time backup codes for emergency access</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('twoFactor', 'backupCodes', !settings.twoFactor.backupCodes)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactor.backupCodes ? 'bg-primary-500' : 'bg-dark-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactor.backupCodes ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </framer_motion_1.motion.button>
                        {settings.twoFactor.backupCodes && (<ui_1.Button variant="outline" size="sm" onClick={generateBackupCodes}>
                            Generate Codes
                          </ui_1.Button>)}
                      </div>
                    </div>
                  </>)}
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'login' && (<ui_1.Card>
              <ui_1.CardHeader title="Login Security"/>
              <ui_1.CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Max Failed Login Attempts
                    </label>
                    <ui_1.Input type="number" value={settings.loginSecurity.maxFailedAttempts} onChange={(e) => handleSettingChange('loginSecurity', 'maxFailedAttempts', Number(e.target.value))} min="3" max="10"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Account Lockout Duration (minutes)
                    </label>
                    <ui_1.Input type="number" value={settings.loginSecurity.lockoutDuration} onChange={(e) => handleSettingChange('loginSecurity', 'lockoutDuration', Number(e.target.value))} min="5" max="1440"/>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Enable CAPTCHA</p>
                    <p className="text-dark-400 text-sm">Require CAPTCHA after failed login attempts</p>
                  </div>
                  <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingChange('loginSecurity', 'enableCaptcha', !settings.loginSecurity.enableCaptcha)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.loginSecurity.enableCaptcha ? 'bg-primary-500' : 'bg-dark-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.loginSecurity.enableCaptcha ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </framer_motion_1.motion.button>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">IP Address Whitelist</h4>
                  <p className="text-dark-400 text-sm mb-3">
                    Only allow logins from these IP addresses (leave empty to allow all)
                  </p>
                  
                  <div className="flex space-x-2 mb-3">
                    <ui_1.Input placeholder="Enter IP address (e.g., 192.168.1.100)" value={newIpAddress} onChange={(e) => setNewIpAddress(e.target.value)}/>
                    <ui_1.Button variant="outline" onClick={() => {
                if (newIpAddress.trim()) {
                    handleArraySettingAdd('loginSecurity', 'ipWhitelist', newIpAddress.trim());
                    setNewIpAddress('');
                }
            }}>
                      Add
                    </ui_1.Button>
                  </div>
                  
                  {settings.loginSecurity.ipWhitelist.length > 0 && (<div className="space-y-2">
                      {settings.loginSecurity.ipWhitelist.map((ip, index) => (<div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                          <span className="text-white font-mono">{ip}</span>
                          <ui_1.Button variant="ghost" size="sm" onClick={() => handleArraySettingRemove('loginSecurity', 'ipWhitelist', index)} className="text-red-400 hover:text-red-300">
                            Remove
                          </ui_1.Button>
                        </div>))}
                    </div>)}
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'events' && (<ui_1.Card>
              <ui_1.CardHeader title="Recent Security Events"/>
              <ui_1.CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (<div key={event.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                          <h4 className="text-white font-medium">{event.type}</h4>
                          {event.resolved && (<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                              RESOLVED
                            </span>)}
                        </div>
                        <span className="text-dark-400 text-sm">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-dark-300 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-dark-500">
                        <span>IP: {event.ipAddress}</span>
                        <span>User Agent: {event.userAgent.substring(0, 50)}...</span>
                      </div>
                    </div>))}
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}
        </framer_motion_1.motion.div>

        {/* Save Changes Notice */}
        {hasChanges && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 p-4 bg-primary-600 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-white">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Security Changes</p>
                <p className="text-blue-100 text-sm">Unsaved security settings</p>
              </div>
              <ui_1.Button variant="outline" size="sm" onClick={handleSaveSettings} disabled={loading} className="ml-4 border-white text-white hover:bg-white hover:text-primary-600">
                {loading ? 'Saving...' : 'Save Now'}
              </ui_1.Button>
            </div>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = SecuritySettings;
//# sourceMappingURL=security.js.map