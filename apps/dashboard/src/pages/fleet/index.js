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
const charts_1 = require("@/components/charts");
const api_1 = require("@/services/api");
const react_hot_toast_1 = require("react-hot-toast");
const FleetDashboardPage = () => {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [drivers, setDrivers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = (0, react_1.useState)(false);
    const [isAddDriverModalOpen, setIsAddDriverModalOpen] = (0, react_1.useState)(false);
    const [vehicleFormData, setVehicleFormData] = (0, react_1.useState)({
        vehicleType: 'TANKER',
        make: '',
        model: '',
        year: '',
        registrationNumber: '',
        chassisNumber: '',
        engineNumber: '',
        capacity: '',
        unit: 'LITERS',
        currentLocation: '',
        acquisitionDate: '',
        acquisitionCost: '',
        fuelEfficiency: '',
    });
    const [driverFormData, setDriverFormData] = (0, react_1.useState)({
        fullName: '',
        licenseNumber: '',
        licenseClass: 'C',
        licenseExpiryDate: '',
        phone: '',
        email: '',
        yearsExperience: '',
        safetyRating: '5',
    });
    (0, react_1.useEffect)(() => {
        loadFleetData();
    }, []);
    const loadFleetData = async () => {
        try {
            setLoading(true);
            // Load data from fleet service
            const [vehiclesData, driversData] = await Promise.all([
                api_1.fleetService.getVehicles(),
                api_1.fleetService.getDrivers(),
            ]);
            // Process metrics from the actual data
            const processedMetrics = processFleetMetrics(vehiclesData, driversData);
            setMetrics(processedMetrics);
            setVehicles(vehiclesData);
            setDrivers(driversData);
            react_hot_toast_1.toast.success('Fleet data loaded successfully');
        }
        catch (error) {
            console.error('Error loading fleet data:', error);
            react_hot_toast_1.toast.error('Failed to load fleet data');
            // Fallback to sample data
            setMetrics(sampleMetrics);
            setVehicles(sampleVehicles);
            setDrivers(sampleDrivers);
        }
        finally {
            setLoading(false);
        }
    };
    const processFleetMetrics = (vehicles, drivers) => {
        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
        const inMaintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length;
        const outOfServiceVehicles = vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length;
        const totalDrivers = drivers.length;
        const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
        // Calculate average fuel efficiency
        const vehiclesWithFuelData = vehicles.filter(v => v.fuelEfficiency > 0);
        const averageFuelEfficiency = vehiclesWithFuelData.length > 0
            ? vehiclesWithFuelData.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehiclesWithFuelData.length
            : 0;
        // Calculate total distance and costs (these would come from actual trip/maintenance data in real implementation)
        const totalDistanceTraveled = vehicles.reduce((sum, v) => sum + (v.currentMileage || 0), 0);
        // Process vehicle type breakdown
        const vehicleTypeBreakdown = vehicles.reduce((acc, vehicle) => {
            const existing = acc.find(item => item.type === vehicle.vehicleType);
            if (existing) {
                existing.count++;
            }
            else {
                acc.push({ type: vehicle.vehicleType, count: 1, percentage: 0 });
            }
            return acc;
        }, []);
        // Calculate percentages
        vehicleTypeBreakdown.forEach(item => {
            item.percentage = (item.count / totalVehicles) * 100;
        });
        // Generate maintenance schedule (this would come from actual maintenance data)
        const maintenanceSchedule = vehicles
            .filter(v => v.nextMaintenanceDate)
            .map(vehicle => ({
            vehicleNumber: vehicle.vehicleNumber,
            nextMaintenanceDate: vehicle.nextMaintenanceDate,
            daysUntilMaintenance: Math.ceil((new Date(vehicle.nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            maintenanceType: 'Routine Service' // This would come from actual maintenance data
        }))
            .slice(0, 5);
        return {
            totalVehicles,
            activeVehicles,
            inMaintenanceVehicles,
            outOfServiceVehicles,
            totalDrivers,
            activeDrivers,
            averageFuelEfficiency,
            totalDistanceTraveled,
            maintenanceCosts: 125000, // This would come from actual maintenance cost data
            fuelCosts: 850000, // This would come from actual fuel cost data
            vehicleTypeBreakdown,
            maintenanceSchedule,
            fuelConsumption: [
                { month: 'Jan 2024', consumption: 45000, cost: 135000 },
                { month: 'Dec 2023', consumption: 42000, cost: 126000 },
                { month: 'Nov 2023', consumption: 48000, cost: 144000 },
                { month: 'Oct 2023', consumption: 44000, cost: 132000 },
            ]
        };
    };
    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            await api_1.fleetService.createVehicle(vehicleFormData);
            react_hot_toast_1.toast.success('Vehicle added successfully');
            setIsAddVehicleModalOpen(false);
            resetVehicleForm();
            loadFleetData();
        }
        catch (error) {
            console.error('Error adding vehicle:', error);
            react_hot_toast_1.toast.error('Failed to add vehicle');
        }
    };
    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            await api_1.fleetService.createDriver(driverFormData);
            react_hot_toast_1.toast.success('Driver added successfully');
            setIsAddDriverModalOpen(false);
            resetDriverForm();
            loadFleetData();
        }
        catch (error) {
            console.error('Error adding driver:', error);
            react_hot_toast_1.toast.error('Failed to add driver');
        }
    };
    const resetVehicleForm = () => {
        setVehicleFormData({
            vehicleType: 'TANKER',
            make: '',
            model: '',
            year: '',
            registrationNumber: '',
            chassisNumber: '',
            engineNumber: '',
            capacity: '',
            unit: 'LITERS',
            currentLocation: '',
            acquisitionDate: '',
            acquisitionCost: '',
            fuelEfficiency: '',
        });
    };
    const resetDriverForm = () => {
        setDriverFormData({
            fullName: '',
            licenseNumber: '',
            licenseClass: 'C',
            licenseExpiryDate: '',
            phone: '',
            email: '',
            yearsExperience: '',
            safetyRating: '5',
        });
    };
    const vehicleTypeOptions = [
        { value: 'TANKER', label: 'Fuel Tanker' },
        { value: 'TRUCK', label: 'Cargo Truck' },
        { value: 'VAN', label: 'Van' },
        { value: 'CAR', label: 'Passenger Car' },
        { value: 'BUS', label: 'Bus' },
        { value: 'MOTORCYCLE', label: 'Motorcycle' },
    ];
    const unitOptions = [
        { value: 'LITERS', label: 'Liters' },
        { value: 'CUBIC_METERS', label: 'Cubic Meters' },
        { value: 'TONS', label: 'Tons' },
        { value: 'PASSENGERS', label: 'Passengers' },
    ];
    const licenseClassOptions = [
        { value: 'A', label: 'Class A (Motorcycle)' },
        { value: 'B', label: 'Class B (Private Car)' },
        { value: 'C', label: 'Class C (Commercial)' },
        { value: 'D', label: 'Class D (Heavy Duty)' },
        { value: 'E', label: 'Class E (Articulated)' },
    ];
    const vehicleColumns = [
        { key: 'vehicleNumber', header: 'Vehicle #', width: '12%', sortable: true },
        { key: 'registrationNumber', header: 'Registration', width: '12%', sortable: true },
        { key: 'make', header: 'Make/Model', width: '15%',
            render: (value, row) => `${value} ${row.model}`
        },
        { key: 'vehicleType', header: 'Type', width: '12%', sortable: true },
        { key: 'capacity', header: 'Capacity', width: '12%',
            render: (value, row) => `${value} ${row.unit}`
        },
        { key: 'assignedDriverName', header: 'Driver', width: '15%',
            render: (value) => value || 'Unassigned'
        },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        value === 'OUT_OF_SERVICE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
          {value.replace('_', ' ')}
        </span>)
        },
        { key: 'id', header: 'Actions', width: '12%',
            render: (value, row) => (<div className="flex space-x-2">
          <ui_1.Button variant="ghost" size="sm">View</ui_1.Button>
          <ui_1.Button variant="ghost" size="sm">Edit</ui_1.Button>
        </div>)
        },
    ];
    const driverColumns = [
        { key: 'driverNumber', header: 'Driver #', width: '12%', sortable: true },
        { key: 'fullName', header: 'Full Name', width: '20%', sortable: true },
        { key: 'licenseNumber', header: 'License #', width: '15%', sortable: true },
        { key: 'licenseClass', header: 'Class', width: '8%', sortable: true },
        { key: 'phone', header: 'Phone', width: '15%', sortable: true },
        { key: 'yearsExperience', header: 'Experience', width: '10%',
            render: (value) => `${value} years`
        },
        { key: 'safetyRating', header: 'Safety Rating', width: '10%',
            render: (value) => (<span className={`font-medium ${value >= 4.5 ? 'text-green-400' :
                    value >= 3.5 ? 'text-yellow-400' :
                        'text-red-400'}`}>
          {value}/5
        </span>)
        },
        { key: 'status', header: 'Status', width: '10%',
            render: (value) => (<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    value === 'SUSPENDED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
          {value}
        </span>)
        },
    ];
    // Sample data for demonstration
    const sampleMetrics = {
        totalVehicles: 85,
        activeVehicles: 72,
        inMaintenanceVehicles: 8,
        outOfServiceVehicles: 5,
        totalDrivers: 95,
        activeDrivers: 87,
        averageFuelEfficiency: 6.8,
        totalDistanceTraveled: 250000,
        maintenanceCosts: 125000,
        fuelCosts: 850000,
        vehicleTypeBreakdown: [
            { type: 'Tanker', count: 45, percentage: 52.9 },
            { type: 'Truck', count: 25, percentage: 29.4 },
            { type: 'Van', count: 10, percentage: 11.8 },
            { type: 'Car', count: 5, percentage: 5.9 },
        ],
        maintenanceSchedule: [
            { vehicleNumber: 'TK-001', nextMaintenanceDate: '2024-02-20', daysUntilMaintenance: 5, maintenanceType: 'Routine Service' },
            { vehicleNumber: 'TK-015', nextMaintenanceDate: '2024-02-22', daysUntilMaintenance: 7, maintenanceType: 'Safety Inspection' },
            { vehicleNumber: 'TR-008', nextMaintenanceDate: '2024-02-25', daysUntilMaintenance: 10, maintenanceType: 'Engine Overhaul' },
        ],
        fuelConsumption: [
            { month: 'Jan 2024', consumption: 45000, cost: 135000 },
            { month: 'Dec 2023', consumption: 42000, cost: 126000 },
            { month: 'Nov 2023', consumption: 48000, cost: 144000 },
            { month: 'Oct 2023', consumption: 44000, cost: 132000 },
        ],
    };
    const sampleVehicles = [
        {
            id: '1',
            vehicleNumber: 'TK-001',
            vehicleType: 'TANKER',
            make: 'MAN',
            model: 'TGX 18.440',
            year: 2020,
            registrationNumber: 'GR-4578-20',
            chassisNumber: 'WMAN06ZZ7LY123456',
            engineNumber: 'D2676LF52-001',
            capacity: 35000,
            unit: 'LITERS',
            status: 'ACTIVE',
            currentLocation: 'Tema Depot',
            assignedDriverId: '1',
            assignedDriverName: 'Kwame Adjei',
            lastMaintenanceDate: '2024-01-15',
            nextMaintenanceDate: '2024-02-20',
            insuranceExpiryDate: '2024-12-31',
            licensingExpiryDate: '2024-08-15',
            currentMileage: 125000,
            fuelEfficiency: 7.2,
            acquisitionDate: '2020-03-15',
            acquisitionCost: 450000,
            currentValue: 320000,
            currency: 'GHS',
        },
        {
            id: '2',
            vehicleNumber: 'TK-015',
            vehicleType: 'TANKER',
            make: 'Volvo',
            model: 'FH16',
            year: 2019,
            registrationNumber: 'GR-2341-19',
            chassisNumber: 'YV2R0A00004567890',
            engineNumber: 'D16K-002',
            capacity: 40000,
            unit: 'LITERS',
            status: 'ACTIVE',
            currentLocation: 'Kumasi Regional Office',
            assignedDriverId: '2',
            assignedDriverName: 'Samuel Osei',
            lastMaintenanceDate: '2024-01-10',
            nextMaintenanceDate: '2024-02-22',
            insuranceExpiryDate: '2024-11-30',
            licensingExpiryDate: '2024-07-20',
            currentMileage: 180000,
            fuelEfficiency: 6.8,
            acquisitionDate: '2019-05-20',
            acquisitionCost: 520000,
            currentValue: 380000,
            currency: 'GHS',
        },
        {
            id: '3',
            vehicleNumber: 'TR-008',
            vehicleType: 'TRUCK',
            make: 'DAF',
            model: 'XF 480',
            year: 2021,
            registrationNumber: 'GR-6789-21',
            chassisNumber: 'XLRTE47LS0E123456',
            engineNumber: 'MX13-003',
            capacity: 15,
            unit: 'TONS',
            status: 'MAINTENANCE',
            currentLocation: 'Head Office - Accra',
            lastMaintenanceDate: '2024-01-20',
            nextMaintenanceDate: '2024-02-25',
            insuranceExpiryDate: '2024-10-15',
            licensingExpiryDate: '2024-09-10',
            currentMileage: 95000,
            fuelEfficiency: 8.5,
            acquisitionDate: '2021-01-10',
            acquisitionCost: 350000,
            currentValue: 280000,
            currency: 'GHS',
        },
    ];
    const sampleDrivers = [
        {
            id: '1',
            driverNumber: 'DR-001',
            fullName: 'Kwame Adjei',
            licenseNumber: 'DL-12345678',
            licenseClass: 'D',
            licenseExpiryDate: '2025-06-15',
            phone: '+233-244-123-456',
            email: 'kwame.adjei@omc.com.gh',
            status: 'ACTIVE',
            assignedVehicleId: '1',
            yearsExperience: 8,
            safetyRating: 4.8,
        },
        {
            id: '2',
            driverNumber: 'DR-002',
            fullName: 'Samuel Osei',
            licenseNumber: 'DL-23456789',
            licenseClass: 'D',
            licenseExpiryDate: '2024-09-20',
            phone: '+233-244-234-567',
            email: 'samuel.osei@omc.com.gh',
            status: 'ACTIVE',
            assignedVehicleId: '2',
            yearsExperience: 12,
            safetyRating: 4.9,
        },
        {
            id: '3',
            driverNumber: 'DR-003',
            fullName: 'Joseph Mensah',
            licenseNumber: 'DL-34567890',
            licenseClass: 'C',
            licenseExpiryDate: '2024-12-10',
            phone: '+233-244-345-678',
            email: 'joseph.mensah@omc.com.gh',
            status: 'ACTIVE',
            yearsExperience: 5,
            safetyRating: 4.2,
        },
    ];
    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z' },
        { id: 'vehicles', label: 'Vehicles', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v0H8V7z' },
        { id: 'drivers', label: 'Drivers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'maintenance', label: 'Maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];
    if (loading || !metrics) {
        return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
    }
    return (<FuturisticDashboardLayout_1.FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">
              Fleet Management
            </h1>
            <p className="text-dark-400 mt-2">
              Vehicle and driver management system
            </p>
          </div>
          <div className="flex space-x-4">
            <ui_1.Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Fleet Report
            </ui_1.Button>
            <ui_1.Button variant="primary" size="sm" onClick={() => {
            if (activeTab === 'vehicles')
                setIsAddVehicleModalOpen(true);
            if (activeTab === 'drivers')
                setIsAddDriverModalOpen(true);
        }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {activeTab === 'vehicles' && 'Add Vehicle'}
              {activeTab === 'drivers' && 'Add Driver'}
              {(activeTab === 'overview' || activeTab === 'maintenance') && 'Add Asset'}
            </ui_1.Button>
          </div>
        </framer_motion_1.motion.div>

        {/* Navigation Tabs */}
        <div className="border-b border-dark-600">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (<framer_motion_1.motion.button key={tab.id} whileHover={{ y: -2 }} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon}/>
                </svg>
                <span>{tab.label}</span>
              </framer_motion_1.motion.button>))}
          </nav>
        </div>

        {/* Content */}
        <framer_motion_1.motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && (<div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Total Vehicles</h3>
                    <p className="text-3xl font-bold text-primary-400 mb-1">{metrics.totalVehicles}</p>
                    <p className="text-sm text-green-400">{metrics.activeVehicles} active</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Active Drivers</h3>
                    <p className="text-3xl font-bold text-green-400 mb-1">{metrics.activeDrivers}</p>
                    <p className="text-sm text-dark-400">of {metrics.totalDrivers} total</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Fuel Efficiency</h3>
                    <p className="text-3xl font-bold text-blue-400 mb-1">{metrics.averageFuelEfficiency}</p>
                    <p className="text-sm text-dark-400">km/liter average</p>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardContent className="p-6 text-center">
                    <h3 className="text-sm font-medium text-dark-400 mb-2">Monthly Fuel Cost</h3>
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'GHS',
                notation: 'compact',
                maximumFractionDigits: 0,
            }).format(metrics.fuelCosts)}
                    </p>
                    <p className="text-sm text-green-400">5% reduction</p>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ui_1.Card>
                  <ui_1.CardHeader title="Fleet Composition"/>
                  <ui_1.CardContent>
                    <charts_1.PieChart data={metrics.vehicleTypeBreakdown.map(v => ({
                name: v.type,
                value: v.count,
                percentage: v.percentage
            }))}/>
                  </ui_1.CardContent>
                </ui_1.Card>

                <ui_1.Card>
                  <ui_1.CardHeader title="Fuel Consumption Trend"/>
                  <ui_1.CardContent>
                    <charts_1.BarChart data={metrics.fuelConsumption.map(f => ({
                name: f.month,
                value: f.consumption
            }))}/>
                  </ui_1.CardContent>
                </ui_1.Card>
              </div>

              {/* Upcoming Maintenance */}
              <ui_1.Card>
                <ui_1.CardHeader title="Upcoming Maintenance Schedule"/>
                <ui_1.CardContent>
                  <div className="space-y-4">
                    {metrics.maintenanceSchedule.map((item, index) => (<div key={index} className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${item.daysUntilMaintenance <= 3 ? 'bg-red-500' :
                    item.daysUntilMaintenance <= 7 ? 'bg-yellow-500' :
                        'bg-green-500'}`}></div>
                          <div>
                            <p className="font-medium text-white">{item.vehicleNumber}</p>
                            <p className="text-sm text-dark-400">{item.maintenanceType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{item.nextMaintenanceDate}</p>
                          <p className="text-sm text-dark-400">{item.daysUntilMaintenance} days</p>
                        </div>
                      </div>))}
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}

          {activeTab === 'vehicles' && (<ui_1.Card>
              <ui_1.CardHeader title="Vehicle Fleet"/>
              <ui_1.CardContent>
                <ui_1.Table data={vehicles} columns={vehicleColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: vehicles.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'drivers' && (<ui_1.Card>
              <ui_1.CardHeader title="Driver Management"/>
              <ui_1.CardContent>
                <ui_1.Table data={drivers} columns={driverColumns} loading={loading} pagination={{
                page: 1,
                limit: 10,
                total: drivers.length,
                onPageChange: () => { },
                onLimitChange: () => { },
            }}/>
              </ui_1.CardContent>
            </ui_1.Card>)}

          {activeTab === 'maintenance' && (<div className="space-y-6">
              <ui_1.Card>
                <ui_1.CardHeader title="Maintenance Overview"/>
                <ui_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{metrics.inMaintenanceVehicles}</p>
                      <p className="text-sm text-dark-400">In Maintenance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">{metrics.outOfServiceVehicles}</p>
                      <p className="text-sm text-dark-400">Out of Service</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">GHS {metrics.maintenanceCosts.toLocaleString()}</p>
                      <p className="text-sm text-dark-400">Monthly Cost</p>
                    </div>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>

              <ui_1.Card>
                <ui_1.CardHeader title="Maintenance Schedule"/>
                <ui_1.CardContent>
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-4">Detailed maintenance schedule will be displayed here</p>
                    <ui_1.Button variant="outline" size="sm">Schedule Maintenance</ui_1.Button>
                  </div>
                </ui_1.CardContent>
              </ui_1.Card>
            </div>)}
        </framer_motion_1.motion.div>

        {/* Add Vehicle Modal */}
        <ui_1.FormModal isOpen={isAddVehicleModalOpen} onClose={() => {
            setIsAddVehicleModalOpen(false);
            resetVehicleForm();
        }} onSubmit={handleAddVehicle} title="Add New Vehicle" submitText="Add Vehicle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Select label="Vehicle Type" options={vehicleTypeOptions} value={vehicleFormData.vehicleType} onChange={(value) => setVehicleFormData({ ...vehicleFormData, vehicleType: value })} required/>
            <ui_1.Input label="Make" placeholder="e.g., MAN, Volvo, DAF" value={vehicleFormData.make} onChange={(e) => setVehicleFormData({ ...vehicleFormData, make: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Model" placeholder="e.g., TGX 18.440" value={vehicleFormData.model} onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })} required/>
            <ui_1.Input label="Year" type="number" placeholder="2024" value={vehicleFormData.year} onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Registration Number" placeholder="GR-XXXX-XX" value={vehicleFormData.registrationNumber} onChange={(e) => setVehicleFormData({ ...vehicleFormData, registrationNumber: e.target.value })} required/>
            <ui_1.Input label="Chassis Number" placeholder="Vehicle chassis number" value={vehicleFormData.chassisNumber} onChange={(e) => setVehicleFormData({ ...vehicleFormData, chassisNumber: e.target.value })} required/>
          </div>

          <ui_1.Input label="Engine Number" placeholder="Engine number" value={vehicleFormData.engineNumber} onChange={(e) => setVehicleFormData({ ...vehicleFormData, engineNumber: e.target.value })} required/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Capacity" type="number" placeholder="Vehicle capacity" value={vehicleFormData.capacity} onChange={(e) => setVehicleFormData({ ...vehicleFormData, capacity: e.target.value })} required/>
            <ui_1.Select label="Unit" options={unitOptions} value={vehicleFormData.unit} onChange={(value) => setVehicleFormData({ ...vehicleFormData, unit: value })} required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Acquisition Date" type="date" value={vehicleFormData.acquisitionDate} onChange={(e) => setVehicleFormData({ ...vehicleFormData, acquisitionDate: e.target.value })} required/>
            <ui_1.Input label="Acquisition Cost (GHS)" type="number" step="0.01" value={vehicleFormData.acquisitionCost} onChange={(e) => setVehicleFormData({ ...vehicleFormData, acquisitionCost: e.target.value })} required/>
          </div>

          <ui_1.Input label="Fuel Efficiency (km/liter)" type="number" step="0.1" placeholder="Average fuel efficiency" value={vehicleFormData.fuelEfficiency} onChange={(e) => setVehicleFormData({ ...vehicleFormData, fuelEfficiency: e.target.value })}/>
        </ui_1.FormModal>

        {/* Add Driver Modal */}
        <ui_1.FormModal isOpen={isAddDriverModalOpen} onClose={() => {
            setIsAddDriverModalOpen(false);
            resetDriverForm();
        }} onSubmit={handleAddDriver} title="Add New Driver" submitText="Add Driver">
          <ui_1.Input label="Full Name" placeholder="Enter full name" value={driverFormData.fullName} onChange={(e) => setDriverFormData({ ...driverFormData, fullName: e.target.value })} required/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="License Number" placeholder="DL-XXXXXXXX" value={driverFormData.licenseNumber} onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })} required/>
            <ui_1.Select label="License Class" options={licenseClassOptions} value={driverFormData.licenseClass} onChange={(value) => setDriverFormData({ ...driverFormData, licenseClass: value })} required/>
          </div>

          <ui_1.Input label="License Expiry Date" type="date" value={driverFormData.licenseExpiryDate} onChange={(e) => setDriverFormData({ ...driverFormData, licenseExpiryDate: e.target.value })} required/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Phone" placeholder="+233-XXX-XXX-XXX" value={driverFormData.phone} onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })} required/>
            <ui_1.Input label="Email" type="email" placeholder="driver@omc.com.gh" value={driverFormData.email} onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ui_1.Input label="Years of Experience" type="number" placeholder="Years driving experience" value={driverFormData.yearsExperience} onChange={(e) => setDriverFormData({ ...driverFormData, yearsExperience: e.target.value })} required/>
            <ui_1.Select label="Initial Safety Rating" options={[
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Average' },
            { value: '2', label: '2 - Below Average' },
            { value: '1', label: '1 - Poor' },
        ]} value={driverFormData.safetyRating} onChange={(value) => setDriverFormData({ ...driverFormData, safetyRating: value })} required/>
          </div>
        </ui_1.FormModal>
      </div>
    </FuturisticDashboardLayout_1.FuturisticDashboardLayout>);
};
exports.default = FleetDashboardPage;
//# sourceMappingURL=index.js.map