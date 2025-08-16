"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const react_1 = require("react");
const router_1 = require("next/router");
const auth_store_1 = require("@/stores/auth.store");
const LoadingScreen_1 = require("@/components/ui/LoadingScreen");
function HomePage() {
    const router = (0, router_1.useRouter)();
    const { user, isLoading } = (0, auth_store_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        // Redirect based on authentication status
        if (!isLoading) {
            if (user) {
                // User is authenticated, redirect to dashboard
                router.push('/dashboard');
            }
            else {
                // User is not authenticated, redirect to login
                router.push('/auth/login');
            }
        }
    }, [user, isLoading, router]);
    // Show loading screen while checking authentication
    return <LoadingScreen_1.LoadingScreen />;
}
//# sourceMappingURL=index.js.map