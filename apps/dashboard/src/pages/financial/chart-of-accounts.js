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
const types_1 = require("@/types");
const react_hot_toast_1 = require("react-hot-toast");
const ChartOfAccountsPage = () => {
    const [accounts, setAccounts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [isEditModalOpen, setIsEditModalOpen] = (0, react_1.useState)(false);
    const [selectedAccount, setSelectedAccount] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        code: '',
        name: '',
        type: types_1.AccountType.ASSET,
        parentAccountId: '',
        currency: types_1.Currency.GHS,
        ifrsClassification: '',
    });
    (0, react_1.useEffect)(() => {
        loadAccounts();
    }, []);
    const loadAccounts = async () => {
        try {
            setLoading(true);
            const data = await api_1.financialService.getChartOfAccounts();
            setAccounts(data);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load chart of accounts');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api_1.financialService.createAccount(formData);
            react_hot_toast_1.toast.success('Account created successfully');
            setIsCreateModalOpen(false);
            resetForm();
            loadAccounts();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create account');
        }
    };
    const handleEdit = async (e) => {
        e.preventDefault();
        if (!selectedAccount)
            return;
        try {
            await api_1.financialService.updateAccount(selectedAccount.id, formData);
            react_hot_toast_1.toast.success('Account updated successfully');
            setIsEditModalOpen(false);
            resetForm();
            loadAccounts();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to update account');
        }
    };
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            type: types_1.AccountType.ASSET,
            parentAccountId: '',
            currency: types_1.Currency.GHS,
            ifrsClassification: '',
        });
        setSelectedAccount(null);
    };
    const openEditModal = (account) => {
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
    const accountTypeOptions = Object.values(types_1.AccountType).map(type => ({
        value: type,
        label: type.replace('_', ' ').toUpperCase(),
    }));
    const currencyOptions = Object.values(types_1.Currency).map(currency => ({
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
            key: 'code',
            header: 'Account Code',
            width: '15%',
            sortable: true,
            filterable: true,
        },
        {
            key: 'name',
            header: 'Account Name',
            width: '30%',
            sortable: true,
            filterable: true,
        },
        {
            key: 'type',
            header: 'Type',
            width: '15%',
            sortable: true,
            filterable: true,
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === types_1.AccountType.ASSET ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    value === types_1.AccountType.LIABILITY ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        value === types_1.AccountType.EQUITY ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            value === types_1.AccountType.REVENUE ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>),
        },
        {
            key: 'balance',
            header: 'Balance',
            width: '15%',
            sortable: true,
            render: (value, row) => (<span className={`font-medium ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Math.abs(value))}
        </span>),
        },
        {
            key: 'currency',
            header: 'Currency',
            width: '10%',
            sortable: true,
            filterable: true,
        },
        {
            key: 'isActive',
            header: 'Status',
            width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>),
        },
        {
            key: 'id',
            header: 'Actions',
            width: '5%',
            render: (value, row) => (<ui_1.Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
          Edit
        </ui_1.Button>),
        },
    ];
    // Sample data for demonstration
    const sampleAccounts = [
        {
            id: '1',
            code: '1000',
            name: 'Cash and Bank',
            type: types_1.AccountType.ASSET,
            balance: 2500000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Current Assets',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '2',
            code: '1100',
            name: 'Accounts Receivable',
            type: types_1.AccountType.ASSET,
            balance: 1800000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Current Assets',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '3',
            code: '1200',
            name: 'Inventory - Petroleum Products',
            type: types_1.AccountType.ASSET,
            balance: 8500000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Current Assets',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '4',
            code: '1500',
            name: 'Property, Plant & Equipment',
            type: types_1.AccountType.ASSET,
            balance: 45000000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Non-Current Assets',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '5',
            code: '2000',
            name: 'Accounts Payable',
            type: types_1.AccountType.LIABILITY,
            balance: 1200000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Current Liabilities',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '6',
            code: '2100',
            name: 'Tax Liabilities',
            type: types_1.AccountType.LIABILITY,
            balance: 850000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Current Liabilities',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '7',
            code: '3000',
            name: 'Share Capital',
            type: types_1.AccountType.EQUITY,
            balance: 25000000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Equity',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '8',
            code: '4000',
            name: 'Fuel Sales Revenue',
            type: types_1.AccountType.REVENUE,
            balance: 45000000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Revenue',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '9',
            code: '5000',
            name: 'Cost of Goods Sold',
            type: types_1.AccountType.EXPENSE,
            balance: 32000000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Expenses',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '10',
            code: '5100',
            name: 'Operating Expenses',
            type: types_1.AccountType.EXPENSE,
            balance: 8500000,
            currency: types_1.Currency.GHS,
            isActive: true,
            ifrsClassification: 'Expenses',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Chart of Accounts
            </h1>
            <p className="text-dark-400 mt-2">
              Manage your accounting structure and IFRS classification
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              New Account
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.values(types_1.AccountType).map((type, index) => {
            const typeAccounts = sampleAccounts.filter(acc => acc.type === type);
            const totalBalance = typeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
            return (<framer_motion_1.motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
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
                  </ui_1.CardContent>
                </ui_1.Card>
              </framer_motion_1.motion.div>);
        })}
        </div>

        {/* Accounts Table */}
        <ui_1.Card>
          <ui_1.CardHeader title="All Accounts"/>
          <ui_1.CardContent>
            <ui_1.Table data={sampleAccounts} columns={columns} loading={loading} pagination={{
            page: 1,
            limit: 10,
            total: sampleAccounts.length,
            onPageChange: () => { },
            onLimitChange: () => { },
        }}/>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Create Account Modal */}
        <ui_1.FormModal isOpen={isCreateModalOpen} onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
        }} onSubmit={handleCreate} title="Create New Account" submitText="Create Account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Account Code" placeholder="Enter account code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required/>
            <ui_1.Input label="Account Name" placeholder="Enter account name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Account Type" options={accountTypeOptions} value={formData.type} onChange={(value) => setFormData({ ...formData, type: value })} required/>
            <ui_1.Select label="Currency" options={currencyOptions} value={formData.currency} onChange={(value) => setFormData({ ...formData, currency: value })} required/>
          </div>

          <ui_1.Select label="Parent Account (Optional)" options={[{ value: '', label: 'No Parent Account' }, ...parentAccountOptions]} value={formData.parentAccountId} onChange={(value) => setFormData({ ...formData, parentAccountId: value })}/>

          <ui_1.Input label="IFRS Classification" placeholder="Enter IFRS classification" value={formData.ifrsClassification} onChange={(e) => setFormData({ ...formData, ifrsClassification: e.target.value })}/>
        </ui_1.FormModal>

        {/* Edit Account Modal */}
        <ui_1.FormModal isOpen={isEditModalOpen} onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
        }} onSubmit={handleEdit} title="Edit Account" submitText="Update Account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Account Code" placeholder="Enter account code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required/>
            <ui_1.Input label="Account Name" placeholder="Enter account name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Account Type" options={accountTypeOptions} value={formData.type} onChange={(value) => setFormData({ ...formData, type: value })} required/>
            <ui_1.Select label="Currency" options={currencyOptions} value={formData.currency} onChange={(value) => setFormData({ ...formData, currency: value })} required/>
          </div>

          <ui_1.Select label="Parent Account (Optional)" options={[{ value: '', label: 'No Parent Account' }, ...parentAccountOptions]} value={formData.parentAccountId} onChange={(value) => setFormData({ ...formData, parentAccountId: value })}/>

          <ui_1.Input label="IFRS Classification" placeholder="Enter IFRS classification" value={formData.ifrsClassification} onChange={(e) => setFormData({ ...formData, ifrsClassification: e.target.value })}/>
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = ChartOfAccountsPage;
//# sourceMappingURL=chart-of-accounts.js.map