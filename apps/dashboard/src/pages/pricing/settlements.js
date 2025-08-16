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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const PricingSettlementsManagement = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [settlements, setSettlements] = (0, react_1.useState)([]);
    const [settlementStats, setSettlementStats] = (0, react_1.useState)({});
    const [filters, setFilters] = (0, react_1.useState)({
        status: 'all',
        period: '30d',
        dealer: 'all',
        product: 'all'
    });
    const [selectedSettlement, setSelectedSettlement] = (0, react_1.useState)(null);
    // Mock settlements data
    const mockData = {
        stats: {
            totalSettlements: 156,
            pendingSettlements: 8,
            processedAmount: 12450750.50,
            averageProcessingTime: 2.4
        },
        settlements: [
            {
                id: 'STL-2025-001-045',
                dealer: 'Tema Oil Terminal',
                dealerId: 'DOL-001',
                period: '2025-01',
                status: 'pending',
                totalAmount: 450750.50,
                pbuAmount: 425000.00,
                marginAmount: 25750.50,
                products: [
                    { product: 'Petrol', volume: 15000, amount: 225375.25 },
                    { product: 'Diesel', volume: 12000, amount: 178950.75 },
                    { product: 'Kerosene', volume: 3000, amount: 46424.50 }
                ],
                createdDate: '2025-01-13 08:30:00',
                dueDate: '2025-01-20 23:59:59',
                lastUpdated: '2025-01-13 09:15:00',
                notes: 'Monthly settlement for January 2025'
            },
            {
                id: 'STL-2025-001-044',
                dealer: 'Accra Plains Depot',
                dealerId: 'DOL-002',
                period: '2025-01',
                status: 'processing',
                totalAmount: 327890.25,
                pbuAmount: 310000.00,
                marginAmount: 17890.25,
                products: [
                    { product: 'Petrol', volume: 11000, amount: 164275.75 },
                    { product: 'Diesel', volume: 9500, amount: 141614.50 },
                    { product: 'LPG', volume: 1200, amount: 22000.00 }
                ],
                createdDate: '2025-01-12 16:45:00',
                dueDate: '2025-01-19 23:59:59',
                lastUpdated: '2025-01-13 07:30:00',
                notes: 'Under review for volume discrepancies'
            },
            {
                id: 'STL-2025-001-043',
                dealer: 'Kumasi Central Store',
                dealerId: 'DOL-003',
                period: '2025-01',
                status: 'completed',
                totalAmount: 689450.75,
                pbuAmount: 655000.00,
                marginAmount: 34450.75,
                products: [
                    { product: 'Petrol', volume: 22000, amount: 328900.00 },
                    { product: 'Diesel', volume: 18000, amount: 268550.75 },
                    { product: 'Kerosene', volume: 6000, amount: 92000.00 }
                ],
                createdDate: '2025-01-11 14:20:00',
                dueDate: '2025-01-18 23:59:59',
                lastUpdated: '2025-01-12 10:45:00',
                notes: 'Successfully processed and approved',
                paymentDate: '2025-01-12 15:30:00'
            },
            {
                id: 'STL-2025-001-042',
                dealer: 'Takoradi Port Terminal',
                dealerId: 'DOL-004',
                period: '2025-01',
                status: 'disputed',
                totalAmount: 234567.80,
                pbuAmount: 220000.00,
                marginAmount: 14567.80,
                products: [
                    { product: 'Diesel', volume: 15000, amount: 223567.80 },
                    { product: 'Kerosene', volume: 1000, amount: 11000.00 }
                ],
                createdDate: '2025-01-10 11:15:00',
                dueDate: '2025-01-17 23:59:59',
                lastUpdated: '2025-01-11 16:20:00',
                notes: 'Dispute regarding volume calculations',
                disputeReason: 'Volume discrepancy in diesel allocation'
            }
        ],
        statusDistribution: {
            labels: ['Completed', 'Pending', 'Processing', 'Disputed'],
            datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
                }]
        },
        monthlyTrends: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
                    label: 'Settlement Amount (₵)',
                    data: [11200000, 11800000, 12100000, 12300000, 12450000],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
        },
        processingTime: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                    label: 'Avg Processing Time (hours)',
                    data: [2.1, 2.3, 2.8, 2.5, 2.2, 1.8, 1.5],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
                }]
        }
    };
    (0, react_1.useEffect)(() => {
        loadSettlementsData();
        // Setup WebSocket for real-time settlement updates
        api_1.wsService.connect();
        return () => {
            api_1.wsService.disconnect();
        };
    }, [filters]);
    const loadSettlementsData = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSettlements(mockData.settlements);
            setSettlementStats(mockData.stats);
            react_hot_toast_1.toast.success('Settlements data loaded successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load settlements data');
            console.error('Settlements loading error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const processSettlement = async (settlementId) => {
        try {
            react_hot_toast_1.toast.loading('Processing settlement...');
            // Simulate settlement processing
            await new Promise(resolve => setTimeout(resolve, 2500));
            const updatedSettlements = settlements.map(settlement => settlement.id === settlementId
                ? { ...settlement, status: 'processing', lastUpdated: new Date().toISOString() }
                : settlement);
            setSettlements(updatedSettlements);
            react_hot_toast_1.toast.success('Settlement processing initiated');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Settlement processing failed');
        }
    };
    const approveSettlement = async (settlementId) => {
        try {
            react_hot_toast_1.toast.loading('Approving settlement...');
            // Simulate settlement approval
            await new Promise(resolve => setTimeout(resolve, 2000));
            const updatedSettlements = settlements.map(settlement => settlement.id === settlementId
                ? {
                    ...settlement,
                    status: 'completed',
                    lastUpdated: new Date().toISOString(),
                    paymentDate: new Date().toISOString()
                }
                : settlement);
            setSettlements(updatedSettlements);
            react_hot_toast_1.toast.success('Settlement approved and completed');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Settlement approval failed');
        }
    };
    const disputeSettlement = async (settlementId, reason) => {
        try {
            react_hot_toast_1.toast.loading('Recording settlement dispute...');
            // Simulate dispute recording
            await new Promise(resolve => setTimeout(resolve, 1500));
            const updatedSettlements = settlements.map(settlement => settlement.id === settlementId
                ? {
                    ...settlement,
                    status: 'disputed',
                    lastUpdated: new Date().toISOString(),
                    disputeReason: reason
                }
                : settlement);
            setSettlements(updatedSettlements);
            react_hot_toast_1.toast.success('Settlement dispute recorded');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to record dispute');
        }
    };
    const exportSettlements = async (format) => {
        try {
            react_hot_toast_1.toast.loading(`Exporting settlements as ${format.toUpperCase()}...`);
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success(`Settlements exported as ${format.toUpperCase()}`);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Export failed');
        }
    };
    const generateSettlementReport = async () => {
        try {
            react_hot_toast_1.toast.loading('Generating comprehensive settlement report...');
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 3000));
            react_hot_toast_1.toast.success('Settlement report generated successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Report generation failed');
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'pending':
                return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
            case 'processing':
                return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            case 'disputed':
                return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
        }
    };
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return '✅';
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'disputed': return '⚠️';
            default: return '❓';
        }
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"/>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Pricing Settlements Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Dealer settlement processing and payment management
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button onClick={generateSettlementReport} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Generate Report
            </button>
            
            <div className="relative group">
              <button className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
                Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-white/20 bg-white/10 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button onClick={() => exportSettlements('csv')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-lg">
                  Export as CSV
                </button>
                <button onClick={() => exportSettlements('excel')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10">
                  Export as Excel
                </button>
                <button onClick={() => exportSettlements('pdf')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg">
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </framer_motion_1.motion.div>

        {/* Settlement Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
                title: 'Total Settlements',
                value: mockData.stats.totalSettlements,
                color: 'text-blue-500',
                icon: '📊',
                change: '+12 this month'
            },
            {
                title: 'Pending',
                value: mockData.stats.pendingSettlements,
                color: 'text-yellow-500',
                icon: '⏳',
                change: '2 due today'
            },
            {
                title: 'Processed Amount',
                value: `₵${(mockData.stats.processedAmount / 1000000).toFixed(1)}M`,
                color: 'text-green-500',
                icon: '💰',
                change: '+8.5% from last month'
            },
            {
                title: 'Avg Processing Time',
                value: `${mockData.stats.averageProcessingTime}h`,
                color: 'text-purple-500',
                icon: '⚡',
                change: '-0.3h improvement'
            }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card_1.Card className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.change}
                </p>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Filters */}
        <Card_1.Card className="p-6">
          <Card_1.CardHeader title="Settlement Filters" subtitle="Filter settlements by status, period, and dealer"/>
          <Card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Status
                </label>
                <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Period
                </label>
                <select value={filters.period} onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Dealer
                </label>
                <select value={filters.dealer} onChange={(e) => setFilters(prev => ({ ...prev, dealer: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Dealers</option>
                  <option value="DOL-001">Tema Oil Terminal</option>
                  <option value="DOL-002">Accra Plains Depot</option>
                  <option value="DOL-003">Kumasi Central Store</option>
                  <option value="DOL-004">Takoradi Port Terminal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Product
                </label>
                <select value={filters.product} onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                  <option value="all">All Products</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="kerosene">Kerosene</option>
                  <option value="lpg">LPG</option>
                </select>
              </div>
            </div>
          </Card_1.CardContent>
        </Card_1.Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Settlement Trends" subtitle="Monthly settlement amounts over time"/>
              <Card_1.CardContent>
                <charts_1.LineChart data={mockData.monthlyTrends} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          {/* Status Distribution */}
          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Status Distribution" subtitle="Current settlement status breakdown"/>
              <Card_1.CardContent>
                <charts_1.PieChart data={mockData.statusDistribution} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Processing Time Analysis */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Processing Time Analysis" subtitle="Average settlement processing time by day of week"/>
            <Card_1.CardContent>
              <charts_1.BarChart data={mockData.processingTime} height={300}/>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Settlements Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Settlement Records" subtitle="Detailed view of all settlement transactions"/>
            <Card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Settlement ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Dealer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement, index) => (<framer_motion_1.motion.tr key={settlement.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => setSelectedSettlement(settlement)}>
                        <td className="py-3 px-4 font-medium text-white">{settlement.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-white">{settlement.dealer}</p>
                            <p className="text-xs text-gray-400">{settlement.dealerId}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{settlement.period}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-bold text-white">₵{settlement.totalAmount.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">PBU: ₵{settlement.pbuAmount.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getStatusIcon(settlement.status)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(settlement.status)}`}>
                              {settlement.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white">{settlement.dueDate.split(' ')[0]}</p>
                            <p className="text-xs text-gray-400">{settlement.dueDate.split(' ')[1]}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {settlement.status === 'pending' && (<button onClick={(e) => {
                    e.stopPropagation();
                    processSettlement(settlement.id);
                }} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
                                Process
                              </button>)}
                            {settlement.status === 'processing' && (<button onClick={(e) => {
                    e.stopPropagation();
                    approveSettlement(settlement.id);
                }} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors">
                                Approve
                              </button>)}
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs transition-colors">
                              View
                            </button>
                          </div>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Settlement Detail Modal */}
        {selectedSettlement && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSettlement(null)}>
            <framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Settlement Details</h2>
                    <p className="text-gray-400">{selectedSettlement.id}</p>
                  </div>
                  <button onClick={() => setSelectedSettlement(null)} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Dealer</label>
                      <p className="text-white font-medium">{selectedSettlement.dealer}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Settlement Period</label>
                      <p className="text-white font-medium">{selectedSettlement.period}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg">{getStatusIcon(selectedSettlement.status)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSettlement.status)}`}>
                          {selectedSettlement.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Total Amount</label>
                      <p className="text-white font-bold text-xl">₵{selectedSettlement.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">PBU Amount</label>
                      <p className="text-white font-medium">₵{selectedSettlement.pbuAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Margin Amount</label>
                      <p className="text-white font-medium">₵{selectedSettlement.marginAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Product Breakdown */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Product Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-2 text-gray-400">Product</th>
                          <th className="text-left py-2 text-gray-400">Volume (L)</th>
                          <th className="text-left py-2 text-gray-400">Amount (₵)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSettlement.products.map((product, index) => (<tr key={index} className="border-b border-white/10">
                            <td className="py-2 text-white">{product.product}</td>
                            <td className="py-2 text-gray-300">{product.volume.toLocaleString()}</td>
                            <td className="py-2 text-white font-medium">₵{product.amount.toLocaleString()}</td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-white">Settlement Created</p>
                        <p className="text-sm text-gray-400">{selectedSettlement.createdDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-white">Last Updated</p>
                        <p className="text-sm text-gray-400">{selectedSettlement.lastUpdated}</p>
                      </div>
                    </div>
                    {selectedSettlement.paymentDate && (<div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-white">Payment Processed</p>
                          <p className="text-sm text-gray-400">{selectedSettlement.paymentDate}</p>
                        </div>
                      </div>)}
                  </div>
                </div>

                {/* Notes */}
                {selectedSettlement.notes && (<div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
                    <p className="text-gray-300">{selectedSettlement.notes}</p>
                  </div>)}

                {/* Dispute Information */}
                {selectedSettlement.status === 'disputed' && selectedSettlement.disputeReason && (<div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Dispute Information</h3>
                    <p className="text-gray-300">{selectedSettlement.disputeReason}</p>
                  </div>)}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {selectedSettlement.status === 'pending' && (<button onClick={() => {
                    processSettlement(selectedSettlement.id);
                    setSelectedSettlement(null);
                }} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      Process Settlement
                    </button>)}
                  {selectedSettlement.status === 'processing' && (<>
                      <button onClick={() => {
                    approveSettlement(selectedSettlement.id);
                    setSelectedSettlement(null);
                }} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Approve
                      </button>
                      <button onClick={() => {
                    disputeSettlement(selectedSettlement.id, 'Manual dispute raised');
                    setSelectedSettlement(null);
                }} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        Dispute
                      </button>
                    </>)}
                  <button onClick={() => setSelectedSettlement(null)} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PricingSettlementsManagement;
//# sourceMappingURL=settlements.js.map