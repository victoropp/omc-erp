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
const Card_1 = require("@/components/ui/Card");
const Button_1 = require("@/components/ui/Button");
const Input_1 = require("@/components/ui/Input");
const Select_1 = require("@/components/ui/Select");
const Table_1 = require("@/components/ui/Table");
const Modal_1 = require("@/components/ui/Modal");
const UPPFRoutes = () => {
    const [routes] = (0, react_1.useState)([
        {
            id: '1',
            routeCode: 'TEMA-KUMASI-001',
            routeName: 'Tema to Kumasi Primary',
            origin: 'Tema Oil Refinery',
            destination: 'Kumasi Regional Depot',
            distance: 268.5,
            estimatedTravelTime: 4.5,
            uppfRate: 8.333,
            fuelTypes: ['PMS', 'AGO', 'KERO'],
            status: 'active',
            region: 'Ashanti',
            createdDate: '2024-01-15',
            lastUpdated: '2025-01-10',
            averageVolume: 15000,
            totalClaims: 156,
            totalAmount: 1875000,
            notes: 'Primary route for Ashanti region distribution'
        },
        {
            id: '2',
            routeCode: 'ACCRA-TAMALE-002',
            routeName: 'Accra to Tamale Highway',
            origin: 'Achimota Depot',
            destination: 'Tamale Regional Hub',
            distance: 548.2,
            estimatedTravelTime: 8.0,
            uppfRate: 10.125,
            fuelTypes: ['PMS', 'AGO'],
            status: 'active',
            region: 'Northern',
            createdDate: '2024-02-20',
            lastUpdated: '2025-01-08',
            averageVolume: 12000,
            totalClaims: 89,
            totalAmount: 1068750,
            notes: 'High-priority northern corridor route'
        },
        {
            id: '3',
            routeCode: 'TAKORADI-WA-001',
            routeName: 'Takoradi to Wa Express',
            origin: 'Takoradi Main Depot',
            destination: 'Wa Distribution Center',
            distance: 421.7,
            estimatedTravelTime: 6.5,
            uppfRate: 7.857,
            fuelTypes: ['PMS', 'AGO', 'LPG'],
            status: 'under_review',
            region: 'Upper West',
            createdDate: '2024-03-10',
            lastUpdated: '2025-01-12',
            averageVolume: 9500,
            totalClaims: 67,
            totalAmount: 736250,
            notes: 'Route under review due to road construction delays'
        },
        {
            id: '4',
            routeCode: 'ACCRA-BOLGA-003',
            routeName: 'Accra to Bolgatanga Direct',
            origin: 'Achimota Total Station',
            destination: 'Bolgatanga Regional Office',
            distance: 687.3,
            estimatedTravelTime: 10.0,
            uppfRate: 12.500,
            fuelTypes: ['AGO', 'KERO'],
            status: 'active',
            region: 'Upper East',
            createdDate: '2024-01-25',
            lastUpdated: '2025-01-05',
            averageVolume: 8000,
            totalClaims: 45,
            totalAmount: 562500,
            notes: 'Long-haul route requiring special permits'
        },
        {
            id: '5',
            routeCode: 'TEMA-CAPE-001',
            routeName: 'Tema to Cape Coast Coastal',
            origin: 'Tema Oil Refinery',
            destination: 'Cape Coast Distribution Hub',
            distance: 165.8,
            estimatedTravelTime: 3.0,
            uppfRate: 5.625,
            fuelTypes: ['PMS', 'AGO', 'LPG', 'KERO'],
            status: 'suspended',
            region: 'Central',
            createdDate: '2024-04-05',
            lastUpdated: '2024-12-15',
            averageVolume: 18000,
            totalClaims: 0,
            totalAmount: 0,
            notes: 'Suspended due to bridge repairs on coastal highway'
        }
    ]);
    const [routePerformance] = (0, react_1.useState)([
        {
            routeId: '1',
            month: '2025-01',
            claims: 12,
            volume: 180000,
            amount: 225000,
            averageDeliveryTime: 4.8,
            onTimeDeliveries: 10,
            delayedDeliveries: 2
        },
        {
            routeId: '1',
            month: '2024-12',
            claims: 15,
            volume: 225000,
            amount: 281250,
            averageDeliveryTime: 4.3,
            onTimeDeliveries: 14,
            delayedDeliveries: 1
        },
        {
            routeId: '2',
            month: '2025-01',
            claims: 8,
            volume: 96000,
            amount: 120000,
            averageDeliveryTime: 8.5,
            onTimeDeliveries: 6,
            delayedDeliveries: 2
        }
    ]);
    const [selectedRoute, setSelectedRoute] = (0, react_1.useState)(null);
    const [showRouteModal, setShowRouteModal] = (0, react_1.useState)(false);
    const [showPerformanceModal, setShowPerformanceModal] = (0, react_1.useState)(false);
    const [activeTab, setActiveTab] = (0, react_1.useState)('routes');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [regionFilter, setRegionFilter] = (0, react_1.useState)('all');
    const [fuelTypeFilter, setFuelTypeFilter] = (0, react_1.useState)('all');
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const filteredRoutes = (0, react_1.useMemo)(() => {
        return routes.filter(route => {
            const matchesSearch = route.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                route.destination.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
            const matchesRegion = regionFilter === 'all' || route.region === regionFilter;
            const matchesFuelType = fuelTypeFilter === 'all' || route.fuelTypes.includes(fuelTypeFilter);
            return matchesSearch && matchesStatus && matchesRegion && matchesFuelType;
        });
    }, [routes, searchTerm, statusFilter, regionFilter, fuelTypeFilter]);
    const getStatusColor = (status) => {
        const colors = {
            active: 'text-green-400 bg-green-400/10 border-green-400/30',
            inactive: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
            suspended: 'text-red-400 bg-red-400/10 border-red-400/30',
            under_review: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
        };
        return colors[status] || colors.inactive;
    };
    const getStatusText = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'under_review', label: 'Under Review' }
    ];
    const regionOptions = [
        { value: 'all', label: 'All Regions' },
        { value: 'Greater Accra', label: 'Greater Accra' },
        { value: 'Ashanti', label: 'Ashanti' },
        { value: 'Northern', label: 'Northern' },
        { value: 'Western', label: 'Western' },
        { value: 'Eastern', label: 'Eastern' },
        { value: 'Central', label: 'Central' },
        { value: 'Volta', label: 'Volta' },
        { value: 'Upper East', label: 'Upper East' },
        { value: 'Upper West', label: 'Upper West' },
        { value: 'Brong Ahafo', label: 'Brong Ahafo' }
    ];
    const fuelTypeOptions = [
        { value: 'all', label: 'All Fuel Types' },
        { value: 'PMS', label: 'Petrol (PMS)' },
        { value: 'AGO', label: 'Diesel (AGO)' },
        { value: 'LPG', label: 'Gas (LPG)' },
        { value: 'KERO', label: 'Kerosene' }
    ];
    const routeTableColumns = [
        { key: 'routeCode', label: 'Route Code' },
        { key: 'routeName', label: 'Route Name' },
        { key: 'route', label: 'Origin → Destination' },
        { key: 'distance', label: 'Distance (km)' },
        { key: 'uppfRate', label: 'UPPF Rate (₵)' },
        { key: 'fuelTypes', label: 'Fuel Types' },
        { key: 'status', label: 'Status' },
        { key: 'totalClaims', label: 'Claims' },
        { key: 'actions', label: 'Actions' }
    ];
    const routeTableData = filteredRoutes.map(route => ({
        routeCode: route.routeCode,
        routeName: route.routeName,
        route: `${route.origin} → ${route.destination}`,
        distance: route.distance.toFixed(1),
        uppfRate: `₵${route.uppfRate.toFixed(3)}`,
        fuelTypes: (<div className="flex flex-wrap gap-1">
        {route.fuelTypes.map(fuel => (<span key={fuel} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30">
            {fuel}
          </span>))}
      </div>),
        status: (<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
        {getStatusText(route.status)}
      </span>),
        totalClaims: route.totalClaims,
        actions: (<div className="flex space-x-2">
        <Button_1.Button variant="outline" size="sm" onClick={() => {
                setSelectedRoute(route);
                setShowRouteModal(true);
            }}>
          View
        </Button_1.Button>
        <Button_1.Button variant="outline" size="sm" onClick={() => {
                setSelectedRoute(route);
                setShowPerformanceModal(true);
            }}>
          Performance
        </Button_1.Button>
        <Button_1.Button variant="outline" size="sm">
          Edit
        </Button_1.Button>
      </div>)
    }));
    const totalActiveRoutes = routes.filter(r => r.status === 'active').length;
    const totalRoutes = routes.length;
    const totalDistance = filteredRoutes.reduce((sum, route) => sum + route.distance, 0);
    const totalClaims = filteredRoutes.reduce((sum, route) => sum + route.totalClaims, 0);
    const totalAmount = filteredRoutes.reduce((sum, route) => sum + route.totalAmount, 0);
    const getRoutePerformance = (routeId) => {
        return routePerformance.filter(perf => perf.routeId === routeId);
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              UPPF Route Management
            </h1>
            <p className="text-dark-400 mt-2">
              Manage transportation routes and UPPF rate configurations
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button_1.Button variant="outline">
              Route Analysis
            </Button_1.Button>
            <Button_1.Button variant="outline">
              Export Routes
            </Button_1.Button>
            <Button_1.Button variant="primary">
              New Route
            </Button_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Routes</p>
                  <p className="text-2xl font-bold text-white">{totalRoutes}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Active Routes</p>
                  <p className="text-2xl font-bold text-white">{totalActiveRoutes}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Distance</p>
                  <p className="text-2xl font-bold text-white">{totalDistance.toFixed(0)} km</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Claims</p>
                  <p className="text-2xl font-bold text-white">{totalClaims}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card_1.Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-white">₵{(totalAmount / 1000000).toFixed(1)}M</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
              </div>
            </Card_1.Card>
          </framer_motion_1.motion.div>
        </div>

        {/* Filters and Search */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card_1.Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Input_1.Input placeholder="Search routes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full"/>
              </div>
              <div>
                <Select_1.Select options={statusOptions} value={statusFilter} onChange={(value) => setStatusFilter(value)} placeholder="Filter by status"/>
              </div>
              <div>
                <Select_1.Select options={regionOptions} value={regionFilter} onChange={(value) => setRegionFilter(value)} placeholder="Filter by region"/>
              </div>
              <div>
                <Select_1.Select options={fuelTypeOptions} value={fuelTypeFilter} onChange={(value) => setFuelTypeFilter(value)} placeholder="Filter by fuel type"/>
              </div>
              <div className="md:col-span-2">
                <Button_1.Button variant="outline" className="w-full">
                  Clear Filters
                </Button_1.Button>
              </div>
            </div>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Routes Table */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card_1.Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Routes</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-dark-400">
                  Showing {filteredRoutes.length} of {routes.length} routes
                </span>
                <Button_1.Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Export
                </Button_1.Button>
              </div>
            </div>
            
            <Table_1.Table columns={routeTableColumns} data={routeTableData} className="w-full"/>
          </Card_1.Card>
        </framer_motion_1.motion.div>

        {/* Route Detail Modal */}
        <Modal_1.Modal isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title="Route Details">
          {selectedRoute && (<div className="space-y-6">
              {/* Route Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRoute.routeCode}</h3>
                  <p className="text-dark-400">{selectedRoute.routeName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRoute.status)}`}>
                  {getStatusText(selectedRoute.status)}
                </span>
              </div>

              {/* Route Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">Origin</label>
                    <p className="text-white">{selectedRoute.origin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Destination</label>
                    <p className="text-white">{selectedRoute.destination}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Distance</label>
                    <p className="text-white">{selectedRoute.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Estimated Travel Time</label>
                    <p className="text-white">{selectedRoute.estimatedTravelTime.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Region</label>
                    <p className="text-white">{selectedRoute.region}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-400">UPPF Rate</label>
                    <p className="text-white">₵{selectedRoute.uppfRate.toFixed(3)} per liter</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Average Volume</label>
                    <p className="text-white">{selectedRoute.averageVolume.toLocaleString()} L</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Total Claims</label>
                    <p className="text-white">{selectedRoute.totalClaims}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Total Amount</label>
                    <p className="text-white">₵{selectedRoute.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-400">Last Updated</label>
                    <p className="text-white">{selectedRoute.lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Fuel Types */}
              <div>
                <label className="text-sm font-medium text-dark-400 mb-2 block">Supported Fuel Types</label>
                <div className="flex flex-wrap gap-2">
                  {selectedRoute.fuelTypes.map((fuel) => (<span key={fuel} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm border border-primary-500/30">
                      {fuel}
                    </span>))}
                </div>
              </div>

              {/* Notes */}
              {selectedRoute.notes && (<div>
                  <label className="text-sm font-medium text-dark-400 mb-2 block">Notes</label>
                  <p className="text-white bg-dark-900/50 p-3 rounded-lg border border-white/10">
                    {selectedRoute.notes}
                  </p>
                </div>)}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button_1.Button variant="outline" onClick={() => setShowRouteModal(false)}>
                  Close
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  View Claims
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  View Performance
                </Button_1.Button>
                <Button_1.Button variant="primary">
                  Edit Route
                </Button_1.Button>
              </div>
            </div>)}
        </Modal_1.Modal>

        {/* Performance Modal */}
        <Modal_1.Modal isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} title="Route Performance">
          {selectedRoute && (<div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRoute.routeCode}</h3>
                  <p className="text-dark-400">Performance Metrics</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRoute.status)}`}>
                  {getStatusText(selectedRoute.status)}
                </span>
              </div>

              <div className="space-y-4">
                {getRoutePerformance(selectedRoute.id).map((performance, index) => (<div key={index} className="p-4 bg-dark-900/50 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-white">{performance.month}</h4>
                      <span className="text-sm text-dark-400">{performance.claims} Claims</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-dark-400">Volume</label>
                        <p className="text-white font-medium">{performance.volume.toLocaleString()} L</p>
                      </div>
                      <div>
                        <label className="text-dark-400">Amount</label>
                        <p className="text-white font-medium">₵{performance.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-dark-400">Avg Delivery Time</label>
                        <p className="text-white font-medium">{performance.averageDeliveryTime.toFixed(1)}h</p>
                      </div>
                      <div>
                        <label className="text-dark-400">On-Time Deliveries</label>
                        <p className="text-white font-medium">
                          {performance.onTimeDeliveries}/{performance.onTimeDeliveries + performance.delayedDeliveries} 
                          ({((performance.onTimeDeliveries / (performance.onTimeDeliveries + performance.delayedDeliveries)) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                  </div>))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button_1.Button variant="outline" onClick={() => setShowPerformanceModal(false)}>
                  Close
                </Button_1.Button>
                <Button_1.Button variant="outline">
                  Export Performance Data
                </Button_1.Button>
              </div>
            </div>)}
        </Modal_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = UPPFRoutes;
//# sourceMappingURL=routes.js.map