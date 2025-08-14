import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui';
import { productService } from '@/services/api';
import { useNotifications } from '@/components/ui/NotificationSystem';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  type: 'fuel' | 'lubricant' | 'service';
  status: 'active' | 'inactive' | 'discontinued';
  currentPrice: number;
  cost: number;
  margin: number;
  inventory: {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    reorderLevel: number;
    maxStock: number;
  };
  specifications: {
    octaneRating?: number;
    density?: number;
    flashPoint?: number;
    pourPoint?: number;
    viscosity?: string;
    sulphurContent?: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { addNotification } = useNotifications();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'kerosene', label: 'Kerosene' },
    { value: 'lubricants', label: 'Lubricants' },
    { value: 'additives', label: 'Additives' },
    { value: 'services', label: 'Services' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'lubricant', label: 'Lubricant' },
    { value: 'service', label: 'Service' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discontinued', label: 'Discontinued' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy,
        sortOrder
      };
      
      const response = await productService.getProducts(filters);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayedFetch);
  }, [searchTerm, selectedCategory, selectedType, selectedStatus, sortBy, sortOrder]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await productService.bulkUpdateProducts(
        selectedProducts.map(id => ({ id, status }))
      );
      toast.success(`Updated ${selectedProducts.length} products`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update products');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const blob = await productService.exportProducts(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Products exported successfully');
      setShowExportModal(false);
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await productService.importProducts(file);
      toast.success('Products imported successfully');
      fetchProducts();
      setShowImportModal(false);
    } catch (error) {
      toast.error('Failed to import products');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discontinued': return 'danger';
      default: return 'default';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'fuel': return 'primary';
      case 'lubricant': return 'secondary';
      case 'service': return 'outline';
      default: return 'default';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  return (
    <FuturisticDashboardLayout 
      title="Products Management" 
      subtitle="Manage fuel products, lubricants, and services"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                options={categories}
                className="w-40"
              />
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                options={types}
                className="w-32"
              />
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={statuses}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              Import
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              Export
            </Button>
            <Link href="/products/create">
              <Button>
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('active')}
                >
                  Mark Active
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('inactive')}
                >
                  Mark Inactive
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Products Overview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} of {products.length} products
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  Select All
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Margin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.code}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getTypeBadgeColor(product.type)}>
                            {product.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 capitalize">{product.category}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-bold">₵{product.currentPrice.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{product.inventory.availableStock.toLocaleString()}</div>
                            <div className="text-gray-500">Available</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${product.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/products/${product.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                            <Link href={`/products/${product.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/products/categories">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Manage Categories</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Organize product categories</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/products/pricing-rules">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Pricing Rules</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure pricing automation</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/analytics/inventory">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Inventory Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View inventory insights</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Products"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Choose the format for exporting products data.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => handleExport('xlsx')}
              className="flex-1"
            >
              Export as Excel
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className="flex-1"
            >
              Export as CSV
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Products"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Upload a CSV or Excel file to import products.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
              }
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>
      </Modal>
    </FuturisticDashboardLayout>
  );
};

export default ProductsManagement;