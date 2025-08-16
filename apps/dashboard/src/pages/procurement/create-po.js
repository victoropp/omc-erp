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
const CreatePurchaseOrderPage = () => {
    const [step, setStep] = (0, react_1.useState)(1);
    const [suppliers, setSuppliers] = (0, react_1.useState)([]);
    const [products, setProducts] = (0, react_1.useState)([]);
    const [selectedSupplier, setSelectedSupplier] = (0, react_1.useState)(null);
    const [budgetInfo, setBudgetInfo] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [poData, setPOData] = (0, react_1.useState)({
        department: 'Operations',
        priority: 'MEDIUM',
        expectedDelivery: '',
        deliveryAddress: '',
        remarks: '',
        budgetCode: '',
        requestedBy: 'John Mensah'
    });
    const [lineItems, setLineItems] = (0, react_1.useState)([
        {
            id: '1',
            productId: '',
            productCode: '',
            productName: '',
            description: '',
            quantity: 1,
            unit: '',
            unitPrice: 0,
            totalPrice: 0,
            specifications: '',
            expectedDelivery: '',
            budget: ''
        }
    ]);
    (0, react_1.useEffect)(() => {
        loadInitialData();
    }, []);
    (0, react_1.useEffect)(() => {
        calculateTotals();
    }, [lineItems]);
    (0, react_1.useEffect)(() => {
        if (poData.department) {
            loadBudgetInfo();
        }
    }, [poData.department]);
    const loadInitialData = async () => {
        try {
            setLoading(true);
            // const [supplierData, productData] = await Promise.all([
            //   procurementService.getSuppliers(),
            //   procurementService.getProducts()
            // ]);
            setSuppliers(sampleSuppliers);
            setProducts(sampleProducts);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to load initial data');
        }
        finally {
            setLoading(false);
        }
    };
    const loadBudgetInfo = async () => {
        try {
            // const budget = await procurementService.getDepartmentBudget(poData.department);
            setBudgetInfo(sampleBudgetInfo);
        }
        catch (error) {
            console.error('Failed to load budget information');
        }
    };
    const handleSupplierChange = (supplierId) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        setSelectedSupplier(supplier || null);
    };
    const handleProductSelect = (index, productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const updatedItems = [...lineItems];
            updatedItems[index] = {
                ...updatedItems[index],
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                description: product.description,
                unit: product.unit,
                unitPrice: product.standardPrice,
                totalPrice: updatedItems[index].quantity * product.standardPrice
            };
            setLineItems(updatedItems);
        }
    };
    const handleLineItemChange = (index, field, value) => {
        const updatedItems = [...lineItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
        }
        setLineItems(updatedItems);
    };
    const addLineItem = () => {
        const newItem = {
            id: Date.now().toString(),
            productId: '',
            productCode: '',
            productName: '',
            description: '',
            quantity: 1,
            unit: '',
            unitPrice: 0,
            totalPrice: 0,
            specifications: '',
            expectedDelivery: '',
            budget: ''
        };
        setLineItems([...lineItems, newItem]);
    };
    const removeLineItem = (index) => {
        if (lineItems.length > 1) {
            const updatedItems = lineItems.filter((_, i) => i !== index);
            setLineItems(updatedItems);
        }
    };
    const calculateTotals = () => {
        return lineItems.reduce((total, item) => total + item.totalPrice, 0);
    };
    const calculateTax = (subtotal) => {
        return subtotal * 0.15; // 15% VAT
    };
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const poPayload = {
                supplierId: selectedSupplier?.id,
                department: poData.department,
                priority: poData.priority,
                expectedDelivery: poData.expectedDelivery,
                deliveryAddress: poData.deliveryAddress,
                remarks: poData.remarks,
                budgetCode: poData.budgetCode,
                requestedBy: poData.requestedBy,
                lineItems: lineItems.filter(item => item.productId && item.quantity > 0),
                subtotal: calculateTotals(),
                taxAmount: calculateTax(calculateTotals()),
                totalAmount: calculateTotals() + calculateTax(calculateTotals())
            };
            // await procurementService.createPurchaseOrder(poPayload);
            react_hot_toast_1.toast.success('Purchase order created successfully');
            // Redirect to purchase orders list
            setTimeout(() => {
                window.location.href = '/procurement/purchase-orders';
            }, 1500);
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to create purchase order');
        }
        finally {
            setLoading(false);
        }
    };
    const canProceedToNext = () => {
        switch (step) {
            case 1:
                return selectedSupplier && poData.department && poData.expectedDelivery;
            case 2:
                return lineItems.some(item => item.productId && item.quantity > 0);
            case 3:
                return true;
            default:
                return false;
        }
    };
    const subtotal = calculateTotals();
    const taxAmount = calculateTax(subtotal);
    const totalAmount = subtotal + taxAmount;
    // Sample data
    const sampleSuppliers = [
        {
            id: '1',
            name: 'Tema Oil Refinery',
            email: 'procurement@tor.com.gh',
            phone: '+233-303-202-000',
            category: 'Fuel Supplier',
            paymentTerms: 'NET_30',
            currency: 'GHS'
        },
        {
            id: '2',
            name: 'Ghana Equipment Ltd',
            email: 'sales@ghequipment.com',
            phone: '+233-302-123-456',
            category: 'Equipment Supplier',
            paymentTerms: 'NET_45',
            currency: 'GHS'
        },
        {
            id: '3',
            name: 'Safety Systems Ghana',
            email: 'info@safetysystems.gh',
            phone: '+233-301-987-654',
            category: 'Safety Equipment',
            paymentTerms: 'NET_30',
            currency: 'GHS'
        }
    ];
    const sampleProducts = [
        {
            id: '1',
            code: 'FUEL-PMS-001',
            name: 'Premium Motor Spirit',
            category: 'Fuel',
            unit: 'Litres',
            standardPrice: 8.50,
            description: 'Premium Motor Spirit (Petrol) - 95 Octane'
        },
        {
            id: '2',
            code: 'FUEL-AGO-001',
            name: 'Automotive Gas Oil',
            category: 'Fuel',
            unit: 'Litres',
            standardPrice: 7.80,
            description: 'Automotive Gas Oil (Diesel)'
        },
        {
            id: '3',
            code: 'EQUIP-PUMP-001',
            name: 'Fuel Dispenser Pump',
            category: 'Equipment',
            unit: 'Unit',
            standardPrice: 15000,
            description: 'High-capacity fuel dispenser pump'
        },
        {
            id: '4',
            code: 'SAFETY-HELM-001',
            name: 'Safety Helmet',
            category: 'Safety',
            unit: 'Unit',
            standardPrice: 45,
            description: 'Industrial safety helmet'
        }
    ];
    const sampleBudgetInfo = {
        departmentBudget: 10000000,
        usedBudget: 6500000,
        availableBudget: 3500000,
        budgetCode: 'OPS-2024-Q1'
    };
    const departments = [
        { value: 'Operations', label: 'Operations' },
        { value: 'Maintenance', label: 'Maintenance' },
        { value: 'Safety', label: 'Safety & Compliance' },
        { value: 'Administration', label: 'Administration' },
        { value: 'Finance', label: 'Finance' },
        { value: 'IT', label: 'Information Technology' },
    ];
    const priorities = [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'URGENT', label: 'Urgent' },
    ];
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Create Purchase Order
            </h1>
            <p className="text-dark-400 mt-2">
              Step {step} of 3: {step === 1 ? 'Basic Information' :
            step === 2 ? 'Order Items' :
                'Review & Submit'}
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" onClick={() => window.location.href = '/procurement/purchase-orders'}>
              Cancel
            </ui_1.Button>
            <ui_1.Button variant="outline" onClick={() => {
            // Save as draft
            react_hot_toast_1.toast.success('Purchase order saved as draft');
        }}>
              Save Draft
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNum) => (<div key={stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${stepNum === step
                ? 'bg-primary-500 text-white'
                : stepNum < step
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-600 text-dark-400'}`}>
                {stepNum < step ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>) : (stepNum)}
              </div>
              {stepNum < 3 && (<div className={`w-16 h-1 transition-colors ${stepNum < step ? 'bg-green-500' : 'bg-dark-600'}`}/>)}
            </div>))}
        </div>

        {/* Step Content */}
        <framer_motion_1.motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {step === 1 && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Basic Purchase Order Information"/>
                <ui_1.CardContent>
                  <div className="space-y-6">
                    {/* Supplier Selection */}
                    <div>
                      <ui_1.Select label="Supplier" options={suppliers.map(s => ({ value: s.id, label: s.name }))} value={selectedSupplier?.id || ''} onChange={handleSupplierChange} required/>
                      {selectedSupplier && (<div className="mt-4 p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                          <h4 className="text-white font-medium mb-2">Supplier Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-dark-400">Email: </span>
                              <span className="text-white">{selectedSupplier.email}</span>
                            </div>
                            <div>
                              <span className="text-dark-400">Phone: </span>
                              <span className="text-white">{selectedSupplier.phone}</span>
                            </div>
                            <div>
                              <span className="text-dark-400">Category: </span>
                              <span className="text-white">{selectedSupplier.category}</span>
                            </div>
                            <div>
                              <span className="text-dark-400">Payment Terms: </span>
                              <span className="text-white">{selectedSupplier.paymentTerms}</span>
                            </div>
                          </div>
                        </div>)}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ui_1.Select label="Department" options={departments} value={poData.department} onChange={(value) => setPOData({ ...poData, department: value })} required/>
                      <ui_1.Select label="Priority" options={priorities} value={poData.priority} onChange={(value) => setPOData({ ...poData, priority: value })} required/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ui_1.Input label="Expected Delivery Date" type="date" value={poData.expectedDelivery} onChange={(e) => setPOData({ ...poData, expectedDelivery: e.target.value })} required/>
                      <ui_1.Input label="Requested By" value={poData.requestedBy} onChange={(e) => setPOData({ ...poData, requestedBy: e.target.value })} required/>
                    </div>

                    <ui_1.Input label="Delivery Address" value={poData.deliveryAddress} onChange={(e) => setPOData({ ...poData, deliveryAddress: e.target.value })} placeholder="Enter delivery address" multiline/>

                    <ui_1.Input label="Remarks" value={poData.remarks} onChange={(e) => setPOData({ ...poData, remarks: e.target.value })} placeholder="Additional remarks or instructions" multiline/>

                    {/* Budget Information */}
                    {budgetInfo && (<div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <h4 className="text-white font-medium mb-3">Department Budget Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-dark-400">Total Budget: </span>
                            <span className="text-white font-medium">
                              GHS {new Intl.NumberFormat('en-US').format(budgetInfo.departmentBudget)}
                            </span>
                          </div>
                          <div>
                            <span className="text-dark-400">Used Budget: </span>
                            <span className="text-yellow-400 font-medium">
                              GHS {new Intl.NumberFormat('en-US').format(budgetInfo.usedBudget)}
                            </span>
                          </div>
                          <div>
                            <span className="text-dark-400">Available: </span>
                            <span className="text-green-400 font-medium">
                              GHS {new Intl.NumberFormat('en-US').format(budgetInfo.availableBudget)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-dark-400">Budget Code: </span>
                          <span className="text-white">{budgetInfo.budgetCode}</span>
                        </div>
                      </div>)}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {step === 2 && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Purchase Order Items" action={<ui_1.Button variant="outline" size="sm" onClick={addLineItem}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Add Item
                    </ui_1.Button>}/>
                <ui_1.CardContent>
                  <div className="space-y-6">
                    {lineItems.map((item, index) => (<div key={item.id} className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-white font-medium">Item {index + 1}</h4>
                          {lineItems.length > 1 && (<ui_1.Button variant="ghost" size="sm" onClick={() => removeLineItem(index)} className="text-red-400 hover:text-red-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </ui_1.Button>)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <ui_1.Select label="Product" options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))} value={item.productId} onChange={(value) => handleProductSelect(index, value)} placeholder="Select a product"/>
                          <ui_1.Input label="Product Code" value={item.productCode} readOnly className="bg-dark-800/50"/>
                        </div>

                        <div className="mb-4">
                          <ui_1.Input label="Description" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} placeholder="Item description" multiline/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <ui_1.Input label="Quantity" type="number" min="1" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} required/>
                          <ui_1.Input label="Unit" value={item.unit} readOnly className="bg-dark-800/50"/>
                          <ui_1.Input label="Unit Price (GHS)" type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} required/>
                          <ui_1.Input label="Total Price (GHS)" value={item.totalPrice.toFixed(2)} readOnly className="bg-dark-800/50 font-medium"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ui_1.Input label="Specifications" value={item.specifications} onChange={(e) => handleLineItemChange(index, 'specifications', e.target.value)} placeholder="Special specifications or requirements"/>
                          <ui_1.Input label="Expected Delivery" type="date" value={item.expectedDelivery} onChange={(e) => handleLineItemChange(index, 'expectedDelivery', e.target.value)}/>
                        </div>
                      </div>))}
                  </div>

                  {/* Totals Summary */}
                  <div className="mt-6 p-4 bg-primary-500/10 rounded-lg border border-primary-500/30">
                    <h4 className="text-white font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Subtotal:</span>
                        <span className="text-white font-medium">GHS {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">VAT (15%):</span>
                        <span className="text-white font-medium">GHS {taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total Amount:</span>
                        <span className="text-primary-400">GHS {totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {budgetInfo && totalAmount > budgetInfo.availableBudget && (<div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/30">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>
                          <span className="text-red-400 text-sm">
                            Order total exceeds available budget by GHS {(totalAmount - budgetInfo.availableBudget).toFixed(2)}
                          </span>
                        </div>
                      </div>)}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {step === 3 && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Review Purchase Order"/>
                <ui_1.CardContent>
                  <div className="space-y-6">
                    {/* Supplier Information */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Supplier Information</h4>
                      <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-dark-400">Supplier: </span>
                            <span className="text-white font-medium">{selectedSupplier?.name}</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Email: </span>
                            <span className="text-white">{selectedSupplier?.email}</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Category: </span>
                            <span className="text-white">{selectedSupplier?.category}</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Payment Terms: </span>
                            <span className="text-white">{selectedSupplier?.paymentTerms}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Order Information</h4>
                      <div className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-dark-400">Department: </span>
                            <span className="text-white">{poData.department}</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Priority: </span>
                            <ui_1.Badge variant={poData.priority === 'URGENT' ? 'danger' :
                poData.priority === 'HIGH' ? 'warning' :
                    poData.priority === 'MEDIUM' ? 'primary' : 'secondary'}>
                              {poData.priority}
                            </ui_1.Badge>
                          </div>
                          <div>
                            <span className="text-dark-400">Expected Delivery: </span>
                            <span className="text-white">{poData.expectedDelivery}</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Requested By: </span>
                            <span className="text-white">{poData.requestedBy}</span>
                          </div>
                        </div>
                        {poData.deliveryAddress && (<div className="mt-4">
                            <span className="text-dark-400">Delivery Address: </span>
                            <span className="text-white">{poData.deliveryAddress}</span>
                          </div>)}
                        {poData.remarks && (<div className="mt-4">
                            <span className="text-dark-400">Remarks: </span>
                            <span className="text-white">{poData.remarks}</span>
                          </div>)}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {lineItems.filter(item => item.productId && item.quantity > 0).map((item, index) => (<div key={item.id} className="p-4 bg-dark-800/30 rounded-lg border border-dark-600">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <span className="text-dark-400">Product: </span>
                                <span className="text-white font-medium">{item.productCode}</span>
                                <p className="text-sm text-dark-300">{item.productName}</p>
                              </div>
                              <div>
                                <span className="text-dark-400">Quantity: </span>
                                <span className="text-white">{item.quantity} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-dark-400">Unit Price: </span>
                                <span className="text-white">GHS {item.unitPrice.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-dark-400">Total: </span>
                                <span className="text-white font-medium">GHS {item.totalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                            {item.description && (<div className="mt-2">
                                <span className="text-dark-400">Description: </span>
                                <span className="text-white">{item.description}</span>
                              </div>)}
                          </div>))}
                      </div>
                    </div>

                    {/* Final Totals */}
                    <div className="p-4 bg-primary-500/10 rounded-lg border border-primary-500/30">
                      <h4 className="text-white font-medium mb-3">Final Totals</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-dark-400">Subtotal:</span>
                          <span className="text-white font-medium">GHS {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">VAT (15%):</span>
                          <span className="text-white font-medium">GHS {taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                          <span className="text-white">Total Amount:</span>
                          <span className="text-primary-400">GHS {totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {step > 1 && (<ui_1.Button variant="outline" onClick={() => setStep(step - 1)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Previous
              </ui_1.Button>)}
          </div>

          <div className="flex space-x-4">
            {step < 3 ? (<ui_1.Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceedToNext()}>
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </ui_1.Button>) : (<ui_1.Button variant="primary" onClick={handleSubmit} disabled={loading || !canProceedToNext()}>
                {loading ? 'Creating...' : 'Submit Purchase Order'}
                {!loading && (<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>)}
              </ui_1.Button>)}
          </div>
        </div>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = CreatePurchaseOrderPage;
//# sourceMappingURL=create-po.js.map