"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardFooter = exports.CardContent = exports.CardHeader = exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const clsx_1 = require("clsx");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const Card = react_1.default.forwardRef(({ className, variant = 'glass', padding = 'md', animate = true, hover = false, interactive = false, children, ...props }, ref) => {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const baseClasses = 'rounded-3xl transition-all duration-300';
    const variantClasses = {
        default: actualTheme === 'dark'
            ? 'bg-dark-800 border border-dark-700'
            : 'bg-white border border-gray-200 shadow-sm',
        glass: actualTheme === 'dark'
            ? 'glass border border-white/10'
            : 'glass border border-gray-200 bg-white/80 backdrop-blur-sm',
        elevated: actualTheme === 'dark'
            ? 'bg-dark-800 shadow-xl shadow-black/20 border border-dark-700'
            : 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100',
        outlined: actualTheme === 'dark'
            ? 'border-2 border-primary-500/30 bg-dark-800/50'
            : 'border-2 border-primary-500/30 bg-white/50',
    };
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
    };
    const hoverClasses = hover
        ? actualTheme === 'dark'
            ? 'hover:bg-white/5 hover:border-white/20 hover:shadow-glow-primary/20'
            : 'hover:shadow-lg hover:shadow-gray-300/30'
        : '';
    const interactiveClasses = interactive
        ? 'cursor-pointer transform hover:scale-[1.02]'
        : '';
    const cardClasses = (0, clsx_1.clsx)(baseClasses, variantClasses[variant], paddingClasses[padding], hoverClasses, interactiveClasses, className);
    if (animate) {
        return (<framer_motion_1.motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className={cardClasses} {...props}>
        {children}
      </framer_motion_1.motion.div>);
    }
    return (<div ref={ref} className={cardClasses} {...props}>
      {children}
    </div>);
});
exports.Card = Card;
Card.displayName = 'Card';
const CardHeader = react_1.default.forwardRef(({ className, title, subtitle, action, children, ...props }, ref) => {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    return (<div ref={ref} className={(0, clsx_1.clsx)('flex items-center justify-between pb-4 mb-6 border-b', actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200', className)} {...props}>
      <div>
        {title && (<h3 className={(0, clsx_1.clsx)('text-xl font-semibold', actualTheme === 'dark' ? 'text-white' : 'text-gray-800')}>
            {title}
          </h3>)}
        {subtitle && (<p className={(0, clsx_1.clsx)('text-sm mt-1', actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600')}>
            {subtitle}
          </p>)}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>);
});
exports.CardHeader = CardHeader;
CardHeader.displayName = 'CardHeader';
const CardContent = react_1.default.forwardRef(({ className, children, ...props }, ref) => {
    return (<div ref={ref} className={(0, clsx_1.clsx)('space-y-4', className)} {...props}>
      {children}
    </div>);
});
exports.CardContent = CardContent;
CardContent.displayName = 'CardContent';
const CardFooter = react_1.default.forwardRef(({ className, children, ...props }, ref) => {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    return (<div ref={ref} className={(0, clsx_1.clsx)('pt-4 mt-6 border-t', actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200', className)} {...props}>
      {children}
    </div>);
});
exports.CardFooter = CardFooter;
CardFooter.displayName = 'CardFooter';
//# sourceMappingURL=Card.js.map