import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types/shared';

// User interface for the app
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  lastLoginAt?: Date;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Mock user data for development
const mockUser: User = {
  id: '1',
  email: 'admin@ghanaomc.com',
  firstName: 'John',
  lastName: 'Mensah',
  role: UserRole.SUPER_ADMIN,
  tenantId: 'tenant-1',
  lastLoginAt: new Date(),
  preferences: {
    theme: 'dark',
    notifications: true,
    language: 'en',
  },
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  refreshToken: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock authentication logic
      if (email === 'admin@ghanaomc.com' && password === 'password') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        const mockRefreshToken = 'mock-refresh-token-' + Date.now();
        
        // Store tokens
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('refresh_token', mockRefreshToken);
        
        set({
          user: mockUser,
          isAuthenticated: true,
          token: mockToken,
          refreshToken: mockRefreshToken,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear tokens from storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Reset state
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      isLoading: false,
    });
  },

  refreshAuth: async () => {
    set({ isLoading: true });
    
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken && storedRefreshToken) {
        // Simulate token validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          user: mockUser,
          isAuthenticated: true,
          token: storedToken,
          refreshToken: storedRefreshToken,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      get().logout();
    }
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates },
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  // Check for existing tokens and refresh auth
  const initAuth = async () => {
    const store = useAuthStore.getState();
    await store.refreshAuth();
  };
  
  initAuth();
}