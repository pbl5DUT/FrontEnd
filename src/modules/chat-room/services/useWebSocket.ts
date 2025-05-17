import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatRoom, ConnectionState } from './types';
import { WS_URL, PING_INTERVAL } from './constants';

interface UseWebSocketOptions {
  userId: number;
  activeRoom: ChatRoom | null;
  onMessage: (data: any) => void;
  onError: (error: string) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
}

/**
 * Custom hook để quản lý kết nối WebSocket
 */
export const useWebSocket = ({
  userId,
  activeRoom,
  onMessage,
  onError,
  onConnectionStateChange
}: UseWebSocketOptions) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cập nhật trạng thái kết nối khi thay đổi
  useEffect(() => {
    if (onConnectionStateChange) {
      onConnectionStateChange(connectionState);
    }
  }, [connectionState, onConnectionStateChange]);

  // Hàm cleanup
  const cleanupSocket = useCallback(() => {
    // Xóa ping interval nếu có
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Đóng kết nối socket
    if (socketRef.current) {
      console.log('Đóng kết nối WebSocket');
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  // Hàm gửi tin nhắn qua WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  // Thiết lập kết nối WebSocket
  useEffect(() => {
    if (!userId || !activeRoom) {
      return cleanupSocket;
    }

    try {
      // Lấy ID phòng từ activeRoom
      let roomId: string | number = activeRoom.id;
      
      // Kiểm tra token
      const token = localStorage.getItem('access_token');
      if (!token) {
        onError('Không tìm thấy token xác thực cho kết nối WebSocket');
        return cleanupSocket;
      }
      
      // Xử lý ID phòng để định dạng chuẩn cho WebSocket
      let formattedRoomId: string | number;
      
      // Chuẩn hóa ID phòng - loại bỏ các tiền tố không cần thiết
      if (typeof roomId === 'string') {
        if (roomId.startsWith('chat-')) {
          formattedRoomId = roomId.split('-')[1];
        } else if (roomId.startsWith('chat_')) {
          formattedRoomId = roomId.substring(5); // Loại bỏ "chat_"
        } else {
          formattedRoomId = roomId;
        }
      } else {
        formattedRoomId = roomId;
      }

      console.log(`ID phòng gốc: ${activeRoom.id}, ID đã định dạng: ${formattedRoomId}`);
      
      // Xây dựng URL WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host || '127.0.0.1:8000';
      
      // Đảm bảo ID phòng không bị trùng lặp "chat_chat_"
      // Backend mong đợi định dạng room_name="chat_XXX" trong URL: /ws/chat/chat_XXX/
      let roomIdentifier = formattedRoomId.toString();
      if (roomIdentifier.startsWith('chat_')) {
        roomIdentifier = roomIdentifier.substring(5); // Loại bỏ "chat_" để tránh trùng lặp
      }
      
      // Cấu trúc URL đúng phải là /ws/chat/{room_name}/, 
      // phù hợp với URL pattern đã định nghĩa trong api/routing.py
      const wsUrl = `${protocol}${host}/ws/chat/chat_${roomIdentifier}/?token=${token}`;

      console.log(`Kết nối WebSocket đến: ${wsUrl}`);
      
      // Đóng kết nối cũ nếu có
      cleanupSocket();
      
      // Tạo kết nối WebSocket mới
      setConnectionState('connecting');
      const newSocket = new WebSocket(wsUrl);
      socketRef.current = newSocket;
      
      // Xử lý sự kiện kết nối mở
      newSocket.onopen = () => {
        console.log(`WebSocket kết nối thành công đến phòng:`, roomId);
        setSocket(newSocket);
        setConnectionState('connected');
        
        // Thiết lập ping/pong để giữ kết nối
        const pingInterval = setInterval(() => {
          if (newSocket && newSocket.readyState === WebSocket.OPEN) {
            // Gửi ping dưới dạng JSON để server nhận dạng được
            newSocket.send(JSON.stringify({ type: 'ping' }));
            console.log('Ping đã được gửi đến server');
          } else {
            clearInterval(pingInterval);
          }
        }, PING_INTERVAL);
        
        // Lưu trữ interval để xóa khi đóng kết nối
        pingIntervalRef.current = pingInterval;
      };
        // Xử lý sự kiện kết nối đóng
      newSocket.onclose = (event) => {
        console.log(`WebSocket bị ngắt kết nối: code=${event.code}, lý do=${event.reason || 'Không có lý do'}`);
        setSocket(null);
        setConnectionState('disconnected');
        
        // Xóa ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Xử lý lỗi 1006 (abnormal closure)
        if (event.code === 1006) {
          console.warn('Kết nối WebSocket bị đóng bất thường (lỗi 1006). Có thể do timeout, mất kết nối mạng, hoặc server reset.');
          // Ghi log thêm thông tin để debug
          console.log('Thông tin kết nối WebSocket:');
          console.log('- Room ID gốc:', activeRoom.id);
          console.log('- Room ID đã định dạng:', formattedRoomId);
          console.log('- Token:', token.substring(0, 20) + '...');
        }
        
        // Thử kết nối lại nếu không phải đóng bình thường
        if (event.code !== 1000 && event.code !== 1001 && activeRoom) {
          // Sử dụng exponential backoff
          const reconnectDelay = Math.min(30000, 2000 * Math.pow(2, Math.floor(Math.random() * 3))); // 2-8 giây
          console.log(`Thử kết nối lại sau ${reconnectDelay/1000} giây...`);
          
          setTimeout(() => {
            if (activeRoom) {
              console.log('Đang kết nối lại WebSocket...');
              // Effect sẽ chạy lại do phụ thuộc vào activeRoom
            }
          }, reconnectDelay);
        }
      };
        // Xử lý sự kiện lỗi
      newSocket.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        
        // Log thêm chi tiết về kết nối
        console.log(`WS_URL: ${WS_URL}`);
        console.log(`Room ID: ${roomId} (gốc: ${activeRoom.id})`);
        console.log(`Room ID đã được định dạng: ${formattedRoomId}`);
        console.log(`URL kết nối: ${wsUrl}`);
        
        // Kiểm tra định dạng token
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', tokenPayload);
          console.log('- user_id:', tokenPayload.user_id);
          console.log('- exp:', new Date(tokenPayload.exp * 1000).toLocaleString());
        } catch (e) {
          console.error('Không thể phân tích token:', e);
        }
        
        // Kiểm tra kết nối internet
        const isOnline = navigator.onLine;
        if (!isOnline) {
          onError('Mất kết nối internet. Hệ thống sẽ tự động kết nối lại khi có mạng.');
          
          // Thêm listener để kết nối lại khi online
          const handleOnline = () => {
            console.log('Đã kết nối lại internet, thử kết nối lại WebSocket...');
            window.removeEventListener('online', handleOnline);
          };
          
          window.addEventListener('online', handleOnline);
        } else {
          onError('Lỗi kết nối WebSocket. Vui lòng kiểm tra kết nối server hoặc cấu hình phòng chat.');
        }
      };
        // Xử lý tin nhắn nhận được - Cải thiện để xử lý tin nhắn ngay lập tức
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Nhận tin nhắn WebSocket:', data);
          
          // Xử lý pong từ server
          if (data.type === 'pong') {
            console.log('Nhận pong từ server:', data.timestamp);
            return;
          }
          
          // Luôn xử lý tin nhắn chat ngay lập tức với độ ưu tiên cao nhất
          if (data.type === 'chat_message') {
            console.log('Nhận tin nhắn chat, xử lý ngay lập tức');
            // Gọi callback handler ngay lập tức không thông qua event loop
            onMessage(data);
            return;
          }
          
          // Xử lý các loại tin nhắn khác
          onMessage(data);
        } catch (err) {
          console.error('Lỗi khi xử lý tin nhắn WebSocket:', err, event.data);
        }
      };
    } catch (err) {
      console.error('Lỗi khi thiết lập kết nối WebSocket:', err);
      onError('Không thể thiết lập kết nối WebSocket');
    }

    // Clean up khi unmount hoặc khi room thay đổi
    return cleanupSocket;
  }, [userId, activeRoom, cleanupSocket, onMessage, onError]);
  
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Gọi callback onMessage với dữ liệu nhận được
        onMessage && onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    [onMessage]
  );
  return {
    socket,
    sendMessage,
    connectionState,
    cleanupSocket
  };
};
