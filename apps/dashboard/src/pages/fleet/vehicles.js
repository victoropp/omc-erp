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
const VehiclesPage = () => {
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedVehicle, setSelectedVehicle] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [vehicleForm, setVehicleForm] = (0, react_1.useState)({
        plateNumber: '',
        type: 'tanker',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        capacity: 0,
        status: 'active',
        fuelType: 'diesel',
        mileage: 0,
        lastService: '',
        nextService: '',
    });
    (0, react_1.useEffect)(() => {
        loadVehicles();
    }, []);
    const loadVehicles = async () => {
        try {
            setLoading(true);
            const data = await api_1.fleetService.getVehicles();
            setVehicles(data || generateMockData());
        }
        catch (error) {
            console.error('Failed to load vehicles:', error);
            setVehicles(generateMockData());
            react_hot_toast_1.toast.error('Failed to load vehicles data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockData = () => [
        {
            id: '1',
            plateNumber: 'GH-4567-23',
            type: 'tanker',
            make: 'Mercedes-Benz',
            model: 'Actros 2545',
            year: 2020,
            capacity: 35000,
            status: 'active',
            fuelType: 'diesel',
            mileage: 125000,
            lastService: '2024-01-15',
            nextService: '2024-04-15',
            assignedDriver: {
                id: 'd1',
                name: 'Kwame Asante',
                phone: '+233-24-567-8901'
            },
            location: {
                latitude: 5.6037,
                longitude: -0.1870,
                address: 'Tema Oil Depot, Accra'
            },
            documents: {
                registration: true,
                insurance: true,
                roadWorthy: true,
                customsClearance: true
            },
            createdAt: '2023-06-15T10:30:00Z',
            updatedAt: '2024-01-15T14:22:00Z'
        },
        {
            id: '2',
            plateNumber: 'GH-7890-23',
            type: 'delivery',
            make: 'Isuzu',
            model: 'NPR 75',
            year: 2019,
            capacity: 5000,
            status: 'maintenance',
            fuelType: 'diesel',
            mileage: 89000,
            lastService: '2024-01-20',
            nextService: '2024-04-20',
            assignedDriver: {
                id: 'd2',
                name: 'Akosua Mensa',
                phone: '+233-20-345-6789'
            },
            location: {
                latitude: 5.5563,
                longitude: -0.2012,
                address: 'Airport Shell Station, Accra'
            },
            documents: {
                registration: true,
                insurance: true,
                roadWorthy: false,
                customsClearance: true
            },
            createdAt: '2023-08-10T09:15:00Z',
            updatedAt: '2024-01-20T11:45:00Z'
        },
        {
            id: '3',
            plateNumber: 'GH-1234-24',
            type: 'service',
            make: 'Toyota',
            model: 'Hilux',
            year: 2022,
            capacity: 1000,
            status: 'active',
            fuelType: 'diesel',
            mileage: 35000,
            lastService: '2023-12-10',
            nextService: '2024-03-10',
            assignedDriver: {
                id: 'd3',
                name: 'Kofi Mensah',
                phone: '+233-24-123-4567'
            },
            location: {
                latitude: 5.6500,
                longitude: -0.0800,
                address: 'East Legon Service Station'
            },
            documents: {
                registration: true,
                insurance: true,
                roadWorthy: true,
                customsClearance: true
            },
            createdAt: '2024-01-05T08:00:00Z',
            updatedAt: '2024-01-10T16:30:00Z'
        }
    ];
    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
        const matchesType = filterType === 'all' || vehicle.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });
    const handleCreateVehicle = () => {
        setIsEditMode(false);
        setVehicleForm({
            plateNumber: '',
            type: 'tanker',
            make: '',
            model: '',
            year: new Date().getFullYear(),
            capacity: 0,
            status: 'active',
            fuelType: 'diesel',
            mileage: 0,
            lastService: '',
            nextService: '',
        });
        setIsModalOpen(true);
    };
    const handleEditVehicle = (vehicle) => {
        setIsEditMode(true);
        setSelectedVehicle(vehicle);
        setVehicleForm({
            plateNumber: vehicle.plateNumber,
            type: vehicle.type,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            capacity: vehicle.capacity,
            status: vehicle.status,
            fuelType: vehicle.fuelType,
            mileage: vehicle.mileage,
            lastService: vehicle.lastService,
            nextService: vehicle.nextService,
        });
        setIsModalOpen(true);
    };
    const handleSaveVehicle = async () => {
        try {
            if (isEditMode && selectedVehicle) {
                await api_1.fleetService.updateVehicle(selectedVehicle.id, vehicleForm);
                react_hot_toast_1.toast.success('Vehicle updated successfully');
            }
            else {
                await api_1.fleetService.createVehicle(vehicleForm);
                react_hot_toast_1.toast.success('Vehicle created successfully');
            }
            setIsModalOpen(false);
            loadVehicles();
        }
        catch (error) {
            console.error('Failed to save vehicle:', error);
            react_hot_toast_1.toast.error('Failed to save vehicle');
        }
    };
    const handleDeleteVehicle = async (vehicleId) => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await api_1.fleetService.deleteVehicle(vehicleId);
                react_hot_toast_1.toast.success('Vehicle deleted successfully');
                loadVehicles();
            }
            catch (error) {
                console.error('Failed to delete vehicle:', error);
                react_hot_toast_1.toast.error('Failed to delete vehicle');
            }
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'maintenance': return 'warning';
            case 'repair': return 'danger';
            case 'inactive': return 'secondary';
            default: return 'default';
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'tanker':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>);
            case 'delivery':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>);
            case 'service':
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>);
            default:
                return (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>);
        }
    };
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">Vehicle Management</h1>
            <p className="text-dark-400 mt-2">
              Manage your fleet vehicles with comprehensive tracking and maintenance
            </p>
          </div>
          
          <ui_1.Button variant="primary" onClick={handleCreateVehicle}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Vehicle
          </ui_1.Button>
        </framer_motion_1.motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-white">{vehicles.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Active Vehicles</p>
                  <p className="text-2xl font-bold text-white">
                    {vehicles.filter(v => v.status === 'active').length}
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
                  <p className="text-sm font-medium text-dark-400">In Maintenance</p>
                  <p className="text-2xl font-bold text-white">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>

          <ui_1.Card>
            <ui_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Fleet Utilization</p>
                  <p className="text-2xl font-bold text-white">87.3%</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </ui_1.CardContent>
          </ui_1.Card>
        </div>

        {/* Filters and Search */}
        <ui_1.Card>
          <ui_1.CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <ui_1.Input type="text" placeholder="Search vehicles by plate number, make, or model..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
              </div>
              <ui_1.Select value={filterStatus} onChange={setFilterStatus} options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'inactive', label: 'Inactive' }
        ]} className="w-full md:w-48"/>
              <ui_1.Select value={filterType} onChange={setFilterType} options={[
            { value: 'all', label: 'All Types' },
            { value: 'tanker', label: 'Tanker' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'service', label: 'Service' },
            { value: 'passenger', label: 'Passenger' }
        ]} className="w-full md:w-48"/>
            </div>
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Vehicles Table */}
        <ui_1.Card>
          <ui_1.CardHeader title="Fleet Vehicles"/>
          <ui_1.CardContent>
            {loading ? (<div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>) : (<ui_1.Table headers={[
                { key: 'vehicle', label: 'Vehicle' },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'driver', label: 'Driver' },
                { key: 'mileage', label: 'Mileage' },
                { key: 'nextService', label: 'Next Service' },
                { key: 'actions', label: 'Actions' }
            ]} data={filteredVehicles.map(vehicle => ({
                vehicle: (<div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        {getTypeIcon(vehicle.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{vehicle.plateNumber}</p>
                        <p className="text-sm text-dark-400">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                      </div>
                    </div>),
                type: (<div className="flex items-center space-x-2">
                      <span className="capitalize text-white">{vehicle.type}</span>
                      <span className="text-dark-400 text-sm">({vehicle.capacity}L)</span>
                    </div>),
                status: (<ui_1.Badge variant={getStatusColor(vehicle.status)} className="capitalize">
                      {vehicle.status}
                    </ui_1.Badge>),
                driver: vehicle.assignedDriver ? (<div>
                      <p className="text-white font-medium">{vehicle.assignedDriver.name}</p>
                      <p className="text-dark-400 text-sm">{vehicle.assignedDriver.phone}</p>
                    </div>) : (<span className="text-dark-400">Unassigned</span>),
                mileage: (<span className="text-white">{vehicle.mileage.toLocaleString()} km</span>),
                nextService: (<span className="text-white">{new Date(vehicle.nextService).toLocaleDateString()}</span>),
                actions: (<div className="flex items-center space-x-2">
                      <ui_1.Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                        Edit
                      </ui_1.Button>
                      <ui_1.Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)} className="text-red-400 border-red-400 hover:bg-red-500/20">
                        Delete
                      </ui_1.Button>
                    </div>)
            }))}/>)}
          </ui_1.CardContent>
        </ui_1.Card>

        {/* Vehicle Form Modal */}
        <ui_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Plate Number" type="text" value={vehicleForm.plateNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })} placeholder="e.g., GH-1234-23" required/>
              
              <ui_1.Select label="Vehicle Type" value={vehicleForm.type} onChange={(value) => setVehicleForm({ ...vehicleForm, type: value })} options={[
            { value: 'tanker', label: 'Tanker' },
            { value: 'delivery', label: 'Delivery Truck' },
            { value: 'service', label: 'Service Vehicle' },
            { value: 'passenger', label: 'Passenger Vehicle' }
        ]} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Make" type="text" value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} placeholder="e.g., Mercedes-Benz" required/>
              
              <ui_1.Input label="Model" type="text" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="e.g., Actros 2545" required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ui_1.Input label="Year" type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })} min="1990" max={new Date().getFullYear()} required/>
              
              <ui_1.Input label="Capacity (Liters)" type="number" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: parseInt(e.target.value) })} placeholder="e.g., 35000" required/>
              
              <ui_1.Input label="Current Mileage (km)" type="number" value={vehicleForm.mileage} onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: parseInt(e.target.value) })} placeholder="e.g., 125000" required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Select label="Status" value={vehicleForm.status} onChange={(value) => setVehicleForm({ ...vehicleForm, status: value })} options={[
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'repair', label: 'Repair' },
            { value: 'inactive', label: 'Inactive' }
        ]} required/>
              
              <ui_1.Select label="Fuel Type" value={vehicleForm.fuelType} onChange={(value) => setVehicleForm({ ...vehicleForm, fuelType: value })} options={[
            { value: 'diesel', label: 'Diesel' },
            { value: 'petrol', label: 'Petrol' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' }
        ]} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ui_1.Input label="Last Service Date" type="date" value={vehicleForm.lastService} onChange={(e) => setVehicleForm({ ...vehicleForm, lastService: e.target.value })}/>
              
              <ui_1.Input label="Next Service Date" type="date" value={vehicleForm.nextService} onChange={(e) => setVehicleForm({ ...vehicleForm, nextService: e.target.value })}/>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-dark-600">
              <ui_1.Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ui_1.Button>
              <ui_1.Button variant="primary" onClick={handleSaveVehicle}>
                {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
              </ui_1.Button>
            </div>
          </div>
        </ui_1.Modal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = VehiclesPage;
//# sourceMappingURL=vehicles.js.map