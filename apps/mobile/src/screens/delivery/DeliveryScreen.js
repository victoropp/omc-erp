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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeliveryScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const MaterialIcons_1 = __importDefault(require("react-native-vector-icons/MaterialIcons"));
const react_native_vision_camera_1 = require("react-native-vision-camera");
const react_native_signature_canvas_1 = __importDefault(require("react-native-signature-canvas"));
const react_native_qrcode_scanner_1 = __importDefault(require("react-native-qrcode-scanner"));
// Components
const Header_1 = __importDefault(require("../../components/Header"));
const Card_1 = __importDefault(require("../../components/Card"));
const Button_1 = __importDefault(require("../../components/Button"));
const Input_1 = __importDefault(require("../../components/Input"));
const Modal_1 = __importDefault(require("../../components/Modal"));
const LoadingSpinner_1 = __importDefault(require("../../components/LoadingSpinner"));
// Services
const DeliveryService_1 = require("../../services/DeliveryService");
const LocationService_1 = require("../../services/LocationService");
const CameraService_1 = require("../../services/CameraService");
const OfflineStorage_1 = require("../../services/OfflineStorage");
const { width, height } = react_native_1.Dimensions.get('window');
/**
 * Delivery Screen for Driver Mobile App
 * Features: GPS tracking, photo capture, digital signatures, OCR scanning
 * Designed for Ghana's challenging network conditions
 */
