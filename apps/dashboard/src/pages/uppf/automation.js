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
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const index_1 = require("@/components/ui/index");
const Modal_1 = require("@/components/ui/Modal");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const UPPFAutomation = () => {
    const [automationRules, setAutomationRules] = (0, react_1.useState)([]);
    const [workflowTemplates, setWorkflowTemplates] = (0, react_1.useState)([]);
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showRuleModal, setShowRuleModal] = (0, react_1.useState)(false);
    const [showTemplateModal, setShowTemplateModal] = (0, react_1.useState)(false);
    const [selectedRule, setSelectedRule] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterCategory, setFilterCategory] = (0, react_1.useState)('all');
    const [newRule, setNewRule] = (0, react_1.useState)({
        name: '',
        description: '',
        trigger: '',
        priority: 'medium',
        conditions: [],
        actions: []
    });
    // Fetch automation data
    const fetchAutomationData = async () => {
        try {
            setLoading(true);
            const [rulesData, templatesData, metricsData] = await Promise.all([
                api_1.pricingService.get('/automation/rules'),
                api_1.pricingService.get('/automation/templates'),
                api_1.pricingService.get('/automation/metrics')
            ]);
            setAutomationRules(rulesData.rules || []);
            setWorkflowTemplates(templatesData.templates || []);
            setMetrics(metricsData);
        }
        catch (error) {
            console.error('Error fetching automation data:', error);
            react_hot_toast_1.toast.error('Failed to load automation data');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchAutomationData();
    }, []);
    // Create or update automation rule
    const saveRule = async () => {
        try {
            if (selectedRule) {
                await api_1.pricingService.put(`/automation/rules/${selectedRule.id}`, newRule);
                react_hot_toast_1.toast.success('Automation rule updated successfully');
            }
            else {
                await api_1.pricingService.post('/automation/rules', newRule);
                react_hot_toast_1.toast.success('Automation rule created successfully');
            }
            setShowRuleModal(false);
            setSelectedRule(null);
            setNewRule({
                name: '',
                description: '',
                trigger: '',
                priority: 'medium',
                conditions: [],
                actions: []
            });
            fetchAutomationData();
        }
        catch (error) {
            console.error('Error saving rule:', error);
            react_hot_toast_1.toast.error('Failed to save automation rule');
        }
    };
    // Toggle rule status
    const toggleRule = async (ruleId, enabled) => {
        try {
            await api_1.pricingService.patch(`/automation/rules/${ruleId}/toggle`, { enabled });
            react_hot_toast_1.toast.success(`Rule ${enabled ? 'enabled' : 'disabled'} successfully`);
            fetchAutomationData();
        }
        catch (error) {
            console.error('Error toggling rule:', error);
            react_hot_toast_1.toast.error('Failed to toggle rule status');
        }
    };
    // Delete automation rule
    const deleteRule = async (ruleId) => {
        if (!confirm('Are you sure you want to delete this rule?'))
            return;
        try {
            await api_1.pricingService.delete(`/automation/rules/${ruleId}`);
            react_hot_toast_1.toast.success('Automation rule deleted successfully');
            fetchAutomationData();
        }
        catch (error) {
            console.error('Error deleting rule:', error);
            react_hot_toast_1.toast.error('Failed to delete automation rule');
        }
    };
    // Execute rule manually
    const executeRule = async (ruleId) => {
        try {
            await api_1.pricingService.post(`/automation/rules/${ruleId}/execute`);
            react_hot_toast_1.toast.success('Rule executed successfully');
            fetchAutomationData();
        }
        catch (error) {
            console.error('Error executing rule:', error);
            react_hot_toast_1.toast.error('Failed to execute rule');
        }
    };
    // Import workflow template
    const importTemplate = async (templateId) => {
        try {
            const response = await api_1.pricingService.post(`/automation/templates/${templateId}/import`);
            react_hot_toast_1.toast.success('Template imported as automation rule');
            fetchAutomationData();
        }
        catch (error) {
            console.error('Error importing template:', error);
            react_hot_toast_1.toast.error('Failed to import template');
        }
    };
    // Filter rules
    const filteredRules = automationRules.filter(rule => {
        const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === 'all' ||
            (filterCategory === 'enabled' && rule.enabled) ||
            (filterCategory === 'disabled' && !rule.enabled) ||
            rule.priority === filterCategory;
        return matchesSearch && matchesFilter;
    });
    if (loading) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="UPPF Automation" subtitle="Intelligent Workflow Automation & Rules Engine">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout title="UPPF Automation" subtitle="Intelligent Workflow Automation & Rules Engine">
      <div className="space-y-6">
        {/* Automation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics?.totalRules || 0}</p>
                <p className="text-sm text-blue-500">Total Rules</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics?.activeRules || 0}</p>
                <p className="text-sm text-green-500">Active Rules</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics?.successfulExecutions || 0}</p>
                <p className="text-sm text-purple-500">Successful</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{metrics?.averageExecutionTime || 0}s</p>
                <p className="text-sm text-orange-500">Avg Time</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-yellow-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">₵{metrics?.costSavings?.toLocaleString() || 0}</p>
                <p className="text-sm text-yellow-500">Cost Savings</p>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Controls & Search */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card_1.Card className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Input_1.Input placeholder="Search automation rules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1"/>
                
                <Select_1.Select value={filterCategory} onChange={setFilterCategory} options={[
            { value: 'all', label: 'All Rules' },
            { value: 'enabled', label: 'Enabled Only' },
            { value: 'disabled', label: 'Disabled Only' },
            { value: 'high', label: 'High Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'low', label: 'Low Priority' }
        ]} className="min-w-[200px]"/>
              </div>
              
              <div className="flex gap-2">
                <Button_1.Button variant="outline" onClick={() => setShowTemplateModal(true)}>
                  Browse Templates
                </Button_1.Button>
                <Button_1.Button onClick={() => {
            setSelectedRule(null);
            setShowRuleModal(true);
        }}>
                  Create Rule
                </Button_1.Button>
              </div>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Automation Rules Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Automation Rules</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rule Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Success Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Executions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Run</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule, index) => (<framer_motion_1.motion.tr key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + index * 0.1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-gray-500">{rule.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <index_1.Badge variant={rule.enabled ? 'success' : 'secondary'}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </index_1.Badge>
                      </td>
                      <td className="py-3 px-4">
                        <index_1.Badge variant={rule.priority === 'high' ? 'danger' :
                rule.priority === 'medium' ? 'warning' : 'outline'}>
                          {rule.priority}
                        </index_1.Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${rule.successRate}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{rule.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{rule.executionCount}</p>
                          {rule.errorCount > 0 && (<p className="text-xs text-red-500">{rule.errorCount} errors</p>)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rule.lastExecuted ? (<p className="text-sm">
                            {new Date(rule.lastExecuted).toLocaleDateString()}
                          </p>) : (<p className="text-sm text-gray-500">Never</p>)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => toggleRule(rule.id, !rule.enabled)} className={`px-2 py-1 rounded text-xs font-medium ${rule.enabled
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                            {rule.enabled ? 'Disable' : 'Enable'}
                          </button>
                          
                          <button onClick={() => executeRule(rule.id)} className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Execute
                          </button>
                          
                          <button onClick={() => {
                setSelectedRule(rule);
                setNewRule({
                    name: rule.name,
                    description: rule.description,
                    trigger: rule.trigger,
                    priority: rule.priority,
                    conditions: rule.conditions,
                    actions: rule.actions
                });
                setShowRuleModal(true);
            }} className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                            Edit
                          </button>
                          
                          <button onClick={() => deleteRule(rule.id)} className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200">
                            Delete
                          </button>
                        </div>
                      </td>
                    </framer_motion_1.motion.tr>))}
                </tbody>
              </table>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Rule Creation/Edit Modal */}
        <Modal_1.Modal isOpen={showRuleModal} onClose={() => {
            setShowRuleModal(false);
            setSelectedRule(null);
        }} title={selectedRule ? 'Edit Automation Rule' : 'Create Automation Rule'}>
          <div className="space-y-4">
            <Input_1.Input label="Rule Name" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="Enter rule name..."/>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" rows={3} placeholder="Describe what this rule does..."/>
            </div>
            
            <Select_1.Select label="Trigger Event" value={newRule.trigger} onChange={(value) => setNewRule({ ...newRule, trigger: value })} options={[
            { value: 'claim_submitted', label: 'When Claim is Submitted' },
            { value: 'price_change', label: 'When Price Changes' },
            { value: 'settlement_ready', label: 'When Settlement is Ready' },
            { value: 'schedule', label: 'On Schedule' },
            { value: 'threshold_exceeded', label: 'When Threshold is Exceeded' }
        ]}/>
            
            <Select_1.Select label="Priority" value={newRule.priority} onChange={(value) => setNewRule({ ...newRule, priority: value })} options={[
            { value: 'high', label: 'High Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'low', label: 'Low Priority' }
        ]}/>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button_1.Button variant="outline" onClick={() => {
            setShowRuleModal(false);
            setSelectedRule(null);
        }}>
                Cancel
              </Button_1.Button>
              <Button_1.Button onClick={saveRule}>
                {selectedRule ? 'Update Rule' : 'Create Rule'}
              </Button_1.Button>
            </div>
          </div>
        </Modal_1.Modal>

        {/* Workflow Templates Modal */}
        <Modal_1.Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Workflow Templates" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflowTemplates.map((template) => (<Card_1.Card key={template.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">{template.name}</h4>
                    <index_1.Badge variant={template.complexity === 'simple' ? 'success' :
                template.complexity === 'moderate' ? 'warning' : 'danger'}>
                      {template.complexity}
                    </index_1.Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>{template.steps.length} steps</span>
                    <span>~{template.estimatedTime} min</span>
                  </div>
                  
                  <Button_1.Button size="sm" variant="outline" onClick={() => importTemplate(template.id)} className="w-full">
                    Import as Rule
                  </Button_1.Button>
                </Card_1.Card>))}
            </div>
          </div>
        </Modal_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = UPPFAutomation;
//# sourceMappingURL=automation.js.map