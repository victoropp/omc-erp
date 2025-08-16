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
const InventoryReports = () => {
    const [selectedDateRange, setSelectedDateRange] = (0, react_1.useState)('30d');
    const [selectedStation, setSelectedStation] = (0, react_1.useState)('all');
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [reportType, setReportType] = (0, react_1.useState)('stock_analysis');
    // Inventory metrics
    const inventoryMetrics = {
        totalStockValue: 45786932.50,
        totalStockVolume: 2847593,
        stockTurnoverRate: 15.8,
        averageStockLevel: 78.5,
        stockoutEvents: 12,
        stockoutCost: 234567.89,
        reorderPointsTriggered: 28,
        deliveriesReceived: 45,
        shrinkage: 0.12,
        accuracyRate: 99.87
    };
    // Stock level trends over time
    const stockLevelTrendData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Petrol (95 Octane)',
                data: [85.2, 78.9, 72.1, 68.4],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'Petrol (91 Octane)',
                data: [92.1, 87.5, 82.3, 79.6],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            },
            {
                label: 'Diesel (AGO)',
                data: [78.5, 73.2, 69.8, 65.4],
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            },
            {
                label: 'Kerosene (DPK)',
                data: [45.8, 38.9, 32.1, 28.7],
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }
        ]
    };
    // Inventory turnover by product
    const turnoverRateData = {
        labels: ['Petrol (95)', 'Petrol (91)', 'Diesel (AGO)', 'Kerosene (DPK)', 'Lubricants', 'Engine Oil'],
        datasets: [{
                label: 'Turnover Rate (times/year)',
                data: [18.5, 15.2, 22.1, 8.9, 6.3, 12.7],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
                borderWidth: 1
            }]
    };
    // Inventory value distribution
    const valueDistributionData = {
        labels: ['Petrol Products', 'Diesel Products', 'Kerosene Products', 'Lubricants', 'Additives', 'Other'],
        datasets: [{
                data: [45, 28, 12, 8, 5, 2],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
            }]
    };
    // Stock movement analysis
    const stockMovementData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Stock In (1000L)',
                data: [1450, 1678, 1523, 1789, 2145, 1923],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10B981'
            },
            {
                label: 'Stock Out (1000L)',
                data: [1320, 1589, 1456, 1654, 1987, 1834],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#EF4444'
            }
        ]
    };
    // Detailed inventory data by product
    const inventoryDetailData = [
        {
            product: 'Petrol (95 Octane)',
            category: 'Fuel',
            currentStock: 156789,
            stockValue: 19620000.55,
            reorderPoint: 75000,
            maxStock: 200000,
            turnoverRate: 18.5,
            avgDaysToReorder: 12,
            stockoutDays: 0,
            shrinkageRate: 0.08,
            accuracyRate: 99.92,
            lastAudit: '2025-01-10',
            status: 'adequate'
        },
        {
            product: 'Petrol (91 Octane)',
            category: 'Fuel',
            currentStock: 89450,
            stockValue: 10636405.50,
            reorderPoint: 60000,
            maxStock: 150000,
            turnoverRate: 15.2,
            avgDaysToReorder: 15,
            stockoutDays: 2,
            shrinkageRate: 0.12,
            accuracyRate: 99.85,
            lastAudit: '2025-01-08',
            status: 'low'
        },
        {
            product: 'Diesel (AGO)',
            category: 'Fuel',
            currentStock: 198765,
            stockValue: 22313404.95,
            reorderPoint: 90000,
            maxStock: 250000,
            turnoverRate: 22.1,
            avgDaysToReorder: 8,
            stockoutDays: 1,
            shrinkageRate: 0.06,
            accuracyRate: 99.94,
            lastAudit: '2025-01-11',
            status: 'adequate'
        },
        {
            product: 'Kerosene (DPK)',
            category: 'Fuel',
            currentStock: 25430,
            stockValue: 347625.35,
            reorderPoint: 30000,
            maxStock: 80000,
            turnoverRate: 8.9,
            avgDaysToReorder: 25,
            stockoutDays: 5,
            shrinkageRate: 0.18,
            accuracyRate: 99.78,
            lastAudit: '2025-01-06',
            status: 'critical'
        },
        {
            product: 'Engine Oil',
            category: 'Non-Fuel',
            currentStock: 1245,
            stockValue: 68475.00,
            reorderPoint: 500,
            maxStock: 1500,
            turnoverRate: 12.7,
            avgDaysToReorder: 18,
            stockoutDays: 0,
            shrinkageRate: 0.03,
            accuracyRate: 99.97,
            lastAudit: '2025-01-09',
            status: 'adequate'
        }
    ];
    // Station-wise inventory summary
    const stationInventoryData = [
        {
            station: 'Accra Central Station',
            totalValue: 12456789.50,
            totalVolume: 785432,
            productCount: 6,
            turnoverRate: 16.8,
            stockLevel: 82.3,
            lastDelivery: '2025-01-10',
            alertsCount: 1
        },
        {
            station: 'Kumasi Highway Station',
            totalValue: 8934567.25,
            totalVolume: 567893,
            productCount: 5,
            turnoverRate: 14.2,
            stockLevel: 75.6,
            lastDelivery: '2025-01-08',
            alertsCount: 2
        },
        {
            station: 'Takoradi Port Station',
            totalValue: 15678432.75,
            totalVolume: 923456,
            productCount: 7,
            turnoverRate: 19.1,
            stockLevel: 88.7,
            lastDelivery: '2025-01-11',
            alertsCount: 0
        },
        {
            station: 'Tamale North Station',
            totalValue: 4567890.00,
            totalVolume: 345678,
            productCount: 4,
            turnoverRate: 11.5,
            stockLevel: 65.4,
            lastDelivery: '2025-01-05',
            alertsCount: 3
        }
    ];
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            minimumFractionDigits: 2
        }).format(amount).replace('GHS', '₵');
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'adequate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'excess': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getTurnoverColor = (rate) => {
        if (rate > 20)
            return 'text-green-600';
        if (rate > 15)
            return 'text-blue-600';
        if (rate > 10)
            return 'text-orange-600';
        return 'text-red-600';
    };
    const getAlertColor = (count) => {
        if (count === 0)
            return 'text-green-600';
        if (count <= 2)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Inventory Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive inventory analysis and stock management reports
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)}>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
              Export Report
            </framer_motion_1.motion.button>
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
              Schedule Audit
            </framer_motion_1.motion.button>
          </div>
        </framer_motion_1.motion.div>

        {/* Filter Controls */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Report Type</label>
                <select className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="stock_analysis">Stock Analysis</option>
                  <option value="turnover_analysis">Turnover Analysis</option>
                  <option value="valuation">Inventory Valuation</option>
                  <option value="shrinkage">Shrinkage Analysis</option>
                  <option value="abc_analysis">ABC Analysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Station</label>
                <select className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}>
                  <option value="all">All Stations</option>
                  <option value="accra">Accra Central</option>
                  <option value="kumasi">Kumasi Highway</option>
                  <option value="takoradi">Takoradi Port</option>
                  <option value="tamale">Tamale North</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Category</label>
                <select className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="fuel">Fuel Products</option>
                  <option value="non-fuel">Non-Fuel Products</option>
                  <option value="lubricants">Lubricants</option>
                </select>
              </div>
              <div className="flex items-end">
                <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 transition-colors">
                  Apply Filters
                </framer_motion_1.motion.button>
              </div>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stock Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(inventoryMetrics.totalStockValue)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Volume</p>
                  <p className="text-2xl font-bold text-green-600">{(inventoryMetrics.totalStockVolume / 1000).toFixed(0)}K L</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Turnover Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{inventoryMetrics.stockTurnoverRate}x</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Stock Level</p>
                  <p className="text-2xl font-bold text-orange-600">{inventoryMetrics.averageStockLevel}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-pink-600">{inventoryMetrics.accuracyRate}%</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stock Level Trends</h3>
              <charts_1.LineChart data={stockLevelTrendData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Value Distribution</h3>
              <charts_1.PieChart data={valueDistributionData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Turnover Rates</h3>
              <charts_1.BarChart data={turnoverRateData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stock Movement Analysis</h3>
              <charts_1.BarChart data={stockMovementData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Product Inventory Details */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Inventory Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stock Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Turnover Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Days to Reorder</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stockout Days</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Shrinkage %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Accuracy %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryDetailData.map((product, index) => (<framer_motion_1.motion.tr key={product.product} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium">{product.product}</td>
                      <td className="py-4 px-4">{product.currentStock.toLocaleString()}L</td>
                      <td className="py-4 px-4 font-bold">{formatCurrency(product.stockValue)}</td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getTurnoverColor(product.turnoverRate)}`}>
                          {product.turnoverRate}x
                        </span>
                      </td>
                      <td className="py-4 px-4">{product.avgDaysToReorder} days</td>
                      <td className="py-4 px-4">
                        <span className={product.stockoutDays > 0 ? 'text-red-600' : 'text-green-600'}>
                          {product.stockoutDays}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={product.shrinkageRate > 0.15 ? 'text-red-600' : 'text-green-600'}>
                          {product.shrinkageRate}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={product.accuracyRate > 99.9 ? 'text-green-600' : 'text-orange-600'}>
                          {product.accuracyRate}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Station Inventory Summary */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Station Inventory Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Station</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Volume</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product Count</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Turnover Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stock Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {stationInventoryData.map((station, index) => (<framer_motion_1.motion.tr key={station.station} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium">{station.station}</td>
                      <td className="py-4 px-4 font-bold">{formatCurrency(station.totalValue)}</td>
                      <td className="py-4 px-4">{station.totalVolume.toLocaleString()}L</td>
                      <td className="py-4 px-4">{station.productCount}</td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getTurnoverColor(station.turnoverRate)}`}>
                          {station.turnoverRate}x
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(station.stockLevel, 100)}%` }}/>
                          </div>
                          <span className="text-sm font-medium">{station.stockLevel}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {new Date(station.lastDelivery).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getAlertColor(station.alertsCount)}`}>
                          {station.alertsCount}
                        </span>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = InventoryReports;
//# sourceMappingURL=inventory.js.map