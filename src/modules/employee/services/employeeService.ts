import axiosInstance from '@/services/axiosInstance';

interface Enterprise {
  EnterpriseID: number;
  Name: string;
  Address: string;
  PhoneNumber: string;
  Email: string;
  Industry: string;
}

export interface Employee {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  gender: string;
  birth_date: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  position: string;
  avatar: string | null;
  created_at: string;
  enterprise: Enterprise;
}

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await axiosInstance.get('http://127.0.0.1:8000/api/users/');
    return response.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await axiosInstance.get(`http://127.0.0.1:8000/api/users/${id}`);
    return response.data;
  },

  createEmployee: async (employee: Omit<Employee, 'user_id' | 'created_at'>): Promise<Employee> => {
    const response = await axiosInstance.post('http://127.0.0.1:8000/api/users/', employee);
    return response.data;
  },

  updateEmployee: async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    const response = await axiosInstance.put(`http://127.0.0.1:8000/api/users/${id}`, employee);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axiosInstance.delete(`http://127.0.0.1:8000/api/users/${id}`);
  },
};
