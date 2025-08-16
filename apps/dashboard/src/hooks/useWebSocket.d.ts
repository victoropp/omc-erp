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
export declare const useWebSocket: (url: string, options?: WebSocketOptions) => {
    socket: any;
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    sendMessage: (message: any) => boolean;
    disconnect: () => void;
    reconnect: () => void;
};
export declare const useDailyDeliveryWebSocket: () => {
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    subscribeToDelivery: (deliveryId: string) => boolean;
    unsubscribeFromDelivery: (deliveryId: string) => boolean;
    subscribeToAllDeliveries: () => boolean;
    disconnect: () => void;
    reconnect: () => void;
};
export {};
//# sourceMappingURL=useWebSocket.d.ts.map