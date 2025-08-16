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
const charts_1 = require("@/components/charts");
const RevenueRecognitionPage = () => {
    const [selectedContract, setSelectedContract] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)('contracts');
    // IFRS 15 Revenue Recognition Metrics
    const revenueMetrics = {
        totalContractValue: 847593248.75,
        recognizedRevenue: 623847593.25,
        deferredRevenue: 156482746.50,
        contractModifications: 23,
        performanceObligations: 156,
        completedContracts: 89,
        activeContracts: 67,
        averageContractValue: 12647593.25,
        revenueRecognitionRate: 97.8,
        automationSuccessRate: 98.9
    };
    // Contract Portfolio
    const contracts = [
        {
            id: 'IFRS-CONT-2025-001',
            customerName: 'Ghana National Petroleum Corporation',
            contractType: 'Bulk Fuel Supply',
            totalValue: 75847593.50,
            recognizedAmount: 45847593.25,
            deferredAmount: 30000000.25,
            performanceObligations: 5,
            satisfiedObligations: 3,
            recognitionMethod: 'Over Time',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Active',
            completionPercentage: 60.5,
            riskRating: 'Low'
        },
        {
            id: 'IFRS-CONT-2025-002',
            customerName: 'Tema Oil Refinery Limited',
            contractType: 'Refined Products Distribution',
            totalValue: 42593847.25,
            recognizedAmount: 42593847.25,
            deferredAmount: 0,
            performanceObligations: 3,
            satisfiedObligations: 3,
            recognitionMethod: 'Point in Time',
            startDate: '2024-12-15',
            endDate: '2025-01-15',
            status: 'Completed',
            completionPercentage: 100,
            riskRating: 'Low'
        },
        {
            id: 'IFRS-CONT-2025-003',
            customerName: 'National Electricity Corporation',
            contractType: 'Heavy Fuel Oil Supply',
            totalValue: 125847593.75,
            recognizedAmount: 25169518.75,
            deferredAmount: 100678075.00,
            performanceObligations: 12,
            satisfiedObligations: 2,
            recognitionMethod: 'Over Time',
            startDate: '2025-01-05',
            endDate: '2026-01-05',
            status: 'Active',
            completionPercentage: 20,
            riskRating: 'Medium'
        }
    ];
    // Performance Obligations Analysis
    const performanceObligations = [
        {
            id: 'PO-2025-001',
            contractId: 'IFRS-CONT-2025-001',
            description: 'Deliver 50,000 MT of Petrol RON 95',
            totalValue: 25000000.00,
            recognizedAmount: 15000000.00,
            satisfactionMethod: 'Output Method (Quantity Delivered)',
            percentComplete: 60,
            estimatedCompletion: '2025-06-30',
            riskFactors: ['Weather delays', 'Supply chain disruption'],
            status: 'In Progress'
        },
        {
            id: 'PO-2025-002',
            contractId: 'IFRS-CONT-2025-001',
            description: 'Provide storage and handling services',
            totalValue: 5000000.00,
            recognizedAmount: 2083333.33,
            satisfactionMethod: 'Input Method (Time Elapsed)',
            percentComplete: 41.7,
            estimatedCompletion: '2025-12-31',
            riskFactors: ['Equipment maintenance'],
            status: 'In Progress'
        },
        {
            id: 'PO-2025-003',
            contractId: 'IFRS-CONT-2025-002',
            description: 'Emergency fuel supply guarantee',
            totalValue: 2000000.00,
            recognizedAmount: 2000000.00,
            satisfactionMethod: 'Point in Time (Service Ready)',
            percentComplete: 100,
            estimatedCompletion: 'Completed',
            riskFactors: [],
            status: 'Completed'
        }
    ];
    // Transaction Price Allocation
    const transactionPriceData = {
        labels: ['Primary Delivery', 'Storage Services', 'Quality Assurance', 'Emergency Support', 'Technical Support'],
        datasets: [{
                data: [65, 15, 8, 7, 5],
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
    };
    // Revenue Recognition Timeline
    const revenueTimelineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Recognized Revenue (₵M)',
                data: [45.2, 52.8, 48.9, 65.3, 58.7, 72.1, 69.4, 75.8, 68.2, 82.5, 79.3, 88.6],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Deferred Revenue (₵M)',
                data: [120.5, 115.2, 118.8, 108.4, 112.6, 98.3, 103.7, 89.4, 95.8, 78.2, 82.9, 68.5],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    // Contract Performance Analysis
    const contractPerformanceData = {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
        datasets: [{
                label: 'Contract Completion Rate %',
                data: [92.5, 94.8, 96.2, 97.1, 97.8],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4
            }]
    };
    const formatCurrency = (amount) => {
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Pending':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'High':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="IFRS 15 Revenue Recognition" subtitle="Automated Revenue from Contracts with Customers - Ghana OMC">
      <div className="space-y-6">
        {/* IFRS 15 Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Contract Value
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(revenueMetrics.totalContractValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {revenueMetrics.activeContracts} Active Contracts
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Recognized Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenueMetrics.recognizedRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Recognition Rate: {revenueMetrics.revenueRecognitionRate}%
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Deferred Revenue
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(revenueMetrics.deferredRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Awaiting Performance Satisfaction
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Performance Obligations
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {revenueMetrics.performanceObligations}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Automation Rate: {revenueMetrics.automationSuccessRate}%
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('contracts')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contracts'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              Contract Management
            </button>
            <button onClick={() => setActiveTab('performance')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'performance'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              Performance Obligations
            </button>
            <button onClick={() => setActiveTab('allocation')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'allocation'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              Transaction Price Allocation
            </button>
            <button onClick={() => setActiveTab('timeline')} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'timeline'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              Revenue Timeline
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'contracts' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Contract Management */}
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Active Contracts Portfolio
                </h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    New Contract
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors">
                    Import Contracts
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contract ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Recognized</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Deferred</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Completion</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract, index) => (<framer_motion_1.motion.tr key={contract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                          {contract.id}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium">{contract.customerName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{contract.contractType}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {contract.contractType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(contract.totalValue)}</td>
                        <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(contract.recognizedAmount)}</td>
                        <td className="py-3 px-4 font-medium text-orange-600">{formatCurrency(contract.deferredAmount)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${contract.completionPercentage}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{contract.completionPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(contract.riskRating)}`}>
                            {contract.riskRating}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {activeTab === 'performance' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Performance Obligations */}
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Performance Obligations Management
                </h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Update Progress
                </button>
              </div>
              
              <div className="space-y-4">
                {performanceObligations.map((obligation, index) => (<framer_motion_1.motion.div key={obligation.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-blue-600">{obligation.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(obligation.status)}`}>
                            {obligation.status}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-2">{obligation.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                            <p className="font-medium">{formatCurrency(obligation.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Recognized</p>
                            <p className="font-medium text-green-600">{formatCurrency(obligation.recognizedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Method</p>
                            <p className="font-medium text-sm">{obligation.satisfactionMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                            <p className="font-medium">{obligation.percentComplete}%</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                          <div className="h-2 bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${obligation.percentComplete}%` }}></div>
                        </div>
                        {obligation.riskFactors.length > 0 && (<div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {obligation.riskFactors.map((risk, idx) => (<span key={idx} className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded-lg">
                                  {risk}
                                </span>))}
                            </div>
                          </div>)}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Est. Completion</p>
                        <p className="font-medium">{obligation.estimatedCompletion}</p>
                      </div>
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {activeTab === 'allocation' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Price Allocation */}
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                </svg>
                Transaction Price Allocation
              </h3>
              <charts_1.PieChart data={transactionPriceData} height={300}/>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Primary Delivery</span>
                  </div>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Storage Services</span>
                  </div>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Quality Assurance</span>
                  </div>
                  <span className="font-medium">8%</span>
                </div>
              </div>
            </Card_1.Card>

            {/* Contract Performance Analytics */}
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Performance Trends</h3>
              <charts_1.LineChart data={contractPerformanceData} height={300}/>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Quarter</div>
                  <div className="text-lg font-bold text-purple-600">97.8%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">YoY Growth</div>
                  <div className="text-lg font-bold text-green-600">+5.3%</div>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {activeTab === 'timeline' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Revenue Recognition Timeline */}
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4"/>
                </svg>
                Revenue Recognition Timeline
              </h3>
              <charts_1.LineChart data={revenueTimelineData} height={400}/>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">YTD Recognized</div>
                  <div className="text-lg font-bold text-blue-600">₵623.8M</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Deferred</div>
                  <div className="text-lg font-bold text-orange-600">₵156.5M</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Recognition Rate</div>
                  <div className="text-lg font-bold text-green-600">97.8%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projected Q2</div>
                  <div className="text-lg font-bold text-purple-600">₵185.3M</div>
                </div>
              </div>
            </Card_1.Card>

            {/* Automated Journal Entry Preview */}
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Automated Journal Entries Preview
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-mono space-y-1">
                  <div className="grid grid-cols-4 gap-4 font-bold border-b pb-2">
                    <span>Account</span>
                    <span>Description</span>
                    <span className="text-right">Debit</span>
                    <span className="text-right">Credit</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1">
                    <span>4100</span>
                    <span>Revenue Recognition - IFRS 15</span>
                    <span className="text-right">-</span>
                    <span className="text-right">₵2,500,000.00</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1">
                    <span>2400</span>
                    <span>Deferred Revenue Reduction</span>
                    <span className="text-right">₵2,500,000.00</span>
                    <span className="text-right">-</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 py-1 font-bold border-t pt-2">
                    <span>Total</span>
                    <span></span>
                    <span className="text-right">₵2,500,000.00</span>
                    <span className="text-right">₵2,500,000.00</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Auto-posting scheduled for: Tomorrow 06:00 GMT
                  </span>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                    Approve Auto-Posting
                  </button>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = RevenueRecognitionPage;
//# sourceMappingURL=revenue-recognition.js.map