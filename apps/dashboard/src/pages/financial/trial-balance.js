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
const react_hot_toast_1 = require("react-hot-toast");
const TrialBalancePage = () => {
    const [trialBalance, setTrialBalance] = (0, react_1.useState)([]);
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [accountGroups, setAccountGroups] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [viewType, setViewType] = (0, react_1.useState)('detail');
    const [filters, setFilters] = (0, react_1.useState)({
        asAtDate: new Date().toISOString().split('T')[0],
        periodFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        periodTo: new Date().toISOString().split('T')[0],
        accountType: '',
        hideZeroBalances: false,
        includeInactive: false,
    });
    (0, react_1.useEffect)(() => {
        loadTrialBalance();
    }, [filters, viewType]);
    const loadTrialBalance = async () => {
        try {
            setLoading(true);
            // const trialBalanceData = await financialService.getTrialBalance({
            //   asAtDate: filters.asAtDate,
            //   periodFrom: filters.periodFrom,
            //   periodTo: filters.periodTo,
            //   accountType: filters.accountType,
            //   hideZeroBalances: filters.hideZeroBalances,
            //   includeInactive: filters.includeInactive,
            // });
            let filteredAccounts = sampleTrialBalance.filter(account => {
                if (filters.accountType && account.accountType !== filters.accountType)
                    return false;
                if (filters.hideZeroBalances && account.closingBalance === 0)
                    return false;
                return true;
            });
            setTrialBalance(filteredAccounts);
            setSummary(calculateSummary(filteredAccounts));
            setAccountGroups(groupAccountsByType(filteredAccounts));
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load trial balance');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateSummary = (accounts) => {
        const totalDebits = accounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
        const totalCredits = accounts.reduce((sum, acc) => sum + acc.creditBalance, 0);
        const difference = Math.abs(totalDebits - totalCredits);
        return {
            totalDebits,
            totalCredits,
            difference,
            isBalanced: difference < 0.01,
            asAtDate: filters.asAtDate,
            periodFrom: filters.periodFrom,
            periodTo: filters.periodTo,
        };
    };
    const groupAccountsByType = (accounts) => {
        const groups = {};
        accounts.forEach(account => {
            if (!groups[account.accountType]) {
                groups[account.accountType] = [];
            }
            groups[account.accountType].push(account);
        });
        return Object.entries(groups).map(([type, accountList]) => ({
            type,
            accounts: accountList,
            totalDebits: accountList.reduce((sum, acc) => sum + acc.debitBalance, 0),
            totalCredits: accountList.reduce((sum, acc) => sum + acc.creditBalance, 0),
        }));
    };
    const handleExportTrialBalance = async () => {
        try {
            react_hot_toast_1.toast.success('Trial balance export started');
            // await financialService.exportTrialBalance(filters);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to export trial balance');
        }
    };
    const handlePrintTrialBalance = () => {
        window.print();
    };
    const trialBalanceColumns = [
        { key: 'accountCode', header: 'Code', width: '10%', sortable: true },
        { key: 'accountName', header: 'Account Name', width: '25%', sortable: true },
        { key: 'accountType', header: 'Type', width: '10%', sortable: true,
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'Asset' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    value === 'Liability' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        value === 'Equity' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            value === 'Revenue' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'openingBalance', header: 'Opening Balance', width: '13%', sortable: true,
            render: (value) => (<span className={`font-medium ${value >= 0 ? 'text-white' : 'text-yellow-400'}`}>
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(Math.abs(value))} {value < 0 ? '(CR)' : ''}
        </span>)
        },
        { key: 'debitBalance', header: 'Debit', width: '13%', sortable: true,
            render: (value) => (value > 0 ? (<span className="font-medium text-green-400">
            GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
          </span>) : <span className="text-dark-500">-</span>)
        },
        { key: 'creditBalance', header: 'Credit', width: '13%', sortable: true,
            render: (value) => (value > 0 ? (<span className="font-medium text-red-400">
            GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
          </span>) : <span className="text-dark-500">-</span>)
        },
        { key: 'closingBalance', header: 'Closing Balance', width: '16%', sortable: true,
            render: (value) => (<span className={`font-medium ${value >= 0 ? 'text-white' : 'text-yellow-400'}`}>
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(Math.abs(value))} {value < 0 ? '(CR)' : ''}
        </span>)
        },
    ];
    const summaryColumns = [
        { key: 'type', header: 'Account Type', width: '30%' },
        { key: 'totalDebits', header: 'Total Debits', width: '25%',
            render: (value) => (<span className="font-medium text-green-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'totalCredits', header: 'Total Credits', width: '25%',
            render: (value) => (<span className="font-medium text-red-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'accounts', header: 'Account Count', width: '20%',
            render: (value) => (<span className="text-white">{value.length}</span>)
        },
    ];
    // Sample data
    const sampleTrialBalance = [
        {
            accountCode: '1000',
            accountName: 'Cash - GCB Bank Account',
            accountType: 'Asset',
            openingBalance: 4500000,
            periodDebits: 2500000,
            periodCredits: 2000000,
            closingBalance: 5000000,
            debitBalance: 5000000,
            creditBalance: 0,
            ytdDebits: 25000000,
            ytdCredits: 20000000,
        },
        {
            accountCode: '1100',
            accountName: 'Accounts Receivable - Trade',
            accountType: 'Asset',
            openingBalance: 12000000,
            periodDebits: 8000000,
            periodCredits: 5000000,
            closingBalance: 15000000,
            debitBalance: 15000000,
            creditBalance: 0,
            ytdDebits: 45000000,
            ytdCredits: 30000000,
        },
        {
            accountCode: '1200',
            accountName: 'Inventory - Premium Motor Spirit',
            accountType: 'Asset',
            openingBalance: 20000000,
            periodDebits: 15000000,
            periodCredits: 10000000,
            closingBalance: 25000000,
            debitBalance: 25000000,
            creditBalance: 0,
            ytdDebits: 125000000,
            ytdCredits: 100000000,
        },
        {
            accountCode: '1300',
            accountName: 'Inventory - Automotive Gas Oil',
            accountType: 'Asset',
            openingBalance: 18000000,
            periodDebits: 12000000,
            periodCredits: 8000000,
            closingBalance: 22000000,
            debitBalance: 22000000,
            creditBalance: 0,
            ytdDebits: 95000000,
            ytdCredits: 73000000,
        },
        {
            accountCode: '2000',
            accountName: 'Accounts Payable - Trade',
            accountType: 'Liability',
            openingBalance: -8000000,
            periodDebits: 3000000,
            periodCredits: 5000000,
            closingBalance: -10000000,
            debitBalance: 0,
            creditBalance: 10000000,
            ytdDebits: 35000000,
            ytdCredits: 45000000,
        },
        {
            accountCode: '2100',
            accountName: 'VAT Payable',
            accountType: 'Liability',
            openingBalance: -2000000,
            periodDebits: 1000000,
            periodCredits: 1500000,
            closingBalance: -2500000,
            debitBalance: 0,
            creditBalance: 2500000,
            ytdDebits: 15000000,
            ytdCredits: 17500000,
        },
        {
            accountCode: '2200',
            accountName: 'NHIL Payable',
            accountType: 'Liability',
            openingBalance: -800000,
            periodDebits: 300000,
            periodCredits: 400000,
            closingBalance: -900000,
            debitBalance: 0,
            creditBalance: 900000,
            ytdDebits: 4500000,
            ytdCredits: 5400000,
        },
        {
            accountCode: '3000',
            accountName: 'Share Capital',
            accountType: 'Equity',
            openingBalance: -20000000,
            periodDebits: 0,
            periodCredits: 0,
            closingBalance: -20000000,
            debitBalance: 0,
            creditBalance: 20000000,
            ytdDebits: 0,
            ytdCredits: 20000000,
        },
        {
            accountCode: '4000',
            accountName: 'Fuel Sales Revenue',
            accountType: 'Revenue',
            openingBalance: -45000000,
            periodDebits: 2000000,
            periodCredits: 7000000,
            closingBalance: -50000000,
            debitBalance: 0,
            creditBalance: 50000000,
            ytdDebits: 5000000,
            ytdCredits: 55000000,
        },
        {
            accountCode: '4100',
            accountName: 'Service Revenue',
            accountType: 'Revenue',
            openingBalance: -8000000,
            periodDebits: 500000,
            periodCredits: 1500000,
            closingBalance: -9000000,
            debitBalance: 0,
            creditBalance: 9000000,
            ytdDebits: 2000000,
            ytdCredits: 11000000,
        },
        {
            accountCode: '5000',
            accountName: 'Cost of Goods Sold',
            accountType: 'Expense',
            openingBalance: 35000000,
            periodDebits: 8000000,
            periodCredits: 3000000,
            closingBalance: 40000000,
            debitBalance: 40000000,
            creditBalance: 0,
            ytdDebits: 40000000,
            ytdCredits: 0,
        },
        {
            accountCode: '6000',
            accountName: 'Operating Expenses',
            accountType: 'Expense',
            openingBalance: 8000000,
            periodDebits: 3000000,
            periodCredits: 1000000,
            closingBalance: 10000000,
            debitBalance: 10000000,
            creditBalance: 0,
            ytdDebits: 12000000,
            ytdCredits: 2000000,
        },
    ];
    const viewTypeOptions = [
        { value: 'detail', label: 'Detailed View' },
        { value: 'summary', label: 'Summary by Type' },
        { value: 'grouped', label: 'Grouped View' },
    ];
    const accountTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'Asset', label: 'Assets' },
        { value: 'Liability', label: 'Liabilities' },
        { value: 'Equity', label: 'Equity' },
        { value: 'Revenue', label: 'Revenue' },
        { value: 'Expense', label: 'Expenses' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Trial Balance
            </h1>
            <p className="text-dark-400 mt-2">
              Verify ledger balances and ensure accounting equation integrity
            </p>
            {summary && (<div className="mt-2">
                <span className="text-sm text-dark-400">
                  As at {new Date(summary.asAtDate).toLocaleDateString()} • 
                  Period: {new Date(summary.periodFrom).toLocaleDateString()} to {new Date(summary.periodTo).toLocaleDateString()}
                </span>
              </div>)}
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm" onClick={handlePrintTrialBalance}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print
            </ui_1.Button>
            <ui_1.Button variant="outline" size="sm" onClick={handleExportTrialBalance}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Balance Status Card */}
        {summary && (<ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${summary.isBalanced ? 'bg-green-500' : 'bg-red-500'}`}/>
                  <div>
                    <h3 className={`text-lg font-medium ${summary.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                      Trial Balance {summary.isBalanced ? 'is Balanced' : 'is Out of Balance'}
                    </h3>
                    <p className="text-dark-400 text-sm">
                      {summary.isBalanced ?
                'All debits equal credits - accounting equation is maintained' :
                `Difference of GHS ${summary.difference.toFixed(2)} requires investigation`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <p className="text-sm text-dark-400">Total Debits</p>
                    <p className="text-2xl font-bold text-green-400">
                      GHS {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
            }).format(summary.totalDebits)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Credits</p>
                    <p className="text-2xl font-bold text-red-400">
                      GHS {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
            }).format(summary.totalCredits)}
                    </p>
                  </div>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Filters and Controls */}
        <ui_1.Card>
          <ui_1.CardHeader title="Report Parameters"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <ui_1.Input label="As At Date" type="date" value={filters.asAtDate} onChange={(e) => setFilters({ ...filters, asAtDate: e.target.value })}/>
              <ui_1.Input label="Period From" type="date" value={filters.periodFrom} onChange={(e) => setFilters({ ...filters, periodFrom: e.target.value })}/>
              <ui_1.Input label="Period To" type="date" value={filters.periodTo} onChange={(e) => setFilters({ ...filters, periodTo: e.target.value })}/>
              <ui_1.Select label="Account Type" options={accountTypeOptions} value={filters.accountType} onChange={(value) => setFilters({ ...filters, accountType: value })}/>
              <ui_1.Select label="View Type" options={viewTypeOptions} value={viewType} onChange={(value) => setViewType(value)}/>
              <div className="flex flex-col space-y-2 pt-6">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={filters.hideZeroBalances} onChange={(e) => setFilters({ ...filters, hideZeroBalances: e.target.checked })} className="rounded"/>
                  <span className="text-sm text-dark-300">Hide Zero Balances</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={filters.includeInactive} onChange={(e) => setFilters({ ...filters, includeInactive: e.target.checked })} className="rounded"/>
                  <span className="text-sm text-dark-300">Include Inactive</span>
                </label>
              </div>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Trial Balance Content */}
        <framer_motion_1.motion.div key={viewType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {viewType === 'detail' && (<ui_1.Card>
              <ui_1.CardHeader title="Detailed Trial Balance"/>
              <ui_1.CardContent>
                <ui_1.Table data={trialBalance} columns={trialBalanceColumns} loading={loading} pagination={{
                page: 1,
                limit: 25,
                total: trialBalance.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {viewType === 'summary' && (<ui_1.Card>
              <ui_1.CardHeader title="Trial Balance Summary by Account Type"/>
              <ui_1.CardContent>
                <ui_1.Table data={accountGroups} columns={summaryColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: accountGroups.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {viewType === 'grouped' && (<div className="space-y-6">
              {accountGroups.map((group) => (<ui_1.Card key={group.type}>
                  <ui_1.CardHeader title={`${group.type} Accounts`} subtitle={`${group.accounts.length} accounts • Debits: GHS ${group.totalDebits.toFixed(2)} • Credits: GHS ${group.totalCredits.toFixed(2)}`}/>
                  <ui_1.CardContent>
                    <ui_1.Table data={group.accounts} columns={trialBalanceColumns.filter(col => col.key !== 'accountType')} loading={loading} pagination={{
                    page: 1,
                    limit: 10,
                    total: group.accounts.length,
                    onPageChange: () => { },
                    onLimitChange: () => { },
                }}/>
                  </ui_1.CardContent>
                </ui_1.Card>))}
            </div>)}
        </framer_motion_1.motion.div>

        {/* Summary Totals */}
        {summary && (<ui_1.Card>
            <ui_1.CardHeader title="Trial Balance Totals"/>
            <ui_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-dark-800/30 rounded-lg border border-dark-600">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Total Debit Balances</h3>
                  <p className="text-2xl font-bold text-green-400 mb-1">
                    GHS {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
            }).format(summary.totalDebits)}
                  </p>
                  <p className="text-sm text-dark-400">
                    {trialBalance.filter(acc => acc.debitBalance > 0).length} accounts
                  </p>
                </div>
                <div className="text-center p-6 bg-dark-800/30 rounded-lg border border-dark-600">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Total Credit Balances</h3>
                  <p className="text-2xl font-bold text-red-400 mb-1">
                    GHS {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
            }).format(summary.totalCredits)}
                  </p>
                  <p className="text-sm text-dark-400">
                    {trialBalance.filter(acc => acc.creditBalance > 0).length} accounts
                  </p>
                </div>
                <div className="text-center p-6 bg-dark-800/30 rounded-lg border border-dark-600">
                  <h3 className="text-sm font-medium text-dark-400 mb-2">Net Difference</h3>
                  <p className={`text-2xl font-bold mb-1 ${summary.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                    GHS {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
            }).format(summary.difference)}
                  </p>
                  <p className={`text-sm ${summary.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.isBalanced ? 'Balanced' : 'Out of Balance'}
                  </p>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = TrialBalancePage;
//# sourceMappingURL=trial-balance.js.map