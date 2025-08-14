import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select, TextArea } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface BudgetPlan {
  id: string;
  name: string;
  description: string;
  budgetYear: number;
  budgetPeriod: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetLine {
  id: string;
  budgetPlanId: string;
  accountCode: string;
  accountName: string;
  accountType: 'REVENUE' | 'EXPENSE' | 'CAPITAL';
  costCenterId?: string;
  costCenterName?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  period: string; // e.g., "2024-01" for monthly, "2024-Q1" for quarterly
  notes?: string;
}

interface BudgetForecast {
  id: string;
  budgetPlanId: string;
  forecastPeriod: string;
  forecastType: 'REVENUE' | 'EXPENSE' | 'CAPITAL';
  forecastAmount: number;
  actualAmount: number;
  variance: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

interface BudgetScenario {
  id: string;
  name: string;
  description: string;
  scenarioType: 'OPTIMISTIC' | 'REALISTIC' | 'PESSIMISTIC';
  baseBudgetPlanId: string;
  adjustmentPercent: number;
  totalBudget: number;
  isActive: boolean;
  createdAt: string;
}

const BudgetManagementPage: NextPage = () => {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [scenarios, setScenarios] = useState<BudgetScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'lines' | 'forecasts' | 'scenarios' | 'analysis'>('plans');
  const [selectedBudgetPlan, setSelectedBudgetPlan] = useState<string>('');

  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreateLineModalOpen, setIsCreateLineModalOpen] = useState(false);
  const [isCreateForecastModalOpen, setIsCreateForecastModalOpen] = useState(false);
  const [isCreateScenarioModalOpen, setIsCreateScenarioModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BudgetPlan | null>(null);

  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    budgetYear: new Date().getFullYear(),
    budgetPeriod: 'MONTHLY',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  });

  const [lineFormData, setLineFormData] = useState({
    budgetPlanId: '',
    accountCode: '',
    costCenterId: '',
    budgetAmount: '',
    period: '',
    notes: '',
  });

  const [forecastFormData, setForecastFormData] = useState({
    budgetPlanId: '',
    forecastPeriod: '',
    forecastType: 'REVENUE',
    forecastAmount: '',
    confidenceLevel: 'MEDIUM',
    notes: '',
  });

  const [scenarioFormData, setScenarioFormData] = useState({
    name: '',
    description: '',
    scenarioType: 'REALISTIC',
    baseBudgetPlanId: '',
    adjustmentPercent: '',
  });

  const [filters, setFilters] = useState({
    budgetYear: new Date().getFullYear(),
    status: '',
    accountType: '',
    costCenter: '',
    period: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab, selectedBudgetPlan, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'plans':
          // const plansData = await financialService.getBudgetPlans(filters);
          setBudgetPlans(sampleBudgetPlans.filter(plan => 
            (!filters.status || plan.status === filters.status) &&
            (plan.budgetYear === filters.budgetYear)
          ));
          break;
        case 'lines':
          // const linesData = await financialService.getBudgetLines({
          //   budgetPlanId: selectedBudgetPlan,
          //   ...filters
          // });
          setBudgetLines(sampleBudgetLines.filter(line => 
            (!selectedBudgetPlan || line.budgetPlanId === selectedBudgetPlan) &&
            (!filters.accountType || line.accountType === filters.accountType)
          ));
          break;
        case 'forecasts':
          // const forecastsData = await financialService.getBudgetForecasts();
          setForecasts(sampleForecasts);
          break;
        case 'scenarios':
          // const scenariosData = await financialService.getBudgetScenarios();
          setScenarios(sampleScenarios);
          break;
      }
    } catch (error) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createBudgetPlan(planFormData);
      toast.success('Budget plan created successfully');
      setIsCreatePlanModalOpen(false);
      resetPlanForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create budget plan');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.updateBudgetPlan(editingPlan?.id, planFormData);
      toast.success('Budget plan updated successfully');
      setIsEditPlanModalOpen(false);
      setEditingPlan(null);
      resetPlanForm();
      loadData();
    } catch (error) {
      toast.error('Failed to update budget plan');
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      // await financialService.approveBudgetPlan(planId);
      toast.success('Budget plan approved successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to approve budget plan');
    }
  };

  const handleCreateLine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createBudgetLine(lineFormData);
      toast.success('Budget line created successfully');
      setIsCreateLineModalOpen(false);
      resetLineForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create budget line');
    }
  };

  const handleCreateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createBudgetForecast(forecastFormData);
      toast.success('Budget forecast created successfully');
      setIsCreateForecastModalOpen(false);
      resetForecastForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create forecast');
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createBudgetScenario(scenarioFormData);
      toast.success('Budget scenario created successfully');
      setIsCreateScenarioModalOpen(false);
      resetScenarioForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create scenario');
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      budgetYear: new Date().getFullYear(),
      budgetPeriod: 'MONTHLY',
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    });
  };

  const resetLineForm = () => {
    setLineFormData({
      budgetPlanId: '',
      accountCode: '',
      costCenterId: '',
      budgetAmount: '',
      period: '',
      notes: '',
    });
  };

  const resetForecastForm = () => {
    setForecastFormData({
      budgetPlanId: '',
      forecastPeriod: '',
      forecastType: 'REVENUE',
      forecastAmount: '',
      confidenceLevel: 'MEDIUM',
      notes: '',
    });
  };

  const resetScenarioForm = () => {
    setScenarioFormData({
      name: '',
      description: '',
      scenarioType: 'REALISTIC',
      baseBudgetPlanId: '',
      adjustmentPercent: '',
    });
  };

  const handleEditPlan = (plan: BudgetPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description,
      budgetYear: plan.budgetYear,
      budgetPeriod: plan.budgetPeriod,
      startDate: plan.startDate,
      endDate: plan.endDate,
    });
    setIsEditPlanModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-400'; // Over budget
    if (variance < 0) return 'text-green-400'; // Under budget
    return 'text-dark-400';
  };

  const budgetPlanColumns = [
    { key: 'name' as keyof BudgetPlan, header: 'Plan Name', width: '20%', sortable: true },
    { key: 'budgetYear' as keyof BudgetPlan, header: 'Year', width: '8%', sortable: true },
    { key: 'budgetPeriod' as keyof BudgetPlan, header: 'Period', width: '10%', sortable: true },
    { key: 'totalBudget' as keyof BudgetPlan, header: 'Total Budget', width: '15%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {formatCurrency(value)}
        </span>
      )
    },
    { key: 'totalActual' as keyof BudgetPlan, header: 'Actual', width: '15%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {formatCurrency(value)}
        </span>
      )
    },
    { key: 'variancePercent' as keyof BudgetPlan, header: 'Variance %', width: '12%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${getVarianceColor(value)}`}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      )
    },
    { key: 'status' as keyof BudgetPlan, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'ACTIVE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          value === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          value === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof BudgetPlan, header: 'Actions', width: '10%',
      render: (value: string, row: BudgetPlan) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditPlan(row)}
          >
            Edit
          </Button>
          {row.status === 'DRAFT' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleApprovePlan(row.id)}
            >
              Approve
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedBudgetPlan(value);
              setActiveTab('lines');
            }}
          >
            Details
          </Button>
        </div>
      )
    },
  ];

  const budgetLineColumns = [
    { key: 'accountCode' as keyof BudgetLine, header: 'Account', width: '12%', sortable: true },
    { key: 'accountName' as keyof BudgetLine, header: 'Account Name', width: '20%', sortable: true },
    { key: 'accountType' as keyof BudgetLine, header: 'Type', width: '10%', sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'REVENUE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'EXPENSE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'costCenterName' as keyof BudgetLine, header: 'Cost Center', width: '15%', sortable: true },
    { key: 'budgetAmount' as keyof BudgetLine, header: 'Budget', width: '12%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {formatCurrency(value)}
        </span>
      )
    },
    { key: 'actualAmount' as keyof BudgetLine, header: 'Actual', width: '12%', sortable: true,
      render: (value: number) => (
        <span className="font-medium text-white">
          GHS {formatCurrency(value)}
        </span>
      )
    },
    { key: 'variancePercent' as keyof BudgetLine, header: 'Variance %', width: '10%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${getVarianceColor(value)}`}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      )
    },
    { key: 'period' as keyof BudgetLine, header: 'Period', width: '9%', sortable: true },
  ];

  // Sample data
  const sampleBudgetPlans: BudgetPlan[] = [
    {
      id: '1',
      name: 'Annual Budget 2024',
      description: 'Comprehensive annual budget for 2024 operations',
      budgetYear: 2024,
      budgetPeriod: 'MONTHLY',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      totalBudget: 250000000,
      totalActual: 45000000,
      totalVariance: -5000000,
      variancePercent: -2.0,
      status: 'ACTIVE',
      approvedBy: 'CFO',
      approvedAt: '2023-12-15T00:00:00Z',
      createdBy: 'Budget Manager',
      createdAt: '2023-11-01T00:00:00Z',
      updatedAt: '2023-12-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Q1 2024 Operational Budget',
      description: 'First quarter operational budget with focus on expansion',
      budgetYear: 2024,
      budgetPeriod: 'QUARTERLY',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      totalBudget: 65000000,
      totalActual: 68000000,
      totalVariance: 3000000,
      variancePercent: 4.6,
      status: 'COMPLETED',
      approvedBy: 'CFO',
      approvedAt: '2023-12-20T00:00:00Z',
      createdBy: 'Operations Manager',
      createdAt: '2023-11-15T00:00:00Z',
      updatedAt: '2024-03-31T00:00:00Z',
    },
    {
      id: '3',
      name: 'Capital Expenditure 2024',
      description: 'Capital investment budget for infrastructure and equipment',
      budgetYear: 2024,
      budgetPeriod: 'YEARLY',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      totalBudget: 45000000,
      totalActual: 8000000,
      totalVariance: -2000000,
      variancePercent: -4.4,
      status: 'APPROVED',
      approvedBy: 'CEO',
      approvedAt: '2023-12-30T00:00:00Z',
      createdBy: 'Finance Director',
      createdAt: '2023-11-30T00:00:00Z',
      updatedAt: '2023-12-30T00:00:00Z',
    },
  ];

  const sampleBudgetLines: BudgetLine[] = [
    {
      id: '1',
      budgetPlanId: '1',
      accountCode: '4000',
      accountName: 'Fuel Sales Revenue',
      accountType: 'REVENUE',
      costCenterId: 'RETAIL-01',
      costCenterName: 'Retail Station - Accra Central',
      budgetAmount: 180000000,
      actualAmount: 32000000,
      variance: -3000000,
      variancePercent: -1.7,
      period: '2024-01',
      notes: 'Conservative estimate based on market conditions',
    },
    {
      id: '2',
      budgetPlanId: '1',
      accountCode: '5000',
      accountName: 'Cost of Fuel Sold',
      accountType: 'EXPENSE',
      costCenterId: 'OPS-01',
      costCenterName: 'Operations Management',
      budgetAmount: 145000000,
      actualAmount: 26000000,
      variance: 1000000,
      variancePercent: 0.7,
      period: '2024-01',
      notes: 'Includes transportation and storage costs',
    },
    {
      id: '3',
      budgetPlanId: '1',
      accountCode: '6000',
      accountName: 'Operating Expenses',
      accountType: 'EXPENSE',
      costCenterId: 'ADMIN-01',
      costCenterName: 'Administration',
      budgetAmount: 15000000,
      actualAmount: 2800000,
      variance: 200000,
      variancePercent: 1.3,
      period: '2024-01',
      notes: 'General administrative expenses',
    },
  ];

  const sampleForecasts: BudgetForecast[] = [
    {
      id: '1',
      budgetPlanId: '1',
      forecastPeriod: '2024-Q2',
      forecastType: 'REVENUE',
      forecastAmount: 195000000,
      actualAmount: 0,
      variance: 0,
      confidenceLevel: 'HIGH',
      notes: 'Based on seasonal trends and market analysis',
    },
  ];

  const sampleScenarios: BudgetScenario[] = [
    {
      id: '1',
      name: 'Optimistic Growth Scenario',
      description: '15% growth scenario with expanded operations',
      scenarioType: 'OPTIMISTIC',
      baseBudgetPlanId: '1',
      adjustmentPercent: 15.0,
      totalBudget: 287500000,
      isActive: false,
      createdAt: '2023-12-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Economic Downturn Scenario',
      description: 'Conservative scenario with 10% reduction',
      scenarioType: 'PESSIMISTIC',
      baseBudgetPlanId: '1',
      adjustmentPercent: -10.0,
      totalBudget: 225000000,
      isActive: true,
      createdAt: '2023-12-01T00:00:00Z',
    },
  ];

  const budgetPeriodOptions = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const accountTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'REVENUE', label: 'Revenue' },
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'CAPITAL', label: 'Capital' },
  ];

  const forecastTypeOptions = [
    { value: 'REVENUE', label: 'Revenue' },
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'CAPITAL', label: 'Capital' },
  ];

  const confidenceLevelOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const scenarioTypeOptions = [
    { value: 'OPTIMISTIC', label: 'Optimistic' },
    { value: 'REALISTIC', label: 'Realistic' },
    { value: 'PESSIMISTIC', label: 'Pessimistic' },
  ];

  const tabs = [
    { id: 'plans', label: 'Budget Plans', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'lines', label: 'Budget Lines', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
    { id: 'forecasts', label: 'Forecasts', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'scenarios', label: 'Scenarios', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'analysis', label: 'Analysis', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
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
              Budget Management
            </h1>
            <p className="text-dark-400 mt-2">
              Plan, track, and analyze budgets with forecasting and scenario modeling
            </p>
            {selectedBudgetPlan && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-dark-400">Selected budget plan:</span>
                <span className="text-primary-400 font-medium">
                  {sampleBudgetPlans.find(plan => plan.id === selectedBudgetPlan)?.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedBudgetPlan('')}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            {activeTab === 'plans' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreatePlanModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Budget Plan
              </Button>
            )}
            {activeTab === 'lines' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreateLineModalOpen(true)}
                disabled={!selectedBudgetPlan}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Budget Line
              </Button>
            )}
            {activeTab === 'forecasts' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreateForecastModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Forecast
              </Button>
            )}
            {activeTab === 'scenarios' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreateScenarioModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Scenario
              </Button>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Active Budget Plans</h3>
              <p className="text-2xl font-bold text-white mb-1">
                {sampleBudgetPlans.filter(plan => plan.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-green-400">Currently tracking</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Budget</h3>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                GHS {(sampleBudgetPlans.reduce((sum, plan) => sum + plan.totalBudget, 0) / 1000000).toFixed(0)}M
              </p>
              <p className="text-sm text-dark-400">Approved amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">YTD Actual</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">
                GHS {(sampleBudgetPlans.reduce((sum, plan) => sum + plan.totalActual, 0) / 1000000).toFixed(0)}M
              </p>
              <p className="text-sm text-green-400">33% of budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Budget Variance</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">-1.2%</p>
              <p className="text-sm text-green-400">Under budget</p>
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
        {(activeTab === 'plans' || activeTab === 'lines') && (
          <Card>
            <CardHeader title="Filters" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  label="Budget Year"
                  type="number"
                  value={filters.budgetYear}
                  onChange={(e) => setFilters({ ...filters, budgetYear: parseInt(e.target.value) })}
                />
                {activeTab === 'plans' && (
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={filters.status}
                    onChange={(value) => setFilters({ ...filters, status: value })}
                  />
                )}
                {activeTab === 'lines' && (
                  <>
                    <Select
                      label="Account Type"
                      options={accountTypeOptions}
                      value={filters.accountType}
                      onChange={(value) => setFilters({ ...filters, accountType: value })}
                    />
                    <Input
                      label="Period"
                      placeholder="e.g., 2024-01"
                      value={filters.period}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                    />
                  </>
                )}
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
          {activeTab === 'plans' && (
            <Card>
              <CardHeader title="Budget Plans" />
              <CardContent>
                <Table
                  data={budgetPlans}
                  columns={budgetPlanColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: budgetPlans.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'lines' && (
            <Card>
              <CardHeader 
                title="Budget Lines" 
                subtitle={selectedBudgetPlan ? 
                  `Budget lines for: ${sampleBudgetPlans.find(plan => plan.id === selectedBudgetPlan)?.name}` : 
                  'Select a budget plan to view lines'
                }
              />
              <CardContent>
                <Table
                  data={budgetLines}
                  columns={budgetLineColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 25,
                    total: budgetLines.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'forecasts' && (
            <Card>
              <CardHeader title="Budget Forecasts" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Budget Forecasting</h3>
                  <p className="text-dark-400 mb-6">
                    Advanced forecasting models and predictions will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              {scenarios.map((scenario) => (
                <Card key={scenario.id}>
                  <CardHeader 
                    title={scenario.name}
                    subtitle={scenario.description}
                  />
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-sm text-dark-400 mb-2">Scenario Type</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          scenario.scenarioType === 'OPTIMISTIC' ? 'bg-green-500/20 text-green-400' :
                          scenario.scenarioType === 'REALISTIC' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {scenario.scenarioType}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-dark-400 mb-2">Adjustment</p>
                        <p className={`text-lg font-bold ${
                          scenario.adjustmentPercent > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {scenario.adjustmentPercent > 0 ? '+' : ''}{scenario.adjustmentPercent}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-dark-400 mb-2">Total Budget</p>
                        <p className="text-lg font-bold text-white">
                          GHS {formatCurrency(scenario.totalBudget)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-dark-400 mb-2">Status</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          scenario.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {scenario.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Budget vs Actual Analysis" />
                <CardContent>
                  <div className="space-y-4">
                    {sampleBudgetPlans.filter(plan => plan.status === 'ACTIVE').map((plan) => (
                      <div key={plan.id} className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white font-medium">{plan.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.variancePercent < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {plan.variancePercent > 0 ? '+' : ''}{plan.variancePercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-dark-400">Budget:</span>
                            <span className="text-white">GHS {formatCurrency(plan.totalBudget)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-dark-400">Actual:</span>
                            <span className="text-white">GHS {formatCurrency(plan.totalActual)}</span>
                          </div>
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min((plan.totalActual / plan.totalBudget) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <p className="text-xs text-dark-400">
                            {((plan.totalActual / plan.totalBudget) * 100).toFixed(1)}% of budget utilized
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Budget Trends" />
                <CardContent>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Budget Trend Analysis</h3>
                    <p className="text-dark-400">
                      Visual charts and trend analysis will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Create Budget Plan Modal */}
        <FormModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => {
            setIsCreatePlanModalOpen(false);
            resetPlanForm();
          }}
          onSubmit={handleCreatePlan}
          title="Create Budget Plan"
          submitText="Create Plan"
          size="large"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Plan Name"
                placeholder="Enter budget plan name"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                required
              />
              <Input
                label="Budget Year"
                type="number"
                value={planFormData.budgetYear}
                onChange={(e) => setPlanFormData({ ...planFormData, budgetYear: parseInt(e.target.value) })}
                required
              />
            </div>

            <TextArea
              label="Description"
              placeholder="Budget plan description"
              value={planFormData.description}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Budget Period"
                options={budgetPeriodOptions}
                value={planFormData.budgetPeriod}
                onChange={(value) => setPlanFormData({ ...planFormData, budgetPeriod: value })}
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={planFormData.startDate}
                onChange={(e) => setPlanFormData({ ...planFormData, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={planFormData.endDate}
                onChange={(e) => setPlanFormData({ ...planFormData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
        </FormModal>

        {/* Edit Budget Plan Modal */}
        <FormModal
          isOpen={isEditPlanModalOpen}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setEditingPlan(null);
            resetPlanForm();
          }}
          onSubmit={handleUpdatePlan}
          title="Edit Budget Plan"
          submitText="Update Plan"
          size="large"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Plan Name"
                placeholder="Enter budget plan name"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                required
              />
              <Input
                label="Budget Year"
                type="number"
                value={planFormData.budgetYear}
                onChange={(e) => setPlanFormData({ ...planFormData, budgetYear: parseInt(e.target.value) })}
                required
              />
            </div>

            <TextArea
              label="Description"
              placeholder="Budget plan description"
              value={planFormData.description}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Budget Period"
                options={budgetPeriodOptions}
                value={planFormData.budgetPeriod}
                onChange={(value) => setPlanFormData({ ...planFormData, budgetPeriod: value })}
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={planFormData.startDate}
                onChange={(e) => setPlanFormData({ ...planFormData, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={planFormData.endDate}
                onChange={(e) => setPlanFormData({ ...planFormData, endDate: e.target.value })}
                required
              />
            </div>
          </div>
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default BudgetManagementPage;