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
exports.default = LoginPage;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const router_1 = require("next/router");
const auth_store_1 = require("@/stores/auth.store");
const FuturisticBackground_1 = require("@/components/layout/FuturisticBackground");
const react_hot_toast_1 = require("react-hot-toast");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function LoginPage() {
    const router = (0, router_1.useRouter)();
    const { login, isLoading } = (0, auth_store_1.useAuthStore)();
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [formData, setFormData] = (0, react_1.useState)({
        email: 'admin@ghanaomc.com',
        password: 'password',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            react_hot_toast_1.toast.success('Welcome to Ghana OMC ERP!');
            router.push('/dashboard');
        }
        catch (error) {
            react_hot_toast_1.toast.error(error.message || 'Login failed');
        }
    };
    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Futuristic background */}
      <FuturisticBackground_1.FuturisticBackground />
      
      {/* Login form */}
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="relative z-10 w-full max-w-md">
        {/* Glassmorphism container */}
        <div className={`glass rounded-3xl p-8 shadow-2xl border transition-colors duration-300 ${actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </framer_motion_1.motion.div>
            
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              Ghana OMC ERP
            </h1>
            <p className={`transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'}`}>
              Oil Marketing Company Management System
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${actualTheme === 'dark'
            ? 'glass border-white/10 bg-transparent text-white placeholder-dark-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} placeholder="Enter your email"/>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                Password
              </label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${actualTheme === 'dark'
            ? 'glass border-white/10 bg-transparent text-white placeholder-dark-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} placeholder="Enter your password"/>
            </div>

            <framer_motion_1.motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {isLoading ? (<>
                  <div className="spinner"/>
                  <span>Signing in...</span>
                </>) : (<span>Sign In</span>)}
            </framer_motion_1.motion.button>
          </form>

          {/* Demo credentials */}
          <div className={`mt-6 p-4 glass rounded-xl border transition-colors duration-300 ${actualTheme === 'dark' ? 'border-secondary-500/30' : 'border-blue-300'}`}>
            <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-secondary-400' : 'text-blue-600'}`}>Demo Credentials</h3>
            <div className={`text-xs space-y-1 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'}`}>
              <div>Email: admin@ghanaomc.com</div>
              <div>Password: password</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className={`text-xs transition-colors duration-300 ${actualTheme === 'dark' ? 'text-dark-500' : 'text-gray-500'}`}>
              © 2025 Ghana OMC ERP. All rights reserved.
            </p>
          </div>
        </div>
      </framer_motion_1.motion.div>
    </div>);
}
//# sourceMappingURL=login.js.map