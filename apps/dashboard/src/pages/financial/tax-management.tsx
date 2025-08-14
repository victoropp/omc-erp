import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal, Input, Select, Table, Badge } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface TaxRate {
  id: string;
  name: string;
  type: 'VAT' | 'NHIL' | 'GETFund' | 'CIT' | 'PAYE' | 'Withholding';
  rate: number; // percentage
  description: string;
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
}

interface TaxTransaction {
  id: string;
  transactionId: string;
  transactionType: 'sale' | 'purchase' | 'expense' | 'income';
  vendor?: string;
  customer?: string;
  baseAmount: number;
  vatAmount: number;
  nhilAmount: number;
  getfundAmount: number;
  totalTax: number;
  totalAmount: number;
  taxPeriod: string;
  filingStatus: 'pending' | 'filed' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  reference: string;
  createdAt: string;
}

interface TaxReturn {
  id: string;
  period: string;
  type: 'VAT' | 'NHIL' | 'GETFund' | 'Combined';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalSales: number;
  totalPurchases: number;
  vatPayable: number;
  vatReceivable: number;
  netVat: number;
  nhilPayable: number;
  getfundPayable: number;
  totalTaxDue: number;
  dueDate: string;
  submittedDate?: string;
  approvedDate?: string;
  penalties?: number;
  interest?: number;
  createdAt: string;
}

interface TaxSummary {
  vatCollected: number;
  vatPaid: number;
  nhilCollected: number;
  getfundCollected: number;
  totalTaxDue: number;
  totalTaxPaid: number;
  outstandingTax: number;
  nextFilingDue: string;
}

