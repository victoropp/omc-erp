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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
exports.ThemeProvider = ThemeProvider;
const react_1 = __importStar(require("react"));
const ThemeContext = (0, react_1.createContext)(undefined);
function useTheme() {
    const context = (0, react_1.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'omc-erp-theme', }) {
    const [mode, setMode] = (0, react_1.useState)(defaultTheme);
    const [actualTheme, setActualTheme] = (0, react_1.useState)('dark');
    // Get system theme preference
    const getSystemTheme = () => {
        if (typeof window === 'undefined')
            return 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    // Calculate actual theme based on mode
    const calculateActualTheme = (themeMode) => {
        if (themeMode === 'system') {
            return getSystemTheme();
        }
        return themeMode;
    };
    // Apply theme to document
    const applyTheme = (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0C0C0F' : '#FFFFFF');
        }
    };
    // Set theme mode and persist to storage
    const setTheme = (newMode) => {
        setMode(newMode);
        localStorage.setItem(storageKey, newMode);
        const newActualTheme = calculateActualTheme(newMode);
        setActualTheme(newActualTheme);
        applyTheme(newActualTheme);
    };
    // Toggle between themes (dark -> light -> system -> dark)
    const toggleTheme = () => {
        const themeOrder = ['dark', 'light', 'system'];
        const currentIndex = themeOrder.indexOf(mode);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        setTheme(themeOrder[nextIndex]);
    };
    // Initialize theme on mount
    (0, react_1.useEffect)(() => {
        let initialMode = defaultTheme;
        // Try to get stored theme
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored && ['light', 'dark', 'system'].includes(stored)) {
                initialMode = stored;
            }
        }
        const initialActualTheme = calculateActualTheme(initialMode);
        setMode(initialMode);
        setActualTheme(initialActualTheme);
        applyTheme(initialActualTheme);
    }, [defaultTheme, storageKey]);
    // Listen for system theme changes
    (0, react_1.useEffect)(() => {
        if (mode !== 'system')
            return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const newSystemTheme = getSystemTheme();
            setActualTheme(newSystemTheme);
            applyTheme(newSystemTheme);
        };
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        else {
            // Legacy browsers
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [mode]);
    const value = {
        mode,
        actualTheme,
        setTheme,
        toggleTheme,
        isSystemTheme: mode === 'system',
    };
    return (<ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>);
}
//# sourceMappingURL=ThemeContext.js.map