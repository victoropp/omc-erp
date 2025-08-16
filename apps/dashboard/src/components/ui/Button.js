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
exports.Button = void 0;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const clsx_1 = require("clsx");
const Button = (0, react_1.forwardRef)(({ className, variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', fullWidth = false, animate = true, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-gradient-primary text-white shadow-glow-primary hover:opacity-90 focus:ring-primary-500/50',
        secondary: 'bg-gradient-secondary text-white shadow-glow-secondary hover:opacity-90 focus:ring-secondary-500/50',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500/50',
        ghost: 'text-dark-400 hover:text-white hover:bg-white/10 focus:ring-white/20',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 shadow-glow-danger',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 shadow-glow-success',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500/50 shadow-glow-warning',
    };
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };
    const widthClasses = fullWidth ? 'w-full' : '';
    const buttonClasses = (0, clsx_1.clsx)(baseClasses, variantClasses[variant], sizeClasses[size], widthClasses, className);
    const LoadingSpinner = () => (<framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4">
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </framer_motion_1.motion.div>);
    const content = (<>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (<span className="mr-2">{icon}</span>)}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && (<span className="ml-2">{icon}</span>)}
    </>);
    if (animate) {
        return (<framer_motion_1.motion.button ref={ref} whileHover={{ scale: disabled || loading ? 1 : 1.02 }} whileTap={{ scale: disabled || loading ? 1 : 0.98 }} className={buttonClasses} disabled={disabled || loading} {...props}>
        {content}
      </framer_motion_1.motion.button>);
    }
    return (<button ref={ref} className={buttonClasses} disabled={disabled || loading} {...props}>
      {content}
    </button>);
});
exports.Button = Button;
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map