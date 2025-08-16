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
exports.TransactionTable = TransactionTable;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const ui_1 = require("@/components/ui");
const api_1 = require("@/services/api");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function TransactionTable({ showActions = true, onTransactionSelect, filters = {}, maxRecords = 100 }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [transactions, setTransactions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [pagination, setPagination] = (0, react_1.useState)({
        page: 1,
        limit: 25,
        total: 0,
    });
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const [selectedTransactions, setSelectedTransactions] = (0, react_1.useState)([]);
    const [detailModalOpen, setDetailModalOpen] = (0, react_1.useState)(false);
    const [selectedTransaction, setSelectedTransaction] = (0, react_1.useState)(null);
    // Load transactions data
    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await api_1.transactionService.getTransactions({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            setTransactions(response.data || generateMockTransactions());
            setPagination(prev => ({ ...prev, total: response.total || 500 }));
        }
        catch (error) {
            console.error('Failed to load transactions:', error);
            setTransactions(generateMockTransactions());
            setPagination(prev => ({ ...prev, total: 500 }));
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockTransactions = () => {
        const stations = ['Achimota Shell', 'Tema Oil Refinery', 'Takoradi Main', 'Kumasi Shell', 'Tamale Total'];
        const fuelTypes = ['PMS', 'AGO', 'LPG', 'KERO'];
        const paymentMethods = ['Cash', 'Card', 'Mobile Money', 'Corporate Account'];
        const statuses = ['completed', 'pending', 'failed', 'refunded'];
        const customerTypes = ['retail', 'commercial'];
        return Array.from({ length: 25 }, (_, i) => {
            const quantity = Math.floor(Math.random() * 500) + 20;
            const unitPrice = Math.random() * 10 + 5;
            const totalAmount = quantity * unitPrice;
            return {
                id: `txn-${i + 1}`,
                transactionId: `TXN-${Date.now()}-${String(i + 1).padStart(4, '0')}`,
                stationName: stations[Math.floor(Math.random() * stations.length)],
                fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
                quantity: Math.floor(quantity),
                unitPrice: Math.round(unitPrice * 100) / 100,
                totalAmount: Math.round(totalAmount * 100) / 100,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                customerType: customerTypes[Math.floor(Math.random() * customerTypes.length)],
                vehicleNumber: Math.random() > 0.5 ? `GE-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 99)}` : undefined,
                driverName: Math.random() > 0.5 ? ['John Doe', 'Jane Smith', 'Kwame Asante', 'Ama Osei'][Math.floor(Math.random() * 4)] : undefined,
                receiptNumber: `RCP-${Date.now()}-${i + 1}`,
            };
        });
    };
    (0, react_1.useEffect)(() => {
        loadTransactions();
    }, [pagination.page, pagination.limit]);
    // Handle sorting
    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
    };
    // Handle filtering
    const handleFilter = (filters) => {
        console.log('Applying filters:', filters);
    };
    // Handle pagination
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };
    const handleLimitChange = (limit) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    };
    // Sort and filter data
    const processedData = (0, react_1.useMemo)(() => {
        let filteredData = [...transactions];
        // Apply filters
        if (filters.status) {
            filteredData = filteredData.filter(txn => txn.status === filters.status);
        }
        if (filters.station) {
            filteredData = filteredData.filter(txn => txn.stationName.toLowerCase().includes(filters.station.toLowerCase()));
        }
        if (filters.fuelType) {
            filteredData = filteredData.filter(txn => txn.fuelType === filters.fuelType);
        }
        // Apply sorting
        if (sortConfig) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue != null && bValue != null) {
                    if (aValue < bValue) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                }
                return 0;
            });
        }
        return filteredData.slice(0, maxRecords);
    }, [transactions, sortConfig, filters, maxRecords]);
    // Table columns configuration
    const columns = [
        {
            key: 'transactionId',
            header: 'Transaction ID',
            sortable: true,
            filterable: true,
            render: (value, row) => (<button onClick={() => {
                    setSelectedTransaction(row);
                    setDetailModalOpen(true);
                }} className="text-primary-400 hover:text-primary-300 font-mono text-sm">
          {value.slice(-8)}
        </button>),
        },
        {
            key: 'stationName',
            header: 'Station',
            sortable: true,
            filterable: true,
            render: (value) => (<span className="text-white font-medium">{value}</span>),
        },
        {
            key: 'fuelType',
            header: 'Fuel',
            sortable: true,
            render: (value) => (<ui_1.Badge variant={value === 'PMS' ? 'primary' : value === 'AGO' ? 'secondary' : 'outline'}>
          {value}
        </ui_1.Badge>),
        },
        {
            key: 'quantity',
            header: 'Qty (L)',
            sortable: true,
            render: (value) => (<span className="text-white font-mono">{value.toLocaleString()}</span>),
        },
        {
            key: 'totalAmount',
            header: 'Amount (₵)',
            sortable: true,
            render: (value) => (<span className="text-white font-bold">₵{value.toLocaleString()}</span>),
        },
        {
            key: 'paymentMethod',
            header: 'Payment',
            sortable: true,
            render: (value) => {
                const variants = {
                    'Cash': 'success',
                    'Card': 'primary',
                    'Mobile Money': 'warning',
                    'Corporate Account': 'secondary',
                };
                return (<ui_1.Badge variant={variants[value] || 'outline'}>
            {value}
          </ui_1.Badge>);
            },
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            filterable: true,
            render: (value) => {
                const variants = {
                    completed: 'success',
                    pending: 'warning',
                    failed: 'danger',
                    refunded: 'secondary',
                };
                return (<ui_1.Badge variant={variants[value] || 'outline'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </ui_1.Badge>);
            },
        },
        {
            key: 'timestamp',
            header: 'Time',
            sortable: true,
            render: (value) => (<div className="text-sm">
          <div className="text-white">{new Date(value).toLocaleDateString()}</div>
          <div className="text-dark-400">{new Date(value).toLocaleTimeString()}</div>
        </div>),
        },
    ];
    if (showActions) {
        columns.push({
            key: 'id',
            header: 'Actions',
            render: (_, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm" onClick={() => {
                    setSelectedTransaction(row);
                    setDetailModalOpen(true);
                }}>
            View
          </ui_1.Button>
          {row.status === 'completed' && (<ui_1.Button variant="outline" size="sm" onClick={() => handleTransactionAction(row.id, 'receipt')}>
              Receipt
            </ui_1.Button>)}
          {row.status === 'failed' && (<ui_1.Button variant="outline" size="sm" onClick={() => handleTransactionAction(row.id, 'retry')}>
              Retry
            </ui_1.Button>)}
        </div>),
        });
    }
    const handleTransactionAction = async (transactionId, action) => {
        try {
            console.log(`${action} transaction:`, transactionId);
            // Implement action logic here
            loadTransactions(); // Refresh data
        }
        catch (error) {
            console.error(`Failed to ${action} transaction:`, error);
        }
    };
    return (<div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-2xl font-bold">
            {processedData.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-sm text-dark-400">Completed</div>
        </div>
        
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-2xl font-bold">
            {processedData.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-dark-400">Pending</div>
        </div>
        
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-400 text-2xl font-bold">
            {processedData.filter(t => t.status === 'failed').length}
          </div>
          <div className="text-sm text-dark-400">Failed</div>
        </div>
        
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-2xl font-bold">
            ₵{Math.round(processedData.reduce((sum, t) => sum + t.totalAmount, 0)).toLocaleString()}
          </div>
          <div className="text-sm text-dark-400">Total Value</div>
        </div>
      </div>

      {/* Table */}
      <ui_1.Table data={processedData} columns={columns} loading={loading} pagination={{
            ...pagination,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
        }} onSort={handleSort} onFilter={handleFilter} onRowClick={onTransactionSelect} selection={{
            selectedRows: selectedTransactions,
            onSelectionChange: setSelectedTransactions,
        }}/>

      {/* Bulk actions */}
      {selectedTransactions.length > 0 && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
          <span className="text-white">
            {selectedTransactions.length} transaction(s) selected
          </span>
          <div className="flex space-x-2">
            <ui_1.Button variant="outline" size="sm">
              Export Selected
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm">
              Bulk Process
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>)}

      {/* Detail Modal */}
      <ui_1.Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Transaction Details" size="2xl">
        {selectedTransaction && (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-white font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Station
                  </label>
                  <p className="text-white">{selectedTransaction.stationName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Fuel Type
                  </label>
                  <ui_1.Badge variant="primary">{selectedTransaction.fuelType}</ui_1.Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Status
                  </label>
                  <ui_1.Badge variant={selectedTransaction.status === 'completed' ? 'success' :
                selectedTransaction.status === 'pending' ? 'warning' :
                    selectedTransaction.status === 'failed' ? 'danger' : 'secondary'}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </ui_1.Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Quantity
                  </label>
                  <p className="text-white">{selectedTransaction.quantity.toLocaleString()} L</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Unit Price
                  </label>
                  <p className="text-white">₵{selectedTransaction.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Total Amount
                  </label>
                  <p className="text-white text-xl font-bold">₵{selectedTransaction.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Payment Method
                  </label>
                  <p className="text-white">{selectedTransaction.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            {selectedTransaction.vehicleNumber && (<div>
                <label className="block text-sm font-medium text-dark-400 mb-1">
                  Vehicle Information
                </label>
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-white">Vehicle: {selectedTransaction.vehicleNumber}</p>
                  {selectedTransaction.driverName && (<p className="text-dark-400">Driver: {selectedTransaction.driverName}</p>)}
                </div>
              </div>)}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">
                Transaction Time
              </label>
              <p className="text-white">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <ui_1.Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </ui_1.Button>
              {selectedTransaction.status === 'completed' && (<ui_1.Button variant="primary" onClick={() => {
                    handleTransactionAction(selectedTransaction.id, 'receipt');
                    setDetailModalOpen(false);
                }}>
                  Download Receipt
                </ui_1.Button>)}
            </div>
          </div>)}
      </ui_1.Modal>
    </div>);
}
//# sourceMappingURL=TransactionTable.js.map