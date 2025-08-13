import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera } from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import DocumentPicker from 'react-native-document-picker';
import SignatureScreen from 'react-native-signature-canvas';
import QRCodeScanner from 'react-native-qrcode-scanner';

// Components
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

// Services
import { DeliveryService } from '../../services/DeliveryService';
import { LocationService } from '../../services/LocationService';
import { CameraService } from '../../services/CameraService';
import { OfflineStorage } from '../../services/OfflineStorage';

// Types
interface DeliveryItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  expectedQuantity: number;
  variance?: number;
}

interface DeliveryProof {
  photos: string[];
  signature: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  deliveryNote: string;
  odometerReading?: number;
  fuelLevelBefore?: number;
  fuelLevelAfter?: number;
}

const { width, height } = Dimensions.get('window');

/**
 * Delivery Screen for Driver Mobile App
 * Features: GPS tracking, photo capture, digital signatures, OCR scanning
 * Designed for Ghana's challenging network conditions
 */
export default function DeliveryScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  
  const cameraRef = useRef<Camera>(null);
  const signatureRef = useRef<SignatureScreen>(null);

  useEffect(() => {
    loadPendingDeliveries();
    getCurrentLocation();
  }, []);

  const loadPendingDeliveries = async () => {
    try {
      setIsLoading(true);
      const pending = await DeliveryService.getPendingDeliveries();
      setDeliveries(pending);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      // Load from offline storage if network fails
      const offlineDeliveries = await OfflineStorage.getDeliveries();
      setDeliveries(offlineDeliveries);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentPosition();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location Error', 'Unable to get current location. Delivery proof may be incomplete.');
    }
  };

  const startDelivery = async (delivery: any) => {
    try {
      setCurrentDelivery(delivery);
      setDeliveryItems(delivery.items || []);
      
      // Track delivery start
      await DeliveryService.startDelivery(delivery.id, currentLocation);
      
      // Start GPS tracking
      LocationService.startTracking(delivery.id);
      
      Alert.alert('Delivery Started', `Delivery ${delivery.deliveryNumber} has been started. GPS tracking is now active.`);
    } catch (error) {
      console.error('Failed to start delivery:', error);
      Alert.alert('Error', 'Failed to start delivery. Please try again.');
    }
  };

  const updateDeliveryQuantity = (itemId: string, actualQuantity: number) => {
    setDeliveryItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const variance = actualQuantity - item.expectedQuantity;
          return { ...item, quantity: actualQuantity, variance };
        }
        return item;
      })
    );
  };

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await CameraService.takePicture(cameraRef.current);
      setCapturedPhotos(prev => [...prev, photo.path]);
      setShowCamera(false);
      
      Alert.alert('Photo Captured', 'Delivery photo has been captured and stored locally.');
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleBarcodeScanned = (data: string) => {
    try {
      // Parse scanned barcode/QR code
      const scannedData = JSON.parse(data);
      
      if (scannedData.type === 'delivery_verification') {
        // Update delivery with scanned verification data
        setCurrentDelivery(prev => ({
          ...prev,
          verificationCode: scannedData.code,
          scanTimestamp: new Date().toISOString(),
        }));
        
        Alert.alert('Verification Scanned', 'Delivery verification code has been recorded.');
      }
      
      setShowScanner(false);
    } catch (error) {
      Alert.alert('Invalid Code', 'The scanned code is not valid for delivery verification.');
      setShowScanner(false);
    }
  };

  const saveSignature = (signature: string) => {
    setSignature(signature);
    setShowSignature(false);
    Alert.alert('Signature Saved', 'Customer signature has been captured.');
  };

  const completeDelivery = async () => {
    try {
      if (!signature) {
        Alert.alert('Missing Signature', 'Customer signature is required to complete delivery.');
        return;
      }

      if (capturedPhotos.length === 0) {
        Alert.alert('Missing Photos', 'At least one delivery photo is required.');
        return;
      }

      setIsLoading(true);

      const deliveryProof: DeliveryProof = {
        photos: capturedPhotos,
        signature,
        location: {
          latitude: currentLocation?.latitude || 0,
          longitude: currentLocation?.longitude || 0,
          timestamp: new Date().toISOString(),
        },
        deliveryNote: deliveryNotes,
        odometerReading: odometerReading ? parseFloat(odometerReading) : undefined,
      };

      // Calculate variances
      const totalVariance = deliveryItems.reduce((sum, item) => sum + (item.variance || 0), 0);

      const completionData = {
        deliveryId: currentDelivery.id,
        items: deliveryItems,
        proof: deliveryProof,
        completedAt: new Date().toISOString(),
        totalVariance,
        driverId: currentDelivery.driverId,
        routeData: await LocationService.getRouteData(currentDelivery.id),
      };

      // Try to submit online first
      try {
        await DeliveryService.completeDelivery(completionData);
        Alert.alert('Delivery Completed', 'Delivery has been completed and submitted successfully.');
      } catch (networkError) {
        // Store offline if network fails
        await OfflineStorage.saveCompletedDelivery(completionData);
        Alert.alert('Delivery Completed (Offline)', 'Delivery completed and saved locally. Will sync when connection is restored.');
      }

      // Stop GPS tracking
      LocationService.stopTracking(currentDelivery.id);

      // Reset state
      setCurrentDelivery(null);
      setDeliveryItems([]);
      setCapturedPhotos([]);
      setSignature('');
      setDeliveryNotes('');
      setOdometerReading('');

      // Reload deliveries
      await loadPendingDeliveries();

    } catch (error) {
      console.error('Failed to complete delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
    } else {
      Alert.alert('Permission Required', 'Camera permission is required to capture delivery photos.');
    }
  };

  const renderDeliveryList = () => (
    <ScrollView style={styles.container}>
      <Header title="Pending Deliveries" />
      
      {deliveries.map((delivery) => (
        <Card key={delivery.id} style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.deliveryNumber}>{delivery.deliveryNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
              <Text style={styles.statusText}>{delivery.status}</Text>
            </View>
          </View>
          
          <Text style={styles.destination}>{delivery.destination}</Text>
          <Text style={styles.distance}>{delivery.distance} km</Text>
          
          <View style={styles.itemsSummary}>
            <Text style={styles.itemsTitle}>Items: {delivery.totalItems}</Text>
            <Text style={styles.itemsQuantity}>{delivery.totalQuantity}L</Text>
          </View>
          
          <Button
            title="Start Delivery"
            onPress={() => startDelivery(delivery)}
            style={styles.startButton}
            disabled={delivery.status !== 'assigned'}
          />
        </Card>
      ))}
    </ScrollView>
  );

  const renderActiveDelivery = () => (
    <ScrollView style={styles.container}>
      <Header 
        title={`Delivery ${currentDelivery.deliveryNumber}`}
        onBack={() => setCurrentDelivery(null)}
      />
      
      <Card style={styles.deliveryCard}>
        <Text style={styles.sectionTitle}>Destination</Text>
        <Text style={styles.destinationAddress}>{currentDelivery.destination}</Text>
        
        <View style={styles.locationInfo}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.locationText}>
            {currentLocation ? 
              `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` :
              'Getting location...'
            }
          </Text>
        </View>
      </Card>

      <Card style={styles.deliveryCard}>
        <Text style={styles.sectionTitle}>Items to Deliver</Text>
        {deliveryItems.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemBatch}>Batch: {item.batchNumber}</Text>
            </View>
            
            <View style={styles.quantitySection}>
              <Text style={styles.expectedQuantity}>Expected: {item.expectedQuantity}L</Text>
              <Input
                placeholder="Actual quantity"
                value={item.quantity?.toString()}
                onChangeText={(text) => updateDeliveryQuantity(item.id, parseFloat(text) || 0)}
                keyboardType="numeric"
                style={styles.quantityInput}
              />
              {item.variance !== undefined && (
                <Text style={[styles.variance, { color: item.variance >= 0 ? 'green' : 'red' }]}>
                  Variance: {item.variance > 0 ? '+' : ''}{item.variance}L
                </Text>
              )}
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.deliveryCard}>
        <Text style={styles.sectionTitle}>Delivery Proof</Text>
        
        <View style={styles.proofActions}>
          <TouchableOpacity style={styles.proofButton} onPress={openCamera}>
            <Icon name="camera-alt" size={24} color="#2563eb" />
            <Text style={styles.proofButtonText}>
              Photos ({capturedPhotos.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.proofButton} onPress={() => setShowSignature(true)}>
            <Icon name="edit" size={24} color="#2563eb" />
            <Text style={styles.proofButtonText}>
              {signature ? 'Update Signature' : 'Get Signature'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.proofButton} onPress={() => setShowScanner(true)}>
            <Icon name="qr-code-scanner" size={24} color="#2563eb" />
            <Text style={styles.proofButtonText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
        
        <Input
          placeholder="Delivery notes (optional)"
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />
        
        <Input
          placeholder="Odometer reading (optional)"
          value={odometerReading}
          onChangeText={setOdometerReading}
          keyboardType="numeric"
          style={styles.odometerInput}
        />
      </Card>

      <Button
        title="Complete Delivery"
        onPress={completeDelivery}
        style={styles.completeButton}
        disabled={!signature || capturedPhotos.length === 0}
      />
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading deliveries..." />;
  }

  return (
    <View style={styles.screen}>
      {currentDelivery ? renderActiveDelivery() : renderDeliveryList()}
      
      {/* Camera Modal */}
      <Modal visible={showCamera} onClose={() => setShowCamera(false)}>
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device="back"
            isActive={showCamera}
            photo={true}
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
              <Icon name="camera" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Signature Modal */}
      <Modal visible={showSignature} onClose={() => setShowSignature(false)}>
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>Customer Signature</Text>
          <SignatureScreen
            ref={signatureRef}
            onOK={saveSignature}
            onEmpty={() => Alert.alert('Empty Signature', 'Please provide a signature.')}
            autoClear={false}
            descriptionText="Sign above"
            clearText="Clear"
            confirmText="Save"
          />
        </View>
      </Modal>
      
      {/* QR Scanner Modal */}
      <Modal visible={showScanner} onClose={() => setShowScanner(false)}>
        <QRCodeScanner
          onRead={(e) => handleBarcodeScanned(e.data)}
          cameraStyle={styles.scanner}
          showMarker={true}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  deliveryCard: {
    marginBottom: 16,
    padding: 16,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  destination: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    color: '#666',
  },
  itemsQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#2563eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  destinationAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemBatch: {
    fontSize: 14,
    color: '#666',
  },
  quantitySection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  expectedQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quantityInput: {
    width: 100,
    textAlign: 'right',
  },
  variance: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  proofActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  proofButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    minWidth: 80,
  },
  proofButtonText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
    textAlign: 'center',
  },
  notesInput: {
    marginBottom: 12,
  },
  odometerInput: {
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureContainer: {
    flex: 1,
    padding: 16,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  scanner: {
    height: height * 0.7,
  },
});