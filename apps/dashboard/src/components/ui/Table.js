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
exports.Table = Table;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const clsx_1 = require("clsx");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const Button_1 = require("./Button");
const Input_1 = require("./Input");
function Table({ data, columns, loading = false, pagination, onSort, onFilter, onRowClick, selection, }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [sortColumn, setSortColumn] = (0, react_1.useState)(null);
    const [sortDirection, setSortDirection] = (0, react_1.useState)('asc');
    const [filters, setFilters] = (0, react_1.useState)({});
    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
        onSort?.(column, newDirection);
    };
    const handleFilter = (column, value) => {
        const newFilters = { ...filters, [column]: value };
        setFilters(newFilters);
        onFilter?.(newFilters);
    };
    const handleSelectAll = (checked) => {
        if (selection) {
            const allIds = checked ? data.map(row => row.id) : [];
            selection.onSelectionChange(allIds);
        }
    };
    const handleSelectRow = (rowId, checked) => {
        if (selection) {
            const newSelection = checked
                ? [...selection.selectedRows, rowId]
                : selection.selectedRows.filter(id => id !== rowId);
            selection.onSelectionChange(newSelection);
        }
    };
    const isAllSelected = selection?.selectedRows.length === data.length && data.length > 0;
    const isPartiallySelected = selection && selection.selectedRows.length > 0 && selection.selectedRows.length < data.length;
    return (<div className="w-full">
      {/* Table container */}
      <div className={(0, clsx_1.clsx)('overflow-hidden rounded-3xl border transition-colors duration-300', actualTheme === 'dark'
            ? 'bg-dark-800/50 backdrop-blur-sm border-white/10'
            : 'bg-white border-gray-200')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={(0, clsx_1.clsx)('border-b transition-colors duration-300', actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
              <tr>
                {/* Selection column */}
                {selection && (<th className="w-12 px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={isAllSelected} ref={(input) => {
                if (input)
                    input.indeterminate = !!isPartiallySelected;
            }} onChange={(e) => handleSelectAll(e.target.checked)}/>
                  </th>)}

                {columns.map((column) => (<th key={String(column.key)} className={(0, clsx_1.clsx)('px-6 py-4 text-left text-sm font-semibold', actualTheme === 'dark' ? 'text-white' : 'text-gray-900', column.width && `w-${column.width}`)}>
                    <div className="flex flex-col space-y-2">
                      {/* Header with sorting */}
                      <div className="flex items-center space-x-2">
                        <span>{column.header}</span>
                        {column.sortable && (<button onClick={() => handleSort(column.key)} className={(0, clsx_1.clsx)('p-1 rounded hover:bg-white/10 transition-colors duration-200', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                            </svg>
                          </button>)}
                      </div>

                      {/* Filter input */}
                      {column.filterable && (<Input_1.Input placeholder={`Filter ${column.header.toLowerCase()}...`} inputSize="sm" value={filters[String(column.key)] || ''} onChange={(e) => handleFilter(column.key, e.target.value)}/>)}
                    </div>
                  </th>))}
              </tr>
            </thead>

            <tbody className={(0, clsx_1.clsx)('divide-y transition-colors duration-300', actualTheme === 'dark' ? 'divide-white/10' : 'divide-gray-200')}>
              <framer_motion_1.AnimatePresence mode="wait">
                {loading ? (<tr>
                    <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12">
                      <div className="flex items-center justify-center">
                        <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8">
                          <svg className="w-full h-full text-primary-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                        </framer_motion_1.motion.div>
                      </div>
                    </td>
                  </tr>) : data.length === 0 ? (<tr>
                    <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12 text-center">
                      <div className={(0, clsx_1.clsx)('text-sm', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
                        No data available
                      </div>
                    </td>
                  </tr>) : (data.map((row, index) => (<framer_motion_1.motion.tr key={row.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={(0, clsx_1.clsx)('transition-colors duration-200', onRowClick && 'cursor-pointer', actualTheme === 'dark'
                ? 'hover:bg-white/5'
                : 'hover:bg-gray-50', selection?.selectedRows.includes(row.id) && (actualTheme === 'dark'
                ? 'bg-primary-500/10'
                : 'bg-primary-50'))} onClick={() => onRowClick?.(row)}>
                      {/* Selection checkbox */}
                      {selection && (<td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={selection.selectedRows.includes(row.id)} onChange={(e) => handleSelectRow(row.id, e.target.checked)}/>
                        </td>)}

                      {columns.map((column) => (<td key={String(column.key)} className={(0, clsx_1.clsx)('px-6 py-4 text-sm', actualTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                          {column.render ?
                    column.render(row[column.key], row) :
                    String(row[column.key] || '')}
                        </td>))}
                    </framer_motion_1.motion.tr>)))}
              </framer_motion_1.AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (<div className={(0, clsx_1.clsx)('px-6 py-4 border-t flex items-center justify-between transition-colors duration-300', actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
            <div className={(0, clsx_1.clsx)('flex items-center space-x-4 text-sm', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </span>
              
              <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <select value={pagination.limit} onChange={(e) => pagination.onLimitChange(Number(e.target.value))} className={(0, clsx_1.clsx)('rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500', actualTheme === 'dark'
                ? 'bg-dark-700 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900')}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button_1.Button variant="ghost" size="sm" disabled={pagination.page <= 1} onClick={() => pagination.onPageChange(pagination.page - 1)}>
                Previous
              </Button_1.Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNumber = Math.max(1, pagination.page - 2) + i;
                if (pageNumber > Math.ceil(pagination.total / pagination.limit))
                    return null;
                return (<Button_1.Button key={pageNumber} variant={pageNumber === pagination.page ? 'primary' : 'ghost'} size="sm" onClick={() => pagination.onPageChange(pageNumber)}>
                    {pageNumber}
                  </Button_1.Button>);
            })}
              
              <Button_1.Button variant="ghost" size="sm" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => pagination.onPageChange(pagination.page + 1)}>
                Next
              </Button_1.Button>
            </div>
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=Table.js.map