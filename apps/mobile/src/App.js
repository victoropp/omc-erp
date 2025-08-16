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
exports.default = App;
const react_1 = __importStar(require("react"));
const native_1 = require("@react-navigation/native");
const stack_1 = require("@react-navigation/stack");
const bottom_tabs_1 = require("@react-navigation/bottom-tabs");
const react_native_1 = require("react-native");
const MaterialIcons_1 = __importDefault(require("react-native-vector-icons/MaterialIcons"));
const react_redux_1 = require("react-redux");
const react_2 = require("redux-persist/integration/react");
const netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
// Core Services
const store_1 = require("./store");
const AuthContext_1 = require("./contexts/AuthContext");
const OfflineContext_1 = require("./contexts/OfflineContext");
const LocationContext_1 = require("./contexts/LocationContext");
const CameraContext_1 = require("./contexts/CameraContext");
// Navigation Screens
const LoginScreen_1 = __importDefault(require("./screens/auth/LoginScreen"));
const DashboardScreen_1 = __importDefault(require("./screens/dashboard/DashboardScreen"));
const TankMonitoringScreen_1 = __importDefault(require("./screens/monitoring/TankMonitoringScreen"));
const DeliveryScreen_1 = __importDefault(require("./screens/delivery/DeliveryScreen"));
const InventoryScreen_1 = __importDefault(require("./screens/inventory/InventoryScreen"));
const ComplianceScreen_1 = __importDefault(require("./screens/compliance/ComplianceScreen"));
const ReportsScreen_1 = __importDefault(require("./screens/reports/ReportsScreen"));
const SettingsScreen_1 = __importDefault(require("./screens/settings/SettingsScreen"));
const SplashScreen_1 = __importDefault(require("./screens/SplashScreen"));
// Offline components
const OfflineNotice_1 = __importDefault(require("./components/OfflineNotice"));
const LoadingScreen_1 = __importDefault(require("./components/LoadingScreen"));
// Services
const DatabaseService_1 = require("./services/database/DatabaseService");
const LocationService_1 = require("./services/LocationService");
const NotificationService_1 = require("./services/NotificationService");
const BiometricService_1 = require("./services/BiometricService");
const Stack = (0, stack_1.createStackNavigator)();
const Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
/**
 * React Native Mobile App for Ghana OMC Field Operations
 * Features: Offline capability, GPS tracking, OCR, biometric auth
 * Optimized for poor network connectivity in rural Ghana
 */
function TabNavigator() {
    return (<Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                switch (route.name) {
                    case 'Dashboard':
                        iconName = 'dashboard';
                        break;
                    case 'Monitoring':
                        iconName = 'monitor';
                        break;
                    case 'Delivery':
                        iconName = 'local-shipping';
                        break;
                    case 'Inventory':
                        iconName = 'inventory';
                        break;
                    case 'Compliance':
                        iconName = 'verified';
                        break;
                    case 'Reports':
                        iconName = 'assessment';
                        break;
                    default:
                        iconName = 'help';
                }
                return <MaterialIcons_1.default name={iconName} size={size} color={color}/>;
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            headerShown: false,
        })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen_1.default} options={{ title: 'Dashboard' }}/>
      <Tab.Screen name="Monitoring" component={TankMonitoringScreen_1.default} options={{ title: 'Tanks' }}/>
      <Tab.Screen name="Delivery" component={DeliveryScreen_1.default} options={{ title: 'Delivery' }}/>
      <Tab.Screen name="Inventory" component={InventoryScreen_1.default} options={{ title: 'Inventory' }}/>
      <Tab.Screen name="Compliance" component={ComplianceScreen_1.default} options={{ title: 'Compliance' }}/>
      <Tab.Screen name="Reports" component={ReportsScreen_1.default} options={{ title: 'Reports' }}/>
    </Tab.Navigator>);
}
function AppNavigator() {
    return (<native_1.NavigationContainer>
      <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
                return {
                    cardStyle: {
                        transform: [
                            {
                                translateX: current.progress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [layouts.screen.width, 0],
                                }),
                            },
                        ],
                    },
                };
            },
        }}>
        <Stack.Screen name="Splash" component={SplashScreen_1.default}/>
        <Stack.Screen name="Login" component={LoginScreen_1.default}/>
        <Stack.Screen name="Main" component={TabNavigator}/>
        <Stack.Screen name="Settings" component={SettingsScreen_1.default}/>
      </Stack.Navigator>
    </native_1.NavigationContainer>);
}
function App() {
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isConnected, setIsConnected] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        initializeApp();
    }, []);
    const initializeApp = async () => {
        try {
            // Request permissions
            await requestPermissions();
            // Initialize offline database
            await (0, DatabaseService_1.initializeDatabase)();
            // Initialize services
            await LocationService_1.LocationService.initialize();
            await NotificationService_1.NotificationService.initialize();
            await BiometricService_1.BiometricService.initialize();
            // Setup network monitoring
            const unsubscribe = netinfo_1.default.addEventListener(state => {
                setIsConnected(state.isConnected ?? false);
            });
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
            return unsubscribe;
        }
        catch (error) {
            console.error('Failed to initialize app:', error);
            setIsLoading(false);
        }
    };
    const requestPermissions = async () => {
        if (react_native_1.Platform.OS === 'android') {
            await react_native_1.PermissionsAndroid.requestMultiple([
                react_native_1.PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                react_native_1.PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                react_native_1.PermissionsAndroid.PERMISSIONS.CAMERA,
                react_native_1.PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                react_native_1.PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                react_native_1.PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                react_native_1.PermissionsAndroid.PERMISSIONS.USE_BIOMETRIC,
                react_native_1.PermissionsAndroid.PERMISSIONS.USE_FINGERPRINT,
            ]);
        }
    };
    if (isLoading) {
        return <LoadingScreen_1.default />;
    }
    return (<react_redux_1.Provider store={store_1.store}>
      <react_2.PersistGate loading={<LoadingScreen_1.default />} persistor={store_1.persistor}>
        <AuthContext_1.AuthProvider>
          <OfflineContext_1.OfflineProvider>
            <LocationContext_1.LocationProvider>
              <CameraContext_1.CameraProvider>
                <react_native_1.StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false}/>
                <AppNavigator />
                {!isConnected && <OfflineNotice_1.default />}
              </CameraContext_1.CameraProvider>
            </LocationContext_1.LocationProvider>
          </OfflineContext_1.OfflineProvider>
        </AuthContext_1.AuthProvider>
      </react_2.PersistGate>
    </react_redux_1.Provider>);
}
//# sourceMappingURL=App.js.map