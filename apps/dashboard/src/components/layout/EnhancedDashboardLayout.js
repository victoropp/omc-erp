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
exports.EnhancedDashboardLayout = EnhancedDashboardLayout;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const FuturisticSidebar_1 = require("./FuturisticSidebar");
const BreadcrumbNavigation_1 = require("@/components/ui/BreadcrumbNavigation");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function EnhancedDashboardLayout({ children, pageTitle, showBreadcrumbs = true }) {
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    return (<div className={`min-h-screen transition-colors duration-300 ${actualTheme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <FuturisticSidebar_1.FuturisticSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

      {/* Main Content Area */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 transition-colors duration-300 ${actualTheme === 'dark'
            ? 'bg-dark-800/80 border-white/10'
            : 'bg-white/80 border-gray-200'} backdrop-blur-lg border-b`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            {/* Page Title */}
            {pageTitle && (<framer_motion_1.motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`text-2xl font-bold transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {pageTitle}
              </framer_motion_1.motion.h1>)}

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-2 rounded-lg transition-colors duration-300 ${actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`} title="Notifications">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V12h5v5z"/>
                </svg>
              </framer_motion_1.motion.button>

              <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-2 rounded-lg transition-colors duration-300 ${actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`} title="Quick Actions">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </framer_motion_1.motion.button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {showBreadcrumbs && <BreadcrumbNavigation_1.BreadcrumbNavigation />}
        </header>

        {/* Main Content */}
        <main className="p-6">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </framer_motion_1.motion.div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}
    </div>);
}
//# sourceMappingURL=EnhancedDashboardLayout.js.map