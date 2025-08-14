import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, Modal, FormModal, Input, Select } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  customerNumber: string;
  customerName: string;
  customerType: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  status: string;
  paymentTerms: string;
  currency: string;
  riskCategory: string;
  daysSalesOutstanding: number;
  lastPaymentDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ARInvoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  outstandingAmount: number;
  status: string;
  currency: string;
  description: string;
  daysPastDue: number;
}

interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  paymentNumber: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  currency: string;
}

interface ARSummary {
  totalOutstanding: number;
  currentAmount: number;
  overdueAmount: number;
  customerCount: number;
  avgCollectionDays: number;
}

interface CollectionsData {
  period: string;
  amount: number;
  invoiceCount: number;
  percentage: number;
}

const AccountsReceivablePage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'invoices' | 'payments' | 'reports'>('dashboard');
  const [summary, setSummary] = useState<ARSummary | null>(null);
  const [collectionsData, setCollectionsData] = useState<CollectionsData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<ARInvoice[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isProcessPaymentModalOpen, setIsProcessPaymentModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ARInvoice | null>(null);
  const [filters, setFilters] = useState({
    customer: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: ''
  });

  const [customerFormData, setCustomerFormData] = useState({
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

  const [invoiceFormData, setInvoiceFormData] = useState({
    customerId: '',
    invoiceDate: '',
    dueDate: '',
    description: '',
    subtotal: '',
    taxAmount: '',
    totalAmount: '',
    lines: [{ description: '', quantity: 1, unitPrice: '', accountCode: '4000' }],
  });

  const [paymentFormData, setPaymentFormData] = useState({
    customerId: '',
    paymentDate: '',
    paymentAmount: '',
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    bankAccount: '',
    invoiceAllocations: [] as Array<{ invoiceId: string; allocationAmount: string }>,
  });

  useEffect(() => {
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
          setInvoices(sampleInvoices.filter(inv => 
            (!filters.customer || inv.customerName.toLowerCase().includes(filters.customer.toLowerCase())) &&
            (!filters.status || inv.status === filters.status)
          ));
          break;
        case 'payments':
          // const paymentData = await financialService.getCustomerPayments();
          setPayments(samplePayments);
          break;
        case 'reports':
          // Load reports data
          break;
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createCustomer(customerFormData);
      toast.success('Customer created successfully');
      setIsCreateCustomerModalOpen(false);
      resetCustomerForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createARInvoice(invoiceFormData);
      toast.success('Invoice created successfully');
      setIsCreateInvoiceModalOpen(false);
      resetInvoiceForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.processCustomerPayment(paymentFormData);
      toast.success('Payment processed successfully');
      setIsProcessPaymentModalOpen(false);
      resetPaymentForm();
      loadData();
    } catch (error) {
      toast.error('Failed to process payment');
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
    { key: 'customerNumber' as keyof Customer, header: 'Customer #', width: '12%', sortable: true },
    { key: 'customerName' as keyof Customer, header: 'Customer Name', width: '18%', sortable: true },
    { key: 'customerType' as keyof Customer, header: 'Type', width: '12%', sortable: true },
    { key: 'currentBalance' as keyof Customer, header: 'Balance', width: '12%', sortable: true,
      render: (value: number, row: Customer) => (
        <span className={`font-medium ${value > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(Math.abs(value))}
        </span>
      )
    },
    { key: 'availableCredit' as keyof Customer, header: 'Available Credit', width: '12%', sortable: true,
      render: (value: number, row: Customer) => (
        <span className="font-medium text-blue-400">
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'riskCategory' as keyof Customer, header: 'Risk', width: '8%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'LOW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          value === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'daysSalesOutstanding' as keyof Customer, header: 'DSO', width: '8%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${value > 60 ? 'text-red-400' : value > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
          {value} days
        </span>
      )
    },
    { key: 'status' as keyof Customer, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof Customer, header: 'Actions', width: '8%',
      render: (value: string, row: Customer) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const invoiceColumns = [
    { key: 'invoiceNumber' as keyof ARInvoice, header: 'Invoice #', width: '15%', sortable: true },
    { key: 'customerName' as keyof ARInvoice, header: 'Customer', width: '20%', sortable: true },
    { key: 'invoiceDate' as keyof ARInvoice, header: 'Invoice Date', width: '12%', sortable: true },
    { key: 'dueDate' as keyof ARInvoice, header: 'Due Date', width: '12%', sortable: true },
    { key: 'totalAmount' as keyof ARInvoice, header: 'Amount', width: '12%', sortable: true,
      render: (value: number, row: ARInvoice) => (
        <span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'outstandingAmount' as keyof ARInvoice, header: 'Outstanding', width: '12%', sortable: true,
      render: (value: number, row: ARInvoice) => (
        <span className={`font-medium ${value > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'daysPastDue' as keyof ARInvoice, header: 'Days Past Due', width: '10%', sortable: true,
      render: (value: number) => (
        <span className={`font-medium ${
          value === 0 ? 'text-green-400' :
          value <= 30 ? 'text-yellow-400' :
          value <= 60 ? 'text-orange-400' :
          'text-red-400'
        }`}>
          {value > 0 ? `${value} days` : 'Current'}
        </span>
      )
    },
    { key: 'status' as keyof ARInvoice, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'POSTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof ARInvoice, header: 'Actions', width: '7%',
      render: (value: string, row: ARInvoice) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">View</Button>
          <Button variant="ghost" size="sm">Collect</Button>
        </div>
      )
    },
  ];

  // Sample data for demonstration
  const sampleCustomers: Customer[] = [
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

  const sampleInvoices: ARInvoice[] = [
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

  const samplePayments: CustomerPayment[] = [
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
  const sampleARSummary: ARSummary = {
    totalOutstanding: 27000000,
    currentAmount: 15000000,
    overdueAmount: 12000000,
    customerCount: 3,
    avgCollectionDays: 39
  };

  const sampleCollectionsData: CollectionsData[] = [
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
              Accounts Receivable
            </h1>
            <p className="text-dark-400 mt-2">
              Manage customers, invoices, and payment collections
            </p>
          </div>
          <div className="flex space-x-4">
            {activeTab !== 'dashboard' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (activeTab === 'customers') setIsCreateCustomerModalOpen(true);
                  if (activeTab === 'invoices') setIsCreateInvoiceModalOpen(true);
                  if (activeTab === 'payments') setIsProcessPaymentModalOpen(true);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {activeTab === 'customers' && 'New Customer'}
                {activeTab === 'invoices' && 'New Invoice'}
                {activeTab === 'payments' && 'Process Payment'}
                {activeTab === 'reports' && 'Generate Report'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Summary Cards - shown only on dashboard */}
        {activeTab === 'dashboard' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Total Outstanding</h3>
                <p className="text-2xl font-bold text-red-400 mb-1">
                  GHS {(summary.totalOutstanding / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-red-400">↑ 12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Current (0-30 days)</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">
                  GHS {(summary.currentAmount / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">55.6% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Overdue (30+ days)</h3>
                <p className="text-2xl font-bold text-yellow-400 mb-1">
                  GHS {(summary.overdueAmount / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-dark-400">44.4% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-dark-400 mb-2">Average DSO</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">{summary.avgCollectionDays} days</p>
                <p className="text-sm text-green-400">↓ 5 days improved</p>
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

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'customers' && (
            <Card>
              <CardHeader title="Customer Management" />
              <CardContent>
                <Table
                  data={sampleCustomers}
                  columns={customerColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: sampleCustomers.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'invoices' && (
            <Card>
              <CardHeader title="Invoice Management" />
              <CardContent>
                <Table
                  data={sampleInvoices}
                  columns={invoiceColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: sampleInvoices.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card>
              <CardHeader title="Payment Processing" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Payment Collection</h3>
                  <p className="text-dark-400 mb-6">
                    Payment processing interface will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="AR Aging Report" />
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Aging analysis by customer</p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Collections Dashboard" />
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Collection performance metrics</p>
                    <Button variant="outline" size="sm">View Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Create Customer Modal */}
        <FormModal
          isOpen={isCreateCustomerModalOpen}
          onClose={() => {
            setIsCreateCustomerModalOpen(false);
            resetCustomerForm();
          }}
          onSubmit={handleCreateCustomer}
          title="Create New Customer"
          submitText="Create Customer"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={customerFormData.customerName}
              onChange={(e) => setCustomerFormData({ ...customerFormData, customerName: e.target.value })}
              required
            />
            <Select
              label="Customer Type"
              options={customerTypeOptions}
              value={customerFormData.customerType}
              onChange={(value) => setCustomerFormData({ ...customerFormData, customerType: value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="customer@company.com"
              value={customerFormData.email}
              onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+233-XXX-XXX-XXX"
              value={customerFormData.phone}
              onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Payment Terms"
              options={paymentTermsOptions}
              value={customerFormData.paymentTerms}
              onChange={(value) => setCustomerFormData({ ...customerFormData, paymentTerms: value })}
            />
            <Input
              label="Credit Limit (GHS)"
              type="number"
              placeholder="0.00"
              value={customerFormData.creditLimit}
              onChange={(e) => setCustomerFormData({ ...customerFormData, creditLimit: e.target.value })}
            />
          </div>
        </FormModal>

        {/* Create Invoice Modal */}
        <FormModal
          isOpen={isCreateInvoiceModalOpen}
          onClose={() => {
            setIsCreateInvoiceModalOpen(false);
            resetInvoiceForm();
          }}
          onSubmit={handleCreateInvoice}
          title="Create AR Invoice"
          submitText="Create Invoice"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer"
              options={sampleCustomers.map(c => ({ value: c.id, label: c.customerName }))}
              value={invoiceFormData.customerId}
              onChange={(value) => setInvoiceFormData({ ...invoiceFormData, customerId: value })}
              required
            />
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceFormData.invoiceDate}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={invoiceFormData.dueDate}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
              required
            />
            <Input
              label="Description"
              placeholder="Invoice description"
              value={invoiceFormData.description}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Subtotal (GHS)"
              type="number"
              step="0.01"
              value={invoiceFormData.subtotal}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, subtotal: e.target.value })}
              required
            />
            <Input
              label="Tax Amount (GHS)"
              type="number"
              step="0.01"
              value={invoiceFormData.taxAmount}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxAmount: e.target.value })}
            />
            <Input
              label="Total Amount (GHS)"
              type="number"
              step="0.01"
              value={invoiceFormData.totalAmount}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, totalAmount: e.target.value })}
              required
            />
          </div>
        </FormModal>

        {/* Process Payment Modal */}
        <FormModal
          isOpen={isProcessPaymentModalOpen}
          onClose={() => {
            setIsProcessPaymentModalOpen(false);
            resetPaymentForm();
          }}
          onSubmit={handleProcessPayment}
          title="Process Customer Payment"
          submitText="Process Payment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer"
              options={sampleCustomers.map(c => ({ value: c.id, label: c.customerName }))}
              value={paymentFormData.customerId}
              onChange={(value) => setPaymentFormData({ ...paymentFormData, customerId: value })}
              required
            />
            <Input
              label="Payment Date"
              type="date"
              value={paymentFormData.paymentDate}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Payment Amount (GHS)"
              type="number"
              step="0.01"
              value={paymentFormData.paymentAmount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentAmount: e.target.value })}
              required
            />
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={paymentFormData.paymentMethod}
              onChange={(value) => setPaymentFormData({ ...paymentFormData, paymentMethod: value })}
              required
            />
          </div>

          <Input
            label="Reference Number"
            placeholder="Payment reference or transaction ID"
            value={paymentFormData.referenceNumber}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
          />
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default AccountsReceivablePage;