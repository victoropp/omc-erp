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
const PurchaseOrdersPage = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('dashboard');
    const [summary, setSummary] = (0, react_1.useState)(null);
    const [purchaseOrders, setPurchaseOrders] = (0, react_1.useState)([]);
    const [selectedPO, setSelectedPO] = (0, react_1.useState)(null);
    const [poLines, setPOLines] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isViewPOModalOpen, setIsViewPOModalOpen] = (0, react_1.useState)(false);
    const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = (0, react_1.useState)(false);
    const [filters, setFilters] = (0, react_1.useState)({
        supplier: '',
        status: '',
        department: '',
        priority: '',
        dateFrom: '',
        dateTo: '',
        amountFrom: '',
        amountTo: ''
    });
    const [statusUpdateData, setStatusUpdateData] = (0, react_1.useState)({
        status: '',
        comments: '',
        approvedBy: ''
    });
    (0, react_1.useEffect)(() => {
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
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleViewPO = async (po) => {
        try {
            setSelectedPO(po);
            // const lines = await procurementService.getPOLines(po.id);
            setPOLines(samplePOLines);
            setIsViewPOModalOpen(true);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load purchase order details');
        }
    };
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!selectedPO)
            return;
        try {
            // await procurementService.updatePOStatus(selectedPO.id, statusUpdateData);
            react_hot_toast_1.toast.success('Purchase order status updated successfully');
            setIsUpdateStatusModalOpen(false);
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to update purchase order status');
        }
    };
    const handleCancelPO = async (poId) => {
        try {
            // await procurementService.cancelPO(poId);
            react_hot_toast_1.toast.success('Purchase order cancelled successfully');
            loadData();
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to cancel purchase order');
        }
    };
    const resetStatusUpdateForm = () => {
        setStatusUpdateData({
            status: '',
            comments: '',
            approvedBy: ''
        });
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            DRAFT: { variant: 'secondary', label: 'Draft' },
            PENDING_APPROVAL: { variant: 'warning', label: 'Pending Approval' },
            APPROVED: { variant: 'success', label: 'Approved' },
            PARTIALLY_RECEIVED: { variant: 'primary', label: 'Partially Received' },
            COMPLETED: { variant: 'success', label: 'Completed' },
            CANCELLED: { variant: 'danger', label: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.DRAFT;
        return <ui_1.Badge variant={config.variant}>{config.label}</ui_1.Badge>;
    };
    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            LOW: { variant: 'secondary', label: 'Low' },
            MEDIUM: { variant: 'warning', label: 'Medium' },
            HIGH: { variant: 'danger', label: 'High' },
            URGENT: { variant: 'danger', label: 'Urgent' }
        };
        const config = priorityConfig[priority] || priorityConfig.MEDIUM;
        return <ui_1.Badge variant={config.variant}>{config.label}</ui_1.Badge>;
    };
    const purchaseOrderColumns = [
        { key: 'poNumber', header: 'PO Number', width: '15%', sortable: true },
        { key: 'supplierName', header: 'Supplier', width: '20%', sortable: true },
        { key: 'department', header: 'Department', width: '12%', sortable: true },
        { key: 'totalAmount', header: 'Amount', width: '12%', sortable: true,
            render: (value, row) => (<span className="font-medium text-white">
          {row.currency} {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                }).format(value)}
        </span>)
        },
        { key: 'priority', header: 'Priority', width: '10%',
            render: (value) => getPriorityBadge(value)
        },
        { key: 'status', header: 'Status', width: '15%',
            render: (value) => getStatusBadge(value)
        },
        { key: 'expectedDelivery', header: 'Expected Delivery', width: '12%', sortable: true },
        { key: 'id', header: 'Actions', width: '14%',
            render: (value, row) => (<div className="flex space-x-1">
          <ui_1.Button variant="ghost" size="sm" onClick={() => handleViewPO(row)}>
            View
          </ui_1.Button>
          <ui_1.Button variant="ghost" size="sm" onClick={() => {
                    setSelectedPO(row);
                    setIsUpdateStatusModalOpen(true);
                }}>
            Update
          </ui_1.Button>
          {row.status === 'DRAFT' && (<ui_1.Button variant="ghost" size="sm" onClick={() => handleCancelPO(row.id)} className="text-red-400 hover:text-red-300">
              Cancel
            </ui_1.Button>)}
        </div>)
        },
    ];
    const poLineColumns = [
        { key: 'itemCode', header: 'Item Code', width: '15%' },
        { key: 'description', header: 'Description', width: '30%' },
        { key: 'quantity', header: 'Qty Ordered', width: '12%',
            render: (value, row) => `${value} ${row.unit}`
        },
        { key: 'receivedQuantity', header: 'Qty Received', width: '12%',
            render: (value, row) => `${value} ${row.unit}`
        },
        { key: 'pendingQuantity', header: 'Qty Pending', width: '12%',
            render: (value, row) => `${value} ${row.unit}`
        },
        { key: 'unitPrice', header: 'Unit Price', width: '12%',
            render: (value) => `GHS ${value.toFixed(2)}`
        },
        { key: 'totalPrice', header: 'Total', width: '12%',
            render: (value) => `GHS ${value.toFixed(2)}`
        },
    ];
    // Sample data
    const sampleSummary = {
        totalPOs: 45,
        pendingApproval: 12,
        approved: 28,
        totalValue: 12500000,
        avgProcessingTime: 3.2,
        overdueDeliveries: 5
    };
    const samplePurchaseOrders = [
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
    const samplePOLines = [
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
    const filteredSamplePOs = samplePurchaseOrders.filter(po => (!filters.supplier || po.supplierName.toLowerCase().includes(filters.supplier.toLowerCase())) &&
        (!filters.status || po.status === filters.status) &&
        (!filters.department || po.department.toLowerCase().includes(filters.department.toLowerCase())) &&
        (!filters.priority || po.priority === filters.priority));
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
        { id: 'orders', label: 'Purchase Orders', icon: 'M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z' },
        { id: 'tracking', label: 'Order Tracking', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
        { id: 'suppliers', label: 'Supplier Management', icon: 'M17 20h5v-2a2 2 0 00-2-2h-3v4zM9 12h6v-2H9v2zm-4 8h5v-4H5v4zM9 4h6V2H9v2z' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Purchase Order Management
            </h1>
            <p className="text-dark-400 mt-2">
              Comprehensive purchase order lifecycle management
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="primary" onClick={() => window.location.href = '/procurement/create-po'}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Purchase Order
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

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
          {activeTab === 'dashboard' && (<div className="space-y-6">
              {/* Summary Cards */}
              {summary && (<div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Total POs</h3>
                      <p className="text-2xl font-bold text-white mb-1">{summary.totalPOs}</p>
                      <p className="text-sm text-green-400">↑ 12% from last month</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Pending Approval</h3>
                      <p className="text-2xl font-bold text-yellow-400 mb-1">{summary.pendingApproval}</p>
                      <p className="text-sm text-dark-400">Awaiting approval</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Approved</h3>
                      <p className="text-2xl font-bold text-green-400 mb-1">{summary.approved}</p>
                      <p className="text-sm text-green-400">Ready for delivery</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Total Value</h3>
                      <p className="text-2xl font-bold text-blue-400 mb-1">
                        GHS {(summary.totalValue / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-blue-400">Current month</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Avg Processing</h3>
                      <p className="text-2xl font-bold text-white mb-1">{summary.avgProcessingTime} days</p>
                      <p className="text-sm text-green-400">↓ 0.5 days improved</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                  <ui_1.Card>
                    <ui_1.CardContent className="p-6 text-center">
                      <h3 className="text-sm font-medium text-dark-400 mb-2">Overdue</h3>
                      <p className="text-2xl font-bold text-red-400 mb-1">{summary.overdueDeliveries}</p>
                      <p className="text-sm text-red-400">Delivery delays</p>
                    </ui_1.CardContent>
                  </ui_1.Card>
                </div>)}

              {/* Recent Purchase Orders */}
              <ui_1.Card>
                <ui_1.CardHeader title="Recent Purchase Orders"/>
                <ui_1.CardContent>
                  <div className="space-y-3">
                    {samplePurchaseOrders.slice(0, 5).map((po) => (<div key={po.id} className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg border border-dark-600">
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
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ui_1.Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/create-po'}>
                  <ui_1.CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Create PO</h3>
                    <p className="text-dark-400 text-sm">Start a new purchase order</p>
                  </ui_1.CardContent>
                </ui_1.Card>
                <ui_1.Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('orders')}>
                  <ui_1.CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6v-2H9v2zm0 4h6v-2H9v2zm-7 8h20v-2H2v2zM2 4v2h20V4H2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">View All POs</h3>
                    <p className="text-dark-400 text-sm">Browse purchase orders</p>
                  </ui_1.CardContent>
                </ui_1.Card>
                <ui_1.Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/approvals'}>
                  <ui_1.CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Approvals</h3>
                    <p className="text-dark-400 text-sm">Manage approval workflows</p>
                  </ui_1.CardContent>
                </ui_1.Card>
                <ui_1.Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/procurement/receipts'}>
                  <ui_1.CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white">Receipts</h3>
                    <p className="text-dark-400 text-sm">Manage stock receipts</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>
            </div>)}

          {activeTab === 'orders' && (<div className="space-y-6">
              {/* Filters */}
              <ui_1.Card>
                <ui_1.CardHeader title="Filter Purchase Orders"/>
                <ui_1.CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <ui_1.Input label="Supplier" placeholder="Search supplier" value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}/>
                    <ui_1.Select label="Status" options={[
                { value: '', label: 'All Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
            ]} value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })}/>
                    <ui_1.Input label="Department" placeholder="Search department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}/>
                    <ui_1.Select label="Priority" options={[
                { value: '', label: 'All Priorities' },
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
            ]} value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value })}/>
                    <ui_1.Input label="Date From" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}/>
                    <ui_1.Input label="Date To" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}/>
                    <ui_1.Input label="Min Amount" type="number" placeholder="0.00" value={filters.amountFrom} onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}/>
                    <ui_1.Input label="Max Amount" type="number" placeholder="0.00" value={filters.amountTo} onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}/>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              <ui_1.Card>
                <ui_1.CardHeader title="Purchase Orders"/>
                <ui_1.CardContent>
                  <ui_1.Table data={filteredSamplePOs} columns={purchaseOrderColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: filteredSamplePOs.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {activeTab === 'tracking' && (<ui_1.Card>
              <ui_1.CardHeader title="Order Tracking Dashboard"/>
              <ui_1.CardContent>
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
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'suppliers' && (<ui_1.Card>
              <ui_1.CardHeader title="Supplier Management"/>
              <ui_1.CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-white mb-4">Supplier Directory</h3>
                  <p className="text-dark-400 mb-6">
                    Manage supplier relationships and performance metrics
                  </p>
                  <ui_1.Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add New Supplier
                  </ui_1.Button>
                </div>
              </ui_1.CardContent>
            </ui_1.Card>)}
        </framer_motion_1.motion.div>

        {/* View Purchase Order Modal */}
        <ui_1.FormModal isOpen={isViewPOModalOpen} onClose={() => setIsViewPOModalOpen(false)} title={`Purchase Order - ${selectedPO?.poNumber}`} showSubmit={false} size="large">
          {selectedPO && (<div className="space-y-6">
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
                    {selectedPO.approvedBy && (<div className="flex justify-between">
                        <dt className="text-dark-400">Approved By:</dt>
                        <dd className="text-white">{selectedPO.approvedBy}</dd>
                      </div>)}
                  </dl>
                </div>
              </div>

              {/* PO Lines */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Order Items</h4>
                <ui_1.Table data={poLines} columns={poLineColumns} loading={false} pagination={{
                page: 1,
                limit: 10,
                total: poLines.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <ui_1.Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Download PDF
                </ui_1.Button>
                <ui_1.Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Order
                </ui_1.Button>
                {selectedPO.status === 'PENDING_APPROVAL' && (<ui_1.Button variant="primary" size="sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Approve Order
                  </ui_1.Button>)}
              </div>
            </div>)}
        </ui_1.FormModal>

        {/* Update Status Modal */}
        <ui_1.FormModal isOpen={isUpdateStatusModalOpen} onClose={() => {
            setIsUpdateStatusModalOpen(false);
            resetStatusUpdateForm();
        }} onSubmit={handleUpdateStatus} title="Update Purchase Order Status" submitText="Update Status">
          <ui_1.Select label="New Status" options={[
            { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
        ]} value={statusUpdateData.status} onChange={(value) => setStatusUpdateData({ ...statusUpdateData, status: value })} required/>

          {statusUpdateData.status === 'APPROVED' && (<ui_1.Input label="Approved By" placeholder="Enter approver name" value={statusUpdateData.approvedBy} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, approvedBy: e.target.value })} required/>)}

          <ui_1.Input label="Comments" placeholder="Add status update comments..." value={statusUpdateData.comments} onChange={(e) => setStatusUpdateData({ ...statusUpdateData, comments: e.target.value })} multiline/>
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = PurchaseOrdersPage;
//# sourceMappingURL=purchase-orders.js.map