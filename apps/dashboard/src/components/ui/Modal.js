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
exports.Modal = Modal;
exports.ConfirmationModal = ConfirmationModal;
exports.FormModal = FormModal;
const react_1 = __importStar(require("react"));
const react_2 = require("@headlessui/react");
const clsx_1 = require("clsx");
const ThemeContext_1 = require("@/contexts/ThemeContext");
const Button_1 = require("./Button");
function Modal({ isOpen, onClose, title, size = 'md', children }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    // Close modal on escape key
    (0, react_1.useEffect)(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
    };
    return (<react_2.Transition appear show={isOpen} as={react_1.Fragment}>
      <react_2.Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <react_2.Transition.Child as={react_1.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"/>
        </react_2.Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <react_2.Transition.Child as={react_1.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <react_2.Dialog.Panel className={(0, clsx_1.clsx)('w-full transform overflow-hidden rounded-3xl p-8 text-left align-middle shadow-xl transition-all', sizeClasses[size], actualTheme === 'dark'
            ? 'bg-dark-800 border border-white/10'
            : 'bg-white border border-gray-200')}>
                {/* Header */}
                <div className={(0, clsx_1.clsx)('flex items-center justify-between pb-6 mb-6 border-b', actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
                  <react_2.Dialog.Title as="h3" className={(0, clsx_1.clsx)('text-2xl font-semibold', actualTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    {title}
                  </react_2.Dialog.Title>
                  
                  <Button_1.Button variant="ghost" size="sm" onClick={onClose} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>}/>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {children}
                </div>
              </react_2.Dialog.Panel>
            </react_2.Transition.Child>
          </div>
        </div>
      </react_2.Dialog>
    </react_2.Transition>);
}
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'info', loading = false }) {
    const { actualTheme } = (0, ThemeContext_1.useTheme)();
    const variantConfig = {
        danger: {
            icon: (<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>),
            buttonVariant: 'danger',
        },
        warning: {
            icon: (<svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>),
            buttonVariant: 'warning',
        },
        info: {
            icon: (<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>),
            buttonVariant: 'primary',
        },
    };
    const config = variantConfig[variant];
    return (<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className={(0, clsx_1.clsx)('text-base', actualTheme === 'dark' ? 'text-white' : 'text-gray-900')}>
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button_1.Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button_1.Button>
        <Button_1.Button variant={config.buttonVariant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button_1.Button>
      </div>
    </Modal>);
}
function FormModal({ isOpen, onClose, onSubmit, title, size = 'md', children, submitText = 'Submit', cancelText = 'Cancel', loading = false, disabled = false }) {
    return (<Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {children}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button_1.Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button_1.Button>
          <Button_1.Button type="submit" variant="primary" loading={loading} disabled={disabled}>
            {submitText}
          </Button_1.Button>
        </div>
      </form>
    </Modal>);
}
//# sourceMappingURL=Modal.js.map