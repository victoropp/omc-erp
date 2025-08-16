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
const router_1 = require("next/router");
const FuturisticDashboardLayout_1 = require("@/components/layout/FuturisticDashboardLayout");
const ui_1 = require("@/components/ui");
const ShowcaseOverview = () => {
    const router = (0, router_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [activeSection, setActiveSection] = (0, react_1.useState)(null);
    const showcaseSections = [
        {
            id: 'components',
            title: 'Component Library',
            description: 'Interactive demonstration of our comprehensive UI component library with real-time functionality',
            icon: '🎨',
            route: '/showcase/components',
            status: 'ready',
            features: [
                'Real-time charts and analytics',
                'Advanced data tables',
                'Form wizards and validation',
                'Notification systems',
                'Glass morphism design',
                'Motion animations',
            ],
        },
        {
            id: 'features',
            title: 'System Features',
            description: 'Explore the powerful features and capabilities of the Ghana OMC ERP system',
            icon: '✨',
            route: '/showcase/features',
            status: 'ready',
            features: [
                'Fuel station management',
                'UPPF claims processing',
                'Pricing automation',
                'Financial reporting',
                'Fleet management',
                'Dealer onboarding',
            ],
        },
        {
            id: 'demo',
            title: 'Live Demo Environment',
            description: 'Experience the full system with sample data and interactive workflows',
            icon: '🕹️',
            route: '/showcase/demo',
            status: 'beta',
            features: [
                'Interactive walkthroughs',
                'Sample data scenarios',
                'Guided tours',
                'Feature spotlights',
                'Use case examples',
                'Performance metrics',
            ],
        },
        {
            id: 'documentation',
            title: 'Documentation Hub',
            description: 'Comprehensive documentation, guides, and API references',
            icon: '📚',
            route: '/showcase/documentation',
            status: 'ready',
            features: [
                'User guides and tutorials',
                'API documentation',
                'Integration guides',
                'Best practices',
                'Troubleshooting',
                'Video tutorials',
            ],
        },
        {
            id: 'architecture',
            title: 'System Architecture',
            description: 'Deep dive into the technical architecture and infrastructure design',
            icon: '🏢',
            route: '/showcase/architecture',
            status: 'coming-soon',
            features: [
                'Microservices overview',
                'Database design',
                'Security architecture',
                'Scalability patterns',
                'Integration points',
                'Deployment diagrams',
            ],
        },
        {
            id: 'performance',
            title: 'Performance Metrics',
            description: 'Real-time system performance, analytics, and benchmarks',
            icon: '📈',
            route: '/showcase/performance',
            status: 'beta',
            features: [
                'Response time analytics',
                'Throughput metrics',
                'Resource utilization',
                'Load testing results',
                'Optimization insights',
                'Benchmark comparisons',
            ],
        },
    ];
    const handleSectionClick = async (route) => {
        setLoading(true);
        await router.push(route);
        setLoading(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'beta': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'coming-soon': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'ready': return 'READY';
            case 'beta': return 'BETA';
            case 'coming-soon': return 'COMING SOON';
            default: return 'UNKNOWN';
        }
    };
    const readySections = showcaseSections.filter(s => s.status === 'ready').length;
    const betaSections = showcaseSections.filter(s => s.status === 'beta').length;
    const comingSoonSections = showcaseSections.filter(s => s.status === 'coming-soon').length;
    const totalFeatures = showcaseSections.reduce((sum, section) => sum + section.features.length, 0);
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎆</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-gradient">
              System Showcase
            </h1>
          </div>
          <p className="text-dark-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Explore the comprehensive features, components, and capabilities of the Ghana OMC ERP system. 
            Experience live demonstrations, interactive components, and detailed documentation.
          </p>
        </framer_motion_1.motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Ready Sections</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">{readySections}</p>
              <p className="text-sm text-dark-400">fully available</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Beta Features</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{betaSections}</p>
              <p className="text-sm text-dark-400">in testing</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Coming Soon</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">{comingSoonSections}</p>
              <p className="text-sm text-dark-400">in development</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Features</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{totalFeatures}</p>
              <p className="text-sm text-dark-400">showcased</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Featured Section */}
        <ui_1.Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Component Library Showcase</h2>
                <p className="text-blue-100 mb-4">
                  Experience our glass morphism UI components with real-time data and interactive elements.
                </p>
                <div className="flex space-x-2">
                  <ui_1.Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" onClick={() => handleSectionClick('/showcase/components')}>
                    View Components
                  </ui_1.Button>
                  <ui_1.Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleSectionClick('/showcase/demo')}>
                    Try Live Demo
                  </ui_1.Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-6xl">🎨</span>
                </div>
              </div>
            </div>
          </div>
        </ui_1.Card>

        {/* Showcase Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseSections.map((section, index) => (<framer_motion_1.motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} onHoverStart={() => setActiveSection(section.id)} onHoverEnd={() => setActiveSection(null)}>
              <ui_1.Card className={`cursor-pointer transition-all duration-300 group h-full ${activeSection === section.id ? 'shadow-2xl border-primary-500/50' : 'hover:shadow-xl'}`}>
                <ui_1.CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(section.status)}`}>
                      {getStatusLabel(section.status)}
                    </span>
                  </div>
                  
                  <p className="text-dark-400 text-sm mb-4 leading-relaxed flex-grow">
                    {section.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <h4 className="text-white font-medium text-sm">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {section.features.slice(0, 4).map((feature, featureIndex) => (<div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                          <span className="text-dark-300 text-xs">{feature}</span>
                        </div>))}
                      {section.features.length > 4 && (<div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-dark-500 rounded-full"></div>
                          <span className="text-dark-500 text-xs">+{section.features.length - 4} more features</span>
                        </div>)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto pt-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${section.status === 'ready' ? 'bg-green-400' :
                section.status === 'beta' ? 'bg-blue-400 animate-pulse' :
                    'bg-yellow-400 animate-pulse'}`}></div>
                      <span className="text-xs text-dark-500">
                        {section.status === 'ready' && 'Available Now'}
                        {section.status === 'beta' && 'Beta Testing'}
                        {section.status === 'coming-soon' && 'In Development'}
                      </span>
                    </div>
                    
                    <ui_1.Button variant="ghost" size="sm" onClick={() => handleSectionClick(section.route)} disabled={loading || section.status === 'coming-soon'} className={`group-hover:bg-primary-500/20 group-hover:text-primary-400 ${section.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {section.status === 'coming-soon' ? 'Coming Soon' : 'Explore'}
                      {section.status !== 'coming-soon' && (<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>)}
                    </ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Quick Navigation */}
        <ui_1.Card>
          <ui_1.CardHeader title="Quick Navigation"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ui_1.Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => handleSectionClick('/showcase/components')}>
                <span className="text-2xl">🎨</span>
                <span className="font-medium">UI Components</span>
                <span className="text-xs text-dark-400">Interactive demos</span>
              </ui_1.Button>
              
              <ui_1.Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => handleSectionClick('/showcase/features')}>
                <span className="text-2xl">✨</span>
                <span className="font-medium">System Features</span>
                <span className="text-xs text-dark-400">Core functionality</span>
              </ui_1.Button>
              
              <ui_1.Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => handleSectionClick('/showcase/demo')}>
                <span className="text-2xl">🕹️</span>
                <span className="font-medium">Live Demo</span>
                <span className="text-xs text-dark-400">Interactive walkthrough</span>
              </ui_1.Button>
              
              <ui_1.Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => handleSectionClick('/showcase/documentation')}>
                <span className="text-2xl">📚</span>
                <span className="font-medium">Documentation</span>
                <span className="text-xs text-dark-400">Guides & tutorials</span>
              </ui_1.Button>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* System Stats */}
        <ui_1.Card>
          <ui_1.CardHeader title="System Highlights"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">High Performance</h3>
                <p className="text-dark-400 text-sm">
                  Optimized for speed with sub-100ms response times and real-time data processing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
                <p className="text-dark-400 text-sm">
                  Bank-grade security with encryption, audit trails, and comprehensive access controls
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">User-Friendly</h3>
                <p className="text-dark-400 text-sm">
                  Intuitive interface design with comprehensive training and 24/7 support available
                </p>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ShowcaseOverview;
//# sourceMappingURL=index.js.map