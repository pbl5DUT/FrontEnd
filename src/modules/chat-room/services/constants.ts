// Thiết lập các URL cơ sở
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `${BASE_URL}/ws`;

// Định nghĩa các endpoint API
export const CHATROOMS_ENDPOINT = `${API_URL}/chatrooms/`;
export const USERS_ENDPOINT = `${API_URL}/users/`;
export const MESSAGES_ENDPOINT = `${API_URL}/messages/`;

// WebSocket configs
export const PING_INTERVAL = 15000; // 15 seconds
