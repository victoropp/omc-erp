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
const AccountsReceivablePage = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('dashboard');
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [collectionsData, setCollectionsData] = (0, react_1.useState)([]);
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [invoices, setInvoices] = (0, react_1.useState)([]);
    const [payments, setPayments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = (0, react_1.useState)(false);
    const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = (0, react_1.useState)(false);
    const [isProcessPaymentModalOpen, setIsProcessPaymentModalOpen] = (0, react_1.useState)(false);
    const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = (0, react_1.useState)(false);
    const [selectedInvoice, setSelectedInvoice] = (0, react_1.useState)(null);
    const [filters, setFilters] = (0, react_1.useState)({
        customer: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        amountFrom: '',
        amountTo: ''
    });
    const [customerFormData, setCustomerFormData] = (0, react_1.useState)({
        customerName: '',
        customerType: 'CORPORATE',
        email: '',
        phone: '',
        streetAddress: '',
        city: '',
        region: '',
        paymentTerms: 'NET_30',
        creditLimit: '',
        currency: 'GHS',
    });
    const [invoiceFormData, setInvoiceFormData] = (0, react_1.useState)({
        customerId: '',
        invoiceDate: '',
        dueDate: '',
        description: '',
        subtotal: '',
        taxAmount: '',
        totalAmount: '',
        lines: [{ description: '', quantity: 1, unitPrice: '', accountCode: '4000' }],
    });
    const [paymentFormData, setPaymentFormData] = (0, react_1.useState)({
        customerId: '',
        paymentDate: '',
        paymentAmount: '',
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        bankAccount: '',
        invoiceAllocations: [],
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, [activeTab]);
    const loadData = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'dashboard':
                    // const dashboardData = await financialService.getARDashboard();
                    setSummary(sampleARSummary);
                    setCollectionsData(sampleCollectionsData);
                    break;
                case 'customers':
                    // const customerData = await financialService.getCustomers();
                    setCustomers(sampleCustomers);
                    break;
                case 'invoices':
                    // const invoiceData = await financialService.getARInvoices(filters);
                    setInvoices(sampleInvoices.filter(inv => (!filters.customer || inv.customerName.toLowerCase().includes(filters.customer.toLowerCase())) &&
                        (!filters.status || inv.status === filters.status)));
                    break;
                case 'payments':
                    // const paymentData = await financialService.getCustomerPayments();
                    setPayments(samplePayments);
                    break;
                case 'reports':
                    // Load reports data
                    break;
            }
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            // await financialService.createCustomer(customerFormData);
            react_hot_toast_1.toast.success('Customer created successfully');
            setIsCreateCustomerModalOpen(false);
            resetCustomerForm();
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create customer');
        }
    };
    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            // await financialService.createARInvoice(invoiceFormData);
            react_hot_toast_1.toast.success('Invoice created successfully');
            setIsCreateInvoiceModalOpen(false);
            resetInvoiceForm();
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create invoice');
        }
    };
    const handleProcessPayment = async (e) => {
        e.preventDefault();
        try {
            // await financialService.processCustomerPayment(paymentFormData);
            react_hot_toast_1.toast.success('Payment processed successfully');
            setIsProcessPaymentModalOpen(false);
            resetPaymentForm();
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to process payment');
        }
    };
    const resetCustomerForm = () => {
        setCustomerFormData({
            customerName: '',
            customerType: 'CORPORATE',
            email: '',
            phone: '',
            streetAddress: '',
            city: '',
            region: '',
            paymentTerms: 'NET_30',
            creditLimit: '',
            currency: 'GHS',
        });
    };
    const resetInvoiceForm = () => {
        setInvoiceFormData({
            customerId: '',
            invoiceDate: '',
            dueDate: '',
            description: '',
            subtotal: '',
            taxAmount: '',
            totalAmount: '',
            lines: [{ description: '', quantity: 1, unitPrice: '', accountCode: '4000' }],
        });
    };
    const resetPaymentForm = () => {
        setPaymentFormData({
            customerId: '',
            paymentDate: '',
            paymentAmount: '',
            paymentMethod: 'BANK_TRANSFER',
            referenceNumber: '',
            bankAccount: '',
            invoiceAllocations: [],
        });
    };
    const customerTypeOptions = [
        { value: 'INDIVIDUAL', label: 'Individual' },
        { value: 'CORPORATE', label: 'Corporate' },
        { value: 'GOVERNMENT', label: 'Government' },
        { value: 'NGO', label: 'NGO' },
        { value: 'FUEL_DEALER', label: 'Fuel Dealer' },
        { value: 'FLEET_OPERATOR', label: 'Fleet Operator' },
        { value: 'INDUSTRIAL', label: 'Industrial' },
    ];
    const paymentTermsOptions = [
        { value: 'IMMEDIATE', label: 'Immediate' },
        { value: 'NET_15', label: 'Net 15 Days' },
        { value: 'NET_30', label: 'Net 30 Days' },
        { value: 'NET_60', label: 'Net 60 Days' },
        { value: 'NET_90', label: 'Net 90 Days' },
    ];
    const paymentMethodOptions = [
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'CASH', label: 'Cash' },
        { value: 'MOBILE_MONEY', label: 'Mobile Money' },
        { value: 'CREDIT_CARD', label: 'Credit Card' },
    ];
    const customerColumns = [
        { key: 'customerNumber', header: 'Customer #', width: '12%', sortable: true },
        { key: 'customerName', header: 'Customer Name', width: '18%', sortable: true },
        { key: 'customerType', header: 'Type', width: '12%', sortable: true },
        { key: 'currentBalance', header: 'Balance', width: '12%', sortable: true,
            render: (value, row) => (<span className={`font-medium ${value > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(Math.abs(value))}
        </span>)
        },
        { key: 'availableCredit', header: 'Available Credit', width: '12%', sortable: true,
            render: (value, row) => (<span className="font-medium text-blue-400">
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'riskCategory', header: 'Risk', width: '8%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'LOW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        value === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'daysSalesOutstanding', header: 'DSO', width: '8%', sortable: true,
            render: (value) => (<span className={`font-medium ${value > 60 ? 'text-red-400' : value > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
          {value} days
        </span>)
        },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '8%',
            render: (value, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm">Edit</ui_1.Button>
          <ui_1.Button variant="ghost" size="sm">View</ui_1.Button>
        </div>)
        },
    ];
    const invoiceColumns = [
        { key: 'invoiceNumber', header: 'Invoice #', width: '15%', sortable: true },
        { key: 'customerName', header: 'Customer', width: '20%', sortable: true },
        { key: 'invoiceDate', header: 'Invoice Date', width: '12%', sortable: true },
        { key: 'dueDate', header: 'Due Date', width: '12%', sortable: true },
        { key: 'totalAmount', header: 'Amount', width: '12%', sortable: true,
            render: (value, row) => (<span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'outstandingAmount', header: 'Outstanding', width: '12%', sortable: true,
            render: (value, row) => (<span className={`font-medium ${value > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'daysPastDue', header: 'Days Past Due', width: '10%', sortable: true,
            render: (value) => (<span className={`font-medium ${value === 0 ? 'text-green-400' :
                    value <= 30 ? 'text-yellow-400' :
                        value <= 60 ? 'text-orange-400' :
                            'text-red-400'}`}>
          {value > 0 ? `${value} days` : 'Current'}
        </span>)
        },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'POSTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
          {value}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '7%',
            render: (value, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm">View</ui_1.Button>
          <ui_1.Button variant="ghost" size="sm">Collect</ui_1.Button>
        </div>)
        },
    ];
    // Sample data for demonstration
    const sampleCustomers = [
        {
            id: '1',
            customerNumber: 'COR000001',
            customerName: 'Ghana National Petroleum Corporation',
            customerType: 'GOVERNMENT',
            email: 'accounts@gnpc.com.gh',
            phone: '+233-302-665-950',
            creditLimit: 100000000,
            currentBalance: 15000000,
            availableCredit: 85000000,
            status: 'ACTIVE',
            paymentTerms: 'NET_30',
            currency: 'GHS',
            riskCategory: 'LOW',
            daysSalesOutstanding: 25,
            lastPaymentDate: '2024-01-20',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-20T00:00:00Z',
        },
        {
            id: '2',
            customerNumber: 'FD000001',
            customerName: 'Total Energies Ghana',
            customerType: 'FUEL_DEALER',
            email: 'finance@totalenergies.gh',
            phone: '+233-302-123-456',
            creditLimit: 50000000,
            currentBalance: 8500000,
            availableCredit: 41500000,
            status: 'ACTIVE',
            paymentTerms: 'NET_15',
            currency: 'GHS',
            riskCategory: 'LOW',
            daysSalesOutstanding: 18,
            lastPaymentDate: '2024-01-22',
            createdAt: '2024-01-05T00:00:00Z',
            updatedAt: '2024-01-22T00:00:00Z',
        },
        {
            id: '3',
            customerNumber: 'FO000001',
            customerName: 'Metro Mass Transit Ltd',
            customerType: 'FLEET_OPERATOR',
            email: 'accounts@mmt.gov.gh',
            phone: '+233-302-789-012',
            creditLimit: 25000000,
            currentBalance: 12000000,
            availableCredit: 13000000,
            status: 'ACTIVE',
            paymentTerms: 'NET_60',
            currency: 'GHS',
            riskCategory: 'MEDIUM',
            daysSalesOutstanding: 75,
            lastPaymentDate: '2024-01-10',
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-10T00:00:00Z',
        },
    ];
    const sampleInvoices = [
        {
            id: '1',
            customerId: '1',
            customerName: 'Ghana National Petroleum Corporation',
            invoiceNumber: 'INV-202401-000001',
            invoiceDate: '2024-01-15',
            dueDate: '2024-02-14',
            totalAmount: 15000000,
            outstandingAmount: 15000000,
            status: 'POSTED',
            currency: 'GHS',
            description: 'Bulk Fuel Supply - January 2024',
            daysPastDue: 0,
        },
        {
            id: '2',
            customerId: '2',
            customerName: 'Total Energies Ghana',
            invoiceNumber: 'INV-202401-000002',
            invoiceDate: '2024-01-10',
            dueDate: '2024-01-25',
            totalAmount: 8500000,
            outstandingAmount: 0,
            status: 'PAID',
            currency: 'GHS',
            description: 'Premium Motor Spirit Supply',
            daysPastDue: 0,
        },
        {
            id: '3',
            customerId: '3',
            customerName: 'Metro Mass Transit Ltd',
            invoiceNumber: 'INV-202401-000003',
            invoiceDate: '2023-12-15',
            dueDate: '2024-02-13',
            totalAmount: 12000000,
            outstandingAmount: 12000000,
            status: 'POSTED',
            currency: 'GHS',
            description: 'Fleet Diesel Supply - December 2023',
            daysPastDue: 5,
        },
    ];
    const samplePayments = [
        {
            id: '1',
            customerId: '2',
            customerName: 'Total Energies Ghana',
            paymentNumber: 'PAY-202401-000001',
            paymentDate: '2024-01-22',
            paymentAmount: 8500000,
            paymentMethod: 'BANK_TRANSFER',
            referenceNumber: 'TEG-PAY-2024-001',
            status: 'CLEARED',
            currency: 'GHS',
        },
    ];
    // Sample data for AR dashboard
    const sampleARSummary = {
        totalOutstanding: 27000000,
        currentAmount: 15000000,
        overdueAmount: 12000000,
        customerCount: 3,
        avgCollectionDays: 39
    };
    const sampleCollectionsData = [
        { period: 'Current (0-30 days)', amount: 15000000, invoiceCount: 1, percentage: 55.6 },
        { period: '31-60 days', amount: 0, invoiceCount: 0, percentage: 0 },
        { period: '61-90 days', amount: 12000000, invoiceCount: 1, percentage: 44.4 },
        { period: '90+ days', amount: 0, invoiceCount: 0, percentage: 0 },
    ];
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
        { id: 'customers', label: 'Customers', icon: 'M17 20h5v-2a2 2 0 00-2-2h-3v4zM9 12h6v-2H9v2zm-4 8h5v-4H5v4zM9 4h6V2H9v2z' },
        { id: 'invoices', label: 'Invoices', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
        { id: 'payments', label: 'Payments', icon: 'M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0-8h18v2H3V6z' },
        { id: 'reports', label: 'Reports', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Accounts Receivable
            </h1>
            <p className="text-dark-400 mt-2">
              Manage customers, invoices, and payment collections
            </p>
          </div>
          <div className="flex space-x-4">
            {activeTab !== 'dashboard' && (<ui_1.Button variant="outline" size="sm" onClick={() => {
                if (activeTab === 'customers')
                    setIsCreateCustomerModalOpen(true);
                if (activeTab === 'invoices')
                    setIsCreateInvoiceModalOpen(true);
                if (activeTab === 'payments')
                    setIsProcessPaymentModalOpen(true);
            }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                {activeTab === 'customers' && 'New Customer'}
                {activeTab === 'invoices' && 'New Invoice'}
                {activeTab === 'payments' && 'Process Payment'}
                {activeTab === 'reports' && 'Generate Report'}
              </ui_1.Button>)}
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards - shown only on dashboard */}
        {activeTab === 'dashboard' && summary && (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Outstanding</h3>
                <p className="text-2xl font-bold text-red-400 mb-1">
                  GHS {(summary.totalOutstanding / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-red-400">↑ 12% from last month</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Current (0-30 days)</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">
                  GHS {(summary.currentAmount / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">55.6% of total</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Overdue (30+ days)</h3>
                <p className="text-2xl font-bold text-yellow-400 mb-1">
                  GHS {(summary.overdueAmount / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">44.4% of total</p>
              </ui_1.CardContent>
            </ui_1.Card>
            <ui_1.Card>
              <ui_1.CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Average DSO</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">{summary.avgCollectionDays} days</p>
                <p className="text-sm text-green-400">↓ 5 days improved</p>
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

        {/* Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'customers' && (<ui_1.Card>
              <ui_1.CardHeader title="Customer Management"/>
              <ui_1.CardContent>
                <ui_1.Table data={sampleCustomers} columns={customerColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: sampleCustomers.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'invoices' && (<ui_1.Card>
              <ui_1.CardHeader title="Invoice Management"/>
              <ui_1.CardContent>
                <ui_1.Table data={sampleInvoices} columns={invoiceColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: sampleInvoices.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'payments' && (<ui_1.Card>
              <ui_1.CardHeader title="Payment Processing"/>
              <ui_1.CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Payment Collection</h3>
                  <p className="text-dark-400 mb-6">
                    Payment processing interface will be displayed here
                  </p>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'reports' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ui_1.Card>
                <ui_1.CardHeader title="AR Aging Report"/>
                <ui_1.CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Aging analysis by customer</p>
                    <ui_1.Button variant="outline" size="sm">Generate Report</ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
              <ui_1.Card>
                <ui_1.CardHeader title="Collections Dashboard"/>
                <ui_1.CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Collection performance metrics</p>
                    <ui_1.Button variant="outline" size="sm">View Dashboard</ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>

        {/* Create Customer Modal */}
        <ui_1.FormModal isOpen={isCreateCustomerModalOpen} onClose={() => {
            setIsCreateCustomerModalOpen(false);
            resetCustomerForm();
        }} onSubmit={handleCreateCustomer} title="Create New Customer" submitText="Create Customer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Customer Name" placeholder="Enter customer name" value={customerFormData.customerName} onChange={(e) => setCustomerFormData({ ...customerFormData, customerName: e.target.value })} required/>
            <ui_1.Select label="Customer Type" options={customerTypeOptions} value={customerFormData.customerType} onChange={(value) => setCustomerFormData({ ...customerFormData, customerType: value })} required/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Email" type="email" placeholder="customer@company.com" value={customerFormData.email} onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}/>
            <ui_1.Input label="Phone" placeholder="+233-XXX-XXX-XXX" value={customerFormData.phone} onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Payment Terms" options={paymentTermsOptions} value={customerFormData.paymentTerms} onChange={(value) => setCustomerFormData({ ...customerFormData, paymentTerms: value })}/>
            <ui_1.Input label="Credit Limit (GHS)" type="number" placeholder="0.00" value={customerFormData.creditLimit} onChange={(e) => setCustomerFormData({ ...customerFormData, creditLimit: e.target.value })}/>
          </div>
        </ui_1.FormModal>

        {/* Create Invoice Modal */}
        <ui_1.FormModal isOpen={isCreateInvoiceModalOpen} onClose={() => {
            setIsCreateInvoiceModalOpen(false);
            resetInvoiceForm();
        }} onSubmit={handleCreateInvoice} title="Create AR Invoice" submitText="Create Invoice">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Customer" options={sampleCustomers.map(c => ({ value: c.id, label: c.customerName }))} value={invoiceFormData.customerId} onChange={(value) => setInvoiceFormData({ ...invoiceFormData, customerId: value })} required/>
            <ui_1.Input label="Invoice Date" type="date" value={invoiceFormData.invoiceDate} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Due Date" type="date" value={invoiceFormData.dueDate} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })} required/>
            <ui_1.Input label="Description" placeholder="Invoice description" value={invoiceFormData.description} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ui_1.Input label="Subtotal (GHS)" type="number" step="0.01" value={invoiceFormData.subtotal} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, subtotal: e.target.value })} required/>
            <ui_1.Input label="Tax Amount (GHS)" type="number" step="0.01" value={invoiceFormData.taxAmount} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxAmount: e.target.value })}/>
            <ui_1.Input label="Total Amount (GHS)" type="number" step="0.01" value={invoiceFormData.totalAmount} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, totalAmount: e.target.value })} required/>
          </div>
        </ui_1.FormModal>

        {/* Process Payment Modal */}
        <ui_1.FormModal isOpen={isProcessPaymentModalOpen} onClose={() => {
            setIsProcessPaymentModalOpen(false);
            resetPaymentForm();
        }} onSubmit={handleProcessPayment} title="Process Customer Payment" submitText="Process Payment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Customer" options={sampleCustomers.map(c => ({ value: c.id, label: c.customerName }))} value={paymentFormData.customerId} onChange={(value) => setPaymentFormData({ ...paymentFormData, customerId: value })} required/>
            <ui_1.Input label="Payment Date" type="date" value={paymentFormData.paymentDate} onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Payment Amount (GHS)" type="number" step="0.01" value={paymentFormData.paymentAmount} onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentAmount: e.target.value })} required/>
            <ui_1.Select label="Payment Method" options={paymentMethodOptions} value={paymentFormData.paymentMethod} onChange={(value) => setPaymentFormData({ ...paymentFormData, paymentMethod: value })} required/>
          </div>

          <ui_1.Input label="Reference Number" placeholder="Payment reference or transaction ID" value={paymentFormData.referenceNumber} onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}/>
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = AccountsReceivablePage;
//# sourceMappingURL=accounts-receivable.js.map