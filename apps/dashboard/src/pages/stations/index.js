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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const link_1 = __importDefault(require("next/link"));
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const charts_1 = require("@/components/charts");
const StationsManagement = () => {
    const [selectedStation, setSelectedStation] = (0, react_1.useState)(null);
    // Sample data for Ghana OMC stations
    const stationMetrics = {
        totalStations: 12,
        activeStations: 11,
        offlineStations: 1,
        totalTanks: 48,
        averageSales: 45250.75,
        fuelStock: 89.5,
        dispenserCount: 36,
        maintenanceDue: 3
    };
    const stations = [
        {
            id: 'GH-ACC-001',
            name: 'Accra Central Station',
            location: 'Osu, Accra',
            manager: 'Kwame Asante',
            status: 'active',
            tanks: 4,
            dispensers: 6,
            dailySales: 125400.50,
            fuelStock: 92.3,
            lastMaintenance: '2025-01-05',
            coordinates: { lat: 5.556, lng: -0.196 }
        },
        {
            id: 'GH-KUM-002',
            name: 'Kumasi Highway Station',
            location: 'Kumasi-Techiman Road',
            manager: 'Ama Oforiwaa',
            status: 'active',
            tanks: 3,
            dispensers: 4,
            dailySales: 89750.25,
            fuelStock: 87.1,
            lastMaintenance: '2025-01-03',
            coordinates: { lat: 6.688, lng: -1.627 }
        },
        {
            id: 'GH-TAM-003',
            name: 'Tamale North Station',
            location: 'Tamale Central Business District',
            manager: 'Abdul Rahman',
            status: 'maintenance',
            tanks: 2,
            dispensers: 3,
            dailySales: 0,
            fuelStock: 45.2,
            lastMaintenance: '2025-01-12',
            coordinates: { lat: 9.403, lng: -0.851 }
        },
        {
            id: 'GH-TAK-004',
            name: 'Takoradi Port Station',
            location: 'Takoradi Harbour Area',
            manager: 'Efua Mensah',
            status: 'active',
            tanks: 5,
            dispensers: 8,
            dailySales: 156780.75,
            fuelStock: 94.8,
            lastMaintenance: '2024-12-28',
            coordinates: { lat: 4.896, lng: -1.756 }
        }
    ];
    const dailySalesData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
                label: 'Daily Sales (₵)',
                data: [125400, 134250, 118900, 145600, 156700, 189500, 167800],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
    };
    const fuelDistributionData = {
        labels: ['Petrol (95)', 'Petrol (91)', 'Diesel (AGO)', 'Kerosene (DPK)'],
        datasets: [{
                data: [45, 25, 25, 5],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
            }]
    };
    const stationPerformanceData = {
        labels: ['Accra Central', 'Kumasi Highway', 'Takoradi Port', 'Cape Coast', 'Ho Station'],
        datasets: [{
                label: 'Monthly Sales (₵1000s)',
                data: [3856, 2695, 4703, 2134, 1789],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Stations Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and manage fuel station operations across Ghana
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <link_1.default href="/stations/management">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
                Manage Stations
              </framer_motion_1.motion.button>
            </link_1.default>
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
              Export Report
            </framer_motion_1.motion.button>
          </div>
        </framer_motion_1.motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stations</p>
                  <p className="text-3xl font-bold text-blue-600">{stationMetrics.totalStations}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Stations</p>
                  <p className="text-3xl font-bold text-green-600">{stationMetrics.activeStations}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Daily Sales</p>
                  <p className="text-3xl font-bold text-purple-600">₵{stationMetrics.averageSales.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Fuel Stock</p>
                  <p className="text-3xl font-bold text-orange-600">{stationMetrics.fuelStock}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Sales Trend</h3>
              <charts_1.LineChart data={dailySalesData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fuel Distribution</h3>
              <charts_1.PieChart data={fuelDistributionData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Station Performance Chart */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Station Performance Comparison</h3>
            <charts_1.BarChart data={stationPerformanceData} height={400}/>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Stations Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Station Details</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <input type="text" placeholder="Search stations..." className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Station ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name & Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Manager</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Infrastructure</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Daily Sales</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Fuel Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station, index) => (<framer_motion_1.motion.tr key={station.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium text-primary-600">{station.id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{station.location}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{station.manager}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                          {station.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p>{station.tanks} Tanks</p>
                          <p className="text-gray-600 dark:text-gray-400">{station.dispensers} Dispensers</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        ₵{station.dailySales.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${station.fuelStock}%` }}/>
                          </div>
                          <span className="text-sm font-medium">{station.fuelStock}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" title="View Details">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" title="Edit Station">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors" title="Emergency Stop">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                        </div>
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
exports.default = StationsManagement;
//# sourceMappingURL=index.js.map