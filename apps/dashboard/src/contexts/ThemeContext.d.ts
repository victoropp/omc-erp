import React from 'react';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ActualTheme = 'light' | 'dark';
interface ThemeContextType {
    mode: ThemeMode;
    actualTheme: ActualTheme;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    isSystemTheme: boolean;
}
export declare function useTheme(): ThemeContextType;
interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeMode;
    storageKey?: string;
}
export declare function ThemeProvider({ children, defaultTheme, storageKey, }: ThemeProviderProps): React.JSX.Element;
export {};
//# sourceMappingURL=ThemeContext.d.ts.map