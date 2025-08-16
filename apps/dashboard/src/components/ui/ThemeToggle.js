"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function ThemeToggle() {
    const { mode, actualTheme, toggleTheme, isSystemTheme } = (0, ThemeContext_1.useTheme)();
    const getThemeIcon = () => {
        if (mode === 'system') {
            return (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>);
        }
        if (actualTheme === 'dark') {
            return (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>);
        }
        return (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>);
    };
    const getThemeLabel = () => {
        switch (mode) {
            case 'light':
                return 'Switch to dark mode';
            case 'dark':
                return 'Switch to system mode';
            case 'system':
                return `Switch to light mode (currently ${actualTheme})`;
            default:
                return 'Switch theme';
        }
    };
    const getThemeDisplayName = () => {
        switch (mode) {
            case 'light':
                return 'Light';
            case 'dark':
                return 'Dark';
            case 'system':
                return `System (${actualTheme})`;
            default:
                return mode;
        }
    };
    return (<div className="relative">
      <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className={`
          relative p-2 rounded-xl border transition-all duration-300 group
          ${actualTheme === 'dark'
            ? 'glass border-white/10 text-white hover:bg-white/10'
            : 'bg-white/80 border-gray-200 text-gray-800 hover:bg-white shadow-sm'}
        `} title={getThemeLabel()}>
        {/* Icon container */}
        <div className="relative w-6 h-6">
          <framer_motion_1.AnimatePresence mode="wait">
            <framer_motion_1.motion.div key={`${mode}-${actualTheme}`} initial={{ scale: 0, rotate: 90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, rotate: -90, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="absolute inset-0 flex items-center justify-center">
              {getThemeIcon()}
            </framer_motion_1.motion.div>
          </framer_motion_1.AnimatePresence>
        </div>

        {/* System theme indicator */}
        {isSystemTheme && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-current" title="System theme active"/>)}
      </framer_motion_1.motion.button>

      {/* Tooltip */}
      <div className={`
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
        px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50
        ${actualTheme === 'dark'
            ? 'bg-white text-gray-900'
            : 'bg-gray-900 text-white'}
      `}>
        {getThemeDisplayName()}
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45
          ${actualTheme === 'dark' ? 'bg-white' : 'bg-gray-900'}
        `}/>
      </div>
    </div>);
}
//# sourceMappingURL=ThemeToggle.js.map