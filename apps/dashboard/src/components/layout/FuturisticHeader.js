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
exports.FuturisticHeader = FuturisticHeader;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const auth_store_1 = require("@/stores/auth.store");
const SearchCommand_1 = require("../ui/SearchCommand");
const NotificationCenter_1 = require("../ui/NotificationCenter");
const ThemeToggle_1 = require("../ui/ThemeToggle");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function FuturisticHeader({ onMenuClick }) {
    const { user } = (0, auth_store_1.useAuthStore)();
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [currentTime, setCurrentTime] = (0, react_1.useState)(new Date());
    const [systemStatus, setSystemStatus] = (0, react_1.useState)('online');
    // Update time every second
    (0, react_1.useEffect)(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    // Mock system status updates
    (0, react_1.useEffect)(() => {
        const statusTimer = setInterval(() => {
            setSystemStatus(Math.random() > 0.1 ? 'online' : 'warning');
        }, 30000);
        return () => clearInterval(statusTimer);
    }, []);
    return (<framer_motion_1.motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`sticky top-0 z-40 glass backdrop-blur-xl border-b transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Mobile menu + Breadcrumb */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onMenuClick} className={`lg:hidden p-2 rounded-xl glass border transition-all duration-300 ${actualTheme === 'dark'
            ? 'border-white/10 text-white hover:bg-white/10'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </framer_motion_1.motion.button>

            {/* Real-time system status */}
            <framer_motion_1.motion.div animate={{ scale: systemStatus === 'warning' ? [1, 1.1, 1] : 1 }} transition={{ duration: 1, repeat: systemStatus === 'warning' ? Infinity : 0 }} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-400' :
            systemStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}/>
              <span className={`text-sm hidden md:inline transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                System {systemStatus}
              </span>
            </framer_motion_1.motion.div>

            {/* Current pricing window indicator */}
            <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`hidden lg:flex items-center space-x-2 glass rounded-lg px-3 py-1 border transition-colors duration-300 ${actualTheme === 'dark' ? 'border-secondary-500/30' : 'border-blue-300'}`}>
              <div className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse"/>
              <span className="text-sm text-secondary-400 font-medium">2025W03 Active</span>
            </framer_motion_1.motion.div>
          </div>

          {/* Center section - Search and quick actions */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <SearchCommand_1.SearchCommand />
          </div>

          {/* Right section - Time, notifications, profile */}
          <div className="flex items-center space-x-4">
            {/* Ghana time display */}
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:flex flex-col items-end">
              <div className={`text-sm font-mono transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {currentTime.toLocaleTimeString('en-GB', {
            timeZone: 'Africa/Accra',
            hour12: false
        })}
              </div>
              <div className={`text-xs transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'}`}>
                {currentTime.toLocaleDateString('en-GB', {
            timeZone: 'Africa/Accra',
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })} • GMT
              </div>
            </framer_motion_1.motion.div>

            {/* Quick actions */}
            <div className="flex items-center space-x-2">
              {/* Emergency alert button */}
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-xl glass border border-red-500/30 text-red-400 
                         hover:bg-red-500/20 hover:text-red-300 transition-all duration-300" title="Emergency Protocols">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </framer_motion_1.motion.button>

              {/* Quick fuel status */}
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-xl glass border border-secondary-500/30 text-secondary-400 
                         hover:bg-secondary-500/20 hover:text-secondary-300 transition-all duration-300" title="Fuel Levels Overview">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </framer_motion_1.motion.button>

              {/* Theme toggle */}
              <ThemeToggle_1.ThemeToggle />
            </div>

            {/* Notification center */}
            <NotificationCenter_1.NotificationCenter />

            {/* User profile dropdown */}
            <UserProfileDropdown />
          </div>
        </div>

        {/* Mobile search bar */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:hidden mt-4">
          <SearchCommand_1.SearchCommand />
        </framer_motion_1.motion.div>
      </div>
    </framer_motion_1.motion.header>);
}
// User profile dropdown component
function UserProfileDropdown() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const { user, logout } = (0, auth_store_1.useAuthStore)();
    return (<div className="relative">
      <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 p-2 rounded-xl glass border border-white/10 
                 hover:bg-white/10 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-dark-400">
            {user?.role?.replace('_', ' ').toLowerCase()}
          </div>
        </div>
        <framer_motion_1.motion.svg animate={{ rotate: isOpen ? 180 : 0 }} className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </framer_motion_1.motion.svg>
      </framer_motion_1.motion.button>

      <framer_motion_1.AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}/>
            
            {/* Dropdown menu */}
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 mt-2 w-64 glass rounded-2xl border border-white/10 shadow-xl z-20">
              <div className="p-4">
                {/* User info header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-dark-400">{user?.email}</div>
                    <div className="text-xs text-secondary-400">
                      {user?.role?.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-4 space-y-2">
                  <ProfileMenuItem icon="👤" label="My Profile" onClick={() => setIsOpen(false)}/>
                  <ProfileMenuItem icon="⚙️" label="Account Settings" onClick={() => setIsOpen(false)}/>
                  <ProfileMenuItem icon="🔔" label="Notification Preferences" onClick={() => setIsOpen(false)}/>
                  <ProfileMenuItem icon="🛡️" label="Security & Privacy" onClick={() => setIsOpen(false)}/>
                  <ProfileMenuItem icon="❓" label="Help & Support" onClick={() => setIsOpen(false)}/>
                </div>

                {/* Logout button */}
                <div className="pt-4 border-t border-white/10">
                  <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl 
                             bg-red-500/20 border border-red-500/30 text-red-400 
                             hover:bg-red-500/30 hover:text-red-300 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span className="font-medium">Logout</span>
                  </framer_motion_1.motion.button>
                </div>
              </div>
            </framer_motion_1.motion.div>
          </>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
function ProfileMenuItem({ icon, label, onClick }) {
    return (<framer_motion_1.motion.button whileHover={{ x: 4 }} onClick={onClick} className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl 
               text-dark-400 hover:text-white hover:bg-white/10 transition-all duration-300">
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </framer_motion_1.motion.button>);
}
//# sourceMappingURL=FuturisticHeader.js.map