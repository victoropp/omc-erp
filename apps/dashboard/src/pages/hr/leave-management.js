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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const LeaveManagementPage = () => {
    const [leaveRequests, setLeaveRequests] = (0, react_1.useState)([]);
    const [leaveBalances, setLeaveBalances] = (0, react_1.useState)([]);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [modalType, setModalType] = (0, react_1.useState)('request');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [activeTab, setActiveTab] = (0, react_1.useState)('requests');
    const [requestForm, setRequestForm] = (0, react_1.useState)({
        employeeId: '',
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [requestsData, balancesData, employeesData] = await Promise.all([
                api_1.hrService.getLeaveRequests(),
                api_1.hrService.getLeaveBalances?.() || Promise.resolve([]),
                api_1.hrService.getEmployees()
            ]);
            setLeaveRequests(requestsData || generateMockRequests());
            setLeaveBalances(balancesData || generateMockBalances());
            setEmployees(employeesData || []);
        }
        catch (error) {
            setLeaveRequests(generateMockRequests());
            setLeaveBalances(generateMockBalances());
            react_hot_toast_1.toast.error('Failed to load leave data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockRequests = () => [
        {
            id: 'lr1',
            employee: {
                id: 'e1',
                name: 'Kwame Asante',
                department: 'Operations',
                position: 'Fleet Manager',
                manager: 'Sarah Johnson'
            },
            type: 'annual',
            startDate: '2024-02-15',
            endDate: '2024-02-25',
            totalDays: 8,
            reason: 'Family vacation',
            status: 'pending',
            appliedDate: '2024-01-15T10:00:00Z'
        },
        {
            id: 'lr2',
            employee: {
                id: 'e2',
                name: 'Akosua Mensah',
                department: 'Finance',
                position: 'Accountant',
                manager: 'John Smith'
            },
            type: 'sick',
            startDate: '2024-01-10',
            endDate: '2024-01-12',
            totalDays: 3,
            reason: 'Medical treatment',
            status: 'approved',
            appliedDate: '2024-01-09T14:30:00Z',
            approvedBy: 'John Smith',
            approvedDate: '2024-01-09T16:00:00Z'
        }
    ];
    const generateMockBalances = () => [
        {
            employeeId: 'e1',
            employee: 'Kwame Asante',
            annual: { total: 21, used: 5, remaining: 16 },
            sick: { total: 10, used: 2, remaining: 8 },
            maternity: { total: 0, used: 0, remaining: 0 },
            paternity: { total: 7, used: 0, remaining: 7 },
            study: { total: 5, used: 0, remaining: 5 }
        },
        {
            employeeId: 'e2',
            employee: 'Akosua Mensah',
            annual: { total: 21, used: 8, remaining: 13 },
            sick: { total: 10, used: 3, remaining: 7 },
            maternity: { total: 90, used: 0, remaining: 90 },
            paternity: { total: 0, used: 0, remaining: 0 },
            study: { total: 5, used: 2, remaining: 3 }
        }
    ];
    const filteredRequests = leaveRequests.filter(request => {
        const matchesSearch = request.employee.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesType = filterType === 'all' || request.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });
    const handleApproveLeave = async (id) => {
        try {
            await api_1.hrService.approveLeaveRequest(id);
            react_hot_toast_1.toast.success('Leave approved successfully');
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to approve leave');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'default';
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'annual': return 'primary';
            case 'sick': return 'danger';
            case 'maternity': return 'success';
            case 'paternity': return 'success';
            case 'emergency': return 'warning';
            case 'study': return 'secondary';
            default: return 'default';
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Leave Management</h1>
            <p className="text-dark-400 mt-2">
              Manage employee leave requests and track leave balances
            </p>
          </div>
          
          <ui_1.Button variant="primary" onClick={() => { setModalType('request'); setIsModalOpen(true); }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Apply Leave
          </ui_1.Button>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-white">{leaveRequests.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Approved This Month</p>
                  <p className="text-2xl font-bold text-white">{leaveRequests.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Days Used</p>
                  <p className="text-2xl font-bold text-white">
                    {leaveBalances.reduce((sum, b) => sum + b.annual.used + b.sick.used, 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Avg Annual Leave</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(leaveBalances.reduce((sum, b) => sum + b.annual.remaining, 0) / leaveBalances.length || 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'requests', label: 'Leave Requests' },
            { key: 'balances', label: 'Leave Balances' },
            { key: 'calendar', label: 'Leave Calendar' }
        ].map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search by employee name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' }
        ]} className="w-full md:w-48"/>
              <ui_1.Select value={filterType} onChange={setFilterType} options={[
            { value: 'all', label: 'All Types' },
            { value: 'annual', label: 'Annual Leave' },
            { value: 'sick', label: 'Sick Leave' },
            { value: 'maternity', label: 'Maternity' },
            { value: 'paternity', label: 'Paternity' },
            { value: 'emergency', label: 'Emergency' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Content based on active tab */}
        {activeTab === 'requests' && (<ui_1.Card>
            <ui_1.CardHeader title="Leave Requests"/>
            <ui_1.CardContent>
              <ui_1.Table headers={[
                { key: 'employee', label: 'Employee' },
                { key: 'type', label: 'Leave Type' },
                { key: 'dates', label: 'Dates' },
                { key: 'days', label: 'Days' },
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredRequests.map(request => ({
                employee: (<div>
                      <p className="font-medium text-white">{request.employee.name}</p>
                      <p className="text-sm text-dark-400">{request.employee.department}</p>
                      <p className="text-xs text-dark-500">{request.employee.position}</p>
                    </div>),
                type: (<ui_1.Badge variant={getTypeColor(request.type)} className="capitalize">
                      {request.type}
                    </ui_1.Badge>),
                dates: (<div>
                      <p className="text-white">{new Date(request.startDate).toLocaleDateString()}</p>
                      <p className="text-sm text-dark-400">to {new Date(request.endDate).toLocaleDateString()}</p>
                    </div>),
                days: (<span className="font-medium text-white">{request.totalDays}</span>),
                reason: (<p className="text-sm text-dark-400 max-w-xs truncate">{request.reason}</p>),
                status: (<ui_1.Badge variant={getStatusColor(request.status)} className="capitalize">
                      {request.status}
                    </ui_1.Badge>),
                actions: (<div className="flex items-center space-x-2">
                      {request.status === 'pending' && (<>
                          <ui_1.Button variant="success" size="sm" onClick={() => handleApproveLeave(request.id)}>
                            Approve
                          </ui_1.Button>
                          <ui_1.Button variant="danger" size="sm">
                            Reject
                          </ui_1.Button>
                        </>)}
                      <ui_1.Button variant="outline" size="sm">
                        View
                      </ui_1.Button>
                    </div>)
            }))}/>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {activeTab === 'balances' && (<ui_1.Card>
            <ui_1.CardHeader title="Leave Balances"/>
            <ui_1.CardContent>
              <ui_1.Table headers={[
                { key: 'employee', label: 'Employee' },
                { key: 'annual', label: 'Annual Leave' },
                { key: 'sick', label: 'Sick Leave' },
                { key: 'maternity', label: 'Maternity' },
                { key: 'paternity', label: 'Paternity' },
                { key: 'study', label: 'Study Leave' }
            ]} data={leaveBalances.map(balance => ({
                employee: (<p className="font-medium text-white">{balance.employee}</p>),
                annual: (<div className="text-sm">
                      <p className="text-white">{balance.annual.remaining}/{balance.annual.total}</p>
                      <div className="w-16 bg-dark-600 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(balance.annual.remaining / balance.annual.total) * 100}%` }}></div>
                      </div>
                    </div>),
                sick: (<div className="text-sm">
                      <p className="text-white">{balance.sick.remaining}/{balance.sick.total}</p>
                      <div className="w-16 bg-dark-600 rounded-full h-2 mt-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(balance.sick.remaining / balance.sick.total) * 100}%` }}></div>
                      </div>
                    </div>),
                maternity: (<span className="text-white">{balance.maternity.remaining}</span>),
                paternity: (<span className="text-white">{balance.paternity.remaining}</span>),
                study: (<span className="text-white">{balance.study.remaining}</span>)
            }))}/>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {activeTab === 'calendar' && (<ui_1.Card>
            <ui_1.CardHeader title="Leave Calendar"/>
            <ui_1.CardContent>
              <div className="h-96 bg-dark-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-white font-medium">Interactive Leave Calendar</p>
                  <p className="text-dark-400 text-sm">View all leave requests in calendar format</p>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Leave Request Modal */}
        <ui_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave">
          <div className="space-y-6">
            <ui_1.Select label="Employee" value={requestForm.employeeId} onChange={(value) => setRequestForm({ ...requestForm, employeeId: value })} options={employees.map(emp => ({ value: emp.id, label: emp.name }))} required/>

            <ui_1.Select label="Leave Type" value={requestForm.type} onChange={(value) => setRequestForm({ ...requestForm, type: value })} options={[
            { value: 'annual', label: 'Annual Leave' },
            { value: 'sick', label: 'Sick Leave' },
            { value: 'maternity', label: 'Maternity Leave' },
            { value: 'paternity', label: 'Paternity Leave' },
            { value: 'emergency', label: 'Emergency Leave' },
            { value: 'study', label: 'Study Leave' },
            { value: 'unpaid', label: 'Unpaid Leave' }
        ]} required/>

            <div className="grid grid-cols-2 gap-4">
              <ui_1.Input label="Start Date" type="date" value={requestForm.startDate} onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })} required/>
              <ui_1.Input label="End Date" type="date" value={requestForm.endDate} onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })} required/>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Reason</label>
              <textarea value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} rows={4} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Please provide reason for leave..." required/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Submit Request
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = LeaveManagementPage;
//# sourceMappingURL=leave-management.js.map