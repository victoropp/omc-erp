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
const ui_1 = require("@/components/ui");
const charts_1 = require("@/components/charts");
const link_1 = __importDefault(require("next/link"));
const HRDashboardPage = () => {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        loadHRMetrics();
    }, []);
    const loadHRMetrics = async () => {
        try {
            setLoading(true);
            // In production, this would fetch from the HR service
            // const data = await hrService.getHRAnalytics();
            setMetrics(sampleMetrics);
        }
        catch (error) {
            console.error('Failed to load HR metrics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const hrModules = [
        {
            title: 'Employee Management',
            description: 'Manage employee records, profiles, and lifecycle',
            icon: '👥',
            href: '/hr/employees',
            count: 247,
            color: 'blue'
        },
        {
            title: 'Leave Management',
            description: 'Handle leave requests, approvals, and tracking',
            icon: '🏖️',
            href: '/hr/leave',
            count: 18,
            color: 'green'
        },
        {
            title: 'Performance Reviews',
            description: 'Conduct performance evaluations and appraisals',
            icon: '📊',
            href: '/hr/performance',
            count: 45,
            color: 'purple'
        },
        {
            title: 'Training & Development',
            description: 'Manage training programs and certifications',
            icon: '🎓',
            href: '/hr/training',
            count: 32,
            color: 'orange'
        },
        {
            title: 'Payroll Management',
            description: 'Process payroll, benefits, and compensation',
            icon: '💰',
            href: '/hr/payroll',
            count: 247,
            color: 'red'
        },
        {
            title: 'Recruitment',
            description: 'Manage job postings, applications, and hiring',
            icon: '🎯',
            href: '/hr/recruitment',
            count: 12,
            color: 'indigo'
        },
        {
            title: 'Compliance & Reports',
            description: 'Generate HR reports and ensure compliance',
            icon: '📋',
            href: '/hr/compliance',
            count: 8,
            color: 'gray'
        },
        {
            title: 'Organization Chart',
            description: 'Visualize organizational structure',
            icon: '🏢',
            href: '/hr/org-chart',
            count: 0,
            color: 'pink'
        }
    ];
    // Sample data for demonstration
    const sampleMetrics = {
        totalEmployees: 247,
        activeEmployees: 235,
        newHires: 18,
        separations: 7,
        averageTenure: 1285, // in days
        vacancyRate: 4.9,
        turnoverRate: 8.2,
        absenteeismRate: 3.1,
        departmentBreakdown: [
            { department: 'Operations', count: 85, percentage: 34.4 },
            { department: 'Sales & Marketing', count: 42, percentage: 17.0 },
            { department: 'Technical Services', count: 38, percentage: 15.4 },
            { department: 'Finance', count: 28, percentage: 11.3 },
            { department: 'Human Resources', count: 22, percentage: 8.9 },
            { department: 'IT', count: 18, percentage: 7.3 },
            { department: 'Legal & Compliance', count: 14, percentage: 5.7 },
        ],
        statusBreakdown: [
            { status: 'Active', count: 235, percentage: 95.1 },
            { status: 'On Leave', count: 8, percentage: 3.2 },
            { status: 'Probation', count: 4, percentage: 1.6 },
        ],
        leaveMetrics: {
            totalLeaveRequests: 156,
            pendingApprovals: 18,
            averageLeaveDays: 12.5,
            leaveUtilizationRate: 78.3,
        },
        trainingMetrics: {
            totalTrainingHours: 2847,
            completedTrainings: 142,
            complianceTrainingRate: 96.8,
            averageTrainingCost: 1250,
        },
        performanceMetrics: {
            completedReviews: 198,
            averageRating: 3.7,
            highPerformers: 52,
            improvementRequired: 15,
        }
    };
    const getColorClasses = (color) => {
        const colors = {
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
            green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
            purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
            orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
            red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
            indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400',
            gray: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400',
            pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400',
        };
        return colors[color] || colors.blue;
    };
    if (loading || !metrics) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Human Resources Dashboard
            </h1>
            <p className="text-dark-400 mt-2">
              Employee management and organizational insights
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Report
            </ui_1.Button>
            <link_1.default href="/hr/employees/new">
              <ui_1.Button variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                New Employee
              </ui_1.Button>
            </link_1.default>
          </div>
        </framer_motion_1.motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-primary-400 mb-1">{metrics.totalEmployees}</p>
                <p className="text-sm text-green-400">↑ {metrics.newHires - metrics.separations} net growth</p>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Active Employees</h3>
                <p className="text-3xl font-bold text-green-400 mb-1">{metrics.activeEmployees}</p>
                <p className="text-sm text-dark-400">
                  {((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(1)}% active rate
                </p>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Average Tenure</h3>
                <p className="text-3xl font-bold text-blue-400 mb-1">
                  {Math.round(metrics.averageTenure / 365)} years
                </p>
                <p className="text-sm text-green-400">High retention</p>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Turnover Rate</h3>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{metrics.turnoverRate}%</p>
                <p className="text-sm text-green-400">Below industry average</p>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* HR Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hrModules.map((module, index) => (<framer_motion_1.motion.div key={module.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
              <link_1.default href={module.href}>
                <ui_1.Card className={`glass-card hover:scale-105 transform transition-all duration-300 cursor-pointer bg-gradient-to-r ${getColorClasses(module.color)} border`}>
                  <ui_1.CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{module.icon}</div>
                      {module.count > 0 && (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 ${getColorClasses(module.color)}`}>
                          {module.count}
                        </span>)}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{module.title}</h3>
                    <p className="text-sm text-dark-300 leading-relaxed">{module.description}</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </link_1.default>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <ui_1.Card>
              <ui_1.CardHeader title="Department Distribution"/>
              <ui_1.CardContent>
                <charts_1.PieChart data={metrics.departmentBreakdown.map(d => ({
            name: d.department,
            value: d.count,
            percentage: d.percentage
        }))}/>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <ui_1.Card>
              <ui_1.CardHeader title="Employee Status"/>
              <ui_1.CardContent>
                <charts_1.BarChart data={metrics.statusBreakdown.map(s => ({
            name: s.status,
            value: s.count
        }))}/>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <ui_1.Card>
              <ui_1.CardHeader title="Leave Management"/>
              <ui_1.CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Total Requests</span>
                  <span className="font-semibold text-white">{metrics.leaveMetrics.totalLeaveRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Pending Approval</span>
                  <span className="font-semibold text-yellow-400">{metrics.leaveMetrics.pendingApprovals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Avg Leave Days</span>
                  <span className="font-semibold text-blue-400">{metrics.leaveMetrics.averageLeaveDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Utilization Rate</span>
                  <span className="font-semibold text-green-400">{metrics.leaveMetrics.leaveUtilizationRate}%</span>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <ui_1.Card>
              <ui_1.CardHeader title="Training & Development"/>
              <ui_1.CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Total Hours</span>
                  <span className="font-semibold text-white">{metrics.trainingMetrics.totalTrainingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Completed</span>
                  <span className="font-semibold text-green-400">{metrics.trainingMetrics.completedTrainings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Compliance Rate</span>
                  <span className="font-semibold text-green-400">{metrics.trainingMetrics.complianceTrainingRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Avg Cost</span>
                  <span className="font-semibold text-blue-400">GHS {metrics.trainingMetrics.averageTrainingCost}</span>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <ui_1.Card>
              <ui_1.CardHeader title="Performance Reviews"/>
              <ui_1.CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Completed Reviews</span>
                  <span className="font-semibold text-white">{metrics.performanceMetrics.completedReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Average Rating</span>
                  <span className="font-semibold text-blue-400">{metrics.performanceMetrics.averageRating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">High Performers</span>
                  <span className="font-semibold text-green-400">{metrics.performanceMetrics.highPerformers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Need Improvement</span>
                  <span className="font-semibold text-red-400">{metrics.performanceMetrics.improvementRequired}</span>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Recent Activities */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <ui_1.Card>
            <ui_1.CardHeader title="Recent HR Activities"/>
            <ui_1.CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">New employee onboarded</p>
                    <p className="text-sm text-dark-400">Sarah Mensah joined Technical Services team</p>
                  </div>
                  <span className="text-sm text-dark-400">2 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Leave request submitted</p>
                    <p className="text-sm text-dark-400">12 employees submitted annual leave requests</p>
                  </div>
                  <span className="text-sm text-dark-400">4 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-lg bg-dark-800/50">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Performance reviews completed</p>
                    <p className="text-sm text-dark-400">Q4 2023 performance reviews finalized</p>
                  </div>
                  <span className="text-sm text-dark-400">1 day ago</span>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = HRDashboardPage;
//# sourceMappingURL=index.js.map