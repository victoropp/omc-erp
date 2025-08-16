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
const charts_1 = require("@/components/charts");
const react_hot_toast_1 = require("react-hot-toast");
const DemoEnvironment = () => {
    const [activeDemo, setActiveDemo] = (0, react_1.useState)(null);
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [completedSteps, setCompletedSteps] = (0, react_1.useState)([]);
    const [demoData, setDemoData] = (0, react_1.useState)([]);
    const demoScenarios = [
        {
            id: 'station-setup',
            title: 'New Fuel Station Setup',
            description: 'Complete walkthrough of setting up a new fuel station in the system',
            icon: '⛽',
            duration: '8 minutes',
            difficulty: 'beginner',
            category: 'Operations',
            steps: [
                {
                    title: 'Station Registration',
                    description: 'Register basic station information including location, capacity, and contact details',
                    action: 'Fill out station registration form',
                },
                {
                    title: 'Equipment Configuration',
                    description: 'Configure fuel pumps, tanks, and IoT sensors for real-time monitoring',
                    action: 'Set up equipment monitoring',
                },
                {
                    title: 'Staff Assignment',
                    description: 'Assign station manager and attendants with appropriate roles and permissions',
                    action: 'Create user accounts and assign roles',
                },
                {
                    title: 'Inventory Setup',
                    description: 'Configure initial fuel inventory and set up automatic reorder points',
                    action: 'Set inventory levels and alerts',
                    highlight: true,
                },
                {
                    title: 'Go Live',
                    description: 'Activate the station and begin real-time operations monitoring',
                    action: 'Activate station operations',
                },
            ],
            outcome: 'Station is fully operational with real-time monitoring and staff management',
        },
        {
            id: 'uppf-claim',
            title: 'UPPF Claim Processing',
            description: 'Process an Under-Recovery claim from GPS validation to NPA submission',
            icon: '💰',
            duration: '12 minutes',
            difficulty: 'advanced',
            category: 'Regulatory',
            steps: [
                {
                    title: 'Trip Registration',
                    description: 'Register a new fuel delivery trip with origin, destination, and cargo details',
                    action: 'Create new delivery record',
                },
                {
                    title: 'GPS Tracking',
                    description: 'Monitor real-time GPS tracking during fuel transportation',
                    action: 'View live GPS tracking',
                    highlight: true,
                },
                {
                    title: 'Route Validation',
                    description: 'Validate the delivery route against approved transportation corridors',
                    action: 'Verify route compliance',
                },
                {
                    title: 'Three-Way Reconciliation',
                    description: 'Reconcile delivery records, GPS data, and fuel measurements',
                    action: 'Perform data reconciliation',
                    highlight: true,
                },
                {
                    title: 'Claim Generation',
                    description: 'Generate UPPF claim based on validated delivery and route data',
                    action: 'Create UPPF claim',
                },
                {
                    title: 'NPA Submission',
                    description: 'Submit claim to National Petroleum Authority for processing',
                    action: 'Submit to NPA system',
                },
            ],
            outcome: 'UPPF claim successfully submitted with 94% approval probability',
        },
        {
            id: 'price-update',
            title: 'Dynamic Price Management',
            description: 'Update fuel prices across multiple stations with market analysis',
            icon: '💹',
            duration: '6 minutes',
            difficulty: 'intermediate',
            category: 'Pricing',
            steps: [
                {
                    title: 'Market Analysis',
                    description: 'Analyze current market conditions and competitor pricing',
                    action: 'Review market data dashboard',
                },
                {
                    title: 'Price Calculation',
                    description: 'Calculate optimal prices using AI-powered pricing engine',
                    action: 'Run pricing algorithm',
                    highlight: true,
                },
                {
                    title: 'Impact Assessment',
                    description: 'Assess projected impact on margins and competitive position',
                    action: 'Review impact projections',
                },
                {
                    title: 'Price Approval',
                    description: 'Submit prices for management approval workflow',
                    action: 'Request price approval',
                },
                {
                    title: 'System Update',
                    description: 'Deploy approved prices across all station systems',
                    action: 'Update station prices',
                    highlight: true,
                },
            ],
            outcome: 'Prices updated across 247 stations with 12% margin improvement',
        },
        {
            id: 'dealer-onboarding',
            title: 'Dealer Onboarding Process',
            description: 'Complete onboarding workflow for a new fuel dealer',
            icon: '🤝',
            duration: '15 minutes',
            difficulty: 'intermediate',
            category: 'Business',
            steps: [
                {
                    title: 'Application Submission',
                    description: 'Dealer submits application with required documents',
                    action: 'Review application form',
                },
                {
                    title: 'Document Verification',
                    description: 'AI-powered verification of submitted documents',
                    action: 'Run document verification',
                },
                {
                    title: 'Credit Assessment',
                    description: 'Perform credit check and financial capability assessment',
                    action: 'Generate credit report',
                    highlight: true,
                },
                {
                    title: 'Site Inspection',
                    description: 'Schedule and conduct site inspection for compliance',
                    action: 'Review inspection checklist',
                },
                {
                    title: 'Contract Generation',
                    description: 'Generate dealer agreement with terms and conditions',
                    action: 'Create dealer contract',
                },
                {
                    title: 'Account Activation',
                    description: 'Activate dealer account and provide system access',
                    action: 'Activate dealer account',
                    highlight: true,
                },
            ],
            outcome: 'New dealer fully onboarded with 65% time reduction vs. manual process',
        },
    ];
    const categories = [
        { id: 'all', label: 'All Demos', count: demoScenarios.length },
        { id: 'Operations', label: 'Operations', count: demoScenarios.filter(d => d.category === 'Operations').length },
        { id: 'Regulatory', label: 'Regulatory', count: demoScenarios.filter(d => d.category === 'Regulatory').length },
        { id: 'Pricing', label: 'Pricing', count: demoScenarios.filter(d => d.category === 'Pricing').length },
        { id: 'Business', label: 'Business', count: demoScenarios.filter(d => d.category === 'Business').length },
    ];
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const filteredDemos = selectedCategory === 'all'
        ? demoScenarios
        : demoScenarios.filter(d => d.category === selectedCategory);
    (0, react_1.useEffect)(() => {
        // Generate sample real-time data
        const generateData = () => {
            const now = new Date();
            const data = Array.from({ length: 24 }, (_, i) => ({
                x: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
                y: Math.random() * 100 + 50
            }));
            setDemoData(data);
        };
        generateData();
        const interval = setInterval(generateData, 5000);
        return () => clearInterval(interval);
    }, []);
    const startDemo = (demoId) => {
        setActiveDemo(demoId);
        setCurrentStep(0);
        setIsRunning(true);
        setCompletedSteps([]);
        react_hot_toast_1.toast.success('Demo started! Follow the guided steps.');
    };
    const nextStep = () => {
        const demo = demoScenarios.find(d => d.id === activeDemo);
        if (demo && currentStep < demo.steps.length - 1) {
            setCompletedSteps(prev => [...prev, currentStep]);
            setCurrentStep(prev => prev + 1);
            react_hot_toast_1.toast.info(`Step ${currentStep + 2}: ${demo.steps[currentStep + 1].title}`);
        }
        else {
            completeDemo();
        }
    };
    const completeDemo = () => {
        const demo = demoScenarios.find(d => d.id === activeDemo);
        if (demo) {
            setCompletedSteps(prev => [...prev, currentStep]);
            setIsRunning(false);
            react_hot_toast_1.toast.success(`Demo completed! ${demo.outcome}`);
        }
    };
    const resetDemo = () => {
        setActiveDemo(null);
        setCurrentStep(0);
        setIsRunning(false);
        setCompletedSteps([]);
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-400 bg-green-500/20';
            case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
            case 'advanced': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };
    const currentDemo = demoScenarios.find(d => d.id === activeDemo);
    const progress = currentDemo ? ((completedSteps.length / currentDemo.steps.length) * 100) : 0;
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🕹️</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-gradient">
              Live Demo Environment
            </h1>
          </div>
          <p className="text-dark-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Experience interactive demonstrations of key system workflows. Follow guided scenarios 
            with real data to understand how the Ghana OMC ERP system operates.
          </p>
        </framer_motion_1.motion.div>

        {/* Active Demo Progress */}
        {activeDemo && currentDemo && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-4 z-10">
            <ui_1.Card className="border-primary-500/50 bg-dark-800/95 backdrop-blur-sm">
              <ui_1.CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{currentDemo.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentDemo.title}</h3>
                      <p className="text-primary-400">Step {currentStep + 1} of {currentDemo.steps.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-white font-medium">{Math.round(progress)}% Complete</p>
                      <p className="text-dark-400 text-sm">{currentDemo.duration} total</p>
                    </div>
                    <ui_1.Button variant="outline" size="sm" onClick={resetDemo}>
                      Exit Demo
                    </ui_1.Button>
                  </div>
                </div>
                
                <div className="w-full bg-dark-700 rounded-full h-2 mb-4">
                  <div className="bg-gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
                </div>
                
                {isRunning && (<div className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {currentStep + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">{currentDemo.steps[currentStep].title}</h4>
                        <p className="text-dark-300 mb-3">{currentDemo.steps[currentStep].description}</p>
                        {currentDemo.steps[currentStep].action && (<div className="flex items-center space-x-2 text-primary-400 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span>{currentDemo.steps[currentStep].action}</span>
                          </div>)}
                      </div>
                      <ui_1.Button variant="primary" onClick={nextStep} className={currentDemo.steps[currentStep].highlight ? 'animate-pulse' : ''}>
                        {currentStep === currentDemo.steps.length - 1 ? 'Complete' : 'Next Step'}
                      </ui_1.Button>
                    </div>
                  </div>)}
                
                {!isRunning && completedSteps.length > 0 && (<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-green-400 font-semibold">Demo Completed!</h4>
                        <p className="text-dark-300">{currentDemo.outcome}</p>
                      </div>
                    </div>
                  </div>)}
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>)}

        {/* Demo Categories */}
        {!activeDemo && (<div className="flex flex-wrap gap-2">
            {categories.map((category) => (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}>
                {category.label}
                <span className="ml-2 px-2 py-0.5 bg-dark-600 rounded-full text-xs">
                  {category.count}
                </span>
              </button>))}
          </div>)}

        {/* Demo Scenarios Grid */}
        {!activeDemo && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDemos.map((demo, index) => (<framer_motion_1.motion.div key={demo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                <ui_1.Card className="cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                  <ui_1.CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {demo.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {demo.title}
                          </h3>
                          <p className="text-dark-400 text-sm">{demo.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(demo.difficulty)}`}>
                          {demo.difficulty.toUpperCase()}
                        </span>
                        <span className="text-dark-400 text-xs">{demo.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-dark-300 mb-6 leading-relaxed flex-grow">
                      {demo.description}
                    </p>
                    
                    {/* Steps Preview */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-white font-medium">Demo Steps ({demo.steps.length}):</h4>
                      <div className="space-y-2">
                        {demo.steps.slice(0, 3).map((step, stepIndex) => (<div key={stepIndex} className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center text-dark-300 text-xs font-bold">
                              {stepIndex + 1}
                            </div>
                            <span className="text-dark-400 text-sm">{step.title}</span>
                            {step.highlight && (<span className="inline-flex px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                KEY
                              </span>)}
                          </div>))}
                        {demo.steps.length > 3 && (<div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center text-dark-500 text-xs">
                              +{demo.steps.length - 3}
                            </div>
                            <span className="text-dark-500 text-sm">more steps...</span>
                          </div>)}
                      </div>
                    </div>
                    
                    {/* Expected Outcome */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                      <h4 className="text-blue-400 font-medium text-sm mb-1">Expected Outcome:</h4>
                      <p className="text-dark-300 text-sm">{demo.outcome}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-dark-400 text-sm">Interactive Demo</span>
                      </div>
                      <ui_1.Button variant="primary" onClick={() => startDemo(demo.id)} className="group-hover:scale-105 transition-transform">
                        Start Demo
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </ui_1.Button>
                    </div>
                  </ui_1.CardContent>
                </ui_1.Card>
              </framer_motion_1.motion.div>))}
          </div>)}

        {/* Demo Environment Stats */}
        {!activeDemo && (<ui_1.Card>
            <ui_1.CardHeader title="Demo Environment Status"/>
            <ui_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-1">{demoScenarios.length}</p>
                  <p className="text-dark-400 text-sm">Demo Scenarios</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-blue-400 mb-1">Live</p>
                  <p className="text-dark-400 text-sm">Real-time Data</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-purple-400 mb-1">Interactive</p>
                  <p className="text-dark-400 text-sm">Guided Steps</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 mb-1">6-15</p>
                  <p className="text-dark-400 text-sm">Minutes Each</p>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Real-time Demo Data */}
        {!activeDemo && (<ui_1.Card>
            <ui_1.CardHeader title="Live System Metrics"/>
            <ui_1.CardContent>
              <div className="h-64">
                <charts_1.RealTimeChart type="area" data={[{
                    name: 'Demo Environment Activity',
                    data: demoData
                }]} colors={['#8B5CF6']} height={250} refreshInterval={5000}/>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DemoEnvironment;
//# sourceMappingURL=demo.js.map