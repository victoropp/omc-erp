import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select, TextArea } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'RETAIL' | 'OPERATIONS' | 'ADMIN' | 'MAINTENANCE' | 'FLEET' | 'SECURITY';
  parentCostCenterId?: string;
  parentCostCenterName?: string;
  manager: string;
  budget: number;
  actualCosts: number;
  variance: number;
  variancePercent: number;
  isActive: boolean;
  level: number;
  createdAt: string;
  updatedAt: string;
}

interface CostAllocation {
  id: string;
  costCenterId: string;
  costCenterName: string;
  accountCode: string;
  accountName: string;
  transactionDate: string;
  description: string;
  amount: number;
  currency: string;
  reference: string;
  allocatedBy: string;
  allocatedAt: string;
}

interface CostCenterBudget {
  id: string;
  costCenterId: string;
  budgetPeriod: string;
  budgetYear: number;
  budgetMonth?: number;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: 'DRAFT' | 'APPROVED' | 'LOCKED';
}

interface CostCenterPerformance {
  costCenterId: string;
  costCenterName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  transactions: number;
  avgTransactionAmount: number;
}

const CostCentersPage: NextPage = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [allocations, setAllocations] = useState<CostAllocation[]>([]);
  const [budgets, setBudgets] = useState<CostCenterBudget[]>([]);
  const [performance, setPerformance] = useState<CostCenterPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'centers' | 'allocations' | 'budgets' | 'performance'>('centers');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('');
  
  const [isCreateCenterModalOpen, setIsCreateCenterModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isEditCenterModalOpen, setIsEditCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);

  const [centerFormData, setCenterFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'OPERATIONS',
    parentCostCenterId: '',
    manager: '',
    budget: '',
  });

  const [allocationFormData, setAllocationFormData] = useState({
    costCenterId: '',
    accountCode: '',
    transactionDate: '',
    description: '',
    amount: '',
    reference: '',
  });

  const [budgetFormData, setBudgetFormData] = useState({
    costCenterId: '',
    budgetPeriod: 'MONTHLY',
    budgetYear: new Date().getFullYear(),
    budgetMonth: new Date().getMonth() + 1,
    budgetAmount: '',
  });

  const [filters, setFilters] = useState({
    type: '',
    manager: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCostCenter, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'centers':
          // const centersData = await financialService.getCostCenters();
          setCostCenters(sampleCostCenters);
          break;
        case 'allocations':
          // const allocationsData = await financialService.getCostAllocations({
          //   costCenterId: selectedCostCenter,
          //   ...filters
          // });
          setAllocations(sampleAllocations.filter(alloc => 
            !selectedCostCenter || alloc.costCenterId === selectedCostCenter
          ));
          break;
        case 'budgets':
          // const budgetsData = await financialService.getCostCenterBudgets();
          setBudgets(sampleBudgets);
          break;
        case 'performance':
          // const performanceData = await financialService.getCostCenterPerformance();
          setPerformance(samplePerformance);
          break;
      }
    } catch (error) {
      toast.error('Failed to load cost center data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createCostCenter(centerFormData);
      toast.success('Cost center created successfully');
      setIsCreateCenterModalOpen(false);
      resetCenterForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create cost center');
    }
  };

  const handleUpdateCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.updateCostCenter(editingCenter?.id, centerFormData);
      toast.success('Cost center updated successfully');
      setIsEditCenterModalOpen(false);
      setEditingCenter(null);
      resetCenterForm();
      loadData();
    } catch (error) {
      toast.error('Failed to update cost center');
    }
  };

  const handleAllocateCost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createCostAllocation(allocationFormData);
      toast.success('Cost allocated successfully');
      setIsAllocateModalOpen(false);
      resetAllocationForm();
      loadData();
    } catch (error) {
      toast.error('Failed to allocate cost');
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createCostCenterBudget(budgetFormData);
      toast.success('Budget created successfully');
      setIsBudgetModalOpen(false);
      resetBudgetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create budget');
    }
  };

  const resetCenterForm = () => {
    setCenterFormData({
      code: '',
      name: '',
      description: '',
      type: 'OPERATIONS',
      parentCostCenterId: '',
      manager: '',
      budget: '',
    });
  };

  const resetAllocationForm = () => {
    setAllocationFormData({
      costCenterId: '',
      accountCode: '',
      transactionDate: '',
      description: '',
      amount: '',
      reference: '',
    });
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      costCenterId: '',
      budgetPeriod: 'MONTHLY',
      budgetYear: new Date().getFullYear(),
      budgetMonth: new Date().getMonth() + 1,
      budgetAmount: '',
    });
  };

  const handleEditCostCenter = (center: CostCenter) => {
    setEditingCenter(center);
    setCenterFormData({
      code: center.code,
      name: center.name,
      description: center.description,
      type: center.type,
      parentCostCenterId: center.parentCostCenterId || '',
      manager: center.manager,
      budget: center.budget.toString(),
    });
    setIsEditCenterModalOpen(true);
  };

  const costCenterColumns = [
    { key: 'code' as keyof CostCenter, header: 'Code', width: '10%', sortable: true },
    { key: 'name' as keyof CostCenter, header: 'Name', width: '20%', sortable: true,
      render: (value: string, row: CostCenter) => (
        <div>
          <p className="text-white font-medium">{value}</p>
          {row.parentCostCenterName && (
            <p className="text-dark-400 text-xs">Parent: {row.parentCostCenterName}</p>
          )}
        </div>
      )
    },
    { key: 'type' as keyof CostCenter, header: 'Type', width: '12%', sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'RETAIL' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'OPERATIONS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          value === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
          value === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          value === 'FLEET' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'manager' as keyof CostCenter, header: 'Manager', width: '15%', sortable: true },
    { key: 'budget' as keyof CostCenter, header: 'Budget', width: '12%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'actualCosts' as keyof CostCenter, header: 'Actual', width: '12%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'variancePercent' as keyof CostCenter, header: 'Variance %', width: '10%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${
          value > 0 ? 'text-red-400' : value < 0 ? 'text-green-400' : 'text-dark-400'
        }`}>
          {value.toFixed(1)}%
        </span>
      )
    },
    { key: 'isActive' as keyof CostCenter, header: 'Status', width: '8%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'id' as keyof CostCenter, header: 'Actions', width: '1%',
      render: (value: string, row: CostCenter) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditCostCenter(row)}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedCostCenter(value);
              setActiveTab('allocations');
            }}
          >
            View Costs
          </Button>
        </div>
      )
    },
  ];

  const allocationColumns = [
    { key: 'transactionDate' as keyof CostAllocation, header: 'Date', width: '12%', sortable: true },
    { key: 'accountName' as keyof CostAllocation, header: 'Account', width: '20%', sortable: true },
    { key: 'description' as keyof CostAllocation, header: 'Description', width: '25%', sortable: true },
    { key: 'amount' as keyof CostAllocation, header: 'Amount', width: '15%', sortable: true,
      render: (value: number, row: CostAllocation) => (
        <span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'reference' as keyof CostAllocation, header: 'Reference', width: '15%', sortable: true },
    { key: 'allocatedBy' as keyof CostAllocation, header: 'Allocated By', width: '13%', sortable: true },
  ];

  // Sample data
  const sampleCostCenters: CostCenter[] = [
    {
      id: '1',
      code: 'RETAIL-01',
      name: 'Retail Station - Accra Central',
      description: 'Main retail fuel station in Accra Central',
      type: 'RETAIL',
      manager: 'John Doe',
      budget: 5000000,
      actualCosts: 4800000,
      variance: -200000,
      variancePercent: -4.0,
      isActive: true,
      level: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      code: 'OPS-01',
      name: 'Operations Management',
      description: 'Central operations and logistics',
      type: 'OPERATIONS',
      manager: 'Jane Smith',
      budget: 8000000,
      actualCosts: 8500000,
      variance: 500000,
      variancePercent: 6.25,
      isActive: true,
      level: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: '3',
      code: 'ADMIN-01',
      name: 'Administration',
      description: 'Administrative functions and overhead',
      type: 'ADMIN',
      manager: 'Mike Johnson',
      budget: 3000000,
      actualCosts: 2700000,
      variance: -300000,
      variancePercent: -10.0,
      isActive: true,
      level: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
    },
    {
      id: '4',
      code: 'MAINT-01',
      name: 'Equipment Maintenance',
      description: 'Equipment and facility maintenance',
      type: 'MAINTENANCE',
      manager: 'Sarah Wilson',
      budget: 2500000,
      actualCosts: 2800000,
      variance: 300000,
      variancePercent: 12.0,
      isActive: true,
      level: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z',
    },
  ];

  const sampleAllocations: CostAllocation[] = [
    {
      id: '1',
      costCenterId: '1',
      costCenterName: 'Retail Station - Accra Central',
      accountCode: '6000',
      accountName: 'Salaries and Wages',
      transactionDate: '2024-01-15',
      description: 'Monthly salaries for retail staff',
      amount: 500000,
      currency: 'GHS',
      reference: 'PAY-202401-001',
      allocatedBy: 'HR System',
      allocatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      costCenterId: '1',
      costCenterName: 'Retail Station - Accra Central',
      accountCode: '6100',
      accountName: 'Utilities',
      transactionDate: '2024-01-20',
      description: 'Electricity bill for January',
      amount: 150000,
      currency: 'GHS',
      reference: 'UTIL-202401-005',
      allocatedBy: 'John Doe',
      allocatedAt: '2024-01-20T14:15:00Z',
    },
    {
      id: '3',
      costCenterId: '2',
      costCenterName: 'Operations Management',
      accountCode: '6200',
      accountName: 'Fuel Transportation',
      transactionDate: '2024-01-18',
      description: 'Fuel delivery costs',
      amount: 800000,
      currency: 'GHS',
      reference: 'TRANS-202401-012',
      allocatedBy: 'Jane Smith',
      allocatedAt: '2024-01-18T09:45:00Z',
    },
  ];

  const sampleBudgets: CostCenterBudget[] = [
    {
      id: '1',
      costCenterId: '1',
      budgetPeriod: 'MONTHLY',
      budgetYear: 2024,
      budgetMonth: 2,
      budgetAmount: 450000,
      actualAmount: 420000,
      variance: -30000,
      variancePercent: -6.7,
      status: 'APPROVED',
    },
  ];

  const samplePerformance: CostCenterPerformance[] = [
    {
      costCenterId: '1',
      costCenterName: 'Retail Station - Accra Central',
      budgetAmount: 5000000,
      actualAmount: 4800000,
      variance: -200000,
      variancePercent: -4.0,
      transactions: 125,
      avgTransactionAmount: 38400,
    },
    {
      costCenterId: '2',
      costCenterName: 'Operations Management',
      budgetAmount: 8000000,
      actualAmount: 8500000,
      variance: 500000,
      variancePercent: 6.25,
      transactions: 87,
      avgTransactionAmount: 97701,
    },
  ];

  const costCenterTypeOptions = [
    { value: 'RETAIL', label: 'Retail' },
    { value: 'OPERATIONS', label: 'Operations' },
    { value: 'ADMIN', label: 'Administration' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'FLEET', label: 'Fleet' },
    { value: 'SECURITY', label: 'Security' },
  ];

  const budgetPeriodOptions = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  const tabs = [
    { id: 'centers', label: 'Cost Centers', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'allocations', label: 'Cost Allocations', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
    { id: 'budgets', label: 'Budgets', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
    { id: 'performance', label: 'Performance', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
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
              Cost Center Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage cost centers, allocations, and budget tracking
            </p>
            {selectedCostCenter && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-dark-400">Selected cost center:</span>
                <span className="text-primary-400 font-medium">
                  {sampleCostCenters.find(cc => cc.id === selectedCostCenter)?.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCostCenter('')}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            {activeTab === 'centers' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreateCenterModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Cost Center
              </Button>
            )}
            {activeTab === 'allocations' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAllocateModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Allocate Cost
              </Button>
            )}
            {activeTab === 'budgets' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsBudgetModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Budget
              </Button>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Cost Centers</h3>
              <p className="text-2xl font-bold text-white mb-1">{sampleCostCenters.length}</p>
              <p className="text-sm text-green-400">{sampleCostCenters.filter(cc => cc.isActive).length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Budget</h3>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                GHS {(sampleCostCenters.reduce((sum, cc) => sum + cc.budget, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-dark-400">Approved budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Actual Costs</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">
                GHS {(sampleCostCenters.reduce((sum, cc) => sum + cc.actualCosts, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-green-400">2.3% under budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Cost Allocations</h3>
              <p className="text-2xl font-bold text-yellow-400 mb-1">{sampleAllocations.length}</p>
              <p className="text-sm text-dark-400">This period</p>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        {(activeTab === 'allocations' || activeTab === 'centers') && (
          <Card>
            <CardHeader title="Filters" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {activeTab === 'centers' && (
                  <Select
                    label="Cost Center Type"
                    options={[
                      { value: '', label: 'All Types' },
                      ...costCenterTypeOptions
                    ]}
                    value={filters.type}
                    onChange={(value) => setFilters({ ...filters, type: value })}
                  />
                )}
                <Input
                  label="Manager"
                  placeholder="Filter by manager"
                  value={filters.manager}
                  onChange={(e) => setFilters({ ...filters, manager: e.target.value })}
                />
                <Input
                  label="Date From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
                <Input
                  label="Date To"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
                <Input
                  label="Min Amount"
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                />
                <Input
                  label="Max Amount"
                  type="number"
                  placeholder="0.00"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'centers' && (
            <Card>
              <CardHeader title="Cost Centers" />
              <CardContent>
                <Table
                  data={costCenters.filter(cc => 
                    (!filters.type || cc.type === filters.type) &&
                    (!filters.manager || cc.manager.toLowerCase().includes(filters.manager.toLowerCase()))
                  )}
                  columns={costCenterColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: costCenters.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'allocations' && (
            <Card>
              <CardHeader 
                title="Cost Allocations" 
                subtitle={selectedCostCenter ? 
                  `Showing allocations for: ${sampleCostCenters.find(cc => cc.id === selectedCostCenter)?.name}` : 
                  'Showing all allocations'
                }
              />
              <CardContent>
                <Table
                  data={allocations}
                  columns={allocationColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 25,
                    total: allocations.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'budgets' && (
            <Card>
              <CardHeader title="Cost Center Budgets" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Budget Management</h3>
                  <p className="text-dark-400 mb-6">
                    Budget tracking and variance analysis will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Cost Center Performance Analysis" />
                <CardContent>
                  <div className="space-y-4">
                    {performance.map((perf) => (
                      <div key={perf.costCenterId} className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-medium text-white">{perf.costCenterName}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            perf.variancePercent < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {perf.variancePercent > 0 ? '+' : ''}{perf.variancePercent.toFixed(1)}% variance
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-dark-400 text-sm">Budget</p>
                            <p className="text-white font-medium">
                              GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                              }).format(perf.budgetAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark-400 text-sm">Actual</p>
                            <p className="text-white font-medium">
                              GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                              }).format(perf.actualAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark-400 text-sm">Transactions</p>
                            <p className="text-white font-medium">{perf.transactions}</p>
                          </div>
                          <div>
                            <p className="text-dark-400 text-sm">Avg Transaction</p>
                            <p className="text-white font-medium">
                              GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                              }).format(perf.avgTransactionAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Create Cost Center Modal */}
        <FormModal
          isOpen={isCreateCenterModalOpen}
          onClose={() => {
            setIsCreateCenterModalOpen(false);
            resetCenterForm();
          }}
          onSubmit={handleCreateCostCenter}
          title="Create Cost Center"
          submitText="Create Cost Center"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Code"
                placeholder="e.g., RETAIL-01"
                value={centerFormData.code}
                onChange={(e) => setCenterFormData({ ...centerFormData, code: e.target.value })}
                required
              />
              <Input
                label="Name"
                placeholder="Cost center name"
                value={centerFormData.name}
                onChange={(e) => setCenterFormData({ ...centerFormData, name: e.target.value })}
                required
              />
            </div>

            <TextArea
              label="Description"
              placeholder="Cost center description"
              value={centerFormData.description}
              onChange={(e) => setCenterFormData({ ...centerFormData, description: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                options={costCenterTypeOptions}
                value={centerFormData.type}
                onChange={(value) => setCenterFormData({ ...centerFormData, type: value })}
                required
              />
              <Input
                label="Manager"
                placeholder="Manager name"
                value={centerFormData.manager}
                onChange={(e) => setCenterFormData({ ...centerFormData, manager: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Parent Cost Center"
                options={[
                  { value: '', label: 'None (Top Level)' },
                  ...costCenters.map(cc => ({ value: cc.id, label: cc.name }))
                ]}
                value={centerFormData.parentCostCenterId}
                onChange={(value) => setCenterFormData({ ...centerFormData, parentCostCenterId: value })}
              />
              <Input
                label="Annual Budget (GHS)"
                type="number"
                placeholder="0.00"
                value={centerFormData.budget}
                onChange={(e) => setCenterFormData({ ...centerFormData, budget: e.target.value })}
                required
              />
            </div>
          </div>
        </FormModal>

        {/* Edit Cost Center Modal */}
        <FormModal
          isOpen={isEditCenterModalOpen}
          onClose={() => {
            setIsEditCenterModalOpen(false);
            setEditingCenter(null);
            resetCenterForm();
          }}
          onSubmit={handleUpdateCostCenter}
          title="Edit Cost Center"
          submitText="Update Cost Center"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Code"
                placeholder="e.g., RETAIL-01"
                value={centerFormData.code}
                onChange={(e) => setCenterFormData({ ...centerFormData, code: e.target.value })}
                required
              />
              <Input
                label="Name"
                placeholder="Cost center name"
                value={centerFormData.name}
                onChange={(e) => setCenterFormData({ ...centerFormData, name: e.target.value })}
                required
              />
            </div>

            <TextArea
              label="Description"
              placeholder="Cost center description"
              value={centerFormData.description}
              onChange={(e) => setCenterFormData({ ...centerFormData, description: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                options={costCenterTypeOptions}
                value={centerFormData.type}
                onChange={(value) => setCenterFormData({ ...centerFormData, type: value })}
                required
              />
              <Input
                label="Manager"
                placeholder="Manager name"
                value={centerFormData.manager}
                onChange={(e) => setCenterFormData({ ...centerFormData, manager: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Parent Cost Center"
                options={[
                  { value: '', label: 'None (Top Level)' },
                  ...costCenters.filter(cc => cc.id !== editingCenter?.id).map(cc => ({ value: cc.id, label: cc.name }))
                ]}
                value={centerFormData.parentCostCenterId}
                onChange={(value) => setCenterFormData({ ...centerFormData, parentCostCenterId: value })}
              />
              <Input
                label="Annual Budget (GHS)"
                type="number"
                placeholder="0.00"
                value={centerFormData.budget}
                onChange={(e) => setCenterFormData({ ...centerFormData, budget: e.target.value })}
                required
              />
            </div>
          </div>
        </FormModal>

        {/* Allocate Cost Modal */}
        <FormModal
          isOpen={isAllocateModalOpen}
          onClose={() => {
            setIsAllocateModalOpen(false);
            resetAllocationForm();
          }}
          onSubmit={handleAllocateCost}
          title="Allocate Cost"
          submitText="Allocate Cost"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Cost Center"
                options={costCenters.filter(cc => cc.isActive).map(cc => ({ 
                  value: cc.id, 
                  label: cc.name 
                }))}
                value={allocationFormData.costCenterId}
                onChange={(value) => setAllocationFormData({ ...allocationFormData, costCenterId: value })}
                required
              />
              <Input
                label="Account Code"
                placeholder="e.g., 6000"
                value={allocationFormData.accountCode}
                onChange={(e) => setAllocationFormData({ ...allocationFormData, accountCode: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Transaction Date"
                type="date"
                value={allocationFormData.transactionDate}
                onChange={(e) => setAllocationFormData({ ...allocationFormData, transactionDate: e.target.value })}
                required
              />
              <Input
                label="Amount (GHS)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={allocationFormData.amount}
                onChange={(e) => setAllocationFormData({ ...allocationFormData, amount: e.target.value })}
                required
              />
            </div>

            <TextArea
              label="Description"
              placeholder="Cost allocation description"
              value={allocationFormData.description}
              onChange={(e) => setAllocationFormData({ ...allocationFormData, description: e.target.value })}
              rows={3}
              required
            />

            <Input
              label="Reference"
              placeholder="Reference number or document ID"
              value={allocationFormData.reference}
              onChange={(e) => setAllocationFormData({ ...allocationFormData, reference: e.target.value })}
            />
          </div>
        </FormModal>

        {/* Create Budget Modal */}
        <FormModal
          isOpen={isBudgetModalOpen}
          onClose={() => {
            setIsBudgetModalOpen(false);
            resetBudgetForm();
          }}
          onSubmit={handleCreateBudget}
          title="Create Budget"
          submitText="Create Budget"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Cost Center"
                options={costCenters.filter(cc => cc.isActive).map(cc => ({ 
                  value: cc.id, 
                  label: cc.name 
                }))}
                value={budgetFormData.costCenterId}
                onChange={(value) => setBudgetFormData({ ...budgetFormData, costCenterId: value })}
                required
              />
              <Select
                label="Budget Period"
                options={budgetPeriodOptions}
                value={budgetFormData.budgetPeriod}
                onChange={(value) => setBudgetFormData({ ...budgetFormData, budgetPeriod: value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget Year"
                type="number"
                value={budgetFormData.budgetYear}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, budgetYear: parseInt(e.target.value) })}
                required
              />
              {budgetFormData.budgetPeriod === 'MONTHLY' && (
                <Select
                  label="Budget Month"
                  options={[
                    { value: '1', label: 'January' },
                    { value: '2', label: 'February' },
                    { value: '3', label: 'March' },
                    { value: '4', label: 'April' },
                    { value: '5', label: 'May' },
                    { value: '6', label: 'June' },
                    { value: '7', label: 'July' },
                    { value: '8', label: 'August' },
                    { value: '9', label: 'September' },
                    { value: '10', label: 'October' },
                    { value: '11', label: 'November' },
                    { value: '12', label: 'December' },
                  ]}
                  value={budgetFormData.budgetMonth.toString()}
                  onChange={(value) => setBudgetFormData({ ...budgetFormData, budgetMonth: parseInt(value) })}
                  required
                />
              )}
            </div>

            <Input
              label="Budget Amount (GHS)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={budgetFormData.budgetAmount}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, budgetAmount: e.target.value })}
              required
            />
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default CostCentersPage;