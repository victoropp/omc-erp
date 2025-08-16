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
exports.DailyDeliveryTable = void 0;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const ui_1 = require("@/components/ui");
const DailyDeliveryTable = ({ deliveries, selectedDeliveries, onSelectionChange, onEdit, onApprove, onReject, onGenerateInvoice, onSubmitApproval, loading = false }) => {
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const [pageSize, setPageSize] = (0, react_1.useState)(10);
    // Sort deliveries
    const sortedDeliveries = (0, react_1.useMemo)(() => {
        if (!sortConfig)
            return deliveries;
        return [...deliveries].sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [deliveries, sortConfig]);
    // Paginate deliveries
    const paginatedDeliveries = (0, react_1.useMemo)(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedDeliveries.slice(startIndex, startIndex + pageSize);
    }, [sortedDeliveries, currentPage, pageSize]);
    const totalPages = Math.ceil(sortedDeliveries.length / pageSize);
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj) || '';
    };
    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            if (prevConfig?.key === key) {
                return {
                    key,
                    direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            return { key, direction: 'asc' };
        });
    };
    const handleSelectAll = (checked) => {
        if (checked) {
            onSelectionChange([...selectedDeliveries, ...paginatedDeliveries.map(d => d.id)]);
        }
        else {
            onSelectionChange(selectedDeliveries.filter(id => !paginatedDeliveries.find(d => d.id === id)));
        }
    };
    const handleSelectItem = (id, checked) => {
        if (checked) {
            onSelectionChange([...selectedDeliveries, id]);
        }
        else {
            onSelectionChange(selectedDeliveries.filter(selectedId => selectedId !== id));
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'submitted': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'completed': return 'primary';
            default: return 'default';
        }
    };
    const getComplianceColor = (compliant) => {
        return compliant ? 'success' : 'danger';
    };
    const SortableHeader = ({ label, sortKey }) => (<button onClick={() => handleSort(sortKey)} className="flex items-center space-x-2 text-left hover:text-primary-400 transition-colors">
      <span>{label}</span>
      <div className="flex flex-col">
        <svg className={`w-3 h-3 ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-primary-400' : 'text-dark-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
        </svg>
        <svg className={`w-3 h-3 -mt-1 ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-primary-400' : 'text-dark-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
        </svg>
      </div>
    </button>);
    if (loading) {
        return (<div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-dark-800 border border-dark-700">
              <th className="px-6 py-4 text-left border-r border-dark-700">
                <input type="checkbox" checked={paginatedDeliveries.length > 0 && paginatedDeliveries.every(d => selectedDeliveries.includes(d.id))} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Date" sortKey="date"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Customer" sortKey="customerName"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Supplier" sortKey="supplier.name"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Product" sortKey="product.type"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Value" sortKey="totalValue"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                <SortableHeader label="Status" sortKey="status"/>
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium border-r border-dark-700">
                Compliance
              </th>
              <th className="px-6 py-4 text-left text-dark-300 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeliveries.map((delivery, index) => (<framer_motion_1.motion.tr key={delivery.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="border-b border-dark-700 hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4 border-r border-dark-700">
                  <input type="checkbox" checked={selectedDeliveries.includes(delivery.id)} onChange={(e) => handleSelectItem(delivery.id, e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <p className="font-medium text-white">
                      {new Date(delivery.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-dark-400">PSA: {delivery.psaNumber}</p>
                    <p className="text-xs text-dark-400">W/Bill: {delivery.wbillNumber}</p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <p className="font-medium text-white">{delivery.customerName}</p>
                    <p className="text-sm text-dark-400">{delivery.location}</p>
                    <p className="text-xs text-dark-500">Invoice: {delivery.invoiceNumber}</p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <p className="font-medium text-white">{delivery.supplier.name}</p>
                    <p className="text-sm text-dark-400">{delivery.depot.name}</p>
                    <p className="text-xs text-dark-500">{delivery.vehicleRegNumber}</p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <p className="font-medium text-white capitalize">{delivery.product.type}</p>
                    <p className="text-sm text-dark-400">{delivery.product.grade}</p>
                    <p className="text-xs text-blue-400">
                      {delivery.product.quantity.toLocaleString()} {delivery.product.unit}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <p className="font-medium text-green-400">
                      {delivery.currency} {delivery.totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-400">
                      Unit: {delivery.currency} {delivery.unitPrice}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div>
                    <ui_1.Badge variant={getStatusColor(delivery.status)} className="capitalize mb-1">
                      {delivery.status.replace('-', ' ')}
                    </ui_1.Badge>
                    <p className="text-xs text-dark-400">
                      Level {delivery.approvalStatus.level}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-dark-700">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-dark-400">NPA:</span>
                      <ui_1.Badge variant={getComplianceColor(delivery.compliance.npaCompliant)} className="text-xs">
                        {delivery.compliance.npaCompliant ? 'Yes' : 'No'}
                      </ui_1.Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-dark-400">GRA:</span>
                      <ui_1.Badge variant={getComplianceColor(delivery.compliance.graCompliant)} className="text-xs">
                        {delivery.compliance.graCompliant ? 'Yes' : 'No'}
                      </ui_1.Badge>
                    </div>
                    <p className="text-xs text-blue-400">
                      Local: {delivery.compliance.localContentPercentage}%
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {delivery.status === 'draft' && (<ui_1.Button variant="primary" size="sm" onClick={() => onSubmitApproval(delivery.id)}>
                        Submit
                      </ui_1.Button>)}
                    {delivery.status === 'submitted' && (<>
                        <ui_1.Button variant="success" size="sm" onClick={() => onApprove(delivery.id)}>
                          Approve
                        </ui_1.Button>
                        <ui_1.Button variant="danger" size="sm" onClick={() => onReject(delivery.id, 'Rejected from table')}>
                          Reject
                        </ui_1.Button>
                      </>)}
                    {delivery.status === 'approved' && (<ui_1.Button variant="outline" size="sm" onClick={() => onGenerateInvoice(delivery.id, 'customer')}>
                        Invoice
                      </ui_1.Button>)}
                    <ui_1.Button variant="outline" size="sm" onClick={() => onEdit(delivery)}>
                      Edit
                    </ui_1.Button>
                  </div>
                </td>
              </framer_motion_1.motion.tr>))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-dark-400">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedDeliveries.length)} to{' '}
            {Math.min(currentPage * pageSize, sortedDeliveries.length)} of {sortedDeliveries.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-dark-400">Show:</span>
            <select value={pageSize} onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setCurrentPage(1);
        }} className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-white text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ui_1.Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Previous
          </ui_1.Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-1 rounded text-sm transition-colors ${currentPage === pageNum
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>
                  {pageNum}
                </button>);
        })}
          </div>

          <ui_1.Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            Next
          </ui_1.Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-dark-800 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{sortedDeliveries.length}</p>
          <p className="text-sm text-dark-400">Total Records</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {sortedDeliveries.filter(d => d.status === 'approved').length}
          </p>
          <p className="text-sm text-dark-400">Approved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {sortedDeliveries.filter(d => d.status === 'submitted').length}
          </p>
          <p className="text-sm text-dark-400">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            GHS {sortedDeliveries.reduce((sum, d) => sum + d.totalValue, 0).toLocaleString()}
          </p>
          <p className="text-sm text-dark-400">Total Value</p>
        </div>
      </div>
    </div>);
};
exports.DailyDeliveryTable = DailyDeliveryTable;
//# sourceMappingURL=DailyDeliveryTable.js.map