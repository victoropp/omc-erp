import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, Modal, FormModal, Input, Select } from '@/components/ui';
import { hrService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  status: string;
  employmentType: string;
  basicSalary: number;
  currency: string;
  reportingManagerName: string;
  workLocation: string;
  profilePicture?: string;
  nextAppraisalDate: string;
  probationEndDate?: string;
}

const EmployeesPage: NextPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [employeeFormData, setEmployeeFormData] = useState({
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

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // const data = await hrService.getEmployees();
      setEmployees(sampleEmployees);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await hrService.createEmployee(employeeFormData);
      toast.success('Employee created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      loadEmployees();
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    try {
      // await hrService.updateEmployee(selectedEmployee.id, employeeFormData);
      toast.success('Employee updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      loadEmployees();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleStatusChange = async (employeeId: string, newStatus: string) => {
    try {
      // await hrService.updateEmployeeStatus(employeeId, newStatus);
      toast.success('Employee status updated');
      loadEmployees();
    } catch (error) {
      toast.error('Failed to update status');
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

  const openEditModal = (employee: Employee) => {
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
    { key: 'employeeNumber' as keyof Employee, header: 'Employee #', width: '12%', sortable: true },
    { key: 'fullName' as keyof Employee, header: 'Full Name', width: '18%', sortable: true,
      render: (value: string, row: Employee) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-sm text-dark-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'jobTitle' as keyof Employee, header: 'Job Title', width: '15%', sortable: true },
    { key: 'department' as keyof Employee, header: 'Department', width: '15%', sortable: true },
    { key: 'status' as keyof Employee, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'PROBATION' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          value === 'ON_LEAVE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          value === 'SUSPENDED' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    { key: 'hireDate' as keyof Employee, header: 'Hire Date', width: '12%', sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'basicSalary' as keyof Employee, header: 'Salary', width: '12%', sortable: true,
      render: (value: number, row: Employee) => (
        <span className="font-medium text-green-400">
          {row.currency} {new Intl.NumberFormat('en-US').format(value)}
        </span>
      )
    },
    { key: 'id' as keyof Employee, header: 'Actions', width: '6%',
      render: (value: string, row: Employee) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => openEditModal(row)}
          >
            Edit
          </Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  // Sample data for demonstration
  const sampleEmployees: Employee[] = [
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

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Employee Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage employee records and profiles
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export List
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Employee
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Employees</h3>
              <p className="text-2xl font-bold text-primary-400 mb-1">{employees.length}</p>
              <p className="text-sm text-green-400">Active workforce</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">
                {employees.filter(e => e.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-dark-400">Currently working</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">On Probation</h3>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                {employees.filter(e => e.status === 'PROBATION').length}
              </p>
              <p className="text-sm text-dark-400">New hires</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">On Leave</h3>
              <p className="text-2xl font-bold text-yellow-400 mb-1">
                {employees.filter(e => e.status === 'ON_LEAVE').length}
              </p>
              <p className="text-sm text-dark-400">Temporarily away</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                options={departmentOptions}
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="Filter by department"
              />
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setStatusFilter('');
                }}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader title={`Employees (${filteredEmployees.length})`} />
          <CardContent>
            <Table
              data={filteredEmployees}
              columns={columns}
              loading={loading}
              pagination={{
                page: 1,
                limit: 10,
                total: filteredEmployees.length,
                onPageChange: () => {},
                onLimitChange: () => {},
              }}
            />
          </CardContent>
        </Card>

        {/* Create Employee Modal */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          onSubmit={handleCreateEmployee}
          title="Create New Employee"
          submitText="Create Employee"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={employeeFormData.firstName}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={employeeFormData.lastName}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Middle Name (Optional)"
            placeholder="Enter middle name"
            value={employeeFormData.middleName}
            onChange={(e) => setEmployeeFormData({ ...employeeFormData, middleName: e.target.value })}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={employeeFormData.dateOfBirth}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, dateOfBirth: e.target.value })}
              required
            />
            <Select
              label="Gender"
              options={genderOptions}
              value={employeeFormData.gender}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, gender: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="employee@omc.com.gh"
              value={employeeFormData.email}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              placeholder="+233-XXX-XXX-XXX"
              value={employeeFormData.phone}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Hire Date"
              type="date"
              value={employeeFormData.hireDate}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, hireDate: e.target.value })}
              required
            />
            <Input
              label="Job Title"
              placeholder="Enter job title"
              value={employeeFormData.jobTitle}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitle: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Department"
              options={departmentOptions.filter(d => d.value !== '')}
              value={employeeFormData.department}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, department: value })}
              required
            />
            <Select
              label="Work Location"
              options={locationOptions}
              value={employeeFormData.workLocation}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, workLocation: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Basic Salary (GHS)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={employeeFormData.basicSalary}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, basicSalary: e.target.value })}
              required
            />
            <Select
              label="Employment Type"
              options={employmentTypeOptions}
              value={employeeFormData.employmentType}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, employmentType: value })}
              required
            />
          </div>
        </FormModal>

        {/* Edit Employee Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
          }}
          onSubmit={handleUpdateEmployee}
          title="Edit Employee"
          submitText="Update Employee"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={employeeFormData.firstName}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={employeeFormData.lastName}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={employeeFormData.email}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={employeeFormData.phone}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              value={employeeFormData.jobTitle}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, jobTitle: e.target.value })}
              required
            />
            <Select
              label="Department"
              options={departmentOptions.filter(d => d.value !== '')}
              value={employeeFormData.department}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, department: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Basic Salary (GHS)"
              type="number"
              step="0.01"
              value={employeeFormData.basicSalary}
              onChange={(e) => setEmployeeFormData({ ...employeeFormData, basicSalary: e.target.value })}
              required
            />
            <Select
              label="Work Location"
              options={locationOptions}
              value={employeeFormData.workLocation}
              onChange={(value) => setEmployeeFormData({ ...employeeFormData, workLocation: value })}
              required
            />
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default EmployeesPage;