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
const react_hot_toast_1 = require("react-hot-toast");
const EmployeesPage = () => {
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [isEditModalOpen, setIsEditModalOpen] = (0, react_1.useState)(false);
    const [selectedEmployee, setSelectedEmployee] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [departmentFilter, setDepartmentFilter] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('');
    const [employeeFormData, setEmployeeFormData] = (0, react_1.useState)({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        email: '',
        phone: '',
        hireDate: '',
        jobTitle: '',
        department: '',
        basicSalary: '',
        reportingManagerId: '',
        workLocation: '',
        employmentType: 'PERMANENT',
        nationality: 'Ghanaian',
    });
    (0, react_1.useEffect)(() => {
        loadEmployees();
    }, []);
    const loadEmployees = async () => {
        try {
            setLoading(true);
            // const data = await hrService.getEmployees();
            setEmployees(sampleEmployees);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load employees');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            // await hrService.createEmployee(employeeFormData);
            react_hot_toast_1.toast.success('Employee created successfully');
            setIsCreateModalOpen(false);
            resetForm();
            loadEmployees();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create employee');
        }
    };
    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!selectedEmployee)
            return;
        try {
            // await hrService.updateEmployee(selectedEmployee.id, employeeFormData);
            react_hot_toast_1.toast.success('Employee updated successfully');
            setIsEditModalOpen(false);
            resetForm();
            loadEmployees();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to update employee');
        }
    };
    const handleStatusChange = async (employeeId, newStatus) => {
        try {
            // await hrService.updateEmployeeStatus(employeeId, newStatus);
            react_hot_toast_1.toast.success('Employee status updated');
            loadEmployees();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to update status');
        }
    };
    const resetForm = () => {
        setEmployeeFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'MALE',
            email: '',
            phone: '',
            hireDate: '',
            jobTitle: '',
            department: '',
            basicSalary: '',
            reportingManagerId: '',
            workLocation: '',
            employmentType: 'PERMANENT',
            nationality: 'Ghanaian',
        });
        setSelectedEmployee(null);
    };
    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setEmployeeFormData({
            firstName: employee.firstName,
            middleName: '',
            lastName: employee.lastName,
            dateOfBirth: '',
            gender: 'MALE',
            email: employee.email,
            phone: employee.phone,
            hireDate: employee.hireDate,
            jobTitle: employee.jobTitle,
            department: employee.department,
            basicSalary: employee.basicSalary.toString(),
            reportingManagerId: '',
            workLocation: employee.workLocation,
            employmentType: employee.employmentType,
            nationality: 'Ghanaian',
        });
        setIsEditModalOpen(true);
    };
    const departmentOptions = [
        { value: '', label: 'All Departments' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Sales & Marketing', label: 'Sales & Marketing' },
        { value: 'Technical Services', label: 'Technical Services' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Human Resources', label: 'Human Resources' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Legal & Compliance', label: 'Legal & Compliance' },
        { value: 'Procurement', label: 'Procurement' },
    ];
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PROBATION', label: 'Probation' },
        { value: 'ON_LEAVE', label: 'On Leave' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'TERMINATED', label: 'Terminated' },
    ];
    const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
    ];
    const employmentTypeOptions = [
        { value: 'PERMANENT', label: 'Permanent' },
        { value: 'CONTRACT', label: 'Contract' },
        { value: 'TEMPORARY', label: 'Temporary' },
        { value: 'INTERNSHIP', label: 'Internship' },
    ];
    const locationOptions = [
        { value: 'Head Office - Accra', label: 'Head Office - Accra' },
        { value: 'Tema Depot', label: 'Tema Depot' },
        { value: 'Kumasi Regional Office', label: 'Kumasi Regional Office' },
        { value: 'Takoradi Depot', label: 'Takoradi Depot' },
        { value: 'Remote', label: 'Remote' },
    ];
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
        const matchesStatus = !statusFilter || emp.status === statusFilter;
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    const columns = [
        { key: 'employeeNumber', header: 'Employee #', width: '12%', sortable: true },
        { key: 'fullName', header: 'Full Name', width: '18%', sortable: true,
            render: (value, row) => (<div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-sm text-dark-400">{row.email}</p>
          </div>
        </div>)
        },
        { key: 'jobTitle', header: 'Job Title', width: '15%', sortable: true },
        { key: 'department', header: 'Department', width: '15%', sortable: true },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'PROBATION' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        value === 'ON_LEAVE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            value === 'SUSPENDED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {value.replace('_', ' ')}
        </span>)
        },
        { key: 'hireDate', header: 'Hire Date', width: '12%', sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        },
        { key: 'basicSalary', header: 'Salary', width: '12%', sortable: true,
            render: (value, row) => (<span className="font-medium text-green-400">
          {row.currency} {new Intl.NumberFormat('en-US').format(value)}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '6%',
            render: (value, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
            Edit
          </ui_1.Button>
          <ui_1.Button variant="ghost" size="sm">View</ui_1.Button>
        </div>)
        },
    ];
    // Sample data for demonstration
    const sampleEmployees = [
        {
            id: '1',
            employeeNumber: 'EMP-2024-000001',
            fullName: 'Kwame Asante',
            firstName: 'Kwame',
            lastName: 'Asante',
            email: 'kwame.asante@omc.com.gh',
            phone: '+233-244-123-456',
            jobTitle: 'Operations Manager',
            department: 'Operations',
            hireDate: '2020-03-15',
            status: 'ACTIVE',
            employmentType: 'PERMANENT',
            basicSalary: 15000,
            currency: 'GHS',
            reportingManagerName: 'Sarah Mensah',
            workLocation: 'Head Office - Accra',
            nextAppraisalDate: '2024-03-15',
        },
        {
            id: '2',
            employeeNumber: 'EMP-2024-000002',
            fullName: 'Ama Boateng',
            firstName: 'Ama',
            lastName: 'Boateng',
            email: 'ama.boateng@omc.com.gh',
            phone: '+233-244-234-567',
            jobTitle: 'Financial Analyst',
            department: 'Finance',
            hireDate: '2021-07-10',
            status: 'ACTIVE',
            employmentType: 'PERMANENT',
            basicSalary: 8500,
            currency: 'GHS',
            reportingManagerName: 'John Doe',
            workLocation: 'Head Office - Accra',
            nextAppraisalDate: '2024-07-10',
        },
        {
            id: '3',
            employeeNumber: 'EMP-2024-000003',
            fullName: 'Samuel Osei',
            firstName: 'Samuel',
            lastName: 'Osei',
            email: 'samuel.osei@omc.com.gh',
            phone: '+233-244-345-678',
            jobTitle: 'Sales Executive',
            department: 'Sales & Marketing',
            hireDate: '2023-11-01',
            status: 'PROBATION',
            employmentType: 'PERMANENT',
            basicSalary: 6000,
            currency: 'GHS',
            reportingManagerName: 'Grace Owusu',
            workLocation: 'Kumasi Regional Office',
            nextAppraisalDate: '2024-05-01',
            probationEndDate: '2024-05-01',
        },
        {
            id: '4',
            employeeNumber: 'EMP-2024-000004',
            fullName: 'Grace Owusu',
            firstName: 'Grace',
            lastName: 'Owusu',
            email: 'grace.owusu@omc.com.gh',
            phone: '+233-244-456-789',
            jobTitle: 'IT Specialist',
            department: 'Information Technology',
            hireDate: '2019-01-20',
            status: 'ACTIVE',
            employmentType: 'PERMANENT',
            basicSalary: 12000,
            currency: 'GHS',
            reportingManagerName: 'Michael Adjei',
            workLocation: 'Head Office - Accra',
            nextAppraisalDate: '2024-01-20',
        },
        {
            id: '5',
            employeeNumber: 'EMP-2024-000005',
            fullName: 'Joseph Mensah',
            firstName: 'Joseph',
            lastName: 'Mensah',
            email: 'joseph.mensah@omc.com.gh',
            phone: '+233-244-567-890',
            jobTitle: 'Depot Manager',
            department: 'Operations',
            hireDate: '2018-05-15',
            status: 'ON_LEAVE',
            employmentType: 'PERMANENT',
            basicSalary: 18000,
            currency: 'GHS',
            reportingManagerName: 'Kwame Asante',
            workLocation: 'Tema Depot',
            nextAppraisalDate: '2024-05-15',
        },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Employee Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage employee records and profiles
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export List
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              New Employee
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Employees</h3>
              <p className="text-2xl font-bold text-primary-400 mb-1">{employees.length}</p>
              <p className="text-sm text-green-400">Active workforce</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">
                {employees.filter(e => e.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-dark-400">Currently working</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">On Probation</h3>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                {employees.filter(e => e.status === 'PROBATION').length}
              </p>
              <p className="text-sm text-dark-400">New hires</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">On Leave</h3>
              <p className="text-2xl font-bold text-yellow-400 mb-1">
                {employees.filter(e => e.status === 'ON_LEAVE').length}
              </p>
              <p className="text-sm text-dark-400">Temporarily away</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ui_1.Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
              <ui_1.Select options={departmentOptions} value={departmentFilter} onChange={setDepartmentFilter} placeholder="Filter by department"/>
              <ui_1.Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Filter by status"/>
              <div className="flex space-x-2">
                <ui_1.Button variant="outline" size="sm" onClick={() => {
            setSearchTerm('');
            setDepartmentFilter('');
            setStatusFilter('');
        }}>
                  Clear Filters
                </ui_1.Button>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Employees Table */}
        <ui_1.Card>
          <ui_1.CardHeader title={`Employees (${filteredEmployees.length})`}/>
          <ui_1.CardContent>
            <ui_1.Table data={filteredEmployees} columns={columns} loading={loading} pagination={{
            page: 1,
            limit: 10,
            total: filteredEmployees.length,
            onPageChange: () => { },
            onLimitChange: () => { },
        }}/>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Create Employee Modal */}
        <ui_1.FormModal isOpen={isCreateModalOpen} onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
        }} onSubmit={handleCreateEmployee} title="Create New Employee" submitText="Create Employee">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="First Name" placeholder="Enter first name" value={employeeFormData.firstName} onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })} required/>
            <ui_1.Input label="Last Name" placeholder="Enter last name" value={employeeFormData.lastName} onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })} required/>
          </div>

          <ui_1.Input label="Middle Name (Optional)" placeholder="Enter middle name" value={employeeFormData.middleName} onChange={(e) => setEmployeeFormData({ ...employeeFormData, middleName: e.target.value })}/>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Date of Birth" type="date" value={employeeFormData.dateOfBirth} onChange={(e) => setEmployeeFormData({ ...employeeFormData, dateOfBirth: e.target.value })} required/>
            <ui_1.Select label="Gender" options={genderOptions} value={employeeFormData.gender} onChange={(value) => setEmployeeFormData({ ...employeeFormData, gender: value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Email" type="email" placeholder="employee@omc.com.gh" value={employeeFormData.email} onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })} required/>
            <ui_1.Input label="Phone" placeholder="+233-XXX-XXX-XXX" value={employeeFormData.phone} onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Hire Date" type="date" value={employeeFormData.hireDate} onChange={(e) => setEmployeeFormData({ ...employeeFormData, hireDate: e.target.value })} required/>
            <ui_1.Input label="Job Title" placeholder="Enter job title" value={employeeFormData.jobTitle} onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitle: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Department" options={departmentOptions.filter(d => d.value !== '')} value={employeeFormData.department} onChange={(value) => setEmployeeFormData({ ...employeeFormData, department: value })} required/>
            <ui_1.Select label="Work Location" options={locationOptions} value={employeeFormData.workLocation} onChange={(value) => setEmployeeFormData({ ...employeeFormData, workLocation: value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Basic Salary (GHS)" type="number" step="0.01" placeholder="0.00" value={employeeFormData.basicSalary} onChange={(e) => setEmployeeFormData({ ...employeeFormData, basicSalary: e.target.value })} required/>
            <ui_1.Select label="Employment Type" options={employmentTypeOptions} value={employeeFormData.employmentType} onChange={(value) => setEmployeeFormData({ ...employeeFormData, employmentType: value })} required/>
          </div>
        </ui_1.FormModal>

        {/* Edit Employee Modal */}
        <ui_1.FormModal isOpen={isEditModalOpen} onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
        }} onSubmit={handleUpdateEmployee} title="Edit Employee" submitText="Update Employee">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="First Name" placeholder="Enter first name" value={employeeFormData.firstName} onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })} required/>
            <ui_1.Input label="Last Name" placeholder="Enter last name" value={employeeFormData.lastName} onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Email" type="email" value={employeeFormData.email} onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })} required/>
            <ui_1.Input label="Phone" value={employeeFormData.phone} onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Job Title" value={employeeFormData.jobTitle} onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitle: e.target.value })} required/>
            <ui_1.Select label="Department" options={departmentOptions.filter(d => d.value !== '')} value={employeeFormData.department} onChange={(value) => setEmployeeFormData({ ...employeeFormData, department: value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Basic Salary (GHS)" type="number" step="0.01" value={employeeFormData.basicSalary} onChange={(e) => setEmployeeFormData({ ...employeeFormData, basicSalary: e.target.value })} required/>
            <ui_1.Select label="Work Location" options={locationOptions} value={employeeFormData.workLocation} onChange={(value) => setEmployeeFormData({ ...employeeFormData, workLocation: value })} required/>
          </div>
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = EmployeesPage;
//# sourceMappingURL=employees.js.map