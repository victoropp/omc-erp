import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, FormModal, Input, Select, TextArea } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: string;
  currentBalance: number;
  reconciledBalance: number;
  lastReconciledDate: string;
  unreconciledItems: number;
  status: string;
}

interface BankTransaction {
  id: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  referenceNumber: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  isReconciled: boolean;
  matchedGLEntry?: string;
  reconciliationDate?: string;
  notes?: string;
}

interface ReconciliationStatement {
  id: string;
  bankAccountId: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  status: string;
  reconciledBy?: string;
  reconciledAt?: string;
  unreconciledItems: number;
}

interface ReconciliationSummary {
  bankBalance: number;
  bookBalance: number;
  difference: number;
  outstandingDeposits: number;
  outstandingChecks: number;
  bankAdjustments: number;
  bookAdjustments: number;
}

const BankReconciliationPage: NextPage = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [statements, setStatements] = useState<ReconciliationStatement[]>([]);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'reconciliation' | 'statements'>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

  const [importFormData, setImportFormData] = useState({
    bankAccountId: '',
    statementDate: '',
    statementFile: null as File | null,
    fileFormat: 'CSV',
  });

  const [reconcileFormData, setReconcileFormData] = useState({
    matchedGLEntry: '',
    notes: '',
    reconciliationType: 'MATCH',
  });

  const [filters, setFilters] = useState({
    bankAccount: '',
    dateFrom: '',
    dateTo: '',
    reconciled: '',
    amountFrom: '',
    amountTo: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab, selectedAccountId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'accounts':
          // const accountsData = await financialService.getBankAccounts();
          setBankAccounts(sampleBankAccounts);
          break;
        case 'transactions':
          // const transactionsData = await financialService.getBankTransactions({
          //   bankAccountId: selectedAccountId,
          //   ...filters
          // });
          setBankTransactions(sampleBankTransactions.filter(t => 
            !selectedAccountId || t.id.includes(selectedAccountId)
          ));
          break;
        case 'reconciliation':
          // const summaryData = await financialService.getReconciliationSummary(selectedAccountId);
          setReconciliationSummary(sampleReconciliationSummary);
          break;
        case 'statements':
          // const statementsData = await financialService.getReconciliationStatements();
          setStatements(sampleStatements);
          break;
      }
    } catch (error) {
      toast.error('Failed to load bank reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportStatement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.importBankStatement(importFormData);
      toast.success('Bank statement imported successfully');
      setIsImportModalOpen(false);
      resetImportForm();
      loadData();
    } catch (error) {
      toast.error('Failed to import bank statement');
    }
  };

  const handleReconcileTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.reconcileTransaction(selectedTransaction?.id, reconcileFormData);
      toast.success('Transaction reconciled successfully');
      setIsReconcileModalOpen(false);
      resetReconcileForm();
      loadData();
    } catch (error) {
      toast.error('Failed to reconcile transaction');
    }
  };

  const handleAutoReconcile = async () => {
    try {
      // await financialService.performAutoReconciliation(selectedAccountId);
      toast.success('Auto reconciliation completed');
      loadData();
    } catch (error) {
      toast.error('Auto reconciliation failed');
    }
  };

  const resetImportForm = () => {
    setImportFormData({
      bankAccountId: '',
      statementDate: '',
      statementFile: null,
      fileFormat: 'CSV',
    });
  };

  const resetReconcileForm = () => {
    setReconcileFormData({
      matchedGLEntry: '',
      notes: '',
      reconciliationType: 'MATCH',
    });
  };

  const accountColumns = [
    { key: 'accountNumber' as keyof BankAccount, header: 'Account Number', width: '15%', sortable: true },
    { key: 'accountName' as keyof BankAccount, header: 'Account Name', width: '20%', sortable: true },
    { key: 'bankName' as keyof BankAccount, header: 'Bank', width: '15%', sortable: true },
    { key: 'currentBalance' as keyof BankAccount, header: 'Current Balance', width: '15%', sortable: true,
      render: (value: number, row: BankAccount) => (
        <span className={`font-medium ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(Math.abs(value))} {value < 0 ? '(DR)' : ''}
        </span>
      )
    },
    { key: 'unreconciledItems' as keyof BankAccount, header: 'Unreconciled', width: '10%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${value > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
          {value}
        </span>
      )
    },
    { key: 'lastReconciledDate' as keyof BankAccount, header: 'Last Reconciled', width: '12%', sortable: true },
    { key: 'status' as keyof BankAccount, header: 'Status', width: '8%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof BankAccount, header: 'Actions', width: '5%',
      render: (value: string, row: BankAccount) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedAccountId(value);
            setActiveTab('reconciliation');
          }}
        >
          Reconcile
        </Button>
      )
    },
  ];

  const transactionColumns = [
    { key: 'transactionDate' as keyof BankTransaction, header: 'Date', width: '10%', sortable: true },
    { key: 'description' as keyof BankTransaction, header: 'Description', width: '25%', sortable: true },
    { key: 'referenceNumber' as keyof BankTransaction, header: 'Reference', width: '12%', sortable: true },
    { key: 'debitAmount' as keyof BankTransaction, header: 'Debit', width: '12%', sortable: true,
      render: (value: number) => (
        value > 0 ? (
          <span className="font-medium text-red-400">
            GHS {new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
            }).format(value)}
          </span>
        ) : <span className="text-dark-500">-</span>
      )
    },
    { key: 'creditAmount' as keyof BankTransaction, header: 'Credit', width: '12%', sortable: true,
      render: (value: number) => (
        value > 0 ? (
          <span className="font-medium text-green-400">
            GHS {new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
            }).format(value)}
          </span>
        ) : <span className="text-dark-500">-</span>
      )
    },
    { key: 'runningBalance' as keyof BankTransaction, header: 'Balance', width: '12%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${value >= 0 ? 'text-white' : 'text-yellow-400'}`}>
          GHS {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(Math.abs(value))} {value < 0 ? '(DR)' : ''}
        </span>
      )
    },
    { key: 'isReconciled' as keyof BankTransaction, header: 'Reconciled', width: '8%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    { key: 'id' as keyof BankTransaction, header: 'Actions', width: '9%',
      render: (value: string, row: BankTransaction) => (
        !row.isReconciled ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedTransaction(row);
              setIsReconcileModalOpen(true);
            }}
          >
            Reconcile
          </Button>
        ) : (
          <span className="text-dark-500">Reconciled</span>
        )
      )
    },
  ];

  // Sample data
  const sampleBankAccounts: BankAccount[] = [
    {
      id: '1',
      accountNumber: '1234567890',
      accountName: 'Operating Account - GCB',
      bankName: 'Ghana Commercial Bank',
      currency: 'GHS',
      currentBalance: 15000000,
      reconciledBalance: 14500000,
      lastReconciledDate: '2024-01-20',
      unreconciledItems: 8,
      status: 'ACTIVE',
    },
    {
      id: '2',
      accountNumber: '9876543210',
      accountName: 'Payroll Account - Ecobank',
      bankName: 'Ecobank Ghana',
      currency: 'GHS',
      currentBalance: 5000000,
      reconciledBalance: 5000000,
      lastReconciledDate: '2024-01-22',
      unreconciledItems: 0,
      status: 'ACTIVE',
    },
  ];

  const sampleBankTransactions: BankTransaction[] = [
    {
      id: '1-1',
      transactionDate: '2024-01-23',
      valueDate: '2024-01-23',
      description: 'FUEL SALES RECEIPT',
      referenceNumber: 'TXN202401230001',
      debitAmount: 0,
      creditAmount: 250000,
      runningBalance: 15250000,
      isReconciled: false,
    },
    {
      id: '1-2',
      transactionDate: '2024-01-22',
      valueDate: '2024-01-22',
      description: 'SUPPLIER PAYMENT - TOR',
      referenceNumber: 'TXN202401220015',
      debitAmount: 500000,
      creditAmount: 0,
      runningBalance: 15000000,
      isReconciled: true,
      matchedGLEntry: 'JE-202401-0002',
      reconciliationDate: '2024-01-22',
      notes: 'Matched with fuel purchase payment',
    },
    {
      id: '1-3',
      transactionDate: '2024-01-21',
      valueDate: '2024-01-21',
      description: 'BANK CHARGES',
      referenceNumber: 'TXN202401210008',
      debitAmount: 1500,
      creditAmount: 0,
      runningBalance: 15500000,
      isReconciled: false,
    },
  ];

  const sampleStatements: ReconciliationStatement[] = [
    {
      id: '1',
      bankAccountId: '1',
      statementDate: '2024-01-31',
      openingBalance: 14000000,
      closingBalance: 15000000,
      totalDebits: 2000000,
      totalCredits: 3000000,
      status: 'COMPLETED',
      reconciledBy: 'John Doe',
      reconciledAt: '2024-02-01T10:30:00Z',
      unreconciledItems: 0,
    },
  ];

  const sampleReconciliationSummary: ReconciliationSummary = {
    bankBalance: 15000000,
    bookBalance: 14750000,
    difference: 250000,
    outstandingDeposits: 150000,
    outstandingChecks: 0,
    bankAdjustments: 1500,
    bookAdjustments: 0,
  };

  const tabs = [
    { id: 'accounts', label: 'Bank Accounts', icon: 'M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0-8h18v2H3V6z' },
    { id: 'transactions', label: 'Transactions', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
    { id: 'reconciliation', label: 'Reconciliation', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'statements', label: 'Statements', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
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
              Bank Reconciliation
            </h1>
            <p className="text-dark-400 mt-2">
              Reconcile bank statements with general ledger accounts
            </p>
            {selectedAccountId && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-dark-400">Selected account:</span>
                <span className="text-primary-400 font-medium">
                  {sampleBankAccounts.find(acc => acc.id === selectedAccountId)?.accountName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedAccountId('')}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsImportModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Statement
            </Button>
            {activeTab === 'reconciliation' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAutoReconcile}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Auto Reconcile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Summary Cards for Reconciliation */}
        {activeTab === 'reconciliation' && reconciliationSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Bank Balance</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">
                  GHS {(reconciliationSummary.bankBalance / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">Per bank statement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Book Balance</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">
                  GHS {(reconciliationSummary.bookBalance / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">Per general ledger</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Difference</h3>
                <p className={`text-2xl font-bold mb-1 ${
                  reconciliationSummary.difference === 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                  }).format(Math.abs(reconciliationSummary.difference))}
                </p>
                <p className={`text-sm ${
                  reconciliationSummary.difference === 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {reconciliationSummary.difference === 0 ? 'Reconciled' : 'Unreconciled'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Outstanding Items</h3>
                <p className="text-2xl font-bold text-yellow-400 mb-1">
                  {sampleBankTransactions.filter(t => !t.isReconciled).length}
                </p>
                <p className="text-sm text-dark-400">Require attention</p>
              </CardContent>
            </Card>
          </div>
        )}

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
        {(activeTab === 'transactions' || activeTab === 'reconciliation') && (
          <Card>
            <CardHeader title="Filters" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select
                  label="Bank Account"
                  options={[
                    { value: '', label: 'All Accounts' },
                    ...sampleBankAccounts.map(acc => ({ 
                      value: acc.id, 
                      label: acc.accountName 
                    }))
                  ]}
                  value={selectedAccountId}
                  onChange={(value) => setSelectedAccountId(value)}
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
                <Select
                  label="Reconciled"
                  options={[
                    { value: '', label: 'All' },
                    { value: 'true', label: 'Reconciled' },
                    { value: 'false', label: 'Unreconciled' },
                  ]}
                  value={filters.reconciled}
                  onChange={(value) => setFilters({ ...filters, reconciled: value })}
                />
                <Input
                  label="Min Amount"
                  type="number"
                  placeholder="0.00"
                  value={filters.amountFrom}
                  onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}
                />
                <Input
                  label="Max Amount"
                  type="number"
                  placeholder="0.00"
                  value={filters.amountTo}
                  onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}
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
          {activeTab === 'accounts' && (
            <Card>
              <CardHeader title="Bank Accounts" />
              <CardContent>
                <Table
                  data={bankAccounts}
                  columns={accountColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: bankAccounts.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card>
              <CardHeader title="Bank Transactions" />
              <CardContent>
                <Table
                  data={bankTransactions.filter(t => 
                    (!selectedAccountId || t.id.includes(selectedAccountId)) &&
                    (filters.reconciled === '' || 
                     (filters.reconciled === 'true' && t.isReconciled) ||
                     (filters.reconciled === 'false' && !t.isReconciled)
                    )
                  )}
                  columns={transactionColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 25,
                    total: bankTransactions.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'reconciliation' && (
            <div className="space-y-6">
              {reconciliationSummary && reconciliationSummary.difference !== 0 && (
                <Card>
                  <CardHeader title="Reconciliation Details" />
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">Adjustments Needed</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                            <span className="text-dark-300">Outstanding Deposits</span>
                            <span className="text-green-400 font-medium">
                              +GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                              }).format(reconciliationSummary.outstandingDeposits)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                            <span className="text-dark-300">Outstanding Checks</span>
                            <span className="text-red-400 font-medium">
                              -GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                              }).format(reconciliationSummary.outstandingChecks)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                            <span className="text-dark-300">Bank Adjustments</span>
                            <span className="text-yellow-400 font-medium">
                              GHS {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                              }).format(reconciliationSummary.bankAdjustments)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-white mb-4">Unreconciled Items</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {bankTransactions.filter(t => !t.isReconciled).map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center p-2 bg-dark-800/20 rounded text-sm">
                              <div>
                                <p className="text-white">{transaction.description}</p>
                                <p className="text-dark-400">{transaction.transactionDate}</p>
                              </div>
                              <div className="text-right">
                                <p className={transaction.creditAmount > 0 ? 'text-green-400' : 'text-red-400'}>
                                  GHS {new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                  }).format(transaction.creditAmount || transaction.debitAmount)}
                                </p>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsReconcileModalOpen(true);
                                }}>
                                  Reconcile
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {reconciliationSummary && reconciliationSummary.difference === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      Account Reconciled
                    </h3>
                    <p className="text-dark-300">
                      Bank balance matches book balance. All transactions are reconciled.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'statements' && (
            <Card>
              <CardHeader title="Reconciliation Statements" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Reconciliation History</h3>
                  <p className="text-dark-400 mb-6">
                    Historical reconciliation statements will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Import Statement Modal */}
        <FormModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            resetImportForm();
          }}
          onSubmit={handleImportStatement}
          title="Import Bank Statement"
          submitText="Import Statement"
        >
          <div className="space-y-4">
            <Select
              label="Bank Account"
              options={sampleBankAccounts.map(acc => ({ 
                value: acc.id, 
                label: acc.accountName 
              }))}
              value={importFormData.bankAccountId}
              onChange={(value) => setImportFormData({ ...importFormData, bankAccountId: value })}
              required
            />
            
            <Input
              label="Statement Date"
              type="date"
              value={importFormData.statementDate}
              onChange={(e) => setImportFormData({ ...importFormData, statementDate: e.target.value })}
              required
            />

            <Select
              label="File Format"
              options={[
                { value: 'CSV', label: 'CSV' },
                { value: 'EXCEL', label: 'Excel' },
                { value: 'PDF', label: 'PDF' },
              ]}
              value={importFormData.fileFormat}
              onChange={(value) => setImportFormData({ ...importFormData, fileFormat: value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Bank Statement File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={(e) => setImportFormData({ 
                  ...importFormData, 
                  statementFile: e.target.files?.[0] || null 
                })}
                className="block w-full text-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                required
              />
            </div>
          </div>
        </FormModal>

        {/* Reconcile Transaction Modal */}
        <FormModal
          isOpen={isReconcileModalOpen}
          onClose={() => {
            setIsReconcileModalOpen(false);
            resetReconcileForm();
          }}
          onSubmit={handleReconcileTransaction}
          title="Reconcile Transaction"
          submitText="Reconcile Transaction"
        >
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                <h4 className="text-white font-medium mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dark-400">Date:</span>
                    <span className="text-white ml-2">{selectedTransaction.transactionDate}</span>
                  </div>
                  <div>
                    <span className="text-dark-400">Amount:</span>
                    <span className="text-white ml-2">
                      GHS {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                      }).format(selectedTransaction.creditAmount || selectedTransaction.debitAmount)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-dark-400">Description:</span>
                    <span className="text-white ml-2">{selectedTransaction.description}</span>
                  </div>
                </div>
              </div>

              <Select
                label="Reconciliation Type"
                options={[
                  { value: 'MATCH', label: 'Match with GL Entry' },
                  { value: 'ADJUSTMENT', label: 'Create Adjustment Entry' },
                  { value: 'IGNORE', label: 'Mark as Reconciled' },
                ]}
                value={reconcileFormData.reconciliationType}
                onChange={(value) => setReconcileFormData({ ...reconcileFormData, reconciliationType: value })}
                required
              />

              {reconcileFormData.reconciliationType === 'MATCH' && (
                <Input
                  label="Matched GL Entry"
                  placeholder="Enter GL entry reference"
                  value={reconcileFormData.matchedGLEntry}
                  onChange={(e) => setReconcileFormData({ ...reconcileFormData, matchedGLEntry: e.target.value })}
                  required
                />
              )}

              <TextArea
                label="Notes"
                placeholder="Add reconciliation notes..."
                value={reconcileFormData.notes}
                onChange={(e) => setReconcileFormData({ ...reconcileFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          )}
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default BankReconciliationPage;