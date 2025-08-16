"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_query_1 = require("@tanstack/react-query");
const react_hot_toast_1 = require("react-hot-toast");
const react_1 = require("react");
const ThemeContext_1 = require("@/contexts/ThemeContext");
require("../styles/globals.css");
// Create a client instance
function createQueryClient() {
    return new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    // Don't retry on 4xx errors except 408 (timeout)
                    if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 408) {
                        return false;
                    }
                    return failureCount < 3;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}
function App({ Component, pageProps }) {
    // Create a new QueryClient for each page load to ensure we don't
    // share client state between users in SSR scenarios
    const [queryClient] = (0, react_1.useState)(() => createQueryClient());
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <ThemeContext_1.ThemeProvider defaultTheme="system">
        {/* Global toast notifications */}
        <react_hot_toast_1.Toaster position="top-right" toastOptions={{
            duration: 4000,
            className: 'toast-glass',
            style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
            },
            success: {
                iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                },
            },
            error: {
                iconTheme: {
                    primary: '#EF4444',
                    secondary: 'white',
                },
            },
            loading: {
                iconTheme: {
                    primary: '#F59E0B',
                    secondary: 'white',
                },
            },
        }}/>
        
        {/* Main application */}
        <Component {...pageProps}/>
      </ThemeContext_1.ThemeProvider>
    </react_query_1.QueryClientProvider>);
}
//# sourceMappingURL=_app.js.map