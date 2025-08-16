"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const shared_1 = require("@/types/shared");
// Mock user data for development
const mockUser = {
    id: '1',
    email: 'admin@ghanaomc.com',
    firstName: 'John',
    lastName: 'Mensah',
    role: shared_1.UserRole.SUPER_ADMIN,
    tenantId: 'tenant-1',
    lastLoginAt: new Date(),
    preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
    },
};
exports.useAuthStore = (0, zustand_1.create)((set, get) => ({
    // Initial state
    user: null,
    isLoading: true,
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    // Actions
    login: async (email, password) => {
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
            }
            else {
                throw new Error('Invalid credentials');
            }
        }
        catch (error) {
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
            }
            else {
                set({ isLoading: false });
            }
        }
        catch (error) {
            console.error('Auth refresh failed:', error);
            get().logout();
        }
    },
    updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
                user: { ...currentUser, ...updates },
            });
        }
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
}));
// Initialize auth state on app load
if (typeof window !== 'undefined') {
    // Check for existing tokens and refresh auth
    const initAuth = async () => {
        const store = exports.useAuthStore.getState();
        await store.refreshAuth();
    };
    initAuth();
}
//# sourceMappingURL=auth.store.js.map