const TaxManagementPage: NextPage = () => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [transactions, setTransactions] = useState<TaxTransaction[]>([]);
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'rate' | 'transaction' | 'return'>('rate');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'returns' | 'rates'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  const [rateForm, setRateForm] = useState({
    name: '',
    type: 'VAT',
    rate: 0,
    description: '',
    effectiveDate: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    transactionType: 'sale',
    vendor: '',
    customer: '',
    baseAmount: 0,
    reference: '',
    taxPeriod: ''
  });

  const [returnForm, setReturnForm] = useState({
    period: '',
    type: 'Combined',
    dueDate: ''
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ratesData, transactionsData, returnsData, summaryData] = await Promise.all([
        financialService.getTaxRates?.() || Promise.resolve([]),
        financialService.getTaxTransactions?.(selectedPeriod) || Promise.resolve([]),
        financialService.getTaxReturns?.() || Promise.resolve([]),
        financialService.getTaxSummary?.(selectedPeriod) || Promise.resolve(null)
      ]);
      
      setTaxRates(ratesData || generateMockRates());
      setTransactions(transactionsData || generateMockTransactions());
      setReturns(returnsData || generateMockReturns());
      setSummary(summaryData || generateMockSummary());
    } catch (error) {
      setTaxRates(generateMockRates());
      setTransactions(generateMockTransactions());
      setReturns(generateMockReturns());
      setSummary(generateMockSummary());
      toast.error('Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockRates = (): TaxRate[] => [
    {
      id: 'rate1',
      name: 'Value Added Tax',
      type: 'VAT',
      rate: 15.0,
      description: 'Standard VAT rate for goods and services in Ghana',
      isActive: true,
      effectiveDate: '2023-01-01',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'rate2',
      name: 'National Health Insurance Levy',
      type: 'NHIL',
      rate: 2.5,
      description: 'National Health Insurance Levy on VAT-able supplies',
      isActive: true,
      effectiveDate: '2023-01-01',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'rate3',
      name: 'Ghana Education Trust Fund Levy',
      type: 'GETFund',
      rate: 2.5,
      description: 'Education levy on VAT-able supplies',
      isActive: true,
      effectiveDate: '2023-01-01',
      createdAt: '2023-01-01T00:00:00Z'
    }
  ];

  const generateMockTransactions = (): TaxTransaction[] => [
    {
      id: 'tx1',
      transactionId: 'INV-2024-001',
      transactionType: 'sale',
      customer: 'Total Ghana Ltd',
      baseAmount: 100000,
      vatAmount: 15000,
      nhilAmount: 2500,
      getfundAmount: 2500,
      totalTax: 20000,
      totalAmount: 120000,
      taxPeriod: '2024-01',
      filingStatus: 'pending',
      dueDate: '2024-02-15',
      reference: 'SALE-001-2024',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'tx2',
      transactionId: 'BILL-2024-002',
      transactionType: 'purchase',
      vendor: 'Shell Trading Ghana',
      baseAmount: 50000,
      vatAmount: 7500,
      nhilAmount: 1250,
      getfundAmount: 1250,
      totalTax: 10000,
      totalAmount: 60000,
      taxPeriod: '2024-01',
      filingStatus: 'filed',
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      reference: 'PURCH-002-2024',
      createdAt: '2024-01-20T14:15:00Z'
    }
  ];

  const generateMockReturns = (): TaxReturn[] => [
    {
      id: 'ret1',
      period: '2024-01',
      type: 'Combined',
      status: 'submitted',
      totalSales: 500000,
      totalPurchases: 200000,
      vatPayable: 75000,
      vatReceivable: 30000,
      netVat: 45000,
      nhilPayable: 12500,
      getfundPayable: 12500,
      totalTaxDue: 70000,
      dueDate: '2024-02-15',
      submittedDate: '2024-02-14T16:30:00Z',
      createdAt: '2024-02-01T09:00:00Z'
    }
  ];

  const generateMockSummary = (): TaxSummary => ({
    vatCollected: 95000,
    vatPaid: 35000,
    nhilCollected: 15000,
    getfundCollected: 15000,
    totalTaxDue: 90000,
    totalTaxPaid: 75000,
    outstandingTax: 15000,
    nextFilingDue: '2024-03-15'
  });

  const calculateTax = (baseAmount: number, taxType: 'VAT' | 'NHIL' | 'GETFund') => {
    const rate = taxRates.find(r => r.type === taxType && r.isActive)?.rate || 0;
    return (baseAmount * rate) / 100;
  };

  const calculateAllTaxes = (baseAmount: number) => {
    const vatAmount = calculateTax(baseAmount, 'VAT');
    const nhilAmount = calculateTax(baseAmount, 'NHIL');
    const getfundAmount = calculateTax(baseAmount, 'GETFund');
    const totalTax = vatAmount + nhilAmount + getfundAmount;
    const totalAmount = baseAmount + totalTax;

    return {
      vatAmount,
      nhilAmount,
      getfundAmount,
      totalTax,
      totalAmount
    };
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.filingStatus === filterStatus;
    const matchesType = filterType === 'all' || transaction.transactionType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredReturns = returns.filter(taxReturn => {
    const matchesSearch = taxReturn.period.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || taxReturn.status === filterStatus;
    const matchesType = filterType === 'all' || taxReturn.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'filed': return 'primary';
      case 'paid': return 'success';
      case 'overdue': return 'danger';
      case 'draft': return 'secondary';
      case 'submitted': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const handleCreateTaxRate = () => {
    setModalType('rate');
    setRateForm({
      name: '',
      type: 'VAT',
      rate: 0,
      description: '',
      effectiveDate: ''
    });
    setIsModalOpen(true);
  };

  const handleCreateTransaction = () => {
    setModalType('transaction');
    setTransactionForm({
      transactionType: 'sale',
      vendor: '',
      customer: '',
      baseAmount: 0,
      reference: '',
      taxPeriod: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveTaxRate = async () => {
    try {
      await financialService.createTaxRate?.(rateForm);
      toast.success('Tax rate created successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create tax rate');
    }
  };

  const handleSaveTransaction = async () => {
    try {
      const taxCalc = calculateAllTaxes(transactionForm.baseAmount);
      const fullTransaction = {
        ...transactionForm,
        ...taxCalc,
        filingStatus: 'pending' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      await financialService.createTaxTransaction?.(fullTransaction);
      toast.success('Tax transaction created successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create tax transaction');
    }
  };

  const handleGenerateReturn = async (period: string, type: string) => {
    try {
      await financialService.generateTaxReturn?.({ period, type });
      toast.success('Tax return generated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to generate tax return');
    }
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Ghana Tax Management</h1>
            <p className="text-dark-400 mt-2">
              Manage VAT, NHIL, GETFund and tax compliance for Ghana revenue authorities
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={[
                { value: 'current', label: 'Current Month' },
                { value: '2024-01', label: 'January 2024' },
                { value: '2023-12', label: 'December 2023' },
                { value: '2023-11', label: 'November 2023' }
              ]}
              className="w-48"
            />
            <Button variant="primary" onClick={handleCreateTransaction}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </Button>
          </div>
        </motion.div>

        {/* Tax Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400">VAT Collected</p>
                    <p className="text-2xl font-bold text-green-400">
                      GHS {summary.vatCollected.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500">
                      Paid: GHS {summary.vatPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400">NHIL Collected</p>
                    <p className="text-2xl font-bold text-blue-400">
                      GHS {summary.nhilCollected.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500">2.5% rate</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400">GETFund Collected</p>
                    <p className="text-2xl font-bold text-purple-400">
                      GHS {summary.getfundCollected.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500">2.5% rate</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-400">Outstanding Tax</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      GHS {summary.outstandingTax.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500">
                      Due: {new Date(summary.nextFilingDue).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'transactions', label: 'Tax Transactions' },
            { key: 'returns', label: 'Tax Returns' },
            { key: 'rates', label: 'Tax Rates' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax Calculator */}
            <Card>
              <CardHeader title="Ghana Tax Calculator" />
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Base Amount (GHS)"
                    type="number"
                    value={transactionForm.baseAmount}
                    onChange={(e) => setTransactionForm({ 
                      ...transactionForm, 
                      baseAmount: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="Enter base amount"
                  />
                  
                  {transactionForm.baseAmount > 0 && (
                    <div className="mt-4 p-4 bg-dark-700 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Base Amount:</span>
                        <span className="text-white font-medium">
                          GHS {transactionForm.baseAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">VAT (15%):</span>
                        <span className="text-green-400 font-medium">
                          GHS {calculateTax(transactionForm.baseAmount, 'VAT').toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">NHIL (2.5%):</span>
                        <span className="text-blue-400 font-medium">
                          GHS {calculateTax(transactionForm.baseAmount, 'NHIL').toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">GETFund (2.5%):</span>
                        <span className="text-purple-400 font-medium">
                          GHS {calculateTax(transactionForm.baseAmount, 'GETFund').toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-dark-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Total Tax:</span>
                          <span className="text-yellow-400 font-bold">
                            GHS {calculateAllTaxes(transactionForm.baseAmount).totalTax.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-white font-medium">Total Amount:</span>
                          <span className="text-white font-bold text-lg">
                            GHS {calculateAllTaxes(transactionForm.baseAmount).totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tax Returns */}
            <Card>
              <CardHeader title="Recent Tax Returns" />
              <CardContent>
                <div className="space-y-4">
                  {returns.slice(0, 3).map(taxReturn => (
                    <div key={taxReturn.id} className="p-4 bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-white">{taxReturn.period} - {taxReturn.type}</p>
                          <p className="text-sm text-dark-400">
                            Due: {new Date(taxReturn.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(taxReturn.status)} className="capitalize">
                          {taxReturn.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Tax Due:</span>
                        <span className="text-yellow-400 font-medium">
                          GHS {taxReturn.totalTaxDue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleGenerateReturn('current', 'Combined')}
                  >
                    Generate New Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select
                    value={filterType}
                    onChange={setFilterType}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'sale', label: 'Sales' },
                      { value: 'purchase', label: 'Purchases' },
                      { value: 'expense', label: 'Expenses' },
                      { value: 'income', label: 'Income' }
                    ]}
                    className="w-full md:w-48"
                  />
                  <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'filed', label: 'Filed' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'overdue', label: 'Overdue' }
                    ]}
                    className="w-full md:w-48"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Tax Transactions" />
              <CardContent>
                <Table
                  headers={[
                    { key: 'transaction', label: 'Transaction' },
                    { key: 'party', label: 'Customer/Vendor' },
                    { key: 'amounts', label: 'Amounts' },
                    { key: 'taxes', label: 'Tax Breakdown' },
                    { key: 'period', label: 'Period' },
                    { key: 'status', label: 'Status' },
                    { key: 'actions', label: 'Actions' }
                  ]}
                  data={filteredTransactions.map(transaction => ({
                    transaction: (
                      <div>
                        <p className="font-medium text-white">{transaction.transactionId}</p>
                        <p className="text-sm text-dark-400 capitalize">{transaction.transactionType}</p>
                        <p className="text-xs text-dark-500">{transaction.reference}</p>
                      </div>
                    ),
                    party: (
                      <p className="text-white">
                        {transaction.customer || transaction.vendor || '-'}
                      </p>
                    ),
                    amounts: (
                      <div>
                        <p className="text-white">Base: GHS {transaction.baseAmount.toLocaleString()}</p>
                        <p className="text-yellow-400 font-medium">
                          Total: GHS {transaction.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    ),
                    taxes: (
                      <div className="text-sm">
                        <p className="text-green-400">VAT: GHS {transaction.vatAmount.toLocaleString()}</p>
                        <p className="text-blue-400">NHIL: GHS {transaction.nhilAmount.toLocaleString()}</p>
                        <p className="text-purple-400">GETFund: GHS {transaction.getfundAmount.toLocaleString()}</p>
                      </div>
                    ),
                    period: (
                      <div>
                        <p className="text-white">{transaction.taxPeriod}</p>
                        <p className="text-sm text-dark-400">
                          Due: {new Date(transaction.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ),
                    status: (
                      <Badge variant={getStatusColor(transaction.filingStatus)} className="capitalize">
                        {transaction.filingStatus}
                      </Badge>
                    ),
                    actions: (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {transaction.filingStatus === 'pending' && (
                          <Button variant="primary" size="sm">
                            File
                          </Button>
                        )}
                      </div>
                    )
                  }))}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <Card>
            <CardHeader title="Tax Returns" />
            <CardContent>
              <Table
                headers={[
                  { key: 'period', label: 'Period' },
                  { key: 'type', label: 'Type' },
                  { key: 'sales', label: 'Sales/Purchases' },
                  { key: 'vat', label: 'VAT' },
                  { key: 'other', label: 'NHIL/GETFund' },
                  { key: 'total', label: 'Total Due' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                data={filteredReturns.map(taxReturn => ({
                  period: (
                    <div>
                      <p className="font-medium text-white">{taxReturn.period}</p>
                      <p className="text-sm text-dark-400">
                        Due: {new Date(taxReturn.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ),
                  type: (
                    <Badge variant="outline" className="capitalize">
                      {taxReturn.type}
                    </Badge>
                  ),
                  sales: (
                    <div className="text-sm">
                      <p className="text-green-400">Sales: GHS {taxReturn.totalSales.toLocaleString()}</p>
                      <p className="text-red-400">Purchases: GHS {taxReturn.totalPurchases.toLocaleString()}</p>
                    </div>
                  ),
                  vat: (
                    <div className="text-sm">
                      <p className="text-green-400">Payable: GHS {taxReturn.vatPayable.toLocaleString()}</p>
                      <p className="text-blue-400">Receivable: GHS {taxReturn.vatReceivable.toLocaleString()}</p>
                      <p className="text-white font-medium">Net: GHS {taxReturn.netVat.toLocaleString()}</p>
                    </div>
                  ),
                  other: (
                    <div className="text-sm">
                      <p className="text-blue-400">NHIL: GHS {taxReturn.nhilPayable.toLocaleString()}</p>
                      <p className="text-purple-400">GETFund: GHS {taxReturn.getfundPayable.toLocaleString()}</p>
                    </div>
                  ),
                  total: (
                    <p className="text-yellow-400 font-bold text-lg">
                      GHS {taxReturn.totalTaxDue.toLocaleString()}
                    </p>
                  ),
                  status: (
                    <Badge variant={getStatusColor(taxReturn.status)} className="capitalize">
                      {taxReturn.status}
                    </Badge>
                  ),
                  actions: (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {taxReturn.status === 'draft' && (
                        <Button variant="primary" size="sm">
                          Submit
                        </Button>
                      )}
                    </div>
                  )
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Rates Tab */}
        {activeTab === 'rates' && (
          <Card>
            <CardHeader 
              title="Tax Rates" 
              action={
                <Button variant="primary" onClick={handleCreateTaxRate}>
                  Add Rate
                </Button>
              }
            />
            <CardContent>
              <Table
                headers={[
                  { key: 'tax', label: 'Tax Type' },
                  { key: 'rate', label: 'Rate' },
                  { key: 'description', label: 'Description' },
                  { key: 'effective', label: 'Effective Date' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' }
                ]}
                data={taxRates.map(rate => ({
                  tax: (
                    <div>
                      <p className="font-medium text-white">{rate.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {rate.type}
                      </Badge>
                    </div>
                  ),
                  rate: (
                    <p className="text-2xl font-bold text-primary-400">{rate.rate}%</p>
                  ),
                  description: (
                    <p className="text-dark-400 text-sm line-clamp-2">{rate.description}</p>
                  ),
                  effective: (
                    <p className="text-white">{new Date(rate.effectiveDate).toLocaleDateString()}</p>
                  ),
                  status: (
                    <Badge variant={rate.isActive ? 'success' : 'secondary'}>
                      {rate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  ),
                  actions: (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant={rate.isActive ? "danger" : "success"} size="sm">
                        {rate.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  )
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Tax Rate Modal */}
        <Modal
          isOpen={isModalOpen && modalType === 'rate'}
          onClose={() => setIsModalOpen(false)}
          title="Create Tax Rate"
        >
          <div className="space-y-6">
            <Input
              label="Tax Name"
              type="text"
              value={rateForm.name}
              onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
              required
            />

            <Select
              label="Tax Type"
              value={rateForm.type}
              onChange={(value) => setRateForm({ ...rateForm, type: value as any })}
              options={[
                { value: 'VAT', label: 'Value Added Tax' },
                { value: 'NHIL', label: 'National Health Insurance Levy' },
                { value: 'GETFund', label: 'Ghana Education Trust Fund' },
                { value: 'CIT', label: 'Corporate Income Tax' },
                { value: 'PAYE', label: 'Pay As You Earn' },
                { value: 'Withholding', label: 'Withholding Tax' }
              ]}
              required
            />

            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={rateForm.rate}
              onChange={(e) => setRateForm({ ...rateForm, rate: parseFloat(e.target.value) || 0 })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Description</label>
              <textarea
                value={rateForm.description}
                onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <Input
              label="Effective Date"
              type="date"
              value={rateForm.effectiveDate}
              onChange={(e) => setRateForm({ ...rateForm, effectiveDate: e.target.value })}
              required
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveTaxRate}>
                Create Rate
              </Button>
            </div>
          </div>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          isOpen={isModalOpen && modalType === 'transaction'}
          onClose={() => setIsModalOpen(false)}
          title="Create Tax Transaction"
        >
          <div className="space-y-6">
            <Select
              label="Transaction Type"
              value={transactionForm.transactionType}
              onChange={(value) => setTransactionForm({ ...transactionForm, transactionType: value as any })}
              options={[
                { value: 'sale', label: 'Sale' },
                { value: 'purchase', label: 'Purchase' },
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' }
              ]}
              required
            />

            {transactionForm.transactionType === 'sale' ? (
              <Input
                label="Customer"
                type="text"
                value={transactionForm.customer}
                onChange={(e) => setTransactionForm({ ...transactionForm, customer: e.target.value })}
                required
              />
            ) : (
              <Input
                label="Vendor"
                type="text"
                value={transactionForm.vendor}
                onChange={(e) => setTransactionForm({ ...transactionForm, vendor: e.target.value })}
                required
              />
            )}

            <Input
              label="Base Amount (GHS)"
              type="number"
              value={transactionForm.baseAmount}
              onChange={(e) => setTransactionForm({ ...transactionForm, baseAmount: parseFloat(e.target.value) || 0 })}
              required
            />

            <Input
              label="Reference"
              type="text"
              value={transactionForm.reference}
              onChange={(e) => setTransactionForm({ ...transactionForm, reference: e.target.value })}
              required
            />

            <Input
              label="Tax Period"
              type="text"
              value={transactionForm.taxPeriod}
              onChange={(e) => setTransactionForm({ ...transactionForm, taxPeriod: e.target.value })}
              placeholder="e.g., 2024-01"
              required
            />

            {transactionForm.baseAmount > 0 && (
              <div className="p-4 bg-dark-700 rounded-lg">
                <h4 className="font-medium text-white mb-3">Tax Calculation Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">VAT (15%):</span>
                    <span className="text-green-400">
                      GHS {calculateTax(transactionForm.baseAmount, 'VAT').toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">NHIL (2.5%):</span>
                    <span className="text-blue-400">
                      GHS {calculateTax(transactionForm.baseAmount, 'NHIL').toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">GETFund (2.5%):</span>
                    <span className="text-purple-400">
                      GHS {calculateTax(transactionForm.baseAmount, 'GETFund').toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-dark-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Total Amount:</span>
                      <span className="text-yellow-400">
                        GHS {calculateAllTaxes(transactionForm.baseAmount).totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveTransaction}>
                Create Transaction
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default TaxManagementPage;