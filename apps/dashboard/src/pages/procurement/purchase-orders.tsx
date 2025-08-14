import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Table, Modal, FormModal, Input, Select, Badge } from '@/components/ui';
import { procurementService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  totalAmount: number;
  currency: string;
  requestedBy: string;
  department: string;
  approvedBy?: string;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

interface POLine {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unit: string;
  category: string;
  specifications?: string;
}

interface POSummary {
  totalPOs: number;
  pendingApproval: number;
  approved: number;
  totalValue: number;
  avgProcessingTime: number;
  overdueDeliveries: number;
}

const PurchaseOrdersPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'tracking' | 'suppliers'>('dashboard');
  const [summary, setSummary] = useState<POSummary | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [poLines, setPOLines] = useState<POLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewPOModalOpen, setIsViewPOModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: '',
    status: '',
    department: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: ''
  });

  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    comments: '',
    approvedBy: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'dashboard':
          // const dashboardData = await procurementService.getPODashboard();
          setSummary(sampleSummary);
          break;
        case 'orders':
          // const ordersData = await procurementService.getPurchaseOrders(filters);
          setPurchaseOrders(filteredSamplePOs);
          break;
        case 'tracking':
          // Load tracking data
          break;
        case 'suppliers':
          // Load supplier data
          break;
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = async (po: PurchaseOrder) => {
    try {
      setSelectedPO(po);
      // const lines = await procurementService.getPOLines(po.id);
      setPOLines(samplePOLines);
      setIsViewPOModalOpen(true);
    } catch (error) {
      toast.error('Failed to load purchase order details');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    try {
      // await procurementService.updatePOStatus(selectedPO.id, statusUpdateData);
      toast.success('Purchase order status updated successfully');
      setIsUpdateStatusModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to update purchase order status');
    }
  };

  const handleCancelPO = async (poId: string) => {
    try {
      // await procurementService.cancelPO(poId);
      toast.success('Purchase order cancelled successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel purchase order');
    }
  };

  const resetStatusUpdateForm = () => {
    setStatusUpdateData({
      status: '',
      comments: '',
      approvedBy: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Draft' },
      PENDING_APPROVAL: { variant: 'warning' as const, label: 'Pending Approval' },
      APPROVED: { variant: 'success' as const, label: 'Approved' },
      PARTIALLY_RECEIVED: { variant: 'primary' as const, label: 'Partially Received' },
      COMPLETED: { variant: 'success' as const, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { variant: 'secondary' as const, label: 'Low' },
      MEDIUM: { variant: 'warning' as const, label: 'Medium' },
      HIGH: { variant: 'danger' as const, label: 'High' },
      URGENT: { variant: 'danger' as const, label: 'Urgent' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const purchaseOrderColumns = [
    { key: 'poNumber' as keyof PurchaseOrder, header: 'PO Number', width: '15%', sortable: true },
    { key: 'supplierName' as keyof PurchaseOrder, header: 'Supplier', width: '20%', sortable: true },
    { key: 'department' as keyof PurchaseOrder, header: 'Department', width: '12%', sortable: true },
    { key: 'totalAmount' as keyof PurchaseOrder, header: 'Amount', width: '12%', sortable: true,
      render: (value: number, row: PurchaseOrder) => (
        <span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
          }).format(value)}
        </span>
      )
    },
    { key: 'priority' as keyof PurchaseOrder, header: 'Priority', width: '10%',
      render: (value: string) => getPriorityBadge(value)
    },
    { key: 'status' as keyof PurchaseOrder, header: 'Status', width: '15%',
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'expectedDelivery' as keyof PurchaseOrder, header: 'Expected Delivery', width: '12%', sortable: true },
    { key: 'id' as keyof PurchaseOrder, header: 'Actions', width: '14%',
      render: (value: string, row: PurchaseOrder) => (
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewPO(row)}
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedPO(row);
              setIsUpdateStatusModalOpen(true);
            }}
          >
            Update
          </Button>
          {row.status === 'DRAFT' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCancelPO(row.id)}
              className="text-red-400 hover:text-red-300"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    },
  ];

  const poLineColumns = [
    { key: 'itemCode' as keyof POLine, header: 'Item Code', width: '15%' },
    { key: 'description' as keyof POLine, header: 'Description', width: '30%' },
    { key: 'quantity' as keyof POLine, header: 'Qty Ordered', width: '12%', 
      render: (value: number, row: POLine) => `${value} ${row.unit}` 
    },
    { key: 'receivedQuantity' as keyof POLine, header: 'Qty Received', width: '12%',
      render: (value: number, row: POLine) => `${value} ${row.unit}` 
    },
    { key: 'pendingQuantity' as keyof POLine, header: 'Qty Pending', width: '12%',
      render: (value: number, row: POLine) => `${value} ${row.unit}` 
    },
    { key: 'unitPrice' as keyof POLine, header: 'Unit Price', width: '12%',
      render: (value: number) => `GHS ${value.toFixed(2)}`
    },
    { key: 'totalPrice' as keyof POLine, header: 'Total', width: '12%',
      render: (value: number) => `GHS ${value.toFixed(2)}`
    },
  ];

  // Sample data
  const sampleSummary: POSummary = {
    totalPOs: 45,
    pendingApproval: 12,
    approved: 28,
    totalValue: 12500000,
    avgProcessingTime: 3.2,
    overdueDeliveries: 5
  };

  const samplePurchaseOrders: PurchaseOrder[] = [
    {
      id: '1',
      poNumber: 'PO-2024-000001',
      supplierId: '1',
      supplierName: 'Tema Oil Refinery',
      status: 'APPROVED',
      priority: 'HIGH',
      totalAmount: 5000000,
      currency: 'GHS',
      requestedBy: 'John Mensah',
      department: 'Operations',
      approvedBy: 'Sarah Osei',
      expectedDelivery: '2024-02-15',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
    },
    {
      id: '2',
      poNumber: 'PO-2024-000002',
      supplierId: '2',
      supplierName: 'Ghana Equipment Ltd',
      status: 'PENDING_APPROVAL',
      priority: 'MEDIUM',
      totalAmount: 750000,
      currency: 'GHS',
      requestedBy: 'Mary Asante',
      department: 'Maintenance',
      expectedDelivery: '2024-02-20',
      createdAt: '2024-01-18T10:15:00Z',
      updatedAt: '2024-01-18T10:15:00Z',
    },
    {
      id: '3',
      poNumber: 'PO-2024-000003',
      supplierId: '3',
      supplierName: 'Safety Systems Ghana',
      status: 'PARTIALLY_RECEIVED',
      priority: 'LOW',
      totalAmount: 125000,
      currency: 'GHS',
      requestedBy: 'Kwame Antwi',
      department: 'Safety',
      approvedBy: 'Sarah Osei',
      expectedDelivery: '2024-02-10',
      createdAt: '2024-01-12T08:30:00Z',
      updatedAt: '2024-01-20T16:45:00Z',
    }
  ];

  const samplePOLines: POLine[] = [
    {
      id: '1',
      itemCode: 'FUEL-PMS-001',
      description: 'Premium Motor Spirit (Petrol) - 95 Octane',
      quantity: 50000,
      unitPrice: 8.50,
      totalPrice: 425000,
      receivedQuantity: 0,
      pendingQuantity: 50000,
      unit: 'Litres',
      category: 'Fuel',
      specifications: 'RON 95 minimum, Lead-free, ASTM D4814 compliant'
    },
    {
      id: '2',
      itemCode: 'ADD-001',
      description: 'Fuel Additive Package - Antioxidant',
      quantity: 500,
      unitPrice: 45.00,
      totalPrice: 22500,
      receivedQuantity: 0,
      pendingQuantity: 500,
      unit: 'Litres',
      category: 'Additives'
    }
  ];

  const filteredSamplePOs = samplePurchaseOrders.filter(po => 
    (!filters.supplier || po.supplierName.toLowerCase().includes(filters.supplier.toLowerCase())) &&
    (!filters.status || po.status === filters.status) &&
    (!filters.department || po.department.toLowerCase().includes(filters.department.toLowerCase())) &&
    (!filters.priority || po.priority === filters.priority)
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
    { id: 'orders', label: 'Purchase Orders', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
    { id: 'tracking', label: 'Order Tracking', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { id: 'suppliers', label: 'Supplier Management', icon: 'M17 20h5v-2a2 2 0 00-2-2h-3v4zM9 12h6v-2H9v2zm-4 8h5v-4H5v4zM9 4h6V2H9v2z' },
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
              Purchase Order Management
            </h1>
            <p className="text-dark-400 mt-2">
              Comprehensive purchase order lifecycle management
            </p>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/procurement/create-po'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Purchase Order
            </Button>
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
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Total POs</h3>
                      <p className="text-2xl font-bold text-white mb-1">{summary.totalPOs}</p>
                      <p className="text-sm text-green-400">↑ 12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Pending Approval</h3>
                      <p className="text-2xl font-bold text-yellow-400 mb-1">{summary.pendingApproval}</p>
                      <p className="text-sm text-dark-400">Awaiting approval</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Approved</h3>
                      <p className="text-2xl font-bold text-green-400 mb-1">{summary.approved}</p>
                      <p className="text-sm text-green-400">Ready for delivery</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Total Value</h3>
                      <p className="text-2xl font-bold text-blue-400 mb-1">
                        GHS {(summary.totalValue / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-blue-400">Current month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Avg Processing</h3>
                      <p className="text-2xl font-bold text-white mb-1">{summary.avgProcessingTime} days</p>
                      <p className="text-sm text-green-400">↓ 0.5 days improved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Overdue</h3>
                      <p className="text-2xl font-bold text-red-400 mb-1">{summary.overdueDeliveries}</p>
                      <p className="text-sm text-red-400">Delivery delays</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Purchase Orders */}
              <Card>
                <CardHeader title="Recent Purchase Orders" />
                <CardContent>
                  <div className="space-y-3">
                    {samplePurchaseOrders.slice(0, 5).map((po) => (
                      <div key={po.id} className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-white font-medium">{po.poNumber}</p>
                            <p className="text-dark-400 text-sm">{po.supplierName} • {po.department}</p>
                          </div>
                          {getPriorityBadge(po.priority)}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {po.currency} {new Intl.NumberFormat('en-US').format(po.totalAmount)}
                            </p>
                            <p className="text-dark-400 text-sm">{po.expectedDelivery}</p>
                          </div>
                          {getStatusBadge(po.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/create-po'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Create PO</h3>
                    <p className="text-dark-400 text-sm">Start a new purchase order</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('orders')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">View All POs</h3>
                    <p className="text-dark-400 text-sm">Browse purchase orders</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/approvals'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Approvals</h3>
                    <p className="text-dark-400 text-sm">Manage approval workflows</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/receipts'}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Receipts</h3>
                    <p className="text-dark-400 text-sm">Manage stock receipts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader title="Filter Purchase Orders" />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <Input
                      label="Supplier"
                      placeholder="Search supplier"
                      value={filters.supplier}
                      onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                    />
                    <Select
                      label="Status"
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                        { value: 'APPROVED', label: 'Approved' },
                        { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                      ]}
                      value={filters.status}
                      onChange={(value) => setFilters({ ...filters, status: value })}
                    />
                    <Input
                      label="Department"
                      placeholder="Search department"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    />
                    <Select
                      label="Priority"
                      options={[
                        { value: '', label: 'All Priorities' },
                        { value: 'LOW', label: 'Low' },
                        { value: 'MEDIUM', label: 'Medium' },
                        { value: 'HIGH', label: 'High' },
                        { value: 'URGENT', label: 'Urgent' },
                      ]}
                      value={filters.priority}
                      onChange={(value) => setFilters({ ...filters, priority: value })}
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
                <CardHeader title="Purchase Orders" />
                <CardContent>
                  <Table
                    data={filteredSamplePOs}
                    columns={purchaseOrderColumns}
                    loading={loading}
                    pagination={{
                      page: 1,
                      limit: 10,
                      total: filteredSamplePOs.length,
                      onPageChange: () => {},
                      onLimitChange: () => {},
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tracking' && (
            <Card>
              <CardHeader title="Order Tracking Dashboard" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Order Tracking System</h3>
                  <p className="text-dark-400 mb-6">
                    Real-time tracking of purchase order deliveries and status updates
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-dark-800/30 p-6 rounded-lg border border-dark-600">
                      <h4 className="text-white font-medium mb-2">In Transit</h4>
                      <p className="text-2xl font-bold text-blue-400">8</p>
                      <p className="text-dark-400 text-sm">Orders on the way</p>
                    </div>
                    <div className="bg-dark-800/30 p-6 rounded-lg border border-dark-600">
                      <h4 className="text-white font-medium mb-2">Delivered Today</h4>
                      <p className="text-2xl font-bold text-green-400">3</p>
                      <p className="text-dark-400 text-sm">Successful deliveries</p>
                    </div>
                    <div className="bg-dark-800/30 p-6 rounded-lg border border-dark-600">
                      <h4 className="text-white font-medium mb-2">Delayed</h4>
                      <p className="text-2xl font-bold text-red-400">2</p>
                      <p className="text-dark-400 text-sm">Require attention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'suppliers' && (
            <Card>
              <CardHeader title="Supplier Management" />
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Supplier Directory</h3>
                  <p className="text-dark-400 mb-6">
                    Manage supplier relationships and performance metrics
                  </p>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* View Purchase Order Modal */}
        <FormModal
          isOpen={isViewPOModalOpen}
          onClose={() => setIsViewPOModalOpen(false)}
          title={`Purchase Order - ${selectedPO?.poNumber}`}
          showSubmit={false}
          size="large"
        >
          {selectedPO && (
            <div className="space-y-6">
              {/* PO Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Order Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">PO Number:</dt>
                      <dd className="text-white font-medium">{selectedPO.poNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Supplier:</dt>
                      <dd className="text-white">{selectedPO.supplierName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Department:</dt>
                      <dd className="text-white">{selectedPO.department}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Requested By:</dt>
                      <dd className="text-white">{selectedPO.requestedBy}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Expected Delivery:</dt>
                      <dd className="text-white">{selectedPO.expectedDelivery}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Status & Amounts</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Status:</dt>
                      <dd>{getStatusBadge(selectedPO.status)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Priority:</dt>
                      <dd>{getPriorityBadge(selectedPO.priority)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-dark-400">Total Amount:</dt>
                      <dd className="text-white font-medium">
                        {selectedPO.currency} {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                        }).format(selectedPO.totalAmount)}
                      </dd>
                    </div>
                    {selectedPO.approvedBy && (
                      <div className="flex justify-between">
                        <dt className="text-dark-400">Approved By:</dt>
                        <dd className="text-white">{selectedPO.approvedBy}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* PO Lines */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Order Items</h4>
                <Table
                  data={poLines}
                  columns={poLineColumns}
                  loading={false}
                  pagination={{
                    page: 1,
                    limit: 10,
                    total: poLines.length,
                    onPageChange: () => {},
                    onLimitChange: () => {},
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Order
                </Button>
                {selectedPO.status === 'PENDING_APPROVAL' && (
                  <Button variant="primary" size="sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approve Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* Update Status Modal */}
        <FormModal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => {
            setIsUpdateStatusModalOpen(false);
            resetStatusUpdateForm();
          }}
          onSubmit={handleUpdateStatus}
          title="Update Purchase Order Status"
          submitText="Update Status"
        >
          <Select
            label="New Status"
            options={[
              { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            value={statusUpdateData.status}
            onChange={(value) => setStatusUpdateData({ ...statusUpdateData, status: value })}
            required
          />

          {statusUpdateData.status === 'APPROVED' && (
            <Input
              label="Approved By"
              placeholder="Enter approver name"
              value={statusUpdateData.approvedBy}
              onChange={(e) => setStatusUpdateData({ ...statusUpdateData, approvedBy: e.target.value })}
              required
            />
          )}

          <Input
            label="Comments"
            placeholder="Add status update comments..."
            value={statusUpdateData.comments}
            onChange={(e) => setStatusUpdateData({ ...statusUpdateData, comments: e.target.value })}
            multiline
          />
        </FormModal>
      </div>
    </FuturisticDashboardLayout>
  );
};

export default PurchaseOrdersPage;