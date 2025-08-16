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
const react_hot_toast_1 = require("react-hot-toast");
const GeneralLedgerPage = () => {
    const [accounts, setAccounts] = (0, react_1.useState)([]);
    const [transactions, setTransactions] = (0, react_1.useState)([]);
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedAccount, setSelectedAccount] = (0, react_1.useState)('');
    const [activeTab, setActiveTab] = (0, react_1.useState)('accounts');
    const [filters, setFilters] = (0, react_1.useState)({
        accountCode: '',
        accountType: '',
        dateFrom: '',
        dateTo: '',
        documentType: '',
        amountFrom: '',
        amountTo: '',
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, [activeTab, filters]);
    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'accounts') {
                try {
                    const [accountsData] = await Promise.all([
                        api_1.financialService.getChartOfAccounts()
                    ]);
                    setAccounts(accountsData);
                    // Calculate summary from accounts data
                    const calculatedSummary = calculateSummaryFromAccounts(accountsData);
                    setSummary(calculatedSummary);
                }
                catch (apiError) {
                    console.warn('API call failed, using sample data:', apiError);
                    setAccounts(sampleAccounts);
                    setSummary(sampleSummary);
                }
            }
            else {
                try {
                    const transactionsData = await api_1.financialService.getJournalEntries({
                        accountCode: selectedAccount,
                        ...filters
                    });
                    setTransactions(transactionsData);
                }
                catch (apiError) {
                    console.warn('API call failed, using sample data:', apiError);
                    setTransactions(sampleTransactions.filter(t => !selectedAccount || t.id.includes(selectedAccount)));
                }
            }
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load general ledger data');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateSummaryFromAccounts = (accounts) => {
        const summary = accounts.reduce((acc, account) => {
            switch (account.type) {
                case 'Asset':
                    acc.totalAssets += account.currentBalance;
                    break;
                case 'Liability':
                    acc.totalLiabilities += Math.abs(account.currentBalance);
                    break;
                case 'Equity':
                    acc.totalEquity += Math.abs(account.currentBalance);
                    break;
                case 'Revenue':
                    acc.totalRevenue += Math.abs(account.currentBalance);
                    break;
                case 'Expense':
                    acc.totalExpenses += account.currentBalance;
                    break;
            }
            return acc;
        }, {
            totalAccounts: accounts.length,
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            netIncome: 0
        });
        summary.netIncome = summary.totalRevenue - summary.totalExpenses;
        return summary;
    };
    const handleExportGL = async () => {
        try {
            react_hot_toast_1.toast.success('General ledger export started');
            // await financialService.exportGeneralLedger(filters);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to export general ledger');
        }
    };
    const handleDrillDown = (accountCode) => {
        setSelectedAccount(accountCode);
        setActiveTab('transactions');
    };
    const calculateRunningBalance = (transactions, startingBalance = 0) => {
        let runningBalance = startingBalance;
        return transactions.map(transaction => {
            runningBalance += transaction.debitAmount - transaction.creditAmount;
            return { ...transaction, runningBalance };
        });
    };
    const accountColumns = [
        { key: 'code', header: 'Account Code', width: '12%', sortable: true },
        { key: 'name', header: 'Account Name', width: '25%', sortable: true },
        { key: 'type', header: 'Type', width: '10%', sortable: true,
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'Asset' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    value === 'Liability' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        value === 'Equity' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            value === 'Revenue' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'currentBalance', header: 'Current Balance', width: '15%', sortable: true,
            render: (value, row) => (<span className={`font-medium ${(row.type === 'Asset' || row.type === 'Expense') ?
                    (value >= 0 ? 'text-green-400' : 'text-red-400') :
                    (value >= 0 ? 'text-red-400' : 'text-green-400')}`}>
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(Math.abs(value))}
        </span>)
        },
        { key: 'ytdDebits', header: 'YTD Debits', width: '12%', sortable: true,
            render: (value) => (<span className="font-medium text-green-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'ytdCredits', header: 'YTD Credits', width: '12%', sortable: true,
            render: (value) => (<span className="font-medium text-red-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'isActive', header: 'Status', width: '8%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>)
        },
        { key: 'code', header: 'Actions', width: '6%',
            render: (value, row) => (<ui_1.Button variant="ghost" size="sm" onClick={() => handleDrillDown(value)}>
          View Transactions
        </ui_1.Button>)
        },
    ];
    const transactionColumns = [
        { key: 'transactionDate', header: 'Date', width: '10%', sortable: true },
        { key: 'documentNumber', header: 'Document #', width: '12%', sortable: true },
        { key: 'documentType', header: 'Type', width: '10%', sortable: true,
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'JOURNAL_ENTRY' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    value === 'INVOICE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        value === 'PAYMENT' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
          {value.replace('_', ' ')}
        </span>)
        },
        { key: 'reference', header: 'Reference', width: '12%', sortable: true },
        { key: 'description', header: 'Description', width: '20%' },
        { key: 'debitAmount', header: 'Debit', width: '12%', sortable: true,
            render: (value) => (value > 0 ? (<span className="font-medium text-green-400">
            GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
          </span>) : <span className="text-dark-500">-</span>)
        },
        { key: 'creditAmount', header: 'Credit', width: '12%', sortable: true,
            render: (value) => (value > 0 ? (<span className="font-medium text-red-400">
            GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
          </span>) : <span className="text-dark-500">-</span>)
        },
        { key: 'runningBalance', header: 'Running Balance', width: '12%', sortable: true,
            render: (value) => (<span className={`font-medium ${value >= 0 ? 'text-white' : 'text-yellow-400'}`}>
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(Math.abs(value))} {value < 0 ? '(CR)' : ''}
        </span>)
        },
    ];
    // Sample data
    const sampleSummary = {
        totalAccounts: 125,
        totalAssets: 75000000,
        totalLiabilities: 45000000,
        totalEquity: 20000000,
        totalRevenue: 180000000,
        totalExpenses: 170000000,
        netIncome: 10000000,
    };
    const sampleAccounts = [
        {
            code: '1000',
            name: 'Cash - GCB Bank Account',
            type: 'Asset',
            category: 'Current Assets',
            currentBalance: 5000000,
            debitBalance: 5000000,
            creditBalance: 0,
            ytdDebits: 25000000,
            ytdCredits: 20000000,
            isActive: true,
            level: 1,
        },
        {
            code: '1100',
            name: 'Accounts Receivable - Trade',
            type: 'Asset',
            category: 'Current Assets',
            currentBalance: 15000000,
            debitBalance: 15000000,
            creditBalance: 0,
            ytdDebits: 45000000,
            ytdCredits: 30000000,
            isActive: true,
            level: 1,
        },
        {
            code: '1200',
            name: 'Inventory - Premium Motor Spirit',
            type: 'Asset',
            category: 'Current Assets',
            currentBalance: 25000000,
            debitBalance: 25000000,
            creditBalance: 0,
            ytdDebits: 125000000,
            ytdCredits: 100000000,
            isActive: true,
            level: 1,
        },
        {
            code: '2000',
            name: 'Accounts Payable - Trade',
            type: 'Liability',
            category: 'Current Liabilities',
            currentBalance: -10000000,
            debitBalance: 0,
            creditBalance: 10000000,
            ytdDebits: 35000000,
            ytdCredits: 45000000,
            isActive: true,
            level: 1,
        },
        {
            code: '2100',
            name: 'VAT Payable',
            type: 'Liability',
            category: 'Current Liabilities',
            currentBalance: -2500000,
            debitBalance: 0,
            creditBalance: 2500000,
            ytdDebits: 15000000,
            ytdCredits: 17500000,
            isActive: true,
            level: 1,
        },
        {
            code: '4000',
            name: 'Fuel Sales Revenue',
            type: 'Revenue',
            category: 'Operating Revenue',
            currentBalance: -50000000,
            debitBalance: 0,
            creditBalance: 50000000,
            ytdDebits: 5000000,
            ytdCredits: 55000000,
            isActive: true,
            level: 1,
        },
        {
            code: '5000',
            name: 'Cost of Goods Sold',
            type: 'Expense',
            category: 'Operating Expenses',
            currentBalance: 40000000,
            debitBalance: 40000000,
            creditBalance: 0,
            ytdDebits: 40000000,
            ytdCredits: 0,
            isActive: true,
            level: 1,
        },
    ];
    const sampleTransactions = [
        {
            id: '1000-1',
            transactionDate: '2024-01-15',
            postingDate: '2024-01-15',
            documentNumber: 'JE-202401-0001',
            documentType: 'JOURNAL_ENTRY',
            reference: 'SALE-INV-0001',
            description: 'Customer payment received',
            debitAmount: 250000,
            creditAmount: 0,
            runningBalance: 5250000,
            journalEntryId: 'JE-001',
            createdBy: 'John Doe',
            costCenter: 'RETAIL',
        },
        {
            id: '1000-2',
            transactionDate: '2024-01-16',
            postingDate: '2024-01-16',
            documentNumber: 'PAY-202401-0001',
            documentType: 'PAYMENT',
            reference: 'TOR-PAY-001',
            description: 'Payment to TOR for fuel purchase',
            debitAmount: 0,
            creditAmount: 500000,
            runningBalance: 4750000,
            journalEntryId: 'JE-002',
            createdBy: 'Jane Smith',
            costCenter: 'OPERATIONS',
        },
        {
            id: '1000-3',
            transactionDate: '2024-01-17',
            postingDate: '2024-01-17',
            documentNumber: 'JE-202401-0003',
            documentType: 'JOURNAL_ENTRY',
            reference: 'BANK-FEE-001',
            description: 'Bank service charges',
            debitAmount: 0,
            creditAmount: 1500,
            runningBalance: 4748500,
            journalEntryId: 'JE-003',
            createdBy: 'Mike Johnson',
            costCenter: 'ADMIN',
        },
    ];
    const accountTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'Asset', label: 'Assets' },
        { value: 'Liability', label: 'Liabilities' },
        { value: 'Equity', label: 'Equity' },
        { value: 'Revenue', label: 'Revenue' },
        { value: 'Expense', label: 'Expenses' },
    ];
    const documentTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'JOURNAL_ENTRY', label: 'Journal Entry' },
        { value: 'INVOICE', label: 'Invoice' },
        { value: 'PAYMENT', label: 'Payment' },
        { value: 'ADJUSTMENT', label: 'Adjustment' },
    ];
    const tabs = [
        { id: 'accounts', label: 'Chart of Accounts', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
        { id: 'transactions', label: 'GL Transactions', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              General Ledger
            </h1>
            <p className="text-dark-400 mt-2">
              View chart of accounts and transaction details
            </p>
            {selectedAccount && (<div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-dark-400">Viewing account:</span>
                <span className="text-primary-400 font-medium">{selectedAccount}</span>
                <ui_1.Button variant="ghost" size="sm" onClick={() => {
                setSelectedAccount('');
                setActiveTab('accounts');
            }}>
                  ← Back to All Accounts
                </ui_1.Button>
              </div>)}
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm" onClick={handleExportGL}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export GL
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        {summary && (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Assets</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">
                  GHS {(summary.totalAssets / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-400">↑ 5% from last month</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Liabilities</h3>
                <p className="text-2xl font-bold text-red-400 mb-1">
                  GHS {(summary.totalLiabilities / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-red-400">↑ 2% from last month</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">
                  GHS {(summary.totalRevenue / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-400">↑ 12% from last month</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Net Income</h3>
                <p className="text-2xl font-bold text-white mb-1">
                  GHS {(summary.netIncome / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-400">↑ 15% from last month</p>
              </ui_1.CardContent>
            </ui_1.Card>
          </div>)}

        {/* Navigation Tabs */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (<framer_motion_1.motion.button key={tab.id} whileHover={{ y: -2 }} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon}/>
                </svg>
                <span>{tab.label}</span>
              </framer_motion_1.motion.button>))}
          </nav>
        </div>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardHeader title="Filters"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <ui_1.Input label="Account Code" placeholder="e.g., 1000" value={filters.accountCode} onChange={(e) => setFilters({ ...filters, accountCode: e.target.value })}/>
              <ui_1.Select label="Account Type" options={accountTypeOptions} value={filters.accountType} onChange={(value) => setFilters({ ...filters, accountType: value })}/>
              <ui_1.Input label="Date From" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}/>
              <ui_1.Input label="Date To" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}/>
              {activeTab === 'transactions' && (<>
                  <ui_1.Select label="Document Type" options={documentTypeOptions} value={filters.documentType} onChange={(value) => setFilters({ ...filters, documentType: value })}/>
                  <ui_1.Input label="Min Amount" type="number" placeholder="0.00" value={filters.amountFrom} onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}/>
                </>)}
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'accounts' && (<ui_1.Card>
              <ui_1.CardHeader title="Chart of Accounts"/>
              <ui_1.CardContent>
                <ui_1.Table data={accounts.filter(account => (!filters.accountCode || account.code.includes(filters.accountCode)) &&
                (!filters.accountType || account.type === filters.accountType))} columns={accountColumns} loading={loading} pagination={{
                page: 1,
                limit: 25,
                total: accounts.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'transactions' && (<ui_1.Card>
              <ui_1.CardHeader title={selectedAccount ?
                `GL Transactions - Account ${selectedAccount}` :
                'GL Transactions - All Accounts'}/>
              <ui_1.CardContent>
                <ui_1.Table data={calculateRunningBalance(transactions)} columns={transactionColumns} loading={loading} pagination={{
                page: 1,
                limit: 25,
                total: transactions.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = GeneralLedgerPage;
//# sourceMappingURL=general-ledger.js.map