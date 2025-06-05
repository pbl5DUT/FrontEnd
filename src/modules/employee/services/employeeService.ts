import axiosInstance from '@/services/axiosInstance';
import { Employee } from '../types/employee.types';


export type CreateEmployeeDto = Omit<Employee, 'user_id' | 'created_at' | 'enterprise'> & {
  enterprise_id: string;
};

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    const response = await axiosInstance.get('/users/');
    return response.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  createEmployee: async (employee: CreateEmployeeDto): Promise<Employee> => {
    const response = await axiosInstance.post('/users/', employee);
    return response.data;
  },

  updateEmployee: async (id: number, employee: Partial<Employee>): Promise<Employee> => {
    const response = await axiosInstance.put(`/users/${id}`, employee);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}/`);
  },
};
