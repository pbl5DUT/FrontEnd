import { useState, useEffect, useCallback } from 'react';
import axios from '@/services/axiosInstance';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  avatar?: string;
  department?: string;
  isOnline?: boolean;
}

/**
 * Hook để lấy danh sách tất cả người dùng trong hệ thống
 */
export const useAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Gọi API lấy tất cả người dùng
      const response = await axios.get('/users/');
      
      if (Array.isArray(response.data)) {
        console.log(`Đã lấy được ${response.data.length} người dùng từ API`);
        setUsers(response.data);
      } else {
        console.warn('API trả về dữ liệu không phải mảng:', response.data);
        setUsers([]);
      }
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
      setError('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return {
    users,
    loading,
    error,
    refresh: fetchAllUsers
  };
};

export default useAllUsers;
