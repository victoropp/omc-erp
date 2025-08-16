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
const AuditLogs = () => {
    const [auditLogs, setAuditLogs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedLog, setSelectedLog] = (0, react_1.useState)(null);
    // Filter states
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [actionFilter, setActionFilter] = (0, react_1.useState)('');
    const [userFilter, setUserFilter] = (0, react_1.useState)('');
    const [riskFilter, setRiskFilter] = (0, react_1.useState)('');
    const [dateRange, setDateRange] = (0, react_1.useState)({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    (0, react_1.useEffect)(() => {
        loadAuditLogs();
    }, [dateRange, actionFilter, userFilter, riskFilter]);
    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            // In production, this would fetch from API with filters
            setAuditLogs(sampleAuditLogs);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load audit logs');
        }
        finally {
            setLoading(false);
        }
    };
    const handleExportLogs = async () => {
        try {
            react_hot_toast_1.toast.success('Audit logs exported successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to export audit logs');
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-green-500/20 text-green-400 border-green-500/30';
        }
    };
    const getActionColor = (action) => {
        switch (action.toLowerCase()) {
            case 'create': return 'bg-green-500/20 text-green-400';
            case 'update': return 'bg-blue-500/20 text-blue-400';
            case 'delete': return 'bg-red-500/20 text-red-400';
            case 'login': return 'bg-purple-500/20 text-purple-400';
            case 'logout': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-dark-500/20 text-dark-400';
        }
    };
    // Filtered data
    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = !actionFilter || log.action === actionFilter;
        const matchesUser = !userFilter || log.userId === userFilter;
        const matchesRisk = !riskFilter || log.risk === riskFilter;
        return matchesSearch && matchesAction && matchesUser && matchesRisk;
    });
    // Table columns
    const auditColumns = [
        { key: 'timestamp', header: 'Time', width: '12%', sortable: true,
            render: (value) => (<div className="text-sm">
          <div className="text-white">{new Date(value).toLocaleDateString()}</div>
          <div className="text-dark-400">{new Date(value).toLocaleTimeString()}</div>
        </div>)
        },
        { key: 'username', header: 'User', width: '15%', sortable: true,
            render: (value, row) => (<div>
          <div className="text-white font-medium">{value}</div>
          <div className="text-dark-400 text-xs">{row.userRole}</div>
        </div>)
        },
        { key: 'action', header: 'Action', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(value)}`}>
          {value.toUpperCase()}
        </span>)
        },
        { key: 'resource', header: 'Resource', width: '12%' },
        { key: 'details', header: 'Details', width: '25%',
            render: (value) => (<div className="text-sm text-dark-300 truncate" title={value}>
          {value}
        </div>)
        },
        { key: 'success', header: 'Result', width: '8%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {value ? 'SUCCESS' : 'FAILED'}
        </span>)
        },
        { key: 'risk', header: 'Risk', width: '8%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(value)}`}>
          {value.toUpperCase()}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '10%',
            render: (value, row) => (<div className="flex space-x-1">
          <ui_1.Button variant="ghost" size="sm" onClick={() => setSelectedLog(row)}>
            Details
          </ui_1.Button>
        </div>)
        },
    ];
    const actionOptions = [
        { value: '', label: 'All Actions' },
        { value: 'LOGIN', label: 'Login' },
        { value: 'LOGOUT', label: 'Logout' },
        { value: 'CREATE', label: 'Create' },
        { value: 'UPDATE', label: 'Update' },
        { value: 'DELETE', label: 'Delete' },
        { value: 'EXPORT', label: 'Export' },
        { value: 'IMPORT', label: 'Import' },
    ];
    const riskOptions = [
        { value: '', label: 'All Risk Levels' },
        { value: 'low', label: 'Low Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'high', label: 'High Risk' },
        { value: 'critical', label: 'Critical Risk' },
    ];
    const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.username)))
        .map(username => ({ value: auditLogs.find(log => log.username === username)?.userId || '', label: username }));
    // Sample data
    const sampleAuditLogs = [
        {
            id: '1',
            timestamp: '2024-01-13T18:30:15Z',
            userId: '3',
            username: 'john.admin',
            userRole: 'Super Administrator',
            action: 'LOGIN',
            resource: 'System',
            resourceId: 'system',
            details: 'Successful administrator login from Ghana',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            risk: 'low',
        },
        {
            id: '2',
            timestamp: '2024-01-13T17:45:22Z',
            userId: '1',
            username: 'kwame.asante',
            userRole: 'Station Manager',
            action: 'UPDATE',
            resource: 'Station',
            resourceId: 'station-001',
            details: 'Updated fuel price for Premium Motor Spirit',
            ipAddress: '10.0.1.25',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            changes: {
                before: { price: 12.50 },
                after: { price: 13.20 }
            },
            risk: 'medium',
        },
        {
            id: '3',
            timestamp: '2024-01-13T16:20:10Z',
            userId: '2',
            username: 'sarah.mensah',
            userRole: 'Finance Manager',
            action: 'CREATE',
            resource: 'Journal Entry',
            resourceId: 'je-2024-001234',
            details: 'Created journal entry for daily sales reconciliation',
            ipAddress: '10.0.2.15',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            risk: 'low',
        },
        {
            id: '4',
            timestamp: '2024-01-13T15:12:33Z',
            userId: 'unknown',
            username: 'unknown.user',
            userRole: 'Unknown',
            action: 'LOGIN',
            resource: 'System',
            resourceId: 'system',
            details: 'Failed login attempt with invalid credentials',
            ipAddress: '185.220.100.240',
            userAgent: 'Python-requests/2.28.1',
            success: false,
            risk: 'high',
        },
        {
            id: '5',
            timestamp: '2024-01-13T14:30:45Z',
            userId: '3',
            username: 'john.admin',
            userRole: 'Super Administrator',
            action: 'DELETE',
            resource: 'User',
            resourceId: 'user-456',
            details: 'Deleted inactive user account: test.user@omc.com.gh',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            changes: {
                before: { status: 'inactive', lastLogin: null },
                after: null
            },
            risk: 'high',
        },
        {
            id: '6',
            timestamp: '2024-01-13T13:15:20Z',
            userId: '4',
            username: 'grace.owusu',
            userRole: 'Station Attendant',
            action: 'CREATE',
            resource: 'Transaction',
            resourceId: 'txn-789123',
            details: 'Processed fuel sale: 45.5L PMS for GHS 587.50',
            ipAddress: '10.0.1.30',
            userAgent: 'Mozilla/5.0 (Android 10; Mobile; rv:91.0)',
            success: true,
            risk: 'low',
        },
        {
            id: '7',
            timestamp: '2024-01-13T12:45:10Z',
            userId: '2',
            username: 'sarah.mensah',
            userRole: 'Finance Manager',
            action: 'EXPORT',
            resource: 'Financial Report',
            resourceId: 'report-monthly-2024-01',
            details: 'Exported monthly financial statements for January 2024',
            ipAddress: '10.0.2.15',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            risk: 'medium',
        },
        {
            id: '8',
            timestamp: '2024-01-13T11:20:15Z',
            userId: '3',
            username: 'john.admin',
            userRole: 'Super Administrator',
            action: 'UPDATE',
            resource: 'System Configuration',
            resourceId: 'config-backup',
            details: 'Updated automatic backup schedule to run daily at 2 AM',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            success: true,
            changes: {
                before: { schedule: 'weekly', time: '03:00' },
                after: { schedule: 'daily', time: '02:00' }
            },
            risk: 'critical',
        },
    ];
    const riskCounts = auditLogs.reduce((acc, log) => {
        acc[log.risk] = (acc[log.risk] || 0) + 1;
        return acc;
    }, {});
    const successRate = Math.round((auditLogs.filter(log => log.success).length / auditLogs.length) * 100);
    const todayLogs = auditLogs.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              System Audit Logs
            </h1>
            <p className="text-dark-400 mt-2">
              Monitor system activities and security events
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm" onClick={handleExportLogs}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Logs
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Live Monitoring
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Today's Activity</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{todayLogs}</p>
              <p className="text-sm text-green-400">+{Math.round(todayLogs * 0.15)} from yesterday</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">{successRate}%</p>
              <p className="text-sm text-dark-400">Successful operations</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">High Risk Events</h3>
              <p className="text-3xl font-bold text-red-400 mb-1">
                {(riskCounts.high || 0) + (riskCounts.critical || 0)}
              </p>
              <p className="text-sm text-dark-400">Require attention</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Failed Logins</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                {auditLogs.filter(log => log.action === 'LOGIN' && !log.success).length}
              </p>
              <p className="text-sm text-dark-400">Security alerts</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Filters and Search */}
        <ui_1.Card>
          <ui_1.CardHeader title="Filter Audit Logs"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <ui_1.Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
              </div>
              <ui_1.Select options={actionOptions} value={actionFilter} onChange={setActionFilter} placeholder="Filter by action"/>
              <ui_1.Select options={[{ value: '', label: 'All Users' }, ...uniqueUsers]} value={userFilter} onChange={setUserFilter} placeholder="Filter by user"/>
              <ui_1.Select options={riskOptions} value={riskFilter} onChange={setRiskFilter} placeholder="Filter by risk"/>
              <div className="flex space-x-2">
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500"/>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Audit Logs Table */}
        <ui_1.Card>
          <ui_1.CardHeader title={`Audit Logs (${filteredLogs.length})`}/>
          <ui_1.CardContent>
            <ui_1.Table data={filteredLogs} columns={auditColumns} loading={loading} pagination={{
            page: 1,
            limit: 50,
            total: filteredLogs.length,
            onPageChange: () => { },
            onLimitChange: () => { },
        }}/>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Log Detail Modal */}
        {selectedLog && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
            <framer_motion_1.motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-dark-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Audit Log Details</h3>
                <ui_1.Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </ui_1.Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-dark-400">Timestamp</label>
                    <p className="text-white font-medium">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400">Risk Level</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(selectedLog.risk)}`}>
                        {selectedLog.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400">User</label>
                    <p className="text-white font-medium">{selectedLog.username}</p>
                    <p className="text-dark-400 text-sm">{selectedLog.userRole}</p>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400">Action</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400">Resource</label>
                    <p className="text-white">{selectedLog.resource}</p>
                    <p className="text-dark-400 text-sm">{selectedLog.resourceId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-dark-400">IP Address</label>
                    <p className="text-white font-mono">{selectedLog.ipAddress}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-dark-400">Details</label>
                  <p className="text-white mt-1">{selectedLog.details}</p>
                </div>
                
                {selectedLog.changes && (<div>
                    <label className="text-sm text-dark-400">Changes Made</label>
                    <div className="mt-2 space-y-2">
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                        <p className="text-red-400 text-sm font-medium mb-1">Before:</p>
                        <pre className="text-white text-sm font-mono">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                        <p className="text-green-400 text-sm font-medium mb-1">After:</p>
                        <pre className="text-white text-sm font-mono">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>)}
                
                <div>
                  <label className="text-sm text-dark-400">User Agent</label>
                  <p className="text-white text-sm font-mono break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AuditLogs;
//# sourceMappingURL=audit-logs.js.map