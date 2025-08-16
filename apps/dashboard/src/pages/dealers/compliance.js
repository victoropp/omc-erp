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
const ui_1 = require("@/components/ui");
const Modal_1 = require("@/components/ui/Modal");
const charts_1 = require("@/components/charts");
const react_hot_toast_1 = require("react-hot-toast");
const DealerCompliance = () => {
    const [complianceChecks, setComplianceChecks] = (0, react_1.useState)([]);
    const [regulatoryRequirements, setRegulatoryRequirements] = (0, react_1.useState)([]);
    const [complianceAlerts, setComplianceAlerts] = (0, react_1.useState)([]);
    const [selectedCheck, setSelectedCheck] = (0, react_1.useState)(null);
    const [showCheckModal, setShowCheckModal] = (0, react_1.useState)(false);
    const [showAlertModal, setShowAlertModal] = (0, react_1.useState)(false);
    const [showRequirementModal, setShowRequirementModal] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterType, setFilterType] = (0, react_1.useState)('ALL');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('ALL');
    const [selectedTab, setSelectedTab] = (0, react_1.useState)('checks');
    (0, react_1.useEffect)(() => {
        loadComplianceData();
    }, []);
    const loadComplianceData = async () => {
        setLoading(true);
        try {
            // Mock data - would come from API
            const mockChecks = [
                {
                    id: 'CHK-001',
                    dealerId: 'DLR-001',
                    dealerName: 'Accra Central Fuel Station',
                    location: 'Accra, Greater Accra',
                    checkType: 'MARGIN',
                    checkDate: '2025-01-10',
                    inspector: 'John Mensah',
                    status: 'COMPLIANT',
                    score: 95,
                    maxScore: 100,
                    findings: ['All margins within required thresholds', 'Proper price display compliance'],
                    recommendations: ['Continue current practices'],
                    dueDate: '2025-01-15',
                    completedDate: '2025-01-10',
                    nextCheckDate: '2025-02-10',
                    priority: 'LOW'
                },
                {
                    id: 'CHK-002',
                    dealerId: 'DLR-002',
                    dealerName: 'Kumasi North Petroleum',
                    location: 'Kumasi, Ashanti',
                    checkType: 'QUALITY',
                    checkDate: '2025-01-08',
                    inspector: 'Mary Asante',
                    status: 'NON_COMPLIANT',
                    score: 65,
                    maxScore: 100,
                    findings: ['Fuel density below standard', 'Storage tank maintenance required'],
                    recommendations: ['Immediate fuel quality testing', 'Schedule tank cleaning'],
                    dueDate: '2025-01-12',
                    nextCheckDate: '2025-01-20',
                    priority: 'HIGH'
                },
                {
                    id: 'CHK-003',
                    dealerId: 'DLR-003',
                    dealerName: 'Takoradi Port Fuel',
                    location: 'Takoradi, Western',
                    checkType: 'SAFETY',
                    checkDate: '2025-01-05',
                    inspector: 'Emmanuel Osei',
                    status: 'NEEDS_REVIEW',
                    score: 78,
                    maxScore: 100,
                    findings: ['Fire extinguisher maintenance overdue', 'Emergency exits partially blocked'],
                    recommendations: ['Service all fire equipment', 'Clear emergency routes'],
                    dueDate: '2025-01-10',
                    nextCheckDate: '2025-01-25',
                    priority: 'MEDIUM'
                }
            ];
            const mockRequirements = [
                {
                    id: 'REQ-001',
                    title: 'NPA Monthly Sales Report',
                    description: 'Monthly fuel sales volume and pricing report to National Petroleum Authority',
                    regulator: 'NPA',
                    category: 'REPORTING',
                    frequency: 'MONTHLY',
                    dueDate: '2025-02-05',
                    status: 'UPCOMING',
                    lastUpdated: '2025-01-05',
                    assignedTo: 'Finance Team'
                },
                {
                    id: 'REQ-002',
                    title: 'EPA Environmental Impact Assessment',
                    description: 'Annual environmental compliance assessment and waste management report',
                    regulator: 'EPA',
                    category: 'ENVIRONMENTAL',
                    frequency: 'ANNUALLY',
                    dueDate: '2025-03-15',
                    status: 'COMPLIANT',
                    lastUpdated: '2024-03-10',
                    assignedTo: 'Operations Team'
                },
                {
                    id: 'REQ-003',
                    title: 'GRA Tax Filing',
                    description: 'Quarterly VAT and corporate tax returns filing',
                    regulator: 'GRA',
                    category: 'FINANCIAL',
                    frequency: 'QUARTERLY',
                    dueDate: '2025-01-20',
                    status: 'OVERDUE',
                    lastUpdated: '2025-01-01',
                    assignedTo: 'Accounting Team'
                }
            ];
            const mockAlerts = [
                {
                    id: 'ALERT-001',
                    dealerId: 'DLR-002',
                    dealerName: 'Kumasi North Petroleum',
                    alertType: 'QUALITY_ISSUE',
                    severity: 'HIGH',
                    message: 'Fuel quality test results below acceptable standards',
                    createdDate: '2025-01-12',
                    status: 'ACTIVE',
                    actions: ['Stop fuel sales', 'Contact supplier', 'Schedule retesting']
                },
                {
                    id: 'ALERT-002',
                    dealerId: 'DLR-004',
                    dealerName: 'Cape Coast Energy Hub',
                    alertType: 'EXPIRED_LICENSE',
                    severity: 'CRITICAL',
                    message: 'NPA operating license expires in 5 days',
                    createdDate: '2025-01-10',
                    status: 'ACKNOWLEDGED',
                    actions: ['Submit renewal application', 'Pay renewal fees', 'Schedule inspection']
                },
                {
                    id: 'ALERT-003',
                    dealerId: 'DLR-001',
                    dealerName: 'Accra Central Fuel Station',
                    alertType: 'MARGIN_BREACH',
                    severity: 'MEDIUM',
                    message: 'Pricing margin exceeded threshold for diesel',
                    createdDate: '2025-01-08',
                    status: 'RESOLVED',
                    resolvedDate: '2025-01-09',
                    resolvedBy: 'Station Manager',
                    actions: ['Adjust pricing', 'Update POS systems', 'Staff training']
                }
            ];
            setComplianceChecks(mockChecks);
            setRegulatoryRequirements(mockRequirements);
            setComplianceAlerts(mockAlerts);
            setLoading(false);
        }
        catch (error) {
            console.error('Error loading compliance data:', error);
            react_hot_toast_1.toast.error('Failed to load compliance data');
            setLoading(false);
        }
    };
    const complianceMetrics = {
        overallComplianceRate: (complianceChecks.filter(c => c.status === 'COMPLIANT').length / complianceChecks.length) * 100,
        activeAlerts: complianceAlerts.filter(a => a.status === 'ACTIVE').length,
        criticalAlerts: complianceAlerts.filter(a => a.severity === 'CRITICAL').length,
        overdueRequirements: regulatoryRequirements.filter(r => r.status === 'OVERDUE').length,
        upcomingRequirements: regulatoryRequirements.filter(r => r.status === 'UPCOMING').length,
        averageComplianceScore: complianceChecks.reduce((sum, check) => sum + (check.score / check.maxScore) * 100, 0) / complianceChecks.length
    };
    const filteredChecks = complianceChecks.filter(check => {
        const matchesSearch = check.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            check.dealerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || check.checkType === filterType;
        const matchesStatus = filterStatus === 'ALL' || check.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });
    const handleScheduleCheck = async () => {
        try {
            // API call to schedule compliance check
            react_hot_toast_1.toast.success('Compliance check scheduled successfully');
            setShowCheckModal(false);
            loadComplianceData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to schedule compliance check');
        }
    };
    const handleResolveAlert = async (alertId) => {
        try {
            // API call to resolve alert
            react_hot_toast_1.toast.success('Alert resolved successfully');
            loadComplianceData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to resolve alert');
        }
    };
    const handleAcknowledgeAlert = async (alertId) => {
        try {
            // API call to acknowledge alert
            react_hot_toast_1.toast.success('Alert acknowledged');
            loadComplianceData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to acknowledge alert');
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            'COMPLIANT': 'success',
            'NON_COMPLIANT': 'danger',
            'PENDING': 'warning',
            'NEEDS_REVIEW': 'secondary',
            'UPCOMING': 'primary',
            'OVERDUE': 'danger',
            'NOT_APPLICABLE': 'outline'
        };
        return <ui_1.Badge variant={variants[status]}>{status.replace('_', ' ')}</ui_1.Badge>;
    };
    const getSeverityBadge = (severity) => {
        const variants = {
            'LOW': 'success',
            'MEDIUM': 'warning',
            'HIGH': 'danger',
            'CRITICAL': 'danger'
        };
        return <ui_1.Badge variant={variants[severity]}>{severity}</ui_1.Badge>;
    };
    const getAlertStatusBadge = (status) => {
        const variants = {
            'ACTIVE': 'danger',
            'ACKNOWLEDGED': 'warning',
            'RESOLVED': 'success'
        };
        return <ui_1.Badge variant={variants[status]}>{status}</ui_1.Badge>;
    };
    // Chart data
    const complianceStatusData = {
        labels: ['Compliant', 'Non-Compliant', 'Pending Review', 'Needs Review'],
        datasets: [{
                data: [
                    complianceChecks.filter(c => c.status === 'COMPLIANT').length,
                    complianceChecks.filter(c => c.status === 'NON_COMPLIANT').length,
                    complianceChecks.filter(c => c.status === 'PENDING').length,
                    complianceChecks.filter(c => c.status === 'NEEDS_REVIEW').length
                ],
                backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6B7280'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
    };
    const complianceTypeData = {
        labels: ['Margin', 'Quality', 'Safety', 'Environmental', 'Financial', 'Operational'],
        datasets: [{
                label: 'Compliance Score %',
                data: [95, 78, 82, 88, 92, 85],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280']
            }]
    };
    const complianceTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
                label: 'Overall Compliance Rate %',
                data: [88, 91, 89, 93, 90, 92],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Dealer Compliance" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Compliance Monitoring Dashboard" subtitle="Comprehensive dealer compliance tracking and regulatory management system">
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Compliance</p>
                  <p className="text-3xl font-bold text-green-600">{complianceMetrics.overallComplianceRate.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 font-medium">+2.1% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{complianceMetrics.activeAlerts}</p>
                  <p className="text-xs text-red-600 font-medium">{complianceMetrics.criticalAlerts} critical</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Items</p>
                  <p className="text-3xl font-bold text-orange-600">{complianceMetrics.overdueRequirements}</p>
                  <p className="text-xs text-orange-600 font-medium">require immediate attention</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-600">{complianceMetrics.upcomingRequirements}</p>
                  <p className="text-xs text-blue-600 font-medium">in next 30 days</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</p>
                  <p className="text-3xl font-bold text-purple-600">{complianceMetrics.averageComplianceScore.toFixed(0)}%</p>
                  <p className="text-xs text-purple-600 font-medium">across all checks</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compliance Status Distribution</h3>
              <charts_1.PieChart data={complianceStatusData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compliance by Type</h3>
              <charts_1.BarChart data={complianceTypeData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
              <charts_1.LineChart data={complianceTrendData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Active Alerts Section */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Compliance Alerts</h3>
              <Button_1.Button onClick={() => setShowAlertModal(true)}>Create Alert</Button_1.Button>
            </div>
            <div className="space-y-4">
              {complianceAlerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').map((alert, index) => (<framer_motion_1.motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + index * 0.1 }} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'CRITICAL' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityBadge(alert.severity)}
                        {getAlertStatusBadge(alert.status)}
                        <span className="text-sm text-gray-600">{alert.dealerName}</span>
                      </div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600 mt-1">Created: {new Date(alert.createdDate).toLocaleString()}</p>
                      {alert.actions.length > 0 && (<div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Required Actions:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {alert.actions.map((action, idx) => (<li key={idx}>{action}</li>))}
                          </ul>
                        </div>)}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {alert.status === 'ACTIVE' && (<Button_1.Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button_1.Button>)}
                      <Button_1.Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                        {alert.status === 'ACKNOWLEDGED' ? 'Resolve' : 'Mark Resolved'}
                      </Button_1.Button>
                    </div>
                  </div>
                </framer_motion_1.motion.div>))}
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Tab Navigation */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card_1.Card className="p-6">
            <div className="flex space-x-4 border-b mb-4">
              <button className={`pb-2 px-1 font-medium ${selectedTab === 'checks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} onClick={() => setSelectedTab('checks')}>
                Compliance Checks
              </button>
              <button className={`pb-2 px-1 font-medium ${selectedTab === 'requirements' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} onClick={() => setSelectedTab('requirements')}>
                Regulatory Requirements
              </button>
              <button className={`pb-2 px-1 font-medium ${selectedTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`} onClick={() => setSelectedTab('alerts')}>
                Alert History
              </button>
            </div>

            {selectedTab === 'checks' && (<div>
                {/* Filters and Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Input_1.Input placeholder="Search compliance checks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full"/>
                  <Select_1.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'MARGIN', label: 'Margin Compliance' },
                { value: 'QUALITY', label: 'Quality Control' },
                { value: 'SAFETY', label: 'Safety Standards' },
                { value: 'ENVIRONMENTAL', label: 'Environmental' },
                { value: 'FINANCIAL', label: 'Financial' },
                { value: 'OPERATIONAL', label: 'Operational' }
            ]}/>
                  <Select_1.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'COMPLIANT', label: 'Compliant' },
                { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'NEEDS_REVIEW', label: 'Needs Review' }
            ]}/>
                  <Button_1.Button onClick={() => setShowCheckModal(true)}>
                    Schedule Check
                  </Button_1.Button>
                </div>

                {/* Compliance Checks Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Check ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Inspector</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Check</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChecks.map((check, index) => (<framer_motion_1.motion.tr key={check.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-3 px-4 font-medium">{check.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{check.dealerName}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{check.location}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <ui_1.Badge variant="outline">{check.checkType.replace('_', ' ')}</ui_1.Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="font-bold text-lg">{check.score}</span>
                              <span className="text-sm text-gray-600">/{check.maxScore}</span>
                              <div className={`w-2 h-2 rounded-full ml-2 ${check.score >= 90 ? 'bg-green-500' :
                    check.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}/>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(check.status)}
                          </td>
                          <td className="py-3 px-4 text-sm">{check.inspector}</td>
                          <td className="py-3 px-4 text-sm">{new Date(check.nextCheckDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button_1.Button size="sm" variant="outline" onClick={() => {
                    setSelectedCheck(check);
                    setShowCheckModal(true);
                }}>
                                View
                              </Button_1.Button>
                              {check.status === 'PENDING' && (<Button_1.Button size="sm">Complete</Button_1.Button>)}
                            </div>
                          </td>
                        </framer_motion_1.motion.tr>))}
                    </tbody>
                  </table>
                </div>
              </div>)}

            {selectedTab === 'requirements' && (<div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Regulatory Requirements</h3>
                  <Button_1.Button onClick={() => setShowRequirementModal(true)}>Add Requirement</Button_1.Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Regulator</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Frequency</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Assigned To</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regulatoryRequirements.map((requirement, index) => (<tr key={requirement.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{requirement.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{requirement.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <ui_1.Badge variant="outline">{requirement.regulator}</ui_1.Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{requirement.category.replace('_', ' ')}</td>
                          <td className="py-3 px-4 text-sm">{requirement.frequency}</td>
                          <td className="py-3 px-4 text-sm">{new Date(requirement.dueDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {getStatusBadge(requirement.status)}
                          </td>
                          <td className="py-3 px-4 text-sm">{requirement.assignedTo}</td>
                          <td className="py-3 px-4">
                            <Button_1.Button size="sm" variant="outline">Update</Button_1.Button>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>)}

            {selectedTab === 'alerts' && (<div>
                <div className="space-y-4">
                  {complianceAlerts.map((alert, index) => (<div key={alert.id} className={`p-4 rounded-lg border ${alert.status === 'RESOLVED' ? 'border-gray-200 bg-gray-50 dark:bg-gray-800' :
                    alert.severity === 'CRITICAL' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        alert.severity === 'HIGH' ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' :
                            alert.severity === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                                'border-blue-200 bg-blue-50 dark:bg-blue-900/20'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getSeverityBadge(alert.severity)}
                            {getAlertStatusBadge(alert.status)}
                            <span className="text-sm font-medium">{alert.dealerName}</span>
                          </div>
                          <p className="font-medium mb-1">{alert.message}</p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(alert.createdDate).toLocaleString()}
                            {alert.resolvedDate && (<span> | Resolved: {new Date(alert.resolvedDate).toLocaleString()} by {alert.resolvedBy}</span>)}
                          </p>
                        </div>
                        <ui_1.Badge variant={alert.alertType.includes('CRITICAL') || alert.alertType.includes('EXPIRED') ? 'danger' : 'warning'}>
                          {alert.alertType.replace('_', ' ')}
                        </ui_1.Badge>
                      </div>
                    </div>))}
                </div>
              </div>)}
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Quick Actions */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button_1.Button className="flex flex-col items-center p-6 h-auto" onClick={() => setShowCheckModal(true)}>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Schedule Check</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <span>Create Alert</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Generate Report</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>Configure Rules</span>
              </Button_1.Button>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>

      {/* Compliance Check Modal */}
      <Modal_1.Modal isOpen={showCheckModal} onClose={() => {
            setShowCheckModal(false);
            setSelectedCheck(null);
        }} title={selectedCheck ? 'Compliance Check Details' : 'Schedule Compliance Check'} size="large">
        <div className="space-y-4">
          {selectedCheck ? (<div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check ID</label>
                <p className="font-medium">{selectedCheck.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dealer</label>
                <p className="font-semibold">{selectedCheck.dealerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check Type</label>
                <ui_1.Badge variant="outline">{selectedCheck.checkType.replace('_', ' ')}</ui_1.Badge>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                {getStatusBadge(selectedCheck.status)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <p className="text-2xl font-bold text-blue-600">{selectedCheck.score}/{selectedCheck.maxScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Inspector</label>
                <p>{selectedCheck.inspector}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check Date</label>
                <p>{new Date(selectedCheck.checkDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Next Check</label>
                <p>{new Date(selectedCheck.nextCheckDate).toLocaleDateString()}</p>
              </div>
              
              {selectedCheck.findings.length > 0 && (<div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Findings</label>
                  <ul className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded list-disc list-inside space-y-1">
                    {selectedCheck.findings.map((finding, idx) => (<li key={idx}>{finding}</li>))}
                  </ul>
                </div>)}
              
              {selectedCheck.recommendations.length > 0 && (<div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Recommendations</label>
                  <ul className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded list-disc list-inside space-y-1">
                    {selectedCheck.recommendations.map((rec, idx) => (<li key={idx}>{rec}</li>))}
                  </ul>
                </div>)}
            </div>) : (<div className="grid grid-cols-2 gap-4">
              <Select_1.Select label="Select Dealer" options={[
                { value: 'DLR-001', label: 'Accra Central Fuel Station' },
                { value: 'DLR-002', label: 'Kumasi North Petroleum' }
            ]}/>
              <Select_1.Select label="Check Type" options={[
                { value: 'MARGIN', label: 'Margin Compliance' },
                { value: 'QUALITY', label: 'Quality Control' },
                { value: 'SAFETY', label: 'Safety Standards' },
                { value: 'ENVIRONMENTAL', label: 'Environmental' },
                { value: 'FINANCIAL', label: 'Financial' },
                { value: 'OPERATIONAL', label: 'Operational' }
            ]}/>
              <Input_1.Input label="Scheduled Date" type="date"/>
              <Select_1.Select label="Inspector" options={[
                { value: 'john_mensah', label: 'John Mensah' },
                { value: 'mary_asante', label: 'Mary Asante' },
                { value: 'emmanuel_osei', label: 'Emmanuel Osei' }
            ]}/>
              <Select_1.Select label="Priority" options={[
                { value: 'LOW', label: 'Low Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'CRITICAL', label: 'Critical Priority' }
            ]}/>
              <Input_1.Input label="Due Date" type="date"/>
            </div>)}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button_1.Button variant="outline" onClick={() => {
            setShowCheckModal(false);
            setSelectedCheck(null);
        }}>
              {selectedCheck ? 'Close' : 'Cancel'}
            </Button_1.Button>
            {!selectedCheck && (<Button_1.Button onClick={handleScheduleCheck}>
                Schedule Check
              </Button_1.Button>)}
          </div>
        </div>
      </Modal_1.Modal>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DealerCompliance;
//# sourceMappingURL=compliance.js.map