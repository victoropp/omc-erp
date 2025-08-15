import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Modal, Input, Select, Badge } from '@/components/ui';
import { DailyDeliveryForm, ApprovalWorkflowModal } from '@/components/forms';
import { DailyDeliveryTable } from '@/components/tables';
import { dailyDeliveryService } from '@/services/api';
import { DailyDelivery } from '@/types';
import { useDailyDeliveryWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'react-hot-toast';

interface DailyDeliveryForm {
  date: string;
  supplierCode: string;
  depotCode: string;
  customerName: string;
  location: string;
  psaNumber: string;
  wbillNumber: string;
  invoiceNumber: string;
  vehicleRegNumber: string;
  transporterCode: string;
  productType: 'petrol' | 'diesel' | 'kerosene' | 'lpg';
  productGrade: string;
  quantity: number;
  unitPrice: number;
  currency: 'GHS' | 'USD';
  notes: string;
}

const DailyDeliveryPage: NextPage = () => {
  const [deliveries, setDeliveries] = useState<DailyDelivery[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [depots, setDepots] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DailyDelivery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'approvals'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'supplier' | 'customer'>('supplier');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDelivery, setApprovalDelivery] = useState<DailyDelivery | null>(null);

  // WebSocket for real-time updates
  const { 
    isConnected: wsConnected, 
    lastMessage, 
    subscribeToAllDeliveries,
    subscribeToDelivery 
  } = useDailyDeliveryWebSocket();

  const [deliveryForm, setDeliveryForm] = useState<DailyDeliveryForm>({
    date: new Date().toISOString().split('T')[0],
    supplierCode: '',
    depotCode: '',
    customerName: '',
    location: '',
    psaNumber: '',
    wbillNumber: '',
    invoiceNumber: '',
    vehicleRegNumber: '',
    transporterCode: '',
    productType: 'petrol',
    productGrade: 'Premium',
    quantity: 0,
    unitPrice: 0,
    currency: 'GHS',
    notes: ''
  });

  const [metrics, setMetrics] = useState({
    totalDeliveries: 0,
    pendingApprovals: 0,
    completedDeliveries: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadData();
    // Subscribe to all deliveries for real-time updates
    if (wsConnected) {
      subscribeToAllDeliveries();
    }
  }, [wsConnected, subscribeToAllDeliveries]);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'delivery_status_update':
        case 'delivery_approved':
        case 'delivery_rejected':
        case 'invoice_generated':
          // Reload data when delivery status changes
          loadData();
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, suppliersData, depotsData, transportersData, metricsData] = await Promise.all([
        dailyDeliveryService.getDailyDeliveries({ date: filterDate }),
        dailyDeliveryService.getSuppliers(),
        dailyDeliveryService.getDepots(),
        dailyDeliveryService.getTransporters(),
        dailyDeliveryService.getDailyDeliveryMetrics()
      ]);
      
      setDeliveries(deliveriesData || generateMockDeliveryData());
      setSuppliers(suppliersData || generateMockSupplierData());
      setDepots(depotsData || generateMockDepotData());
      setTransporters(transportersData || generateMockTransporterData());
      setMetrics(metricsData || {
        totalDeliveries: deliveriesData?.length || 0,
        pendingApprovals: deliveriesData?.filter((d: any) => d.status === 'submitted').length || 0,
        completedDeliveries: deliveriesData?.filter((d: any) => d.status === 'completed').length || 0,
        totalValue: deliveriesData?.reduce((sum: number, d: any) => sum + (d.totalValue || 0), 0) || 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      setDeliveries(generateMockDeliveryData());
      setSuppliers(generateMockSupplierData());
      setDepots(generateMockDepotData());
      setTransporters(generateMockTransporterData());
      toast.error('Failed to load delivery data. Using sample data.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockDeliveryData = (): DailyDelivery[] => [
    {
      id: 'dd1',
      date: '2024-01-13',
      supplier: {
        code: 'SUP001',
        name: 'Tema Oil Refinery (TOR)',
        address: 'Tema Industrial Area, Ghana',
        contactPerson: 'Kwame Asante',
        phone: '+233-30-123-4567',
        email: 'supplies@tor.gov.gh'
      },
      depot: {
        code: 'DEP001',
        name: 'Tema Main Depot',
        location: 'Tema Port Area',
        capacity: 50000000
      },
      customerName: 'Shell Ghana Trading Company',
      location: 'Accra Central',
      psaNumber: 'PSA-2024-001',
      wbillNumber: 'WB-2024-001',
      invoiceNumber: 'INV-2024-001',
      vehicleRegNumber: 'GH-4567-23',
      transporter: {
        code: 'TRA001',
        name: 'Golden Transport Ltd',
        contactPerson: 'Akosua Mensa',
        phone: '+233-24-567-8901'
      },
      product: {
        type: 'petrol',
        grade: 'Premium',
        quantity: 25000,
        unit: 'liters'
      },
      unitPrice: 8.50,
      totalValue: 212500,
      currency: 'GHS',
      status: 'approved',
      approvalStatus: {
        level: 2,
        approvedBy: 'Jane Doe',
        approvedAt: '2024-01-13T08:30:00Z',
        comments: 'Approved - all compliance checks passed'
      },
      compliance: {
        npaCompliant: true,
        graCompliant: true,
        epaCompliant: true,
        localContentPercentage: 85
      },
      documents: {
        deliveryNote: true,
        qualityCertificate: true,
        invoiceGenerated: true,
        receiptNumber: 'RCP-2024-001'
      },
      timestamps: {
        createdAt: '2024-01-12T09:00:00Z',
        updatedAt: '2024-01-13T08:30:00Z',
        submittedAt: '2024-01-12T09:30:00Z',
        approvedAt: '2024-01-13T08:30:00Z'
      },
      createdBy: {
        id: 'user1',
        name: 'John Smith',
        department: 'Operations'
      },
      notes: 'Rush delivery for premium fuel shortage'
    },
    {
      id: 'dd2',
      date: '2024-01-13',
      supplier: {
        code: 'SUP002',
        name: 'Bulk Oil Storage Company',
        address: 'Kumasi Industrial Area',
        contactPerson: 'Yaw Boakye',
        phone: '+233-32-456-7890',
        email: 'orders@bost.com.gh'
      },
      depot: {
        code: 'DEP002',
        name: 'Kumasi Depot',
        location: 'Kumasi Industrial Zone',
        capacity: 30000000
      },
      customerName: 'Total Ghana',
      location: 'Kumasi North',
      psaNumber: 'PSA-2024-002',
      wbillNumber: 'WB-2024-002',
      invoiceNumber: 'INV-2024-002',
      vehicleRegNumber: 'AS-1234-24',
      transporter: {
        code: 'TRA002',
        name: 'Ashanti Logistics',
        contactPerson: 'Kofi Mensah',
        phone: '+233-32-789-0123'
      },
      product: {
        type: 'diesel',
        grade: 'Automotive Gas Oil',
        quantity: 30000,
        unit: 'liters'
      },
      unitPrice: 9.20,
      totalValue: 276000,
      currency: 'GHS',
      status: 'submitted',
      approvalStatus: {
        level: 1,
        comments: 'Pending level 2 approval'
      },
      compliance: {
        npaCompliant: true,
        graCompliant: false,
        epaCompliant: true,
        localContentPercentage: 78
      },
      documents: {
        deliveryNote: true,
        qualityCertificate: true,
        invoiceGenerated: false
      },
      timestamps: {
        createdAt: '2024-01-13T07:00:00Z',
        updatedAt: '2024-01-13T07:15:00Z',
        submittedAt: '2024-01-13T07:15:00Z'
      },
      createdBy: {
        id: 'user2',
        name: 'Mary Johnson',
        department: 'Supply Chain'
      },
      notes: 'Bulk delivery for northern regions'
    },
    {
      id: 'dd3',
      date: '2024-01-13',
      supplier: {
        code: 'SUP003',
        name: 'Sentuo Oil Refinery',
        address: 'Takoradi Port',
        contactPerson: 'Emmanuel Asiedu',
        phone: '+233-31-234-5678',
        email: 'logistics@sentuo.com'
      },
      depot: {
        code: 'DEP003',
        name: 'Takoradi Depot',
        location: 'Takoradi Port Area',
        capacity: 40000000
      },
      customerName: 'Goil Company Limited',
      location: 'Western Region',
      psaNumber: 'PSA-2024-003',
      wbillNumber: 'WB-2024-003',
      invoiceNumber: 'INV-2024-003',
      vehicleRegNumber: 'WR-7890-24',
      transporter: {
        code: 'TRA003',
        name: 'Western Transport Co.',
        contactPerson: 'Ama Serwaa',
        phone: '+233-31-345-6789'
      },
      product: {
        type: 'kerosene',
        grade: 'Household Kerosene',
        quantity: 15000,
        unit: 'liters'
      },
      unitPrice: 7.80,
      totalValue: 117000,
      currency: 'GHS',
      status: 'draft',
      approvalStatus: {
        level: 0,
        comments: 'Draft - pending submission'
      },
      compliance: {
        npaCompliant: false,
        graCompliant: false,
        epaCompliant: false,
        localContentPercentage: 65
      },
      documents: {
        deliveryNote: false,
        qualityCertificate: false,
        invoiceGenerated: false
      },
      timestamps: {
        createdAt: '2024-01-13T10:00:00Z',
        updatedAt: '2024-01-13T10:00:00Z'
      },
      createdBy: {
        id: 'user3',
        name: 'Peter Osei',
        department: 'Western Operations'
      },
      notes: 'Draft entry for kerosene distribution'
    }
  ];

  const generateMockSupplierData = () => [
    { code: 'SUP001', name: 'Tema Oil Refinery (TOR)' },
    { code: 'SUP002', name: 'Bulk Oil Storage Company' },
    { code: 'SUP003', name: 'Sentuo Oil Refinery' }
  ];

  const generateMockDepotData = () => [
    { code: 'DEP001', name: 'Tema Main Depot' },
    { code: 'DEP002', name: 'Kumasi Depot' },
    { code: 'DEP003', name: 'Takoradi Depot' }
  ];

  const generateMockTransporterData = () => [
    { code: 'TRA001', name: 'Golden Transport Ltd' },
    { code: 'TRA002', name: 'Ashanti Logistics' },
    { code: 'TRA003', name: 'Western Transport Co.' }
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.psaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.wbillNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    const matchesDate = filterDate === '' || delivery.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'success' : 'danger';
  };

  const handleCreateDelivery = () => {
    setIsEditMode(false);
    setDeliveryForm({
      date: new Date().toISOString().split('T')[0],
      supplierCode: '',
      depotCode: '',
      customerName: '',
      location: '',
      psaNumber: `PSA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      wbillNumber: `WB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      vehicleRegNumber: '',
      transporterCode: '',
      productType: 'petrol',
      productGrade: 'Premium',
      quantity: 0,
      unitPrice: 0,
      currency: 'GHS',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDelivery = async () => {
    try {
      // Calculate total value
      const totalValue = deliveryForm.quantity * deliveryForm.unitPrice;
      
      const deliveryData = {
        ...deliveryForm,
        totalValue
      };

      if (isEditMode && selectedDelivery) {
        await dailyDeliveryService.updateDailyDelivery(selectedDelivery.id, deliveryData);
        toast.success('Delivery updated successfully');
      } else {
        await dailyDeliveryService.createDailyDelivery(deliveryData);
        toast.success('Delivery created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save delivery:', error);
      toast.error('Failed to save delivery');
    }
  };

  const handleApproveDelivery = async (id: string, comments?: string) => {
    try {
      await dailyDeliveryService.approveDelivery(id, comments);
      toast.success('Delivery approved successfully');
      loadData();
    } catch (error) {
      console.error('Failed to approve delivery:', error);
      toast.error('Failed to approve delivery');
    }
  };

  const handleRejectDelivery = async (id: string, reason: string) => {
    try {
      await dailyDeliveryService.rejectDelivery(id, reason);
      toast.success('Delivery rejected');
      loadData();
    } catch (error) {
      console.error('Failed to reject delivery:', error);
      toast.error('Failed to reject delivery');
    }
  };

  const handleGenerateInvoice = async (deliveryId: string, type: 'supplier' | 'customer') => {
    try {
      const blob = type === 'supplier' 
        ? await dailyDeliveryService.generateSupplierInvoice(deliveryId)
        : await dailyDeliveryService.generateCustomerInvoice(deliveryId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-invoice-${deliveryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} invoice generated successfully`);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const handleBulkGenerateInvoices = async () => {
    if (selectedDeliveries.length === 0) {
      toast.error('Please select deliveries first');
      return;
    }

    try {
      const blob = await dailyDeliveryService.bulkGenerateInvoices(selectedDeliveries, invoiceType);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulk-${invoiceType}-invoices.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Bulk ${invoiceType} invoices generated successfully`);
      setShowInvoiceModal(false);
      setSelectedDeliveries([]);
    } catch (error) {
      console.error('Failed to generate bulk invoices:', error);
      toast.error('Failed to generate bulk invoices');
    }
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-display font-bold text-gradient">Daily Delivery Management</h1>
              {/* Real-time Connection Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                wsConnected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}></div>
                <span>{wsConnected ? 'Live Updates' : 'Disconnected'}</span>
              </div>
            </div>
            <p className="text-dark-400 mt-2">
              Comprehensive delivery tracking with Ghana compliance features
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setShowInvoiceModal(true)}
              disabled={selectedDeliveries.length === 0}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Invoices
            </Button>
            
            <Button variant="primary" onClick={handleCreateDelivery}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Delivery
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Deliveries</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalDeliveries}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Pending Approvals</p>
                  <p className="text-2xl font-bold text-white">{metrics.pendingApprovals}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Completed</p>
                  <p className="text-2xl font-bold text-white">{metrics.completedDeliveries}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    GHS {metrics.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'list', label: 'Delivery List' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'approvals', label: 'Approvals' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by PSA, Customer, Supplier, Invoice, or W/Bill Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'completed', label: 'Completed' }
                ]}
                className="w-full md:w-48"
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white w-full md:w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Deliveries Table */}
        <Card>
          <CardHeader title="Daily Deliveries" />
          <CardContent>
            <DailyDeliveryTable
              deliveries={filteredDeliveries}
              selectedDeliveries={selectedDeliveries}
              onSelectionChange={setSelectedDeliveries}
              onEdit={(delivery) => {
                setSelectedDelivery(delivery);
                setIsEditMode(true);
                setIsModalOpen(true);
              }}
              onApprove={(id: string) => {
                const delivery = deliveries.find(d => d.id === id);
                if (delivery) {
                  setApprovalDelivery(delivery);
                  setShowApprovalModal(true);
                }
              }}
              onReject={(id: string, reason: string) => {
                handleRejectDelivery(id, reason);
              }}
              onGenerateInvoice={handleGenerateInvoice}
              onSubmitApproval={async (id: string) => {
                try {
                  await dailyDeliveryService.submitForApproval(id);
                  toast.success('Delivery submitted for approval');
                  loadData();
                } catch (error) {
                  console.error('Failed to submit for approval:', error);
                  toast.error('Failed to submit for approval');
                }
              }}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Daily Delivery Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditMode ? 'Edit Daily Delivery' : 'Create New Daily Delivery'}
          size="xl"
        >
          <DailyDeliveryForm
            initialData={selectedDelivery ? {
              date: selectedDelivery.date,
              supplierCode: selectedDelivery.supplier.code,
              depotCode: selectedDelivery.depot.code,
              customerName: selectedDelivery.customerName,
              location: selectedDelivery.location,
              psaNumber: selectedDelivery.psaNumber,
              wbillNumber: selectedDelivery.wbillNumber,
              invoiceNumber: selectedDelivery.invoiceNumber,
              vehicleRegNumber: selectedDelivery.vehicleRegNumber,
              transporterCode: selectedDelivery.transporter.code,
              productType: selectedDelivery.product.type,
              productGrade: selectedDelivery.product.grade,
              quantity: selectedDelivery.product.quantity,
              unitPrice: selectedDelivery.unitPrice,
              currency: selectedDelivery.currency,
              notes: selectedDelivery.notes || ''
            } : undefined}
            onSave={handleSaveDelivery}
            onCancel={() => setIsModalOpen(false)}
            isEditMode={isEditMode}
          />
        </Modal>

        {/* Invoice Generation Modal */}
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="Generate Bulk Invoices"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Invoice Type</label>
              <Select
                value={invoiceType}
                onChange={(value) => setInvoiceType(value as 'supplier' | 'customer')}
                options={[
                  { value: 'supplier', label: 'Supplier Invoices' },
                  { value: 'customer', label: 'Customer Invoices' }
                ]}
              />
            </div>

            <div>
              <h3 className="font-medium text-white mb-4">
                Selected Deliveries ({selectedDeliveries.length})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {deliveries.filter(d => selectedDeliveries.includes(d.id)).map(delivery => (
                  <div key={delivery.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{delivery.psaNumber}</p>
                      <p className="text-sm text-dark-400">{delivery.customerName}</p>
                    </div>
                    <p className="text-green-400">
                      {delivery.currency} {delivery.totalValue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <Button
                variant="outline"
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkGenerateInvoices}
              >
                Generate Invoices
              </Button>
            </div>
          </div>
        </Modal>

        {/* Approval Workflow Modal */}
        <ApprovalWorkflowModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setApprovalDelivery(null);
          }}
          delivery={approvalDelivery}
          onApproval={async (deliveryId: string, approved: boolean, comments?: string) => {
            try {
              if (approved) {
                await handleApproveDelivery(deliveryId, comments);
              } else {
                await handleRejectDelivery(deliveryId, comments || 'Rejected without reason');
              }
              setShowApprovalModal(false);
              setApprovalDelivery(null);
            } catch (error) {
              console.error('Failed to process approval:', error);
              toast.error('Failed to process approval');
            }
          }}
        />
      </div>
    </FuturisticDashboardLayout>
  );
};

export default DailyDeliveryPage;