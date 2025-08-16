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
const SupplierContracts = () => {
    const [selectedStatus, setSelectedStatus] = (0, react_1.useState)('all');
    const [selectedType, setSelectedType] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [contracts, setContracts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    // Contract metrics
    const contractMetrics = {
        totalContracts: 156,
        activeContracts: 98,
        expiringSoon: 8,
        draftContracts: 12,
        pendingRenewal: 15,
        totalValue: 485960000,
        averageContractValue: 3115000,
        averageDuration: 18 // months
    };
    // Sample contracts data
    const contractsData = [
        {
            id: 'CNT-2025-001',
            title: 'Crude Oil Supply Agreement',
            supplier: {
                id: 'SUP-2025-001',
                name: 'Ghana National Petroleum Corporation',
                type: 'fuel'
            },
            type: 'fuel_supply',
            status: 'active',
            value: 45600000,
            currency: 'GHS',
            startDate: '2024-01-15',
            endDate: '2026-01-14',
            renewalDate: '2025-11-15',
            paymentTerms: 'NET 30',
            deliveryTerms: 'FOB Tema',
            volume: '50,000 barrels/month',
            pricePerUnit: 912.00,
            totalVolume: 1200000,
            deliveredVolume: 600000,
            performanceRating: 4.8,
            lastActivity: '2025-01-12',
            keyTerms: [
                'Minimum monthly volume: 45,000 barrels',
                'Quality specification: API 32-34',
                'Force majeure clause included',
                'Price adjustment quarterly'
            ],
            milestones: [
                { date: '2024-01-15', title: 'Contract Execution', status: 'completed' },
                { date: '2024-04-15', title: 'First Quarter Review', status: 'completed' },
                { date: '2024-07-15', title: 'Mid-Year Assessment', status: 'completed' },
                { date: '2024-10-15', title: 'Q3 Performance Review', status: 'completed' },
                { date: '2025-01-15', title: 'Annual Review', status: 'pending' },
                { date: '2025-11-15', title: 'Renewal Decision', status: 'pending' }
            ]
        },
        {
            id: 'CNT-2025-002',
            title: 'Refined Products Distribution',
            supplier: {
                id: 'SUP-2025-002',
                name: 'Tema Oil Refinery Limited',
                type: 'fuel'
            },
            type: 'fuel_supply',
            status: 'active',
            value: 28450000,
            currency: 'GHS',
            startDate: '2024-03-01',
            endDate: '2026-02-28',
            renewalDate: '2025-12-01',
            paymentTerms: 'NET 45',
            deliveryTerms: 'Ex-Works Tema',
            volume: '30,000 MT/month',
            pricePerUnit: 6500.00,
            totalVolume: 720000,
            deliveredVolume: 300000,
            performanceRating: 4.6,
            lastActivity: '2025-01-11',
            keyTerms: [
                'Product mix: 60% Petrol, 30% Diesel, 10% Kerosene',
                'Quality meets Ghana Standards Authority specs',
                'Delivery within 48 hours of order',
                'Monthly price review mechanism'
            ],
            milestones: [
                { date: '2024-03-01', title: 'Contract Commencement', status: 'completed' },
                { date: '2024-06-01', title: 'Q1 Review', status: 'completed' },
                { date: '2024-09-01', title: 'Q2 Review', status: 'completed' },
                { date: '2024-12-01', title: 'Q3 Review', status: 'completed' },
                { date: '2025-03-01', title: 'Annual Review', status: 'pending' }
            ]
        },
        {
            id: 'CNT-2025-003',
            title: 'Equipment Maintenance Services',
            supplier: {
                id: 'SUP-2025-004',
                name: 'Atlas Engineering Solutions',
                type: 'equipment'
            },
            type: 'maintenance',
            status: 'active',
            value: 3450000,
            currency: 'GHS',
            startDate: '2024-06-01',
            endDate: '2025-05-31',
            renewalDate: '2025-04-01',
            paymentTerms: 'NET 60',
            deliveryTerms: 'On-site Service',
            volume: '24/7 Support',
            pricePerUnit: 0, // Service contract
            totalVolume: 0,
            deliveredVolume: 0,
            performanceRating: 4.1,
            lastActivity: '2025-01-05',
            keyTerms: [
                'Preventive maintenance schedule',
                '4-hour emergency response time',
                'OEM certified technicians',
                'Parts and labor warranty'
            ],
            milestones: [
                { date: '2024-06-01', title: 'Service Commencement', status: 'completed' },
                { date: '2024-09-01', title: 'Q1 Service Review', status: 'completed' },
                { date: '2024-12-01', title: 'Q2 Service Review', status: 'completed' },
                { date: '2025-03-01', title: 'Q3 Service Review', status: 'pending' },
                { date: '2025-04-01', title: 'Renewal Evaluation', status: 'pending' }
            ]
        },
        {
            id: 'CNT-2025-004',
            title: 'Security Services Agreement',
            supplier: {
                id: 'SUP-2025-005',
                name: 'SafeGuard Security Services',
                type: 'service'
            },
            type: 'security',
            status: 'expiring_soon',
            value: 890000,
            currency: 'GHS',
            startDate: '2023-02-01',
            endDate: '2025-01-31',
            renewalDate: '2024-12-01',
            paymentTerms: 'NET 30',
            deliveryTerms: 'On-site Service',
            volume: '24/7 Coverage',
            pricePerUnit: 0,
            totalVolume: 0,
            deliveredVolume: 0,
            performanceRating: 3.9,
            lastActivity: '2025-01-08',
            keyTerms: [
                '24/7 security coverage',
                'Armed and unarmed guards',
                'CCTV monitoring',
                'Monthly security reports'
            ],
            milestones: [
                { date: '2023-02-01', title: 'Contract Start', status: 'completed' },
                { date: '2023-08-01', title: 'Mid-Contract Review', status: 'completed' },
                { date: '2024-02-01', title: 'Annual Review', status: 'completed' },
                { date: '2024-12-01', title: 'Renewal Discussion', status: 'completed' },
                { date: '2025-01-31', title: 'Contract Expiry', status: 'pending' }
            ]
        },
        {
            id: 'CNT-2025-005',
            title: 'Logistics and Transportation',
            supplier: {
                id: 'SUP-2025-003',
                name: 'Woodfields Energy Resources',
                type: 'logistics'
            },
            type: 'logistics',
            status: 'draft',
            value: 8960000,
            currency: 'GHS',
            startDate: '2025-02-01',
            endDate: '2027-01-31',
            renewalDate: null,
            paymentTerms: 'NET 30',
            deliveryTerms: 'Door-to-Door',
            volume: '500 MT/month',
            pricePerUnit: 450.00,
            totalVolume: 12000,
            deliveredVolume: 0,
            performanceRating: 0,
            lastActivity: '2025-01-10',
            keyTerms: [
                'Dedicated fleet assignment',
                'GPS tracking mandatory',
                'Insurance coverage included',
                'Performance bonuses applicable'
            ],
            milestones: [
                { date: '2025-01-15', title: 'Legal Review', status: 'pending' },
                { date: '2025-01-25', title: 'Final Approval', status: 'pending' },
                { date: '2025-02-01', title: 'Contract Execution', status: 'pending' }
            ]
        }
    ];
    // Contract value trend
    const contractValueTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
                label: 'Contract Value (₵ Millions)',
                data: [45.2, 47.8, 52.1, 48.6, 51.3, 54.7, 49.8, 53.2, 55.9, 52.4, 48.6, 50.1],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
    };
    // Contract type distribution
    const contractTypeData = {
        labels: ['Fuel Supply', 'Equipment', 'Services', 'Logistics', 'Maintenance'],
        datasets: [{
                data: [65, 12, 15, 5, 3],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
    };
    // Contract status distribution
    const contractStatusData = {
        labels: ['Active', 'Draft', 'Expiring Soon', 'Expired', 'Under Review'],
        datasets: [{
                label: 'Number of Contracts',
                data: [98, 12, 8, 23, 15],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10B981',
                borderWidth: 1
            }]
    };
    (0, react_1.useEffect)(() => {
        // Simulate API call
        setTimeout(() => {
            setContracts(contractsData);
            setLoading(false);
        }, 1000);
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'under_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'suspended': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const getContractTypeIcon = (type) => {
        switch (type) {
            case 'fuel_supply':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>);
            case 'equipment':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>);
            case 'maintenance':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>);
            case 'security':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>);
            case 'logistics':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8m-8 0H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2h-5"/>
          </svg>);
            default:
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>);
        }
    };
    const filteredContracts = contracts.filter(contract => {
        const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
        const matchesType = selectedType === 'all' || contract.type === selectedType;
        return matchesSearch && matchesStatus && matchesType;
    });
    const calculateProgress = (contract) => {
        if (contract.totalVolume === 0)
            return 0;
        return Math.round((contract.deliveredVolume / contract.totalVolume) * 100);
    };
    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Supplier Contracts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage supplier contracts, track performance, and monitor renewals
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <link_1.default href="/suppliers">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
                ← Back to Suppliers
              </framer_motion_1.motion.button>
            </link_1.default>
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
              Create New Contract
            </framer_motion_1.motion.button>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contracts</p>
                  <p className="text-3xl font-bold text-blue-600">{contractMetrics.totalContracts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Contracts</p>
                  <p className="text-3xl font-bold text-green-600">{contractMetrics.activeContracts}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-3xl font-bold text-purple-600">₵{(contractMetrics.totalValue / 1000000).toFixed(0)}M</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                  <p className="text-3xl font-bold text-red-600">{contractMetrics.expiringSoon}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
              <h3 className="text-lg font-semibold mb-4">Contract Value Trend</h3>
              <charts_1.LineChart data={contractValueTrendData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Type Distribution</h3>
              <charts_1.PieChart data={contractTypeData} height={300}/>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Contract Status Chart */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contract Status Overview</h3>
            <charts_1.BarChart data={contractStatusData} height={350}/>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Contracts Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Contract Management</h3>
              <div className="flex space-x-2 mt-4 lg:mt-0">
                <input type="text" placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
                <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="fuel_supply">Fuel Supply</option>
                  <option value="equipment">Equipment</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Contract</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Performance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract, index) => (<framer_motion_1.motion.tr key={contract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${contract.type === 'fuel_supply' ? 'bg-blue-100 text-blue-600' :
                contract.type === 'equipment' ? 'bg-purple-100 text-purple-600' :
                    contract.type === 'maintenance' ? 'bg-green-100 text-green-600' :
                        contract.type === 'security' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'}`}>
                            {getContractTypeIcon(contract.type)}
                          </div>
                          <div>
                            <p className="font-medium">{contract.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{contract.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <link_1.default href={`/suppliers/${contract.supplier.id}/profile`}>
                          <p className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                            {contract.supplier.name}
                          </p>
                        </link_1.default>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-sm">{contract.type.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4 px-4 font-medium">₵{contract.value.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p>{new Date(contract.startDate).toLocaleDateString()}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            to {new Date(contract.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-red-600">
                            {getDaysRemaining(contract.endDate) > 0
                ? `${getDaysRemaining(contract.endDate)} days left`
                : 'Expired'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {contract.totalVolume > 0 ? (<div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculateProgress(contract)}%` }}/>
                            </div>
                            <span className="text-sm">{calculateProgress(contract)}%</span>
                          </div>) : (<span className="text-sm text-gray-500">Service Contract</span>)}
                      </td>
                      <td className="py-4 px-4">
                        {contract.performanceRating > 0 ? (<div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">{contract.performanceRating}/5</span>
                            <div className="flex space-x-0.5">
                              {[1, 2, 3, 4, 5].map(star => (<svg key={star} className={`w-3 h-3 ${star <= contract.performanceRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>))}
                            </div>
                          </div>) : (<span className="text-sm text-gray-500">No rating</span>)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" title="View Contract">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" title="Edit Contract">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </framer_motion_1.motion.button>
                          <framer_motion_1.motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors" title="Download">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
exports.default = SupplierContracts;
//# sourceMappingURL=contracts.js.map