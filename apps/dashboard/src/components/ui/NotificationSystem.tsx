import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wsService } from '@/services/api';
import { Button, Badge } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  data?: any;
}

interface NotificationSystemProps {
  maxNotifications?: number;
  autoHideAfter?: number; // seconds
  enableWebSocket?: boolean;
}

export function NotificationSystem({
  maxNotifications = 50,
  autoHideAfter = 5,
  enableWebSocket = true,
}: NotificationSystemProps) {
  const { actualTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Auto-hide after specified time
    if (autoHideAfter > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, autoHideAfter * 1000);
    }
  }, [maxNotifications, autoHideAfter]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'transaction_update':
        addNotification({
          type: 'info',
          title: 'Transaction Update',
          message: `Transaction ${data.transactionId} has been ${data.status}`,
          data: data,
        });
        break;

      case 'inventory_alert':
        addNotification({
          type: data.level === 'critical' ? 'error' : 'warning',
          title: 'Inventory Alert',
          message: `${data.stationName}: ${data.fuelType} level at ${data.percentage}%`,
          actionable: true,
          action: {
            label: 'View Details',
            handler: () => {
              // Navigate to inventory page
              window.location.href = `/inventory/${data.stationId}`;
            },
          },
          data: data,
        });
        break;

      case 'uppf_claim_update':
        addNotification({
          type: data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'info',
          title: 'UPPF Claim Update',
          message: `Claim ${data.claimNumber} has been ${data.status}`,
          data: data,
        });
        break;

      case 'price_window_update':
        addNotification({
          type: 'info',
          title: 'Price Update',
          message: `New pricing window activated for ${data.products.join(', ')}`,
          data: data,
        });
        break;

      case 'system_maintenance':
        addNotification({
          type: 'warning',
          title: 'System Maintenance',
          message: `Scheduled maintenance: ${data.message}`,
          data: data,
        });
        break;

      case 'compliance_alert':
        addNotification({
          type: 'warning',
          title: 'Compliance Alert',
          message: data.message,
          actionable: true,
          action: {
            label: 'Review',
            handler: () => {
              window.location.href = `/compliance/${data.type}`;
            },
          },
          data: data,
        });
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  }, [addNotification]);

  // Set up WebSocket connection
  useEffect(() => {
    if (enableWebSocket) {
      wsService.connect();
      // Add message handler
      const originalHandler = wsService['handleMessage'];
      wsService['handleMessage'] = (data: any) => {
        originalHandler.call(wsService, data);
        handleWebSocketMessage(data);
      };

      return () => {
        wsService.disconnect();
      };
    }
  }, [enableWebSocket, handleWebSocketMessage]);

  // Generate mock notifications for demo
  useEffect(() => {
    // Add some initial mock notifications
    const mockNotifications = [
      {
        type: 'success' as const,
        title: 'Price Window Activated',
        message: 'New pricing effective from 6:00 AM today',
      },
      {
        type: 'warning' as const,
        title: 'Low Inventory Alert',
        message: 'Tema Station: PMS level at 15%',
        actionable: true,
        action: {
          label: 'View Inventory',
          handler: () => console.log('Navigate to inventory'),
        },
      },
      {
        type: 'info' as const,
        title: 'UPPF Claim Submitted',
        message: 'Claim UPF-2024-0156 submitted for review',
      },
    ];

    mockNotifications.forEach(notif => {
      setTimeout(() => addNotification(notif), Math.random() * 2000);
    });
  }, [addNotification]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Clear notification
  const clearNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-green-500/30';
      case 'warning': return 'border-yellow-500/30';
      case 'error': return 'border-red-500/30';
      case 'info': 
      default: return 'border-blue-500/30';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          actualTheme === 'dark' 
            ? 'hover:bg-white/10 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h3V9a7 7 0 10-14 0v8" />
        </svg>
        
        {unreadCount > 0 && (
          <Badge 
            variant="danger"
            className="absolute -top-1 -right-1 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-full mt-2 w-96 rounded-xl shadow-2xl border z-50 ${
              actualTheme === 'dark' 
                ? 'bg-dark-800 border-white/10' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-dark-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h3V9a7 7 0 10-14 0v8" />
                  </svg>
                  <p className="text-dark-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 relative border-l-4 ${getBorderColor(notification.type)} ${
                        !notification.read 
                          ? actualTheme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                          : ''
                      } hover:${actualTheme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} transition-colors cursor-pointer`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="text-dark-400 hover:text-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-sm text-dark-400 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-dark-500">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            
                            {notification.actionable && notification.action && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!.handler();
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Hook to use notification system
export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // This would be connected to a global notification context in a real app
    console.log('Adding notification:', notification);
  };

  return { addNotification };
}