import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { FuturisticDashboardLayout } from '@/components/layout/FuturisticDashboardLayout';
import { Card, CardHeader, CardContent, Button, Select, Badge } from '@/components/ui';
import { fleetService } from '@/services/api';
import { toast } from 'react-hot-toast';

interface VehicleLocation {
  vehicleId: string;
  vehicle: {
    plateNumber: string;
    make: string;
    model: string;
    type: string;
    driver?: {
      name: string;
      phone: string;
    };
  };
  latitude: number;
  longitude: number;
  address: string;
  speed: number; // km/h
  heading: number; // degrees
  status: 'moving' | 'idle' | 'parked' | 'offline';
  lastUpdate: string;
  odometer: number;
  fuelLevel: number; // percentage
  engineStatus: 'on' | 'off';
  temperature: number; // celsius
  alerts: Array<{
    type: 'speed' | 'geofence' | 'maintenance' | 'fuel' | 'temperature';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}

interface GeofenceAlert {
  id: string;
  vehicleId: string;
  vehicle: {
    plateNumber: string;
    driver?: string;
  };
  type: 'entry' | 'exit';
  geofenceName: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  severity: 'info' | 'warning' | 'critical';
}

interface RouteHistory {
  vehicleId: string;
  startTime: string;
  endTime: string;
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  stops: Array<{
    location: string;
    duration: number; // minutes
    timestamp: string;
  }>;
  fuelConsumed: number;
  path: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    speed: number;
  }>;
}

