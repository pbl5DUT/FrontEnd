import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string;
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = ({
  url,
  onOpen,
  onMessage,
  onClose,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  const connect = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log(`Connecting to WebSocket at ${url}`);
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        if (onOpen) onOpen();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          setLastMessage(data);
          
          // Handle WebRTC signals
          if (data.type === 'webrtc_signal') {
            const customEvent = new CustomEvent('webrtc_signal', { 
              detail: {
                type: data.signal_type,
                sdp: data.sdp,
                candidate: data.candidate,
                userId: data.userId,
                isAudioOnly: data.isAudioOnly
              } 
            });
            window.dispatchEvent(customEvent);
          }
          
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        
        // Attempt reconnection if enabled
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
        
        if (onClose) onClose();
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      websocketRef.current = socket;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  // Send a message through the WebSocket
  const sendMessage = (data: any) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      websocketRef.current.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  };

  // Manually disconnect WebSocket
  const disconnect = () => {
    if (!websocketRef.current) return;
    
    console.log('Manually closing WebSocket connection');
    websocketRef.current.close();
    
    // Clear any reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Connect on component mount and disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]); // Reconnect if URL changes

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    connect
  };
};