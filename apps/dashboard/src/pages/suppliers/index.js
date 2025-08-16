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
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const Card_1 = require("@/components/ui/Card");
const charts_1 = require("@/components/charts");
const link_1 = __importDefault(require("next/link"));
const SupplierManagement = () => {
    const [selectedSupplierType, setSelectedSupplierType] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedSupplier, setSelectedSupplier] = (0, react_1.useState)(null);
    const [suppliers, setSuppliers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    // Supplier metrics
    const supplierMetrics = {
        totalSuppliers: 287,
        activeSuppliers: 234,
        newSuppliers: 12,
        fuelSuppliers: 45,
        equipmentSuppliers: 67,
        serviceSuppliers: 89,
        internationalSuppliers: 86,
        averageRating: 4.2,
        activeContracts: 156,
        expiringSoon: 8
    };
    // Sample supplier data
    const suppliersData = [
        {
            id: 'SUP-2025-001',
            name: 'Ghana National Petroleum Corporation',
            type: 'fuel',
            category: 'Primary',
            phone: '+233-30-222-0100',
            email: 'procurement@gnpc.com.gh',
            location: 'Tema',
            country: 'Ghana',
            registrationDate: '2020-01-15',
            totalContracts: 12,
            activeContracts: 8,
            contractValue: 15670000.00,
            yearlyVolume: 250000000,
            paymentTerms: 'NET 30',
            rating: 4.8,
            performance: 96.5,
            certifications: ['ISO 9001', 'OHSAS 18001', 'ISO 14001'],
            lastDelivery: '2025-01-12',
            status: 'active',
            riskLevel: 'low'
        },
        {
            id: 'SUP-2025-002',
            name: 'Tema Oil Refinery Limited',
            type: 'fuel',
            category: 'Primary',
            phone: '+233-30-321-1000',
            email: 'sales@torl.com.gh',
            location: 'Tema',
            country: 'Ghana',
            registrationDate: '2019-08-22',
            totalContracts: 18,
            activeContracts: 12,
            contractValue: 28450000.00,
            yearlyVolume: 180000000,
            paymentTerms: 'NET 45',
            rating: 4.6,
            performance: 94.2,
            certifications: ['ISO 9001', 'API Q1', 'OHSAS 18001'],
            lastDelivery: '2025-01-11',
            status: 'active',
            riskLevel: 'low'
        },
        {
            id: 'SUP-2025-003',
            name: 'Woodfields Energy Resources',
            type: 'fuel',
            category: 'Secondary',
            phone: '+233-24-789-1234',
            email: 'ops@woodfields.com.gh',
            location: 'Accra',
            country: 'Ghana',
            registrationDate: '2021-03-10',
            totalContracts: 6,
            activeContracts: 4,
            contractValue: 8960000.00,
            yearlyVolume: 75000000,
            paymentTerms: 'NET 30',
            rating: 4.3,
            performance: 89.7,
            certifications: ['ISO 9001'],
            lastDelivery: '2025-01-10',
            status: 'active',
            riskLevel: 'medium'
        },
        {
            id: 'SUP-2025-004',
            name: 'Atlas Engineering Solutions',
            type: 'equipment',
            category: 'Technical',
            phone: '+233-20-567-8900',
            email: 'info@atlasengineering.gh',
            location: 'Kumasi',
            country: 'Ghana',
            registrationDate: '2022-06-15',
            totalContracts: 8,
            activeContracts: 5,
            contractValue: 3450000.00,
            yearlyVolume: 0,
            paymentTerms: 'NET 60',
            rating: 4.1,
            performance: 91.3,
            certifications: ['ISO 9001', 'CE Marking'],
            lastDelivery: '2025-01-05',
            status: 'active',
            riskLevel: 'low'
        },
        {
            id: 'SUP-2025-005',
            name: 'SafeGuard Security Services',
            type: 'service',
            category: 'Support',
            phone: '+233-26-345-6789',
            email: 'contracts@safeguardgh.com',
            location: 'Accra',
            country: 'Ghana',
            registrationDate: '2023-02-28',
            totalContracts: 3,
            activeContracts: 3,
            contractValue: 890000.00,
            yearlyVolume: 0,
            paymentTerms: 'NET 30',
            rating: 3.9,
            performance: 87.5,
            certifications: ['PSIRA Certified'],
            lastDelivery: '2025-01-08',
            status: 'active',
            riskLevel: 'medium'
        }
    ];
    // Supplier performance trend
    const performanceTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
                label: 'Average Performance (%)',
                data: [88.5, 89.2, 91.1, 90.8, 92.3, 93.1, 91.7, 92.8, 93.5, 94.2, 93.8, 94.5],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
    };
    // Supplier type distribution
    const supplierTypeData = {
        labels: ['Fuel Suppliers', 'Equipment', 'Services', 'Logistics', 'Maintenance'],
        datasets: [{
                data: [45, 67, 89, 34, 52],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
    };
    // Contract value by supplier
    const contractValueData = {
        labels: ['GNPC', 'TOR Limited', 'Woodfields', 'Atlas Engineering', 'SafeGuard'],
        datasets: [{
                label: 'Contract Value (₵ Millions)',
                data: [156.7, 284.5, 89.6, 34.5, 8.9],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
    };
    (0, react_1.useEffect)(() => {
        // Simulate API call
        setTimeout(() => {
            setSuppliers(suppliersData);
            setLoading(false);
        }, 1000);
    }, []);
    const getRatingColor = (rating) => {
        if (rating >= 4.5)
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (rating >= 4.0)
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (rating >= 3.5)
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getSupplierTypeIcon = (type) => {
        switch (type) {
            case 'fuel':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>);
            case 'equipment':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>);
            case 'service':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
          </svg>);
            default:
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>);
        }
    };
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedSupplierType === 'all' || supplier.type === selectedSupplierType;
        return matchesSearch && matchesType;
    });
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Supplier Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage supplier relationships, contracts, and performance metrics
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <link_1.default href="/suppliers/create">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
                Add New Supplier
              </framer_motion_1.motion.button>
            </link_1.default>
            <link_1.default href="/suppliers/contracts">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
                Manage Contracts
              </framer_motion_1.motion.button>
            </link_1.default>
            <link_1.default href="/suppliers/performance">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
                Performance Analytics
              </framer_motion_1.motion.button>
            </link_1.default>
          </div>
        </framer_motion_1.motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                  <p className="text-2xl font-bold text-blue-600">{supplierMetrics.totalSuppliers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suppliers</p>
                  <p className="text-2xl font-bold text-green-600">{supplierMetrics.activeSuppliers}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Contracts</p>
                  <p className="text-2xl font-bold text-purple-600">{supplierMetrics.activeContracts}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-orange-600">{supplierMetrics.averageRating}/5.0</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-red-600">{supplierMetrics.expiringSoon}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier Performance Trend</h3>
              <charts_1.LineChart data={performanceTrendData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier Type Distribution</h3>
              <charts_1.PieChart data={supplierTypeData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Contract Value Chart */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Suppliers by Contract Value</h3>
            <charts_1.BarChart data={contractValueData} height={400}/>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Supplier Management Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card_1.Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Supplier Database</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <input type="text" placeholder="Search suppliers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedSupplierType} onChange={(e) => setSelectedSupplierType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="fuel">Fuel Suppliers</option>
                  <option value="equipment">Equipment</option>
                  <option value="service">Services</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contract Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Active Contracts</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Performance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Risk Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier, index) => (<framer_motion_1.motion.tr key={supplier.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${supplier.type === 'fuel' ? 'bg-blue-100 text-blue-600' :
                supplier.type === 'equipment' ? 'bg-purple-100 text-purple-600' :
                    supplier.type === 'service' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'}`}>
                            {getSupplierTypeIcon(supplier.type)}
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-sm">{supplier.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p>{supplier.phone}</p>
                          <p className="text-gray-600 dark:text-gray-400">{supplier.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{supplier.location}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.country}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">₵{supplier.contractValue.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center">{supplier.activeContracts}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(supplier.rating)}`}>
                            {supplier.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-16">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${supplier.performance}%` }}/>
                          </div>
                          <span className="text-sm">{supplier.performance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(supplier.riskLevel)}`}>
                          {supplier.riskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <link_1.default href={`/suppliers/${supplier.id}/profile`}>
                            <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" title="View Profile">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </framer_motion_1.motion.button>
                          </link_1.default>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" title="Edit Supplier">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors" title="Contract History">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
exports.default = SupplierManagement;
//# sourceMappingURL=index.js.map