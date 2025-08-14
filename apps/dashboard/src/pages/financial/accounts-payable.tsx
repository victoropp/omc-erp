import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, Modal, FormModal, Input, Select } from '@/components/ui';
import { financialService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Vendor {
  id: string;
  vendorNumber: string;
  vendorName: string;
  vendorType: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: string;
  paymentTerms: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface APInvoice {
  id: string;
  vendorId: string;
  vendorName: string;
  internalInvoiceNumber: string;
  vendorInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  outstandingAmount: number;
  status: string;
  currency: string;
  description: string;
}

interface PaymentRun {
  id: string;
  paymentRunNumber: string;
  paymentDate: string;
  paymentMethod: string;
  totalAmount: number;
  invoiceCount: number;
  status: string;
  description: string;
  bankAccount?: string;
  approvedBy?: string;
  processedAt?: string;
}

interface APSummary {
  totalOutstanding: number;
  currentAmount: number;
  overdueAmount: number;
  vendorCount: number;
  avgPaymentDays: number;
}

interface AgingBucket {
  period: string;
  amount: number;
  invoiceCount: number;
  percentage: number;
}

const AccountsPayablePage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vendors' | 'invoices' | 'payments' | 'reports'>('dashboard');
  const [summary, setSummary] = useState<APSummary | null>(null);
  const [agingData, setAgingData] = useState<AgingBucket[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<APInvoice[]>([]);
  const [paymentRuns, setPaymentRuns] = useState<PaymentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateVendorModalOpen, setIsCreateVendorModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isCreatePaymentRunModalOpen, setIsCreatePaymentRunModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<APInvoice | null>(null);
  const [filters, setFilters] = useState({
    vendor: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: ''
  });

  const [vendorFormData, setVendorFormData] = useState({
    vendorName: '',
    vendorType: 'FUEL_SUPPLIER',
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
    vendorId: '',
    vendorInvoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    description: '',
    subtotal: '',
    taxAmount: '',
    totalAmount: '',
    lines: [{ description: '', quantity: 1, unitPrice: '', accountCode: '5000' }],
  });

  const [paymentRunFormData, setPaymentRunFormData] = useState({
    paymentDate: '',
    paymentMethod: 'BANK_TRANSFER',
    bankAccountId: '',
    description: '',
    maxPaymentAmount: '',
    vendorIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'dashboard':
          // const dashboardData = await financialService.getAPDashboard();
          setSummary(sampleSummary);
          setAgingData(sampleAgingData);
          break;
        case 'vendors':
          // const vendorData = await financialService.getVendors();
          setVendors(sampleVendors);
          break;
        case 'invoices':
          // const invoiceData = await financialService.getAPInvoices(filters);
          setInvoices(sampleInvoices.filter(inv => 
            (!filters.vendor || inv.vendorName.toLowerCase().includes(filters.vendor.toLowerCase())) &&
            (!filters.status || inv.status === filters.status)
          ));
          break;
        case 'payments':
          // const paymentData = await financialService.getPaymentRuns();
          setPaymentRuns(samplePaymentRuns);
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

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createVendor(vendorFormData);
      toast.success('Vendor created successfully');
      setIsCreateVendorModalOpen(false);
      resetVendorForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create vendor');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createAPInvoice(invoiceFormData);
      toast.success('Invoice created successfully');
      setIsCreateInvoiceModalOpen(false);
      resetInvoiceForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleCreatePaymentRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await financialService.createPaymentRun(paymentRunFormData);
      toast.success('Payment run created successfully');
      setIsCreatePaymentRunModalOpen(false);
      resetPaymentRunForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create payment run');
    }
  };

  const resetVendorForm = () => {
    setVendorFormData({
      vendorName: '',
      vendorType: 'FUEL_SUPPLIER',
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
      vendorId: '',
      vendorInvoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      description: '',
      subtotal: '',
      taxAmount: '',
      totalAmount: '',
      lines: [{ description: '', quantity: 1, unitPrice: '', accountCode: '5000' }],
    });
  };

  const resetPaymentRunForm = () => {
    setPaymentRunFormData({
      paymentDate: '',
      paymentMethod: 'BANK_TRANSFER',
      bankAccountId: '',
      description: '',
      maxPaymentAmount: '',
      vendorIds: [],
    });
  };

  const vendorTypeOptions = [
    { value: 'FUEL_SUPPLIER', label: 'Fuel Supplier' },
    { value: 'EQUIPMENT_SUPPLIER', label: 'Equipment Supplier' },
    { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'UTILITY_PROVIDER', label: 'Utility Provider' },
    { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
    { value: 'OTHER', label: 'Other' },
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
  ];

  const vendorColumns = [
    { key: 'vendorNumber' as keyof Vendor, header: 'Vendor #', width: '12%', sortable: true },
    { key: 'vendorName' as keyof Vendor, header: 'Vendor Name', width: '20%', sortable: true },
    { key: 'vendorType' as keyof Vendor, header: 'Type', width: '15%', sortable: true },
    { key: 'email' as keyof Vendor, header: 'Email', width: '18%', sortable: true },
    { key: 'currentBalance' as keyof Vendor, header: 'Balance', width: '12%', sortable: true,
      render: (value: number, row: Vendor) => (
        <span className={`font-medium ${value > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(Math.abs(value))}
        </span>
      )
    },
    { key: 'status' as keyof Vendor, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'PENDING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof Vendor, header: 'Actions', width: '13%',
      render: (value: string, row: Vendor) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      )
    },
  ];

  const invoiceColumns = [
    { key: 'internalInvoiceNumber' as keyof APInvoice, header: 'Invoice #', width: '15%', sortable: true },
    { key: 'vendorName' as keyof APInvoice, header: 'Vendor', width: '20%', sortable: true },
    { key: 'vendorInvoiceNumber' as keyof APInvoice, header: 'Vendor Ref', width: '15%', sortable: true },
    { key: 'invoiceDate' as keyof APInvoice, header: 'Invoice Date', width: '12%', sortable: true },
    { key: 'dueDate' as keyof APInvoice, header: 'Due Date', width: '12%', sortable: true },
    { key: 'totalAmount' as keyof APInvoice, header: 'Amount', width: '12%', sortable: true,
      render: (value: number, row: APInvoice) => (
        <span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'status' as keyof APInvoice, header: 'Status', width: '10%',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'POSTED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          value === 'PENDING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'id' as keyof APInvoice, header: 'Actions', width: '4%',
      render: (value: string, row: APInvoice) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedInvoice(row);
              setIsViewInvoiceModalOpen(true);
            }}
          >
            View
          </Button>
          <Button variant="ghost" size="sm">Pay</Button>
        </div>
      )
    },
  ];

  // Sample data for demonstration
  const sampleVendors: Vendor[] = [
    {
      id: '1',
      vendorNumber: 'FS000001',
      vendorName: 'Tema Oil Refinery',
      vendorType: 'FUEL_SUPPLIER',
      email: 'accounts@tor.com.gh',
      phone: '+233-303-202-000',
      creditLimit: 50000000,
      currentBalance: 2500000,
      status: 'ACTIVE',
      paymentTerms: 'NET_30',
      currency: 'GHS',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      vendorNumber: 'ES000001',
      vendorName: 'Schlumberger Ghana Ltd',
      vendorType: 'EQUIPMENT_SUPPLIER',
      email: 'finance@slb.com',
      phone: '+233-302-123-456',
      creditLimit: 15000000,
      currentBalance: 850000,
      status: 'ACTIVE',
      paymentTerms: 'NET_60',
      currency: 'GHS',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
  ];

  const sampleInvoices: APInvoice[] = [
    {
      id: '1',
      vendorId: '1',
      vendorName: 'Tema Oil Refinery',
      internalInvoiceNumber: 'APINV-202401-000001',
      vendorInvoiceNumber: 'TOR-2024-0145',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-14',
      totalAmount: 2500000,
      outstandingAmount: 2500000,
      status: 'POSTED',
      currency: 'GHS',
      description: 'Premium Motor Spirit - January 2024',
    },
    {
      id: '2',
      vendorId: '2',
      vendorName: 'Schlumberger Ghana Ltd',
      internalInvoiceNumber: 'APINV-202401-000002',
      vendorInvoiceNumber: 'SLB-GH-2024-0089',
      invoiceDate: '2024-01-20',
      dueDate: '2024-03-20',
      totalAmount: 850000,
      outstandingAmount: 850000,
      status: 'PENDING_APPROVAL',
      currency: 'GHS',
      description: 'Tank Monitoring System Maintenance',
    },
  ];

  const samplePaymentRuns: PaymentRun[] = [
    {
      id: '1',
      paymentRunNumber: 'PR-202401-0001',
      paymentDate: '2024-02-14',
      paymentMethod: 'BANK_TRANSFER',
      totalAmount: 2500000,
      invoiceCount: 1,
      status: 'EXECUTED',
      description: 'Weekly Payment Run - Week 7',
    },
  ];

  // Sample data for dashboard
  const sampleSummary: APSummary = {
    totalOutstanding: 3350000,
    currentAmount: 2500000,
    overdueAmount: 850000,
    vendorCount: 2,
    avgPaymentDays: 32
  };

  const sampleAgingData: AgingBucket[] = [
    { period: 'Current (0-30 days)', amount: 2500000, invoiceCount: 1, percentage: 74.6 },
    { period: '31-60 days', amount: 850000, invoiceCount: 1, percentage: 25.4 },
    { period: '61-90 days', amount: 0, invoiceCount: 0, percentage: 0 },
    { period: '90+ days', amount: 0, invoiceCount: 0, percentage: 0 },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'vendors', label: 'Vendors', icon: 'M17 20h5v-2a2 2 0 00-2-2h-3v4zM9 12h6v-2H9v2zm-4 8h5v-4H5v4zM9 4h6V2H9v2z' },
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
              Accounts Payable
            </h1>
            <p className="text-dark-400 mt-2">
              Manage vendors, invoices, and payment processes
            </p>
          </div>
          <div className="flex space-x-4">
            {activeTab !== 'dashboard' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (activeTab === 'vendors') setIsCreateVendorModalOpen(true);
                  if (activeTab === 'invoices') setIsCreateInvoiceModalOpen(true);
                  if (activeTab === 'payments') setIsCreatePaymentRunModalOpen(true);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {activeTab === 'vendors' && 'New Vendor'}
                {activeTab === 'invoices' && 'New Invoice'}
                {activeTab === 'payments' && 'New Payment Run'}
                {activeTab === 'reports' && 'Generate Report'}
              </Button>
            )}
          </div>
        </motion.div>

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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* AP Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Total Outstanding</h3>
                      <p className="text-2xl font-bold text-red-400 mb-1">
                        GHS {(summary.totalOutstanding / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-red-400">↑ 5% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Current (0-30)</h3>
                      <p className="text-2xl font-bold text-green-400 mb-1">
                        GHS {(summary.currentAmount / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-dark-400">74.6% of total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Overdue</h3>
                      <p className="text-2xl font-bold text-yellow-400 mb-1">
                        GHS {(summary.overdueAmount / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-dark-400">25.4% of total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Active Vendors</h3>
                      <p className="text-2xl font-bold text-blue-400 mb-1">{summary.vendorCount}</p>
                      <p className="text-sm text-green-400">All in good standing</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Avg Payment Days</h3>
                      <p className="text-2xl font-bold text-white mb-1">{summary.avgPaymentDays}</p>
                      <p className="text-sm text-green-400">↓ 3 days improved</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Aging Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="AP Aging Analysis" />
                  <CardContent>
                    <div className="space-y-4">
                      {agingData.map((bucket, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{bucket.period}</p>
                            <p className="text-dark-400 text-sm">{bucket.invoiceCount} invoices</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              GHS {new Intl.NumberFormat('en-US').format(bucket.amount)}
                            </p>
                            <p className="text-dark-400 text-sm">{bucket.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Recent Activities" />
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-dark-800/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div>
                          <p className="text-white text-sm">Invoice APINV-202401-000001 approved</p>
                          <p className="text-dark-400 text-xs">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-dark-800/30 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <p className="text-white text-sm">Payment run PR-202401-0001 executed</p>
                          <p className="text-dark-400 text-xs">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-dark-800/30 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div>
                          <p className="text-white text-sm">New vendor Schlumberger Ghana added</p>
                          <p className="text-dark-400 text-xs">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="p-6 h-auto flex flex-col items-center space-y-2"
                      onClick={() => setActiveTab('invoices')}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z" />
                      </svg>
                      <span>View All Invoices</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="p-6 h-auto flex flex-col items-center space-y-2"
                      onClick={() => setIsCreatePaymentRunModalOpen(true)}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0-8h18v2H3V6z" />
                      </svg>
                      <span>Create Payment Run</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="p-6 h-auto flex flex-col items-center space-y-2"
                      onClick={() => setActiveTab('vendors')}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a2 2 0 00-2-2h-3v4zM9 12h6v-2H9v2zm-4 8h5v-4H5v4zM9 4h6V2H9v2z" />
                      </svg>
                      <span>Manage Vendors</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="p-6 h-auto flex flex-col items-center space-y-2"
                      onClick={() => setActiveTab('reports')}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                      </svg>
                      <span>Generate Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'vendors' && (
            <Card>
              <CardHeader title="Vendor Management" />
              <CardContent>
                <Table
                  data={sampleVendors}
                  columns={vendorColumns}
                  loading={loading}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: sampleVendors.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader title="Filter Invoices" />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Input
                      label="Vendor"
                      placeholder="Search vendor"
                      value={filters.vendor}
                      onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                    />
                    <Select
                      label="Status"
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                        { value: 'POSTED', label: 'Posted' },
                        { value: 'PAID', label: 'Paid' },
                      ]}
                      value={filters.status}
                      onChange={(value) => setFilters({ ...filters, status: value })}
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

              <Card>
                <CardHeader title="Invoice Management" />
                <CardContent>
                  <Table
                    data={invoices}
                    columns={invoiceColumns}
                    loading={loading}
                    pagination={{
                      page: 1,
                      limit: 10,
                      total: invoices.length,
                      onPageChange: () => {},
                      onLimitChange: () => {},
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <Card>
              <CardHeader title="Payment Runs" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Payment Management</h3>
                  <p className="text-dark-400 mb-6">
                    Payment run interface will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="AP Aging Report" />
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Aging analysis by vendor</p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Cash Flow Forecast" />
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Projected cash outflows</p>
                    <Button variant="outline" size="sm">Generate Forecast</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Create Vendor Modal */}
        <FormModal
          isOpen={isCreateVendorModalOpen}
          onClose={() => {
            setIsCreateVendorModalOpen(false);
            resetVendorForm();
          }}
          onSubmit={handleCreateVendor}
          title="Create New Vendor"
          submitText="Create Vendor"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vendor Name"
              placeholder="Enter vendor name"
              value={vendorFormData.vendorName}
              onChange={(e) => setVendorFormData({ ...vendorFormData, vendorName: e.target.value })}
              required
            />
            <Select
              label="Vendor Type"
              options={vendorTypeOptions}
              value={vendorFormData.vendorType}
              onChange={(value) => setVendorFormData({ ...vendorFormData, vendorType: value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="vendor@company.com"
              value={vendorFormData.email}
              onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+233-XXX-XXX-XXX"
              value={vendorFormData.phone}
              onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Payment Terms"
              options={paymentTermsOptions}
              value={vendorFormData.paymentTerms}
              onChange={(value) => setVendorFormData({ ...vendorFormData, paymentTerms: value })}
            />
            <Input
              label="Credit Limit (GHS)"
              type="number"
              placeholder="0.00"
              value={vendorFormData.creditLimit}
              onChange={(e) => setVendorFormData({ ...vendorFormData, creditLimit: e.target.value })}
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
          title="Create AP Invoice"
          submitText="Create Invoice"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Vendor"
              options={sampleVendors.map(v => ({ value: v.id, label: v.vendorName }))}
              value={invoiceFormData.vendorId}
              onChange={(value) => setInvoiceFormData({ ...invoiceFormData, vendorId: value })}
              required
            />
            <Input
              label="Vendor Invoice Number"
              placeholder="Enter vendor's invoice number"
              value={invoiceFormData.vendorInvoiceNumber}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, vendorInvoiceNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceFormData.invoiceDate}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={invoiceFormData.dueDate}
              onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="Invoice description"
            value={invoiceFormData.description}
            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
            required
          />

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

        {/* Create Payment Run Modal */}
        <FormModal
          isOpen={isCreatePaymentRunModalOpen}
          onClose={() => {
            setIsCreatePaymentRunModalOpen(false);
            resetPaymentRunForm();
          }}
          onSubmit={handleCreatePaymentRun}
          title="Create Payment Run"
          submitText="Create Payment Run"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Payment Date"
              type="date"
              value={paymentRunFormData.paymentDate}
              onChange={(e) => setPaymentRunFormData({ ...paymentRunFormData, paymentDate: e.target.value })}
              required
            />
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={paymentRunFormData.paymentMethod}
              onChange={(value) => setPaymentRunFormData({ ...paymentRunFormData, paymentMethod: value })}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="Payment run description"
            value={paymentRunFormData.description}
            onChange={(e) => setPaymentRunFormData({ ...paymentRunFormData, description: e.target.value })}
            required
          />

          <Input
            label="Maximum Payment Amount (GHS)"
            type="number"
            step="0.01"
            placeholder="Leave blank for unlimited"
            value={paymentRunFormData.maxPaymentAmount}
            onChange={(e) => setPaymentRunFormData({ ...paymentRunFormData, maxPaymentAmount: e.target.value })}
          />
        </FormModal>

        {/* View Invoice Modal */}
        <FormModal
          isOpen={isViewInvoiceModalOpen}
          onClose={() => setIsViewInvoiceModalOpen(false)}
          title="Invoice Details"
          showSubmit={false}
          size="large"
        >
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Invoice Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Invoice Number:</dt>
                      <dd className="text-white font-medium">{selectedInvoice.internalInvoiceNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Vendor Reference:</dt>
                      <dd className="text-white">{selectedInvoice.vendorInvoiceNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Vendor:</dt>
                      <dd className="text-white">{selectedInvoice.vendorName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Invoice Date:</dt>
                      <dd className="text-white">{selectedInvoice.invoiceDate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Due Date:</dt>
                      <dd className="text-white">{selectedInvoice.dueDate}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Amounts</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Total Amount:</dt>
                      <dd className="text-white font-medium">
                        {selectedInvoice.currency} {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                        }).format(selectedInvoice.totalAmount)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Outstanding:</dt>
                      <dd className="text-red-400 font-medium">
                        {selectedInvoice.currency} {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                        }).format(selectedInvoice.outstandingAmount)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Status:</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          selectedInvoice.status === 'POSTED' ? 'bg-green-500/20 text-green-400' :
                          selectedInvoice.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedInvoice.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Invoice Description */}
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Description</h4>
                <p className="text-dark-300 bg-dark-800/30 p-3 rounded-lg border border-dark-600">
                  {selectedInvoice.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" size="sm">
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  Edit Invoice
                </Button>
                {selectedInvoice.status === 'POSTED' && (
                  <Button variant="primary" size="sm">
                    Process Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default AccountsPayablePage;