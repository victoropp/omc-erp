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
const AssetImpairmentPage = () => {
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('2025-01');
    const [assetGroups, setAssetGroups] = (0, react_1.useState)([]);
    const [impairmentTests, setImpairmentTests] = (0, react_1.useState)([]);
    const [impairmentIndicators, setImpairmentIndicators] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)('overview');
    // Sample data - replace with actual API calls
    const sampleAssetData = [
        {
            id: 'AST-001',
            name: 'Accra Depot Property',
            assetType: 'property',
            carryingAmount: 15000000,
            fairValue: 18000000,
            valueInUse: 16500000,
            recoverableAmount: 18000000,
            impairmentLoss: 0,
            lastImpairmentTest: '2024-12-31',
            nextTestDue: '2025-12-31',
            impairmentIndicators: [],
            status: 'no-impairment',
            automaticTesting: true
        },
        {
            id: 'AST-002',
            name: 'Fuel Storage Equipment',
            assetType: 'equipment',
            carryingAmount: 8500000,
            fairValue: 7200000,
            valueInUse: 6800000,
            recoverableAmount: 7200000,
            impairmentLoss: 1300000,
            lastImpairmentTest: '2025-01-15',
            nextTestDue: '2025-06-15',
            impairmentIndicators: ['Regulatory changes affecting storage requirements'],
            status: 'impaired',
            automaticTesting: true
        },
        {
            id: 'AST-003',
            name: 'Brand & Trademark Assets',
            assetType: 'intangible',
            carryingAmount: 12000000,
            fairValue: 14500000,
            valueInUse: 13200000,
            recoverableAmount: 14500000,
            impairmentLoss: 0,
            lastImpairmentTest: '2024-12-31',
            nextTestDue: '2025-12-31',
            impairmentIndicators: [],
            status: 'no-impairment',
            automaticTesting: true
        },
        {
            id: 'AST-004',
            name: 'Distribution Network Goodwill',
            assetType: 'goodwill',
            carryingAmount: 25000000,
            fairValue: 22000000,
            valueInUse: 20000000,
            recoverableAmount: 22000000,
            impairmentLoss: 3000000,
            lastImpairmentTest: '2025-01-10',
            nextTestDue: '2025-01-10',
            impairmentIndicators: ['Increased competition', 'Market share decline'],
            status: 'requires-testing',
            automaticTesting: false
        }
    ];
    const sampleTestData = [
        {
            id: 'TEST-001',
            assetId: 'AST-002',
            testDate: '2025-01-15',
            testType: 'indicator-triggered',
            carryingAmount: 8500000,
            recoverableAmount: 7200000,
            impairmentLoss: 1300000,
            methodology: 'fair-value',
            assumptions: ['Market-based valuation', 'Current regulatory environment'],
            reviewer: 'CFO Office',
            status: 'completed',
            automated: true
        },
        {
            id: 'TEST-002',
            assetId: 'AST-004',
            testDate: '2025-01-10',
            testType: 'annual',
            carryingAmount: 25000000,
            recoverableAmount: 22000000,
            impairmentLoss: 3000000,
            methodology: 'value-in-use',
            assumptions: ['5-year DCF model', '8.5% discount rate', 'Conservative growth assumptions'],
            reviewer: 'External Auditor',
            status: 'pending-review',
            automated: false
        }
    ];
    const sampleIndicatorData = [
        {
            id: 'IND-001',
            type: 'external',
            category: 'Regulatory Changes',
            description: 'New EPA regulations affecting fuel storage tank specifications',
            severity: 'high',
            dateIdentified: '2025-01-08',
            affectedAssets: ['AST-002'],
            actionRequired: true,
            status: 'active'
        },
        {
            id: 'IND-002',
            type: 'external',
            category: 'Market Conditions',
            description: 'Increased competition from new market entrants',
            severity: 'medium',
            dateIdentified: '2024-12-15',
            affectedAssets: ['AST-004'],
            actionRequired: true,
            status: 'active'
        },
        {
            id: 'IND-003',
            type: 'internal',
            category: 'Asset Performance',
            description: 'Decline in regional market share affecting goodwill valuation',
            severity: 'high',
            dateIdentified: '2024-12-20',
            affectedAssets: ['AST-004'],
            actionRequired: true,
            status: 'monitoring'
        }
    ];
    (0, react_1.useEffect)(() => {
        loadImpairmentData();
    }, [selectedPeriod]);
    const loadImpairmentData = async () => {
        try {
            setLoading(true);
            // Replace with actual API calls
            // const [assets, tests, indicators] = await Promise.all([
            //   financialService.get('/fixed-assets/impairment'),
            //   regulatoryService.get('/ifrs/impairment-tests'),
            //   regulatoryService.get('/ifrs/impairment-indicators')
            // ]);
            setAssetGroups(sampleAssetData);
            setImpairmentTests(sampleTestData);
            setImpairmentIndicators(sampleIndicatorData);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load impairment data');
            console.error('Error loading impairment data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Calculate metrics
    const totalAssetValue = assetGroups.reduce((sum, asset) => sum + asset.carryingAmount, 0);
    const totalImpairmentLoss = assetGroups.reduce((sum, asset) => sum + asset.impairmentLoss, 0);
    const assetsRequiringTesting = assetGroups.filter(a => a.status === 'requires-testing').length;
    const activeIndicators = impairmentIndicators.filter(i => i.status === 'active').length;
    // Chart data
    const assetValueByType = {
        labels: ['Property', 'Equipment', 'Goodwill', 'Intangible', 'Investment'],
        datasets: [{
                data: [
                    assetGroups.filter(a => a.assetType === 'property').reduce((sum, a) => sum + a.carryingAmount, 0),
                    assetGroups.filter(a => a.assetType === 'equipment').reduce((sum, a) => sum + a.carryingAmount, 0),
                    assetGroups.filter(a => a.assetType === 'goodwill').reduce((sum, a) => sum + a.carryingAmount, 0),
                    assetGroups.filter(a => a.assetType === 'intangible').reduce((sum, a) => sum + a.carryingAmount, 0),
                    assetGroups.filter(a => a.assetType === 'investment').reduce((sum, a) => sum + a.carryingAmount, 0)
                ],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
            }]
    };
    const impairmentTrendData = {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
        datasets: [{
                label: 'Impairment Losses',
                data: [0, 500000, 1200000, 2800000, 4300000],
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
    };
    const formatCurrency = (amount) => {
        return `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'no-impairment':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'impaired':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'requires-testing':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'under-review':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const handleRunImpairmentTest = async (assetId) => {
        try {
            // await financialService.post(`/fixed-assets/${assetId}/impairment-test`);
            react_hot_toast_1.toast.success('Impairment test initiated');
            loadImpairmentData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to run impairment test');
        }
    };
    const handleReviewIndicators = async () => {
        try {
            // await regulatoryService.post('/ifrs/review-indicators');
            react_hot_toast_1.toast.success('Impairment indicators reviewed');
            loadImpairmentData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to review indicators');
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Asset Impairment Testing" subtitle="IAS 36 Compliance & Automated Impairment Analysis">
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
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activeIndicators} Active Indicators
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={handleReviewIndicators} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              Review Indicators
            </button>
            <button onClick={() => handleRunImpairmentTest('all')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Run All Tests
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
                    Total Asset Value
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalAssetValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {assetGroups.length} Asset Groups
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Impairment Losses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalImpairmentLoss)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-4-4"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Current Period Recognized
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Assets Requiring Testing
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {assetsRequiringTesting}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Immediate Action Required
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Indicators
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {activeIndicators}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Monitoring Required
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
            { id: 'overview', label: 'Asset Overview' },
            { id: 'assets', label: 'Asset Groups' },
            { id: 'tests', label: 'Impairment Tests' },
            { id: 'indicators', label: 'Indicators' }
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
                <Card_1.CardHeader title="Asset Value Distribution"/>
                <charts_1.PieChart data={assetValueByType} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Carrying Amount</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalAssetValue)}
                  </div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card_1.Card className="p-6">
                <Card_1.CardHeader title="Cumulative Impairment Losses"/>
                <charts_1.LineChart data={impairmentTrendData} height={250}/>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Period</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalImpairmentLoss)}
                  </div>
                  <div className="text-xs text-red-600">↗ +53% from previous period</div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>
          </div>)}

        {selectedTab === 'assets' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Asset Groups Impairment Analysis"/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Asset ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Asset Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Carrying Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Recoverable Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Impairment Loss</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Next Test</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetGroups.map((asset, index) => (<framer_motion_1.motion.tr key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600">{asset.id}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={asset.name}>
                          {asset.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {asset.assetType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(asset.carryingAmount)}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(asset.recoverableAmount)}</td>
                        <td className="py-3 px-4 font-medium">
                          <span className={asset.impairmentLoss > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(asset.impairmentLoss)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(asset.nextTestDue).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleRunImpairmentTest(asset.id)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={asset.status === 'under-review'}>
                            Run Test
                          </button>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'tests' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Recent Impairment Tests"/>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Test ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Asset</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Test Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Methodology</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Impairment Loss</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Automated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impairmentTests.map((test, index) => (<framer_motion_1.motion.tr key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium text-blue-600">{test.id}</td>
                        <td className="py-3 px-4">{test.assetId}</td>
                        <td className="py-3 px-4">{new Date(test.testDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {test.testType}
                          </span>
                        </td>
                        <td className="py-3 px-4">{test.methodology}</td>
                        <td className="py-3 px-4 font-medium">
                          <span className={test.impairmentLoss > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(test.impairmentLoss)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {test.automated ? (<span className="text-green-600 text-xs flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Auto
                            </span>) : (<span className="text-orange-600 text-xs">Manual</span>)}
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}

        {selectedTab === 'indicators' && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Impairment Indicators"/>
              <div className="space-y-4">
                {impairmentIndicators.map((indicator, index) => (<framer_motion_1.motion.div key={indicator.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(indicator.severity)}`}>
                          {indicator.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {indicator.type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(indicator.dateIdentified).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{indicator.category}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{indicator.description}</p>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Affected Assets: </span>
                          <span className="text-xs font-medium">{indicator.affectedAssets.join(', ')}</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(indicator.status)}`}>
                            {indicator.status}
                          </span>
                          {indicator.actionRequired && (<span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Action Required
                            </span>)}
                        </div>
                      </div>
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AssetImpairmentPage;
//# sourceMappingURL=asset-impairment.js.map