import axios from '@/services/axiosInstance';

export const login = async (email: string, password: string) => {
  const response = await axios.post('/login/', { email, password });
  return response.data;
};
