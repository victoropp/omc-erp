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
const router_1 = require("next/router");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const ui_1 = require("@/components/ui");
const SettingsOverview = () => {
    const router = (0, router_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const settingsSections = [
        {
            id: 'general',
            name: 'General Settings',
            description: 'Company information, localization, and system preferences',
            icon: '⚙️',
            route: '/settings/general',
            status: 'configured',
            lastUpdated: '2024-01-13T10:30:00Z',
        },
        {
            id: 'notifications',
            name: 'Notifications',
            description: 'Configure notification channels and rules for system alerts',
            icon: '🔔',
            route: '/settings/notifications',
            status: 'configured',
            lastUpdated: '2024-01-12T14:20:00Z',
        },
        {
            id: 'security',
            name: 'Security Settings',
            description: 'Password policies, two-factor authentication, and security monitoring',
            icon: '🔐',
            route: '/settings/security',
            status: 'needs-attention',
            lastUpdated: '2024-01-10T09:15:00Z',
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'External service integrations, APIs, and webhook endpoints',
            icon: '🔗',
            route: '/settings/integrations',
            status: 'configured',
            lastUpdated: '2024-01-13T16:45:00Z',
        },
        {
            id: 'backup',
            name: 'Backup & Recovery',
            description: 'Automated backups, data recovery, and system restoration',
            icon: '💾',
            route: '/settings/backup',
            status: 'configured',
            lastUpdated: '2024-01-13T02:00:00Z',
        },
        {
            id: 'users',
            name: 'User Management',
            description: 'Manage user accounts, roles, and permissions',
            icon: '👥',
            route: '/admin/users',
            status: 'configured',
            lastUpdated: '2024-01-13T11:00:00Z',
        },
    ];
    const handleSectionClick = async (route) => {
        setLoading(true);
        await router.push(route);
        setLoading(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'configured': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'needs-attention': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'not-configured': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'configured': return 'CONFIGURED';
            case 'needs-attention': return 'NEEDS ATTENTION';
            case 'not-configured': return 'NOT CONFIGURED';
            default: return 'UNKNOWN';
        }
    };
    const configuredCount = settingsSections.filter(s => s.status === 'configured').length;
    const attentionCount = settingsSections.filter(s => s.status === 'needs-attention').length;
    const notConfiguredCount = settingsSections.filter(s => s.status === 'not-configured').length;
    const overallHealth = Math.round((configuredCount / settingsSections.length) * 100);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Settings Overview
            </h1>
            <p className="text-dark-400 mt-2">
              Manage system configuration and preferences
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Settings
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh Status
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">System Health</h3>
              <p className={`text-3xl font-bold mb-1 ${overallHealth >= 90 ? 'text-green-400' :
            overallHealth >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {overallHealth}%
              </p>
              <p className="text-sm text-dark-400">Configuration status</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Configured</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">{configuredCount}</p>
              <p className="text-sm text-dark-400">sections ready</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Need Attention</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{attentionCount}</p>
              <p className="text-sm text-dark-400">require updates</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Not Configured</h3>
              <p className="text-3xl font-bold text-red-400 mb-1">{notConfiguredCount}</p>
              <p className="text-sm text-dark-400">need setup</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Settings Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section, index) => (<framer_motion_1.motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
              <ui_1.Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group">
                <ui_1.CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {section.name}
                        </h3>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(section.status)}`}>
                      {getStatusLabel(section.status)}
                    </span>
                  </div>
                  
                  <p className="text-dark-400 text-sm mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  
                  {section.lastUpdated && (<div className="text-xs text-dark-500 mb-4">
                      Last updated: {new Date(section.lastUpdated).toLocaleDateString()} at {new Date(section.lastUpdated).toLocaleTimeString()}
                    </div>)}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {section.status === 'configured' && (<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>)}
                      {section.status === 'needs-attention' && (<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>)}
                      {section.status === 'not-configured' && (<div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>)}
                      <span className="text-xs text-dark-500">
                        {section.status === 'configured' && 'Ready'}
                        {section.status === 'needs-attention' && 'Action Required'}
                        {section.status === 'not-configured' && 'Setup Required'}
                      </span>
                    </div>
                    
                    <ui_1.Button variant="ghost" size="sm" onClick={() => handleSectionClick(section.route)} disabled={loading} className="group-hover:bg-primary-500/20 group-hover:text-primary-400">
                      {section.status === 'configured' ? 'Configure' : 'Setup'}
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Quick Actions */}
        <ui_1.Card>
          <ui_1.CardHeader title="Quick Actions"/>
          <ui_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">System Health Check</h4>
                </div>
                <p className="text-dark-400 text-sm mb-3">
                  Run comprehensive system diagnostics
                </p>
                <ui_1.Button variant="outline" size="sm" className="w-full">
                  Run Health Check
                </ui_1.Button>
              </div>
              
              <div className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Backup System</h4>
                </div>
                <p className="text-dark-400 text-sm mb-3">
                  Create immediate system backup
                </p>
                <ui_1.Button variant="outline" size="sm" className="w-full">
                  Create Backup
                </ui_1.Button>
              </div>
              
              <div className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Test Integrations</h4>
                </div>
                <p className="text-dark-400 text-sm mb-3">
                  Verify external service connections
                </p>
                <ui_1.Button variant="outline" size="sm" className="w-full">
                  Test All
                </ui_1.Button>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Recent Activity */}
        <ui_1.Card>
          <ui_1.CardHeader title="Recent Configuration Changes"/>
          <ui_1.CardContent>
            <div className="space-y-3">
              {[
            {
                action: 'Updated notification rules for critical alerts',
                section: 'Notifications',
                user: 'john.admin',
                timestamp: '2024-01-13T16:45:00Z',
            },
            {
                action: 'Configured MTN Mobile Money integration',
                section: 'Integrations',
                user: 'sarah.mensah',
                timestamp: '2024-01-13T14:20:00Z',
            },
            {
                action: 'Updated company information and logo',
                section: 'General',
                user: 'kwame.asante',
                timestamp: '2024-01-13T10:30:00Z',
            },
            {
                action: 'Created new user role: Regional Supervisor',
                section: 'Users',
                user: 'john.admin',
                timestamp: '2024-01-12T11:15:00Z',
            },
        ].map((activity, index) => (<div key={index} className="flex items-center justify-between py-3 px-4 bg-dark-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="inline-flex px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
                        {activity.section}
                      </span>
                      <span className="text-dark-400 text-xs">
                        by {activity.user}
                      </span>
                    </div>
                  </div>
                  <span className="text-dark-500 text-xs">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>))}
            </div>
          </ui_1.CardContent>
        </ui_1.Card>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = SettingsOverview;
//# sourceMappingURL=index.js.map