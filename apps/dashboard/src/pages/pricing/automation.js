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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const AutomatedPricingWorkflows = () => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [automationRules, setAutomationRules] = (0, react_1.useState)([]);
    const [activeWorkflows, setActiveWorkflows] = (0, react_1.useState)([]);
    const [automationStats, setAutomationStats] = (0, react_1.useState)({});
    const [newRule, setNewRule] = (0, react_1.useState)({
        name: '',
        trigger: 'price_change',
        conditions: [],
        actions: [],
        enabled: true
    });
    // Mock automation data
    const mockData = {
        stats: {
            totalRules: 12,
            activeWorkflows: 8,
            automationRate: 94.2,
            timeSaved: 127.5
        },
        rules: [
            {
                id: 1,
                name: 'Dynamic Fuel Price Adjustment',
                trigger: 'crude_oil_price_change',
                enabled: true,
                lastExecuted: '2025-01-13 08:30:00',
                executions: 45,
                successRate: 98.7,
                conditions: [
                    'Crude oil price change > 2%',
                    'Market volatility < 5%'
                ],
                actions: [
                    'Adjust ex-refinery prices',
                    'Update dealer notifications',
                    'Generate price window'
                ]
            },
            {
                id: 2,
                name: 'UPPF Auto-Submission',
                trigger: 'price_window_activation',
                enabled: true,
                lastExecuted: '2025-01-12 18:00:00',
                executions: 23,
                successRate: 100,
                conditions: [
                    'Price window activated',
                    'All products have valid prices'
                ],
                actions: [
                    'Submit UPPF claims',
                    'Update regulatory filings',
                    'Send compliance notifications'
                ]
            },
            {
                id: 3,
                name: 'Margin Optimization',
                trigger: 'daily_review',
                enabled: true,
                lastExecuted: '2025-01-13 06:00:00',
                executions: 30,
                successRate: 95.4,
                conditions: [
                    'Market analysis complete',
                    'Competitive prices available'
                ],
                actions: [
                    'Optimize margin targets',
                    'Suggest price adjustments',
                    'Update pricing recommendations'
                ]
            },
            {
                id: 4,
                name: 'Dealer Settlement Processing',
                trigger: 'monthly_settlement',
                enabled: false,
                lastExecuted: '2025-01-01 00:00:00',
                executions: 2,
                successRate: 100,
                conditions: [
                    'Month-end reached',
                    'All transactions verified'
                ],
                actions: [
                    'Calculate dealer settlements',
                    'Generate payment schedules',
                    'Send settlement reports'
                ]
            }
        ],
        workflows: [
            {
                id: 'wf-001',
                name: 'Morning Price Update',
                status: 'running',
                progress: 75,
                startTime: '2025-01-13 06:00:00',
                estimatedCompletion: '2025-01-13 08:30:00',
                steps: [
                    { name: 'Fetch crude oil prices', status: 'completed' },
                    { name: 'Calculate PBU components', status: 'completed' },
                    { name: 'Generate price recommendations', status: 'in_progress' },
                    { name: 'Create price window', status: 'pending' },
                    { name: 'Notify stakeholders', status: 'pending' }
                ]
            },
            {
                id: 'wf-002',
                name: 'UPPF Compliance Check',
                status: 'completed',
                progress: 100,
                startTime: '2025-01-12 23:00:00',
                estimatedCompletion: '2025-01-12 23:45:00',
                steps: [
                    { name: 'Validate price windows', status: 'completed' },
                    { name: 'Check claim submissions', status: 'completed' },
                    { name: 'Generate compliance report', status: 'completed' },
                    { name: 'Submit to NPA', status: 'completed' }
                ]
            }
        ],
        performance: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                    label: 'Automation Rate (%)',
                    data: [89, 91, 93, 94, 95, 94.2],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
        },
        timeSavings: {
            labels: ['Manual Tasks', 'Automated Tasks'],
            datasets: [{
                    label: 'Hours per Week',
                    data: [25, 127.5],
                    backgroundColor: ['#EF4444', '#10B981']
                }]
        }
    };
    (0, react_1.useEffect)(() => {
        loadAutomationData();
        // Setup WebSocket for real-time updates
        api_1.wsService.connect();
        return () => {
            api_1.wsService.disconnect();
        };
    }, []);
    const loadAutomationData = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAutomationRules(mockData.rules);
            setActiveWorkflows(mockData.workflows);
            setAutomationStats(mockData.stats);
            react_hot_toast_1.toast.success('Automation data loaded successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load automation data');
            console.error('Automation loading error:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const toggleRule = async (ruleId) => {
        try {
            const updatedRules = automationRules.map(rule => rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule);
            setAutomationRules(updatedRules);
            const rule = updatedRules.find(r => r.id === ruleId);
            react_hot_toast_1.toast.success(`Rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to update rule');
        }
    };
    const executeRule = async (ruleId) => {
        try {
            react_hot_toast_1.toast.loading('Executing automation rule...');
            // Simulate rule execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            react_hot_toast_1.toast.success('Rule executed successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Rule execution failed');
        }
    };
    const createNewRule = async () => {
        if (!newRule.name) {
            react_hot_toast_1.toast.error('Please provide a rule name');
            return;
        }
        try {
            react_hot_toast_1.toast.loading('Creating automation rule...');
            // Simulate rule creation
            await new Promise(resolve => setTimeout(resolve, 1500));
            const rule = {
                id: Date.now(),
                ...newRule,
                lastExecuted: 'Never',
                executions: 0,
                successRate: 0
            };
            setAutomationRules(prev => [...prev, rule]);
            setNewRule({
                name: '',
                trigger: 'price_change',
                conditions: [],
                actions: [],
                enabled: true
            });
            react_hot_toast_1.toast.success('Automation rule created successfully');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create rule');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
            case 'completed': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'failed': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
        }
    };
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"/>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Automated Pricing Workflows
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Intelligent automation for pricing operations and compliance
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button onClick={() => setNewRule({ ...newRule, name: 'New Rule' })} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Create Rule
            </button>
            
            <button onClick={loadAutomationData} className="glass px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
              Refresh
            </button>
          </div>
        </framer_motion_1.motion.div>

        {/* Automation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Rules', value: mockData.stats.totalRules, color: 'text-blue-500', icon: '⚙️' },
            { title: 'Active Workflows', value: mockData.stats.activeWorkflows, color: 'text-green-500', icon: '🔄' },
            { title: 'Automation Rate', value: `${mockData.stats.automationRate}%`, color: 'text-purple-500', icon: '🤖' },
            { title: 'Time Saved', value: `${mockData.stats.timeSaved}h`, color: 'text-orange-500', icon: '⏰' }
        ].map((metric, index) => (<framer_motion_1.motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card_1.Card className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {metric.icon}
                  </div>
                </div>
              </Card_1.Card>
            </framer_motion_1.motion.div>))}
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Automation Performance" subtitle="Monthly automation rate trends"/>
              <Card_1.CardContent>
                <charts_1.LineChart data={mockData.performance} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card_1.Card className="p-6">
              <Card_1.CardHeader title="Time Savings" subtitle="Manual vs automated task hours"/>
              <Card_1.CardContent>
                <charts_1.BarChart data={mockData.timeSavings} height={300}/>
              </Card_1.CardContent>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Active Workflows */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Active Workflows" subtitle="Currently running automation workflows"/>
            <Card_1.CardContent>
              <div className="space-y-4">
                {activeWorkflows.map((workflow, index) => (<framer_motion_1.motion.div key={workflow.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="p-4 rounded-lg glass border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-white">{workflow.name}</h4>
                        <p className="text-sm text-gray-400">Started: {workflow.startTime}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <framer_motion_1.motion.div initial={{ width: 0 }} animate={{ width: `${workflow.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-2 rounded-full ${workflow.status === 'completed' ? 'bg-green-500' :
                workflow.status === 'running' ? 'bg-blue-500' :
                    'bg-gray-500'}`}/>
                      </div>
                    </div>
                    
                    {/* Workflow Steps */}
                    <div className="space-y-2">
                      {workflow.steps.map((step, stepIndex) => (<div key={stepIndex} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-500'}`}/>
                          <span className={`text-sm ${step.status === 'completed' ? 'text-green-400' :
                    step.status === 'in_progress' ? 'text-blue-400' :
                        'text-gray-400'}`}>
                            {step.name}
                          </span>
                        </div>))}
                    </div>
                  </framer_motion_1.motion.div>))}
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Automation Rules */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Automation Rules" subtitle="Configure and manage pricing automation rules"/>
            <Card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rule Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trigger</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Executions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Success Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Executed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationRules.map((rule, index) => (<framer_motion_1.motion.tr key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-white">{rule.name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {rule.conditions.length} conditions, {rule.actions.length} actions
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                            {rule.trigger.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <label className="flex items-center">
                            <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} className="mr-2"/>
                            <span className={`text-sm ${rule.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </td>
                        <td className="py-3 px-4 text-white">{rule.executions}</td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${rule.successRate >= 95 ? 'text-green-400' :
                rule.successRate >= 80 ? 'text-yellow-400' :
                    'text-red-400'}`}>
                            {rule.successRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{rule.lastExecuted}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button onClick={() => executeRule(rule.id)} disabled={!rule.enabled} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded text-xs transition-colors">
                              Execute
                            </button>
                            <button className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs transition-colors">
                              Edit
                            </button>
                          </div>
                        </td>
                      </framer_motion_1.motion.tr>))}
                  </tbody>
                </table>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Create New Rule */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card_1.Card className="p-6">
            <Card_1.CardHeader title="Create New Automation Rule" subtitle="Set up a new automated pricing workflow"/>
            <Card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Rule Name
                  </label>
                  <input type="text" value={newRule.name} onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter rule name" className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400"/>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Trigger
                  </label>
                  <select value={newRule.trigger} onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value }))} className="w-full glass px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                    <option value="price_change">Price Change</option>
                    <option value="time_based">Time Based</option>
                    <option value="market_event">Market Event</option>
                    <option value="manual_trigger">Manual Trigger</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <button onClick={createNewRule} className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                  Create Rule
                </button>
                <button onClick={() => setNewRule({ name: '', trigger: 'price_change', conditions: [], actions: [], enabled: true })} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Reset
                </button>
              </div>
            </Card_1.CardContent>
          </Card_1.Card>
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AutomatedPricingWorkflows;
//# sourceMappingURL=automation.js.map