import React from 'react';
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
    autoHideAfter?: number;
    enableWebSocket?: boolean;
}
export declare function NotificationSystem({ maxNotifications, autoHideAfter, enableWebSocket, }: NotificationSystemProps): React.JSX.Element;
export declare function useNotifications(): {
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
};
export {};
//# sourceMappingURL=NotificationSystem.d.ts.map