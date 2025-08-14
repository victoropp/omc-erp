import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: string;
  department: string;
  employeeNumber?: string;
  status: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  profilePicture?: string;
  jobTitle: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  permissions: string[];
  stations: string[];
  isActive: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  twoFactorEnabled: boolean;
  lastPasswordChangeRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

const UserManagement: NextPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Form data states
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    jobTitle: '',
    department: '',
    role: '',
    reportingManagerId: '',
    employeeNumber: '',
    stations: [] as string[],
    isActive: true,
    sendWelcomeEmail: true,
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setUsers(sampleUsers);
      setRoles(sampleRoles);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('User created successfully');
      if (userFormData.sendWelcomeEmail) {
        toast.success('Welcome email sent to user');
      }
      setIsUserModalOpen(false);
      resetUserForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('User updated successfully');
      setIsUserModalOpen(false);
      resetUserForm();
      loadData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Role created successfully');
      setIsRoleModalOpen(false);
      resetRoleForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      toast.success('Password reset email sent to user');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      toast.success(isActive ? 'User activated' : 'User deactivated');
      loadData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phone: '',
      jobTitle: '',
      department: '',
      role: '',
      reportingManagerId: '',
      employeeNumber: '',
      stations: [],
      isActive: true,
      sendWelcomeEmail: true,
    });
    setIsEditMode(false);
    setSelectedUser(null);
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      isActive: true,
    });
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phone: user.phone,
      jobTitle: user.jobTitle,
      department: user.department,
      role: user.role,
      reportingManagerId: user.reportingManagerId || '',
      employeeNumber: user.employeeNumber || '',
      stations: user.stations,
      isActive: user.isActive,
      sendWelcomeEmail: false,
    });
    setIsEditMode(true);
    setIsUserModalOpen(true);
  };

  // Options
  const roleOptions = roles.filter(r => r.isActive).map(role => ({
    value: role.name,
    label: role.displayName
  }));

  const departmentOptions = [
    { value: 'Operations', label: 'Operations' },
    { value: 'Sales & Marketing', label: 'Sales & Marketing' },
    { value: 'Technical Services', label: 'Technical Services' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Legal & Compliance', label: 'Legal & Compliance' },
    { value: 'Procurement', label: 'Procurement' },
    { value: 'Executive', label: 'Executive' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const allPermissions = [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'stations.view', 'stations.create', 'stations.edit', 'stations.delete',
    'transactions.view', 'transactions.create', 'transactions.edit', 'transactions.delete',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
    'pricing.view', 'pricing.create', 'pricing.edit', 'pricing.delete',
    'uppf.view', 'uppf.create', 'uppf.edit', 'uppf.delete',
    'reports.view', 'reports.create', 'reports.export',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete',
    'fleet.view', 'fleet.create', 'fleet.edit', 'fleet.delete',
    'hr.view', 'hr.create', 'hr.edit', 'hr.delete',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
    'dealers.view', 'dealers.create', 'dealers.edit', 'dealers.delete',
    'compliance.view', 'compliance.create', 'compliance.edit', 'compliance.delete',
    'settings.view', 'settings.edit',
    'admin.full_access'
  ];

  // Filtered data
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.employeeNumber && user.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Table columns
  const userColumns = [
    { key: 'fullName' as keyof User, header: 'User', width: '20%', sortable: true,
      render: (value: string, row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-sm text-dark-400">{row.email}</p>
            {row.employeeNumber && (
              <p className="text-xs text-dark-500">{row.employeeNumber}</p>
            )}
          </div>
        </div>
      )
    },
    { key: 'username' as keyof User, header: 'Username', width: '12%', sortable: true },
    { key: 'role' as keyof User, header: 'Role', width: '12%', sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {value.replace(/_/g, ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'department' as keyof User, header: 'Department', width: '15%', sortable: true },
    { key: 'status' as keyof User, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          value === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'lastLoginAt' as keyof User, header: 'Last Login', width: '12%',
      render: (value: string | undefined) => (
        <span className="text-sm text-dark-400">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    { key: 'twoFactorEnabled' as keyof User, header: '2FA', width: '8%',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      )
    },
    { key: 'id' as keyof User, header: 'Actions', width: '15%',
      render: (value: string, row: User) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => openEditUser(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleResetPassword(value)}>
            Reset PWD
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleToggleUserStatus(value, !row.isActive)}
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </Button>
        </div>
      )
    },
  ];

  const roleColumns = [
    { key: 'displayName' as keyof Role, header: 'Role Name', width: '20%', sortable: true },
    { key: 'name' as keyof Role, header: 'System Name', width: '15%', sortable: true },
    { key: 'description' as keyof Role, header: 'Description', width: '35%' },
    { key: 'permissions' as keyof Role, header: 'Permissions', width: '15%',
      render: (value: string[]) => (
        <span className="text-sm text-dark-400">{value.length} permissions</span>
      )
    },
    { key: 'isActive' as keyof Role, header: 'Status', width: '10%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    { key: 'id' as keyof Role, header: 'Actions', width: '10%',
      render: (value: string) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const tabs = [
    { id: 'users', label: 'Users', count: users.length },
    { id: 'roles', label: 'Roles & Permissions', count: roles.length },
  ];

  // Sample data
  const sampleUsers: User[] = [
    {
      id: '1',
      username: 'kwame.asante',
      email: 'kwame.asante@omc.com.gh',
      firstName: 'Kwame',
      lastName: 'Asante',
      fullName: 'Kwame Asante',
      phone: '+233-244-123-456',
      role: 'station_manager',
      department: 'Operations',
      employeeNumber: 'EMP-2024-001',
      status: 'active',
      lastLoginAt: '2024-01-13T08:30:00Z',
      passwordChangedAt: '2024-01-01T10:00:00Z',
      jobTitle: 'Station Manager',
      permissions: ['stations.view', 'stations.edit', 'transactions.view', 'inventory.view'],
      stations: ['1', '2'],
      isActive: true,
      emailVerifiedAt: '2023-01-15T10:00:00Z',
      phoneVerifiedAt: '2023-01-15T11:30:00Z',
      twoFactorEnabled: true,
      lastPasswordChangeRequired: false,
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-13T08:30:00Z',
    },
    {
      id: '2',
      username: 'sarah.mensah',
      email: 'sarah.mensah@omc.com.gh',
      firstName: 'Sarah',
      lastName: 'Mensah',
      fullName: 'Sarah Mensah',
      phone: '+233-244-234-567',
      role: 'finance_manager',
      department: 'Finance',
      employeeNumber: 'EMP-2024-002',
      status: 'active',
      lastLoginAt: '2024-01-12T16:45:00Z',
      passwordChangedAt: '2023-12-15T09:00:00Z',
      jobTitle: 'Finance Manager',
      permissions: ['financial.view', 'financial.create', 'financial.edit', 'reports.view'],
      stations: [],
      isActive: true,
      emailVerifiedAt: '2023-02-10T14:00:00Z',
      twoFactorEnabled: true,
      lastPasswordChangeRequired: false,
      createdAt: '2023-02-10T14:00:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
    },
    {
      id: '3',
      username: 'john.admin',
      email: 'john.admin@omc.com.gh',
      firstName: 'John',
      lastName: 'Administrator',
      fullName: 'John Administrator',
      phone: '+233-244-345-678',
      role: 'super_admin',
      department: 'Information Technology',
      status: 'active',
      lastLoginAt: '2024-01-13T18:20:00Z',
      passwordChangedAt: '2024-01-10T12:00:00Z',
      jobTitle: 'System Administrator',
      permissions: ['admin.full_access'],
      stations: [],
      isActive: true,
      emailVerifiedAt: '2023-01-01T00:00:00Z',
      twoFactorEnabled: true,
      lastPasswordChangeRequired: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-13T18:20:00Z',
    },
    {
      id: '4',
      username: 'grace.owusu',
      email: 'grace.owusu@omc.com.gh',
      firstName: 'Grace',
      lastName: 'Owusu',
      fullName: 'Grace Owusu',
      phone: '+233-244-456-789',
      role: 'attendant',
      department: 'Operations',
      employeeNumber: 'EMP-2024-003',
      status: 'pending',
      jobTitle: 'Station Attendant',
      permissions: ['transactions.view', 'transactions.create'],
      stations: ['1'],
      isActive: true,
      twoFactorEnabled: false,
      lastPasswordChangeRequired: true,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z',
    },
  ];

  const sampleRoles: Role[] = [
    {
      id: '1',
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Complete system access with all permissions',
      permissions: ['admin.full_access'],
      isActive: true,
    },
    {
      id: '2',
      name: 'station_manager',
      displayName: 'Station Manager',
      description: 'Manages station operations, inventory, and staff',
      permissions: ['stations.view', 'stations.edit', 'transactions.view', 'transactions.create', 'inventory.view', 'inventory.edit'],
      isActive: true,
    },
    {
      id: '3',
      name: 'finance_manager',
      displayName: 'Finance Manager',
      description: 'Manages financial operations, accounting, and reporting',
      permissions: ['financial.view', 'financial.create', 'financial.edit', 'reports.view', 'reports.create'],
      isActive: true,
    },
    {
      id: '4',
      name: 'attendant',
      displayName: 'Station Attendant',
      description: 'Basic station operations and customer service',
      permissions: ['transactions.view', 'transactions.create', 'inventory.view'],
      isActive: true,
    },
    {
      id: '5',
      name: 'regional_manager',
      displayName: 'Regional Manager',
      description: 'Oversees multiple stations in a region',
      permissions: ['stations.view', 'transactions.view', 'inventory.view', 'reports.view', 'fleet.view'],
      isActive: true,
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
              User Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage users, roles, and system permissions
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Users
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => {
                if (activeTab === 'users') setIsUserModalOpen(true);
                if (activeTab === 'roles') setIsRoleModalOpen(true);
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {activeTab === 'users' ? 'Add User' : 'Add Role'}
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{users.length}</p>
              <p className="text-sm text-green-400">{users.filter(u => u.isActive).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-green-400 mb-1">
                {users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-dark-400">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">2FA Enabled</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {users.filter(u => u.twoFactorEnabled).length}
              </p>
              <p className="text-sm text-dark-400">
                {Math.round((users.filter(u => u.twoFactorEnabled).length / users.length) * 100)}% of users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Pending Verification</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                {users.filter(u => u.status === 'pending').length}
              </p>
              <p className="text-sm text-dark-400">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-dark-600 text-dark-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'users' && (
            <Card>
              <CardHeader title="User Management">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    options={[{ value: '', label: 'All Roles' }, ...roleOptions]}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    placeholder="Filter by role"
                  />
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Filter by status"
                  />
                  <Select
                    options={[{ value: '', label: 'All Departments' }, ...departmentOptions]}
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    placeholder="Filter by department"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table
                  data={filteredUsers}
                  columns={userColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: filteredUsers.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'roles' && (
            <Card>
              <CardHeader title="Roles & Permissions" />
              <CardContent>
                <Table
                  data={roles}
                  columns={roleColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: roles.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* User Modal */}
        <FormModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            resetUserForm();
          }}
          onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}
          title={isEditMode ? 'Edit User' : 'Create New User'}
          submitText={isEditMode ? 'Update User' : 'Create User'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={userFormData.firstName}
              onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={userFormData.lastName}
              onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="user@omc.com.gh"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              required
            />
            <Input
              label="Username"
              placeholder="unique.username"
              value={userFormData.username}
              onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+233-XXX-XXX-XXX"
              value={userFormData.phone}
              onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
              required
            />
            <Input
              label="Employee Number (Optional)"
              placeholder="EMP-2024-XXX"
              value={userFormData.employeeNumber}
              onChange={(e) => setUserFormData({ ...userFormData, employeeNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              placeholder="Enter job title"
              value={userFormData.jobTitle}
              onChange={(e) => setUserFormData({ ...userFormData, jobTitle: e.target.value })}
              required
            />
            <Select
              label="Department"
              options={departmentOptions}
              value={userFormData.department}
              onChange={(value) => setUserFormData({ ...userFormData, department: value })}
              required
            />
          </div>

          <Select
            label="Role"
            options={roleOptions}
            value={userFormData.role}
            onChange={(value) => setUserFormData({ ...userFormData, role: value })}
            required
          />

          {!isEditMode && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={userFormData.sendWelcomeEmail}
                onChange={(e) => setUserFormData({ ...userFormData, sendWelcomeEmail: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="sendWelcomeEmail" className="text-sm text-white">
                Send welcome email with login instructions
              </label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={userFormData.isActive}
              onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-white">
              User account is active
            </label>
          </div>
        </FormModal>

        {/* Role Modal */}
        <FormModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            resetRoleForm();
          }}
          onSubmit={handleCreateRole}
          title="Create New Role"
          submitText="Create Role"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              placeholder="Station Manager"
              value={roleFormData.displayName}
              onChange={(e) => setRoleFormData({ ...roleFormData, displayName: e.target.value })}
              required
            />
            <Input
              label="System Name"
              placeholder="station_manager"
              value={roleFormData.name}
              onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="Describe the role's responsibilities"
            value={roleFormData.description}
            onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-dark-600 rounded-lg p-4">
              {allPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={roleFormData.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRoleFormData({
                          ...roleFormData,
                          permissions: [...roleFormData.permissions, permission]
                        });
                      } else {
                        setRoleFormData({
                          ...roleFormData,
                          permissions: roleFormData.permissions.filter(p => p !== permission)
                        });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={permission} className="text-xs text-white">
                    {permission}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="roleIsActive"
              checked={roleFormData.isActive}
              onChange={(e) => setRoleFormData({ ...roleFormData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="roleIsActive" className="text-sm text-white">
              Role is active
            </label>
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default UserManagement;