const GPSTrackingPage: NextPage = () => {
  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocation[]>([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [routeHistory, setRouteHistory] = useState<RouteHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [mapView, setMapView] = useState<'satellite' | 'road' | 'hybrid'>('road');
  const [showRoute, setShowRoute] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadVehicleLocations();
    loadGeofenceAlerts();
    
    if (realTimeEnabled) {
      intervalRef.current = setInterval(loadVehicleLocations, 10000); // Update every 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTimeEnabled]);

  const loadVehicleLocations = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getAllVehicleLocations();
      setVehicleLocations(data || generateMockLocationData());
    } catch (error) {
      console.error('Failed to load vehicle locations:', error);
      setVehicleLocations(generateMockLocationData());
    } finally {
      setLoading(false);
    }
  };

  const loadGeofenceAlerts = async () => {
    try {
      const data = await fleetService.getGeofenceAlerts();
      setGeofenceAlerts(data || generateMockAlertData());
    } catch (error) {
      console.error('Failed to load geofence alerts:', error);
      setGeofenceAlerts(generateMockAlertData());
    }
  };

  const loadRouteHistory = async (vehicleId: string) => {
    try {
      const data = await fleetService.getVehicleRoute(vehicleId, dateRange.start, dateRange.end);
      setRouteHistory(data || generateMockRouteData());
      setShowRoute(true);
    } catch (error) {
      console.error('Failed to load route history:', error);
      toast.error('Failed to load route history');
    }
  };

  const generateMockLocationData = (): VehicleLocation[] => [
    {
      vehicleId: '1',
      vehicle: {
        plateNumber: 'GH-4567-23',
        make: 'Mercedes-Benz',
        model: 'Actros 2545',
        type: 'tanker',
        driver: {
          name: 'Kwame Asante',
          phone: '+233-24-567-8901'
        }
      },
      latitude: 5.6037,
      longitude: -0.1870,
      address: 'Tema Oil Depot, Accra, Ghana',
      speed: 0,
      heading: 45,
      status: 'parked',
      lastUpdate: new Date().toISOString(),
      odometer: 125430,
      fuelLevel: 85,
      engineStatus: 'off',
      temperature: 68,
      alerts: [
        {
          type: 'fuel',
          message: 'Fuel level is sufficient for next delivery',
          severity: 'low',
          timestamp: new Date().toISOString()
        }
      ]
    },
    {
      vehicleId: '2',
      vehicle: {
        plateNumber: 'GH-7890-23',
        make: 'Isuzu',
        model: 'NPR 75',
        type: 'delivery',
        driver: {
          name: 'Akosua Mensa',
          phone: '+233-20-345-6789'
        }
      },
      latitude: 5.5563,
      longitude: -0.2012,
      address: 'Airport Shell Station, Accra',
      speed: 45,
      heading: 180,
      status: 'moving',
      lastUpdate: new Date().toISOString(),
      odometer: 89230,
      fuelLevel: 65,
      engineStatus: 'on',
      temperature: 85,
      alerts: [
        {
          type: 'speed',
          message: 'Vehicle exceeding speed limit (50 km/h)',
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ]
    },
    {
      vehicleId: '3',
      vehicle: {
        plateNumber: 'GH-1234-24',
        make: 'Toyota',
        model: 'Hilux',
        type: 'service',
        driver: {
          name: 'Kofi Mensah',
          phone: '+233-24-123-4567'
        }
      },
      latitude: 5.6500,
      longitude: -0.0800,
      address: 'East Legon Service Station',
      speed: 25,
      heading: 90,
      status: 'moving',
      lastUpdate: new Date().toISOString(),
      odometer: 35120,
      fuelLevel: 40,
      engineStatus: 'on',
      temperature: 72,
      alerts: [
        {
          type: 'fuel',
          message: 'Low fuel level - refueling recommended',
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ]
    }
  ];

  const generateMockAlertData = (): GeofenceAlert[] => [
    {
      id: 'ga1',
      vehicleId: '2',
      vehicle: {
        plateNumber: 'GH-7890-23',
        driver: 'Akosua Mensa'
      },
      type: 'exit',
      geofenceName: 'Accra Central Zone',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      location: {
        latitude: 5.5563,
        longitude: -0.2012,
        address: 'Airport Shell Station, Accra'
      },
      severity: 'info'
    },
    {
      id: 'ga2',
      vehicleId: '1',
      vehicle: {
        plateNumber: 'GH-4567-23',
        driver: 'Kwame Asante'
      },
      type: 'entry',
      geofenceName: 'Tema Port Zone',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Tema Oil Depot, Accra'
      },
      severity: 'info'
    }
  ];

  const generateMockRouteData = (): RouteHistory => ({
    vehicleId: selectedVehicle || '1',
    startTime: '2024-01-13T06:00:00Z',
    endTime: '2024-01-13T18:00:00Z',
    totalDistance: 245.7,
    avgSpeed: 42.3,
    maxSpeed: 65,
    stops: [
      {
        location: 'Tema Oil Depot',
        duration: 45,
        timestamp: '2024-01-13T06:00:00Z'
      },
      {
        location: 'Shell Station - Airport',
        duration: 20,
        timestamp: '2024-01-13T09:30:00Z'
      },
      {
        location: 'Total Station - East Legon',
        duration: 25,
        timestamp: '2024-01-13T14:15:00Z'
      }
    ],
    fuelConsumed: 35.2,
    path: [
      { latitude: 5.6037, longitude: -0.1870, timestamp: '2024-01-13T06:00:00Z', speed: 0 },
      { latitude: 5.5563, longitude: -0.2012, timestamp: '2024-01-13T09:30:00Z', speed: 45 },
      { latitude: 5.6500, longitude: -0.0800, timestamp: '2024-01-13T14:15:00Z', speed: 38 }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'success';
      case 'idle': return 'warning';
      case 'parked': return 'primary';
      case 'offline': return 'danger';
      default: return 'default';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed === 0) return 'text-gray-400';
    if (speed <= 30) return 'text-green-400';
    if (speed <= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatLastUpdate = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <FuturisticDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">GPS Tracking</h1>
            <p className="text-dark-400 mt-2">
              Real-time vehicle tracking with route history and geofencing alerts
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={realTimeEnabled}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-400">Real-time tracking</span>
            </label>
            
            <Select
              value={mapView}
              onChange={setMapView}
              options={[
                { value: 'road', label: 'Road View' },
                { value: 'satellite', label: 'Satellite' },
                { value: 'hybrid', label: 'Hybrid' }
              ]}
              className="w-32"
            />
            
            <Button variant="outline" onClick={() => loadVehicleLocations()}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Active Vehicles</p>
                  <p className="text-2xl font-bold text-white">
                    {vehicleLocations.filter(v => v.status !== 'offline').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Moving</p>
                  <p className="text-2xl font-bold text-white">
                    {vehicleLocations.filter(v => v.status === 'moving').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">
                    {vehicleLocations.reduce((sum, v) => sum + v.alerts.length, 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Avg Speed</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(vehicleLocations.reduce((sum, v) => sum + v.speed, 0) / vehicleLocations.length || 0)} km/h
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Live Vehicle Map" />
              <CardContent>
                <div
                  ref={mapRef}
                  className="w-full h-96 bg-dark-700 rounded-lg flex items-center justify-center relative overflow-hidden"
                >
                  {/* Mock Map Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20"></div>
                  <div className="relative z-10 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-white font-medium">Interactive GPS Map</p>
                    <p className="text-dark-400 text-sm">Real-time vehicle locations with route tracking</p>
                    
                    {/* Vehicle Markers */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {vehicleLocations.slice(0, 4).map((vehicle, index) => (
                        <div key={vehicle.vehicleId} 
                             className="bg-dark-600 rounded-lg p-3 cursor-pointer hover:bg-dark-500 transition-colors"
                             onClick={() => setSelectedVehicle(vehicle.vehicleId)}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              vehicle.status === 'moving' ? 'bg-green-400' :
                              vehicle.status === 'idle' ? 'bg-yellow-400' :
                              vehicle.status === 'parked' ? 'bg-blue-400' : 'bg-red-400'
                            }`}></div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-white">{vehicle.vehicle.plateNumber}</p>
                              <p className="text-xs text-dark-300">{vehicle.speed} km/h</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle List */}
          <div>
            <Card>
              <CardHeader title="Vehicle Status" />
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vehicleLocations.map((vehicle) => (
                    <div
                      key={vehicle.vehicleId}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedVehicle === vehicle.vehicleId
                          ? 'bg-primary-500/20 border-primary-500'
                          : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.vehicleId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            vehicle.status === 'moving' ? 'bg-green-400' :
                            vehicle.status === 'idle' ? 'bg-yellow-400' :
                            vehicle.status === 'parked' ? 'bg-blue-400' : 'bg-red-400'
                          }`}></div>
                          <span className="font-medium text-white">{vehicle.vehicle.plateNumber}</span>
                        </div>
                        <Badge variant={getStatusColor(vehicle.status)} className="text-xs capitalize">
                          {vehicle.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-dark-400 mb-2">
                        <p>{vehicle.vehicle.make} {vehicle.vehicle.model}</p>
                        {vehicle.vehicle.driver && (
                          <p>{vehicle.vehicle.driver.name}</p>
                        )}
                      </div>
                      
                      <div className="text-xs text-dark-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className={getSpeedColor(vehicle.speed)}>{vehicle.speed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel:</span>
                          <span className={`${
                            vehicle.fuelLevel > 50 ? 'text-green-400' :
                            vehicle.fuelLevel > 20 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Update:</span>
                          <span>{formatLastUpdate(vehicle.lastUpdate)}</span>
                        </div>
                      </div>
                      
                      {vehicle.alerts.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dark-600">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-xs text-yellow-400">
                              {vehicle.alerts.length} alert{vehicle.alerts.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Geofence Alerts */}
        <Card>
          <CardHeader title="Recent Geofence Alerts" />
          <CardContent>
            <div className="space-y-4">
              {geofenceAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'entry' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        alert.type === 'entry' ? 'text-green-400' : 'text-red-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={alert.type === 'entry' ? 
                                "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" :
                                "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              } />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {alert.vehicle.plateNumber} {alert.type === 'entry' ? 'entered' : 'exited'} {alert.geofenceName}
                      </p>
                      <p className="text-sm text-dark-400">
                        Driver: {alert.vehicle.driver} • {alert.location.address}
                      </p>
                      <p className="text-xs text-dark-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'primary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Route History Section */}
        {selectedVehicle && (
          <Card>
            <CardHeader 
              title="Route History" 
              action={
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-dark-700 border border-dark-600 rounded px-3 py-1 text-sm text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-dark-700 border border-dark-600 rounded px-3 py-1 text-sm text-white"
                  />
                  <Button variant="primary" size="sm" onClick={() => loadRouteHistory(selectedVehicle)}>
                    Load Route
                  </Button>
                </div>
              }
            />
            <CardContent>
              {routeHistory ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{routeHistory.totalDistance} km</p>
                      <p className="text-sm text-dark-400">Total Distance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{routeHistory.avgSpeed} km/h</p>
                      <p className="text-sm text-dark-400">Avg Speed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{routeHistory.maxSpeed} km/h</p>
                      <p className="text-sm text-dark-400">Max Speed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{routeHistory.fuelConsumed}L</p>
                      <p className="text-sm text-dark-400">Fuel Consumed</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-white mb-4">Route Stops</h3>
                    <div className="space-y-3">
                      {routeHistory.stops.map((stop, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-white">{stop.location}</p>
                              <p className="text-sm text-dark-400">
                                {new Date(stop.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{stop.duration} min</p>
                            <p className="text-sm text-dark-400">Duration</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dark-400">Select date range and click "Load Route" to view history</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FuturisticDashboardLayout>
  );
};

export default GPSTrackingPage;