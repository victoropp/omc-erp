import { UserRole } from '@/types/shared';
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
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthStore>>;
export {};
//# sourceMappingURL=auth.store.d.ts.map