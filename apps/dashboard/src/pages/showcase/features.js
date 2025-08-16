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
const ui_1 = require("@/components/ui");
const FeaturesShowcase = () => {
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [selectedFeature, setSelectedFeature] = (0, react_1.useState)(null);
    const [showDetails, setShowDetails] = (0, react_1.useState)(false);
    const features = [
        {
            id: 'station-management',
            category: 'Operations',
            title: 'Fuel Station Management',
            description: 'Comprehensive management of fuel stations with real-time monitoring, inventory tracking, and operational analytics',
            icon: '⛽',
            benefits: [
                'Real-time fuel level monitoring',
                'Automated inventory alerts',
                'Multi-station dashboard',
                'Staff management system',
                'Equipment maintenance tracking',
            ],
            techStack: ['React', 'WebSocket', 'PostgreSQL', 'IoT Sensors'],
            metrics: [
                { label: 'Stations Managed', value: '247', color: 'text-blue-400' },
                { label: 'Uptime', value: '99.8%', color: 'text-green-400' },
                { label: 'Response Time', value: '<2s', color: 'text-yellow-400' },
            ],
            status: 'live',
            complexity: 'advanced',
        },
        {
            id: 'uppf-claims',
            category: 'Regulatory',
            title: 'UPPF Claims Processing',
            description: 'Automated Under-Recovery of Petroleum Product Freight claims processing with GPS validation and three-way reconciliation',
            icon: '💰',
            benefits: [
                'Automated claim generation',
                'GPS route validation',
                'Three-way reconciliation',
                'NPA integration',
                'Real-time status tracking',
            ],
            techStack: ['Node.js', 'GPS APIs', 'Machine Learning', 'Blockchain'],
            metrics: [
                { label: 'Claims Processed', value: '1,245', color: 'text-purple-400' },
                { label: 'Success Rate', value: '94.2%', color: 'text-green-400' },
                { label: 'Avg Processing', value: '24h', color: 'text-blue-400' },
            ],
            status: 'live',
            complexity: 'expert',
        },
        {
            id: 'pricing-automation',
            category: 'Pricing',
            title: 'Dynamic Pricing Engine',
            description: 'Intelligent pricing automation with market analysis, competitor tracking, and profit optimization',
            icon: '💹',
            benefits: [
                'Real-time price updates',
                'Market-based adjustments',
                'Profit margin optimization',
                'Competitor price tracking',
                'Regulatory compliance',
            ],
            techStack: ['Python', 'TensorFlow', 'Redis', 'Apache Kafka'],
            metrics: [
                { label: 'Price Updates', value: '15,247', color: 'text-orange-400' },
                { label: 'Accuracy', value: '98.5%', color: 'text-green-400' },
                { label: 'Margin Improvement', value: '+12%', color: 'text-yellow-400' },
            ],
            status: 'live',
            complexity: 'expert',
        },
        {
            id: 'financial-reporting',
            category: 'Finance',
            title: 'Financial Reporting Suite',
            description: 'Comprehensive financial reporting with IFRS compliance, automated journal entries, and real-time analytics',
            icon: '📈',
            benefits: [
                'IFRS 16 compliance',
                'Automated journal entries',
                'Real-time financial data',
                'Multi-currency support',
                'Audit trail management',
            ],
            techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Chart.js'],
            metrics: [
                { label: 'Reports Generated', value: '892', color: 'text-cyan-400' },
                { label: 'Accuracy', value: '99.9%', color: 'text-green-400' },
                { label: 'Processing Speed', value: '5.2s', color: 'text-blue-400' },
            ],
            status: 'live',
            complexity: 'advanced',
        },
        {
            id: 'fleet-management',
            category: 'Logistics',
            title: 'Fleet Management System',
            description: 'Complete fleet management with GPS tracking, maintenance scheduling, and driver performance monitoring',
            icon: '🚚',
            benefits: [
                'Real-time GPS tracking',
                'Fuel consumption monitoring',
                'Maintenance scheduling',
                'Driver performance metrics',
                'Route optimization',
            ],
            techStack: ['React Native', 'GPS APIs', 'MongoDB', 'WebSocket'],
            metrics: [
                { label: 'Vehicles Tracked', value: '156', color: 'text-green-400' },
                { label: 'Fuel Savings', value: '18%', color: 'text-yellow-400' },
                { label: 'On-Time Delivery', value: '96%', color: 'text-blue-400' },
            ],
            status: 'live',
            complexity: 'advanced',
        },
        {
            id: 'dealer-onboarding',
            category: 'Business',
            title: 'Dealer Onboarding System',
            description: 'Streamlined dealer onboarding with document management, compliance checking, and automated workflows',
            icon: '🤝',
            benefits: [
                'Digital document submission',
                'Automated compliance checks',
                'Credit assessment integration',
                'Workflow automation',
                'Status tracking dashboard',
            ],
            techStack: ['React', 'Node.js', 'AWS S3', 'Machine Learning'],
            metrics: [
                { label: 'Dealers Onboarded', value: '89', color: 'text-purple-400' },
                { label: 'Time Reduction', value: '65%', color: 'text-green-400' },
                { label: 'Success Rate', value: '92%', color: 'text-blue-400' },
            ],
            status: 'beta',
            complexity: 'advanced',
        },
        {
            id: 'ai-analytics',
            category: 'Intelligence',
            title: 'AI-Powered Analytics',
            description: 'Advanced analytics with machine learning insights, predictive modeling, and automated recommendations',
            icon: '🤖',
            benefits: [
                'Predictive maintenance',
                'Demand forecasting',
                'Anomaly detection',
                'Customer behavior analysis',
                'Automated insights',
            ],
            techStack: ['Python', 'TensorFlow', 'Apache Spark', 'Elasticsearch'],
            metrics: [
                { label: 'ML Models', value: '12', color: 'text-cyan-400' },
                { label: 'Prediction Accuracy', value: '87%', color: 'text-green-400' },
                { label: 'Insights Generated', value: '2,456', color: 'text-purple-400' },
            ],
            status: 'beta',
            complexity: 'expert',
        },
        {
            id: 'mobile-app',
            category: 'Mobile',
            title: 'Mobile Application Suite',
            description: 'Native mobile applications for field operations, customer engagement, and real-time monitoring',
            icon: '📱',
            benefits: [
                'Offline capability',
                'Push notifications',
                'Biometric authentication',
                'Camera integration',
                'Real-time sync',
            ],
            techStack: ['React Native', 'SQLite', 'Firebase', 'Biometrics API'],
            metrics: [
                { label: 'Active Users', value: '1,247', color: 'text-green-400' },
                { label: 'App Rating', value: '4.8/5', color: 'text-yellow-400' },
                { label: 'Crash Rate', value: '<0.1%', color: 'text-blue-400' },
            ],
            status: 'planned',
            complexity: 'advanced',
        },
    ];
    const categories = [
        { id: 'all', label: 'All Features', count: features.length },
        { id: 'Operations', label: 'Operations', count: features.filter(f => f.category === 'Operations').length },
        { id: 'Finance', label: 'Finance', count: features.filter(f => f.category === 'Finance').length },
        { id: 'Regulatory', label: 'Regulatory', count: features.filter(f => f.category === 'Regulatory').length },
        { id: 'Intelligence', label: 'AI & Analytics', count: features.filter(f => f.category === 'Intelligence').length },
    ];
    const filteredFeatures = selectedCategory === 'all'
        ? features
        : features.filter(f => f.category === selectedCategory);
    const getStatusColor = (status) => {
        switch (status) {
            case 'live': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'beta': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'planned': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };
    const getComplexityColor = (complexity) => {
        switch (complexity) {
            case 'basic': return 'text-green-400';
            case 'advanced': return 'text-yellow-400';
            case 'expert': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };
    const liveFeatures = features.filter(f => f.status === 'live').length;
    const betaFeatures = features.filter(f => f.status === 'beta').length;
    const plannedFeatures = features.filter(f => f.status === 'planned').length;
    const totalBenefits = features.reduce((sum, feature) => sum + feature.benefits.length, 0);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-gradient">
              System Features
            </h1>
          </div>
          <p className="text-dark-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Explore the comprehensive feature set of the Ghana OMC ERP system. From fuel station management 
            to AI-powered analytics, discover how our platform drives operational excellence.
          </p>
        </framer_motion_1.motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Live Features</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">{liveFeatures}</p>
              <p className="text-sm text-dark-400">production ready</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Beta Features</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{betaFeatures}</p>
              <p className="text-sm text-dark-400">in testing</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Planned</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{plannedFeatures}</p>
              <p className="text-sm text-dark-400">in development</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Benefits</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{totalBenefits}</p>
              <p className="text-sm text-dark-400">key advantages</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}>
              {category.label}
              <span className="ml-2 px-2 py-0.5 bg-dark-600 rounded-full text-xs">
                {category.count}
              </span>
            </button>))}
        </div>

        {/* Features Grid */}
        <framer_motion_1.motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <framer_motion_1.AnimatePresence>
            {filteredFeatures.map((feature, index) => (<framer_motion_1.motion.div key={feature.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }}>
                <ui_1.Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                  <ui_1.CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-dark-400 text-xs">{feature.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(feature.status)}`}>
                          {feature.status.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium ${getComplexityColor(feature.complexity)}`}>
                          {feature.complexity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-dark-400 text-sm mb-4 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                    
                    {/* Key Metrics */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-white font-medium text-sm">Key Metrics:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {feature.metrics.map((metric, metricIndex) => (<div key={metricIndex} className="flex justify-between items-center">
                            <span className="text-dark-400 text-xs">{metric.label}</span>
                            <span className={`text-xs font-bold ${metric.color}`}>{metric.value}</span>
                          </div>))}
                      </div>
                    </div>
                    
                    {/* Benefits Preview */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-white font-medium text-sm">Key Benefits:</h4>
                      <div className="space-y-1">
                        {feature.benefits.slice(0, 3).map((benefit, benefitIndex) => (<div key={benefitIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                            <span className="text-dark-300 text-xs">{benefit}</span>
                          </div>))}
                        {feature.benefits.length > 3 && (<div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-dark-500 rounded-full"></div>
                            <span className="text-dark-500 text-xs">+{feature.benefits.length - 3} more benefits</span>
                          </div>)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <div className="flex flex-wrap gap-1">
                        {feature.techStack.slice(0, 2).map((tech, techIndex) => (<span key={techIndex} className="inline-flex px-2 py-1 text-xs bg-dark-600 text-dark-300 rounded">
                            {tech}
                          </span>))}
                        {feature.techStack.length > 2 && (<span className="text-xs text-dark-500">+{feature.techStack.length - 2}</span>)}
                      </div>
                      
                      <ui_1.Button variant="ghost" size="sm" onClick={() => {
                setSelectedFeature(feature);
                setShowDetails(true);
            }} className="group-hover:bg-primary-500/20 group-hover:text-primary-400">
                        Details
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </ui_1.Button>
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>
              </framer_motion_1.motion.div>))}
          </framer_motion_1.AnimatePresence>
        </framer_motion_1.motion.div>

        {/* Feature Detail Modal */}
        <framer_motion_1.AnimatePresence>
          {showDetails && selectedFeature && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetails(false)}>
              <framer_motion_1.motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-dark-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{selectedFeature.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedFeature.title}</h2>
                      <p className="text-primary-400">{selectedFeature.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedFeature.status)}`}>
                      {selectedFeature.status.toUpperCase()}
                    </span>
                    <ui_1.Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </ui_1.Button>
                  </div>
                </div>
                
                <p className="text-dark-300 text-lg mb-6 leading-relaxed">{selectedFeature.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Benefits */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Key Benefits</h3>
                    <div className="space-y-3">
                      {selectedFeature.benefits.map((benefit, index) => (<div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-dark-300">{benefit}</span>
                        </div>))}
                    </div>
                  </div>
                  
                  {/* Tech Stack */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeature.techStack.map((tech, index) => (<span key={index} className="inline-flex px-3 py-2 text-sm bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30">
                          {tech}
                        </span>))}
                    </div>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedFeature.metrics.map((metric, index) => (<ui_1.Card key={index}>
                        <ui_1.CardContent className="p-4 text-center">
                          <p className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                          <p className="text-dark-400 text-sm">{metric.label}</p>
                        </ui_1.CardContent>
                      </ui_1.Card>))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <ui_1.Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </ui_1.Button>
                  <ui_1.Button variant="primary">
                    Learn More
                  </ui_1.Button>
                </div>
              </framer_motion_1.motion.div>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = FeaturesShowcase;
//# sourceMappingURL=features.js.map