import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, Modal, FormModal, Input, Select } from '@/components/ui';
import { financialService } from '@/services/api';
import { Account, AccountType, Currency } from '@/types';
import { toast } from 'react-hot-toast';

const ChartOfAccountsPage: NextPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: AccountType.ASSET,
    parentAccountId: '',
    currency: Currency.GHS,
    ifrsClassification: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await financialService.getChartOfAccounts();
      setAccounts(data);
    } catch (error) {
      toast.error('Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialService.createAccount(formData);
      toast.success('Account created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    try {
      await financialService.updateAccount(selectedAccount.id, formData);
      toast.success('Account updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: AccountType.ASSET,
      parentAccountId: '',
      currency: Currency.GHS,
      ifrsClassification: '',
    });
    setSelectedAccount(null);
  };

  const openEditModal = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      parentAccountId: account.parentAccountId || '',
      currency: account.currency,
      ifrsClassification: account.ifrsClassification || '',
    });
    setIsEditModalOpen(true);
  };

  const accountTypeOptions = Object.values(AccountType).map(type => ({
    value: type,
    label: type.replace('_', ' ').toUpperCase(),
  }));

  const currencyOptions = Object.values(Currency).map(currency => ({
    value: currency,
    label: currency,
  }));

  const parentAccountOptions = accounts
    .filter(acc => acc.id !== selectedAccount?.id)
    .map(acc => ({
      value: acc.id,
      label: `${acc.code} - ${acc.name}`,
    }));

  const columns = [
    {
      key: 'code' as keyof Account,
      header: 'Account Code',
      width: '15%',
      sortable: true,
      filterable: true,
    },
    {
      key: 'name' as keyof Account,
      header: 'Account Name',
      width: '30%',
      sortable: true,
      filterable: true,
    },
    {
      key: 'type' as keyof Account,
      header: 'Type',
      width: '15%',
      sortable: true,
      filterable: true,
      render: (value: AccountType) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === AccountType.ASSET ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          value === AccountType.LIABILITY ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          value === AccountType.EQUITY ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === AccountType.REVENUE ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'balance' as keyof Account,
      header: 'Balance',
      width: '15%',
      sortable: true,
      render: (value: number, row: Account) => (
        <span className={`font-medium ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Math.abs(value))}
        </span>
      ),
    },
    {
      key: 'currency' as keyof Account,
      header: 'Currency',
      width: '10%',
      sortable: true,
      filterable: true,
    },
    {
      key: 'isActive' as keyof Account,
      header: 'Status',
      width: '10%',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'id' as keyof Account,
      header: 'Actions',
      width: '5%',
      render: (value: string, row: Account) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditModal(row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Sample data for demonstration
  const sampleAccounts: Account[] = [
    {
      id: '1',
      code: '1000',
      name: 'Cash and Bank',
      type: AccountType.ASSET,
      balance: 2500000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Current Assets',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: '1100',
      name: 'Accounts Receivable',
      type: AccountType.ASSET,
      balance: 1800000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Current Assets',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      code: '1200',
      name: 'Inventory - Petroleum Products',
      type: AccountType.ASSET,
      balance: 8500000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Current Assets',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      code: '1500',
      name: 'Property, Plant & Equipment',
      type: AccountType.ASSET,
      balance: 45000000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Non-Current Assets',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      code: '2000',
      name: 'Accounts Payable',
      type: AccountType.LIABILITY,
      balance: 1200000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Current Liabilities',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '6',
      code: '2100',
      name: 'Tax Liabilities',
      type: AccountType.LIABILITY,
      balance: 850000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Current Liabilities',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '7',
      code: '3000',
      name: 'Share Capital',
      type: AccountType.EQUITY,
      balance: 25000000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Equity',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '8',
      code: '4000',
      name: 'Fuel Sales Revenue',
      type: AccountType.REVENUE,
      balance: 45000000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Revenue',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '9',
      code: '5000',
      name: 'Cost of Goods Sold',
      type: AccountType.EXPENSE,
      balance: 32000000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Expenses',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '10',
      code: '5100',
      name: 'Operating Expenses',
      type: AccountType.EXPENSE,
      balance: 8500000,
      currency: Currency.GHS,
      isActive: true,
      ifrsClassification: 'Expenses',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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
              Chart of Accounts
            </h1>
            <p className="text-dark-400 mt-2">
              Manage your accounting structure and IFRS classification
            </p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Account
            </Button>
          </div>
        </motion.div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.values(AccountType).map((type, index) => {
            const typeAccounts = sampleAccounts.filter(acc => acc.type === type);
            const totalBalance = typeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
            
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">
                      {type.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-2xl font-bold text-white mb-1">
                      {typeAccounts.length}
                    </p>
                    <p className="text-sm text-green-400">
                      GHS {new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(totalBalance)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Accounts Table */}
        <Card>
          <CardHeader title="All Accounts" />
          <CardContent>
            <Table
              data={sampleAccounts}
              columns={columns}
              loading={loading}
              pagination={{
                page: 1,
                limit: 10,
                total: sampleAccounts.length,
                onPageChange: () => {},
                onLimitChange: () => {},
              }}
            />
          </CardContent>
        </Card>

        {/* Create Account Modal */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          onSubmit={handleCreate}
          title="Create New Account"
          submitText="Create Account"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Account Code"
              placeholder="Enter account code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Input
              label="Account Name"
              placeholder="Enter account name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Account Type"
              options={accountTypeOptions}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as AccountType })}
              required
            />
            <Select
              label="Currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={(value) => setFormData({ ...formData, currency: value as Currency })}
              required
            />
          </div>

          <Select
            label="Parent Account (Optional)"
            options={[{ value: '', label: 'No Parent Account' }, ...parentAccountOptions]}
            value={formData.parentAccountId}
            onChange={(value) => setFormData({ ...formData, parentAccountId: value as string })}
          />

          <Input
            label="IFRS Classification"
            placeholder="Enter IFRS classification"
            value={formData.ifrsClassification}
            onChange={(e) => setFormData({ ...formData, ifrsClassification: e.target.value })}
          />
        </FormModal>

        {/* Edit Account Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
          }}
          onSubmit={handleEdit}
          title="Edit Account"
          submitText="Update Account"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Account Code"
              placeholder="Enter account code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Input
              label="Account Name"
              placeholder="Enter account name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Account Type"
              options={accountTypeOptions}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as AccountType })}
              required
            />
            <Select
              label="Currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={(value) => setFormData({ ...formData, currency: value as Currency })}
              required
            />
          </div>

          <Select
            label="Parent Account (Optional)"
            options={[{ value: '', label: 'No Parent Account' }, ...parentAccountOptions]}
            value={formData.parentAccountId}
            onChange={(value) => setFormData({ ...formData, parentAccountId: value as string })}
          />

          <Input
            label="IFRS Classification"
            placeholder="Enter IFRS classification"
            value={formData.ifrsClassification}
            onChange={(e) => setFormData({ ...formData, ifrsClassification: e.target.value })}
          />
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default ChartOfAccountsPage;