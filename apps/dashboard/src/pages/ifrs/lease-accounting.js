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
const react_hot_toast_1 = require("react-hot-toast");
const LeaseAccountingPage = () => {
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('2025-01');
    const [leaseContracts, setLeaseContracts] = (0, react_1.useState)([]);
    const [journalEntries, setJournalEntries] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)('overview');
    // Sample data - replace with actual API calls
    const sampleLeaseData = [
        {
            id: 'LEASE-001',
            lessorName: 'Ghana Properties Ltd',
            assetType: 'Office Building - Accra',
            contractStart: '2024-01-01',
            contractEnd: '2028-12-31',
            monthlyPayment: 45000,
            totalValue: 2700000,
            remainingPayments: 48,
            rightOfUseAsset: 2160000,
            leaseLIABILITY: 2160000,
            interestRate: 6.5,
            status: 'active',
            complianceStatus: 'compliant',
            classification: 'finance'
        },
        {
            id: 'LEASE-002',
            lessorName: 'Fleet Services Ghana',
            assetType: 'Delivery Trucks (10 units)',
            contractStart: '2024-06-01',
            contractEnd: '2027-05-31',
            monthlyPayment: 28000,
            totalValue: 1008000,
            remainingPayments: 29,
            rightOfUseAsset: 812000,
            leaseLIABILITY: 812000,
            interestRate: 5.8,
            status: 'active',
            complianceStatus: 'compliant',
            classification: 'finance'
        },
        {
            id: 'LEASE-003',
            lessorName: 'Tech Equipment Rentals',
            assetType: 'IT Equipment & Software',
            contractStart: '2024-03-15',
            contractEnd: '2025-03-14',
            monthlyPayment: 12000,
            totalValue: 144000,
            remainingPayments: 2,
            rightOfUseAsset: 24000,
            leaseLIABILITY: 24000,
            interestRate: 4.2,
            status: 'active',
            complianceStatus: 'under-review',
            classification: 'operating'
        }
    ];
    const sampleJournalEntries = [
        {
            id: 'JE-LEASE-001',
            leaseId: 'LEASE-001',
            date: '2025-01-01',
            type: 'monthly-payment',
            debitAccount: 'Lease Liability',
            creditAccount: 'Cash',
            amount: 45000,
            automated: true
        },
        {
            id: 'JE-LEASE-002',
            leaseId: 'LEASE-001',
            date: '2025-01-01',
            type: 'depreciation',
            debitAccount: 'Depreciation Expense',
            creditAccount: 'Accumulated Depreciation - ROU Asset',
            amount: 43200,
            automated: true
        },
        {
            id: 'JE-LEASE-003',
            leaseId: 'LEASE-001',
            date: '2025-01-01',
            type: 'interest',
            debitAccount: 'Interest Expense',
            creditAccount: 'Lease Liability',
            amount: 11700,
            automated: true
        }
    ];
    (0, react_1.useEffect)(() => {
        loadLeaseData();
    }, [selectedPeriod]);
    const loadLeaseData = async () => {
        try {
            setLoading(true);
            // Replace with actual API calls
            // const [contracts, entries] = await Promise.all([
            //   regulatoryService.get('/ifrs16/leases'),
            //   financialService.getJournalEntries({ type: 'lease', period: selectedPeriod })
            // ]);
            setLeaseContracts(sampleLeaseData);
            setJournalEntries(sampleJournalEntries);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load lease accounting data');
            console.error('Error loading lease data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Calculate metrics
    const totalRightOfUseAssets = leaseContracts.reduce((sum, lease) => sum + lease.rightOfUseAsset, 0);
    const totalLeaseLiabilities = leaseContracts.reduce((sum, lease) => sum + lease.leaseLIABILITY, 0);
    const monthlyLeaseExpense = leaseContracts.reduce((sum, lease) => sum + lease.monthlyPayment, 0);
    const complianceRate = (leaseContracts.filter(l => l.complianceStatus === 'compliant').length / leaseContracts.length) * 100;
    // Chart data
    const leaseValueByType = {
        labels: ['Finance Leases', 'Operating Leases'],
        datasets: [{
                data: [
                    leaseContracts.filter(l => l.classification === 'finance').reduce((sum, l) => sum + l.totalValue, 0),
                    leaseContracts.filter(l => l.classification === 'operating').reduce((sum, l) => sum + l.totalValue, 0)
                ],
                backgroundColor: ['#3B82F6', '#10B981']
            }]
    };
    const monthlyPaymentTrend = {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [{
                label: 'Monthly Lease Payments',
                data: [82000, 84000, 85000, 85000, 85000, 85000],
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
            case 'compliant':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'non-compliant':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'under-review':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const handleRecalculateLeases = async () => {
        try {
            // await regulatoryService.post('/ifrs16/recalculate');
            react_hot_toast_1.toast.success('Lease calculations updated successfully');
            loadLeaseData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to recalculate leases');
        }
    };
    const handleGenerateJournalEntries = async () => {
        try {
            // await financialService.post('/journal-entries/lease-automation');
            react_hot_toast_1.toast.success('Automated journal entries generated');
            loadLeaseData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to generate journal entries');
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="IFRS 16 Lease Accounting" subtitle="Comprehensive Lease Management & Compliance Automation">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              <option value="2025-01">January 2025</option>
              <option value="2024-12">December 2024</option>
              <option value="2024-11">November 2024</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                IFRS 16 Automation Active
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={handleRecalculateLeases} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Recalculate Leases
            </button>
            <button onClick={handleGenerateJournalEntries} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generate Journal Entries
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Right-of-Use Assets
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalRightOfUseAssets)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {leaseContracts.length} Active Leases
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lease Liabilities
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalLeaseLiabilities)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Current Period Obligation
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Expense
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(monthlyLeaseExpense)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Total Lease Payments
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    IFRS 16 Compliance
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {complianceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Automated Compliance Check
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
            { id: 'overview', label: 'Lease Overview' },
            { id: 'contracts', label: 'Active Contracts' },
            { id: 'journal', label: 'Journal Entries' },
            { id: 'analytics', label: 'Analytics' }
        ].map((tab) => (<button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'}`}>
                {tab.label}
              </button>))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Lease Classification Distribution"/>
                <charts_1.PieChart data={leaseValueByType} height={250}/>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Finance Leases</div>
                    <div className="text-lg font-bold text-blue-600">
                      {leaseContracts.filter(l => l.classification === 'finance').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Operating Leases</div>
                    <div className="text-lg font-bold text-green-600">
                      {leaseContracts.filter(l => l.classification === 'operating').length}
                    </div>
                  </div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Monthly Payment Trends"/>
                <charts_1.LineChart data={monthlyPaymentTrend} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Month</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(monthlyLeaseExpense)}
                  </div>
                  <div className="text-xs text-green-600">↗ +2.3% from last month</div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>
          </div>)}

        {selectedTab === 'contracts' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Active Lease Contracts"/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contract ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Lessor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Asset Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Classification</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Monthly Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">ROU Asset</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Lease Liability</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaseContracts.map((lease, index) => (<framer_motion_1.motion.tr key={lease.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600">{lease.id}</td>
                        <td className="py-3 px-4">{lease.lessorName}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={lease.assetType}>
                          {lease.assetType}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${lease.classification === 'finance'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            {lease.classification}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(lease.monthlyPayment)}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(lease.rightOfUseAsset)}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(lease.leaseLIABILITY)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.complianceStatus)}`}>
                            {lease.complianceStatus}
                          </span>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'journal' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Automated Journal Entries" action={<div className="text-sm">
                    <span className="text-green-600">
                      {journalEntries.filter(j => j.automated).length} Automated
                    </span>
                    {' / '}
                    <span className="text-gray-600">
                      {journalEntries.length} Total
                    </span>
                  </div>}/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Entry ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Debit Account</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Credit Account</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalEntries.map((entry, index) => (<framer_motion_1.motion.tr key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600">{entry.id}</td>
                        <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">{entry.debitAccount}</td>
                        <td className="py-3 px-4">{entry.creditAccount}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(entry.amount)}</td>
                        <td className="py-3 px-4">
                          {entry.automated ? (<span className="text-green-600 text-xs flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Automated
                            </span>) : (<span className="text-orange-600 text-xs">Manual</span>)}
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = LeaseAccountingPage;
//# sourceMappingURL=lease-accounting.js.map