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
const charts_1 = require("@/components/charts");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const DealersDashboard = () => {
    const [dealerMetrics, setDealerMetrics] = (0, react_1.useState)(null);
    const [topPerformingDealers, setTopPerformingDealers] = (0, react_1.useState)([]);
    const [recentLoanActivities, setRecentLoanActivities] = (0, react_1.useState)([]);
    const [dealerPerformanceData, setDealerPerformanceData] = (0, react_1.useState)(null);
    const [loanStatusData, setLoanStatusData] = (0, react_1.useState)(null);
    const [marginComplianceData, setMarginComplianceData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadDealerData();
    }, []);
    const loadDealerData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Load dealer data from multiple endpoints
            const [dealers, performance, loans, compliance] = await Promise.all([
                api_1.dealerService.getDealers(),
                api_1.dealerService.getDealerPerformance(),
                api_1.dealerService.getDealerLoans(),
                api_1.dealerService.getDealerCompliance()
            ]);
            // Process the data to create metrics
            const processedMetrics = processDealerMetrics(dealers, loans, compliance);
            setDealerMetrics(processedMetrics);
            // Process performance data
            setTopPerformingDealers(performance.slice(0, 5));
            // Process loan activities
            setRecentLoanActivities(loans.slice(0, 5));
            // Process chart data
            const chartData = processChartData(dealers, loans, compliance);
            setDealerPerformanceData(chartData.performance);
            setLoanStatusData(chartData.loanStatus);
            setMarginComplianceData(chartData.marginCompliance);
            react_hot_toast_1.toast.success('Dealer data loaded successfully');
        }
        catch (error) {
            console.error('Error loading dealer data:', error);
            setError('Failed to load dealer data');
            react_hot_toast_1.toast.error('Failed to load dealer data');
            // Fallback to sample data
            loadSampleData();
        }
        finally {
            setLoading(false);
        }
    };
    const processDealerMetrics = (dealers, loans, compliance) => {
        const totalActiveDealers = dealers.filter(d => d.status === 'active').length;
        const pendingOnboarding = dealers.filter(d => d.status === 'pending').length;
        const totalLoans = loans.length;
        const overdueLoans = loans.filter(l => l.status === 'overdue').length;
        const totalLoanAmount = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
        const outstandingAmount = loans.filter(l => l.status !== 'settled').reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
        const complianceRate = compliance.length > 0 ? (compliance.filter(c => c.isCompliant).length / compliance.length) * 100 : 0;
        return {
            totalActiveDealers,
            pendingOnboarding,
            totalLoans,
            overdueLoans,
            totalLoanAmount,
            outstandingAmount,
            averageMargin: 12.5, // This would be calculated from actual margin data
            complianceRate,
            monthlyTurnover: 12850000, // This would come from actual transaction data
            monthlyGrowth: 8.3 // This would be calculated from historical data
        };
    };
    const processChartData = (dealers, loans, compliance) => {
        // Performance trend data
        const performanceData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Active Dealers',
                    data: [38, 42, 45, 44, 46, 45], // This would come from historical data
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Compliant Dealers',
                    data: [35, 39, 42, 41, 43, 42], // This would come from historical compliance data
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }
            ]
        };
        // Loan status distribution
        const currentLoans = loans.filter(l => l.status === 'current').length;
        const overdue1to30 = loans.filter(l => l.status === 'overdue' && l.daysOverdue <= 30).length;
        const overdue31to90 = loans.filter(l => l.status === 'overdue' && l.daysOverdue > 30 && l.daysOverdue <= 90).length;
        const defaulted = loans.filter(l => l.status === 'overdue' && l.daysOverdue > 90).length;
        const loanStatusData = {
            labels: ['Current', 'Overdue (1-30 days)', 'Overdue (31-90 days)', 'Defaulted (>90 days)'],
            datasets: [{
                    data: [currentLoans, overdue1to30, overdue31to90, defaulted],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C2D12'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
        };
        // Margin compliance data
        const marginComplianceData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                    label: 'Compliance Rate %',
                    data: [91.2, 92.8, 94.5, 93.1, 94.8, 94.2], // This would come from historical compliance data
                    backgroundColor: '#8B5CF6',
                    borderColor: '#8B5CF6',
                    borderWidth: 1
                }]
        };
        return {
            performance: performanceData,
            loanStatus: loanStatusData,
            marginCompliance: marginComplianceData
        };
    };
    const loadSampleData = () => {
        // Fallback sample data
        setDealerMetrics({
            totalActiveDealers: 45,
            pendingOnboarding: 7,
            totalLoans: 28,
            overdueLoans: 4,
            totalLoanAmount: 5450000,
            outstandingAmount: 3250000,
            averageMargin: 12.5,
            complianceRate: 94.2,
            monthlyTurnover: 12850000,
            monthlyGrowth: 8.3,
        });
        setTopPerformingDealers([
            {
                id: 'DLR-001',
                name: 'Accra Central Fuel Station',
                location: 'Accra, Greater Accra',
                monthlyVolume: 450000,
                revenue: 1250000,
                marginCompliance: 98.5,
                loanStatus: 'current',
                rating: 'A+'
            },
            {
                id: 'DLR-002',
                name: 'Kumasi North Petroleum',
                location: 'Kumasi, Ashanti',
                monthlyVolume: 380000,
                revenue: 980000,
                marginCompliance: 95.2,
                loanStatus: 'current',
                rating: 'A'
            }
        ]);
        setRecentLoanActivities([
            {
                id: 'LOAN-2025-012',
                dealerName: 'Cape Coast Energy Hub',
                type: 'disbursement',
                amount: 150000,
                date: '2025-01-12',
                status: 'approved'
            },
            {
                id: 'LOAN-2025-011',
                dealerName: 'Ho Central Filling Station',
                type: 'repayment',
                amount: 25000,
                date: '2025-01-11',
                status: 'completed'
            }
        ]);
        // Set chart data
        const chartData = processChartData([], [], []);
        setDealerPerformanceData(chartData.performance);
        setLoanStatusData(chartData.loanStatus);
        setMarginComplianceData(chartData.marginCompliance);
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Dealer Management Dashboard" subtitle="Comprehensive dealer performance, loans, and compliance monitoring">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    if (error && !dealerMetrics) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Dealer Management Dashboard" subtitle="Comprehensive dealer performance, loans, and compliance monitoring">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={loadDealerData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Dealer Management Dashboard" subtitle="Comprehensive dealer performance, loans, and compliance monitoring">
      <div className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Dealers</p>
                  <p className="text-3xl font-bold text-blue-600">{dealerMetrics?.totalActiveDealers || 0}</p>
                  <p className="text-xs text-green-600 font-medium">+3 this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Loans</p>
                  <p className="text-3xl font-bold text-green-600">{dealerMetrics?.totalLoans || 0}</p>
                  <p className="text-xs text-red-600 font-medium">{dealerMetrics?.overdueLoans || 0} overdue</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                  <p className="text-3xl font-bold text-orange-600">₵{((dealerMetrics?.outstandingAmount || 0) / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">of ₵{((dealerMetrics?.totalLoanAmount || 0) / 1000000).toFixed(1)}M total</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Margin</p>
                  <p className="text-3xl font-bold text-purple-600">{dealerMetrics?.averageMargin?.toFixed(1) || '0'}%</p>
                  <p className="text-xs text-green-600 font-medium">+0.3% vs target</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance</p>
                  <p className="text-3xl font-bold text-emerald-600">{dealerMetrics?.complianceRate?.toFixed(1) || '0'}%</p>
                  <p className="text-xs text-emerald-600 font-medium">UPPF compliant</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dealer Performance Trend</h3>
                <div className="flex space-x-2">
                  <Button_1.Button variant="outline" size="sm">6M</Button_1.Button>
                  <Button_1.Button variant="outline" size="sm">1Y</Button_1.Button>
                </div>
              </div>
              <charts_1.LineChart data={dealerPerformanceData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Loan Status Distribution</h3>
              <charts_1.PieChart data={loanStatusData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Margin Compliance Rate</h3>
              <charts_1.BarChart data={marginComplianceData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Loan Activities</h3>
              <div className="space-y-4">
                {recentLoanActivities.map((activity, index) => (<framer_motion_1.motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + index * 0.1 }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.dealerName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₵{activity.amount.toLocaleString()}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                activity.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {activity.status}
                      </span>
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Top Performing Dealers Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card_1.Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Performing Dealers</h3>
              <Button_1.Button variant="outline" size="sm">View All</Button_1.Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Monthly Volume (L)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Margin Compliance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Loan Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformingDealers.map((dealer, index) => (<framer_motion_1.motion.tr key={dealer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{dealer.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{dealer.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{dealer.location}</td>
                      <td className="py-3 px-4 font-medium">{dealer.monthlyVolume.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold">₵{dealer.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium">{dealer.marginCompliance}%</span>
                          <div className={`w-2 h-2 rounded-full ml-2 ${dealer.marginCompliance >= 95 ? 'bg-green-500' :
                dealer.marginCompliance >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}/>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${dealer.loanStatus === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {dealer.loanStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${dealer.rating.startsWith('A') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {dealer.rating}
                        </span>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Quick Actions */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button_1.Button className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                <span>Onboard New Dealer</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span>Process Loan</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto" onClick={() => window.location.href = '/dealers/margin-dashboard'}>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>Margin Dashboard</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span>Run Compliance Check</span>
              </Button_1.Button>
              <Button_1.Button variant="outline" className="flex flex-col items-center p-6 h-auto">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Generate Report</span>
              </Button_1.Button>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DealersDashboard;
//# sourceMappingURL=dashboard.js.map