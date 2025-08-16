"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const react_1 = __importDefault(require("react"));
const Badge = ({ children, variant = 'default', className = '', ...props }) => {
    const variants = {
        default: 'bg-gray-500 text-white',
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-600 text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-black',
        danger: 'bg-red-500 text-white',
        outline: 'border border-gray-300 text-gray-700 bg-transparent',
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>);
};
exports.Badge = Badge;
//# sourceMappingURL=Badge.js.map