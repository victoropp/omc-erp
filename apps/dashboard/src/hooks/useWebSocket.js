"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDailyDeliveryWebSocket = exports.useWebSocket = void 0;
const react_1 = require("react");
const react_hot_toast_1 = require("react-hot-toast");
const useWebSocket = (url, options = {}) => {
    const { reconnectAttempts = 5, reconnectInterval = 5000, heartbeatInterval = 30000 } = options;
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [connectionAttempts, setConnectionAttempts] = (0, react_1.useState)(0);
    const [lastMessage, setLastMessage] = (0, react_1.useState)(null);
    const connect = (0, react_1.useCallback)(() => {
        try {
            const ws = new WebSocket(url);
            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionAttempts(0);
                // Send heartbeat periodically
                const heartbeat = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
                    }
                }, heartbeatInterval);
                // Store heartbeat interval ID on the socket
                ws.heartbeatInterval = heartbeat;
            };
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);
                    handleMessage(message);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                // Clear heartbeat interval
                if (ws.heartbeatInterval) {
                    clearInterval(ws.heartbeatInterval);
                }
                // Attempt to reconnect if not manually closed
                if (event.code !== 1000 && connectionAttempts < reconnectAttempts) {
                    setTimeout(() => {
                        setConnectionAttempts(prev => prev + 1);
                        connect();
                    }, reconnectInterval);
                }
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };
            setSocket(ws);
        }
        catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setIsConnected(false);
        }
    }, [url, connectionAttempts, reconnectAttempts, reconnectInterval, heartbeatInterval]);
    const handleMessage = (message) => {
        switch (message.type) {
            case 'delivery_status_update':
                react_hot_toast_1.toast.success(`Delivery ${message.data.deliveryNumber} status updated to ${message.data.status}`);
                break;
            case 'delivery_approved':
                react_hot_toast_1.toast.success(`Delivery ${message.data.deliveryNumber} has been approved`);
                break;
            case 'delivery_rejected':
                react_hot_toast_1.toast.error(`Delivery ${message.data.deliveryNumber} has been rejected: ${message.data.reason}`);
                break;
            case 'compliance_alert':
                react_hot_toast_1.toast.error(`Compliance Alert: ${message.data.message}`);
                break;
            case 'invoice_generated':
                react_hot_toast_1.toast.success(`Invoice generated for delivery ${message.data.deliveryNumber}`);
                break;
            case 'system_maintenance':
                react_hot_toast_1.toast.info(`System maintenance: ${message.data.message}`);
                break;
            case 'pong':
                // Heartbeat response, no action needed
                break;
            default:
                console.log('Unknown WebSocket message type:', message.type);
        }
    };
    const sendMessage = (0, react_1.useCallback)((message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            return true;
        }
        else {
            console.warn('WebSocket is not connected');
            return false;
        }
    }, [socket]);
    const disconnect = (0, react_1.useCallback)(() => {
        if (socket) {
            socket.close(1000, 'Manual disconnect');
            setSocket(null);
            setIsConnected(false);
        }
    }, [socket]);
    (0, react_1.useEffect)(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);
    return {
        socket,
        isConnected,
        lastMessage,
        sendMessage,
        disconnect,
        reconnect: connect
    };
};
exports.useWebSocket = useWebSocket;
// Hook specifically for Daily Deliveries real-time updates
const useDailyDeliveryWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';
    const { isConnected, lastMessage, sendMessage, disconnect, reconnect } = (0, exports.useWebSocket)(`${wsUrl}/daily-deliveries`);
    const subscribeToDelivery = (0, react_1.useCallback)((deliveryId) => {
        return sendMessage({
            type: 'subscribe',
            data: { deliveryId },
            timestamp: new Date().toISOString()
        });
    }, [sendMessage]);
    const unsubscribeFromDelivery = (0, react_1.useCallback)((deliveryId) => {
        return sendMessage({
            type: 'unsubscribe',
            data: { deliveryId },
            timestamp: new Date().toISOString()
        });
    }, [sendMessage]);
    const subscribeToAllDeliveries = (0, react_1.useCallback)(() => {
        return sendMessage({
            type: 'subscribe_all',
            timestamp: new Date().toISOString()
        });
    }, [sendMessage]);
    return {
        isConnected,
        lastMessage,
        subscribeToDelivery,
        unsubscribeFromDelivery,
        subscribeToAllDeliveries,
        disconnect,
        reconnect
    };
};
exports.useDailyDeliveryWebSocket = useDailyDeliveryWebSocket;
//# sourceMappingURL=useWebSocket.js.map