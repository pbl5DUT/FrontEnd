import axios from 'axios';

// Định nghĩa các role trong hệ thống
export enum UserRole {
  ADMIN = 'Admin',
  MANAGE = 'Manage',
  USER = 'User',
}

// Interface cho dữ liệu người dùng
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

// Interface cho kết quả đăng nhập
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Thiết lập API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Hàm đăng nhập
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { email, password });
    const data = response.data;

    // Lưu thông tin đăng nhập vào localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Hàm đăng xuất
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null; // 🔐 Chỉ chạy khi đang ở client
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Kiểm tra người dùng có đăng nhập không

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

// Kiểm tra người dùng có quyền admin không
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === UserRole.ADMIN;
};

// Kiểm tra người dùng có quyền quản lý không
export const isManager = (): boolean => {
  const user = getCurrentUser();
  return user?.role === UserRole.MANAGE || user?.role === UserRole.ADMIN;
};

// Hàm này sẽ gọi API để refresh token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = localStorage.getItem('refresh_token');

    if (!refresh) return null;

    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refresh,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem('access_token', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return null;
  }
};

// Thiết lập axios interceptor để tự động thêm token vào header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thiết lập axios interceptor để tự động refresh token khi token hết hạn
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
