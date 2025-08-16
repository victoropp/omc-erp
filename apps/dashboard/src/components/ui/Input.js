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
exports.Input = void 0;
const react_1 = __importStar(require("react"));
const clsx_1 = require("clsx");
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const Input = (0, react_1.forwardRef)(({ className, label, error, hint, leftIcon, rightIcon, variant = 'default', inputSize = 'md', fullWidth = true, type = 'text', ...props }, ref) => {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const baseClasses = 'block transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        default: (0, clsx_1.clsx)('border-2 rounded-xl', actualTheme === 'dark'
            ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500 focus:bg-dark-700'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:bg-gray-50'),
        filled: (0, clsx_1.clsx)('border-0 rounded-xl', actualTheme === 'dark'
            ? 'bg-dark-700 text-white placeholder-dark-400 focus:bg-dark-600'
            : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'),
        outlined: (0, clsx_1.clsx)('border-2 rounded-xl bg-transparent', actualTheme === 'dark'
            ? 'border-white/20 text-white placeholder-dark-400 focus:border-primary-500'
            : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500'),
    };
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
    };
    const widthClasses = fullWidth ? 'w-full' : '';
    const inputClasses = (0, clsx_1.clsx)(baseClasses, variantClasses[variant], sizeClasses[inputSize], widthClasses, leftIcon && 'pl-10', (rightIcon || type === 'password') && 'pr-10', error && 'border-red-500 focus:border-red-500', className);
    const containerClasses = (0, clsx_1.clsx)('relative', fullWidth ? 'w-full' : 'inline-block');
    const iconClasses = (0, clsx_1.clsx)('absolute top-1/2 transform -translate-y-1/2 w-5 h-5', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400');
    const labelClasses = (0, clsx_1.clsx)('block text-sm font-medium mb-2', actualTheme === 'dark' ? 'text-white' : 'text-gray-700', error && 'text-red-500');
    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
    };
    const PasswordToggleIcon = () => (<button type="button" onClick={handlePasswordToggle} className={(0, clsx_1.clsx)('absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors duration-200', actualTheme === 'dark'
            ? 'text-dark-400 hover:text-white'
            : 'text-gray-400 hover:text-gray-600')}>
      {showPassword ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>) : (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
        </svg>)}
    </button>);
    return (<div className={containerClasses}>
      {label && (<framer_motion_1.motion.label initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={labelClasses} htmlFor={props.id || props.name}>
          {label}
        </framer_motion_1.motion.label>)}
      
      <div className="relative">
        {leftIcon && (<div className={(0, clsx_1.clsx)(iconClasses, 'left-3')}>
            {leftIcon}
          </div>)}
        
        <framer_motion_1.motion.input ref={ref} type={type === 'password' ? (showPassword ? 'text' : 'password') : type} className={inputClasses} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} {...props}/>
        
        {rightIcon && type !== 'password' && (<div className={(0, clsx_1.clsx)(iconClasses, 'right-3')}>
            {rightIcon}
          </div>)}
        
        {type === 'password' && <PasswordToggleIcon />}
        
        {/* Focus ring animation */}
        <framer_motion_1.AnimatePresence>
          {isFocused && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none" style={{
                boxShadow: actualTheme === 'dark'
                    ? '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    : '0 0 0 4px rgba(59, 130, 246, 0.1)'
            }}/>)}
        </framer_motion_1.AnimatePresence>
      </div>
      
      {/* Error message */}
      <framer_motion_1.AnimatePresence>
        {error && (<framer_motion_1.motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 text-sm text-red-500">
            {error}
          </framer_motion_1.motion.p>)}
      </framer_motion_1.AnimatePresence>
      
      {/* Hint message */}
      {hint && !error && (<p className={(0, clsx_1.clsx)('mt-2 text-sm', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500')}>
          {hint}
        </p>)}
    </div>);
});
exports.Input = Input;
Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map