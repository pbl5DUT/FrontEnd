import axiosInstance from '@/services/axiosInstance';

interface Enterprise {
  EnterpriseID?: number;
  Name: string;
  Address: string;
  PhoneNumber: string;
  Email: string;
  Industry: string;
}

export interface Employee {
  user_id?: number;
  full_name: string;
  email: string;
  password?: string;
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
  created_at?: string;
  enterprise: Enterprise;
}

export interface ValidationErrors {
  [key: string]: string[] | ValidationErrors;
}

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await axiosInstance.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  createEmployee: async (employee: Omit<Employee, 'user_id' | 'created_at'>): Promise<Employee> => {
    try {
      const response = await axiosInstance.post('/users/', employee);
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateEmployee: async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    try {
      console.log('Updating employee with data:', employee);
      const response = await axiosInstance.put(`/users/${id}/`, employee);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating employee ${id}:`, error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  deleteEmployee: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/users/${id}/`);
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },
};
