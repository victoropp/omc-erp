import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, Button, Modal, Badge } from '@/components/ui';
import { transactionService } from '@/services/api';
import { TableColumn } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface Transaction {
  id: string;
  transactionId: string;
  stationName: string;
  fuelType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  customerType: 'retail' | 'commercial';
  vehicleNumber?: string;
  driverName?: string;
  receiptNumber: string;
}

interface TransactionTableProps {
  showActions?: boolean;
  onTransactionSelect?: (transaction: Transaction) => void;
  filters?: Record<string, any>;
  maxRecords?: number;
}

export function TransactionTable({ 
  showActions = true, 
  onTransactionSelect,
  filters = {},
  maxRecords = 100
}: TransactionTableProps) {
  const { actualTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Load transactions data
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }) as any;
      setTransactions(response.data || generateMockTransactions());
      setPagination(prev => ({ ...prev, total: response.total || 500 }));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions(generateMockTransactions());
      setPagination(prev => ({ ...prev, total: 500 }));
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = (): Transaction[] => {
    const stations = ['Achimota Shell', 'Tema Oil Refinery', 'Takoradi Main', 'Kumasi Shell', 'Tamale Total'];
    const fuelTypes = ['PMS', 'AGO', 'LPG', 'KERO'];
    const paymentMethods = ['Cash', 'Card', 'Mobile Money', 'Corporate Account'];
    const statuses: Transaction['status'][] = ['completed', 'pending', 'failed', 'refunded'];
    const customerTypes: Transaction['customerType'][] = ['retail', 'commercial'];

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

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, pagination.limit]);

  // Handle sorting
  const handleSort = (key: keyof Transaction, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const handleFilter = (filters: Record<string, string>) => {
    console.log('Applying filters:', filters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Sort and filter data
  const processedData = useMemo(() => {
    let filteredData = [...transactions];

    // Apply filters
    if (filters.status) {
      filteredData = filteredData.filter(txn => txn.status === filters.status);
    }
    if (filters.station) {
      filteredData = filteredData.filter(txn => 
        txn.stationName.toLowerCase().includes(filters.station.toLowerCase())
      );
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
  const columns: TableColumn<Transaction>[] = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      sortable: true,
      filterable: true,
      render: (value: string, row: Transaction) => (
        <button
          onClick={() => {
            setSelectedTransaction(row);
            setDetailModalOpen(true);
          }}
          className="text-primary-400 hover:text-primary-300 font-mono text-sm"
        >
          {value.slice(-8)}
        </button>
      ),
    },
    {
      key: 'stationName',
      header: 'Station',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'fuelType',
      header: 'Fuel',
      sortable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'PMS' ? 'primary' : value === 'AGO' ? 'secondary' : 'outline'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty (L)',
      sortable: true,
      render: (value: number) => (
        <span className="text-white font-mono">{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount (₵)',
      sortable: true,
      render: (value: number) => (
        <span className="text-white font-bold">₵{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      sortable: true,
      render: (value: string) => {
        const variants: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
          'Cash': 'success',
          'Card': 'primary',
          'Mobile Money': 'warning',
          'Corporate Account': 'secondary',
        };
        return (
          <Badge variant={variants[value] || 'outline'}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value: string) => {
        const variants: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
          completed: 'success',
          pending: 'warning',
          failed: 'danger',
          refunded: 'secondary',
        };
        return (
          <Badge variant={variants[value] || 'outline'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <div className="text-white">{new Date(value).toLocaleDateString()}</div>
          <div className="text-dark-400">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
  ];

  if (showActions) {
    columns.push({
      key: 'id',
      header: 'Actions',
      render: (_, row: Transaction) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTransaction(row);
              setDetailModalOpen(true);
            }}
          >
            View
          </Button>
          {row.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransactionAction(row.id, 'receipt')}
            >
              Receipt
            </Button>
          )}
          {row.status === 'failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTransactionAction(row.id, 'retry')}
            >
              Retry
            </Button>
          )}
        </div>
      ),
    });
  }

  const handleTransactionAction = async (transactionId: string, action: 'receipt' | 'retry' | 'refund') => {
    try {
      console.log(`${action} transaction:`, transactionId);
      // Implement action logic here
      loadTransactions(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} transaction:`, error);
    }
  };

  return (
    <div className="space-y-4">
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
      <Table
        data={processedData}
        columns={columns}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        onSort={handleSort}
        onFilter={handleFilter}
        onRowClick={onTransactionSelect}
        selection={{
          selectedRows: selectedTransactions,
          onSelectionChange: setSelectedTransactions,
        }}
      />

      {/* Bulk actions */}
      {selectedTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg"
        >
          <span className="text-white">
            {selectedTransactions.length} transaction(s) selected
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Export Selected
            </Button>
            <Button variant="primary" size="sm">
              Bulk Process
            </Button>
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Transaction Details"
        size="2xl"
      >
        {selectedTransaction && (
          <div className="space-y-6">
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
                  <Badge variant="primary">{selectedTransaction.fuelType}</Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Status
                  </label>
                  <Badge 
                    variant={
                      selectedTransaction.status === 'completed' ? 'success' :
                      selectedTransaction.status === 'pending' ? 'warning' :
                      selectedTransaction.status === 'failed' ? 'danger' : 'secondary'
                    }
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </Badge>
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
            
            {selectedTransaction.vehicleNumber && (
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">
                  Vehicle Information
                </label>
                <div className="bg-dark-800 p-3 rounded-lg">
                  <p className="text-white">Vehicle: {selectedTransaction.vehicleNumber}</p>
                  {selectedTransaction.driverName && (
                    <p className="text-dark-400">Driver: {selectedTransaction.driverName}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">
                Transaction Time
              </label>
              <p className="text-white">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              {selectedTransaction.status === 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleTransactionAction(selectedTransaction.id, 'receipt');
                    setDetailModalOpen(false);
                  }}
                >
                  Download Receipt
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}