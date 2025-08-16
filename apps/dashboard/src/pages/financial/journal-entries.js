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
const JournalEntriesPage = () => {
    const [entries, setEntries] = (0, react_1.useState)([]);
    const [accounts, setAccounts] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [isViewModalOpen, setIsViewModalOpen] = (0, react_1.useState)(false);
    const [selectedEntry, setSelectedEntry] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)('all');
    const [entryFormData, setEntryFormData] = (0, react_1.useState)({
        transactionDate: '',
        reference: '',
        description: '',
        lines: [
            { accountCode: '', description: '', debitAmount: '', creditAmount: '', costCenter: '', reference: '' },
            { accountCode: '', description: '', debitAmount: '', creditAmount: '', costCenter: '', reference: '' }
        ]
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, [activeTab]);
    const loadData = async () => {
        try {
            setLoading(true);
            // const [entriesData, accountsData] = await Promise.all([
            //   financialService.getJournalEntries({ status: activeTab === 'all' ? undefined : activeTab }),
            //   financialService.getChartOfAccounts()
            // ]);
            setEntries(sampleEntries.filter(entry => activeTab === 'all' || entry.status.toLowerCase() === activeTab));
            setAccounts(sampleAccounts);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load journal entries');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateEntry = async (e) => {
        e.preventDefault();
        // Validate the journal entry
        const totalDebits = entryFormData.lines.reduce((sum, line) => sum + (parseFloat(line.debitAmount) || 0), 0);
        const totalCredits = entryFormData.lines.reduce((sum, line) => sum + (parseFloat(line.creditAmount) || 0), 0);
        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            react_hot_toast_1.toast.error('Journal entry must balance - debits must equal credits');
            return;
        }
        try {
            // await financialService.createJournalEntry(entryFormData);
            react_hot_toast_1.toast.success('Journal entry created successfully');
            setIsCreateModalOpen(false);
            resetForm();
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create journal entry');
        }
    };
    const handleApproveEntry = async (id) => {
        try {
            // await financialService.approveJournalEntry(id);
            react_hot_toast_1.toast.success('Journal entry approved successfully');
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to approve journal entry');
        }
    };
    const handleReverseEntry = async (id) => {
        try {
            // await financialService.reverseJournalEntry(id);
            react_hot_toast_1.toast.success('Journal entry reversed successfully');
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to reverse journal entry');
        }
    };
    const resetForm = () => {
        setEntryFormData({
            transactionDate: '',
            reference: '',
            description: '',
            lines: [
                { accountCode: '', description: '', debitAmount: '', creditAmount: '', costCenter: '', reference: '' },
                { accountCode: '', description: '', debitAmount: '', creditAmount: '', costCenter: '', reference: '' }
            ]
        });
    };
    const addEntryLine = () => {
        setEntryFormData({
            ...entryFormData,
            lines: [
                ...entryFormData.lines,
                { accountCode: '', description: '', debitAmount: '', creditAmount: '', costCenter: '', reference: '' }
            ]
        });
    };
    const removeEntryLine = (index) => {
        if (entryFormData.lines.length > 2) {
            const newLines = entryFormData.lines.filter((_, i) => i !== index);
            setEntryFormData({ ...entryFormData, lines: newLines });
        }
    };
    const updateEntryLine = (index, field, value) => {
        const newLines = [...entryFormData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setEntryFormData({ ...entryFormData, lines: newLines });
    };
    const getTotalDebits = () => {
        return entryFormData.lines.reduce((sum, line) => sum + (parseFloat(line.debitAmount) || 0), 0);
    };
    const getTotalCredits = () => {
        return entryFormData.lines.reduce((sum, line) => sum + (parseFloat(line.creditAmount) || 0), 0);
    };
    const isBalanced = () => {
        return Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;
    };
    const entryColumns = [
        { key: 'entryNumber', header: 'Entry #', width: '12%', sortable: true },
        { key: 'transactionDate', header: 'Date', width: '10%', sortable: true },
        { key: 'reference', header: 'Reference', width: '15%', sortable: true },
        { key: 'description', header: 'Description', width: '25%', sortable: true },
        { key: 'totalDebit', header: 'Total Debit', width: '12%', sortable: true,
            render: (value) => (<span className="font-medium text-green-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'totalCredit', header: 'Total Credit', width: '12%', sortable: true,
            render: (value) => (<span className="font-medium text-red-400">
          GHS {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'POSTED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'APPROVED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        value === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '4%',
            render: (value, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm" onClick={() => {
                    setSelectedEntry(row);
                    setIsViewModalOpen(true);
                }}>
            View
          </ui_1.Button>
          {row.status === 'DRAFT' && (<ui_1.Button variant="ghost" size="sm" onClick={() => handleApproveEntry(row.id)}>
              Approve
            </ui_1.Button>)}
          {row.status === 'POSTED' && (<ui_1.Button variant="ghost" size="sm" onClick={() => handleReverseEntry(row.id)}>
              Reverse
            </ui_1.Button>)}
        </div>)
        },
    ];
    // Sample data
    const sampleAccounts = [
        { code: '1000', name: 'Cash - GCB Bank', type: 'Asset', category: 'Current Assets' },
        { code: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current Assets' },
        { code: '1200', name: 'Inventory - Premium Motor Spirit', type: 'Asset', category: 'Current Assets' },
        { code: '1300', name: 'Inventory - Automotive Gas Oil', type: 'Asset', category: 'Current Assets' },
        { code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liabilities' },
        { code: '2100', name: 'VAT Payable', type: 'Liability', category: 'Current Liabilities' },
        { code: '2200', name: 'NHIL Payable', type: 'Liability', category: 'Current Liabilities' },
        { code: '2300', name: 'GETFund Levy Payable', type: 'Liability', category: 'Current Liabilities' },
        { code: '4000', name: 'Fuel Sales Revenue', type: 'Revenue', category: 'Operating Revenue' },
        { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating Expenses' },
    ];
    const sampleEntries = [
        {
            id: '1',
            entryNumber: 'JE-202401-0001',
            transactionDate: '2024-01-15',
            postingDate: '2024-01-15',
            reference: 'SALE-INV-0001',
            description: 'Fuel sales to corporate customer',
            totalDebit: 250000,
            totalCredit: 250000,
            status: 'POSTED',
            createdBy: 'John Doe',
            approvedBy: 'Jane Smith',
            approvedAt: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-15T09:15:00Z',
            lines: [
                {
                    id: '1-1',
                    accountCode: '1100',
                    accountName: 'Accounts Receivable',
                    description: 'Fuel sales to GNPC',
                    debitAmount: 250000,
                    creditAmount: 0,
                    costCenter: 'RETAIL'
                },
                {
                    id: '1-2',
                    accountCode: '4000',
                    accountName: 'Fuel Sales Revenue',
                    description: 'Premium Motor Spirit sales',
                    debitAmount: 0,
                    creditAmount: 217391.30,
                    costCenter: 'RETAIL'
                },
                {
                    id: '1-3',
                    accountCode: '2100',
                    accountName: 'VAT Payable',
                    description: 'VAT on fuel sales (15%)',
                    debitAmount: 0,
                    creditAmount: 32608.70,
                    costCenter: 'RETAIL'
                }
            ]
        },
        {
            id: '2',
            entryNumber: 'JE-202401-0002',
            transactionDate: '2024-01-16',
            postingDate: '2024-01-16',
            reference: 'PURCH-INV-0001',
            description: 'Inventory purchase from TOR',
            totalDebit: 500000,
            totalCredit: 500000,
            status: 'DRAFT',
            createdBy: 'Mike Johnson',
            createdAt: '2024-01-16T14:20:00Z',
            lines: [
                {
                    id: '2-1',
                    accountCode: '1200',
                    accountName: 'Inventory - Premium Motor Spirit',
                    description: 'Fuel purchase from TOR',
                    debitAmount: 500000,
                    creditAmount: 0,
                    costCenter: 'OPERATIONS'
                },
                {
                    id: '2-2',
                    accountCode: '2000',
                    accountName: 'Accounts Payable',
                    description: 'Purchase from TOR',
                    debitAmount: 0,
                    creditAmount: 500000,
                    costCenter: 'OPERATIONS'
                }
            ]
        }
    ];
    const tabs = [
        { id: 'all', label: 'All Entries', count: sampleEntries.length },
        { id: 'draft', label: 'Draft', count: sampleEntries.filter(e => e.status === 'DRAFT').length },
        { id: 'posted', label: 'Posted', count: sampleEntries.filter(e => e.status === 'POSTED').length },
        { id: 'approved', label: 'Approved', count: sampleEntries.filter(e => e.status === 'APPROVED').length },
        { id: 'reversed', label: 'Reversed', count: sampleEntries.filter(e => e.status === 'REVERSED').length },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Journal Entries
            </h1>
            <p className="text-dark-400 mt-2">
              Manage journal entries and general ledger transactions
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              New Journal Entry
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Total Entries</h3>
              <p className="text-2xl font-bold text-white mb-1">{sampleEntries.length}</p>
              <p className="text-sm text-green-400">↑ 8% from last month</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Pending Approval</h3>
              <p className="text-2xl font-bold text-yellow-400 mb-1">1</p>
              <p className="text-sm text-dark-400">Requiring review</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Posted This Month</h3>
              <p className="text-2xl font-bold text-green-400 mb-1">1</p>
              <p className="text-sm text-dark-400">GHS 250,000 value</p>
            </ui_1.CardContent>
          </ui_1.Card>
          <ui_1.Card>
            <ui_1.CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-dark-400 mb-2">Out of Balance</h3>
              <p className="text-2xl font-bold text-red-400 mb-1">0</p>
              <p className="text-sm text-green-400">All balanced</p>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (<framer_motion_1.motion.button key={tab.id} whileHover={{ y: -2 }} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'}`}>
                {tab.label} ({tab.count})
              </framer_motion_1.motion.button>))}
          </nav>
        </div>

        {/* Journal Entries Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <ui_1.Card>
            <ui_1.CardHeader title="Journal Entries"/>
            <ui_1.CardContent>
              <ui_1.Table data={entries} columns={entryColumns} loading={loading} pagination={{
            page: 1,
            limit: 10,
            total: entries.length,
            onPageChange: () => { },
            onLimitChange: () => { },
        }}/>
            </ui_1.CardContent>
          </ui_1.Card>
        </framer_motion_1.motion.div>

        {/* Create Journal Entry Modal */}
        <ui_1.FormModal isOpen={isCreateModalOpen} onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
        }} onSubmit={handleCreateEntry} title="Create Journal Entry" submitText="Create Entry" size="large">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Input label="Transaction Date" type="date" value={entryFormData.transactionDate} onChange={(e) => setEntryFormData({ ...entryFormData, transactionDate: e.target.value })} required/>
              <ui_1.Input label="Reference" placeholder="Reference number" value={entryFormData.reference} onChange={(e) => setEntryFormData({ ...entryFormData, reference: e.target.value })} required/>
              <div className={`px-4 py-2 rounded-lg border ${isBalanced() ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                <p className={`text-sm font-medium ${isBalanced() ? 'text-green-400' : 'text-red-400'}`}>
                  {isBalanced() ? 'Entry Balanced' : 'Out of Balance'}
                </p>
                <p className="text-xs text-dark-400">
                  Difference: GHS {Math.abs(getTotalDebits() - getTotalCredits()).toFixed(2)}
                </p>
              </div>
            </div>

            <ui_1.TextArea label="Description" placeholder="Journal entry description" value={entryFormData.description} onChange={(e) => setEntryFormData({ ...entryFormData, description: e.target.value })} required rows={2}/>

            {/* Journal Entry Lines */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-white">Journal Entry Lines</h4>
                <ui_1.Button type="button" variant="outline" size="sm" onClick={addEntryLine}>
                  Add Line
                </ui_1.Button>
              </div>

              <div className="space-y-3">
                {entryFormData.lines.map((line, index) => (<div key={index} className="p-4 border border-dark-600 rounded-lg bg-dark-800/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-dark-300">Line {index + 1}</span>
                      {entryFormData.lines.length > 2 && (<ui_1.Button type="button" variant="ghost" size="sm" onClick={() => removeEntryLine(index)} className="text-red-400 hover:text-red-300">
                          Remove
                        </ui_1.Button>)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <ui_1.Select label="Account" options={sampleAccounts.map(acc => ({
                value: acc.code,
                label: `${acc.code} - ${acc.name}`
            }))} value={line.accountCode} onChange={(value) => updateEntryLine(index, 'accountCode', value)} required/>
                      <ui_1.Input label="Description" placeholder="Line description" value={line.description} onChange={(e) => updateEntryLine(index, 'description', e.target.value)} required/>
                      <ui_1.Input label="Debit Amount" type="number" step="0.01" placeholder="0.00" value={line.debitAmount} onChange={(e) => updateEntryLine(index, 'debitAmount', e.target.value)}/>
                      <ui_1.Input label="Credit Amount" type="number" step="0.01" placeholder="0.00" value={line.creditAmount} onChange={(e) => updateEntryLine(index, 'creditAmount', e.target.value)}/>
                    </div>
                  </div>))}
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-400">Total Debits:</span>
                    <span className="font-medium text-green-400">
                      GHS {getTotalDebits().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-400">Total Credits:</span>
                    <span className="font-medium text-red-400">
                      GHS {getTotalCredits().toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-dark-600 pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-white">Difference:</span>
                      <span className={isBalanced() ? 'text-green-400' : 'text-red-400'}>
                        GHS {Math.abs(getTotalDebits() - getTotalCredits()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ui_1.FormModal>

        {/* View Journal Entry Modal */}
        <ui_1.FormModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Journal Entry" showSubmit={false} size="large">
          {selectedEntry && (<div className="space-y-6">
              {/* Entry Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Entry Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Entry Number:</dt>
                      <dd className="text-white font-medium">{selectedEntry.entryNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Transaction Date:</dt>
                      <dd className="text-white">{selectedEntry.transactionDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Reference:</dt>
                      <dd className="text-white">{selectedEntry.reference}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Status:</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedEntry.status === 'POSTED' ? 'bg-green-500/20 text-green-400' :
                selectedEntry.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-400' :
                    selectedEntry.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'}`}>
                          {selectedEntry.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Amounts</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Total Debits:</dt>
                      <dd className="text-green-400 font-medium">
                        GHS {selectedEntry.totalDebit.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Total Credits:</dt>
                      <dd className="text-red-400 font-medium">
                        GHS {selectedEntry.totalCredit.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-dark-600">
                      <dt className="text-dark-400">Difference:</dt>
                      <dd className="text-white font-medium">
                        GHS {Math.abs(selectedEntry.totalDebit - selectedEntry.totalCredit).toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Entry Description */}
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Description</h4>
                <p className="text-dark-300 bg-dark-800/30 p-3 rounded-lg border border-dark-600">
                  {selectedEntry.description}
                </p>
              </div>

              {/* Entry Lines */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Journal Entry Lines</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-600">
                        <th className="text-left py-2 text-dark-400 font-medium">Account</th>
                        <th className="text-left py-2 text-dark-400 font-medium">Description</th>
                        <th className="text-right py-2 text-dark-400 font-medium">Debit</th>
                        <th className="text-right py-2 text-dark-400 font-medium">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntry.lines.map((line, index) => (<tr key={index} className="border-b border-dark-700">
                          <td className="py-3">
                            <div>
                              <p className="text-white font-medium">{line.accountCode}</p>
                              <p className="text-dark-400 text-sm">{line.accountName}</p>
                            </div>
                          </td>
                          <td className="py-3 text-dark-300">{line.description}</td>
                          <td className="py-3 text-right">
                            {line.debitAmount > 0 && (<span className="text-green-400 font-medium">
                                GHS {line.debitAmount.toFixed(2)}
                              </span>)}
                          </td>
                          <td className="py-3 text-right">
                            {line.creditAmount > 0 && (<span className="text-red-400 font-medium">
                                GHS {line.creditAmount.toFixed(2)}
                              </span>)}
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>)}
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = JournalEntriesPage;
//# sourceMappingURL=journal-entries.js.map