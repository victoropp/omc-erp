import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export const useWebSocket = (
  url: string,
  options: WebSocketOptions = {}
) => {
  const {
    reconnectAttempts = 5,
    reconnectInterval = 5000,
    heartbeatInterval = 30000
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
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
        (ws as any).heartbeatInterval = heartbeat;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear heartbeat interval
        if ((ws as any).heartbeatInterval) {
          clearInterval((ws as any).heartbeatInterval);
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
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [url, connectionAttempts, reconnectAttempts, reconnectInterval, heartbeatInterval]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'delivery_status_update':
        toast.success(`Delivery ${message.data.deliveryNumber} status updated to ${message.data.status}`);
        break;
      case 'delivery_approved':
        toast.success(`Delivery ${message.data.deliveryNumber} has been approved`);
        break;
      case 'delivery_rejected':
        toast.error(`Delivery ${message.data.deliveryNumber} has been rejected: ${message.data.reason}`);
        break;
      case 'compliance_alert':
        toast.error(`Compliance Alert: ${message.data.message}`);
        break;
      case 'invoice_generated':
        toast.success(`Invoice generated for delivery ${message.data.deliveryNumber}`);
        break;
      case 'system_maintenance':
        toast.info(`System maintenance: ${message.data.message}`);
        break;
      case 'pong':
        // Heartbeat response, no action needed
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Manual disconnect');
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  useEffect(() => {
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

// Hook specifically for Daily Deliveries real-time updates
export const useDailyDeliveryWebSocket = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';
  const {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect
  } = useWebSocket(`${wsUrl}/daily-deliveries`);

  const subscribeToDelivery = useCallback((deliveryId: string) => {
    return sendMessage({
      type: 'subscribe',
      data: { deliveryId },
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  const unsubscribeFromDelivery = useCallback((deliveryId: string) => {
    return sendMessage({
      type: 'unsubscribe',
      data: { deliveryId },
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  const subscribeToAllDeliveries = useCallback(() => {
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