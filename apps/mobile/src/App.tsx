import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';

// Core Services
import { store, persistor } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LocationProvider } from './contexts/LocationContext';
import { CameraProvider } from './contexts/CameraContext';

// Navigation Screens
import LoginScreen from './screens/auth/LoginScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import TankMonitoringScreen from './screens/monitoring/TankMonitoringScreen';
import DeliveryScreen from './screens/delivery/DeliveryScreen';
import InventoryScreen from './screens/inventory/InventoryScreen';
import ComplianceScreen from './screens/compliance/ComplianceScreen';
import ReportsScreen from './screens/reports/ReportsScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import SplashScreen from './screens/SplashScreen';

// Offline components
import OfflineNotice from './components/OfflineNotice';
import LoadingScreen from './components/LoadingScreen';

// Services
import { initializeDatabase } from './services/database/DatabaseService';
import { LocationService } from './services/LocationService';
import { NotificationService } from './services/NotificationService';
import { BiometricService } from './services/BiometricService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * React Native Mobile App for Ghana OMC Field Operations
 * Features: Offline capability, GPS tracking, OCR, biometric auth
 * Optimized for poor network connectivity in rural Ghana
 */

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

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

          return <Icon name={iconName} size={size} color={color} />;
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
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Monitoring" 
        component={TankMonitoringScreen}
        options={{ title: 'Tanks' }}
      />
      <Tab.Screen 
        name="Delivery" 
        component={DeliveryScreen}
        options={{ title: 'Delivery' }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Tab.Screen 
        name="Compliance" 
        component={ComplianceScreen}
        options={{ title: 'Compliance' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
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
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions
      await requestPermissions();

      // Initialize offline database
      await initializeDatabase();

      // Initialize services
      await LocationService.initialize();
      await NotificationService.initialize();
      await BiometricService.initialize();

      // Setup network monitoring
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected ?? false);
      });

      setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.USE_BIOMETRIC,
        PermissionsAndroid.PERMISSIONS.USE_FINGERPRINT,
      ]);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AuthProvider>
          <OfflineProvider>
            <LocationProvider>
              <CameraProvider>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor="#ffffff"
                  translucent={false}
                />
                <AppNavigator />
                {!isConnected && <OfflineNotice />}
              </CameraProvider>
            </LocationProvider>
          </OfflineProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}