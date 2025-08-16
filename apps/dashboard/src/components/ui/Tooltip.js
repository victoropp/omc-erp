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
exports.Tooltip = Tooltip;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const ThemeContext_1 = require("@/contexts/ThemeContext");
function Tooltip({ content, children, position = 'right', delay = 500, disabled = false }) {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [tooltipPosition, setTooltipPosition] = (0, react_1.useState)({ x: 0, y: 0 });
    const timeoutRef = (0, react_1.useRef)();
    const triggerRef = (0, react_1.useRef)(null);
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const showTooltip = () => {
        if (disabled)
            return;
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                let x = 0, y = 0;
                switch (position) {
                    case 'top':
                        x = rect.left + rect.width / 2;
                        y = rect.top - 10;
                        break;
                    case 'bottom':
                        x = rect.left + rect.width / 2;
                        y = rect.bottom + 10;
                        break;
                    case 'left':
                        x = rect.left - 10;
                        y = rect.top + rect.height / 2;
                        break;
                    case 'right':
                        x = rect.right + 10;
                        y = rect.top + rect.height / 2;
                        break;
                }
                setTooltipPosition({ x, y });
                setIsVisible(true);
            }
        }, delay);
    };
    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };
    (0, react_1.useEffect)(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    const getTransformOrigin = () => {
        switch (position) {
            case 'top': return 'bottom center';
            case 'bottom': return 'top center';
            case 'left': return 'right center';
            case 'right': return 'left center';
            default: return 'left center';
        }
    };
    const getPositionClasses = () => {
        switch (position) {
            case 'top': return '-translate-x-1/2 -translate-y-full';
            case 'bottom': return '-translate-x-1/2';
            case 'left': return '-translate-x-full -translate-y-1/2';
            case 'right': return '-translate-y-1/2';
            default: return '-translate-y-1/2';
        }
    };
    const getArrowClasses = () => {
        const baseClasses = 'absolute w-2 h-2 transform rotate-45';
        const bgColor = actualTheme === 'dark' ? 'bg-dark-700' : 'bg-gray-800';
        switch (position) {
            case 'top': return `${baseClasses} ${bgColor} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
            case 'bottom': return `${baseClasses} ${bgColor} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
            case 'left': return `${baseClasses} ${bgColor} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`;
            case 'right': return `${baseClasses} ${bgColor} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
            default: return `${baseClasses} ${bgColor} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
        }
    };
    return (<>
      <div ref={triggerRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip} className="inline-block">
        {children}
      </div>

      <framer_motion_1.AnimatePresence>
        {isVisible && !disabled && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="fixed z-50 pointer-events-none" style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transformOrigin: getTransformOrigin(),
            }}>
            <div className={`relative ${getPositionClasses()}`}>
              <div className={`px-3 py-2 text-sm font-medium text-white rounded-lg shadow-lg border max-w-xs ${actualTheme === 'dark'
                ? 'bg-dark-700 border-white/10'
                : 'bg-gray-800 border-gray-600'}`}>
                {content}
              </div>
              <div className={getArrowClasses()}/>
            </div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </>);
}
//# sourceMappingURL=Tooltip.js.map