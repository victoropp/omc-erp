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
const FinancialStatementsPage = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('profit_loss');
    const [plAccounts, setPLAccounts] = (0, react_1.useState)([]);
    const [bsAccounts, setBSAccounts] = (0, react_1.useState)([]);
    const [cashFlowItems, setCashFlowItems] = (0, react_1.useState)([]);
    const [ratios, setRatios] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [reportFilters, setReportFilters] = (0, react_1.useState)({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
        endDate: new Date().toISOString().split('T')[0], // Today
        periodType: 'MONTHLY',
        comparison: 'PREVIOUS_PERIOD',
        currency: 'GHS',
    });
    (0, react_1.useEffect)(() => {
        loadFinancialStatements();
    }, [activeTab, reportFilters]);
    const loadFinancialStatements = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'profit_loss':
                    // const plData = await financialService.getProfitLoss(reportFilters);
                    setPLAccounts(samplePLAccounts);
                    break;
                case 'balance_sheet':
                    // const bsData = await financialService.getBalanceSheet(reportFilters);
                    setBSAccounts(sampleBSAccounts);
                    break;
                case 'cash_flow':
                    // const cfData = await financialService.getCashFlow(reportFilters);
                    setCashFlowItems(sampleCashFlowItems);
                    break;
                case 'ratios':
                    // const ratiosData = await financialService.getFinancialRatios(reportFilters);
                    setRatios(sampleRatios);
                    break;
            }
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load financial statements');
        }
        finally {
            setLoading(false);
        }
    };
    const handleExportStatement = async (format) => {
        try {
            // await financialService.exportFinancialStatement({
            //   statementType: activeTab.toUpperCase(),
            //   format,
            //   ...reportFilters
            // });
            react_hot_toast_1.toast.success(`${activeTab.replace('_', ' ')} exported as ${format}`);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to export statement');
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.abs(amount));
    };
    const formatPercent = (percent) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(percent);
    };
    const getVarianceColor = (variance) => {
        if (variance > 0)
            return 'text-green-400';
        if (variance < 0)
            return 'text-red-400';
        return 'text-dark-400';
    };
    // Sample data
    const samplePLAccounts = [
        // Revenue
        {
            accountCode: '4000',
            accountName: 'Fuel Sales Revenue',
            accountType: 'REVENUE',
            currentPeriod: 180000000,
            previousPeriod: 165000000,
            variance: 15000000,
            variancePercent: 9.1,
            ytdAmount: 180000000,
        },
        {
            accountCode: '4100',
            accountName: 'Service Revenue',
            accountType: 'REVENUE',
            currentPeriod: 12000000,
            previousPeriod: 10000000,
            variance: 2000000,
            variancePercent: 20.0,
            ytdAmount: 12000000,
        },
        // Cost of Goods Sold
        {
            accountCode: '5000',
            accountName: 'Cost of Fuel Sold',
            accountType: 'COGS',
            currentPeriod: 145000000,
            previousPeriod: 132000000,
            variance: 13000000,
            variancePercent: 9.8,
            ytdAmount: 145000000,
        },
        // Operating Expenses
        {
            accountCode: '6000',
            accountName: 'Salaries and Wages',
            accountType: 'OPERATING_EXPENSE',
            currentPeriod: 8000000,
            previousPeriod: 7500000,
            variance: 500000,
            variancePercent: 6.7,
            ytdAmount: 8000000,
        },
        {
            accountCode: '6100',
            accountName: 'Rent and Utilities',
            accountType: 'OPERATING_EXPENSE',
            currentPeriod: 3000000,
            previousPeriod: 2800000,
            variance: 200000,
            variancePercent: 7.1,
            ytdAmount: 3000000,
        },
        {
            accountCode: '6200',
            accountName: 'Marketing and Advertising',
            accountType: 'OPERATING_EXPENSE',
            currentPeriod: 1500000,
            previousPeriod: 1200000,
            variance: 300000,
            variancePercent: 25.0,
            ytdAmount: 1500000,
        },
    ];
    const sampleBSAccounts = [
        // Current Assets
        {
            accountCode: '1000',
            accountName: 'Cash and Cash Equivalents',
            accountType: 'CURRENT_ASSET',
            currentBalance: 25000000,
            previousBalance: 20000000,
            change: 5000000,
            changePercent: 25.0,
        },
        {
            accountCode: '1100',
            accountName: 'Accounts Receivable',
            accountType: 'CURRENT_ASSET',
            currentBalance: 15000000,
            previousBalance: 18000000,
            change: -3000000,
            changePercent: -16.7,
        },
        {
            accountCode: '1200',
            accountName: 'Inventory',
            accountType: 'CURRENT_ASSET',
            currentBalance: 35000000,
            previousBalance: 32000000,
            change: 3000000,
            changePercent: 9.4,
        },
        // Fixed Assets
        {
            accountCode: '1500',
            accountName: 'Property, Plant & Equipment',
            accountType: 'FIXED_ASSET',
            currentBalance: 120000000,
            previousBalance: 125000000,
            change: -5000000,
            changePercent: -4.0,
        },
        // Current Liabilities
        {
            accountCode: '2000',
            accountName: 'Accounts Payable',
            accountType: 'CURRENT_LIABILITY',
            currentBalance: 12000000,
            previousBalance: 15000000,
            change: -3000000,
            changePercent: -20.0,
        },
        {
            accountCode: '2100',
            accountName: 'Accrued Expenses',
            accountType: 'CURRENT_LIABILITY',
            currentBalance: 8000000,
            previousBalance: 7000000,
            change: 1000000,
            changePercent: 14.3,
        },
        // Equity
        {
            accountCode: '3000',
            accountName: 'Share Capital',
            accountType: 'EQUITY',
            currentBalance: 100000000,
            previousBalance: 100000000,
            change: 0,
            changePercent: 0,
        },
        {
            accountCode: '3100',
            accountName: 'Retained Earnings',
            accountType: 'EQUITY',
            currentBalance: 63000000,
            previousBalance: 53000000,
            change: 10000000,
            changePercent: 18.9,
        },
    ];
    const sampleCashFlowItems = [
        // Operating Activities
        {
            description: 'Net Income',
            category: 'OPERATING',
            currentPeriod: 25000000,
            previousPeriod: 22000000,
        },
        {
            description: 'Depreciation and Amortization',
            category: 'OPERATING',
            currentPeriod: 8000000,
            previousPeriod: 7500000,
        },
        {
            description: 'Changes in Accounts Receivable',
            category: 'OPERATING',
            currentPeriod: 3000000,
            previousPeriod: -2000000,
        },
        {
            description: 'Changes in Inventory',
            category: 'OPERATING',
            currentPeriod: -3000000,
            previousPeriod: -1000000,
        },
        {
            description: 'Changes in Accounts Payable',
            category: 'OPERATING',
            currentPeriod: -3000000,
            previousPeriod: 2000000,
        },
        // Investing Activities
        {
            description: 'Capital Expenditures',
            category: 'INVESTING',
            currentPeriod: -8000000,
            previousPeriod: -12000000,
        },
        {
            description: 'Asset Disposals',
            category: 'INVESTING',
            currentPeriod: 2000000,
            previousPeriod: 1000000,
        },
        // Financing Activities
        {
            description: 'Dividend Payments',
            category: 'FINANCING',
            currentPeriod: -5000000,
            previousPeriod: -4000000,
        },
        {
            description: 'Loan Repayments',
            category: 'FINANCING',
            currentPeriod: -3000000,
            previousPeriod: -2500000,
        },
    ];
    const sampleRatios = {
        liquidity: {
            currentRatio: 2.8,
            quickRatio: 1.9,
            workingCapital: 55000000,
        },
        profitability: {
            grossProfitMargin: 24.5,
            netProfitMargin: 13.0,
            returnOnAssets: 12.8,
            returnOnEquity: 15.3,
        },
        efficiency: {
            assetTurnover: 0.98,
            inventoryTurnover: 4.2,
            receivablesTurnover: 12.8,
            payablesTurnover: 15.2,
        },
        leverage: {
            debtToEquity: 0.13,
            debtToAssets: 0.10,
            interestCoverage: 25.4,
        },
    };
    // Calculate totals for P&L
    const totalRevenue = samplePLAccounts.filter(acc => acc.accountType === 'REVENUE')
        .reduce((sum, acc) => sum + acc.currentPeriod, 0);
    const totalCOGS = samplePLAccounts.filter(acc => acc.accountType === 'COGS')
        .reduce((sum, acc) => sum + acc.currentPeriod, 0);
    const totalOpEx = samplePLAccounts.filter(acc => acc.accountType === 'OPERATING_EXPENSE')
        .reduce((sum, acc) => sum + acc.currentPeriod, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const operatingIncome = grossProfit - totalOpEx;
    const netIncome = operatingIncome; // Simplified for demo
    // Calculate totals for Balance Sheet
    const totalAssets = sampleBSAccounts.filter(acc => acc.accountType.includes('ASSET'))
        .reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalLiabilities = sampleBSAccounts.filter(acc => acc.accountType.includes('LIABILITY'))
        .reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalEquity = sampleBSAccounts.filter(acc => acc.accountType === 'EQUITY')
        .reduce((sum, acc) => sum + acc.currentBalance, 0);
    const tabs = [
        { id: 'profit_loss', label: 'Profit & Loss', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
        { id: 'balance_sheet', label: 'Balance Sheet', icon: 'M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0-8h18v2H3V6z' },
        { id: 'cash_flow', label: 'Cash Flow', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
        { id: 'ratios', label: 'Financial Ratios', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    ];
    const periodTypeOptions = [
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'YEARLY', label: 'Yearly' },
    ];
    const comparisonOptions = [
        { value: 'PREVIOUS_PERIOD', label: 'Previous Period' },
        { value: 'PREVIOUS_YEAR', label: 'Previous Year' },
        { value: 'BUDGET', label: 'Budget' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Financial Statements
            </h1>
            <p className="text-dark-400 mt-2">
              Generate and analyze financial statements and reports
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm" onClick={() => handleExportStatement('PDF')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export PDF
            </ui_1.Button>
            <ui_1.Button variant="outline" size="sm" onClick={() => handleExportStatement('EXCEL')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export Excel
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Report Filters */}
        <ui_1.Card>
          <ui_1.CardHeader title="Report Parameters"/>
          <ui_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ui_1.Input label="Start Date" type="date" value={reportFilters.startDate} onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}/>
              <ui_1.Input label="End Date" type="date" value={reportFilters.endDate} onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}/>
              <ui_1.Select label="Period Type" options={periodTypeOptions} value={reportFilters.periodType} onChange={(value) => setReportFilters({ ...reportFilters, periodType: value })}/>
              <ui_1.Select label="Comparison" options={comparisonOptions} value={reportFilters.comparison} onChange={(value) => setReportFilters({ ...reportFilters, comparison: value })}/>
              <ui_1.Input label="Currency" value={reportFilters.currency} onChange={(e) => setReportFilters({ ...reportFilters, currency: e.target.value })} disabled/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

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

        {/* Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'profit_loss' && (<ui_1.Card>
              <ui_1.CardHeader title="Profit & Loss Statement" subtitle={`Period: ${reportFilters.startDate} to ${reportFilters.endDate}`}/>
              <ui_1.CardContent>
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">REVENUE</h3>
                    {samplePLAccounts.filter(acc => acc.accountType === 'REVENUE').map((account) => (<div key={account.accountCode} className="grid grid-cols-5 gap-4 py-2 text-sm">
                        <div className="text-dark-300">{account.accountCode}</div>
                        <div className="text-white">{account.accountName}</div>
                        <div className="text-right text-white">GHS {formatCurrency(account.currentPeriod)}</div>
                        <div className="text-right text-dark-400">GHS {formatCurrency(account.previousPeriod)}</div>
                        <div className={`text-right ${getVarianceColor(account.variance)}`}>
                          {formatPercent(account.variancePercent)}%
                        </div>
                      </div>))}
                    <div className="grid grid-cols-5 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div></div>
                      <div className="text-white">Total Revenue</div>
                      <div className="text-right text-green-400">GHS {formatCurrency(totalRevenue)}</div>
                      <div className="text-right text-dark-400">GHS {formatCurrency(175000000)}</div>
                      <div className="text-right text-green-400">9.7%</div>
                    </div>
                  </div>

                  {/* Cost of Goods Sold */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">COST OF GOODS SOLD</h3>
                    {samplePLAccounts.filter(acc => acc.accountType === 'COGS').map((account) => (<div key={account.accountCode} className="grid grid-cols-5 gap-4 py-2 text-sm">
                        <div className="text-dark-300">{account.accountCode}</div>
                        <div className="text-white">{account.accountName}</div>
                        <div className="text-right text-white">GHS {formatCurrency(account.currentPeriod)}</div>
                        <div className="text-right text-dark-400">GHS {formatCurrency(account.previousPeriod)}</div>
                        <div className={`text-right ${getVarianceColor(account.variance)}`}>
                          {formatPercent(account.variancePercent)}%
                        </div>
                      </div>))}
                    <div className="grid grid-cols-5 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div></div>
                      <div className="text-white">Total COGS</div>
                      <div className="text-right text-red-400">GHS {formatCurrency(totalCOGS)}</div>
                      <div className="text-right text-dark-400">GHS {formatCurrency(132000000)}</div>
                      <div className="text-right text-red-400">9.8%</div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 py-2 border-t border-dark-600 font-bold text-lg">
                      <div></div>
                      <div className="text-white">Gross Profit</div>
                      <div className="text-right text-green-400">GHS {formatCurrency(grossProfit)}</div>
                      <div className="text-right text-dark-400">GHS {formatCurrency(43000000)}</div>
                      <div className="text-right text-green-400">9.3%</div>
                    </div>
                  </div>

                  {/* Operating Expenses */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">OPERATING EXPENSES</h3>
                    {samplePLAccounts.filter(acc => acc.accountType === 'OPERATING_EXPENSE').map((account) => (<div key={account.accountCode} className="grid grid-cols-5 gap-4 py-2 text-sm">
                        <div className="text-dark-300">{account.accountCode}</div>
                        <div className="text-white">{account.accountName}</div>
                        <div className="text-right text-white">GHS {formatCurrency(account.currentPeriod)}</div>
                        <div className="text-right text-dark-400">GHS {formatCurrency(account.previousPeriod)}</div>
                        <div className={`text-right ${getVarianceColor(account.variance)}`}>
                          {formatPercent(account.variancePercent)}%
                        </div>
                      </div>))}
                    <div className="grid grid-cols-5 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div></div>
                      <div className="text-white">Total Operating Expenses</div>
                      <div className="text-right text-red-400">GHS {formatCurrency(totalOpEx)}</div>
                      <div className="text-right text-dark-400">GHS {formatCurrency(11500000)}</div>
                      <div className="text-right text-red-400">8.7%</div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 py-3 border-t-2 border-primary-500 font-bold text-xl">
                      <div></div>
                      <div className="text-white">Net Income</div>
                      <div className="text-right text-green-400">GHS {formatCurrency(netIncome)}</div>
                      <div className="text-right text-dark-400">GHS {formatCurrency(31500000)}</div>
                      <div className="text-right text-green-400">10.2%</div>
                    </div>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-5 gap-4 py-2 text-xs font-medium text-dark-400 border-b border-dark-600">
                    <div>Code</div>
                    <div>Account</div>
                    <div className="text-right">Current Period</div>
                    <div className="text-right">Previous Period</div>
                    <div className="text-right">Variance %</div>
                  </div>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'balance_sheet' && (<ui_1.Card>
              <ui_1.CardHeader title="Balance Sheet" subtitle={`As of ${reportFilters.endDate}`}/>
              <ui_1.CardContent>
                <div className="space-y-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-blue-500 pb-2">ASSETS</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Current Assets</h4>
                      {sampleBSAccounts.filter(acc => acc.accountType === 'CURRENT_ASSET').map((account) => (<div key={account.accountCode} className="grid grid-cols-4 gap-4 py-2 text-sm">
                          <div className="text-white">{account.accountName}</div>
                          <div className="text-right text-white">GHS {formatCurrency(account.currentBalance)}</div>
                          <div className="text-right text-dark-400">GHS {formatCurrency(account.previousBalance)}</div>
                          <div className={`text-right ${getVarianceColor(account.change)}`}>
                            {formatPercent(account.changePercent)}%
                          </div>
                        </div>))}
                      <div className="grid grid-cols-4 gap-4 py-2 border-t border-dark-600 font-semibold">
                        <div className="text-white">Total Current Assets</div>
                        <div className="text-right text-white">
                          GHS {formatCurrency(sampleBSAccounts.filter(acc => acc.accountType === 'CURRENT_ASSET')
                .reduce((sum, acc) => sum + acc.currentBalance, 0))}
                        </div>
                        <div className="text-right text-dark-400">GHS 70,000,000</div>
                        <div className="text-right text-green-400">7.1%</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Fixed Assets</h4>
                      {sampleBSAccounts.filter(acc => acc.accountType === 'FIXED_ASSET').map((account) => (<div key={account.accountCode} className="grid grid-cols-4 gap-4 py-2 text-sm">
                          <div className="text-white">{account.accountName}</div>
                          <div className="text-right text-white">GHS {formatCurrency(account.currentBalance)}</div>
                          <div className="text-right text-dark-400">GHS {formatCurrency(account.previousBalance)}</div>
                          <div className={`text-right ${getVarianceColor(account.change)}`}>
                            {formatPercent(account.changePercent)}%
                          </div>
                        </div>))}
                      <div className="grid grid-cols-4 gap-4 py-2 border-t border-dark-600 font-semibold">
                        <div className="text-white">Total Fixed Assets</div>
                        <div className="text-right text-white">GHS {formatCurrency(120000000)}</div>
                        <div className="text-right text-dark-400">GHS 125,000,000</div>
                        <div className="text-right text-red-400">-4.0%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 py-3 border-t-2 border-blue-500 font-bold text-lg">
                      <div className="text-white">TOTAL ASSETS</div>
                      <div className="text-right text-blue-400">GHS {formatCurrency(totalAssets)}</div>
                      <div className="text-right text-dark-400">GHS 195,000,000</div>
                      <div className="text-right text-green-400">2.6%</div>
                    </div>
                  </div>

                  {/* Liabilities and Equity */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2">LIABILITIES & EQUITY</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Current Liabilities</h4>
                      {sampleBSAccounts.filter(acc => acc.accountType === 'CURRENT_LIABILITY').map((account) => (<div key={account.accountCode} className="grid grid-cols-4 gap-4 py-2 text-sm">
                          <div className="text-white">{account.accountName}</div>
                          <div className="text-right text-white">GHS {formatCurrency(account.currentBalance)}</div>
                          <div className="text-right text-dark-400">GHS {formatCurrency(account.previousBalance)}</div>
                          <div className={`text-right ${getVarianceColor(account.change)}`}>
                            {formatPercent(account.changePercent)}%
                          </div>
                        </div>))}
                      <div className="grid grid-cols-4 gap-4 py-2 border-t border-dark-600 font-semibold">
                        <div className="text-white">Total Current Liabilities</div>
                        <div className="text-right text-white">GHS {formatCurrency(totalLiabilities)}</div>
                        <div className="text-right text-dark-400">GHS 22,000,000</div>
                        <div className="text-right text-red-400">-9.1%</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-white mb-3">Equity</h4>
                      {sampleBSAccounts.filter(acc => acc.accountType === 'EQUITY').map((account) => (<div key={account.accountCode} className="grid grid-cols-4 gap-4 py-2 text-sm">
                          <div className="text-white">{account.accountName}</div>
                          <div className="text-right text-white">GHS {formatCurrency(account.currentBalance)}</div>
                          <div className="text-right text-dark-400">GHS {formatCurrency(account.previousBalance)}</div>
                          <div className={`text-right ${getVarianceColor(account.change)}`}>
                            {account.changePercent !== 0 ? `${formatPercent(account.changePercent)}%` : '0.0%'}
                          </div>
                        </div>))}
                      <div className="grid grid-cols-4 gap-4 py-2 border-t border-dark-600 font-semibold">
                        <div className="text-white">Total Equity</div>
                        <div className="text-right text-white">GHS {formatCurrency(totalEquity)}</div>
                        <div className="text-right text-dark-400">GHS 153,000,000</div>
                        <div className="text-right text-green-400">6.5%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 py-3 border-t-2 border-red-500 font-bold text-lg">
                      <div className="text-white">TOTAL LIABILITIES & EQUITY</div>
                      <div className="text-right text-red-400">GHS {formatCurrency(totalLiabilities + totalEquity)}</div>
                      <div className="text-right text-dark-400">GHS 175,000,000</div>
                      <div className="text-right text-green-400">14.3%</div>
                    </div>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-4 gap-4 py-2 text-xs font-medium text-dark-400 border-b border-dark-600">
                    <div>Account</div>
                    <div className="text-right">Current Balance</div>
                    <div className="text-right">Previous Balance</div>
                    <div className="text-right">Change %</div>
                  </div>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'cash_flow' && (<ui_1.Card>
              <ui_1.CardHeader title="Cash Flow Statement" subtitle={`Period: ${reportFilters.startDate} to ${reportFilters.endDate}`}/>
              <ui_1.CardContent>
                <div className="space-y-6">
                  {/* Operating Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">
                      CASH FLOWS FROM OPERATING ACTIVITIES
                    </h3>
                    {sampleCashFlowItems.filter(item => item.category === 'OPERATING').map((item, index) => (<div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <div className="text-white">{item.description}</div>
                        <div className={`text-right ${item.currentPeriod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          GHS {formatCurrency(item.currentPeriod)}
                        </div>
                        <div className="text-right text-dark-400">
                          GHS {formatCurrency(item.previousPeriod)}
                        </div>
                      </div>))}
                    <div className="grid grid-cols-3 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div className="text-white">Net Cash from Operating Activities</div>
                      <div className="text-right text-green-400">GHS 30,000,000</div>
                      <div className="text-right text-dark-400">GHS 28,500,000</div>
                    </div>
                  </div>

                  {/* Investing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">
                      CASH FLOWS FROM INVESTING ACTIVITIES
                    </h3>
                    {sampleCashFlowItems.filter(item => item.category === 'INVESTING').map((item, index) => (<div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <div className="text-white">{item.description}</div>
                        <div className={`text-right ${item.currentPeriod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          GHS {formatCurrency(item.currentPeriod)}
                        </div>
                        <div className="text-right text-dark-400">
                          GHS {formatCurrency(item.previousPeriod)}
                        </div>
                      </div>))}
                    <div className="grid grid-cols-3 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div className="text-white">Net Cash from Investing Activities</div>
                      <div className="text-right text-red-400">GHS (6,000,000)</div>
                      <div className="text-right text-dark-400">GHS (11,000,000)</div>
                    </div>
                  </div>

                  {/* Financing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-600 pb-2">
                      CASH FLOWS FROM FINANCING ACTIVITIES
                    </h3>
                    {sampleCashFlowItems.filter(item => item.category === 'FINANCING').map((item, index) => (<div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <div className="text-white">{item.description}</div>
                        <div className={`text-right ${item.currentPeriod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          GHS {formatCurrency(item.currentPeriod)}
                        </div>
                        <div className="text-right text-dark-400">
                          GHS {formatCurrency(item.previousPeriod)}
                        </div>
                      </div>))}
                    <div className="grid grid-cols-3 gap-4 py-2 border-t border-dark-600 font-bold">
                      <div className="text-white">Net Cash from Financing Activities</div>
                      <div className="text-right text-red-400">GHS (8,000,000)</div>
                      <div className="text-right text-dark-400">GHS (6,500,000)</div>
                    </div>
                  </div>

                  {/* Net Change in Cash */}
                  <div className="border-t-2 border-primary-500 pt-4">
                    <div className="grid grid-cols-3 gap-4 py-2 font-bold text-lg">
                      <div className="text-white">Net Change in Cash and Cash Equivalents</div>
                      <div className="text-right text-green-400">GHS 16,000,000</div>
                      <div className="text-right text-dark-400">GHS 11,000,000</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 text-sm">
                      <div className="text-dark-400">Cash and Cash Equivalents, Beginning</div>
                      <div className="text-right text-white">GHS 9,000,000</div>
                      <div className="text-right text-dark-400">GHS 9,000,000</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2 font-bold text-lg border-t border-dark-600">
                      <div className="text-white">Cash and Cash Equivalents, Ending</div>
                      <div className="text-right text-green-400">GHS 25,000,000</div>
                      <div className="text-right text-dark-400">GHS 20,000,000</div>
                    </div>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-3 gap-4 py-2 text-xs font-medium text-dark-400 border-b border-dark-600">
                    <div>Description</div>
                    <div className="text-right">Current Period</div>
                    <div className="text-right">Previous Period</div>
                  </div>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'ratios' && ratios && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Liquidity Ratios"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Current Ratio</span>
                      <span className="text-green-400 font-bold">{ratios.liquidity.currentRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Quick Ratio</span>
                      <span className="text-green-400 font-bold">{ratios.liquidity.quickRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Working Capital</span>
                      <span className="text-green-400 font-bold">
                        GHS {formatCurrency(ratios.liquidity.workingCapital)}
                      </span>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              <ui_1.Card>
                <ui_1.CardHeader title="Profitability Ratios"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Gross Profit Margin</span>
                      <span className="text-green-400 font-bold">{ratios.profitability.grossProfitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Net Profit Margin</span>
                      <span className="text-green-400 font-bold">{ratios.profitability.netProfitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Return on Assets</span>
                      <span className="text-green-400 font-bold">{ratios.profitability.returnOnAssets.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Return on Equity</span>
                      <span className="text-green-400 font-bold">{ratios.profitability.returnOnEquity.toFixed(1)}%</span>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              <ui_1.Card>
                <ui_1.CardHeader title="Efficiency Ratios"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Asset Turnover</span>
                      <span className="text-blue-400 font-bold">{ratios.efficiency.assetTurnover.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Inventory Turnover</span>
                      <span className="text-blue-400 font-bold">{ratios.efficiency.inventoryTurnover.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Receivables Turnover</span>
                      <span className="text-blue-400 font-bold">{ratios.efficiency.receivablesTurnover.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Payables Turnover</span>
                      <span className="text-blue-400 font-bold">{ratios.efficiency.payablesTurnover.toFixed(1)}x</span>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              <ui_1.Card>
                <ui_1.CardHeader title="Leverage Ratios"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Debt to Equity</span>
                      <span className="text-yellow-400 font-bold">{ratios.leverage.debtToEquity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Debt to Assets</span>
                      <span className="text-yellow-400 font-bold">{ratios.leverage.debtToAssets.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-lg">
                      <span className="text-white font-medium">Interest Coverage</span>
                      <span className="text-green-400 font-bold">{ratios.leverage.interestCoverage.toFixed(1)}x</span>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = FinancialStatementsPage;
//# sourceMappingURL=financial-statements.js.map