function DeliveryScreen() {
    const [deliveries, setDeliveries] = (0, react_1.useState)([]);
    const [currentDelivery, setCurrentDelivery] = (0, react_1.useState)(null);
    const [deliveryItems, setDeliveryItems] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [showCamera, setShowCamera] = (0, react_1.useState)(false);
    const [showSignature, setShowSignature] = (0, react_1.useState)(false);
    const [showScanner, setShowScanner] = (0, react_1.useState)(false);
    const [capturedPhotos, setCapturedPhotos] = (0, react_1.useState)([]);
    const [signature, setSignature] = (0, react_1.useState)('');
    const [currentLocation, setCurrentLocation] = (0, react_1.useState)(null);
    const [deliveryNotes, setDeliveryNotes] = (0, react_1.useState)('');
    const [odometerReading, setOdometerReading] = (0, react_1.useState)('');
    const cameraRef = (0, react_1.useRef)(null);
    const signatureRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        loadPendingDeliveries();
        getCurrentLocation();
    }, []);
    const loadPendingDeliveries = async () => {
        try {
            setIsLoading(true);
            const pending = await DeliveryService_1.DeliveryService.getPendingDeliveries();
            setDeliveries(pending);
        }
        catch (error) {
            console.error('Failed to load deliveries:', error);
            // Load from offline storage if network fails
            const offlineDeliveries = await OfflineStorage_1.OfflineStorage.getDeliveries();
            setDeliveries(offlineDeliveries);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getCurrentLocation = async () => {
        try {
            const location = await LocationService_1.LocationService.getCurrentPosition();
            setCurrentLocation(location);
        }
        catch (error) {
            console.error('Failed to get location:', error);
            react_native_1.Alert.alert('Location Error', 'Unable to get current location. Delivery proof may be incomplete.');
        }
    };
    const startDelivery = async (delivery) => {
        try {
            setCurrentDelivery(delivery);
            setDeliveryItems(delivery.items || []);
            // Track delivery start
            await DeliveryService_1.DeliveryService.startDelivery(delivery.id, currentLocation);
            // Start GPS tracking
            LocationService_1.LocationService.startTracking(delivery.id);
            react_native_1.Alert.alert('Delivery Started', `Delivery ${delivery.deliveryNumber} has been started. GPS tracking is now active.`);
        }
        catch (error) {
            console.error('Failed to start delivery:', error);
            react_native_1.Alert.alert('Error', 'Failed to start delivery. Please try again.');
        }
    };
    const updateDeliveryQuantity = (itemId, actualQuantity) => {
        setDeliveryItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const variance = actualQuantity - item.expectedQuantity;
                return { ...item, quantity: actualQuantity, variance };
            }
            return item;
        }));
    };
    const capturePhoto = async () => {
        try {
            if (!cameraRef.current)
                return;
            const photo = await CameraService_1.CameraService.takePicture(cameraRef.current);
            setCapturedPhotos(prev => [...prev, photo.path]);
            setShowCamera(false);
            react_native_1.Alert.alert('Photo Captured', 'Delivery photo has been captured and stored locally.');
        }
        catch (error) {
            console.error('Failed to capture photo:', error);
            react_native_1.Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
        }
    };
    const handleBarcodeScanned = (data) => {
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
                react_native_1.Alert.alert('Verification Scanned', 'Delivery verification code has been recorded.');
            }
            setShowScanner(false);
        }
        catch (error) {
            react_native_1.Alert.alert('Invalid Code', 'The scanned code is not valid for delivery verification.');
            setShowScanner(false);
        }
    };
    const saveSignature = (signature) => {
        setSignature(signature);
        setShowSignature(false);
        react_native_1.Alert.alert('Signature Saved', 'Customer signature has been captured.');
    };
    const completeDelivery = async () => {
        try {
            if (!signature) {
                react_native_1.Alert.alert('Missing Signature', 'Customer signature is required to complete delivery.');
                return;
            }
            if (capturedPhotos.length === 0) {
                react_native_1.Alert.alert('Missing Photos', 'At least one delivery photo is required.');
                return;
            }
            setIsLoading(true);
            const deliveryProof = {
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
                routeData: await LocationService_1.LocationService.getRouteData(currentDelivery.id),
            };
            // Try to submit online first
            try {
                await DeliveryService_1.DeliveryService.completeDelivery(completionData);
                react_native_1.Alert.alert('Delivery Completed', 'Delivery has been completed and submitted successfully.');
            }
            catch (networkError) {
                // Store offline if network fails
                await OfflineStorage_1.OfflineStorage.saveCompletedDelivery(completionData);
                react_native_1.Alert.alert('Delivery Completed (Offline)', 'Delivery completed and saved locally. Will sync when connection is restored.');
            }
            // Stop GPS tracking
            LocationService_1.LocationService.stopTracking(currentDelivery.id);
            // Reset state
            setCurrentDelivery(null);
            setDeliveryItems([]);
            setCapturedPhotos([]);
            setSignature('');
            setDeliveryNotes('');
            setOdometerReading('');
            // Reload deliveries
            await loadPendingDeliveries();
        }
        catch (error) {
            console.error('Failed to complete delivery:', error);
            react_native_1.Alert.alert('Error', 'Failed to complete delivery. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const requestCameraPermission = async () => {
        if (react_native_1.Platform.OS === 'android') {
            const granted = await react_native_1.PermissionsAndroid.request(react_native_1.PermissionsAndroid.PERMISSIONS.CAMERA);
            return granted === react_native_1.PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };
    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
            setShowCamera(true);
        }
        else {
            react_native_1.Alert.alert('Permission Required', 'Camera permission is required to capture delivery photos.');
        }
    };
    const renderDeliveryList = () => (<react_native_1.ScrollView style={styles.container}>
      <Header_1.default title="Pending Deliveries"/>
      
      {deliveries.map((delivery) => (<Card_1.default key={delivery.id} style={styles.deliveryCard}>
          <react_native_1.View style={styles.deliveryHeader}>
            <react_native_1.Text style={styles.deliveryNumber}>{delivery.deliveryNumber}</react_native_1.Text>
            <react_native_1.View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
              <react_native_1.Text style={styles.statusText}>{delivery.status}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          
          <react_native_1.Text style={styles.destination}>{delivery.destination}</react_native_1.Text>
          <react_native_1.Text style={styles.distance}>{delivery.distance} km</react_native_1.Text>
          
          <react_native_1.View style={styles.itemsSummary}>
            <react_native_1.Text style={styles.itemsTitle}>Items: {delivery.totalItems}</react_native_1.Text>
            <react_native_1.Text style={styles.itemsQuantity}>{delivery.totalQuantity}L</react_native_1.Text>
          </react_native_1.View>
          
          <Button_1.default title="Start Delivery" onPress={() => startDelivery(delivery)} style={styles.startButton} disabled={delivery.status !== 'assigned'}/>
        </Card_1.default>))}
    </react_native_1.ScrollView>);
    const renderActiveDelivery = () => (<react_native_1.ScrollView style={styles.container}>
      <Header_1.default title={`Delivery ${currentDelivery.deliveryNumber}`} onBack={() => setCurrentDelivery(null)}/>
      
      <Card_1.default style={styles.deliveryCard}>
        <react_native_1.Text style={styles.sectionTitle}>Destination</react_native_1.Text>
        <react_native_1.Text style={styles.destinationAddress}>{currentDelivery.destination}</react_native_1.Text>
        
        <react_native_1.View style={styles.locationInfo}>
          <MaterialIcons_1.default name="location-on" size={16} color="#666"/>
          <react_native_1.Text style={styles.locationText}>
            {currentLocation ?
            `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` :
            'Getting location...'}
          </react_native_1.Text>
        </react_native_1.View>
      </Card_1.default>

      <Card_1.default style={styles.deliveryCard}>
        <react_native_1.Text style={styles.sectionTitle}>Items to Deliver</react_native_1.Text>
        {deliveryItems.map((item, index) => (<react_native_1.View key={item.id} style={styles.itemRow}>
            <react_native_1.View style={styles.itemInfo}>
              <react_native_1.Text style={styles.itemName}>{item.productName}</react_native_1.Text>
              <react_native_1.Text style={styles.itemBatch}>Batch: {item.batchNumber}</react_native_1.Text>
            </react_native_1.View>
            
            <react_native_1.View style={styles.quantitySection}>
              <react_native_1.Text style={styles.expectedQuantity}>Expected: {item.expectedQuantity}L</react_native_1.Text>
              <Input_1.default placeholder="Actual quantity" value={item.quantity?.toString()} onChangeText={(text) => updateDeliveryQuantity(item.id, parseFloat(text) || 0)} keyboardType="numeric" style={styles.quantityInput}/>
              {item.variance !== undefined && (<react_native_1.Text style={[styles.variance, { color: item.variance >= 0 ? 'green' : 'red' }]}>
                  Variance: {item.variance > 0 ? '+' : ''}{item.variance}L
                </react_native_1.Text>)}
            </react_native_1.View>
          </react_native_1.View>))}
      </Card_1.default>

      <Card_1.default style={styles.deliveryCard}>
        <react_native_1.Text style={styles.sectionTitle}>Delivery Proof</react_native_1.Text>
        
        <react_native_1.View style={styles.proofActions}>
          <react_native_1.TouchableOpacity style={styles.proofButton} onPress={openCamera}>
            <MaterialIcons_1.default name="camera-alt" size={24} color="#2563eb"/>
            <react_native_1.Text style={styles.proofButtonText}>
              Photos ({capturedPhotos.length})
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
          
          <react_native_1.TouchableOpacity style={styles.proofButton} onPress={() => setShowSignature(true)}>
            <MaterialIcons_1.default name="edit" size={24} color="#2563eb"/>
            <react_native_1.Text style={styles.proofButtonText}>
              {signature ? 'Update Signature' : 'Get Signature'}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
          
          <react_native_1.TouchableOpacity style={styles.proofButton} onPress={() => setShowScanner(true)}>
            <MaterialIcons_1.default name="qr-code-scanner" size={24} color="#2563eb"/>
            <react_native_1.Text style={styles.proofButtonText}>Scan QR</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        <Input_1.default placeholder="Delivery notes (optional)" value={deliveryNotes} onChangeText={setDeliveryNotes} multiline numberOfLines={3} style={styles.notesInput}/>
        
        <Input_1.default placeholder="Odometer reading (optional)" value={odometerReading} onChangeText={setOdometerReading} keyboardType="numeric" style={styles.odometerInput}/>
      </Card_1.default>

      <Button_1.default title="Complete Delivery" onPress={completeDelivery} style={styles.completeButton} disabled={!signature || capturedPhotos.length === 0}/>
    </react_native_1.ScrollView>);
    const getStatusColor = (status) => {
        switch (status) {
            case 'assigned': return '#3b82f6';
            case 'in_progress': return '#f59e0b';
            case 'completed': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };
    if (isLoading) {
        return <LoadingSpinner_1.default message="Loading deliveries..."/>;
    }
    return (<react_native_1.View style={styles.screen}>
      {currentDelivery ? renderActiveDelivery() : renderDeliveryList()}
      
      {/* Camera Modal */}
      <Modal_1.default visible={showCamera} onClose={() => setShowCamera(false)}>
        <react_native_1.View style={styles.cameraContainer}>
          <react_native_vision_camera_1.Camera ref={cameraRef} style={styles.camera} device="back" isActive={showCamera} photo={true}/>
          <react_native_1.View style={styles.cameraControls}>
            <react_native_1.TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
              <MaterialIcons_1.default name="camera" size={32} color="white"/>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
        </react_native_1.View>
      </Modal_1.default>
      
      {/* Signature Modal */}
      <Modal_1.default visible={showSignature} onClose={() => setShowSignature(false)}>
        <react_native_1.View style={styles.signatureContainer}>
          <react_native_1.Text style={styles.signatureTitle}>Customer Signature</react_native_1.Text>
          <react_native_signature_canvas_1.default ref={signatureRef} onOK={saveSignature} onEmpty={() => react_native_1.Alert.alert('Empty Signature', 'Please provide a signature.')} autoClear={false} descriptionText="Sign above" clearText="Clear" confirmText="Save"/>
        </react_native_1.View>
      </Modal_1.default>
      
      {/* QR Scanner Modal */}
      <Modal_1.default visible={showScanner} onClose={() => setShowScanner(false)}>
        <react_native_qrcode_scanner_1.default onRead={(e) => handleBarcodeScanned(e.data)} cameraStyle={styles.scanner} showMarker={true}/>
      </Modal_1.default>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
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
//# sourceMappingURL=DeliveryScreen.js.map