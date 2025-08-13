import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { Input } from './Input';
import { TableColumn, TableProps } from '@/types';

export function Table<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  onFilter,
  onRowClick,
  selection,
}: TableProps<T>) {
  const { actualTheme } = useTheme();
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (column: keyof T) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleFilter = (column: keyof T, value: string) => {
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (selection) {
      const allIds = checked ? data.map(row => row.id) : [];
      selection.onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (selection) {
      const newSelection = checked
        ? [...selection.selectedRows, rowId]
        : selection.selectedRows.filter(id => id !== rowId);
      selection.onSelectionChange(newSelection);
    }
  };

  const isAllSelected = selection?.selectedRows.length === data.length && data.length > 0;
  const isPartiallySelected = selection && selection.selectedRows.length > 0 && selection.selectedRows.length < data.length;

  return (
    <div className="w-full">
      {/* Table container */}
      <div className={clsx(
        'overflow-hidden rounded-3xl border transition-colors duration-300',
        actualTheme === 'dark' 
          ? 'bg-dark-800/50 backdrop-blur-sm border-white/10' 
          : 'bg-white border-gray-200'
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={clsx(
              'border-b transition-colors duration-300',
              actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
            )}>
              <tr>
                {/* Selection column */}
                {selection && (
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = !!isPartiallySelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}

                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={clsx(
                      'px-6 py-4 text-left text-sm font-semibold',
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
                      column.width && `w-${column.width}`
                    )}
                  >
                    <div className="flex flex-col space-y-2">
                      {/* Header with sorting */}
                      <div className="flex items-center space-x-2">
                        <span>{column.header}</span>
                        {column.sortable && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className={clsx(
                              'p-1 rounded hover:bg-white/10 transition-colors duration-200',
                              actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                            )}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Filter input */}
                      {column.filterable && (
                        <Input
                          placeholder={`Filter ${column.header.toLowerCase()}...`}
                          inputSize="sm"
                          value={filters[String(column.key)] || ''}
                          onChange={(e) => handleFilter(column.key, e.target.value)}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className={clsx(
              'divide-y transition-colors duration-300',
              actualTheme === 'dark' ? 'divide-white/10' : 'divide-gray-200'
            )}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12">
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-8 h-8"
                        >
                          <svg className="w-full h-full text-primary-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </motion.div>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12 text-center">
                      <div className={clsx(
                        'text-sm',
                        actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'
                      )}>
                        No data available
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        'transition-colors duration-200',
                        onRowClick && 'cursor-pointer',
                        actualTheme === 'dark' 
                          ? 'hover:bg-white/5' 
                          : 'hover:bg-gray-50',
                        selection?.selectedRows.includes(row.id) && (
                          actualTheme === 'dark' 
                            ? 'bg-primary-500/10' 
                            : 'bg-primary-50'
                        )
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {/* Selection checkbox */}
                      {selection && (
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selection.selectedRows.includes(row.id)}
                            onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          />
                        </td>
                      )}

                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={clsx(
                            'px-6 py-4 text-sm',
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {column.render ? 
                            column.render(row[column.key], row) : 
                            String(row[column.key] || '')
                          }
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className={clsx(
            'px-6 py-4 border-t flex items-center justify-between transition-colors duration-300',
            actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'
          )}>
            <div className={clsx(
              'flex items-center space-x-4 text-sm',
              actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'
            )}>
              <span>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </span>
              
              <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                  className={clsx(
                    'rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    actualTheme === 'dark' 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  )}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNumber = Math.max(1, pagination.page - 2) + i;
                if (pageNumber > Math.ceil(pagination.total / pagination.limit)) return null;
                
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}