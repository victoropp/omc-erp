"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardLayout = DashboardLayout;
const react_1 = __importDefault(require("react"));
const FuturisticSidebar_1 = require("./FuturisticSidebar");
const FuturisticHeader_1 = require("./FuturisticHeader");
const auth_store_1 = require("@/stores/auth.store");
const react_hot_toast_1 = require("react-hot-toast");
function DashboardLayout({ children }) {
    const { user } = (0, auth_store_1.useAuthStore)();
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ghana OMC ERP</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <react_hot_toast_1.Toaster position="top-right" toastOptions={{
            duration: 4000,
            className: 'text-sm',
        }}/>
      
      {/* Sidebar */}
      <FuturisticSidebar_1.FuturisticSidebar isOpen={true} onClose={() => { }}/>
      
      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Header */}
        <FuturisticHeader_1.FuturisticHeader onMenuClick={() => { }}/>
        
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>);
}
exports.default = DashboardLayout;
//# sourceMappingURL=DashboardLayout.js.map