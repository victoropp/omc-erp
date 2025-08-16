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
exports.NotificationCenter = NotificationCenter;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
function NotificationCenter() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    // Mock notifications data
    (0, react_1.useEffect)(() => {
        const mockNotifications = [
            {
                id: '1',
                title: 'UPPF Claim Submitted',
                message: 'UPPF claim for Accra-Tema route has been submitted for review.',
                type: 'success',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                read: false,
            },
            {
                id: '2',
                title: 'Price Window Update',
                message: 'New pricing window 2025W03 is now active. Review updated fuel prices.',
                type: 'info',
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                read: false,
                actionRequired: true,
            },
            {
                id: '3',
                title: 'Low Fuel Alert',
                message: 'Station ACC-001 AGO tank level is below 20%. Immediate refill required.',
                type: 'warning',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: true,
                actionRequired: true,
            },
            {
                id: '4',
                title: 'System Maintenance',
                message: 'Scheduled maintenance window will begin at 02:00 GMT tomorrow.',
                type: 'info',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                read: true,
            },
            {
                id: '5',
                title: 'Emergency Protocol Activated',
                message: 'Emergency shutdown protocol activated at Station TMD-003. Immediate attention required.',
                type: 'urgent',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                read: false,
                actionRequired: true,
            },
        ];
        setNotifications(mockNotifications);
    }, []);
    const unreadCount = notifications.filter(n => !n.read).length;
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(notification => notification.id === id ? { ...notification, read: true } : notification));
    };
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return (<div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>);
            case 'warning':
                return (<div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>);
            case 'error':
                return (<div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>);
            case 'urgent':
                return (<div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>);
            default:
                return (<div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>);
        }
    };
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'just now';
        if (diffInMinutes < 60)
            return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };
    return (<div className="relative">
      {/* Notification button */}
      <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-xl glass border border-white/10 text-white 
                 hover:bg-white/10 transition-all duration-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6a2 2 0 012 2v9a2 2 0 01-2 2H9l-7-7 7-7z"/>
        </svg>

        {/* Notification badge */}
        {unreadCount > 0 && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.motion.button>

      {/* Notification dropdown */}
      <framer_motion_1.AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}/>

            {/* Dropdown panel */}
            <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 mt-2 w-96 glass rounded-2xl border border-white/10 shadow-xl z-20">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (<button onClick={markAllAsRead} className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors">
                      Mark all read
                    </button>)}
                </div>
                {unreadCount > 0 && (<p className="text-sm text-dark-400 mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>)}
              </div>

              {/* Notifications list */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (<div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6a2 2 0 012 2v9a2 2 0 01-2 2H9l-7-7 7-7z"/>
                      </svg>
                    </div>
                    <p className="text-dark-400">No notifications</p>
                  </div>) : (<div className="py-2">
                    {notifications.map((notification, index) => (<framer_motion_1.motion.div key={notification.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={() => markAsRead(notification.id)} className={`px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 ${!notification.read
                        ? 'bg-white/5 border-l-secondary-500'
                        : 'border-l-transparent hover:bg-white/5'}`}>
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-dark-300'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-dark-500 flex-shrink-0 ml-2">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${!notification.read ? 'text-dark-300' : 'text-dark-400'}`}>
                              {notification.message}
                            </p>
                            {notification.actionRequired && (<div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-500/20 text-secondary-400 border border-secondary-500/30">
                                  Action Required
                                </span>
                              </div>)}
                          </div>
                          {!notification.read && (<div className="w-2 h-2 bg-secondary-500 rounded-full flex-shrink-0 mt-2"/>)}
                        </div>
                      </framer_motion_1.motion.div>))}
                  </div>)}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (<div className="p-4 border-t border-white/10">
                  <button className="w-full text-center text-sm text-secondary-400 hover:text-secondary-300 transition-colors">
                    View all notifications
                  </button>
                </div>)}
            </framer_motion_1.motion.div>
          </>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
//# sourceMappingURL=NotificationCenter.js.map