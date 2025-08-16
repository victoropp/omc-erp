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
const Select_1 = require("@/components/ui/Select");
const charts_1 = require("@/components/charts");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const InventoryAnalytics = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [data, setData] = (0, react_1.useState)(null);
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)('30d');
    const [selectedWarehouse, setSelectedWarehouse] = (0, react_1.useState)('all');
    const periodOptions = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 3 Months' },
        { value: '1y', label: 'Last Year' }
    ];
    const warehouseOptions = [
        { value: 'all', label: 'All Warehouses' },
        { value: 'tema-depot', label: 'Tema Depot' },
        { value: 'takoradi-depot', label: 'Takoradi Depot' },
        { value: 'kumasi-depot', label: 'Kumasi Depot' },
        { value: 'tamale-depot', label: 'Tamale Depot' }
    ];
    (0, react_1.useEffect)(() => {
        fetchInventoryData();
    }, [selectedPeriod, selectedWarehouse]);
    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const response = await api_1.analyticsService.getInventoryAnalytics();
            setData(response);
        }
        catch (error) {
            console.error('Error fetching inventory data:', error);
            // Mock data for development
            setData({
                summary: {
                    totalValue: 15847293.45,
                    totalItems: 245832,
                    turnoverRate: 8.5,
                    stockoutRisk: 12,
                    lowStockItems: 23,
                    excessStockItems: 8
                },
                trends: generateMockTrends(),
                breakdown: generateMockBreakdown(),
                analysis: generateMockAnalysis()
            });
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockTrends = () => ({
        stockLevels: {
            labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
            datasets: [{
                    label: 'Stock Level %',
                    data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 70),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
        },
        turnover: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                    label: 'Turnover Rate',
                    data: [7.2, 8.1, 8.5, 9.2],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
        },
        valuation: {
            labels: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
            datasets: [{
                    label: 'Inventory Value (GHS)',
                    data: [14500000, 14800000, 15200000, 15600000, 15300000, 15700000, 15900000, 15850000, 16100000, 15950000, 16200000, 15847293],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4
                }]
        }
    });
    const generateMockBreakdown = () => ({
        byCategory: {
            labels: ['Petrol', 'Diesel', 'Kerosene', 'Lubricants', 'LPG', 'Others'],
            datasets: [{
                    label: 'Value (GHS)',
                    data: [7500000, 4200000, 2100000, 1500000, 400000, 147293],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
                }]
        },
        byLocation: {
            labels: ['Tema Depot', 'Takoradi Depot', 'Kumasi Depot', 'Tamale Depot', 'Others'],
            datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                }]
        },
        ageAnalysis: {
            labels: ['0-30 days', '31-60 days', '61-90 days', '91-180 days', '180+ days'],
            datasets: [{
                    label: 'Value (GHS)',
                    data: [8500000, 4200000, 2100000, 900000, 147293],
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280']
                }]
        }
    });
    const generateMockAnalysis = () => ({
        fastMoving: [
            { product: 'Petrol 95 Octane', turnover: 12.5, daysOfStock: 29 },
            { product: 'Diesel AGO', turnover: 10.8, daysOfStock: 34 },
            { product: 'Kerosene DPK', turnover: 8.2, daysOfStock: 45 }
        ],
        slowMoving: [
            { product: 'Premium Lubricant 20W-50', turnover: 2.1, daysOfStock: 174 },
            { product: 'Marine Engine Oil', turnover: 1.8, daysOfStock: 203 },
            { product: 'Aviation Fuel', turnover: 1.2, daysOfStock: 304 }
        ],
        stockAlerts: [
            { product: 'Petrol 95 Octane', level: 15, threshold: 20, status: 'low' },
            { product: 'Diesel Engine Oil 15W-40', level: 8, threshold: 15, status: 'critical' },
            { product: 'Brake Fluid DOT 4', level: 45, threshold: 10, status: 'excess' }
        ]
    });
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            minimumFractionDigits: 0
        }).format(amount);
    };
    const getAlertColor = (status) => {
        switch (status) {
            case 'critical': return 'danger';
            case 'low': return 'warning';
            case 'excess': return 'secondary';
            default: return 'success';
        }
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Inventory Analytics" subtitle="Stock management and optimization insights">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="Inventory Analytics" subtitle="Stock management and optimization insights">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Select_1.Select value={selectedPeriod} onChange={(value) => setSelectedPeriod(value)} options={periodOptions} className="w-40"/>
            <Select_1.Select value={selectedWarehouse} onChange={(value) => setSelectedWarehouse(value)} options={warehouseOptions} className="w-48"/>
          </div>
          
          <div className="flex gap-2">
            <Button_1.Button variant="outline">Stock Report</Button_1.Button>
            <Button_1.Button variant="outline">Optimize Stock</Button_1.Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            {
                title: 'Total Inventory Value',
                value: formatCurrency(data?.summary?.totalValue || 0),
                icon: '💰',
                color: 'blue'
            },
            {
                title: 'Total Items',
                value: data?.summary?.totalItems?.toLocaleString() || '0',
                icon: '📦',
                color: 'green'
            },
            {
                title: 'Turnover Rate',
                value: `${data?.summary?.turnoverRate || 0}x`,
                icon: '🔄',
                color: 'purple'
            },
            {
                title: 'Stockout Risk',
                value: `${data?.summary?.stockoutRisk || 0}%`,
                icon: '⚠️',
                color: 'orange'
            },
            {
                title: 'Low Stock Items',
                value: data?.summary?.lowStockItems || 0,
                icon: '📉',
                color: 'red'
            },
            {
                title: 'Excess Stock Items',
                value: data?.summary?.excessStockItems || 0,
                icon: '📈',
                color: 'yellow'
            }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card_1.Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-xl font-bold">{metric.value}</p>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Stock Level Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Stock Level Trends</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily stock level percentage</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.AreaChart data={data?.trends?.stockLevels} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Inventory Turnover</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quarterly turnover rates</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.LineChart data={data?.trends?.turnover} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Inventory Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Inventory by Category</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Value distribution</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.BarChart data={data?.breakdown?.byCategory} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Inventory by Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Warehouse distribution</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.PieChart data={data?.breakdown?.byLocation} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Age Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inventory age breakdown</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <charts_1.BarChart data={data?.breakdown?.ageAnalysis} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Stock Alerts */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader>
              <h3 className="text-lg font-semibold">Stock Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Items requiring attention</p>
            </Card_1.CardHeader>
            <Card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Level</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Threshold</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.analysis?.stockAlerts?.map((alert, index) => (<tr key={alert.product} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4 font-medium">{alert.product}</td>
                        <td className="py-3 px-4">{alert.level}%</td>
                        <td className="py-3 px-4">{alert.threshold}%</td>
                        <td className="py-3 px-4">
                          <ui_1.Badge variant={getAlertColor(alert.status)}>
                            {alert.status}
                          </ui_1.Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button_1.Button size="sm" variant="outline">
                            {alert.status === 'excess' ? 'Reduce Stock' : 'Reorder'}
                          </Button_1.Button>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Movement Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Fast Moving Items</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">High turnover products</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <div className="space-y-4">
                  {data?.analysis?.fastMoving?.map((item, index) => (<div key={item.product} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.daysOfStock} days of stock
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{item.turnover}x</p>
                        <p className="text-sm text-gray-500">turnover</p>
                      </div>
                    </div>))}
                </div>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader>
                <h3 className="text-lg font-semibold">Slow Moving Items</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low turnover products</p>
              </Card_1.CardHeader>
              <Card_1.CardContent>
                <div className="space-y-4">
                  {data?.analysis?.slowMoving?.map((item, index) => (<div key={item.product} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.daysOfStock} days of stock
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{item.turnover}x</p>
                        <p className="text-sm text-gray-500">turnover</p>
                      </div>
                    </div>))}
                </div>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Inventory Valuation Trend */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader>
              <h3 className="text-lg font-semibold">Inventory Valuation Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly inventory value changes</p>
            </Card_1.CardHeader>
            <Card_1.CardContent>
              <charts_1.AreaChart data={data?.trends?.valuation} height={300}/>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = InventoryAnalytics;
//# sourceMappingURL=inventory.js.map