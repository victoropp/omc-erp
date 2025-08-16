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
const PayrollPage = () => {
    const [payrollPeriods, setPayrollPeriods] = (0, react_1.useState)([]);
    const [payrollEntries, setPayrollEntries] = (0, react_1.useState)([]);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedPeriod, setSelectedPeriod] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [modalType, setModalType] = (0, react_1.useState)('period');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterDepartment, setFilterDepartment] = (0, react_1.useState)('all');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [showSummary, setShowSummary] = (0, react_1.useState)(false);
    const [payrollSummary, setPayrollSummary] = (0, react_1.useState)(null);
    const [periodForm, setPeriodForm] = (0, react_1.useState)({
        period: '',
        startDate: '',
        endDate: ''
    });
    const [entryForm, setEntryForm] = (0, react_1.useState)({
        employeeId: '',
        basicSalary: 0,
        housingAllowance: 0,
        transportAllowance: 0,
        mealAllowance: 0,
        overtimeHours: 0,
        overtimeRate: 15,
        bonus: 0,
        loan: 0,
        advance: 0,
        otherDeductions: 0,
        workingDays: 22,
        notes: ''
    });
    const currentPeriod = payrollPeriods.find(p => p.status === 'draft') || payrollPeriods[0];
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    (0, react_1.useEffect)(() => {
        if (currentPeriod) {
            loadPayrollEntries(currentPeriod.id);
        }
    }, [currentPeriod]);
    const loadData = async () => {
        try {
            setLoading(true);
            const [periodsData, employeesData] = await Promise.all([
                api_1.hrService.getPayrollPeriods?.() || Promise.resolve([]),
                api_1.hrService.getEmployees()
            ]);
            setPayrollPeriods(periodsData || generateMockPeriods());
            setEmployees(employeesData || generateMockEmployees());
        }
        catch (error) {
            console.error('Failed to load data:', error);
            setPayrollPeriods(generateMockPeriods());
            setEmployees(generateMockEmployees());
            react_hot_toast_1.toast.error('Failed to load payroll data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadPayrollEntries = async (periodId) => {
        try {
            const data = await api_1.hrService.getPayrollEntries?.(periodId) || [];
            setPayrollEntries(data || generateMockEntries(periodId));
        }
        catch (error) {
            console.error('Failed to load payroll entries:', error);
            setPayrollEntries(generateMockEntries(periodId));
        }
    };
    const generateMockPeriods = () => [
        {
            id: 'p1',
            period: '2024-01',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            status: 'processing',
            totalEmployees: 145,
            totalGrossPay: 890000,
            totalDeductions: 178000,
            totalNetPay: 712000,
            totalTax: 89000,
            totalSSNIT: 62300,
            createdAt: '2024-01-25T10:00:00Z',
            processedAt: '2024-01-28T14:30:00Z'
        },
        {
            id: 'p2',
            period: '2023-12',
            startDate: '2023-12-01',
            endDate: '2023-12-31',
            status: 'closed',
            totalEmployees: 142,
            totalGrossPay: 920000,
            totalDeductions: 184000,
            totalNetPay: 736000,
            totalTax: 92000,
            totalSSNIT: 64400,
            createdAt: '2023-12-25T10:00:00Z',
            processedAt: '2023-12-28T14:30:00Z',
            approvedBy: 'Sarah Johnson, HR Manager'
        }
    ];
    const generateMockEmployees = () => [
        {
            id: 'e1',
            employeeId: 'EMP001',
            firstName: 'Kwame',
            lastName: 'Asante',
            department: 'Operations',
            position: 'Fleet Manager',
            bankAccount: '1234567890'
        },
        {
            id: 'e2',
            employeeId: 'EMP002',
            firstName: 'Akosua',
            lastName: 'Mensah',
            department: 'Finance',
            position: 'Accountant',
            bankAccount: '0987654321'
        },
        {
            id: 'e3',
            employeeId: 'EMP003',
            firstName: 'John',
            lastName: 'Doe',
            department: 'IT',
            position: 'Systems Administrator',
            bankAccount: '1122334455'
        }
    ];
    const generateMockEntries = (periodId) => [
        {
            id: 'pe1',
            periodId,
            employee: {
                id: 'e1',
                employeeId: 'EMP001',
                firstName: 'Kwame',
                lastName: 'Asante',
                department: 'Operations',
                position: 'Fleet Manager',
                bankAccount: '1234567890'
            },
            basicSalary: 8500,
            allowances: {
                housing: 2000,
                transport: 500,
                meal: 300,
                overtime: 450,
                bonus: 1000,
                other: 0
            },
            deductions: {
                tax: 1275,
                ssnit: 595,
                loan: 200,
                advance: 0,
                other: 50
            },
            grossPay: 12750,
            totalDeductions: 2120,
            netPay: 10630,
            workingDays: 22,
            overtimeHours: 15,
            status: 'approved'
        },
        {
            id: 'pe2',
            periodId,
            employee: {
                id: 'e2',
                employeeId: 'EMP002',
                firstName: 'Akosua',
                lastName: 'Mensah',
                department: 'Finance',
                position: 'Accountant',
                bankAccount: '0987654321'
            },
            basicSalary: 7200,
            allowances: {
                housing: 1800,
                transport: 400,
                meal: 300,
                overtime: 0,
                bonus: 500,
                other: 0
            },
            deductions: {
                tax: 1020,
                ssnit: 504,
                loan: 0,
                advance: 150,
                other: 0
            },
            grossPay: 10200,
            totalDeductions: 1674,
            netPay: 8526,
            workingDays: 22,
            overtimeHours: 0,
            status: 'pending'
        },
        {
            id: 'pe3',
            periodId,
            employee: {
                id: 'e3',
                employeeId: 'EMP003',
                firstName: 'John',
                lastName: 'Doe',
                department: 'IT',
                position: 'Systems Administrator',
                bankAccount: '1122334455'
            },
            basicSalary: 9500,
            allowances: {
                housing: 2200,
                transport: 600,
                meal: 350,
                overtime: 600,
                bonus: 0,
                other: 200
            },
            deductions: {
                tax: 1357.5,
                ssnit: 665,
                loan: 300,
                advance: 0,
                other: 25
            },
            grossPay: 13450,
            totalDeductions: 2347.5,
            netPay: 11102.5,
            workingDays: 22,
            overtimeHours: 20,
            status: 'approved'
        }
    ];
    const filteredEntries = payrollEntries.filter(entry => {
        const matchesSearch = entry.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = filterDepartment === 'all' || entry.employee.department === filterDepartment;
        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    const calculateSummary = () => {
        const summary = {
            totalEmployees: payrollEntries.length,
            totalGrossPay: payrollEntries.reduce((sum, entry) => sum + entry.grossPay, 0),
            totalNetPay: payrollEntries.reduce((sum, entry) => sum + entry.netPay, 0),
            totalDeductions: payrollEntries.reduce((sum, entry) => sum + entry.totalDeductions, 0),
            avgSalary: payrollEntries.reduce((sum, entry) => sum + entry.netPay, 0) / payrollEntries.length || 0,
            highestPaid: Math.max(...payrollEntries.map(entry => entry.netPay)),
            lowestPaid: Math.min(...payrollEntries.map(entry => entry.netPay)),
            departmentBreakdown: []
        };
        // Calculate department breakdown
        const deptMap = new Map();
        payrollEntries.forEach(entry => {
            const dept = entry.employee.department;
            if (!deptMap.has(dept)) {
                deptMap.set(dept, { employees: 0, totalPay: 0 });
            }
            deptMap.get(dept).employees++;
            deptMap.get(dept).totalPay += entry.netPay;
        });
        summary.departmentBreakdown = Array.from(deptMap.entries()).map(([dept, data]) => ({
            department: dept,
            employees: data.employees,
            totalPay: data.totalPay
        }));
        setPayrollSummary(summary);
        setShowSummary(true);
    };
    const handleCreatePeriod = () => {
        setModalType('period');
        setPeriodForm({
            period: new Date().toISOString().substring(0, 7),
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };
    const handleProcessPayroll = async () => {
        if (!currentPeriod)
            return;
        try {
            await api_1.hrService.processPayroll({ periodId: currentPeriod.id });
            react_hot_toast_1.toast.success('Payroll processed successfully');
            loadData();
        }
        catch (error) {
            console.error('Failed to process payroll:', error);
            react_hot_toast_1.toast.error('Failed to process payroll');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'processing': return 'warning';
            case 'approved': return 'success';
            case 'paid': return 'primary';
            case 'closed': return 'default';
            case 'pending': return 'warning';
            case 'disputed': return 'danger';
            default: return 'default';
        }
    };
    const departments = [...new Set(employees.map(emp => emp.department))];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Payroll Management</h1>
            <p className="text-dark-400 mt-2">
              Comprehensive payroll processing for Ghana OMC operations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ui_1.Button variant="outline" onClick={calculateSummary}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              View Summary
            </ui_1.Button>
            
            {currentPeriod?.status === 'draft' && (<ui_1.Button variant="success" onClick={handleProcessPayroll}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Process Payroll
              </ui_1.Button>)}
            
            <ui_1.Button variant="primary" onClick={handleCreatePeriod}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              New Period
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Employees</p>
                  <p className="text-2xl font-bold text-white">{currentPeriod?.totalEmployees || 0}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Gross Pay</p>
                  <p className="text-2xl font-bold text-white">
                    GHS {(currentPeriod?.totalGrossPay || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Net Pay</p>
                  <p className="text-2xl font-bold text-white">
                    GHS {(currentPeriod?.totalNetPay || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Deductions</p>
                  <p className="text-2xl font-bold text-white">
                    GHS {(currentPeriod?.totalDeductions || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Period Selector and Status */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ui_1.Select value={currentPeriod?.id || ''} onChange={(value) => {
            const period = payrollPeriods.find(p => p.id === value);
            if (period)
                loadPayrollEntries(period.id);
        }} options={payrollPeriods.map(p => ({
            value: p.id,
            label: `${p.period} - ${p.status}`
        }))} className="w-64"/>
                {currentPeriod && (<ui_1.Badge variant={getStatusColor(currentPeriod.status)} className="capitalize">
                    {currentPeriod.status}
                  </ui_1.Badge>)}
              </div>
              
              <div className="text-right text-sm text-dark-400">
                {currentPeriod && (<>
                    <p>Period: {new Date(currentPeriod.startDate).toLocaleDateString()} - {new Date(currentPeriod.endDate).toLocaleDateString()}</p>
                    {currentPeriod.processedAt && (<p>Processed: {new Date(currentPeriod.processedAt).toLocaleString()}</p>)}
                  </>)}
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search by name or employee ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterDepartment} onChange={setFilterDepartment} options={[
            { value: 'all', label: 'All Departments' },
            ...departments.map(dept => ({ value: dept, label: dept }))
        ]} className="w-full md:w-48"/>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'paid', label: 'Paid' },
            { value: 'disputed', label: 'Disputed' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Payroll Entries Table */}
        <ui_1.Card>
          <ui_1.CardHeader title={`Payroll Entries - ${currentPeriod?.period || 'Select Period'}`}/>
          <ui_1.CardContent>
            {loading ? (<div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>) : (<ui_1.Table headers={[
                { key: 'employee', label: 'Employee' },
                { key: 'salary', label: 'Basic Salary' },
                { key: 'allowances', label: 'Allowances' },
                { key: 'deductions', label: 'Deductions' },
                { key: 'gross', label: 'Gross Pay' },
                { key: 'net', label: 'Net Pay' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredEntries.map(entry => ({
                employee: (<div>
                      <p className="font-medium text-white">
                        {entry.employee.firstName} {entry.employee.lastName}
                      </p>
                      <p className="text-sm text-dark-400">{entry.employee.employeeId}</p>
                      <p className="text-xs text-dark-500">{entry.employee.department}</p>
                    </div>),
                salary: (<div>
                      <p className="font-medium text-white">GHS {entry.basicSalary.toLocaleString()}</p>
                      <p className="text-xs text-dark-400">{entry.workingDays} days</p>
                      {entry.overtimeHours > 0 && (<p className="text-xs text-blue-400">{entry.overtimeHours}h OT</p>)}
                    </div>),
                allowances: (<div className="text-sm">
                      <p className="text-green-400">+GHS {Object.values(entry.allowances).reduce((a, b) => a + b, 0).toLocaleString()}</p>
                      <div className="text-xs text-dark-400 space-y-1">
                        {entry.allowances.housing > 0 && <p>Housing: GHS {entry.allowances.housing}</p>}
                        {entry.allowances.transport > 0 && <p>Transport: GHS {entry.allowances.transport}</p>}
                        {entry.allowances.overtime > 0 && <p>Overtime: GHS {entry.allowances.overtime}</p>}
                      </div>
                    </div>),
                deductions: (<div className="text-sm">
                      <p className="text-red-400">-GHS {entry.totalDeductions.toLocaleString()}</p>
                      <div className="text-xs text-dark-400 space-y-1">
                        <p>Tax: GHS {entry.deductions.tax}</p>
                        <p>SSNIT: GHS {entry.deductions.ssnit}</p>
                        {entry.deductions.loan > 0 && <p>Loan: GHS {entry.deductions.loan}</p>}
                      </div>
                    </div>),
                gross: (<p className="font-medium text-white">GHS {entry.grossPay.toLocaleString()}</p>),
                net: (<p className="font-bold text-green-400">GHS {entry.netPay.toLocaleString()}</p>),
                status: (<ui_1.Badge variant={getStatusColor(entry.status)} className="capitalize">
                      {entry.status}
                    </ui_1.Badge>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </ui_1.Button>
                      <ui_1.Button variant="outline" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                      </ui_1.Button>
                    </div>)
            }))}/>)}
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Payroll Summary Modal */}
        <ui_1.Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="Payroll Summary">
          {payrollSummary && (<div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-dark-700 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{payrollSummary.totalEmployees}</p>
                  <p className="text-sm text-dark-400">Total Employees</p>
                </div>
                <div className="text-center p-4 bg-dark-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">GHS {payrollSummary.avgSalary.toLocaleString()}</p>
                  <p className="text-sm text-dark-400">Average Salary</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-dark-700 rounded-lg">
                  <p className="text-xl font-bold text-purple-400">GHS {payrollSummary.highestPaid.toLocaleString()}</p>
                  <p className="text-sm text-dark-400">Highest Paid</p>
                </div>
                <div className="text-center p-4 bg-dark-700 rounded-lg">
                  <p className="text-xl font-bold text-orange-400">GHS {payrollSummary.lowestPaid.toLocaleString()}</p>
                  <p className="text-sm text-dark-400">Lowest Paid</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-4">Department Breakdown</h3>
                <div className="space-y-3">
                  {payrollSummary.departmentBreakdown.map(dept => (<div key={dept.department} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{dept.department}</p>
                        <p className="text-sm text-dark-400">{dept.employees} employees</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">GHS {dept.totalPay.toLocaleString()}</p>
                        <p className="text-sm text-dark-400">Total Pay</p>
                      </div>
                    </div>))}
                </div>
              </div>

              <div className="pt-4 border-t border-dark-600">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-green-400">GHS {payrollSummary.totalGrossPay.toLocaleString()}</p>
                    <p className="text-xs text-dark-400">Total Gross</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-red-400">GHS {payrollSummary.totalDeductions.toLocaleString()}</p>
                    <p className="text-xs text-dark-400">Total Deductions</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-400">GHS {payrollSummary.totalNetPay.toLocaleString()}</p>
                    <p className="text-xs text-dark-400">Total Net</p>
                  </div>
                </div>
              </div>
            </div>)}
        </ui_1.Modal>

        {/* Period Creation Modal */}
        <ui_1.Modal isOpen={isModalOpen && modalType === 'period'} onClose={() => setIsModalOpen(false)} title="Create New Payroll Period">
          <div className="space-y-6">
            <ui_1.Input label="Period (YYYY-MM)" type="month" value={periodForm.period} onChange={(e) => setPeriodForm({ ...periodForm, period: e.target.value })} required/>

            <div className="grid grid-cols-2 gap-4">
              <ui_1.Input label="Start Date" type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} required/>
              <ui_1.Input label="End Date" type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} required/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Create Period
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PayrollPage;
//# sourceMappingURL=payroll.js.map