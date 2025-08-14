import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface Permission {
  id: string;
  module: string;
  action: string;
  resource: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  permissions: Permission[];
  userCount: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const RoleManagement: NextPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form data states
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: '#6366f1',
    permissions: [] as string[],
    isActive: true,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setRoles(sampleRoles);
      setPermissions(samplePermissions);
    } catch (error) {
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
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

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Role updated successfully');
      setIsRoleModalOpen(false);
      resetRoleForm();
      loadData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        toast.success('Role deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      displayName: '',
      description: '',
      color: '#6366f1',
      permissions: [],
      isActive: true,
    });
    setIsEditMode(false);
    setSelectedRole(null);
  };

  const openEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      color: role.color,
      permissions: role.permissions.map(p => p.id),
      isActive: role.isActive,
    });
    setIsEditMode(true);
    setIsRoleModalOpen(true);
  };

  // Filtered data
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? role.isActive : !role.isActive);
    const matchesModule = !moduleFilter || role.permissions.some(p => p.module === moduleFilter);
    
    return matchesSearch && matchesStatus && matchesModule;
  });

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(permissionsByModule);

  // Table columns
  const roleColumns = [
    { key: 'displayName' as keyof Role, header: 'Role Name', width: '20%', sortable: true,
      render: (value: string, row: Role) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-sm text-dark-400">{row.name}</p>
          </div>
        </div>
      )
    },
    { key: 'description' as keyof Role, header: 'Description', width: '30%' },
    { key: 'userCount' as keyof Role, header: 'Users', width: '8%',
      render: (value: number) => (
        <span className="text-primary-400 font-medium">{value}</span>
      )
    },
    { key: 'permissions' as keyof Role, header: 'Permissions', width: '15%',
      render: (value: Permission[]) => (
        <div className="flex items-center space-x-2">
          <span className="text-dark-400">{value.length}</span>
          <span className="text-xs text-dark-500">permissions</span>
        </div>
      )
    },
    { key: 'isSystem' as keyof Role, header: 'Type', width: '10%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {value ? 'SYSTEM' : 'CUSTOM'}
        </span>
      )
    },
    { key: 'isActive' as keyof Role, header: 'Status', width: '8%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    { key: 'id' as keyof Role, header: 'Actions', width: '12%',
      render: (value: string, row: Role) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openEditRole(row)}
            disabled={row.isSystem}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsPermissionModalOpen(true)}
          >
            Permissions
          </Button>
          {!row.isSystem && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDeleteRole(value)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </Button>
          )}
        </div>
      )
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const moduleOptions = [
    { value: '', label: 'All Modules' },
    ...modules.map(module => ({ value: module, label: module.replace('_', ' ').toUpperCase() }))
  ];

  const colorOptions = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#ef4444', label: 'Red' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#84cc16', label: 'Lime' },
  ];

  // Sample data
  const sampleRoles: Role[] = [
    {
      id: '1',
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Complete system access with all administrative privileges',
      color: '#ef4444',
      permissions: samplePermissions.filter(p => p.module === 'admin'),
      userCount: 2,
      isActive: true,
      isSystem: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-13T18:20:00Z',
    },
    {
      id: '2',
      name: 'station_manager',
      displayName: 'Station Manager',
      description: 'Manages station operations, inventory, and staff',
      color: '#8b5cf6',
      permissions: samplePermissions.filter(p => ['stations', 'inventory', 'transactions'].includes(p.module)),
      userCount: 15,
      isActive: true,
      isSystem: false,
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
    },
    {
      id: '3',
      name: 'finance_manager',
      displayName: 'Finance Manager',
      description: 'Manages financial operations, accounting, and reporting',
      color: '#10b981',
      permissions: samplePermissions.filter(p => ['financial', 'reports'].includes(p.module)),
      userCount: 8,
      isActive: true,
      isSystem: false,
      createdAt: '2023-02-01T09:00:00Z',
      updatedAt: '2024-01-05T11:15:00Z',
    },
    {
      id: '4',
      name: 'attendant',
      displayName: 'Station Attendant',
      description: 'Basic station operations and customer service',
      color: '#06b6d4',
      permissions: samplePermissions.filter(p => p.module === 'transactions' && p.action !== 'delete'),
      userCount: 45,
      isActive: true,
      isSystem: false,
      createdAt: '2023-01-20T12:00:00Z',
      updatedAt: '2023-12-20T16:45:00Z',
    },
    {
      id: '5',
      name: 'regional_manager',
      displayName: 'Regional Manager',
      description: 'Oversees multiple stations and regional operations',
      color: '#f59e0b',
      permissions: samplePermissions.filter(p => ['stations', 'reports', 'fleet', 'dealers'].includes(p.module)),
      userCount: 6,
      isActive: true,
      isSystem: false,
      createdAt: '2023-03-01T08:00:00Z',
      updatedAt: '2024-01-12T09:30:00Z',
    },
  ];

  const samplePermissions: Permission[] = [
    // Admin permissions
    { id: '1', module: 'admin', action: 'full_access', resource: '*', description: 'Complete administrative access' },
    { id: '2', module: 'admin', action: 'view', resource: 'system_logs', description: 'View system audit logs' },
    { id: '3', module: 'admin', action: 'manage', resource: 'users', description: 'Create, edit, and delete users' },
    { id: '4', module: 'admin', action: 'manage', resource: 'roles', description: 'Create and modify roles' },
    
    // Stations permissions
    { id: '5', module: 'stations', action: 'view', resource: 'stations', description: 'View station information' },
    { id: '6', module: 'stations', action: 'create', resource: 'stations', description: 'Create new stations' },
    { id: '7', module: 'stations', action: 'edit', resource: 'stations', description: 'Edit station details' },
    { id: '8', module: 'stations', action: 'delete', resource: 'stations', description: 'Delete stations' },
    
    // Transactions permissions
    { id: '9', module: 'transactions', action: 'view', resource: 'transactions', description: 'View transaction records' },
    { id: '10', module: 'transactions', action: 'create', resource: 'transactions', description: 'Process new transactions' },
    { id: '11', module: 'transactions', action: 'edit', resource: 'transactions', description: 'Modify transaction details' },
    { id: '12', module: 'transactions', action: 'delete', resource: 'transactions', description: 'Cancel/delete transactions' },
    
    // Inventory permissions
    { id: '13', module: 'inventory', action: 'view', resource: 'inventory', description: 'View inventory levels' },
    { id: '14', module: 'inventory', action: 'create', resource: 'inventory', description: 'Add new inventory items' },
    { id: '15', module: 'inventory', action: 'edit', resource: 'inventory', description: 'Update inventory records' },
    { id: '16', module: 'inventory', action: 'delete', resource: 'inventory', description: 'Remove inventory items' },
    
    // Financial permissions
    { id: '17', module: 'financial', action: 'view', resource: 'accounts', description: 'View chart of accounts' },
    { id: '18', module: 'financial', action: 'create', resource: 'journal_entries', description: 'Create journal entries' },
    { id: '19', module: 'financial', action: 'edit', resource: 'journal_entries', description: 'Modify journal entries' },
    { id: '20', module: 'financial', action: 'approve', resource: 'journal_entries', description: 'Approve journal entries' },
    
    // Reports permissions
    { id: '21', module: 'reports', action: 'view', resource: 'reports', description: 'View system reports' },
    { id: '22', module: 'reports', action: 'create', resource: 'reports', description: 'Generate custom reports' },
    { id: '23', module: 'reports', action: 'export', resource: 'reports', description: 'Export reports to files' },
    
    // Fleet permissions
    { id: '24', module: 'fleet', action: 'view', resource: 'vehicles', description: 'View fleet vehicles' },
    { id: '25', module: 'fleet', action: 'manage', resource: 'deliveries', description: 'Manage delivery schedules' },
    
    // Dealers permissions
    { id: '26', module: 'dealers', action: 'view', resource: 'dealers', description: 'View dealer information' },
    { id: '27', module: 'dealers', action: 'onboard', resource: 'dealers', description: 'Onboard new dealers' },
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
              Roles & Permissions
            </h1>
            <p className="text-dark-400 mt-2">
              Manage system roles and permission assignments
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Roles
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setIsRoleModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Role
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Roles</h3>
              <p className="text-3xl font-bold text-primary-400 mb-1">{roles.length}</p>
              <p className="text-sm text-green-400">{roles.filter(r => r.isActive).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Custom Roles</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {roles.filter(r => !r.isSystem).length}
              </p>
              <p className="text-sm text-dark-400">User-defined</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </p>
              <p className="text-sm text-dark-400">Across all roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Permissions</h3>
              <p className="text-3xl font-bold text-purple-400 mb-1">{permissions.length}</p>
              <p className="text-sm text-dark-400">{modules.length} modules</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader title="Role Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              />
              <Select
                options={moduleOptions}
                value={moduleFilter}
                onChange={setModuleFilter}
                placeholder="Filter by module"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table
              data={filteredRoles}
              columns={roleColumns}
              loading={loading}
              pagination={{
                page: 1,
                limit: 10,
                total: filteredRoles.length,
                onPageChange: () => {},
                onLimitChange: () => {},
              }}
            />
          </CardContent>
        </Card>

        {/* Role Modal */}
        <FormModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            resetRoleForm();
          }}
          onSubmit={isEditMode ? handleUpdateRole : handleCreateRole}
          title={isEditMode ? 'Edit Role' : 'Create New Role'}
          submitText={isEditMode ? 'Update Role' : 'Create Role'}
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

          <Select
            label="Role Color"
            options={colorOptions}
            value={roleFormData.color}
            onChange={(value) => setRoleFormData({ ...roleFormData, color: value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Permissions
            </label>
            <div className="space-y-4 max-h-60 overflow-y-auto border border-dark-600 rounded-lg p-4">
              {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                <div key={module}>
                  <h4 className="font-semibold text-white mb-2 capitalize">
                    {module.replace('_', ' ')}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    {modulePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={roleFormData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: [...roleFormData.permissions, permission.id]
                              });
                            } else {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: roleFormData.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <label htmlFor={permission.id} className="text-sm text-white">
                            {permission.action}.{permission.resource}
                          </label>
                          <p className="text-xs text-dark-400">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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

        {/* Permissions Modal */}
        <FormModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          onSubmit={() => setIsPermissionModalOpen(false)}
          title="Role Permissions Detail"
          submitText="Close"
        >
          <div className="space-y-4">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
              <div key={module}>
                <h4 className="font-semibold text-white mb-2 capitalize bg-dark-700 px-3 py-2 rounded">
                  {module.replace('_', ' ')}
                </h4>
                <div className="space-y-2 pl-4">
                  {modulePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-white text-sm font-medium">
                          {permission.action}.{permission.resource}
                        </span>
                        <p className="text-xs text-dark-400">{permission.description}</p>
                      </div>
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                        {permission.module}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default RoleManagement;