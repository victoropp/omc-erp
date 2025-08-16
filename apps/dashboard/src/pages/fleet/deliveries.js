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
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const DeliveriesPage = () => {
    const [deliveries, setDeliveries] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedDelivery, setSelectedDelivery] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('list');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterDate, setFilterDate] = (0, react_1.useState)(new Date().toISOString().split('T')[0]);
    const [showOptimizeModal, setShowOptimizeModal] = (0, react_1.useState)(false);
    const [selectedDeliveries, setSelectedDeliveries] = (0, react_1.useState)([]);
    const [deliveryForm, setDeliveryForm] = (0, react_1.useState)({
        deliveryNumber: '',
        vehicleId: '',
        customerId: '',
        productName: 'Petrol (Premium)',
        productType: 'petrol',
        quantity: 0,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '08:00',
        priority: 'normal',
        unitPrice: 0,
        deliveryFee: 50,
        notes: ''
    });
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [deliveriesData, vehiclesData, customersData] = await Promise.all([
                api_1.fleetService.getDeliveries(),
                api_1.fleetService.getVehicles(),
                // Assuming we have a customer service
                Promise.resolve([])
            ]);
            setDeliveries(deliveriesData || generateMockDeliveryData());
            setVehicles(vehiclesData || []);
            setCustomers(customersData || generateMockCustomerData());
        }
        catch (error) {
            console.error('Failed to load data:', error);
            setDeliveries(generateMockDeliveryData());
            setCustomers(generateMockCustomerData());
            react_hot_toast_1.toast.error('Failed to load delivery data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockDeliveryData = () => [
        {
            id: 'd1',
            deliveryNumber: 'DEL-2024-001',
            vehicleId: '1',
            vehicle: {
                plateNumber: 'GH-4567-23',
                type: 'tanker',
                capacity: 35000,
                driver: {
                    name: 'Kwame Asante',
                    phone: '+233-24-567-8901'
                }
            },
            customerId: 'c1',
            customer: {
                name: 'Shell Station - Airport',
                address: 'Kotoka International Airport, Accra',
                phone: '+233-30-123-4567',
                type: 'retail'
            },
            product: {
                name: 'Petrol (Premium)',
                type: 'petrol',
                quantity: 25000,
                unit: 'liters'
            },
            status: 'in-transit',
            priority: 'normal',
            scheduledDate: '2024-01-13',
            scheduledTime: '08:00',
            actualDeliveryTime: undefined,
            estimatedArrival: '2024-01-13T10:30:00Z',
            route: {
                origin: 'Tema Oil Depot',
                destination: 'Shell Station - Airport',
                distance: 25.5,
                estimatedDuration: 45,
                optimized: true
            },
            pricing: {
                unitPrice: 8.50,
                totalAmount: 212500,
                deliveryFee: 150,
                taxes: 21250
            },
            documents: {
                deliveryNote: true,
                invoice: true,
                qualityCertificate: true,
                receivingSlip: false
            },
            tracking: {
                currentLocation: 'Spintex Road',
                progress: 65,
                eta: '10:25 AM'
            },
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-13T09:15:00Z'
        },
        {
            id: 'd2',
            deliveryNumber: 'DEL-2024-002',
            vehicleId: '2',
            vehicle: {
                plateNumber: 'GH-7890-23',
                type: 'delivery',
                capacity: 5000,
                driver: {
                    name: 'Akosua Mensa',
                    phone: '+233-20-345-6789'
                }
            },
            customerId: 'c2',
            customer: {
                name: 'Total Station - East Legon',
                address: 'East Legon, Accra',
                phone: '+233-30-987-6543',
                type: 'retail'
            },
            product: {
                name: 'Diesel',
                type: 'diesel',
                quantity: 4000,
                unit: 'liters'
            },
            status: 'scheduled',
            priority: 'normal',
            scheduledDate: '2024-01-13',
            scheduledTime: '14:00',
            route: {
                origin: 'Tema Oil Depot',
                destination: 'Total Station - East Legon',
                distance: 18.2,
                estimatedDuration: 35,
                optimized: true
            },
            pricing: {
                unitPrice: 9.20,
                totalAmount: 36800,
                deliveryFee: 100,
                taxes: 3680
            },
            documents: {
                deliveryNote: true,
                invoice: true,
                qualityCertificate: true,
                receivingSlip: false
            },
            tracking: {
                progress: 0
            },
            createdAt: '2024-01-11T10:30:00Z',
            updatedAt: '2024-01-11T10:30:00Z'
        },
        {
            id: 'd3',
            deliveryNumber: 'DEL-2024-003',
            vehicleId: '1',
            vehicle: {
                plateNumber: 'GH-4567-23',
                type: 'tanker',
                capacity: 35000,
                driver: {
                    name: 'Kwame Asante',
                    phone: '+233-24-567-8901'
                }
            },
            customerId: 'c3',
            customer: {
                name: 'Goil Station - Weija',
                address: 'Weija Junction, Accra',
                phone: '+233-24-111-2222',
                type: 'retail'
            },
            product: {
                name: 'Petrol (Premium)',
                type: 'petrol',
                quantity: 30000,
                unit: 'liters'
            },
            status: 'delivered',
            priority: 'normal',
            scheduledDate: '2024-01-12',
            scheduledTime: '09:00',
            actualDeliveryTime: '2024-01-12T11:45:00Z',
            route: {
                origin: 'Tema Oil Depot',
                destination: 'Goil Station - Weija',
                distance: 35.8,
                estimatedDuration: 60,
                optimized: true
            },
            pricing: {
                unitPrice: 8.50,
                totalAmount: 255000,
                deliveryFee: 200,
                taxes: 25500
            },
            documents: {
                deliveryNote: true,
                invoice: true,
                qualityCertificate: true,
                receivingSlip: true
            },
            tracking: {
                progress: 100
            },
            createdAt: '2024-01-09T08:00:00Z',
            updatedAt: '2024-01-12T11:45:00Z'
        }
    ];
    const generateMockCustomerData = () => [
        {
            id: 'c1',
            name: 'Shell Station - Airport',
            address: 'Kotoka International Airport, Accra',
            phone: '+233-30-123-4567',
            type: 'retail'
        },
        {
            id: 'c2',
            name: 'Total Station - East Legon',
            address: 'East Legon, Accra',
            phone: '+233-30-987-6543',
            type: 'retail'
        },
        {
            id: 'c3',
            name: 'Goil Station - Weija',
            address: 'Weija Junction, Accra',
            phone: '+233-24-111-2222',
            type: 'retail'
        }
    ];
    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = delivery.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
        const matchesDate = filterDate === '' || delivery.scheduledDate === filterDate;
        return matchesSearch && matchesStatus && matchesDate;
    });
    const todayDeliveries = deliveries.filter(d => d.scheduledDate === new Date().toISOString().split('T')[0]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'in-transit': return 'warning';
            case 'delivered': return 'success';
            case 'failed': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'default';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'normal': return 'primary';
            case 'high': return 'warning';
            case 'urgent': return 'danger';
            default: return 'default';
        }
    };
    const handleCreateDelivery = () => {
        setIsEditMode(false);
        setDeliveryForm({
            deliveryNumber: `DEL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            vehicleId: '',
            customerId: '',
            productName: 'Petrol (Premium)',
            productType: 'petrol',
            quantity: 0,
            scheduledDate: new Date().toISOString().split('T')[0],
            scheduledTime: '08:00',
            priority: 'normal',
            unitPrice: 0,
            deliveryFee: 50,
            notes: ''
        });
        setIsModalOpen(true);
    };
    const handleSaveDelivery = async () => {
        try {
            if (isEditMode && selectedDelivery) {
                await api_1.fleetService.updateDelivery(selectedDelivery.id, deliveryForm);
                react_hot_toast_1.toast.success('Delivery updated successfully');
            }
            else {
                await api_1.fleetService.createDelivery(deliveryForm);
                react_hot_toast_1.toast.success('Delivery scheduled successfully');
            }
            setIsModalOpen(false);
            loadData();
        }
        catch (error) {
            console.error('Failed to save delivery:', error);
            react_hot_toast_1.toast.error('Failed to save delivery');
        }
    };
    const handleOptimizeRoutes = async () => {
        if (selectedDeliveries.length < 2) {
            react_hot_toast_1.toast.error('Please select at least 2 deliveries to optimize');
            return;
        }
        try {
            await api_1.fleetService.optimizeRoute(selectedDeliveries);
            react_hot_toast_1.toast.success('Routes optimized successfully');
            setShowOptimizeModal(false);
            setSelectedDeliveries([]);
            loadData();
        }
        catch (error) {
            console.error('Failed to optimize routes:', error);
            react_hot_toast_1.toast.error('Failed to optimize routes');
        }
    };
    const handleUpdateStatus = async (deliveryId, status) => {
        try {
            await api_1.fleetService.updateDeliveryStatus(deliveryId, status);
            react_hot_toast_1.toast.success('Delivery status updated');
            loadData();
        }
        catch (error) {
            console.error('Failed to update status:', error);
            react_hot_toast_1.toast.error('Failed to update status');
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Delivery Management</h1>
            <p className="text-dark-400 mt-2">
              Schedule, track, and optimize fuel deliveries across Ghana
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ui_1.Button variant="outline" onClick={() => setShowOptimizeModal(true)} disabled={selectedDeliveries.length < 2}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Optimize Routes
            </ui_1.Button>
            
            <ui_1.Button variant="primary" onClick={handleCreateDelivery}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Schedule Delivery
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Today's Deliveries</p>
                  <p className="text-2xl font-bold text-white">{todayDeliveries.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">In Transit</p>
                  <p className="text-2xl font-bold text-white">
                    {deliveries.filter(d => d.status === 'in-transit').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {deliveries.filter(d => d.status === 'delivered').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Volume</p>
                  <p className="text-2xl font-bold text-white">
                    {(todayDeliveries.reduce((sum, d) => sum + d.product.quantity, 0) / 1000).toFixed(1)}K L
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Active Deliveries Alert */}
        {todayDeliveries.filter(d => d.status === 'in-transit').length > 0 && (<ui_1.Card className="border-l-4 border-l-blue-500">
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white mb-2">Active Deliveries</h3>
                  <p className="text-dark-400">
                    {todayDeliveries.filter(d => d.status === 'in-transit').length} delivery(ies) currently in transit
                  </p>
                </div>
                <ui_1.Button variant="outline" size="sm">
                  Track All
                </ui_1.Button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayDeliveries.filter(d => d.status === 'in-transit').map(delivery => (<div key={delivery.id} className="p-4 bg-dark-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{delivery.deliveryNumber}</span>
                      <ui_1.Badge variant="warning" className="text-xs">In Transit</ui_1.Badge>
                    </div>
                    <p className="text-sm text-dark-400 mb-2">{delivery.customer.name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-dark-600 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${delivery.tracking.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-white">{delivery.tracking.progress}%</span>
                      </div>
                      {delivery.tracking.eta && (<span className="text-xs text-blue-400">ETA: {delivery.tracking.eta}</span>)}
                    </div>
                  </div>))}
              </div>
            </ui_1.CardContent>
          </ui_1.Card>)}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-dark-800 p-1 rounded-lg">
          {[
            { key: 'list', label: 'Delivery List' },
            { key: 'schedule', label: 'Schedule View' },
            { key: 'map', label: 'Route Map' }
        ].map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}>
              {tab.label}
            </button>))}
        </div>

        {/* Filters */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search by delivery number, customer, or vehicle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'in-transit', label: 'In Transit' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed', label: 'Failed' },
            { value: 'cancelled', label: 'Cancelled' }
        ]} className="w-full md:w-48"/>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Deliveries Table */}
        <ui_1.Card>
          <ui_1.CardHeader title="Delivery Schedule"/>
          <ui_1.CardContent>
            {loading ? (<div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>) : (<ui_1.Table headers={[
                { key: 'select', label: '' },
                { key: 'delivery', label: 'Delivery' },
                { key: 'customer', label: 'Customer' },
                { key: 'product', label: 'Product' },
                { key: 'vehicle', label: 'Vehicle' },
                { key: 'schedule', label: 'Schedule' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredDeliveries.map(delivery => ({
                select: (<input type="checkbox" checked={selectedDeliveries.includes(delivery.id)} onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedDeliveries([...selectedDeliveries, delivery.id]);
                        }
                        else {
                            setSelectedDeliveries(selectedDeliveries.filter(id => id !== delivery.id));
                        }
                    }} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>),
                delivery: (<div>
                      <p className="font-medium text-white">{delivery.deliveryNumber}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <ui_1.Badge variant={getPriorityColor(delivery.priority)} className="text-xs">
                          {delivery.priority}
                        </ui_1.Badge>
                        {delivery.route.optimized && (<ui_1.Badge variant="success" className="text-xs">Optimized</ui_1.Badge>)}
                      </div>
                      <p className="text-xs text-dark-400 mt-1">
                        {delivery.route.distance}km • {delivery.route.estimatedDuration}min
                      </p>
                    </div>),
                customer: (<div>
                      <p className="font-medium text-white">{delivery.customer.name}</p>
                      <p className="text-sm text-dark-400">{delivery.customer.address}</p>
                      <p className="text-xs text-dark-500">{delivery.customer.phone}</p>
                    </div>),
                product: (<div>
                      <p className="font-medium text-white">{delivery.product.name}</p>
                      <p className="text-sm text-dark-400">
                        {delivery.product.quantity.toLocaleString()} {delivery.product.unit}
                      </p>
                      <p className="text-xs text-green-400">
                        GHS {delivery.pricing.totalAmount.toLocaleString()}
                      </p>
                    </div>),
                vehicle: (<div>
                      <p className="font-medium text-white">{delivery.vehicle.plateNumber}</p>
                      <p className="text-sm text-dark-400">
                        {delivery.vehicle.driver?.name || 'Unassigned'}
                      </p>
                      <p className="text-xs text-dark-500 capitalize">{delivery.vehicle.type}</p>
                    </div>),
                schedule: (<div>
                      <p className="text-white">{new Date(delivery.scheduledDate).toLocaleDateString()}</p>
                      <p className="text-sm text-dark-400">{delivery.scheduledTime}</p>
                      {delivery.actualDeliveryTime && (<p className="text-xs text-green-400">
                          Delivered: {new Date(delivery.actualDeliveryTime).toLocaleString()}
                        </p>)}
                    </div>),
                status: (<div>
                      <ui_1.Badge variant={getStatusColor(delivery.status)} className="capitalize mb-2">
                        {delivery.status.replace('-', ' ')}
                      </ui_1.Badge>
                      {delivery.status === 'in-transit' && delivery.tracking.progress > 0 && (<div className="w-16">
                          <div className="w-full bg-dark-600 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${delivery.tracking.progress}%` }}></div>
                          </div>
                          <p className="text-xs text-blue-400 mt-1">{delivery.tracking.progress}%</p>
                        </div>)}
                    </div>),
                actions: (<div className="flex items-center space-x-2">
                      {delivery.status === 'scheduled' && (<ui_1.Button variant="primary" size="sm" onClick={() => handleUpdateStatus(delivery.id, 'in-transit')}>
                          Start
                        </ui_1.Button>)}
                      {delivery.status === 'in-transit' && (<ui_1.Button variant="success" size="sm" onClick={() => handleUpdateStatus(delivery.id, 'delivered')}>
                          Complete
                        </ui_1.Button>)}
                      <ui_1.Button variant="outline" size="sm" onClick={() => {
                        setSelectedDelivery(delivery);
                        // Open tracking modal or redirect to tracking page
                    }}>
                        Track
                      </ui_1.Button>
                    </div>)
            }))}/>)}
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Delivery Form Modal */}
        <ui_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Delivery' : 'Schedule New Delivery'}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Delivery Number" type="text" value={deliveryForm.deliveryNumber} onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNumber: e.target.value })} required disabled={isEditMode}/>
              
              <ui_1.Select label="Priority" value={deliveryForm.priority} onChange={(value) => setDeliveryForm({ ...deliveryForm, priority: value })} options={[
            { value: 'low', label: 'Low Priority' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High Priority' },
            { value: 'urgent', label: 'Urgent' }
        ]} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Select label="Vehicle" value={deliveryForm.vehicleId} onChange={(value) => setDeliveryForm({ ...deliveryForm, vehicleId: value })} options={vehicles.map(v => ({ value: v.id, label: `${v.plateNumber} - ${v.make} ${v.model}` }))} required/>
              
              <ui_1.Select label="Customer" value={deliveryForm.customerId} onChange={(value) => setDeliveryForm({ ...deliveryForm, customerId: value })} options={customers.map(c => ({ value: c.id, label: c.name }))} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Select label="Product" value={deliveryForm.productType} onChange={(value) => setDeliveryForm({ ...deliveryForm, productType: value })} options={[
            { value: 'petrol', label: 'Petrol' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'kerosene', label: 'Kerosene' },
            { value: 'lpg', label: 'LPG' }
        ]} required/>
              
              <ui_1.Input label="Quantity (Liters)" type="number" value={deliveryForm.quantity} onChange={(e) => setDeliveryForm({ ...deliveryForm, quantity: parseInt(e.target.value) || 0 })} min="1" required/>
              
              <ui_1.Input label="Unit Price (GHS)" type="number" value={deliveryForm.unitPrice} onChange={(e) => setDeliveryForm({ ...deliveryForm, unitPrice: parseFloat(e.target.value) || 0 })} min="0" step="0.01" required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Input label="Scheduled Date" type="date" value={deliveryForm.scheduledDate} onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduledDate: e.target.value })} required/>
              
              <ui_1.Input label="Scheduled Time" type="time" value={deliveryForm.scheduledTime} onChange={(e) => setDeliveryForm({ ...deliveryForm, scheduledTime: e.target.value })} required/>
              
              <ui_1.Input label="Delivery Fee (GHS)" type="number" value={deliveryForm.deliveryFee} onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryFee: parseFloat(e.target.value) || 0 })} min="0" step="0.01"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Notes</label>
              <textarea value={deliveryForm.notes} onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Additional delivery instructions or notes..."/>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="font-medium text-white mb-3">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dark-400">
                  <span>Product Cost:</span>
                  <span>GHS {(deliveryForm.quantity * deliveryForm.unitPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-dark-400">
                  <span>Delivery Fee:</span>
                  <span>GHS {deliveryForm.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-dark-400">
                  <span>Taxes (10%):</span>
                  <span>GHS {((deliveryForm.quantity * deliveryForm.unitPrice + deliveryForm.deliveryFee) * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-white pt-2 border-t border-dark-600">
                  <span>Total Amount:</span>
                  <span>GHS {((deliveryForm.quantity * deliveryForm.unitPrice + deliveryForm.deliveryFee) * 1.1).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveDelivery}>
                {isEditMode ? 'Update Delivery' : 'Schedule Delivery'}
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>

        {/* Route Optimization Modal */}
        <ui_1.Modal isOpen={showOptimizeModal} onClose={() => setShowOptimizeModal(false)} title="Optimize Delivery Routes">
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-2">Route Optimization</h3>
              <p className="text-sm text-dark-400">
                AI-powered route optimization will analyze traffic patterns, fuel consumption, 
                and delivery priorities to create the most efficient routes for selected deliveries.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-4">
                Selected Deliveries ({selectedDeliveries.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {deliveries.filter(d => selectedDeliveries.includes(d.id)).map(delivery => (<div key={delivery.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{delivery.deliveryNumber}</p>
                      <p className="text-sm text-dark-400">{delivery.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{delivery.route.distance}km</p>
                      <p className="text-xs text-dark-400">{delivery.route.estimatedDuration}min</p>
                    </div>
                  </div>))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {deliveries.filter(d => selectedDeliveries.includes(d.id))
            .reduce((sum, d) => sum + d.route.distance, 0)}km
                </p>
                <p className="text-sm text-dark-400">Current Total Distance</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-green-400">~25%</p>
                <p className="text-sm text-dark-400">Expected Savings</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setShowOptimizeModal(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleOptimizeRoutes}>
                Optimize Routes
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = DeliveriesPage;
//# sourceMappingURL=deliveries.js.map