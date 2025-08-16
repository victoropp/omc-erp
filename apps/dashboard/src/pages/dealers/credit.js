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
const DealerCreditManagement = () => {
    const [creditAssessments, setCreditAssessments] = (0, react_1.useState)([]);
    const [loanApplications, setLoanApplications] = (0, react_1.useState)([]);
    const [selectedAssessment, setSelectedAssessment] = (0, react_1.useState)(null);
    const [showAssessmentModal, setShowAssessmentModal] = (0, react_1.useState)(false);
    const [showLoanModal, setShowLoanModal] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterRisk, setFilterRisk] = (0, react_1.useState)('ALL');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('ALL');
    // Mock data - would come from API
    (0, react_1.useEffect)(() => {
        loadCreditData();
    }, []);
    const loadCreditData = async () => {
        setLoading(true);
        try {
            // Mock data
            const mockAssessments = [
                {
                    id: 'CA-001',
                    dealerId: 'DLR-001',
                    dealerName: 'Accra Central Fuel Station',
                    location: 'Accra, Greater Accra',
                    assessmentDate: '2025-01-10',
                    creditScore: 8.2,
                    creditLimit: 500000,
                    utilization: 65,
                    riskRating: 'LOW',
                    status: 'APPROVED',
                    monthlyTurnover: 1250000,
                    collateral: 800000,
                    guarantees: 200000,
                    paymentHistory: 'EXCELLENT',
                    daysOverdue: 0,
                    lastAssessment: '2024-10-10'
                },
                {
                    id: 'CA-002',
                    dealerId: 'DLR-002',
                    dealerName: 'Kumasi North Petroleum',
                    location: 'Kumasi, Ashanti',
                    assessmentDate: '2025-01-08',
                    creditScore: 7.1,
                    creditLimit: 350000,
                    utilization: 82,
                    riskRating: 'MEDIUM',
                    status: 'APPROVED',
                    monthlyTurnover: 980000,
                    collateral: 600000,
                    guarantees: 150000,
                    paymentHistory: 'GOOD',
                    daysOverdue: 5,
                    lastAssessment: '2024-09-15'
                },
                {
                    id: 'CA-003',
                    dealerId: 'DLR-003',
                    dealerName: 'Takoradi Port Fuel',
                    location: 'Takoradi, Western',
                    assessmentDate: '2025-01-05',
                    creditScore: 5.8,
                    creditLimit: 200000,
                    utilization: 95,
                    riskRating: 'HIGH',
                    status: 'REVIEW',
                    monthlyTurnover: 850000,
                    collateral: 400000,
                    guarantees: 100000,
                    paymentHistory: 'FAIR',
                    daysOverdue: 15,
                    lastAssessment: '2024-08-20'
                },
                {
                    id: 'CA-004',
                    dealerId: 'DLR-004',
                    dealerName: 'Cape Coast Energy Hub',
                    location: 'Cape Coast, Central',
                    assessmentDate: '2025-01-12',
                    creditScore: 4.2,
                    creditLimit: 100000,
                    utilization: 98,
                    riskRating: 'CRITICAL',
                    status: 'PENDING',
                    monthlyTurnover: 520000,
                    collateral: 250000,
                    guarantees: 50000,
                    paymentHistory: 'POOR',
                    daysOverdue: 45,
                    lastAssessment: '2024-07-10'
                }
            ];
            const mockLoanApplications = [
                {
                    id: 'LOAN-2025-001',
                    dealerId: 'DLR-001',
                    dealerName: 'Accra Central Fuel Station',
                    requestedAmount: 150000,
                    purpose: 'Equipment upgrade',
                    term: 24,
                    interestRate: 8.5,
                    status: 'APPROVED',
                    applicationDate: '2025-01-12',
                    reviewer: 'John Mensah',
                    documents: ['financial_statements.pdf', 'business_plan.pdf', 'collateral_valuation.pdf']
                },
                {
                    id: 'LOAN-2025-002',
                    dealerId: 'DLR-005',
                    dealerName: 'Ho Central Filling Station',
                    requestedAmount: 75000,
                    purpose: 'Working capital',
                    term: 12,
                    interestRate: 9.2,
                    status: 'PENDING',
                    applicationDate: '2025-01-11',
                    reviewer: 'Mary Asante',
                    documents: ['financial_statements.pdf', 'cash_flow.pdf']
                }
            ];
            setCreditAssessments(mockAssessments);
            setLoanApplications(mockLoanApplications);
            setLoading(false);
        }
        catch (error) {
            console.error('Error loading credit data:', error);
            react_hot_toast_1.toast.error('Failed to load credit assessment data');
            setLoading(false);
        }
    };
    const creditMetrics = {
        totalCreditLimit: creditAssessments.reduce((sum, assessment) => sum + assessment.creditLimit, 0),
        totalUtilization: creditAssessments.reduce((sum, assessment) => sum + (assessment.creditLimit * assessment.utilization / 100), 0),
        averageCreditScore: creditAssessments.reduce((sum, assessment) => sum + assessment.creditScore, 0) / creditAssessments.length,
        riskDistribution: {
            LOW: creditAssessments.filter(a => a.riskRating === 'LOW').length,
            MEDIUM: creditAssessments.filter(a => a.riskRating === 'MEDIUM').length,
            HIGH: creditAssessments.filter(a => a.riskRating === 'HIGH').length,
            CRITICAL: creditAssessments.filter(a => a.riskRating === 'CRITICAL').length
        },
        pendingApplications: loanApplications.filter(l => l.status === 'PENDING').length,
        approvedApplications: loanApplications.filter(l => l.status === 'APPROVED').length
    };
    const filteredAssessments = creditAssessments.filter(assessment => {
        const matchesSearch = assessment.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assessment.dealerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === 'ALL' || assessment.riskRating === filterRisk;
        const matchesStatus = filterStatus === 'ALL' || assessment.status === filterStatus;
        return matchesSearch && matchesRisk && matchesStatus;
    });
    const handleReassessCredit = async (assessmentId) => {
        try {
            // API call to reassess credit
            react_hot_toast_1.toast.success('Credit reassessment initiated');
            loadCreditData(); // Reload data
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to initiate credit reassessment');
        }
    };
    const handleApproveLoan = async (loanId) => {
        try {
            // API call to approve loan
            react_hot_toast_1.toast.success('Loan application approved');
            loadCreditData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to approve loan application');
        }
    };
    const handleRejectLoan = async (loanId) => {
        try {
            // API call to reject loan
            react_hot_toast_1.toast.success('Loan application rejected');
            loadCreditData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to reject loan application');
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'LOW': return 'text-green-600';
            case 'MEDIUM': return 'text-yellow-600';
            case 'HIGH': return 'text-orange-600';
            case 'CRITICAL': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            'APPROVED': 'success',
            'PENDING': 'warning',
            'REJECTED': 'danger',
            'REVIEW': 'secondary'
        };
        return <ui_1.Badge variant={variants[status]}>{status}</ui_1.Badge>;
    };
    // Chart data
    const riskDistributionData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
        datasets: [{
                data: [
                    creditMetrics.riskDistribution.LOW,
                    creditMetrics.riskDistribution.MEDIUM,
                    creditMetrics.riskDistribution.HIGH,
                    creditMetrics.riskDistribution.CRITICAL
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C2D12'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
    };
    const creditScoreData = {
        labels: creditAssessments.map(a => a.dealerName.substring(0, 10) + '...'),
        datasets: [{
                label: 'Credit Score',
                data: creditAssessments.map(a => a.creditScore),
                backgroundColor: '#3B82F6',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
    };
    const utilizationTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
                label: 'Credit Utilization %',
                data: [65, 68, 72, 69, 74, 71],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4
            }]
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Credit Assessment" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Credit Assessment & Management" subtitle="Comprehensive dealer credit evaluation and loan management system">
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credit Limit</p>
                  <p className="text-3xl font-bold text-blue-600">₵{(creditMetrics.totalCreditLimit / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-green-600 font-medium">+5.2% vs last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilization</p>
                  <p className="text-3xl font-bold text-green-600">₵{(creditMetrics.totalUtilization / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-orange-600 font-medium">{((creditMetrics.totalUtilization / creditMetrics.totalCreditLimit) * 100).toFixed(1)}% of limit</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Credit Score</p>
                  <p className="text-3xl font-bold text-purple-600">{creditMetrics.averageCreditScore.toFixed(1)}</p>
                  <p className="text-xs text-green-600 font-medium">+0.3 vs last quarter</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Apps</p>
                  <p className="text-3xl font-bold text-orange-600">{creditMetrics.pendingApplications}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{creditMetrics.approvedApplications} approved</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              <charts_1.PieChart data={riskDistributionData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Credit Scores by Dealer</h3>
              <charts_1.BarChart data={creditScoreData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Credit Utilization Trend</h3>
              <charts_1.LineChart data={utilizationTrendData} height={250}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Filters and Search */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input_1.Input placeholder="Search dealers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full"/>
              <Select_1.Select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} options={[
            { value: 'ALL', label: 'All Risk Levels' },
            { value: 'LOW', label: 'Low Risk' },
            { value: 'MEDIUM', label: 'Medium Risk' },
            { value: 'HIGH', label: 'High Risk' },
            { value: 'CRITICAL', label: 'Critical Risk' }
        ]}/>
              <Select_1.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'REVIEW', label: 'Under Review' },
            { value: 'REJECTED', label: 'Rejected' }
        ]}/>
              <Button_1.Button onClick={() => setShowAssessmentModal(true)} className="w-full">
                New Assessment
              </Button_1.Button>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Credit Assessments Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Credit Assessments</h3>
              <span className="text-sm text-gray-600">{filteredAssessments.length} assessments</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Credit Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Credit Limit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Utilization</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map((assessment, index) => (<framer_motion_1.motion.tr key={assessment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{assessment.dealerName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{assessment.dealerId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-bold text-lg">{assessment.creditScore}</span>
                          <span className="text-xs text-gray-600 ml-1">/10</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">₵{assessment.creditLimit.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{assessment.utilization}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full ml-2 overflow-hidden">
                            <div className={`h-full ${assessment.utilization > 90 ? 'bg-red-500' : assessment.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(assessment.utilization, 100)}%` }}/>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${getRiskColor(assessment.riskRating)}`}>
                          {assessment.riskRating}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(assessment.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button_1.Button size="sm" variant="outline" onClick={() => {
                setSelectedAssessment(assessment);
                setShowAssessmentModal(true);
            }}>
                            View
                          </Button_1.Button>
                          <Button_1.Button size="sm" onClick={() => handleReassessCredit(assessment.id)}>
                            Reassess
                          </Button_1.Button>
                        </div>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Loan Applications */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Loan Applications</h3>
              <Button_1.Button onClick={() => setShowLoanModal(true)}>Process New Loan</Button_1.Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Application ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Term</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loanApplications.map((loan, index) => (<framer_motion_1.motion.tr key={loan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4 font-medium">{loan.id}</td>
                      <td className="py-3 px-4">{loan.dealerName}</td>
                      <td className="py-3 px-4 font-bold">₵{loan.requestedAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">{loan.purpose}</td>
                      <td className="py-3 px-4">{loan.term} months</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="py-3 px-4">
                        {loan.status === 'PENDING' ? (<div className="flex space-x-2">
                            <Button_1.Button size="sm" onClick={() => handleApproveLoan(loan.id)}>
                              Approve
                            </Button_1.Button>
                            <Button_1.Button size="sm" variant="outline" onClick={() => handleRejectLoan(loan.id)}>
                              Reject
                            </Button_1.Button>
                          </div>) : (<Button_1.Button size="sm" variant="outline">View</Button_1.Button>)}
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Quick Actions */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button_1.Button className="flex flex-col items-center p-6 h-auto" onClick={() => setShowAssessmentModal(true)}>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>New Assessment</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <span>Credit Report</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span>Bulk Assessment</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Export Data</span>
              </Button_1.Button>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>

      {/* Assessment Modal */}
      <Modal_1.Modal isOpen={showAssessmentModal} onClose={() => {
            setShowAssessmentModal(false);
            setSelectedAssessment(null);
        }} title={selectedAssessment ? 'Credit Assessment Details' : 'New Credit Assessment'} size="large">
        <div className="space-y-4">
          {selectedAssessment ? (<div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dealer Name</label>
                <p className="text-lg font-semibold">{selectedAssessment.dealerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Score</label>
                <p className="text-2xl font-bold text-blue-600">{selectedAssessment.creditScore}/10</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Limit</label>
                <p className="text-lg">₵{selectedAssessment.creditLimit.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Utilization</label>
                <p className="text-lg">{selectedAssessment.utilization}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Turnover</label>
                <p className="text-lg">₵{selectedAssessment.monthlyTurnover.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Collateral Value</label>
                <p className="text-lg">₵{selectedAssessment.collateral.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment History</label>
                <ui_1.Badge variant={selectedAssessment.paymentHistory === 'EXCELLENT' ? 'success' : selectedAssessment.paymentHistory === 'GOOD' ? 'primary' : 'warning'}>
                  {selectedAssessment.paymentHistory}
                </ui_1.Badge>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days Overdue</label>
                <p className={`text-lg font-bold ${selectedAssessment.daysOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedAssessment.daysOverdue} days
                </p>
              </div>
            </div>) : (<div className="grid grid-cols-2 gap-4">
              <Select_1.Select label="Select Dealer" options={[
                { value: 'DLR-001', label: 'Accra Central Fuel Station' },
                { value: 'DLR-002', label: 'Kumasi North Petroleum' }
            ]}/>
              <Input_1.Input label="Assessment Date" type="date"/>
              <Input_1.Input label="Monthly Turnover" type="number" placeholder="1000000"/>
              <Input_1.Input label="Collateral Value" type="number" placeholder="500000"/>
              <Input_1.Input label="Guarantees" type="number" placeholder="100000"/>
              <Select_1.Select label="Payment History" options={[
                { value: 'EXCELLENT', label: 'Excellent' },
                { value: 'GOOD', label: 'Good' },
                { value: 'FAIR', label: 'Fair' },
                { value: 'POOR', label: 'Poor' }
            ]}/>
            </div>)}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button_1.Button variant="outline" onClick={() => {
            setShowAssessmentModal(false);
            setSelectedAssessment(null);
        }}>
              {selectedAssessment ? 'Close' : 'Cancel'}
            </Button_1.Button>
            {!selectedAssessment && (<Button_1.Button onClick={() => {
                react_hot_toast_1.toast.success('Credit assessment created successfully');
                setShowAssessmentModal(false);
                loadCreditData();
            }}>
                Create Assessment
              </Button_1.Button>)}
          </div>
        </div>
      </Modal_1.Modal>

      {/* Loan Processing Modal */}
      <Modal_1.Modal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} title="Process New Loan Application" size="large">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select_1.Select label="Select Dealer" options={[
            { value: 'DLR-001', label: 'Accra Central Fuel Station' },
            { value: 'DLR-002', label: 'Kumasi North Petroleum' }
        ]}/>
            <Input_1.Input label="Requested Amount" type="number" placeholder="150000"/>
            <Input_1.Input label="Purpose" placeholder="Equipment upgrade"/>
            <Input_1.Input label="Term (months)" type="number" placeholder="24"/>
            <Input_1.Input label="Interest Rate %" type="number" step="0.1" placeholder="8.5"/>
            <Input_1.Input label="Application Date" type="date"/>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button_1.Button variant="outline" onClick={() => setShowLoanModal(false)}>
              Cancel
            </Button_1.Button>
            <Button_1.Button onClick={() => {
            react_hot_toast_1.toast.success('Loan application processed successfully');
            setShowLoanModal(false);
            loadCreditData();
        }}>
              Process Application
            </Button_1.Button>
          </div>
        </div>
      </Modal_1.Modal>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DealerCreditManagement;
//# sourceMappingURL=credit.js.map