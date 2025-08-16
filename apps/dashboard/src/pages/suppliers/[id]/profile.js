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
const router_1 = require("next/router");
const SupplierProfile = () => {
    const router = (0, router_1.useRouter)();
    const { id } = router.query;
    const [supplier, setSupplier] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    // Sample supplier data - in real app, this would come from API
    const supplierData = {
        id: 'SUP-2025-001',
        name: 'Ghana National Petroleum Corporation',
        type: 'fuel',
        category: 'Primary',
        status: 'active',
        // Contact Information
        primaryContact: {
            name: 'Kwaku Anansi',
            title: 'Procurement Manager',
            phone: '+233-30-222-0100',
            email: 'k.anansi@gnpc.com.gh'
        },
        alternativeContact: {
            name: 'Akosua Mensah',
            title: 'Operations Director',
            phone: '+233-30-222-0101',
            email: 'a.mensah@gnpc.com.gh'
        },
        // Address Information
        address: {
            street: 'GNPC Tower, Tetteh Quarshie Interchange',
            city: 'Accra',
            region: 'Greater Accra',
            postalCode: 'GA-440-3215',
            country: 'Ghana'
        },
        // Business Information
        businessInfo: {
            registrationNumber: 'C-2345/1983',
            taxId: 'GHA-123456789',
            establishmentDate: '1983-07-15',
            website: 'www.gnpc.com.gh',
            employeeCount: '500+',
            annualRevenue: 2500000000,
            industryExperience: 40
        },
        // Financial Information
        financial: {
            bankName: 'Bank of Ghana',
            accountNumber: '1234567890',
            accountName: 'Ghana National Petroleum Corporation',
            swiftCode: 'GHBOGHAC',
            paymentTerms: 'NET 30',
            creditLimit: 50000000,
            creditUsed: 12500000
        },
        // Certifications and Compliance
        certifications: ['ISO 9001:2015', 'OHSAS 18001', 'ISO 14001:2015', 'API Q1'],
        licenses: ['Petroleum Trading License', 'Import/Export License', 'Environmental Permit'],
        // Performance Metrics
        performance: {
            overallRating: 4.8,
            onTimeDelivery: 96.5,
            qualityRating: 4.9,
            priceCompetitiveness: 4.6,
            responsiveness: 4.7,
            totalContracts: 12,
            activeContracts: 8,
            completedContracts: 89,
            contractValue: 156700000,
            yearlyVolume: 250000000
        },
        // Risk Assessment
        risk: {
            level: 'low',
            factors: [
                'Government-owned entity',
                'Long track record',
                'Strong financial position',
                'Regulatory compliance'
            ],
            lastAssessment: '2024-12-15'
        },
        // Recent Activity
        recentActivity: [
            {
                date: '2025-01-12',
                type: 'delivery',
                description: 'Delivered 50,000 barrels of crude oil',
                status: 'completed'
            },
            {
                date: '2025-01-10',
                type: 'contract',
                description: 'Contract CNT-2025-045 executed',
                status: 'active'
            },
            {
                date: '2025-01-08',
                type: 'payment',
                description: 'Payment of ₵2,450,000 received',
                status: 'completed'
            },
            {
                date: '2025-01-05',
                type: 'evaluation',
                description: 'Quarterly performance evaluation completed',
                status: 'completed'
            }
        ]
    };
    // Performance trend data
    const performanceTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
                label: 'Performance Score',
                data: [4.5, 4.6, 4.7, 4.8, 4.7, 4.8, 4.9, 4.8, 4.9, 4.8, 4.8, 4.8],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
    };
    // Contract distribution
    const contractDistributionData = {
        labels: ['Fuel Supply', 'Logistics', 'Maintenance', 'Consulting'],
        datasets: [{
                data: [65, 20, 10, 5],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
            }]
    };
    // Delivery performance
    const deliveryPerformanceData = {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
        datasets: [{
                label: 'On-Time Delivery %',
                data: [94.2, 95.1, 96.8, 97.2, 96.5],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 1
            }]
    };
    (0, react_1.useEffect)(() => {
        // Simulate API call
        setTimeout(() => {
            setSupplier(supplierData);
            setLoading(false);
        }, 1000);
    }, [id]);
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full"/>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    if (!supplier) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The requested supplier profile could not be found.</p>
          <link_1.default href="/suppliers">
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium">
              Back to Suppliers
            </framer_motion_1.motion.button>
          </link_1.default>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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
    const getActivityIcon = (type) => {
        switch (type) {
            case 'delivery':
                return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>);
            case 'contract':
                return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>);
            case 'payment':
                return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>);
            case 'evaluation':
                return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>);
            default:
                return (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>);
        }
    };
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'contracts', label: 'Contracts', icon: '📄' },
        { id: 'performance', label: 'Performance', icon: '📊' },
        { id: 'financial', label: 'Financial', icon: '💰' },
        { id: 'compliance', label: 'Compliance', icon: '✅' },
        { id: 'activity', label: 'Activity', icon: '📝' }
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {supplier.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(supplier.status)}`}>
                {supplier.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {supplier.type} supplier • {supplier.id}
            </p>
          </div>
          <div className="flex space-x-3">
            <link_1.default href="/suppliers">
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 glass border border-white/20 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all duration-300">
                ← Back to Suppliers
              </framer_motion_1.motion.button>
            </link_1.default>
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-glow-primary/20 hover:shadow-glow-primary/40 transition-all duration-300">
              Edit Supplier
            </framer_motion_1.motion.button>
          </div>
        </framer_motion_1.motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Rating</p>
                  <p className="text-3xl font-bold text-green-600">{supplier.performance.overallRating}/5</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
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
                  <p className="text-3xl font-bold text-blue-600">{supplier.performance.activeContracts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract Value</p>
                  <p className="text-3xl font-bold text-purple-600">₵{(supplier.performance.contractValue / 1000000).toFixed(1)}M</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-orange-600">{supplier.performance.onTimeDelivery}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Tab Navigation */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card_1.Card className="p-2">
            <div className="flex space-x-1">
              {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>))}
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Tab Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {activeTab === 'overview' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                      <p className="font-medium capitalize">{supplier.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                      <p className="font-medium">{supplier.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Established</p>
                      <p className="font-medium">{new Date(supplier.businessInfo.establishmentDate).getFullYear()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                      <p className="font-medium">{supplier.businessInfo.industryExperience} years</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium">
                      {supplier.address.street}<br />
                      {supplier.address.city}, {supplier.address.region}<br />
                      {supplier.address.country} {supplier.address.postalCode}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                    <a href={`https://${supplier.businessInfo.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:text-primary-700">
                      {supplier.businessInfo.website}
                    </a>
                  </div>
                </div>
              </Card_1.Card>

              {/* Contact Information */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Primary Contact</h4>
                    <div className="space-y-2">
                      <p className="font-medium">{supplier.primaryContact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.primaryContact.title}</p>
                      <p className="text-sm">{supplier.primaryContact.phone}</p>
                      <p className="text-sm text-primary-600">{supplier.primaryContact.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Alternative Contact</h4>
                    <div className="space-y-2">
                      <p className="font-medium">{supplier.alternativeContact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.alternativeContact.title}</p>
                      <p className="text-sm">{supplier.alternativeContact.phone}</p>
                      <p className="text-sm text-primary-600">{supplier.alternativeContact.email}</p>
                    </div>
                  </div>
                </div>
              </Card_1.Card>

              {/* Risk Assessment */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(supplier.risk.level)}`}>
                      {supplier.risk.level.toUpperCase()} RISK
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last assessed: {new Date(supplier.risk.lastAssessment).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Factors:</p>
                    <ul className="space-y-1">
                      {supplier.risk.factors.map((factor, index) => (<li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>{factor}</span>
                        </li>))}
                    </ul>
                  </div>
                </div>
              </Card_1.Card>

              {/* Performance Charts */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
                <charts_1.LineChart data={performanceTrendData} height={200}/>
              </Card_1.Card>
            </div>)}

          {activeTab === 'contracts' && (<div className="space-y-6">
              {/* Contract Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card_1.Card className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{supplier.performance.totalContracts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Contracts</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{supplier.performance.activeContracts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Contracts</p>
                  </div>
                </Card_1.Card>
                <Card_1.Card className="p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{supplier.performance.completedContracts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Contracts</p>
                  </div>
                </Card_1.Card>
              </div>

              {/* Contract Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contract Type Distribution</h3>
                  <charts_1.PieChart data={contractDistributionData} height={300}/>
                </Card_1.Card>
                
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Delivery Performance</h3>
                  <charts_1.BarChart data={deliveryPerformanceData} height={300}/>
                </Card_1.Card>
              </div>
            </div>)}

          {activeTab === 'performance' && (<div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card_1.Card className="p-6 text-center">
                  <p className="text-2xl font-bold text-green-600">{supplier.performance.qualityRating}/5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quality Rating</p>
                </Card_1.Card>
                <Card_1.Card className="p-6 text-center">
                  <p className="text-2xl font-bold text-blue-600">{supplier.performance.priceCompetitiveness}/5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price Competitiveness</p>
                </Card_1.Card>
                <Card_1.Card className="p-6 text-center">
                  <p className="text-2xl font-bold text-purple-600">{supplier.performance.responsiveness}/5</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Responsiveness</p>
                </Card_1.Card>
                <Card_1.Card className="p-6 text-center">
                  <p className="text-2xl font-bold text-orange-600">{supplier.performance.onTimeDelivery}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</p>
                </Card_1.Card>
              </div>

              {/* Performance Chart */}
              <Card_1.Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">12-Month Performance Trend</h3>
                <charts_1.LineChart data={performanceTrendData} height={400}/>
              </Card_1.Card>
            </div>)}

          {activeTab === 'financial' && (<div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Banking Information */}
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                      <p className="font-medium">{supplier.financial.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                      <p className="font-medium">{supplier.financial.accountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                      <p className="font-medium">****{supplier.financial.accountNumber.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SWIFT Code</p>
                      <p className="font-medium">{supplier.financial.swiftCode}</p>
                    </div>
                  </div>
                </Card_1.Card>

                {/* Credit Information */}
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Credit Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Terms</p>
                      <p className="font-medium">{supplier.financial.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Credit Limit</p>
                      <p className="font-medium">₵{supplier.financial.creditLimit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Credit Used</p>
                      <p className="font-medium">₵{supplier.financial.creditUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Credit Utilization</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(supplier.financial.creditUsed / supplier.financial.creditLimit) * 100}%` }}/>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((supplier.financial.creditUsed / supplier.financial.creditLimit) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card_1.Card>
              </div>
            </div>)}

          {activeTab === 'compliance' && (<div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certifications */}
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                  <div className="space-y-3">
                    {supplier.certifications.map((cert, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="font-medium">{cert}</span>
                      </div>))}
                  </div>
                </Card_1.Card>

                {/* Licenses */}
                <Card_1.Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Licenses</h3>
                  <div className="space-y-3">
                    {supplier.licenses.map((license, index) => (<div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span className="font-medium">{license}</span>
                      </div>))}
                  </div>
                </Card_1.Card>
              </div>
            </div>)}

          {activeTab === 'activity' && (<Card_1.Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {supplier.recentActivity.map((activity, index) => (<div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                    activity.status === 'active' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString()} • {activity.type}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>))}
              </div>
            </Card_1.Card>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = SupplierProfile;
//# sourceMappingURL=profile.js.map